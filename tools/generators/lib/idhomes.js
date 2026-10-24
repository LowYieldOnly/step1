/* Resolve data/id-homes.js against the catalog: which Infectious Disease video each unit holds,
 * at which week, and which are waiting for a named unit. Shared by mk_id.js (which splices
 * the generator-less units and checks all four) and by mk_msk.js / mk_neuro.js (which merge
 * their own unit's homes), so every writer produces the same blocks.
 */
import { HOMES, WAITING, matchRef } from '../data/id-homes.js';
import { RETIRED } from '../../system-homes.js';

export const ID = 'Infectious Disease';
export const K = v => v.res + '|' + v.sys + '|' + (v.cat || '') + '|' + v.name;
export const isIdKey = k => k.split('|')[1] === ID;

export function resolveIdHomes(catalogVideos) {
  const vids = catalogVideos.filter(v => v.sys === ID && v.res !== 'uwlib');
  const problems = [];
  const resolve = ref => {
    const hits = vids.filter(v => matchRef(ref, v));
    if (!hits.length) problems.push('matches no Infectious Disease video: ' + ref);
    else if (!(ref.startsWith('bc:') && !ref.slice(3).includes('|')) && hits.length > 1) problems.push('ambiguous (' + hits.length + ' videos): ' + ref);
    return hits;
  };
  const homes = {};          // unit → { key: week }
  const homed = new Set(), waiting = new Map();
  HOMES.forEach(h => h.items.forEach(ref => resolve(ref).forEach(v => {
    const u = homes[h.unit] = homes[h.unit] || {};
    const k = K(v);
    u[k] = u[k] == null ? h.week : Math.min(u[k], h.week);   // two lectures in one unit: the earlier week
    homed.add(k);
  })));
  WAITING.forEach(w => w.items.forEach(ref => resolve(ref).forEach(v => waiting.set(K(v), w))));
  vids.forEach(v => {
    const k = K(v);
    if (homed.has(k) && waiting.has(k)) problems.push('both homed and waiting: ' + k);
    if (!homed.has(k) && !waiting.has(k) && !RETIRED[v.res]) problems.push('no home and not waiting: ' + v.res + ' · ' + (v.cat || '') + ' · ' + v.name);
  });
  return { vids, homes, waiting, problems };
}

/* Merge one unit's ID homes into a block's include list and videoWeek, replacing whatever ID
   videos it held before — so the declarations, not the block, are the record. */
export function applyIdHomes(blk, unitHomes, order) {
  const keep = (blk.include || []).filter(k => !isIdKey(k));
  Object.keys(blk.videoWeek || {}).forEach(k => { if (isIdKey(k) && !blk.systems.includes(ID)) delete blk.videoWeek[k]; });
  const add = Object.keys(unitHomes || {}).sort((a, b) => order.indexOf(a) - order.indexOf(b));
  blk.include = keep.concat(add);
  add.forEach(k => { blk.videoWeek[k] = unitHomes[k]; });
  return blk;
}
