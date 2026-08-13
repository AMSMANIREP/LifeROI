"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { calculateProjection, monthsToGoal, timeRecovered } from "./domain/projection";

const money = [
  ["Housing", 25000, "#8c7cff"], ["Groceries", 10000, "#2dd4bf"], ["Dining", 8000, "#ff916e"],
  ["Transport", 8000, "#61a5ff"], ["Shopping", 7000, "#d66cff"], ["Other", 22000, "#55617e"],
] as const;
const monthly = [74, 78, 76, 82, 79, 84, 81, 86, 83, 88, 87, 92];
const nav = [["⌂","Overview"],["↥","Upload"],["₹","Money"],["◷","Time"],["ϟ","Energy"],["♻","Resources"],["◇","Future"],["◎","Goals"],["✦","Opportunities"],["✣","AI Advisor"],["⚙","Settings"]];

const inr = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const compact = (n: number) => new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(n);

const dataAvailable = { money:true, time:true, energy:true, subscriptions:true, goals:true } as const;
const viewCopy: Record<string, { title:string; subtitle:string; emoji:string }> = {
  Overview:{title:"Your resource story",subtitle:"A complete view built only from the data you have added.",emoji:"🌈"},
  Money:{title:"Money intelligence",subtitle:"See where your money went and where gentle changes can help.",emoji:"💰"},
  Time:{title:"Time intelligence",subtitle:"Turn attention into hours you can spend on what matters.",emoji:"⏳"},
  Energy:{title:"Energy intelligence",subtitle:"Understand consumption, momentum, and attainable savings.",emoji:"⚡"},
  Resources:{title:"Connected resources",subtitle:"Only resources with confirmed data appear here.",emoji:"🧭"},
  Future:{title:"Future simulator",subtitle:"Explore what an extra saving percentage could make achievable.",emoji:"🔮"},
  Goals:{title:"Your goals",subtitle:"Connect today’s choices with a clear, encouraging path forward.",emoji:"🎯"},
  Opportunities:{title:"Best next moves",subtitle:"High-impact ideas ranked by confidence and lifestyle disruption.",emoji:"💡"},
  Settings:{title:"Privacy & settings",subtitle:"Control retention, visibility, and how LifeROI uses your data.",emoji:"⚙️"},
};

const advisorReplies: Record<string, string> = {
  "Where am I overspending?":"Dining is your clearest flexible-spending opportunity. It is 14% above your recent average; a gentle 10% adjustment would redirect about ₹800 each month.",
  "Can I reach my goal in 5 years?":"With ₹2 lakh already saved and ₹20,000 added monthly, the ₹15 lakh goal takes about 5.4 years. Redirecting 10% of current spending brings it down to about 3.9 years.",
  "Show my biggest recurring costs":"Your largest recurring costs are rent at ₹25,000/month, transportation at ₹8,000/month, utilities at ₹4,000/month, and subscriptions at ₹3,000/month.",
};

export default function LifeROIDashboard() {
  const [active, setActive] = useState("Overview");
  const [reduction, setReduction] = useState(10);
  const [years, setYears] = useState(10);
  const [annualReturn, setAnnualReturn] = useState(8);
  const [mode, setMode] = useState<"growth" | "cash">("growth");
  const [upload, setUpload] = useState(false);
  const [advisor, setAdvisor] = useState(false);
  const [advisorInput, setAdvisorInput] = useState("");
  const [advisorQuestion, setAdvisorQuestion] = useState("");
  const [advisorReply, setAdvisorReply] = useState("Your lowest-disruption opportunity is subscription cleanup. Two rarely used subscriptions total about ₹800/month. Pausing them would redirect ₹9,600/year without changing your daily routine.");
  const [advisorThinking, setAdvisorThinking] = useState(false);
  const [goal, setGoal] = useState(1500000);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [timeTarget, setTimeTarget] = useState("📚 Learning");
  const [notice, setNotice] = useState("");
  const [retention, setRetention] = useState("Delete source after extraction");
  const [info, setInfo] = useState<string | null>(null);
  const [burst, setBurst] = useState<{id:number;emojis:string[];message:string} | null>(null);
  const advisorInputRef = useRef<HTMLInputElement>(null);
  const projection = useMemo(() => calculateProjection({ monthlySpending: 80000, reductionPercentage: reduction, years, annualReturn, currentSavings: 200000, inflationRate: 5 }), [reduction, years, annualReturn]);
  const recovered = timeRecovered(150, reduction);
  const goalCurrent = monthsToGoal(goal, 200000, 20000);
  const goalOptimized = monthsToGoal(goal, 200000, 20000 + projection.monthlySavings);
  const hasAnyData = Object.values(dataAvailable).some(Boolean);
  const currentView = viewCopy[active] ?? viewCopy.Overview;
  const yearsSooner = Math.max(0, (goalCurrent-goalOptimized)/12);

  useEffect(() => {
    document.documentElement.classList.add("motion-ready");
    const revealables = Array.from(document.querySelectorAll<HTMLElement>(".panel, .section-block"));
    revealables.forEach((element, index) => {
      element.classList.add("reveal");
      element.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
    });
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("in-view");
    }), { threshold:.12 });
    revealables.forEach(element => revealObserver.observe(element));

    return () => { revealObserver.disconnect(); document.documentElement.classList.remove("motion-ready"); };
  }, []);

  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(""), 2600); return () => window.clearTimeout(timer); }, [notice]);
  useEffect(() => { if (!burst) return; const timer = window.setTimeout(() => setBurst(null), 1800); return () => window.clearTimeout(timer); }, [burst]);

  function celebrate(message:string, emojis:string[]) {
    setBurst({ id:Date.now(), emojis, message });
    setNotice(message);
  }

  function navigate(label: string) {
    if (label === "Upload") { setUpload(true); return; }
    if (label === "AI Advisor") { setAdvisor(true); window.setTimeout(() => advisorInputRef.current?.focus(), 80); return; }
    setActive(label);
    window.scrollTo({ top:0, behavior:"smooth" });
  }

  function askAdvisor(question = advisorInput) {
    const clean = question.trim();
    if (!clean || advisorThinking) return;
    setAdvisorQuestion(clean); setAdvisorInput(""); setAdvisorThinking(true);
    window.setTimeout(() => {
      const exact = advisorReplies[clean];
      const lower = clean.toLowerCase();
      const fallback = lower.includes("time") || lower.includes("instagram") || lower.includes("social")
        ? `Your current social usage is about 2h 30m a day. A ${reduction}% reduction would recover roughly ${recovered.annualHours.toFixed(0)} hours each year.`
        : lower.includes("electric") || lower.includes("energy")
          ? "Electricity use fell 8.1% this month to 420 kWh. Another 5% reduction represents an estimated ₹5,400 annual opportunity."
          : `Based on the demo data, your strongest low-disruption move is redirecting ${inr(projection.monthlySavings)} per month from flexible spending. Ask about money, time, energy, subscriptions, or your goal for a more specific answer.`;
      setAdvisorReply(exact ?? fallback); setAdvisorThinking(false);
    }, 520);
  }

  return <main className="app-shell">
    <div className="resource-floaters" aria-hidden="true"><span className="scroll-floater f1" data-speed=".035">💰</span><span className="scroll-floater f2" data-speed="-.028">⏳</span><span className="scroll-floater f3" data-speed=".045">⚡</span><span className="scroll-floater f4" data-speed="-.04">🌱</span><span className="scroll-floater f5" data-speed=".025">✨</span></div>
    <aside className="sidebar" aria-label="Primary navigation">
      <button className="brand" onClick={() => navigate("Overview")}><span className="brand-mark">L</span><span>LifeROI<small>Resource intelligence</small></span></button>
      <nav>{nav.map(([icon,label]) => <button key={label} onClick={() => navigate(label)} className={active === label ? "active" : ""} aria-current={active === label ? "page" : undefined}><span>{icon}</span>{label}{label === "Opportunities" && <b>3</b>}</button>)}</nav>
      <div className="side-foot"><div className="mini-avatar">A</div><div><strong>Arjun Mehta</strong><small>Demo workspace</small></div><button aria-label="More account options">•••</button></div>
    </aside>

    <section className="content" id="overview">
      <header className="topbar view-header"><div><p className="eyebrow">LIFEROI · {active.toUpperCase()}</p><h1>{currentView.title} <span className="wave">{currentView.emoji}</span></h1><p>{currentView.subtitle}</p></div><div className="header-actions"><button className="icon-button" aria-label="Notifications" onClick={()=>setNotice("🎉 You reclaimed 10 hours this month!")}>♢<i /></button><button className="primary" onClick={() => setUpload(true)}>＋ Add data</button></div></header>

      {!hasAnyData && <EmptyState title="No confirmed resource data yet" message="Add a statement, screenshot, or text summary. LifeROI will only show insights after you review and confirm the extracted data." onAdd={()=>setUpload(true)} />}

      <section className="hero-grid tab-section" data-section="Overview" hidden={active!=="Overview" || !hasAnyData}>
        <article className="score-card panel"><div className="score-copy"><div className="card-label"><span className="pulse-dot"/> YOUR RESOURCE SCORE <button aria-label="About this score" onClick={()=>setInfo("score")}>?</button></div><div className="score"><strong>78</strong><span>/100</span></div><p>Strong momentum <span>↗</span></p><small>An estimate based on your connected data—not a judgment.</small></div><div className="score-ring" aria-label="Resource score 78 out of 100"><span>78<small>SCORE</small></span></div><div className="score-bars">{[["Money",82],["Time",69],["Energy",76],["Subscriptions",85],["Sustainability",77]].filter(([name])=>name!=="Money"||dataAvailable.money).filter(([name])=>name!=="Time"||dataAvailable.time).filter(([name])=>name!=="Energy"||dataAvailable.energy).filter(([name])=>name!=="Subscriptions"||dataAvailable.subscriptions).map(([name,val]) => <div key={name}><label>{name}<b>{val}</b></label><i><span style={{width: `${val}%`}} /></i></div>)}</div></article>
        <article className="opportunity-hero panel"><div className="orb orb-one"/><div className="orb orb-two"/><div className="spark">✦</div><p className="eyebrow">THIS MONTH’S OPPORTUNITY</p><h2>Small shifts.<br/>A bigger future.</h2><p>Redirecting just <b>10%</b> of flexible spending could create</p><strong>{inr(8000)}<small>/month</small></strong><div className="impact-row"><span><b>{inr(96000)}</b>per year</span><span><b>96 hours</b>reclaimed</span></div><button onClick={() => navigate("Future")}>Explore your future <span>→</span></button></article>
      </section>

      <section className="section-block section-anchor tab-section" hidden={!hasAnyData || (active!=="Overview"&&active!=="Resources")} id="resources" data-section="Resources"><div className="section-head"><div><p className="eyebrow">YOUR MONTH AT A GLANCE</p><h2>Every resource tells a story. <span className="inline-emoji">🧭</span></h2></div><select className="ghost" aria-label="Summary month" defaultValue="July 2026"><option>July 2026</option><option>June 2026</option><option>May 2026</option></select></div><div className="metric-grid">
        {dataAvailable.money && <Metric icon="₹" tone="violet" name="Money used" value={inr(80000)} trend="4.2%" down note="vs. last month" opportunity="₹96K annual opportunity" />}
        {dataAvailable.time && <Metric icon="◷" tone="cyan" name="Screen time" value="5h 30m" trend="3.8%" note="daily average" opportunity="182 hrs/year recoverable" />}
        {dataAvailable.energy && <Metric icon="ϟ" tone="green" name="Electricity" value="420 kWh" trend="8.1%" down note="vs. last month" opportunity="₹5.4K annual opportunity" />}
        {dataAvailable.subscriptions && <Metric icon="↻" tone="orange" name="Subscriptions" value={inr(3000)} trend="12 active" note="2 rarely used" opportunity="₹9.6K annual opportunity" />}
      </div></section>

      <section className="charts-grid section-anchor tab-section" hidden={!dataAvailable.money || (active!=="Overview"&&active!=="Money")} id="money" data-section="Money">
        <article className="panel chart-card"><div className="card-top"><div><p className="eyebrow">WHERE DID IT GO? 💸</p><h3>Your money, mapped.</h3></div><select className="ghost" aria-label="Chart resource"><option>Money</option><option>Time</option></select></div><div className="money-chart"><div className="donut" role="img" aria-label="Money allocation donut chart"><div><strong>{inr(80000)}</strong><small>TOTAL USED</small></div></div><div className="legend">{money.map(([name,value,color]) => <button key={name} onClick={()=>setNotice(`${name}: ${inr(value)} this month`)}><i style={{background:color}}/><span>{name}</span><b>{inr(value)}</b><small>{Math.round(value/800)}%</small></button>)}</div></div><div className="insight"><span>✦</span><p><b>Dining is 14% above your 3-month average.</b><small>A 10% adjustment would redirect ₹800/month.</small></p><button onClick={()=>{setReduction(10);navigate("Future")}}>Review →</button></div></article>
        <article className="panel trend-card"><div className="card-top"><div><p className="eyebrow">RESOURCE MOMENTUM</p><h3>12-month trend</h3></div><span className="positive">↑ 18% improved</span></div><div className="bar-chart" aria-label="Twelve month resource momentum chart">{monthly.map((v,i)=><div key={i}><i style={{height:`${v}%`}} className={i===11?"current":""}/><small>{["S","O","N","D","J","F","M","A","M","J","J","A"][i]}</small></div>)}</div><div className="trend-stats"><span><b>{inr(18400)}</b>redirected this year</span><span><b>+46 hours</b>reclaimed</span></div></article>
      </section>

      <section className="future panel section-anchor tab-section" hidden={!dataAvailable.money || (active!=="Overview"&&active!=="Future")} id="future" data-section="Future"><div className="future-copy"><p className="eyebrow">WHAT IF? SIMULATOR 🔮 <button className="inline-info" aria-label="About projections" onClick={()=>setInfo("projection")}>i</button></p><h2>See what small changes<br/>could become.</h2><p>Adjust the assumptions. The arithmetic updates instantly.</p><div className="control"><label>Reduce flexible spending <b>{reduction}%</b></label><input aria-label="Spending reduction percentage" type="range" min="5" max="30" step="5" value={reduction} onChange={e=>{const value=+e.target.value;setReduction(value);celebrate(`🌟 Saving an extra ${value}% opens a faster path to your goal!`,["💰","✨","🎯","🚀","🌱"])}}/><div><span>5%</span><span>30%</span></div></div><div className="choice-row"><label>Time horizon<select value={years} onChange={e=>{const value=+e.target.value;setYears(value);celebrate(`🎉 In ${value} years, consistent small savings can become ${inr(calculateProjection({monthlySpending:80000,reductionPercentage:reduction,years:value,annualReturn,currentSavings:200000}).futureInvestmentValue)}!`,["🎉","📈","💎","🏡","✨"])}}>{[1,3,5,10,15,20,25,30].map(v=><option key={v} value={v}>{v} years</option>)}</select></label><label>Assumed return<select value={annualReturn} onChange={e=>{const value=+e.target.value;setAnnualReturn(value);celebrate(`📈 Scenario updated with ${value}% illustrative growth`,["📈","✨","🌱"])}}>{[0,4,6,8,10,12].map(v=><option key={v} value={v}>{v}%</option>)}</select></label></div></div><div className="future-result"><div className="mode-switch"><button onClick={()=>setMode("cash")} className={mode==="cash"?"selected":""}>Cash saved</button><button onClick={()=>setMode("growth")} className={mode==="growth"?"selected":""}>Potential growth</button></div><p>After {years} years</p><strong>{inr(mode === "growth" ? projection.futureInvestmentValue : projection.futureCashValue)}</strong><small>from {inr(projection.monthlySavings)}/month redirected</small><div className="achievement-message"><span>🏆</span><p><b>Your {inr(goal)} goal is achievable.</b> By redirecting an extra {reduction}% each month, your estimated path becomes <strong>{(goalOptimized/12).toFixed(1)} years</strong>—about {yearsSooner.toFixed(1)} years sooner than your current path.</p></div><div className="growth-bars">{[5,10,15,20].map((y,i)=>{const p=calculateProjection({monthlySpending:80000,reductionPercentage:reduction,years:y,annualReturn,currentSavings:200000}); const val=mode==="growth"?p.futureInvestmentValue:p.futureCashValue; return <div key={y}><span>{y}y</span><i style={{height:`${28+i*17}%`}}/><b>{compact(val)}</b></div>})}</div><p className="disclaimer">Illustrative projection based on your assumptions. Returns can vary and are not guaranteed.</p></div></section>

      <section className="opps-goals section-anchor tab-section" hidden={!hasAnyData || (active!=="Overview"&&active!=="Opportunities"&&active!=="Goals")} id="opportunities" data-section="Opportunities"><article className="panel" hidden={active==="Goals"}><div className="card-top"><div><p className="eyebrow">TOP OPPORTUNITIES 💡</p><h3>High impact, low disruption.</h3></div><button className="text-button" onClick={()=>setNotice("✨ You are already viewing all current opportunities")}>View all →</button></div>{[{id:"food",icon:"🍜",name:"Food delivery",meta:"₹9,400 / month",save:"₹22,560 / year",difficulty:"Easy"},{id:"social",icon:"📱",name:"Social media",meta:"2h 30m / day",save:"182 hours / year",difficulty:"Medium"},{id:"subs",icon:"🔁",name:"Rarely used subscriptions",meta:"2 subscriptions",save:"₹9,600 / year",difficulty:"Easy"}].filter(o=>!dismissed.includes(o.id)).map(o=><div className="opp" key={o.id}><span className="opp-icon">{o.icon}</span><div><b>{o.name}</b><small>{o.meta}</small></div><span><b>{o.save}</b><small>potential impact</small></span><em>{o.difficulty}</em><button aria-label={`Dismiss ${o.name}`} onClick={()=>{setDismissed([...dismissed,o.id]);setNotice(`Dismissed ${o.name} — your preferences help LifeROI learn`)}}>×</button></div>)}</article><article className="panel goal-card section-anchor" hidden={active==="Opportunities" || !dataAvailable.goals} id="goals" data-section="Goals"><div className="card-top"><div><p className="eyebrow">YOUR GOAL 🎯</p><h3>Home down payment</h3></div><span className="goal-house">🏠</span></div><div className="goal-amount"><span><b>{inr(200000)}</b> saved</span><span><b>{inr(goal)}</b> target</span></div><input aria-label="Goal target" className="goal-progress" type="range" min="500000" max="3000000" step="100000" value={goal} onChange={e=>{const value=+e.target.value;setGoal(value);celebrate(`🎯 Goal updated to ${inr(value)} — your plan adjusted instantly`,["🎯","🏡","✨"])}}/><div className="goal-times"><span><small>Current path</small><b>{(goalCurrent/12).toFixed(1)} years</b></span><span className="better"><small>With {reduction}% optimization</small><b>{(goalOptimized/12).toFixed(1)} years</b></span></div><p><span>✦</span> You could reach this goal <b>{Math.max(0,((goalCurrent-goalOptimized)/12)).toFixed(1)} years sooner.</b></p></article></section>

      <section className="time-card panel section-anchor tab-section" hidden={!dataAvailable.time || (active!=="Overview"&&active!=="Time")} id="time" data-section="Time"><div><p className="eyebrow">TIME OPPORTUNITY ⏳</p><h2>Your attention has future value, too.</h2><p>A {reduction}% social media reduction recovers <b>{recovered.dailyMinutes.toFixed(0)} minutes a day</b>—around <b>{recovered.annualHours.toFixed(0)} hours each year</b>. That could become <b>{timeTarget}</b>.</p></div><div className="time-alloc"><span>Redirect it toward</span>{["📚 Learning","🏋 Fitness","🎨 Hobbies","😴 Rest"].map(x=><button className={timeTarget===x?"selected":""} onClick={()=>{setTimeTarget(x);celebrate(`${x} is now your reclaimed-time focus!`,["⏳","✨",x.split(" ")[0]])}} key={x}>{x}</button>)}</div></section>
      <section className="energy-card panel section-anchor tab-section" hidden={!dataAvailable.energy || (active!=="Overview"&&active!=="Energy")} id="energy" data-section="Energy"><div className="energy-bolt">⚡</div><div><p className="eyebrow">ENERGY INTELLIGENCE <button className="inline-info" aria-label="About energy efficiency" onClick={()=>setInfo("energy")}>i</button></p><h2>Your home used 420 kWh this month.</h2><p>That is 8.1% lower than July. Keep the streak going and the estimated annual opportunity is <b>₹5,400</b>.</p></div><div className="energy-gauge"><i><span /></i><b>76</b><small>efficiency</small></div><button onClick={()=>celebrate("⚡ Energy-saver plan activated — great momentum!",["⚡","🌱","🏆","✨"])}>Activate saver plan</button></section>
      <section className="settings-card panel section-anchor tab-section" hidden={active!=="Settings"} id="settings" data-section="Settings"><div><p className="eyebrow">PRIVACY & PREFERENCES ⚙️ <button className="inline-info" aria-label="About privacy settings" onClick={()=>setInfo("privacy")}>i</button></p><h2>You control your resource data.</h2><p>Choose what happens to original documents after confirmed extraction.</p><div className="settings-assurance"><span>🔐</span><p><b>Private by design</b> Every confirmed record is isolated to your account. Source files are never shown on the dashboard when extraction data is unavailable.</p></div></div><div className="settings-options">{["Delete source after extraction","Keep for 30 days","Keep until I delete it"].map(x=><button className={retention===x?"selected":""} onClick={()=>{setRetention(x);setNotice(`🔒 Privacy setting saved: ${x}`)}} key={x}><span>{retention===x?"✓":""}</span>{x}</button>)}</div></section>
      <footer><span><b>LifeROI</b> · Demo data only</span><span>Your data stays yours. <button onClick={()=>navigate("Settings")}>Privacy controls</button></span></footer>
    </section>

    <nav className="mobile-nav">{nav.slice(0,5).map(([icon,label])=><button key={label} className={active===label?"active":""} onClick={()=>navigate(label)}><span>{icon}</span>{label}</button>)}</nav>
    <button className="advisor-launcher" onClick={()=>navigate("AI Advisor")} aria-label="Open LifeROI Advisor"><span>🤖</span><b>Ask LifeROI</b><i>✦</i></button>
    {burst && <div key={burst.id} className="emoji-burst" aria-hidden="true">{burst.emojis.map((emoji,index)=><span key={`${emoji}-${index}`}>{emoji}</span>)}</div>}
    {notice && <div className="toast" role="status">{notice}</div>}
    {upload && <Modal title="Add resource data" onClose={()=>setUpload(false)}><div className="dropzone"><span>↥</span><h3>Drop your resource data here ✨</h3><p>PDF, screenshot, CSV, or text · up to 10 MB</p><button className="primary" onClick={()=>{setUpload(false);setNotice("✨ Demo statement analyzed — review is ready")}}>Analyze a demo statement</button></div><div className="modal-note"><b>🔒 Private by design</b><span>Files are user-isolated and can be deleted after extraction.</span></div></Modal>}
    {advisor && <Modal title="LifeROI Advisor" onClose={()=>setAdvisor(false)}><div className={`advisor-answer ${advisorThinking?"thinking":""}`}><span>{advisorThinking?"◌":"✦"}</span><p>{advisorQuestion && <small className="advisor-question">You asked: {advisorQuestion}</small>}<b>{advisorThinking?"Thinking across your resource data…":advisorReply}</b></p></div><div className="suggestions">{Object.keys(advisorReplies).map(x=><button key={x} onClick={()=>{setAdvisorInput(x);advisorInputRef.current?.focus()}}>{x}</button>)}</div><form className="chat-input" onSubmit={e=>{e.preventDefault();askAdvisor()}}><input ref={advisorInputRef} value={advisorInput} onChange={e=>setAdvisorInput(e.target.value)} aria-label="Ask LifeROI" placeholder="Ask about your resources…" autoFocus/><button type="submit" disabled={!advisorInput.trim() || advisorThinking} aria-label="Send question">↑</button></form><small className="data-note">Answers use only your available LifeROI data. Press Enter to send.</small></Modal>}
    {info && <Modal title={info==="score"?"How your Resource Score works":info==="projection"?"About future projections":info==="energy"?"About energy efficiency":"Privacy settings explained"} onClose={()=>setInfo(null)}><div className="info-content"><span>{info==="score"?"🧭":info==="projection"?"🔮":info==="energy"?"⚡":"🔐"}</span><div>{info==="score"?<><h3>A helpful estimate—not a judgment</h3><p>The score combines only your available, confirmed money, time, energy, subscription, and sustainability data. Missing resources are excluded rather than guessed.</p></>:info==="projection"?<><h3>Deterministic arithmetic</h3><p>Cash savings use exact arithmetic. Potential growth uses your selected illustrative return and is never guaranteed. Change the inputs to compare paths.</p></>:info==="energy"?<><h3>Based on available utility data</h3><p>Efficiency compares your confirmed kWh usage with recent periods. LifeROI will not display this section when no electricity data is available.</p></>:<><h3>Your data, your rules</h3><p>Choose source-document retention independently from confirmed insights. Deleting a source does not remove a record you have reviewed and chosen to keep.</p></>}</div></div></Modal>}
  </main>;
}

function Metric({icon,tone,name,value,trend,note,opportunity,down=false}:{icon:string;tone:string;name:string;value:string;trend:string;note:string;opportunity:string;down?:boolean}) { return <article className="metric panel"><div className={`metric-icon ${tone}`}>{icon}</div><div className="metric-main"><span>{name}</span><strong>{value}</strong><small className={down?"good":"neutral"}>{down?"↓":"•"} {trend} <i>{note}</i></small></div><div className="sparkline"><i/><i/><i/><i/><i/><i/></div><p><span>✦</span>{opportunity}</p></article> }
function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}) { return <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="modal" role="dialog" aria-modal="true" aria-label={title}><header><div><span className="brand-mark">L</span><h2>{title}<small>Secure demo workspace</small></h2></div><button aria-label="Close" onClick={onClose}>×</button></header>{children}</section></div> }
function EmptyState({title,message,onAdd}:{title:string;message:string;onAdd:()=>void}) { return <section className="empty-state panel"><span>🌱</span><h2>{title}</h2><p>{message}</p><button className="primary" onClick={onAdd}>＋ Add resource data</button></section> }
