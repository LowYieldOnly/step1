/* Sketchy Pharm — all 117 videos, from Sketchy's own video list.
 *
 * PROVENANCE. data/sketchy-pharm.json is SketchyPharm_Video_List.docx (supplied
 * 2026-10-20): 117 videos across 8 Sketchy units, 28 h 20 min. It replaces
 * add_sketchy.js, whose 48 entries were transcribed from screenshots — 47 of them
 * match the official list exactly (title, section, runtime); the 48th was a title
 * reconstructed from a truncated card and is corrected in fix_catalog.js.
 *
 * SYSTEM. Sketchy organises pharmacology by its own units, not by organ system; the
 * catalog files every video under ONE system, and the system decides which Brody unit
 * schedules it (a unit takes the whole of its systems). SYSTEM_OF below is that rule,
 * and it is checked against every video already in the catalog — a rule that would
 * move an existing video is an error, because the system is part of its identity.
 *
 * THE LAW this enforces: every Sketchy video in a system is scheduled in that system's
 * unit — even a topic Brody doesn't lecture — unless the unit excludes it with a stated
 * reason. A video whose system no unit owns is either homed lecture by lecture (Infectious
 * Disease, data/id-homes.js) or declared waiting for a named unit in tools/law-homes.js.
 *
 * UNIT PLACEMENT. Neuro and MSK map their own Sketchy videos (mk_neuro.js, mk_msk.js).
 * Heme/Renal and Cardiopulm have no generator any more, so their Sketchy weeks are
 * declared in UNIT_WEEKS below and spliced into the shipped blocks.
 *
 *   node tools/generators/mk_skpharm.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CAT = path.join(REPO, 'catalog.json');
const APP = path.join(REPO, 'index.html');
const LIST = JSON.parse(fs.readFileSync(path.join(REPO, 'tools/generators/data/sketchy-pharm.json'), 'utf8')).videos;

/* Sketchy unit · section → catalog system. Per-title entries first. */
const BY_TITLE = {
  'Triptans & Migraine': 'Neurology',             // Sketchy files it with the vasoactive drugs
  'Opioids, Naloxone, Naltrexone': 'Psychiatry',
  'Lithium': 'Psychiatry',
  'First-Generation Antipsychotics': 'Psychiatry',
  'Second-Generation Antipsychotics': 'Psychiatry',
};
const BY_SECTION = {
  'Autonomic Drugs|Parasympathetic': 'Neurology',
  'Autonomic Drugs|Sympathetic': 'Neurology',
  'Cardiovascular & Renal|Heart Failure Drugs': 'Cardiology',
  'Cardiovascular & Renal|Diuretics': 'Renal',
  'Cardiovascular & Renal|Antihypertensives': 'Cardiology',
  'Cardiovascular & Renal|Antiarrhythmics': 'Cardiology',
  'Blood & Inflammation|Anticoagulants & Thrombolytics': 'Hematology',
  'Blood & Inflammation|Dyslipidemia Drugs': 'Cardiology',
  'Blood & Inflammation|Anti-Inflammatory': 'Hematology',
  'Smooth Muscle|Vasoactive': 'Cardiology',
  'Smooth Muscle|Allergy & Pulmonary': 'Pulmonary',
  'GI & Endocrine|GI': 'Gastroenterology',
  'GI & Endocrine|Diabetes': 'Endocrinology',
  'GI & Endocrine|Thyroid, Parathyroid, Adrenal': 'Endocrinology',
  'GI & Endocrine|Hypothalamic & Pituitary': 'Endocrinology',
  'GI & Endocrine|Sex Hormones': 'Reproductive',
  'Neuro & Psych|Anesthetics & Analgesics': 'Neurology',
  'Neuro & Psych|Antidepressants & Anxiolytics': 'Psychiatry',
  'Neuro & Psych|Mood Stabilizers & Antiepileptic Drugs': 'Neurology',
  "Neuro & Psych|Antipsychotics & Parkinson's": 'Neurology',
  'Neuro & Psych|Psychostimulants: Narcolepsy & ADHD': 'Psychiatry',
  'Neuro & Psych|Sedative-Hypnotics': 'Psychiatry',
  'Neuro & Psych|Smoking Cessation Aids': 'Psychiatry',
  "Neuro & Psych|Alzheimer's Medications": 'Neurology',
  'Neuro & Psych|Muscle Relaxants': 'Neurology',
};
const SYSTEM_OF = r => BY_TITLE[r.name] || BY_SECTION[r.unit + '|' + r.cat]
  || ({ 'Antimicrobials': 'Infectious Disease', 'Antineoplastics': 'Hematology' })[r.unit] || null;

/* Weeks for the two units without a generator. Keys are titles; the unit is the one
   whose systems hold the video. Videos already mapped are listed too, so this is the
   complete Sketchy picture for both units. */
const UNIT_WEEKS = {
  'heme-renal': {
    // ---- week 2 · hemostasis & anticoagulants (and, by the Sketchy grouping, NSAIDs/gout) ----
    'Heparin, LMWH, Fondaparinux, Direct Thrombin Inhibitors, Xa Inhibitors': 2, 'Warfarin': 2,
    'Antiplatelet Agents': 2, 'Thrombolytics': 2,
    'NSAIDs': 2, 'Gout Drugs': 2, 'Immunosuppressants': 2,
    'TNF Inhibitors': 2,                                  // new — with its Anti-Inflammatory siblings
    // ---- week 3 · renal physiology: diuretics ----
    'Acetazolamide & Mannitol': 3, 'Loop Diuretics': 3, 'Thiazides': 3, 'Potassium-Sparing Diuretics': 3,
  },
  'cardiopulm': {
    'ACE Inhibitors, ARBs, Aliskiren': 1, 'Calcium Channel Blockers': 1,
    'Primary Hypertension & Hypertensive Emergency': 1,
    'Digoxin': 2, 'Sacubitril-Valsartan, Milrinone, Nesiritide, Ivabradine': 2,
    'Class I A-C Antiarrhythmics': 2, 'Class II Antiarrhythmics': 2, 'Class III Antiarrhythmics': 2,
    'Class IV Antiarrhythmics': 2, 'Class V Antiarrhythmics': 2, 'Nitrates': 2,
    'Statins': 2, 'Cholestyramine & Ezetimibe': 2, 'Fibrates & Niacin': 2,
    'PCSK9 Inhibitors': 2,                                // new — PHARM Anti-Hyperlipidemic Agents (week 2)
    'Prostaglandins, Prostacyclin, Bosentan, PDE5 Inhibitors': 3,
    'Antihistamines': 3, 'Asthma Therapy': 3,
  },
};
/* Excluded from the unit of their system, with where they go instead. */
const UNIT_EXCLUDE = {
  'heme-renal': {
    reason: 'Brody teaches cancer pharmacology in GI, Nutrition & Multisystem (SYST 9500), not Heme/Renal — the same call already made for B&B\'s Cancer Drugs section',
    titles: LIST.filter(r => r.unit === 'Antineoplastics').map(r => r.name),
  },
};

/* ---------------- validate ---------------- */
const cat = JSON.parse(fs.readFileSync(CAT, 'utf8'));
const K = v => v.res + '|' + v.sys + '|' + (v.cat || '') + '|' + v.name;
const problems = [];
const listNames = LIST.map(r => r.name);
if (listNames.length !== new Set(listNames).size) problems.push('the list repeats a title');
LIST.forEach(r => { if (!SYSTEM_OF(r)) problems.push('no system rule for ' + r.unit + ' · ' + r.cat + ' · ' + r.name); });
const existing = cat.videos.filter(v => v.res === 'skpharm');
existing.forEach(v => {
  const r = LIST.find(x => x.name === v.name);
  if (!r) { problems.push('catalog has a Sketchy video that is not on Sketchy\'s list: "' + v.name + '" (correct it in fix_catalog.js)'); return; }
  if (r.cat !== v.cat) problems.push('"' + v.name + '": section ' + v.cat + ' in the catalog, ' + r.cat + ' on the list');
  if (r.min !== v.min) problems.push('"' + v.name + '": ' + v.min + ' min in the catalog, ' + r.min + ' on the list');
  if (SYSTEM_OF(r) !== v.sys) problems.push('"' + v.name + '": the system rule says ' + SYSTEM_OF(r) + ' but it is filed under ' + v.sys + ' — the rule would move it');
});
if (problems.length) { console.error('PROBLEMS:'); problems.forEach(p => console.error('  ' + p)); process.exit(1); }

/* ---------------- catalog: add what is missing, in Sketchy's own order ---------------- */
const have = new Set(existing.map(v => v.name));
const add = LIST.filter(r => !have.has(r.name)).map(r => ({ res: 'skpharm', sys: SYSTEM_OF(r), cat: r.cat, name: r.name, min: r.min }));
if (add.length) {
  let last = -1;
  cat.videos.forEach((v, i) => { if (v.res === 'skpharm') last = i; });
  cat.videos.splice(last + 1, 0, ...add);
  fs.writeFileSync(CAT, JSON.stringify(cat));
  console.log('added ' + add.length + ' Sketchy Pharm videos; catalog now ' + cat.videos.length + ' entries');
} else console.log('catalog already has all ' + LIST.length + ' Sketchy Pharm videos — nothing to add');
const sk = cat.videos.filter(v => v.res === 'skpharm');

/* ---------------- splice weeks / excludes into the two generator-less units ---------------- */
let app = fs.readFileSync(APP, 'utf8');
const NAMES = { 'heme-renal': 'BRODY_HEME_RENAL', 'cardiopulm': 'BRODY_CARDIOPULM' };
Object.entries(NAMES).forEach(([id, cname]) => {
  const m = app.match(new RegExp('\\nconst ' + cname + '=(.*?);\\n'));
  if (!m) { console.error('could not find ' + cname); process.exit(1); }
  const blk = JSON.parse(m[1]);
  const ex = UNIT_EXCLUDE[id];
  const exKeys = ex ? ex.titles.map(t => K(sk.find(v => v.name === t))) : [];
  blk.exclude = (blk.exclude || []).filter(k => !k.startsWith('skpharm|')).concat(exKeys);
  const weeks = UNIT_WEEKS[id];
  // every Sketchy video in this unit's systems must be mapped or excluded — nothing defaults
  sk.filter(v => blk.systems.includes(v.sys)).forEach(v => {
    const k = K(v);
    if (exKeys.includes(k)) { delete blk.videoWeek[k]; return; }
    const w = weeks[v.name];
    if (w == null) { problems.push(id + ': Sketchy "' + v.name + '" (' + v.sys + ') has no week and no exclusion'); return; }
    if (!blk.weeks.some(x => x.n === w)) problems.push(id + ': "' + v.name + '" → week ' + w + ', which this unit does not have');
    blk.videoWeek[k] = w;
  });
  Object.keys(weeks).forEach(t => { const v = sk.find(x => x.name === t); if (!v || !blk.systems.includes(v.sys)) problems.push(id + ': UNIT_WEEKS names "' + t + '", which is not a Sketchy video in this unit\'s systems'); });
  app = app.slice(0, m.index) + '\nconst ' + cname + '=' + JSON.stringify(blk) + ';\n' + app.slice(m.index + m[0].length);
});
if (problems.length) { console.error('PROBLEMS:'); problems.forEach(p => console.error('  ' + p)); process.exit(1); }
fs.writeFileSync(APP, app);

/* ---------------- the law: where does every Sketchy video get watched? ---------------- */
const order = app.match(/const BRODY_BLOCKS=\[([^\]]*)\];/)[1].split(',').map(s => s.trim());
const units = order.map(n => JSON.parse(app.match(new RegExp('\\nconst ' + n + '=(.*?);\\n'))[1]));
const inUnit = (u, v) => (u.systems.includes(v.sys) || (u.include || []).includes(K(v))) && !(u.exclude || []).includes(K(v));
const home = {}, waiting = {}, excluded = [], defaulted = [], distributed = [];
sk.forEach(v => {
  const own = units.find(u => u.systems.includes(v.sys));
  // a system no unit owns can still be homed lecture by lecture (Infectious Disease: data/id-homes.js)
  if (!own && units.some(u => inUnit(u, v))) { distributed.push(v); return; }
  if (!own) { (waiting[v.sys] = waiting[v.sys] || []).push(v); return; }
  if ((own.exclude || []).includes(K(v))) { excluded.push(v); return; }
  if ((own.videoWeek || {})[K(v)] == null) defaulted.push(own.id + ': ' + v.name);
  (home[own.id] = home[own.id] || []).push(v);
});
if (defaulted.length) { console.error('SKETCHY VIDEOS THAT WOULD FALL TO A UNIT\'S LAST WEEK:'); defaulted.forEach(d => console.error('  ' + d)); process.exit(1); }

const h = a => (a.reduce((s, v) => s + v.min, 0) / 60).toFixed(1) + ' h';
console.log('\nSketchy Pharm: ' + sk.length + ' videos, ' + h(sk));
units.forEach(u => {
  const own = home[u.id] || [], pulled = sk.filter(v => !u.systems.includes(v.sys) && inUnit(u, v));
  console.log('  ' + u.name.padEnd(24) + String(own.length).padStart(3) + ' of its systems\' videos' + (pulled.length ? ', + ' + pulled.length + ' pulled in for its lectures' : ''));
});
if (excluded.length) console.log('  excluded from Heme/Renal: ' + excluded.length + ' antineoplastics — ' + UNIT_EXCLUDE['heme-renal'].reason);
if (distributed.length) console.log('  homed lecture by lecture in the units that teach them: ' + distributed.length + ' (' + h(distributed) + ') — see data/id-homes.js');
Object.entries(waiting).forEach(([s, a]) => console.log('  not in any unit yet (' + s + '): ' + a.length + ' (' + h(a) + ') — tools/law-homes.js names where they go'));
