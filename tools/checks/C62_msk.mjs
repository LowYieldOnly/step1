/* C62 · The Musculoskeletal & Skin Brody block (SYST 9400, Term 3 weeks 13-15).
 *
 * The fourth block, and the first where the unit touches material it does not teach.
 * Week 3 carries five Infectious Disease lectures, but the ID system in the catalog
 * is 466 videos / 83 h — the entire microbiology course. Making it a system would
 * have doubled the unit. So the five lectures are served by a targeted `include`,
 * and the checks below are weighted towards that decision holding: the right ID
 * videos present, the other 400-odd absent, and no quiet drift either way.
 *
 * It is also the first block whose shelf is a MONDAY (exam 4 sits on the Monday that
 * opens the next unit's week), and the first that is comfortably feasible at the
 * default pace rather than a firehose.
 */
import { openApp, checker, REPO } from '../harness.mjs';
import { resolveIdHomes } from '../generators/lib/idhomes.js';
import fs from 'fs';
import path from 'path';

const { page: p, errors, mobilePage, close } = await openApp();
const { chk, report } = checker('Brody block — Musculoskeletal & Skin');

await p.evaluate(()=>{window.__mk=(opts)=>{
  opts=opts||{};
  const blk=brodyBlockById('msk-skin');
  AUTHED=true;todayISO=()=>(opts.today||blk.weeks[0].start);
  S.settings={seenBrodyHelp:true,seenUpdate:LATEST_UPDATE};
  PRACTICE_KEYS.forEach(k=>{S[k]={total:null,blocks:{}};});
  Object.assign(S,{vdone:{},vdoneDate:{},vdoneAt:{},vundone:{},vskip:{},vshaky:{},akdone:{},
    notes:{},streak:{days:{}},assessments:{},_resetAt:0});
  S.cfgs.nbme={examType:'nbme',catEd:CAT_CURRENT_ED,brody:blk.id,examLabel:blk.name,examISO:blk.shelf,
    startISO:blk.weeks[0].start,restDays:[0],
    resources:opts.res||{bnb:true,pathoma:true,sketchy:true,bootcamp:true,uwlib:false},
    systems:blk.systems.slice(),brodyReviewDays:3,
    brodyJoinWk:opts.join||1,brodyJoinDate:blk.weeks[(opts.join||1)-1].start};
  if(opts.off)S.cfgs.nbme.contentOff=opts.off;
  if(opts.free)S.cfgs.nbme.brodyFree=true;
  normalizeCfg(S.cfgs.nbme,'nbme');activate('nbme');S.active='nbme';VIEW='today';
  delete S.cfg.brodyPace;reflow();
};
window.__hero=()=>paceHero().replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();});

// ---------- 1. registered and dated ----------
const reg=await p.evaluate(()=>{
  const b=brodyBlockById('msk-skin'),ids=BRODY_BLOCKS.map(x=>x.id),shelves=BRODY_BLOCKS.map(x=>x.shelf);
  const dow=iso=>isoToDate(iso).getDay();
  return {found:!!b,name:b&&b.name,systems:b&&b.systems,
    starts:b&&b.weeks.map(w=>w.start),ns:b&&b.weeks.map(w=>w.n),
    allMon:b&&b.weeks.every(w=>dow(w.start)===1),
    shelf:b&&b.shelf,shelfDow:b&&dow(b.shelf),
    cps:b&&b.checkpoints,cpDow:b&&b.checkpoints.map(dow),
    last:ids[ids.length-1],sorted:shelves.every((s,i)=>i===0||shelves[i-1]<s),
    dupes:ids.length!==new Set(ids).size,ids};
});
chk('C62-1 the block is registered, named, and last in shelf order',
    reg.found&&reg.name==='Musculoskeletal & Skin'&&reg.last==='msk-skin'&&reg.sorted&&!reg.dupes,
    JSON.stringify(reg.ids));
chk('C62-2 two systems: Musculoskeletal and Dermatology',
    JSON.stringify(reg.systems)==='["Musculoskeletal","Dermatology"]', JSON.stringify(reg.systems));
chk('C62-3 three weeks, all starting on a Monday, numbered 1-3',
    JSON.stringify(reg.starts)==='["2026-10-19","2026-10-26","2026-11-02"]'
      &&reg.allMon&&JSON.stringify(reg.ns)==='[1,2,3]', JSON.stringify(reg.starts));
/* Every previous block's exam fell inside its own last week. Exam 4 is on the Monday
   that opens the NEXT unit, so the shelf is a Monday and sits a week after the last
   week starts — a shape the scheduler had not seen. */
chk('C62-4 the shelf is Monday 2026-11-09, the week after the last week starts',
    reg.shelf==='2026-11-09'&&reg.shelfDow===1, reg.shelf+' (dow '+reg.shelfDow+')');
chk('C62-5 two Friday checkpoints, from Extended Quiz 7 and 8',
    JSON.stringify(reg.cps)==='["2026-10-23","2026-10-30"]'&&reg.cpDow.every(d=>d===5),
    JSON.stringify(reg.cps));
const lect=await p.evaluate(()=>{
  const b=brodyBlockById('msk-skin');
  return {n:b.weeks.map(w=>w.lectures.length),
    titled:b.weeks.every(w=>w.lectures.every(l=>l.title&&l.disc)),
    discs:[...new Set(b.weeks.flatMap(w=>w.lectures.map(l=>l.disc)))].sort()};
});
chk('C62-6 47 lectures transcribed across the three weeks, each titled and disciplined',
    lect.n.reduce((a,n)=>a+n,0)===47&&lect.titled, JSON.stringify(lect.n));
chk('C62-7 …including the ID-flavoured disciplines week 3 introduces',
    lect.discs.includes('Path · ID')&&lect.discs.includes('Clin App · ID'), JSON.stringify(lect.discs));

// ---------- 2. the content map ----------
const audit=await p.evaluate(()=>{
  const a=auditBlock(brodyBlockById('msk-skin'));
  const byRes={};a.weeks.forEach(w=>w.vids.forEach(v=>{byRes[v.res]=(byRes[v.res]||0)+1;}));
  return {total:a.total,unmapped:a.unmapped.map(v=>v.res+'|'+v.name),
    orphans:a.orphans,bcOrphans:a.bcOrphans,
    perWeek:a.weeks.map(w=>w.vids.length),empty:a.weeks.filter(w=>!w.vids.length).map(w=>w.n),byRes};
});
chk('C62-8 nothing falls through to the last week — every video is explicitly mapped',
    audit.unmapped.length===0, audit.unmapped.slice(0,4).join(' ; '));
chk('C62-9 no mapping points at a video that left the catalog',
    audit.orphans.length===0&&audit.bcOrphans.length===0,
    JSON.stringify([audit.orphans,audit.bcOrphans]).slice(0,200));
chk('C62-10 every week carries content ('+audit.perWeek.join(' / ')+')',
    audit.empty.length===0&&audit.perWeek.every(n=>n>50), JSON.stringify(audit.perWeek));
const other=await p.evaluate(()=>BRODY_BLOCKS.filter(b=>b.id!=='msk-skin').map(b=>{
  const a=auditBlock(b);return {id:b.id,bad:a.unmapped.length+a.orphans.length+a.bcOrphans.length};}));
chk('C62-11 adding a fourth block left the first three audit-clean',
    other.every(o=>o.bad===0), JSON.stringify(other));

// ---------- 3. THE decision: ID is distributed by lecture, as data/id-homes.js declares ----------
/* Brody has no Infectious Disease unit, so the #1 law homes every ID video at the lecture
   that teaches it. This unit holds exactly what the declarations give it — skin infections
   in week 1, the terbinafine drugs in week 2, Brody's ID week in week 3 — and nothing homed
   elsewhere (the respiratory organisms belong to Cardiopulm, the enteric ones to GI). */
const ID_HOMES=resolveIdHomes(JSON.parse(fs.readFileSync(path.join(REPO,'catalog.json'),'utf8')).videos);
const id=await p.evaluate(homes=>{
  window.__mk({});
  const inPlan={};SCHED.planItems.forEach(v=>{inPlan[v.id]=v.wk;});
  const idVids=catVideos().filter(v=>v.sys==='Infectious Disease'&&!isArticle(v));
  const scheduled=idVids.filter(v=>inPlan[itemId(v)]!=null);
  const want=['Zoonotic Infections','Opportunistic Fungal Infections','Bacterial Culture','Staphylococcus aureus',
              'Epidermophyton spp., Trichophyton spp., Microsporum spp. (Dermatophytes)','Mycobacterium tuberculosis',
              'Histoplasma capsulatum','Pneumocystis jirovecii','Brucella spp.','Scabies, Lice, Crabs','HIV'];
  return {catalogTotal:idVids.length,scheduled:scheduled.length,
    hours:Math.round(scheduled.reduce((a,v)=>a+v.min,0)/6)/10,
    got:want.filter(n=>scheduled.some(v=>v.name===n)).length,wantN:want.length,
    missing:Object.keys(homes).filter(k=>!scheduled.some(v=>brodyKey(v)===k)),
    extra:scheduled.filter(v=>homes[brodyKey(v)]==null).map(brodyKey),
    wrongWeek:scheduled.filter(v=>homes[brodyKey(v)]!=null&&homes[brodyKey(v)]!==inPlan[itemId(v)]).map(v=>v.name+' wk'+inPlan[itemId(v)]+'≠'+homes[brodyKey(v)])};
}, ID_HOMES.homes['msk-skin']);
chk('C62-12 the unit holds exactly the Infectious Disease videos data/id-homes.js homes in it',
    ID_HOMES.problems.length===0&&id.missing.length===0&&id.extra.length===0,
    id.scheduled+' of '+id.catalogTotal+' ID videos ('+id.hours+' h); missing '+JSON.stringify(id.missing.slice(0,3))+' extra '+JSON.stringify(id.extra.slice(0,3)));
chk('C62-13 …which covers the organisms its six ID lectures teach',
    id.got===id.wantN, id.got+' of '+id.wantN+' expected ID videos present');
chk('C62-14 …and nothing homed in another unit leaks in (respiratory, enteric, CNS organisms)',
    id.extra.length===0, 'leaked: '+JSON.stringify(id.extra.slice(0,5)));
chk('C62-15 …each at its lecture\'s week: skin infections wk 1, the dermatologic antifungals wk 2, the ID week wk 3',
    id.wrongWeek.length===0, JSON.stringify(id.wrongWeek.slice(0,5)));
const inc=await p.evaluate(()=>{
  window.__mk({});
  const inPlan=new Set(SCHED.planItems.map(v=>v.id));
  const bySys={};
  SCHED.planItems.forEach(v=>{bySys[v.sys]=(bySys[v.sys]||0)+1;});
  const blk=brodyBlockById('msk-skin');
  return {bySys,included:blk.include.length,
    anaes:['Inhaled Anesthetics','Intravenous Anesthetics','Local Anesthetics','Neuromuscular Blockers']
      .every(n=>SCHED.planItems.some(v=>v.name===n)),
    psych:SCHED.planItems.filter(v=>v.sys==='Psychiatry').length,
    psychAll:catVideos().filter(v=>v.sys==='Psychiatry').length};
});
chk('C62-16 anaesthesia is pulled in for the two PHARM lectures',
    inc.anaes===true, JSON.stringify(Object.keys(inc.bySys)));
chk('C62-17 psychiatry is a thin targeted thread, not the whole 105-video system',
    inc.psych>0&&inc.psych<15&&inc.psychAll>100, inc.psych+' of '+inc.psychAll+' psych videos');

// ---------- 4. it schedules, and it is not a firehose ----------
const sch=await p.evaluate(()=>{
  window.__mk({});
  const dayOf={};SCHED.days.forEach(d=>d.items.forEach(i=>dayOf[i.id]=d.iso));
  const b=brodyBlockById('msk-skin');
  return {n:SCHED.stats.totalItems,h:Math.round(SCHED.stats.totalMin/6)/10,
    expect:catVideos().filter(v=>!isArticle(v)&&brodyInBlock(b,v)).length,
    placed:SCHED.planItems.filter(i=>dayOf[i.id]).length,
    pace:SCHED.brodyPace,feasible:SCHED.stats.feasible,
    heavy:SCHED.weekLoad.filter(w=>w.heavy).map(w=>w.n),
    onOrAfterShelf:SCHED.planItems.filter(i=>dayOf[i.id]&&dayOf[i.id]>=b.shelf).length,
    inBuffer:SCHED.planItems.filter(i=>dayOf[i.id]&&dayOf[i.id]>=SCHED.reviewCutoff).length,
    sundays:SCHED.days.filter(d=>isoToDate(d.iso).getDay()===0&&d.items.length).length,
    deadlines:brodyWeekLoads(S.cfg,b).map(w=>w.quiz),
    hero:__hero()};
});
chk('C62-18 all '+sch.n+' videos ('+sch.h+' h) get a day',
    sch.placed===sch.n&&sch.n===sch.expect, sch.placed+' placed of '+sch.n+' planned; the unit has '+sch.expect);
chk('C62-19 nothing is scheduled on or after the shelf, or into the review buffer',
    sch.onOrAfterShelf===0&&sch.inBuffer===0,
    'at/after shelf '+sch.onOrAfterShelf+', in buffer '+sch.inBuffer);
chk('C62-20 no video lands on a rest day', sch.sundays===0, sch.sundays+' Sundays carry videos');
/* Each week's deadline is its own quiz; the last week falls through to the Monday
   exam. That last one is the new shape — a shelf outside the final week. */
chk('C62-21 week deadlines resolve to the two quizzes then the Monday exam',
    JSON.stringify(sch.deadlines)==='["2026-10-23","2026-10-30","2026-11-09"]',
    JSON.stringify(sch.deadlines));
/* With every resource on, the law's Infectious Disease homes make this unit as dense as Neuro:
   the plan must say so plainly. Bootcamp, the bulk of it, leaves the repertoire after this
   unit; without it the unit fits comfortably — so the warning is about the resource load. */
const lite=await p.evaluate(()=>{
  window.__mk({res:{bnb:true,pathoma:true,sketchy:true,bootcamp:false,uwlib:false}});
  return {pace:SCHED.brodyPace,feasible:SCHED.stats.feasible,heavy:SCHED.weekLoad.filter(w=>w.heavy).map(w=>w.n),
    cap:BRODY_QUIZ_MAX,hero:__hero()};
});
chk('C62-22 with every resource on, the unit is more than fits — and the Today line says so rather than hiding it',
    sch.feasible===false&&sch.heavy.length>0&&/more than fits before their quiz/.test(sch.hero),
    'pace '+sch.pace+' h/day, flagged weeks '+JSON.stringify(sch.heavy)+' · '+sch.hero.slice(0,90));
chk('C62-23 without Bootcamp it fits at the default pace, under the cap, and reads "On pace"',
    lite.feasible===true&&lite.heavy.length===0&&lite.pace<lite.cap&&/On pace/.test(lite.hero)&&!/more than fits/.test(lite.hero),
    JSON.stringify(lite));

// ---------- 5. content depth works on it from day one ----------
const depth=await p.evaluate(()=>{
  const ALL={anat:true,hist:true,embryo:true,physio:true};
  window.__mk({});const full={n:SCHED.stats.totalItems,h:SCHED.stats.totalMin,pace:SCHED.brodyPace};
  window.__mk({off:ALL});const min={n:SCHED.stats.totalItems,h:SCHED.stats.totalMin,pace:SCHED.brodyPace,
    ids:SCHED.planItems.map(v=>v.id)};
  window.__mk({});const back=SCHED.planItems.map(v=>v.id);
  // these must survive Minimal — pathology, pharmacology and the included ID slice.
  // Checked against the MINIMAL id set, not whatever plan happens to be loaded.
  const minSet=new Set(min.ids);
  // by FULL KEY, not by name: two different videos are called "NSAIDs" (Sketchy
  // files one under Hematology), and a name lookup silently picked the wrong one.
  const want=['bnb|Musculoskeletal|Pathology|Arthritis',
              'bnb|Musculoskeletal|Pathology|Bone Disorders',
              'bnb|Musculoskeletal|Pathology|Osteoporosis Drugs',
              'bnb|Dermatology|General Topics|Skin Cancer',
              'bootcamp|Dermatology|Malignant Skin Disorders|Melanoma',
              'skmicro|Infectious Disease|Mycobacteria|Mycobacterium tuberculosis',
              'bootcamp|Musculoskeletal|Pharmacology|NSAIDs',
              'bootcamp|Musculoskeletal|Pharmacology|Gout Medications',
              'bootcamp|Musculoskeletal|Pharmacology|Bisphosphonates, Denosumab, & Teriparatide',
              'bootcamp|Musculoskeletal|Pharmacology|TNF-a Inhibitors & Monoclonal Antibodies'];
  const keptNames=want.filter(k=>{const v=catVideos().find(x=>brodyKey(x)===k);return v&&minSet.has(itemId(v));});
  return {full,min,subset:min.ids.every(i=>back.indexOf(i)>=0),keptNames,wantN:want.length};
});
chk('C62-24 Minimal works on this unit from day one — no retrofit needed',
    depth.min.n<depth.full.n&&depth.min.n>0, depth.full.n+' → '+depth.min.n+' items');
/* The generator reports ~60%, measured over the two systems. The scheduled plan also
   carries the 47 included ID/anaesthesia/psych videos, all of which Minimal keeps, so
   the cut across what is actually scheduled is smaller. Two honest numbers with
   different denominators — this asserts the one a student experiences. */
const drops=await p.evaluate(()=>{const off={anat:1,hist:1,embryo:1,physio:1};
  return BRODY_BLOCKS.map(b=>{const v=catVideos().filter(x=>!isArticle(x)&&brodyInBlock(b,x));
    const all=v.reduce((a,x)=>a+x.min,0),cut=v.filter(x=>off[contentTag(x)]).reduce((a,x)=>a+x.min,0);
    return {id:b.id,pct:Math.round(cut/all*100)};});});
chk('C62-25 …cutting close to half of what is scheduled — the biggest drop of any unit ('+JSON.stringify(drops.map(d=>d.id+' '+d.pct+'%'))+')',
    drops.every(d=>d.id==='msk-skin'||d.pct<drops.find(x=>x.id==='msk-skin').pct)&&Math.round((1-depth.min.h/depth.full.h)*100)>=40,
    Math.round(depth.full.h/60)+' h → '+Math.round(depth.min.h/60)+' h ('
      +Math.round((1-depth.min.h/depth.full.h)*100)+'%)');
chk('C62-26 …and dropping the pace from '+depth.full.pace+' to '+depth.min.pace+' h/day',
    depth.min.pace<depth.full.pace, depth.full.pace+' → '+depth.min.pace);
chk('C62-27 Minimal is a strict subset, and keeps every pathology and pharmacology video',
    depth.subset&&depth.keptNames.length===depth.wantN,
    depth.keptNames.length+' of '+depth.wantN+' kept: '+JSON.stringify(depth.keptNames));

// ---------- 6. the block rolls over to this one ----------
const roll=await p.evaluate(()=>{
  const real=todayISO,out={};
  const expect=d=>(BRODY_BLOCKS.find(b=>d<=b.shelf)||BRODY_BLOCKS[BRODY_BLOCKS.length-1]).id;
  ['2026-10-08','2026-10-09','2026-10-20','2026-11-09','2026-11-10','2027-01-01'].forEach(d=>{
    todayISO=()=>d;out[d]={got:brodyCurrentBlockId(),exp:expect(d)};});
  todayISO=real;return out;
});
chk('C62-28 the current block follows the shelf dates, including onto this one',
    Object.values(roll).every(r=>r.got===r.exp), JSON.stringify(roll));
chk('C62-29 …so the day after the Nervous & Sensory exam it is Musculoskeletal & Skin',
    roll['2026-10-09'].got==='msk-skin'&&roll['2026-10-20'].got==='msk-skin',
    JSON.stringify([roll['2026-10-09'],roll['2026-10-20']]));

// ---------- 7. a late joiner, and the phone ----------
const late=await p.evaluate(()=>{
  const b=brodyBlockById('msk-skin');
  window.__mk({today:b.weeks[2].start,join:3});
  return {skipped:SCHED.skippedWeeks,wks:[...new Set(SCHED.planItems.map(v=>v.wk))].sort(),
          earlier:SCHED.days.some(d=>d.earlier)};
});
chk('C62-30 a late joiner starts at their join week, with the earlier weeks optional',
    late.skipped===2&&late.wks.length===1&&late.wks[0]===3&&late.earlier===true,
    'skipped '+late.skipped+' weeks '+JSON.stringify(late.wks));

const m=await mobilePage();
const mob=await m.evaluate(()=>{
  const blk=brodyBlockById('msk-skin');
  AUTHED=true;todayISO=()=>blk.weeks[0].start;S.settings={seenBrodyHelp:true,seenUpdate:LATEST_UPDATE};
  PRACTICE_KEYS.forEach(k=>{S[k]={total:null,blocks:{}};});
  S.cfgs.nbme={examType:'nbme',catEd:CAT_CURRENT_ED,brody:blk.id,examLabel:blk.name,examISO:blk.shelf,
    startISO:blk.weeks[0].start,restDays:[0],
    resources:{bnb:true,pathoma:true,sketchy:true,bootcamp:true},
    systems:blk.systems.slice(),brodyReviewDays:3,brodyJoinWk:1,brodyJoinDate:blk.weeks[0].start};
  normalizeCfg(S.cfgs.nbme,'nbme');activate('nbme');S.active='nbme';reflow();
  const out={};
  ['today','adjust'].forEach(v=>{VIEW=v;if(v==='adjust')ADJ_VIEW='edit';render();
    out[v]={sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth};});
  return out;
});
chk('C62-31 Today does not overflow sideways on a phone', mob.today.sw<=mob.today.cw+1,
    mob.today.sw+' vs '+mob.today.cw);
chk('C62-32 Plan does not overflow sideways on a phone', mob.adjust.sw<=mob.adjust.cw+1,
    mob.adjust.sw+' vs '+mob.adjust.cw);

chk('C62-33 no page errors anywhere in this run', errors.length===0, errors.join(' | '));

await close();
process.exit(report());
