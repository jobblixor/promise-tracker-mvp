import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-5 shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(34,197,94,0.45)]">P</div>
          <h1 className="text-[26px] font-extrabold text-text-primary tracking-tight">Welcome back</h1>
          <p className="text-sm text-text-muted mt-1.5">Sign in to Promise Tracker</p>
        </div>

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
            <label className="block text-sm font-semibold text-text-secondary mb-2">Password</label>
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
      </div>
    </div>
  );
}
