/* Lecture coverage: is every Brody lecture accounted for by the resources in its unit?
 *
 * Reads a declaration from tools/generators/coverage/<unit>.js and checks it against the
 * unit as actually shipped in index.html and catalog.json. Refuses (exit 1) if:
 *   - a lecture in the unit is not declared, or a declared lecture is not in the unit
 *   - a lecture has no resources and no stated reason (gap / none)
 *   - a resource reference matches nothing in the catalog
 *   - a resource is scheduled in this unit in a LATER week than its lecture — it would
 *     land after the quiz that tests it
 *   - a resource is in neither this unit nor an earlier one (nobody would ever be told
 *     to study it)
 * Then writes docs/coverage/<unit>.md, the human-readable account.
 *
 *   node tools/generators/mk_coverage.js msk-skin          check + write the report
 *   node tools/generators/mk_coverage.js msk-skin --check  check only
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const unitId = process.argv[2];
const checkOnly = process.argv.includes('--check');
if (!unitId) { console.error('usage: mk_coverage.js <unit-id> [--check]'); process.exit(2); }

const decl = await import(pathToFileURL(path.join(REPO, 'tools/generators/coverage', unitId + '.js')).href);
const cat = JSON.parse(fs.readFileSync(path.join(REPO, 'catalog.json'), 'utf8')).videos;
const app = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');

/* ---- the units, exactly as shipped ---- */
const order = app.match(/const BRODY_BLOCKS=\[([^\]]*)\];/)[1].split(',').map(s => s.trim());
const units = order.map(name => JSON.parse(app.match(new RegExp('\\nconst ' + name + '=(.*?);\\n'))[1]));
const unit = units.find(u => u.id === unitId);
if (!unit) { console.error('no unit "' + unitId + '" in BRODY_BLOCKS'); process.exit(1); }
const earlier = units.filter(u => u.shelf < unit.weeks[0].start);

const K = v => v.res + '|' + v.sys + '|' + (v.cat || '') + '|' + v.name;
const inUnit = (u, v) => v.res === 'uwlib' ? (u.artWeek || {})[K(v)] != null   // as brodyInBlock
  : (u.systems.includes(v.sys) || (u.include || []).includes(K(v))) && !(u.exclude || []).includes(K(v));
const weekIn = (u, v) => {                 // the same precedence the app uses
  const k = K(v), last = u.weeks.length;
  if (v.res === 'uwlib') return (u.artWeek || {})[k] ?? last;
  if ((u.videoWeek || {})[k] != null) return u.videoWeek[k];
  if (v.res === 'bootcamp' && (u.bcWeek || {})[v.sys + '|' + (v.cat || '')] != null) return u.bcWeek[v.sys + '|' + (v.cat || '')];
  return last;
};

/* ---- resolve one reference to catalog items ---- */
const RES = { bnb:'bnb', pathoma:'pathoma', skmicro:'skmicro', skpharm:'skpharm', uw:'uwlib' };
function resolve(ref) {
  const i = ref.indexOf(':'), kind = ref.slice(0, i), body = ref.slice(i + 1);
  let hits;
  if (kind === 'bc') {
    const [sys, sec, name] = body.split('|');
    hits = cat.filter(v => v.res === 'bootcamp' && v.sys === sys && v.cat === sec && (!name || v.name === name));
  } else if (RES[kind]) {
    hits = cat.filter(v => v.res === RES[kind] && v.name === body);
    // a title shared by two items (e.g. two "NSAIDs"): prefer the one this unit schedules
    if (hits.length > 1) { const mine = hits.filter(v => inUnit(unit, v)); if (mine.length) hits = mine; }
  } else return { error: 'unknown resource prefix "' + kind + '"' };
  return hits.length ? { hits } : { error: 'matches nothing in the catalog' };
}

/* ---- check ---- */
const problems = [];
const key = l => l.w + '|' + l.title;
const declared = new Map(decl.LECTURES.map(l => [key(l), l]));
if (declared.size !== decl.LECTURES.length) problems.push('a lecture is declared twice');
unit.weeks.forEach(w => w.lectures.forEach(lec => {
  if (!declared.has(w.n + '|' + lec.title)) problems.push('week ' + w.n + ' lecture not accounted for: "' + lec.title + '"');
}));
decl.LECTURES.forEach(l => {
  const wk = unit.weeks.find(w => w.n === l.w);
  if (!wk || !wk.lectures.some(x => x.title === l.title)) problems.push('declared lecture is not in the unit: week ' + l.w + ' "' + l.title + '"');
});

const rows = decl.LECTURES.map(l => {
  const row = { l, found: [], notes: [] };
  const kinds = ['items', 'gap', 'none'].filter(k => l[k]);
  if (!kinds.length) problems.push('"' + l.title + '" has no resources and no stated reason');
  if (l.items && !l.items.length) problems.push('"' + l.title + '" has an empty resource list');
  (l.items || []).forEach(ref => {
    const r = resolve(ref);
    if (r.error) { problems.push('"' + l.title + '": ' + ref + ' — ' + r.error); return; }
    r.hits.forEach(v => {
      if (inUnit(unit, v)) {
        const w = weekIn(unit, v);
        if (w > l.w) problems.push('"' + l.title + '" (week ' + l.w + '): ' + ref + ' is scheduled in week ' + w + ', after the quiz');
        row.found.push({ ref, v, where: 'week ' + w });
      } else {
        const u = earlier.find(e => inUnit(e, v));
        if (u) row.found.push({ ref, v, where: 'earlier: ' + u.name });
        else problems.push('"' + l.title + '": ' + ref + ' is not scheduled in this unit or any earlier one');
      }
    });
  });
  return row;
});

if (problems.length) { console.error('COVERAGE PROBLEMS (' + problems.length + '):'); problems.forEach(p => console.error('  ' + p)); process.exit(1); }

/* ---- summary ---- */
const total = rows.length;
const covered = rows.filter(r => r.l.items && !r.l.partial).length;
const partial = rows.filter(r => r.l.partial).length;
const gaps = rows.filter(r => r.l.gap).length;
const none = rows.filter(r => r.l.none).length;
console.log(unit.name + ': ' + total + ' lectures — ' + covered + ' covered, ' + partial + ' partly covered, '
  + gaps + ' with no resource in the six (gap), ' + none + ' not board material');

/* ---- coverage.json: what the site's Content Audit shows ----
   The app can't read tools/, so the validated map is published as data. One entry per
   unit; other units already in the file are kept. Each lecture carries its status and
   the item keys that teach it, with where each is scheduled. */
const discOf = l => ((unit.weeks.find(w => w.n === l.w) || {}).lectures || []).find(x => x.title === l.title)?.disc || '';
const entry = {
  name: unit.name,
  summary: { total, covered, partial, gap: gaps, none },
  lectures: rows.map(r => {
    const o = { w: r.l.w, title: r.l.title, disc: discOf(r.l),
      status: r.l.none ? 'none' : r.l.gap ? 'gap' : r.l.partial ? 'partial' : 'covered' };
    const note = r.l.none || r.l.gap || r.l.partial; if (note) o.note = note;
    if (r.found.length) o.items = [...new Map(r.found.map(f => [K(f.v), f])).values()]
      .map(f => f.where.startsWith('earlier: ') ? { k: K(f.v), earlier: f.where.slice(9) } : { k: K(f.v), w: +f.where.replace('week ', '') });
    return o;
  }),
};
const COV = path.join(REPO, 'coverage.json');
const cur = fs.existsSync(COV) ? JSON.parse(fs.readFileSync(COV, 'utf8')) : { version: 1, units: {} };
const next = { version: 1, units: Object.assign({}, cur.units, { [unitId]: entry }) };
next.units = Object.fromEntries(Object.keys(next.units).sort().map(k => [k, next.units[k]]));
const text = JSON.stringify(next) + '\n';
if (checkOnly) {
  if (!fs.existsSync(COV) || fs.readFileSync(COV, 'utf8') !== text) {
    console.error('coverage.json is out of date with tools/generators/coverage/' + unitId + '.js — run: node tools/generators/mk_coverage.js ' + unitId);
    process.exit(1);
  }
  process.exit(0);
}
fs.writeFileSync(COV, text);
console.log('wrote coverage.json (' + Math.round(text.length / 1024) + ' KB, ' + Object.keys(next.units).length + ' unit' + (Object.keys(next.units).length === 1 ? '' : 's') + ')');

/* ---- report ---- */
const RESNAME = { bnb:'B&B', pathoma:'Pathoma', skmicro:'Sketchy Micro', skpharm:'Sketchy Pharm', bootcamp:'Bootcamp', uwlib:'UWorld article' };
const lines = [];
lines.push('# Lecture coverage — ' + unit.name, '');
lines.push('Every Brody lecture in the unit and what in the plan teaches it. Generated by');
lines.push('`tools/generators/mk_coverage.js ' + unitId + '` from `tools/generators/coverage/' + unitId + '.js`;');
lines.push('the generator refuses a lecture with no resources and no stated reason, a resource that');
lines.push('does not exist, and a resource scheduled after its lecture\'s quiz.', '');
lines.push('| | Lectures |', '|---|---|');
lines.push('| Covered | ' + covered + ' |', '| Partly covered | ' + partial + ' |', '| **Gap** — examinable, no resource in the six | ' + gaps + ' |', '| Not board material (PBL, PDRs, cases) | ' + none + ' |', '| **Total** | ' + total + ' |', '');
const flagged = rows.filter(r => r.l.gap || r.l.partial);
if (flagged.length) {
  lines.push('## Gaps and partial coverage', '');
  flagged.forEach(r => lines.push('- **Week ' + r.l.w + ' · ' + r.l.title + '** — ' + (r.l.gap || r.l.partial)));
  lines.push('');
}
unit.weeks.forEach(w => {
  lines.push('## Week ' + w.n + ' — ' + w.label, '');
  rows.filter(r => r.l.w === w.n).forEach(r => {
    const disc = (w.lectures.find(x => x.title === r.l.title) || {}).disc || '';
    lines.push('### ' + r.l.title + (disc ? ' · ' + disc : ''));
    if (r.l.none) { lines.push('', '_Not board material — ' + r.l.none + '._', ''); return; }
    if (r.l.gap) { lines.push('', '**Gap.** ' + r.l.gap + '.', ''); return; }
    if (r.l.partial) lines.push('', '**Partly covered.** ' + r.l.partial + '.');
    const by = {};
    r.found.forEach(f => { (by[f.v.res] = by[f.v.res] || []).push(f); });
    lines.push('');
    Object.keys(RESNAME).filter(k => by[k]).forEach(k => {
      const names = [...new Map(by[k].map(f => [K(f.v), f])).values()]
        .map(f => f.v.name + (f.where.startsWith('earlier') ? ' _(' + f.where + ')_' : ''));
      lines.push('- **' + RESNAME[k] + '** (' + names.length + '): ' + names.join(' · '));
    });
    lines.push('');
  });
});
const out = path.join(REPO, 'docs/coverage', unitId + '.md');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, lines.join('\n'));
console.log('wrote ' + path.relative(REPO, out));
