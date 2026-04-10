import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Layout from '../components/Layout';

function Toggle({ enabled, onChange, label }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-text-secondary">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          enabled ? 'bg-accent' : 'bg-white/10'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

function ConfirmModal({ open, onClose, onConfirm, deleting }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-card border border-border/60 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl shadow-black/40 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-text-primary">Delete Account</h3>
        </div>
        <p className="text-sm text-text-secondary mb-6">
          Are you sure? This will delete your account and all your data. This cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-text-secondary bg-white/[0.04] hover:bg-white/[0.08] border border-border/40 rounded-xl transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
          >
            {deleting && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {deleting ? 'Deleting...' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const toast = useToast();

  // Business info
  const [businessName, setBusinessName] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [plan, setPlan] = useState('free');
  const [savingBusiness, setSavingBusiness] = useState(false);

  // Profile
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState({
    emailReminders: true,
    smsReminders: true,
    escalationAlerts: true,
  });

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        // Fetch user doc
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setDisplayName(userData.displayName || userData.email?.split('@')[0] || '');
          setPhone(userData.phone || '');
          if (userData.notifications) {
            setNotifications({
              emailReminders: userData.notifications.emailReminders ?? true,
              smsReminders: userData.notifications.smsReminders ?? true,
              escalationAlerts: userData.notifications.escalationAlerts ?? true,
            });
          }
        }
        // Fetch business doc
        if (user.businessId) {
          setBusinessId(user.businessId);
          const bizSnap = await getDoc(doc(db, 'businesses', user.businessId));
          if (bizSnap.exists()) {
            const bizData = bizSnap.data();
            setBusinessName(bizData.name || '');
            setPlan(bizData.plan || 'free');
          }
        }
      } catch (err) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSaveBusiness = async () => {
    if (!businessName.trim()) {
      toast.error('Business name cannot be empty');
      return;
    }
    setSavingBusiness(true);
    try {
      await updateDoc(doc(db, 'businesses', user.businessId), {
        name: businessName.trim(),
      });
      toast.success('Business info saved');
    } catch (err) {
      toast.error('Failed to save business info');
    } finally {
      setSavingBusiness(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName.trim(),
        phone: phone.trim(),
      });
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleToggleNotification = async (key, value) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        notifications: updated,
      });
    } catch (err) {
      // Revert on failure
      setNotifications((prev) => ({ ...prev, [key]: !value }));
      toast.error('Failed to update notification preference');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'users', user.uid));
      await logout();
      toast.success('Account deleted');
    } catch (err) {
      toast.error('Failed to delete account');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-bg-card border border-border/40 rounded-2xl p-6">
              <div className="h-5 w-36 rounded-md bg-white/[0.06] animate-shimmer mb-4" />
              <div className="space-y-3">
                <div className="h-10 rounded-xl bg-white/[0.04] animate-shimmer" />
                <div className="h-10 rounded-xl bg-white/[0.04] animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-sm text-text-muted mt-1">Manage your business, profile, and preferences</p>
        </div>

        {/* SECTION 1: Business Info */}
        <div className="bg-bg-card border border-border/40 rounded-2xl p-6 animate-fade-in-up">
          <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-4.5 h-4.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
            Business Info
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-border/40 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-all duration-200"
                placeholder="Your business name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Business ID</label>
                <div className="px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-border/30 text-sm text-text-muted font-mono truncate">
                  {businessId || '—'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Plan</label>
                <div className="px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-border/30 text-sm text-text-muted capitalize flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {plan}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={handleSaveBusiness}
                disabled={savingBusiness}
                className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
              >
                {savingBusiness && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {savingBusiness ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: Personal Profile */}
        <div className="bg-bg-card border border-border/40 rounded-2xl p-6 animate-fade-in-up">
          <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-4.5 h-4.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Personal Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Email</label>
              <div className="px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-border/30 text-sm text-text-muted">
                {user?.email || '—'}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-border/40 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-all duration-200"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-border/40 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-all duration-200"
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
              >
                {savingProfile && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: Notification Preferences */}
        <div className="bg-bg-card border border-border/40 rounded-2xl p-6 animate-fade-in-up">
          <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-4.5 h-4.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            Notification Preferences
          </h2>
          <div className="divide-y divide-border/30">
            <Toggle
              label="Email reminders"
              enabled={notifications.emailReminders}
              onChange={(val) => handleToggleNotification('emailReminders', val)}
            />
            <Toggle
              label="SMS reminders"
              enabled={notifications.smsReminders}
              onChange={(val) => handleToggleNotification('smsReminders', val)}
            />
            <Toggle
              label="Escalation alerts"
              enabled={notifications.escalationAlerts}
              onChange={(val) => handleToggleNotification('escalationAlerts', val)}
            />
          </div>
          <p className="text-[11px] text-text-muted mt-3">Changes are saved automatically.</p>
        </div>

        {/* SECTION 4: Danger Zone */}
        <div className="bg-bg-card border border-red-500/20 rounded-2xl p-6 animate-fade-in-up">
          <h2 className="text-base font-semibold text-red-400 mb-2 flex items-center gap-2">
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            Danger Zone
          </h2>
          <p className="text-sm text-text-muted mb-4">
            Permanently delete your account. This action cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 text-sm font-medium text-red-400 bg-red-500/[0.06] hover:bg-red-500/15 border border-red-500/20 hover:border-red-500/30 rounded-xl transition-all duration-200"
          >
            Delete Account
          </button>
        </div>
      </div>

      <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        deleting={deleting}
      />
    </Layout>
  );
}
