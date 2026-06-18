import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const FAQS = [
  {
    q: 'How long should I wait before following up on an estimate?',
    a: 'Send your first follow-up within 24 to 48 hours of delivering the quote. This is just a courtesy check to make sure they received it. Your real follow-up should happen around day 4 to 5 with an open-ended question, not just "checking in."',
  },
  {
    q: 'How many times should I follow up before giving up?',
    a: 'Three to four touches over two to three weeks is the sweet spot for most service businesses. After that, send one final breakup message and move on. Nearly half of all replies come from follow-up messages, so stopping after one attempt leaves money on the table.',
  },
  {
    q: 'What if the customer says they never received the estimate?',
    a: 'This happens more often than you think, and in most cases the customer did receive it but is not ready to commit. Rather than challenging them, simply resend the quote and use it as an opportunity to ask if they have any questions or want to adjust anything.',
  },
  {
    q: 'Should I lower my price if a customer ghosts me?',
    a: 'Not automatically. Ghosting is rarely about price alone — it is usually about indecision, comparison shopping, or simply forgetting. If you suspect price is the issue, ask directly: "Was the price in the right range, or would it help to adjust the scope?" Cutting your price without being asked trains customers to expect discounts.',
  },
];

export default function BlogGhostedEstimate() {
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    document.title = 'What to Do When a Customer Ghosts Your Estimate | Promise Tracker';
    const desc = 'A practical guide for service business owners on handling unresponsive customers after sending a quote. Includes follow-up scripts, timing, and prevention tactics.';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', desc);
    else { const m = document.createElement('meta'); m.name = 'description'; m.content = desc; document.head.appendChild(m); }
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') document.documentElement.classList.remove('dark');
    return () => { if (saved === 'dark') document.documentElement.classList.add('dark'); };
  }, []);

  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-gray-900 no-underline">
            <Logo size={28} /><span className="text-lg font-semibold">Promise Tracker</span>
          </Link>
          <Link to="/signup" className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700">Start Free Trial</Link>
        </div>
      </nav>

      <article className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl leading-tight">
            What to Do When a Customer Ghosts Your Estimate
          </h1>
          <p className="text-lg text-gray-500">
            You spent the time, drove to the job, sent the quote — and then heard nothing. Here's exactly what to do next.
          </p>
        </header>

        <div className="space-y-6 text-gray-600 leading-relaxed">
          <p>
            You drove out to the property, spent 45 minutes measuring and talking through the job, put together a detailed estimate, and sent it over. Then nothing. No reply. No "thanks, we'll think about it." Just silence.
          </p>
          <p>
            Every service business owner knows this feeling. It stings. After a while it starts to feel personal — like the customer got what they needed from you (your time, your expertise, your pricing) and then disappeared. One painter on a trade forum compared it to calling an ex after a breakup: "You sometimes say things you normally wouldn't out of desperation."
          </p>
          <p>
            The good news is that ghosting is almost never personal, it's incredibly common, and there's a proven system for recovering a significant chunk of those silent estimates. The bad news is that most service businesses don't use it — and that's costing them thousands of dollars a year.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">Ghosting Is Normal — Here Are the Numbers</h2>
          <p>
            According to Jobber's 2026 Home Service Trends Report (surveying over 1,000 U.S. service business owners), only 36% of professionals close more than 70% of their quotes. A third close between 51 and 70%, and over a quarter close less than half. That means the majority of service businesses are losing more estimates than they'd like to admit.
          </p>
          <p>
            The numbers are even starker upstream. ServiceTitan data showed the average call-booking rate for service businesses was just 42% — meaning most shops lose the majority of opportunities before an estimate even gets sent. And across all sales industries, HubSpot's 2024 research put the average close rate at just 29%.
          </p>
          <p>
            So if you're losing estimates, you're not doing something wrong. You're experiencing what every service business experiences. The question is whether you have a system for recovering the ones that go quiet.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">Why Customers Ghost (It's Usually Not What You Think)</h2>
          <p>
            The most common reason customers don't respond to an estimate is simple: saying "no" feels awkward. Most people would rather avoid an uncomfortable conversation than tell you they went with someone else or decided not to do the project. As one field-service platform put it, "Usually because saying no feels awkward, so they say nothing instead."
          </p>
          <p>
            Beyond awkwardness, the other common reasons are mundane. They got busy and forgot. They're waiting on a spouse or partner to weigh in. They're still comparing bids. They had a question about the quote but didn't want to bother you. The price felt higher than expected and they didn't know how to bring it up.
          </p>
          <p>
            This matters for how you follow up. Most ghosts aren't a hard "no" — they're a "not yet," a "maybe," or an "I forgot." That means a well-timed, low-pressure follow-up can genuinely recover jobs that would otherwise be lost.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">The Follow-Up System That Recovers Ghosted Estimates</h2>
          <p>
            Research consistently shows that most service businesses give up way too early. Invesp data found that 48% of salespeople never make a single follow-up attempt after initial contact, and 44% quit after just one try. Meanwhile, roughly 80% of sales require five or more follow-up touches. One general contractor who has reviewed thousands of subcontractor quotes put it plainly: "The ones that do follow up are by far the most successful, and the more persistent and aggressive they are, the more work they get."
          </p>

          <h3 className="text-xl font-semibold text-gray-800 pt-2">Touch 1: Day 1-2 — Confirm receipt (text)</h3>
          <p>
            This isn't a follow-up — it's a courtesy check. You're just making sure the quote arrived. Text works best here because it's fast and non-intrusive.
          </p>
          <p className="rounded-lg border border-gray-200 bg-white p-4 text-sm italic text-gray-700">
            "Hi [name], just making sure the estimate came through okay — it sometimes lands in spam. Happy to walk through anything on it."
          </p>
          <p>
            This creates a warm thread you can reply to later instead of sending cold follow-ups from scratch.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 pt-2">Touch 2: Day 4-5 — The real follow-up (text or call)</h3>
          <p>
            This is where most businesses either send "just checking in" (which triggers resistance) or say nothing at all. Instead, ask an open-ended question that surfaces the real objection.
          </p>
          <p className="rounded-lg border border-gray-200 bg-white p-4 text-sm italic text-gray-700">
            "Hey [name], where are you at with the estimate? Anything that doesn't make sense or that you'd want to adjust?"
          </p>
          <p>
            The key is asking a question they can easily answer. "Where are you at with it?" invites an honest response. "Just checking in" gives them nothing to respond to.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 pt-2">Touch 3: Day 7 — The urgency nudge (text or email)</h3>
          <p>
            Use a legitimate reason to create gentle urgency — a filling schedule, a quote expiration, or a material price change. Don't fabricate urgency, but if it's real, use it.
          </p>
          <p className="rounded-lg border border-gray-200 bg-white p-4 text-sm italic text-gray-700">
            "Hey [name], heads up — the quote I sent is good through Friday and my schedule is starting to fill up for [month]. If you want to lock in that time slot, just let me know."
          </p>

          <h3 className="text-xl font-semibold text-gray-800 pt-2">Touch 4: Day 14-21 — The breakup message</h3>
          <p>
            This is the most powerful message in the entire sequence. Sales teams call it the "Magic Email" or the breakup message, and HubSpot reports a 33% response rate on these — higher than most first emails.
          </p>
          <p>
            It works because it removes all pressure. You're not chasing. You're giving them permission to say no, which paradoxically makes them more likely to re-engage.
          </p>
          <p className="rounded-lg border border-gray-200 bg-white p-4 text-sm italic text-gray-700">
            "Hi [name], I haven't heard back on the [project] estimate, so I'm going to assume you've gone in a different direction or the timing isn't right. Totally understand — no hard feelings. If anything changes down the road, you've got my number. Appreciate you considering us."
          </p>
          <p>
            After this message, stop. If they don't respond, mark them as closed and move on. Keep their contact info for a seasonal re-touch in a few months — people do come back.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">Why Text Beats Email and Phone for Follow-Ups</h2>
          <p>
            For service business follow-ups, text messaging consistently outperforms other channels. SMS messages are opened at roughly 98%, with most read within three minutes. Email sits around 20% open rates. And while phone calls can be effective for high-ticket jobs, many customers screen calls from unknown numbers and never pick up.
          </p>
          <p>
            One plumbing company tested this directly: customers who received a follow-up text after getting a quote booked at 31%, compared to 19% for those who didn't get a text. That's a 63% improvement from a single message.
          </p>
          <p>
            Need help writing those follow-up texts? <Link to="/follow-up-text-templates" className="text-green-600 font-medium hover:text-green-700">Our free text message template generator</Link> creates ready-to-send messages for your specific trade and situation.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">How to Prevent Ghosting Before It Starts</h2>
          <p>
            Follow-up recovers ghosted estimates. But the highest-leverage moves happen during the estimate visit itself — before the customer ever has a chance to disappear.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 pt-2">Quote on the spot when possible</h3>
          <p>
            Every day between delivering the estimate and getting a response is a day the customer can ghost. One painter on a trade forum writes his estimates on the back of his business card on the spot and reports a 90% close rate. Even if you can't give an exact number immediately, giving a range and scheduling a follow-up call before you leave dramatically reduces silence.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 pt-2">Book the follow-up before you leave</h3>
          <p>
            Before walking away from the estimate, set a specific time to check back. Not "I'll follow up next week" — that's vague and forgettable. Instead: "I'll send the detailed quote tonight. How about I call you Tuesday at 10 to go through it?" Put it on both your calendars. This turns a cold follow-up into a scheduled appointment.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 pt-2">Ask the closing question</h3>
          <p>
            Most service business owners never actually ask for the sale. Before leaving the estimate, try: "If the price comes in where we discussed, is there anything that would stop you from moving forward?" This surfaces objections while you're still face-to-face and can address them.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 pt-2">Set expectations about communication</h3>
          <p>
            Tell the customer upfront that you'll follow up and that you'd appreciate a yes or a no either way. One contractor on a trade forum includes this in every quote email: "Please respond even if you don't plan on accepting. I want to hear it because it affects my schedule." Most customers respect the directness.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 pt-2">Consider deposits on larger jobs</h3>
          <p>
            For bigger projects, requiring a small deposit with the accepted estimate virtually eliminates ghosting. As one contractor noted, "Once the client has paid an engagement fee, they are usually very responsive." You don't need to charge for every small job, but for quotes over a certain threshold, a deposit signals commitment from both sides.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">When to Walk Away</h2>
          <p>
            Not every ghosted estimate is worth chasing. After 3-4 follow-ups with zero engagement, the professional move is to send the breakup message and redirect your energy. One lawn care owner put it well: "If I don't hear from them within 7 days after the estimate, I write them off and move on to the next."
          </p>
          <p>
            The math supports this. According to Jobber, a single quote can cost $400-$500 in fully-loaded acquisition cost. But pouring hours into chasing a ghost has a cost too — your time and mental energy. The system above gives every estimate a fair chance to convert. Once you've run the system, you've done your job. Move on, and spend that energy generating new quotes instead.
          </p>
          <p>
            Want to see how much those unrecovered estimates are costing your business each year? <Link to="/calculator" className="text-green-600 font-medium hover:text-green-700">Try our free Quote Follow-Up Revenue Calculator</Link> — it takes 30 seconds and might surprise you.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">The Real Problem Is Remembering to Follow Up</h2>
          <p>
            Most service business owners know they should follow up. They fully intend to. But then they're on a roof, under a house, or driving to the next job, and by the time they sit down at the end of the day, last Tuesday's quote has slipped out of memory entirely.
          </p>
          <p>
            The issue isn't motivation — it's that there's no system tracking which quotes are open and when the next follow-up is due. That's exactly what <Link to="/signup" className="text-green-600 font-medium hover:text-green-700">Promise Tracker</Link> was built for. Log a customer promise, set the follow-up schedule, and the system sends automatic text and email reminders until you get a definitive yes or no. No more sticky notes, no more forgotten estimates, no more money left on the table.
          </p>
          <p>
            For more on the timing and mechanics of following up, check out our guides on <Link to="/blog/how-to-follow-up-on-a-quote" className="text-green-600 font-medium hover:text-green-700">how to follow up on a quote without being annoying</Link> and <Link to="/blog/how-many-times-to-follow-up-on-estimate" className="text-green-600 font-medium hover:text-green-700">how many times to follow up on an estimate</Link>.
          </p>
        </div>

        {/* FAQ */}
        <section className="mt-12">
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
        <section className="mt-12 mb-12 rounded-xl border border-green-200 bg-green-50 p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">Stop Losing Estimates to Silence</h2>
          <p className="mb-5 text-gray-600">Promise Tracker sends escalating SMS and email reminders so every estimate gets a yes or no. No more ghosted quotes. $39/month. No contracts.</p>
          <Link to="/signup" className="inline-block rounded-lg bg-green-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-green-700">Start Your Free Trial</Link>
        </section>
      </article>

      <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-400">
        <div className="mx-auto max-w-3xl px-4">
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