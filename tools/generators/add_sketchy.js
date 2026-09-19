/* Hand-entered Sketchy Pharm sections.
 *
 * Sketchy has no export and no API, so these were transcribed from screenshots of
 * the library: section, sketch title, runtime. That is the whole provenance — there
 * is nothing to re-sync against, which is why they live here as a declared list
 * rather than as an opaque edit to catalog.json.
 *
 * Idempotent: it adds only what is missing and reports what it did, so it is safe to
 * re-run after adding a section. Existing entries are never rewritten — correcting a
 * title means editing catalog.json, because changing it here would orphan any block
 * mapping that points at the old name.
 *
 *   node tools/generators/add_sketchy.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const FILE = path.join(REPO, 'catalog.json');

/* [system, section, title, minutes] */
const SKETCHES = [
  // ---- cardiovascular (added 2026-08, SYST 9200) ----
  ["Cardiology","Heart Failure Drugs","Digoxin",17],
  ["Cardiology","Heart Failure Drugs","ACE Inhibitors, ARBs, Aliskiren",26],
  ["Cardiology","Heart Failure Drugs","Sacubitril-Valsartan, Milrinone, Nesiritide, Ivabradine",12],
  ["Cardiology","Antihypertensives","Calcium Channel Blockers",21],
  ["Cardiology","Antihypertensives","Primary Hypertension & Hypertensive Emergency",17],
  ["Cardiology","Antiarrhythmics","Class I A-C Antiarrhythmics",24],
  ["Cardiology","Antiarrhythmics","Class II Antiarrhythmics",10],
  ["Cardiology","Antiarrhythmics","Class III Antiarrhythmics",12],
  ["Cardiology","Antiarrhythmics","Class IV Antiarrhythmics",9],
  ["Cardiology","Antiarrhythmics","Class V Antiarrhythmics",13],
  ["Cardiology","Vasoactive","Nitrates",16],
  ["Cardiology","Vasoactive","Prostaglandins, Prostacyclin, Bosentan, PDE5 Inhibitors",16],
  ["Pulmonary","Allergy & Pulmonary","Antihistamines",16],
  ["Pulmonary","Allergy & Pulmonary","Asthma Therapy",22],

  // ---- nervous & sensory (added 2026-09, SYST 9300) ----
  // Anaesthetics sit under Neurology: they are CNS drugs, and this unit has no
  // anaesthesia lecture of its own.
  ["Neurology","Anesthetics & Analgesics","IV Anesthetics",15],
  ["Neurology","Anesthetics & Analgesics","Inhaled Anesthetics & Dantrolene",15],
  ["Neurology","Anesthetics & Analgesics","Local Anesthetics",14],
  ["Psychiatry","Anesthetics & Analgesics","Opioids, Naloxone, Naltrexone",20],

  ["Psychiatry","Antidepressants & Anxiolytics","SSRIs, SNRIs, Cyproheptadine",21],
  ["Psychiatry","Antidepressants & Anxiolytics","Tricyclic Antidepressants",16],
  ["Psychiatry","Antidepressants & Anxiolytics","MAO Inhibitors",13],
  ["Psychiatry","Antidepressants & Anxiolytics","Bupropion, Mirtazapine, Trazodone",15],
  ["Psychiatry","Antidepressants & Anxiolytics","Buspirone",4],

  // Sketchy files lithium with the antiepileptics because so many AEDs double as
  // mood stabilisers. Split by what the drug actually is, so each lands in the
  // system a student would look for it under; the section name is kept either way.
  ["Psychiatry","Mood Stabilizers & Antiepileptic Drugs","Lithium",12],
  ["Neurology","Mood Stabilizers & Antiepileptic Drugs","Broad-Spectrum Antiepileptics",14],
  ["Neurology","Mood Stabilizers & Antiepileptic Drugs","Ethosuximide",6],
  ["Neurology","Mood Stabilizers & Antiepileptic Drugs","Carbamazepine, Oxcarbazepine, Phenytoin, Tiagabine, Vigabatrin",20],
  ["Neurology","Mood Stabilizers & Antiepileptic Drugs","Gabapentin & Pregabalin",3],

  ["Psychiatry","Antipsychotics & Parkinson's","First-Generation Antipsychotics",9],
  ["Psychiatry","Antipsychotics & Parkinson's","Second-Generation Antipsychotics",17],
  ["Neurology","Antipsychotics & Parkinson's","Parkinsonism Drugs",20],

  ["Psychiatry","Psychostimulants: Narcolepsy & ADHD","Narcolepsy Drugs",10],
  ["Psychiatry","Psychostimulants: Narcolepsy & ADHD","Amphetamine, Dexamphetamine, Lisdexamfetamine, Methylphenidate",9],

  ["Psychiatry","Sedative-Hypnotics","Benzodiazepines & Flumazenil",20],
  ["Psychiatry","Sedative-Hypnotics","Nonbenzodiazepine Hypnotics, Melatonin, Ramelteon, Suvorexant",13],
  ["Psychiatry","Sedative-Hypnotics","Barbiturates",14],

  ["Psychiatry","Smoking Cessation Aids","Varenicline",10],
];

/* Three titles were cut off by the library's card width and are reconstructed.
   They are listed here so a wrong guess is visible rather than buried. */
const RECONSTRUCTED = [
  "Carbamazepine, Oxcarbazepine, Phenytoin, Tiagabine, Vigabatrin",
  "Amphetamine, Dexamphetamine, Lisdexamfetamine, Methylphenidate",
  "Nonbenzodiazepine Hypnotics, Melatonin, Ramelteon, Suvorexant",
];

const cat = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const K = v => v.res + '|' + v.sys + '|' + (v.cat || '') + '|' + v.name;
const have = new Set(cat.videos.map(K));

const wanted = SKETCHES.map(([sys, c, name, min]) => ({ res:'skpharm', sys, cat:c, name, min }));
const dup = {};
wanted.forEach(v => { dup[K(v)] = (dup[K(v)] || 0) + 1; });
const repeated = Object.keys(dup).filter(k => dup[k] > 1);
if (repeated.length) { console.error('the same sketch is declared twice:', repeated); process.exit(1); }
const bad = wanted.filter(v => !v.name || !v.cat || !(v.min > 0));
if (bad.length) { console.error('sketch missing a title, section or runtime:', bad); process.exit(1); }

const add = wanted.filter(v => !have.has(K(v)));
if (!add.length) {
  console.log('catalog already has all ' + wanted.length + ' declared sketches — nothing to do');
} else {
  let last = -1;
  cat.videos.forEach((v, i) => { if (v.res === 'skpharm') last = i; });   // keep skpharm contiguous
  cat.videos.splice(last + 1, 0, ...add);
  fs.writeFileSync(FILE, JSON.stringify(cat));
  console.log('added ' + add.length + ' sketches; catalog now ' + cat.videos.length + ' videos');
  add.forEach(v => console.log('   + ' + v.sys + ' · ' + v.cat + ' · ' + v.name + '  (' + v.min + 'm)'));
}

const sk = cat.videos.filter(v => v.res === 'skpharm');
const bySec = {};
sk.forEach(v => { const k = v.sys + ' | ' + v.cat; bySec[k] = bySec[k] || { n:0, m:0 }; bySec[k].n++; bySec[k].m += v.min; });
console.log('\nSketchy Pharm in the catalog: ' + sk.length + ' sketches, ' + Math.round(sk.reduce((a, v) => a + v.min, 0) / 60 * 10) / 10 + ' h');
Object.keys(bySec).sort().forEach(k => console.log('   ' + String(bySec[k].n).padStart(3) + '  ' + k));
console.log('\nTitles reconstructed from a truncated card — check these against the library:');
RECONSTRUCTED.forEach(t => console.log('   ? ' + t));
