/* UWorld Medical Library articles — the written-resource alternative to videos.
 *
 * PROVENANCE. The article titles were supplied by hand from the UWorld library's
 * Neurology section; there is no export and no API, so this declared list is the
 * whole record of where they came from. Titles are kept verbatim, including the
 * publisher's own parentheticals, because the title IS the identity of the item
 * (see itemId in index.html) — editing one orphans anyone's progress on it.
 *
 * NO RUNTIMES. Articles carry min:0, and that zero is deliberate: it is not a
 * fabricated reading time, it is a statement that an article contributes nothing to
 * the app's video-watch-time budget. Articles are paced by COUNT per day on their own
 * budget (brodyArtLoads / brodyArtPace), which is why no reading time is invented here.
 *
 * THE WEEK MAPPING is editorial and mine, not UWorld's. Each article is placed in the
 * Brody week whose lecture topics actually cover it, read off BRODY_NEURO's own
 * lecture list. Judgement calls are commented inline so they can be argued with;
 * "include all, exclude nothing" is the declared policy, so articles UWorld files
 * under Neurology that Brody teaches in another unit (Neuroblastoma, Phenylketonuria,
 * Prader-Willi, Malignant hyperthermia, Low back pain, Syncope, brain death / organ
 * donation) are placed at their best fit rather than dropped.
 *
 * Writes catalog.json (idempotent — adds only what's missing) and splices the artWeek
 * map into BRODY_NEURO in index.html.
 *
 *   node tools/generators/mk_uwlib.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CAT = path.join(REPO, 'catalog.json');
const APP = path.join(REPO, 'index.html');

const SYS = 'Neurology';
const BLOCK = 'neuro-sensory';

/* [article title, Brody week]
   W1 — Neuro Pathology & Psychiatric Pharmacology: trauma, vascular, inflammatory,
        neoplastic, degenerative, nerve/NMJ, seizures, edema & herniation, psych
        pharmacology, mental status changes, movement disorders. Also the
        foundational anatomy/physiology, since week 1 is the intro week.
   W2 — Cerebrovascular Disease, Pain & Substance Use: muscle, toxic-metabolic,
        developmental disease, CNS infections, stimulants, anti-migraine, opioids,
        clinical cerebrovascular disease, peripheral & cranial nerve, headache,
        chronic pain, sleep-wake.
   W3 — The Eye, Neurodevelopment & Review: the eye, ophthalmic drugs, and child
        neurodevelopmental disorders. */
const ARTICLES = [
  // ---- foundations (week 1 is the intro week) ----
  ['Histology: Nerve tissue', 1],
  ['Nerve physiology', 1],
  ['Physiology: Membrane potential', 1],
  ['Neuroanatomy: Cortical lobe function, basic tracts, arterial anatomy, and neurolocalization', 1],
  ['Neuroanatomy: Spinal cord', 1],
  ['Embryology of the nervous system (neuroembryology)', 1],
  ['Neurotransmitters and related medications', 1],
  ['Autonomic nervous system', 1],
  ['Horner syndrome', 1],              // autonomic, not a cranial-nerve palsy

  // ---- trauma (W1 "Intro / Trauma") ----
  ['Concussion and traumatic brain injury', 1],
  ['Subdural and epidural hematomas', 1],   // traumatic, so trauma rather than the W2 stroke cluster
  ['Caput succedaneum, cephalohematoma, and subgaleal hemorrhage', 1],
  ['Intraventricular hemorrhage', 1],       // neonatal IVH sits with the other birth lesions
  ['Brain herniation syndromes', 1],
  ['Idiopathic intracranial hypertension (pseudotumor cerebri)', 1],   // W1 covers edema & raised ICP
  ['Brain death', 1],
  ['Deceased organ donation: Evaluation and management of donors', 1], // follows brain death
  ['Evaluation of patient falls', 1],

  // ---- neoplastic (W1) ----
  ['Brain tumor overview', 1],
  ['Brain tumors in adults', 1],
  ['Pediatric brain tumors', 1],
  ['Neuroblastoma', 1],                // Brody teaches this in Onc; placed with the other tumours

  // ---- inflammatory / demyelinating (W1) ----
  ['Multiple sclerosis', 1],
  ['Transverse myelitis', 1],
  ['Autoimmune encephalitis', 1],      // autoimmune, so W1 inflammatory, not W2 infections

  // ---- degenerative & dementia (W1, with the neurodegenerative drugs) ----
  ['Alzheimer disease', 1],
  ['Vascular dementia', 1],
  ['Frontotemporal dementia', 1],
  ['Dementia with Lewy bodies', 1],
  ['Creutzfeldt-Jakob disease (CJD)', 1],
  ['Normal pressure hydrocephalus (NPH)', 1],   // a reversible dementia, so with the dementias
  ['Mild cognitive impairment', 1],
  ['Memory function and disorders', 1],
  ['Huntington disease', 1],
  ['Parkinson disease and parkinsonism', 1],
  ['Friedreich ataxia', 1],
  ['Amyotrophic lateral sclerosis (ALS) (Lou Gehrig disease)', 1],
  ['Spinal muscle atrophy (SMA)', 1],  // anterior-horn disease, so with ALS rather than the muscle week
  ['Charcot-Marie-Tooth disease', 1],  // hereditary neuropathy — W1 nerve pathology
  ['Wilson disease', 2],               // hepatolenticular: W2 toxic-metabolic

  // ---- movement disorders (W1) ----
  ['Essential tremor (and other types of tremor)', 1],
  ['Dystonia', 1],

  // ---- nerve & neuromuscular junction (W1) ----
  ['Myasthenia gravis', 1],
  ['Guillain-Barré syndrome', 1],      // acute inflammatory polyneuropathy
  ['Botulism', 1],
  ['Tetanus', 1],                      // toxin at the NMJ / inhibitory interneurons, so with botulism

  // ---- seizures (W1) ----
  ['Epilepsy/seizures', 1],
  ['Febrile seizure', 1],
  ['Syncope', 1],                      // the transient-LOC differential against seizure

  // ---- psychiatric pharmacology & psych (W1) ----
  ['Neuroleptic malignant syndrome', 1],
  ['Delirium', 1],
  ['Functional neurologic symptom disorder', 1],   // W1 somatic symptom & related disorders

  // ---- muscle (W2) ----
  ['Duchenne and Becker muscular dystrophy', 2],
  ['Myotonic dystrophy', 2],
  ['Malignant hyperthermia', 2],       // skeletal-muscle channelopathy; Brody teaches it in anesthesia

  // ---- toxic / metabolic / nutritional (W2) ----
  ['Phenylketonuria', 2],
  ['Perinatal asphyxia and hypoxic ischemic encephalopathy', 2],
  ['Fetal alcohol syndrome', 2],

  // ---- developmental disease & neurocutaneous (W2) ----
  ['Neural tube defects', 2],
  ['Chiari malformations', 2],
  ['Syringomyelia', 2],                // classically with Chiari
  ['Hydrocephalus in children', 2],
  ['Craniosynostosis', 2],
  ['Cerebral palsy', 2],
  ['Neurofibromatosis type 1', 2],
  ['NF2-related schwannomatosis (formerly neurofibromatosis type 2)', 2],
  ['Tuberous sclerosis complex', 2],
  ['Sturge-Weber syndrome', 2],
  ['Ataxia-telangiectasia', 2],        // grouped with the other phakomatoses

  // ---- CNS infections (W2) ----
  ['Bacterial meningitis (age >1 month)', 2],
  ['Neisseria meningitidis (meningococcal meningitis)', 2],
  ['Viral meningitis', 2],
  ['Encephalitis', 2],
  ['Japanese encephalitis', 2],
  ['West Nile virus', 2],
  ['Brain abscess', 2],
  ['HIV-associated neurocognitive disorders', 2],

  // ---- cerebrovascular disease (W2 — the week is named for it) ----
  ['Stroke', 2],
  ['Subarachnoid hemorrhage', 2],
  ['Carotid artery stenosis', 2],
  ['Cervical artery dissection: Carotid and vertebral artery dissection', 2],
  ['Fibrinolytic therapy', 2],

  // ---- peripheral & cranial nerve (W2) ----
  ['Cranial nerves: Anatomy and palsies', 2],
  ['Facial palsy', 2],
  ['Trigeminal neuralgia', 2],
  ['Brachial plexus injuries', 2],
  ['Meralgia paresthetica', 2],
  ['Diabetic neuropathy', 2],
  ['Cauda equina syndrome', 2],
  ['Spinal cord compression', 2],
  ['Vertigo', 2],
  ['Ménière disease', 2],

  // ---- headache (W2, with the anti-migraine drugs) ----
  ['Migraine headache', 2],
  ['Tension headache', 2],
  ['Cluster headache', 2],
  ['Cyclic vomiting syndrome', 2],     // migraine-spectrum

  // ---- pain & opioids (W2) ----
  ['Pain signaling and neuroanatomy: Nociceptive pain', 2],
  ['Pain signaling and neuroanatomy: Neuropathic, nociplastic, and chronic pain', 2],
  ['Opioids', 2],
  ['Opioid overdose/intoxication', 2],
  ['Low back pain', 2],                // W2 chronic pain

  // ---- sleep-wake (W2) ----
  ['Restless leg syndrome (RLS)', 2],

  // ---- the eye (W3) ----
  ['Visual pathway', 3],

  // ---- child neurodevelopment (W3) ----
  ['Autism spectrum disorder', 3],
  ['Pediatric developmental milestones', 3],
  ['Rett syndrome', 3],
  ['Fragile X syndrome', 3],
  ['Prader-Willi syndrome and Angelman syndrome', 3],
];

/* ---------------- validate before touching anything ---------------- */
const problems = [];
const names = ARTICLES.map(a => a[0]);
if (names.length !== new Set(names).size)
  problems.push('the same article is declared twice: ' + names.filter((n, i) => names.indexOf(n) !== i).join(', '));
ARTICLES.forEach(([n, w]) => {
  if (!n || typeof n !== 'string') problems.push('an article has no title');
  if (![1, 2, 3].includes(w)) problems.push('"' + n + '" is mapped to week ' + w + ', which this block does not have');
});
if (problems.length) { console.error('PROBLEMS:'); problems.forEach(p => console.error('  ' + p)); process.exit(1); }

/* ---------------- catalog ---------------- */
const cat = JSON.parse(fs.readFileSync(CAT, 'utf8'));
const K = v => v.res + '|' + v.sys + '|' + (v.cat || '') + '|' + v.name;
const have = new Set(cat.videos.map(K));
// cat is deliberately empty: UWorld's library has no sub-sections inside Neurology,
// and inventing them would put a grouping in the UI that the publisher doesn't have.
const wanted = names.map(name => ({ res: 'uwlib', sys: SYS, cat: '', name, min: 0 }));
const add = wanted.filter(v => !have.has(K(v)));

if (!add.length) {
  console.log('catalog already has all ' + wanted.length + ' articles — nothing to add');
} else {
  let last = -1;
  cat.videos.forEach((v, i) => { if (v.res === 'uwlib') last = i; });
  if (last < 0) last = cat.videos.length - 1;          // first run: append in one contiguous run
  cat.videos.splice(last + 1, 0, ...add);
  fs.writeFileSync(CAT, JSON.stringify(cat));
  console.log('added ' + add.length + ' articles; catalog now ' + cat.videos.length + ' entries');
}
const arts = cat.videos.filter(v => v.res === 'uwlib');
if (arts.some(v => v.min !== 0)) { console.error('an article has a non-zero runtime'); process.exit(1); }

/* ---------------- artWeek map, spliced into BRODY_NEURO ---------------- */
const artWeek = {};
ARTICLES.forEach(([name, w]) => { artWeek['uwlib|' + SYS + '||' + name] = w; });

let app = fs.readFileSync(APP, 'utf8');
const m = app.match(/const BRODY_NEURO=([\s\S]*?);\nconst BRODY_BLOCKS/);
if (!m) { console.error('could not find BRODY_NEURO in index.html'); process.exit(1); }
const blk = JSON.parse(m[1]);
if (blk.id !== BLOCK) { console.error('BRODY_NEURO is not ' + BLOCK); process.exit(1); }
blk.artWeek = artWeek;
const rebuilt = 'const BRODY_NEURO=' + JSON.stringify(blk) + ';\nconst BRODY_BLOCKS';
app = app.slice(0, m.index) + rebuilt + app.slice(m.index + m[0].length);
fs.writeFileSync(APP, app);

/* ---------------- report ---------------- */
const byWk = { 1: 0, 2: 0, 3: 0 };
ARTICLES.forEach(([, w]) => byWk[w]++);
console.log('\nUWorld library articles in the catalog: ' + arts.length + ' (' + SYS + ')');
console.log('artWeek spliced into ' + BLOCK + ': ' + Object.keys(artWeek).length + ' keys');
blk.weeks.forEach(w => console.log('   week ' + w.n + '  ' + String(byWk[w.n]).padStart(3) + '  ' + w.label));
console.log('\n  Articles carry no runtime by design — they are paced by count per day,');
console.log('  not by hours, so they add nothing to the video watch-time budget.');
console.log('\n  The week mapping is editorial. Judgement calls worth a second opinion:');
[['Neuroblastoma','W1 with the other brain tumours; Brody teaches it in Onc'],
 ['Phenylketonuria','W2 toxic-metabolic'],
 ['Malignant hyperthermia','W2 muscle; Brody teaches it in anesthesia'],
 ['Low back pain','W2 chronic pain'],
 ['Syncope','W1, as the transient-LOC differential against seizure'],
 ['Brain death / organ donation','W1 with trauma and mental-status changes'],
 ['Prader-Willi / Angelman, Fragile X, Rett','W3 child neurodevelopment'],
 ['Spinal muscle atrophy','W1 with ALS (anterior horn), not W2 muscle'],
 ['Tetanus','W1 with botulism (NMJ toxin), not W2 CNS infections'],
 ['Ménière disease / Vertigo','W2 cranial nerve — the block has no dedicated ear lecture'],
].forEach(([a, b]) => console.log('   · ' + a + ' → ' + b));
