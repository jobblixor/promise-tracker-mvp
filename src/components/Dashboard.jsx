import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PromiseCard from './PromiseCard';
import PromiseForm from './PromiseForm';

function computeStatus(promise) {
  if (promise.status === 'done') return 'done';
  const now = new Date();
  const due = promise.dueDate instanceof Timestamp
    ? promise.dueDate.toDate()
    : new Date(promise.dueDate);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  if (due < todayStart) return 'overdue';
  if (due < todayEnd) return 'due-today';
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
  all: { icon: '📋', title: 'No promises yet — your team is on track!', subtitle: 'Log your first promise to start tracking' },
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
            <div className="h-4 w-28 rounded-md bg-white/[0.06] animate-shimmer" />
            <div className="h-4 w-16 rounded-full bg-white/[0.04] animate-shimmer" />
          </div>
          <div className="h-3.5 w-3/4 rounded-md bg-white/[0.04] animate-shimmer" />
          <div className="flex gap-4">
            <div className="h-3 w-24 rounded-md bg-white/[0.03] animate-shimmer" />
            <div className="h-3 w-20 rounded-md bg-white/[0.03] animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [promises, setPromises] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
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
        setPromises(data.map((p) => ({ ...p, status: computeStatus(p) })));
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
          setPromises(data.map((p) => ({ ...p, status: computeStatus(p) })));
        });
      }
    };

    const intervalId = setInterval(() => {
      if (rawPromisesRef.current.length > 0) {
        setPromises(rawPromisesRef.current.map((p) => ({ ...p, status: computeStatus(p) })));
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

  const statCards = [
    { label: 'Overdue', count: counts.overdue, color: 'text-red-400', bg: 'bg-red-500/8', borderColor: 'border-red-500/15', glow: counts.overdue > 0 ? 'animate-pulse-glow' : '' },
    { label: 'Due Today', count: counts['due-today'], color: 'text-yellow-400', bg: 'bg-yellow-500/8', borderColor: 'border-yellow-500/15', glow: '' },
    { label: 'Upcoming', count: counts.upcoming, color: 'text-accent', bg: 'bg-accent/8', borderColor: 'border-accent/15', glow: '' },
    { label: 'Done', count: counts.done, color: 'text-gray-400', bg: 'bg-gray-500/8', borderColor: 'border-gray-500/15', glow: '' },
  ];

  return (
    <div className="p-5 md:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 animate-fade-in-up">
        <div>
          <h1 className="text-[28px] font-extrabold text-text-primary tracking-tight">Dashboard</h1>
          <p className="text-sm text-text-muted mt-1.5 font-normal">Track and manage customer promises</p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className={`flex items-center gap-2.5 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-[10px] text-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(34,197,94,0.25)] hover:scale-[1.02] active:scale-[0.98] shrink-0 ${
            promises.length === 0 && !loading ? 'animate-pulse-soft' : ''
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
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 relative">
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
            className="absolute bottom-0 h-full bg-white/[0.07] rounded-[10px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
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
            <p className="text-sm text-text-muted mb-5">{emptyMessages[activeTab].subtitle}</p>
            {activeTab === 'all' && promises.length === 0 && (
              <button
                onClick={() => setFormOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-[10px] text-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(34,197,94,0.25)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Log Your First Promise
              </button>
            )}
          </div>
        ) : (
          filtered.map((promise) => (
            <PromiseCard key={promise.id} promise={promise} onMarkDone={handleMarkDone} />
          ))
        )}
      </div>

      <PromiseForm isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleAddPromise} />
    </div>
  );
}
