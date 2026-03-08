import { useEffect, useState } from 'react';
import SafetyMap, { redIcon, greenIcon, blueIcon } from '../components/SafetyMap';
import useGeolocation from '../hooks/useGeolocation';
import { reportService, mapService } from '../services/endpoints';
import { ISSUE_LABELS } from '../utils/constants';
import Button from '../components/Button';

export default function SafetyMapPage() {
  const { position, loading: geoLoading, usingFallback } = useGeolocation();
  const [reports, setReports] = useState([]);
  const [safePlaces, setSafePlaces] = useState([]);
  const [routeCoords, setRouteCoords] = useState([]);
  const [destination, setDestination] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    reportService.getAll({})
      .then((res) => setReports(res.data.reports || []))
      .catch((err) => console.error('Failed to load reports:', err.response?.data || err.message));
  }, []);

  const handleSearch = async () => {
    if (!destination.trim()) return;
    try {
      const { data } = await mapService.geocode(destination);
      setSearchResults(data.results || []);
    } catch {
      alert('Search failed. Please try again.');
    }
  };

  const handleGetRoute = async (destLat, destLng) => {
    if (!position) return;
    setLoading(true);
    setSearchResults([]);
    try {
      const { data } = await mapService.getRoute({
        fromLat: position.latitude,
        fromLng: position.longitude,
        toLat: destLat,
        toLng: destLng,
        mode: 'walk',
      });

      if (data.route?.features?.[0]?.geometry?.coordinates) {
        const coords = data.route.features[0].geometry.coordinates[0].map(([lng, lat]) => ({
          latitude: lat,
          longitude: lng,
        }));
        setRouteCoords(coords);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to get route.';
      if (msg.includes('Too long distance')) {
        alert('Distance is too far for walking route (max ~100 km). Try a closer destination.');
      } else {
        alert(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSafePlaces = async (type) => {
    if (!position) return;
    try {
      const { data } = await mapService.getSafePlaces({
        lat: position.latitude,
        lng: position.longitude,
        radius: 3000,
        type,
      });
      setSafePlaces(data.places || []);
    } catch {
      alert('Failed to load safe places.');
    }
  };

  const center = position ? [position.latitude, position.longitude] : [28.6139, 77.209];

  const markers = [
    ...(position
      ? [{ id: 'me', latitude: position.latitude, longitude: position.longitude, icon: blueIcon, popup: <strong>You are here</strong> }]
      : []),
    ...reports.map((r) => ({
      id: r._id,
      latitude: r.latitude,
      longitude: r.longitude,
      icon: redIcon,
      popup: (
        <div>
          <strong className="text-danger">{ISSUE_LABELS[r.issueType] || r.issueType}</strong>
          {r.description && <p className="text-xs mt-1">{r.description}</p>}
        </div>
      ),
    })),
    ...safePlaces.map((p) => ({
      id: `sp-${p.id}`,
      latitude: p.latitude,
      longitude: p.longitude,
      icon: greenIcon,
      popup: <strong>{p.name}</strong>,
    })),
  ];

  const routes = routeCoords.length > 0 ? [{ coordinates: routeCoords, color: '#2563EB', weight: 5 }] : [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-surface-900">Safety Map</h2>
          <p className="text-xs text-surface-400 mt-0.5">Reports and safe zones in your area</p>
        </div>
        <div className="flex gap-2">
          {['police', 'hospital', 'cafe'].map((type) => (
            <Button key={type} variant="outline" size="sm" onClick={() => loadSafePlaces(type)}>
              {type === 'police' ? 'Police' : type === 'hospital' ? 'Hospital' : 'Cafe'}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search destination for route..."
          className="flex-1 rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-800 placeholder:text-surface-300 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition"
        />
        <Button onClick={handleSearch} size="sm" className="!bg-gradient-to-r !from-amber-500 !to-orange-500 hover:!shadow-amber-500/30">Search</Button>
      </div>

      {searchResults.length > 0 && (
        <div className="max-h-40 overflow-y-auto rounded-xl border border-surface-200 bg-white shadow-glass">
          {searchResults.map((r, i) => (
            <button
              key={i}
              onClick={() => handleGetRoute(r.lat, r.lon)}
              className="block w-full px-4 py-2.5 text-left text-sm text-surface-700 hover:bg-primary-50 border-b border-surface-100 last:border-0 transition"
            >
              {r.formatted}
            </button>
          ))}
        </div>
      )}

      <div className="relative h-[500px] rounded-2xl overflow-hidden border border-surface-200/60 shadow-glass">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg">
              <svg className="h-4 w-4 animate-spin text-primary-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span className="text-sm font-medium text-surface-600">Loading route...</span>
            </div>
          </div>
        )}
        <SafetyMap center={center} zoom={14} markers={markers} routes={routes} />
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-surface-400">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary-600 inline-block" /> Your location</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-danger inline-block" /> Reported area</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-safe inline-block" /> Safe place</span>
        {usingFallback && <span className="text-amber-600 font-medium">Using default location — enable GPS for accuracy</span>}
      </div>
    </div>
  );
}
