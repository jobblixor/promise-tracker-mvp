import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, getDocs, collection } from 'firebase/firestore';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { db, auth } from '../config/firebase';
import app from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

function Toggle({ enabled, onChange, label }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-text-secondary">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          enabled ? 'bg-accent' : 'bg-border'
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
            className="px-4 py-2 text-sm font-medium text-text-secondary bg-bg-card-hover hover:bg-border border border-border/40 rounded-xl transition-all duration-200"
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

function CancelSubModal({ open, onClose, onConfirm, cancelling }) {
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
          <h3 className="text-lg font-bold text-text-primary">Cancel Subscription</h3>
        </div>
        <p className="text-sm text-text-secondary mb-6">
          Are you sure you want to cancel? Your access will continue until the end of your current billing period.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={cancelling}
            className="px-4 py-2 text-sm font-medium text-text-secondary bg-bg-card-hover hover:bg-border border border-border/40 rounded-xl transition-all duration-200"
          >
            Keep Subscription
          </button>
          <button
            onClick={onConfirm}
            disabled={cancelling}
            className="px-4 py-2 text-sm font-medium text-red-400 bg-red-500/[0.06] hover:bg-red-500/15 border border-red-500/20 hover:border-red-500/30 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
          >
            {cancelling && (
              <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
            )}
            {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
          </button>
        </div>
      </div>
    </div>
  );
}

const FALLBACK_TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Anchorage', 'Pacific/Honolulu', 'America/Toronto', 'America/Vancouver',
  'America/Mexico_City', 'America/Sao_Paulo', 'Europe/London', 'Europe/Paris',
  'Europe/Berlin', 'Europe/Moscow', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Shanghai',
  'Asia/Tokyo', 'Asia/Seoul', 'Australia/Sydney', 'Australia/Perth',
  'Pacific/Auckland', 'Africa/Lagos', 'Africa/Johannesburg',
];

function getTimezoneOptions() {
  let tzList;
  try {
    tzList = Intl.supportedValuesOf('timeZone');
  } catch {
    tzList = FALLBACK_TIMEZONES;
  }

  const now = new Date();
  const options = tzList.map((tz) => {
    let offset;
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'shortOffset',
      }).formatToParts(now);
      const tzPart = parts.find((p) => p.type === 'timeZoneName');
      offset = tzPart ? tzPart.value : '';
    } catch {
      offset = '';
    }

    // Parse offset for sorting (e.g. "GMT+5:30" -> 330)
    let offsetMinutes = 0;
    const match = offset.match(/GMT([+-]?)(\d+):?(\d+)?/);
    if (match) {
      const sign = match[1] === '-' ? -1 : 1;
      offsetMinutes = sign * (parseInt(match[2], 10) * 60 + parseInt(match[3] || '0', 10));
    }

    const friendly = tz.replace(/_/g, ' ').replace(/\//g, ' / ');
    return {
      value: tz,
      label: `(${offset || 'UTC'}) ${friendly}`,
      offsetMinutes,
    };
  });

  options.sort((a, b) => a.offsetMinutes - b.offsetMinutes);
  return options;
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { business: subBusiness, plan: subPlan } = useSubscription();
  const toast = useToast();
  const navigate = useNavigate();
  const functions = getFunctions(app);

  // Business info
  const [businessName, setBusinessName] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [plan, setPlan] = useState('free');
  const [timezone, setTimezone] = useState('');
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

  // Subscription management
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [periodEndDate, setPeriodEndDate] = useState(null);

  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const handleToggleTheme = (isDark) => {
    const newTheme = isDark ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

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
            setTimezone(bizData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York');
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

  // Sync cancelAtPeriodEnd from the real-time subscription context
  useEffect(() => {
    if (subBusiness) {
      setCancelAtPeriodEnd(!!subBusiness.cancelAtPeriodEnd);
    }
  }, [subBusiness]);

  const handleSaveBusiness = async () => {
    if (!businessName.trim()) {
      toast.error('Business name cannot be empty');
      return;
    }
    setSavingBusiness(true);
    try {
      await updateDoc(doc(db, 'businesses', user.businessId), {
        name: businessName.trim(),
        timezone,
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
      const trimmedPhone = phone.trim();
      if (trimmedPhone) {
        const normalized = trimmedPhone.replace(/\D/g, '').slice(-10);
        if (normalized.length === 10) {
          const usersSnap = await getDocs(collection(db, 'users'));
          const duplicate = usersSnap.docs.some((docSnap) => {
            if (docSnap.id === user.uid) return false;
            const stored = docSnap.data().phone;
            return stored && stored.replace(/\D/g, '').slice(-10) === normalized;
          });
          if (duplicate) {
            toast.error('This phone number is already linked to another account.');
            return;
          }
        }
      }
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName.trim(),
        phone: trimmedPhone,
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

  const handleCancelSubscription = async () => {
    setCancellingSubscription(true);
    try {
      const cancelSubscription = httpsCallable(functions, 'cancelSubscription');
      const result = await cancelSubscription();
      setCancelAtPeriodEnd(true);
      if (result.data.currentPeriodEnd) {
        setPeriodEndDate(new Date(result.data.currentPeriodEnd * 1000));
      }
      setShowCancelModal(false);
      toast.success('Subscription cancelled. You\'ll have access until the end of your billing period.');
    } catch (err) {
      toast.error(err.message || 'Failed to cancel subscription');
    } finally {
      setCancellingSubscription(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setReactivating(true);
    try {
      const reactivateSubscription = httpsCallable(functions, 'reactivateSubscription');
      await reactivateSubscription();
      setCancelAtPeriodEnd(false);
      setPeriodEndDate(null);
      toast.success('Subscription reactivated!');
    } catch (err) {
      toast.error(err.message || 'Failed to reactivate subscription');
    } finally {
      setReactivating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const deleteAccount = httpsCallable(functions, 'deleteAccount');
      await deleteAccount();
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
              <div className="h-5 w-36 rounded-md bg-black/[0.06] animate-shimmer mb-4" />
              <div className="space-y-3">
                <div className="h-10 rounded-xl bg-black/[0.04] animate-shimmer" />
                <div className="h-10 rounded-xl bg-black/[0.04] animate-shimmer" />
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
          <p className="text-sm text-text-secondary mt-1">Manage your business, profile, and preferences</p>
        </div>

        {/* SECTION 1: Business Info */}
        <div className="bg-bg-card border border-border/40 shadow-sm rounded-2xl p-6 animate-fade-in-up">
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-card border border-border/40 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-all duration-200"
                placeholder="Your business name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Business ID</label>
                <div className="px-3.5 py-2.5 rounded-xl bg-bg-card-hover border border-border/30 text-sm text-text-muted font-mono truncate">
                  {businessId || '—'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Plan</label>
                <div className="px-3.5 py-2.5 rounded-xl bg-bg-card-hover border border-border/30 text-sm text-text-muted capitalize flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {plan}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-card border border-border/40 text-sm text-text-primary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-all duration-200"
              >
                <option value="" className="bg-bg-card text-text-primary">Select timezone...</option>
                {getTimezoneOptions().map((tz) => (
                  <option key={tz.value} value={tz.value} className="bg-bg-card text-text-primary">{tz.label}</option>
                ))}
              </select>
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
        <div className="bg-bg-card border border-border/40 shadow-sm rounded-2xl p-6 animate-fade-in-up">
          <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-4.5 h-4.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Personal Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Email</label>
              <div className="px-3.5 py-2.5 rounded-xl bg-bg-card-hover border border-border/30 text-sm text-text-muted">
                {user?.email || '—'}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-card border border-border/40 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-all duration-200"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-card border border-border/40 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-all duration-200"
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
        <div className="bg-bg-card border border-border/40 shadow-sm rounded-2xl p-6 animate-fade-in-up">
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

        {/* SECTION 4: Theme */}
        <div className="bg-bg-card border border-border/40 shadow-sm rounded-2xl p-6 animate-fade-in-up">
          <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-4.5 h-4.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
            Theme
          </h2>
          <Toggle
            label="Dark mode"
            enabled={theme === 'dark'}
            onChange={handleToggleTheme}
          />
          <p className="text-[11px] text-text-muted mt-1">Changes are applied immediately.</p>
        </div>

        {/* SECTION 5: Subscription */}
        <div className="bg-bg-card border border-border/40 shadow-sm rounded-2xl p-6 animate-fade-in-up">
          <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-4.5 h-4.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
            Subscription
          </h2>

          <div className="space-y-4">
            {/* Plan status */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-muted">Status:</span>
              {plan === 'pro' && !cancelAtPeriodEnd ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/15 text-accent">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Active
                </span>
              ) : plan === 'pro' && cancelAtPeriodEnd ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/15 text-yellow-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  Cancelling
                </span>
              ) : plan === 'trial' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Trial
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  Inactive
                </span>
              )}
            </div>

            {/* Plan details */}
            {plan === 'pro' && !cancelAtPeriodEnd && (
              <p className="text-sm text-text-secondary">
                You&apos;re on the <strong className="text-text-primary">Pro</strong> plan at <strong className="text-text-primary">$39/month</strong>.
                {subBusiness?.currentPeriodEnd && (() => {
                  const renewDate = subBusiness.currentPeriodEnd?.toDate
                    ? subBusiness.currentPeriodEnd.toDate()
                    : new Date(subBusiness.currentPeriodEnd);
                  return (
                    <span className="block text-xs text-text-muted mt-1">
                      Renews on{' '}
                      <strong className="text-text-secondary">
                        {renewDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </strong>
                    </span>
                  );
                })()}
              </p>
            )}

            {plan === 'pro' && cancelAtPeriodEnd && (
              <div className="bg-yellow-500/[0.06] border border-yellow-500/20 rounded-xl px-4 py-3">
                <p className="text-sm text-yellow-300">
                  Your subscription will end on{' '}
                  <strong>
                    {(() => {
                      const d = periodEndDate || (subBusiness?.currentPeriodEnd
                        ? (subBusiness.currentPeriodEnd?.toDate ? subBusiness.currentPeriodEnd.toDate() : new Date(subBusiness.currentPeriodEnd))
                        : null);
                      return d
                        ? d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                        : 'the end of your billing period';
                    })()}
                  </strong>.
                  You&apos;ll have full access until then.
                </p>
              </div>
            )}

            {plan === 'trial' && subBusiness?.trialEndDate && (
              <div className="text-sm text-text-secondary">
                <p>
                  Trial ends{' '}
                  <strong className="text-text-primary">
                    {(subBusiness.trialEndDate?.toDate
                      ? subBusiness.trialEndDate.toDate()
                      : new Date(subBusiness.trialEndDate)
                    ).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </strong>
                  {' '}—{' '}
                  {(() => {
                    const endDate = subBusiness.trialEndDate?.toDate
                      ? subBusiness.trialEndDate.toDate()
                      : new Date(subBusiness.trialEndDate);
                    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                    return <strong className="text-accent">{daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining</strong>;
                  })()}
                </p>
              </div>
            )}

            {(plan === 'expired' || plan === 'trial_expired') && (
              <div>
                <p className="text-sm text-text-secondary mb-3">
                  Your {plan === 'trial_expired' ? 'trial has' : 'subscription has'} expired. Upgrade to continue using Promise Tracker.
                </p>
                <button
                  onClick={() => navigate('/pricing')}
                  className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-xl transition-all duration-200"
                >
                  Upgrade Now
                </button>
              </div>
            )}

            {/* Cancel / Reactivate buttons — owner only */}
            {user?.role === 'owner' && plan === 'pro' && subBusiness?.stripeSubscriptionId && (
              <div className="pt-2">
                {cancelAtPeriodEnd ? (
                  <button
                    onClick={handleReactivateSubscription}
                    disabled={reactivating}
                    className="px-4 py-2 text-sm font-medium text-accent bg-accent/[0.06] hover:bg-accent/15 border border-accent/20 hover:border-accent/30 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                  >
                    {reactivating && (
                      <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                    )}
                    {reactivating ? 'Reactivating...' : 'Reactivate Subscription'}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-4 py-2 text-sm font-medium text-red-400 bg-red-500/[0.06] hover:bg-red-500/15 border border-red-500/20 hover:border-red-500/30 rounded-xl transition-all duration-200"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 6: Danger Zone */}
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

        <p className="text-center text-xs text-[#64748b] mt-8 pb-4">
          Need help?{' '}
          <a href="mailto:support@promisetracker.app" className="text-accent hover:underline">support@promisetracker.app</a>
        </p>
      </div>

      <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        deleting={deleting}
      />
      <CancelSubModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        cancelling={cancellingSubscription}
      />
    </Layout>
  );
}
