import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-secondary">

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-text-primary font-bold text-lg">
            <Logo size={32} />
            Promise Tracker
          </Link>
          <div className="flex items-center gap-3">
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
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-20 text-center">
        <div className="inline-block bg-bg-card border border-border text-accent text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
          21-Day Free Trial · No Credit Card Required
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary leading-tight tracking-tight mb-6">
          Your Team Promises to Call Back.{' '}
          <span className="text-accent">Promise Tracker</span> Makes Sure They Do.
        </h1>
        <p className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          The simple follow-up tool for service businesses. Log every customer promise. Get automatic reminders. Escalate when things slip. Nothing gets forgotten.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="w-full sm:w-auto inline-block text-center bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-colors duration-150"
          >
            Start Free Trial
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-block text-center border border-border hover:border-text-muted text-text-secondary hover:text-text-primary font-semibold px-8 py-3.5 rounded-xl text-base transition-colors duration-150"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* ── THE PROBLEM ─────────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary text-center mb-4 tracking-tight">
            Every Service Business Has This Problem
          </h2>
          <p className="text-text-muted text-center mb-12 max-w-xl mx-auto">
            We researched 40 service companies across 11 industries. Every single one had this problem.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1 */}
            <div className="bg-bg-card border border-border rounded-xl p-6">
              <div className="text-2xl mb-4">📞</div>
              <h3 className="text-text-primary font-bold text-base mb-3">The Forgotten Callback</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                A customer calls about a leaking pipe. Your receptionist says "we'll call you back with a quote." Three days later, they post a 1-star review because nobody ever called.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-bg-card border border-border rounded-xl p-6">
              <div className="text-2xl mb-4">📋</div>
              <h3 className="text-text-primary font-bold text-base mb-3">The Sticky Note System</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Your office tracks follow-ups on sticky notes, whiteboards, or memory. Things fall through the cracks every week, but nobody realizes until a customer complains.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-bg-card border border-border rounded-xl p-6">
              <div className="text-2xl mb-4">🤷</div>
              <h3 className="text-text-primary font-bold text-base mb-3">The Blame Game</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                The receptionist thought the tech was handling it. The tech thought the office was handling it. The customer thought nobody cared.
              </p>
            </div>

          </div>

          <p className="text-center text-text-muted text-sm mt-10">
            <span className="text-text-primary font-semibold">100% hit rate</span> — this problem was found at{' '}
            <span className="text-text-primary font-semibold">40 out of 40</span> companies researched across{' '}
            <span className="text-text-primary font-semibold">11 industries</span>, including 4.9-star companies.
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary text-center mb-4 tracking-tight">
            Three Steps. Ten Seconds.
          </h2>
          <p className="text-text-muted text-center mb-14 max-w-xl mx-auto">
            No training. No learning curve. Show your team once and they've got it.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="flex flex-col items-start">
              <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-bold text-lg mb-5 shrink-0">
                1
              </div>
              <h3 className="text-text-primary font-bold text-base mb-2">Log the Promise</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Customer calls, your receptionist logs who was promised, what was promised, and when it's due. Done in 10 seconds.
              </p>
            </div>

            <div className="flex flex-col items-start">
              <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-bold text-lg mb-5 shrink-0">
                2
              </div>
              <h3 className="text-text-primary font-bold text-base mb-2">Automatic Reminders</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                30 minutes before it's due, the person who made the promise gets reminded via email. No manual follow-up needed.
              </p>
            </div>

            <div className="flex flex-col items-start">
              <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-bold text-lg mb-5 shrink-0">
                3
              </div>
              <h3 className="text-text-primary font-bold text-base mb-2">Escalation</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                1 hour overdue? The manager gets alerted. 24 hours? Daily urgent reminders fire until someone handles it. The system never forgets.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── NOT ANOTHER BLOATED PLATFORM ────────────────────────── */}
      <section className="border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary text-center mb-4 tracking-tight">
            Not Another Bloated Platform
          </h2>
          <p className="text-text-muted text-center mb-12 max-w-xl mx-auto">
            Jobber, Housecall Pro, and ServiceTitan are great if you need scheduling, dispatching, invoicing, CRM, and payments. Promise Tracker does one thing and does it perfectly.
          </p>

          <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-3 border-b border-border">
              <div className="px-6 py-4 text-text-muted text-sm font-medium" />
              <div className="px-6 py-4 text-center text-text-muted text-sm font-medium border-l border-border">
                Jobber / Housecall Pro
              </div>
              <div className="px-6 py-4 text-center text-accent text-sm font-bold border-l border-border">
                Promise Tracker
              </div>
            </div>

            {[
              { label: 'Price', other: '$49–249/mo', us: '$39/mo' },
              { label: 'Setup time', other: 'Days to weeks', us: '5 minutes' },
              { label: 'Features', other: '50+ you don\'t need', us: '1 that matters' },
              { label: 'Contracts', other: 'Annual', us: 'None' },
              { label: 'Learning curve', other: 'Hours of training', us: 'Show your team once' },
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-3 ${i < 4 ? 'border-b border-border' : ''}`}>
                <div className="px-6 py-4 text-text-muted text-sm font-medium">{row.label}</div>
                <div className="px-6 py-4 text-center text-text-muted text-sm border-l border-border">{row.other}</div>
                <div className="px-6 py-4 text-center text-text-primary text-sm font-semibold border-l border-border">{row.us}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-4 tracking-tight">
            Simple Pricing. No Surprises.
          </h2>
          <p className="text-text-muted mb-12 max-w-lg mx-auto">
            One plan. Everything included. Cancel anytime.
          </p>

          <div className="max-w-sm mx-auto bg-bg-card border-2 border-accent/40 rounded-2xl p-8">
            <div className="text-5xl font-extrabold text-text-primary mb-1">$39</div>
            <div className="text-text-muted text-sm mb-8">per month</div>

            <ul className="space-y-3 text-sm text-left mb-8">
              {[
                '21-day free trial',
                'No contracts — cancel anytime',
                'Unlimited promises',
                'Unlimited team members',
                'Email reminders and escalations',
                'Dashboard for your whole team',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-text-secondary">
                  <span className="text-accent font-bold text-base leading-none">✓</span>
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

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-muted">
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
