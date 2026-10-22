/* C65 · The #1 law, checked across every unit.
 *
 *   (a) Every Brody lecture is mapped to third-party resources — or the unit's coverage
 *       file says, lecture by lecture, why not (tools/generators/mk_coverage.js).
 *   (b) Every video a resource files under a system is scheduled in that system's unit,
 *       at an explicit week — even a topic Brody doesn't lecture. Nothing defaults to
 *       the last week, nothing is silently dropped.
 *
 * (a) is enforced for every unit that has a coverage file, and the units WITHOUT one
 * are named here — so a new unit cannot ship without lecture coverage, and the three
 * older units stay visibly on the to-do list until theirs are written.
 *
 * (b) has one declared exception: cancer pharmacology, which Brody teaches in GI,
 * Nutrition & Multisystem rather than Heme/Renal. Any other exclusion fails here.
 */
import { openApp, checker, REPO } from '../harness.mjs';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const { page: p, errors, close } = await openApp();
const { chk, report } = checker('The #1 law — lectures mapped, every resource video scheduled in its system');

const COVERAGE_PENDING = ['heme-renal', 'cardiopulm', 'neuro-sensory'];   // remove an id as its file lands

const units = await p.evaluate(()=>BRODY_BLOCKS.map(b=>b.id));

// ---------- (a) lectures ----------
const covDir = path.join(REPO, 'tools/generators/coverage');
const haveCov = units.filter(id => fs.existsSync(path.join(covDir, id + '.js')));
const missing = units.filter(id => !haveCov.includes(id));
chk('C65-1 every unit has a lecture-coverage file, except the three older units still to be written',
    JSON.stringify(missing) === JSON.stringify(COVERAGE_PENDING.filter(id => units.includes(id))),
    'missing: ' + JSON.stringify(missing) + ' · pending list: ' + JSON.stringify(COVERAGE_PENDING));
haveCov.forEach((id, i) => {
  const r = spawnSync(process.execPath, [path.join(REPO, 'tools/generators/mk_coverage.js'), id, '--check'], { encoding: 'utf8' });
  chk('C65-2.' + (i + 1) + ' ' + id + ': every lecture accounted for', r.status === 0,
      (r.stdout + r.stderr).trim().split('\n').slice(0, 5).join(' | '));
});

// ---------- (b) resource completeness ----------
const law = await p.evaluate(()=>{
  const isCancerPharm = v => (v.res === 'bnb' && v.cat === 'Cancer Drugs')
    || (v.res === 'skpharm' && ['Antimetabolites', 'DNA & Cellular Division', 'Kinase Inhibitors & Monoclonal Antibodies', 'Immunology'].includes(v.cat));
  return BRODY_BLOCKS.map(b => {
    const own = catVideos().filter(v => !isArticle(v) && b.systems.includes(v.sys));
    const excluded = own.filter(v => brodyExcluded(b, v));
    const kept = own.filter(v => !brodyExcluded(b, v));
    const explicit = v => (b.videoWeek || {})[brodyKey(v)] != null
      || (v.res === 'bootcamp' && (b.bcWeek || {})[v.sys + '|' + (v.cat || '')] != null);
    return { id: b.id, own: own.length, kept: kept.length,
      notInUnit: kept.filter(v => !brodyInBlock(b, v)).map(brodyKey),
      defaulted: kept.filter(v => !explicit(v)).map(brodyKey),
      undeclaredExclusions: excluded.filter(v => !isCancerPharm(v)).map(brodyKey),
      excluded: excluded.length };
  });
});
law.forEach((u, i) => {
  chk('C65-3.' + (i + 1) + ' ' + u.id + ': all ' + u.kept + ' videos of its systems are in the unit',
      u.notInUnit.length === 0, JSON.stringify(u.notInUnit.slice(0, 5)));
  chk('C65-4.' + (i + 1) + ' ' + u.id + ': …each at an explicit week, none defaulting to the last',
      u.defaulted.length === 0, u.defaulted.length + ': ' + JSON.stringify(u.defaulted.slice(0, 5)));
  chk('C65-5.' + (i + 1) + ' ' + u.id + ': the only videos excluded are the declared cancer pharmacology',
      u.undeclaredExclusions.length === 0, JSON.stringify(u.undeclaredExclusions));
});

// ---------- Sketchy Pharm, specifically: all 117, each with a home or a stated wait ----------
const list = JSON.parse(fs.readFileSync(path.join(REPO, 'tools/generators/data/sketchy-pharm.json'), 'utf8')).videos;
const sk = await p.evaluate(names => {
  const vids = catVideos().filter(v => v.res === 'skpharm');
  return { n: vids.length, missing: names.filter(n => !vids.some(v => v.name === n)),
    extra: vids.filter(v => !names.includes(v.name)).map(v => v.name) };
}, list.map(r => r.name));
chk('C65-6 the catalog has exactly Sketchy\'s 117 pharm videos — none missing, none invented',
    sk.n === list.length && sk.missing.length === 0 && sk.extra.length === 0, JSON.stringify(sk));
const r = spawnSync(process.execPath, [path.join(REPO, 'tools/generators/mk_skpharm.js')], { encoding: 'utf8' });
chk('C65-7 mk_skpharm.js passes: every Sketchy video is in its system\'s unit, excluded with a reason, or waiting for a unit',
    r.status === 0 && /already has all 117/.test(r.stdout), (r.stdout + r.stderr).trim().split('\n').slice(0, 4).join(' | '));

// ---------- the full audit, the same one every session and every edit runs ----------
const audit = spawnSync(process.execPath, [path.join(REPO, 'tools/law.mjs'), '--brief'], { encoding: 'utf8' });
chk('C65-9 tools/law.mjs passes: every video held by a unit or waiting for a named one, every infection lecture has infection videos',
    audit.status === 0, (audit.stdout + audit.stderr).trim().split('\n').filter(l => /✗|BROKEN/.test(l)).slice(0, 6).join(' | '));

chk('C65-8 no uncaught page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
await close();
process.exit(report() ? 1 : 0);
