/* Catalog editions: a plan keeps the video list it was made with.
 *
 * Correcting the catalog — a runtime, a title, a video added or removed, an order — would
 * reshuffle every live plan that uses those videos, because a plan is rebuilt from the
 * catalog each time it loads. So a plan is stamped with the catalog edition it was made
 * with (cfg.catEd in the app; a plan with no stamp predates editions and is on FIRST), and
 * catalog.json carries each older edition as a compact view of the current list:
 *
 *   editions[ed] = the old list, in its old order, each entry either
 *     n                    the current row n, unchanged
 *     [n, {field: old}]    the current row n, as it was then (title, section, runtime)
 *     {row}                a row the current list no longer has, verbatim
 *
 * followed by every current row of a resource the old edition did not have at all (Sketchy
 * Immuno). Those are in every view because they have their own toggle, off for plans that
 * predate them — so they are never added to a plan unasked, but anyone can switch them on.
 *
 * Unit blocks key videos by section and title (brodyKey), so a block must resolve under every
 * edition a plan can be on: for each key that names a row as an older edition had it, the
 * same row's current key is added beside it, with the same week.
 *
 * The frozen source of each older edition is data/catalog-<ed>.json — the catalog exactly as
 * it was live. Reconstructing it from the view must give it back byte for byte, or nothing
 * is written.
 *
 * To retire an edition (move every plan onto the current list), delete it from EDITIONS.
 *
 *   node tools/generators/mk_editions.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { itemId } from './lib/aliases.js';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CAT = path.join(REPO, 'catalog.json');
const APP = path.join(REPO, 'index.html');

export const CURRENT = '2026.2';
const EDITIONS = {
  '2026.1': 'the catalog as live until 2026-10-23 — every plan made before Sketchy Micro was corrected',
};

const cat = JSON.parse(fs.readFileSync(CAT, 'utf8'));
const before = JSON.stringify(cat);
const problems = [];
const K = v => v.res + '|' + v.sys + '|' + (v.cat || '') + '|' + v.name;
const idxById = new Map(cat.videos.map((v, i) => [itemId(v), i]));
const alias = Object.assign({}, cat.aliases || {});
const view = (E) => E.map(x => typeof x === 'number' ? cat.videos[x] : Array.isArray(x) ? Object.assign({}, cat.videos[x[0]], x[1]) : x);

const editions = {}, added = {};
const keyMap = {};                     // an older edition's key → the current key of the same row
Object.keys(EDITIONS).forEach(ed => {
  const old = JSON.parse(fs.readFileSync(path.join(REPO, 'tools/generators/data/catalog-' + ed + '.json'), 'utf8')).videos;
  const oldRes = new Set(old.map(v => v.res));
  const E = [];
  old.forEach(o => {
    const n = idxById.has(itemId(o)) ? idxById.get(itemId(o)) : idxById.get(alias[itemId(o)]);
    if (n == null) { E.push(o); return; }                       // gone from the current list
    const v = cat.videos[n];
    const keys = new Set(Object.keys(o).concat(Object.keys(v)));
    const diff = {};
    let inline = false;
    keys.forEach(k => { if (JSON.stringify(o[k]) !== JSON.stringify(v[k])) { if (!(k in o)) inline = true; else diff[k] = o[k]; } });
    if (inline) { E.push(o); return; }                          // a field added since: keep the old row whole
    E.push(Object.keys(diff).length ? [n, diff] : n);
    if (K(o) !== K(v)) keyMap[K(o)] = K(v);
  });
  cat.videos.forEach((v, i) => { if (!oldRes.has(v.res)) { E.push(i); added[ed] = (added[ed] || 0) + 1; } });
  // the proof: the view gives back the old catalog exactly, then the new resources
  const got = view(E), want = old.concat(cat.videos.filter(v => !oldRes.has(v.res)));
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    const i = got.findIndex((g, j) => JSON.stringify(g) !== JSON.stringify(want[j]));
    problems.push(ed + ': the view does not reproduce the frozen catalog (first difference at ' + i + ': ' + JSON.stringify(got[i]) + ' vs ' + JSON.stringify(want[i]) + ')');
  }
  editions[ed] = E;
});
if (problems.length) { console.error('PROBLEMS:'); problems.forEach(p => console.error('  ' + p)); process.exit(1); }

cat.version = CURRENT;
if (Object.keys(editions).length) cat.editions = editions; else delete cat.editions;
const after = JSON.stringify(cat);
if (after !== before) fs.writeFileSync(CAT, after);

/* ---------------- unit blocks resolve under every edition ---------------- */
let app = fs.readFileSync(APP, 'utf8');
const order = app.match(/const BRODY_BLOCKS=\[([^\]]*)\];/)[1].split(',').map(s => s.trim());
const current = new Set(cat.videos.map(K));
const dual = [];
order.forEach(name => {
  const m = app.match(new RegExp('\\nconst ' + name + '=(.*?);\\n'));
  const blk = JSON.parse(m[1]);
  let added = 0;
  ['include', 'exclude'].forEach(f => (blk[f] || []).slice().forEach(k => {
    const to = keyMap[k];
    if (to && !blk[f].includes(to)) { blk[f].push(to); added++; }
  }));
  ['videoWeek', 'artWeek'].forEach(f => Object.entries(blk[f] || {}).forEach(([k, w]) => {
    const to = keyMap[k];
    if (to && blk[f][to] == null) { blk[f][to] = w; added++; }
  }));
  // every key a block names must be a row in SOME edition, or the block points at nothing
  const anyEd = new Set([...current, ...Object.keys(keyMap)]);
  Object.keys(EDITIONS).forEach(ed => JSON.parse(fs.readFileSync(path.join(REPO, 'tools/generators/data/catalog-' + ed + '.json'), 'utf8')).videos.forEach(v => anyEd.add(K(v))));
  [...(blk.include || []), ...(blk.exclude || []), ...Object.keys(blk.videoWeek || {})].forEach(k => {
    if (!anyEd.has(k)) problems.push(blk.id + ': names ' + k + ', which is in no edition of the catalog');
  });
  if (added) { dual.push(blk.id + ' +' + added); app = app.slice(0, m.index) + '\nconst ' + name + '=' + JSON.stringify(blk) + ';\n' + app.slice(m.index + m[0].length); }
});
if (problems.length) { console.error('PROBLEMS:'); problems.forEach(p => console.error('  ' + p)); process.exit(1); }
const appChanged = app !== fs.readFileSync(APP, 'utf8');
if (appChanged) fs.writeFileSync(APP, app);

console.log('catalog edition ' + CURRENT + (after !== before ? ' written' : ' — nothing to change'));
Object.entries(editions).forEach(([ed, E]) => {
  const same = E.filter(x => typeof x === 'number').length - (added[ed] || 0), then = E.filter(Array.isArray).length, gone = E.filter(x => typeof x === 'object' && !Array.isArray(x)).length;
  console.log('  ' + ed + ': ' + same + ' rows unchanged, ' + then + ' as they were then, ' + gone + ' since removed; + ' + (added[ed] || 0) + ' of resources new since (own toggle, off) · ' + EDITIONS[ed]);
});
if (dual.length) console.log('  unit blocks given the current key beside each renamed one: ' + dual.join(', '));
