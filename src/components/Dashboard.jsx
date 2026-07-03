import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSubscription } from '../context/SubscriptionContext';
import PromiseCard from './PromiseCard';
import PromiseForm from './PromiseForm';

function computeStatus(promise, timezone = 'America/New_York') {
  if (!promise.dueDate) return promise.status === 'done' ? 'done' : 'upcoming';
  if (promise.status === 'done') return 'done';
  const now = new Date();
  const due = promise.dueDate instanceof Timestamp
    ? promise.dueDate.toDate()
    : new Date(promise.dueDate);
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: timezone });
  const dueStr = due.toLocaleDateString('en-CA', { timeZone: timezone });
  if (dueStr < todayStr) return 'overdue';
  if (dueStr === todayStr) return 'due-today';
  return 'upcoming';
}

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'due-today', label: 'Due Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'done', label: 'Done' },
];

const emptyMessages = {
  all: { icon: '📋', title: 'No promises yet. Text or log your first promise here to get started.', subtitle: "Example: 'call the hendersons about the roof quote by friday at 3'" },
  overdue: { icon: '🎉', title: 'No overdue promises — nice work!', subtitle: 'You\'re all caught up' },
  'due-today': { icon: '☀️', title: 'Nothing due today', subtitle: 'Enjoy the breathing room' },
  upcoming: { icon: '📅', title: 'No upcoming promises', subtitle: 'Log a promise to see it here' },
  done: { icon: '✨', title: 'No completed promises yet', subtitle: 'Mark a promise done to celebrate' },
};

function SkeletonCard() {
  return (
    <div className="bg-bg-card border border-border/40 rounded-xl p-5">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-28 rounded-md bg-black/[0.06] animate-shimmer" />
            <div className="h-4 w-16 rounded-full bg-black/[0.04] animate-shimmer" />
          </div>
          <div className="h-3.5 w-3/4 rounded-md bg-black/[0.04] animate-shimmer" />
          <div className="flex gap-4">
            <div className="h-3 w-24 rounded-md bg-black/[0.03] animate-shimmer" />
            <div className="h-3 w-20 rounded-md bg-black/[0.03] animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const { hasAccess, daysLeft, plan } = useSubscription();
  const [promises, setPromises] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingPromise, setEditingPromise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezone] = useState('America/New_York');
  const timezoneRef = useRef('America/New_York');
  const tabsRef = useRef({});
  const rawPromisesRef = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Update sliding indicator
  useEffect(() => {
    const el = tabsRef.current[activeTab];
    if (el) {
      const parent = el.parentElement;
      setIndicatorStyle({
        left: el.offsetLeft - parent.offsetLeft,
        width: el.offsetWidth,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    if (!user?.businessId) return;
    getDoc(doc(db, 'businesses', user.businessId)).then((snap) => {
      if (snap.exists() && snap.data().timezone) {
        timezoneRef.current = snap.data().timezone;
        setTimezone(snap.data().timezone);
      }
    });
  }, [user?.businessId]);

  useEffect(() => {
    timezoneRef.current = timezone;
    if (rawPromisesRef.current.length > 0) {
      setPromises(rawPromisesRef.current.map((p) => ({ ...p, status: computeStatus(p, timezone) })));
    }
  }, [timezone]);

  useEffect(() => {
    if (!user?.businessId) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'promises'),
      where('businessId', '==', user.businessId),
      orderBy('dueDate', 'asc'),
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => {
          const raw = { id: d.id, ...d.data() };
          return {
            ...raw,
            dueDate: raw.dueDate instanceof Timestamp ? raw.dueDate.toDate().toISOString() : raw.dueDate,
          };
        });
        rawPromisesRef.current = data;
        setPromises(data.map((p) => ({ ...p, status: computeStatus(p, timezoneRef.current) })));
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [user?.businessId]);

  // Re-fetch on tab visibility change; recalculate statuses every 30s
  useEffect(() => {
    if (!user?.businessId) return;

    const q = query(
      collection(db, 'promises'),
      where('businessId', '==', user.businessId),
      orderBy('dueDate', 'asc'),
    );

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        getDocs(q).then((snapshot) => {
          const data = snapshot.docs.map((d) => {
            const raw = { id: d.id, ...d.data() };
            return {
              ...raw,
              dueDate: raw.dueDate instanceof Timestamp ? raw.dueDate.toDate().toISOString() : raw.dueDate,
            };
          });
          rawPromisesRef.current = data;
          setPromises(data.map((p) => ({ ...p, status: computeStatus(p, timezoneRef.current) })));
        });
      }
    };

    const intervalId = setInterval(() => {
      if (rawPromisesRef.current.length > 0) {
        setPromises(rawPromisesRef.current.map((p) => ({ ...p, status: computeStatus(p, timezoneRef.current) })));
      }
    }, 30000);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [user?.businessId]);

  const counts = {
    overdue: promises.filter((p) => p.status === 'overdue').length,
    'due-today': promises.filter((p) => p.status === 'due-today').length,
    upcoming: promises.filter((p) => p.status === 'upcoming').length,
    done: promises.filter((p) => p.status === 'done').length,
  };

  const badgeColors = {
    overdue: 'bg-red-500',
    'due-today': 'bg-yellow-500',
    upcoming: 'bg-accent',
    done: 'bg-gray-500',
  };

  const filtered = activeTab === 'all' ? promises : promises.filter((p) => p.status === activeTab);

  const handleMarkDone = async (id) => {
    try {
      await updateDoc(doc(db, 'promises', id), {
        status: 'done',
        completedAt: serverTimestamp(),
      });
      toast.success('Promise marked as done');
    } catch {
      toast.error('Failed to update promise');
    }
  };

  const handleDeletePromise = async (id) => {
    try {
      await deleteDoc(doc(db, 'promises', id));
      toast.success('Promise deleted');
    } catch {
      toast.error('Failed to delete promise');
    }
  };

  const handleAddPromise = async (formData) => {
    await addDoc(collection(db, 'promises'), {
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      description: formData.description,
      dueDate: Timestamp.fromDate(new Date(formData.dueDate)),
      status: 'open',
      createdBy: user.email,
      createdAt: serverTimestamp(),
      businessId: user.businessId,
      completedAt: null,
    });
    toast.success('Promise logged successfully');
  };

  const handleEditPromise = async (formData) => {
    await updateDoc(doc(db, 'promises', editingPromise.id), {
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      description: formData.description,
      dueDate: Timestamp.fromDate(new Date(formData.dueDate)),
    });
    toast.success('Promise updated');
  };

  const handleFormSubmit = editingPromise ? handleEditPromise : handleAddPromise;

  const openEditForm = (promise) => {
    setEditingPromise(promise);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingPromise(null);
  };

  const statCards = [
    { label: 'Overdue', count: counts.overdue, color: 'text-red-400', bg: 'bg-red-500/8', borderColor: 'border-red-500/15', glow: counts.overdue > 0 ? 'animate-pulse-glow' : '' },
    { label: 'Due Today', count: counts['due-today'], color: 'text-yellow-400', bg: 'bg-yellow-500/8', borderColor: 'border-yellow-500/15', glow: '' },
    { label: 'Upcoming', count: counts.upcoming, color: 'text-accent', bg: 'bg-accent/8', borderColor: 'border-accent/15', glow: '' },
    { label: 'Done', count: counts.done, color: 'text-gray-400', bg: 'bg-gray-500/8', borderColor: 'border-gray-500/15', glow: '' },
  ];

  return (
    <div className="p-5 md:p-10 max-w-5xl mx-auto relative">
      {/* Trial expired overlay */}
      {!hasAccess && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border shadow-sm rounded-2xl p-8 max-w-md w-full text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-xl font-extrabold text-text-primary mb-2">
              {plan === 'trial_expired' ? 'Free Trial Unavailable' : 'Your free trial has ended'}
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              {plan === 'trial_expired'
                ? 'A free trial has already been used with this account information. Subscribe to Promise Tracker Pro for $39/month to get started.'
                : 'Your free trial has ended. Upgrade to Promise Tracker Pro for $39/month to continue.'}
            </p>
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-3 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl text-base transition-all duration-200 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Upgrade Now
            </a>
          </div>
        </div>
      )}

      {/* Trial active banner */}
      {hasAccess && plan === 'trial' && (
        <div className="mb-6 bg-accent/5 border border-accent/20 rounded-xl px-5 py-3 flex items-center justify-between animate-fade-in-up">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-accent font-medium">Free trial: {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining</span>
          </div>
          <a
            href="/pricing"
            className="text-xs font-semibold text-accent hover:text-accent-hover bg-accent/10 hover:bg-accent/20 px-3 py-1.5 rounded-lg transition-all duration-200"
          >
            Upgrade
          </a>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 animate-fade-in-up">
        <div>
          <h1 className="text-[28px] font-extrabold text-text-primary tracking-tight">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1.5 font-normal">Track and manage customer promises</p>
        </div>
        <button
          onClick={() => { setEditingPromise(null); setFormOpen(true); }}
          disabled={!hasAccess}
          className={`flex items-center gap-2.5 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-[10px] text-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(34,197,94,0.25)] hover:scale-[1.02] active:scale-[0.98] shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none ${
            promises.length === 0 && !loading && hasAccess ? 'animate-pulse-soft' : ''
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Promise
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 stagger-children">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bg} border ${stat.borderColor} rounded-xl p-5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/10 ${stat.glow} animate-fade-in-up`}
          >
            <p className="text-[11px] font-semibold text-text-muted mb-1.5 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-3xl font-extrabold ${stat.color} tracking-tight`}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Tabs with sliding indicator */}
      <div className="relative mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-center gap-4 overflow-x-auto pb-0.5 relative">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              ref={(el) => { tabsRef.current[tab.key] = el; }}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-semibold whitespace-nowrap transition-colors duration-200 z-10 ${
                activeTab === tab.key
                  ? 'text-text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {tab.label}
              {tab.key !== 'all' && counts[tab.key] > 0 && (
                <span className={`${badgeColors[tab.key]} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[18px] text-center`}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
          {/* Sliding indicator */}
          <span
            className="absolute bottom-0 h-full bg-text-primary/8 rounded-[10px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
          />
        </div>
      </div>

      {/* Promise List */}
      <div className="space-y-3 stagger-children">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="text-4xl mb-4">{emptyMessages[activeTab].icon}</div>
            <p className="text-base font-semibold text-text-secondary mb-1">{emptyMessages[activeTab].title}</p>
            <p className="text-sm text-text-secondary mb-5">{emptyMessages[activeTab].subtitle}</p>
            {activeTab === 'all' && promises.length === 0 && (
              <button
                onClick={() => setFormOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-[10px] text-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(34,197,94,0.25)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Log First Promise or Text It In
              </button>
            )}
          </div>
        ) : (
          filtered.map((promise) => (
            <PromiseCard
              key={promise.id}
              promise={promise}
              onMarkDone={handleMarkDone}
              onDelete={handleDeletePromise}
              onEdit={openEditForm}
              canDelete={user?.role === 'owner' || user?.email === promise.createdBy}
              disabled={!hasAccess}
              timezone={timezone}
            />
          ))
        )}
      </div>

      <PromiseForm isOpen={formOpen} onClose={closeForm} onSubmit={handleFormSubmit} editingPromise={editingPromise} />

      <p className="text-center text-xs text-[#64748b] mt-12 pb-4">
        Need help?{' '}
        <a href="mailto:support@promisetracker.app" className="text-accent hover:underline">support@promisetracker.app</a>
      </p>
    </div>
  );
}
