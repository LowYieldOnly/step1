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
import { openApp, checker } from '../harness.mjs';

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
  S.cfgs.nbme={examType:'nbme',brody:blk.id,examLabel:blk.name,examISO:blk.shelf,
    startISO:blk.weeks[0].start,restDays:[0],
    resources:{bnb:true,pathoma:true,sketchy:true,bootcamp:true,uwlib:false},
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

// ---------- 3. THE decision: ID is included, not absorbed ----------
const id=await p.evaluate(()=>{
  window.__mk({});
  const inPlan=new Set(SCHED.planItems.map(v=>v.id));
  const idVids=catVideos().filter(v=>v.sys==='Infectious Disease');
  const scheduled=idVids.filter(v=>inPlan.has(itemId(v)));
  const want=['Zoonotic Infections','Opportunistic Fungal Infections','Bacterial Culture',
              'Mycobacterium tuberculosis','Histoplasma capsulatum','Pneumocystis jirovecii',
              'Brucella','Scabies, Lice, Crabs','HIV'];
  const unwanted=['Streptococcus pyogenes','Influenza Virus','Plasmodium','Clostridium difficile'];
  return {catalogTotal:idVids.length,scheduled:scheduled.length,
    hours:Math.round(scheduled.reduce((a,v)=>a+v.min,0)/6)/10,
    got:want.filter(n=>scheduled.some(v=>v.name===n)).length,wantN:want.length,
    leaked:unwanted.filter(n=>scheduled.some(v=>v.name===n)),
    allWeek3:scheduled.every(v=>{const it=SCHED.planItems.find(x=>x.id===itemId(v));return it&&it.wk===3;})};
});
chk('C62-12 only a slice of Infectious Disease is scheduled, not the whole system',
    id.scheduled>=15&&id.scheduled<=40&&id.catalogTotal>400,
    id.scheduled+' of '+id.catalogTotal+' ID videos ('+id.hours+' h)');
chk('C62-13 …and it is the slice the five ID lectures actually need',
    id.got===id.wantN, id.got+' of '+id.wantN+' expected ID videos present');
chk('C62-14 …with none of the general microbiology course leaking in',
    id.leaked.length===0, 'leaked: '+JSON.stringify(id.leaked));
chk('C62-15 …all of it in week 3, where those lectures are',
    id.allWeek3===true, 'some included ID videos are not in week 3');
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
    sch.placed===sch.n&&sch.n===488, sch.placed+' of '+sch.n);
chk('C62-19 nothing is scheduled on or after the shelf, or into the review buffer',
    sch.onOrAfterShelf===0&&sch.inBuffer===0,
    'at/after shelf '+sch.onOrAfterShelf+', in buffer '+sch.inBuffer);
chk('C62-20 no video lands on a rest day', sch.sundays===0, sch.sundays+' Sundays carry videos');
/* Each week's deadline is its own quiz; the last week falls through to the Monday
   exam. That last one is the new shape — a shelf outside the final week. */
chk('C62-21 week deadlines resolve to the two quizzes then the Monday exam',
    JSON.stringify(sch.deadlines)==='["2026-10-23","2026-10-30","2026-11-09"]',
    JSON.stringify(sch.deadlines));
chk('C62-22 the unit is feasible at the default pace, unlike Nervous & Sensory',
    sch.feasible===true&&sch.heavy.length===0&&sch.pace<=6,
    'pace '+sch.pace+' h/day, flagged weeks '+JSON.stringify(sch.heavy));
chk('C62-23 …and the Today line says so rather than warning',
    /On pace/.test(sch.hero)&&!/more than fits/.test(sch.hero), sch.hero);

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
chk('C62-25 …cutting over half of what is scheduled, the biggest drop of any unit so far',
    Math.round((1-depth.min.h/depth.full.h)*100)>=50,
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
  S.cfgs.nbme={examType:'nbme',brody:blk.id,examLabel:blk.name,examISO:blk.shelf,
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
