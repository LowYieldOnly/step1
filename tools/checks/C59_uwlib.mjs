/* C59 · UWorld Library articles as a schedulable resource.
 *
 * Articles are a second currency in a scheduler that was entirely minutes-based, so
 * the risks are specific and worth naming:
 *
 *   1. leakage — an article must never be treated as a video. It has min:0, so if it
 *      ever entered the minute pour it would be invisible: zero-cost, unlimited per
 *      day, silently inflating every day's plate. Several checks here exist only to
 *      prove that hasn't happened.
 *   2. the reverse — articles must not be scheduled when the resource is off, and
 *      must not appear on blocks nobody has mapped them to.
 *   3. the count budget has to obey the same laws the minute budget does: the Brody
 *      week order, the quiz deadline, the review buffer, rest days, the join week,
 *      and the rule that a finished item keeps its place in the pour.
 *   4. a reading-only plan has no hours at all, which is a shape no screen in this
 *      app had ever been given before.
 */
import { openApp, checker } from '../harness.mjs';

const { page: p, errors, mobilePage, close } = await openApp();
const { chk, report } = checker('UWorld Library articles');

await p.evaluate(()=>{
  window.__mk=(opts)=>{
    opts=opts||{};
    const blk=brodyBlockById(opts.block||'neuro-sensory');
    AUTHED=true;todayISO=()=>(opts.today||blk.weeks[0].start);
    S.settings={seenBrodyHelp:true,seenUpdate:LATEST_UPDATE};
    PRACTICE_KEYS.forEach(k=>{S[k]={total:null,blocks:{}};});
    Object.assign(S,{vdone:{},vdoneDate:{},vdoneAt:{},vundone:{},vskip:{},vshaky:{},akdone:{},
      notes:{},streak:{days:{}},assessments:{},_resetAt:0});
    // every video key is set EXPLICITLY: normalizeCfg force-enables B&B when the key
    // is absent (legacy back-compat), which would smuggle 82 videos into a plan
    // meant to be reading-only
    const res={bnb:!!opts.vids,pathoma:!!opts.vids,sketchy:!!opts.vids,bootcamp:!!opts.vids,uwlib:!!opts.arts};
    S.cfgs.nbme={examType:'nbme',brody:blk.id,examLabel:blk.name,examISO:blk.shelf,
      startISO:blk.weeks[0].start,restDays:[0],resources:res,systems:blk.systems.slice(),
      brodyReviewDays:3,brodyJoinWk:opts.join||1,brodyJoinDate:blk.weeks[(opts.join||1)-1].start};
    if(opts.free)S.cfgs.nbme.brodyFree=true;
    normalizeCfg(S.cfgs.nbme,'nbme');activate('nbme');S.active='nbme';VIEW='today';
    delete S.cfg.brodyPace;delete S.cfg.artPerDay;
    reflow();
  };
  window.__shape=()=>{
    const st=SCHED.stats;
    const open=SCHED.days.filter(d=>!d.past&&!d.rest&&!d.off&&!d.review);
    return {
      artsOn:!!SCHED.artsOn, artPace:SCHED.artPace||0, pace:SCHED.brodyPace,
      totalArts:st.totalArts||0, remArts:st.remArts||0,
      totalItems:st.totalItems, remItems:st.remItems, totalMin:st.totalMin,
      scheduledArts:SCHED.days.reduce((a,d)=>a+(d.arts||0),0),
      artIdsScheduled:SCHED.days.reduce((a,d)=>a.concat(d.items.filter(x=>x.art).map(x=>x.id)),[]),
      perDayArts:open.map(d=>d.arts||0), perDayMin:open.map(d=>d.min),
      tail:SCHED.days.filter(d=>d.todo>0||(d.artsTodo||0)>0).map(d=>d.iso).pop()||null,
      cutoff:SCHED.reviewCutoff, reviewDays:st.reviewDaysLeft,
      label:open.length?dayTimeLabel(open[0]):'',
      artWeeks:SCHED.planArts.map(a=>a.wk),
      // the order articles land in, to prove the Brody week order is respected
      artDayByWk:(()=>{const first={};SCHED.days.forEach(d=>d.items.forEach(x=>{
        if(x.art&&first[x.wk]==null)first[x.wk]=d.iso;}));return first;})(),
      hero:paceHero().replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(),
    };
  };
});

const V   = await p.evaluate(()=>{window.__mk({vids:true});            return window.__shape();});
const VA  = await p.evaluate(()=>{window.__mk({vids:true,arts:true});  return window.__shape();});
const A   = await p.evaluate(()=>{window.__mk({arts:true});            return window.__shape();});

// ---------- 1. the catalog entries ----------
const cat=await p.evaluate(()=>{
  const a=catVideos().filter(isArticle);
  return {n:a.length,sys:[...new Set(a.map(v=>v.sys))],
    anyMin:a.filter(v=>v.min!==0).length,
    ids:a.map(itemId),dupIds:(()=>{const s=new Set(a.map(itemId));return a.length-s.size;})(),
    order:RES_ORDER.indexOf('uwlib'),lastInOrder:RES_ORDER[RES_ORDER.length-1]==='uwlib',
    badge:resBadge('uwlib').replace(/<[^>]*>/g,'').trim(),label:resLabel('uwlib'),
    // realItemIds FILTERS a list of ids, dropping any the catalog doesn't know.
    // Articles must survive it, or their check-offs would be discarded on sync.
    inRealIds:realItemIds(a.map(itemId)).length===a.length};
});
chk('C59-1 all 108 Neurology articles are in the catalog',
    cat.n===108&&cat.sys.length===1&&cat.sys[0]==='Neurology', cat.n+' / '+JSON.stringify(cat.sys));
chk('C59-2 every article carries min:0 — no invented reading times',
    cat.anyMin===0, cat.anyMin+' articles have a non-zero runtime');
chk('C59-3 article ids are unique, and recognised as real (so progress is never pruned)',
    cat.dupIds===0&&cat.inRealIds===true, 'dupes '+cat.dupIds+', all real '+cat.inRealIds);
chk('C59-4 the resource is registered, and sorts after every video resource',
    cat.order===5&&cat.lastInOrder&&cat.badge==='UW'&&/UWorld/.test(cat.label),
    'order '+cat.order+' badge '+cat.badge+' label '+cat.label);

// ---------- 2. no leakage in either direction ----------
chk('C59-5 with the resource off, not one article is scheduled',
    V.artsOn===false&&V.totalArts===0&&V.scheduledArts===0,
    'artsOn '+V.artsOn+', total '+V.totalArts+', scheduled '+V.scheduledArts);
chk('C59-6 turning it on does not change the video plan at all',
    VA.totalMin===V.totalMin&&VA.pace===V.pace
      &&JSON.stringify(VA.perDayMin)===JSON.stringify(V.perDayMin),
    'min '+VA.totalMin+'/'+V.totalMin+', pace '+VA.pace+'/'+V.pace);
chk('C59-7 …it adds exactly the articles to the item count, and no minutes',
    VA.totalItems===V.totalItems+108&&VA.totalMin===V.totalMin,
    'items '+V.totalItems+' → '+VA.totalItems);
/* The leak that would matter most: an article counted as a video costs 0 minutes, so
   it would be unlimited per day. If that ever happened the article count per day
   would be 108 on day one instead of the article pace. */
chk('C59-8 articles are capped by their own per-day count, not by minutes',
    VA.perDayArts.length>0&&VA.perDayArts.every(n=>n<=VA.artPace)
      &&VA.perDayArts[0]===VA.artPace,
    'pace '+VA.artPace+' per-day '+JSON.stringify(VA.perDayArts.slice(0,6)));
chk('C59-9 reading-only: no minutes anywhere, and the video pace is not quoted',
    A.totalMin===0&&A.totalItems===108&&A.perDayMin.every(m=>m===0),
    'min '+A.totalMin+' items '+A.totalItems);

// ---------- 3. every article gets a day, inside the rules ----------
[['videos + articles',VA],['articles only',A]].forEach(([lab,s])=>{
  chk('C59-10 all 108 articles are scheduled — '+lab,
      s.scheduledArts===108&&new Set(s.artIdsScheduled).size===108,
      'scheduled '+s.scheduledArts+', distinct '+new Set(s.artIdsScheduled).size);
  chk('C59-11 …and all of them land before the review buffer — '+lab,
      s.tail!==null&&s.tail<s.cutoff, 'tail '+s.tail+' cutoff '+s.cutoff);
  chk('C59-12 …in Brody week order, week 1 reading starting first — '+lab,
      s.artDayByWk[1]&&s.artDayByWk[2]&&s.artDayByWk[3]
        &&s.artDayByWk[1]<=s.artDayByWk[2]&&s.artDayByWk[2]<=s.artDayByWk[3],
      JSON.stringify(s.artDayByWk));
});
const rules=await p.evaluate(()=>{
  window.__mk({arts:true});
  const c=S.cfg;
  const sundays=SCHED.days.filter(d=>isoToDate(d.iso).getDay()===0&&(d.arts||0)>0).length;
  const inBuffer=SCHED.days.filter(d=>d.review&&(d.arts||0)>0).length;
  // take a day off: its reading must move, not vanish
  const work=SCHED.days.find(d=>!d.past&&(d.arts||0)>0);
  // guarded so a regression that schedules NO reading fails legibly here instead of
  // throwing a TypeError three checks later
  if(!work)return {noArts:true};
  const before=SCHED.days.reduce((a,d)=>a+(d.arts||0),0);
  setDayOff(work.iso,true);
  const offRow=SCHED.dayMap[work.iso];
  const after=SCHED.days.reduce((a,d)=>a+(d.arts||0),0);
  setDayOff(work.iso,false);
  return {sundays,inBuffer,offEmpty:(offRow.arts||0)===0,before,after};
});
chk('C59-13 no reading is scheduled on a rest day', !rules.noArts&&rules.sundays===0, rules.sundays+' Sundays carry reading');
chk('C59-14 no reading is scheduled into the review buffer', !rules.noArts&&rules.inBuffer===0, rules.inBuffer+' buffer days carry reading');
chk('C59-15 taking a day off moves its reading rather than losing it',
    !rules.noArts&&rules.offEmpty&&rules.after===rules.before,
    'off day empty '+rules.offEmpty+', total '+rules.before+' → '+rules.after);

// ---------- 4. the count budget obeys the quiz law ----------
const law=await p.evaluate(()=>{
  const out={};
  [false,true].forEach(free=>{
    window.__mk({arts:true,free});
    const c=S.cfg,blk=brodyBlock(c);
    const L=brodyArtLoads(c,blk);
    out[free?'free':'quiz']={
      counts:L.map(w=>w.count), odbd:L.map(w=>w.odbd), deadlines:L.map(w=>w.deadline),
      rec:brodyRecArts(c,blk), pace:SCHED.artPace,
      // when each week's reading is actually finished, against that week's quiz
      lastByWk:(()=>{const last={};SCHED.days.forEach(d=>d.items.forEach(x=>{
        if(x.art)last[x.wk]=d.iso;}));return last;})(),
      quizzes:L.map(w=>w.quiz),
    };
  });
  return out;
});
chk('C59-16 article loads split across the weeks as the map says (51/51/6)',
    JSON.stringify(law.quiz.counts)==='[51,51,6]', JSON.stringify(law.quiz.counts));
chk('C59-17 quiz-paced, week 1 reading is finished by week 1’s quiz',
    law.quiz.lastByWk[1]<=law.quiz.quizzes[0], 'week 1 reading ends '+law.quiz.lastByWk[1]+', quiz '+law.quiz.quizzes[0]);
chk('C59-18 the article count is a whole number of at least one',
    Number.isInteger(law.quiz.pace)&&law.quiz.pace>=1, String(law.quiz.pace));
/* Free pace drops the quiz term for reading exactly as it does for video, so the
   recommendation can only fall. */
chk('C59-19 free-paced, every week’s reading is owed by the exam and the count drops',
    new Set(law.free.deadlines).size===1&&law.free.rec<=law.quiz.rec,
    'quiz '+law.quiz.rec+'/day → free '+law.free.rec+'/day, deadlines '+JSON.stringify(law.free.deadlines));
chk('C59-20 …and free-paced reading spreads over the whole pool of open days',
    new Set(law.free.odbd).size===1, JSON.stringify(law.free.odbd));

// ---------- 5. the stamped count, and the cursor-floor rule ----------
const stamp=await p.evaluate(()=>{
  window.__mk({arts:true});
  const c=S.cfg;const rec=brodyArtPace(c);c.artPerDay=rec;reflow();
  const day1=SCHED.days.find(d=>!d.past&&(d.arts||0)>0);
  if(!day1)return {noArts:true};
  const base=day1.arts;
  // read ONE article and re-flow: the day must not refill itself
  markDone(day1.items.filter(x=>x.art)[0].id,day1.iso);reflow();
  const after=SCHED.dayMap[day1.iso].arts;
  // nudge the count and confirm it is honoured
  c.artPerDay=rec+3;reflow();
  const up=SCHED.artPace,upDay=(SCHED.days.find(d=>!d.past&&(d.arts||0)>0)||{}).arts;
  c.artPerDay=1;reflow();
  const one=SCHED.days.filter(d=>!d.past&&!d.rest&&!d.off&&!d.review).map(d=>d.arts||0);
  return {rec,base,after,up,upDay,
    one:one.slice(0,5),
    // a count too low to fit overflows onto the LAST open day rather than dropping
    // work — the same thing the video pour does when the hours don't fit
    oneHead:one.slice(0,-1),oneTail:one[one.length-1],
    oneTotal:SCHED.days.reduce((a,d)=>a+(d.arts||0),0),
    warned:/Behind/.test(brodyPaceBanner(c))};
});
chk('C59-21 reading one article does not refill the day it was on',
    !stamp.noArts&&stamp.after===stamp.base, 'day held '+stamp.base+', after one check-off '+stamp.after);
chk('C59-22 a hand-set article count is the count used',
    !stamp.noArts&&stamp.up===stamp.rec+3&&stamp.upDay<=stamp.rec+3, 'set '+(stamp.rec+3)+' got '+stamp.up);
chk('C59-23 …including one a day, which every day but the last respects',
    !stamp.noArts&&stamp.oneHead.every(n=>n<=1), JSON.stringify(stamp.one)+' …');
/* Set a count too low to finish and the leftovers stack on the final open day
   instead of disappearing — identical to how the video pour handles hours that
   don't fit. Losing work silently would be the bug; an obviously overloaded last
   day plus a "Behind" banner is the intended, visible failure. */
chk('C59-24 …and a count too low to fit overflows visibly rather than losing reading',
    !stamp.noArts&&stamp.oneTotal===108&&stamp.oneTail>1&&stamp.warned===true,
    'total '+stamp.oneTotal+', last day '+stamp.oneTail+', banner warns '+stamp.warned);

// ---------- 6. re-fit, opt-out, and the late joiner ----------
const refit=await p.evaluate(()=>{
  window.__mk({arts:true});
  const c=S.cfg;c.artPerDay=brodyArtPace(c);const stamped=c.artPerDay;
  // read ahead: bank several future days of articles
  const fut=SCHED.days.filter(d=>!d.past&&(d.arts||0)>0).slice(2,7);
  let n=0;fut.forEach(d=>d.items.filter(x=>x.art).forEach(x=>{markDone(x.id,d.iso);n++;}));
  reflow();
  const beforeTail=SCHED.days.filter(d=>(d.artsTodo||0)>0).map(d=>d.iso).pop();
  brodyRefit();
  return {n,stamped,now:c.artPerDay,
    afterTail:SCHED.days.filter(d=>(d.artsTodo||0)>0).map(d=>d.iso).pop(),
    beforeTail,eased:c.artPerDay<=stamped};
});
chk('C59-25 re-fit works on a reading-only plan',
    refit.n>0&&refit.eased, 'banked '+refit.n+' articles; '+refit.stamped+' → '+refit.now+'/day');
const opt=await p.evaluate(()=>{
  window.__mk({arts:true});
  const c=S.cfg;const base=SCHED.stats.totalArts;
  if(!SCHED.planArts.length)return {noArts:true};
  const victim=SCHED.planArts[5].id;
  c.skip=c.skip||{};c.skip[victim]=true;reflow();
  const after=SCHED.stats.totalArts;
  const inPicker=planVideosFor(c).filter(isArticle).length===108;
  delete c.skip[victim];reflow();
  return {base,after,back:SCHED.stats.totalArts,inPicker};
});
chk('C59-26 an individual article can be left out of the plan',
    !opt.noArts&&opt.after===opt.base-1&&opt.back===opt.base, opt.base+' → '+opt.after+' → '+opt.back);
chk('C59-27 …and articles appear in the opt-out picker', !opt.noArts&&opt.inPicker===true, '');
const late=await p.evaluate(()=>{
  const blk=brodyBlockById('neuro-sensory');
  window.__mk({arts:true,today:blk.weeks[2].start,join:3});
  return {wks:[...new Set(SCHED.planArts.map(a=>a.wk))].sort(),total:SCHED.stats.totalArts};
});
chk('C59-28 a late joiner only owes the reading from their join week on',
    late.wks.length===1&&late.wks[0]===3&&late.total===6,
    'weeks '+JSON.stringify(late.wks)+', '+late.total+' articles');

// ---------- 7. other blocks have no articles mapped ----------
const other=await p.evaluate(()=>{
  const out={};
  ['heme-renal','cardiopulm','neuro-sensory'].forEach(id=>{
    const blk=brodyBlockById(id);
    window.__mk({block:id,vids:true,arts:true});
    out[id]={mapped:brodyHasArts(blk),artsOn:!!SCHED.artsOn,
             total:SCHED.stats.totalArts,scheduled:SCHED.days.reduce((a,d)=>a+(d.arts||0),0)};
  });
  return out;
});
chk('C59-28 only Nervous & Sensory has articles mapped',
    other['neuro-sensory'].mapped===true&&other['heme-renal'].mapped===false
      &&other['cardiopulm'].mapped===false, JSON.stringify(other));
chk('C59-29 turning the resource on elsewhere schedules nothing, silently or otherwise',
    other['heme-renal'].artsOn===false&&other['heme-renal'].scheduled===0
      &&other['cardiopulm'].artsOn===false&&other['cardiopulm'].scheduled===0,
    JSON.stringify(other));

// ---------- 8. what the screens say ----------
chk('C59-30 a mixed day names both currencies',
    /h/.test(VA.label)&&/to read/.test(VA.label), VA.label);
chk('C59-31 a reading-only day names only the reading',
    /to read/.test(A.label)&&!/h/.test(A.label), A.label);
chk('C59-32 the reading-only hero speaks in articles, never in hours',
    /article/i.test(A.hero)&&!/h\/day/.test(A.hero), A.hero);
chk('C59-33 the mixed hero still quotes the video pace',
    /h\/day/.test(VA.hero), VA.hero);
const prog=await p.evaluate(()=>{
  window.__mk({arts:true});
  S.settings.progBy='time';                 // a reading-only plan has no minutes
  const o=overall(),lab=progLabel(o);
  if(!SCHED.planArts.length)return {noArts:true};
  markDone(SCHED.planArts[0].id,todayISO());reflow();
  const o2=overall();
  return {byTime:o.byTime,pct:o.pct,lab,pct2:o2.pct,total:o2.total};
});
chk('C59-34 progress-by-time falls back to counting when a plan has no minutes',
    !prog.noArts&&prog.byTime===false&&prog.total===108&&prog.pct2>0,
    'byTime '+prog.byTime+', after one read '+prog.pct2+'%');
chk('C59-35 …and the label says "items" rather than "videos"',
    !prog.noArts&&/items/.test(prog.lab||''), prog.lab);

for (const [lab,opts] of [['mixed',{vids:true,arts:true}],['reading-only',{arts:true}],['no articles mapped',{block:'heme-renal',vids:true,arts:true}]]) {
  const r=await p.evaluate(o=>{
    window.__mk(o);VIEW='adjust';ADJ_VIEW='edit';render();
    return {tog:!!document.querySelector('[data-res="uwlib"]'),
            apace:!!document.querySelector('[data-apace="inc"]'),
            txt:document.body.innerText.replace(/\s+/g,' ')};
  },opts);
  if(lab==='no articles mapped'){
    chk('C59-36 the Plan tab says plainly that this unit has no articles yet',
        !r.tog&&!r.apace&&/No UWorld Library articles are mapped/.test(r.txt), r.txt.slice(0,160));
  } else {
    chk('C59-36 the Plan tab offers the toggle and the article count — '+lab,
        r.tog&&r.apace&&/Articles per day/.test(r.txt), 'toggle '+r.tog+' count '+r.apace);
  }
}
const noHours=await p.evaluate(()=>{
  window.__mk({arts:true});VIEW='adjust';ADJ_VIEW='edit';render();
  const t=document.body.innerText.replace(/\s+/g,' ');
  return {hidesVidPace:!/of video · per day/.test(t),saysNoRuntime:/no runtime|don’t have a runtime/i.test(t),
          recReading:/Recommended reading/.test(t)};
});
chk('C59-37 a reading-only plan hides the video pace and explains why',
    noHours.hidesVidPace&&noHours.recReading&&noHours.saysNoRuntime, JSON.stringify(noHours));

/* The audit and the mapping PDF are how a course director checks this, so articles
   have to be in them — and audited by artWeek, not silently defaulted. */
const audit=await p.evaluate(()=>{
  const a=auditBlock(brodyBlockById('neuro-sensory'));
  const arts=a.weeks.map(w=>w.vids.filter(v=>v.res==='uwlib').length);
  return {arts,unmapped:a.unmapped.filter(v=>v.res==='uwlib').length,
          orphans:a.orphans.filter(k=>k.indexOf('uwlib|')===0).length,
          lastGroup:a.weeks[0].vids[a.weeks[0].vids.length-1].res};
});
chk('C59-38 the content audit shows the articles, week by week',
    JSON.stringify(audit.arts)==='[51,51,6]', JSON.stringify(audit.arts));
chk('C59-39 …none defaulted, none orphaned, and they sort last in a week',
    audit.unmapped===0&&audit.orphans===0&&audit.lastGroup==='uwlib',
    'unmapped '+audit.unmapped+' orphans '+audit.orphans+' last '+audit.lastGroup);

/* A new config field is the classic way to break the sync loop. */
const sync=await p.evaluate(()=>{
  const out=[];
  [{vids:true},{vids:true,arts:true},{arts:true}].forEach((o,i)=>{
    window.__mk(o);
    S.cfg.artPerDay=7;
    const a=JSON.stringify(persistObj());
    const b=JSON.stringify(mergeState(JSON.parse(a),JSON.parse(a)));
    out.push({i,same:a===b,kept:/"artPerDay":7/.test(a),uw:/"uwlib":true/.test(a)});
  });
  return out;
});
sync.forEach(s=>chk('C59-40 mergeState(x,x) is byte-identical — config '+s.i,
    s.same, 'differs after self-merge'));
chk('C59-41 the article count and the toggle both persist',
    sync.every(s=>s.kept)&&sync[1].uw&&sync[2].uw&&!sync[0].uw,
    JSON.stringify(sync));

const m=await mobilePage();
const mob=await m.evaluate(()=>{
  const blk=brodyBlockById('neuro-sensory');
  AUTHED=true;todayISO=()=>blk.weeks[0].start;S.settings={seenBrodyHelp:true,seenUpdate:LATEST_UPDATE};
  PRACTICE_KEYS.forEach(k=>{S[k]={total:null,blocks:{}};});
  S.cfgs.nbme={examType:'nbme',brody:blk.id,examLabel:blk.name,examISO:blk.shelf,
    startISO:blk.weeks[0].start,restDays:[0],
    resources:{bnb:false,pathoma:false,sketchy:false,bootcamp:false,uwlib:true},
    systems:blk.systems.slice(),brodyReviewDays:3,brodyJoinWk:1,brodyJoinDate:blk.weeks[0].start};
  normalizeCfg(S.cfgs.nbme,'nbme');activate('nbme');S.active='nbme';
  reflow();
  const out={};
  ['today','adjust'].forEach(v=>{VIEW=v;if(v==='adjust')ADJ_VIEW='edit';render();
    out[v]={sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth};});
  return out;
});
chk('C59-42 reading-only Today does not overflow sideways on a phone',
    mob.today.sw<=mob.today.cw+1, 'scrollWidth '+mob.today.sw+' vs '+mob.today.cw);
chk('C59-43 reading-only Plan does not overflow sideways on a phone',
    mob.adjust.sw<=mob.adjust.cw+1, 'scrollWidth '+mob.adjust.sw+' vs '+mob.adjust.cw);

chk('C59-44 no page errors anywhere in this run', errors.length===0, errors.join(' | '));

await close();
process.exit(report());
