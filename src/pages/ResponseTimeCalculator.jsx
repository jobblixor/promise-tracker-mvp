import { useState, useEffect } from 'react';

const TRADE_DEFAULTS = {
  plumbing: { label: 'Plumbing', jobValue: 315, leadsPerWeek: 15, bookingRate: 0.43 },
  hvac: { label: 'HVAC', jobValue: 1400, leadsPerWeek: 12, bookingRate: 0.38 },
  electrical: { label: 'Electrical', jobValue: 400, leadsPerWeek: 14, bookingRate: 0.41 },
  roofing: { label: 'Roofing', jobValue: 8000, leadsPerWeek: 8, bookingRate: 0.35 },
  auto: { label: 'Auto Repair', jobValue: 1000, leadsPerWeek: 20, bookingRate: 0.40 },
  lawn: { label: 'Lawn Care', jobValue: 65, leadsPerWeek: 25, bookingRate: 0.45 },
  cleaning: { label: 'House Cleaning', jobValue: 180, leadsPerWeek: 18, bookingRate: 0.42 },
  painting: { label: 'Painting', jobValue: 3500, leadsPerWeek: 8, bookingRate: 0.35 },
  other: { label: 'Other Trade', jobValue: 500, leadsPerWeek: 15, bookingRate: 0.38 }
};

const RESPONSE_TIMES = [
  { key: 'under5', label: 'Under 5 minutes', retention: 0.95 },
  { key: '5to30', label: '5–30 minutes', retention: 0.80 },
  { key: '1hour', label: 'About 1 hour', retention: 0.55 },
  { key: '4hours', label: '4 hours', retention: 0.30 },
  { key: 'sameday', label: 'Same day (8+ hours)', retention: 0.15 },
  { key: 'nextday', label: 'Next day or later', retention: 0.05 }
];

const OPTIMAL_RETENTION = 0.95;

const FAQ_DATA = [
  {
    q: 'How fast should a service business respond to leads?',
    a: 'Research from the Harvard Business Review found that firms responding within one hour were nearly 7x more likely to have a meaningful conversation with a decision-maker. For home service businesses, the goal should be under 5 minutes — especially on shared-lead platforms like Angi or Thumbtack where multiple contractors receive the same lead simultaneously.'
  },
  {
    q: 'What percentage of calls to service businesses go unanswered?',
    a: 'According to Invoca\'s research, roughly 27% of inbound calls to home service businesses go unanswered. On weekends, ServiceTitan data shows this jumps to about 41%. Each missed call costs an estimated $1,200 on average in lost revenue.'
  },
  {
    q: 'Do customers leave voicemails when they can\'t reach a service business?',
    a: 'Almost never. Invoca\'s platform data shows that fewer than 3% of callers who get pushed to voicemail actually leave a message. About 85% of callers who reach voicemail never call back — they call a competitor instead.'
  },
  {
    q: 'How much revenue do contractors lose from slow response times?',
    a: 'Estimates from research across 1,200+ contractors in HVAC, plumbing, electrical, and general contracting suggest annual losses of $45,000 to $120,000 from unanswered calls and slow callbacks. High-ticket trades like HVAC and roofing can lose over $200,000 per year.'
  },
  {
    q: 'What is the speed to lead rule?',
    a: 'The "speed to lead" concept comes from a 2007 MIT study that found the odds of contacting a lead drop 100x if you wait 30 minutes instead of calling within 5 minutes. The odds of qualifying that lead drop 21x. For service businesses, this means the first contractor to respond usually wins the job.'
  },
  {
    q: 'What is a good booking rate for service businesses?',
    a: 'According to ServiceTitan data, booking rates for answered calls range from 31% for garage door and water treatment to 43% for plumbing, with HVAC at 38% and electrical at 41%. If your booking rate is below 38%, you may be losing profitable leads early in the process.'
  },
  {
    q: 'How can I respond to leads faster?',
    a: 'The most effective quick wins include: missed-call text-back automation that fires an SMS within 30–60 seconds, after-hours answering coverage for evenings and weekends, instant alerts for website form submissions, and a follow-up tracking system so no callback promise gets forgotten. Promise Tracker handles the last one automatically.'
  },
  {
    q: 'Does response time matter more than price?',
    a: 'For urgent and semi-urgent service needs, research consistently shows that speed beats price. Over 55% of home service customers expect a response within one hour, and 28% expect an immediate reply, according to the Jobber 2026 Home Service Trends Report. Customers will pay more for the contractor who responds first because they want the problem solved now.'
  }
];

export default function ResponseTimeCalculator() {
  const [trade, setTrade] = useState('plumbing');
  const [jobValue, setJobValue] = useState(TRADE_DEFAULTS.plumbing.jobValue);
  const [leadsPerWeek, setLeadsPerWeek] = useState(TRADE_DEFAULTS.plumbing.leadsPerWeek);
  const [responseTime, setResponseTime] = useState('1hour');
  const [showLifetime, setShowLifetime] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }, []);

  const handleTradeChange = (newTrade) => {
    setTrade(newTrade);
    const defaults = TRADE_DEFAULTS[newTrade];
    setJobValue(defaults.jobValue);
    setLeadsPerWeek(defaults.leadsPerWeek);
    setCalculated(false);
  };

  const currentRetention = RESPONSE_TIMES.find(r => r.key === responseTime)?.retention || 0.55;
  const bookingRate = TRADE_DEFAULTS[trade]?.bookingRate || 0.38;

  const currentWeeklyRevenue = leadsPerWeek * currentRetention * bookingRate * jobValue;
  const optimalWeeklyRevenue = leadsPerWeek * OPTIMAL_RETENTION * bookingRate * jobValue;
  const lostWeeklyRevenue = optimalWeeklyRevenue - currentWeeklyRevenue;
  const lostMonthlyRevenue = lostWeeklyRevenue * 4.33;
  const lostYearlyRevenue = lostWeeklyRevenue * 52;
  const jobsLostPerMonth = Math.round(leadsPerWeek * (OPTIMAL_RETENTION - currentRetention) * bookingRate * 4.33);

  const lifetimeMultiplier = 5.4;
  const displayYearly = showLifetime ? Math.round(lostYearlyRevenue * lifetimeMultiplier) : Math.round(lostYearlyRevenue);
  const displayMonthly = showLifetime ? Math.round(lostMonthlyRevenue * lifetimeMultiplier) : Math.round(lostMonthlyRevenue);

  const currentResponseLabel = RESPONSE_TIMES.find(r => r.key === responseTime)?.label || '';
  const capturePercent = Math.round((currentRetention / OPTIMAL_RETENTION) * 100);
  const leakPercent = 100 - capturePercent;

  const handleCalculate = () => setCalculated(true);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <span style={{ fontSize: '20px' }}>✓</span>
          <span style={{ fontWeight: 700, fontSize: '18px', color: '#0f172a' }}>Promise Tracker</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="/free-tools" style={{ color: '#475569', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Free Tools</a>
          <a href="/blog" style={{ color: '#475569', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Blogs</a>
          <a href="/signin" style={{ color: '#475569', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Sign In</a>
          <a href="/signup" style={{ backgroundColor: '#16a34a', color: '#ffffff', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Start Free Trial</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '48px 24px 32px' }}>
        <span style={{ display: 'inline-block', backgroundColor: '#f0fdf4', color: '#16a34a', fontSize: '13px', fontWeight: 600, padding: '4px 12px', borderRadius: '999px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>Free Calculator</span>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', lineHeight: 1.2 }}>How Much Are Slow Response Times Costing You?</h1>
        <p style={{ fontSize: '17px', color: '#475569', maxWidth: '620px', margin: '0 auto', lineHeight: 1.6 }}>
          Research shows the first contractor to respond wins the job. Enter your numbers to see how much revenue you're leaving on the table.
        </p>
      </div>

      {/* Stats Banner */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', padding: '0 24px 40px', maxWidth: '800px', margin: '0 auto' }}>
        {[
          { stat: '7x', desc: 'more likely to qualify a lead by responding within 1 hour', source: 'Harvard Business Review, 2011' },
          { stat: '27%', desc: 'of home service calls go completely unanswered', source: 'Invoca Research' },
          { stat: '<3%', desc: 'of callers sent to voicemail actually leave a message', source: 'Invoca Platform Data' }
        ].map((item, i) => (
          <div key={i} style={{ flex: '1 1 200px', textAlign: 'center', padding: '20px 16px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#dc2626', marginBottom: '6px' }}>{item.stat}</div>
            <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.4, marginBottom: '4px' }}>{item.desc}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>{item.source}</div>
          </div>
        ))}
      </div>

      {/* Calculator */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 64px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Input Panel */}
        <div style={{ flex: '1 1 380px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '24px' }}>Enter Your Numbers</h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Your trade</label>
            <select value={trade} onChange={(e) => handleTradeChange(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', color: '#0f172a', backgroundColor: '#ffffff' }}>
              {Object.entries(TRADE_DEFAULTS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Average job / ticket value ($)</label>
            <input type="number" value={jobValue} onChange={(e) => { setJobValue(Number(e.target.value)); setCalculated(false); }} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', color: '#0f172a', boxSizing: 'border-box' }} />
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Typical for {TRADE_DEFAULTS[trade]?.label.toLowerCase()} — edit to match your business</span>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Leads / inquiries per week</label>
            <input type="number" value={leadsPerWeek} onChange={(e) => { setLeadsPerWeek(Number(e.target.value)); setCalculated(false); }} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', color: '#0f172a', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>How fast do you usually respond?</label>
            <select value={responseTime} onChange={(e) => { setResponseTime(e.target.value); setCalculated(false); }} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', color: '#0f172a', backgroundColor: '#ffffff' }}>
              {RESPONSE_TIMES.map(rt => (
                <option key={rt.key} value={rt.key}>{rt.label}</option>
              ))}
            </select>
          </div>

          <button onClick={handleCalculate} style={{ width: '100%', padding: '14px', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', marginTop: '8px' }}>
            Calculate My Lost Revenue
          </button>
        </div>

        {/* Results Panel */}
        <div style={{ flex: '1 1 380px', backgroundColor: calculated ? '#ffffff' : '#f8fafc', borderRadius: '12px', border: `1px solid ${calculated ? '#e2e8f0' : '#e2e8f0'}`, padding: '28px', boxShadow: calculated ? '0 1px 3px rgba(0,0,0,0.06)' : 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {!calculated ? (
            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>⏱️</div>
              <p style={{ fontSize: '16px' }}>Enter your numbers and hit calculate to see your results</p>
            </div>
          ) : responseTime === 'under5' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏆</div>
              <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#16a34a', marginBottom: '8px' }}>You're Already Fast</h3>
              <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6 }}>
                Responding under 5 minutes puts you ahead of 63% of businesses. Keep it up — and make sure every callback promise gets followed through too.
              </p>
              <a href="/signup" style={{ display: 'inline-block', marginTop: '20px', padding: '12px 24px', backgroundColor: '#16a34a', color: '#ffffff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>
                Start Free Trial — $39/month
              </a>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>You're leaving on the table</p>
                <div style={{ fontSize: '48px', fontWeight: 800, color: '#dc2626' }}>
                  ${displayMonthly.toLocaleString()}
                  <span style={{ fontSize: '18px', fontWeight: 500, color: '#94a3b8' }}>/mo</span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#dc2626', marginTop: '4px' }}>
                  ${displayYearly.toLocaleString()}
                  <span style={{ fontSize: '16px', fontWeight: 500, color: '#94a3b8' }}>/yr</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px', padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#dc2626' }}>{jobsLostPerMonth}</div>
                  <div style={{ fontSize: '13px', color: '#991b1b' }}>jobs lost/month</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#dc2626' }}>{leakPercent}%</div>
                  <div style={{ fontSize: '13px', color: '#991b1b' }}>of leads going cold</div>
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bbf7d0' }}>
                <p style={{ fontSize: '14px', color: '#166534', lineHeight: 1.5, margin: 0 }}>
                  At <strong>{currentResponseLabel}</strong>, you're capturing about <strong>{capturePercent}%</strong> of your potential leads. Responding under 5 minutes could recover <strong>${Math.round(lostWeeklyRevenue).toLocaleString()}/week</strong> in lost revenue.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input type="checkbox" id="clv" checked={showLifetime} onChange={() => setShowLifetime(!showLifetime)} style={{ width: '16px', height: '16px' }} />
                <label htmlFor="clv" style={{ fontSize: '14px', color: '#475569', cursor: 'pointer' }}>
                  Show 5-year customer lifetime value (avg 5.4x single job)
                </label>
              </div>

              <a href="/signup" style={{ display: 'block', textAlign: 'center', padding: '14px', backgroundColor: '#16a34a', color: '#ffffff', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '16px' }}>
                Start Free Trial — $39/month
              </a>
              <p style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginTop: '8px' }}>
                Promise Tracker reminds your team to follow up on every promise — so no lead goes cold.
              </p>
            </>
          )}
        </div>
      </div>

      {/* How It Works / Methodology */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 64px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', textAlign: 'center' }}>How This Calculator Works</h2>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '28px', lineHeight: 1.7, color: '#334155', fontSize: '15px' }}>
          <p style={{ marginBottom: '16px' }}>
            This calculator estimates revenue lost from slow response times based on two landmark studies and home-service industry data.
          </p>
          <p style={{ marginBottom: '16px' }}>
            <strong>The Harvard Business Review (2011)</strong> studied 1.25 million leads and found that firms responding within one hour were nearly 7x more likely to qualify a lead than those waiting even an hour later, and more than 60x more likely than firms waiting 24+ hours. A separate audit of 2,241 U.S. companies found the average response time was 42 hours, and 23% never responded at all.
          </p>
          <p style={{ marginBottom: '16px' }}>
            <strong>The MIT / InsideSales.com study (2007)</strong> analyzed 15,000+ leads and 100,000+ call attempts over three years and found the odds of contacting a lead drop 100x when waiting 30 minutes instead of 5, with qualification odds dropping 21x.
          </p>
          <p style={{ marginBottom: '16px' }}>
            For home-service businesses specifically, <strong>Invoca</strong> found that 27% of inbound calls go unanswered, each missed call costs about $1,200 on average, and fewer than 3% of callers pushed to voicemail leave a message. <strong>ServiceTitan</strong> data shows 18% of calls go unanswered on weekdays, rising to 41% on weekends.
          </p>
          <p style={{ margin: 0 }}>
            The calculator applies a lead-retention decay curve based on these studies. Trade-specific booking rates come from ServiceTitan (ranging from 31–43% for answered calls). All defaults are editable. Results are estimates — your actual numbers depend on your market, your competition, and the quality of your leads.
          </p>
        </div>
      </div>

      {/* Response Time Benchmarks */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 64px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', textAlign: 'center' }}>Response Time Benchmarks for Service Businesses</h2>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {[
            { time: 'Under 5 minutes', status: '🟢', desc: 'You\'re ahead of 63% of businesses. Maximizes conversion.', color: '#16a34a' },
            { time: '5–30 minutes', status: '🟡', desc: 'Still competitive, but you\'re losing ~15-20% of viable leads.', color: '#ca8a04' },
            { time: '1 hour', status: '🟠', desc: 'You\'re 7x less likely to qualify a lead (HBR). Significant leakage.', color: '#ea580c' },
            { time: '4 hours', status: '🔴', desc: 'Most urgent leads have already booked a competitor by now.', color: '#dc2626' },
            { time: 'Same day (8+ hrs)', status: '🔴', desc: 'You\'re capturing only ~15% of potential leads. Major revenue leak.', color: '#dc2626' },
            { time: 'Next day or later', status: '⛔', desc: '60x less likely to qualify (HBR). Nearly all leads are gone.', color: '#991b1b' }
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', borderBottom: i < 5 ? '1px solid #f1f5f9' : 'none' }}>
              <span style={{ fontSize: '20px' }}>{row.status}</span>
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '15px' }}>{row.time}</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{row.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Wins Section */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 64px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', textAlign: 'center' }}>How to Respond Faster (Without Hiring Anyone)</h2>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '28px', lineHeight: 1.7, color: '#334155', fontSize: '15px' }}>
          <p style={{ marginBottom: '16px' }}>
            <strong>1. Missed-call text-back.</strong> Auto-send an SMS within 30–60 seconds of a missed call. Text messages have roughly a 90–98% open rate compared to about 29% for email. This single fix can recover up to 30% of missed calls.
          </p>
          <p style={{ marginBottom: '16px' }}>
            <strong>2. Instant lead alerts.</strong> Make sure website forms and platform leads (Angi, Thumbtack, Google Local Services) trigger a real-time push notification to your phone — not just an email you'll check in 3 hours.
          </p>
          <p style={{ marginBottom: '16px' }}>
            <strong>3. After-hours coverage.</strong> A large share of home-service calls arrive outside business hours, and those emergency calls are the highest-value. Even a simple auto-reply text saying "Got your message, we'll call you back by 8am" keeps the lead warm.
          </p>
          <p style={{ marginBottom: '16px' }}>
            <strong>4. Follow-up tracking.</strong> Speed to first response is half the battle. The other half is keeping every callback promise you make. If you tell a customer "I'll call you Friday with that estimate," you need a system that reminds you on Friday — not your memory.
          </p>
          <p style={{ margin: 0 }}>
            <strong>Promise Tracker</strong> handles #4 automatically. Text your promise to one number, get reminded before it's due, and get escalating alerts if you forget. <a href="/signup" style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>Try it free for 30 days →</a>
          </p>
        </div>
      </div>

      {/* Cross Links */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '12px', textAlign: 'center' }}>More Free Tools & Guides</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'Quote Follow-Up Revenue Calculator', href: '/calculator' },
            { label: 'Follow-Up Text Templates', href: '/follow-up-text-templates' },
            { label: 'Quote Follow-Up Checklist', href: '/follow-up-checklist' },
            { label: 'How to Follow Up Without Being Annoying', href: '/blog/how-to-follow-up-on-a-quote' },
            { label: 'What to Do When a Customer Ghosts', href: '/blog/what-to-do-when-customer-ghosts-estimate' },
            { label: 'How to Increase Your Close Rate', href: '/blog/how-to-increase-quote-close-rate' }
          ].map((link, i) => (
            <a key={i} href={link.href} style={{ padding: '8px 16px', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 500, border: '1px solid #bbf7d0' }}>
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 64px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', textAlign: 'center' }}>Frequently Asked Questions</h2>
        {FAQ_DATA.map((faq, i) => (
          <div key={i} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', borderRadius: i === 0 ? '12px 12px 0 0' : i === FAQ_DATA.length - 1 ? '0 0 12px 12px' : '0', border: '1px solid #e2e8f0', borderTop: i > 0 ? 'none' : '1px solid #e2e8f0' }}>
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', paddingRight: '16px' }}>{faq.q}</span>
              <span style={{ fontSize: '18px', color: '#94a3b8', flexShrink: 0, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
            </button>
            {openFaq === i && (
              <div style={{ padding: '0 20px 16px', fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '48px 24px 64px', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Want to automate your response follow-ups entirely?</h2>
        <p style={{ fontSize: '16px', color: '#475569', maxWidth: '520px', margin: '0 auto 24px', lineHeight: 1.5 }}>
          Promise Tracker is an SMS-based promise tracking tool for service businesses. Text your promises, get reminded before they're due, never drop the ball.
        </p>
        <a href="/signup" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: '#16a34a', color: '#ffffff', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '16px' }}>
          Start Your 30-Day Free Trial
        </a>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '24px', borderTop: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '13px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <span>© 2026 Promise Tracker</span>
          <a href="mailto:support@promisetracker.app" style={{ color: '#94a3b8', textDecoration: 'none' }}>support@promisetracker.app</a>
          <a href="/terms" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms</a>
          <a href="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy</a>
        </div>
      </footer>

      {/* FAQ Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQ_DATA.map(faq => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": { "@type": "Answer", "text": faq.a }
        }))
      })}} />
    </div>
  );
}