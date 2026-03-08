const mongoose = require('mongoose');
const { JOURNEY_STATUSES } = require('../config/constants');

const journeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startLocation: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String, default: '' },
    },
    destination: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String, default: '' },
    },
    expectedTime: {
      type: Date,
      required: [true, 'Expected arrival time is required'],
    },
    routeCoordinates: [
      {
        latitude: Number,
        longitude: Number,
      },
    ],
    liveLocationHistory: [
      {
        latitude: Number,
        longitude: Number,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: JOURNEY_STATUSES,
      default: 'active',
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    alerts: [
      {
        type: {
          type: String,
          enum: ['deviation', 'long_stop', 'eta_exceeded', 'offline'],
        },
        message: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

journeySchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Journey', journeySchema);
