"use client";

import { useMemo, useState } from "react";
import { calculateProjection, monthsToGoal, timeRecovered } from "./domain/projection";

const money = [
  ["Housing", 25000, "#8c7cff"], ["Groceries", 10000, "#2dd4bf"], ["Dining", 8000, "#ff916e"],
  ["Transport", 8000, "#61a5ff"], ["Shopping", 7000, "#d66cff"], ["Other", 22000, "#55617e"],
] as const;
const monthly = [74, 78, 76, 82, 79, 84, 81, 86, 83, 88, 87, 92];
const nav = [["⌂","Overview"],["↥","Upload"],["₹","Money"],["◷","Time"],["ϟ","Energy"],["♻","Resources"],["◇","Future"],["◎","Goals"],["✦","Opportunities"],["✣","AI Advisor"],["⚙","Settings"]];

const inr = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const compact = (n: number) => new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(n);

export default function LifeROIDashboard() {
  const [active, setActive] = useState("Overview");
  const [reduction, setReduction] = useState(10);
  const [years, setYears] = useState(10);
  const [annualReturn, setAnnualReturn] = useState(8);
  const [mode, setMode] = useState<"growth" | "cash">("growth");
  const [upload, setUpload] = useState(false);
  const [advisor, setAdvisor] = useState(false);
  const [goal, setGoal] = useState(1500000);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const projection = useMemo(() => calculateProjection({ monthlySpending: 80000, reductionPercentage: reduction, years, annualReturn, currentSavings: 200000, inflationRate: 5 }), [reduction, years, annualReturn]);
  const recovered = timeRecovered(150, reduction);
  const goalCurrent = monthsToGoal(goal, 200000, 20000);
  const goalOptimized = monthsToGoal(goal, 200000, 20000 + projection.monthlySavings);

  function navigate(label: string) {
    setActive(label);
    if (label === "Upload") setUpload(true);
    if (label === "AI Advisor") setAdvisor(true);
    document.getElementById(label.toLowerCase().replace(" ", "-"))?.scrollIntoView({ behavior: "smooth" });
  }

  return <main className="app-shell">
    <aside className="sidebar" aria-label="Primary navigation">
      <button className="brand" onClick={() => navigate("Overview")}><span className="brand-mark">L</span><span>LifeROI<small>Resource intelligence</small></span></button>
      <nav>{nav.map(([icon,label]) => <button key={label} onClick={() => navigate(label)} className={active === label ? "active" : ""}><span>{icon}</span>{label}{label === "Opportunities" && <b>3</b>}</button>)}</nav>
      <div className="side-foot"><div className="mini-avatar">A</div><div><strong>Arjun Mehta</strong><small>Demo workspace</small></div><button aria-label="More account options">•••</button></div>
    </aside>

    <section className="content" id="overview">
      <header className="topbar"><div><p className="eyebrow">THURSDAY, 13 AUGUST</p><h1>Good morning, Arjun <span>👋</span></h1><p>Here’s how your resources moved this month.</p></div><div className="header-actions"><button className="icon-button" aria-label="Notifications">♢<i /></button><button className="primary" onClick={() => setUpload(true)}>＋ Add data</button></div></header>

      <section className="hero-grid">
        <article className="score-card panel"><div className="score-copy"><div className="card-label"><span className="pulse-dot"/> YOUR RESOURCE SCORE <button aria-label="About this score">?</button></div><div className="score"><strong>78</strong><span>/100</span></div><p>Strong momentum <span>↗</span></p><small>An estimate based on your connected data—not a judgment.</small></div><div className="score-ring" aria-label="Resource score 78 out of 100"><span>78<small>SCORE</small></span></div><div className="score-bars">{[["Money",82],["Time",69],["Energy",76],["Subscriptions",85],["Sustainability",77]].map(([name,val]) => <div key={name}><label>{name}<b>{val}</b></label><i><span style={{width: `${val}%`}} /></i></div>)}</div></article>
        <article className="opportunity-hero panel"><div className="orb orb-one"/><div className="orb orb-two"/><div className="spark">✦</div><p className="eyebrow">THIS MONTH’S OPPORTUNITY</p><h2>Small shifts.<br/>A bigger future.</h2><p>Redirecting just <b>10%</b> of flexible spending could create</p><strong>{inr(8000)}<small>/month</small></strong><div className="impact-row"><span><b>{inr(96000)}</b>per year</span><span><b>96 hours</b>reclaimed</span></div><button onClick={() => document.getElementById("future")?.scrollIntoView({behavior:"smooth"})}>Explore your future <span>→</span></button></article>
      </section>

      <section className="section-block"><div className="section-head"><div><p className="eyebrow">YOUR MONTH AT A GLANCE</p><h2>Every resource tells a story.</h2></div><button className="ghost">July 2026⌄</button></div><div className="metric-grid">
        <Metric icon="₹" tone="violet" name="Money used" value={inr(80000)} trend="4.2%" down note="vs. last month" opportunity="₹96K annual opportunity" />
        <Metric icon="◷" tone="cyan" name="Screen time" value="5h 30m" trend="3.8%" note="daily average" opportunity="182 hrs/year recoverable" />
        <Metric icon="ϟ" tone="green" name="Electricity" value="420 kWh" trend="8.1%" down note="vs. last month" opportunity="₹5.4K annual opportunity" />
        <Metric icon="↻" tone="orange" name="Subscriptions" value={inr(3000)} trend="12 active" note="2 rarely used" opportunity="₹9.6K annual opportunity" />
      </div></section>

      <section className="charts-grid">
        <article className="panel chart-card"><div className="card-top"><div><p className="eyebrow">WHERE DID IT GO?</p><h3>Your money, mapped.</h3></div><button className="ghost">Money⌄</button></div><div className="money-chart"><div className="donut" role="img" aria-label="Money allocation donut chart"><div><strong>{inr(80000)}</strong><small>TOTAL USED</small></div></div><div className="legend">{money.map(([name,value,color]) => <div key={name}><i style={{background:color}}/><span>{name}</span><b>{inr(value)}</b><small>{Math.round(value/800)}%</small></div>)}</div></div><div className="insight"><span>✦</span><p><b>Dining is 14% above your 3-month average.</b><small>A 10% adjustment would redirect ₹800/month.</small></p><button>Review →</button></div></article>
        <article className="panel trend-card"><div className="card-top"><div><p className="eyebrow">RESOURCE MOMENTUM</p><h3>12-month trend</h3></div><span className="positive">↑ 18% improved</span></div><div className="bar-chart" aria-label="Twelve month resource momentum chart">{monthly.map((v,i)=><div key={i}><i style={{height:`${v}%`}} className={i===11?"current":""}/><small>{["S","O","N","D","J","F","M","A","M","J","J","A"][i]}</small></div>)}</div><div className="trend-stats"><span><b>{inr(18400)}</b>redirected this year</span><span><b>+46 hours</b>reclaimed</span></div></article>
      </section>

      <section className="future panel" id="future"><div className="future-copy"><p className="eyebrow">WHAT IF? SIMULATOR</p><h2>See what small changes<br/>could become.</h2><p>Adjust the assumptions. The arithmetic updates instantly.</p><div className="control"><label>Reduce flexible spending <b>{reduction}%</b></label><input aria-label="Spending reduction percentage" type="range" min="5" max="30" step="5" value={reduction} onChange={e=>setReduction(+e.target.value)}/><div><span>5%</span><span>30%</span></div></div><div className="choice-row"><label>Time horizon<select value={years} onChange={e=>setYears(+e.target.value)}>{[1,3,5,10,15,20,25,30].map(v=><option key={v} value={v}>{v} years</option>)}</select></label><label>Assumed return<select value={annualReturn} onChange={e=>setAnnualReturn(+e.target.value)}>{[0,4,6,8,10,12].map(v=><option key={v} value={v}>{v}%</option>)}</select></label></div></div><div className="future-result"><div className="mode-switch"><button onClick={()=>setMode("cash")} className={mode==="cash"?"selected":""}>Cash saved</button><button onClick={()=>setMode("growth")} className={mode==="growth"?"selected":""}>Potential growth</button></div><p>After {years} years</p><strong>{inr(mode === "growth" ? projection.futureInvestmentValue : projection.futureCashValue)}</strong><small>from {inr(projection.monthlySavings)}/month redirected</small><div className="growth-bars">{[5,10,15,20].map((y,i)=>{const p=calculateProjection({monthlySpending:80000,reductionPercentage:reduction,years:y,annualReturn,currentSavings:200000}); const val=mode==="growth"?p.futureInvestmentValue:p.futureCashValue; return <div key={y}><span>{y}y</span><i style={{height:`${28+i*17}%`}}/><b>{compact(val)}</b></div>})}</div><p className="disclaimer">Illustrative projection based on your assumptions. Returns can vary and are not guaranteed.</p></div></section>

      <section className="opps-goals" id="opportunities"><article className="panel"><div className="card-top"><div><p className="eyebrow">TOP OPPORTUNITIES</p><h3>High impact, low disruption.</h3></div><button className="text-button">View all →</button></div>{[{id:"food",icon:"🍜",name:"Food delivery",meta:"₹9,400 / month",save:"₹22,560 / year",difficulty:"Easy"},{id:"social",icon:"◉",name:"Social media",meta:"2h 30m / day",save:"182 hours / year",difficulty:"Medium"},{id:"subs",icon:"↻",name:"Rarely used subscriptions",meta:"2 subscriptions",save:"₹9,600 / year",difficulty:"Easy"}].filter(o=>!dismissed.includes(o.id)).map(o=><div className="opp" key={o.id}><span className="opp-icon">{o.icon}</span><div><b>{o.name}</b><small>{o.meta}</small></div><span><b>{o.save}</b><small>potential impact</small></span><em>{o.difficulty}</em><button aria-label={`Dismiss ${o.name}`} onClick={()=>setDismissed([...dismissed,o.id])}>×</button></div>)}</article><article className="panel goal-card" id="goals"><div className="card-top"><div><p className="eyebrow">YOUR GOAL</p><h3>Home down payment</h3></div><span>🏠</span></div><div className="goal-amount"><span><b>{inr(200000)}</b> saved</span><span><b>{inr(goal)}</b> target</span></div><input aria-label="Goal target" className="goal-progress" type="range" min="500000" max="3000000" step="100000" value={goal} onChange={e=>setGoal(+e.target.value)}/><div className="goal-times"><span><small>Current path</small><b>{(goalCurrent/12).toFixed(1)} years</b></span><span className="better"><small>With {reduction}% optimization</small><b>{(goalOptimized/12).toFixed(1)} years</b></span></div><p><span>✦</span> You could reach this goal <b>{Math.max(0,((goalCurrent-goalOptimized)/12)).toFixed(1)} years sooner.</b></p></article></section>

      <section className="time-card panel" id="time"><div><p className="eyebrow">TIME OPPORTUNITY</p><h2>Your attention has future value, too.</h2><p>A {reduction}% social media reduction recovers <b>{recovered.dailyMinutes.toFixed(0)} minutes a day</b>—around <b>{recovered.annualHours.toFixed(0)} hours each year</b>.</p></div><div className="time-alloc"><span>Redirect it toward</span>{["📚 Learning","🏋 Fitness","🎨 Hobbies","😴 Rest"].map(x=><button key={x}>{x}</button>)}</div></section>
      <footer><span><b>LifeROI</b> · Demo data only</span><span>Your data stays yours. <button onClick={()=>navigate("Settings")}>Privacy controls</button></span></footer>
    </section>

    <nav className="mobile-nav">{nav.slice(0,5).map(([icon,label])=><button key={label} className={active===label?"active":""} onClick={()=>navigate(label)}><span>{icon}</span>{label}</button>)}</nav>
    {upload && <Modal title="Add resource data" onClose={()=>setUpload(false)}><div className="dropzone"><span>↥</span><h3>Drop your resource data here ✨</h3><p>PDF, screenshot, CSV, or text · up to 10 MB</p><button className="primary" onClick={()=>setUpload(false)}>Choose a demo file</button></div><div className="modal-note"><b>Private by design</b><span>Files are user-isolated and can be deleted after extraction.</span></div></Modal>}
    {advisor && <Modal title="LifeROI Advisor" onClose={()=>setAdvisor(false)}><div className="advisor-answer"><span>✦</span><p><b>Your lowest-disruption opportunity is subscription cleanup.</b><br/>Two rarely used subscriptions total about ₹800/month. Pausing them would redirect ₹9,600/year without changing your daily routine.</p></div><div className="suggestions">{["Where am I overspending?","Can I reach my goal in 5 years?","Show my biggest recurring costs"].map(x=><button key={x}>{x}</button>)}</div><div className="chat-input"><input aria-label="Ask LifeROI" placeholder="Ask about your resources…"/><button>↑</button></div><small className="data-note">Answers use only your available LifeROI data.</small></Modal>}
  </main>;
}

function Metric({icon,tone,name,value,trend,note,opportunity,down=false}:{icon:string;tone:string;name:string;value:string;trend:string;note:string;opportunity:string;down?:boolean}) { return <article className="metric panel"><div className={`metric-icon ${tone}`}>{icon}</div><div className="metric-main"><span>{name}</span><strong>{value}</strong><small className={down?"good":"neutral"}>{down?"↓":"•"} {trend} <i>{note}</i></small></div><div className="sparkline"><i/><i/><i/><i/><i/><i/></div><p><span>✦</span>{opportunity}</p></article> }
function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}) { return <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="modal" role="dialog" aria-modal="true" aria-label={title}><header><div><span className="brand-mark">L</span><h2>{title}<small>Secure demo workspace</small></h2></div><button aria-label="Close" onClick={onClose}>×</button></header>{children}</section></div> }
