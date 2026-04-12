import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [invite, setInvite] = useState(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const { signup, inviteSignup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const inviteId = searchParams.get('invite');
    if (!inviteId) return;
    setInviteLoading(true);
    getDoc(doc(db, 'invites', inviteId)).then((snap) => {
      if (snap.exists() && snap.data().status === 'pending') {
        setInvite({ id: snap.id, ...snap.data() });
        setEmail(snap.data().email || '');
        setPhone(snap.data().phone || '');
      } else {
        setError('This invite link is invalid or has already been used');
      }
      setInviteLoading(false);
    }).catch(() => {
      setError('Failed to load invite');
      setInviteLoading(false);
    });
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (invite) {
        await inviteSignup(email, password, phone, invite);
      } else {
        await signup(email, password, businessName, phone);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="mx-auto mb-5"><Logo size={56} /></div>
          <h1 className="text-[26px] font-extrabold text-text-primary tracking-tight">{invite ? 'Join your team' : 'Create your account'}</h1>
          <p className="text-sm text-text-muted mt-1.5">{invite ? 'Complete your account to get started' : 'Start tracking promises in minutes'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 animate-fade-in-up">
              {error}
            </div>
          )}

          {invite && (
            <div className="bg-accent/5 border border-accent/20 rounded-xl px-4 py-3 text-sm text-accent animate-fade-in-up">
              You've been invited to join <span className="font-semibold">{invite.businessName}</span> as a <span className="font-semibold capitalize">{invite.role}</span>
            </div>
          )}

          {inviteLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !invite && (
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                placeholder="Your Company LLC"
                className="w-full px-3.5 py-2.5 bg-bg-card border border-border rounded-[10px] text-sm text-text-secondary placeholder:text-text-muted/40 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.06)] transition-all duration-200"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+1 (555) 123-4567"
              className="w-full px-3.5 py-2.5 bg-bg-card border border-border rounded-[10px] text-sm text-text-secondary placeholder:text-text-muted/40 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.06)] transition-all duration-200"
            />
          </div>

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
            <label className="block text-sm font-semibold text-text-secondary mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
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
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</>
            ) : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-8">
          Already have an account?{' '}
          <Link to="/" className="text-accent hover:underline font-medium transition-colors duration-200">Sign in</Link>
        </p>

        <div className="flex items-center justify-center gap-3 mt-6 text-xs text-text-muted">
          <Link to="/terms" className="hover:text-accent transition-colors duration-200">Terms of Service</Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-accent transition-colors duration-200">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
