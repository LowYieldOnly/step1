/* C67 · My own order — one Brody unit, in the student's order, plus added systems.
 *
 * Setup asks for the unit you're in first, then whose order: Brody's, or your own. Your
 * own order is a synthetic Brody unit whose "weeks" are the unit's weeks in the order you
 * choose, plus any systems you add. The risks are specific:
 *   1. COMPLETENESS — the unit's content must all be in it, each item exactly once. An item
 *      an added system also holds must not be scheduled twice, and must land at its FIRST
 *      topic in the student's order. Plans made when a sequence held every unit at once
 *      must keep working.
 *   2. DATES — the topics have no calendar dates, so every date-based rule (the join week,
 *      "before you arrived", per-week days) has to stand down. If the join week were read
 *      from dates, every topic but the last would silently vanish.
 *   3. ORDER — the pour must follow the student's order, and an added system must come in
 *      each resource's own order.
 *   4. SCOPE — setup never reads as "every unit at once": you pick a unit, then the order,
 *      and the order, the exam and the "left out" list all belong to that unit.
 *   5. The plan behaves like every other Brody plan: even pace, stamped, review buffer,
 *      every view renders, the profile survives a self-merge.
 */
import { openApp, checker } from '../harness.mjs';

const { page: p, errors, close } = await openApp();
const { chk, report } = checker('My own order — one Brody unit, your order');

await p.evaluate(()=>{
  // o.unit: the plan's unit (MSK by default); o.legacy: a plan from before seqUnit existed
  window.__seq=(o)=>{
    o=o||{};
    AUTHED=true;todayISO=()=>(o.today||'2026-10-20');
    S.settings={seenBrodyHelp:true,seenUpdate:LATEST_UPDATE};
    PRACTICE_KEYS.forEach(k=>{S[k]={total:null,blocks:{}};});
    Object.assign(S,{vdone:{},vdoneDate:{},vdoneAt:{},vundone:{},vskip:{},vshaky:{},akdone:{},
      notes:{},streak:{days:{}},assessments:{},_resetAt:0});
    S.cfgs={step1:null,nbme:{examType:'nbme',brody:SEQ_ID,examLabel:'your exam',
      startISO:o.start||'2026-10-20',examISO:o.end||'2027-03-01',restDays:[0],brodyReviewDays:3,
      resources:{bnb:true,pathoma:true,sketchy:true,bootcamp:true,uwvid:true,uwlib:!!o.arts}}};
    if(!o.legacy)S.cfgs.nbme.seqUnit=o.unit||'msk-skin';
    if(o.topics)S.cfgs.nbme.seqTopics=o.topics;
    normalizeCfg(S.cfgs.nbme,'nbme');activate('nbme');S.active='nbme';VIEW='today';reflow();
  };
  // what a unit schedules (or every unit, with no id), as the unit itself schedules it
  window.__items=(id,arts)=>{const u=new Set();BRODY_BLOCKS.filter(b=>!id||b.id===id).forEach(b=>catVideos().forEach(v=>{
    if(!arts&&isArticle(v))return;if(brodyInBlock(b,v))u.add(itemId(v));}));return u;};
  window.__allWeeks=()=>BRODY_BLOCKS.flatMap(b=>b.weeks.map(w=>'u:'+b.id+':'+w.n));
});

// ---------- 1. completeness ----------
const d1=await p.evaluate(()=>{
  window.__seq({arts:true});
  const ids=SCHED.planItems.map(i=>i.id);
  const uni=window.__items('msk-skin',true);
  const msk=brodyBlockById('msk-skin');
  const one={topics:SCHED.brody.weeks.map(w=>w.topic),expect:msk.weeks.map(w=>'u:msk-skin:'+w.n),name:SCHED.brody.name,
    n:ids.length,distinct:new Set(ids).size,union:uni.size,missing:[...uni].filter(id=>ids.indexOf(id)<0).length,
    extra:ids.filter(id=>!uni.has(id)).length};
  // a plan made while a sequence could hold every unit: no seqUnit, every unit's weeks
  window.__seq({arts:true,legacy:true,topics:window.__allWeeks()});
  const lids=SCHED.planItems.map(i=>i.id);const all=window.__items(null,true);
  const legacy={topics:SCHED.brody.weeks.length,expect:window.__allWeeks().length,n:lids.length,distinct:new Set(lids).size,union:all.size,
    missing:[...all].filter(id=>lids.indexOf(id)<0).length,unit:seqUnitId(S.cfg)};
  return {one,legacy};
});
chk('C67-1 your own order starts as the unit\'s own weeks, in the class calendar\'s order — not every unit',
    JSON.stringify(d1.one.topics)===JSON.stringify(d1.one.expect)&&d1.one.name==='Musculoskeletal & Skin', JSON.stringify(d1.one.topics)+' '+d1.one.name);
chk('C67-2 it holds every item the unit schedules — videos and articles — each once, and nothing else',
    d1.one.missing===0&&d1.one.n===d1.one.union&&d1.one.distinct===d1.one.n&&d1.one.extra===0,
    JSON.stringify({n:d1.one.n,union:d1.one.union,missing:d1.one.missing,extra:d1.one.extra,distinct:d1.one.distinct}));
chk('C67-3 a plan made when a sequence held every unit still runs: all of it, each item once',
    d1.legacy.topics===d1.legacy.expect&&d1.legacy.missing===0&&d1.legacy.n===d1.legacy.union&&d1.legacy.distinct===d1.legacy.n&&d1.legacy.unit==='heme-renal',
    JSON.stringify(d1.legacy));

// ---------- 2. dates stand down ----------
const d2=await p.evaluate(()=>{
  // start weeks after the unit's real dates: a date-based join week would drop everything "before" it
  window.__seq({start:'2026-12-01',today:'2026-12-01',end:'2027-04-01'});
  return {n:SCHED.planVideos.length,union:window.__items('msk-skin',false).size,join:S.cfg.brodyJoinWk,
    earlier:brodyEarlierIds(S.cfg,SCHED.brody).ids.size,skipped:SCHED.skippedWeeks,first:SCHED.planVideos[0].wk};
});
chk('C67-4 starting after the unit\'s real dates still owes all of it — nothing reads as "before you arrived"',
    d2.n===d2.union&&d2.join===1&&d2.earlier===0&&d2.skipped===0&&d2.first===1, JSON.stringify(d2));

// ---------- 3. order ----------
const d3=await p.evaluate(()=>{
  const def=seqDefaultTopics('msk-skin');
  const w3='u:msk-skin:3';
  window.__seq({topics:[w3].concat(def.filter(t=>t!==w3))});
  const firstDay=SCHED.days.find(d=>d.items.length);
  const wks=SCHED.planVideos.map(v=>v.wk);
  const mono=wks.every((w,i)=>i===0||w>=wks[i-1]);
  const chip=brodyChip(firstDay.iso).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  // an Endocrinology video the unit teaches (MSK pulls three of Sketchy's in for its lectures)
  // lands at whichever comes first in YOUR order: its MSK week, or the added system
  const msk=brodyBlockById('msk-skin');
  const shared=catVideos().find(v=>v.sys==='Endocrinology'&&!isArticle(v)&&brodyInBlock(msk,v));
  const home='u:msk-skin:'+brodyVideoWeek(msk,shared);
  const at=topics=>{window.__seq({topics});const it=SCHED.planVideos.filter(x=>x.id===itemId(shared));return it.length===1?SCHED.brody.weeks[it[0].wk-1].topic:it.length;};
  const unitFirst=at(def.concat(['s:Endocrinology']));
  const sysFirst=at(['s:Endocrinology'].concat(def));
  // and in a plan from before, a video two units share (IV Anesthetics: Neuro wk 3, MSK wk 1)
  const iv=catVideos().find(v=>v.res==='skpharm'&&v.name==='IV Anesthetics');
  const all=window.__allWeeks();
  window.__seq({legacy:true,topics:['u:msk-skin:1'].concat(all.filter(t=>t!=='u:msk-skin:1'))});
  const ivAt=(SCHED.planVideos.find(x=>x.id===itemId(iv))||{}).wk;
  return {firstDayTopic:firstDay&&firstDay.brodyWeek,firstItemTopic:firstDay&&firstDay.items[0].wk,mono,chip,
    shared:shared&&shared.name,home,unitFirst,sysFirst,ivAt:ivAt?SCHED.brody.weeks[ivAt-1].topic:null};
});
chk('C67-5 moving a week to the front puts it first on the calendar',
    d3.firstDayTopic===1&&d3.firstItemTopic===1&&/^Topic 1 Wk 3 · Spine/.test(d3.chip), JSON.stringify(d3));
chk('C67-6 the pour follows the order — topic by topic, never back',
    d3.mono, '');
chk('C67-7 a video the unit and an added system share is scheduled once, wherever it first comes in YOUR order',
    d3.unitFirst===d3.home&&d3.sysFirst==='s:Endocrinology'&&d3.ivAt==='u:msk-skin:1', JSON.stringify({shared:d3.shared,home:d3.home,unitFirst:d3.unitFirst,sysFirst:d3.sysFirst,iv:d3.ivAt}));

// ---------- 4. added systems ----------
const d4=await p.evaluate(()=>{
  const ri=r=>RES_ORDER.indexOf(r);
  window.__seq({});
  const add=seqAddable(S.cfg);
  const endo=add.find(a=>a.sys==='Endocrinology'),cardio=add.find(a=>a.sys==='Cardiology');
  window.__seq({topics:seqDefaultTopics('msk-skin').concat(['s:Endocrinology'])});
  const nT=SCHED.brody.weeks.length;
  const endoItems=SCHED.planVideos.filter(v=>v.wk===nT);
  const inUnit=window.__items('msk-skin',false);
  const cat=catVideos().filter(v=>v.sys==='Endocrinology'&&!isArticle(v)&&!inUnit.has(itemId(v)));
  const inBoth=catVideos().filter(v=>v.sys==='Endocrinology'&&!isArticle(v)).every(v=>SCHED.planVideos.some(x=>x.id===itemId(v)));
  const expect=cat.slice().sort((a,b)=>ri(a.res)-ri(b.res)).map(itemId);   // stable: catalog order within a resource
  const addableAfter=seqAddable(S.cfg).map(a=>a.sys);
  const cardioAll=catVideos().filter(v=>v.sys==='Cardiology'&&!isArticle(v)&&!inUnit.has(itemId(v))).length;
  // a Heme/Renal plan — a retake, say — adding Hematology gets only what the unit leaves out
  window.__seq({unit:'heme-renal',topics:seqDefaultTopics('heme-renal').concat(['s:Hematology'])});
  // counts are in the plan's own resources, so the stand-in plan carries them
  const hemeAdd=seqAddable({seqUnit:'heme-renal',resources:S.cfg.resources}).find(a=>a.sys==='Hematology');
  const hemeItems=SCHED.planVideos.filter(v=>v.wk===SCHED.brody.weeks.length);
  const hemeBlk=brodyBlockById('heme-renal');
  const unitHas=hemeItems.some(x=>{const v=catVideos().find(c=>itemId(c)===x.id);return v&&brodyInBlock(hemeBlk,v);});
  const cancer=hemeItems.every(x=>{const v=catVideos().find(c=>itemId(c)===x.id);return v&&brodyExcluded(hemeBlk,v);});
  return {endoAddable:endo&&endo.n,endoPlanned:endoItems.length,endoAll:cat.length,inBoth,
    inOrder:JSON.stringify(endoItems.map(v=>v.id))===JSON.stringify(expect),addableAfter,
    cardioAddable:cardio&&cardio.n,cardioAll,
    hemeAddable:hemeAdd&&hemeAdd.n,hemePlanned:hemeItems.length,unitHas,cancer};
});
chk('C67-8 an added system brings every video of it the unit doesn\'t already have (Endocrinology: '+d4.endoPlanned+') — so all of it is in the plan, once',
    d4.endoPlanned===d4.endoAll&&d4.endoPlanned===d4.endoAddable&&d4.inBoth, JSON.stringify(d4));
chk('C67-9 …in each resource\'s own order — B&B\'s sequence, then Pathoma\'s, and so on',
    d4.inOrder, '');
chk('C67-10 any system the unit doesn\'t cover can be added, even one another unit teaches (Cardiology: all '+d4.cardioAll+')',
    d4.cardioAddable===d4.cardioAll&&d4.cardioAll>0, JSON.stringify({a:d4.cardioAddable,all:d4.cardioAll}));
chk('C67-10b adding a system the unit covers brings only what it leaves out (Heme/Renal + Hematology → the cancer pharmacology)',
    d4.hemePlanned===d4.hemeAddable&&d4.hemePlanned>0&&!d4.unitHas&&d4.cancer, JSON.stringify({p:d4.hemePlanned,a:d4.hemeAddable,unitHas:d4.unitHas,cancer:d4.cancer}));
chk('C67-11 an added system leaves the "add" list',
    d4.addableAfter.indexOf('Endocrinology')<0, JSON.stringify(d4.addableAfter));

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
chk('C67-12 the pace is the even spread to the exam — no quiz term — at '+d5.pace+' h/day',
    d5.free&&d5.pace===d5.evenH, JSON.stringify(d5));
chk('C67-13 nothing is scheduled into the review days before the exam',
    d5.after===0, d5.after+' review days hold work');
chk('C67-14 the pace is stamped on the plan, and checking a video off doesn\'t move it',
    d5.stamp===d5.pace&&d5.afterCheck===d5.stamp, JSON.stringify(d5));

// ---------- 6. the Plan tab editor ----------
const d6=await p.evaluate(async()=>{
  window.__seq({});
  VIEW='adjust';ADJ_VIEW='edit';render();await new Promise(r=>setTimeout(r,30));
  const rows=document.querySelectorAll('.seqrow').length;
  const head=(document.querySelector('#app .card .muted')||{}).textContent||'';
  const stamp=S.cfg.brodyPace;
  document.querySelector('[data-qdn="0"]').click();await new Promise(r=>setTimeout(r,30));
  const afterMove={first:S.cfg.seqTopics[0],second:S.cfg.seqTopics[1],pace:S.cfg.brodyPace};
  const n0=SCHED.stats.totalItems;
  document.querySelector('[data-qrm="0"]').click();await new Promise(r=>setTimeout(r,30));
  const back=[...document.querySelectorAll('[data-qback]')].map(b=>b.dataset.qback);
  const afterRm={topics:S.cfg.seqTopics.length,items:SCHED.stats.totalItems,back};
  document.querySelector('[data-qback]').click();await new Promise(r=>setTimeout(r,30));
  const afterBack={topics:S.cfg.seqTopics.length,items:SCHED.stats.totalItems,last:S.cfg.seqTopics[S.cfg.seqTopics.length-1]};
  document.querySelector('[data-qadd="Endocrinology"]').click();await new Promise(r=>setTimeout(r,30));
  const afterAdd={last:S.cfg.seqTopics[S.cfg.seqTopics.length-1],items:SCHED.stats.totalItems};
  document.getElementById('seqReset').click();await new Promise(r=>setTimeout(r,30));
  const afterReset={order:S.cfg.seqTopics.slice(0,3).join(',')===seqDefaultTopics('msk-skin').join(','),len:S.cfg.seqTopics.length,keepsAdded:S.cfg.seqTopics.indexOf('s:Endocrinology')>=0};
  return {rows,head,stamp,afterMove,n0,afterRm,afterBack,afterAdd,afterReset,
    noQuizToggle:!document.querySelector('[data-bfree]'),dates:!!document.getElementById('seq_end')};
});
chk('C67-15 the Plan tab names the unit, shows its weeks in your order with the dates, and no quiz toggle',
    d6.rows===3&&/^Musculoskeletal & Skin your order/.test(d6.head)&&d6.noQuizToggle&&d6.dates, JSON.stringify({rows:d6.rows,head:d6.head.slice(0,60),q:d6.noQuizToggle,dates:d6.dates}));
chk('C67-16 ▼ swaps two weeks and keeps the stamped pace — a reorder changes no amount of work',
    d6.afterMove.first==='u:msk-skin:2'&&d6.afterMove.second==='u:msk-skin:1'&&d6.afterMove.pace===d6.stamp, JSON.stringify(d6.afterMove));
chk('C67-17 ✕ leaves a week out — its items leave the plan, and it waits under "left out" to come back; only this unit\'s weeks are offered',
    d6.afterRm.topics===2&&d6.afterRm.items<d6.n0&&JSON.stringify(d6.afterRm.back)==='["u:msk-skin:2"]', JSON.stringify(d6.afterRm));
chk('C67-18 putting it back restores everything, at the end of the order',
    d6.afterBack.topics===3&&d6.afterBack.items===d6.n0&&d6.afterBack.last==='u:msk-skin:2', JSON.stringify(d6.afterBack));
chk('C67-19 adding a system appends it and grows the plan',
    d6.afterAdd.last==='s:Endocrinology'&&d6.afterAdd.items>d6.n0, JSON.stringify(d6.afterAdd));
chk('C67-20 reset restores the unit\'s calendar order and keeps added systems',
    d6.afterReset.order&&d6.afterReset.len===4&&d6.afterReset.keepsAdded, JSON.stringify(d6.afterReset));

// ---------- 6b. the exam, on the Plan tab ----------
const d6b=await p.evaluate(async()=>{
  // in September, three Brody exams are still ahead — only MSK's belongs to an MSK plan
  window.__seq({today:'2026-09-01',start:'2026-09-01',end:'2027-03-01'});
  VIEW='adjust';ADJ_VIEW='edit';render();await new Promise(r=>setTimeout(r,30));
  const before=S.cfg.brodyPace;
  const chips=[...document.querySelectorAll('[data-qexam]')].map(b=>b.dataset.qexam);
  const chip=document.querySelector('[data-qexam="2026-11-09"]');
  if(chip)chip.click();await new Promise(r=>setTimeout(r,30));
  const after={iso:S.cfg.examISO,label:S.cfg.examLabel,pace:S.cfg.brodyPace,shelf:SCHED.brody.shelf};
  const starts=[...document.querySelectorAll('.seqct')].filter(e=>/^from /.test(e.textContent)).length;
  const planTxt=document.body.innerText;
  VIEW='today';ADJ_VIEW=null;render();await new Promise(r=>setTimeout(r,30));
  const todayTxt=document.body.innerText;
  return {chips,before,after,starts,
    countdown:/days to Brody Exam 4/.test(todayTxt),
    endDate:/end date/i.test(planTxt+' '+todayTxt)};
});
chk('C67-27 the Plan tab offers the unit\'s own exam — not every unit\'s — and picking it moves the plan there and re-derives the pace',
    JSON.stringify(d6b.chips)==='["2026-11-09"]'&&d6b.after.iso==='2026-11-09'&&d6b.after.shelf==='2026-11-09'&&d6b.after.pace>d6b.before&&/Brody Exam 4/.test(d6b.after.label),
    JSON.stringify(d6b));
chk('C67-28 the countdown names the exam, and the plan speaks of the exam — never an "end date"',
    d6b.countdown&&!d6b.endDate, JSON.stringify({countdown:d6b.countdown,endDate:d6b.endDate}));
chk('C67-29 each week in the order shows when it starts',
    d6b.starts===3, d6b.starts+' of the 3 weeks show a start date');

// ---------- 7. setup: the unit first, then the order ----------
const d7=await p.evaluate(()=>{
  AUTHED=true;todayISO=()=>'2026-10-20';
  S.settings={seenBrodyHelp:true,seenUpdate:LATEST_UPDATE};S.cfgs={step1:null,nbme:null};S.cfg=null;S.active=null;
  startOnboard('nbme',true);
  _ob.step=obSteps(_ob).indexOf('plan');renderOnboard();
  document.querySelector('[data-oplan="brody"]').click();
  _ob.step=obSteps(_ob).indexOf('block');renderOnboard();
  const blockTxt=document.querySelector('.obstep').innerText;
  const unitChips=[...document.querySelectorAll('[data-oblk]')].map(b=>b.dataset.oblk);
  const unitOn=(document.querySelector('[data-oblk].on')||{}).dataset;
  const ordOn=(document.querySelector('[data-oord].on')||{}).dataset;
  const before={brody:_ob.brody,unitOn:unitOn&&unitOn.oblk,ordOn:ordOn&&ordOn.oord,steps:obSteps(_ob).slice()};
  document.querySelector('[data-oord="own"]').click();
  const own={brody:_ob.brody,unit:_ob.seqUnit,topics:(_ob.seqTopics||[]).slice(),iso:_ob.examISO,label:_ob.examLabel,
    unitOn:(document.querySelector('[data-oblk].on')||{dataset:{}}).dataset.oblk,steps:obSteps(_ob).slice()};
  // tapping the Brody plan again doesn't throw the choice away
  _ob.step=obSteps(_ob).indexOf('plan');renderOnboard();document.querySelector('[data-oplan="brody"]').click();
  const kept=_ob.brody===SEQ_ID&&_ob.seqUnit==='msk-skin';
  _ob.step=obSteps(_ob).indexOf('block');renderOnboard();
  // another unit, still your own order: its weeks, its exam — Heme/Renal's has passed, so the dates step asks
  document.querySelector('[data-oblk="heme-renal"]').click();
  const heme={unit:_ob.seqUnit,topics:(_ob.seqTopics||[]).slice(),iso:_ob.examISO,valid:obStepValid(_ob,'dates')};
  document.querySelector('[data-oblk="msk-skin"]').click();
  // and back to Brody's order
  document.querySelector('[data-oord="brody"]').click();
  const brodyAgain={brody:_ob.brody,steps:obSteps(_ob).slice()};
  document.querySelector('[data-oord="own"]').click();
  const steps=obSteps(_ob);
  _ob.step=steps.indexOf('dates');renderOnboard();
  const chips=[...document.querySelectorAll('[data-qexam]')].map(b=>b.dataset.qexam);
  const dflt={iso:_ob.examISO,valid:obStepValid(_ob,'dates')};
  _ob.examISO=null;const noExam=obStepValid(_ob,'dates');
  _ob.examISO='2026-10-10';const early=obStepValid(_ob,'dates');
  _ob.examISO='2027-05-01';_ob.examLabel='your exam';const ok=obStepValid(_ob,'dates');
  _ob.resources={bnb:true,pathoma:true,sketchy:false,bootcamp:false};
  _ob.step=steps.indexOf('sequence');renderOnboard();
  const editor=document.querySelectorAll('.seqrow').length;
  const seqTxt=document.querySelector('.obstep').innerText;
  _ob.step=steps.indexOf('routine');renderOnboard();
  const quiz=!!document.querySelector('[data-obfree]');
  _ob.step=steps.indexOf('review');renderOnboard();
  const review=document.querySelector('.wizreview').innerText;
  commitOnboard();
  return {blockTxt,unitChips,before,own,kept,heme,brodyAgain,steps,chips,dflt,noExam,early,ok,editor,seqTxt,quiz,review,
    cfg:S.cfg&&{brody:S.cfg.brody,unit:S.cfg.seqUnit,topics:S.cfg.seqTopics&&S.cfg.seqTopics.length,end:S.cfg.examISO},items:SCHED&&SCHED.stats.totalItems};
});
chk('C67-21 setup asks for your unit, then the order — four unit chips, Brody\'s order chosen, nothing about "all units"',
    JSON.stringify(d7.unitChips)===JSON.stringify(['heme-renal','cardiopulm','neuro-sensory','msk-skin'])&&d7.before.brody==='msk-skin'&&d7.before.unitOn==='msk-skin'
    &&d7.before.ordOn==='brody'&&d7.before.steps.indexOf('sequence')<0&&!/all units|every unit/i.test(d7.blockTxt),
    JSON.stringify({chips:d7.unitChips,before:d7.before,txt:d7.blockTxt.slice(0,160)}));
chk('C67-22 "My own order" keeps the unit you picked: its weeks, its exam (Exam 4, Nov 9), then the order and dates steps',
    d7.own.brody==='seq'&&d7.own.unit==='msk-skin'&&d7.own.unitOn==='msk-skin'&&JSON.stringify(d7.own.topics)==='["u:msk-skin:1","u:msk-skin:2","u:msk-skin:3"]'
    &&d7.own.iso==='2026-11-09'&&/Brody Exam 4/.test(d7.own.label)&&d7.own.steps.indexOf('sequence')>0&&d7.own.steps.indexOf('dates')>d7.own.steps.indexOf('sequence')&&d7.kept,
    JSON.stringify(d7.own)+' kept='+d7.kept);
chk('C67-22b switching unit in your own order switches the weeks and the exam with it; a unit whose exam has passed asks for a date',
    d7.heme.unit==='heme-renal'&&d7.heme.topics.length===4&&d7.heme.topics.every(t=>/^u:heme-renal:/.test(t))&&d7.heme.iso===null&&typeof d7.heme.valid==='string',
    JSON.stringify(d7.heme));
chk('C67-22c …and Brody\'s order takes you straight back to the standard plan',
    d7.brodyAgain.brody==='msk-skin'&&d7.brodyAgain.steps.indexOf('sequence')<0, JSON.stringify(d7.brodyAgain));
chk('C67-22d the dates step offers only the unit\'s exam, and won\'t continue without an exam or with one before the start',
    JSON.stringify(d7.chips)==='["2026-11-09"]'&&d7.dflt.valid===true&&typeof d7.noExam==='string'&&typeof d7.early==='string'&&d7.ok===true,
    JSON.stringify({chips:d7.chips,dflt:d7.dflt,v:[d7.noExam,d7.early,d7.ok]}));
chk('C67-23 the order step lists the unit\'s 3 weeks, there\'s no quiz toggle, and it builds the plan on that unit',
    d7.editor===3&&/Musculoskeletal & Skin/.test(d7.seqTxt)&&!d7.quiz&&/Musculoskeletal & Skin · your order, 3 topics/.test(d7.review)
    &&d7.cfg&&d7.cfg.brody==='seq'&&d7.cfg.unit==='msk-skin'&&d7.cfg.topics===3&&d7.cfg.end==='2027-05-01'&&d7.items>0,
    JSON.stringify({editor:d7.editor,quiz:d7.quiz,cfg:d7.cfg,items:d7.items,review:d7.review.slice(0,80)}));

// ---------- 7b. feature parity with a standard Brody plan ----------
/* Every tab, side by side: a plan in your own order must offer every card and every kind of
   control a standard Brody plan does. The only differences allowed are the named replacements
   below — so a feature added to Brody plans later, and forgotten here, fails this. */
const ALLOWED={cardsOnlyStandard:['Weekly plan'],attrsOnlyStandard:['data-bfree']};
const parity=await p.evaluate(async()=>{
  await new Promise(r=>loadUWorld(r));
  const mk=kind=>{AUTHED=true;todayISO=()=>'2026-10-20';
    S.settings={seenBrodyHelp:true,seenUpdate:LATEST_UPDATE};
    PRACTICE_KEYS.forEach(k=>{S[k]={total:null,blocks:{}};});
    Object.assign(S,{vdone:{},vdoneDate:{},vdoneAt:{},vundone:{},vskip:{},vshaky:{},akdone:{},notes:{},streak:{days:{}},assessments:{},_resetAt:0});
    const res={bnb:true,pathoma:true,sketchy:true,bootcamp:true,uwlib:true,anking:true,uworld:true,fa:true};
    const blk=brodyBlockById('msk-skin');
    S.cfgs={step1:null,nbme:kind==='seq'
      ?{examType:'nbme',brody:SEQ_ID,seqUnit:'msk-skin',examLabel:'Brody Exam 4 · Musculoskeletal & Skin',startISO:'2026-10-20',examISO:'2026-11-09',restDays:[0],brodyReviewDays:3,resources:res}
      :{examType:'nbme',brody:blk.id,examLabel:blk.name,examISO:blk.shelf,startISO:blk.weeks[0].start,restDays:[0],resources:res,systems:blk.systems.slice(),brodyReviewDays:3}};
    normalizeCfg(S.cfgs.nbme,'nbme');activate('nbme');S.active='nbme';reflow();};
  const scan=async()=>{const out={};
    for(const v of ['today','stats','adjust:menu','adjust:edit','checklist']){
      const [view,sub]=v.split(':');VIEW=view;ADJ_VIEW=sub==='edit'?'edit':null;render();await new Promise(r=>setTimeout(r,40));
      const attrs=new Set();document.querySelectorAll('#app *').forEach(e=>{for(const a of e.attributes)if(a.name.startsWith('data-'))attrs.add(a.name);});
      // titles compared with numbers masked: "Today · Tue, Oct 20 6.6h · 20 to read" is the same card at any load
      out[v]={cards:[...new Set([...document.querySelectorAll('#app .cardhd')].map(e=>e.textContent.replace(/\s+/g,' ').trim().replace(/\d+(\.\d+)?/g,'#')))],attrs:[...attrs],
        weekCopy:[...document.querySelectorAll('#app [data-uwkind$="|week"]')].map(b=>b.textContent)};}   // the test builder's week tab
    VIEW='today';ADJ_VIEW=null;render();return out;};
  mk('std');const std=await scan();mk('seq');const seq=await scan();
  return {std,seq};
});
const gaps=[];
Object.keys(parity.std).forEach(v=>{
  parity.std[v].cards.filter(c=>parity.seq[v].cards.indexOf(c)<0&&ALLOWED.cardsOnlyStandard.indexOf(c)<0).forEach(c=>gaps.push(v+': card "'+c+'"'));
  parity.std[v].attrs.filter(a=>parity.seq[v].attrs.indexOf(a)<0&&ALLOWED.attrsOnlyStandard.indexOf(a)<0).forEach(a=>gaps.push(v+': control '+a));
});
chk('C67-30 every tab offers a plan in your own order every card and control a standard Brody plan has (bar the quiz toggle and the weekly table it replaces)',
    gaps.length===0, JSON.stringify(gaps.slice(0,8)));
chk('C67-31 a UWorld test can be built from a whole topic, as from a Brody week — named by its Brody week, not its place in your order',
    parity.std.today.weekCopy.some(t=>/^Brody week \d+$/.test(t))&&parity.seq.today.weekCopy.some(t=>/^Brody week \d+$/.test(t))
      &&!parity.seq.today.weekCopy.some(t=>/topic/.test(t)),
    JSON.stringify({std:parity.std.today.weekCopy,seq:parity.seq.today.weekCopy}));

// ---------- 8. every view, and the sync invariant ----------
const d8=await p.evaluate(async()=>{
  const fails=[];
  const views=async tag=>{for(const v of ['today','stats','adjust','checklist']){VIEW=v;ADJ_VIEW=v==='adjust'?'edit':null;
    try{render();await new Promise(r=>setTimeout(r,25));}catch(e){fails.push(tag+' '+v+': '+String(e).slice(0,90));}}
    VIEW='today';ADJ_VIEW=null;render();};
  window.__seq({legacy:true,topics:window.__allWeeks()});await views('legacy');
  window.__seq({arts:true,topics:seqDefaultTopics('msk-skin').concat(['s:Endocrinology'])});await views('unit');
  const a=JSON.stringify(persistObj());const m1=JSON.stringify(mergeState(JSON.parse(a),JSON.parse(a)));
  return {fails,idem:a===m1,kept:JSON.parse(a).cfgs.nbme.seqTopics.length,unit:JSON.parse(m1).cfgs.nbme.seqUnit};
});
chk('C67-24 every view renders on a plan in your own order, and on one from before', d8.fails.length===0, JSON.stringify(d8.fails));
chk('C67-25 mergeState(x,x) === x with your own order in the profile — and the order and its unit survive it',
    d8.idem&&d8.kept===4&&d8.unit==='msk-skin', JSON.stringify(d8));
chk('C67-26 no uncaught page errors', errors.length===0, errors.slice(0,3).join(' | '));

await close();
process.exit(report() ? 1 : 0);
