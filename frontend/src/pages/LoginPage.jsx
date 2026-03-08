import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-dark flex-col justify-center items-center px-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/svg%3E")'}} />
        <div className="relative z-10 max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand shadow-lg shadow-purple-500/20">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 2.18l7 3.89v5.43c0 4.5-3.08 8.71-7 9.93-3.92-1.22-7-5.43-7-9.93V8.07l7-3.89z"/>
              <path d="M12 7a3 3 0 100 6 3 3 0 000-6zm0 2a1 1 0 110 2 1 1 0 010-2zm-4 7c0-1.33 2.67-2 4-2s4 .67 4 2v1H8v-1z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Kavach</h1>
          <p className="mt-3 text-lg text-white/50">Your safety companion. Always watching, always protecting.</p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-2xl font-bold text-white">SOS</p>
              <p className="text-xs text-white/40 mt-1">Emergency Alert</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-2xl font-bold text-white">Live</p>
              <p className="text-xs text-white/40 mt-1">Tracking</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-2xl font-bold text-white">24/7</p>
              <p className="text-xs text-white/40 mt-1">Protection</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-surface-50 px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-surface-900">Kavach</span>
            </div>
            <h2 className="text-2xl font-bold text-surface-900">Welcome back</h2>
            <p className="mt-1.5 text-sm text-surface-400">Sign in to access your safety dashboard</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200/60 px-4 py-3 text-sm text-rose-700">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-surface-400">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-800 placeholder:text-surface-300 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-surface-400">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-800 placeholder:text-surface-300 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition"
                placeholder="Enter your password"
              />
            </div>
            <Button type="submit" loading={loading} className="w-full !py-2.5">
              Sign In
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-surface-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
