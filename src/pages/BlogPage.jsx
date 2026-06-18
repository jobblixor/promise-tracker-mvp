import { useState, useEffect } from 'react';
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
  {
    to: '/blog/what-to-do-when-customer-ghosts-estimate',
    title: 'What to Do When a Customer Ghosts Your Estimate',
    description:
      'You sent the quote and heard nothing. Here\'s a proven system for recovering silent estimates — with scripts, timing, and prevention tactics.',
    tag: 'Ghosted Estimates',
    readTime: '7 min read',
  },
];

export default function BlogPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            Blog
          </div>
          <h1 className="mb-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
            Follow-Up Tips for Service Businesses
          </h1>
          <p className="mx-auto max-w-xl text-text-secondary">
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
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-bg-card p-6 transition hover:border-accent no-underline"
            >
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-accent/10 px-3 py-0.5 text-xs font-semibold text-accent">
                  {article.tag}
                </span>
                <span className="text-xs text-text-muted">{article.readTime}</span>
              </div>
              <h2 className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors leading-snug">
                {article.title}
              </h2>
              <p className="flex-1 text-sm leading-relaxed text-text-secondary">{article.description}</p>
              <span className="text-sm font-medium text-accent group-hover:underline">
                Read article →
              </span>
            </Link>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="mt-16 rounded-2xl border border-border bg-bg-card px-6 py-10 text-center">
          <h2 className="mb-2 text-xl font-bold text-text-primary">
            Ready to put this into practice?
          </h2>
          <p className="mb-6 text-text-secondary">
            Promise Tracker automates the entire follow-up process — log a customer promise and it
            sends escalating reminders until you get a yes or no. Nothing falls through the cracks.
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
