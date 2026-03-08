import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import AlertBanner from '../components/AlertBanner';
import { reportService, sosService, journeyService } from '../services/endpoints';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ reports: 0, sosEvents: 0, journeys: 0 });
  const [recentSOS, setRecentSOS] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      reportService.getMine(),
      sosService.getHistory(),
      journeyService.getHistory(),
    ]).then(([reports, sos, journeys]) => {
      setStats({
        reports: reports.status === 'fulfilled' ? reports.value.data.reports.length : 0,
        sosEvents: sos.status === 'fulfilled' ? sos.value.data.events.length : 0,
        journeys: journeys.status === 'fulfilled' ? journeys.value.data.journeys.length : 0,
      });
      if (sos.status === 'fulfilled') {
        setRecentSOS(sos.value.data.events.slice(0, 3));
      }
    });
  }, []);

  const hasContacts = user?.emergencyContacts?.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-surface-900">Welcome back, {user?.name}</h2>
        <p className="mt-1 text-sm text-surface-400">Here's your safety overview at a glance.</p>
      </div>

      {!hasContacts && (
        <AlertBanner
          type="warning"
          message={
            <span>
              No emergency contacts configured.{' '}
              <Link to="/profile" className="underline font-semibold">Set them up</Link> to enable SOS alerts.
            </span>
          }
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Reports Filed" value={stats.reports} icon="⚠" color="warning" />
        <Card title="SOS Alerts" value={stats.sosEvents} icon="!" color="danger" />
        <Card title="Journeys" value={stats.journeys} icon="~" color="primary" />
        <Card title="Contacts" value={user?.emergencyContacts?.length || 0} icon="+" color="safe" />
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-surface-400">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <QuickAction to="/safety-map" title="Safety Map" desc="View unsafe areas and safe places" color="blue" />
          <QuickAction to="/journey" title="Start Journey" desc="Track your journey with live sharing" color="purple" />
          <QuickAction to="/report" title="Report Area" desc="Report an unsafe location" color="amber" />
          <QuickAction to="/safe-places" title="Safe Places" desc="Find nearby hospitals, police & cafes" color="emerald" />
          <QuickAction to="/guardian" title="Guardian Mode" desc="Monitor someone's active journey" color="indigo" />
          <QuickAction to="/profile" title="Profile & Contacts" desc="Manage your emergency contacts" color="slate" />
        </div>
      </div>

      {recentSOS.length > 0 && (
        <div className="rounded-2xl border border-surface-200/60 bg-white p-6 shadow-glass">
          <h3 className="mb-4 text-sm font-semibold text-surface-700">Recent SOS Events</h3>
          <div className="space-y-2">
            {recentSOS.map((sos) => (
              <div key={sos._id} className="flex items-center justify-between rounded-xl bg-surface-50 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className={`h-2 w-2 rounded-full ${sos.status === 'active' ? 'bg-danger' : 'bg-safe'}`} />
                  <span className="text-sm font-medium text-surface-700">
                    {new Date(sos.createdAt).toLocaleString()}
                  </span>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${sos.status === 'active' ? 'bg-rose-100 text-danger' : 'bg-emerald-100 text-safe'}`}>
                  {sos.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const quickActionColors = {
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  amber: 'from-amber-500 to-amber-600',
  emerald: 'from-emerald-500 to-emerald-600',
  indigo: 'from-indigo-500 to-indigo-600',
  slate: 'from-slate-500 to-slate-600',
};

function QuickAction({ to, title, desc, color = 'blue' }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-2xl border border-surface-200/60 bg-white p-4 shadow-glass transition-all duration-200 hover:shadow-glass-lg hover:border-primary-200 card-hover"
    >
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${quickActionColors[color]} text-white shadow-sm`}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-sm text-surface-800 group-hover:text-primary-700 transition-colors">{title}</p>
        <p className="text-xs text-surface-400 mt-0.5">{desc}</p>
      </div>
    </Link>
  );
}
