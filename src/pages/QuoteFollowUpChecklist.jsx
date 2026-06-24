import { useState, useEffect } from 'react';

const TRADES = [
  'HVAC',
  'Plumbing',
  'Lawn Care',
  'Cleaning',
  'Auto Repair',
  'Painting',
  'Pest Control',
  'General Contractor'
];

const TRADE_SCRIPTS = {
  'HVAC': {
    touch1: { text: "Hi [Name], just making sure the quote for your [AC/furnace/heat pump] came through OK — it sometimes lands in spam. Any questions at all, just text me back.", phone: "Hey [Name], it's [You] from [Company] — just calling to make sure the quote for your [system] came through and see if you have any questions." },
    touch2: { text: "Hey [Name], thought of your project — here's a photo of a similar [system] install we just finished in [neighborhood]. Happy to answer any questions about equipment or efficiency.", email: "Hi [Name], wanted to share a quick photo of a [system] install we recently completed — similar setup to what we quoted for your home. Let me know if you have questions about the equipment options or efficiency ratings." },
    touch3: { text: "Hey [Name], just wanted to mention — we offer financing options that can bring your monthly cost down to around $[X]/mo. Happy to walk through the options whenever works for you.", phone: "Hey [Name], it's [You] from [Company]. Wanted to follow up on the quote and mention we have financing options available. Also happy to walk through the warranty coverage if that would help." },
    touch4: { text: "Hey [Name], we have a couple install slots opening up [next week / before the heat hits]. Want me to hold one for you? No pressure — just don't want you stuck waiting if you decide to move forward.", phone: "Hey [Name], just a quick call — we've got some availability opening up [timeframe] and I wanted to check if you'd like me to hold a slot. Totally understand if you're still deciding." },
    touch5: { text: "Hey [Name], I'll go ahead and close out your quote file for now. If you'd like to revisit it down the road, just text me and I'll pull it right up. Thanks for considering us!", email: "Hi [Name], just a final note — I'm going to close out your estimate file. If the timing works better later, just reply to this email and I'll have everything ready. Thanks for giving us the chance to quote the job." }
  },
  'Plumbing': {
    touch1: { text: "Hi [Name], just making sure the quote for your [repair/repipe/water heater] came through OK. Any questions, just text me back.", phone: "Hey [Name], it's [You] from [Company] — calling to make sure you got the quote for your [project] and see if anything needs clarifying." },
    touch2: { text: "Hey [Name], just a heads up — we completed a similar [repipe/water heater install] nearby last week. Happy to share photos or put you in touch with that homeowner if it helps.", email: "Hi [Name], wanted to follow up on your quote — we just finished a similar project in [area] and the homeowner was thrilled. Let me know if you'd like to see photos or have any questions about the scope." },
    touch3: { text: "Hey [Name], wanted to mention — we warranty all our work for [X years] and we're licensed and insured. Happy to walk through what's covered if that would help you decide.", phone: "Hey [Name], following up on the quote. Wanted to make sure you knew about our warranty coverage and answer any questions about materials or timeline." },
    touch4: { text: "Hey [Name], we have some availability [this week / next week] if you'd like to get the work scheduled. Want me to hold a spot? No pressure at all.", phone: "Hey [Name], quick call — we've got availability opening up and I wanted to see if you're ready to get the [project] scheduled before things fill up." },
    touch5: { text: "Hey [Name], going to close out your quote file for now. If you want to revisit it later, just text me and I'll pull everything up. Appreciate your time!", email: "Hi [Name], I'll go ahead and close this estimate out. If the timing is better down the road, just reply and I'll have your info ready. Thanks for the opportunity." }
  },
  'Lawn Care': {
    touch1: { text: "Hi [Name], just making sure the quote for your [lawn service/landscaping project] came through OK. Any questions, just text me back.", phone: "Hey [Name], it's [You] from [Company] — just checking that the quote came through and seeing if you had any questions." },
    touch2: { text: "Hey [Name], wanted to share a before/after from a yard we maintain in [neighborhood]. Similar setup to yours. Let me know if you have questions about the service plan.", email: "Hi [Name], thought you might like to see a before/after from a property we service nearby. Happy to walk through the maintenance schedule or answer any questions." },
    touch3: { text: "Hey [Name], just wanted to mention — getting started [this month] means we can get your lawn on a regular schedule before [season]. That way you're not playing catch-up later.", phone: "Hey [Name], following up on the quote. If you start service [this month], we can get you on a consistent schedule before [season] hits." },
    touch4: { text: "Hey [Name], we have a few spots left on our [weekly/bi-weekly] route in your area. Want me to hold one? Once the route fills up, the next opening is usually [timeframe].", phone: "Hey [Name], quick heads up — our route in your area has a couple spots left. Wanted to check if you'd like to grab one before it fills." },
    touch5: { text: "Hey [Name], going to close out your quote for now. If you'd like to start service later, just text me and I'll get you set up. Thanks for reaching out!", email: "Hi [Name], closing this estimate out for now. If the timing works better next season, just reply and I'll be happy to get you scheduled. Thanks!" }
  },
  'Cleaning': {
    touch1: { text: "Hi [Name], just making sure the quote for your [house/office] cleaning came through OK. Any questions at all, just text me back.", phone: "Hey [Name], it's [You] from [Company] — calling to make sure the quote came through and see if you have any questions." },
    touch2: { text: "Hey [Name], just wanted to mention — here's a link to some of our recent reviews: [link]. Let me know if you have any questions about what's included in the service.", email: "Hi [Name], following up on your cleaning quote — wanted to share a few recent reviews from clients in your area. Happy to customize the service or answer any questions." },
    touch3: { text: "Hey [Name], a lot of our clients like to start with a deep clean and then switch to a regular schedule. Happy to walk through how that works if you're interested.", phone: "Hey [Name], following up on the quote. A lot of clients start with a one-time deep clean and then move to recurring. Want me to walk through the options?" },
    touch4: { text: "Hey [Name], we have availability [this week / next week] if you'd like to schedule your first cleaning. Want me to hold a spot for you?", phone: "Hey [Name], we've got some openings coming up and I wanted to check if you'd like to get your first cleaning on the calendar." },
    touch5: { text: "Hey [Name], going to close out your quote file for now. If you'd like to schedule a cleaning later, just text me. Thanks for considering us!", email: "Hi [Name], I'll close this estimate out for now. Whenever you're ready to schedule, just reply and I'll get you set up. Thanks!" }
  },
  'Auto Repair': {
    touch1: { text: "Hi [Name], just making sure the estimate for your [vehicle/repair] came through OK. Any questions about the diagnosis or the work, just text me.", phone: "Hey [Name], it's [You] from [Company] — calling to make sure you got the estimate for your [vehicle] and see if you have any questions about what we found." },
    touch2: { text: "Hey [Name], just wanted to mention — we use [OEM/quality] parts and everything comes with a [X-month/X-mile] warranty. Happy to walk through the details if that helps.", email: "Hi [Name], following up on your estimate — wanted to make sure you know all our work comes with a [warranty]. Let me know if you have questions about the parts or timeline." },
    touch3: { text: "Hey [Name], just a heads up — the issue we found with your [component] can get worse over time if it's not addressed. Not trying to scare you, just want to make sure you have the full picture.", phone: "Hey [Name], following up on the estimate. I wanted to explain a bit more about why we recommended the [repair] and what could happen if it's left alone. Happy to answer any questions." },
    touch4: { text: "Hey [Name], we have some openings [this week] if you'd like to get the repair scheduled. Should be about [X hours/days] turnaround. Want me to hold a spot?", phone: "Hey [Name], we've got availability if you'd like to get your [vehicle] in. The repair would take about [timeframe]. Want me to schedule you?" },
    touch5: { text: "Hey [Name], closing out your estimate file for now. If you decide to move forward later, just text me and I'll pull everything up. Drive safe!", email: "Hi [Name], I'll go ahead and close this estimate out. If you'd like to get the work done later, just reply and we'll get you scheduled. Thanks for coming in!" }
  },
  'Painting': {
    touch1: { text: "Hi [Name], just making sure the quote for your [interior/exterior] painting project came through OK. Any questions about colors, prep work, or timeline, just text me.", phone: "Hey [Name], it's [You] from [Company] — calling to make sure the painting quote came through and see if you have any questions." },
    touch2: { text: "Hey [Name], here's a photo of a similar [interior/exterior] job we just finished in [area]. We used [paint brand] — same as what's in your quote. Let me know what you think.", email: "Hi [Name], wanted to share a before/after from a recent project — similar scope to yours. Happy to discuss paint options, prep work, or answer any questions." },
    touch3: { text: "Hey [Name], just wanted to clarify — our quote includes [prep/primer/two coats/cleanup]. Some quotes out there skip prep or only do one coat, so I wanted to make sure you're comparing apples to apples.", phone: "Hey [Name], following up on the painting quote. Wanted to make sure you know exactly what's included — especially prep and coats — since that's where quotes from different companies can look different." },
    touch4: { text: "Hey [Name], we have a crew available [next week / timeframe]. Weather looks good for [exterior work / we can start interior anytime]. Want me to pencil you in?", phone: "Hey [Name], we've got availability coming up and the weather's looking great for your project. Want me to hold a slot?" },
    touch5: { text: "Hey [Name], going to close out your painting quote for now. If you want to revisit it later, just text me. Thanks for getting a quote from us!", email: "Hi [Name], closing this estimate out for now. If the timing works better later, just reply and I'll pull everything up. Appreciate the opportunity!" }
  },
  'Pest Control': {
    touch1: { text: "Hi [Name], just making sure the quote for your [pest/termite/mosquito] treatment plan came through OK. Any questions about the process or products, just text me.", phone: "Hey [Name], it's [You] from [Company] — calling to make sure the treatment plan quote came through and see if you have any questions." },
    touch2: { text: "Hey [Name], just a heads up — [pest type] activity picks up in [season], so getting started [this month] gives us the best shot at getting ahead of the problem before it gets worse.", email: "Hi [Name], following up on your pest control quote. [Pest type] season is ramping up, so earlier treatment tends to be more effective. Happy to answer any questions about the products or schedule." },
    touch3: { text: "Hey [Name], wanted to mention — our treatment plan comes with a [guarantee/warranty]. If the problem comes back between visits, we come back at no charge.", phone: "Hey [Name], following up on the quote. Wanted to make sure you knew about our service guarantee — if the issue comes back between treatments, we retreat at no extra cost." },
    touch4: { text: "Hey [Name], we have a tech in your area [this week / next week]. Want me to schedule your first treatment? The sooner we start, the faster we knock it out.", phone: "Hey [Name], we've got a technician covering your area soon. Want me to get your first treatment on the schedule?" },
    touch5: { text: "Hey [Name], going to close out your quote file for now. If the bugs come back or you change your mind, just text me and we'll get you taken care of. Thanks!", email: "Hi [Name], closing this estimate out for now. If you need treatment down the road, just reply and I'll get you scheduled. Thanks for reaching out!" }
  },
  'General Contractor': {
    touch1: { text: "Hi [Name], just making sure the estimate for your [project] came through OK. Any questions about the scope, timeline, or materials, just text me.", phone: "Hey [Name], it's [You] from [Company] — calling to make sure you got the estimate for your [project] and see if anything needs clarifying." },
    touch2: { text: "Hey [Name], here's a photo of a similar project we completed recently. Happy to walk through the materials, timeline, or subcontractor lineup if that helps.", email: "Hi [Name], wanted to share some photos from a recent project similar to yours. Let me know if you have questions about materials, permits, or the construction timeline." },
    touch3: { text: "Hey [Name], wanted to mention — our estimate includes [permits/cleanup/warranty]. Make sure you're comparing the full scope when looking at other quotes.", phone: "Hey [Name], following up on the estimate. Wanted to walk you through what's included so you can compare apples to apples if you're getting other bids." },
    touch4: { text: "Hey [Name], we can start your project [timeframe] if you'd like to move forward. Want me to hold that slot? Permits usually take [X weeks] so the sooner we start paperwork, the better.", phone: "Hey [Name], we've got availability to start [timeframe]. Since permits take a bit, I wanted to check if you'd like to get the ball rolling." },
    touch5: { text: "Hey [Name], going to close out your estimate file for now. If you decide to move forward later, just text me and I'll have everything ready. Thanks for the opportunity!", email: "Hi [Name], I'll close this estimate out for now. If the timing works better down the road, just reply and we'll pick up where we left off. Thanks for considering us." }
  }
};

const FUNDAMENTALS = [
  { id: 'sameDay', label: 'Quote delivered same day as the visit/call', tip: 'The first business to deliver a quote wins a disproportionate share of jobs.' },
  { id: 'multiOption', label: 'Quote includes 2-4 options (Good/Better/Best)', tip: 'Contractors offering 4+ options close at 52% vs. 42% for single-option quotes (ACCA 2025).' },
  { id: 'financing', label: 'Financing mentioned or offered', tip: 'Offering financing lifts average close rates from 38% to 49% (ACCA 2025).' },
  { id: 'confirmation', label: 'Sent a confirmation text when the quote was delivered', tip: 'Quotes often land in spam. A text ensures the customer knows it arrived.' }
];

const TOUCHES = [
  { id: 'touch1', day: 'Day 1', label: 'Confirm receipt', channel: 'Text or call', psychology: 'Captures the customer while the quote is top of mind. Quotes land in spam more than you think.', channels: ['text', 'phone'] },
  { id: 'touch2', day: 'Day 3', label: 'Add value', channel: 'Text or email', psychology: 'Reciprocity — give something useful (photos, reviews, tips) before asking for anything.', channels: ['text', 'email'] },
  { id: 'touch3', day: 'Day 5-7', label: 'Social proof + handle objections', channel: 'Call + text', psychology: 'Social proof reduces uncertainty. Proactively addressing concerns removes friction before it stalls the deal.', channels: ['text', 'phone'] },
  { id: 'touch4', day: 'Day 7-10', label: 'Soft close with real urgency', channel: 'Call or text', psychology: 'Loss aversion — people act faster when a real opportunity might slip. Only use genuine constraints (schedule, season, pricing).', channels: ['text', 'phone'] },
  { id: 'touch5', day: 'Day 14', label: 'Close the file', channel: 'Text or email', psychology: 'Stepping back signals respect and often triggers a response. The "breakup message" consistently earns the highest reply rate.', channels: ['text', 'email'] }
];

const FAQ_DATA = [
  { q: 'How many times should I follow up on a quote?', a: 'Research shows most service jobs need about 5 follow-up touches to close, yet nearly half of businesses stop after just one attempt. A structured 5-touch system over 2 weeks, with each follow-up adding new value rather than repeating "just checking in," can lift close rates by 50-100% on the same leads.' },
  { q: 'When should I send my first follow-up after a quote?', a: 'Within 24 hours. The MIT/InsideSales.com Lead Response Study found that contacting a lead within 5 minutes versus 30 minutes increases the odds of reaching them by 100x. In home services where customers get 3-5 quotes, the first business to follow up wins a disproportionate share.' },
  { q: 'Should I follow up by text, phone, or email?', a: 'Text is the default workhorse — it has a 98% open rate versus about 20% for email, and customers typically reply within 90 seconds. Use phone calls for high-ticket jobs or when a deal stalls. Use email for the formal quote document and paper trail. The best results come from using all three channels across your follow-up sequence.' },
  { q: 'What is the biggest mistake contractors make with quote follow-up?', a: 'The number one mistake is not following up at all, or quitting after a single attempt. The second biggest mistake is saying "just checking in" with no new value — this trains the customer to ignore you. Each follow-up should add something new: a photo, a review, a financing option, or a real scheduling deadline.' },
  { q: 'What is a Good-Better-Best quote and why does it close more jobs?', a: 'A Good-Better-Best (or multi-option) quote gives the customer 2-4 options at different price points instead of a single take-it-or-leave-it number. ACCA\'s 2025 study of 1,000+ contractors found that offering 4+ options lifts close rates from 42% to 52%. It shifts the customer\'s decision from "should I hire you?" to "which option fits my budget?"' },
  { q: 'Does offering financing really help close more jobs?', a: 'Yes. ACCA\'s 2025 Contractor of the Future study found that contractors who offer financing close at 49% versus 38% for those who don\'t. For high-ticket work like HVAC installs, roofing, or remodeling, financing removes the biggest objection (the upfront cost) and lets the customer focus on the monthly payment instead.' },
  { q: 'What should I do after my 5th follow-up with no response?', a: 'Move the customer to long-term nurture — seasonal check-ins, maintenance reminders, or a "thinking of you" note before their busy season. Some customers take months to decide, especially for bigger projects. Staying visible without being pushy keeps you top of mind when they are ready.' }
];

export default function QuoteFollowUpChecklist() {
  const [trade, setTrade] = useState('HVAC');
  const [fundamentals, setFundamentals] = useState({});
  const [touches, setTouches] = useState({});
  const [expandedTouch, setExpandedTouch] = useState(null);
  const [copied, setCopied] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [showTip, setShowTip] = useState(null);

  useEffect(() => {
    document.title = 'Quote Follow-Up Checklist for Service Businesses | Promise Tracker';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Free interactive quote follow-up checklist for HVAC, plumbing, lawn care, cleaning, auto repair, painting, and pest control businesses. Day-by-day scripts, channel guidance, and the psychology behind each step.');
    document.documentElement.classList.remove('dark');
    return () => {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') document.documentElement.classList.add('dark');
    };
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const fundamentalsDone = Object.values(fundamentals).filter(Boolean).length;
  const touchesDone = Object.values(touches).filter(Boolean).length;
  const totalSteps = FUNDAMENTALS.length + TOUCHES.length;
  const completedSteps = fundamentalsDone + touchesDone;
  const progress = Math.round((completedSteps / totalSteps) * 100);

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
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#111827' }}>
          <img src="/logo.jpeg" alt="Promise Tracker" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
          <span style={{ fontWeight: 700, fontSize: '16px' }}>Promise Tracker</span>
        </a>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="/free-tools" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Free Tools</a>
          <a href="/blog" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Blog</a>
          <a href="/signup" style={{ backgroundColor: '#22c55e', color: 'white', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Start Free Trial</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#111827', lineHeight: 1.2, marginBottom: '16px' }}>Quote Follow-Up Checklist</h1>
          <p style={{ fontSize: '18px', color: '#4b5563', lineHeight: 1.6 }}>A step-by-step system to follow up on every quote and close more jobs. Select your trade, check off each step, and use the ready-made scripts. Based on data from 1,000+ contractors.</p>
        </div>

        {/* Stats bar */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px 24px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '200px' }}>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', backgroundColor: progress === 100 ? '#22c55e' : '#3b82f6', borderRadius: '999px', transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{completedSteps}/{totalSteps}</span>
          </div>
          {progress === 100 && <span style={{ fontSize: '14px', fontWeight: 600, color: '#15803d' }}>All steps complete!</span>}
        </div>

        {/* Trade selector */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Select your trade</label>
          <select value={trade} onChange={e => { setTrade(e.target.value); setTouches({}); setFundamentals({}); setExpandedTouch(null); }} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px', color: '#111827', backgroundColor: '#fff', cursor: 'pointer' }}>
            {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Fundamentals pre-check */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>Before You Follow Up</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>Make sure you nailed the basics first. These four things matter more than any follow-up technique.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {FUNDAMENTALS.map(f => (
              <div key={f.id} style={{ backgroundColor: fundamentals[f.id] ? '#f0fdf4' : '#fff', border: `1px solid ${fundamentals[f.id] ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: '10px', padding: '14px 16px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }} onClick={() => setFundamentals(p => ({ ...p, [f.id]: !p[f.id] }))}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: `2px solid ${fundamentals[f.id] ? '#22c55e' : '#d1d5db'}`, backgroundColor: fundamentals[f.id] ? '#22c55e' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', transition: 'all 0.2s' }}>
                    {fundamentals[f.id] && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '15px', fontWeight: 500, color: '#111827', textDecoration: fundamentals[f.id] ? 'line-through' : 'none' }}>{f.label}</span>
                    <button onClick={e => { e.stopPropagation(); setShowTip(showTip === f.id ? null : f.id); }} style={{ marginLeft: '8px', background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>Why?</button>
                    {showTip === f.id && <p style={{ marginTop: '8px', fontSize: '13px', color: '#4b5563', lineHeight: 1.5, padding: '8px 12px', backgroundColor: '#eff6ff', borderRadius: '6px' }}>{f.tip}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Follow-up timeline */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>The 5-Touch Follow-Up System</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>Work through each touch in order. Each step includes ready-to-use scripts for {trade.toLowerCase()} businesses. Check off each one as you complete it.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {TOUCHES.map((t, i) => {
              const scripts = TRADE_SCRIPTS[trade]?.[t.id] || {};
              const isExpanded = expandedTouch === t.id;
              const isDone = touches[t.id];
              return (
                <div key={t.id} style={{ backgroundColor: isDone ? '#f0fdf4' : '#fff', border: `1px solid ${isDone ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: '12px', overflow: 'hidden', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', cursor: 'pointer' }} onClick={() => setExpandedTouch(isExpanded ? null : t.id)}>
                    <div onClick={e => { e.stopPropagation(); setTouches(p => ({ ...p, [t.id]: !p[t.id] })); }} style={{ width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${isDone ? '#22c55e' : '#d1d5db'}`, backgroundColor: isDone ? '#22c55e' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', transition: 'all 0.2s' }}>
                      {isDone && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: isDone ? '#15803d' : '#3b82f6', backgroundColor: isDone ? '#dcfce7' : '#eff6ff', padding: '2px 10px', borderRadius: '999px' }}>{t.day}</span>
                        <span style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{t.label}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{t.channel}</p>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                  {isExpanded && (
                    <div style={{ padding: '0 16px 16px', borderTop: '1px solid #f3f4f6' }}>
                      <div style={{ backgroundColor: '#fefce8', padding: '10px 14px', borderRadius: '8px', marginTop: '12px', marginBottom: '16px' }}>
                        <p style={{ fontSize: '13px', color: '#854d0e', lineHeight: 1.5 }}><strong>Why this step works:</strong> {t.psychology}</p>
                      </div>
                      {t.channels.map(ch => (
                        <div key={ch} style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{ch === 'text' ? '📱 Text Script' : ch === 'phone' ? '📞 Phone Script' : '📧 Email Script'}</span>
                            <button onClick={() => handleCopy(scripts[ch] || '', `${t.id}-${ch}`)} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: copied === `${t.id}-${ch}` ? '#dcfce7' : '#fff', color: copied === `${t.id}-${ch}` ? '#15803d' : '#374151', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}>
                              {copied === `${t.id}-${ch}` ? '✓ Copied!' : 'Copy'}
                            </button>
                          </div>
                          <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px 14px', fontSize: '14px', color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{scripts[ch] || 'Script not available for this channel.'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Key stats */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>Why This System Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { stat: '63%', desc: 'of estimates need follow-up to close (ServiceTitan)' },
              { stat: '21x', desc: 'more likely to qualify a lead if you respond in 5 vs. 30 minutes (MIT)' },
              { stat: '52%', desc: 'close rate with 4+ quote options vs. 42% with one (ACCA 2025)' },
              { stat: '49%', desc: 'close rate when financing is offered vs. 38% without (ACCA 2025)' },
              { stat: '98%', desc: 'open rate for text messages vs. ~20% for email' },
              { stat: '5+', desc: 'follow-ups needed to close most jobs — yet half of businesses quit after one' }
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '16px' }}>
                <p style={{ fontSize: '28px', fontWeight: 800, color: '#22c55e', marginBottom: '4px' }}>{item.stat}</p>
                <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.4 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg, #15803d, #22c55e)', borderRadius: '16px', padding: '40px 32px', textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Never Forget a Follow-Up Again</h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>Promise Tracker automatically sends text and email reminders when you make a promise to a customer — so nothing slips through the cracks.</p>
          <a href="/signup" style={{ display: 'inline-block', backgroundColor: '#fff', color: '#15803d', padding: '14px 32px', borderRadius: '10px', fontWeight: 700, fontSize: '16px', textDecoration: 'none' }}>Start Your Free 21-Day Trial</a>
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
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e5e7eb', padding: '24px', textAlign: 'center' }}>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #22c55e, transparent)', marginBottom: '20px' }} />
        <p style={{ fontSize: '13px', color: '#9ca3af' }}>© {new Date().getFullYear()} Promise Tracker</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
          <a href="/terms" style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'none' }}>Terms</a>
          <a href="/privacy" style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'none' }}>Privacy</a>
        </div>
      </footer>
    </div>
  );
}