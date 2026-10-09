/* Build uworld.json — the Boards & Beyond → UWorld question-ID map.
 *
 * SOURCE. Eli Tanenbaum's public "Boards and Beyond Videos and UWorld Question IDs"
 * document, maintained by him and a group of contributors and published for exactly
 * this use. It is not ours; the app credits it on screen and links out. This script
 * reads a plain-text export of that document — it is not committed here, because it
 * is a 420 KB third-party file that changes daily and belongs to its maintainers:
 *
 *     pandoc -f docx -t plain --wrap=none "<the doc>.docx" -o qids.txt
 *     node tools/generators/mk_uworld.js qids.txt
 *
 * RECONCILING THE NAMES is the real work. The document names videos as Boards &
 * Beyond named them when each entry was written; the catalog names them as B&B names
 * them now. 370 of 442 entries match once apostrophes and dashes are normalised. The
 * rest are declared below in two kinds:
 *
 *   ALIASES — the same video under a different name ("Endocarditis" is now
 *   "Infective Endocarditis").
 *
 *   SPLITS — B&B has since divided one video into several, so the question set
 *   covers the content of all of them ("Coagulation" is now "Coagulation I" and
 *   "Coagulation II"). Every part gets the whole set. That means a QID can appear
 *   under two videos even though the document de-duplicated, which is why every
 *   copy button in the app de-duplicates what it copies.
 *
 * WHAT IS LEFT UNMAPPED is reported, not hidden. Where the document names a video
 * this catalog has no equivalent for, or where the match would be a guess, the entry
 * is dropped and listed at the end of this script's output for review. Dropping a
 * set loses questions; attaching it to the wrong video sends someone to questions
 * that do not match what they watched. The second is worse, so ambiguity drops.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(REPO, 'uworld.json');
const SRC = process.argv[2];
if (!SRC || !fs.existsSync(SRC)) {
  console.error('usage: node tools/generators/mk_uworld.js <text-export-of-the-doc>');
  console.error('  produce one with:  pandoc -f docx -t plain --wrap=none "<doc>.docx" -o qids.txt');
  process.exit(1);
}

const SOURCE = {
  title: 'Boards and Beyond Videos and UWorld Question IDs',
  author: 'Eli Tanenbaum MD and contributors',
  note: 'Public community document, updated by its maintainers. Question IDs belong to UWorld; '
      + 'this is a mapping to them, not the questions themselves.',
};

/* one doc name → one catalog name */
const ALIASES = {
  // straightforward renames
  'Endocarditis': 'Infective Endocarditis',
  'Acute Leukemia': 'Acute Leukemias',
  'Chronic Leukemia': 'Chronic Leukemias',
  'Antitumor Antibiotics': 'Antitumor Antibiotics and Topoisomerase Drugs',
  'Alkylating Agents': 'Alkylating and Platinum Agents',
  'Complement System': 'The Complement System',
  'Pulmonary Embolism': 'Deep Vein Thrombosis & Pulmonary Embolism',
  'Seronegative Spondylarthritis': 'Seronegative Spondyloarthritis',
  "Sjogren's Syndrome": 'Sjögren Syndrome',
  "Wilson's Disease and Hemochromatosis": 'Wilson Disease and Hemochromatosis',
  'ADHD Autism': 'ADHD and Autism',
  'Sickle Cell Anemia': 'Sickle Cell Disease',
  'Platelet Activation': 'Platelets',
  'Antiplatelet Drugs': 'Antiplatelets',
  'Osteoarthritis': 'Arthritis',
  'Neuromuscular Disorders': 'Neuromuscular Junction Disorders',
  'Basic Statistics': 'Statistics',
  'Positive and Negative Predictive Value': 'Predictive Value',
  'Local Anesthesia': 'Local Anesthetics',
  'Pulmonary Physical Exam': 'Lung Physical Exam',
  'Aortic Dissection': 'Aortic Disease',
  'AVNRT': 'Paroxysmal supraventricular tachycardia',   // AVNRT is the commonest PSVT
  // cerebrovascular, renamed between editions
  'Cerebral and Lacunar Strokes': 'Cerebral Strokes',
  'Vertebrobasilar Stroke Syndromes': 'Vertebral Basilar Stroke Syndromes',
  'CNS Aneurysms': 'Intracranial Aneurysms',
  'Management of TIA/Stroke': 'Treatment of TIA/Stroke',
  // ophthalmology
  'The Lens': 'Lens',
  'Gaze Palsies': 'Gaze Disorders',
  'Visual Fields': 'Visual Field Defects',
  'Structural Eye Disorders': 'Eye Disorders',
  // renal
  'Renal Endocrine Function': 'Renin-Angiotensin-Aldosterone System',
  'Respiratory Disorders': 'Respiratory Acid Base Disorders',
  'Acid Base Problems': 'Acid-Base Principles',
  'Sodium Disorders': 'Hyponatremia',
  'Glomerular Diseases Principles': 'Glomerular Disease Principles',
};

/* one doc name → the several videos B&B now splits it into. Each gets the whole set. */
const SPLITS = {
  'Cardiac Ischemia': ['Cardiac Ischemia I', 'Cardiac Ischemia II'],
  'Antiarrhythmic Drugs': ['Antiarrhythmic Drugs I', 'Antiarrhythmic Drugs II', 'Antiarrhythmic Drugs III'],
  'Hypertension Drugs': ['Antihypertensives I', 'Antihypertensives II'],
  // deliberately NOT 'Diabetes Insipidus', which is an ADH disorder filed under Renal
  'Diabetes': ['Type I Diabetes', 'Type II Diabetes', 'Treatment of Diabetes'],
  'Thyroid Gland': ['Thyroid Anatomy & Physiology', 'Thyroid Hormone Synthesis & Labs'],
  'Thyroid Disorders': ['Hyperthyroidism', 'Hypothyroidism and Thyroiditis', 'Thyroid Cancer'],
  'Adrenal Disorders': ["Cushing's Syndrome", 'Adrenal Insufficiency', 'Hyperaldosteronism',
                        'Adrenal Tumors', 'Congenital Adrenal Hyperplasia'],
  'Endocrine Pancreas': ['Insulin', 'Glucagon & Hypoglycemia'],
  'Pituitary Gland': ['Pituitary Anatomy & Physiology', 'Pituitary Pathology'],
  'Coagulation': ['Coagulation I', 'Coagulation II'],
  'Microcytic Anemias': ['Microcytic Anemias I', 'Microcytic Anemias II'],
  'Thalassemias': ['Alpha Thalassemias', 'Beta Thalassemias'],
  'Bone Tumors': ['Benign Bone Tumors', 'Malignant Bone Tumors'],
  'Cranial Nerves': ['Cranial Nerves I', 'Cranial Nerves II'],
  'Autonomic Nervous System': ['Autonomic Nervous System I', 'Autonomic Nervous System II'],
  'ANS Drugs: Norepinephrine': ['Adrenergic Drugs I', 'Adrenergic Drugs II'],
  'ANS Drugs: Acetylcholine': ['Cholinergic Drugs', 'Cholinergic Toxidromes'],
  'Meningitis': ['Meningitis I', 'Meningitis II'],
  'Delirium and Dementia': ['Delirium', 'Dementia'],
  "Parkinson's, Huntington's, and Movement Disorders": ['Parkinson Disease', 'Movement Disorders'],
  'Brain Tumors': ['Adult Brain Tumors', 'Childhood Brain Tumors'],
  'General Anesthesia': ['Inhaled Anesthetics', 'Intravenous Anesthetics'],
  'Pulmonary Anatomy': ['Pulmonary Anatomy I', 'Pulmonary Anatomy II'],
  'Pulmonary Physiology': ['Pulmonary Physiology I', 'Pulmonary Physiology II'],
  // deliberately NOT 'Fungal Pneumonias', which is an Infectious Disease video
  'Pneumonia': ['Pneumonia I', 'Pneumonia II'],
  'Obstructive Lung Disease': ['COPD', 'Asthma & Bronchiectasis'],
  'Metabolic Acidosis': ['Metabolic Acidosis I', 'Metabolic Acidosis II'],
  'Nephron Physiology': ['Proximal Tubule', 'Loop of Henle and Distal Tubule', 'Collecting Duct'],
  'Electrolyte Disorders': ['Potassium Disorders', 'Calcium, Phosphate and Magnesium'],
};

/* ---------------- parse the export ---------------- */
const lines = fs.readFileSync(SRC, 'utf8').split('\n');
const SEC = /^-   ([IVXLC]+)\.\s*(.*?):\s*$/;
const VID = /^    -   (.*?):\s*$/;
const IDS = /^\s{6,}([0-9,\s]+|none)\s*$/i;
const entries = [];
let sysNow = null, secNow = null, vidNow = null;
lines.forEach(ln => {
  if (!ln.trim()) return;
  let m = ln.match(SEC);
  if (m) { secNow = m[2].trim(); vidNow = null; return; }
  m = ln.match(VID);
  if (m) { vidNow = m[1].trim(); return; }
  m = ln.match(IDS);
  if (m && vidNow) {
    const raw = m[1].trim();
    const ids = /^none$/i.test(raw) ? [] : (raw.match(/\d+/g) || []).map(Number);
    entries.push({ sys: sysNow, sec: secNow, vid: vidNow, ids });
    vidNow = null; return;
  }
  if (!ln.startsWith(' ') && !ln.startsWith('-') && ln.length < 60) {
    sysNow = ln.trim(); secNow = null; vidNow = null;
  }
});
if (entries.length < 300) { console.error('only parsed ' + entries.length + ' entries — the export format has changed'); process.exit(1); }

/* ---------------- resolve against the catalog ---------------- */
const cat = JSON.parse(fs.readFileSync(path.join(REPO, 'catalog.json'), 'utf8'));
const bnb = cat.videos.filter(v => v.res === 'bnb');
const norm = s => s.replace(/[‘’ʼ]/g, "'").replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();
const byNorm = new Map(bnb.map(v => [norm(v.name), v.name]));

const problems = [];
const realName = n => byNorm.get(norm(n)) || null;
/* The document uses curly apostrophes; these tables are written with straight ones.
   Look both up normalised, or a declared alias silently fails to apply and the entry
   is reported unmapped — which is how the first three of these were missed. */
const ALIAS_N = new Map(Object.entries(ALIASES).map(([k, v]) => [norm(k), v]));
const SPLIT_N = new Map(Object.entries(SPLITS).map(([k, v]) => [norm(k), v]));
const usedAlias = new Set(), usedSplit = new Set();
Object.entries(ALIASES).forEach(([from, to]) => {
  if (!realName(to)) problems.push('alias target not in the catalog: "' + from + '" → "' + to + '"');
  if (realName(from)) problems.push('alias source already matches a real video, so it is redundant: "' + from + '"');
});
Object.entries(SPLITS).forEach(([from, tos]) => {
  tos.forEach(t => { if (!realName(t)) problems.push('split target not in the catalog: "' + from + '" → "' + t + '"'); });
  if (realName(from)) problems.push('split source already matches a real video: "' + from + '"');
  if (tos.length < 2) problems.push('split with fewer than two targets: "' + from + '"');
});
if (problems.length) { console.error('PROBLEMS:'); problems.forEach(p => console.error('  ' + p)); process.exit(1); }

const byVideo = {};            // catalog B&B name → question ids
const tree = [];               // the document's own shape, for the browse tab
const unmapped = [];
let sysNode = null, secNode = null;
entries.forEach(e => {
  if (!sysNode || sysNode.sys !== e.sys) { sysNode = { sys: e.sys, secs: [] }; tree.push(sysNode); secNode = null; }
  if (!secNode || secNode.sec !== e.sec) { secNode = { sec: e.sec, vids: [] }; sysNode.secs.push(secNode); }
  let targets = null;
  const direct = realName(e.vid), nv = norm(e.vid);
  if (direct) targets = [direct];
  else if (SPLIT_N.has(nv)) { targets = SPLIT_N.get(nv).map(realName); usedSplit.add(nv); }
  else if (ALIAS_N.has(nv)) { targets = [realName(ALIAS_N.get(nv))]; usedAlias.add(nv); }
  if (targets) targets.forEach(t => {
    const set = byVideo[t] || (byVideo[t] = []);
    e.ids.forEach(id => { if (!set.includes(id)) set.push(id); });
  });
  else if (e.ids.length) unmapped.push(e);
  secNode.vids.push({ n: e.vid, ids: e.ids, to: targets || null });
});

/* A declaration that matched nothing is a mapping that has gone stale — the same
   failure the block generators refuse to write on. */
const staleA = Object.keys(ALIASES).filter(k => !usedAlias.has(norm(k)));
const staleS = Object.keys(SPLITS).filter(k => !usedSplit.has(norm(k)));
if (staleA.length || staleS.length) {
  console.error('DECLARATIONS THAT MATCH NOTHING IN THE DOCUMENT:');
  staleA.forEach(k => console.error('  alias  "' + k + '"'));
  staleS.forEach(k => console.error('  split  "' + k + '"'));
  process.exit(1);
}

const data = { version: 1, source: SOURCE, tree, byVideo };
fs.writeFileSync(OUT, JSON.stringify(data));

/* ---------------- report ---------------- */
const total = entries.length;
const matched = entries.filter(e => realName(e.vid)).length;
const viaAlias = entries.filter(e => !realName(e.vid) && ALIAS_N.has(norm(e.vid))).length;
const viaSplit = entries.filter(e => !realName(e.vid) && SPLIT_N.has(norm(e.vid))).length;
const allIds = new Set(entries.flatMap(e => e.ids));
const mappedIds = new Set(Object.values(byVideo).flat());
console.log('uworld.json written — ' + Math.round(fs.statSync(OUT).size / 1024) + ' KB\n');
console.log('  document entries        ' + String(total).padStart(5));
console.log('    matched by name       ' + String(matched).padStart(5));
console.log('    via a declared alias  ' + String(viaAlias).padStart(5) + '   (' + Object.keys(ALIASES).length + ' declared)');
console.log('    via a declared split  ' + String(viaSplit).padStart(5) + '   (' + Object.keys(SPLITS).length + ' declared)');
console.log('    left unmapped         ' + String(unmapped.length).padStart(5));
console.log('\n  catalog B&B videos with questions  ' + Object.keys(byVideo).length + ' of ' + bnb.length);
console.log('  question ids mapped                ' + mappedIds.size + ' of ' + allIds.size
  + '  (' + Math.round(mappedIds.size / allIds.size * 100) + '%)');
if (unmapped.length) {
  console.log('\n  UNMAPPED — the document has these, this catalog has no video to attach them to.');
  console.log('  Each line loses that many questions. Worth a look if any are a rename I missed:');
  unmapped.forEach(e => console.log('    ' + String(e.ids.length).padStart(3) + ' q  [' + e.sys + ' · ' + e.sec + ']  ' + e.vid));
}
