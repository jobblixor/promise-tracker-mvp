import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const TOOLS = [
  {
    to: '/calculator',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-gray-900 no-underline">
            <Logo size={28} />
            <span className="text-lg font-semibold">Promise Tracker</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/signup"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="mx-auto max-w-5xl px-4 py-14">
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700">
            Free — no signup required
          </span>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Free Tools for Service Businesses
          </h1>
          <p className="mx-auto max-w-xl text-gray-500">
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
              className="group flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-green-400 hover:shadow-md no-underline"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-50">
                {tool.icon}
              </div>
              <div className="flex-1">
                <h2 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                  {tool.title}
                </h2>
                <p className="text-sm leading-relaxed text-gray-500">{tool.description}</p>
              </div>
              <span className="text-sm font-medium text-green-600 group-hover:underline">
                {tool.cta}
              </span>
            </Link>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="mt-16 rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Want to automate your follow-ups entirely?
          </h2>
          <p className="mb-6 text-gray-500">
            Promise Tracker logs every customer promise and sends automatic reminders — so nothing
            falls through the cracks, even on your busiest days.
          </p>
          <Link
            to="/signup"
            className="inline-block rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            Start Your 21-Day Free Trial
          </Link>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-400">
        <span>© 2026 Promise Tracker · </span>
        <Link to="/terms" className="hover:underline">Terms</Link>
        <span> · </span>
        <Link to="/privacy" className="hover:underline">Privacy</Link>
      </footer>
    </div>
  );
}
