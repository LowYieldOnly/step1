/* UWorld Videos — UWorld's Medical Library video lectures, as a resource with its own switch.
 *
 * PROVENANCE. data/uworld-videos.json is UWorld's list as supplied (UWorld_Video_Lectures.docx,
 * Dylan, 2026-10-23): 654 listings across UWorld's 20 categories, 514 unique videos, titles
 * and runtimes verbatim — UWorld's own spellings included ("Bordatella pertussis",
 * "Rhabdomylosis"), because the title is the video's identity (itemId) and matching what
 * students see in UWorld is what makes search work.
 *
 * THE MAP is data/uworld-videos-map.txt, reviewed by Dylan: each video once, under the B&B
 * system and chapter it matches (that is the catalog's sys and cat), at the Brody week whose
 * lecture teaches it — beside the B&B, Pathoma, Sketchy or Library item on the same topic.
 *   HR1-4 / CP1-4 / NS1-3 / MSK1-3   a built unit's week
 *   A+B                               both (Psychiatry: Brody's psych lecture in another unit,
 *                                     and Nervous & Sensory, which owns Psychiatry — as B&B's are)
 *   GI / T4E / T4R / M1 / IMM         no built unit yet; the catalog row is there, unscheduled
 *                                     in Brody plans until that unit is built
 * Catalog rows follow the map's order: system, then B&B's chapter order, then teaching order.
 * Runtimes are rounded to whole minutes, like every other resource.
 *
 * Writes catalog.json (the uwvid rows, replaced in full) and splices the four unit blocks in
 * index.html (their uwvid keys only, replaced in full), so a re-run is byte-identical.
 * The MSK and Neuro generators rebuild their blocks: run this after them, then mk_editions.js.
 *
 *   node tools/generators/mk_uwvid.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CAT = path.join(REPO, 'catalog.json');
const APP = path.join(REPO, 'index.html');
const SRC = JSON.parse(fs.readFileSync(path.join(REPO, 'tools/generators/data/uworld-videos.json'), 'utf8'));
const MAP = fs.readFileSync(path.join(REPO, 'tools/generators/data/uworld-videos-map.txt'), 'utf8');

const RES = 'uwvid';
const UNITS = { HR: ['heme-renal', 'BRODY_HEME_RENAL'], CP: ['cardiopulm', 'BRODY_CARDIOPULM'], NS: ['neuro-sensory', 'BRODY_NEURO'], MSK: ['msk-skin', 'BRODY_MSK'] };
const LATER = ['GI', 'T4E', 'T4R', 'M1', 'IMM'];
const K = v => v.res + '|' + v.sys + '|' + (v.cat || '') + '|' + v.name;
const problems = [];

// ---- UWorld's list: one runtime per title (a cross-listed video must agree with itself)
const runtime = {};
SRC.categories.forEach(c => c.videos.forEach(v => {
  if (runtime[v.name] != null && runtime[v.name] !== v.runtime) problems.push('two runtimes for "' + v.name + '": ' + runtime[v.name] + ', ' + v.runtime);
  runtime[v.name] = v.runtime;
}));
const minutes = rt => { const [m, s] = rt.split(':').map(Number); return Math.max(1, Math.round(m + s / 60)); };

// ---- the map
const rows = []; let sec = null;
MAP.split('\n').forEach((ln, i) => {
  if (!ln.trim() || ln.startsWith('# ')) return;
  if (ln.startsWith('## ')) { sec = ln.slice(3).split(' › '); if (sec.length !== 2) problems.push('line ' + (i + 1) + ': a heading is "System › Chapter"'); return; }
  const parts = ln.split('|').map(s => s.trim());
  if (parts.length !== 3 || !sec) { problems.push('line ' + (i + 1) + ': expected "Title | home | note" under a heading'); return; }
  const [name, home] = parts;
  const homes = home.split('+').map(h => {
    const m = h.match(/^(HR|CP|NS|MSK)(\d)$/);
    if (m) return { code: m[1], week: +m[2] };
    if (LATER.includes(h)) return { later: h };
    problems.push('line ' + (i + 1) + ': unknown home "' + h + '"'); return null;
  }).filter(Boolean);
  rows.push({ sys: sec[0], cat: sec[1], name, homes, line: i + 1 });
});
const seen = new Set();
rows.forEach(r => {
  if (seen.has(r.name)) problems.push('mapped twice: ' + r.name); seen.add(r.name);
  if (runtime[r.name] == null) problems.push('not in UWorld\'s list (check the spelling): ' + r.name);
});
Object.keys(runtime).forEach(t => { if (!seen.has(t)) problems.push('UWorld video with no place in the map: ' + t); });

// ---- catalog rows
const cat = JSON.parse(fs.readFileSync(CAT, 'utf8'));
const vids = rows.map(r => ({ res: RES, sys: r.sys, cat: r.cat, name: r.name, min: minutes(runtime[r.name] || '0:00') }));
const sysKnown = new Set(cat.videos.map(v => v.sys));
rows.forEach(r => { if (!sysKnown.has(r.sys)) problems.push('system "' + r.sys + '" is not a catalog system (' + r.name + ')'); });

// ---- unit blocks
let app = fs.readFileSync(APP, 'utf8');
const blocks = {};
Object.entries(UNITS).forEach(([code, [id, cname]]) => {
  const m = app.match(new RegExp('\\nconst ' + cname + '=(.*?);\\n'));
  if (!m) { problems.push('could not find ' + cname); return; }
  const blk = JSON.parse(m[1]);
  if (blk.id !== id) problems.push(cname + ' is "' + blk.id + '", expected "' + id + '"');
  // what the block holds now, to leave it untouched (order included) when nothing changes —
  // mk_editions.js appends keys after these, so re-appending them every run would never settle
  const had = { include: (blk.include || []).filter(k => k.startsWith(RES + '|')).sort(),
    weeks: Object.entries(blk.videoWeek || {}).filter(([k]) => k.startsWith(RES + '|')).sort() };
  blk.include = (blk.include || []).filter(k => !k.startsWith(RES + '|'));
  Object.keys(blk.videoWeek || {}).forEach(k => { if (k.startsWith(RES + '|')) delete blk.videoWeek[k]; });
  blocks[code] = { blk, cname, had, orig: m[1] };
});
vids.forEach((v, i) => {
  const r = rows[i], k = K(v);
  r.homes.forEach(h => {
    if (h.later) return;
    const b = blocks[h.code]; if (!b) return;
    if (!b.blk.weeks.some(w => w.n === h.week)) problems.push(r.name + ': ' + h.code + h.week + ' — that unit has no week ' + h.week);
    if (b.blk.videoWeek[k] != null) problems.push(r.name + ': two weeks in ' + h.code);
    b.blk.videoWeek[k] = h.week;
    if (!b.blk.systems.includes(v.sys)) b.blk.include.push(k);
  });
  // a unit owns its systems: every video of them needs a week there, or it would fall to the last week
  Object.entries(blocks).forEach(([code, b]) => {
    if (b.blk.systems.includes(v.sys) && b.blk.videoWeek[k] == null) problems.push(r.name + ' (' + v.sys + ') is in ' + code + '\'s systems but has no week there');
  });
});

if (problems.length) { console.error('PROBLEMS — nothing written:'); problems.forEach(p => console.error('  ' + p)); process.exit(1); }

// ---- write
const before = JSON.stringify(cat);
cat.videos = cat.videos.filter(v => v.res !== RES).concat(vids);
const after = JSON.stringify(cat);
if (after !== before) fs.writeFileSync(CAT, after);
const appBefore = app;
Object.values(blocks).forEach(({ blk, cname, had }) => {
  const now = { include: blk.include.filter(k => k.startsWith(RES + '|')).sort(),
    weeks: Object.entries(blk.videoWeek).filter(([k]) => k.startsWith(RES + '|')).sort() };
  if (JSON.stringify(now) === JSON.stringify(had)) return;   // same videos, same weeks: leave the block as it is
  const m = app.match(new RegExp('\\nconst ' + cname + '=(.*?);\\n'));
  app = app.slice(0, m.index) + '\nconst ' + cname + '=' + JSON.stringify(blk) + ';\n' + app.slice(m.index + m[0].length);
});
if (app !== appBefore) fs.writeFileSync(APP, app);

// ---- report
const h = a => (a.reduce((s, v) => s + v.min, 0) / 60).toFixed(1) + ' h';
console.log('UWorld Videos: ' + vids.length + ' videos, ' + h(vids) + (after === before && app === appBefore ? ' — nothing to change' : ' — written'));
Object.entries(UNITS).forEach(([code, [id]]) => {
  const inU = vids.filter((v, i) => rows[i].homes.some(x => x.code === code));
  console.log('  ' + id.padEnd(14) + String(inU.length).padStart(4) + '  ' + h(inU));
});
LATER.forEach(l => { const a = vids.filter((v, i) => rows[i].homes.some(x => x.later === l)); if (a.length) console.log('  later: ' + l.padEnd(8) + String(a.length).padStart(4) + '  ' + h(a)); });
