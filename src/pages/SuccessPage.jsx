import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';

export default function SuccessPage() {
  const { plan } = useSubscription();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Give Stripe webhook a moment to process, then check plan
    const timer = setTimeout(() => setChecking(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const isPro = plan === 'pro';

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center animate-fade-in-up">
        {checking ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-text-muted">Confirming your payment...</p>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-[28px] font-extrabold text-text-primary tracking-tight mb-2">
              {isPro ? 'Welcome to Promise Tracker Pro!' : 'Payment Processing'}
            </h1>
            <p className="text-sm text-text-muted mb-8">
              {isPro
                ? 'Your subscription is active. You now have full access to all features.'
                : 'Your payment is being processed. This usually takes just a moment. You can head to your dashboard — access will be unlocked shortly.'}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl text-base transition-all duration-200 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
