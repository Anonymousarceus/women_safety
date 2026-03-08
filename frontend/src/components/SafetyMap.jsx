import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { TILE_URL } from '../utils/constants';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createIcon = (color) =>
  new L.DivIcon({
    className: '',
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

export const redIcon = createIcon('#DC2626');
export const greenIcon = createIcon('#16A34A');
export const blueIcon = createIcon('#2563EB');
export const yellowIcon = createIcon('#FACC15');

function RecenterMap({ lat, lng }) {
  const map = useMap();
  map.setView([lat, lng], map.getZoom());
  return null;
}

export default function SafetyMap({
  center = [28.6139, 77.209],
  zoom = 13,
  markers = [],
  routes = [],
  className = '',
  children,
}) {
  return (
    <div className={`relative h-full w-full rounded-xl overflow-hidden shadow-md ${className}`}>
      <MapContainer center={center} zoom={zoom} className="h-full w-full" scrollWheelZoom>
        <TileLayer url={TILE_URL} attribution='&copy; <a href="https://www.geoapify.com/">Geoapify</a>' />

        {markers.map((m, i) => (
          <Marker key={m.id || i} position={[m.latitude, m.longitude]} icon={m.icon || undefined}>
            {m.popup && <Popup>{m.popup}</Popup>}
          </Marker>
        ))}

        {routes.map((route, i) => (
          <Polyline
            key={i}
            positions={route.coordinates.map((c) => [c.latitude, c.longitude])}
            color={route.color || '#2563EB'}
            weight={route.weight || 4}
          />
        ))}

        {children}
      </MapContainer>
    </div>
  );
}

export { RecenterMap };
