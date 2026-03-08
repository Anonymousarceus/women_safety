import { useState } from 'react';
import { sosService } from '../services/endpoints';
import useGeolocation from '../hooks/useGeolocation';

export default function SOSButton() {
  const [triggered, setTriggered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sosId, setSosId] = useState(null);
  const { position } = useGeolocation();

  const handleSOS = async () => {
    if (!position) {
      alert('Unable to get your location. Please enable GPS.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await sosService.trigger({
        latitude: position.latitude,
        longitude: position.longitude,
      });
      setSosId(data.sosEvent._id);
      setTriggered(true);
    } catch (err) {
      alert('Failed to send SOS alert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!sosId) return;
    try {
      await sosService.resolve(sosId);
      setTriggered(false);
      setSosId(null);
    } catch {
      alert('Failed to resolve SOS.');
    }
  };

  if (triggered) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 rounded-2xl bg-danger px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/30 sos-pulse">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" /></svg>
          SOS ACTIVE
        </div>
        <button
          onClick={handleResolve}
          className="rounded-2xl bg-safe px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-700 active:scale-95"
        >
          I'm Safe
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSOS}
      disabled={loading}
      className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger text-lg font-extrabold tracking-wide text-white shadow-lg shadow-rose-500/40 transition-all duration-150 hover:scale-105 hover:shadow-xl hover:shadow-rose-500/50 active:scale-95 sos-pulse disabled:opacity-60"
      title="Emergency SOS"
    >
      {loading ? (
        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
      ) : 'SOS'}
    </button>
  );
}
