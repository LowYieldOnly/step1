/* C57 · The Nervous & Sensory Brody block (SYST 9300, Term 3 weeks 9-11).
 *
 * This is the third block, and the first that differs in shape from the other two:
 * three weeks instead of four, and a block exam on a THURSDAY rather than a Friday.
 * Both are things the scheduler had never seen, so they get checked explicitly
 * alongside the usual mapping and scheduling guarantees.
 *
 * It is also by far the densest block — 77 h of video against 13 study days — so it
 * is the first where every week flags as more than fits before its quiz. That is the
 * correct answer rather than a bug, and the check pins it as intended behaviour.
 */
import { openApp, checker } from '../harness.mjs';

const { page: p, errors, mobilePage, close } = await openApp();
const { chk, report } = checker('Brody block — Nervous & Sensory');

await p.evaluate(()=>{window.__mk=(res,today,join)=>{
  const blk=brodyBlockById('neuro-sensory');
  AUTHED=true;todayISO=()=>(today||'2026-09-21');S.settings={seenBrodyHelp:true};
  PRACTICE_KEYS.forEach(k=>{S[k]={total:null,blocks:{}};});
  Object.assign(S,{vdone:{},vdoneDate:{},vdoneAt:{},vundone:{},vskip:{},vshaky:{},akdone:{},
    notes:{},streak:{days:{}},assessments:{},_resetAt:0});
  S.cfgs.nbme={examType:'nbme',brody:blk.id,examLabel:blk.name,examISO:blk.shelf,startISO:blk.weeks[0].start,
    restDays:[0],resources:res||{bnb:true,pathoma:true,sketchy:true,bootcamp:true},systems:blk.systems.slice(),
    brodyReviewDays:3,brodyJoinWk:join||1,brodyJoinDate:blk.weeks[(join||1)-1].start};
  normalizeCfg(S.cfgs.nbme,'nbme');activate('nbme');S.active='nbme';VIEW='today';reflow();
};
window.__hero=()=>paceHero().replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();});

// ---------- 1. registered, and the list stayed coherent ----------
const reg=await p.evaluate(()=>{
  const ids=BRODY_BLOCKS.map(b=>b.id), shelves=BRODY_BLOCKS.map(b=>b.shelf);
  return {ids,shelves,dupes:ids.length!==new Set(ids).size,
    sorted:shelves.every((s,i)=>i===0||shelves[i-1]<s),
    found:!!brodyBlockById('neuro-sensory'),name:(brodyBlockById('neuro-sensory')||{}).name};
});
chk('C57-1 the block is registered and named', reg.found&&reg.name==='Nervous & Sensory', JSON.stringify(reg.ids));
chk('C57-2 three blocks, unique ids, still in shelf order',
    reg.ids.length===3&&!reg.dupes&&reg.sorted, JSON.stringify(reg.shelves));

// ---------- 2. the calendar, including the two shape changes ----------
const cal=await p.evaluate(()=>{
  const b=brodyBlockById('neuro-sensory'), dow=iso=>isoToDate(iso).getDay();
  return {starts:b.weeks.map(w=>w.start),ns:b.weeks.map(w=>w.n),
    allMon:b.weeks.every(w=>dow(w.start)===1),
    consecutive:b.weeks.every((w,i)=>i===0||isoFromDate(addDays(isoToDate(b.weeks[i-1].start),7))===w.start),
    shelf:b.shelf,shelfDow:dow(b.shelf),cps:b.checkpoints,cpDow:b.checkpoints.map(dow),
    cpsInside:b.checkpoints.every(c=>c>=b.weeks[0].start&&c<b.shelf),
    lectures:b.weeks.map(w=>(w.lectures||[]).length),
    titled:b.weeks.every(w=>w.lectures.every(l=>l.title&&l.disc)),
    labels:b.weeks.map(w=>w.label)};
});
chk('C57-3 three weeks — Sep 21, Sep 28, Oct 5 — each a Monday, 7 days apart',
    JSON.stringify(cal.starts)===JSON.stringify(['2026-09-21','2026-09-28','2026-10-05'])
    &&JSON.stringify(cal.ns)==='[1,2,3]'&&cal.allMon&&cal.consecutive, JSON.stringify(cal.starts));
// Both earlier blocks ended on a Friday. This one does not, and the scheduler derives
// each week's deadline from the Friday of that week, so a Thursday exam is new ground.
chk('C57-4 the block exam is THURSDAY 2026-10-08, not a Friday like the earlier blocks',
    cal.shelf==='2026-10-08'&&cal.shelfDow===4, cal.shelf+' dow='+cal.shelfDow);
chk('C57-5 the two Extended Quiz Fridays are the checkpoints, inside the block',
    JSON.stringify(cal.cps)===JSON.stringify(['2026-09-25','2026-10-02'])
    &&cal.cpDow.every(d=>d===5)&&cal.cpsInside, JSON.stringify(cal.cps));
chk('C57-6 all 46 lectures transcribed across the three weeks, each titled and disciplined',
    cal.lectures.reduce((a,n)=>a+n,0)===46&&cal.titled, JSON.stringify(cal.lectures));

// ---------- 3. the content map ----------
const audit=await p.evaluate(()=>BRODY_BLOCKS.map(b=>{
  const a=auditBlock(b);
  return {id:b.id,total:a.total,
    unmapped:a.unmapped.map(v=>v.res+'|'+v.sys+'|'+v.cat+'|'+v.name),
    orphans:a.orphans,bcOrphans:a.bcOrphans,
    perWeek:a.weeks.map(w=>w.vids.length),empty:a.weeks.filter(w=>!w.vids.length).map(w=>w.n)};
}));
const ns=audit.find(a=>a.id==='neuro-sensory');
chk('C57-7 no video falls through to the last week ("defaulted")',
    ns.unmapped.length===0, ns.unmapped.slice(0,4).join(' ; '));
chk('C57-8 no mapping points at a video that left the catalog',
    ns.orphans.length===0&&ns.bcOrphans.length===0, JSON.stringify([ns.orphans,ns.bcOrphans]).slice(0,300));
chk('C57-9 every week has content ('+ns.perWeek.join(' / ')+' videos)',
    ns.empty.length===0&&ns.total===547, JSON.stringify(ns.perWeek)+' total='+ns.total);
chk('C57-10 adding a third block left the first two audit-clean',
    audit.filter(a=>a.id!=='neuro-sensory').every(a=>!a.unmapped.length&&!a.orphans.length&&!a.bcOrphans.length),
    JSON.stringify(audit.filter(a=>a.id!=='neuro-sensory').map(a=>[a.id,a.unmapped.length,a.orphans.length])));

// ---------- 4. block selection rolls over ----------
const sel=await p.evaluate(()=>{
  const out={},real=todayISO;
  [['2026-09-18','cardiopulm'],['2026-09-19','neuro-sensory'],['2026-10-05','neuro-sensory'],
   ['2026-10-08','neuro-sensory'],['2026-12-01','neuro-sensory']].forEach(([d,exp])=>{
    todayISO=()=>d;out[d]={got:brodyCurrentBlockId(),exp};});
  todayISO=real;return out;
});
chk('C57-11 the day after the Cardiopulm exam, the current block becomes Nervous & Sensory',
    Object.values(sel).every(o=>o.got===o.exp), JSON.stringify(sel));

// ---------- 5. scheduling ----------
await p.evaluate(()=>__mk());
const plan=await p.evaluate(()=>{
  const b=brodyBlockById('neuro-sensory'),c=S.cfg;
  const dayOf={};SCHED.days.forEach(d=>d.items.forEach(i=>dayOf[i.id]=d.iso));
  const items=SCHED.planItems||[];
  return {n:items.length,h:Math.round(SCHED.stats.totalMin/6)/10,
    placed:items.filter(i=>dayOf[i.id]).length,
    onOrAfterShelf:items.filter(i=>dayOf[i.id]&&dayOf[i.id]>=b.shelf).length,
    inBuffer:items.filter(i=>dayOf[i.id]&&dayOf[i.id]>=SCHED.reviewCutoff).length,
    sundays:SCHED.days.filter(d=>isoToDate(d.iso).getDay()===0&&d.items.length).length,
    deadlines:brodyWeekLoads(c,b).map(w=>w.deadline),
    weekLoad:SCHED.weekLoad.map(w=>({n:w.n,needH:Math.round(w.needH*10)/10,heavy:w.heavy})),
    feasible:SCHED.stats.feasible,pace:SCHED.brodyPace,hero:__hero()};
});
chk('C57-12 all 547 videos ('+plan.h+' h) get a day',
    plan.n===547&&plan.placed===547, JSON.stringify({n:plan.n,placed:plan.placed}));
chk('C57-13 nothing is scheduled on or after the Thursday exam',
    plan.onOrAfterShelf===0, 'late='+plan.onOrAfterShelf);
chk('C57-14 the review buffer before the exam stays video-free, and Sundays stay empty',
    plan.inBuffer===0&&plan.sundays===0, JSON.stringify({buffer:plan.inBuffer,sundays:plan.sundays}));
chk('C57-15 each week is due at its own quiz, and the last week at the exam — the Thursday date survives the Friday-based deadline maths',
    JSON.stringify(plan.deadlines)===JSON.stringify(['2026-09-25','2026-10-02','2026-10-08']),
    JSON.stringify(plan.deadlines));

// ---------- 5a. Pathoma chapter 17 matches the published listing ----------
// The catalog had 17.5 and 17.6 as separate videos; Pathoma publishes them merged.
// Pinned here so a future catalog edit that re-splits them fails rather than
// quietly scheduling two videos that do not exist.
const pa=await p.evaluate(()=>{
  const v=catVideos().filter(x=>x.res==='pathoma'&&x.sys==='Neurology');
  return {names:v.map(x=>x.name),mins:v.map(x=>x.min),total:v.reduce((a,x)=>a+x.min,0),
    chapters:[...new Set(v.map(pathChapterOf))]};
});
chk('C57-15a Pathoma chapter 17 is the 7 published videos, 96 min, with trauma and demyelination merged',
    pa.names.length===7&&pa.total===96
    &&pa.names.indexOf('17.5-17.6 Trauma & Demyel. Disorders')>=0
    &&pa.names.indexOf('17.7 Dementia & Degenerative Disorders')>=0
    &&pa.names.indexOf('17.5 Trauma')<0, JSON.stringify(pa.names));
chk('C57-15a2 the merged title still parses as chapter 17, so chapter selection keeps working',
    JSON.stringify(pa.chapters)==='[17]', JSON.stringify(pa.chapters));

// ---------- 5b. the hand-entered Sketchy sketches ----------
const sk=await p.evaluate(()=>{
  const b=brodyBlockById('neuro-sensory');
  const v=catVideos().filter(x=>x.res==='skpharm'&&b.systems.indexOf(x.sys)>=0);
  const secs={};v.forEach(x=>secs[x.sys+'|'+x.cat]=(secs[x.sys+'|'+x.cat]||0)+1);
  const wk={};v.forEach(x=>wk[x.name]=b.videoWeek[brodyKey(x)]);
  return {n:v.length,min:v.reduce((a,x)=>a+x.min,0),secs,wk,
    mapped:v.every(x=>b.videoWeek[brodyKey(x)]!=null),
    dupes:catVideos().length!==new Set(catVideos().map(brodyKey)).size,
    otherSystems:catVideos().filter(x=>x.res==='skpharm'&&b.systems.indexOf(x.sys)<0).length};
});
chk('C57-15b all 23 Sketchy sketches for this unit are in the catalog, 310 min, none defaulted',
    sk.n===23&&sk.min===310&&sk.mapped, JSON.stringify({n:sk.n,min:sk.min,mapped:sk.mapped}));
chk('C57-15c each lands on the week its PHARM lecture falls in',
    sk.wk['SSRIs, SNRIs, Cyproheptadine']===1&&sk.wk['Benzodiazepines & Flumazenil']===1
    &&sk.wk['First-Generation Antipsychotics']===1&&sk.wk['Ethosuximide']===1
    &&sk.wk['Opioids, Naloxone, Naltrexone']===2&&sk.wk['Narcolepsy Drugs']===2
    &&sk.wk['IV Anesthetics']===3, JSON.stringify(sk.wk));
chk('C57-15d adding them left the earlier Sketchy sections untouched and the catalog free of duplicate keys',
    !sk.dupes&&sk.otherSystems===25, 'dupes='+sk.dupes+' other='+sk.otherSystems);

// ---------- 6. the density is reported honestly, not hidden ----------
chk('C57-16 with Bootcamp on, all three weeks are flagged as more than fits before their quiz',
    plan.weekLoad.every(w=>w.heavy)&&plan.feasible===false, JSON.stringify(plan.weekLoad));
// First block dense enough to flag every week at once, which is what exposed the
// singular-only wording ("week 1, 2, 3 is more than fits").
chk('C57-17 and the warning reads as English with more than one week flagged',
    /weeks 1, 2 and 3 are more than fits before their quiz/.test(plan.hero), plan.hero.slice(0,160));
const light=await p.evaluate(()=>{
  __mk({bnb:true,pathoma:true,sketchy:true});
  return {n:SCHED.stats.totalItems,h:Math.round(SCHED.stats.totalMin/6)/10,pace:SCHED.brodyPace,
    heavy:SCHED.weekLoad.filter(w=>w.heavy).length,feasible:SCHED.stats.feasible,
    cap:BRODY_QUIZ_MAX,review:SCHED.days.filter(d=>d.review).length};
});
chk('C57-18 dropping Bootcamp makes it comfortable — 32 h, no week flagged — so the warning is about the resource load, not the block',
    light.heavy===0&&light.feasible&&light.h<35&&light.pace<light.cap, JSON.stringify(light));

// ---------- 7. progress and systems ----------
const done=await p.evaluate(()=>{
  __mk();
  (SCHED.planItems||[]).forEach(it=>markDone(it.id,'2026-09-21'));reflow();
  const byV=(setProgBy('videos'),overall()),byT=(setProgBy('time'),overall());
  setProgBy('videos');
  return {v:byV.pct,t:byT.pct,dm:byT.doneMin,tm:byT.totalMin,sys:Object.keys(sysProgress()).sort()};
});
chk('C57-19 completing everything reads 100% by count and by time',
    done.v===100&&done.t===100&&done.dm===done.tm, JSON.stringify(done));
chk('C57-20 the stats breakdown covers exactly the systems this block touches',
    JSON.stringify(done.sys)===JSON.stringify(['Behavioral Science','Neurology','Ophthalmology','Psychiatry']),
    JSON.stringify(done.sys));

// ---------- 8. joining late ----------
const late=await p.evaluate(()=>{
  __mk(null,'2026-10-05',3);
  const b=brodyBlockById('neuro-sensory'),loads=brodyWeekLoads(S.cfg,b);
  return {pre:loads.filter(w=>w.pre).map(w=>w.n),preEmpty:loads.filter(w=>w.pre).every(w=>w.loadMin===0),
    earlier:brodyEarlierIds(S.cfg,b).ids.size,
    pastShown:SCHED.days.filter(d=>d.iso<'2026-10-05'&&d.items.length).length};
});
chk('C57-21 joining in week 3 owes nothing from weeks 1-2, but still shows them',
    JSON.stringify(late.pre)==='[1,2]'&&late.preEmpty&&late.earlier>0&&late.pastShown>0, JSON.stringify(late));

// ---------- 9. the rest of the app ----------
const rest=await p.evaluate(async()=>{
  __mk();
  const fails=[];
  for(const v of ['today','stats','grades','adjust','ref','checklist'])
    for(const m of ['videos','time']){setProgBy(m);VIEW=v;
      try{render();await new Promise(r=>setTimeout(r,25));}catch(e){fails.push(v+'/'+m+': '+String(e).slice(0,90));}}
  setProgBy('videos');VIEW='today';
  let auditOK=false;
  try{renderContentAudit();await new Promise(r=>setTimeout(r,220));
    auditOK=document.body.innerText.includes('Nervous & Sensory');}catch(e){fails.push('audit: '+String(e).slice(0,90));}
  VIEW='today';render();await new Promise(r=>setTimeout(r,40));
  const a=JSON.stringify(persistObj());
  const m1=JSON.stringify(mergeState(JSON.parse(a),JSON.parse(a)));
  return {fails,auditOK,idempotent:a===m1&&m1===JSON.stringify(mergeState(JSON.parse(m1),JSON.parse(a)))};
});
chk('C57-22 every view renders on a Nervous & Sensory plan', rest.fails.length===0, JSON.stringify(rest.fails));
chk('C57-23 the content audit lists the block', rest.auditOK, '');
chk('C57-24 mergeState(x,x) === x', rest.idempotent, '');

// ---------- 10. mobile ----------
const mp=await mobilePage();
const mob=await mp.evaluate(async()=>{
  const b=brodyBlockById('neuro-sensory');
  AUTHED=true;todayISO=()=>'2026-09-21';S.settings={seenBrodyHelp:true};
  S.cfgs.nbme={examType:'nbme',brody:b.id,examLabel:b.name,examISO:b.shelf,startISO:b.weeks[0].start,
    restDays:[0],resources:{bnb:true,pathoma:true},systems:b.systems.slice(),
    brodyReviewDays:3,brodyJoinWk:1,brodyJoinDate:b.weeks[0].start};
  normalizeCfg(S.cfgs.nbme,'nbme');activate('nbme');S.active='nbme';VIEW='today';reflow();render();
  await new Promise(r=>setTimeout(r,180));
  const W=document.documentElement.clientWidth;
  return {items:document.querySelectorAll('.chk[data-ids]').length,
    overflow:document.documentElement.scrollWidth>W+1};
});
chk('C57-25 mobile: the day list renders and nothing scrolls sideways',
    mob.items>0&&!mob.overflow, JSON.stringify(mob));
chk('C57-26 no uncaught page errors', errors.length===0, errors.slice(0,3).join(' | '));

await close();
process.exit(report()?1:0);
