const mongoose = require('mongoose');
const { SOS_STATUSES } = require('../config/constants');

const sosEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: SOS_STATUSES,
      default: 'active',
    },
    contactsNotified: [
      {
        name: String,
        phone: String,
        email: String,
        notifiedAt: { type: Date, default: Date.now },
      },
    ],
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

sosEventSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('SOSEvent', sosEventSchema);
