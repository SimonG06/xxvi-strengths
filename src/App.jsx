import { useState, useRef, useEffect } from "react";

const WORK_STYLES = ['Discovery','Strategic','Organisational','Relational','Editorial','Design','Storytelling','Conceptual'];

const STYLE_DEFS = {
  Organisational: "Brings order to chaos. Strong at structuring information, building systems, applying logic, and creating clarity from complexity.",
  Strategic: "Thinks with purpose. Applies logic and theory to solve complex problems, harmonises conflicting inputs, and builds systems oriented toward a clear goal.",
  Storytelling: "Composes and connects. Writes with imagination and flow, engages audiences, plans content, and finds the most compelling way to express an idea.",
  Conceptual: "Makes unexpected connections. Uses associative and inventive thinking to solve problems — expansive when exploring, precise when distilling.",
  Discovery: "Digs until they find it. Researches with rigour and creativity, gathers intelligence through workshops, interviews and unlikely sources.",
  Design: "Builds for humans. User-centred thinking that reduces friction, improves outcomes, and makes information and systems feel intuitive and right.",
  Editorial: "Raises the bar. Precise, quality-driven, and deeply respectful of the author's voice. Improves everything they touch.",
  Relational: "Reads the room. Innately understands people, relationships, and what needs to be said and when. Brings empathy, motivation and energy to every interaction.",
};

const STYLE_COLORS = {
  Discovery:'#6B46C1', Strategic:'#2B6CB0', Organisational:'#276749',
  Relational:'#C53030', Editorial:'#4A7C59', Design:'#C05621',
  Storytelling:'#B83280', Conceptual:'#6B5FD4'
};

const GROUPS = [
  { id:"building", label:"Project Building Blocks", sectionCopy:"Let's kick off with some core projects", tasks:[
    {name:"Content Review",           desc:"Content audits, brand voice reviews etc.",                                                              primary:"Editorial",      others:["Organisational","Strategic"]},
    {name:"Creative Concepts",        desc:"Concept ideation, territory mapping, refining ideas etc.",                                             primary:"Conceptual",     others:["Discovery","Storytelling"]},
    {name:"Brand Voice Articulation", desc:"Synthesis of inputs, creative exploration, voice refinement etc.",                                     primary:"Storytelling",   others:["Conceptual","Editorial"]},
    {name:"Discovery & Research",     desc:"Deep dive into background, gathering and collating data, researching clients or sectors etc.",          primary:"Discovery",      others:["Strategic","Organisational"]},
    {name:"Competitor Review",        desc:"Analysis of market, broad view of competitors in sector, finding useful examples etc.",                primary:"Discovery",      others:["Strategic","Conceptual"]},
    {name:"Pack Design",              desc:"Planning and building a presentation using design principles, creating a professional standard pack.",  primary:"Design",         others:["Organisational","Storytelling"]},
    {name:"Naming",                   desc:"Generating long list of names, writing rationales, refining through stages, top level IP search.",     primary:"Conceptual",     others:["Storytelling","Discovery"]},
    {name:"Journey Mapping",          desc:"Creating clear and useful maps of user journeys, identifying touchpoints and trigger moments.",         primary:"Discovery",      others:["Organisational","Strategic"]},
    {name:"Content Design",           desc:"Planning content as a messaging system, considering hierarchy, functionality and goals.",               primary:"Strategic",      others:["Design","Editorial"]},
    {name:"Communications Platform",  desc:"Creating a unified messaging platform ensuring integrity across channels.",                            primary:"Strategic",      others:["Storytelling","Conceptual"]},
  ]},
  { id:"writing", label:"Writing Tasks", sectionCopy:"Ok word nerds, it's writin' time", tasks:[
    {name:"Strategic Writing",    desc:"Synthesising strategic inputs into plain language, vision statements etc.",                                 primary:"Strategic",      others:["Storytelling","Conceptual"]},
    {name:"Editing & Proofing",   desc:"Careful review of drafts to correct or improve quality, ensuring the highest standards.",                  primary:"Editorial",      others:["Storytelling","Organisational"]},
    {name:"Technical Writing",    desc:"Writing requiring a high degree of precision, often for clients in highly regulated sectors.",             primary:"Editorial",      others:["Organisational","Strategic"]},
    {name:"Copywriting",          desc:"Writing for engagement or persuasion in a brand voice, often short form headlines or ad copy.",            primary:"Storytelling",   others:["Conceptual","Editorial"]},
    {name:"Content Writing",      desc:"Engaging longer form writing presenting a view of subject matter, often with a point of view.",            primary:"Storytelling",   others:["Editorial","Conceptual"]},
    {name:"Messaging Rollout",    desc:"Populating applications with variations of approved messaging within a messaging matrix.",                 primary:"Organisational", others:["Editorial","Strategic"]},
  ]},
  { id:"workshops", label:"Workshops & Sessions", sectionCopy:"There are no wrong answers, probably.", tasks:[
    {name:"Discovery Workshop",    desc:"Workshop held with client or focus group at project start to understand requirements and foster engagement.", primary:"Discovery",   others:["Relational","Strategic"]},
    {name:"Training Workshop",     desc:"Training client teams in new communications content, driving uptake of an existing tool.",                primary:"Relational",     others:["Storytelling","Organisational"]},
    {name:"Internal Presentation", desc:"Presenting to colleagues, whether project work or team focused.",                                        primary:"Relational",     others:["Strategic","Storytelling"]},
    {name:"Client Presentation",   desc:"Presenting work to clients in person or online.",                                                        primary:"Relational",     others:["Storytelling","Strategic"]},
    {name:"Expert Facilitation",   desc:"High level presentations, panel discussions, recorded discussions etc.",                                 primary:"Relational",     others:["Conceptual","Strategic"]},
  ]},
  { id:"internal", label:"Internal Jobs", sectionCopy:"Just some last minute housekeeping", tasks:[
    {name:"Quoting",          desc:"Breaking down a project into tasks and estimating time/cost, adding narrative to ensure clarity.",             primary:"Strategic",      others:["Organisational","Storytelling"]},
    {name:"Project Planning", desc:"Mapping out sequence of tasks in a project, understanding how time should be spent.",                         primary:"Organisational", others:["Strategic","Relational"]},
    {name:"Team Building",    desc:"Activities or contributions designed to improve team connection, collaboration and vibe.",                     primary:"Relational",     others:["Conceptual","Discovery"]},
    {name:"Admin",            desc:"Filing, timesheets etc.",                                                                                     primary:"Organisational", others:["Editorial","Strategic"]},
    {name:"Communication",    desc:"Responsiveness to queries, communication around availability, clarity through handovers.",                    primary:"Relational",     others:["Organisational","Strategic"]},
  ]},
];

// Rating values: 1-5 = scale, 0 = opt-out
const SCORE_MAP = {1:5, 2:3.75, 3:2.5, 4:1.25, 5:0, 0:null};

// 60/25/15 weighting — primary tag carries more signal
const W = { p: 0.60, s: 0.25, t: 0.15 };

// Theoretical maximum = all tasks answered as 1 (5pts each)
const MAX_EXPOSURE = {
  Strategic:4.750, Relational:4.000, Storytelling:3.900, Organisational:3.750,
  Editorial:3.000, Discovery:2.950, Conceptual:2.800, Design:0.850,
};

function shuffle(arr){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

function buildTaskList(){
  return GROUPS.flatMap(g=>shuffle(g.tasks).map(t=>({...t,groupId:g.id,groupLabel:g.label,sectionCopy:g.sectionCopy})));
}

function computeScores(ratings){
  const s={};WORK_STYLES.forEach(ws=>s[ws]=0);
  GROUPS.flatMap(g=>g.tasks).forEach(task=>{
    const r=ratings[task.name];
    if(r===undefined||r===0) return;
    const pts=SCORE_MAP[r];
    if(pts===null) return;
    s[task.primary]  += pts * W.p;
    s[task.others[0]]+= pts * W.s;
    s[task.others[1]]+= pts * W.t;
  });
  // Express as % of theoretical max (all tasks answered as 1 = 5pts)
  const norm={};
  WORK_STYLES.forEach(ws=>{
    const maxPossible=(MAX_EXPOSURE[ws]||1)*5;
    norm[ws]=Math.round(s[ws]/maxPossible*100);
  });
  return norm;
}

function getTop3(scores){
  return Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e[0]);
}

function getBottom2(scores){
  return Object.entries(scores).sort((a,b)=>a[1]-b[1]).slice(0,2).map(e=>e[0]);
}

function getArchetypeFallback(top3){
  const ARCHETYPES={
    "Discovery-Strategic-Storytelling":"The Visionary Architect",
    "Discovery-Conceptual-Strategic":"The Insight Hunter",
    "Discovery-Relational-Storytelling":"The Human-Centred Researcher",
    "Discovery-Strategic-Organisational":"The Intelligence Builder",
    "Strategic-Storytelling-Relational":"The Influential Leader",
    "Strategic-Conceptual-Discovery":"The Insight Architect",
    "Strategic-Organisational-Discovery":"The Systems Thinker",
    "Strategic-Relational-Organisational":"The Empowered Planner",
    "Storytelling-Conceptual-Strategic":"The Expressive Thinker",
    "Storytelling-Editorial-Organisational":"The Refined Communicator",
    "Storytelling-Relational-Design":"The Engaging Creator",
    "Storytelling-Discovery-Conceptual":"The Story Hunter",
    "Conceptual-Strategic-Storytelling":"The Visionary Maker",
    "Conceptual-Discovery-Design":"The Curious Maker",
    "Conceptual-Editorial-Storytelling":"The Thoughtful Author",
    "Conceptual-Relational-Discovery":"The Inspired Connector",
    "Organisational-Editorial-Strategic":"The Meticulous Operator",
    "Organisational-Relational-Strategic":"The Collaborative Enabler",
    "Organisational-Strategic-Design":"The Structured Builder",
    "Design-Conceptual-Storytelling":"The Expressive Designer",
    "Design-Strategic-Relational":"The Impact Designer",
    "Design-Discovery-Conceptual":"The Human Investigator",
    "Editorial-Storytelling-Conceptual":"The Critical Voice",
    "Editorial-Organisational-Strategic":"The Standard Bearer",
    "Relational-Strategic-Organisational":"The Connected Orchestrator",
    "Relational-Storytelling-Conceptual":"The People Narrator",
  };
  const key=top3.join("-");
  if(ARCHETYPES[key]) return ARCHETYPES[key];
  for(const[k,v] of Object.entries(ARCHETYPES)){
    if([...k.split("-")].sort().join("-")===[...top3].sort().join("-")) return v;
  }
  return `The ${top3[0]} ${top3[1]}`;
}

async function generateNarrative(name,top3,bottom2){
  const topDescs=top3.map(s=>STYLE_DEFS[s]).join(" ");
  const prompt=`Write three things for a work style profile at XXVI, Australia's leading brand voice and language agency.

1. A profile title starting with "The" — 2-4 words. An evocative synthesis of these three strengths: ${top3.join(", ")}. Not just the names concatenated — find a phrase capturing what this combination means as a working identity. Like "The Curious Narrator" or "The Insight Architect". Make it specific.

2. A strengths summary — 2 sentences max in second person. Based on: ${top3.join(", ")}. Definitions: ${topDescs}. Warm and specific.

3. A support sentence — 1 sentence in second person. Honest but constructive about: ${bottom2.join(" and ")}.

Return ONLY valid JSON, no markdown: {"archetype": "...", "strengths": "...", "support": "..."}`;

  try{
    const r=await fetch("/api/narrative",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({name,top3,bottom2})
    });
    if(!r.ok){
      const errText=await r.text();
      console.error("API error:",r.status,errText);
      throw new Error(`API ${r.status}: ${errText}`);
    }
    const result=await r.json();
    return {
      archetype:result.archetype||getArchetypeFallback(top3),
      strengths:result.strengths||"",
      support:result.support||""
    };
  }catch(e){
    console.error("generateNarrative failed:",e);
    return {archetype:getArchetypeFallback(top3),strengths:"Your strength profile is ready — explore your results below.",support:""};
  }
}

// ── RADAR VIZ ──
function RadarViz({scores,top3,archetype,name}){
  const canvasRef=useRef(null);
  const CX=220,CY=210,MAX_R=155,MIN_R=15;
  const axes=[
    {name:'Discovery',      a:Math.PI*1.5},
    {name:'Strategic',      a:Math.PI*1.75},
    {name:'Organisational', a:0},
    {name:'Relational',     a:Math.PI*0.25},
    {name:'Editorial',      a:Math.PI*0.5},
    {name:'Design',         a:Math.PI*0.75},
    {name:'Storytelling',   a:Math.PI},
    {name:'Conceptual',     a:Math.PI*1.25},
  ];

  useEffect(()=>{
    const cv=canvasRef.current;if(!cv) return;
    const ctx=cv.getContext('2d');
    const W=440,H=430;
    ctx.clearRect(0,0,W,H);

    function sToR(s){return MIN_R+(s/100)*(MAX_R-MIN_R);}
    const pts=axes.map(ax=>({x:CX+sToR(scores[ax.name]||0)*Math.cos(ax.a),y:CY+sToR(scores[ax.name]||0)*Math.sin(ax.a),ax}));

    function catmullSegs(points,t=0.48){
      const n=points.length,segs=[];
      for(let i=0;i<n;i++){
        const p0=points[(i-1+n)%n],p1=points[i],p2=points[(i+1)%n],p3=points[(i+2)%n];
        segs.push({
          cp1x:p1.x+(p2.x-p0.x)*t/3,cp1y:p1.y+(p2.y-p0.y)*t/3,
          cp2x:p2.x-(p3.x-p1.x)*t/3,cp2y:p2.y-(p3.y-p1.y)*t/3,
          ex:p2.x,ey:p2.y
        });
      }
      return segs;
    }

    function drawShape(pts){
      ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);
      catmullSegs(pts).forEach(s=>ctx.bezierCurveTo(s.cp1x,s.cp1y,s.cp2x,s.cp2y,s.ex,s.ey));
      ctx.closePath();
    }

    const c0=STYLE_COLORS[top3[0]]||'#6B5FD4';
    const c1=STYLE_COLORS[top3[1]]||'#B83280';
    const c2=STYLE_COLORS[top3[2]]||'#2B6CB0';

    const grad=ctx.createRadialGradient(CX,CY,10,CX,CY,MAX_R);
    grad.addColorStop(0,c0+'99');
    grad.addColorStop(0.5,c1+'77');
    grad.addColorStop(1,c2+'44');

    // Reference circles — heavier weight
    [60,110,155].forEach((r,i)=>{
      ctx.beginPath();ctx.arc(CX,CY,r,0,Math.PI*2);
      ctx.strokeStyle=`rgba(0,0,0,${i===2?0.22:0.16})`;
      ctx.lineWidth=i===2?1.5:1.2;
      if(i===2)ctx.setLineDash([5,3]);
      ctx.stroke();ctx.setLineDash([]);
    });

    // Ring labels
    ctx.font='8px "Courier New",monospace';ctx.fillStyle='rgba(0,0,0,0.4)';ctx.textAlign='left';
    [['low',60],['mid',110],['high',155]].forEach(([l,r])=>ctx.fillText(l,CX+3,CY-r+9));

    // Axis lines — heavier weight
    axes.forEach(ax=>{
      ctx.strokeStyle='rgba(0,0,0,0.14)';ctx.lineWidth=1.2;
      ctx.beginPath();ctx.moveTo(CX,CY);
      ctx.lineTo(CX+168*Math.cos(ax.a),CY+168*Math.sin(ax.a));
      ctx.stroke();
    });

    // Filled shape
    drawShape(pts);
    ctx.fillStyle=grad;ctx.fill();
    ctx.strokeStyle=c0;ctx.lineWidth=2.2;ctx.lineJoin='round';ctx.stroke();

    // Dots
    pts.forEach((p)=>{
      ctx.beginPath();ctx.arc(p.x,p.y,4.5,0,Math.PI*2);
      ctx.fillStyle='white';ctx.fill();
      ctx.strokeStyle=STYLE_COLORS[p.ax.name]||'#888';ctx.lineWidth=2;ctx.stroke();
    });

    // Labels
    const labelDist=182;
    axes.forEach(ax=>{
      const lx=CX+labelDist*Math.cos(ax.a);
      const ly=CY+labelDist*Math.sin(ax.a);
      const cos=Math.cos(ax.a);
      ctx.textAlign=cos>0.25?'left':cos<-0.25?'right':'center';
      ctx.font='11px Georgia,serif';ctx.fillStyle='rgba(0,0,0,0.75)';
      ctx.fillText(ax.name,lx,ly+4);
    });

  },[scores,top3]);

  return <canvas ref={canvasRef} width={440} height={430} style={{width:'100%',maxWidth:440,display:'block',margin:'0 auto'}}/>;
}

// ── BAR CHART ──
function BarChart({scores}){
  const sorted=Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  return(
    <div style={{width:'100%'}}>
      {sorted.map(([ws,val])=>(
        <div key={ws} style={{display:'flex',alignItems:'center',gap:10,marginBottom:9}}>
          <div style={{width:115,fontSize:12,fontFamily:"'Courier New',monospace",color:'#4a3a20',textAlign:'right',flexShrink:0}}>{ws}</div>
          <div style={{flex:1,height:13,background:'#f0ead8',borderRadius:2,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${val}%`,background:STYLE_COLORS[ws]||'#888',borderRadius:2,transition:'width 0.8s ease'}}/>
          </div>
          <div style={{width:28,fontSize:11,fontFamily:"'Courier New',monospace",color:'#9a8860',textAlign:'right',flexShrink:0}}>{val}</div>
        </div>
      ))}
    </div>
  );
}

// ── APP ──
export default function App(){
  const [step,setStep]=useState(0);
  const [name,setName]=useState('');
  const [taskList]=useState(buildTaskList);
  const [ratings,setRatings]=useState({});
  const [taskIdx,setTaskIdx]=useState(0);
  const [currentSectionCopy,setCurrentSectionCopy]=useState('');
  const [currentSectionLabel,setCurrentSectionLabel]=useState('');
  const [narrativeData,setNarrativeData]=useState({strengths:'',support:''});
  const [narrativeLoading,setNarrativeLoading]=useState(false);
  const [scores,setScores]=useState({});
  const [top3,setTop3]=useState([]);
  const [archetype,setArchetype]=useState('');

  const totalTasks=taskList.length;
  const task=taskList[taskIdx];

  const progress=
    step===0?0:
    step===1?Math.round((taskIdx/totalTasks)*88):
    step===2?Math.round(((taskIdx+0.5)/totalTasks)*88):
    step>=3?100:0;

  function startQuestions(){
    setCurrentSectionLabel(taskList[0].groupLabel);
    setCurrentSectionCopy(taskList[0].sectionCopy);
    setStep(1);
  }

  function handleSectionContinue(){ setStep(2); }

  function handleRating(val){ setRatings(prev=>({...prev,[task.name]:val})); }

  function handleNext(){
    if(taskIdx<totalTasks-1){
      const next=taskList[taskIdx+1];
      const curr=taskList[taskIdx];
      if(next.groupId!==curr.groupId){
        setCurrentSectionLabel(next.groupLabel);
        setCurrentSectionCopy(next.sectionCopy);
        setTaskIdx(taskIdx+1);
        setStep(1);
      } else {
        setTaskIdx(taskIdx+1);
      }
    } else {
      finishAssessment();
    }
  }

  function handleBack(){
    if(step===1&&taskIdx===0){setStep(0);return;}
    if(step===1){
      // back from section screen — go to last question of previous section
      setTaskIdx(taskIdx-1);
      setStep(2);
      return;
    }
    if(taskIdx===0){setStep(0);return;}
    const prev=taskList[taskIdx-1];
    setTaskIdx(taskIdx-1);
    setCurrentSectionLabel(prev.groupLabel);
    setCurrentSectionCopy(prev.sectionCopy);
    setStep(2);
  }

  async function finishAssessment(){
    const s=computeScores(ratings);
    const t3=getTop3(s);
    const b2=getBottom2(s);
    setScores(s);setTop3(t3);
    setArchetype(getArchetypeFallback(t3));
    setStep(3);setNarrativeLoading(true);
    const data=await generateNarrative(name,t3,b2);
    setNarrativeData(data);
    if(data.archetype) setArchetype(data.archetype);
    setNarrativeLoading(false);
  }

  function restart(){
    setStep(0);setName('');setRatings({});setTaskIdx(0);
    setNarrativeData({strengths:'',support:''});
    setScores({});setTop3([]);setArchetype('');
  }

  const f="'Georgia','Times New Roman',serif";
  const fm="'Courier New',monospace";

  const sty={
    wrap:{maxWidth:580,margin:'0 auto',padding:'32px 20px 56px',fontFamily:f,color:'#1a1208'},
    bar:{height:2,background:'#c8b888',borderRadius:2,marginBottom:40},
    fill:{height:'100%',background:'#1a1208',borderRadius:2,transition:'width 0.5s ease',width:`${progress}%`},
    eyebrow:{fontFamily:fm,fontSize:10,letterSpacing:'0.14em',textTransform:'uppercase',color:'#6b4a18',marginBottom:12},
    h1:{fontSize:38,fontWeight:400,lineHeight:1.2,marginBottom:24,letterSpacing:'-0.02em',color:'#1a1208'},
    h2:{fontSize:26,fontWeight:400,lineHeight:1.3,marginBottom:20,letterSpacing:'-0.02em',color:'#1a1208'},
    body:{fontSize:16,lineHeight:1.8,color:'#2e2010',marginBottom:24,fontFamily:f},
    sub:{fontFamily:fm,fontSize:12,lineHeight:1.6,color:'#4a3010',marginBottom:20},
    rule:{border:'none',borderTop:'1.5px solid #c8b070',margin:'28px 0'},
    btnP:(dis)=>({display:'inline-block',padding:'12px 28px',background:dis?'#b8a880':'#1a1208',color:dis?'#6a5a38':'#f8f0dc',border:'none',borderRadius:3,fontSize:12,fontFamily:fm,cursor:dis?'default':'pointer',letterSpacing:'0.06em',textTransform:'uppercase'}),
    btnG:{display:'inline-block',padding:'12px 20px',background:'transparent',color:'#3a2808',border:'1.5px solid #8a6830',borderRadius:3,fontSize:12,fontFamily:fm,cursor:'pointer',letterSpacing:'0.04em'},
    navRow:{display:'flex',gap:10,marginTop:24,alignItems:'center'},
    input:{width:'100%',padding:'12px 14px',border:'1.5px solid #8a6830',borderRadius:3,fontSize:15,fontFamily:f,color:'#1a1208',background:'#faf8f2',outline:'none',boxSizing:'border-box'},
    taskCard:{padding:'20px 22px',border:'1.5px solid #a88840',borderRadius:6,background:'#faf8f2',marginBottom:20},
    taskName:{fontSize:20,fontWeight:400,marginBottom:6,letterSpacing:'-0.01em',color:'#1a1208'},
    taskDesc:{fontFamily:fm,fontSize:12,color:'#3a2808',lineHeight:1.6},
    groupLabel:{fontFamily:fm,fontSize:10,letterSpacing:'0.12em',textTransform:'uppercase',color:'#6b4a18',marginBottom:16},
    counter:{fontFamily:fm,fontSize:12,color:'#5a4020',marginBottom:20},
    sectionTitle:{fontFamily:fm,fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase',color:'#6b4a18',marginBottom:6,marginTop:0},
    narrativeBox:{padding:'18px 20px',border:'1.5px solid #a88840',borderRadius:6,background:'#faf8f2',marginBottom:16,fontSize:15,lineHeight:1.8,fontFamily:f,color:'#2e2010'},
  };

  // ── WELCOME ──
  if(step===0) return(
    <div style={sty.wrap}>
      <div style={sty.bar}><div style={sty.fill}/></div>
      <div style={sty.eyebrow}>XXVI</div>
      <h1 style={sty.h1}>XXVI Strengths</h1>
      <p style={sty.body}>A tool to help you get to know your superpowers.</p>
      <div style={{marginBottom:28}}>
        <div style={{...sty.sub,marginBottom:8}}>Your name</div>
        <input style={sty.input} placeholder="Enter your name" value={name} onChange={e=>setName(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter'&&name.trim()) startQuestions();}}/>
      </div>
      <button style={sty.btnP(!name.trim())} disabled={!name.trim()} onClick={startQuestions}>Begin</button>
    </div>
  );

  // ── SECTION DIVIDER ──
  if(step===1) return(
    <div style={sty.wrap}>
      <div style={sty.bar}><div style={sty.fill}/></div>
      <div style={sty.eyebrow}>{currentSectionLabel}</div>
      <h2 style={{...sty.h2,fontSize:28}}>{currentSectionCopy}</h2>
      <div style={sty.navRow}>
        <button style={sty.btnG} onClick={handleBack}>Back</button>
        <button style={sty.btnP(false)} onClick={handleSectionContinue}>Continue</button>
      </div>
    </div>
  );

  // ── QUESTIONS ──
  if(step===2){
    const rating=ratings[task.name];
    const isOptOut=rating===0;
    const scaleSelected=rating&&rating>=1&&rating<=5;
    return(
      <div style={sty.wrap}>
        <div style={sty.bar}><div style={sty.fill}/></div>
        <div style={sty.groupLabel}>{task.groupLabel}</div>
        <div style={sty.counter}>{taskIdx+1} of {totalTasks}</div>
        <div style={sty.taskCard}>
          <div style={sty.taskName}>{task.name}</div>
          <div style={sty.taskDesc}>{task.desc}</div>
        </div>

        {/* 5-point scale */}
        <div style={{marginBottom:10}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:10,gap:16}}>
            <span style={{fontFamily:fm,fontSize:11,color:'#3a2a10',lineHeight:1.4,maxWidth:'45%'}}>I like doing this and it comes naturally</span>
            <span style={{fontFamily:fm,fontSize:11,color:'#3a2a10',lineHeight:1.4,maxWidth:'45%',textAlign:'right'}}>This drains my battery fast</span>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 24px',background:'#faf8f2',border:scaleSelected?'1.5px solid #1a1208':'1px solid #8a7040',borderRadius:6}}>
            {[1,2,3,4,5].map(val=>(
              <label key={val} style={{display:'flex',flexDirection:'column',alignItems:'center',cursor:'pointer',gap:6}}>
                <input type="radio" name={`r-${task.name}`} value={val}
                  checked={rating===val}
                  onChange={()=>handleRating(val)}
                  style={{width:20,height:20,accentColor:'#1a1208',cursor:'pointer'}}/>
              </label>
            ))}
          </div>
        </div>

        {/* Opt out */}
        <label style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',border:isOptOut?'1.5px solid #1a1208':'1px solid #8a7040',borderRadius:6,background:isOptOut?'#f5f0e4':'#faf8f2',cursor:'pointer',fontFamily:fm,fontSize:13,color:'#1a1208',marginBottom:4}}>
          <input type="radio" name={`r-${task.name}`} value={0}
            checked={isOptOut}
            onChange={()=>handleRating(0)}
            style={{width:16,height:16,accentColor:'#1a1208',cursor:'pointer'}}/>
          I don't really do this
        </label>

        <div style={sty.navRow}>
          <button style={sty.btnG} onClick={handleBack}>Back</button>
          <button style={sty.btnP(rating===undefined)} disabled={rating===undefined} onClick={handleNext}>
            {taskIdx===totalTasks-1?'See my results':'Next'}
          </button>
        </div>
      </div>
    );
  }

  // ── RESULTS ──
  if(step===3) return(
    <div style={sty.wrap}>
      <div style={sty.bar}><div style={sty.fill}/></div>
      <div style={sty.eyebrow}>Your results</div>
      <h1 style={{...sty.h1,fontSize:30,marginBottom:28}}>{archetype}</h1>

      {narrativeLoading?(
        <div style={sty.narrativeBox}>
          <p style={{fontFamily:fm,fontSize:12,color:'#9a8860',margin:0}}>Writing your summary…</p>
        </div>
      ):(
        <>
          <div style={sty.narrativeBox}>
            <div style={sty.sectionTitle}>Your top strengths</div>
            <p style={{margin:0}}>{narrativeData.strengths}</p>
          </div>
          {narrativeData.support&&(
            <div style={{...sty.narrativeBox,background:'#fdf9f4'}}>
              <div style={sty.sectionTitle}>Where you could use support</div>
              <p style={{margin:0}}>{narrativeData.support}</p>
            </div>
          )}
        </>
      )}

      <hr style={sty.rule}/>
      <div style={sty.eyebrow}>Strength profile</div>
      <BarChart scores={scores}/>
      <hr style={sty.rule}/>

      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <button style={sty.btnG} onClick={()=>window.print()}>Save PDF</button>
        <button style={sty.btnP(false)} onClick={()=>setStep(4)}>View visualisation</button>
        <button style={sty.btnG} onClick={restart}>Start again</button>
      </div>
    </div>
  );

  // ── VISUALISATION ──
  if(step===4) return(
    <div style={sty.wrap}>
      <div style={sty.bar}><div style={sty.fill}/></div>
      <div style={sty.eyebrow}>Strength map</div>
      <h1 style={{...sty.h1,fontSize:24,marginBottom:28}}>{archetype}</h1>
      <RadarViz scores={scores} top3={top3} archetype={archetype} name={name}/>
      <div style={sty.navRow}>
        <button style={sty.btnG} onClick={()=>setStep(3)}>← Back to results</button>
        <button style={sty.btnG} onClick={()=>window.print()}>Save PDF</button>
      </div>
    </div>
  );

  return null;
}
