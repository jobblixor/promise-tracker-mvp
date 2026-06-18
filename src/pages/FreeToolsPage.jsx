import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const TOOLS = [
  {
    to: '/calculator',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-6-6h12" />
        <rect x="3" y="3" width="18" height="18" rx="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Quote Follow-Up Revenue Calculator',
    description:
      'Find out exactly how much revenue your service business is leaving on the table from unfollowed quotes. Plug in your numbers and see the dollar amount in seconds.',
    cta: 'Open Calculator →',
  },
  {
    to: '/follow-up-text-templates',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.852L3 20l1.09-3.27A7.95 7.95 0 013 12C3 7.582 7.03 4 12 4s9 3.582 9 8z" />
      </svg>
    ),
    title: 'Follow-Up Text Message Templates',
    description:
      'Ready-to-send text templates for every follow-up situation — estimate reminders, appointment confirmations, post-job check-ins, review requests, and more. Pick your trade, pick the situation, copy and send.',
    cta: 'Browse Templates →',
  },
];

export default function FreeToolsPage() {
  useEffect(() => {
    document.title = 'Free Tools for Service Businesses | Promise Tracker';
    let meta = document.querySelector('meta[name="description"]');
    const content =
      'Free tools built for service businesses: a quote follow-up revenue calculator and ready-to-use follow-up text message templates.';
    if (meta) {
      meta.setAttribute('content', content);
    } else {
      meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = content;
      document.head.appendChild(meta);
    }
  }, []);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary text-text-secondary">

      {/* ── Nav ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-bg-primary/80 backdrop-blur-lg border-b border-border'
            : 'border-b border-transparent'
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-text-primary font-bold text-lg">
            <Logo size={32} />
            Promise Tracker
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/free-tools" className="text-sm text-text-muted hover:text-text-primary transition-colors duration-150 px-3 py-1.5">
              Free Tools
            </Link>
            <Link to="/blog" className="text-sm text-text-muted hover:text-text-primary transition-colors duration-150 px-3 py-1.5">
              Blogs
            </Link>
            <Link to="/login" className="text-sm text-text-muted hover:text-text-primary transition-colors duration-150 px-3 py-1.5">
              Sign In
            </Link>
            <Link to="/signup" className="text-sm font-semibold bg-accent hover:bg-accent-hover text-white px-4 py-1.5 rounded-lg transition-colors duration-150">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 pt-32 pb-16">
        <div className="mb-12 text-center">
          <div className="inline-block bg-bg-card border border-border text-accent text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
            Free — no signup required
          </div>
          <h1 className="mb-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
            Free Tools for Service Businesses
          </h1>
          <p className="mx-auto max-w-xl text-text-secondary">
            Practical tools to help you follow up faster, win more jobs, and stop letting
            revenue slip through the cracks.
          </p>
        </div>

        {/* ── Tool Cards ── */}
        <div className="grid gap-6 sm:grid-cols-2">
          {TOOLS.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="group flex flex-col gap-4 rounded-2xl border border-border bg-bg-card p-6 transition hover:border-accent no-underline"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                {tool.icon}
              </div>
              <div className="flex-1">
                <h2 className="mb-2 text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">
                  {tool.title}
                </h2>
                <p className="text-sm leading-relaxed text-text-secondary">{tool.description}</p>
              </div>
              <span className="text-sm font-medium text-accent group-hover:underline">
                {tool.cta}
              </span>
            </Link>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="mt-16 rounded-2xl border border-border bg-bg-card px-6 py-10 text-center">
          <h2 className="mb-2 text-xl font-bold text-text-primary">
            Want to automate your follow-ups entirely?
          </h2>
          <p className="mb-6 text-text-secondary">
            Promise Tracker logs every customer promise and sends automatic reminders — so nothing
            falls through the cracks, even on your busiest days.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-2.5 rounded-lg transition-colors duration-150 text-sm"
          >
            Start Your 21-Day Free Trial
          </Link>
        </div>
      </main>

      {/* ── Footer ── */}
      <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(34,197,94,0.4), transparent)' }} />
      <footer className="bg-bg-primary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-muted">
          <span>© 2026 Promise Tracker</span>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <a href="mailto:support@promisetracker.app" className="hover:text-text-primary transition-colors duration-150">support@promisetracker.app</a>
            <Link to="/terms" className="hover:text-text-primary transition-colors duration-150">Terms</Link>
            <Link to="/privacy" className="hover:text-text-primary transition-colors duration-150">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
