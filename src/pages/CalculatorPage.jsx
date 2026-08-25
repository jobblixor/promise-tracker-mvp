import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const STATS = [
  {
    value: '78%',
    text: 'of customers buy from the first business that responds',
    source: 'Lead Connect, 2020',
  },
  {
    value: '21×',
    text: 'more likely to qualify a lead if you respond within 5 minutes vs. 30',
    source: 'MIT / InsideSales.com (Dr. James Oldroyd)',
  },
  {
    value: '44%',
    text: 'of salespeople give up after just one follow-up attempt',
    source: 'RAIN Group / GrowthList',
  },
  {
    value: '$400–500',
    text: 'fully-loaded cost to generate a single quote for a home-service business',
    source: 'Jobber Academy (Daniel Dixon)',
  },
];

const FAQS = [
  {
    q: 'How is the lost revenue calculated?',
    a: 'We take your unfollowed quotes per month (weekly quotes × 4.33 × your no-follow-up percentage), then multiply by your normal close rate and average job value. This represents the revenue you could recover by simply following up on every quote.',
  },
  {
    q: 'Is this really how much I\'m losing?',
    a: 'This is an estimate based on your inputs. The real number depends on many factors — but research consistently shows that businesses lose 20–40% of potential revenue from poor follow-up. Most owners are surprised by how much it adds up.',
  },
  {
    q: 'How many times should I follow up on a quote?',
    a: 'Research from RAIN Group shows 80% of sales require 5–12 follow-up touches after initial contact, yet most businesses stop after one or two. A simple system of 3–5 follow-ups over 2 weeks can dramatically improve your close rate.',
  },
  {
    q: 'What\'s the easiest way to fix this?',
    a: 'The simplest approach is to track every quote you send and set reminders to follow up. Promise Tracker automates this — text a promise to your Promise Tracker number and it sends escalating SMS and email reminders until you get a yes or no. No more quotes falling through the cracks.',
  },
  {
    q: 'Does follow-up speed really matter that much?',
    a: 'Yes. The MIT Lead Response Study found that contacting a lead within 5 minutes makes you 21 times more likely to qualify them compared to waiting 30 minutes. For service businesses, speed is often the difference between winning and losing the job.',
  },
];

function formatCurrency(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function CalculatorPage() {
  const [avgJob, setAvgJob] = useState(500);
  const [quotesPerWeek, setQuotesPerWeek] = useState(15);
  const [closeRate, setCloseRate] = useState(40);
  const [noFollowUp, setNoFollowUp] = useState(30);
  const [showResults, setShowResults] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    // Force light mode on this public SEO page; restore user preference on unmount
    const savedTheme = localStorage.getItem('theme');
    document.documentElement.classList.remove('dark');
    return () => {
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

  useEffect(() => {
    document.title = 'Free Quote Follow-Up Revenue Calculator | Promise Tracker';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Find out how much revenue your service business loses from unfollowed quotes. Free calculator — no signup required.');
    } else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = 'Find out how much revenue your service business loses from unfollowed quotes. Free calculator — no signup required.';
      document.head.appendChild(m);
    }
  }, []);

  const monthlyQuotes = quotesPerWeek * 4.33;
  const unfollowedMonthly = monthlyQuotes * (noFollowUp / 100);
  const lostMonthly = unfollowedMonthly * (closeRate / 100) * avgJob;
  const lostYearly = Math.round(lostMonthly) * 12;
  const costPerLostQuote = avgJob * (closeRate / 100);

  function handleCalculate(e) {
    e.preventDefault();
    setShowResults(true);
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-gray-900 no-underline">
            <Logo size={28} />
            <span className="text-lg font-semibold">Promise Tracker</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/free-tools" className="text-sm text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5">Free Tools</Link>
            <Link to="/blog" className="text-sm text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5">Blogs</Link>
            <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5">Sign In</Link>
            <Link to="/signup?ref=calculator" className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero + Calculator ────────────────────────────────── */}
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            How Much Revenue Are You Losing From Unfollowed Quotes?
          </h1>
          <p className="mx-auto max-w-2xl text-gray-500">
            Most service businesses never follow up on 20–40% of the quotes they send.
            This free calculator shows you exactly what that costs — in real dollars.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* ── Inputs ──────────────────────────────────────── */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">Enter Your Numbers</h2>
            <form onSubmit={handleCalculate} className="space-y-5">
              <InputGroup
                label="Average job / ticket value"
                prefix="$"
                value={avgJob}
                onChange={setAvgJob}
                min={0}
                max={100000}
              />
              <InputGroup
                label="Quotes or estimates sent per week"
                value={quotesPerWeek}
                onChange={setQuotesPerWeek}
                min={0}
                max={500}
              />
              <SliderGroup
                label="Your current quote-to-close rate"
                value={closeRate}
                onChange={setCloseRate}
                suffix="%"
              />
              <SliderGroup
                label="Quotes you never follow up on"
                value={noFollowUp}
                onChange={setNoFollowUp}
                suffix="%"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-green-600 py-3 text-base font-semibold text-white transition hover:bg-green-700"
              >
                Calculate My Lost Revenue
              </button>
            </form>
          </div>

          {/* ── Results ─────────────────────────────────────── */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            {!showResults ? (
              <div className="text-center text-gray-400">
                <svg className="mx-auto mb-3 h-12 w-12 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm2.25-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm2.25-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm2.25-6.75h.008v.008H15v-.008Zm0 2.25h.008v.008H15v-.008ZM9.75 3v1.5m4.5-1.5v1.5M5.25 7.5h13.5m-13.5 0A2.25 2.25 0 0 0 3 9.75v8.25A2.25 2.25 0 0 0 5.25 20.25h13.5A2.25 2.25 0 0 0 21 18V9.75a2.25 2.25 0 0 0-2.25-2.25H5.25Z" />
                </svg>
                <p className="text-sm">Enter your numbers and hit calculate</p>
              </div>
            ) : (
              <div className="w-full space-y-6 text-center">
                <div>
                  <p className="mb-1 text-sm font-medium uppercase tracking-wider text-gray-400">
                    You're leaving on the table each month
                  </p>
                  <p className="text-5xl font-extrabold text-red-600">
                    {formatCurrency(lostMonthly)}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm font-medium uppercase tracking-wider text-gray-400">
                    That's per year
                  </p>
                  <p className="text-4xl font-bold text-red-500">
                    {formatCurrency(lostYearly)}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">
                    You're sending about <strong className="text-gray-900">{unfollowedMonthly > 0 && unfollowedMonthly < 1 ? unfollowedMonthly.toFixed(1) : Math.round(unfollowedMonthly)}</strong> quotes per month
                    with no follow-up. Each one represents <strong className="text-gray-900">{formatCurrency(costPerLostQuote)}</strong> in potential revenue.
                  </p>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="mb-3 text-sm text-gray-600">
                    Text your promises to Promise Tracker and it automatically reminds your team to follow up — with escalating SMS and email reminders — until you get a yes or no.
                  </p>
                  <Link
                    to="/signup?ref=calculator"
                    className="inline-block rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    Start Free Trial — $39/mo
                  </Link>
                  <p className="mt-2 text-xs text-gray-400">
                    That's {formatCurrency(39)} to recover up to {formatCurrency(lostMonthly)}/mo. No contracts.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Stats Bar ──────────────────────────────────────── */}
        <section className="mt-16">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
            The Follow-Up Problem, in Numbers
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
                <p className="mb-1 text-3xl font-extrabold text-green-600">{s.value}</p>
                <p className="mb-2 text-sm text-gray-600">{s.text}</p>
                <p className="text-xs text-gray-400 italic">— {s.source}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Long-form Content ──────────────────────────────── */}
        <section className="mx-auto mt-16 max-w-3xl space-y-6 text-gray-600 leading-relaxed">
          <h2 className="text-2xl font-bold text-gray-900">
            Why Following Up on Quotes Is the Easiest Revenue Win for Service Businesses
          </h2>
          <p>
            If you run a lawn care company, plumbing business, HVAC shop, cleaning service, or any home-service operation, you already know how much work goes into generating a lead. Between your Google Business Profile, word-of-mouth referrals, and advertising spend, getting a customer to request a quote can cost anywhere from $50 to $250 — before you even show up to give the estimate.
          </p>
          <p>
            Yet most service businesses have no system for following up on the quotes they send. The estimate goes out, the owner gets busy with the next job, and three days later the customer has already hired someone else. According to Jobber Academy, a single sent quote can represent $400–$500 in fully-loaded acquisition cost when you factor in marketing spend, drive time, and the estimator's labor. Every unfollowed quote is that investment walking out the door.
          </p>
          <p>
            The data is clear on how much speed matters. Research from MIT and InsideSales.com found that responding to a lead within five minutes makes you 21 times more likely to qualify that lead compared to waiting just 30 minutes. And a 2020 Lead Connect survey found that 78% of customers end up buying from whichever business responds first. In service industries where three or four companies are quoting the same job, the business that follows up fastest almost always wins.
          </p>
          <p>
            The most common objection is "I don't want to be annoying." But the research says the opposite — RAIN Group data shows that 80% of sales require 5 to 12 follow-up touches, yet 44% of salespeople quit after a single attempt. Following up isn't pushy. It's professional. It shows the customer you actually want their business.
          </p>
          <p>
            The fix doesn't require a massive CRM or a dedicated sales team. It requires a simple system that tracks which quotes are outstanding and reminds you to follow up. That's exactly what Promise Tracker does — text the promise to your Promise Tracker number and the system sends automatic reminders via SMS and email until you get a definitive answer. No more sticky notes, no more forgotten callbacks, no more revenue left on the table.
          </p>
        </section>

        {/* ── FAQ ────────────────────────────────────────────── */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-gray-900 transition hover:bg-gray-50"
                >
                  {f.q}
                  <span className="ml-3 shrink-0 text-gray-400">
                    {openFaq === i ? '−' : '+'}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="border-t border-gray-100 px-5 py-4 text-sm leading-relaxed text-gray-600">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ─────────────────────────────────────── */}
        <section className="mx-auto mt-16 mb-16 max-w-2xl rounded-xl border border-green-200 bg-green-50 p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">
            Stop Losing Revenue From Dropped Follow-Ups
          </h2>
          <p className="mb-5 text-gray-600">
            Text your promises in plain English. Promise Tracker parses them, sets reminders, and escalates before anything falls through the cracks. $39/month. No contracts.
          </p>
          <Link
            to="/signup?ref=calculator"
            className="inline-block rounded-lg bg-green-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-green-700"
          >
            Start Your Free Trial
          </Link>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-400">
        <div className="mx-auto max-w-5xl px-4">
          <p>© {new Date().getFullYear()} Promise Tracker. All rights reserved.</p>
          <div className="mt-2 flex justify-center gap-4">
            <Link to="/terms" className="transition hover:text-gray-600">Terms</Link>
            <Link to="/privacy" className="transition hover:text-gray-600">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────── */

function InputGroup({ label, prefix, value, onChange, min, max }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center rounded-lg border border-gray-300 bg-white focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
        {prefix && (
          <span className="pl-3 text-sm text-gray-400">{prefix}</span>
        )}
        <input
          type="number"
          value={String(value)}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v >= min && v <= max) onChange(v);
          }}
          className="w-full bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none"
          min={min}
          max={max}
        />
      </div>
    </div>
  );
}

function SliderGroup({ label, value, onChange, suffix }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-green-600">
          {value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-green-600"
      />
    </div>
  );
}