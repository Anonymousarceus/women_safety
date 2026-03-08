import { useState, useEffect } from 'react';

export default function FakeCallButton() {
  const [showCall, setShowCall] = useState(false);

  useEffect(() => {
    if (!showCall) return;
    const audio = new Audio('data:audio/wav;base64,UklGRl9vT19teleGFtcGxlAAAA');
    // Use a simple vibration pattern if available
    if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]);
    return () => audio.pause();
  }, [showCall]);

  if (showCall) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-dark">
        <div className="flex flex-col items-center gap-6">
          <div className="ring-animation flex h-24 w-24 items-center justify-center rounded-full bg-white/10">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
          </div>
          <p className="text-sm font-medium uppercase tracking-wider text-white/50">Incoming Call</p>
          <p className="text-3xl font-bold text-white">Mom</p>
          <p className="text-sm text-white/40">Mobile</p>
          <div className="mt-10 flex gap-12">
            <button
              onClick={() => setShowCall(false)}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-danger text-white shadow-lg shadow-rose-500/30 transition hover:scale-105 active:scale-95"
            >
              <svg className="h-6 w-6 rotate-[135deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
            </button>
            <button
              onClick={() => setShowCall(false)}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-safe text-white shadow-lg shadow-emerald-500/30 transition hover:scale-105 active:scale-95"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowCall(true)}
      className="fixed bottom-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/30 transition-all duration-150 hover:scale-105 hover:shadow-xl hover:shadow-teal-500/40 active:scale-95"
      title="Fake Call"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
    </button>
  );
}
