import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const FAQS = [
  {
    q: 'What if the customer already said they need to think about it?',
    a: 'That\'s actually a positive signal — they didn\'t say no. Follow up in 3 to 4 days with a message like "Totally understand — just wanted to check if any questions came up while you were thinking it over." Give them space but stay visible.',
  },
  {
    q: 'Is texting better than calling for follow-ups?',
    a: 'For most service businesses, text messages get faster response rates because they\'re less intrusive and easier to reply to. Use texts for short check-ins and emails for anything that needs more detail. Save phone calls for high-value jobs or customers you\'ve already spoken with.',
  },
  {
    q: 'What if I follow up and they ghost me completely?',
    a: 'After 4 to 5 follow-ups spread over 3 weeks with no response, send one final graceful message and move on. Don\'t burn the bridge — many customers come back weeks or months later. Focus your energy on warmer leads and new quotes.',
  },
];

export default function BlogFollowUpTimes() {
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    document.title = 'How Many Times Should You Follow Up on an Estimate? | Promise Tracker';
    const desc = 'Research shows 80% of sales need 5-12 follow-ups. Learn exactly how many times to follow up on service business estimates and the best timing for each.';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', desc);
    else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = desc;
      document.head.appendChild(m);
    }
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') document.documentElement.classList.remove('dark');
    return () => {
      if (saved === 'dark') document.documentElement.classList.add('dark');
    };
  }, []);

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-gray-900 no-underline">
            <Logo size={28} />
            <span className="text-lg font-semibold">Promise Tracker</span>
          </Link>
          <Link to="/signup" className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700">
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* Article */}
      <article className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl leading-tight">
            How Many Times Should You Follow Up on an Estimate? (Data-Backed Answer)
          </h1>
          <p className="text-lg text-gray-500">
            Most service businesses follow up once or twice, then give up. The research says that's exactly when persistence starts to pay off.
          </p>
        </header>

        <div className="space-y-6 text-gray-600 leading-relaxed">
          <h2 className="text-2xl font-bold text-gray-900 pt-4">The Short Answer: More Than You Think</h2>
          <p>
            If you're following up once or twice on an estimate and then moving on, you're in good company — and you're leaving money on the table. Research from RAIN Group shows that 80% of sales require between 5 and 12 follow-up touches after the initial contact. Only 2% of deals close on the first interaction. Yet 44% of salespeople give up after a single follow-up attempt.
          </p>
          <p>
            For service businesses specifically, ServiceTitan's own training materials cite a similar finding: 87% of sales professionals who do follow up give up after just one attempt. Their advice is blunt — the Follow Up tab should be checked and cleared daily, and every unsold estimate should be actively worked until you get a definitive answer.
          </p>
          <p>
            The math is straightforward. If your close rate on followed-up quotes is 30 to 40%, but you're only following up on half your quotes, you're losing roughly 15 to 20% of your total potential revenue every month. For a business sending 15 quotes a week at an average job value of $500, that's thousands of dollars per month. <Link to="/calculator" className="text-green-600 font-medium hover:text-green-700">Run your own numbers with our free calculator</Link> to see exactly what this looks like for your business.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">The Ideal Follow-Up Timeline for Service Estimates</h2>
          <p>
            Not all follow-ups are created equal. Sending the same "just checking in" message five times will annoy people. A good follow-up sequence spaces messages out, varies the angle, and gives the customer a reason to respond each time.
          </p>
          <p>
            Here's a timeline based on what top-performing service businesses actually use:
          </p>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex gap-4">
              <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">1</span>
              <div>
                <p className="font-semibold text-gray-900">Day 0 to 1 — Confirm delivery</p>
                <p className="text-sm text-gray-600">Send the quote, then follow up the same day or next morning to make sure it arrived and ask if there are any questions. This touch alone puts you ahead of most competitors. A 2020 Lead Connect survey found that 78% of customers buy from the first business that responds.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">2</span>
              <div>
                <p className="font-semibold text-gray-900">Day 3 to 4 — Quick check-in</p>
                <p className="text-sm text-gray-600">A brief, pressure-free message: "Just checking in — let me know if anything came up or if you'd like me to adjust anything on the estimate." Keep it to two or three sentences.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">3</span>
              <div>
                <p className="font-semibold text-gray-900">Day 7 — Add value</p>
                <p className="text-sm text-gray-600">Instead of repeating yourself, share something useful: a tip related to their project, a heads-up about seasonal pricing, or an answer to a common question. This positions you as helpful rather than pushy.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">4</span>
              <div>
                <p className="font-semibold text-gray-900">Day 10 to 14 — Direct question</p>
                <p className="text-sm text-gray-600">By now, a straightforward ask is completely appropriate: "Would you like to move forward, or is there anything I can adjust?" You've earned the right to ask directly because you've been patient and helpful.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">5</span>
              <div>
                <p className="font-semibold text-gray-900">Day 21 — Graceful close</p>
                <p className="text-sm text-gray-600">One final message that gives them an easy out and leaves the door open: "No hard feelings if you went another direction. If anything changes down the road, you've got my number." Many owners report getting callbacks weeks later from this message alone.</p>
              </div>
            </div>
          </div>

          <p>
            For a detailed breakdown of exactly what to say at each step — including copy-paste scripts you can use — read our companion guide on <Link to="/blog/how-to-follow-up-on-a-quote" className="text-green-600 font-medium hover:text-green-700">how to follow up on a quote without being annoying</Link>.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">Follow-Up by Channel: Text vs. Email vs. Phone</h2>
          <p>
            The channel you use matters almost as much as the timing. Each has its strengths for service businesses:
          </p>
          <p>
            <strong className="text-gray-900">Text messages</strong> get the fastest response rates. They're short, non-intrusive, and easy to reply to on a job site. For quick check-ins and confirmations, text is usually your best bet. SMS campaigns consistently outperform email in open rates for home service businesses.
          </p>
          <p>
            <strong className="text-gray-900">Email</strong> works best when you need to include details — a revised quote, additional photos, a breakdown of materials. It's also less intrusive than a phone call, which means customers are more likely to engage on their own time without feeling pressured.
          </p>
          <p>
            <strong className="text-gray-900">Phone calls</strong> are best reserved for higher-value jobs or situations where you've already built rapport. A cold follow-up call on a $200 job can feel aggressive. A call about a $5,000 project after you've already texted twice feels natural.
          </p>
          <p>
            The most effective approach mixes channels across the follow-up sequence. Text on day 1, email on day 3 with extra detail, text on day 7 with a quick tip, and so on. Variety keeps your messages from feeling repetitive.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">When to Stop Following Up</h2>
          <p>
            Persistence matters, but so does reading the room. Here's when to stop:
          </p>
          <p>
            <strong className="text-gray-900">The customer said no.</strong> Respect it immediately. Thank them for considering you, wish them well, and move on. No means no.
          </p>
          <p>
            <strong className="text-gray-900">Complete silence after 4 to 5 touches over 3 weeks.</strong> Send one final graceful close message and shift your energy to warmer leads. You've done your job — if they want to come back, they know where to find you.
          </p>
          <p>
            <strong className="text-gray-900">They asked you to stop contacting them.</strong> This should go without saying, but honor it instantly and without argument.
          </p>
          <p>
            What you should never do is burn the bridge. Service businesses live and die by reputation, and a customer who didn't hire you today might need you next year, or might refer a neighbor. A professional final message leaves a better impression than silence or frustration ever will.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">Automate It So You Don't Have to Remember</h2>
          <p>
            Here's the real challenge: even if you know you should follow up 4 to 5 times, you're on the job all day. You can't stop mid-installation to send a text about last week's quote. By the time you get home, you've forgotten.
          </p>
          <p>
            The solution isn't more willpower — it's a system that does the remembering for you. Whether that's a whiteboard in your office, a recurring phone alarm, or a dedicated tool, the point is that follow-up happens because it's scheduled, not because someone happens to remember.
          </p>
          <p>
            <Link to="/signup" className="text-green-600 font-medium hover:text-green-700">Promise Tracker</Link> was built specifically for this. Text a promise to your Promise Tracker number in plain English, and the system sends escalating SMS and email reminders to you and your team until the quote gets a definitive yes or no. No sticky notes, no mental load, no dropped quotes.
          </p>
          <p>
            Want to see how much those dropped quotes are actually costing you? <Link to="/calculator" className="text-green-600 font-medium hover:text-green-700">Try our free Quote Follow-Up Revenue Calculator</Link> — it takes 30 seconds and doesn't require a signup.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">The Bottom Line</h2>
          <p>
            The data is consistent across every study: most service businesses follow up far too few times, and the ones that follow up consistently win significantly more jobs. The sweet spot for service estimates is 4 to 5 touches spread over 2 to 3 weeks, each with a different angle and genuine value. After that, close gracefully and move on.
          </p>
          <p>
            The businesses that win aren't the cheapest — they're the ones that stay in front of the customer while everyone else disappears.
          </p>
        </div>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-gray-900 transition hover:bg-gray-50"
                >
                  {f.q}
                  <span className="ml-3 shrink-0 text-gray-400">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="border-t border-gray-100 px-5 py-4 text-sm leading-relaxed text-gray-600">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-12 mb-12 rounded-xl border border-green-200 bg-green-50 p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">Never Lose a Quote to Poor Follow-Up Again</h2>
          <p className="mb-5 text-gray-600">Promise Tracker sends escalating SMS and email reminders so every estimate gets a yes or no. Set it up in 5 minutes. $39/month. No contracts.</p>
          <Link to="/signup" className="inline-block rounded-lg bg-green-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-green-700">Start Your Free Trial</Link>
        </section>
      </article>

      {/* Footer */}
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