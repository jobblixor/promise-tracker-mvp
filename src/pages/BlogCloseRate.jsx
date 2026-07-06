import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FAQ_DATA = [
  { q: 'What is a good quote close rate for a service business?', a: 'The average HVAC install close rate is about 43% according to ACCA\'s 2025 study of 1,000+ contractors. ServiceTitan puts typical lead-to-job conversion at 30-40%, with top performers above 50%. Referral leads should close above 50%, while advertising leads often convert under 20%. If your close rate on qualified leads is below 30%, the problem is almost always your sales process, not your prices.' },
  { q: 'Why do customers choose one contractor over another?', a: 'Multiple surveys show that price is rarely the deciding factor. A BBB study found only 6% of consumers prioritize price when choosing a home service provider. Instead, 55% prioritize trust and reputation, 28% quality of work, and 11% reviews. Homeowners look for proxies of trustworthiness like reviews, response speed, professionalism, clear communication, and a written scope of work.' },
  { q: 'How does offering multiple quote options increase close rate?', a: 'ACCA\'s 2025 study found that contractors presenting four or more options close at 52% compared to 42% for those offering just one to three options. Multiple options shift the customer\'s decision from "should I hire you?" to "which option fits my budget?" A Nexstar Network study found 73% of homeowners choose the middle option, which is where you should place your best margin.' },
  { q: 'Does offering financing really help close more jobs?', a: 'Yes. ACCA data shows contractors who offer financing close at 49% versus 38% for those who don\'t, an 11-point lift without lowering prices. Leading with the monthly payment instead of the total price doubles financing penetration from 21% to 42% of sales. For high-ticket work like HVAC installs or roofing, financing removes the biggest objection by turning a large lump sum into a manageable monthly payment.' },
  { q: 'How fast should I respond to a new lead?', a: 'As fast as possible, ideally within 5 minutes. The MIT/InsideSales.com Lead Response Study found that responding within 5 minutes versus 30 minutes makes you 21 times more likely to qualify the lead. Lead Connect research shows 78% of customers buy from the first company to respond. Yet the average business takes about 47 hours to respond, so speed is a wide-open competitive advantage.' },
  { q: 'How many times should I follow up on an unsent quote?', a: 'At least five times. Research shows 80% of sales require five or more follow-ups, yet nearly half of salespeople never follow up even once. ServiceTitan reports that for contractors with over $10M in revenue, 47% say following up on unsold estimates generates 11-15% of their income. Space your follow-ups 2-3 days apart and add new value each time instead of repeating "just checking in."' },
  { q: 'When should I raise my prices instead of trying to close more?', a: 'If your close rate on qualified leads is consistently above 85%, you are likely underpriced. Test a 10% price increase on your next 50 jobs and measure the result. If your close rate drops to around 80% but your revenue per job increases, you are in a healthier position. The goal is not to close every job but to close enough jobs at a price that supports your business.' }
];

export default function BlogCloseRate() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  useEffect(() => {
    document.title = 'How to Increase Your Quote Close Rate Without Lowering Prices | Promise Tracker';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Data-backed strategies to close more quotes without cutting prices. Learn why trust beats price, how multi-option quoting lifts close rates by 10 points, and why most contractors lose jobs to slow follow-up, not high prices.');
    document.documentElement.classList.remove('dark');
    return () => {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') document.documentElement.classList.add('dark');
    };
  }, []);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_DATA.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a }
    }))
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', color: '#111827' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #e5e7eb', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#111827' }}>
          <img src="/logo.jpeg" alt="Promise Tracker" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
          <span style={{ fontWeight: 700, fontSize: '16px' }}>Promise Tracker</span>
        </Link>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/free-tools" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Free Tools</Link>
          <Link to="/blog" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Blog</Link>
          <Link to="/signup" style={{ backgroundColor: '#22c55e', color: 'white', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Start Free Trial</Link>
        </div>
      </nav>

      {/* Article */}
      <article style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 20px 0' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#111827', lineHeight: 1.2, marginBottom: '16px' }}>How to Increase Your Quote Close Rate Without Lowering Prices</h1>
          <p style={{ fontSize: '18px', color: '#4b5563', lineHeight: 1.6 }}>Most contractors assume they lose jobs because their prices are too high. The data says otherwise. Here are the changes that actually move the needle.</p>
        </div>

        {/* Stats banner */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '40px' }}>
          {[
            { stat: '6%', desc: 'of homeowners say price is the #1 factor' },
            { stat: '52%', desc: 'close rate with 4+ options vs. 42% with one' },
            { stat: '78%', desc: 'of customers buy from the first responder' },
            { stat: '49%', desc: 'close rate with financing vs. 38% without' }
          ].map((item, i) => (
            <div key={i} style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '24px', fontWeight: 800, color: '#22c55e', marginBottom: '4px' }}>{item.stat}</p>
              <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.4 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Section 1 */}
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>The Price Myth</h2>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>When a contractor loses a job, the default assumption is always the same: "My price was too high." But survey after survey tells a different story. A Better Business Bureau study found that only 6% of consumers say price is their top priority when choosing a home service provider. The overwhelming majority, 55%, said trust and reputation matter most.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>A separate survey of 422 homeowners by Mantel found that 69% said price is not the most important factor in their decision. They care more about comfort, quality of installation, long-term reliability, and whether they trust the person standing in their living room.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>This makes sense when you think about it from the homeowner's perspective. They can't tell whether your ductwork installation is better than the next guy's. They can't evaluate refrigerant lines or pipe fittings. What they can evaluate is whether you showed up on time, explained the problem clearly, presented a professional proposal, and followed up when you said you would. Those are the proxies they use to decide who to trust with a $5,000 to $15,000 decision.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '40px' }}>So if you're losing jobs and your close rate is below 30% on qualified leads, the fix isn't to lower your prices. It's to fix your process. Here's how.</p>

        {/* Section 2 */}
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>1. Respond Faster Than Everyone Else</h2>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>Speed is the single cheapest competitive advantage in the service business. Research from Lead Connect found that 78% of customers buy from the first company to respond to their inquiry. Not the cheapest. Not the highest-reviewed. The first one to pick up the phone or reply to the message.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>The MIT/InsideSales.com Lead Response Study quantified this further: responding to a lead within 5 minutes versus 30 minutes makes you roughly 21 times more likely to qualify that lead. And yet the average business takes about 47 hours to respond. That gap is your opportunity.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>In home services, a 2025 analysis of nearly 3,000 contractor leads found that text responses sent within 60 seconds achieved a 73% appointment-booking rate. After 30 minutes, it dropped to 4%.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '40px' }}>The action step is simple: set up a missed-call text-back system so every unanswered call gets an immediate automated text. Then aim to personally respond to every new lead within 5 minutes during business hours. If you can do just this one thing, you'll win more jobs than most of the "marketing strategies" people spend thousands on.</p>

        {/* Section 3 */}
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>2. Present Options, Not a Single Number</h2>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>One of the strongest findings in the ACCA 2025 "Contractor of the Future" study of over 1,000 contractors: businesses that present four or more options close at 52%, compared to 42% for those offering one to three options. That's a 10-point lift from changing nothing about your price, your product, or your marketing. Just how you present the quote.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>The psychology behind this is well-documented. When you give a customer one price, their decision is binary: yes or no. When you give them three or four options at different levels, the decision shifts to "which one fits my budget?" A Nexstar Network study found 73% of homeowners choose the middle option, which is exactly where you should put your best margin.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>The premium option isn't there because you expect everyone to buy it. It's there to make the mid-tier look reasonable by comparison. This is called the compromise effect, and it works because humans instinctively avoid extremes. The budget option exists so the customer doesn't feel trapped. The mid-tier is where most people land, and that's where you want them.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>Yet only about 10% of contractors actually offer four or more options. This means 90% of your competition is still handing customers a single number and hoping for a yes. Present options and you're immediately in a different category.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '40px' }}>Use a digital proposal tool (Jobber, Housecall Pro, ServiceTitan, or even a clean PDF) so the options look professional. A blurry photo of handwritten numbers texted at 10 PM signals "part-timer." A clean, branded proposal with photos, warranty details, and a clear scope signals authority.</p>

        {/* Section 4 */}
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>3. Offer Financing on Every Job</h2>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>ACCA's data is straightforward: contractors who offer financing close at 49% versus 38% for those who don't. That's an 11-point improvement without cutting a single dollar from your price. And it gets better: when contractors lead with the monthly payment instead of the total project cost, financing penetration doubles from 21% to 42% of sales.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>Think about the difference in conversation. A homeowner hearing "$10,247 for a new system" immediately starts calculating whether they can afford it. The same homeowner hearing "$189 per month for 60 months" is thinking about whether it fits in their budget next to their car payment and streaming subscriptions. It's the same system at the same price. The framing changes everything.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>About 68% of HVAC contractors have financing available through providers like GreenSky, Synchrony, or Service Finance. But only 37% offer it on every job. The rest wait for the customer to ask or only bring it up when the customer balks at the price. By then the objection has already formed. Mention financing early and often so the customer never has to worry about "how am I going to pay for this" and can focus on which option is right for their home.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '40px' }}>If your average job exceeds what most households keep in liquid savings (which it does for HVAC installs, roofing, and remodeling), financing isn't a nice-to-have. It's a close-rate lever you're leaving on the table.</p>

        {/* Section 5 */}
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>4. Follow Up More Than Once</h2>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>The follow-up gap in service businesses is staggering. Research consistently shows that roughly 80% of sales require five or more follow-up touches to close. Yet about 48% of salespeople never follow up even once. The gap between what works and what people actually do is enormous, and it represents pure lost revenue.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>ServiceTitan's 2025 Residential Services Report found that among contractors with over $10 million in revenue, 47% say following up on unsold estimates generates 11 to 15% of their income. These are not small businesses hoping for the best. These are large operations that have measured the return on follow-up and built systems around it.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>When a customer goes silent after receiving a quote, it usually doesn't mean they went with someone cheaper. Most of the time they got busy, they're still comparing, or they're waiting for a spouse or a paycheck. The contractor who stays visible and helpful during that decision window wins the job. The contractor who sends one quote and waits gets forgotten.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>The key is adding value with each follow-up instead of repeating "just checking in." Share a photo of a similar completed project. Mention a financing option you didn't cover. Link to your reviews. Proactively address the most common objection for your trade. Then close with a graceful "closing the file" message around day 14 that gives the customer a low-pressure reason to respond.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>For a complete follow-up system with ready-to-use scripts for your trade, try our <Link to="/follow-up-checklist" style={{ color: '#22c55e', fontWeight: 600, textDecoration: 'none' }}>Quote Follow-Up Checklist</Link>. And to see how much revenue you're leaving on the table from unfollowed quotes, run your numbers through the <Link to="/calculator" style={{ color: '#22c55e', fontWeight: 600, textDecoration: 'none' }}>Quote Follow-Up Revenue Calculator</Link>.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '40px' }}>If you want the follow-ups to happen automatically instead of relying on memory, <Link to="/signup" style={{ color: '#22c55e', fontWeight: 600, textDecoration: 'none' }}>Promise Tracker</Link> sends escalating text and email reminders until every quote gets a definitive yes or no.</p>

        {/* Section 6 */}
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>5. Build Trust Before You Show Up</h2>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>By the time a homeowner calls you, they've already formed an opinion about your business. They've looked at your Google reviews, checked your website, and possibly compared your profile to two or three competitors. The sale starts long before you knock on the door.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>The data here is striking. SOCi's analysis of over 31,000 Google Business Profiles and 4.9 million reviews found that each one-star increase in Google rating corresponds to a 44% increase in conversions. A separate study from the Spiegel Research Center at Northwestern found that products and services with reviews convert roughly 270% better than those without any reviews at all.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>The sweet spot for ratings is between 4.2 and 4.7 stars. A perfect 5.0 can actually read as suspicious to consumers. More important than the exact number is recency: 73% of consumers trust only reviews from the last 30 days. A steady flow of recent reviews matters more than a high lifetime average.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>Responding to reviews matters as much as getting them. Research shows 88% of consumers are more likely to use a business that responds to all of its reviews. This is one of the most controllable and impactful trust signals available to any service business.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '40px' }}>Beyond reviews, Service Direct's survey of 559 homeowners found that the single most important factor is whether the contractor is licensed and insured (25%), followed by professional organization membership (chamber of commerce, BBB) at 84%. Video on your website makes homeowners 59% more likely to hire you. These aren't expensive additions. They're free or near-free trust signals that pre-sell the job before you even arrive.</p>

        {/* Section 7 */}
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>6. Sell the Outcome, Not the Equipment</h2>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>The most common sales mistake in the trades is what industry coaches call "selling the box." The contractor walks in, measures the space, quotes a unit, and hands over a price. The customer has no idea why this system costs $8,000 when the other guy quoted $6,000 because nobody explained the difference in terms they care about.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>The consultative approach flips this. Instead of leading with equipment, you lead with questions. What's bothering you about your current system? Which rooms are uncomfortable? How much are your energy bills? What matters most to you: noise, efficiency, or upfront cost? The answers let you present options that directly address what the homeowner actually wants, not what you think they should buy.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>This is the core of Gap Selling: identify the customer's current state, their desired state, and position your solution as the bridge. When the customer feels like the proposal was built specifically for their situation, price becomes less important because the value is obvious.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>One documented example: a Phoenix HVAC owner tracked where in his sales calls he was losing deals and found that 80% of his losses happened in the first five minutes because the prospect arrived with no understanding of the value. He fixed his pre-call education materials and his close rate went from 22% to 37% without changing his prices at all.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '40px' }}>And don't forget the most basic step: ask for the sale. Research from Huthwaite shows that asking at least one direct closing question raises your success rate by 36%. A surprising number of contractors present a great proposal and then just... wait. "Does this look good to you? Want me to get you on the schedule?" is all it takes.</p>

        {/* Section 8 */}
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>What to Do This Week</h2>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>You don't need to overhaul everything at once. Start with the three changes that produce the biggest lift for the least effort.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}><strong>First, fix your speed.</strong> Set up a missed-call text-back system and commit to responding to every new lead within 5 minutes during business hours. This alone puts you ahead of 93% of businesses.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}><strong>Second, build a follow-up sequence.</strong> Commit to at least 5 touches per quote, spaced 2 to 3 days apart, using text as your primary channel. Use our <Link to="/follow-up-checklist" style={{ color: '#22c55e', fontWeight: 600, textDecoration: 'none' }}>Quote Follow-Up Checklist</Link> for the scripts and timing.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}><strong>Third, add options to your quotes.</strong> Next time you quote a job, present three or four tiers instead of a single number. Put your best margin in the middle. Watch what happens.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>Then measure. Track your close rate for the next 30 days and compare it to the previous 30. If it's climbing, keep going. If it's already above 85%, congratulations. Raise your prices by 10% and run the experiment again.</p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>For more on the follow-up side, read our guides on <Link to="/blog/how-to-follow-up-on-a-quote" style={{ color: '#22c55e', fontWeight: 600, textDecoration: 'none' }}>how to follow up on a quote without being annoying</Link>, <Link to="/blog/how-many-times-to-follow-up-on-estimate" style={{ color: '#22c55e', fontWeight: 600, textDecoration: 'none' }}>how many times to follow up on an estimate</Link>, and <Link to="/blog/what-to-do-when-customer-ghosts-estimate" style={{ color: '#22c55e', fontWeight: 600, textDecoration: 'none' }}>what to do when a customer ghosts your estimate</Link>. And grab a set of ready-to-send follow-up texts from the <Link to="/follow-up-text-templates" style={{ color: '#22c55e', fontWeight: 600, textDecoration: 'none' }}>Follow-Up Text Message Template Generator</Link>.</p>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg, #15803d, #22c55e)', borderRadius: '16px', padding: '40px 32px', textAlign: 'center', margin: '40px 0' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Never Forget a Follow-Up Again</h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>Promise Tracker automatically sends text and email reminders when you make a promise to a customer so nothing slips through the cracks.</p>
          <Link to="/signup" style={{ display: 'inline-block', backgroundColor: '#fff', color: '#15803d', padding: '14px 32px', borderRadius: '10px', fontWeight: 700, fontSize: '16px', textDecoration: 'none' }}>Start Your Free 30-Day Trial</Link>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {FAQ_DATA.map((faq, i) => (
              <div key={i} style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#111827', flex: 1, paddingRight: '12px' }}>{faq.q}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expandedFaq === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {expandedFaq === i && <div style={{ padding: '0 16px 16px' }}><p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.7 }}>{faq.a}</p></div>}
              </div>
            ))}
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e5e7eb', padding: '24px', textAlign: 'center' }}>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #22c55e, transparent)', marginBottom: '20px' }} />
        <p style={{ fontSize: '13px', color: '#9ca3af' }}>© {new Date().getFullYear()} Promise Tracker</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
          <Link to="/terms" style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'none' }}>Terms</Link>
          <Link to="/privacy" style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'none' }}>Privacy</Link>
        </div>
      </footer>
    </div>
  );
}