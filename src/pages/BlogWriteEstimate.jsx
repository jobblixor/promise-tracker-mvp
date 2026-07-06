import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const FAQS = [
  {
    q: 'What is a good close rate on estimates for service businesses?',
    a: 'The industry-typical close rate is 20 to 30%. Contractors with structured follow-up routinely hit 30 to 40%. HVAC installs commonly close at 40 to 50%, retail roofing at 35 to 50%, and insurance roofing above 70%. Referral leads close much higher (often 50%+) than marketplace or advertising leads (often under 20 to 30%). If your close rate is above 50% on retail work, you may actually be underpricing.'
  },
  {
    q: 'How fast should I send an estimate after a job visit?',
    a: 'As fast as possible, ideally same-visit or same-day. The MIT Lead Response Management Study found the odds of qualifying a lead drop 21x when you wait 30 minutes vs 5 minutes. 78% of customers buy from the first business that responds. Many top contractors send the estimate from the driveway before leaving the property.'
  },
  {
    q: 'Should estimates be itemized or lump sum?',
    a: 'A hybrid approach works best. Group costs into meaningful work areas (prep, materials, labor, cleanup) rather than listing every individual part. This builds trust by showing what the customer is paying for without turning your estimate into a shopping list that gets price-shopped line by line. Government, commercial, and insurance work usually requires full itemization.'
  },
  {
    q: 'Does good-better-best pricing really work?',
    a: 'Yes. Three-tier pricing raises average ticket 15 to 25% across trades with no hard selling. Most homeowners choose the middle option. ServiceTitan data shows options-based shops average $450 per service call compared to $180 for single-option shops. The key is that each tier must be a genuine, complete solution. If the basic option feels deliberately crippled, you lose trust.'
  },
  {
    q: 'How many times should I follow up on an estimate?',
    a: 'At least 4 to 5 times. Roughly 80% of non-routine sales happen only after at least five follow-ups, but 44% of salespeople give up after one. Zero-follow-up quotes close at about 2%. Going from zero to one follow-up nearly doubles your close rate. A proven cadence is Day 0 (confirm receipt), Day 3 (add value), Day 7 (light nudge), Day 14 (direct close), and Day 28 (graceful final touch).'
  },
  {
    q: 'How long should an estimate be valid?',
    a: 'Typically 30 days for most trades, though some contractors use 14 or 21 days for higher urgency. The expiration date creates gentle urgency and protects you against material price changes. Always state the validity period clearly on the estimate.'
  },
  {
    q: 'Written or verbal estimate, which is better?',
    a: 'Written, every time. A verbal quote is forgettable, unprofessional, and dispute-prone. Written digital estimates with e-signature get reviewed and signed faster, reduce disputes, and let the customer say yes from their phone. They also give you a record for follow-up.'
  },
  {
    q: 'What should I include with my estimate to stand out?',
    a: 'Beyond the price and scope, include your license number, proof of insurance, warranty terms, 2 to 3 recent customer reviews or a photo of a similar completed job, a personal note referencing the specific project, and a clear call to action with an expiration date. These trust signals separate you from the contractor who just texts a number.'
  }
];

export default function BlogWriteEstimate() {
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    document.documentElement.classList.remove('dark');
    return () => {
      if (savedTheme === 'dark') document.documentElement.classList.add('dark');
    };
  }, []);

  useEffect(() => {
    document.title = 'How to Write an Estimate That Wins the Job | Promise Tracker';
    let meta = document.querySelector('meta[name="description"]');
    const content = 'Most contractors close only 20-30% of estimates. Top performers close 50-70%. The difference is speed, structure, and follow-up. Here is exactly how to write estimates that win.';
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
          <span className="inline-block rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 mb-4">Sales</span>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl leading-tight">
            How to Write an Estimate That Wins the Job
          </h1>
          <p className="text-gray-500 text-sm">15 min read</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-12">
          {[
            { stat: '20-30%', desc: 'average close rate on estimates for service businesses', source: 'Industry benchmark' },
            { stat: '78%', desc: 'of customers hire the first contractor to respond', source: 'Lead Connect, 2024' },
            { stat: '~2%', desc: 'close rate on estimates with zero follow-up', source: 'Marketing Donut' }
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
              <p className="mb-1 text-3xl font-extrabold text-green-600">{item.stat}</p>
              <p className="mb-2 text-sm text-gray-600">{item.desc}</p>
              <p className="text-xs text-gray-400 italic">{item.source}</p>
            </div>
          ))}
        </div>

        <article className="space-y-6 text-gray-600 leading-relaxed">

          <h2 className="text-2xl font-bold text-gray-900">Your Estimate Is Where You Win or Lose the Job</h2>
          <p>
            Most service business owners think they lose jobs on price. The data says otherwise. The average contractor closes only 20 to 30% of the estimates they send. Top performers close 50 to 70%. The difference between them isn't who charges less. It's who sends a professional estimate fast, presents options instead of one number, and follows up until they get an answer.
          </p>
          <p>
            The estimate is the moment where a lead either becomes a paying customer or disappears. Everything you did to generate that lead (your marketing, your reputation, your response time) is wasted if the estimate itself doesn't close. And most estimates don't close because they die from neglect, not rejection.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">Speed: The Most Underrated Factor in Closing Estimates</h2>
          <p>
            The 2007 MIT study found the odds of even making contact with a lead drop 100x when you wait 30 minutes instead of calling within 5. The odds of qualifying that lead drop 21x. And 78% of customers hire the first business that responds, according to Lead Connect's 2024 research.
          </p>
          <p>
            Yet the average business takes 42 hours to respond, and 23% never respond at all. The average contractor does better at roughly 42 minutes, but that's still well outside the high-conversion window.
          </p>
          <p>
            The practical takeaway: you can be $500 higher than a competitor and still win if you send the estimate the same day and they wait a week. Speed signals competence and reliability. Some top contractors send the estimate from the driveway before they even leave the property. You can see exactly what slow response is costing you with the <Link to="/response-time-calculator" className="text-green-600 font-semibold hover:underline">response time calculator</Link>.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">The 8 Elements of an Estimate That Wins</h2>

          <h3 className="text-xl font-semibold text-gray-900">1. Written, digital, with e-signature</h3>
          <p>
            A verbal quote is forgettable, unprofessional, and dispute-prone. Written digital estimates with e-signature get reviewed and signed faster, reduce disputes, and let the customer approve from their phone at 10pm without having to call you back. They also give you a record for follow-up.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">2. Professional formatting and branding</h3>
          <p>
            Logo, clean layout, clear line items, and consistent design. A clean estimate signals a clean job site and an organized business. First impressions from your paperwork happen before you ever pick up a tool.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">3. Good-better-best options</h3>
          <p>
            This is the single most effective structural change you can make. Three-tier pricing raises average ticket 15 to 25% across trades with no hard selling. Most homeowners choose the middle option. ServiceTitan data shows options-based shops average $450 per service call compared to $180 for single-option shops.
          </p>
          <p>
            The psychology works because of the compromise effect: when given three choices, people avoid the extremes and pick the middle. Set your "better" (target) option about 10% above your average sale, "good" about 25% below, and "best" no more than about 50% above. Each tier must be a genuine, complete solution. If "good" feels deliberately crippled to push people to "better," you lose trust and the sale.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">4. Grouped line items with descriptions</h3>
          <p>
            Itemization builds trust because homeowners can see what they're paying for. But over-itemizing turns your estimate into a shopping list that gets price-shopped line by line. The winning approach: group costs into meaningful work areas (prep, materials, labor, cleanup) with short descriptions explaining why each step is necessary. This answers the "what am I paying for?" question without inviting line-by-line comparison shopping.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">5. Scope of work clarity</h3>
          <p>
            Spell out exactly what's included and what's not. Ambiguity is where disputes and lost trust live. A customer who's unsure what they're getting will either ask (slowing the close) or assume (creating a conflict later). Neither is good.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">6. Trust signals</h3>
          <p>
            License number, insurance certificate, warranty terms, and 2 to 3 recent reviews or a photo of a similar completed job. Including a copy of your insurance in the bid packet can tip a decision your way even against an equally priced competitor. These signals answer the unspoken question: "Can I trust this person in my house?"
          </p>

          <h3 className="text-xl font-semibold text-gray-900">7. Personal note</h3>
          <p>
            A short, personalized message referencing the specific project separates you from the contractor who just texts a number. "Hi Sarah, thanks for having me out to look at the master bath tile. Here are three options based on what we discussed" takes 15 seconds to write and makes you memorable.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">8. Clear call to action with an expiration date</h3>
          <p>
            Tell the customer exactly how to say yes (sign here, reply "approved," click to schedule) and put a reasonable validity window on the price. Expiration dates create gentle urgency and protect you against material cost changes. A customer who doesn't know how to say yes simply won't.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">The Psychology Behind Pricing That Converts</h2>

          <h3 className="text-xl font-semibold text-gray-900">Anchoring</h3>
          <p>
            The first price a customer sees becomes the reference point for everything after. Listing the premium option first (or at the top of the page) makes the mid-tier feel reasonable by comparison. This is the same reason restaurants put a $65 steak at the top of the menu. It's not there because everyone orders it. It's there so the $32 option feels like a good deal.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Cost vs. investment framing</h3>
          <p>
            Language matters. "Investment" and monthly payment framing reduce the sting of a large number. Offering financing increases average ticket 40 to 60% on jobs over $3,000 because a $6,000 expense triggers loss aversion while "$112/month" gets compared to a phone bill. Print the monthly payment next to each total if financing is available.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Photo documentation</h3>
          <p>
            Photo documentation of worn or damaged components increases repair upsell acceptance by roughly 30%. When a customer sees the corroded fitting or the cracked panel in a photo, the cost makes sense. Without the photo, it's just a number they're trusting you on.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">The 7 Mistakes That Lose Jobs</h2>
          <p>
            Taking too long to deliver the estimate is the biggest single killer. Slow delivery reads as disorganization. After that: verbal-only quotes with no documentation, missing line items or unclear scope, zero follow-up (quotes with no follow-up close at about 2%), pricing too low (a race to the bottom that erodes margin and signals low quality), not differentiating from competitors, and no clear call to action. For a deeper dive on what happens when customers go silent after receiving your estimate, see the <Link to="/blog/what-to-do-when-customer-ghosts-estimate" className="text-green-600 font-semibold hover:underline">ghosted estimate guide</Link>.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">Follow-Up: Where Jobs Are Actually Won</h2>
          <p>
            This is the highest-ROI activity in the entire sales process. Roughly 80% of non-routine sales happen only after at least five follow-ups, but 44% of salespeople give up after one. Only 16% of roofing contractors follow up on unsold estimates the same day, meaning 84% leave the close to chance.
          </p>
          <p>
            The close rate curve by follow-up count tells the story: zero follow-up closes at about 2%, one follow-up gets you to 15 to 20%, 3 to 5 follow-ups over 14 days push toward 40 to 50%. Going from zero to one nearly doubles your rate. That first follow-up is the cheapest revenue in your business.
          </p>
          <p>
            A proven cadence: Day 0 (confirm receipt, offer to answer questions), Day 3 (add value with a scope recap, photo, or review), Day 7 (light nudge about scheduling or financing), Day 14 (direct but easy-out close), and Day 28 (graceful "still on file, no rush" final touch). Stop the instant they reply. Use the <Link to="/follow-up-checklist" className="text-green-600 font-semibold hover:underline">quote follow-up checklist</Link> to build this into a habit, and grab ready-to-send scripts from the <Link to="/follow-up-text-templates" className="text-green-600 font-semibold hover:underline">follow-up text templates</Link>.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">What This Looks Like by Trade</h2>

          <h3 className="text-xl font-semibold text-gray-900">HVAC</h3>
          <p>
            Multi-option good-better-best is the standard. Build a SEER2/efficiency ladder, attach a warranty tier and financing with a monthly payment to each option. Options-based presentation is why HVAC leads the trades in average ticket and close rate.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Plumbing</h3>
          <p>
            Distinguish emergency vs planned work. For emergencies, speed and a clear flat-rate number win because certainty beats an open meter. For planned work, present three tiers: fix the immediate issue, fix related wear items, or fix plus prevention with a maintenance plan.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Roofing</h3>
          <p>
            Break out materials, show warranty options (manufacturer plus workmanship), and include condition photos. Because storm volume spikes overwhelm follow-up, a same-day estimate plus a defined follow-up sequence is the biggest lever. Separate insurance and retail presentations.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Lawn Care and Landscaping</h3>
          <p>
            Quote recurring vs one-time clearly. Use per-visit and monthly package framing. Keep proposals at the work-area level rather than itemizing every plant, and let customers add optional services as line items (aeration, fertilization, fall cleanup).
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Cleaning</h3>
          <p>
            Flat rate generally closes better than hourly because it removes uncertainty. Prefer a walkthrough over sight-unseen quoting for accuracy. Tiered packages (basic, deep, recurring) work well and let the customer self-select into the service level they want.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Auto Repair</h3>
          <p>
            Itemize parts plus labor clearly. Use photo or video documentation of the actual problem to justify the work. Present three tiers: safety-critical repairs needed now, recommended maintenance coming soon, and full restoration.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Painting</h3>
          <p>
            Make prep work visible as its own line because that's where quality and cost live. Specify number of coats and paint quality tiers. Good-better-best on materials (builder-grade, premium, top-tier) lets the customer choose their own price point.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">How to Know If Your Estimates Are Working</h2>
          <p>
            Track close rate by lead source and by tech, average ticket, and time-to-estimate weekly. A retail close rate above 50% suggests you're underpricing. Below 25% with good response time points to a pricing or differentiation problem. If you're losing leads upstream before they even get an estimate, your response time is the bottleneck, not your estimate quality. Use the <Link to="/calculator" className="text-green-600 font-semibold hover:underline">quote follow-up revenue calculator</Link> to see what unfollowed estimates are costing you, and the <Link to="/blog/how-to-increase-quote-close-rate" className="text-green-600 font-semibold hover:underline">close rate guide</Link> for a deeper dive on improving conversion.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">The Bottom Line</h2>
          <p>
            The estimate that wins the job isn't the cheapest one. It's the one that arrives fast, looks professional, presents options, explains the value, and gets followed up on. Most contractors lose jobs not because their prices are wrong, but because their estimate showed up late, looked like every other bid, offered one number with no context, and never got a follow-up.
          </p>
          <p>
            Fix speed, add good-better-best options, include trust signals, and follow up 4 to 5 times. Those four changes will do more for your revenue than any marketing campaign.
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
          <h2 className="mb-3 text-2xl font-bold text-gray-900">Never Forget to Follow Up on an Estimate Again</h2>
          <p className="mb-5 text-gray-600">
            Promise Tracker is an SMS-based promise tracking tool for service businesses. Text a promise in plain English, get reminded before it's due, get escalated if it slips. Every estimate gets followed up. Every callback happens.
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