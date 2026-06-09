import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import Logo from '../components/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Password reset state
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess(true);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setResetError('No account found with this email.');
      } else {
        setResetError('Something went wrong. Please try again later.');
      }
    }
    setResetLoading(false);
  };

  const handleBackToLogin = () => {
    setShowReset(false);
    setResetEmail('');
    setResetError('');
    setResetSuccess(false);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5"><Logo size={56} /></div>
          {showReset ? (
            <>
              <h1 className="text-[26px] font-extrabold text-text-primary tracking-tight">Reset password</h1>
              <p className="text-sm text-text-muted mt-1.5">We&apos;ll send you a reset link</p>
            </>
          ) : (
            <>
              <h1 className="text-[26px] font-extrabold text-text-primary tracking-tight">Welcome back</h1>
              <p className="text-sm text-text-muted mt-1.5">Sign in to Promise Tracker</p>
            </>
          )}
        </div>

        {showReset ? (
          resetSuccess ? (
            <div className="space-y-4">
              <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-sm text-accent animate-fade-in-up">
                Check your email for a password reset link.
              </div>
              <button
                onClick={handleBackToLogin}
                className="w-full py-2.5 bg-bg-card-hover hover:bg-border border border-border/40 text-text-secondary font-semibold rounded-[10px] text-sm transition-all duration-200"
              >
                Back to login
              </button>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              {resetError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 animate-fade-in-up">
                  {resetError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  className="w-full px-3.5 py-2.5 bg-bg-card border border-border rounded-[10px] text-sm text-text-secondary placeholder:text-text-muted/40 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.06)] transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold rounded-[10px] text-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(34,197,94,0.25)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {resetLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
                ) : 'Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full text-center text-sm text-accent hover:underline font-medium transition-colors duration-200"
              >
                Back to login
              </button>
            </form>
          )
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 animate-fade-in-up">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  className="w-full px-3.5 py-2.5 bg-bg-card border border-border rounded-[10px] text-sm text-text-secondary placeholder:text-text-muted/40 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.06)] transition-all duration-200"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-text-secondary">Password</label>
                  <button
                    type="button"
                    onClick={() => { setShowReset(true); setResetEmail(email); }}
                    className="text-xs text-text-muted hover:text-accent font-medium transition-colors duration-200"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-bg-card border border-border rounded-[10px] text-sm text-text-secondary placeholder:text-text-muted/40 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.06)] transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold rounded-[10px] text-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(34,197,94,0.25)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
                ) : 'Sign in'}
              </button>
            </form>

            <p className="text-center text-sm text-text-muted mt-8">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="text-accent hover:underline font-medium transition-colors duration-200">Sign up</Link>
            </p>
          </>
        )}

        <div className="flex items-center justify-center gap-3 mt-6 text-xs text-text-muted">
          <Link to="/terms" className="hover:text-accent transition-colors duration-200">Terms of Service</Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-accent transition-colors duration-200">Privacy Policy</Link>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          Need help?{' '}
          <a href="mailto:support@promisetracker.app" className="text-accent hover:underline">support@promisetracker.app</a>
        </p>
      </div>
    </div>
  );
}
