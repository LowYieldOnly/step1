/* Declared catalog corrections.
 *
 * The catalog mirrors what the vendors actually publish, and they revise it —
 * videos get merged, split or renamed between editions. When that happens the
 * correction is declared here rather than hand-edited into catalog.json, so there
 * is a record of what changed and why, and so re-running is safe.
 *
 * Idempotent: a correction whose "from" entries are already gone and whose "to"
 * already exists is skipped.
 *
 * A NOTE ON PROGRESS. Videos are identified by name (see itemId in index.html), so
 * renaming one changes its id. Each rename leaves an alias in catalog.json, and each
 * removed copy a duplicate entry (lib/aliases.js), so the app carries a student's ticks
 * over to the current title. A merge does not: one of its halves being ticked does not
 * mean the whole video was watched.
 *
 *   node tools/generators/fix_catalog.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { itemId, recordAliases, aliasProblems } from './lib/aliases.js';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const FILE = path.join(REPO, 'catalog.json');

/* Several catalog rows collapse into one published video. The runtime is the
   published one, not the sum — they should agree, and a mismatch is reported. */
const MERGES = [
  { res:'pathoma', sys:'Neurology', cat:'Central Nervous System Pathology',
    from:['17.5 Trauma', '17.6 Demyelinating Disorders'],
    to:'17.5-17.6 Trauma & Demyel. Disorders', min:13,
    note:'Pathoma publishes these as a single 13:10 video; the catalog had the older split listing.' },
];

/* Title corrections where the video is the same, only the wording differs. */
const RENAMES = [
  { res:'pathoma', sys:'Neurology', cat:'Central Nervous System Pathology',
    from:'17.7 Dementia and Degenerative Disorders',
    to:'17.7 Dementia & Degenerative Disorders',
    note:'Matches the published title (ampersand, not "and").' },
  { res:'skpharm', sys:'Psychiatry', cat:'Sedative-Hypnotics',
    from:'Nonbenzodiazepine Hypnotics, Melatonin, Ramelteon, Suvorexant',
    to:'Nonbenzodiazepine Hypnotics, Melatonin, Ramelteon',
    note:'The title was reconstructed by hand; Sketchy\'s own video list (2026-10-20) has no "Suvorexant". Same 13-minute video.' },
];

/* Rows that are a copy of another video filed under the wrong resource. Removed only while
   the correctly filed original (`copyOf`) exists — a removal can never delete the only copy. */
const REMOVALS = [
  { res:'skmicro', sys:'Infectious Disease', cat:'Ectoparasites', name:'Antihistamines',
    copyOf:{ res:'skpharm', sys:'Pulmonary', cat:'Allergy & Pulmonary', name:'Antihistamines' },
    note:'a Sketchy Pharm video (16 min) misfiled under Sketchy Micro; the Pharm copy is the real one and Cardiopulm schedules it' },
  { res:'skmicro', sys:'Infectious Disease', cat:'Ectoparasites', name:'Asthma Therapy',
    copyOf:{ res:'skpharm', sys:'Pulmonary', cat:'Allergy & Pulmonary', name:'Asthma Therapy' },
    note:'a Sketchy Pharm video (22 min) misfiled under Sketchy Micro; the Pharm copy is the real one and Cardiopulm schedules it' },
];

const cat = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const K = v => v.res + '|' + v.sys + '|' + (v.cat || '') + '|' + v.name;
const find = (res, sys, c, name) => cat.videos.findIndex(v => v.res === res && v.sys === sys && (v.cat || '') === c && v.name === name);

let changed = 0;
const done = [], skipped = [], problems = [];

MERGES.forEach(m => {
  const idx = m.from.map(n => find(m.res, m.sys, m.cat, n));
  const present = idx.filter(i => i >= 0);
  const already = find(m.res, m.sys, m.cat, m.to);
  if (!present.length) {
    if (already >= 0) skipped.push('merge → ' + m.to + ' (already applied)');
    else problems.push('merge → ' + m.to + ': neither the sources nor the result are in the catalog');
    return;
  }
  if (present.length !== m.from.length)
    problems.push('merge → ' + m.to + ': only ' + present.length + ' of ' + m.from.length + ' sources found');
  const sum = present.reduce((a, i) => a + cat.videos[i].min, 0);
  if (sum !== m.min)
    problems.push('merge → ' + m.to + ': sources total ' + sum + 'm but the published runtime is ' + m.min + 'm');
  const at = Math.min(...present);
  const row = { res:m.res, sys:m.sys, cat:m.cat, name:m.to, min:m.min };
  // drop the sources back-to-front so the earlier indices stay valid, then insert
  present.sort((a, b) => b - a).forEach(i => cat.videos.splice(i, 1));
  cat.videos.splice(at, 0, row);
  changed++;
  done.push('merged ' + m.from.length + ' rows into "' + m.to + '" (' + m.min + 'm) — ' + m.note);
});

RENAMES.forEach(r => {
  const i = find(r.res, r.sys, r.cat, r.from);
  if (i < 0) {
    skipped.push('rename → ' + r.to + (find(r.res, r.sys, r.cat, r.to) >= 0 ? ' (already applied)' : ' (source not found)'));
    return;
  }
  if (find(r.res, r.sys, r.cat, r.to) >= 0) { problems.push('rename → ' + r.to + ': that name is already taken'); return; }
  cat.videos[i].name = r.to;
  changed++;
  done.push('renamed "' + r.from + '" → "' + r.to + '" — ' + r.note);
});

REMOVALS.forEach(r => {
  const i = find(r.res, r.sys, r.cat, r.name);
  if (i < 0) { skipped.push('remove ' + r.res + ' "' + r.name + '" (already applied)'); return; }
  const o = r.copyOf;
  if (find(o.res, o.sys, o.cat, o.name) < 0) { problems.push('remove ' + r.res + ' "' + r.name + '": its original (' + o.res + ' · ' + o.sys + ') is not in the catalog — refusing'); return; }
  cat.videos.splice(i, 1);
  changed++;
  done.push('removed ' + r.res + ' "' + r.name + '" — ' + r.note);
});

const keys = cat.videos.map(K);
if (keys.length !== new Set(keys).size) problems.push('the correction left duplicate catalog keys');

// recorded every run, applied or skipped, so an alias is never missing for a rename already made
const aliased = recordAliases(cat, 'aliases', RENAMES.map(r => [itemId({ res:r.res, sys:r.sys, name:r.from }), itemId({ res:r.res, sys:r.sys, name:r.to })]))
  + recordAliases(cat, 'duplicates', REMOVALS.map(r => [itemId(r), itemId(r.copyOf)]));
problems.push(...aliasProblems(cat));

if (problems.length) { console.error('PROBLEMS:'); problems.forEach(p => console.error('  ' + p)); process.exit(1); }
if (changed || aliased) {
  fs.writeFileSync(FILE, JSON.stringify(cat));
  if (changed) console.log('applied ' + changed + ' correction' + (changed === 1 ? '' : 's') + '; catalog now ' + cat.videos.length + ' videos');
  done.forEach(d => console.log('   · ' + d));
  if (aliased) console.log('   ' + aliased + ' alias' + (aliased === 1 ? '' : 'es') + ' recorded — a student\'s ticks follow the renamed videos');
} else {
  console.log('no corrections to apply — catalog already matches all ' + (MERGES.length + RENAMES.length + REMOVALS.length) + ' declared entries');
}
skipped.forEach(s => console.log('   (skipped) ' + s));
