import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const TOOLS = [
  {
    to: '/calculator',
    badge: 'Free Calculator',
    preview: '/calculator.png',
    previewAlt: 'Quote follow-up revenue calculator showing $3,897/mo in lost revenue',
    title: 'Quote Follow-Up Revenue Calculator',
    description:
      'Find out exactly how much revenue your service business is leaving on the table from unfollowed quotes. Plug in your numbers and see the dollar amount in seconds.',
    cta: 'Open Calculator →',
  },
  {
    to: '/follow-up-text-templates',
    badge: 'Free Templates',
    preview: '/text.png',
    previewAlt: 'Follow-up text message template generator showing ready-to-send messages',
    title: 'Follow-Up Text Message Templates',
    description:
      'Ready-to-send text templates for every follow-up situation — estimate reminders, appointment confirmations, post-job check-ins, review requests, and more. Pick your trade, pick the situation, copy and send.',
    cta: 'Browse Templates →',
  },
  {
    to: '/follow-up-checklist',
    badge: 'Free Checklist',
    title: 'Quote Follow-Up Checklist',
    description:
      'Step-by-step system to follow up on every quote and close more jobs. Trade-specific scripts, timing, and the psychology behind each step.',
    cta: 'View Checklist →',
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
        <div className="flex flex-col gap-8">
          {TOOLS.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="group flex flex-col lg:flex-row rounded-2xl border border-border bg-bg-card overflow-hidden transition hover:border-accent no-underline"
            >
              {/* Text side */}
              <div className="flex flex-col justify-center gap-4 p-8 lg:w-2/5">
                <span className="w-fit rounded-full bg-accent/10 px-3 py-0.5 text-xs font-semibold text-accent">
                  {tool.badge}
                </span>
                <h2 className="text-xl font-bold text-text-primary group-hover:text-accent transition-colors leading-snug">
                  {tool.title}
                </h2>
                <p className="text-sm leading-relaxed text-text-secondary">{tool.description}</p>
                <span className="text-sm font-semibold text-accent group-hover:underline">
                  {tool.cta}
                </span>
              </div>

              {/* Screenshot side */}
              <div className="lg:w-3/5 overflow-hidden">
                <img
                  src={tool.preview}
                  alt={tool.previewAlt}
                  className="w-full h-full object-cover object-top"
                />
              </div>
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
