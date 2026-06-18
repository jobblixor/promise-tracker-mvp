import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary text-text-secondary">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-animate { animation: fadeInUp 0.7s ease forwards; }
        .hero-delay-1 { animation-delay: 0.05s; opacity: 0; }
        .hero-delay-2 { animation-delay: 0.18s; opacity: 0; }
        .hero-delay-3 { animation-delay: 0.32s; opacity: 0; }
        .hero-delay-4 { animation-delay: 0.46s; opacity: 0; }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────── */}
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
            <Link
              to="/calculator"
              className="text-sm text-text-muted hover:text-text-primary transition-colors duration-150 px-3 py-1.5"
            >
              Free Tools
            </Link>
            <Link
              to="/login"
              className="text-sm text-text-muted hover:text-text-primary transition-colors duration-150 px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-sm font-semibold bg-accent hover:bg-accent-hover text-white px-4 py-1.5 rounded-lg transition-colors duration-150"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-40 pb-32 text-center">
        <div className="relative">
          <div className="hero-animate hero-delay-1 inline-block bg-bg-card border border-border text-accent text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
            21-Day Free Trial · No Credit Card Required
          </div>
          <h1 className="hero-animate hero-delay-2 text-5xl sm:text-6xl lg:text-7xl font-extrabold text-text-primary leading-tight tracking-tight mb-6">
            Your Team Promises to Call Back.{' '}
            <span className="text-accent">
              Promise Tracker
            </span>{' '}
            Makes Sure They Do.
          </h1>
          <p className="hero-animate hero-delay-3 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            The simple follow-up tool for service businesses. Log every customer promise. Get automatic reminders. Escalate when things slip. Nothing gets forgotten.
          </p>
          <div className="hero-animate hero-delay-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-block text-center bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors duration-150"
            >
              Start Free Trial
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-block text-center border border-border hover:border-text-muted text-text-secondary hover:text-text-primary font-semibold px-8 py-4 rounded-xl text-lg transition-colors duration-150"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM ─────────────────────────────────────────── */}
      <section className="border-t border-border bg-bg-card-hover">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary text-center mb-4 tracking-tight">
            Every Service Business Has This Problem
          </h2>
          <p className="text-text-secondary text-center mb-12 max-w-xl mx-auto">
            We researched 40 service companies across 11 industries. Every single one had this problem.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1 */}
            <div className="bg-bg-card border border-border shadow-sm rounded-xl p-8 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center mb-5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  <line x1="17" y1="1" x2="23" y2="7"/>
                  <line x1="23" y1="1" x2="17" y2="7"/>
                </svg>
              </div>
              <h3 className="text-text-primary font-bold text-base mb-3">The Forgotten Callback</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                A customer calls about a leaking pipe. Your receptionist says "we'll call you back with a quote." Three days later, they post a 1-star review because nobody ever called.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-bg-card border border-border shadow-sm rounded-xl p-8 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center mb-5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                  <line x1="9" y1="10" x2="15" y2="10"/>
                  <line x1="9" y1="14" x2="15" y2="14"/>
                </svg>
              </div>
              <h3 className="text-text-primary font-bold text-base mb-3">The Sticky Note System</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Your office tracks follow-ups on sticky notes, whiteboards, or memory. Things fall through the cracks every week, but nobody realizes until a customer complains.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-bg-card border border-border shadow-sm rounded-xl p-8 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center mb-5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="17 1 21 5 17 9"/>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                  <polyline points="7 23 3 19 7 15"/>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                </svg>
              </div>
              <h3 className="text-text-primary font-bold text-base mb-3">The Blame Game</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                The receptionist thought the tech was handling it. The tech thought the office was handling it. The customer thought nobody cared.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section className="border-t border-border bg-bg-card-hover">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary text-center mb-4 tracking-tight">
            Three Steps. Ten Seconds.
          </h2>
          <p className="text-text-secondary text-center mb-14 max-w-xl mx-auto">
            No training. No learning curve. Show your team once and they've got it.
          </p>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="bg-bg-card border border-border shadow-sm rounded-xl p-8 flex flex-col items-start">
              <div className="w-14 h-14 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-bold text-xl mb-5 shrink-0">
                1
              </div>
              <h3 className="text-text-primary font-bold text-base mb-2">Log the Promise</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Customer calls, your receptionist logs who was promised, what was promised, and when it's due. Done in 10 seconds.
              </p>
            </div>

            <div className="bg-bg-card border border-border shadow-sm rounded-xl p-8 flex flex-col items-start">
              <div className="w-14 h-14 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-bold text-xl mb-5 shrink-0">
                2
              </div>
              <h3 className="text-text-primary font-bold text-base mb-2">Automatic Reminders</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                30 minutes before it's due, the person who made the promise gets reminded via email. No manual follow-up needed.
              </p>
            </div>

            <div className="bg-bg-card border border-border shadow-sm rounded-xl p-8 flex flex-col items-start">
              <div className="w-14 h-14 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-bold text-xl mb-5 shrink-0">
                3
              </div>
              <h3 className="text-text-primary font-bold text-base mb-2">Escalation</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                1 hour overdue? The manager gets alerted. 24 hours? Daily urgent reminders fire until someone handles it. The system never forgets.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── NOT ANOTHER BLOATED PLATFORM ────────────────────────── */}
      <section className="border-t border-border bg-bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary text-center mb-4 tracking-tight">
            Not Another Bloated Platform
          </h2>
          <p className="text-text-secondary text-center mb-12 max-w-xl mx-auto">
            Jobber, Housecall Pro, and ServiceTitan are great if you need scheduling, dispatching, invoicing, CRM, and payments. Promise Tracker does one thing and does it perfectly.
          </p>

          <div className="bg-bg-card border border-border shadow-sm rounded-xl overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-3 border-b border-border">
              <div className="px-6 py-4 text-text-muted text-sm font-medium" />
              <div className="px-6 py-4 text-center text-text-muted text-sm font-medium border-l border-border">
                Jobber / Housecall Pro
              </div>
              <div className="px-6 py-4 text-center text-accent text-sm font-bold border-l border-border bg-green-500/10 border-t-2 border-t-green-500">
                Promise Tracker
              </div>
            </div>

            {[
              { label: 'Price', other: '$49–249/mo', us: '$39/mo' },
              { label: 'Setup time', other: 'Days to weeks', us: '5 minutes' },
              { label: 'Features', other: "50+ you don't need", us: '1 that matters' },
              { label: 'Contracts', other: 'Annual', us: 'None' },
              { label: 'Learning curve', other: 'Hours of training', us: 'Show your team once' },
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-3 ${i < 4 ? 'border-b border-border' : ''}`}>
                <div className="px-6 py-4 text-text-muted text-sm font-medium">{row.label}</div>
                <div className="px-6 py-4 text-center text-gray-500 text-sm border-l border-border">{row.other}</div>
                <div className="px-6 py-4 text-center text-text-primary text-sm font-bold border-l border-border bg-green-500/5">{row.us}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────── */}
      <section className="border-t border-border bg-bg-card-hover">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
          {/* Radial glow behind pricing card */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 50% 60% at 50% 65%, rgba(34,197,94,0.06) 0%, transparent 70%)',
            }}
          />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-4 tracking-tight">
            Simple Pricing. No Surprises.
          </h2>
          <p className="text-text-secondary mb-12 max-w-lg mx-auto">
            One plan. Everything included. Cancel anytime.
          </p>

          <div className="relative max-w-sm mx-auto rounded-2xl border-2 border-green-500 shadow-sm bg-bg-card p-8">
              <div className="text-7xl font-black text-text-primary mb-1">$39</div>
              <div className="text-text-muted text-sm mb-8">per month</div>

              <ul className="space-y-4 text-sm text-left mb-8">
                {[
                  '21-day free trial',
                  'No contracts — cancel anytime',
                  'Unlimited promises',
                  'Unlimited team members',
                  'Email reminders and escalations',
                  'Dashboard for your whole team',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-text-secondary">
                    <span className="text-accent font-bold text-lg leading-none">✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className="block w-full bg-accent hover:bg-accent-hover text-white font-bold py-3.5 rounded-xl text-base transition-colors duration-150 text-center"
              >
                Start Your Free Trial
              </Link>
              <p className="text-text-muted text-xs mt-3">No credit card required to start</p>
          </div>
        </div>
      </section>

      {/* ── RESOURCES ───────────────────────────────────────────── */}
      <section className="border-t border-border bg-bg-primary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl font-extrabold text-text-primary mb-6 tracking-tight">Resources</h2>
          <ul className="space-y-3">
            <li>
              <Link to="/calculator" className="text-accent hover:underline text-sm font-medium">
                Quote Follow-Up Revenue Calculator
              </Link>
            </li>
            <li>
              <Link to="/blog/how-to-follow-up-on-a-quote" className="text-accent hover:underline text-sm font-medium">
                How to Follow Up on a Quote
              </Link>
            </li>
            <li>
              <Link to="/blog/how-many-times-to-follow-up-on-estimate" className="text-accent hover:underline text-sm font-medium">
                How Many Times to Follow Up on an Estimate
              </Link>
            </li>
            <li>
              <Link to="/follow-up-text-templates" className="text-accent hover:underline text-sm font-medium">
                Follow-Up Text Message Templates
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      {/* Green gradient line above footer */}
      <div
        style={{
          height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(34,197,94,0.4), transparent)',
        }}
      />
      <footer className="bg-bg-primary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-muted">
          <span>© 2026 Promise Tracker</span>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <a
              href="mailto:support@promisetracker.app"
              className="hover:text-text-primary transition-colors duration-150"
            >
              support@promisetracker.app
            </a>
            <Link to="/terms" className="hover:text-text-primary transition-colors duration-150">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-text-primary transition-colors duration-150">
              Privacy
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
