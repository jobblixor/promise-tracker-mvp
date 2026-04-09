import { useState } from 'react';

export default function PromiseForm({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    description: '',
    dueDate: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        description: formData.description,
        dueDate: formData.dueDate,
      });
      setFormData({ customerName: '', customerPhone: '', description: '', dueDate: '' });
      onClose();
    } catch {
      // error handled by parent
    }
    setSubmitting(false);
  };

  if (!isOpen) return null;

  const inputClasses = 'w-full px-3.5 py-2.5 bg-bg-primary border border-border rounded-[10px] text-sm text-text-secondary placeholder:text-text-muted/40 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.06)] transition-all duration-200';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-bg-card border-l border-border/60 z-50 flex flex-col shadow-2xl shadow-black/40 animate-slide-in-right">
        <div className="flex items-center justify-between p-6 border-b border-border/40">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Log a Promise</h2>
            <p className="text-xs text-text-muted mt-1 font-medium">Record what was promised to the customer</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-text-muted hover:text-text-secondary hover:bg-white/[0.06] transition-all duration-200 hover:rotate-90"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-5 overflow-y-auto">
          <div className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
            <label className="block text-sm font-semibold text-text-secondary mb-2">Customer Name</label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
              placeholder="e.g. John Smith"
              className={inputClasses}
            />
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <label className="block text-sm font-semibold text-text-secondary mb-2">Phone Number</label>
            <input
              type="tel"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              placeholder="e.g. (555) 123-4567"
              className={inputClasses}
            />
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <label className="block text-sm font-semibold text-text-secondary mb-2">What was promised?</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              placeholder="e.g. Follow up with pricing details by end of week"
              className={`${inputClasses} resize-none`}
            />
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <label className="block text-sm font-semibold text-text-secondary mb-2">Due Date & Time</label>
            <input
              type="datetime-local"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              className={`${inputClasses} [color-scheme:dark]`}
            />
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white font-semibold rounded-[10px] text-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(34,197,94,0.25)] hover:scale-[1.01] active:scale-[0.99] mt-2 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Log Promise'
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
