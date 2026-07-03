import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const TRADE_DEFAULTS = {
  plumbing:  { label: 'Plumbing',       jobValue: 315,  leadsPerWeek: 15, bookingRate: 0.43 },
  hvac:      { label: 'HVAC',           jobValue: 1400, leadsPerWeek: 12, bookingRate: 0.38 },
  electrical:{ label: 'Electrical',     jobValue: 400,  leadsPerWeek: 14, bookingRate: 0.41 },
  roofing:   { label: 'Roofing',        jobValue: 8000, leadsPerWeek: 8,  bookingRate: 0.35 },
  auto:      { label: 'Auto Repair',    jobValue: 1000, leadsPerWeek: 20, bookingRate: 0.40 },
  lawn:      { label: 'Lawn Care',      jobValue: 65,   leadsPerWeek: 25, bookingRate: 0.45 },
  cleaning:  { label: 'House Cleaning', jobValue: 180,  leadsPerWeek: 18, bookingRate: 0.42 },
  painting:  { label: 'Painting',       jobValue: 3500, leadsPerWeek: 8,  bookingRate: 0.35 },
  other:     { label: 'Other Trade',    jobValue: 500,  leadsPerWeek: 15, bookingRate: 0.38 },
};

const RESPONSE_TIMES = [
  { key: 'under5',  label: 'Under 5 minutes',      retention: 0.95 },
  { key: '5to30',   label: '5-30 minutes',          retention: 0.80 },
  { key: '1hour',   label: 'About 1 hour',          retention: 0.55 },
  { key: '4hours',  label: '4 hours',               retention: 0.30 },
  { key: 'sameday', label: 'Same day (8+ hours)',   retention: 0.15 },
  { key: 'nextday', label: 'Next day or later',     retention: 0.05 },
];

const OPTIMAL_RETENTION = 0.95;

const STATS = [
  { value: '7x',   text: 'more likely to qualify a lead by responding within 1 hour vs. later',   source: 'Harvard Business Review, 2011' },
  { value: '27%',  text: 'of inbound home service calls go completely unanswered',                 source: 'Invoca Research' },
  { value: '<3%',  text: 'of callers pushed to voicemail actually leave a message',                source: 'Invoca Platform Data' },
];

const FAQS = [
  {
    q: 'How fast should a service business respond to leads?',
    a: 'Research from the Harvard Business Review found that firms responding within one hour were nearly 7x more likely to have a meaningful conversation with a decision-maker. For home service businesses, the goal should be under 5 minutes -- especially on shared-lead platforms like Angi or Thumbtack where multiple contractors receive the same lead simultaneously.',
  },
  {
    q: 'What percentage of calls to service businesses go unanswered?',
    a: "According to Invoca's research, roughly 27% of inbound calls to home service businesses go unanswered. On weekends, ServiceTitan data shows this jumps to about 41%. Each missed call costs an estimated $1,200 on average in lost revenue.",
  },
  {
    q: "Do customers leave voicemails when they can't reach a service business?",
    a: "Almost never. Invoca's platform data shows that fewer than 3% of callers who get pushed to voicemail actually leave a message. About 85% of callers who reach voicemail never call back -- they call a competitor instead.",
  },
  {
    q: 'How much revenue do contractors lose from slow response times?',
    a: 'Estimates from research across 1,200+ contractors in HVAC, plumbing, electrical, and general contracting suggest annual losses of $45,000 to $120,000 from unanswered calls and slow callbacks. High-ticket trades like HVAC and roofing can lose over $200,000 per year.',
  },
  {
    q: 'What is the speed to lead rule?',
    a: 'The speed to lead concept comes from a 2007 MIT study that found the odds of contacting a lead drop 100x if you wait 30 minutes instead of calling within 5 minutes. The odds of qualifying that lead drop 21x. For service businesses, this means the first contractor to respond usually wins the job.',
  },
  {
    q: 'What is a good booking rate for service businesses?',
    a: 'According to ServiceTitan data, booking rates for answered calls range from 31% for garage door and water treatment to 43% for plumbing, with HVAC at 38% and electrical at 41%. If your booking rate is below 38%, you may be losing profitable leads early in the process.',
  },
  {
    q: 'How can I respond to leads faster?',
    a: 'The most effective quick wins include: missed-call text-back automation that fires an SMS within 30-60 seconds, after-hours answering coverage for evenings and weekends, instant alerts for website form submissions, and a follow-up tracking system so no callback promise gets forgotten. Promise Tracker handles the last one automatically.',
  },
  {
    q: 'Does response time matter more than price?',
    a: 'For urgent and semi-urgent service needs, research consistently shows that speed beats price. Over 55% of home service customers expect a response within one hour, and 28% expect an immediate reply, according to the Jobber 2026 Home Service Trends Report. Customers will pay more for the contractor who responds first because they want the problem solved now.',
  },
];

function formatCurrency(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function ResponseTimeCalculator() {
  const [trade, setTrade] = useState('plumbing');
  const [jobValue, setJobValue] = useState(TRADE_DEFAULTS.plumbing.jobValue);
  const [leadsPerWeek, setLeadsPerWeek] = useState(TRADE_DEFAULTS.plumbing.leadsPerWeek);
  const [responseTime, setResponseTime] = useState('1hour');
  const [showLifetime, setShowLifetime] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    document.documentElement.classList.remove('dark');
    return () => {
      if (savedTheme === 'dark') document.documentElement.classList.add('dark');
    };
  }, []);

  useEffect(() => {
    document.title = 'Free Response Time Cost Calculator | Promise Tracker';
    let meta = document.querySelector('meta[name="description"]');
    const content =
      'See how much slow response times are costing your service business -- with trade-specific benchmarks backed by Harvard Business Review and MIT research.';
    if (meta) {
      meta.setAttribute('content', content);
    } else {
      meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = content;
      document.head.appendChild(meta);
    }
  }, []);

  const handleTradeChange = (newTrade) => {
    setTrade(newTrade);
    const defaults = TRADE_DEFAULTS[newTrade];
    setJobValue(defaults.jobValue);
    setLeadsPerWeek(defaults.leadsPerWeek);
    setCalculated(false);
  };

  const currentRetention = RESPONSE_TIMES.find((r) => r.key === responseTime)?.retention ?? 0.55;
  const bookingRate = TRADE_DEFAULTS[trade]?.bookingRate ?? 0.38;

  const lostWeeklyRevenue  = leadsPerWeek * (OPTIMAL_RETENTION - currentRetention) * bookingRate * jobValue;
  const lostMonthlyRevenue = lostWeeklyRevenue * 4.33;
  const lostYearlyRevenue  = lostWeeklyRevenue * 52;
  const jobsLostPerMonth   = Math.round(leadsPerWeek * (OPTIMAL_RETENTION - currentRetention) * bookingRate * 4.33);

  const lifetimeMultiplier = 5.4;
  const displayMonthly = showLifetime ? Math.round(lostMonthlyRevenue * lifetimeMultiplier) : Math.round(lostMonthlyRevenue);
  const displayYearly  = showLifetime ? Math.round(lostYearlyRevenue  * lifetimeMultiplier) : Math.round(lostYearlyRevenue);

  const currentResponseLabel = RESPONSE_TIMES.find((r) => r.key === responseTime)?.label ?? '';
  const capturePercent = Math.round((currentRetention / OPTIMAL_RETENTION) * 100);
  const leakPercent    = 100 - capturePercent;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-gray-900 no-underline">
            <Logo size={28} />
            <span className="text-lg font-semibold">Promise Tracker</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/free-tools" className="text-sm text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5">Free Tools</Link>
            <Link to="/blog"       className="text-sm text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5">Blogs</Link>
            <Link to="/login"      className="text-sm text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5">Sign In</Link>
            <Link to="/signup"     className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            How Much Are Slow Response Times Costing You?
          </h1>
          <p className="mx-auto max-w-2xl text-gray-500">
            Research shows the first contractor to respond wins the job. Enter your numbers to see how much revenue you are leaving on the table.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">Enter Your Numbers</h2>
            <div className="space-y-5">
              <SelectGroup
                label="Your trade"
                value={trade}
                onChange={handleTradeChange}
                options={Object.entries(TRADE_DEFAULTS).map(([key, val]) => ({ value: key, label: val.label }))}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Average job / ticket value
                </label>
                <div className="flex items-center rounded-lg border border-gray-300 bg-white focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
                  <span className="pl-3 text-sm text-gray-400">$</span>
                  <input
                    type="number"
                    value={String(jobValue)}
                    onChange={(e) => { setJobValue(Number(e.target.value)); setCalculated(false); }}
                    className="w-full bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none"
                    min={0}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Typical for {TRADE_DEFAULTS[trade]?.label.toLowerCase()} -- edit to match your business
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Leads / inquiries per week
                </label>
                <div className="flex items-center rounded-lg border border-gray-300 bg-white focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
                  <input
                    type="number"
                    value={String(leadsPerWeek)}
                    onChange={(e) => { setLeadsPerWeek(Number(e.target.value)); setCalculated(false); }}
                    className="w-full bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none"
                    min={0}
                  />
                </div>
              </div>
              <SelectGroup
                label="How fast do you usually respond?"
                value={responseTime}
                onChange={(v) => { setResponseTime(v); setCalculated(false); }}
                options={RESPONSE_TIMES.map((rt) => ({ value: rt.key, label: rt.label }))}
              />
              <button
                onClick={() => setCalculated(true)}
                className="w-full rounded-lg bg-green-600 py-3 text-base font-semibold text-white transition hover:bg-green-700"
              >
                Calculate My Lost Revenue
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            {!calculated ? (
              <div className="text-center text-gray-400">
                <svg className="mx-auto mb-3 h-12 w-12 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <p className="text-sm">Enter your numbers and hit calculate</p>
              </div>
            ) : responseTime === 'under5' ? (
              <div className="w-full space-y-4 text-center">
                <p className="text-5xl">🏆</p>
                <h3 className="text-2xl font-bold text-green-600">You are Already Fast</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Responding under 5 minutes puts you ahead of 63% of businesses. Keep it up -- and make sure every callback promise gets followed through too.
                </p>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <Link
                    to="/signup"
                    className="inline-block rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    Start Free Trial -- $39/mo
                  </Link>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-5 text-center">
                <div>
                  <p className="mb-1 text-sm font-medium uppercase tracking-wider text-gray-400">
                    You are leaving on the table each month
                  </p>
                  <p className="text-5xl font-extrabold text-red-600">
                    {formatCurrency(displayMonthly)}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm font-medium uppercase tracking-wider text-gray-400">
                    That is per year
                  </p>
                  <p className="text-4xl font-bold text-red-500">
                    {formatCurrency(displayYearly)}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-left">
                  <div className="flex justify-around mb-3">
                    <div className="text-center">
                      <p className="text-2xl font-extrabold text-red-600">{jobsLostPerMonth}</p>
                      <p className="text-xs text-gray-500">jobs lost/month</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-extrabold text-red-600">{leakPercent}%</p>
                      <p className="text-xs text-gray-500">of leads going cold</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    At <strong className="text-gray-900">{currentResponseLabel}</strong>, you are capturing about{' '}
                    <strong className="text-gray-900">{capturePercent}%</strong> of your potential leads. Responding under 5 minutes could recover{' '}
                    <strong className="text-gray-900">{formatCurrency(Math.round(lostWeeklyRevenue))}/week</strong> in lost revenue.
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer justify-center">
                  <input
                    type="checkbox"
                    checked={showLifetime}
                    onChange={() => setShowLifetime(!showLifetime)}
                    className="accent-green-600"
                  />
                  Show 5-year customer lifetime value (avg 5.4x single job)
                </label>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="mb-3 text-sm text-gray-600">
                    Promise Tracker reminds your team to follow up on every promise -- so no lead goes cold.
                  </p>
                  <Link
                    to="/signup"
                    className="inline-block rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    Start Free Trial -- $39/mo
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <section className="mt-16">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
            The Response Time Problem, in Numbers
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {STATS.map((s, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
                <p className="mb-1 text-3xl font-extrabold text-green-600">{s.value}</p>
                <p className="mb-2 text-sm text-gray-600">{s.text}</p>
                <p className="text-xs text-gray-400 italic">-- {s.source}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-3xl space-y-6 text-gray-600 leading-relaxed">
          <h2 className="text-2xl font-bold text-gray-900">
            Why Response Speed Is the Biggest Revenue Lever for Service Businesses
          </h2>
          <p>
            If you run a plumbing, HVAC, electrical, roofing, or lawn care business, you are competing on shared-lead platforms where three or four contractors receive the exact same inquiry at the same moment. The research is unambiguous: the first business to respond wins the job. A 2011 Harvard Business Review study of 1.25 million leads found that firms responding within one hour were nearly 7x more likely to qualify a lead than those waiting even a little longer. A separate MIT study found the odds of contact drop 100x if you wait 30 minutes instead of 5.
          </p>
          <p>
            Yet the average response time across U.S. service businesses is closer to 47 hours -- and 23% of companies never respond at all. Invoca's platform data shows 27% of inbound calls go completely unanswered, jumping to 41% on weekends. Each of those missed calls represents real money: Invoca estimates the average missed service call costs $1,200 in lost revenue.
          </p>
          <p>
            The voicemail trap makes it worse. Fewer than 3% of callers sent to voicemail leave a message. The other 97% simply call the next business on their list. By the time you listen to a voicemail -- if it even gets left -- the customer has usually already booked someone else.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">
            Response Time Benchmarks by Time Window
          </h2>
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            {[
              { time: 'Under 5 minutes',     icon: '🟢', desc: 'You are ahead of 63% of businesses. Maximizes conversion.' },
              { time: '5-30 minutes',         icon: '🟡', desc: 'Still competitive, but you are losing 15-20% of viable leads.' },
              { time: 'About 1 hour',         icon: '🟠', desc: 'You are 7x less likely to qualify a lead (HBR). Significant leakage.' },
              { time: '4 hours',              icon: '🔴', desc: 'Most urgent leads have already booked a competitor by now.' },
              { time: 'Same day (8+ hours)',  icon: '🔴', desc: 'You are capturing only ~15% of potential leads. Major revenue leak.' },
              { time: 'Next day or later',    icon: '⛔', desc: '60x less likely to qualify (HBR). Nearly all leads are gone.' },
            ].map((row, i, arr) => (
              <div
                key={i}
                className={"flex items-start gap-4 px-5 py-4" + (i < arr.length - 1 ? " border-b border-gray-100" : "")}
              >
                <span className="text-xl mt-0.5">{row.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{row.time}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{row.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            How to Respond Faster (Without Hiring Anyone)
          </h2>
          <p>
            <strong className="text-gray-900">1. Missed-call text-back.</strong> Auto-send an SMS within 30-60 seconds of a missed call. Text messages have roughly a 90-98% open rate compared to about 29% for email. This single fix can recover up to 30% of missed calls.
          </p>
          <p>
            <strong className="text-gray-900">2. Instant lead alerts.</strong> Make sure website forms and platform leads (Angi, Thumbtack, Google Local Services) trigger a real-time push notification -- not just an email you will check in 3 hours.
          </p>
          <p>
            <strong className="text-gray-900">3. After-hours coverage.</strong> A large share of home-service calls arrive outside business hours, and emergency calls are the highest-value. Even a simple auto-reply text saying "Got your message, we will call you back by 8am" keeps the lead warm.
          </p>
          <p>
            <strong className="text-gray-900">4. Follow-up tracking.</strong> Speed to first response is half the battle. The other half is keeping every callback promise you make. If you tell a customer "I will call you Friday with that estimate," you need a system that reminds you on Friday -- not your memory. Promise Tracker handles this automatically.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">How This Calculator Works</h2>
          <p>
            This calculator estimates revenue lost from slow response times using a lead-retention decay curve based on the Harvard Business Review (2011) and MIT / InsideSales.com (2007) studies. Trade-specific booking rates come from ServiceTitan, ranging from 31-43% for answered calls. All defaults are editable -- your actual numbers depend on your market, competition, and lead quality.
          </p>
        </section>

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
                    {openFaq === i ? '-' : '+'}
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

        <section className="mx-auto mt-16 mb-16 max-w-2xl rounded-xl border border-green-200 bg-green-50 p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">
            Want to Automate Your Response Follow-Ups Entirely?
          </h2>
          <p className="mb-5 text-gray-600">
            Promise Tracker is an SMS-based promise tracking tool for service businesses. Text your promises, get reminded before they are due, never drop the ball. Set it up in 5 minutes. $39/month. No contracts.
          </p>
          <Link
            to="/signup"
            className="inline-block rounded-lg bg-green-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-green-700"
          >
            Start Your Free Trial
          </Link>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-400">
        <div className="mx-auto max-w-5xl px-4">
          <p>© {new Date().getFullYear()} Promise Tracker. All rights reserved.</p>
          <div className="mt-2 flex justify-center gap-4">
            <Link to="/terms"   className="transition hover:text-gray-600">Terms</Link>
            <Link to="/privacy" className="transition hover:text-gray-600">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SelectGroup({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
