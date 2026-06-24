import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import LandingPage from './pages/LandingPage';
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
import CalculatorPage from './pages/CalculatorPage';
import AdminAffiliatePage from './pages/AdminAffiliatePage';
import BlogFollowUpQuote from './pages/BlogFollowUpQuote';
import BlogFollowUpTimes from './pages/BlogFollowUpTimes';
import BlogGhostedEstimate from './pages/BlogGhostedEstimate';
import TextTemplateGenerator from './pages/TextTemplateGenerator';
import FreeToolsPage from './pages/FreeToolsPage';
import BlogPage from './pages/BlogPage';
import QuoteFollowUpChecklist from './pages/QuoteFollowUpChecklist';

const ADMIN_EMAIL = 'promisetrackermvp@gmail.com';

const INACTIVITY_LIMIT = 259200000; // 3 days in ms
const ACTIVITY_KEY = 'pt_last_activity';
const PUBLIC_PATHS = ['/', '/login', '/signup', '/terms', '/privacy'];

function ReferralCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      const expires = new Date(Date.now() + 30 * 864e5).toUTCString();
      document.cookie = `pt_ref=${encodeURIComponent(ref)}; expires=${expires}; path=/`;
    }
  }, []);
  return null;
}

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

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (!user.emailVerified) return <Navigate to="/verify" replace />;
  if (user.email !== ADMIN_EMAIL) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <SubscriptionProvider>
            <ReferralCapture />
            <ActivityTracker />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
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
              <Route path="/calculator" element={<CalculatorPage />} />
              <Route path="/blog/how-to-follow-up-on-a-quote" element={<BlogFollowUpQuote />} />
              <Route path="/blog/how-many-times-to-follow-up-on-estimate" element={<BlogFollowUpTimes />} />
              <Route path="/blog/what-to-do-when-customer-ghosts-estimate" element={<BlogGhostedEstimate />} />
              <Route path="/follow-up-text-templates" element={<TextTemplateGenerator />} />
              <Route path="/free-tools" element={<FreeToolsPage />} />
              <Route path="/follow-up-checklist" element={<QuoteFollowUpChecklist />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/admin/affiliates" element={<AdminRoute><AdminAffiliatePage /></AdminRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SubscriptionProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
