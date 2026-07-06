import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const FAQS = [
  {
    q: 'What is a good repeat customer rate for a service business?',
    a: 'The industry average second-job retention rate for home service businesses is about 38%. Top performers retain 65 to 75% of customers for a second job. Maintenance plan members retain at dramatically higher rates: 89% for HVAC, 74% for plumbing, and 92% for cleaning. If your repeat rate is below 38%, your biggest lever is a post-job follow-up system.'
  },
  {
    q: 'How much does a maintenance plan increase revenue?',
    a: 'Maintenance plan members generate roughly 2.3 to 2.5x more revenue than one-time customers. Preventive maintenance contracts accounted for 39% of total HVAC revenue industry-wide in 2024. The benchmark is 250 to 500 service agreements per $1 million of service sales. Members also retain at 85 to 95% annually compared to roughly 38% for general customers.'
  },
  {
    q: 'When should I ask for a review after a job?',
    a: 'Within 2 to 4 hours of completing the job, when the customer is at peak satisfaction (the relief of a fixed problem). Well-timed requests can increase response rates by 200 to 300%. Send one polite reminder if they don\'t respond. More than one reminder erodes goodwill. Mid-week requests see 15 to 20% higher open rates for email. For SMS, 10am to noon and 6 to 8pm perform best.'
  },
  {
    q: 'How do I win back customers who haven\'t called in a year?',
    a: 'Run a dormant-customer reactivation campaign using SMS plus email with a season-relevant offer. Single-channel email blasts convert at 1 to 3%, but multi-channel campaigns (voice plus SMS plus email) hit 8 to 18%. Expect 60 to 75% of conversions within the first 10 days. Re-engaging a past customer costs roughly $8 to $40 vs $80 to $240 for a cold paid lead.'
  },
  {
    q: 'Is SMS or email better for customer follow-up?',
    a: 'SMS consistently outperforms email on engagement: roughly 98% open rate and 45% response rate for text vs 20 to 28% open and 6% response for email. SMS wins for time-sensitive reminders, appointment confirmations, and review requests. Email works better for richer content like seasonal newsletters. Use both together for the best results.'
  },
  {
    q: 'How many members do I need per $1M in revenue?',
    a: 'The industry benchmark is roughly 250 service agreements per $1 million in service sales. Some consultants recommend 500 members per $1M to keep technicians busy year-round. A well-designed membership program with 85 to 95% renewal rates becomes the foundation of predictable recurring revenue.'
  },
  {
    q: 'When is the best time to ask for a referral?',
    a: 'Five to seven days after completing the job. The homeowner has lived with the results and excitement is still fresh, but it doesn\'t feel transactional like asking while your crew is still packing up. Cash or gift card rewards ($50 to $100 for standard jobs) outperform "dollars off your next service" because the customer may not need you again for years.'
  },
  {
    q: 'Why do satisfied customers stop using my service?',
    a: 'In 52% of cases where a home service customer didn\'t return, they were satisfied with the work. The top reasons: they forgot your name or number (29%) or found a different contractor more easily next time (23%). Only 19% left due to dissatisfaction. The fix is staying in touch with 6 to 8 touchpoints per year so you\'re the first name they think of.'
  }
];

export default function BlogRepeatCustomers() {
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    document.documentElement.classList.remove('dark');
    return () => {
      if (savedTheme === 'dark') document.documentElement.classList.add('dark');
    };
  }, []);

  useEffect(() => {
    document.title = 'How to Get More Repeat Customers as a Service Business | Promise Tracker';
    let meta = document.querySelector('meta[name="description"]');
    const content = 'The average service business keeps only 38% of customers for a second job. Here is how to fix that with maintenance plans, follow-up systems, and reactivation campaigns.';
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
            How to Get More Repeat Customers as a Service Business
          </h1>
          <p className="text-gray-500 text-sm">13 min read</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-12">
          {[
            { stat: '38%', desc: 'average second-job retention rate for home service businesses', source: 'Industry benchmark' },
            { stat: '25-95%', desc: 'profit increase from just a 5% improvement in customer retention', source: 'Bain & Company' },
            { stat: '89%', desc: 'retention rate for HVAC customers on maintenance plans vs 42% without', source: 'Industry data' }
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
              <p className="mb-1 text-3xl font-extrabold text-green-600">{item.stat}</p>
              <p className="mb-2 text-sm text-gray-600">{item.desc}</p>
              <p className="text-xs text-gray-400 italic">{item.source}</p>
            </div>
          ))}
        </div>

        <article className="space-y-6 text-gray-600 leading-relaxed">

          <h2 className="text-2xl font-bold text-gray-900">Your Best Customer Is the One You Already Have</h2>
          <p>
            The average home service business keeps only about 38% of customers for a second job. That means for every 10 customers you serve this month, 6 of them will call someone else next time they need help, even if they were happy with your work.
          </p>
          <p>
            The fix isn't better marketing or lower prices. It's staying in touch. In 52% of cases where a customer didn't come back, they were satisfied with the work. They just forgot your name (29%) or found a different contractor more easily when the next need came up (23%). Only 19% left because they were unhappy. Most retention failures are communication failures, not quality failures.
          </p>
          <p>
            Fixing this pays disproportionately. A 5% increase in retention raises profits 25 to 95%, according to Bain & Company's research. Acquiring a new customer costs 5 to 25x more than keeping one. And you have a 60 to 70% chance of selling to an existing customer compared to 5 to 20% for a new prospect. Your existing customer list is the most valuable asset in your business, and most contractors never touch it after the invoice.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">Why Satisfied Customers Still Leave</h2>
          <p>
            The Ebbinghaus forgetting curve shows the brain forgets roughly half of new information within 20 minutes and about two-thirds within a day without reinforcement. A customer can be thrilled with your work and still completely forget your company name three months later when their water heater starts leaking.
          </p>
          <p>
            The research recommends 6 to 8 touchpoints per year to keep a customer bonded to your business. Not all of them need to be sales pitches. A seasonal reminder, a check-in text, a "happy anniversary" message, or a helpful tip about their system all count. The goal is simple: when they need your trade again, your name is the first one they think of.
          </p>
          <p>
            For a deeper look at the data behind why service businesses lose customers, see the <Link to="/blog/why-service-businesses-lose-customers" className="text-green-600 font-semibold hover:underline">full breakdown</Link>.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">The 6 Systems That Drive Repeat Business</h2>

          <h3 className="text-xl font-semibold text-gray-900">1. Post-job follow-up</h3>
          <p>
            Send a follow-up text within 24 hours of every completed job. A simple "Hey, just checking in. How's everything working since we were out?" catches small problems before they become bad reviews and keeps you top of mind. This is the single easiest system to implement and it costs nothing.
          </p>
          <p>
            Then ask for a Google review within 2 to 4 hours of completion, when satisfaction is highest. Well-timed review requests increase response rates by 200 to 300%. SMS review requests convert at 3 to 5x the rate of email. One request plus one polite reminder is the limit. Grab ready-to-send scripts from the <Link to="/follow-up-text-templates" className="text-green-600 font-semibold hover:underline">follow-up text templates</Link>.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">2. Maintenance and membership plans</h3>
          <p>
            This is the single biggest retention multiplier in the trades. HVAC customers on maintenance plans retain at 89% compared to 42% without. Across trades, plan members deliver roughly 2.3x higher lifetime value. Preventive maintenance contracts accounted for 39% of total HVAC revenue industry-wide in 2024.
          </p>
          <p>
            Design with three tiers (two feels like cheap-or-expensive, four creates paralysis). The middle tier typically captures 50 to 60% of enrollments. Price to cover costs and profit on the pull-through work (repairs, replacements, add-ons). Monthly billing ($19 to $22/month) lowers the barrier, annual billing improves cash flow and reduces churn. Offer a 10 to 15% discount for annual prepay.
          </p>
          <p>
            The benchmark for a healthy service business is roughly 250 service agreements per $1 million of service sales. Loyalty Plumbing in Las Vegas grew memberships 500% in one year and crossed the $1M revenue mark by proactively enrolling past customers into their plan.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">3. Referral requests</h3>
          <p>
            82% of small businesses say referrals are their primary source of new customers, yet most contractors never ask. The optimal timing is 5 to 7 days after completing the job. The homeowner has lived with the results and excitement is still fresh, but it doesn't feel transactional like asking while your crew is packing up.
          </p>
          <p>
            Cash or gift card rewards ($50 to $100 for standard jobs) outperform "dollars off your next service" because in low-frequency trades the customer may not need you again for years. A referral from a satisfied customer closes at dramatically higher rates than any cold lead.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">4. Seasonal reminder campaigns</h3>
          <p>
            Your trade calendar writes your outreach schedule. For HVAC: "Schedule your AC tune-up before the summer rush" in February, "Is your furnace ready for heating season?" in September. For plumbing: winterization reminders in October, water heater age checks when units hit 8 years. For lawn care: spring kickoff in March, fall cleanup in October.
          </p>
          <p>
            These aren't cold marketing blasts. They're helpful reminders to people who already trust you. They convert far better than any paid ad because the relationship already exists. The <Link to="/follow-up-checklist" className="text-green-600 font-semibold hover:underline">follow-up checklist</Link> helps you build these into a consistent system.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">5. Dormant-customer reactivation</h3>
          <p>
            Your customer database is an untapped revenue engine. Home service companies running structured reactivation campaigns commonly source 18 to 32% of annual revenue from existing dormant lists, at a cost of $8 to $40 per recovered job compared to $80 to $240 for cold paid leads.
          </p>
          <p>
            Segment by service type and last-service date, then send season-relevant offers. Multi-channel outreach (SMS plus email plus phone) converts at 8 to 18% compared to 1 to 3% for email alone. A simple "Hey Jim, it's been over a year since your last service. Want us to take a look before the season hits?" can reopen a relationship that was never actually closed.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">6. Cross-selling to existing customers</h3>
          <p>
            Existing customers are 50% more likely to try new offerings and spend 31% more than new customers. A plumber can text past customers: "Hey, in case you didn't know, we also do water heater replacements." A roofer who did the roof may lose the gutter job simply because the customer didn't know they offered it. Remind customers of the full range of what you do.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">What This Looks Like by Trade</h2>

          <h3 className="text-xl font-semibold text-gray-900">HVAC</h3>
          <p>
            Maintenance clubs with spring AC and fall furnace tune-ups give you two guaranteed touchpoints per year. Add filter change reminders, extended warranty programs, and priority scheduling during peak season. Members retain at 89% and generate 2.5x more revenue than one-time customers.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Plumbing</h3>
          <p>
            Annual whole-home inspections, water heater age reminders (units last 8 to 15 years), drain maintenance, and winterization reminders. Roughly 60% of plumbing revenue comes from repeat customers. The 30-day post-emergency follow-up is the single biggest retention lever in plumbing.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Lawn Care</h3>
          <p>
            Seasonal contracts (weekly mowing April through October at a 5 to 10% discount equals 28 weeks of guaranteed revenue), year-round bundles billed monthly, and winter add-ons (snow removal, holiday lighting, gutter cleaning). Referred lawn care customers have roughly 25% higher lifetime value and 60% longer retention.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Cleaning</h3>
          <p>
            Recurring schedules (weekly, biweekly, monthly), consistent crews (customers relax when they see the same faces), and loyalty programs (free service after a set number of cleans). Healthy annual retention runs 65 to 80%. Loyalty programs can lift retention up to 50%.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Auto Repair</h3>
          <p>
            Mileage-based service reminders, declined-service follow-up (the dollar value of declined work often exceeds work sold on a given day), and digital vehicle inspections with photos. When customers see photo proof, approval rates rise roughly 50%. Follow up on declined work 24 to 48 hours later.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Roofing, Electrical, Painting</h3>
          <p>
            Longer purchase cycles mean the referral and review engine matters most. Roofing: annual inspection plans ($100 to $200/year) and post-storm damage checks. Electrical: panel safety inspections and smart home upgrade consultations. Painting: exterior repaint reminders on a 5 to 7 year cycle (clients on regular maintenance extend major repaint cycles by 30 to 50%). For all three, every completed job is a referral opportunity.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">The Lifetime Value You're Leaving on the Table</h2>
          <p>
            An HVAC customer worth $340 on a single job is worth $1,840 over five years with average retention and $4,200 or more for top-retention businesses. A cleaning customer at $175 per visit is worth $4,800 over five years. A landscaping customer at $280 per visit is worth $5,100.
          </p>
          <p>
            The first invoice is a fraction of what the relationship is worth. Every customer who doesn't come back for a second job represents thousands of dollars of lost lifetime value, plus the referrals they would have made. You can see exactly what unfollowed quotes are costing you with the <Link to="/calculator" className="text-green-600 font-semibold hover:underline">quote follow-up revenue calculator</Link>, and what slow response is costing with the <Link to="/response-time-calculator" className="text-green-600 font-semibold hover:underline">response time calculator</Link>.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">The 7 Mistakes That Kill Repeat Business</h2>
          <p>
            Treating every job as a one-time transaction instead of the first of many. No follow-up after job completion (the easiest fix on this list). No system for staying in touch with past customers. Never asking for repeat business or referrals. Inconsistent service quality across techs or visits, which is the fastest way to erode trust in cleaning and lawn care. Not offering maintenance plans when they're the biggest retention lever available. And ignoring dormant customers who haven't called in 12 or more months, when 18 to 32% of annual revenue is sitting in that list waiting to be reactivated.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">The Bottom Line</h2>
          <p>
            Repeat customers spend more, refer more, cost less to serve, and are more likely to say yes to new offerings. The businesses that build repeat revenue don't do it by being the cheapest or the flashiest. They do it by following up after every job, staying in touch between jobs, offering a reason to come back (maintenance plans), asking for the review and the referral at the right moment, and reactivating past customers instead of only chasing new ones.
          </p>
          <p>
            Your customer list is the most valuable thing your business owns. The only question is whether you're using it or ignoring it.
          </p>
        </article>

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
              { label: 'Why Service Businesses Lose Customers', href: '/blog/why-service-businesses-lose-customers' },
              { label: 'How to Write an Estimate That Wins', href: '/blog/how-to-write-estimate-that-wins' },
            ].map((link, i) => (
              <Link key={i} to={link.href} className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100">
                {link.label}
              </Link>
            ))}
          </div>
        </section>

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

        <section className="mt-16 mb-16 rounded-xl border border-green-200 bg-green-50 p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">Never Let a Customer Slip Through the Cracks</h2>
          <p className="mb-5 text-gray-600">
            Promise Tracker is an SMS-based promise tracking tool for service businesses. Text a promise in plain English, get reminded before it's due, get escalated if it slips. Every follow-up happens. Every callback is kept.
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