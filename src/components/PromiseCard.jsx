import { useState } from 'react';

export default function PromiseCard({ promise, onMarkDone, disabled }) {
  const [completing, setCompleting] = useState(false);

  const statusConfig = {
    overdue: { label: 'Overdue', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', left: 'bg-red-500' },
    'due-today': { label: 'Due Today', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', left: 'bg-yellow-500' },
    upcoming: { label: 'Upcoming', bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent/20', left: 'bg-accent' },
    done: { label: 'Done', bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', left: 'bg-gray-500' },
  };

  const status = statusConfig[promise.status] || statusConfig.upcoming;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (isToday) return `Today at ${time}`;
    if (isTomorrow) return `Tomorrow at ${time}`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ` at ${time}`;
  };

  const getRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date - now;
    const absDiffMs = Math.abs(diffMs);
    const mins = Math.floor(absDiffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (promise.status === 'done') return null;
    if (diffMs < 0) {
      if (mins < 60) return `${mins}m overdue`;
      if (hours < 24) return `${hours}h overdue`;
      return `${days}d overdue`;
    }
    if (mins < 60) return `due in ${mins}m`;
    if (hours < 24) return `due in ${hours}h`;
    return `due in ${days}d`;
  };

  const handleMarkDone = async () => {
    setCompleting(true);
    await onMarkDone(promise.id);
  };

  const relativeTime = getRelativeTime(promise.dueDate);

  return (
    <div className={`relative bg-bg-card border ${status.border} rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/15 hover:-translate-y-[1px] hover:border-white/10 group animate-fade-in-up ${
      completing ? 'opacity-60 scale-[0.98]' : ''
    }`}>
      {/* Left accent border */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${status.left} rounded-l-xl`} />

      <div className="flex items-start justify-between gap-3 p-5 pl-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-2">
            <h3 className="text-[15px] font-bold text-text-primary truncate">{promise.customerName}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${status.bg} ${status.text}`}>
              {status.label}
            </span>
          </div>
          <p className="text-sm text-text-secondary/80 mb-3 line-clamp-2 leading-relaxed">{promise.description}</p>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(promise.dueDate)}
            </span>
            {relativeTime && (
              <span className={`font-semibold ${promise.status === 'overdue' ? 'text-red-400/80' : 'text-text-muted'}`}>
                {relativeTime}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              {promise.createdBy}
            </span>
          </div>
        </div>

        {promise.status !== 'done' && !completing && !disabled && (
          <button
            onClick={handleMarkDone}
            className="shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 px-3.5 py-1.5 text-xs font-semibold rounded-[8px] bg-accent/10 text-accent hover:bg-accent/20 hover:scale-105 active:scale-95 border border-accent/20"
          >
            Mark Done
          </button>
        )}
        {(promise.status === 'done' || completing) && (
          <div className="shrink-0">
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path className={completing ? 'animate-check-draw' : ''} strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
