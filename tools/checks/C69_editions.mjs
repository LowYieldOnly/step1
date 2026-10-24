/* C69 · Catalog editions — a plan keeps the video list it was made with.
 *
 * Correcting Sketchy Micro and adding Sketchy Immuno must not move a single item in a plan
 * that already exists. So for every kind of plan (a Brody unit on Brody's weeks, the same
 * at free pace, your own order with whole systems added, a Step 1 plan over every system, a
 * shelf plan), the schedule built on the NEW catalog for a plan with no edition stamp is
 * compared, day by day and item by item, with the schedule the OLD catalog
 * (tools/generators/data/catalog-2026.1.json, the catalog as it was live) builds for it.
 * They must be identical.
 *
 * Then: the 2026.1 view is that frozen catalog exactly (plus the new resource, behind its
 * own toggle); a new plan is stamped with the current edition and sees the corrected list;
 * an edited plan keeps its stamp; Sketchy Immuno is off for an existing plan and joins it
 * only when switched on; the switch is offered only where the plan has Immunology; tick
 * migration never touches an id a plan on an older edition schedules; and a new MSK plan
 * holds the same Sketchy videos under their corrected titles.
 */
import { openApp, checker, REPO } from '../harness.mjs';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const { page: p, errors, close } = await openApp();
const { chk, report } = checker('Catalog editions — existing plans keep their list');

const CAT = path.join(REPO, 'catalog.json');
const cat = JSON.parse(fs.readFileSync(CAT, 'utf8'));
const OLD = JSON.parse(fs.readFileSync(path.join(REPO, 'tools/generators/data/catalog-2026.1.json'), 'utf8'));

await p.evaluate(async () => {
  window.__new = CATALOG;
  window.__old = await (await fetch('tools/generators/data/catalog-2026.1.json')).json();
  window.__plan = (kind, ed, extra) => {
    AUTHED = true; todayISO = () => '2026-10-23';
    S.settings = { seenBrodyHelp: true, seenUpdate: LATEST_UPDATE };
    PRACTICE_KEYS.forEach(k => { S[k] = { total: null, blocks: {} }; });
    Object.assign(S, { vdone: {}, vdoneDate: {}, vdoneAt: {}, vundone: {}, vskip: {}, vshaky: {}, akdone: {},
      notes: {}, streak: { days: {} }, assessments: {}, _resetAt: 0 });
    const msk = brodyBlockById('msk-skin'), all = { bnb: true, pathoma: true, sketchy: true, bootcamp: true };
    const brody = { examType: 'nbme', brody: 'msk-skin', examLabel: msk.name, examISO: msk.shelf, startISO: msk.weeks[0].start,
      restDays: [0], resources: Object.assign({}, all), systems: msk.systems.slice(), brodyReviewDays: 3, brodyJoinWk: 1, brodyJoinDate: msk.weeks[0].start };
    const c = {
      msk: brody,
      mskfree: Object.assign({}, brody, { brodyFree: true }),
      seq: { examType: 'nbme', brody: SEQ_ID, examLabel: 'your exam', startISO: '2026-10-20', examISO: '2027-03-01', restDays: [0], brodyReviewDays: 3,
        resources: Object.assign({}, all), seqUnit: 'msk-skin', seqTopics: seqDefaultTopics('msk-skin').concat(['s:Infectious Disease', 's:Immunology']) },
      step1: { examType: 'step1', examLabel: 'Step 1', examISO: '2027-06-01', startISO: '2026-10-23', restDays: [0], reviewDays: 14, wkdayHrs: 6, wkendHrs: 4,
        resources: Object.assign({ fa: true, anking: true, uworld: true }, all), systems: SYS.slice() },
      shelf: { examType: 'nbme', examLabel: 'ID shelf', examISO: '2027-01-15', startISO: '2026-10-23', restDays: [0], reviewDays: 7, wkdayHrs: 3, wkendHrs: 2,
        resources: { bnb: true, pathoma: false, sketchy: true, bootcamp: false }, systems: ['Infectious Disease', 'Immunology'] },
    }[kind];
    if (ed) c.catEd = ed;
    Object.assign(c.resources, (extra || {}).resources || {});
    S.cfgs = { step1: null, nbme: null }; const key = c.examType;
    S.cfgs[key] = c; normalizeCfg(c, key); activate(key); S.active = key; VIEW = 'today';
    reflow();
  };
  window.__sig = () => JSON.stringify({ pace: SCHED.brodyPace || null, total: SCHED.stats && SCHED.stats.totalMin,
    days: Object.keys(SCHED.dayMap).sort().map(iso => iso + '=' + SCHED.dayMap[iso].items.map(it => (it.id || itemId(it)) + ':' + it.min).join(',')) });
  window.__with = (C, fn) => { CATALOG = C; try { return fn(); } finally { CATALOG = window.__new; } };
});

// ---------- 1. every kind of existing plan builds the same schedule as on the old catalog ----------
const kinds = ['msk', 'mskfree', 'seq', 'step1', 'shelf'];
const same = await p.evaluate(kinds => kinds.map(k => {
  const before = __with(__old, () => { __plan(k); return __sig(); });
  const after = __with(__new, () => { __plan(k); return __sig(); });
  const a = JSON.parse(before), b = JSON.parse(after);
  const firstDiff = a.days.findIndex((d, i) => d !== b.days[i]);
  return { k, same: before === after, days: a.days.length, items: a.days.reduce((n, d) => n + d.split(',').length, 0), total: a.total,
    diff: firstDiff < 0 ? (a.total !== b.total ? 'total ' + a.total + ' vs ' + b.total : '') : (a.days[firstDiff] || '').slice(0, 160) + ' ≠ ' + (b.days[firstDiff] || '').slice(0, 160) };
}), kinds);
same.forEach((r, i) => chk('C69-1.' + (i + 1) + ' an existing ' + r.k + ' plan schedules exactly what it did on the old catalog (' + r.days + ' days, ' + Math.round(r.total / 60) + ' h)',
  r.same, r.diff));

// ---------- 2. the old edition, as a view of the new catalog ----------
const v = await p.evaluate(() => {
  const view = catView('2026.1');
  return { view: JSON.stringify(view), cur: CAT_CURRENT_ED, first: CAT_FIRST_ED };
});
// then every row of a resource 2026.1 didn't have at all (Sketchy Immuno, UWorld Videos): each has its own switch, off
const oldRes = new Set(OLD.videos.map(x => x.res));
const want = JSON.stringify(OLD.videos.concat(cat.videos.filter(x => !oldRes.has(x.res))));
chk('C69-2 the 2026.1 view is the old catalog exactly, then every resource it didn\'t have (' + [...new Set(cat.videos.filter(x => !oldRes.has(x.res)).map(x => x.res))].join(', ') + ')',
  v.view === want, v.view.length + ' vs ' + want.length + ' chars');
chk('C69-3 the app\'s current edition is catalog.json\'s, and plans with no stamp are on 2026.1',
  v.cur === cat.version && v.first === '2026.1' && !!(cat.editions && cat.editions['2026.1']), JSON.stringify({ app: v.cur, catalog: cat.version }));
const before = fs.readFileSync(CAT, 'utf8');
const gen = spawnSync(process.execPath, [path.join(REPO, 'tools/generators/mk_editions.js')], { encoding: 'utf8' });
chk('C69-4 mk_editions.js has nothing left to change', gen.status === 0 && /nothing to change/.test(gen.stdout) && fs.readFileSync(CAT, 'utf8') === before,
  (gen.stdout + gen.stderr).trim().split('\n').slice(0, 3).join(' | '));

// ---------- 3. new plans get the corrected list; edits keep theirs ----------
const stamp = await p.evaluate(() => {
  __plan('shelf');
  const pinnedView = catVideos() === catView('2026.1');
  // edit the existing plan through setup: it keeps its edition
  startOnboard('nbme', false); _ob.wkdayHrs = 4; commitOnboard();
  const edited = S.cfg.catEd === undefined && catVideos() === catView('2026.1');
  // a brand-new plan: the current edition
  startOnboard('nbme', true); _ob.examISO = '2027-02-01'; _ob.systems = ['Infectious Disease']; _ob.resources = { bnb: true, sketchy: true };
  commitOnboard();
  const fresh = S.cfg.catEd === CAT_CURRENT_ED && catVideos() === CATALOG.videos;
  const ids = new Set(SCHED.planItems.map(x => x.id));
  return { pinnedView, edited, fresh,
    corrected: ids.has('skmicro:Infectious Disease:Bordetella pertussis') && !ids.has('skmicro:Infectious Disease:Bordatella pertussis')
      && ids.has('skmicro:Infectious Disease:Bacteroides fragilis') && !ids.has('skmicro:Infectious Disease:Pseudomonas') };
});
chk('C69-5 a plan with no stamp sees the 2026.1 list', stamp.pinnedView, JSON.stringify(stamp));
chk('C69-6 editing a plan keeps the list it was made with', stamp.edited, JSON.stringify(stamp));
chk('C69-7 a new plan is stamped with the current edition and gets the corrected Sketchy Micro', stamp.fresh && stamp.corrected, JSON.stringify(stamp));

// ---------- 4. Sketchy Immuno: off unless switched on, offered only where it has videos ----------
const imm = await p.evaluate(() => {
  __plan('shelf');
  const off = SCHED.planItems.filter(x => x.res === 'skimmuno').length;
  S.cfg.resources.skimmuno = true; reflow();
  const on = SCHED.planItems.filter(x => x.res === 'skimmuno').length;
  const btn = () => { VIEW = 'adjust'; ADJ_VIEW = 'edit'; render(); const b = !!document.querySelector('[data-res="skimmuno"]'); ADJ_VIEW = null; VIEW = 'today'; render(); return b; };
  const shelfBtn = btn();
  __plan('msk'); const mskBtn = btn();
  __plan('seq'); const seqBtn = btn();
  return { off, on, shelfBtn, mskBtn, seqBtn };
});
chk('C69-8 an existing plan does not gain Sketchy Immuno; switched on, all 23 videos join it', imm.off === 0 && imm.on === 23, JSON.stringify(imm));
chk('C69-9 the Sketchy Immuno switch is offered where the plan has Immunology, not on a unit without it',
  imm.shelfBtn && imm.seqBtn && !imm.mskBtn, JSON.stringify(imm));

// ---------- 5. tick migration never moves a plan on the old list ----------
const mig = await p.evaluate(() => {
  __plan('step1');                                   // every system: Pseudomonas copy, Pathoma 17.7, Brucella all in it
  S.vdone['skmicro:Infectious Disease:Pseudomonas'] = true;          // the copy, ticked
  S.vdone['p:17.7 Dementia and Degenerative Disorders'] = true;      // a title renamed long ago
  S.vdone['skmicro:Infectious Disease:Brucella'] = true;
  reflow(); const before = __sig();
  migrateAliases(); reflow();
  return { same: before === __sig(),
    orig: !!S.vdone['skmicro:Infectious Disease:Pseudomonas aeruginosa'], path: !!S.vdone['p:17.7 Dementia & Degenerative Disorders'],
    renamed: !!S.vdone['skmicro:Infectious Disease:Brucella spp.'] };
});
chk('C69-10 with a plan on the old list, migration changes nothing it schedules (the copy\'s tick and an old rename stay put)',
  mig.same && !mig.orig && !mig.path, JSON.stringify(mig));
chk('C69-11 …while a retitled video\'s tick is still carried to its new title, ready for when the plan moves over', mig.renamed, JSON.stringify(mig));

// ---------- 6. a new MSK plan holds the same Sketchy videos, retitled ----------
const msk = await p.evaluate(() => {
  const names = () => SCHED.planItems.filter(x => x.res === 'skmicro').map(x => x.name + '@' + x.wk).sort();
  __plan('msk'); const old = names();
  __plan('msk', CAT_CURRENT_ED); const cur = names();
  return { old, cur };
});
const strip = a => a.map(s => s.replace(/@\d+$/, ''));
chk('C69-12 a new MSK plan schedules the same ' + msk.old.length + ' Sketchy Micro videos, at the same weeks, under their corrected titles',
  msk.old.length > 0 && msk.cur.length === msk.old.length && msk.old.some(s => s.startsWith('Brucella@'))
    && msk.cur.includes('Brucella spp.@' + (msk.old.find(s => s.startsWith('Brucella@')) || '@').split('@')[1])
    && !msk.cur.some(s => s.startsWith('Brucella@')) && JSON.stringify(msk.old.map(s => s.split('@')[1]).sort()) === JSON.stringify(msk.cur.map(s => s.split('@')[1]).sort()),
  JSON.stringify({ old: strip(msk.old).slice(0, 4), cur: strip(msk.cur).slice(0, 4) }));

chk('C69-13 no uncaught page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
await close();
process.exit(report() ? 1 : 0);
