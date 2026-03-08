module.exports = {
  JWT_EXPIRES_IN: '7d',
  BCRYPT_SALT_ROUNDS: 12,
  LOCATION_UPDATE_INTERVAL: 10000,
  ISSUE_TYPES: ['harassment', 'stalking', 'poor_lighting', 'unsafe_road'],
  JOURNEY_STATUSES: ['active', 'completed', 'emergency', 'cancelled'],
  SOS_STATUSES: ['active', 'resolved'],
  SAFE_PLACE_TYPES: ['police', 'hospital', 'cafe', 'public_place'],
  DANGER_RADIUS_METERS: 500,
  ETA_BUFFER_MINUTES: 15,
  STOP_THRESHOLD_SECONDS: 120,
  DEVIATION_THRESHOLD_METERS: 300,
};
