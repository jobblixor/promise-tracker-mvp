import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { getFunctions } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import Layout from '../components/Layout';
import app from '../config/firebase';

const functions = getFunctions(app);

const features = [
  'Unlimited promises',
  'Unlimited team members',
  'SMS & email reminders',
  'Escalation alerts',
  'Cancel anytime',
];

export default function PricingPage() {
  const { user } = useAuth();
  const { plan } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (plan === 'pro') {
    return (
      <Layout>
        <div className="p-5 md:p-10 max-w-xl mx-auto text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary mb-2">You're on Pro!</h1>
          <p className="text-sm text-text-muted mb-6">You have full access to all Promise Tracker features.</p>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl text-sm transition-all duration-200">
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const handleSubscribe = async () => {
    setError('');
    setLoading(true);
    try {
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      const result = await createCheckoutSession({
        businessId: user.businessId,
        userId: user.uid,
      });
      window.location.href = result.data.url;
    } catch (err) {
      setError(err.message || 'Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-5 md:p-10 max-w-xl mx-auto animate-fade-in-up">
        <div className="text-center mb-10">
          <h1 className="text-[28px] font-extrabold text-text-primary tracking-tight">Upgrade to Pro</h1>
          <p className="text-sm text-text-muted mt-1.5">Everything you need to track every promise</p>
        </div>

        <div className="bg-bg-card border border-border rounded-2xl p-8">
          {/* Price */}
          <div className="text-center mb-8">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-extrabold text-text-primary">$39</span>
              <span className="text-lg text-text-muted font-medium">/month</span>
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-3.5 mb-8">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-text-secondary">
                <svg className="w-5 h-5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 mb-4">
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-3.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-bold rounded-xl text-base transition-all duration-200 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Redirecting to checkout...
              </>
            ) : (
              'Start Subscription'
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
}
