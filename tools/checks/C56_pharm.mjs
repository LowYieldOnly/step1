/* C56 · Rapid Reference gains a Pharm area.
 *
 * Two things are guarded here. First that the new area works — four groupings of one
 * drug set, a detail sheet, a drill, and a search that returns drugs rather than
 * outline points. Second, and more easily broken, that adding a second KIND of
 * reference to the tab didn't disturb the video outlines already there: they share
 * RR_CUR, the search box and the picker.
 */
import { openApp, checker } from '../harness.mjs';

const { page: p, errors, requests, mobilePage, close } = await openApp();
const { chk, report } = checker('Rapid Reference — Pharm');
await p.evaluate(()=>new Promise(r=>loadRapidRef(r)));
await p.waitForTimeout(200);
requests.length=0;   // fonts and the Firebase SDK load at app boot; this tab is what's under test

await p.evaluate(()=>{window.__open=async(id)=>{
  const blk=brodyBlockById('cardiopulm');
  AUTHED=true;todayISO=()=>'2026-09-06';S.settings={seenBrodyHelp:true};
  // every map persistObj emits has to exist, or it serialises as undefined, drops out
  // of the JSON, and mergeState normalises it back in — which reads as "changed"
  PRACTICE_KEYS.forEach(k=>{S[k]=S[k]||{total:null,blocks:{}};});
  Object.assign(S,{vdone:{},vdoneDate:{},vdoneAt:{},vundone:{},vskip:{},vshaky:{},akdone:{},
    notes:{},streak:{days:{}},assessments:{},_resetAt:0});
  S.cfgs.nbme={examType:'nbme',brody:blk.id,examLabel:blk.name,examISO:blk.shelf,startISO:blk.weeks[0].start,
    restDays:[0],resources:{bnb:true,pathoma:true},systems:blk.systems.slice(),
    brodyReviewDays:3,brodyJoinWk:1,brodyJoinDate:blk.weeks[0].start};
  normalizeCfg(S.cfgs.nbme,'nbme');activate('nbme');S.active='nbme';reflow();
  RR_CUR=id;RR_Q="";PH_MODE='ind';PH_DRUG=null;PH_SHOWN={};VIEW='ref';render();
  await new Promise(r=>setTimeout(r,80));};
  window.__txt=()=>document.body.innerText;});

// ---------- 1. the data shipped, and it validates ----------
const data=await p.evaluate(()=>{
  const ph=rrPharm(), refs=rrRefs();
  const p0=ph[0]||{};
  const keys=Object.keys(p0.drugs||{});
  const seen=new Set(), bad=[];
  const use=l=>(l||[]).forEach(k=>{if(!p0.drugs[k])bad.push(k);else seen.add(k);});
  (p0.indication||[]).forEach(s=>(s.b||[]).forEach(x=>use(x.d)));
  (p0.hazard||[]).forEach(h=>use(h.d));
  (p0.findings||[]).forEach(f=>use([f[2]]));
  (p0.classes||[]).forEach(c=>use(c.dr));
  (p0.pathways||[]).forEach(w=>use(w.d));
  (p0.drill||[]).forEach(d=>use([d[3]]));
  // the hazard lists and the per-drug tags encode the same fact twice
  const mismatch=[];
  (p0.hazard||[]).forEach(h=>{
    const tagged=keys.filter(k=>(p0.drugs[k].t||[]).indexOf(h.k)>=0).sort().join();
    const listed=(h.d||[]).slice().sort().join();
    if(tagged!==listed)mismatch.push(h.k);});
  return {version:RR_DATA.version,refs:refs.length,refTitles:refs.map(r=>r.title),
    pharm:ph.length,title:p0.title,drugs:keys.length,
    tags:(p0.tags||[]).length,modes:{ind:(p0.indication||[]).length,haz:(p0.hazard||[]).length,
      find:(p0.findings||[]).length,cls:(p0.classes||[]).length,path:(p0.pathways||[]).length,
      notes:(p0.notes||[]).length,drill:(p0.drill||[]).length},
    unknownRefs:bad, unreachable:keys.filter(k=>!seen.has(k)), mismatch,
    missingFields:keys.filter(k=>!['n','c','m','u','f'].every(f=>p0.drugs[k][f]))};
});
chk('C56-1 rapidref.json carries a pharm area alongside the video outlines',
    data.version===2&&data.pharm===1&&data.refs===2, JSON.stringify({v:data.version,refs:data.refs,pharm:data.pharm}));
chk('C56-2 the Cardiovascular reference has all 42 drugs and 5 hazard tags',
    data.title==='Cardiovascular'&&data.drugs===42&&data.tags===5, JSON.stringify(data));
chk('C56-3 every view is populated (6 indication sections, 5 hazards, 12 findings, 6 classes, 3 pathways, 16 drill cards)',
    data.modes.ind===6&&data.modes.haz===5&&data.modes.find===12&&data.modes.cls===6
    &&data.modes.path===3&&data.modes.notes===1&&data.modes.drill===16, JSON.stringify(data.modes));
chk('C56-4 every drug reference resolves and every drug is reachable from some view',
    data.unknownRefs.length===0&&data.unreachable.length===0,
    JSON.stringify({unknown:data.unknownRefs,unreachable:data.unreachable}));
chk('C56-5 every drug carries all five fields the sheet renders',
    data.missingFields.length===0, JSON.stringify(data.missingFields));
// The source page tagged propranolol a negative inotrope but left it out of the
// negative-inotrope hazard list. Two hand-kept copies of one fact; this pins them.
chk('C56-6 the hazard lists agree with the per-drug tags (propranolol was missing from the inotrope list)',
    data.mismatch.length===0, 'disagreeing: '+JSON.stringify(data.mismatch));

// ---------- 2. the picker names both areas ----------
const pick=await p.evaluate(async()=>{
  await __open('bnb-hematology');
  const groups=[...document.querySelectorAll('.rrgrp')].map(g=>({
    label:(g.querySelector('.rrgrpl')||{}).textContent,
    items:[...g.querySelectorAll('[data-rrref]')].map(b=>b.dataset.rrref)}));
  return {groups,on:[...document.querySelectorAll('[data-rrref].on')].map(b=>b.dataset.rrref)};
});
chk('C56-7 the picker splits into a Video outlines group and a Pharm group',
    pick.groups.length===2&&pick.groups[0].label==='Video outlines'&&pick.groups[1].label==='Pharm'
    &&pick.groups[1].items.join()==='cardio-pharm', JSON.stringify(pick.groups));
chk('C56-8 exactly one reference is marked open at a time',
    pick.on.length===1&&pick.on[0]==='bnb-hematology', JSON.stringify(pick.on));

// ---------- 3. the video outlines still work ----------
const outline=await p.evaluate(async()=>{
  await __open('bnb-hematology');
  const before={sections:document.querySelectorAll('.rrsec').length,videos:document.querySelectorAll('[data-rrv]').length,
    hasTree:!!document.getElementById('rr_tree'),hasModes:!!document.querySelector('[data-phmode]')};
  const first=document.querySelector('[data-rrv]');first.click();
  await new Promise(r=>setTimeout(r,60));
  const opened=document.querySelectorAll('[data-rrt]').length;
  RR_Q='ferritin';renderRapidRef();await new Promise(r=>setTimeout(r,60));
  const hits=(document.getElementById('rr_hits')||{}).textContent||'';
  RR_Q='';renderRapidRef();
  return {before,opened,hits};
});
chk('C56-9 the Hematology outline still renders its section/video tree, with no pharm controls',
    outline.before.sections>0&&outline.before.videos>0&&outline.before.hasTree&&!outline.before.hasModes,
    JSON.stringify(outline.before));
chk('C56-10 opening a video still expands its topics, and outline search still counts points',
    outline.opened>0&&/point/.test(outline.hits), JSON.stringify({topics:outline.opened,hits:outline.hits}));

// ---------- 4. the four pharm groupings ----------
const modes=await p.evaluate(async()=>{
  await __open('cardio-pharm');
  const out={};
  const snap=()=>({chips:document.querySelectorAll('[data-phd]').length,
    boxes:document.querySelectorAll('.phbox').length,
    tables:document.querySelectorAll('.phtable').length,
    haz:document.querySelectorAll('.phhaz').length,
    cards:document.querySelectorAll('[data-phf]').length,
    legend:!!document.querySelector('.phlegend'),
    on:(document.querySelector('[data-phmode].on')||{}).textContent});
  out.ind=snap();
  for(const m of ['haz','cls','drill']){
    document.querySelector('[data-phmode="'+m+'"]').click();
    await new Promise(r=>setTimeout(r,70));out[m]=snap();}
  document.querySelector('[data-phmode="ind"]').click();await new Promise(r=>setTimeout(r,70));
  return out;
});
chk('C56-11 By indication: drug chips grouped into boxes, plus the nitrate + β-blocker table',
    modes.ind.chips>40&&modes.ind.boxes===7&&modes.ind.tables===1&&modes.ind.on==='By indication',
    JSON.stringify(modes.ind));
chk('C56-12 By hazard: five colour-coded hazard groups and the finding→drug table',
    modes.haz.haz===5&&modes.haz.tables===1&&modes.haz.chips>40, JSON.stringify(modes.haz));
chk('C56-13 By class: the Vaughan-Williams table plus the second-messenger pathways',
    modes.cls.tables===1&&modes.cls.boxes===2&&modes.cls.chips>20, JSON.stringify(modes.cls));
chk('C56-14 Drill: 16 stem-first cards, and the hazard legend is hidden there (no chips to read it against)',
    modes.drill.cards===16&&!modes.drill.legend, JSON.stringify(modes.drill));
chk('C56-15 the legend IS shown on the three grouping views',
    modes.ind.legend&&modes.haz.legend&&modes.cls.legend,
    JSON.stringify([modes.ind.legend,modes.haz.legend,modes.cls.legend]));

// ---------- 5. the drug sheet ----------
const sheet=await p.evaluate(async()=>{
  await __open('cardio-pharm');
  document.querySelector('[data-phd="amio"]').click();await new Promise(r=>setTimeout(r,80));
  const ov=document.querySelector('.overlay');
  const txt=ov?ov.innerText:'';
  const lit=[...document.querySelectorAll('[data-phd].on')].map(b=>b.dataset.phd);
  ov.querySelector('[data-c="close"]').click();await new Promise(r=>setTimeout(r,80));
  const after={overlay:!!document.querySelector('.overlay'),lit:document.querySelectorAll('[data-phd].on').length,cur:PH_DRUG};
  // backdrop click closes it too
  document.querySelector('[data-phd="mag"]').click();await new Promise(r=>setTimeout(r,80));
  const ov2=document.querySelector('.overlay');
  ov2.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  await new Promise(r=>setTimeout(r,80));
  return {txt,lit,after,backdrop:!document.querySelector('.overlay')};
});
chk('C56-16 tapping a drug opens a sheet with its class, mechanism, use and red flag',
    /Amiodarone/.test(sheet.txt)&&/Class III/.test(sheet.txt)&&/MECHANISM/i.test(sheet.txt)
    &&/REACH FOR IT WHEN/i.test(sheet.txt)&&/RED FLAG/i.test(sheet.txt)&&/Pulmonary fibrosis/.test(sheet.txt),
    sheet.txt.replace(/\n/g,' | ').slice(0,150));
chk('C56-17 the sheet names the drug\'s hazard tags',
    /QT \/ torsades risk/.test(sheet.txt)&&/Dangerous combination/.test(sheet.txt), sheet.txt.slice(0,120));
chk('C56-18 the drug you opened is highlighted while its sheet is up',
    sheet.lit.length>0&&sheet.lit.every(k=>k==='amio'), JSON.stringify(sheet.lit));
chk('C56-19 closing clears the sheet and the highlight',
    !sheet.after.overlay&&sheet.after.lit===0&&sheet.after.cur===null, JSON.stringify(sheet.after));
chk('C56-20 tapping the backdrop closes it too', sheet.backdrop, '');

// ---------- 6. the drill ----------
const drill=await p.evaluate(async()=>{
  await __open('cardio-pharm');
  document.querySelector('[data-phmode="drill"]').click();await new Promise(r=>setTimeout(r,70));
  const hidden0=document.querySelectorAll('.phans').length;
  const tap0=document.querySelectorAll('.phtap').length;
  document.querySelector('[data-phf="0"]').click();await new Promise(r=>setTimeout(r,70));
  const one=document.querySelectorAll('.phans').length;
  const firstAns=(document.querySelector('.phans .a')||{}).textContent;
  document.getElementById('ph_all').click();await new Promise(r=>setTimeout(r,70));
  const all=document.querySelectorAll('.phans').length;
  document.getElementById('ph_none').click();await new Promise(r=>setTimeout(r,70));
  const none=document.querySelectorAll('.phans').length;
  // re-hiding after reveal: tapping a revealed card hides it again
  document.querySelector('[data-phf="3"]').click();await new Promise(r=>setTimeout(r,60));
  const on3=document.querySelectorAll('.phans').length;
  document.querySelector('[data-phf="3"]').click();await new Promise(r=>setTimeout(r,60));
  const off3=document.querySelectorAll('.phans').length;
  return {hidden0,tap0,one,firstAns,all,none,on3,off3};
});
chk('C56-21 drill cards start covered, showing the stem only',
    drill.hidden0===0&&drill.tap0===16, JSON.stringify(drill));
chk('C56-22 tapping one reveals just that answer',
    drill.one===1&&drill.firstAns==='Nimodipine', JSON.stringify({n:drill.one,a:drill.firstAns}));
chk('C56-23 reveal-all and hide-all work', drill.all===16&&drill.none===0, JSON.stringify(drill));
chk('C56-24 a revealed card can be covered again', drill.on3===1&&drill.off3===0, JSON.stringify(drill));

// ---------- 7. search returns drugs, not outline points ----------
const search=await p.evaluate(async()=>{
  await __open('cardio-pharm');
  const run=q=>{RR_Q=q;renderRapidRef();
    return {hits:(document.querySelector('.rrhits')||{}).textContent||'',
      chips:[...document.querySelectorAll('[data-phd]')].map(b=>b.dataset.phd),
      body:document.body.innerText,
      modesShown:!!document.querySelector('[data-phmode]')};};
  const byName=run('ranolazine');
  const byMech=run('neprilysin');
  const byFlag=run('cinchonism');
  const none=run('zzzznothing');
  RR_Q='';renderRapidRef();
  return {byName,byMech,byFlag,none,restored:!!document.querySelector('[data-phmode]')};
});
chk('C56-25 searching a drug name finds it',
    search.byName.chips.join()==='ranol'&&/1 drug matching/.test(search.byName.hits), JSON.stringify(search.byName));
chk('C56-26 searching a mechanism finds the drug that uses it',
    search.byMech.chips.join()==='sacu', JSON.stringify(search.byMech.chips));
chk('C56-27 searching a red flag finds the drug that carries it',
    search.byFlag.chips.join()==='quin', JSON.stringify(search.byFlag.chips));
chk('C56-28 no match says so instead of rendering an empty page',
    search.none.chips.length===0&&/No drug here matches that/.test(search.none.body),
    JSON.stringify({chips:search.none.chips.length}));
chk('C56-29 the grouping tabs hide during a search and come back when it clears',
    !search.byName.modesShown&&search.restored, JSON.stringify({during:search.byName.modesShown,after:search.restored}));

// ---------- 8. switching references starts clean ----------
const swap=await p.evaluate(async()=>{
  await __open('cardio-pharm');
  document.querySelector('[data-phmode="drill"]').click();await new Promise(r=>setTimeout(r,70));
  document.getElementById('ph_all').click();await new Promise(r=>setTimeout(r,70));
  RR_Q='amio';renderRapidRef();await new Promise(r=>setTimeout(r,60));
  document.querySelector('[data-rrref="bnb-renal"]').click();await new Promise(r=>setTimeout(r,90));
  const inRenal={q:RR_Q,mode:PH_MODE,drug:PH_DRUG,tree:!!document.getElementById('rr_tree'),
    modes:!!document.querySelector('[data-phmode]')};
  document.querySelector('[data-rrref="cardio-pharm"]').click();await new Promise(r=>setTimeout(r,90));
  const back={mode:PH_MODE,q:RR_Q,drill:Object.keys(PH_SHOWN['cardio-pharm']||{}).length};
  return {inRenal,back};
});
chk('C56-30 switching to a video outline clears the pharm search and mode, and shows the tree',
    swap.inRenal.q===''&&swap.inRenal.mode==='ind'&&swap.inRenal.drug===null
    &&swap.inRenal.tree&&!swap.inRenal.modes, JSON.stringify(swap.inRenal));
chk('C56-31 coming back opens on the default grouping, but the drill cards you revealed are remembered',
    swap.back.mode==='ind'&&swap.back.q===''&&swap.back.drill===16, JSON.stringify(swap.back));

// ---------- 9. rest of the app, sync, network ----------
const rest=await p.evaluate(async()=>{
  await __open('cardio-pharm');
  const fails=[];
  for(const v of ['today','stats','grades','adjust','ref','checklist']){VIEW=v;
    try{render();await new Promise(r=>setTimeout(r,25));}catch(e){fails.push(v+': '+String(e).slice(0,90));}}
  VIEW='ref';render();await new Promise(r=>setTimeout(r,50));
  const a=JSON.stringify(persistObj());
  return {fails,idempotent:a===JSON.stringify(mergeState(JSON.parse(a),JSON.parse(a))),
    blobHasPharm:/cardio-pharm/.test(a)};
});
chk('C56-32 every view still renders with a pharm reference open', rest.fails.length===0, JSON.stringify(rest.fails));
chk('C56-33 the reference is read-only — nothing about it lands in the synced profile',
    !rest.blobHasPharm&&rest.idempotent, JSON.stringify(rest));
chk('C56-34 the tab makes no external network requests',
    requests.length===0, requests.slice(0,3).join(' | '));

// ---------- 10. mobile ----------
const mp=await mobilePage();
await mp.evaluate(()=>new Promise(r=>loadRapidRef(r)));await mp.waitForTimeout(200);
const mob=await mp.evaluate(async()=>{
  const blk=brodyBlockById('cardiopulm');
  AUTHED=true;todayISO=()=>'2026-09-06';S.settings={seenBrodyHelp:true};
  S.cfgs.nbme={examType:'nbme',brody:blk.id,examLabel:blk.name,examISO:blk.shelf,startISO:blk.weeks[0].start,
    restDays:[0],resources:{bnb:true,pathoma:true},systems:blk.systems.slice(),
    brodyReviewDays:3,brodyJoinWk:1,brodyJoinDate:blk.weeks[0].start};
  normalizeCfg(S.cfgs.nbme,'nbme');activate('nbme');S.active='nbme';reflow();
  RR_CUR='cardio-pharm';VIEW='ref';render();await new Promise(r=>setTimeout(r,150));
  const W=document.documentElement.clientWidth;
  const chip=document.querySelector('[data-phd]');
  const cr=chip.getBoundingClientRect();
  const wide=[...document.querySelectorAll('.phbox,.phchips,.phmodes,.rrgrp')]
    .filter(el=>el.getBoundingClientRect().right>W+1).length;
  chip.click();await new Promise(r=>setTimeout(r,120));
  const ov=document.querySelector('.overlay');
  const sheetFits=!!ov&&ov.querySelector('.sheet').getBoundingClientRect().width<=W;
  ov.querySelector('[data-c="close"]').click();await new Promise(r=>setTimeout(r,80));
  // the widest thing here is the Vaughan-Williams table — it must scroll in its own box
  document.querySelector('[data-phmode="cls"]').click();await new Promise(r=>setTimeout(r,120));
  const scroller=document.querySelector('.phtable')?document.querySelector('.phtable').parentElement:null;
  const tableScrolls=!!scroller&&getComputedStyle(scroller).overflowX==='auto';
  return {tapH:Math.round(cr.height*10)/10,tapR:Math.round(cr.right),W,
    tap:cr.height>=26&&cr.right<=W+1,wide,sheetFits,tableScrolls,
    overflow:document.documentElement.scrollWidth>W+1};
});
chk('C56-35 mobile: chips are tappable and inside the viewport, nothing overflows its box',
    mob.tap&&mob.wide===0, JSON.stringify(mob));
chk('C56-36 mobile: the drug sheet fits the screen', mob.sheetFits, JSON.stringify(mob));
chk('C56-37 mobile: the wide class table scrolls inside its own box, not the page',
    mob.tableScrolls&&!mob.overflow, JSON.stringify(mob));
chk('C56-38 no uncaught page errors', errors.length===0, errors.slice(0,3).join(' | '));

process.exit(report()?1:0);
