import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmailPage from './pages/VerifyEmailPage';
import DashboardPage from './pages/DashboardPage';
import TeamPage from './pages/TeamPage';
import PromisesPage from './pages/PromisesPage';
import SettingsPage from './pages/SettingsPage';
import PricingPage from './pages/PricingPage';
import SuccessPage from './pages/SuccessPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

const INACTIVITY_LIMIT = 259200000; // 3 days in ms
const ACTIVITY_KEY = 'pt_last_activity';
const PUBLIC_PATHS = ['/', '/signup', '/terms', '/privacy'];

function ActivityTracker() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const location = useLocation();

  // Update activity timestamp on every navigation for authenticated users
  useEffect(() => {
    if (user && !PUBLIC_PATHS.includes(location.pathname)) {
      localStorage.setItem(ACTIVITY_KEY, Date.now().toString());
    }
  }, [location.pathname, user]);

  // Check inactivity on every render
  useEffect(() => {
    if (!user) return;
    const lastActivity = localStorage.getItem(ACTIVITY_KEY);
    if (lastActivity && Date.now() - parseInt(lastActivity, 10) > INACTIVITY_LIMIT) {
      localStorage.removeItem(ACTIVITY_KEY);
      logout().then(() => {
        toast.warning("You've been signed out due to inactivity");
      });
    }
  });

  return null;
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (!user.emailVerified) return <Navigate to="/verify" replace />;
  return children;
}

function VerifyRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.emailVerified) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user && user.emailVerified) return <Navigate to="/dashboard" replace />;
  if (user && !user.emailVerified) return <Navigate to="/verify" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <SubscriptionProvider>
            <ActivityTracker />
            <Routes>
              <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
              <Route path="/verify" element={<VerifyRoute><VerifyEmailPage /></VerifyRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/promises" element={<ProtectedRoute><PromisesPage /></ProtectedRoute>} />
              <Route path="/team" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
              <Route path="/success" element={<ProtectedRoute><SuccessPage /></ProtectedRoute>} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SubscriptionProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
