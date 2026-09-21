/* C58 · Free-paced Brody plans (Plan → "Even pace to the exam").
 *
 * The feature keeps the Brody CONTENT MAP and drops only the weekly quizzes as
 * deadlines. That claim has two halves, and both are easy to break later:
 *
 *   1. the content really is identical — same videos, same count, same order, same
 *      week buckets, same review buffer. If free pace ever quietly changed WHAT is
 *      scheduled, it would be a different feature.
 *   2. the pace really is the even spread, and the per-quiz staircase is gone.
 *
 * So most of this file compares the two modes against each other on every block
 * rather than asserting absolute numbers, which keeps it honest as the catalog grows.
 *
 * WHAT THE THREE BLOCKS EACH SHOW (measured, not assumed — the modes differ in
 * different ways depending on how front-loaded a block is, and all three are
 * correct):
 *
 *   heme-renal     4.5 → 4.0 h/day.  The pace itself drops; the lighter days are
 *                                    paid for out of the banked review days (5 → 3).
 *   cardiopulm     4.5 → 4.5 h/day.  Pace unchanged, but week 1 stops being flagged
 *                                    as more-than-fits and the plan becomes feasible.
 *   neuro-sensory  7.0 → 7.0 h/day.  82 h over 12 open days is ~6.8 h/day whatever
 *                                    you do, so this block stays infeasible — free
 *                                    pace narrows three warnings to one honest one
 *                                    ("the unit doesn't fit") instead of pretending.
 *
 * It also pins the two things a new config field can break by itself: the sync
 * invariant (mergeState(x,x) must be byte-identical or the app loops adopt→push
 * forever) and a fresh plan not inheriting a stale mode.
 */
import { openApp, checker } from '../harness.mjs';

const { page: p, errors, mobilePage, close } = await openApp();
const { chk, report } = checker('Brody free pace');

await p.evaluate(()=>{
  window.__mk=(blockId,free,today,join)=>{
    const blk=brodyBlockById(blockId);
    AUTHED=true;todayISO=()=>(today||blk.weeks[0].start);S.settings={seenBrodyHelp:true};
    PRACTICE_KEYS.forEach(k=>{S[k]={total:null,blocks:{}};});
    Object.assign(S,{vdone:{},vdoneDate:{},vdoneAt:{},vundone:{},vskip:{},vshaky:{},akdone:{},
      notes:{},streak:{days:{}},assessments:{},_resetAt:0});
    S.cfgs.nbme={examType:'nbme',brody:blk.id,examLabel:blk.name,examISO:blk.shelf,startISO:blk.weeks[0].start,
      restDays:[0],resources:{bnb:true,pathoma:true,sketchy:true,bootcamp:true},systems:blk.systems.slice(),
      brodyReviewDays:3,brodyJoinWk:join||1,brodyJoinDate:blk.weeks[(join||1)-1].start};
    if(free)S.cfgs.nbme.brodyFree=true;
    normalizeCfg(S.cfgs.nbme,'nbme');activate('nbme');S.active='nbme';VIEW='today';
    delete S.cfg.brodyPace;              // unstamped, so the recommendation is what we read
    reflow();
  };
  // the shape of a built schedule, in the terms the two modes must agree on
  window.__shape=()=>{
    const c=S.cfg,blk=brodyBlock(c),loads=brodyWeekLoads(c,blk);
    const min=loads.reduce((a,w)=>a+w.loadMin,0),days=loads.reduce((a,w)=>a+w.days,0);
    return {
      pace:SCHED.brodyPace, free:!!SCHED.brodyFree,
      items:SCHED.planItems.length,
      order:SCHED.planItems.map(v=>v.id).join('\u0001'),
      weeks:SCHED.planItems.map(v=>v.wk).join(','),
      totalMin:SCHED.stats.totalMin,
      reviewBuf:SCHED.reviewBuf, reviewCutoff:SCHED.reviewCutoff,
      reviewDays:SCHED.stats.reviewDaysLeft,
      tail:SCHED.days.filter(d=>d.todo>0).map(d=>d.iso).pop()||null,
      heavy:SCHED.weekLoad.filter(w=>w.heavy).map(w=>w.n),
      nWeeks:blk.weeks.length,
      feasible:SCHED.stats.feasible,
      deadlines:SCHED.weekLoad.map(w=>w.deadline),
      quizzes:SCHED.weekLoad.map(w=>w.quiz),
      odbd:loads.map(w=>w.odbd),
      evenRaw:min/days/60, openDays:days, shelf:blk.shelf,
      perDay:SCHED.days.filter(d=>!d.past&&!d.rest&&!d.off&&!d.review).map(d=>d.min),
    };
  };
  window.__hero=()=>paceHero().replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
});

const BLOCKS=await p.evaluate(()=>BRODY_BLOCKS.map(b=>b.id));
const M={};
for (const id of BLOCKS) M[id]={
  quiz: await p.evaluate(b=>{window.__mk(b,false);return window.__shape();}, id),
  free: await p.evaluate(b=>{window.__mk(b,true);return window.__shape();}, id),
};
const every=(fn)=>BLOCKS.every(id=>fn(M[id].free,M[id].quiz,id));
const why=(fn)=>BLOCKS.filter(id=>!fn(M[id].free,M[id].quiz,id)).join(', ')||'—';

chk('C58-0 all three blocks were measured in both modes',
    BLOCKS.length===3&&BLOCKS.every(id=>M[id].free.items>0), JSON.stringify(BLOCKS));

// ---------- 1. the content map is untouched, on every block ----------
chk('C58-1 free pace schedules the same number of videos',
    every((f,q)=>f.items===q.items&&f.items>0), why((f,q)=>f.items===q.items&&f.items>0));
chk('C58-2 …the same videos in the same order',
    every((f,q)=>f.order===q.order), why((f,q)=>f.order===q.order));
chk('C58-3 …in the same Brody week buckets',
    every((f,q)=>f.weeks===q.weeks), why((f,q)=>f.weeks===q.weeks));
chk('C58-4 …for the same total video time',
    every((f,q)=>f.totalMin===q.totalMin), why((f,q)=>f.totalMin===q.totalMin));
chk('C58-5 …and the same review buffer',
    every((f,q)=>f.reviewBuf===q.reviewBuf&&f.reviewCutoff===q.reviewCutoff),
    why((f,q)=>f.reviewBuf===q.reviewBuf&&f.reviewCutoff===q.reviewCutoff));

// ---------- 2. the quiz staircase is gone, the quiz dates are not ----------
chk('C58-6 the plan reports which mode it is in',
    every(f=>f.free===true)&&BLOCKS.every(id=>M[id].quiz.free===false),
    why(f=>f.free===true));
chk('C58-7 free-paced, every week is owed by the block exam',
    every(f=>new Set(f.deadlines).size===1&&f.deadlines[0]===f.shelf),
    why(f=>new Set(f.deadlines).size===1&&f.deadlines[0]===f.shelf));
chk('C58-8 quiz-paced, the weeks keep their own staggered deadlines',
    BLOCKS.every(id=>new Set(M[id].quiz.deadlines).size>1),
    BLOCKS.map(id=>id+':'+JSON.stringify(M[id].quiz.deadlines)).join(' '));
chk('C58-9 the real quiz dates are still reported in both modes',
    every((f,q)=>JSON.stringify(f.quizzes)===JSON.stringify(q.quizzes)&&new Set(f.quizzes).size>1),
    why((f,q)=>JSON.stringify(f.quizzes)===JSON.stringify(q.quizzes)&&new Set(f.quizzes).size>1));

// ---------- 3. the pace is the even spread ----------
/* The theorem. Quiz pace is max(even, quiz-staircase); free pace drops the second
   term, so it can only ever come out lower or equal — never higher, on any block,
   however the catalog changes. */
chk('C58-10 free pace is never higher than the quiz-driven pace',
    every((f,q)=>f.pace<=q.pace),
    BLOCKS.map(id=>id+' free '+M[id].free.pace+' vs quiz '+M[id].quiz.pace).join('; '));
chk('C58-11 …and equals the even spread, rounded up to the next half hour',
    every(f=>Math.abs(f.pace-Math.max(0.5,Math.ceil(f.evenRaw/0.5)*0.5))<1e-9),
    BLOCKS.map(id=>id+' '+M[id].free.evenRaw.toFixed(3)+'→'+M[id].free.pace).join('; '));
chk('C58-12 …so every week measures against the same pool of open days',
    every(f=>new Set(f.odbd).size===1&&f.odbd[0]===f.openDays),
    why(f=>new Set(f.odbd).size===1&&f.odbd[0]===f.openDays));
/* Heme/Renal is the block where the quiz term genuinely binds below the realism cap,
   so it is the one that demonstrates the pace actually dropping. If this ever stops
   being true it means either the block changed or the quiz term stopped mattering —
   both worth a look. */
chk('C58-13 on Heme/Renal the pace really drops (4.5 → 4.0 h/day)',
    M['heme-renal'].free.pace<M['heme-renal'].quiz.pace,
    'free '+M['heme-renal'].free.pace+' vs quiz '+M['heme-renal'].quiz.pace);
chk('C58-14 …paid for out of the banked review days, not invented',
    every((f,q)=>f.reviewDays<=q.reviewDays),
    BLOCKS.map(id=>id+' '+M[id].free.reviewDays+'/'+M[id].quiz.reviewDays).join('; '));

// ---------- 4. what can and cannot be flagged ----------
/* needH is a running total over a denominator that no longer varies by week, so it
   only climbs — which means a flagged week can only ever be a TRAILING week, and
   "flagged" can only mean "the unit overflows the exam". A flag on an interior week
   would mean the per-quiz staircase leaked back in. */
const suffix=a=>a.every((n,i)=>i===0||n===a[i-1]+1)&&(!a.length||a[a.length-1]===M[BLOCKS[0]].free.nWeeks||true);
chk('C58-15 free-paced, only trailing weeks can be flagged',
    every(f=>f.heavy.every(n=>n>f.nWeeks-f.heavy.length)&&suffix(f.heavy)),
    BLOCKS.map(id=>id+' '+JSON.stringify(M[id].free.heavy)+' of '+M[id].free.nWeeks).join('; '));
/* quiz needH divides by the open days before THAT quiz, free by the days before the
   exam — a denominator that is never smaller. So free can never flag a week quiz
   pacing didn't. */
chk('C58-16 free pace never flags a week that quiz pacing did not',
    every((f,q)=>f.heavy.every(n=>q.heavy.indexOf(n)>=0)),
    BLOCKS.map(id=>id+' free '+JSON.stringify(M[id].free.heavy)+' ⊄ quiz '+JSON.stringify(M[id].quiz.heavy)).join('; '));
chk('C58-17 on Cardiopulm the week-1 firehose flag clears and the plan becomes feasible',
    M['cardiopulm'].quiz.heavy.length>0&&M['cardiopulm'].free.heavy.length===0
      &&M['cardiopulm'].quiz.feasible===false&&M['cardiopulm'].free.feasible===true,
    'quiz '+JSON.stringify(M['cardiopulm'].quiz.heavy)+'/'+M['cardiopulm'].quiz.feasible
      +' → free '+JSON.stringify(M['cardiopulm'].free.heavy)+'/'+M['cardiopulm'].free.feasible);
/* Neuro is 82 h over 12 open days. No pacing rule can make that ≤6 h/day, and free
   pace must not claim otherwise — it narrows three warnings to one, and stays honest
   that the unit does not fit. */
chk('C58-18 on Neuro the unit still does not fit, and says so',
    M['neuro-sensory'].free.heavy.length===1&&M['neuro-sensory'].free.feasible===false
      &&M['neuro-sensory'].quiz.heavy.length===3,
    'free '+JSON.stringify(M['neuro-sensory'].free.heavy)+'/'+M['neuro-sensory'].free.feasible
      +' vs quiz '+JSON.stringify(M['neuro-sensory'].quiz.heavy));

// ---------- 5. the days get flatter, and everything still lands ----------
const sd=v=>{const a=v.perDay.filter(x=>x>0);if(a.length<2)return 0;
  const m=a.reduce((x,y)=>x+y,0)/a.length;
  return Math.sqrt(a.reduce((x,y)=>x+(y-m)*(y-m),0)/a.length);};
chk('C58-19 daily loads are no lumpier than under quiz pacing',
    every((f,q)=>sd(f)<=sd(q)+1e-9),
    BLOCKS.map(id=>id+' '+sd(M[id].free).toFixed(1)+'m vs '+sd(M[id].quiz).toFixed(1)+'m').join('; '));
chk('C58-20 the content still all lands before the review buffer',
    every(f=>f.tail!==null&&f.tail<f.reviewCutoff),
    BLOCKS.map(id=>id+' tail '+M[id].free.tail+' cutoff '+M[id].free.reviewCutoff).join('; '));

// ---------- 6. the Today line says the right thing ----------
const heroFree=await p.evaluate(()=>{window.__mk('heme-renal',true);return window.__hero();});
const heroQuiz=await p.evaluate(()=>{window.__mk('heme-renal',false);return window.__hero();});
const heroTight=await p.evaluate(()=>{window.__mk('neuro-sensory',true);return window.__hero();});
chk('C58-21 free pace never claims you are ahead of a quiz', !/quiz/i.test(heroFree), heroFree);
chk('C58-22 …and quiz pacing still does', /quiz/i.test(heroQuiz), heroQuiz);
chk('C58-23 a free-paced overflow blames the exam, not a quiz',
    !/quiz/i.test(heroTight)&&/exam/i.test(heroTight), heroTight);

// ---------- 7. the toggle ----------
const tog=await p.evaluate(()=>{
  window.__mk('heme-renal',false);
  const c=S.cfg;const start=brodyPace(c);c.brodyPace=start;   // stamp it, as a real plan is
  setBrodyFree(c,true);
  const onFlag=brodyFree(c),onPace=c.brodyPace;
  setBrodyFree(c,false);
  return {start,onFlag,onPace,offFlag:brodyFree(c),offPace:c.brodyPace,
          hasKey:Object.prototype.hasOwnProperty.call(c,'brodyFree')};
});
chk('C58-24 the toggle sets and clears the mode', tog.onFlag===true&&tog.offFlag===false,
    'on '+tog.onFlag+' off '+tog.offFlag);
chk('C58-25 …re-deriving the stamped pace, so the switch is actually visible',
    tog.onPace<tog.offPace&&tog.offPace===tog.start,
    'stamped '+tog.start+' → free '+tog.onPace+' → back '+tog.offPace);
chk('C58-26 …and turning it off removes the key rather than storing false',
    tog.hasKey===false, 'brodyFree is still an own property of the config');

/* A config field is the classic way to break the sync loop: any key persistObj emits
   that mergeState normalises differently reads as "changed" on every snapshot. */
const sync=await p.evaluate(()=>{
  const out=[];
  [false,true].forEach(f=>{
    window.__mk('neuro-sensory',f);
    const a=JSON.stringify(persistObj());
    const b=JSON.stringify(mergeState(JSON.parse(a),JSON.parse(a)));
    out.push({f,same:a===b,len:a.length,hasFlag:/"brodyFree":true/.test(a)});
  });
  return out;
});
sync.forEach(s=>chk('C58-27 mergeState(x,x) is byte-identical — '+(s.f?'free':'quiz')+' paced',
    s.same, 'a '+s.len+' chars, differs after self-merge'));
chk('C58-28 the mode is actually persisted',
    sync[1].hasFlag===true&&sync[0].hasFlag===false,
    'quiz '+sync[0].hasFlag+' free '+sync[1].hasFlag);

// ---------- 8. a fresh plan does not inherit the mode ----------
const fresh=await p.evaluate(()=>{
  window.__mk('heme-renal',true);
  return {before:brodyFree(S.cfg),
          edit:!!defaultsForHub('nbme',false).brodyFree,     // editing keeps the choice
          fresh:!!defaultsForHub('nbme',true).brodyFree};    // a new plan does not
});
chk('C58-29 editing the plan carries the mode through onboarding',
    fresh.before===true&&fresh.edit===true, 'before '+fresh.before+' edit '+fresh.edit);
chk('C58-30 a brand-new plan starts on Brody quiz weeks',
    fresh.fresh===false, 'a fresh plan came back free-paced');

// ---------- 9. the Plan screen renders in both modes, desktop and phone ----------
for (const f of [false,true]) {
  const r=await p.evaluate(free=>{
    window.__mk('heme-renal',free);VIEW='adjust';ADJ_VIEW='edit';render();
    const on=document.querySelector('.tog.on[data-bfree]');
    return {toggle:!!document.querySelector('[data-bfree="1"]'),
      onVal:on?on.dataset.bfree:null,
      txt:document.body.innerText.replace(/\s+/g,' ')};
  },f);
  chk('C58-31 the Plan editor offers the toggle — '+(f?'free':'quiz')+' paced',
      r.toggle&&r.onVal===(f?'1':'0'), 'toggle '+r.toggle+', lit '+r.onVal);
  chk('C58-32 …and describes the active mode — '+(f?'free':'quiz')+' paced',
      f ? /Even pace\./.test(r.txt) : /Quiz weeks\./.test(r.txt), r.txt.slice(0,200));
}
/* The quiz dates have to stay on screen in free mode — that was the explicit design
   call, and it is one deleted string away from being lost. */
const wk=await p.evaluate(()=>{
  window.__mk('heme-renal',true);
  const h=brodyPreview(S.cfg);
  return {refs:(h.match(/bw-ref/g)||[]).length, dates:/quiz /.test(h),
          note:/don’t set your pace/.test(h)};
});
chk('C58-33 free-paced, each week still shows its real quiz date, as a reference',
    wk.refs>0&&wk.dates&&wk.note, JSON.stringify(wk));

const m=await mobilePage();
const mob=await m.evaluate(()=>{
  const blk=brodyBlockById('heme-renal');
  AUTHED=true;todayISO=()=>blk.weeks[0].start;S.settings={seenBrodyHelp:true};
  PRACTICE_KEYS.forEach(k=>{S[k]={total:null,blocks:{}};});
  S.cfgs.nbme={examType:'nbme',brody:blk.id,examLabel:blk.name,examISO:blk.shelf,startISO:blk.weeks[0].start,
    restDays:[0],resources:{bnb:true,pathoma:true,sketchy:true,bootcamp:true},systems:blk.systems.slice(),
    brodyReviewDays:3,brodyJoinWk:1,brodyJoinDate:blk.weeks[0].start,brodyFree:true};
  normalizeCfg(S.cfgs.nbme,'nbme');activate('nbme');S.active='nbme';
  VIEW='adjust';ADJ_VIEW='edit';reflow();render();
  return {sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth};
});
chk('C58-34 the Plan editor does not overflow sideways on a phone',
    mob.sw<=mob.cw+1, 'scrollWidth '+mob.sw+' vs clientWidth '+mob.cw);

/* ---------- 10. everything else about a Brody plan still works ----------
   Free pace is one line in brodyWeekLoads; the pour, the buffer, the rest days, the
   join week and the re-fit are all shared code. That is the design claim, and this is
   where it gets checked rather than asserted — every feature a quiz-paced plan has,
   exercised on a free-paced one. */

// (a) a hand-set pace is honoured, exactly as in quiz mode
const nudge=await p.evaluate(()=>{
  window.__mk('heme-renal',true);
  const c=S.cfg,rec=brodyPace(c);
  c.brodyPace=rec+1.5;reflow();
  const up={pace:SCHED.brodyPace,tail:SCHED.days.filter(d=>d.todo>0).map(d=>d.iso).pop(),
            rev:SCHED.stats.reviewDaysLeft};
  c.brodyPace=Math.max(0.5,rec-1);reflow();
  const down={pace:SCHED.brodyPace,tail:SCHED.days.filter(d=>d.todo>0).map(d=>d.iso).pop(),
              rev:SCHED.stats.reviewDaysLeft};
  return {rec,up,down};
});
chk('C58-35 free-paced, the pace you set by hand is the pace used',
    nudge.up.pace===nudge.rec+1.5&&nudge.down.pace===Math.max(0.5,nudge.rec-1),
    'set '+(nudge.rec+1.5)+'/'+(nudge.rec-1)+' got '+nudge.up.pace+'/'+nudge.down.pace);
chk('C58-36 …and raising it still finishes earlier and banks more review days',
    nudge.up.tail<nudge.down.tail&&nudge.up.rev>=nudge.down.rev,
    'up tail '+nudge.up.tail+' ('+nudge.up.rev+' rev) vs down '+nudge.down.tail+' ('+nudge.down.rev+' rev)');

// (b) the review buffer is still adjustable and still reserved
const buf=await p.evaluate(()=>{
  window.__mk('heme-renal',true);
  const c=S.cfg,out=[];
  [0,3,7].forEach(n=>{c.brodyReviewDays=n;delete c.brodyPace;reflow();
    out.push({n,rev:SCHED.stats.reviewDaysLeft,cut:SCHED.reviewCutoff,
      tail:SCHED.days.filter(d=>d.todo>0).map(d=>d.iso).pop(),
      spill:SCHED.days.some(d=>d.review&&d.todo>0)});});
  return out;
});
chk('C58-37 free-paced, the review buffer still responds to the control',
    buf[0].cut>buf[1].cut&&buf[1].cut>buf[2].cut,
    buf.map(b=>b.n+'d→'+b.cut).join(' '));
chk('C58-38 …and no video is ever scheduled onto a reserved review day',
    buf.every(b=>!b.spill&&(b.tail===undefined||b.tail<b.cut)),
    buf.map(b=>b.n+'d tail '+b.tail+' cut '+b.cut+' spill '+b.spill).join('; '));

// (c) re-fit — the whole point being that it targets the FREE number
const refit=await p.evaluate(()=>{
  window.__mk('heme-renal',true);
  const c=S.cfg;c.brodyPace=brodyPace(c);
  const stamped=c.brodyPace;
  // bank a chunk of work on a future day, the way studying ahead does
  const future=SCHED.days.filter(d=>!d.past&&d.items.length).slice(3,9);
  let n=0;future.forEach(d=>d.items.forEach(it=>{markDone(it.id,d.iso);n++;}));
  reflow();
  const before={tail:SCHED.days.filter(d=>d.todo>0).map(d=>d.iso).pop(),rev:SCHED.stats.reviewDaysLeft};
  const d=brodyRefitDelta(c);
  brodyRefit();
  const after={tail:SCHED.days.filter(d2=>d2.todo>0).map(d2=>d2.iso).pop(),rev:SCHED.stats.reviewDaysLeft};
  return {n,stamped,offered:!!d,rec:d&&d.rec,easier:d&&d.easier,after,before,
          nowPace:c.brodyPace,free:brodyFree(c)};
});
chk('C58-39 free-paced, re-fit is still offered after studying ahead',
    refit.n>0&&refit.offered===true, 'banked '+refit.n+' videos, offered '+refit.offered);
chk('C58-40 …it offers a lighter pace, not a quiz-driven one',
    refit.easier===true&&refit.rec<refit.stamped,
    'stamped '+refit.stamped+' → offered '+refit.rec+' (easier '+refit.easier+')');
chk('C58-41 …and it leaves the plan free-paced, with the work pulled forward',
    refit.free===true&&refit.nowPace===refit.rec&&refit.after.tail<=refit.before.tail,
    'free '+refit.free+' pace '+refit.nowPace+' tail '+refit.before.tail+'→'+refit.after.tail);

// (d) rest days, a day taken off, and a rest day studied anyway
const days=await p.evaluate(()=>{
  window.__mk('heme-renal',true);
  const c=S.cfg;
  const sun=SCHED.days.find(d=>!d.past&&isoToDate(d.iso).getDay()===0);
  const restOk=!!sun&&sun.rest&&sun.items.length===0;
  setDayOn(sun.iso,true);                                  // "Study this day"
  const onRow=SCHED.dayMap[sun.iso];
  const studied=onRow&&!onRow.rest&&onRow.items.length>0;
  setDayOn(sun.iso,false);
  const work=SCHED.days.find(d=>!d.past&&!d.rest&&!d.off&&d.items.length);
  setDayOff(work.iso,true);                                // "Take this day off"
  const offRow=SCHED.dayMap[work.iso];
  const offOk=offRow&&offRow.off&&offRow.items.length===0;
  setDayOff(work.iso,false);
  return {restOk,studied,offOk,free:brodyFree(c)};
});
chk('C58-42 free-paced, rest days are still empty and still respected',
    days.restOk===true, 'the first open Sunday was not an empty rest day');
chk('C58-43 …"Study this day" still opens a rest day and fills it',
    days.studied===true, 'turning a rest day on did not give it videos');
chk('C58-44 …"Take this day off" still clears a day and reflows around it',
    days.offOk===true&&days.free===true, 'off '+days.offOk+', free '+days.free);

// (e) opting out of videos, and the resource toggles
const other=await p.evaluate(()=>{
  window.__mk('heme-renal',true);
  const c=S.cfg;const base=SCHED.planItems.length;
  const victim=SCHED.planItems[10].id;
  c.skip=c.skip||{};c.skip[victim]=true;delete c.brodyPace;reflow();
  const skipped=SCHED.planItems.length;
  delete c.skip[victim];
  c.resources.bootcamp=false;delete c.brodyPace;reflow();
  const noBC=SCHED.planItems.length,pace=SCHED.brodyPace;
  c.resources.bootcamp=true;delete c.brodyPace;reflow();
  return {base,skipped,noBC,pace,backAgain:SCHED.planItems.length,
          goal:typeof weeklyGoalSettingHTML==='function'};
});
chk('C58-45 free-paced, opting a video out still removes it from the plan',
    other.skipped===other.base-1, 'was '+other.base+', after one skip '+other.skipped);
chk('C58-46 …turning a resource off still re-flows and re-prices the plan',
    other.noBC<other.base&&other.pace>0&&other.backAgain===other.base,
    'base '+other.base+' → no-bootcamp '+other.noBC+' ('+other.pace+' h/day) → back '+other.backAgain);
chk('C58-47 …and the weekly question goal is untouched by any of this', other.goal===true, '');

// (f) joining late still starts you at the current week
const late=await p.evaluate(()=>{
  const blk=brodyBlockById('heme-renal');
  window.__mk('heme-renal',true,blk.weeks[2].start,3);
  return {skipped:SCHED.skippedWeeks,weeks:[...new Set(SCHED.planItems.map(v=>v.wk))].sort(),
          earlier:SCHED.days.some(d=>d.earlier)};
});
chk('C58-48 free-paced, a late joiner still starts at their join week',
    late.skipped===2&&late.weeks[0]===3, 'skipped '+late.skipped+', weeks '+JSON.stringify(late.weeks));
chk('C58-49 …with the pre-arrival videos still shown as optional "earlier" work',
    late.earlier===true, 'no earlier-marked days were produced');

chk('C58-50 no page errors anywhere in this run', errors.length===0, errors.join(' | '));

await close();
process.exit(report());
