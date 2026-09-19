/* Build the Nervous & Sensory Brody block (SYST 9300, Term 3 weeks 9-11).
 *
 * Same discipline as the other block builders: the week/lecture data is transcribed
 * from the printed course calendar, the video mapping is assigned by hand, and then
 * the script CHECKS the result against the live catalog — every mapping key must hit
 * a real video, every video in the block must be mapped, and every mapping must
 * still match something. It prints the block on stdout and refuses to print anything
 * if the mapping has drifted.
 *
 *   node tools/generators/mk_neuro.js > block.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const cat = JSON.parse(fs.readFileSync(path.join(REPO, 'catalog.json'), 'utf8'));
const K = v => v.res + '|' + v.sys + '|' + (v.cat || '') + '|' + v.name;

const SYS = ["Neurology", "Psychiatry", "Ophthalmology"];

/* ---- weeks, straight off the printed calendar (Term 3 wk 9-11) ---- */
const weeks = [
{n:1,start:"2026-09-21",label:"Neuro Pathology & Psychiatric Pharmacology",lectures:[
 {disc:"Path · N/S",title:"Intro / Trauma"},
 {disc:"Path · N/S",title:"Vascular"},
 {disc:"Path · N/S",title:"Inflammatory"},
 {disc:"Path · N/S",title:"Neoplastic"},
 {disc:"Path · N/S",title:"Degenerative"},
 {disc:"Path · N/S",title:"Nerve, Neuromuscular Junction"},
 {disc:"Path · N/S",title:"Seizure Etiology; Edema & Herniation"},
 {disc:"Pharm",title:"Anti-Depressants"},
 {disc:"Pharm",title:"Sedatives / Hypnotics"},
 {disc:"Pharm",title:"Anti-Psychotics / Bipolar Drugs"},
 {disc:"Pharm",title:"Anxiolytics / Epilepsy Drugs"},
 {disc:"Pharm",title:"Pharmacology of Movement Disorders"},
 {disc:"Pharm",title:"Neurodegenerative Drugs"},
 {disc:"Clin App",title:"Mental Status Changes"},
 {disc:"Clin App",title:"Seizures"},
 {disc:"Clin App",title:"Movement Disorders"},
 {disc:"Psych",title:"Somatic Symptom and Related Disorders and Malingering"},
 {disc:"Psych",title:"Child & Adolescent Psychiatry: Evaluation & Assessment"},
 {disc:"Psych",title:"Child & Adolescent Psychiatry: ADHD, ODD, CD"},
 {disc:"Ethics",title:"SDOH II (Socioeconomic status)"},
 {disc:"FOD",title:"Grief and Depression — lecture and patient interview"}]},
{n:2,start:"2026-09-28",label:"Cerebrovascular Disease, Pain & Substance Use",lectures:[
 {disc:"Path · N/S",title:"Muscle"},
 {disc:"Path · N/S",title:"Toxic-Metabolic-Nutritional"},
 {disc:"Path · N/S",title:"Developmental Disease"},
 {disc:"Path · N/S",title:"Central Nervous System Infections"},
 {disc:"Pharm",title:"ADHD Drugs / Stimulants"},
 {disc:"Pharm",title:"Anti-migraine Drugs"},
 {disc:"Pharm",title:"Opioids (1 of 2)"},
 {disc:"Pharm",title:"Opioids (2 of 2)"},
 {disc:"Clin App",title:"Cerebrovascular Disease 1"},
 {disc:"Clin App",title:"Cerebrovascular Disease 2"},
 {disc:"Clin App",title:"Peripheral & Cranial Nerve Disorders"},
 {disc:"Clin App",title:"Headache"},
 {disc:"Psych",title:"Chronic Pain"},
 {disc:"Psych",title:"Sleep-Wake Disorders"},
 {disc:"Psych",title:"Child & Adolescent Psychiatry: Mood & Anxiety Disorders"},
 {disc:"Ethics",title:"SDOH III (Work & occupation)"},
 {disc:"Exam",title:"NBME Comprehensive Basic Science Exam (CBSE) — Fri 10-02"}]},
{n:3,start:"2026-10-05",label:"The Eye, Neurodevelopment & Review",lectures:[
 {disc:"Path · N/S",title:"Eye (1 of 2)"},
 {disc:"Path · N/S",title:"Eye (2 of 2)"},
 {disc:"Path · N/S",title:"Laboratory"},
 {disc:"Pharm",title:"Ophthalmic Drugs"},
 {disc:"Psych",title:"Child & Adolescent Psychiatry: Neurodevelopmental Disorders"},
 {disc:"Psych",title:"Child & Adolescent Psychiatry: Trauma- and Stressor-Related Disorders; Feeding & Eating Disorders"},
 {disc:"Ethics",title:"SDOH IV (Environment)"},
 {disc:"FOD",title:"Biostats Review"}]},
];

/* ---- per-video week assignments ---- */
// Pathoma chapter 17 — CNS pathology, tracking the PATH 49-59 sequence.
const pathoma = {
 "17.1 Developmental Anomalies":2,   // PATH 58 Developmental Disease
 "17.2 Spinal Cord Lesions":1,
 "17.3 Meningitis":2,                // PATH 59 CNS Infections
 "17.4 Cerebrovascular Disease":1,   // PATH 50 Vascular
 "17.5 Trauma":1,                    // PATH 49 Intro / Trauma
 "17.6 Demyelinating Disorders":1,   // PATH 51 Inflammatory
 "17.7 Dementia and Degenerative Disorders":1, // PATH 53 Degenerative
 "17.8 CNS Tumors":1,                // PATH 52 Neoplastic
};
// Boards & Beyond, by video name within the block's systems.
const bnb = {
 // Neurology — the anatomy and physiology foundation opens the block
 "Cells of the Nervous System":1,"Nerve Damage":1,"Blood Brain Barrier":1,
 "Neurotransmitters":1,"Dermatomes and Reflexes":1,"Brain Injury":1,
 "Cerebral Cortex":1,"Spinal Cord":1,"Spinal Cord Syndromes":1,"Brainstem":1,
 "Rules of 4s":1,"Thalamus, Hypothalamus, Limbic System":1,"Cerebellum":1,
 "Basal Ganglia":1,"Ventricles and Sinuses":1,"Neuroembryology":1,
 "Autonomic Nervous System I":1,"Autonomic Nervous System II":1,"Autonomic Receptors":1,
 "Adrenergic Drugs I":1,"Adrenergic Drugs II":1,"Cholinergic Drugs":1,"Cholinergic Toxidromes":1,
 "Seizures":1,"Anticonvulsants I":1,"Anticonvulsants II":1,
 "Delirium":1,"Dementia":1,"Demyelinating Disease":1,"Multiple Sclerosis":1,
 "Adult Brain Tumors":1,"Childhood Brain Tumors":1,
 "Parkinson Disease":1,"Movement Disorders":1,"Neuromuscular Junction Disorders":1,
 "Herniation Syndromes":1,                                   // PATH 55 Edema & Herniation
 // week 2 — the cerebrovascular, cranial-nerve and pain half
 "Cranial Nerves I":2,"Cranial Nerves II":2,"Auditory System":2,"Vestibular System":2,
 "Cerebral Strokes":2,"Vertebral Basilar Stroke Syndromes":2,
 "Intracranial Aneurysms":2,"Intracranial Bleeding":2,"Treatment of TIA/Stroke":2,
 "Meningitis I":2,"Meningitis II":2,"Headaches":2,
 "Sleep Physiology":2,"Sleep Disorders":2,
 // Ophthalmology — the whole system lands with the week-3 eye lectures
 "Eye Anatomy":3,"Eye Disorders":3,"Lens":3,"Glaucoma":3,"The Retina":3,
 "Retinal Disorders I":3,"Retinal Disorders II":3,"Optic Nerve":3,
 "Gaze Disorders":3,"Visual Field Defects":3,
 // Psychiatry — psych pharm and most pathology sit in week 1 with PHARM 20-23
 "Conditioning and Transference":1,"Ego Defenses":1,
 "Childhood Disorders":1,"ADHD and Autism":1,"Cognitive Disorders":1,
 "Psychosis":1,"Psychotic Disorders":1,"Dissociative Disorders":1,
 "Somatic and Factitious Disorders":1,"Personality Disorders":1,
 "Mood Disorders":1,"Anxiety Disorders":1,
 "Antidepressants":1,"Lithium":1,"Antipsychotics":1,
 "Alcohol and CNS Depressants":1,                            // PHARM 21 Sedatives / Hypnotics
 "Opioids":2,"Stimulants":2,"Other Drugs":2,                 // PHARM 26, 28, 29
 "Child Abuse and Neglect":3,"Eating Disorders":3,           // Psych 27
};
// Bootcamp maps by section — it runs to hundreds of videos per unit.
const bcWeek = {
 "Neurology|Embryology":1,"Neurology|Cellular Function":1,
 "Neurology|Ascending Spinal Cord Tracts":1,"Neurology|Descending Spinal Cord Tracts":1,
 "Neurology|Brainstem Anatomy":1,"Neurology|Cerebral Cortex":1,
 "Neurology|Spinal Cord Syndromes":1,"Neurology|Invasive Spinal Cord Disease":1,
 "Neurology|Demyelinating Disease":1,"Neurology|Conduction Physiology":1,
 "Neurology|Neuromuscular Junction":1,"Neurology|Pediatric Brain Tumors":1,
 "Neurology|Adult Primary Brain Tumors":1,"Neurology|Cerebellum and Ventricles":1,
 "Neurology|Diencephalon":1,"Neurology|Basal Ganglia":1,
 "Neurology|Neurotransmitter Activity in Psychiatric Disease":1,
 "Neurology|Dementia":1,"Neurology|Seizures":1,"Neurology|Traumatic Brain Injuries":1,
 "Neurology|Autonomic System":1,
 "Neurology|Anatomy — Spinal Cord":1,
 "Neurology|Neuroanatomy — Cerebral Cortex":1,"Neurology|Neuroanatomy — Diencephalon":1,
 "Neurology|Neuroanatomy — Basal Ganglia":1,"Neurology|Neuroanatomy — Subcortical White Matter":1,
 "Neurology|Neuroanatomy — Superficial Brainstem":1,"Neurology|Neuroanatomy — Cerebellum":1,
 "Neurology|Neuroanatomy — Spinal Cord Tracts":1,"Neurology|Neuroanatomy — Brain Ventricles":1,
 "Neurology|Neuroanatomy — Meninges, Dural Folds, & Venous Sinuses":1,
 "Neurology|Histology — Nervous System":1,
 "Neurology|Radiculopathy":2,"Neurology|Cranial Nerves 1-6":2,"Neurology|Cranial Nerves 7-12":2,
 "Neurology|Auditory Sensation":2,"Neurology|Vertigo":2,
 "Neurology|Ischemic Cerebrovascular Accidents":2,
 "Neurology|Aneurysms and Intracranial Hemorrhage":2,
 "Neurology|Headache":2,"Neurology|Side Effects and Toxins":2,
 "Neurology|Anatomy — Ear":2,"Neurology|Neuroanatomy — Cranial Nerves":2,
 "Neurology|Neuroanatomy — Cerebral Vasculature":2,
 "Neurology|Neuroanatomy — Radiology - Neuroradiology & Angiography":2,
 "Neurology|Histology — Ears":2,
 "Neurology|Vision":3,
 // General principles that Bootcamp files under Neurology but that this unit never
 // lectures — pharmacokinetics is not a week-1 N/S topic. Parking them in the last
 // week keeps them available as review without crowding the week the student is
 // actually being examined on.
 "Neurology|Inflammatory Response":3,"Neurology|Cellular Injury & Neoplasia":3,
 "Neurology|Pharmacodynamics":3,"Neurology|Pharmacokinetics":3,
 "Psychiatry|Psychology":1,"Psychiatry|Developmental Disorders":1,
 "Psychiatry|Memory, Dissociation, and Orientation":1,
 "Psychiatry|Anxiety, Trauma, and Stress Disorders":1,
 "Psychiatry|Personality Disorders":1,"Psychiatry|Psychotic and Mood Disorders":1,
 "Psychiatry|Pharmacology":1,
 "Psychiatry|Sleep and Psychosomatic Conditions":2,"Psychiatry|Substance Misuse":2,
 "Ophthalmology|Anatomy — Orbit":3,"Ophthalmology|Histology — Eyes":3,
};
// Threaded in from outside the block's systems: the developmental-milestones video
// that backs the Child & Adolescent Psychiatry evaluation lecture.
const include = {
 "bnb|Behavioral Science|General Topics|Pediatrics":1,
};
const exclude = [];

/* ---- resolve against the catalog, refusing to guess ---- */
const inBlock = cat.videos.filter(v => SYS.indexOf(v.sys) >= 0);
const videoWeek = {}, missed = [];
const used = { pathoma:new Set(), bnb:new Set() };
inBlock.forEach(v => {
  let w = null;
  if (v.res === 'pathoma') { w = pathoma[v.name]; if (w) used.pathoma.add(v.name); }
  else if (v.res === 'bnb') { w = bnb[v.name]; if (w) used.bnb.add(v.name); }
  else if (v.res === 'bootcamp') {
    if (bcWeek[v.sys + '|' + (v.cat || '')] != null) return;   // covered by the section map
    missed.push(K(v)); return;
  } else { missed.push(K(v)); return; }
  if (w == null) { missed.push(K(v)); return; }
  videoWeek[K(v)] = w;
});
Object.keys(include).forEach(k => {
  if (!cat.videos.some(v => K(v) === k)) { console.error('include key is not in the catalog: ' + k); process.exit(1); }
  videoWeek[k] = include[k];
});

const staleP = Object.keys(pathoma).filter(n => !used.pathoma.has(n));
const staleB = Object.keys(bnb).filter(n => !used.bnb.has(n));
const bcCats = new Set(inBlock.filter(v => v.res === 'bootcamp').map(v => v.sys + '|' + (v.cat || '')));
const staleC = Object.keys(bcWeek).filter(k => !bcCats.has(k));
if (missed.length) {
  console.error('VIDEOS WITH NO WEEK (' + missed.length + '):');
  missed.forEach(m => console.error('  ' + m));
  process.exit(1);
}
if (staleP.length || staleB.length || staleC.length) {
  console.error('MAPPINGS THAT MATCH NOTHING:', [].concat(staleP, staleB, staleC));
  process.exit(1);
}
const weekNums = new Set(weeks.map(w => w.n));
const badWeek = Object.entries(videoWeek).filter(([, w]) => !weekNums.has(w));
if (badWeek.length) { console.error('MAPPINGS POINTING AT A WEEK THAT DOES NOT EXIST:', badWeek); process.exit(1); }

const blk = { id:"neuro-sensory", name:"Nervous & Sensory", systems:SYS, weeks,
  shelf:"2026-10-08", checkpoints:["2026-09-25","2026-10-02"],
  videoWeek, exclude, include:Object.keys(include), bcWeek };

/* ---- report the shape of what was built ---- */
const weekOf = v => {
  const k = K(v);
  if (videoWeek[k] != null) return videoWeek[k];
  if (v.res === 'bootcamp' && bcWeek[v.sys + '|' + (v.cat || '')] != null) return bcWeek[v.sys + '|' + (v.cat || '')];
  return weeks.length;
};
const all = inBlock.concat(Object.keys(include).map(k => cat.videos.find(v => K(v) === k)));
const tally = {};
all.forEach(v => { const w = weekOf(v); (tally[w] = tally[w] || { n:0, m:0 }).n++; tally[w].m += v.min; });
weeks.forEach(w => {
  const t = tally[w.n] || { n:0, m:0 };
  console.error('week ' + w.n + ' (' + w.start + '): ' + t.n + ' videos, ' + (Math.round(t.m / 6) / 10) + ' h  ·  ' + w.lectures.length + ' lectures');
});
console.error('total: ' + all.length + ' videos, ' + (Math.round(all.reduce((a, v) => a + v.min, 0) / 6) / 10) + ' h');
console.error('checks: every video mapped, every mapping resolves, no mapping points at a missing week');
process.stdout.write('const BRODY_NEURO=' + JSON.stringify(blk) + ';\n');
