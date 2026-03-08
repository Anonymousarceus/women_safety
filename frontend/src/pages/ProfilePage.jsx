import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/endpoints';
import Button from '../components/Button';
import AlertBanner from '../components/AlertBanner';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [contacts, setContacts] = useState(user?.emergencyContacts || []);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleAddContact = () => {
    setContacts([...contacts, { name: '', phone: '', email: '', relation: '' }]);
  };

  const handleRemoveContact = (index) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const updateContact = (index, field, value) => {
    setContacts(contacts.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  };

  const handleSaveContacts = async () => {
    const valid = contacts.every((c) => c.name.trim() && c.phone.trim());
    if (!valid) {
      alert('Each contact needs a name and phone number');
      return;
    }

    setLoading(true);
    setSuccess('');
    try {
      const { data } = await userService.updateContacts(contacts);
      updateUser(data.user);
      setSuccess('Emergency contacts updated!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { data } = await userService.updateProfile({ name, phone });
      updateUser(data.user);
      setSuccess('Profile updated!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-surface-900">Profile & Settings</h2>
        <p className="text-xs text-surface-400 mt-0.5">Manage your personal information and emergency contacts</p>
      </div>

      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="rounded-2xl border border-surface-200/60 bg-white p-6 shadow-glass space-y-5">
        <h3 className="text-sm font-semibold text-surface-700">Personal Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-surface-400">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-surface-400">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-surface-400">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-400 cursor-not-allowed"
          />
        </div>
        <Button onClick={handleSaveProfile} loading={loading} size="sm">
          Save Profile
        </Button>
      </div>

      <div className="rounded-2xl border border-surface-200/60 bg-white p-6 shadow-glass space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-surface-700">Emergency Contacts</h3>
            <p className="text-xs text-surface-400 mt-0.5">These contacts will be notified during SOS alerts</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleAddContact}>
            Add Contact
          </Button>
        </div>

        {contacts.length === 0 && (
          <div className="rounded-xl bg-surface-50 p-6 text-center">
            <svg className="mx-auto h-10 w-10 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <p className="mt-2 text-sm text-surface-400">No emergency contacts yet</p>
          </div>
        )}

        {contacts.map((contact, index) => (
          <div key={index} className="rounded-xl border border-surface-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">Contact {index + 1}</span>
              <button onClick={() => handleRemoveContact(index)} className="text-xs font-medium text-danger hover:text-rose-700 transition">
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Name *"
                value={contact.name}
                onChange={(e) => updateContact(index, 'name', e.target.value)}
                className="rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-800 placeholder:text-surface-300 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition"
              />
              <input
                type="tel"
                placeholder="Phone *"
                value={contact.phone}
                onChange={(e) => updateContact(index, 'phone', e.target.value)}
                className="rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-800 placeholder:text-surface-300 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition"
              />
              <input
                type="email"
                placeholder="Email (for alerts)"
                value={contact.email}
                onChange={(e) => updateContact(index, 'email', e.target.value)}
                className="rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-800 placeholder:text-surface-300 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition"
              />
              <input
                type="text"
                placeholder="Relation (e.g. Mother)"
                value={contact.relation}
                onChange={(e) => updateContact(index, 'relation', e.target.value)}
                className="rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-800 placeholder:text-surface-300 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition"
              />
            </div>
          </div>
        ))}

        {contacts.length > 0 && (
          <Button onClick={handleSaveContacts} loading={loading} variant="safe">
            Save Emergency Contacts
          </Button>
        )}
      </div>
    </div>
  );
}
