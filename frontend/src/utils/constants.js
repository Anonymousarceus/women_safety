export const GEOAPIFY_KEY = '82f4f490bdd84686adc739b0b0b4ef5a';

export const TILE_URL = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`;

export const ISSUE_LABELS = {
  harassment: 'Harassment',
  stalking: 'Stalking',
  poor_lighting: 'Poor Lighting',
  unsafe_road: 'Unsafe Road',
};

export const SAFE_PLACE_TYPES = [
  { value: 'police', label: 'Police Stations', icon: '🚔' },
  { value: 'hospital', label: 'Hospitals', icon: '🏥' },
  { value: 'cafe', label: 'Cafes', icon: '☕' },
  { value: 'fire_station', label: 'Fire Stations', icon: '🚒' },
];

export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};
