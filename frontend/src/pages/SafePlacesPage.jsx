import { useState } from 'react';
import SafetyMap, { greenIcon, blueIcon } from '../components/SafetyMap';
import useGeolocation from '../hooks/useGeolocation';
import { mapService } from '../services/endpoints';
import { SAFE_PLACE_TYPES } from '../utils/constants';
import Button from '../components/Button';

export default function SafePlacesPage() {
  const { position, loading: geoLoading, usingFallback } = useGeolocation();
  const [places, setPlaces] = useState([]);
  const [selectedType, setSelectedType] = useState('police');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (type) => {
    if (!position) return;

    setSelectedType(type);
    setLoading(true);
    try {
      const { data } = await mapService.getSafePlaces({
        lat: position.latitude,
        lng: position.longitude,
        radius: 5000,
        type,
      });
      setPlaces(data.places || []);
    } catch {
      alert('Failed to load safe places');
    } finally {
      setLoading(false);
    }
  };

  const center = position ? [position.latitude, position.longitude] : [28.6139, 77.209];

  const markers = [
    ...(position
      ? [{ id: 'me', latitude: position.latitude, longitude: position.longitude, icon: blueIcon, popup: <strong>You</strong> }]
      : []),
    ...places.map((p) => ({
      id: `place-${p.id}`,
      latitude: p.latitude,
      longitude: p.longitude,
      icon: greenIcon,
      popup: (
        <div>
          <strong>{p.name}</strong>
          <p className="text-xs text-gray-500 capitalize">{p.type}</p>
          <a
            href={`https://maps.google.com/?q=${p.latitude},${p.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-600 underline"
          >
            Directions
          </a>
        </div>
      ),
    })),
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-surface-900">Find Safe Places</h2>
        <p className="text-xs text-surface-400 mt-0.5">Locate nearby hospitals, police stations and more</p>
      </div>

      {geoLoading && (
        <div className="rounded-xl bg-blue-50/80 border border-blue-200/60 px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
          Getting your location...
        </div>
      )}
      {usingFallback && (
        <div className="rounded-xl bg-amber-50/80 border border-amber-200/60 px-4 py-3 text-sm text-amber-700">
          Using default location (New Delhi). Enable GPS for accurate results.
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {SAFE_PLACE_TYPES.map(({ value, label, icon }) => (
          <Button
            key={value}
            variant={selectedType === value ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleSearch(value)}
            loading={loading && selectedType === value}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="h-[450px] rounded-2xl overflow-hidden border border-surface-200/60 shadow-glass">
        <SafetyMap center={center} zoom={14} markers={markers} />
      </div>

      {places.length > 0 && (
        <div className="rounded-2xl border border-surface-200/60 bg-white p-6 shadow-glass">
          <h3 className="mb-4 text-sm font-semibold text-surface-700">
            Found {places.length} nearby {selectedType} location{places.length !== 1 ? 's' : ''}
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {places.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl bg-surface-50 p-3.5 transition hover:bg-surface-100">
                <div>
                  <p className="text-sm font-medium text-surface-800">{p.name}</p>
                  <p className="text-xs text-surface-400 mt-0.5">{p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}</p>
                </div>
                <a
                  href={`https://maps.google.com/?q=${p.latitude},${p.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition"
                >
                  Directions
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
