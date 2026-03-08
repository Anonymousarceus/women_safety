const SOSEvent = require('../models/SOSEvent');
const User = require('../models/User');
const { sendEmergencyEmail } = require('../services/email.service');

exports.triggerSOS = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    const user = await User.findById(req.user._id);

    const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;

    const sosEvent = await SOSEvent.create({
      userId: req.user._id,
      location: { latitude, longitude },
      contactsNotified: user.emergencyContacts.map((c) => ({
        name: c.name,
        phone: c.phone,
        email: c.email,
      })),
    });

    // Send email alerts to emergency contacts
    const emailPromises = user.emergencyContacts
      .filter((c) => c.email)
      .map((contact) =>
        sendEmergencyEmail({
          to: contact.email,
          userName: user.name,
          contactName: contact.name,
          mapLink,
        }).catch((err) => console.error(`Email to ${contact.email} failed:`, err.message))
      );

    await Promise.allSettled(emailPromises);

    // Real-time alert via Socket.io
    const io = req.app.get('io');
    io.emit('sos-alert', {
      userId: req.user._id,
      userName: user.name,
      location: { latitude, longitude },
      mapLink,
      timestamp: sosEvent.createdAt,
    });

    res.status(201).json({ success: true, sosEvent });
  } catch (error) {
    next(error);
  }
};

exports.resolveSOS = async (req, res, next) => {
  try {
    const sosEvent = await SOSEvent.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, status: 'active' },
      { status: 'resolved', resolvedAt: new Date() },
      { new: true }
    );

    if (!sosEvent) {
      return res.status(404).json({ success: false, message: 'Active SOS event not found' });
    }

    const io = req.app.get('io');
    io.emit('sos-resolved', { sosId: sosEvent._id, userId: req.user._id });

    res.json({ success: true, sosEvent });
  } catch (error) {
    next(error);
  }
};

exports.getSOSHistory = async (req, res, next) => {
  try {
    const events = await SOSEvent.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
};
