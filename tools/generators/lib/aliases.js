/* Progress follows a video when the catalog renames or drops it.
 *
 * A video's id is built from its title (itemId below — the same rule as itemId() in
 * index.html), so a corrected title is a new id, and a student who had ticked the old one
 * would see it unticked. catalog.json therefore carries two maps, old id → current id:
 *
 *   aliases     the same video under its corrected title — ticks, skips and "shaky"
 *               marks all move to the new title
 *   duplicates  a removed copy of another video — ticks move to the original (it is the
 *               same video, watched), but a skip does not: a student who skipped the copy
 *               most likely skipped it BECAUSE it was a copy
 *
 * The app (migrateAliases in index.html) copies an old id's state onto the current id once,
 * and only while the current id has no state of its own.
 */
export const itemId = v => v.res === 'bnb' ? 'b:' + v.name
  : v.res === 'pathoma' ? 'p:' + v.name
  : v.res === 'bootcamp' ? 'bc:' + v.sys + '|' + (v.cat || '') + '|' + v.name
  : v.res + ':' + v.sys + ':' + v.name;

const MAPS = ['aliases', 'duplicates'];

/* Record [oldId, newId] pairs under `kind`. An earlier entry that pointed at oldId is
   pointed at newId instead, so there are never chains for the app to follow. */
export function recordAliases(cat, kind, pairs) {
  if (!MAPS.includes(kind)) throw new Error('unknown alias kind: ' + kind);
  MAPS.forEach(m => { cat[m] = cat[m] || {}; });
  let added = 0;
  pairs.forEach(([from, to]) => {
    if (from === to) return;
    MAPS.forEach(m => Object.keys(cat[m]).forEach(k => {
      if (cat[m][k] === from) cat[m][k] = to;
      if (k === to) delete cat[m][k];      // a title restored: it is current again, not an old name
    }));
    if (cat[kind][from] !== to) { cat[kind][from] = to; added++; }
  });
  // sorted, so the file is the same whichever generator recorded first
  MAPS.forEach(m => { cat[m] = Object.fromEntries(Object.entries(cat[m]).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)); });
  return added;
}

/* Everything that would make the app migrate wrongly. Empty means sound. */
export function aliasProblems(cat) {
  const ids = new Set(cat.videos.map(itemId));
  const problems = [];
  const all = {};
  MAPS.forEach(m => Object.entries(cat[m] || {}).forEach(([from, to]) => {
    if (all[from]) problems.push(from + ' is in both alias maps');
    all[from] = to;
    if (ids.has(from)) problems.push(m + ': ' + from + ' is still a catalog video, so it cannot be an old name');
    if (!ids.has(to)) problems.push(m + ': ' + from + ' → ' + to + ', which is not a catalog video');
  }));
  Object.entries(all).forEach(([from, to]) => { if (all[to]) problems.push('chain: ' + from + ' → ' + to + ' → ' + all[to]); });
  return problems;
}
