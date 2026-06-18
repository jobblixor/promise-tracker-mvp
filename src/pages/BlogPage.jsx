import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const ARTICLES = [
  {
    to: '/blog/how-to-follow-up-on-a-quote',
    title: 'How to Follow Up on a Quote Without Being Annoying',
    description:
      'The exact words to use at each stage of your follow-up sequence — from the first check-in to the final graceful close-out. Templates included.',
    tag: 'Quote Follow-Up',
    readTime: '6 min read',
  },
  {
    to: '/blog/how-many-times-to-follow-up-on-estimate',
    title: 'How Many Times Should You Follow Up on an Estimate?',
    description:
      'Research shows 80% of sales require 5–12 follow-up touches, yet most businesses stop after one. Here\'s how to find the right cadence without burning bridges.',
    tag: 'Quote Follow-Up',
    readTime: '5 min read',
  },
];

export default function BlogPage() {
  useEffect(() => {
    document.title = 'Blog — Follow-Up Tips for Service Businesses | Promise Tracker';
    let meta = document.querySelector('meta[name="description"]');
    const content =
      'Practical articles on following up with customers, winning more quotes, and growing your service business — from the team at Promise Tracker.';
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
            Blog
          </span>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Follow-Up Tips for Service Businesses
          </h1>
          <p className="mx-auto max-w-xl text-gray-500">
            Practical guides on winning more jobs, following up without feeling pushy,
            and building a system so nothing falls through the cracks.
          </p>
        </div>

        {/* ── Article Cards ── */}
        <div className="grid gap-6 sm:grid-cols-2">
          {ARTICLES.map((article) => (
            <Link
              key={article.to}
              to={article.to}
              className="group flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-green-400 hover:shadow-md no-underline"
            >
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-green-100 px-3 py-0.5 text-xs font-semibold text-green-700">
                  {article.tag}
                </span>
                <span className="text-xs text-gray-400">{article.readTime}</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors leading-snug">
                {article.title}
              </h2>
              <p className="flex-1 text-sm leading-relaxed text-gray-500">{article.description}</p>
              <span className="text-sm font-medium text-green-600 group-hover:underline">
                Read article →
              </span>
            </Link>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="mt-16 rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Ready to put this into practice?
          </h2>
          <p className="mb-6 text-gray-500">
            Promise Tracker automates the entire follow-up process — log a customer promise and it
            sends escalating reminders until you get a yes or no. Nothing falls through the cracks.
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
