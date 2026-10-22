/* The #1 law, audited. Fast (no browser) so it can run every session and after every edit.
 *
 *   "make sure every brody lecture is mapped to third party, and that the sum total videos
 *    within a resource are watched in that specific system even if brody does not cover
 *    that topic."
 *
 * FAIL (exit 1) on any of:
 *   L1  a unit's lecture coverage doesn't pass (tools/generators/mk_coverage.js --check)
 *   L2  a video a unit holds has no explicit week (it would silently fall to the last week)
 *   L3  a catalog video that no unit holds and nothing declares — or whose declared unit's
 *       start date has passed without it being held (tools/law-homes.js). A resource that
 *       has left the repertoire (RETIRED there) is no longer owed new homes.
 *   L4  a lecture that teaches a system (by title) with no video of that system in its week
 * PENDING (listed, never silent): units without a coverage file yet, and videos declared as
 *   waiting for a named unit that hasn't started or whose calendar hasn't been supplied.
 *
 *   node tools/law.mjs            full report
 *   node tools/law.mjs --brief    counts and the first lines of each list (for hooks)
 *   LAW_TODAY=2026-11-10 node tools/law.mjs   audit as of another date
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { WAITING, SENTINELS, RETIRED } from './law-homes.js';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const brief = process.argv.includes('--brief');
const today = process.env.LAW_TODAY || new Date().toISOString().slice(0, 10);

const app = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
const vids = JSON.parse(fs.readFileSync(path.join(REPO, 'catalog.json'), 'utf8')).videos.filter(v => v.res !== 'uwlib');
const order = app.match(/const BRODY_BLOCKS=\[([^\]]*)\];/)[1].split(',').map(s => s.trim());
const units = order.map(n => JSON.parse(app.match(new RegExp('\\nconst ' + n + '=(.*?);\\n'))[1]));

const K = v => v.res + '|' + v.sys + '|' + (v.cat || '') + '|' + v.name;
const holds = (u, v) => (u.systems.includes(v.sys) || (u.include || []).includes(K(v))) && !(u.exclude || []).includes(K(v));
const explicitWeek = (u, v) => (u.videoWeek || {})[K(v)] ?? (v.res === 'bootcamp' ? (u.bcWeek || {})[v.sys + '|' + (v.cat || '')] : undefined);
const fail = [], pending = [];

/* L1 · every lecture mapped */
const covDir = path.join(REPO, 'tools/generators/coverage');
units.forEach(u => {
  if (!fs.existsSync(path.join(covDir, u.id + '.js'))) { pending.push('L1 ' + u.id + ': lecture coverage not written yet — its lectures are unaudited'); return; }
  const r = spawnSync(process.execPath, [path.join(REPO, 'tools/generators/mk_coverage.js'), u.id, '--check'], { encoding: 'utf8' });
  if (r.status !== 0) fail.push('L1 ' + u.id + ': lecture coverage fails — ' + (r.stdout + r.stderr).trim().split('\n').slice(0, 3).join(' | '));
});

/* L2 · every held video at an explicit week */
units.forEach(u => {
  const loose = vids.filter(v => holds(u, v) && explicitWeek(u, v) == null);
  if (loose.length) fail.push('L2 ' + u.id + ': ' + loose.length + ' videos with no explicit week (would fall to the last week), e.g. ' + loose.slice(0, 3).map(v => v.res + ':' + v.name).join('; '));
});

/* L3 · the sum total: every video held somewhere, or waiting for a named unit */
const declared = (v) => {
  const w = WAITING[v.sys];
  if (!w) return null;
  if (w.rules) return w.rules.find(r => r.match(v)) || null;   // distributed systems: per-video
  return w;
};
const groups = {};   // unit name → {n, from, note, systems}
const undeclared = {};   // system → videos no unit holds and nothing declares
const retiredUnheld = {};   // resource → videos no unit holds, not owed a home any more
vids.forEach(v => {
  if (units.some(u => holds(u, v))) return;
  if (RETIRED[v.res]) { (retiredUnheld[v.res] = retiredUnheld[v.res] || []).push(v); return; }
  const excludedBy = units.find(u => u.systems.includes(v.sys) && (u.exclude || []).includes(K(v)));
  const d = declared(v) || (excludedBy ? WAITING['§excluded'] && WAITING['§excluded'].rules.find(r => r.match(v)) : null);
  if (!d) { (undeclared[v.sys] = undeclared[v.sys] || []).push(v); return; }
  const g = groups[d.unit + '\u0000' + d.note] = groups[d.unit + '\u0000' + d.note] || { unit: d.unit, n: 0, min: 0, from: d.from, note: d.note, sys: new Set() };
  g.n++; g.min += v.min; g.sys.add(v.sys);
});
Object.entries(undeclared).forEach(([sys, a]) => fail.push('L3 ' + a.length + ' ' + sys + ' videos (' + (a.reduce((t, v) => t + v.min, 0) / 60).toFixed(1)
  + ' h) held by no unit and declared nowhere — e.g. ' + a.slice(0, 4).map(v => v.res + ':' + v.name).join('; ')));
Object.values(groups).forEach(g => {
  const line = g.n + ' videos (' + (g.min / 60).toFixed(1) + ' h; ' + [...g.sys].join(', ') + ') → ' + g.unit
    + (g.from ? ' from ' + g.from : '') + ' — ' + g.note;
  if (g.from && g.from <= today) fail.push('L3 OVERDUE: ' + line + ' — that unit has started and doesn\'t hold them');
  else pending.push('L3 ' + line);
});

/* L4 · a lecture that teaches a system has that system's videos in its week */
units.forEach(u => u.weeks.forEach(w => (w.lectures || []).forEach(l => SENTINELS.forEach(s => {
  if (!s.lecture.test(l.title)) return;
  const n = vids.filter(v => v.sys === s.system && holds(u, v) && explicitWeek(u, v) === w.n).length;
  if (!n) fail.push('L4 ' + u.id + ' wk' + w.n + ' "' + l.title + '": ' + s.why + ' (no ' + s.system + ' video in that week)');
}))));

/* ---------------- report ---------------- */
const LAW = '#1 LAW — every Brody lecture mapped to third party; the sum total of every resource\'s videos watched in that system\'s unit, even topics Brody doesn\'t lecture.';
const cap = brief ? 6 : Infinity;
const list = (title, a) => a.length ? title + ' (' + a.length + ')\n' + a.slice(0, cap).map(x => '  ✗ ' + x).join('\n') + (a.length > cap ? '\n  … ' + (a.length - cap) + ' more — run: node tools/law.mjs' : '') + '\n' : '';
console.log(LAW);
console.log(fail.length ? 'LAW BROKEN — ' + fail.length + ' failure' + (fail.length === 1 ? '' : 's') : 'Law holds — no failures.');
process.stdout.write(list('FAILURES', fail));
process.stdout.write(list('PENDING — named, outstanding, never silent', pending).replace(/✗/g, '…'));
Object.entries(RETIRED).forEach(([r, d]) => console.log('RETIRED ' + r + ': ' + (retiredUnheld[r] || []).length + ' of its videos held by no unit and no longer owed one — ' + d.note));
process.exit(fail.length ? 1 : 0);
