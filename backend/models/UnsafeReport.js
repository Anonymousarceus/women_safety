const mongoose = require('mongoose');
const { ISSUE_TYPES } = require('../config/constants');

const unsafeReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: -180,
      max: 180,
    },
    issueType: {
      type: String,
      required: [true, 'Issue type is required'],
      enum: ISSUE_TYPES,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

unsafeReportSchema.index({ latitude: 1, longitude: 1 });
unsafeReportSchema.index({ issueType: 1 });

module.exports = mongoose.model('UnsafeReport', unsafeReportSchema);
