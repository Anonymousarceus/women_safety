import { useState, useEffect, useCallback } from 'react';

// Default fallback: New Delhi
const DEFAULT_POSITION = { latitude: 28.6139, longitude: 77.209 };

export default function useGeolocation(watch = false) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const applyFallback = useCallback(() => {
    setPosition(DEFAULT_POSITION);
    setUsingFallback(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported — using default location');
      applyFallback();
      return;
    }

    const options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 };

    const onSuccess = (pos) => {
      setPosition({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      setUsingFallback(false);
      setLoading(false);
    };

    const onError = (err) => {
      console.warn('Geolocation error:', err.message);
      setError(err.message);
      applyFallback();
    };

    if (watch) {
      // Get initial position first, then start watching
      navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
      const id = navigator.geolocation.watchPosition(onSuccess, onError, options);
      return () => navigator.geolocation.clearWatch(id);
    } else {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
    }
  }, [watch, applyFallback]);

  return { position, error, loading, usingFallback };
}
