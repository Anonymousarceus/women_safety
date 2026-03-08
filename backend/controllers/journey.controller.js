const Journey = require('../models/Journey');
const UnsafeReport = require('../models/UnsafeReport');
const { sendEmergencyEmail } = require('../services/email.service');
const User = require('../models/User');
const {
  DANGER_RADIUS_METERS,
  ETA_BUFFER_MINUTES,
  STOP_THRESHOLD_SECONDS,
  DEVIATION_THRESHOLD_METERS,
} = require('../config/constants');

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

exports.startJourney = async (req, res, next) => {
  try {
    const { startLocation, destination, expectedTime, routeCoordinates } = req.body;

    // Cancel any existing active journey
    await Journey.updateMany(
      { userId: req.user._id, status: 'active' },
      { status: 'cancelled', endTime: new Date() }
    );

    const journey = await Journey.create({
      userId: req.user._id,
      startLocation,
      destination,
      expectedTime: new Date(expectedTime),
      routeCoordinates: routeCoordinates || [],
      liveLocationHistory: [{ ...startLocation, timestamp: new Date() }],
    });

    res.status(201).json({ success: true, journey });
  } catch (error) {
    next(error);
  }
};

exports.updateLocation = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    const journey = await Journey.findOne({ userId: req.user._id, status: 'active' });

    if (!journey) {
      return res.status(404).json({ success: false, message: 'No active journey found' });
    }

    journey.liveLocationHistory.push({ latitude, longitude, timestamp: new Date() });

    // Virtual Safety Corridor checks
    const alerts = [];

    // 1. Route deviation check
    if (journey.routeCoordinates.length > 0) {
      const minDist = Math.min(
        ...journey.routeCoordinates.map((p) => haversineDistance(latitude, longitude, p.latitude, p.longitude))
      );
      if (minDist > DEVIATION_THRESHOLD_METERS) {
        alerts.push({ type: 'deviation', message: `User deviated ${Math.round(minDist)}m from route` });
      }
    }

    // 2. Long stop detection
    const history = journey.liveLocationHistory;
    if (history.length >= 2) {
      const last = history[history.length - 2];
      const dist = haversineDistance(latitude, longitude, last.latitude, last.longitude);
      const timeDiff = (Date.now() - new Date(last.timestamp).getTime()) / 1000;
      if (dist < 10 && timeDiff > STOP_THRESHOLD_SECONDS) {
        alerts.push({ type: 'long_stop', message: `User stopped for ${Math.round(timeDiff)}s` });
      }
    }

    // 3. ETA exceeded
    if (new Date() > new Date(journey.expectedTime.getTime() + ETA_BUFFER_MINUTES * 60000)) {
      alerts.push({ type: 'eta_exceeded', message: 'Expected arrival time exceeded' });
    }

    if (alerts.length > 0) {
      journey.alerts.push(...alerts);

      // Send emergency alerts to guardians
      const user = await User.findById(req.user._id);
      const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;

      for (const contact of user.emergencyContacts.filter((c) => c.email)) {
        sendEmergencyEmail({
          to: contact.email,
          userName: user.name,
          contactName: contact.name,
          mapLink,
          alertType: alerts.map((a) => a.message).join('; '),
        }).catch((err) => console.error(`Alert email failed:`, err.message));
      }
    }

    await journey.save();

    // Broadcast location update
    const io = req.app.get('io');
    io.to(`journey-${journey._id}`).emit('location-update', {
      journeyId: journey._id,
      latitude,
      longitude,
      timestamp: new Date(),
      alerts,
    });

    res.json({ success: true, alerts });
  } catch (error) {
    next(error);
  }
};

exports.endJourney = async (req, res, next) => {
  try {
    const journey = await Journey.findOneAndUpdate(
      { userId: req.user._id, status: 'active' },
      { status: 'completed', endTime: new Date() },
      { new: true }
    );

    if (!journey) {
      return res.status(404).json({ success: false, message: 'No active journey found' });
    }

    const io = req.app.get('io');
    io.to(`journey-${journey._id}`).emit('journey-ended', { journeyId: journey._id });

    res.json({ success: true, journey });
  } catch (error) {
    next(error);
  }
};

exports.getActiveJourney = async (req, res, next) => {
  try {
    const journey = await Journey.findOne({ userId: req.user._id, status: 'active' });
    res.json({ success: true, journey });
  } catch (error) {
    next(error);
  }
};

exports.getJourneyById = async (req, res, next) => {
  try {
    const journey = await Journey.findById(req.params.id).populate('userId', 'name phone');
    if (!journey) {
      return res.status(404).json({ success: false, message: 'Journey not found' });
    }
    res.json({ success: true, journey });
  } catch (error) {
    next(error);
  }
};

exports.getJourneyHistory = async (req, res, next) => {
  try {
    const journeys = await Journey.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-liveLocationHistory -routeCoordinates');
    res.json({ success: true, journeys });
  } catch (error) {
    next(error);
  }
};

exports.calculateSafeRoute = async (req, res, next) => {
  try {
    const { routes } = req.body; // Array of route alternatives, each with coordinates array

    if (!routes || routes.length === 0) {
      return res.status(400).json({ success: false, message: 'No routes provided' });
    }

    const unsafeAreas = await UnsafeReport.find({});

    const scoredRoutes = routes.map((route, idx) => {
      let dangerScore = 0;

      for (const point of route.coordinates) {
        for (const area of unsafeAreas) {
          const dist = haversineDistance(point.latitude, point.longitude, area.latitude, area.longitude);
          if (dist < DANGER_RADIUS_METERS) {
            dangerScore += (DANGER_RADIUS_METERS - dist) / DANGER_RADIUS_METERS;
          }
        }
      }

      return { routeIndex: idx, dangerScore, coordinates: route.coordinates };
    });

    scoredRoutes.sort((a, b) => a.dangerScore - b.dangerScore);

    res.json({
      success: true,
      safestRoute: scoredRoutes[0],
      allRoutes: scoredRoutes,
    });
  } catch (error) {
    next(error);
  }
};
