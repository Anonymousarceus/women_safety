import { useState, useEffect, useRef, useCallback } from 'react';
import SafetyMap, { blueIcon, greenIcon } from '../components/SafetyMap';
import useGeolocation from '../hooks/useGeolocation';
import { journeyService, mapService } from '../services/endpoints';
import { useSocket } from '../context/SocketContext';
import Button from '../components/Button';
import AlertBanner from '../components/AlertBanner';

export default function JourneyPage() {
  const { position } = useGeolocation(true); // watch mode
  const { socket } = useSocket();
  const [activeJourney, setActiveJourney] = useState(null);
  const [destination, setDestination] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDest, setSelectedDest] = useState(null);
  const [expectedTime, setExpectedTime] = useState('');
  const [routeCoords, setRouteCoords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    journeyService.getActive().then((res) => {
      if (res.data.journey) {
        setActiveJourney(res.data.journey);
        if (res.data.journey.routeCoordinates?.length) {
          setRouteCoords(res.data.journey.routeCoordinates);
        }
      }
    }).catch(() => {});
  }, []);

  // Send location updates every 10 seconds during active journey
  useEffect(() => {
    if (!activeJourney || !position) return;

    intervalRef.current = setInterval(async () => {
      try {
        const { data } = await journeyService.updateLocation({
          latitude: position.latitude,
          longitude: position.longitude,
        });
        if (data.alerts?.length) {
          setAlerts((prev) => [...data.alerts, ...prev].slice(0, 10));
        }
      } catch {
        // Silently fail on location update
      }

      if (socket) {
        socket.emit('location-update', {
          journeyId: activeJourney._id,
          latitude: position.latitude,
          longitude: position.longitude,
        });
      }
    }, 10000);

    return () => clearInterval(intervalRef.current);
  }, [activeJourney, position, socket]);

  const handleSearch = async () => {
    if (!destination.trim()) return;
    try {
      const { data } = await mapService.geocode(destination);
      setSearchResults(data.results || []);
    } catch {
      alert('Search failed');
    }
  };

  const selectDestination = async (result) => {
    setSelectedDest({ latitude: result.lat, longitude: result.lon, address: result.formatted });
    setSearchResults([]);
    setDestination(result.formatted);

    if (position) {
      try {
        const { data } = await mapService.getRoute({
          fromLat: position.latitude,
          fromLng: position.longitude,
          toLat: result.lat,
          toLng: result.lon,
          mode: 'walk',
        });

        if (data.route?.features?.[0]?.geometry?.coordinates) {
          const coords = data.route.features[0].geometry.coordinates[0].map(([lng, lat]) => ({
            latitude: lat,
            longitude: lng,
          }));
          setRouteCoords(coords);
        }
      } catch {
        // Route fetching failed, journey can still start
      }
    }
  };

  const handleStartJourney = async () => {
    if (!position || !selectedDest || !expectedTime) {
      alert('Please select a destination and expected arrival time');
      return;
    }

    setLoading(true);
    try {
      const { data } = await journeyService.start({
        startLocation: { latitude: position.latitude, longitude: position.longitude },
        destination: selectedDest,
        expectedTime: new Date(expectedTime).toISOString(),
        routeCoordinates: routeCoords,
      });
      setActiveJourney(data.journey);

      if (socket) {
        socket.emit('join-journey', data.journey._id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start journey');
    } finally {
      setLoading(false);
    }
  };

  const handleEndJourney = async () => {
    try {
      await journeyService.end();
      clearInterval(intervalRef.current);
      setActiveJourney(null);
      setRouteCoords([]);
      setAlerts([]);
    } catch {
      alert('Failed to end journey');
    }
  };

  const center = position ? [position.latitude, position.longitude] : [28.6139, 77.209];

  const markers = [
    ...(position ? [{ id: 'me', latitude: position.latitude, longitude: position.longitude, icon: blueIcon, popup: <strong>You</strong> }] : []),
    ...(selectedDest ? [{ id: 'dest', latitude: selectedDest.latitude, longitude: selectedDest.longitude, icon: greenIcon, popup: <strong>Destination</strong> }] : []),
  ];

  const routes = routeCoords.length > 0 ? [{ coordinates: routeCoords, color: '#2563EB', weight: 5 }] : [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-surface-900">
          {activeJourney ? 'Journey Active' : 'Start Safe Journey'}
        </h2>
        <p className="text-xs text-surface-400 mt-0.5">{activeJourney ? 'Your journey is being tracked in real-time' : 'Plan your route and share it with a guardian'}</p>
      </div>

      {alerts.map((a, i) => (
        <AlertBanner key={i} type="danger" message={a.message} onClose={() => setAlerts((p) => p.filter((_, j) => j !== i))} />
      ))}

      {activeJourney ? (
        <div className="rounded-2xl border border-surface-200/60 bg-white p-6 shadow-glass">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-surface-400">Destination</p>
              <p className="mt-1 font-medium text-surface-800">{activeJourney.destination.address || `${activeJourney.destination.latitude}, ${activeJourney.destination.longitude}`}</p>
              <p className="mt-1 text-xs text-surface-400">
                ETA: {new Date(activeJourney.expectedTime).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-safe ring-1 ring-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-safe animate-pulse" />
                Live
              </span>
              <Button variant="danger" size="sm" onClick={handleEndJourney}>End Journey</Button>
            </div>
          </div>
          <div className="mt-3 rounded-xl bg-surface-50 px-4 py-2.5">
            <p className="text-xs text-surface-400">
              Share this ID with your guardian: <code className="ml-1 rounded-md bg-surface-200 px-2 py-0.5 text-xs font-mono text-surface-700 select-all">{activeJourney._id}</code>
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-surface-200/60 bg-white p-6 shadow-glass space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search destination..."
              className="flex-1 rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-800 placeholder:text-surface-300 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition"
            />
            <Button onClick={handleSearch} size="sm" variant="outline">Search</Button>
          </div>

          {searchResults.length > 0 && (
            <div className="max-h-32 overflow-y-auto rounded-xl border border-surface-200">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => selectDestination(r)}
                  className="block w-full px-4 py-2.5 text-left text-sm text-surface-700 hover:bg-primary-50 border-b border-surface-100 last:border-0 transition"
                >
                  {r.formatted}
                </button>
              ))}
            </div>
          )}

          {selectedDest && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200/60 px-4 py-2.5 text-sm text-emerald-700">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              {selectedDest.address}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-surface-400">Expected Arrival Time</label>
            <input
              type="datetime-local"
              value={expectedTime}
              onChange={(e) => setExpectedTime(e.target.value)}
              className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition"
            />
          </div>

          <Button onClick={handleStartJourney} loading={loading} className="w-full" variant="safe">
            Start Safe Journey
          </Button>
        </div>
      )}

      <div className="h-[400px] rounded-2xl overflow-hidden border border-surface-200/60 shadow-glass">
        <SafetyMap center={center} zoom={14} markers={markers} routes={routes} />
      </div>
    </div>
  );
}
