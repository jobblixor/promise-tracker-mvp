import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpsCallable, getFunctions } from 'firebase/functions';
import app from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';

const functions = getFunctions(app);

export default function VerifyEmailPage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const verifyEmailCode = httpsCallable(functions, 'verifyEmailCode');
      await verifyEmailCode({ code: code.trim() });
      await refreshUser();
      toast.success('Email verified successfully!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('[VERIFY DEBUG] Verification error:', err.code, err.message, err);
      // err.code is 'functions/<code>' in the modular SDK; strip the prefix so
      // either form maps correctly.
      const errCode = (err?.code || '').replace(/^functions\//, '');
      if (errCode === 'not-found') {
        setError('No verification code found. Please request a new one.');
      } else if (errCode === 'deadline-exceeded') {
        setError('This code has expired. Please request a new one.');
      } else if (errCode === 'invalid-argument') {
        setError('Incorrect code. Please try again.');
      } else {
        setError('Verification failed. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      const sendVerificationCode = httpsCallable(functions, 'sendVerificationCode');
      await sendVerificationCode({ email: user.email, userId: user.uid });
      toast.success('New verification code sent!');
    } catch {
      toast.error('Failed to resend code. Please try again.');
    }
    setResending(false);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5"><Logo size={56} /></div>
          <h1 className="text-[26px] font-extrabold text-text-primary tracking-tight">Verify your email</h1>
          <p className="text-sm text-text-muted mt-1.5">
            Check your email for a 6-digit verification code
          </p>
          {user?.email && (
            <p className="text-xs text-text-muted mt-2">
              Sent to <span className="text-accent font-medium">{user.email}</span>
            </p>
          )}
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 animate-fade-in-up">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">Verification Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              maxLength={6}
              placeholder="000000"
              className="w-full px-3.5 py-3 bg-bg-card border border-border rounded-[10px] text-center text-2xl font-bold text-text-primary tracking-[0.3em] placeholder:text-text-muted/40 placeholder:tracking-[0.3em] focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.06)] transition-all duration-200"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold rounded-[10px] text-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(34,197,94,0.25)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying...</>
            ) : 'Verify Email'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-sm text-accent hover:underline font-medium transition-colors duration-200 disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Resend Code'}
          </button>
        </div>

        <p className="text-center text-xs text-[#64748b] mt-8">
          Didn&apos;t receive the code? Check spam or email{' '}
          <a href="mailto:support@promisetracker.app" className="text-accent hover:underline">support@promisetracker.app</a>
        </p>
      </div>
    </div>
  );
}
