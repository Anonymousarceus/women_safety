import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();

  return (
    <header className="flex items-center justify-between border-b border-surface-200 bg-white/80 backdrop-blur-md px-5 py-3.5 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-brand">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/>
            </svg>
          </div>
          <span className="text-base font-bold text-surface-900">Kavach</span>
        </div>
        <div className={`hidden md:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${connected ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-red-50 text-red-600 ring-1 ring-red-200'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
          {connected ? 'Connected' : 'Offline'}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm font-medium text-surface-700">{user?.name}</span>
        </div>
        <button
          onClick={logout}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-surface-500 transition hover:bg-surface-100 hover:text-surface-800"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
