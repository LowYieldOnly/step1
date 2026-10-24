/* Infectious Disease: give every video a home (data/id-homes.js) and splice it into the units.
 *
 * Brody teaches infections inside Cardiopulm, Neuro and Musculoskeletal & Skin, so the ID
 * system is distributed rather than owned. This script:
 *   - resolves every reference against the catalog, refusing one that matches nothing or
 *     (for a single-title reference) more than one video
 *   - refuses any ID video that is neither homed nor waiting for a named unit
 *   - refuses a home in a week the unit doesn't have
 *   - splices each unit's ID videos into its include list and videoWeek, replacing what it
 *     held before, so a re-run is byte-identical
 * mk_msk.js and mk_neuro.js apply the same homes when they rebuild their units.
 *
 *   node tools/generators/mk_id.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveIdHomes, applyIdHomes, K, ID } from './lib/idhomes.js';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const APP = path.join(REPO, 'index.html');
const cat = JSON.parse(fs.readFileSync(path.join(REPO, 'catalog.json'), 'utf8')).videos;
const { vids, homes, waiting, problems } = resolveIdHomes(cat);
const order = cat.map(K);

let app = fs.readFileSync(APP, 'utf8');
const names = app.match(/const BRODY_BLOCKS=\[([^\]]*)\];/)[1].split(',').map(s => s.trim());
const blocks = names.map(n => ({ n, m: app.match(new RegExp('\\nconst ' + n + '=(.*?);\\n')) }));
const ids = blocks.map(b => JSON.parse(b.m[1]).id);
Object.keys(homes).forEach(u => { if (!ids.includes(u)) problems.push('a home names unit "' + u + '", which is not in BRODY_BLOCKS'); });
blocks.forEach(b => {
  const blk = JSON.parse(b.m[1]);
  Object.entries(homes[blk.id] || {}).forEach(([k, w]) => { if (!blk.weeks.some(x => x.n === w)) problems.push(blk.id + ': ' + k + ' → week ' + w + ', which this unit does not have'); });
});
if (problems.length) { console.error('PROBLEMS:'); problems.forEach(p => console.error('  ' + p)); process.exit(1); }

// splice, last block first so earlier match offsets stay valid
blocks.slice().reverse().forEach(b => {
  const blk = applyIdHomes(JSON.parse(b.m[1]), homes[JSON.parse(b.m[1]).id], order);
  app = app.slice(0, b.m.index) + '\nconst ' + b.n + '=' + JSON.stringify(blk) + ';\n' + app.slice(b.m.index + b.m[0].length);
});
const before = fs.readFileSync(APP, 'utf8');
if (app !== before) fs.writeFileSync(APP, app);

/* ---- report ---- */
const byKey = new Map(vids.map(v => [K(v), v]));
const h = a => (a.reduce((s, v) => s + v.min, 0) / 60).toFixed(1) + ' h';
console.log('Infectious Disease: ' + vids.length + ' videos, ' + h(vids) + (app !== before ? '  (units updated)' : '  (units already current)'));
blocks.forEach(b => {
  const id = JSON.parse(b.m[1]).id, u = homes[id] || {};
  const weeks = {};
  Object.entries(u).forEach(([k, w]) => (weeks[w] = weeks[w] || []).push(byKey.get(k)));
  console.log('  ' + id.padEnd(14) + Object.keys(u).length + ' videos' + Object.keys(weeks).sort().map(w => ' · wk' + w + ' ' + weeks[w].length + ' (' + h(weeks[w]) + ')').join(''));
});
const wait = {};
waiting.forEach((w, k) => (wait[w.unit] = wait[w.unit] || []).push(byKey.get(k)));
Object.entries(wait).forEach(([u, a]) => console.log('  waiting for ' + u + ': ' + a.length + ' (' + h(a) + ')'));
