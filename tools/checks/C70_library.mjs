/* C70 · The Resource Library / Question IDs, and plan counts in the student's own resources.
 *
 *   - The Checklist and the Questions tab are one tab; Rapid Reference and the Grades
 *     placeholder are gone, code and data both, on every hub that had them.
 *   - Every level of the library — resource, system, category — is a drop-down, closed until
 *     opened, and a closed group's rows aren't rendered until it opens.
 *   - Ticking a video moves the counters at every level that shows one.
 *   - Search opens what matches; clearing it gives back the groups the student had open.
 *   - In a plan in your own order, the editor's counts are the videos the plan will actually
 *     schedule — the student's resources only — for each topic and for each system it offers.
 */
import { openApp, checker, REPO } from '../harness.mjs';
import fs from 'fs';
import path from 'path';

const { page: p, errors, requests, close } = await openApp();
const { chk, report } = checker('Resource Library / Question IDs, and counts in your own resources');

await p.evaluate(async () => {
  await new Promise(r => loadUWorld(r));
  window.__base = () => {
    AUTHED = true; todayISO = () => '2026-10-23';
    S.settings = { seenBrodyHelp: true, seenUpdate: LATEST_UPDATE };
    PRACTICE_KEYS.forEach(k => { S[k] = { total: null, blocks: {} }; });
    Object.assign(S, { vdone: {}, vdoneDate: {}, vdoneAt: {}, vundone: {}, vskip: {}, vshaky: {}, akdone: {}, notes: {}, streak: { days: {} }, assessments: {}, _resetAt: 0 });
  };
  window.__msk = () => { __base(); const b = brodyBlockById('msk-skin');
    S.cfgs = { step1: null, nbme: { examType: 'nbme', brody: b.id, examLabel: b.name, examISO: b.shelf, startISO: b.weeks[0].start, restDays: [0],
      resources: { bnb: true, pathoma: true, sketchy: true, bootcamp: true }, systems: b.systems.slice(), brodyReviewDays: 3, brodyJoinWk: 1, brodyJoinDate: b.weeks[0].start } };
    normalizeCfg(S.cfgs.nbme, 'nbme'); activate('nbme'); S.active = 'nbme'; reflow(); };
  window.__step1 = () => { __base();
    S.cfgs = { step1: { examType: 'step1', examLabel: 'Step 1', examISO: '2027-06-01', startISO: '2026-10-23', restDays: [0], reviewDays: 14, wkdayHrs: 6, wkendHrs: 4,
      resources: { bnb: true, pathoma: true, sketchy: true, bootcamp: true }, systems: SYS.slice() }, nbme: null };
    normalizeCfg(S.cfgs.step1, 'step1'); activate('step1'); S.active = 'step1'; reflow(); };
  window.__seq = res => { __base();
    S.cfgs = { step1: null, nbme: { examType: 'nbme', brody: SEQ_ID, examLabel: 'your exam', startISO: '2026-10-20', examISO: '2027-03-01', restDays: [0], brodyReviewDays: 3,
      resources: Object.assign({ bnb: false, pathoma: false, sketchy: false, bootcamp: false }, res), seqUnit: 'msk-skin',
      seqTopics: seqDefaultTopics('msk-skin').concat(['s:Infectious Disease']) } };
    normalizeCfg(S.cfgs.nbme, 'nbme'); activate('nbme'); S.active = 'nbme'; reflow(); };
});

// ---------- the tabs ----------
const tabs = await p.evaluate(() => {
  const nav = () => [...document.querySelectorAll('.navb')].map(b => b.dataset.view + '=' + b.textContent);
  __msk(); VIEW = 'today'; render(); const m2 = nav();
  __step1(); VIEW = 'today'; render(); const s1 = nav();
  return { m2, s1, gone: ['renderRapidRef', 'loadRapidRef', 'renderGrades', 'renderUWorld'].filter(f => typeof window[f] === 'function') };
});
const views = t => t.map(x => x.split('=')[0]);
chk('C70-1 M2: Study, Stats, Plan and the Resource Library / Question IDs — no Grades, Rapid Reference, Questions or Checklist tab',
  JSON.stringify(views(tabs.m2)) === JSON.stringify(['today', 'stats', 'adjust', 'checklist']) && tabs.m2[3] === 'checklist=Resource Library / Question IDs', JSON.stringify(tabs.m2));
chk('C70-2 Step 1: the library replaces Questions and Rapid Reference', JSON.stringify(views(tabs.s1)) === JSON.stringify(['today', 'stats', 'checklist', 'adjust']), JSON.stringify(tabs.s1));
chk('C70-3 Rapid Reference, the grade placeholder and the Questions tab are gone from the code, and rapidref.json from the site',
  tabs.gone.length === 0 && !fs.existsSync(path.join(REPO, 'rapidref.json')) && !requests.some(u => /rapidref/.test(u)), JSON.stringify(tabs.gone));

// ---------- every level a drop-down, closed, rows rendered on opening ----------
const lib = await p.evaluate(() => {
  __msk(); for (const k in CLFOLD) delete CLFOLD[k]; CL_Q = ''; VIEW = 'checklist'; render();
  const res = [...document.querySelectorAll('details.clr')].filter(d => d.dataset.clfold !== 'cl_uwextra');
  const r0 = { n: res.length, allClosed: res.every(d => !d.open), rows: document.querySelectorAll('.clrow').length };
  // open Boards & Beyond, then its first system, then that system's first category — as a student would
  const openFold = sel => { const d = document.querySelector(sel); d.open = true; d.dispatchEvent(new Event('toggle')); };
  openFold('details[data-clfold="cl_bnb"]');
  const sys = [...document.querySelectorAll('details[data-clfold="cl_bnb"] details.cls')];
  const r1 = { sys: sys.length, sysClosed: sys.every(d => !d.open), rows: document.querySelectorAll('.clrow').length };
  openFold('details[data-clfold="cl_bnb"] details.cls');
  const sysOpen = document.querySelector('details[data-clfold="cl_bnb"] details.cls[open]');
  const cats = [...sysOpen.querySelectorAll('details.clc')];
  const loose = sysOpen.querySelectorAll(':scope > .clcats > .cllist').length;
  const r2 = { cats: cats.length, catsClosed: cats.every(d => !d.open), loose, rows: document.querySelectorAll('.clrow').length };
  const catSel = 'details[data-clfold="' + cats[0].dataset.clfold.replace(/"/g, '\\"') + '"]';
  openFold(catSel);
  const catEl = document.querySelector(catSel);
  const r3 = { rows: catEl.querySelectorAll('.clrow').length, q: catEl.querySelectorAll('details.uwrow').length };
  // tick the first video: the resource, system and category counters all move
  const fr = k => (document.querySelector('[data-clfrac="' + k + '"]') || {}).textContent;
  const row = catEl.querySelector('.clrow'), id = row.dataset.clid, v = CLVIDS.find(x => x.id === id);
  const keys = ['bnb', 'bnb|' + v.sys, 'bnb|' + v.sys + '|' + v.cat];
  const before = keys.map(fr); row.click(); const after = keys.map(fr);
  const ticked = isDone(id); row.click();
  // search opens its matches; clearing gives the student's own open groups back
  CL_Q = v.cat; render(); const searchOpen = [...document.querySelectorAll('[data-clfold]')].every(d => d.open);
  CL_Q = ''; render();
  const kept = !!document.querySelector('details[data-clfold="cl_bnb"][open]') && !document.querySelector('details[data-clfold="cl_pathoma"][open]');
  return { r0, r1, r2, r3, before, after, ticked, searchOpen, kept };
});
chk('C70-4 the library opens on its resources, all closed, with no video rows rendered yet', lib.r0.n >= 4 && lib.r0.allClosed && lib.r0.rows === 0, JSON.stringify(lib.r0));
chk('C70-5 a resource opens onto its systems — each a drop-down, closed', lib.r1.sys >= 10 && lib.r1.sysClosed && lib.r1.rows === 0, JSON.stringify(lib.r1));
chk('C70-6 a system opens onto its categories — every category a drop-down, closed', lib.r2.cats >= 1 && lib.r2.catsClosed && lib.r2.loose === 0 && lib.r2.rows === 0, JSON.stringify(lib.r2));
chk('C70-7 a category opens onto its videos, each B&B video with its question set as a drop-down', lib.r3.rows > 0 && lib.r3.q > 0, JSON.stringify(lib.r3));
chk('C70-8 ticking a video moves the resource, system and category counters', lib.ticked && lib.before.every((b, i) => b !== lib.after[i]), JSON.stringify({ before: lib.before, after: lib.after }));
chk('C70-9 search opens every group it matches; clearing it restores the groups the student had open', lib.searchOpen && lib.kept, JSON.stringify(lib));

// ---------- own order: counts in the student's resources ----------
const seq = await p.evaluate(() => {
  const editor = () => { const host = document.createElement('div'); host.innerHTML = seqEditorHTML(S.cfg);
    return [...host.querySelectorAll('.seqct')].map(e => { const m = /(\d+) videos?/.exec(e.textContent); return m ? +m[1] : 0; }); };
  const planned = () => { const c = {}; SCHED.planItems.forEach(v => { if (!isArticle(v)) c[v.wk] = (c[v.wk] || 0) + 1; }); return S.cfg.seqTopics.map((t, i) => c[i + 1] || 0); };
  const add = sys => (seqAddable(S.cfg).find(a => a.sys === sys) || { n: 0 }).n;
  __seq({ bnb: true });
  const bnb = { shown: editor(), planned: planned(), addPulm: add('Pulmonary'),
    bnbPulm: catVideos().filter(v => v.res === 'bnb' && v.sys === 'Pulmonary' && !isArticle(v)).length };
  __seq({ bnb: true, pathoma: true, sketchy: true, bootcamp: true });
  const all = { shown: editor(), planned: planned(), addPulm: add('Pulmonary') };
  const idAll = catVideos().filter(v => v.sys === 'Infectious Disease' && !isArticle(v)).length;
  return { bnb, all, idAll };
});
chk('C70-10 with only B&B on, every topic\'s count is what the plan schedules for it — Infectious Disease included',
  JSON.stringify(seq.bnb.shown) === JSON.stringify(seq.bnb.planned) && seq.bnb.shown[seq.bnb.shown.length - 1] < seq.idAll,
  JSON.stringify({ shown: seq.bnb.shown, planned: seq.bnb.planned, wholeCatalogID: seq.idAll }));
chk('C70-11 …and with every resource on, still exactly what it schedules', JSON.stringify(seq.all.shown) === JSON.stringify(seq.all.planned), JSON.stringify(seq.all));
chk('C70-12 a system offered to add counts only the student\'s resources', seq.bnb.addPulm === seq.bnb.bnbPulm && seq.all.addPulm > seq.bnb.addPulm,
  JSON.stringify({ bnbOnly: seq.bnb.addPulm, bnbPulmonary: seq.bnb.bnbPulm, everyResource: seq.all.addPulm }));

chk('C70-13 no uncaught page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
await close();
process.exit(report() ? 1 : 0);
