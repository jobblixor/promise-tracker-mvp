import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const FAQS = [
  {
    q: 'Why do customers leave service businesses?',
    a: 'The number one reason is perceived indifference. Research attributed to the Rockefeller Corporation found that 68% of customers leave because they feel the business doesn\'t care about them. In home services specifically, 52% of customers who don\'t return were actually satisfied with the work. They just forgot the contractor\'s name, lost the number, or found someone else more easily. Most customer loss is a communication failure, not a quality failure.'
  },
  {
    q: 'What percentage of customers leave because of poor service?',
    a: 'About 14% of customers leave due to dissatisfaction with the actual service or product. A much larger share, roughly 68%, leave because of perceived indifference or poor communication. Microsoft\'s 2016 Global Customer Service Report found that 60% of consumers have stopped doing business with a brand after a single poor customer service experience.'
  },
  {
    q: 'How much does it cost to acquire a new customer vs. keep one?',
    a: 'Harvard Business Review reports that acquiring a new customer costs 5 to 25 times more than retaining an existing one. You also have a 60 to 70% chance of selling to an existing customer compared to just 5 to 20% for a new prospect. A 5% increase in customer retention can raise profits by 25 to 95%, according to research by Reichheld and Sasser published in HBR.'
  },
  {
    q: 'How do I get repeat customers as a contractor?',
    a: 'The most effective approach is a structured follow-up system: same-day thank you after every job, a 30-day check-in, seasonal reminders, and maintenance plan offers. Contractors with structured follow-up close 15 to 25% more proposals. Maintenance plan members retain at 85% or higher compared to roughly 35% for one-time customers.'
  },
  {
    q: 'What is a good customer retention rate for home services?',
    a: 'The average contractor loses about 11% of customers per year, and second-job retention averages around 38%. Top-performing contractors achieve 65 to 75% second-job retention. For maintenance plan members specifically, retention rates of 80 to 90% are achievable. If your retention is below these benchmarks, a follow-up system is likely the biggest lever.'
  },
  {
    q: 'How often should I follow up with past customers?',
    a: 'The Better Business Bureau guidance cited by ACHR News recommends 6 to 8 relationship touches per year to keep a customer bonded. Not all need to be sales pitches. A good baseline is a same-day thank you, a 30-day check-in, and seasonal reminders tied to your trade (winterization, spring startup, annual inspection).'
  },
  {
    q: 'Do maintenance plans actually improve retention?',
    a: 'Yes, dramatically. HVAC maintenance plan members retain at 80 to 90% compared to 35 to 40% for general customers. Preventive maintenance contracts accounted for 39% of total HVAC revenue industry-wide in 2024. The benchmark is roughly 250 service agreements per $1M in service sales. Plans work across trades because they give customers a reason to call you instead of searching for someone new.'
  },
  {
    q: 'Should I text or call my customers?',
    a: '73% of consumers prefer text for appointment reminders, and SMS open rates are consistently reported at 95 to 98% with roughly 90% read within 3 minutes, compared to about 20% for email. Meanwhile, 85% of people who can\'t reach a business on the first call won\'t leave a voicemail. Text is the clear winner for confirmations, reminders, and follow-ups. Phone calls still matter for complex conversations and closing.'
  }
];

export default function BlogWhyLoseCustomers() {
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    document.documentElement.classList.remove('dark');
    return () => {
      if (savedTheme === 'dark') document.documentElement.classList.add('dark');
    };
  }, []);

  useEffect(() => {
    document.title = 'Why Service Businesses Lose Customers (And How to Fix It) | Promise Tracker';
    let meta = document.querySelector('meta[name="description"]');
    const content = 'Most customers don\'t leave over price or bad work. They leave because they felt ignored. Here\'s the data on why service businesses lose customers and exactly how to fix it.';
    if (meta) {
      meta.setAttribute('content', content);
    } else {
      meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = content;
      document.head.appendChild(meta);
    }
  }, []);

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

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
            <Link to="/signup" className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700">Start Free Trial</Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 mb-4">Customer Retention</span>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl leading-tight">
            Why Service Businesses Lose Customers (And How to Fix It)
          </h1>
          <p className="text-gray-500 text-sm">15 min read</p>
        </div>

        {/* Stats Banner */}
        <div className="grid gap-4 sm:grid-cols-3 mb-12">
          {[
            { stat: '68%', desc: 'of customers leave because they felt ignored, not because of price or quality', source: 'Rockefeller Corporation' },
            { stat: '5-25x', desc: 'more expensive to acquire a new customer than to keep an existing one', source: 'Harvard Business Review' },
            { stat: '25-95%', desc: 'profit increase from just a 5% improvement in customer retention', source: 'Reichheld & Sasser, HBR 1990' }
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
              <p className="mb-1 text-3xl font-extrabold text-green-600">{item.stat}</p>
              <p className="mb-2 text-sm text-gray-600">{item.desc}</p>
              <p className="text-xs text-gray-400 italic">{item.source}</p>
            </div>
          ))}
        </div>

        <article className="space-y-6 text-gray-600 leading-relaxed">

          <h2 className="text-2xl font-bold text-gray-900">It's Not Your Price. It's Not Your Work. It's Your Follow-Up.</h2>
          <p>
            If you run a service business and you're losing customers, your first instinct is probably to blame your pricing or wonder if your work wasn't good enough. The data says otherwise.
          </p>
          <p>
            Research attributed to the Rockefeller Corporation found that 68% of customers leave a business because of perceived indifference. Not bad work. Not high prices. They just felt like you didn't care. Only 14% leave because they're unhappy with the actual service, and only 9% get lured away by a competitor.
          </p>
          <p>
            In home services the picture is even clearer. CallJolt's retention benchmarks found that 52% of customers who don't come back were actually satisfied with the work. The top reasons they didn't return were forgetting the contractor's name or number (29%) and finding a different contractor more easily the next time they needed help (23%). They didn't leave because you did a bad job. They left because you disappeared after the invoice.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">The 7 Ways Service Businesses Lose Customers</h2>

          <h3 className="text-xl font-semibold text-gray-900">1. Not calling customers back</h3>
          <p>
            You told the homeowner you'd send the estimate by Tuesday. Tuesday came and went. By Wednesday they've called someone else. Broken promises are among the most emotionally charged reasons customers leave because they feel lied to, even if you just got busy and forgot. About 27% of contractor inquiries never get a response at all, and 85% of people who reach your voicemail won't leave a message. They'll call the next name on the list.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">2. Slow response to inquiries</h3>
          <p>
            The 2007 MIT study found the odds of even making contact with a lead drop 100x if you wait 30 minutes instead of calling within 5. The odds of qualifying that lead drop 21x. In home services, where homeowners contact 3 to 5 contractors at once for urgent problems, the first responder wins 78% of the time. A 2025 analysis of 2,847 contractor leads found text responses under 60 seconds achieved a 73% booking rate compared to 4% after 30 minutes. Same leads, wildly different outcomes. You can see exactly what slow response is costing you with the <Link to="/response-time-calculator" className="text-green-600 font-semibold hover:underline">response time calculator</Link>.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">3. Poor communication during the job</h3>
          <p>
            No arrival window. No "running 20 minutes late" text. No update when the parts are backordered. Customers don't just judge you on the quality of the repair. They judge you on the entire experience around it. A same-day, three-photo completion report plus a thank-you text builds more trust than a perfect repair with zero communication.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">4. No follow-up after the job</h3>
          <p>
            This is the single biggest retention lever in the trades, and almost nobody does it. A 30-day post-service check-in ("Hey, just checking in. How's everything working since we were out?") costs nothing and keeps you top of mind for the next job. Without it, you become "that plumber whose name I can't remember." The Better Business Bureau recommends 6 to 8 relationship touches per year to keep a customer bonded. Most contractors do zero.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">5. Never asking for repeat business or referrals</h3>
          <p>
            Happy customers don't automatically come back and refer their friends. They forget. You have to ask. The best moment for a referral request is right after a compliment or a successfully resolved issue. The best moment for a review request is within 24 to 48 hours of completing a visible-result job. SMS review requests convert at roughly 3 to 5x the rate of email. Use the <Link to="/follow-up-text-templates" className="text-green-600 font-semibold hover:underline">follow-up text templates</Link> for proven scripts.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">6. Fumbling complaints</h3>
          <p>
            When something goes wrong and you handle it well, customers actually become more loyal than if nothing had gone wrong at all. Khoros found 83% of customers feel more loyal to brands that resolve their complaints. The flip side is devastating: ignoring or mishandling a complaint almost guarantees a lost customer and a bad review. Respond fast, own the problem, and fix it.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">7. No system for any of this</h3>
          <p>
            The real issue behind all six causes above is that most service businesses run follow-ups from memory. When you have 5 customers, memory works. When you have 50, things slip. Contractors with structured follow-up systems close 15 to 25% more proposals than those relying on memory alone. The difference between a business that retains customers and one that doesn't isn't talent or pricing. It's whether follow-up is a system or a hope.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">The Retention Math You Need to See</h2>
          <p>
            A 5% increase in customer retention raises profits 25 to 95%, according to Reichheld and Sasser's research published in Harvard Business Review. Acquiring a new customer costs 5 to 25x more than keeping one. And you have a 60 to 70% probability of selling to an existing customer compared to 5 to 20% for a new prospect.
          </p>
          <p>
            The numbers get even more compelling over time. Bain's loyalty research found that the average repeat customer spends 67% more per order in months 31 to 36 of the relationship than in months 0 to 6. Loyalty compounds. An HVAC customer with average retention is worth about $1,840 over five years compared to $340 for a single job. Top-retention shops hit $4,200 in five-year customer value.
          </p>
          <p>
            You can see exactly what unfollowed quotes are costing you with the <Link to="/calculator" className="text-green-600 font-semibold hover:underline">quote follow-up revenue calculator</Link>.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">How to Fix It: The Follow-Up System That Works</h2>

          <h3 className="text-xl font-semibold text-gray-900">This week: stop the bleeding</h3>
          <p>
            Turn on instant text-back for missed calls. Aim for under 5 minutes on every inquiry. Add a same-day "thank you, here's what we did, here's what we recommend" text to every completed job. Start asking for Google reviews by text within 24 to 48 hours.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">This month: build the system</h3>
          <p>
            Track every open quote and completed job in one place so nothing relies on memory. Chase ghosted estimates with a set sequence (the <Link to="/blog/what-to-do-when-customer-ghosts-estimate" className="text-green-600 font-semibold hover:underline">ghosted estimate guide</Link> gives you the exact steps). Set a follow-up calendar: same-day thank you, 30-day check-in, seasonal reminders. Use the <Link to="/follow-up-checklist" className="text-green-600 font-semibold hover:underline">quote follow-up checklist</Link> to build the habit. Launch or formalize a maintenance or recurring service plan.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">This quarter: compound it</h3>
          <p>
            Run a re-engagement campaign to dormant past customers. A "we miss you" or "your system is due for service" text to your existing list costs almost nothing and converts far better than cold leads. Re-engaging a past maintenance client costs about 60% less than generating an equivalent lead through paid search. Track your retention rate and second-job rate against the benchmarks: contractors lose about 11% per year and second-job retention averages 38%. Beat both.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">What This Looks Like by Trade</h2>

          <h3 className="text-xl font-semibold text-gray-900">HVAC</h3>
          <p>
            Maintenance clubs are the backbone. Plan members retain at 80 to 90% compared to 35 to 40% for general customers. Plans typically run $150 to $300 per year with two visits, priority scheduling, and repair discounts. Preventive maintenance contracts accounted for 39% of total HVAC revenue in 2024. Benchmark: 250 service agreements per $1M of service sales. Sell the plan at the end of every service call.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Lawn Care</h3>
          <p>
            The two biggest churn drivers are feeling undervalued and forgetting to renew between seasons. Fix with pre-set recurring jobs, four brief touches per year (completion message, end-of-season summary, spring kickoff, mid-summer check-in), frictionless renewal, and seasonal add-ons like aeration, fertilization, and fall cleanup. One Austin company added a quarterly feedback system and saw a 20% retention lift in six months.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Plumbing</h3>
          <p>
            The 30-day post-emergency follow-up is the single biggest retention lever. Add water heater age reminders, annual drain maintenance, and winterization reminders. Roughly 60% of plumbing revenue comes from repeat customers. Service agreements give customers a reason to call you instead of searching "plumber near me" again.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Cleaning</h3>
          <p>
            Healthy monthly attrition is 1 to 4%, and the target retention rate is 90% or higher. Quote weekly, biweekly, or monthly at booking instead of just one-time. Use a branded welcome guide and offer recurring discounts. Cleaning businesses lose clients through an accumulation of small irritations, not one big failure. Consistency is everything.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Auto Repair</h3>
          <p>
            Repeat repair orders run 15 to 20% higher than first-timers. Mileage-based reminders, declined-service follow-ups, and digital vehicle inspection photos drive returns. One shop's "2-2-2" follow-up (text at 2 days, call at 2 weeks, postcard at 2 months) lifted its repeat rate from 38% to 54%.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Roofing, Electrical, Painting</h3>
          <p>
            Longer purchase cycles mean the referral and review engine matters most. Capture the review at the peak moment, stay in touch seasonally (gutter and roof checks, panel safety inspections, repaint reminders), and mine every completed job for the next-door neighbor referral. For tips on increasing your close rate on quotes, see <Link to="/blog/how-to-increase-quote-close-rate" className="text-green-600 font-semibold hover:underline">how to increase your quote close rate</Link>.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">The Bottom Line</h2>
          <p>
            Most service businesses lose customers not because of bad work or high prices, but because they disappear after the invoice. The fix isn't complicated: respond fast, communicate through the job, follow up after, ask for the review and the referral, and put it all in a system so nothing depends on your memory.
          </p>
          <p>
            The contractors who build a follow-up system don't just retain more customers. They spend less on marketing, get more referrals, earn more per customer over time, and grow without constantly refilling a leaky bucket.
          </p>
        </article>

        {/* Cross Links */}
        <section className="mt-16 text-center">
          <h3 className="mb-4 text-lg font-bold text-gray-900">More Free Tools & Guides</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'Quote Follow-Up Revenue Calculator', href: '/calculator' },
              { label: 'Response Time Cost Calculator', href: '/response-time-calculator' },
              { label: 'Follow-Up Text Templates', href: '/follow-up-text-templates' },
              { label: 'Quote Follow-Up Checklist', href: '/follow-up-checklist' },
              { label: 'How to Follow Up Without Being Annoying', href: '/blog/how-to-follow-up-on-a-quote' },
              { label: 'How Many Times to Follow Up on an Estimate', href: '/blog/how-many-times-to-follow-up-on-estimate' },
              { label: 'What to Do When a Customer Ghosts', href: '/blog/what-to-do-when-customer-ghosts-estimate' },
              { label: 'How to Increase Your Close Rate', href: '/blog/how-to-increase-quote-close-rate' },
            ].map((link, i) => (
              <Link key={i} to={link.href} className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100">
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
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
        <section className="mt-16 mb-16 rounded-xl border border-green-200 bg-green-50 p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">Ready to Put This into Practice?</h2>
          <p className="mb-5 text-gray-600">
            Promise Tracker is an SMS-based promise tracking tool for service businesses. Text a promise in plain English, get reminded before it's due, get escalated if it slips. Nothing falls through the cracks.
          </p>
          <Link to="/signup" className="inline-block rounded-lg bg-green-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-green-700">
            Start Your 30-Day Free Trial
          </Link>
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