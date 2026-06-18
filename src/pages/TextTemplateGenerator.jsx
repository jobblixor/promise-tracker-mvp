import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const TRADES = [
  { id: 'lawn', label: 'Lawn Care', service: 'lawn care', job: 'yard work' },
  { id: 'plumbing', label: 'Plumbing', service: 'plumbing', job: 'repair' },
  { id: 'hvac', label: 'HVAC', service: 'HVAC', job: 'system service' },
  { id: 'cleaning', label: 'Cleaning', service: 'cleaning', job: 'cleaning' },
  { id: 'salon', label: 'Salon / Barbershop', service: 'salon', job: 'appointment' },
  { id: 'auto', label: 'Auto Repair', service: 'auto repair', job: 'vehicle repair' },
  { id: 'contractor', label: 'General Contractor', service: 'contracting', job: 'project' },
];

const SITUATIONS = [
  { id: 'estimate_day2', label: 'Estimate Follow-Up (Day 1-2)', group: 'Estimate Follow-Up' },
  { id: 'estimate_day7', label: 'Estimate Follow-Up (Day 7)', group: 'Estimate Follow-Up' },
  { id: 'estimate_day14', label: 'Estimate Follow-Up (Day 14 — Final)', group: 'Estimate Follow-Up' },
  { id: 'appointment', label: 'Appointment Reminder', group: 'Reminders' },
  { id: 'postjob', label: 'Post-Job Check-In', group: 'After the Job' },
  { id: 'review', label: 'Review Request', group: 'After the Job' },
  { id: 'reengage', label: 'Re-Engagement / Win-Back', group: 'Win Back' },
  { id: 'referral', label: 'Referral Request', group: 'Growth' },
];

function genTemplates(biz, cust, trade) {
  const s = trade.service, j = trade.job;
  return {
    estimate_day2: [
      `Hi ${cust}! ${biz} here. Just checking in on the ${s} estimate I sent over. Any questions? Happy to help!`,
      `Hey ${cust} — wanted to make sure you got the ${s} quote from ${biz}. Let me know if you have any questions or want to adjust anything.`,
      `Hi ${cust}, ${biz} here. Following up on your ${s} estimate. If you're ready to move forward or have questions, I'm just a text away!`,
    ],
    estimate_day7: [
      `Hey ${cust}, ${biz} checking in. Still thinking about the ${s} quote? No rush — just want to make sure I'm not leaving you hanging.`,
      `Hi ${cust}! Quick follow-up from ${biz} on your ${s} estimate. Would you like to go ahead, or is there anything I can adjust?`,
      `Hey ${cust} — ${biz} here. Just circling back on the ${j} quote. If the price wasn't right, I might be able to work something out.`,
    ],
    estimate_day14: [
      `Hi ${cust}, ${biz} here. Last check-in on your ${s} estimate. No hard feelings if you went another direction — we're here if you need us down the road.`,
      `Hey ${cust} — ${biz} following up one last time on the ${s} quote. If the timing isn't right, totally understand. We'd love to help whenever you're ready.`,
      `Hi ${cust}, just a final note from ${biz} on your ${j} estimate. If anything changes, you've got my number. Appreciate you considering us!`,
    ],
    appointment: [
      `Hi ${cust}! Reminder from ${biz} — your ${s} appointment is coming up on [date] at [time]. Reply to confirm or reschedule.`,
      `Hey ${cust}, ${biz} here. Just a heads-up that your ${j} is scheduled for [date/time]. See you then! Reply if you need to change anything.`,
      `Hi ${cust}! ${biz} here with a quick reminder about your upcoming ${s} appointment on [date]. Looking forward to it!`,
    ],
    postjob: [
      `Hey ${cust}, ${biz} here. Just wanted to check — how did everything go with the ${j}? Let me know if anything needs attention.`,
      `Hi ${cust}! Hope you're happy with the ${s} work. If anything doesn't look right or you have questions, don't hesitate to reach out. — ${biz}`,
      `Hey ${cust}, ${biz} checking in. Everything good with the ${j} we did? Your satisfaction matters to us.`,
    ],
    review: [
      `Hi ${cust}! Thanks for choosing ${biz}. If you were happy with the work, a quick Google review would mean a lot to us: [your review link]`,
      `Hey ${cust} — ${biz} here. If you have 30 seconds, a Google review would really help us out: [review link]. Thanks for your business!`,
      `Hi ${cust}! Glad we could help with your ${j}. If you'd recommend ${biz}, a quick review here would be amazing: [review link]`,
    ],
    reengage: [
      `Hey ${cust}! It's ${biz}. It's been a while — if you need any ${s} help, we'd love to take care of you again. How have you been?`,
      `Hi ${cust}, ${biz} here. Haven't heard from you in a bit. If any ${s} needs come up, we're just a text away!`,
      `Hey ${cust} — ${biz} checking in. Hope all is well! If you need anything ${s}-related, don't hesitate to reach out.`,
    ],
    referral: [
      `Hi ${cust}! So glad you're happy with ${biz}. If you know anyone who needs ${s} help, we'd love a referral. Means the world to us!`,
      `Hey ${cust} — if you know anyone who could use reliable ${s} work, we'd really appreciate you sending them our way. Thanks for being a great customer! — ${biz}`,
      `Hi ${cust}, ${biz} here. Word of mouth is how we grow. If any friends or neighbors need ${s} help, would you mind passing along our number?`,
    ],
  };
}

function charColor(len) {
  if (len >= 50 && len <= 130) return 'text-green-600';
  if (len <= 160) return 'text-yellow-600';
  return 'text-red-600';
}

function charLabel(len) {
  if (len >= 50 && len <= 130) return 'Optimal length';
  if (len <= 49) return 'A bit short';
  if (len <= 160) return 'Slightly long — consider trimming';
  return 'Too long — shorten for best results';
}

const FAQS = [
  {
    q: 'How many times should I follow up on an estimate by text?',
    a: 'Research shows the optimal sequence is 3 to 5 follow-up touches spread over 2 to 3 weeks. A common cadence is day 2, day 7, and day 14 after sending the estimate. Nearly half of all replies come from follow-up messages, not the first text.',
  },
  {
    q: 'How long should a follow-up text message be?',
    a: 'Keep it between 50 and 130 characters for the best response rates. Messages under 100 characters get 2 to 5 times higher response rates than longer ones. If your message needs more detail, send it as an email instead.',
  },
  {
    q: 'Do I need permission to text a customer about their quote?',
    a: 'Transactional texts — like following up on a quote the customer requested — generally require only prior express consent, which is typically satisfied when the customer provides their phone number. Marketing or promotional texts require written consent. Always identify your business in the first message and include opt-out instructions. This is general guidance, not legal advice — consult an attorney for your specific situation.',
  },
  {
    q: 'What time should I send follow-up texts?',
    a: 'Send during business hours, ideally between 10am and 12pm for the fastest response times. Avoid early mornings, late evenings (after 9pm), Monday mornings, and Friday afternoons. The 10am to noon window consistently shows the shortest reply times across industry data.',
  },
  {
    q: 'Is texting better than calling for follow-ups?',
    a: 'For most service businesses, text gets faster responses because it is less intrusive and easier to reply to from a job site. Housecall Pro reported a 15% higher close rate and 25 to 50% better connection rate when SMS was added to their sales workflow. Use text for quick check-ins and phone for higher-value or complex conversations.',
  },
];

export default function TextTemplateGenerator() {
  const [biz, setBiz] = useState('');
  const [cust, setCust] = useState('');
  const [tradeId, setTradeId] = useState('');
  const [sitId, setSitId] = useState('');
  const [copied, setCopied] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    document.title = 'Free Follow-Up Text Message Template Generator for Service Businesses | Promise Tracker';
    const desc = 'Generate ready-to-send follow-up text messages for your service business. Pick your trade and situation — get customized templates instantly. Free, no signup.';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', desc);
    else { const m = document.createElement('meta'); m.name = 'description'; m.content = desc; document.head.appendChild(m); }
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') document.documentElement.classList.remove('dark');
    return () => { if (saved === 'dark') document.documentElement.classList.add('dark'); };
  }, []);

  const trade = TRADES.find(t => t.id === tradeId);
  const ready = biz.trim() && cust.trim() && tradeId && sitId;
  const templates = ready ? genTemplates(biz.trim(), cust.trim(), trade)[sitId] : [];

  function handleCopy(txt, i) {
    navigator.clipboard.writeText(txt);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  }

  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-gray-900 no-underline">
            <Logo size={28} /><span className="text-lg font-semibold">Promise Tracker</span>
          </Link>
          <Link to="/signup" className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700">Start Free Trial</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Follow-Up Text Message Template Generator</h1>
          <p className="mx-auto max-w-2xl text-gray-500">Pick your trade and situation, enter your details, and get ready-to-send follow-up texts — optimized for length and response rates. Free, no signup required.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Inputs */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">Your Details</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Your business name</label>
                <input type="text" value={biz} onChange={e => setBiz(e.target.value)} placeholder="e.g. Mike's Plumbing" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Customer's first name</label>
                <input type="text" value={cust} onChange={e => setCust(e.target.value)} placeholder="e.g. Sarah" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Your trade</label>
                <select value={tradeId} onChange={e => setTradeId(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500">
                  <option value="">Select your trade...</option>
                  {TRADES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Situation</label>
                <select value={sitId} onChange={e => setSitId(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500">
                  <option value="">Select a situation...</option>
                  {SITUATIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">Your Templates</h2>
            {!ready ? (
              <div className="flex h-48 items-center justify-center text-center text-sm text-gray-400">
                <p>Fill in your details and select a situation to generate templates</p>
              </div>
            ) : (
              <div className="space-y-4">
                {templates.map((txt, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Option {i + 1}</span>
                      <button onClick={() => handleCopy(txt, i)} className="shrink-0 rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-green-700">
                        {copied === i ? '✓ Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="mb-2 text-sm leading-relaxed text-gray-800">{txt}</p>
                    <p className={`text-xs font-medium ${charColor(txt.length)}`}>
                      {txt.length} characters — {charLabel(txt.length)}
                    </p>
                  </div>
                ))}
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                  <p className="text-xs text-yellow-800">
                    <strong>Tip:</strong> Replace any [bracketed] placeholders with your actual details before sending. For the best response rates, send between 10am–12pm and keep messages under 130 characters.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <section className="mt-16">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">Why Follow-Up Texts Work for Service Businesses</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { v: '98%', t: 'of text messages are opened (most within 3 minutes)', s: 'Industry benchmark' },
              { v: '68%', t: 'response rate for messages under 100 characters', s: 'Salesmsg 2026 Report' },
              { v: '15%', t: 'higher close rate when SMS is added to the sales process', s: 'Housecall Pro / Close.com' },
              { v: '48%', t: 'of replies come from follow-up messages, not the first text', s: 'Salesmsg 2026 Report' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
                <p className="mb-1 text-3xl font-extrabold text-green-600">{s.v}</p>
                <p className="mb-2 text-sm text-gray-600">{s.t}</p>
                <p className="text-xs text-gray-400 italic">— {s.s}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto mt-16 max-w-3xl space-y-6 text-gray-600 leading-relaxed">
          <h2 className="text-2xl font-bold text-gray-900">The Follow-Up Text Problem Every Service Business Faces</h2>
          <p>
            You drove to the job site, took measurements, answered questions, and sent over a detailed estimate. Then silence. You meant to follow up on Tuesday, but you were under a sink. Wednesday you were on another job. By Thursday, the customer hired someone else — not because your price was wrong, but because you forgot to send a 30-second text.
          </p>
          <p>
            This isn't a willpower problem. Research shows that nearly half of all salespeople never make a single follow-up attempt after sending a quote, and 44% give up after just one try. Yet 80% of sales require between 5 and 12 follow-up touches. The businesses that win aren't the cheapest — they're the ones that stay in front of the customer while everyone else disappears.
          </p>
          <p>
            Text messaging is the ideal channel for service business follow-ups because it's fast, non-intrusive, and gets read. Unlike email, which sits in an inbox competing with promotional noise, a text message lands directly on the customer's phone and gets opened within minutes. Housecall Pro's sales team found that adding SMS to their workflow increased their close rate by 15% and improved connection rates by 25 to 50%.
          </p>
          <p>
            The key is keeping your messages short, personal, and spaced out. Messages under 100 characters get 2 to 5 times higher response rates than longer ones. A simple three-touch sequence at day 2, day 7, and day 14 after sending an estimate covers the full decision window without being pushy. Each message should have a slightly different angle — confirm receipt, check in, then close gracefully.
          </p>
          <p>
            That's exactly what this generator helps you do. Pick your trade, pick the situation, and get ready-to-send messages that are pre-optimized for length and tone. No more staring at your phone wondering what to type.
          </p>
          <p>
            Want to see how much revenue you're losing from quotes you never follow up on? <Link to="/calculator" className="text-green-600 font-medium hover:text-green-700">Try our free Quote Follow-Up Revenue Calculator</Link> — it takes 30 seconds.
          </p>
          <p>
            And if you want the follow-ups to happen automatically instead of relying on memory, <Link to="/signup" className="text-green-600 font-medium hover:text-green-700">Promise Tracker</Link> sends escalating SMS and email reminders on your behalf until every quote gets a definitive yes or no. For more tips on the full follow-up process, read our guides on <Link to="/blog/how-to-follow-up-on-a-quote" className="text-green-600 font-medium hover:text-green-700">how to follow up on a quote without being annoying</Link> and <Link to="/blog/how-many-times-to-follow-up-on-estimate" className="text-green-600 font-medium hover:text-green-700">how many times to follow up on an estimate</Link>.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">Quick Compliance Notes for Business Texting</h2>
          <p>
            Following up on a quote that a customer requested is generally considered a transactional message, which requires prior express consent — typically satisfied when the customer gives you their phone number. If you're sending anything promotional (discounts, seasonal offers), you need prior express written consent. Always identify your business in the first message, send only during business hours (8am to 9pm local time), and honor opt-out requests immediately. This is general guidance — consult an attorney for your specific situation.
          </p>
        </section>

        {/* FAQ */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-gray-900 transition hover:bg-gray-50">
                  {f.q}
                  <span className="ml-3 shrink-0 text-gray-400">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <div className="border-t border-gray-100 px-5 py-4 text-sm leading-relaxed text-gray-600">{f.a}</div>}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto mt-16 mb-16 max-w-2xl rounded-xl border border-green-200 bg-green-50 p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">Automate Your Follow-Ups Entirely</h2>
          <p className="mb-5 text-gray-600">Copying and pasting templates works — but what if the follow-ups sent themselves? Promise Tracker sends escalating SMS and email reminders so every quote gets a yes or no. $39/month. No contracts.</p>
          <Link to="/signup" className="inline-block rounded-lg bg-green-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-green-700">Start Your Free Trial</Link>
        </section>
      </main>

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