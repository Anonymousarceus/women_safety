const UnsafeReport = require('../models/UnsafeReport');

exports.createReport = async (req, res, next) => {
  try {
    const { latitude, longitude, issueType, description } = req.body;

    const report = await UnsafeReport.create({
      userId: req.user._id,
      latitude,
      longitude,
      issueType,
      description,
    });

    // Broadcast new report to all connected clients
    const io = req.app.get('io');
    io.emit('new-report', report);

    res.status(201).json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

exports.getAllReports = async (req, res, next) => {
  try {
    const { lat, lng, radius } = req.query;
    let filter = {};

    // If coordinates provided, filter by bounding box
    if (lat && lng && radius) {
      const radiusDeg = Number(radius) / 111320; // approx meters to degrees
      filter = {
        latitude: { $gte: Number(lat) - radiusDeg, $lte: Number(lat) + radiusDeg },
        longitude: { $gte: Number(lng) - radiusDeg, $lte: Number(lng) + radiusDeg },
      };
    }

    const reports = await UnsafeReport.find(filter)
      .sort({ createdAt: -1 })
      .limit(500)
      .populate('userId', 'name');

    res.json({ success: true, reports });
  } catch (error) {
    next(error);
  }
};

exports.getMyReports = async (req, res, next) => {
  try {
    const reports = await UnsafeReport.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (error) {
    next(error);
  }
};

exports.deleteReport = async (req, res, next) => {
  try {
    const report = await UnsafeReport.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({ success: true, message: 'Report deleted' });
  } catch (error) {
    next(error);
  }
};
