/* C75 · UWorld Videos: UWorld's 514 video lectures as a resource with its own switch.
 *
 *   (a) The catalog has exactly UWorld's list — every title once, verbatim, at its runtime —
 *       filed under the system and chapter the map gives it; mk_uwvid.js has nothing left to
 *       change (so a unit generator that rebuilt a block without them is caught here).
 *   (b) Each video is in the unit and week the map gives it, and every video of a unit's own
 *       systems has a week there. Psychiatry sits in both its lecture's unit and Neuro.
 *   (c) Off unless switched on: no existing plan gains a video, and a plan's schedule is the
 *       same as on a catalog without them. New plans start with it off.
 *   (d) Switched on: a Brody unit schedules exactly its mapped videos, Minimal drops the
 *       tagged foundations, a Step 1 plan gets all 514, and the switch is offered on every
 *       Brody unit, in the plan editor and at setup. The Resource Library lists them.
 */
import { openApp, checker, REPO } from '../harness.mjs';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const { page: p, errors, close } = await openApp();
const { chk, report } = checker('UWorld Videos — UWorld\'s video lectures as a resource');

const DATA = f => fs.readFileSync(path.join(REPO, 'tools/generators/data', f), 'utf8');
const SRC = JSON.parse(DATA('uworld-videos.json'));
const rt = {}; SRC.categories.forEach(c => c.videos.forEach(v => { rt[v.name] = v.runtime; }));
const mins = s => { const [m, x] = s.split(':').map(Number); return Math.max(1, Math.round(m + x / 60)); };
const MAP = []; let sec = null;
DATA('uworld-videos-map.txt').split('\n').forEach(ln => {
  if (!ln.trim() || ln.startsWith('# ')) return;
  if (ln.startsWith('## ')) { sec = ln.slice(3).split(' › '); return; }
  const [name, home] = ln.split('|').map(s => s.trim());
  MAP.push({ sys: sec[0], cat: sec[1], name, homes: home.split('+') });
});
const CODE = { HR: 'heme-renal', CP: 'cardiopulm', NS: 'neuro-sensory', MSK: 'msk-skin' };
const homesIn = id => MAP.flatMap(r => r.homes.map(h => [r, h])).filter(([, h]) => { const m = h.match(/^([A-Z]+)(\d)$/); return m && CODE[m[1]] === id; })
  .map(([r, h]) => ({ name: r.name, sys: r.sys, cat: r.cat, week: +h.slice(-1) }));

// ---------- (a) the catalog is UWorld's list ----------
const cat = JSON.parse(fs.readFileSync(path.join(REPO, 'catalog.json'), 'utf8'));
const rows = cat.videos.filter(v => v.res === 'uwvid');
const wrong = MAP.map((m, i) => { const v = rows[i]; return !v ? 'missing ' + m.name
  : (v.name !== m.name || v.sys !== m.sys || v.cat !== m.cat || v.min !== mins(rt[m.name])) ? i + ': ' + [v.sys, v.cat, v.name, v.min].join(' · ') + ' ≠ ' + [m.sys, m.cat, m.name, mins(rt[m.name])].join(' · ') : null; }).filter(Boolean);
chk('C75-1 the catalog has UWorld\'s ' + Object.keys(rt).length + ' videos, each once, in the map\'s order, system, chapter and runtime',
  rows.length === 514 && Object.keys(rt).length === 514 && new Set(rows.map(v => v.name)).size === 514 && MAP.length === 514 && wrong.length === 0,
  rows.length + ' rows; ' + wrong.slice(0, 3).join(' | '));
const before = fs.readFileSync(path.join(REPO, 'catalog.json'), 'utf8') + fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
const gen = spawnSync(process.execPath, [path.join(REPO, 'tools/generators/mk_uwvid.js')], { encoding: 'utf8' });
const after = fs.readFileSync(path.join(REPO, 'catalog.json'), 'utf8') + fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
chk('C75-2 mk_uwvid.js has nothing left to change', gen.status === 0 && /nothing to change/.test(gen.stdout) && after === before,
  (gen.stdout + gen.stderr).trim().split('\n').slice(0, 3).join(' | '));

// ---------- (b) every video at its mapped unit and week ----------
const placed = await p.evaluate(({ want }) => Object.entries(want).map(([id, list]) => {
  const blk = brodyBlockById(id);
  const vids = catVideos().filter(v => v.res === 'uwvid');
  const bad = list.filter(w => { const v = vids.find(x => x.name === w.name); return !v || !brodyInBlock(blk, v) || blk.videoWeek[brodyKey(v)] !== w.week; }).map(w => w.name);
  const ownNoWeek = vids.filter(v => blk.systems.includes(v.sys) && blk.videoWeek[brodyKey(v)] == null).map(v => v.name);
  const extra = vids.filter(v => brodyInBlock(blk, v) && !list.some(w => w.name === v.name)).map(v => v.name);
  return { id, n: list.length, bad, ownNoWeek, extra };
}), { want: Object.fromEntries(Object.values(CODE).map(id => [id, homesIn(id)])) });
placed.forEach((u, i) => chk('C75-3.' + (i + 1) + ' ' + u.id + ': its ' + u.n + ' UWorld videos at their mapped weeks, nothing else, every own-system video with a week',
  u.bad.length === 0 && u.ownNoWeek.length === 0 && u.extra.length === 0, JSON.stringify({ bad: u.bad.slice(0, 3), noWeek: u.ownNoWeek.slice(0, 3), extra: u.extra.slice(0, 3) })));
const dual = MAP.filter(m => m.homes.length > 1);
chk('C75-4 the ' + dual.length + ' psychiatry videos taught in another unit\'s psych lecture are in that unit and in Neuro',
  dual.length === 23 && dual.every(m => m.sys === 'Psychiatry' && m.homes.some(h => h.startsWith('NS'))), dual.map(m => m.name + ' ' + m.homes.join('+')).slice(0, 3).join(' | '));

// ---------- (c) off unless switched on ----------
await p.evaluate(async () => {
  await new Promise(r => loadUWorld(r));
  window.__plan = (kind, res, extra) => {
    AUTHED = true; todayISO = () => '2026-10-24';
    S.settings = { seenBrodyHelp: true, seenUpdate: LATEST_UPDATE };
    PRACTICE_KEYS.forEach(k => { S[k] = { total: null, blocks: {} }; });
    Object.assign(S, { vdone: {}, vdoneDate: {}, vdoneAt: {}, vundone: {}, vskip: {}, vshaky: {}, akdone: {}, notes: {}, streak: { days: {} }, assessments: {}, uwq: {}, uwt: {}, pomo: {}, _resetAt: 0 });
    const unit = (extra && extra.unit) || 'msk-skin', b = brodyBlockById(unit);
    if (kind === 'brody' || kind === 'free') todayISO = () => b.weeks[0].start;   // a unit's plan, seen from its first day
    const brody = { examType: 'nbme', brody: unit, examLabel: b.name, examISO: b.shelf, startISO: b.weeks[0].start, restDays: [0], resources: Object.assign({}, res),
      systems: b.systems.slice(), brodyReviewDays: 3, brodyJoinWk: 1, brodyJoinDate: b.weeks[0].start, catEd: CAT_CURRENT_ED };
    const c = {
      brody, free: Object.assign({}, brody, { brodyFree: true }),
      seq: { examType: 'nbme', brody: SEQ_ID, examLabel: 'your exam', startISO: '2026-10-20', examISO: '2027-03-01', restDays: [0], brodyReviewDays: 3, catEd: CAT_CURRENT_ED,
        resources: Object.assign({}, res), seqUnit: 'msk-skin', seqTopics: seqDefaultTopics('msk-skin').concat(['s:Infectious Disease', 's:Immunology']) },
      step1: { examType: 'step1', examLabel: 'Step 1', examISO: '2027-06-01', startISO: '2026-10-25', restDays: [0], reviewDays: 14, wkdayHrs: 6, wkendHrs: 4, catEd: CAT_CURRENT_ED,
        resources: Object.assign({ fa: true, anking: true, uworld: true }, res), systems: SYS.slice() },
      shelf: { examType: 'nbme', examLabel: 'ID shelf', examISO: '2027-01-15', startISO: '2026-10-25', restDays: [0], reviewDays: 7, wkdayHrs: 3, wkendHrs: 2, catEd: CAT_CURRENT_ED,
        resources: Object.assign({}, res), systems: ['Infectious Disease', 'Immunology'] },
    }[kind];
    Object.assign(c, (extra && extra.cfg) || {});
    S.cfgs = { step1: null, nbme: null }; const key = c.examType; S.cfgs[key] = c; normalizeCfg(c, key); activate(key); S.active = key; VIEW = 'today'; reflow();
  };
  window.__items = () => SCHED.days.flatMap(d => d.items);
  window.__sig = () => JSON.stringify(SCHED.days.map(d => d.iso + '=' + d.items.map(i => i.id + ':' + i.min).join(',')));
});
const ALL = { bnb: true, pathoma: true, skpharm: true, skmicro: true, skimmuno: true, bootcamp: true };
const off = await p.evaluate(ALL => ['brody', 'free', 'seq', 'step1', 'shelf'].map(k => {
  __plan(k, ALL); const sig = __sig(), uw = __items().filter(i => i.res === 'uwvid').length;
  const keep = CATALOG; CATALOG = Object.assign({}, keep, { videos: keep.videos.filter(v => v.res !== 'uwvid') });
  try { __plan(k, ALL); return { k, uw, same: __sig() === sig }; } finally { CATALOG = keep; }
}), ALL);
off.forEach((r, i) => chk('C75-5.' + (i + 1) + ' a ' + r.k + ' plan with every other resource on schedules no UWorld video, exactly as without them in the catalog',
  r.uw === 0 && r.same, JSON.stringify(r)));
const fresh = await p.evaluate(() => { const o = {}; ['nbme', 'step1'].forEach(k => { o[k] = !!(defaultsForHub(k, true).resources || {}).uwvid; }); return o; });
chk('C75-6 a new plan starts with UWorld Videos off', !fresh.nbme && !fresh.step1, JSON.stringify(fresh));

// ---------- (d) switched on ----------
const on = await p.evaluate(({ want }) => {
  const out = {};
  Object.entries(want).forEach(([id, names]) => {
    __plan('brody', { bnb: true, uwvid: true }, { unit: id });
    const got = __items().filter(i => i.res === 'uwvid').map(i => i.name).sort();
    out[id] = { n: got.length, same: JSON.stringify(got) === JSON.stringify(names.slice().sort()) };
  });
  // the pace counts them: each week's load grows by exactly the UWorld minutes mapped to it
  const loads = res => { __plan('brody', res, { unit: 'msk-skin' }); return brodyWeekLoads(S.cfg, brodyBlockById('msk-skin')).map(w => w.loadMin); };
  const offL = loads({ bnb: true }), onL = loads({ bnb: true, uwvid: true });
  const blk = brodyBlockById('msk-skin'), byWk = {};
  catVideos().filter(v => v.res === 'uwvid' && brodyInBlock(blk, v)).forEach(v => { const w = brodyVideoWeek(blk, v); byWk[w] = (byWk[w] || 0) + v.min; });
  out.loads = { off: offL, on: onL, want: blk.weeks.map(w => byWk[w.n] || 0) };
  __plan('brody', { uwvid: true }, { unit: 'cardiopulm', cfg: { contentOff: { anat: true, hist: true, embryo: true, physio: true } } });
  out.minimal = __items().filter(i => i.res === 'uwvid').map(i => i.name);
  __plan('step1', { uwvid: true }); out.step1 = __items().filter(i => i.res === 'uwvid').length;
  // the switch: every Brody unit's plan editor, a non-Brody editor, and setup
  out.toggle = {};
  BRODY_BLOCKS.forEach(b => { __plan('brody', { bnb: true }, { unit: b.id }); VIEW = 'adjust'; ADJ_VIEW = 'edit'; render(); out.toggle[b.id] = !!document.querySelector('[data-res="uwvid"]'); });
  __plan('shelf', { bnb: true }); VIEW = 'adjust'; ADJ_VIEW = 'edit'; render(); out.toggle.shelf = !!document.querySelector('[data-res="uwvid"]');
  ADJ_VIEW = null;
  S.cfgs = { step1: null, nbme: null }; S.cfg = null; S.active = null; startOnboard('nbme', true);
  const b = brodyBlockById('msk-skin'); _ob.brody = b.id; _ob.systems = b.systems.slice(); _ob.resources = { bnb: true };
  _ob.step = obSteps(_ob).indexOf('resources'); renderOnboard(); out.toggle.setup = !!document.querySelector('[data-ores="uwvid"]');
  _ob = null;
  __plan('brody', { bnb: true }); VIEW = 'checklist'; render();
  out.library = [...document.querySelectorAll('#app summary')].map(e => e.textContent.replace(/\s+/g, ' ').trim()).find(t => /^UWorld Videos/.test(t)) || '';
  out.label = resLabel('uwvid');
  return out;
}, { want: Object.fromEntries(Object.values(CODE).map(id => [id, homesIn(id).map(w => w.name)])) });
Object.values(CODE).forEach((id, i) => chk('C75-7.' + (i + 1) + ' switched on, ' + id + ' schedules exactly its ' + homesIn(id).length + ' UWorld videos',
  on[id].same && on[id].n === homesIn(id).length, JSON.stringify(on[id])));
chk('C75-7b switched on, each week\'s load (what the pace is set from) grows by exactly its UWorld minutes',
  on.loads.on.length === on.loads.want.length && on.loads.on.every((m, i) => m - on.loads.off[i] === on.loads.want[i]) && on.loads.want.reduce((a, b) => a + b, 0) > 0,
  JSON.stringify(on.loads));
const cpTagged = ['Cardiomyocyte structure & function', 'Normal fetal circulation', 'Respiratory mechanics', 'Gas exchange', 'Oxygen-hemoglobin dissociation curve'];
chk('C75-8 Minimal drops the five Cardiopulm foundation videos and keeps the other ' + (homesIn('cardiopulm').length - 5),
  on.minimal.length === homesIn('cardiopulm').length - 5 && cpTagged.every(n => !on.minimal.includes(n)), on.minimal.length + ' kept');
chk('C75-9 a Step 1 plan with UWorld Videos on schedules all 514', on.step1 === 514, String(on.step1));
chk('C75-10 the switch is offered on every Brody unit, in the plan editor and at setup', Object.values(on.toggle).every(Boolean), JSON.stringify(on.toggle));
chk('C75-11 the Resource Library lists UWorld Videos, all 514', /^UWorld Videos.*514/.test(on.library) && on.label === 'UWorld Videos', on.library + ' · ' + on.label);

chk('C75-12 no uncaught page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
await close();
process.exit(report() ? 1 : 0);
