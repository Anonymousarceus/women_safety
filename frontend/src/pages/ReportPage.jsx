import { useState, useEffect } from 'react';
import SafetyMap, { redIcon, blueIcon } from '../components/SafetyMap';
import useGeolocation from '../hooks/useGeolocation';
import { reportService } from '../services/endpoints';
import { ISSUE_LABELS } from '../utils/constants';
import Button from '../components/Button';
import AlertBanner from '../components/AlertBanner';

const ISSUE_TYPES = [
  { value: 'harassment', label: 'Harassment' },
  { value: 'stalking', label: 'Stalking' },
  { value: 'poor_lighting', label: 'Poor Lighting' },
  { value: 'unsafe_road', label: 'Unsafe Road' },
];

export default function ReportPage() {
  const { position } = useGeolocation();
  const [form, setForm] = useState({ issueType: 'harassment', description: '' });
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    reportService.getMine().then((res) => setMyReports(res.data.reports)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) {
      alert('Enable location to report an unsafe area');
      return;
    }

    setLoading(true);
    setSuccess('');
    try {
      const { data } = await reportService.create({
        latitude: position.latitude,
        longitude: position.longitude,
        issueType: form.issueType,
        description: form.description,
      });
      setSuccess('Report submitted successfully!');
      setMyReports((prev) => [data.report, ...prev]);
      setForm({ issueType: 'harassment', description: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this report?')) return;
    try {
      await reportService.remove(id);
      setMyReports((prev) => prev.filter((r) => r._id !== id));
    } catch {
      alert('Failed to delete report');
    }
  };

  const center = position ? [position.latitude, position.longitude] : [28.6139, 77.209];

  const markers = [
    ...(position
      ? [{ id: 'me', latitude: position.latitude, longitude: position.longitude, icon: blueIcon, popup: <strong>Your location (report will be placed here)</strong> }]
      : []),
    ...myReports.map((r) => ({
      id: r._id,
      latitude: r.latitude,
      longitude: r.longitude,
      icon: redIcon,
      popup: <span>{ISSUE_LABELS[r.issueType]}</span>,
    })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-surface-900">Report Unsafe Area</h2>
        <p className="text-xs text-surface-400 mt-0.5">Help others stay safe by reporting dangerous locations</p>
      </div>

      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-surface-200/60 bg-white p-6 shadow-glass">
          <h3 className="mb-5 text-sm font-semibold text-surface-700">Submit a Report</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-surface-400">Location</label>
              <p className="rounded-xl bg-surface-50 px-4 py-2.5 text-sm text-surface-600">
                {position
                  ? `${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)}`
                  : 'Getting your location...'}
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-surface-400">Issue Type</label>
              <select
                value={form.issueType}
                onChange={(e) => setForm({ ...form, issueType: e.target.value })}
                className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition"
              >
                {ISSUE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-surface-400">Description (optional)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                maxLength={1000}
                className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-800 placeholder:text-surface-300 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition resize-none"
                placeholder="Describe the safety concern..."
              />
            </div>
            <Button type="submit" loading={loading} variant="danger" className="w-full">
              Submit Report
            </Button>
          </form>
        </div>

        <div className="h-[350px] rounded-2xl overflow-hidden border border-surface-200/60 shadow-glass">
          <SafetyMap center={center} zoom={15} markers={markers} />
        </div>
      </div>

      {myReports.length > 0 && (
        <div className="rounded-2xl border border-surface-200/60 bg-white p-6 shadow-glass">
          <h3 className="mb-4 text-sm font-semibold text-surface-700">My Reports</h3>
          <div className="space-y-2">
            {myReports.map((r) => (
              <div key={r._id} className="flex items-center justify-between rounded-xl bg-surface-50 px-4 py-3 transition hover:bg-surface-100">
                <div>
                  <span className="font-medium text-sm text-surface-800">{ISSUE_LABELS[r.issueType]}</span>
                  <span className="ml-2 text-xs text-surface-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                  {r.description && <p className="text-xs text-surface-400 mt-0.5">{r.description}</p>}
                </div>
                <button onClick={() => handleDelete(r._id)} className="text-xs font-medium text-danger hover:text-rose-700 transition">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
