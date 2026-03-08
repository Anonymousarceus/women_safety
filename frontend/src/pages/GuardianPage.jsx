import { useState, useEffect } from 'react';
import SafetyMap, { blueIcon, greenIcon } from '../components/SafetyMap';
import { journeyService } from '../services/endpoints';
import { useSocket } from '../context/SocketContext';
import Button from '../components/Button';
import AlertBanner from '../components/AlertBanner';

export default function GuardianPage() {
  const { socket } = useSocket();
  const [journeyId, setJourneyId] = useState('');
  const [journey, setJourney] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleWatch = async () => {
    if (!journeyId.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await journeyService.getById(journeyId.trim());
      setJourney(data.journey);

      const history = data.journey.liveLocationHistory;
      if (history?.length) {
        const last = history[history.length - 1];
        setLiveLocation({ latitude: last.latitude, longitude: last.longitude });
      }

      if (data.journey.alerts?.length) {
        setAlerts(data.journey.alerts.slice(-5));
      }

      if (socket) {
        socket.emit('join-journey', journeyId.trim());
      }
    } catch {
      setError('Journey not found. Check the ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Listen for live location updates
  useEffect(() => {
    if (!socket || !journey) return;

    const handleLocationUpdate = (data) => {
      if (data.journeyId === journey._id) {
        setLiveLocation({ latitude: data.latitude, longitude: data.longitude });
        if (data.alerts?.length) {
          setAlerts((prev) => [...data.alerts, ...prev].slice(0, 10));
        }
      }
    };

    const handleJourneyEnded = (data) => {
      if (data.journeyId === journey._id) {
        setAlerts((prev) => [{ type: 'info', message: 'Journey has ended safely!', timestamp: new Date() }, ...prev]);
        setJourney((prev) => ({ ...prev, status: 'completed' }));
      }
    };

    socket.on('location-update', handleLocationUpdate);
    socket.on('journey-ended', handleJourneyEnded);

    return () => {
      socket.off('location-update', handleLocationUpdate);
      socket.off('journey-ended', handleJourneyEnded);
    };
  }, [socket, journey]);

  const center = liveLocation
    ? [liveLocation.latitude, liveLocation.longitude]
    : journey?.startLocation
    ? [journey.startLocation.latitude, journey.startLocation.longitude]
    : [28.6139, 77.209];

  const markers = [];
  if (liveLocation) {
    markers.push({
      id: 'live',
      latitude: liveLocation.latitude,
      longitude: liveLocation.longitude,
      icon: blueIcon,
      popup: <strong>Live Location</strong>,
    });
  }
  if (journey?.destination) {
    markers.push({
      id: 'dest',
      latitude: journey.destination.latitude,
      longitude: journey.destination.longitude,
      icon: greenIcon,
      popup: <strong>Destination</strong>,
    });
  }

  const routes = journey?.routeCoordinates?.length
    ? [{ coordinates: journey.routeCoordinates, color: '#2563EB', weight: 4 }]
    : [];

  // Add live location trail
  if (journey?.liveLocationHistory?.length > 1) {
    routes.push({
      coordinates: journey.liveLocationHistory,
      color: '#16A34A',
      weight: 3,
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-surface-900">Guardian Mode</h2>
        <p className="text-xs text-surface-400 mt-0.5">Monitor a loved one's journey in real-time</p>
      </div>

      {!journey ? (
        <div className="rounded-2xl border border-surface-200/60 bg-white p-6 shadow-glass">
          <h3 className="mb-2 text-sm font-semibold text-surface-700">Monitor a Journey</h3>
          <p className="mb-5 text-sm text-surface-400">
            Enter the journey ID shared by the traveler to start monitoring.
          </p>

          {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}

          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={journeyId}
              onChange={(e) => setJourneyId(e.target.value)}
              placeholder="Paste journey ID here..."
              className="flex-1 rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-800 placeholder:text-surface-300 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition font-mono"
            />
            <Button onClick={handleWatch} loading={loading}>
              Start Monitoring
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-surface-200/60 bg-white p-6 shadow-glass">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-surface-400">Monitoring</p>
                <p className="mt-1 font-semibold text-surface-800">{journey.userId?.name || 'Unknown'}</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${journey.status === 'active' ? 'bg-emerald-50 text-safe ring-1 ring-emerald-200' : 'bg-surface-100 text-surface-500 ring-1 ring-surface-200'}`}>
                    {journey.status === 'active' && <span className="h-1.5 w-1.5 rounded-full bg-safe animate-pulse" />}
                    {journey.status}
                  </span>
                  <span className="text-xs text-surface-400">
                    ETA: {new Date(journey.expectedTime).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setJourney(null);
                  setLiveLocation(null);
                  setAlerts([]);
                  if (socket) socket.emit('leave-journey', journey._id);
                }}
              >
                Stop
              </Button>
            </div>
          </div>

          {alerts.map((a, i) => (
            <AlertBanner
              key={i}
              type={a.type === 'info' ? 'success' : 'danger'}
              message={a.message}
            />
          ))}
        </>
      )}

      <div className="h-[450px] rounded-2xl overflow-hidden border border-surface-200/60 shadow-glass">
        <SafetyMap center={center} zoom={14} markers={markers} routes={routes} />
      </div>
    </div>
  );
}
