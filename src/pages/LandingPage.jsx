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

  useEffect(() => {
    document.title = 'Promise Tracker — Text a Promise, Never Drop the Ball';
    let meta = document.querySelector('meta[name="description"]');
    const content =
      'SMS-based promise tracking for service businesses. Text your promises in plain English, get smart reminders, morning briefings, and escalation alerts. $39/mo, 30-day free trial.';
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
              to="/free-tools"
              className="text-sm text-text-muted hover:text-text-primary transition-colors duration-150 px-3 py-1.5"
            >
              Free Tools
            </Link>
            <Link
              to="/blog"
              className="text-sm text-text-muted hover:text-text-primary transition-colors duration-150 px-3 py-1.5"
            >
              Blogs
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
            30-Day Free Trial · No Credit Card Required
          </div>
          <h1 className="hero-animate hero-delay-2 text-5xl sm:text-6xl lg:text-7xl font-extrabold text-text-primary leading-tight tracking-tight mb-6">
            Never Drop a{' '}
            <span className="text-accent">
              Customer Promise
            </span>{' '}
            Again.
          </h1>
          <p className="hero-animate hero-delay-3 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Text your promises in plain English. Promise Tracker parses them, sets reminders, and escalates before anything falls through the cracks. Built for contractors, home service pros, and anyone who makes promises to customers.
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
              <h3 className="text-text-primary font-bold text-base mb-2">Text Your Promise</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Text the Promise Tracker number in plain English. "Call the Hendersons about the roof quote by Friday at 3." That's it.
              </p>
            </div>

            <div className="bg-bg-card border border-border shadow-sm rounded-xl p-8 flex flex-col items-start">
              <div className="w-14 h-14 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-bold text-xl mb-5 shrink-0">
                2
              </div>
              <h3 className="text-text-primary font-bold text-base mb-2">Confirm in Seconds</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                We parse your message instantly — customer name, due date, and task. Reply YES to confirm, EDIT to change anything, or CANCEL.
              </p>
            </div>

            <div className="bg-bg-card border border-border shadow-sm rounded-xl p-8 flex flex-col items-start">
              <div className="w-14 h-14 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-bold text-xl mb-5 shrink-0">
                3
              </div>
              <h3 className="text-text-primary font-bold text-base mb-2">Get Reminded, Never Forget</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Morning briefing at 7am with today's promises. 2-hour heads-up before each one is due. Escalation alert if something slips.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── WHAT HAPPENS AFTER YOU HIT SEND ────────────────────── */}
      <section className="border-t border-border bg-bg-card-hover">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary text-center mb-4 tracking-tight">
            What Happens After You Hit Send
          </h2>
          <p className="text-text-secondary text-center mb-12 max-w-xl mx-auto">
            You text it. We handle everything else.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1 */}
            <div className="bg-bg-card border border-border shadow-sm rounded-xl p-8 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center mb-5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3 className="text-text-primary font-bold text-base mb-3">Morning Briefing</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Every morning at 7am, you get a text with everything due today and anything overdue. Start your day knowing exactly what needs to happen.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-bg-card border border-border shadow-sm rounded-xl p-8 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center mb-5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <h3 className="text-text-primary font-bold text-base mb-3">2-Hour Heads Up</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Two hours before a promise is due, you get a reminder. Enough time to handle it, not so early you forget again.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-bg-card border border-border shadow-sm rounded-xl p-8 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center mb-5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h3 className="text-text-primary font-bold text-base mb-3">Escalation Alert</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                If a promise passes its deadline, you get escalation alerts via text and email every day until it's handled. Nothing slips through.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── NOT ANOTHER BLOATED PLATFORM ────────────────────────── */}
      <section className="border-t border-border bg-bg-card-hover">
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

              <ul className="space-y-3.5 text-sm text-left mb-8">
                {[
                  '30-day free trial',
                  'No credit card required',
                  'Text promises in plain English',
                  'Smart date parsing',
                  'Edit promises without retyping',
                  'SMS commands (LIST, DONE, DELETE)',
                  '7am morning briefing',
                  '2-hour early reminders',
                  'Escalation alerts',
                  'Email + SMS reminders',
                  'Team dashboard',
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
      <section className="border-t border-border bg-bg-card-hover">
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
