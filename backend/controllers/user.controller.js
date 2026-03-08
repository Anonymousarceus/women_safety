const User = require('../models/User');

exports.updateEmergencyContacts = async (req, res, next) => {
  try {
    const { emergencyContacts } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { emergencyContacts },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user: user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user: user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
};
