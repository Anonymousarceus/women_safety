const axios = require('axios');

const GEOAPIFY_BASE = 'https://api.geoapify.com/v1';
const GEOAPIFY_KEY = process.env.GEOAPIFY_API_KEY;

exports.geocodeSearch = async (req, res, next) => {
  try {
    const { text } = req.query;
    if (!text) return res.status(400).json({ success: false, message: 'Search text required' });

    const { data } = await axios.get(`${GEOAPIFY_BASE}/geocode/search`, {
      params: { text, apiKey: GEOAPIFY_KEY, format: 'json' },
    });

    res.json({ success: true, results: data.results || [] });
  } catch (error) {
    next(error);
  }
};

exports.getRoute = async (req, res, next) => {
  try {
    const { fromLat, fromLng, toLat, toLng, mode } = req.query;

    if (!fromLat || !fromLng || !toLat || !toLng) {
      return res.status(400).json({ success: false, message: 'Origin and destination coordinates required' });
    }

    let routeMode = mode || 'walk';
    let data;

    try {
      const resp = await axios.get(`https://api.geoapify.com/v1/routing`, {
        params: {
          waypoints: `${fromLat},${fromLng}|${toLat},${toLng}`,
          mode: routeMode,
          apiKey: GEOAPIFY_KEY,
        },
      });
      data = resp.data;
    } catch (routeErr) {
      // If walk mode fails due to distance, automatically retry with drive
      if (routeErr.response?.status === 400 && routeMode === 'walk') {
        const resp = await axios.get(`https://api.geoapify.com/v1/routing`, {
          params: {
            waypoints: `${fromLat},${fromLng}|${toLat},${toLng}`,
            mode: 'drive',
            apiKey: GEOAPIFY_KEY,
          },
        });
        data = resp.data;
        routeMode = 'drive';
      } else {
        throw routeErr;
      }
    }

    res.json({ success: true, route: data, mode: routeMode });
  } catch (error) {
    if (error.response?.data?.message) {
      return res.status(error.response.status || 400).json({
        success: false,
        message: error.response.data.message,
      });
    }
    next(error);
  }
};

// Simple in-memory cache for Overpass responses (avoid 429 rate limits)
const safePlacesCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

exports.getSafePlaces = async (req, res, next) => {
  try {
    const { lat, lng, radius, type } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Coordinates required' });
    }

    const amenityType = type || 'police';
    // Round coords to reduce unique cache keys
    const roundedLat = Number(Number(lat).toFixed(2));
    const roundedLng = Number(Number(lng).toFixed(2));
    const cacheKey = `${roundedLat},${roundedLng},${radius || 2000},${amenityType}`;

    // Return cached data if fresh
    const cached = safePlacesCache.get(cacheKey);
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      return res.json({ success: true, places: cached.places });
    }

    const r = Number(radius) || 2000;
    const halfDeg = r / 111320;
    const south = roundedLat - halfDeg;
    const north = roundedLat + halfDeg;
    const west = roundedLng - halfDeg;
    const east = roundedLng + halfDeg;

    const query = `[out:json][timeout:10];node["amenity"="${amenityType}"](${south},${west},${north},${east});out body;`;

    const { data } = await axios.post('https://overpass-api.de/api/interpreter', `data=${encodeURIComponent(query)}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const places = (data.elements || []).map((el) => ({
      id: el.id,
      latitude: el.lat,
      longitude: el.lon,
      name: el.tags?.name || amenityType,
      type: amenityType,
      tags: el.tags || {},
    }));

    safePlacesCache.set(cacheKey, { places, time: Date.now() });

    res.json({ success: true, places });
  } catch (error) {
    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'Safe places API is rate-limited. Please wait a moment and try again.',
      });
    }
    next(error);
  }
};
