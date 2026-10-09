/* C61 · The new settings are reachable when BUILDING a plan, not only when editing one.
 *
 * Three features shipped into the Plan editor and nowhere else — even pace, UWorld
 * Library reading, and content depth. Someone setting up a fresh plan never saw any
 * of them, which is how it was reported. The gap was invisible to every other check
 * because they all construct a config directly instead of walking the wizard.
 *
 * So this file drives the actual onboarding screens: it renders each step, clicks the
 * real controls, finishes the wizard, and asserts the choices survive into the built
 * plan. A control that renders but doesn't reach S.cfg would pass a DOM-only check
 * and still be broken.
 */
import { openApp, checker } from '../harness.mjs';

const { page: p, errors, mobilePage, close } = await openApp();
const { chk, report } = checker('Onboarding — new settings reachable at setup');

await p.evaluate(()=>{
  window.__fresh=()=>{
    const blk=brodyBlockById('neuro-sensory');
    AUTHED=true;todayISO=()=>blk.weeks[0].start;
    S.settings={seenBrodyHelp:true,seenUpdate:LATEST_UPDATE};
    PRACTICE_KEYS.forEach(k=>{S[k]={total:null,blocks:{}};});
    Object.assign(S,{vdone:{},vdoneDate:{},vdoneAt:{},vundone:{},vskip:{},vshaky:{},akdone:{},
      notes:{},streak:{days:{}},assessments:{},_resetAt:0});
    S.cfgs={step1:null,nbme:null};S.cfg=null;S.active=null;
    startOnboard('nbme',true);
    _ob.brody=blk.id;_ob.systems=blk.systems.slice();
    _ob.resources={bnb:true,pathoma:true,sketchy:true,bootcamp:true};
    return true;
  };
  // render one wizard step and hand back what it offers
  window.__step=(key)=>{
    _ob.step=obSteps(_ob).indexOf(key);
    renderOnboard();
    const q=sel=>[...document.querySelectorAll(sel)];
    return {
      txt:document.body.innerText.replace(/\s+/g,' '),
      uwlib:!!document.querySelector('[data-ores="uwlib"]'),
      ctypes:q('[data-octype]').map(b=>b.dataset.octype),
      cpresets:q('[data-ocpreset]').map(b=>b.dataset.ocpreset),
      cpresetOn:q('.tog.on[data-ocpreset]').map(b=>b.dataset.ocpreset),
      ctypeOn:q('.tog.on[data-octype]').map(b=>b.dataset.octype).sort(),
      bfree:q('[data-obfree]').map(b=>b.dataset.obfree),
      bfreeOn:q('.tog.on[data-obfree]').map(b=>b.dataset.obfree),
      steps:obSteps(_ob),
    };
  };
  window.__click=(sel)=>{const b=document.querySelector(sel);if(!b)return false;b.click();return true;};
  window.__built=()=>{const c=S.cfg;return c?{
    brody:c.brody, free:!!c.brodyFree, uwlib:!!(c.resources||{}).uwlib,
    contentOff:c.contentOff||null, min:contentIsMinimal(c), full:contentIsComprehensive(c),
    items:SCHED?SCHED.stats.totalItems:null, min_:SCHED?SCHED.stats.totalMin:null,
    pace:SCHED?SCHED.brodyPace:null, arts:SCHED?SCHED.stats.totalArts:null,
  }:null;};
});

// ---------- 1. the controls are actually on the setup screens ----------
await p.evaluate(()=>window.__fresh());
const res=await p.evaluate(()=>window.__step('resources'));
chk('C61-1 the resources step offers the UWorld Library toggle',
    res.uwlib===true, 'toggle absent from the resources step');
chk('C61-2 …and the four content-depth switches',
    res.ctypes.sort().join(',')==='anat,embryo,hist,physio', JSON.stringify(res.ctypes));
chk('C61-3 …and both depth presets',
    res.cpresets.sort().join(',')==='full,min', JSON.stringify(res.cpresets));
chk('C61-4 a new plan starts Comprehensive, with every type lit',
    res.cpresetOn.join()==='full'&&res.ctypeOn.length===4,
    'preset '+JSON.stringify(res.cpresetOn)+' types '+JSON.stringify(res.ctypeOn));
const rou=await p.evaluate(()=>window.__step('routine'));
chk('C61-5 the routine step offers the pace-mode switch',
    rou.bfree.sort().join(',')==='0,1', JSON.stringify(rou.bfree));
chk('C61-6 …defaulting to Brody quiz weeks',
    rou.bfreeOn.join()==='0', JSON.stringify(rou.bfreeOn));
chk('C61-7 …and explains what each mode does',
    /Quiz weeks\./.test(rou.txt)&&/Even pace to the exam/.test(rou.txt), rou.txt.slice(0,160));

// ---------- 2. clicking them changes the wizard's own state and preview ----------
const live=await p.evaluate(()=>{
  window.__fresh();window.__step('resources');
  const before=brodyPace(_ob);
  window.__click('[data-ocpreset="min"]');
  const afterMin={min:contentIsMinimal(_ob),pace:brodyPace(_ob)};
  window.__click('[data-octype="anat"]');                 // one type back on
  const mid={min:contentIsMinimal(_ob),full:contentIsComprehensive(_ob),
             anatOn:!contentOff(_ob).anat};
  window.__click('[data-ocpreset="full"]');
  const afterFull={full:contentIsComprehensive(_ob),pace:brodyPace(_ob)};
  return {before,afterMin,mid,afterFull};
});
chk('C61-8 the Minimal preset takes effect inside the wizard, and re-prices the pace',
    live.afterMin.min===true&&live.afterMin.pace<live.before,
    'pace '+live.before+' → '+live.afterMin.pace);
chk('C61-9 an individual type can be switched back on, leaving neither preset',
    live.mid.anatOn===true&&!live.mid.min&&!live.mid.full, JSON.stringify(live.mid));
chk('C61-10 Comprehensive restores the original pace',
    live.afterFull.full===true&&live.afterFull.pace===live.before,
    live.afterFull.pace+' vs '+live.before);
const paceLive=await p.evaluate(()=>{
  window.__fresh();window.__step('routine');
  const quiz=brodyPace(_ob);
  window.__click('[data-obfree="1"]');
  const free=brodyPace(_ob),isFree=brodyFree(_ob);
  window.__click('[data-obfree="0"]');
  return {quiz,free,isFree,back:brodyFree(_ob),backPace:brodyPace(_ob)};
});
chk('C61-11 switching to even pace inside the wizard re-derives the recommendation',
    paceLive.isFree===true&&paceLive.free<=paceLive.quiz&&paceLive.back===false,
    'quiz '+paceLive.quiz+' → free '+paceLive.free+' → back '+paceLive.backPace);

// ---------- 3. the choices survive into the built plan ----------
const built=await p.evaluate(()=>{
  window.__fresh();
  window.__step('resources');
  window.__click('[data-ores="uwlib"]');      // reading on
  window.__click('[data-ocpreset="min"]');   // Minimal
  window.__step('routine');
  window.__click('[data-obfree="1"]');       // even pace
  commitOnboard();
  return window.__built();
});
chk('C61-12 finishing the wizard carries the reading toggle into the plan',
    built.uwlib===true&&built.arts>0, 'uwlib '+built.uwlib+', articles '+built.arts);
chk('C61-13 …the content depth',
    built.min===true&&built.contentOff&&Object.keys(built.contentOff).length===4,
    JSON.stringify(built.contentOff));
chk('C61-14 …and the pace mode',
    built.free===true, 'brodyFree '+built.free);
chk('C61-15 …and the plan that comes out is the Minimal one, not the full one',
    built.min_ < 50*60 && built.pace<=4.5, Math.round(built.min_/60)+' h at '+built.pace+' h/day');

// ---------- 4. a reading-only plan can be BUILT, which the old gate blocked ----------
const readOnly=await p.evaluate(()=>{
  window.__fresh();
  _ob.resources={bnb:false,pathoma:false,sketchy:false,bootcamp:false};
  window.__step('resources');
  const blockedBefore=obStepValid(_ob,'resources');
  window.__click('[data-ores="uwlib"]');
  const allowedAfter=obStepValid(_ob,'resources');
  commitOnboard();
  const c=S.cfg;
  return {blockedBefore:blockedBefore!==true,allowedAfter:allowedAfter===true,
          built:!!c,uwlib:!!(c&&(c.resources||{}).uwlib),
          arts:SCHED?SCHED.stats.totalArts:0,mins:SCHED?SCHED.stats.totalMin:null};
});
chk('C61-16 with nothing on, setup still refuses to continue',
    readOnly.blockedBefore===true, 'the resources step allowed an empty plan');
chk('C61-17 turning on reading alone is enough to continue',
    readOnly.allowedAfter===true, 'reading alone was still refused');
chk('C61-18 …and the reading-only plan actually builds, with no video hours',
    readOnly.built&&readOnly.uwlib&&readOnly.arts===108&&readOnly.mins===0,
    JSON.stringify(readOnly));

// ---------- 5. editing an existing plan carries the settings back in ----------
const edit=await p.evaluate(()=>{
  const ob=defaultsForHub('nbme',false);      // "View / edit current plan"
  return {free:!!ob.brodyFree,uwlib:!!(ob.resources||{}).uwlib,
          off:ob.contentOff?Object.keys(ob.contentOff).length:0};
});
chk('C61-19 re-opening setup on an existing plan shows its current settings',
    edit.uwlib===true, 'reading state lost when re-opening setup');
const freshAgain=await p.evaluate(()=>{
  const ob=defaultsForHub('nbme',true);       // "Start a new plan"
  return {free:!!ob.brodyFree,off:ob.contentOff?Object.keys(ob.contentOff).length:0};
});
chk('C61-20 …while a brand-new plan starts from the defaults again',
    freshAgain.free===false&&freshAgain.off===0, JSON.stringify(freshAgain));

// ---------- 6. blocks with no articles mapped don't offer reading ----------
const other=await p.evaluate(()=>{
  window.__fresh();
  _ob.brody='heme-renal';_ob.systems=brodyBlockById('heme-renal').systems.slice();
  const s=window.__step('resources');
  return {uwlib:s.uwlib,ctypes:s.ctypes.length};
});
chk('C61-21 a block with no articles mapped offers no reading toggle at setup',
    other.uwlib===false, 'reading offered on a block with nothing mapped');
chk('C61-22 …but content depth is still offered there',
    other.ctypes===4, other.ctypes+' type switches');

// ---------- 7. the wizard still works end to end ----------
const walk=await p.evaluate(()=>{
  window.__fresh();
  const steps=obSteps(_ob),seen=[];
  for(const k of steps){_ob.step=steps.indexOf(k);renderOnboard();
    seen.push({k,ok:!!document.querySelector('.wrap'),len:document.body.innerText.length});}
  return {steps,seen,bad:seen.filter(s=>!s.ok||s.len<50).map(s=>s.k)};
});
chk('C61-23 every setup step still renders',
    walk.bad.length===0&&walk.seen.length===walk.steps.length,
    'empty or broken steps: '+JSON.stringify(walk.bad));

const m=await mobilePage();
const mob=await m.evaluate(()=>{
  const blk=brodyBlockById('neuro-sensory');
  AUTHED=true;todayISO=()=>blk.weeks[0].start;
  S.settings={seenBrodyHelp:true,seenUpdate:LATEST_UPDATE};
  PRACTICE_KEYS.forEach(k=>{S[k]={total:null,blocks:{}};});
  S.cfgs={step1:null,nbme:null};S.cfg=null;S.active=null;
  startOnboard('nbme',true);
  _ob.brody=blk.id;_ob.systems=blk.systems.slice();
  _ob.resources={bnb:true,pathoma:true,sketchy:true,bootcamp:true,uwlib:true};
  const out={};
  ['resources','routine'].forEach(k=>{_ob.step=obSteps(_ob).indexOf(k);renderOnboard();
    out[k]={sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth};});
  return out;
});
chk('C61-24 the resources step does not overflow sideways on a phone',
    mob.resources.sw<=mob.resources.cw+1, mob.resources.sw+' vs '+mob.resources.cw);
chk('C61-25 the routine step does not overflow sideways on a phone',
    mob.routine.sw<=mob.routine.cw+1, mob.routine.sw+' vs '+mob.routine.cw);

chk('C61-26 no page errors anywhere in this run', errors.length===0, errors.join(' | '));

await close();
process.exit(report());
