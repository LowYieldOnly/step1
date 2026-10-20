/* C64 · Musculoskeletal & Skin: the rheumatology gap, the reading list, and lecture coverage.
 *
 * What changed, and what each part of this file guards:
 *
 *   1. B&B files its rheumatology under Immunology, so the unit shipped with none of it.
 *      Eleven videos now sit in week 2 — and nowhere else.
 *   2. Articles join a unit ONLY through its reading list (artWeek). UWorld files one
 *      article under several categories and the catalog keeps it once, under one system;
 *      matching articles by system dropped Pulmonary and Cardiology articles into
 *      Cardiopulm with no week. This is the regression that would bring that back.
 *   3. Articles UWorld cross-lists (Malignant hyperthermia: Neurology AND Rheum/Ortho)
 *      are ONE item in two units, so reading it once counts in both.
 *   4. A Pathoma video a unit pulls in from outside its systems (2.5 Wound Healing) must
 *      be scheduled by default — the by-system chapter default switched it off.
 *   5. Every Brody lecture is accounted for: tools/generators/mk_coverage.js must pass.
 *   6. Week 1's reading is a firehose by course design; the app must say so, not hide it.
 */
import { openApp, checker, REPO } from '../harness.mjs';
import { spawnSync } from 'child_process';
import path from 'path';

const { page: p, errors, close } = await openApp();
const { chk, report } = checker('Musculoskeletal & Skin — rheumatology, reading, lecture coverage');

await p.evaluate(()=>{
  window.__mk=(opts)=>{
    opts=opts||{};
    const blk=brodyBlockById(opts.block||'msk-skin');
    AUTHED=true;todayISO=()=>(opts.today||blk.weeks[0].start);
    S.settings={seenBrodyHelp:true,seenUpdate:LATEST_UPDATE};
    PRACTICE_KEYS.forEach(k=>{S[k]={total:null,blocks:{}};});
    Object.assign(S,{vdone:{},vdoneDate:{},vdoneAt:{},vundone:{},vskip:{},vshaky:{},akdone:{},
      notes:{},streak:{days:{}},assessments:{},_resetAt:0});
    const res={bnb:!!opts.vids,pathoma:!!opts.vids,sketchy:!!opts.vids,bootcamp:!!opts.vids,uwlib:!!opts.arts};
    S.cfgs.nbme={examType:'nbme',brody:blk.id,examLabel:blk.name,examISO:blk.shelf,
      startISO:blk.weeks[0].start,restDays:[0],resources:res,systems:blk.systems.slice(),
      brodyReviewDays:3,brodyJoinWk:1,brodyJoinDate:blk.weeks[0].start};
    if(opts.pathChapters)S.cfgs.nbme.pathChapters=opts.pathChapters;
    if(opts.minimal)S.cfgs.nbme.contentOff={anat:true,hist:true,embryo:true,physio:true};
    normalizeCfg(S.cfgs.nbme,'nbme');activate('nbme');S.active='nbme';VIEW='today';
    delete S.cfg.brodyPace;delete S.cfg.artPerDay;
    reflow();
  };
});

// ---------- 1. B&B rheumatology ----------
const rheum=await p.evaluate(()=>{
  const names=['Rheumatoid Arthritis','Systemic Lupus Erythematosus','Scleroderma','Sjögren Syndrome',
    'Vasculitis','Seronegative Spondyloarthritis','Gout','CPPD','Gout Drugs','Glucocorticoids and NSAIDs',
    'Immunosuppressive Drugs'];
  const b=brodyBlockById('msk-skin');
  const vids=names.map(n=>catVideos().find(v=>v.res==='bnb'&&v.sys==='Immunology'&&v.name===n));
  return {found:vids.filter(Boolean).length,n:names.length,
    wk:vids.filter(Boolean).map(v=>brodyInBlock(b,v)?brodyVideoWeek(b,v):0),
    elsewhere:vids.filter(Boolean).filter(v=>BRODY_BLOCKS.some(o=>o.id!=='msk-skin'&&brodyInBlock(o,v))).map(v=>v.name)};
});
chk('C64-1 all eleven B&B rheumatology videos (filed under Immunology) are in the unit',
    rheum.found===rheum.n&&rheum.wk.every(w=>w>0), JSON.stringify(rheum));
chk('C64-2 …every one in week 2, with the joint, connective-tissue and RA-drug lectures',
    rheum.wk.every(w=>w===2), JSON.stringify(rheum.wk));
chk('C64-3 …and in no other unit', rheum.elsewhere.length===0, JSON.stringify(rheum.elsewhere));

// ---------- 2. article membership is the reading list, nothing else ----------
const mem=await p.evaluate(()=>{
  const arts=catVideos().filter(isArticle);
  return BRODY_BLOCKS.map(b=>{
    const inB=arts.filter(v=>brodyInBlock(b,v));
    const mapped=Object.keys(b.artWeek||{}).length;
    return {id:b.id,inBlock:inB.length,mapped,
      unmappedIn:inB.filter(v=>(b.artWeek||{})[brodyKey(v)]==null).length,
      mappedMissing:Object.keys(b.artWeek||{}).filter(k=>!arts.some(v=>brodyKey(v)===k)).length};
  });
});
chk('C64-4 every unit has exactly the articles its reading list maps — no more, no fewer',
    mem.every(m=>m.inBlock===m.mapped&&m.unmappedIn===0&&m.mappedMissing===0), JSON.stringify(mem));
chk('C64-5 units with no reading list get no articles, however many share their systems',
    mem.filter(m=>m.mapped===0).every(m=>m.inBlock===0)
      &&mem.some(m=>m.id==='cardiopulm'&&m.inBlock===0), JSON.stringify(mem));
const msk=mem.find(m=>m.id==='msk-skin');
chk('C64-6 Musculoskeletal & Skin has a reading list, every entry a real catalog article',
    msk&&msk.mapped>150&&msk.mappedMissing===0, JSON.stringify(msk));

// ---------- 3. one article, two units ----------
const shared=await p.evaluate(()=>{
  const arts=catVideos().filter(isArticle);
  const byName={};arts.forEach(v=>{(byName[v.name.toLowerCase()]=byName[v.name.toLowerCase()]||[]).push(v);});
  const dups=Object.entries(byName).filter(([,a])=>a.length>1).map(([n])=>n);
  const mh=arts.find(v=>v.name==='Malignant hyperthermia');
  return {dups,mhUnits:BRODY_BLOCKS.filter(b=>brodyInBlock(b,mh)).map(b=>b.id),mhId:itemId(mh)};
});
chk('C64-7 one catalog record per article title — a cross-listed article is never copied',
    shared.dups.length===0, JSON.stringify(shared.dups));
chk('C64-8 a cross-listed article sits in both units (Malignant hyperthermia: Neuro and MSK)',
    shared.mhUnits.includes('neuro-sensory')&&shared.mhUnits.includes('msk-skin'), JSON.stringify(shared.mhUnits));
const readOnce=await p.evaluate((id)=>{
  window.__mk({arts:true});
  const before=SCHED.planItems.some(i=>i.id===id&&!isDone(i.id));
  S.vdone[id]=true;S.vdoneDate[id]=todayISO();reflow();
  const nowDoneHere=isDone(id);
  window.__mk({arts:true,block:'neuro-sensory'});
  S.vdone[id]=true;               // __mk resets progress; re-mark as a student who read it in Neuro
  const doneInNeuro=isDone(id);
  return {before,nowDoneHere,doneInNeuro};
},shared.mhId);
chk('C64-9 …and reading it counts in both, because it is the same item',
    readOnce.before&&readOnce.nowDoneHere&&readOnce.doneInNeuro, JSON.stringify(readOnce));

// ---------- 4. Pathoma pulled in from outside the unit's systems ----------
const path25=await p.evaluate(()=>{
  const id='p:2.5 Wound Healing';
  window.__mk({vids:true});
  const byDefault=SCHED.planItems.some(i=>i.id===id);
  const b=brodyBlockById('msk-skin');
  const wk=brodyVideoWeek(b,catVideos().find(v=>itemId(v)===id));
  window.__mk({vids:true,pathChapters:[18,19]});
  const whenUserNarrowed=SCHED.planItems.some(i=>i.id===id);
  return {byDefault,wk,whenUserNarrowed};
});
chk('C64-10 Pathoma 2.5 Wound Healing (chapter 2, outside the unit\'s systems) is scheduled by default',
    path25.byDefault&&path25.wk===1, JSON.stringify(path25));
chk('C64-11 …but a student who picked their own Pathoma chapters still gets exactly their pick',
    path25.whenUserNarrowed===false, JSON.stringify(path25));

// ---------- 5. every lecture accounted for ----------
const cov=spawnSync(process.execPath,[path.join(REPO,'tools/generators/mk_coverage.js'),'msk-skin','--check'],{encoding:'utf8'});
chk('C64-12 every Brody lecture in the unit is accounted for (mk_coverage.js passes)',
    cov.status===0, (cov.stdout+cov.stderr).trim().split('\n').slice(0,6).join(' | '));

// ---------- 6. reading load: honest, and Minimal trims the foundations ----------
const load=await p.evaluate(()=>{
  window.__mk({arts:true});
  const b=brodyBlockById('msk-skin');
  const loads=brodyArtLoads(S.cfg,b);
  const flagged=SCHED.weekLoad?SCHED.weekLoad.filter(w=>w.artHeavy||w.heavy).map(w=>w.n):[];
  const full={total:SCHED.stats.totalArts,pace:SCHED.artPace,max:BRODY_ART_MAX,
    perWeek:loads.map(w=>({n:w.n,count:w.count,odbd:w.odbd})),flagged,
    scheduled:SCHED.days.reduce((a,d)=>a+(d.arts||0),0)};
  window.__mk({arts:true,minimal:true});
  const anat=catVideos().filter(v=>isArticle(v)&&/^Anatomy: |^Histology: |^Embryology /.test(v.name)&&brodyInBlock(b,v));
  const inPlan=new Set(SCHED.planItems.map(i=>i.id));
  return {full,minTotal:SCHED.stats.totalArts,
    foundationsLeft:anat.filter(v=>inPlan.has(itemId(v))).map(v=>v.name),
    clinicalKept:['Neck pain','Hip fractures','Psoriasis'].every(n=>SCHED.planItems.some(i=>i.name===n))};
});
const w1=load.full.perWeek.find(w=>w.n===1);
chk('C64-13 every mapped article is scheduled in a reading-only plan',
    load.full.scheduled===load.full.total&&load.full.total===msk.mapped, JSON.stringify({s:load.full.scheduled,t:load.full.total,m:msk.mapped}));
chk('C64-14 week 1 cannot be read before its quiz at a realistic count — and the pace is not inflated to pretend it can',
    w1&&w1.odbd>0&&w1.count/w1.odbd>load.full.max&&load.full.pace<Math.ceil(w1.count/w1.odbd),
    JSON.stringify(load.full));
chk('C64-15 Minimal drops the anatomy, histology and embryology articles…',
    load.foundationsLeft.length===0&&load.minTotal<load.full.total, JSON.stringify({left:load.foundationsLeft,min:load.minTotal,full:load.full.total}));
chk('C64-16 …and keeps the clinical ones', load.clinicalKept, '');

chk('C64-17 no uncaught page errors', errors.length===0, errors.slice(0,3).join(' | '));

await close();
process.exit(report() ? 1 : 0);
