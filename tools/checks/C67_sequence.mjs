/* C67 · My own sequence — every Brody unit, in the student's order, plus added systems.
 *
 * The sequence is a synthetic Brody unit whose "weeks" are the student's topics. The
 * risks are specific:
 *   1. COMPLETENESS — every unit's content must be in it, each item exactly once. Items
 *      several units share (psych threads, the anaesthetics, cross-listed articles) must
 *      not be scheduled twice, and must land at their FIRST topic in the student's order.
 *   2. DATES — the topics have no calendar dates, so every date-based rule (the join week,
 *      "before you arrived", per-week days) has to stand down. If the join week were read
 *      from dates, every topic but the last would silently vanish.
 *   3. ORDER — the pour must follow the student's order, and an added system must come in
 *      each resource's own order.
 *   4. The plan behaves like every other Brody plan: even pace, stamped, review buffer,
 *      every view renders, the profile survives a self-merge.
 */
import { openApp, checker } from '../harness.mjs';

const { page: p, errors, close } = await openApp();
const { chk, report } = checker('My own sequence — every Brody unit, your order');

await p.evaluate(()=>{
  window.__seq=(o)=>{
    o=o||{};
    AUTHED=true;todayISO=()=>(o.today||'2026-10-20');
    S.settings={seenBrodyHelp:true,seenUpdate:LATEST_UPDATE};
    PRACTICE_KEYS.forEach(k=>{S[k]={total:null,blocks:{}};});
    Object.assign(S,{vdone:{},vdoneDate:{},vdoneAt:{},vundone:{},vskip:{},vshaky:{},akdone:{},
      notes:{},streak:{days:{}},assessments:{},_resetAt:0});
    S.cfgs={step1:null,nbme:{examType:'nbme',brody:SEQ_ID,examLabel:'My Brody sequence',
      startISO:o.start||'2026-10-20',examISO:o.end||'2027-03-01',restDays:[0],brodyReviewDays:3,
      resources:{bnb:true,pathoma:true,sketchy:true,bootcamp:true,uwlib:!!o.arts}}};
    if(o.topics)S.cfgs.nbme.seqTopics=o.topics;
    normalizeCfg(S.cfgs.nbme,'nbme');activate('nbme');S.active='nbme';VIEW='today';reflow();
  };
  // the union of every unit's items, as each unit schedules them
  window.__union=(arts)=>{const u=new Set();BRODY_BLOCKS.forEach(b=>catVideos().forEach(v=>{
    if(!arts&&isArticle(v))return;if(brodyInBlock(b,v))u.add(itemId(v));}));return u;};
});

// ---------- 1. completeness ----------
const d1=await p.evaluate(()=>{
  window.__seq({arts:true});
  const ids=SCHED.planItems.map(i=>i.id);
  const uni=window.__union(true);
  return {topics:SCHED.brody.weeks.length,expectTopics:BRODY_BLOCKS.reduce((n,b)=>n+b.weeks.length,0),
    order:SCHED.brody.weeks.map(w=>w.topic).join(',')===seqDefaultTopics().join(','),
    n:ids.length,distinct:new Set(ids).size,union:uni.size,missing:[...uni].filter(id=>ids.indexOf(id)<0).length,
    extra:ids.filter(id=>!uni.has(id)).length,arts:SCHED.stats.totalArts};
});
chk('C67-1 the default sequence is every Brody week of every unit, in the class calendar\'s order',
    d1.topics===d1.expectTopics&&d1.order, JSON.stringify(d1));
chk('C67-2 it holds every item every unit schedules — videos and articles — with none missing',
    d1.missing===0&&d1.n===d1.union, d1.n+' planned of '+d1.union+', '+d1.missing+' missing');
chk('C67-3 …each exactly once, however many units share it, and nothing from outside the units',
    d1.distinct===d1.n&&d1.extra===0, JSON.stringify({n:d1.n,distinct:d1.distinct,extra:d1.extra}));

// ---------- 2. dates stand down ----------
const d2=await p.evaluate(()=>{
  // start mid-way through the year: a date-based join week would drop everything "before" it
  window.__seq({start:'2026-12-01',today:'2026-12-01',end:'2027-04-01'});
  return {n:SCHED.planVideos.length,union:window.__union(false).size,join:S.cfg.brodyJoinWk,
    earlier:brodyEarlierIds(S.cfg,SCHED.brody).ids.size,skipped:SCHED.skippedWeeks,first:SCHED.planVideos[0].wk};
});
chk('C67-4 starting months after a unit\'s real dates still owes all of it — nothing reads as "before you arrived"',
    d2.n===d2.union&&d2.join===1&&d2.earlier===0&&d2.skipped===0&&d2.first===1, JSON.stringify(d2));

// ---------- 3. order ----------
const d3=await p.evaluate(()=>{
  const def=seqDefaultTopics();
  const cp1='u:cardiopulm:1';
  window.__seq({topics:[cp1].concat(def.filter(t=>t!==cp1))});
  const firstDay=SCHED.days.find(d=>d.items.length);
  const wks=SCHED.planVideos.map(v=>v.wk);
  const mono=wks.every((w,i)=>i===0||w>=wks[i-1]);
  // a shared video lands at its FIRST topic in the order: IV Anesthetics is in Neuro wk 3 and MSK wk 1
  const iv=catVideos().find(v=>v.res==='skpharm'&&v.name==='IV Anesthetics');
  const at=topics=>{window.__seq({topics});const it=SCHED.planVideos.find(x=>x.id===itemId(iv));return it?SCHED.brody.weeks[it.wk-1].topic:null;};
  const neuroFirst=at(def);
  const mskFirst=at(['u:msk-skin:1'].concat(def.filter(t=>t!=='u:msk-skin:1')));
  return {firstTopic:SCHED.brody?null:null,firstDayTopic:firstDay&&firstDay.brodyWeek,firstItemTopic:firstDay&&firstDay.items[0].wk,mono,
    chip:(()=>{window.__seq({topics:[cp1].concat(def.filter(t=>t!==cp1))});return brodyChip(SCHED.days.find(d=>d.items.length).iso).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();})(),
    neuroFirst,mskFirst};
});
chk('C67-5 moving a topic to the front puts it first on the calendar',
    d3.firstDayTopic===1&&d3.firstItemTopic===1&&/Topic 1 Cardiopulmonary · Cardiac Pathology/.test(d3.chip), JSON.stringify(d3));
chk('C67-6 the pour follows the order — topic by topic, never back',
    d3.mono, '');
chk('C67-7 a video two units share lands at whichever comes first in YOUR order',
    d3.neuroFirst==='u:neuro-sensory:3'&&d3.mskFirst==='u:msk-skin:1', d3.neuroFirst+' / '+d3.mskFirst);

// ---------- 4. added systems ----------
const d4=await p.evaluate(()=>{
  const add=seqAddable({});
  const endo=add.find(a=>a.sys==='Endocrinology'),heme=add.find(a=>a.sys==='Hematology');
  window.__seq({topics:seqDefaultTopics().concat(['s:Endocrinology','s:Hematology'])});
  const nT=SCHED.brody.weeks.length;
  const endoItems=SCHED.planVideos.filter(v=>v.wk===nT-1);
  const ri=r=>RES_ORDER.indexOf(r);
  // every Endocrinology video no Brody topic already holds (MSK pulls three of Sketchy's in for its lectures)
  const inUnits=new Set();BRODY_BLOCKS.forEach(b=>catVideos().forEach(v=>{if(brodyInBlock(b,v))inUnits.add(itemId(v));}));
  const cat=catVideos().filter(v=>v.sys==='Endocrinology'&&!isArticle(v)&&!inUnits.has(itemId(v)));
  const inBoth=catVideos().filter(v=>v.sys==='Endocrinology'&&!isArticle(v)).every(v=>SCHED.planVideos.some(x=>x.id===itemId(v)));
  const expect=cat.slice().sort((a,b)=>ri(a.res)-ri(b.res)).map(itemId);   // stable: catalog order within a resource
  const hemeItems=SCHED.planVideos.filter(v=>v.wk===nT).map(v=>v.name);
  const unitsHave=BRODY_BLOCKS.some(b=>catVideos().some(v=>v.sys==='Hematology'&&hemeItems.indexOf(v.name)>=0&&brodyInBlock(b,v)));
  return {endoAddable:endo&&endo.n,endoPlanned:endoItems.length,endoAll:cat.length,inBoth,
    inOrder:JSON.stringify(endoItems.map(v=>v.id))===JSON.stringify(expect),
    hemeAddable:heme&&heme.n,hemePlanned:hemeItems.length,unitsHave,
    addableAfter:seqAddable(S.cfg).map(a=>a.sys)};
});
chk('C67-8 an added system brings every video of it no Brody topic already has (Endocrinology: '+d4.endoPlanned+') — so all of it is in the plan, once',
    d4.endoPlanned===d4.endoAll&&d4.endoPlanned===d4.endoAddable&&d4.inBoth, JSON.stringify(d4));
chk('C67-9 …in each resource\'s own order — B&B\'s sequence, then Pathoma\'s, and so on',
    d4.inOrder, '');
chk('C67-10 adding a system a unit already covers brings only what no unit schedules (Hematology → the cancer pharmacology)',
    d4.hemePlanned===d4.hemeAddable&&d4.hemePlanned>0&&!d4.unitsHave, JSON.stringify({p:d4.hemePlanned,a:d4.hemeAddable}));
chk('C67-11 an added system leaves the "add" list',
    d4.addableAfter.indexOf('Endocrinology')<0&&d4.addableAfter.indexOf('Hematology')<0, JSON.stringify(d4.addableAfter));

// ---------- 5. pace, buffer, stamping ----------
const d5=await p.evaluate(()=>{
  window.__seq({});
  const c=S.cfg,blk=SCHED.brody;
  const cut=SCHED.reviewCutoff;
  const open=brodyStudyDays(c,blk,blk.weeks[0].start).filter(d=>d<cut).length;
  const evenH=Math.max(0.5,Math.ceil(SCHED.stats.totalMin/open/60/0.5)*0.5);
  const after=SCHED.days.filter(d=>d.iso>=cut&&d.items.some(i=>!isDone(i.id))).length;
  const stamp=c.brodyPace;
  const v=SCHED.planVideos[0];S.vdone[v.id]=true;S.vdoneDate[v.id]=todayISO();reflow();
  const afterCheck=c.brodyPace;
  return {pace:SCHED.brodyPace,evenH,free:brodyFree(c),after,stamp,afterCheck,feasible:SCHED.stats.feasible};
});
chk('C67-12 the pace is the even spread to the end date — no quiz term — at '+d5.pace+' h/day',
    d5.free&&d5.pace===d5.evenH, JSON.stringify(d5));
chk('C67-13 nothing is scheduled into the review days before the end date',
    d5.after===0, d5.after+' review days hold work');
chk('C67-14 the pace is stamped on the plan, and checking a video off doesn\'t move it',
    d5.stamp===d5.pace&&d5.afterCheck===d5.stamp, JSON.stringify(d5));

// ---------- 6. the Plan tab editor ----------
const d6=await p.evaluate(async()=>{
  window.__seq({});
  VIEW='adjust';ADJ_VIEW='edit';render();await new Promise(r=>setTimeout(r,30));
  const rows=document.querySelectorAll('.seqrow').length;
  const stamp=S.cfg.brodyPace;
  document.querySelector('[data-qdn="0"]').click();await new Promise(r=>setTimeout(r,30));
  const afterMove={first:S.cfg.seqTopics[0],second:S.cfg.seqTopics[1],pace:S.cfg.brodyPace};
  const n0=SCHED.stats.totalItems;
  document.querySelector('[data-qrm="0"]').click();await new Promise(r=>setTimeout(r,30));
  const afterRm={topics:S.cfg.seqTopics.length,items:SCHED.stats.totalItems,back:document.querySelectorAll('[data-qback]').length,paceCleared:true};
  document.querySelector('[data-qback]').click();await new Promise(r=>setTimeout(r,30));
  const afterBack={topics:S.cfg.seqTopics.length,items:SCHED.stats.totalItems,last:S.cfg.seqTopics[S.cfg.seqTopics.length-1]};
  document.querySelector('[data-qadd="Endocrinology"]').click();await new Promise(r=>setTimeout(r,30));
  const afterAdd={last:S.cfg.seqTopics[S.cfg.seqTopics.length-1],items:SCHED.stats.totalItems};
  document.getElementById('seqReset').click();await new Promise(r=>setTimeout(r,30));
  const afterReset={order:S.cfg.seqTopics.slice(0,14).join(',')===seqDefaultTopics().join(','),keepsAdded:S.cfg.seqTopics.indexOf('s:Endocrinology')>=0};
  return {rows,stamp,afterMove,n0,afterRm,afterBack,afterAdd,afterReset,
    noQuizToggle:!document.querySelector('[data-bfree]'),dates:!!document.getElementById('seq_end')};
});
chk('C67-15 the Plan tab shows the order with every topic, the dates, and no quiz toggle',
    d6.rows===14&&d6.noQuizToggle&&d6.dates, JSON.stringify({rows:d6.rows,q:d6.noQuizToggle,dates:d6.dates}));
chk('C67-16 ▼ swaps two topics and keeps the stamped pace — a reorder changes no amount of work',
    d6.afterMove.first==='u:heme-renal:2'&&d6.afterMove.second==='u:heme-renal:1'&&d6.afterMove.pace===d6.stamp, JSON.stringify(d6.afterMove));
chk('C67-17 ✕ leaves a topic out — its items leave the plan, and it waits under "left out" to come back',
    d6.afterRm.topics===13&&d6.afterRm.items<d6.n0&&d6.afterRm.back===1, JSON.stringify(d6.afterRm));
chk('C67-18 putting it back restores everything, at the end of the order',
    d6.afterBack.topics===14&&d6.afterBack.items===d6.n0&&d6.afterBack.last==='u:heme-renal:2', JSON.stringify(d6.afterBack));
chk('C67-19 adding a system appends it and grows the plan',
    d6.afterAdd.last==='s:Endocrinology'&&d6.afterAdd.items>d6.n0, JSON.stringify(d6.afterAdd));
chk('C67-20 reset restores the calendar order and keeps added systems',
    d6.afterReset.order&&d6.afterReset.keepsAdded, JSON.stringify(d6.afterReset));

// ---------- 7. setup builds one ----------
const d7=await p.evaluate(()=>{
  AUTHED=true;todayISO=()=>'2026-10-20';
  S.settings={seenBrodyHelp:true,seenUpdate:LATEST_UPDATE};S.cfgs={step1:null,nbme:null};S.cfg=null;S.active=null;
  startOnboard('nbme',true);_ob.brody=brodyCurrentBlockId();
  _ob.step=obSteps(_ob).indexOf('block');renderOnboard();
  document.querySelector('[data-oblk="'+SEQ_ID+'"]').click();
  const steps=obSteps(_ob);
  const noEnd=obStepValid(_ob,'dates');
  _ob.examISO='2026-10-10';const before=obStepValid(_ob,'dates');
  _ob.examISO='2027-05-01';const ok=obStepValid(_ob,'dates');
  _ob.resources={bnb:true,pathoma:true,sketchy:false,bootcamp:false};
  _ob.step=steps.indexOf('sequence');renderOnboard();
  const editor=document.querySelectorAll('.seqrow').length;
  _ob.step=steps.indexOf('routine');renderOnboard();
  const quiz=!!document.querySelector('[data-obfree]');
  commitOnboard();
  return {steps,noEnd,before,ok,editor,quiz,brody:S.cfg&&S.cfg.brody,topics:S.cfg&&S.cfg.seqTopics&&S.cfg.seqTopics.length,
    end:S.cfg&&S.cfg.examISO,items:SCHED&&SCHED.stats.totalItems,label:S.cfg&&S.cfg.examLabel};
});
chk('C67-21 setup offers "my own order", then asks for the order and the dates',
    d7.steps.indexOf('sequence')>=0&&d7.steps.indexOf('dates')>d7.steps.indexOf('sequence')&&d7.editor===14, JSON.stringify(d7.steps));
chk('C67-22 …won\'t continue without an end date after the start',
    typeof d7.noEnd==='string'&&typeof d7.before==='string'&&d7.ok===true, JSON.stringify([d7.noEnd,d7.before,d7.ok]));
chk('C67-23 …shows no quiz toggle, and builds the sequence plan',
    !d7.quiz&&d7.brody===SEQ_ID_JS()&&d7.topics===14&&d7.end==='2027-05-01'&&d7.items>0, JSON.stringify(d7));

// ---------- 8. every view, and the sync invariant ----------
const d8=await p.evaluate(async()=>{
  window.__seq({arts:true,topics:seqDefaultTopics().concat(['s:Endocrinology'])});
  const fails=[];
  for(const v of ['today','stats','adjust','checklist','uworld']){VIEW=v;ADJ_VIEW=v==='adjust'?'edit':null;
    try{render();await new Promise(r=>setTimeout(r,25));}catch(e){fails.push(v+': '+String(e).slice(0,90));}}
  VIEW='today';ADJ_VIEW=null;render();
  const a=JSON.stringify(persistObj());const m1=JSON.stringify(mergeState(JSON.parse(a),JSON.parse(a)));
  return {fails,idem:a===m1,kept:JSON.parse(a).cfgs.nbme.seqTopics.length};
});
chk('C67-24 every view renders on a sequence plan', d8.fails.length===0, JSON.stringify(d8.fails));
chk('C67-25 mergeState(x,x) === x with a sequence in the profile — and the order survives it',
    d8.idem&&d8.kept===15, JSON.stringify(d8));
chk('C67-26 no uncaught page errors', errors.length===0, errors.slice(0,3).join(' | '));

function SEQ_ID_JS(){return 'seq';}
await close();
process.exit(report() ? 1 : 0);
