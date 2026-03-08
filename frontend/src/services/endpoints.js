import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

export const reportService = {
  create: (data) => api.post('/reports', data),
  getAll: (params) => api.get('/reports', { params }),
  getMine: () => api.get('/reports/mine'),
  remove: (id) => api.delete(`/reports/${id}`),
};

export const journeyService = {
  start: (data) => api.post('/journeys/start', data),
  updateLocation: (data) => api.post('/journeys/update-location', data),
  end: () => api.post('/journeys/end'),
  getActive: () => api.get('/journeys/active'),
  getById: (id) => api.get(`/journeys/${id}`),
  getHistory: () => api.get('/journeys/history'),
  calculateSafeRoute: (data) => api.post('/journeys/safe-route', data),
};

export const sosService = {
  trigger: (data) => api.post('/sos/trigger', data),
  resolve: (id) => api.patch(`/sos/${id}/resolve`),
  getHistory: () => api.get('/sos/history'),
};

export const mapService = {
  geocode: (text) => api.get('/map/geocode', { params: { text } }),
  getRoute: (params) => api.get('/map/route', { params }),
  getSafePlaces: (params) => api.get('/map/safe-places', { params }),
};

export const userService = {
  updateContacts: (contacts) => api.put('/users/emergency-contacts', { emergencyContacts: contacts }),
  updateProfile: (data) => api.patch('/users/profile', data),
};
