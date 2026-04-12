import { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext(null);

/**
 * Check access based on plan and trial dates.
 * Returns { hasAccess, daysLeft, plan }.
 */
function checkAccess(business) {
  if (!business) return { hasAccess: false, daysLeft: 0, plan: 'none' };

  const plan = business.plan || 'trial';

  if (plan === 'pro') {
    return { hasAccess: true, daysLeft: -1, plan: 'pro' };
  }

  if (plan === 'trial_expired') {
    return { hasAccess: false, daysLeft: 0, plan: 'trial_expired' };
  }

  if (plan === 'trial') {
    const endDate = business.trialEndDate?.toDate
      ? business.trialEndDate.toDate()
      : business.trialEndDate
        ? new Date(business.trialEndDate)
        : null;

    if (!endDate) return { hasAccess: true, daysLeft: 21, plan: 'trial' };

    const now = new Date();
    if (now < endDate) {
      const msLeft = endDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
      return { hasAccess: true, daysLeft, plan: 'trial' };
    }
    return { hasAccess: false, daysLeft: 0, plan: 'trial' };
  }

  // plan === 'expired' or anything else
  return { hasAccess: false, daysLeft: 0, plan };
}

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [access, setAccess] = useState({ hasAccess: true, daysLeft: 21, plan: 'trial' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.businessId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'businesses', user.businessId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setBusiness(data);
          setAccess(checkAccess(data));
        }
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsubscribe;
  }, [user?.businessId]);

  return (
    <SubscriptionContext.Provider value={{ ...access, business, loading }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error('useSubscription must be used within SubscriptionProvider');
  return context;
}
