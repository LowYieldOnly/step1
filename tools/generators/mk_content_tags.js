/* Content-type tags — what "Minimal mode" drops.
 *
 * Minimal keeps pathology, pharmacology and clinical material and drops the
 * foundational-science layer: anatomy, histology, embryology, physiology. That needs
 * every video classified, and the catalog has no field for it — `cat` is the
 * publisher's own section name, which sometimes says what a video is and often
 * doesn't.
 *
 * TWO MECHANISMS, because one is not enough:
 *
 *   RULES, where a publisher's whole section is genuinely one kind of thing.
 *   Bootcamp's "Histology — Nervous System" is 32 histology videos and nothing else,
 *   so a rule is both safe and cheap.
 *
 *   PER-ITEM TAGS, where a section is mixed. This is not a nicety. Bootcamp files
 *   "Autonomic System" as 20 videos: five are autonomic physiology and FIFTEEN are
 *   pharmacology — cholinomimetics, sympatholytics, beta blockers. A category rule
 *   there would delete exactly the material Minimal exists to keep. Same in
 *   "Neuromuscular Junction" (physiology + drugs + myasthenia) and "Basal Ganglia"
 *   (anatomy + movement disorders).
 *
 * INCLUSIVE BY DEFAULT. Only what Minimal DROPS is listed here; anything unlisted is
 * core and stays in the plan. That makes the failure direction safe: forgetting to
 * classify a video means a Minimal user still sees it, rather than silently losing
 * material they needed. A study tool should fail towards showing you too much.
 *
 * The classification is editorial and mine. The debatable calls are commented.
 *
 *   node tools/generators/mk_content_tags.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CAT = path.join(REPO, 'catalog.json');
const APP = path.join(REPO, 'index.html');

const TAGS = ['anat', 'hist', 'embryo', 'physio'];

/* Whole sections that are one kind of thing. {res, cat, exact?, tag} — `cat` is a
   prefix unless `exact`. Checked against the catalog below: a rule that matches
   nothing, or a section that turns out to be mixed, is reported. */
const RULES = [
  { res:'bootcamp', cat:'Histology — ',    tag:'hist'  },
  { res:'bootcamp', cat:'Anatomy — ',      tag:'anat'  },
  { res:'bootcamp', cat:'Neuroanatomy — ', tag:'anat'  },
  { res:'bootcamp', cat:'Embryology',                  exact:true, tag:'embryo' },
  { res:'bootcamp', cat:'Brainstem Anatomy',           exact:true, tag:'anat'   },
  { res:'bootcamp', cat:'Ascending Spinal Cord Tracts',exact:true, tag:'anat'   },
  { res:'bootcamp', cat:'Descending Spinal Cord Tracts',exact:true,tag:'anat'   },
  { res:'bootcamp', cat:'Conduction Physiology',       exact:true, tag:'physio' },
  { res:'bootcamp', cat:'Cellular Function',           exact:true, tag:'physio' },
];

/* Per-item, for the mixed sections. [res, sys, cat, name, tag] */
const ITEMS = [
  // ---- Boards & Beyond · Neurology ----
  ['bnb','Neurology','Introduction to Neurology','Cells of the Nervous System','hist'],
  ['bnb','Neurology','Introduction to Neurology','Blood Brain Barrier','physio'],
  ['bnb','Neurology','Introduction to Neurology','Neurotransmitters','physio'],
  ['bnb','Neurology','Introduction to Neurology','Dermatomes and Reflexes','anat'],
  // "Nerve Damage" and "Brain Injury" stay: injury patterns are examined clinically.

  // The whole "Nervous System Structures" section is anatomy — except the syndromes,
  // which are localisation questions and among the most heavily tested material here.
  ['bnb','Neurology','Nervous System Structures','Cerebral Cortex','anat'],
  ['bnb','Neurology','Nervous System Structures','Spinal Cord','anat'],
  ['bnb','Neurology','Nervous System Structures','Brainstem','anat'],
  ['bnb','Neurology','Nervous System Structures','Rules of 4s','anat'],
  ['bnb','Neurology','Nervous System Structures','Cranial Nerves I','anat'],
  ['bnb','Neurology','Nervous System Structures','Cranial Nerves II','anat'],
  ['bnb','Neurology','Nervous System Structures','Auditory System','anat'],
  ['bnb','Neurology','Nervous System Structures','Vestibular System','anat'],
  ['bnb','Neurology','Nervous System Structures','Thalamus, Hypothalamus, Limbic System','anat'],
  ['bnb','Neurology','Nervous System Structures','Cerebellum','anat'],
  ['bnb','Neurology','Nervous System Structures','Basal Ganglia','anat'],
  ['bnb','Neurology','Nervous System Structures','Ventricles and Sinuses','anat'],
  // 'Spinal Cord Syndromes' deliberately kept — Brown-Séquard et al. are clinical.

  ['bnb','Neurology','Autonomic Nervous System','Autonomic Nervous System I','physio'],
  ['bnb','Neurology','Autonomic Nervous System','Autonomic Nervous System II','physio'],
  ['bnb','Neurology','Autonomic Nervous System','Autonomic Receptors','physio'],
  // the four adrenergic/cholinergic drug videos in that section are pharm — kept

  ['bnb','Neurology','Other Neurology Topics','Neuroembryology','embryo'],
  ['bnb','Neurology','Other Neurology Topics','Sleep Physiology','physio'],

  // ---- Boards & Beyond · Ophthalmology ----
  ['bnb','Ophthalmology','General Topics','Eye Anatomy','anat'],
  ['bnb','Ophthalmology','General Topics','The Retina','anat'],
  ['bnb','Ophthalmology','General Topics','Optic Nerve','anat'],
  // 'Lens' stays: it is mostly cataract. Gaze Disorders and Visual Field Defects stay:
  // they are localisation, not anatomy.

  // ---- Bootcamp · the mixed sections ----
  // Autonomic System: the first five are physiology, the other fifteen are drugs.
  ['bootcamp','Neurology','Autonomic System','Autonomic System Overview','physio'],
  ['bootcamp','Neurology','Autonomic System','Autonomic System Signaling','physio'],
  ['bootcamp','Neurology','Autonomic System','Autonomic Secondary Messengers','physio'],
  ['bootcamp','Neurology','Autonomic System','Autonomic System Summary','physio'],
  ['bootcamp','Neurology','Autonomic System','Other Involuntary Signaling Systems','physio'],

  ['bootcamp','Neurology','Basal Ganglia','Anatomical Considerations','anat'],
  ['bootcamp','Neurology','Basal Ganglia','Basal Ganglia Circuits','physio'],
  ['bootcamp','Neurology','Cerebellum and Ventricles','Anatomical Considerations','anat'],

  ['bootcamp','Neurology','Cerebral Cortex','Frontal Lobe','anat'],
  ['bootcamp','Neurology','Cerebral Cortex','Temporal Lobe','anat'],
  ['bootcamp','Neurology','Cerebral Cortex','Parietal Lobe','anat'],
  ['bootcamp','Neurology','Cerebral Cortex','Occipital Lobe','anat'],
  ['bootcamp','Neurology','Cerebral Cortex','Internal Capsule','anat'],

  ['bootcamp','Neurology','Cranial Nerves 1-6','Cranial Nerve I','anat'],
  ['bootcamp','Neurology','Cranial Nerves 1-6','Cranial Nerve II','anat'],
  ['bootcamp','Neurology','Cranial Nerves 1-6','Cranial Nerve III','anat'],
  ['bootcamp','Neurology','Cranial Nerves 1-6','Cranial Nerve IV','anat'],
  ['bootcamp','Neurology','Cranial Nerves 1-6','Cranial Nerve V','anat'],
  ['bootcamp','Neurology','Cranial Nerves 1-6','Cranial Nerve VI','anat'],
  ['bootcamp','Neurology','Cranial Nerves 7-12','Cranial Nerve VII','anat'],
  ['bootcamp','Neurology','Cranial Nerves 7-12','Cranial Nerve VIII','anat'],
  ['bootcamp','Neurology','Cranial Nerves 7-12','Cranial Nerve IX','anat'],
  ['bootcamp','Neurology','Cranial Nerves 7-12','Cranial Nerve X','anat'],
  ['bootcamp','Neurology','Cranial Nerves 7-12','Cranial Nerve XI','anat'],
  ['bootcamp','Neurology','Cranial Nerves 7-12','Cranial Nerve XII','anat'],
  // Cavernous Sinus Thrombosis stays — it is pathology filed under the nerves it hits.

  ['bootcamp','Neurology','Diencephalon','Overview (Hypothalamus, Thalamus, Pineal Gland, Limbic System)','anat'],
  ['bootcamp','Neurology','Diencephalon','Hypothalamic Nuclei','anat'],

  ['bootcamp','Neurology','Neuromuscular Junction','Physiology of NMJ','physio'],
  ['bootcamp','Neurology','Radiculopathy','Spinal Cord Anatomical Considerations','anat'],
  ['bootcamp','Neurology','Radiculopathy','Reflex and Spinal Level','anat'],
  ['bootcamp','Neurology','Spinal Cord Syndromes','Review of Sensory and Motor Tracts','anat'],
  ['bootcamp','Neurology','Vertigo','Vestibular System Anatomy','anat'],
  ['bootcamp','Neurology','Vision','Visual Pathway Overview','anat'],
  ['bootcamp','Neurology','Auditory Sensation','Fundamental Concepts','physio'],
  // Every "... Lesion" video under Vision stays: those are localisation questions.

  // ---- UWorld Library articles ----
  ['uwlib','Neurology','','Histology: Nerve tissue','hist'],
  ['uwlib','Neurology','','Nerve physiology','physio'],
  ['uwlib','Neurology','','Physiology: Membrane potential','physio'],
  ['uwlib','Neurology','','Neuroanatomy: Cortical lobe function, basic tracts, arterial anatomy, and neurolocalization','anat'],
  ['uwlib','Neurology','','Neuroanatomy: Spinal cord','anat'],
  ['uwlib','Neurology','','Embryology of the nervous system (neuroembryology)','embryo'],
  ['uwlib','Neurology','','Autonomic nervous system','physio'],
  ['uwlib','Neurology','','Visual pathway','anat'],
  ['uwlib','Neurology','','Pain signaling and neuroanatomy: Nociceptive pain','physio'],
  // 'Neurotransmitters and related medications' stays — it is half pharmacology.
  // 'Cranial nerves: Anatomy and palsies' stays — the palsies are the examinable half.
];

/* ---------------- validate against the real catalog ---------------- */
const cat = JSON.parse(fs.readFileSync(CAT, 'utf8'));
const K = v => v.res + '|' + v.sys + '|' + (v.cat || '') + '|' + v.name;
const problems = [];

ITEMS.forEach(([res, sys, c, name, tag]) => {
  if (!TAGS.includes(tag)) problems.push('unknown tag "' + tag + '" on ' + name);
  if (!cat.videos.some(v => v.res === res && v.sys === sys && (v.cat || '') === c && v.name === name))
    problems.push('no such catalog item: ' + [res, sys, c, name].join(' | '));
});
const keys = ITEMS.map(a => a[0] + '|' + a[1] + '|' + a[2] + '|' + a[3]);
if (keys.length !== new Set(keys).size)
  problems.push('the same item is tagged twice: ' + keys.filter((k, i) => keys.indexOf(k) !== i).join(', '));

const ruleHit = (v, r) => v.res === r.res && (r.exact ? (v.cat || '') === r.cat : (v.cat || '').startsWith(r.cat));
RULES.forEach(r => {
  const n = cat.videos.filter(v => ruleHit(v, r)).length;
  if (!n) problems.push('rule matches nothing: ' + r.res + ' / ' + r.cat);
  if (!TAGS.includes(r.tag)) problems.push('unknown tag "' + r.tag + '" on rule ' + r.cat);
});
// a per-item tag inside a rule-covered section means one of the two is wrong
const tagOf = {};
ITEMS.forEach(([res, sys, c, name, tag]) => { tagOf[res + '|' + sys + '|' + c + '|' + name] = tag; });
cat.videos.forEach(v => {
  const r = RULES.find(rr => ruleHit(v, rr));
  if (r && tagOf[K(v)]) problems.push('both a rule and a per-item tag cover: ' + K(v));
});

if (problems.length) { console.error('PROBLEMS:'); problems.forEach(p => console.error('  ' + p)); process.exit(1); }

/* ---------------- splice into index.html ---------------- */
let app = fs.readFileSync(APP, 'utf8');
const payload = 'const CONTENT_RULES=' + JSON.stringify(RULES) + ';\n'
  + 'const CONTENT_TAGS=' + JSON.stringify(tagOf) + ';';
const START = '/* @content-tags:start */', END = '/* @content-tags:end */';
const i = app.indexOf(START), j = app.indexOf(END);
if (i < 0 || j < 0) { console.error('markers ' + START + ' … ' + END + ' not found in index.html'); process.exit(1); }
app = app.slice(0, i + START.length) + '\n' + payload + '\n' + app.slice(j);
fs.writeFileSync(APP, app);

/* ---------------- report ---------------- */
const SYS = ['Neurology', 'Psychiatry', 'Ophthalmology'];
const tagFor = v => { const r = RULES.find(rr => ruleHit(v, rr)); return r ? r.tag : (tagOf[K(v)] || null); };
const blockVids = cat.videos.filter(v => SYS.includes(v.sys));
const byTag = {}, byRes = {};
blockVids.forEach(v => {
  const t = tagFor(v);
  byRes[v.res] = byRes[v.res] || { cut: 0, keep: 0, cutMin: 0, keepMin: 0 };
  if (t) { byTag[t] = (byTag[t] || 0) + 1; byRes[v.res].cut++; byRes[v.res].cutMin += v.min; }
  else { byRes[v.res].keep++; byRes[v.res].keepMin += v.min; }
});
const cut = Object.values(byRes).reduce((a, r) => a + r.cut, 0);
const keep = Object.values(byRes).reduce((a, r) => a + r.keep, 0);
const cutMin = Object.values(byRes).reduce((a, r) => a + r.cutMin, 0);
const keepMin = Object.values(byRes).reduce((a, r) => a + r.keepMin, 0);

console.log(RULES.length + ' section rules + ' + ITEMS.length + ' per-item tags spliced into index.html\n');
console.log('Nervous & Sensory under Minimal (everything untagged is kept):');
console.log('  resource     drop    keep     drop h    keep h');
Object.keys(byRes).sort().forEach(r => { const x = byRes[r];
  console.log('  ' + r.padEnd(11) + String(x.cut).padStart(5) + String(x.keep).padStart(8)
    + (x.cutMin / 60).toFixed(1).padStart(10) + (x.keepMin / 60).toFixed(1).padStart(10)); });
console.log('  ' + 'TOTAL'.padEnd(11) + String(cut).padStart(5) + String(keep).padStart(8)
  + (cutMin / 60).toFixed(1).padStart(10) + (keepMin / 60).toFixed(1).padStart(10));
console.log('\n  by type: ' + TAGS.map(t => t + ' ' + (byTag[t] || 0)).join(' · '));
console.log('  Minimal drops ' + Math.round(cut / (cut + keep) * 100) + '% of items and '
  + Math.round(cutMin / (cutMin + keepMin) * 100) + '% of the video hours.');
console.log('\n  Unlisted = kept. A video nobody classified stays in a Minimal plan,');
console.log('  so the mistake this can make is showing too much, never too little.');
