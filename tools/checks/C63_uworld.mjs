/* C63 · UWorld question IDs for Boards & Beyond videos.
 *
 * The data is a reconciliation between two sources that name the same videos
 * differently — a public community document and this catalog — so the failure modes
 * are about names, not logic:
 *
 *   · a key in uworld.json that is not a real catalog video name silently shows no
 *     questions for that video, and nothing anywhere says so;
 *   · a split handled wrongly (B&B divided "Coagulation" into I and II) either loses
 *     a question set or attaches it to one half only;
 *   · and because a split gives BOTH halves the whole set, any copy that spans more
 *     than one video can meet the same id twice. UWorld rejects a list with
 *     duplicates, so de-duplication is a correctness requirement, not tidiness.
 *
 * Also pinned: the feature stores nothing. It was specified as copy-only, and the
 * synced profile has a 1 MiB ceiling that is already worth watching.
 */
import { openApp, checker } from '../harness.mjs';
import fs from 'fs';
import path from 'path';
import { REPO } from '../harness.mjs';

const { page: p, errors, mobilePage, close } = await openApp();
const { chk, report } = checker('UWorld question IDs');

// ---------- 1. the file itself ----------
const raw = fs.readFileSync(path.join(REPO, 'uworld.json'), 'utf8');
const uw = JSON.parse(raw);
const cat = JSON.parse(fs.readFileSync(path.join(REPO, 'catalog.json'), 'utf8'));
const bnbNames = new Set(cat.videos.filter(v => v.res === 'bnb').map(v => v.name));

chk('C63-1 uworld.json is present, versioned, and credits its source',
    uw.version === 1 && uw.source && /Tanenbaum/.test(uw.source.author) && uw.source.title,
    JSON.stringify(uw.source || null).slice(0, 120));
const badKeys = Object.keys(uw.byVideo).filter(n => !bnbNames.has(n));
chk('C63-2 every mapped name is a real catalog B&B video',
    badKeys.length === 0, 'not in the catalog: ' + JSON.stringify(badKeys.slice(0, 5)));
const allIds = Object.values(uw.byVideo).flat();
chk('C63-3 every question id is a positive integer',
    allIds.length > 2000 && allIds.every(i => Number.isInteger(i) && i > 0),
    allIds.length + ' ids');
const selfDup = Object.entries(uw.byVideo).filter(([, ids]) => ids.length !== new Set(ids).size);
chk('C63-4 no single video lists the same id twice',
    selfDup.length === 0, JSON.stringify(selfDup.slice(0, 3).map(([n]) => n)));
chk('C63-5 it covers most of the B&B catalog',
    Object.keys(uw.byVideo).length >= 450 && Object.keys(uw.byVideo).length <= bnbNames.size,
    Object.keys(uw.byVideo).length + ' of ' + bnbNames.size + ' B&B videos');
/* The browse tree is what the tab renders; it must still point at the same data. */
const treeVids = uw.tree.flatMap(s => s.secs.flatMap(sec => sec.vids));
chk('C63-6 the browse tree carries every document entry, mapped or not',
    uw.tree.length >= 15 && treeVids.length >= 400,
    uw.tree.length + ' systems, ' + treeVids.length + ' entries');
chk('C63-7 …and every tree target that exists resolves to a real video',
    treeVids.filter(v => v.to).every(v => v.to.every(t => bnbNames.has(t))),
    'a tree entry points at a name the catalog does not have');
/* Splits are the subtle case: both halves must carry the same set. */
const splitPairs = [['Coagulation I', 'Coagulation II'],
                    ['Microcytic Anemias I', 'Microcytic Anemias II'],
                    ['Cranial Nerves I', 'Cranial Nerves II'],
                    ['Alpha Thalassemias', 'Beta Thalassemias'],
                    ['Adult Brain Tumors', 'Childhood Brain Tumors']];
chk('C63-8 a video B&B has since split gives every part the whole question set',
    splitPairs.every(([a, b]) => uw.byVideo[a] && uw.byVideo[b]
      && uw.byVideo[a].length > 0 && JSON.stringify(uw.byVideo[a]) === JSON.stringify(uw.byVideo[b])),
    splitPairs.map(([a, b]) => a + ':' + (uw.byVideo[a] || []).length + '/' + (uw.byVideo[b] || []).length).join(' '));
/* A rename the catalog made that the document predates. */
chk('C63-9 renamed videos are reached through their current catalog name',
    (uw.byVideo['Infective Endocarditis'] || []).length > 0
      && (uw.byVideo['Sjögren Syndrome'] || []).length > 0
      && (uw.byVideo['ADHD and Autism'] || []).length > 0
      && !uw.byVideo['Endocarditis'],
    'Infective Endocarditis ' + (uw.byVideo['Infective Endocarditis'] || []).length);

// ---------- 2. in the schedule ----------
await p.evaluate(()=>{window.__mk=()=>{
  const blk=brodyBlockById('neuro-sensory');
  AUTHED=true;todayISO=()=>blk.weeks[0].start;S.settings={seenBrodyHelp:true,seenUpdate:LATEST_UPDATE};
  PRACTICE_KEYS.forEach(k=>{S[k]={total:null,blocks:{}};});
  Object.assign(S,{vdone:{},vdoneDate:{},vdoneAt:{},vundone:{},vskip:{},vshaky:{},akdone:{},
    notes:{},streak:{days:{}},assessments:{},_resetAt:0});
  S.cfgs.nbme={examType:'nbme',brody:blk.id,examLabel:blk.name,examISO:blk.shelf,
    startISO:blk.weeks[0].start,restDays:[0],
    resources:{bnb:true,pathoma:true,sketchy:true,bootcamp:true},
    systems:blk.systems.slice(),brodyReviewDays:3,brodyJoinWk:1,brodyJoinDate:blk.weeks[0].start};
  normalizeCfg(S.cfgs.nbme,'nbme');activate('nbme');S.active='nbme';VIEW='today';reflow();
};});

const sched = await p.evaluate(async ()=>{
  await new Promise(r=>loadUWorld(r));
  window.__mk();render();
  const day=SCHED.days.find(d=>!d.past&&d.items.some(i=>i.res==='bnb'));
  const bnbOnDay=day.items.filter(i=>i.res==='bnb');
  const withQ=bnbOnDay.filter(i=>uwIdsFor(i.name));
  const dayIds=uwIdsForItems(day.items);
  const wkItems=[];SCHED.days.forEach(d=>{if(d.brodyWeek===day.brodyWeek)wkItems.push(...d.items);});
  const wkIds=uwIdsForItems(wkItems);
  // the sum of the per-video lists, BEFORE de-duplication
  const naive=bnbOnDay.reduce((a,i)=>a.concat(uwIdsFor(i.name)||[]),[]);
  return {
    bnbOnDay:bnbOnDay.length, withQ:withQ.length,
    rows:document.querySelectorAll('.uwrow').length,
    bar:!!document.querySelector('.uwbar'),
    dayIds:dayIds.length, dayDupes:dayIds.length-new Set(dayIds).size,
    naive:naive.length, naiveDupes:naive.length-new Set(naive).size,
    wkIds:wkIds.length, wkDupes:wkIds.length-new Set(wkIds).size,
    wkCoversDay:dayIds.every(i=>wkIds.includes(i)),
    // a non-B&B row must never get a question disclosure
    nonBnbRows:[...document.querySelectorAll('.vrow')].length,
    tab:[...document.querySelectorAll('.navb')].map(b=>b.dataset.view),
  };
});
chk('C63-10 every B&B video on the day that has questions shows them, collapsed',
    sched.rows === sched.withQ && sched.withQ > 0,
    sched.rows + ' disclosures for ' + sched.withQ + ' videos with questions (of ' + sched.bnbOnDay + ' B&B)');
chk('C63-11 the day carries a copy bar', sched.bar === true, 'no .uwbar rendered');
chk('C63-12 a whole-day copy is de-duplicated',
    sched.dayDupes === 0 && sched.dayIds > 0, sched.dayIds + ' ids, ' + sched.dayDupes + ' dupes');
chk('C63-13 a whole-week copy is de-duplicated, and contains the day',
    sched.wkDupes === 0 && sched.wkCoversDay && sched.wkIds >= sched.dayIds,
    sched.wkIds + ' week ids, ' + sched.wkDupes + ' dupes, covers day ' + sched.wkCoversDay);
chk('C63-14 the Questions tab is in the nav', sched.tab.includes('uworld'), JSON.stringify(sched.tab));

// ---------- 3. the tab ----------
const tab = await p.evaluate(()=>{
  window.__mk();VIEW='uworld';render();
  const txt=document.body.innerText;
  return {h1:(document.querySelector('.pmhd')||{}).textContent,
    systems:document.querySelectorAll('[data-uwsys]').length,
    copyBtns:document.querySelectorAll('.uwcopy').length,
    credit:/Tanenbaum/.test(txt), howto:/Create Test/.test(txt),
    unmapped:document.querySelectorAll('.uwvid.unmapped').length,
    noneLabels:document.querySelectorAll('.uwnone').length};
});
chk('C63-15 the tab renders the whole document, system by system',
    /UWorld questions/.test(tab.h1||'') && tab.systems >= 15 && tab.copyBtns >= 400,
    tab.systems + ' systems, ' + tab.copyBtns + ' copy buttons');
chk('C63-16 …credits the source and says how to use the ids',
    tab.credit && tab.howto, 'credit ' + tab.credit + ', how-to ' + tab.howto);
chk('C63-17 …marks entries this catalog has no video for, rather than hiding them',
    tab.unmapped > 0, tab.unmapped + ' flagged');
chk('C63-18 …and shows the document’s own "none" entries as such',
    tab.noneLabels > 0, tab.noneLabels + ' none-labels');
const search = await p.evaluate(()=>{
  window.__mk();VIEW='uworld';UW_Q='';render();
  const all=document.querySelectorAll('.uwvid').length;
  UW_Q='thalassem';renderUWorld();
  const hit=[...document.querySelectorAll('.uwvn')].map(e=>e.textContent);
  UW_Q='zzzznotathing';renderUWorld();
  const none=document.querySelectorAll('.uwvid').length;
  const msg=/Nothing matches/.test(document.body.innerText);
  UW_Q='';renderUWorld();
  return {all,hit,none,msg};
});
chk('C63-19 search narrows to matching videos',
    search.hit.length>0 && search.hit.length<search.all && search.hit.every(n=>/thalassem/i.test(n)),
    JSON.stringify(search.hit));
chk('C63-20 …and says so when nothing matches',
    search.none===0 && search.msg, 'rows '+search.none+', message '+search.msg);

// ---------- 4. it stores nothing ----------
const state = await p.evaluate(async ()=>{
  await new Promise(r=>loadUWorld(r));
  window.__mk();
  const before=JSON.stringify(persistObj());
  VIEW='uworld';render();
  UW_Q='renal';renderUWorld();
  const btn=document.querySelector('[data-uwids]');if(btn)btn.click();
  UW_Q='';
  VIEW='today';render();
  const after=JSON.stringify(persistObj());
  const merged=JSON.stringify(mergeState(JSON.parse(after),JSON.parse(after)));
  /* NOT a regex for "uworld" — the profile already has uworld question-tracker keys
     and cfg.uworldMinPerDay, so a name search matches pre-existing state and proves
     nothing. Compare the key sets instead. */
  const keys=o=>Object.keys(JSON.parse(o)).sort().join(',');
  const cfgKeys=o=>{const c=JSON.parse(o).cfgs.nbme||{};return Object.keys(c).sort().join(',');};
  return {same:before===after,selfMerge:merged===after,
          sameTop:keys(before)===keys(after),sameCfg:cfgKeys(before)===cfgKeys(after)};
});
chk('C63-21 browsing and copying changes nothing in the synced profile',
    state.same === true, 'persistObj differed after using the feature');
chk('C63-22 …no new key appears in the profile or the plan, and it still self-merges',
    state.selfMerge === true && state.sameTop === true && state.sameCfg === true,
    'self-merge ' + state.selfMerge + ', top keys same ' + state.sameTop + ', cfg keys same ' + state.sameCfg);

// ---------- 5. a plan without B&B ----------
const noBnb = await p.evaluate(()=>{
  const blk=brodyBlockById('neuro-sensory');
  window.__mk();
  S.cfg.resources={bnb:false,pathoma:true,sketchy:true,bootcamp:true};
  reflow();VIEW='today';render();
  return {rows:document.querySelectorAll('.uwrow').length,
          bar:!!document.querySelector('.uwbar'),
          tabStillThere:[...document.querySelectorAll('.navb')].map(b=>b.dataset.view).includes('uworld')};
});
chk('C63-23 a plan with B&B off shows no question rows or copy bar',
    noBnb.rows===0 && noBnb.bar===false, 'rows '+noBnb.rows+', bar '+noBnb.bar);
chk('C63-24 …but the Questions tab is still reachable for browsing',
    noBnb.tabStillThere===true, 'tab missing');

const m = await mobilePage();
const mob = await m.evaluate(async ()=>{
  await new Promise(r=>loadUWorld(r));
  const blk=brodyBlockById('neuro-sensory');
  AUTHED=true;todayISO=()=>blk.weeks[0].start;S.settings={seenBrodyHelp:true,seenUpdate:LATEST_UPDATE};
  PRACTICE_KEYS.forEach(k=>{S[k]={total:null,blocks:{}};});
  S.cfgs.nbme={examType:'nbme',brody:blk.id,examLabel:blk.name,examISO:blk.shelf,
    startISO:blk.weeks[0].start,restDays:[0],
    resources:{bnb:true,pathoma:true,sketchy:true,bootcamp:true},
    systems:blk.systems.slice(),brodyReviewDays:3,brodyJoinWk:1,brodyJoinDate:blk.weeks[0].start};
  normalizeCfg(S.cfgs.nbme,'nbme');activate('nbme');S.active='nbme';reflow();
  const out={};
  ['today','uworld'].forEach(v=>{VIEW=v;render();
    out[v]={sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth};});
  return out;
});
chk('C63-25 the Study view does not overflow sideways on a phone',
    mob.today.sw <= mob.today.cw + 1, mob.today.sw + ' vs ' + mob.today.cw);
chk('C63-26 the Questions tab does not overflow sideways on a phone',
    mob.uworld.sw <= mob.uworld.cw + 1, mob.uworld.sw + ' vs ' + mob.uworld.cw);

chk('C63-27 no page errors anywhere in this run', errors.length === 0, errors.join(' | '));

await close();
process.exit(report());
