import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const FAQS = [
  {
    q: 'How soon should I follow up after sending a quote?',
    a: 'Within 24 to 48 hours is ideal. Research from MIT and InsideSales.com shows that contacting a lead within 5 minutes makes you 21 times more likely to qualify them. While that speed applies more to inbound leads, the principle holds: faster follow-up signals professionalism and keeps you top of mind before competitors respond.',
  },
  {
    q: 'How many follow-ups is too many?',
    a: 'For most service business quotes, 4 to 5 follow-ups spread over 2 to 3 weeks is the sweet spot. Data from RAIN Group shows 80% of sales require multiple touches, yet 44% of salespeople stop after just one attempt. If you space your messages out and add value each time, you won\'t come across as pushy.',
  },
  {
    q: 'Should I follow up by text, email, or phone call?',
    a: 'Text messages tend to get the fastest response rates for service businesses because they\'re short and easy to reply to. Email works well for detailed follow-ups or when you want to attach additional information. Phone calls are best reserved for higher-value jobs or when you\'ve already built some rapport. Mixing channels across your follow-up sequence often produces the best results.',
  },
];

export default function BlogFollowUpQuote() {
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    document.title = 'How to Follow Up on a Quote Without Being Annoying | Promise Tracker';
    const desc = 'Learn a proven 5-step follow-up system that wins more jobs without annoying your customers. Practical scripts and timing tips for service businesses.';
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
            How to Follow Up on a Quote Without Being Annoying
          </h1>
          <p className="text-lg text-gray-500">
            A practical guide for service business owners who want to win more jobs — without feeling pushy.
          </p>
        </header>

        <div className="space-y-6 text-gray-600 leading-relaxed">
          <p>
            You spent an hour driving to the job site, took measurements, answered questions, and put together a detailed quote. You sent it over and then — silence. A day passes, then a week, and now you're stuck in that awkward space where you want to check in but you don't want to come across as desperate.
          </p>
          <p>
            So you do nothing. And three weeks later you find out they hired someone else.
          </p>
          <p>
            This happens to every service business owner, and the uncomfortable truth is that it's usually not the price that lost you the job. It's the follow-up — or the lack of one. According to home service pro Daniel Dixon, a single sent quote can represent $400 to $500 in fully-loaded cost when you factor in marketing spend, drive time, and labor. Every quote you send and never follow up on is that investment walking out the door.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">Why Most Service Businesses Don't Follow Up</h2>
          <p>
            The number one reason is fear of being annoying. Nobody wants to be the business that won't stop calling. But here's what the research actually says: data from RAIN Group shows that 80% of sales require between 5 and 12 follow-up touches after the initial contact. Yet 44% of salespeople give up after just one attempt. Only 2% of sales happen on the first contact.
          </p>
          <p>
            That means the vast majority of service business owners are quitting right at the point where persistence starts to pay off. Your competition is almost certainly not following up either — which means the business that does follow up has a massive advantage.
          </p>
          <p>
            The second reason is simply being busy. You're on a roof, under a sink, or mowing a yard. Following up on last Tuesday's quote isn't urgent, so it gets pushed to tomorrow. And then forgotten entirely.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">The 5-Step Follow-Up System That Wins Jobs</h2>
          <p>
            The key to following up without being annoying is simple: space your messages out, make each one useful, and know when to stop. Here's a timeline that works for most service businesses.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 pt-2">Step 1: Same day or next day — confirm delivery</h3>
          <p>
            Send a quick text or email within 24 hours of the quote. You're not selling — you're just confirming they received it. Something like: <em>"Hi [name], just wanted to make sure the estimate came through okay. Let me know if you have any questions — happy to walk through it."</em>
          </p>
          <p>
            A 2020 Lead Connect survey found that 78% of customers end up buying from whichever business responds first. Speed matters, and this first touch sets the tone.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 pt-2">Step 2: Day 3 to 4 — friendly check-in</h3>
          <p>
            If you haven't heard back, send a short message: <em>"Hey [name], just checking in on the estimate I sent over. No rush at all — just want to make sure I answered everything. I'm around if any questions come up."</em>
          </p>
          <p>
            Keep it short and pressure-free. You're being professional, not pushy.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 pt-2">Step 3: Day 7 — add value</h3>
          <p>
            This is where most people either give up or send the exact same message again. Instead, add something genuinely useful. Share a tip related to their project, mention a seasonal consideration, or answer a question that customers in their situation commonly ask.
          </p>
          <p>
            For example: <em>"Hi [name], just a heads up — the material we'd be using for your project is about to go up 8% next month, so there might be a small savings advantage to scheduling sooner. No pressure either way, just wanted to flag it."</em>
          </p>

          <h3 className="text-xl font-semibold text-gray-800 pt-2">Step 4: Day 10 to 14 — direct ask</h3>
          <p>
            By now, a direct question is completely appropriate. You've been patient and helpful. A simple message works: <em>"Hey [name], wanted to circle back on the estimate for your [project]. Are you looking to move forward, or would it help to adjust anything? Either way, I'm happy to help."</em>
          </p>

          <h3 className="text-xl font-semibold text-gray-800 pt-2">Step 5: Day 21 — graceful close</h3>
          <p>
            If you've heard nothing after four touches, one final message wraps things up cleanly: <em>"Hi [name], I wanted to follow up one last time on the estimate for [project]. Totally understand if you went another direction or the timing isn't right — no hard feelings at all. If anything changes down the road, you've got my number. Appreciate you considering us."</em>
          </p>
          <p>
            This message does two important things. It gives them an easy out, and it leaves the door open for the future. Many service business owners report getting calls back weeks or months later from customers who appreciated the professionalism of this final message.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">What Makes Each Follow-Up Work</h2>
          <p>
            Notice what's happening across these five steps. None of them are the same message copy-pasted. Each one has a different purpose: confirm receipt, check in, add value, ask directly, close gracefully. When every message is useful and respectful, the customer doesn't feel chased — they feel taken care of. That's the difference between being annoying and being professional.
          </p>
          <p>
            The best follow-up messages are short, conversational, and make it easy for the customer to reply. Don't write a paragraph when two sentences will do. And don't bury your question at the end of a wall of text — put it up front.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">Why a System Beats Willpower</h2>
          <p>
            Most service business owners fully intend to follow up on every quote. The problem isn't motivation — it's that you're on the job, your hands are full, and by the time you get home you've forgotten about Tuesday's estimate entirely. Good intentions without a system produce the same result as no intentions at all.
          </p>
          <p>
            That's why having something that tracks your open quotes and reminds you to follow up is so valuable. Whether it's a spreadsheet, a whiteboard, or a dedicated tool — the point is that the system remembers even when you don't. Tools like <Link to="/signup" className="text-green-600 font-medium hover:text-green-700">Promise Tracker</Link> automate this entirely. You log a customer promise, set the follow-up cadence, and the system sends escalating SMS and email reminders until you get a definitive yes or no.
          </p>
          <p>
            Curious how much this is actually costing your business? <Link to="/calculator" className="text-green-600 font-medium hover:text-green-700">Try our free Quote Follow-Up Revenue Calculator</Link> to see exactly how much revenue you're leaving on the table from unfollowed quotes.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">The Bottom Line</h2>
          <p>
            Following up on quotes isn't annoying — not following up is expensive. The research is clear: most jobs require multiple touches, most businesses stop after one, and the first business to respond wins most of the time. A simple five-step system spread over three weeks will win you more jobs without ever making you feel pushy.
          </p>
          <p>
            For more data on exactly how many follow-ups you should be sending, read our guide on <Link to="/blog/how-many-times-to-follow-up-on-estimate" className="text-green-600 font-medium hover:text-green-700">how many times to follow up on an estimate</Link>.
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
          <h2 className="mb-3 text-2xl font-bold text-gray-900">Never Forget to Follow Up Again</h2>
          <p className="mb-5 text-gray-600">Promise Tracker sends escalating SMS and email reminders so every quote gets a yes or no. Set it up in 5 minutes. $39/month. No contracts.</p>
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