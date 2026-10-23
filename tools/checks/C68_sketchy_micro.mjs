/* C68 · Sketchy Micro matches Sketchy's own course page, and a retitled video keeps its ticks.
 *
 *   (a) Sketchy Micro (data/sketchy-micro.json, four courses) and Sketchy Immuno
 *       (data/sketchy-immuno.json) are in the catalog exactly as Sketchy publishes them —
 *       title, section, runtime, order — and mk_skmicro.js has nothing left to change.
 *   (b) Every alias in catalog.json is sound (lib/aliases.js), and the generators build ids
 *       the same way the page does — an alias to an id the page never makes would carry
 *       nothing.
 *   (c) migrateAliases() carries a student's state from an old title to the current one:
 *       ticks, dates, skips and plan opt-outs for a retitled video; ticks but not skips for
 *       a removed copy; nothing over a current title that already has state; no streak
 *       credit; once only; and the result is still a fixed point of mergeState.
 *       (A plan on an older catalog edition is never touched: C69.)
 */
import { openApp, checker, REPO } from '../harness.mjs';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { itemId, aliasProblems } from '../generators/lib/aliases.js';

const { page: p, errors, close } = await openApp();
const { chk, report } = checker('Sketchy Micro — Sketchy\'s titles, and ticks that follow a rename');

const CAT = path.join(REPO, 'catalog.json');
const cat = JSON.parse(fs.readFileSync(CAT, 'utf8'));
const DATA = f => JSON.parse(fs.readFileSync(path.join(REPO, 'tools/generators/data', f), 'utf8'));
const MICRO = DATA('sketchy-micro.json').courses.flatMap(c => c.videos);
const IMMUNO = DATA('sketchy-immuno.json').videos;
const ID = 'skmicro:Infectious Disease:';

// ---------- (a) the catalog is Sketchy's list ----------
const asList = (res, list) => {
  const got = cat.videos.filter(v => v.res === res).map(v => [v.cat, v.name, v.min].join(' · '));
  const want = list.map(r => [r.section, r.name, r.min].join(' · '));
  return { n: want.length, ok: got.length === want.length && want.every((w, i) => w === got[i]),
    diff: got.length + ' rows; ' + want.map((w, i) => w === got[i] ? null : i + ': ' + got[i] + ' ≠ ' + w).filter(Boolean).slice(0, 3).join(' | ') };
};
const mi = asList('skmicro', MICRO), im = asList('skimmuno', IMMUNO);
chk('C68-1 Sketchy Micro is Sketchy\'s ' + mi.n + ' videos across four courses — titles, sections, runtimes, order', mi.ok, mi.diff);
chk('C68-1b Sketchy Immuno is Sketchy\'s ' + im.n + ' Immunology videos, filed under Immunology',
    im.ok && cat.videos.filter(v => v.res === 'skimmuno').every(v => v.sys === 'Immunology'), im.diff);
const old = ['Bordatella pertussis', 'Haemophilis influenzae', 'Pasturella multocida', 'Pseudomonas', 'Clostridium difficile',
             'Crytococcus neoformans', 'Hentavirus, California Encephalitis, Rift Valley Fever Viruses (Bunyaviridae)', 'Enterococus faecium & faecalis'];
chk('C68-2 no old or misspelled title is left in the catalog',
    !cat.videos.some(v => v.res === 'skmicro' && old.includes(v.name)), old.filter(n => cat.videos.some(v => v.res === 'skmicro' && v.name === n)).join(', '));
const before = fs.readFileSync(CAT, 'utf8');
const gen = spawnSync(process.execPath, [path.join(REPO, 'tools/generators/mk_skmicro.js')], { encoding: 'utf8' });
chk('C68-3 mk_skmicro.js has nothing left to change',
    gen.status === 0 && (gen.stdout.match(/nothing to change/g) || []).length === 2 && fs.readFileSync(CAT, 'utf8') === before,
    (gen.stdout + gen.stderr).trim().split('\n').slice(0, 3).join(' | '));

// ---------- (b) aliases ----------
const problems = aliasProblems(cat);
chk('C68-4 every alias points at a catalog video, from a title the catalog no longer has, with no chains',
    problems.length === 0 && Object.keys(cat.aliases || {}).length >= 54, problems.slice(0, 3).join(' | '));
const pageIds = await p.evaluate(() => catVideos().map(itemId));
const nodeIds = cat.videos.map(itemId);
chk('C68-5 the generators\' itemId is the page\'s, for all ' + nodeIds.length + ' catalog videos',
    JSON.stringify(pageIds) === JSON.stringify(nodeIds), nodeIds.filter((x, i) => x !== pageIds[i]).slice(0, 2).join(' | '));

// ---------- (c) migration ----------
const m = await p.evaluate(ID => {
  const OLD = ID + 'Bordatella pertussis', NEW = ID + 'Bordetella pertussis';
  const SKIP_OLD = ID + 'Haemophilis influenzae', SKIP_NEW = ID + 'Haemophilus influenzae';
  const DUP = ID + 'Pseudomonas', ORIG = ID + 'Pseudomonas aeruginosa';
  const DUP_SKIP = ID + 'Antihistamines', ORIG_SKIP = 'skpharm:Pulmonary:Antihistamines';
  const BUSY_OLD = ID + 'Brucella', BUSY_NEW = ID + 'Brucella spp.';
  const PLAN_OLD = ID + 'Pasturella multocida', PLAN_NEW = ID + 'Pasteurella multocida';
  const { cfg, ...blank } = emptyState();
  Object.assign(S, blank);
  S.cfgs = { step1: null, nbme: { catEd: CAT_CURRENT_ED, skip: { [PLAN_OLD]: true } } };   // a plan on the current list
  S.vdone[OLD] = true; S.vdoneDate[OLD] = '2026-10-01'; S.vdoneAt[OLD] = 1000; S.vshaky[OLD] = true;
  S.vskip[SKIP_OLD] = true;
  S.vdone[DUP] = true; S.vdoneDate[DUP] = '2026-10-02';
  S.vskip[DUP_SKIP] = true;
  S.vdone[BUSY_OLD] = true; S.vundone[BUSY_NEW] = 5000;            // unticked under the new title since
  const pre = JSON.parse(JSON.stringify(persistObj()));
  _prevSig = progressSig();
  const n1 = migrateAliases();
  const sigOk = _prevSig === progressSig();
  const n2 = migrateAliases();
  const cur = persistObj();
  const self = mergeState(cur, cur);
  const withOld = mergeState(cur, pre);                              // a device still on the previous build
  return {
    n1, n2, sigOk,
    renamed: isDone(NEW) && S.vdoneDate[NEW] === '2026-10-01' && S.vdoneAt[NEW] === 1000 && !!S.vshaky[NEW],
    oldKept: !!S.vdone[OLD],
    skip: !!S.vskip[SKIP_NEW],
    dupTick: isDone(ORIG) && S.vdoneDate[ORIG] === '2026-10-02',
    dupNoSkip: !S.vskip[ORIG_SKIP],
    busy: !isDone(BUSY_NEW),
    plan: !!S.cfgs.nbme.skip[PLAN_NEW],
    fixed: JSON.stringify(self) === JSON.stringify(cur),
    survives: !!withOld.vdone[NEW] && !!withOld.vdone[ORIG] && !withOld.vdone[BUSY_NEW],
  };
}, ID);
chk('C68-6 a retitled video keeps its tick, date, stamp and shaky mark', m.renamed, JSON.stringify(m));
chk('C68-7 …and its skip, and a plan\'s opt-out', m.skip && m.plan, JSON.stringify(m));
chk('C68-8 a removed copy\'s tick lands on the original, its skip does not', m.dupTick && m.dupNoSkip, JSON.stringify(m));
chk('C68-9 a current title with state of its own (unticked since) is left alone', m.busy, JSON.stringify(m));
chk('C68-10 old keys stay (inert), so a device on the previous build can\'t ping-pong them', m.oldKept, JSON.stringify(m));
chk('C68-11 runs once — a second pass carries nothing — and credits no streak', m.n1 > 0 && m.n2 === 0 && m.sigOk, 'first ' + m.n1 + ', second ' + m.n2 + ', sig ' + m.sigOk);
chk('C68-12 the migrated state is a fixed point of mergeState, and merging an old-build copy keeps every carried tick',
    m.fixed && m.survives, JSON.stringify(m));

chk('C68-15 no uncaught page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
await close();
process.exit(report() ? 1 : 0);
