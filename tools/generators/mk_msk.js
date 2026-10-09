/* Build the Musculoskeletal & Skin Brody block (SYST 9400, Term 3 weeks 13-15).
 *
 * Same discipline as the other block builders: the week/lecture data is transcribed
 * from the printed course calendar, the video mapping is assigned by hand, and the
 * script then CHECKS the result against the live catalog — every mapping key must
 * hit a real video, every video in the block must be mapped, and every mapping must
 * still match something. It refuses to write if any of that has drifted.
 *
 * TWO THINGS ABOUT THIS UNIT ARE UNLIKE THE OTHERS.
 *
 * 1. Infectious Disease is touched, not taught. Week 3 carries five ID lectures
 *    (clinical diagnosis, zoonotics, granulomatous disease, the immunocompromised
 *    host, fever of unknown origin), but the Infectious Disease system in the
 *    catalog is 466 videos / 83 h — the whole microbiology course. Making it a
 *    system would have doubled the unit to ~156 h, about 8.7 h/day, for five
 *    lectures. So those five are served by a targeted `include` instead. Same for
 *    anaesthesia (two PHARM lectures), the psychiatry thread, and the two general
 *    pathology lectures.
 *
 * 2. There is no anatomy lecture, and Bootcamp's MSK course is 192 anatomy videos
 *    plus 44 histology — over half of it. No week "owns" that material, so its
 *    placement is a balancing decision rather than a curricular one, and it is
 *    marked as such below. Minimal mode drops all of it (the existing
 *    Histology — / Anatomy — rules in mk_content_tags.js already classify it), so
 *    this only affects Comprehensive plans.
 *
 *   node tools/generators/mk_msk.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const APP = path.join(REPO, 'index.html');
const cat = JSON.parse(fs.readFileSync(path.join(REPO, 'catalog.json'), 'utf8'));
const K = v => v.res + '|' + v.sys + '|' + (v.cat || '') + '|' + v.name;

const SYS = ["Musculoskeletal", "Dermatology"];

/* ---- weeks, straight off the printed calendar (Term 3 wk 13-15) ----
   47 lectures. PATH 72 and Psych 32-33 do not exist anywhere in the term — gaps in
   the course's own numbering, not omissions here. */
const weeks = [
{n:1,start:"2026-10-19",label:"Skin, Dermatopathology & Anaesthesia",lectures:[
 {disc:"Path · Skin",title:"Dermatopathology: Benign (1 of 2)"},
 {disc:"Path · Skin",title:"Dermatopathology: Benign (2 of 2)"},
 {disc:"Path · Skin",title:"Dermatopathology: Neoplastic"},
 {disc:"Path · MSK/Skin",title:"Soft Tissue: Neoplastic"},
 {disc:"Pharm",title:"General Anesthesia 1"},
 {disc:"Pharm",title:"Local Anesthetics"},
 {disc:"Clin App",title:"Derm Lesions"},
 {disc:"Clin App",title:"Common Skin Disorders"},
 {disc:"Clin App",title:"Skin Infections"},
 {disc:"Clin App",title:"Skin Signs of Internal Disorders"},
 {disc:"Clin App",title:"Skin Trauma"},
 {disc:"Clin App",title:"Derm Emergencies"},
 {disc:"Psych",title:"Flipped Classroom. Personality Disorders"},
 {disc:"Psych",title:"Medical Disorders Presenting as Psychiatric Disorders"},
 {disc:"Psych",title:"Introduction to Psychotherapy"},
 {disc:"Ethics",title:"SDOH V (Disability Access)"},
]},
{n:2,start:"2026-10-26",label:"Bone, Joint & Muscle Pathology",lectures:[
 {disc:"Path · MSK",title:"Skeletal Muscle & Systemic Inflammatory"},
 {disc:"Path · MSK",title:"Joints"},
 {disc:"Path · MSK",title:"Bone: Non-Neoplastic (1 of 2)"},
 {disc:"Path · MSK",title:"Bone: Non-Neoplastic (2 of 2)"},
 {disc:"Path · MSK",title:"Bone: Neoplastic"},
 {disc:"Pharm",title:"Management of Rheumatoid Arthritis"},
 {disc:"Pharm",title:"Anti-gout Drugs and Dermatologic Drugs (1 of 2)"},
 {disc:"Pharm",title:"Anti-gout Drugs and Dermatologic Drugs (2 of 2)"},
 {disc:"Clin App",title:"Soft Tissue"},
 {disc:"Clin App",title:"Connective Tissue Disease"},
 {disc:"Clin App",title:"Peripheral Neuropathy"},
 {disc:"Clin App",title:"Monoarthritis"},
 {disc:"Clin App",title:"Polyarthritis"},
 {disc:"Psych",title:"Psychiatric Emergencies"},
 {disc:"Ethics",title:"Family Care-Giving"},
 {disc:"FOD",title:"PDRs"},
 {disc:"FOD",title:"PBL 6A; Career & Academic Development"},
]},
{n:3,start:"2026-11-02",label:"Spine, Limbs, Environment & Infection",lectures:[
 {disc:"Path",title:"Environmental Pathology"},
 {disc:"Path · ID",title:"Clinical Diagnosis of Infectious Diseases; Laboratory Practices"},
 {disc:"Path · ID",title:"Immunocompromised Host"},
 {disc:"Path · ID",title:"Zoonotic Infections"},
 {disc:"Path · ID",title:"Granulomatous Diseases"},
 {disc:"Clin App",title:"Back Pain"},
 {disc:"Clin App",title:"Pediatric Fractures"},
 {disc:"Clin App",title:"CBL Cases 6"},
 {disc:"Clin App · ID",title:"Fever of Unknown Origin"},
 {disc:"Psych",title:"Flipped Classroom. Difficult Encounters"},
 {disc:"Psych",title:"Ethical and Legal Issues in Psychiatry"},
 {disc:"Psych",title:"Flipped Classroom. Diathesis-Stress Model"},
 {disc:"Ethics",title:"Health Law & Policy"},
 {disc:"FOD",title:"PDRs"},
]},
];

/* ---- Boards & Beyond, by title within its system ---- */
const bnb = {
  // Dermatology — all of it is week 1's material
  "Skin":1, "Epithelial Cells":1, "Skin Disorders I":1, "Skin Disorders II":1,
  "Pigment Disorders":1, "Vascular Lesions":1, "Skin Infections":1,
  "Blistering Disorders":1, "Hypersensitivity Disorders":1, "Skin Cancer":1,
  "Neurocutaneous Disorders":1,
  // Musculoskeletal · Cell Biology → week 2 with the muscle and bone pathology
  "Skeletal Muscle":2, "Cardiac Muscle":2, "Smooth Muscle":2, "Bone":2,
  // Musculoskeletal · Pathology → week 2
  "Bone Disorders":2, "Osteoporosis":2, "Osteoporosis Drugs":2,
  "Benign Bone Tumors":2, "Malignant Bone Tumors":2, "Arthritis":2,
  "Muscle Disorders":2,
  "Common Musculoskeletal Conditions":3,   // back pain / fractures week
  // Musculoskeletal · Anatomy and Orthopedics → week 3, where the regional
  // clinical content (spine, limbs, fractures) sits
  "Knee":3, "Shoulder and Elbow":3, "Brachial Plexus":3, "Wrist":3, "Hand":3,
  "Lumbosacral Plexus":3, "Lumbar Radiculopathy":3, "Hip":3,
};

/* ---- Pathoma, by chapter title ---- */
const pathoma = {
  "19.1 Inflammatory Dermatoses":1, "19.2 Blistering Dermatoes":1,
  "19.3 Epithelial Tumors":1, "19.4 Disorders of Pigmentation and Melanocytes":1,
  "19.5 Infectious Disorders":1,
  "18.6 Soft Tissue Tumors":1,            // PATH 66, taught in week 1
  "18.1 Skeletal System":2, "18.2 Bone Tumors":2, "18.3 Joint":2,
  "18.4 Skeletal Muscle":2, "18.5 Neuromuscular Junction":2,
};

/* ---- Bootcamp, by section ("System|Category") ----
   Sections marked BALANCE carry no lecture in this unit. Bootcamp's MSK course
   includes a full regional anatomy syllabus that Brody never lectures here, so it is
   distributed to keep the three weeks comparable rather than piled into one. Minimal
   mode drops all of it regardless. */
const bcWeek = {
  // ---- week 1 · skin, plus the foundational and head/neck anatomy (BALANCE) ----
  "Dermatology|General Principles":1,
  "Dermatology|Infectious Diseases of the Skin":1,
  "Dermatology|Inflammatory Diseases of the Skin":1,
  "Dermatology|Malignant Skin Disorders":1,
  "Dermatology|Additional Dermatologic Disorders":1,
  "Dermatology|Histology — Skin":1,
  "Musculoskeletal|Anatomy — Foundations of Anatomy":1,                       // BALANCE
  "Musculoskeletal|Anatomy — Skull":1,                                        // BALANCE
  "Musculoskeletal|Anatomy — Anterior Triangle of the Neck":1,                // BALANCE
  "Musculoskeletal|Anatomy — Posterior Triangle of the Neck":1,               // BALANCE
  "Musculoskeletal|Anatomy — Occipital Region & Posterior Neck":1,            // BALANCE
  "Musculoskeletal|Anatomy — Face":1,                                         // BALANCE
  "Musculoskeletal|Anatomy — Infratemporal Fossa":1,                          // BALANCE
  "Musculoskeletal|Anatomy — Hard & Soft Palate, Pterygopalatine Fossa":1,    // BALANCE
  "Musculoskeletal|Anatomy — Thoracic Wall":1,                                // BALANCE

  // ---- week 2 · bone, joint, muscle, rheumatology, pharmacology ----
  "Musculoskeletal|Skeletal Muscle":2,
  "Musculoskeletal|Non-Rheumatologic Diseases":2,
  "Musculoskeletal|Rheumatologic Diseases":2,
  "Musculoskeletal|Seronegative Spondyloarthritis":2,
  "Musculoskeletal|Primary Bone Tumors":2,
  "Musculoskeletal|Vasculitides":2,
  "Musculoskeletal|Pharmacology":2,
  "Musculoskeletal|Histology — Cartilage":2,     // the tissue week 2's pathology is about
  "Musculoskeletal|Histology — Bone":2,
  "Musculoskeletal|Histology — Muscles":2,
  "Musculoskeletal|Anatomy — Pectoral Region & Axilla":2,                     // BALANCE
  "Musculoskeletal|Anatomy — Shoulder & Scapular Region":2,                   // BALANCE
  "Musculoskeletal|Anatomy — Anterior & Posterior Arm, Elbow Joint":2,        // BALANCE
  "Musculoskeletal|Anatomy — Forearm & Cubital Fossa":2,                      // BALANCE
  "Musculoskeletal|Anatomy — Hand":2,                                         // BALANCE

  // ---- week 3 · spine, regional limb disease, paediatrics ----
  "Musculoskeletal|Spine":3,
  "Musculoskeletal|Brachial Plexus Nerves & Lesions":3,
  "Musculoskeletal|Shoulder & Elbow":3,
  "Musculoskeletal|Wrist & Hand":3,
  "Musculoskeletal|Lower Extremity Nerves":3,
  "Musculoskeletal|Hip & Knee":3,
  "Musculoskeletal|Foot & Ankle":3,
  "Musculoskeletal|Childhood Musculoskeletal Pathology":3,
  "Musculoskeletal|Anatomy — Back":3,                                          // supports Back Pain
  "Musculoskeletal|Anatomy — Anterior & Medial Thigh, Knee":3,                 // BALANCE
  "Musculoskeletal|Anatomy — Gluteal Region, Posterior Thigh, Popliteal Fossa":3, // BALANCE
  "Musculoskeletal|Anatomy — Leg":3,                                           // BALANCE
  "Musculoskeletal|Anatomy — Foot":3,                                          // BALANCE
};

/* ---- videos pulled in from OUTSIDE the unit's two systems ----
   Each one answers to a named lecture. This is the alternative to making
   Infectious Disease, Anaesthesia, Psychiatry and Pathology whole systems. */
const include = {
  // PHARM 31-32 · anaesthesia (week 1)
  "bnb|Anesthesia|General Topics|Inhaled Anesthetics":1,
  "bnb|Anesthesia|General Topics|Intravenous Anesthetics":1,
  "bnb|Anesthesia|General Topics|Local Anesthetics":1,
  "bnb|Anesthesia|General Topics|Neuromuscular Blockers":1,
  "skpharm|Neurology|Anesthetics & Analgesics|IV Anesthetics":1,
  "skpharm|Neurology|Anesthetics & Analgesics|Inhaled Anesthetics & Dantrolene":1,
  "skpharm|Neurology|Anesthetics & Analgesics|Local Anesthetics":1,

  // Psych 28-30 · personality, psychiatric presentations, psychotherapy (week 1)
  "bnb|Psychiatry|Pathology|Personality Disorders":1,
  "bnb|Psychiatry|Psychology|Conditioning and Transference":1,
  "bootcamp|Psychiatry|Personality Disorders|Cluster A Personality Disorders":1,
  "bootcamp|Psychiatry|Personality Disorders|Cluster B Personality Disorders":1,
  "bootcamp|Psychiatry|Personality Disorders|Cluster C Personality Disorders":1,
  "bootcamp|Psychiatry|Psychology|Transtheoretical Model of Change":1,
  // Psych 31 · psychiatric emergencies (week 2)
  "bootcamp|Psychiatry|Pharmacology|Psychiatric Emergencies":2,
  "bootcamp|Psychiatry|Psychotic and Mood Disorders|Suicide":2,

  // PATH 73 · environmental pathology (week 3)
  "bootcamp|Neurology|Side Effects and Toxins|Environmental Toxins and their Treatments":3,
  // PATH 77 · granulomatous disease (week 3)
  "bnb|Pathology|General Topics|Granulomatous Inflammation":3,
  // PATH 74 · clinical diagnosis of infectious disease; laboratory practices (week 3)
  "bnb|Infectious Disease|Basics of Microbiology|Bacteria":3,
  "bnb|Infectious Disease|Basics of Microbiology|Shapes and Stains":3,
  "bnb|Infectious Disease|Basics of Microbiology|Bacterial Culture":3,
  "bnb|Infectious Disease|Basics of Microbiology|Special Growth Requirements":3,
  "bnb|Infectious Disease|Basics of Microbiology|Virulence":3,
  "bnb|Infectious Disease|Basics of Microbiology|Growth and Genetics":3,
  "bnb|Infectious Disease|Basics of Microbiology|Bacterial Identification":3,
  // PATH 76 · zoonotic infections (week 3)
  "bnb|Infectious Disease|Bacteria|Zoonotic Infections":3,
  "skmicro|Infectious Disease|Gram Negative Bacilli - Zoonotics|Bartonella henselae":3,
  "skmicro|Infectious Disease|Gram Negative Bacilli - Zoonotics|Brucella":3,
  "skmicro|Infectious Disease|Gram Negative Bacilli - Zoonotics|Francisella tularensis":3,
  "skmicro|Infectious Disease|Gram Negative Bacilli - Zoonotics|Pasturella multocida":3,
  "skmicro|Infectious Disease|Gram Negative Bacilli - Zoonotics|Anaplasma phagocytophilum & Ehrlichia chaffeensis":3,
  "skmicro|Infectious Disease|Ectoparasites|Scabies, Lice, Crabs":3,
  // PATH 77 · the granulomatous organisms (week 3)
  "skmicro|Infectious Disease|Mycobacteria|Mycobacterium tuberculosis":3,
  "skmicro|Infectious Disease|Mycobacteria|Mycobacterium leprae":3,
  "skmicro|Infectious Disease|Mycobacteria|Mycobacterium avium intracellulare, scrofulaceum, marinum":3,
  "skmicro|Infectious Disease|Systemic Mycoses|Histoplasma capsulatum":3,
  "skmicro|Infectious Disease|Systemic Mycoses|Blastomycosis dermatitidis":3,
  "skmicro|Infectious Disease|Systemic Mycoses|Coccidiomycosis immitis":3,
  "skmicro|Infectious Disease|Systemic Mycoses|Paracoccidioidomycosis brasiliensis":3,
  // PATH 75 / CLINAPP 50 · the immunocompromised host and fever of unknown origin (week 3)
  "bnb|Infectious Disease|Fungi|Opportunistic Fungal Infections":3,
  "bnb|Infectious Disease|Parasites and Helminths|HIV":3,
  "bnb|Infectious Disease|Parasites and Helminths|HIV CNS Infections":3,
  "bnb|Infectious Disease|Parasites and Helminths|HIV Drugs":3,
  "skmicro|Infectious Disease|Opportunistic Fungal Infections|Candida albicans":3,
  "skmicro|Infectious Disease|Opportunistic Fungal Infections|Aspergillus fumigatus":3,
  "skmicro|Infectious Disease|Opportunistic Fungal Infections|Crytococcus neoformans":3,
  "skmicro|Infectious Disease|Opportunistic Fungal Infections|Mucormycosis (Mucor spp. & Rhizopus spp.)":3,
  "skmicro|Infectious Disease|Opportunistic Fungal Infections|Pneumocystis jirovecii":3,
};

const exclude = [];

/* ================= build + validate ================= */
const inBlock = cat.videos.filter(v => SYS.includes(v.sys));
const videoWeek = {};
const used = { bnb:new Set(), pathoma:new Set() };
const missed = [];

inBlock.forEach(v => {
  if (v.res === 'bnb') {
    if (bnb[v.name] != null) { videoWeek[K(v)] = bnb[v.name]; used.bnb.add(v.name); }
    else missed.push(K(v));
  } else if (v.res === 'pathoma') {
    if (pathoma[v.name] != null) { videoWeek[K(v)] = pathoma[v.name]; used.pathoma.add(v.name); }
    else missed.push(K(v));
  } else if (v.res === 'bootcamp') {
    if (bcWeek[v.sys + '|' + (v.cat || '')] == null) missed.push(K(v));
  } else missed.push(K(v));
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
  missed.slice(0, 25).forEach(m => console.error('  ' + m));
  process.exit(1);
}
if (staleP.length || staleB.length || staleC.length) {
  console.error('MAPPINGS THAT MATCH NOTHING:', [].concat(staleP, staleB, staleC));
  process.exit(1);
}
const weekNums = new Set(weeks.map(w => w.n));
const bad = Object.entries(videoWeek).filter(([, w]) => !weekNums.has(w))
  .concat(Object.entries(bcWeek).filter(([, w]) => !weekNums.has(w)));
if (bad.length) { console.error('MAPPINGS POINTING AT A WEEK THAT DOES NOT EXIST:', bad); process.exit(1); }

const blk = { id:"msk-skin", name:"Musculoskeletal & Skin", systems:SYS, weeks,
  shelf:"2026-11-09", checkpoints:["2026-10-23","2026-10-30"],
  videoWeek, exclude, include:Object.keys(include), bcWeek };

/* ---- splice into index.html, and register the block ---- */
let app = fs.readFileSync(APP, 'utf8');
const anchor = '\nconst BRODY_BLOCKS=';
const i = app.indexOf(anchor);
if (i < 0) { console.error('could not find BRODY_BLOCKS in index.html'); process.exit(1); }
const payload = 'const BRODY_MSK=' + JSON.stringify(blk) + ';';
const existing = app.indexOf('\nconst BRODY_MSK=');
if (existing >= 0) {                       // re-run: replace the old one in place
  const end = app.indexOf(';\n', existing) + 1;
  app = app.slice(0, existing + 1) + payload + app.slice(end);
} else {
  app = app.slice(0, i + 1) + payload + '\n' + app.slice(i + 1);
}
app = app.replace(/const BRODY_BLOCKS=\[[^\]]*\];/,
  'const BRODY_BLOCKS=[BRODY_HEME_RENAL,BRODY_CARDIOPULM,BRODY_NEURO,BRODY_MSK];');
fs.writeFileSync(APP, app);

/* ---- report ---- */
const weekOf = v => {
  const k = K(v);
  if (videoWeek[k] != null) return videoWeek[k];
  if (v.res === 'bootcamp' && bcWeek[v.sys + '|' + (v.cat || '')] != null) return bcWeek[v.sys + '|' + (v.cat || '')];
  return weeks.length;
};
const all = inBlock.concat(Object.keys(include).map(k => cat.videos.find(v => K(v) === k)));
const tally = {};
all.forEach(v => { const w = weekOf(v); (tally[w] = tally[w] || { n:0, m:0 }); tally[w].n++; tally[w].m += v.min; });
console.log('Musculoskeletal & Skin — spliced into index.html and registered\n');
weeks.forEach(w => {
  const t = tally[w.n] || { n:0, m:0 };
  console.log('  week ' + w.n + '  ' + w.start + '   ' + String(t.n).padStart(3) + ' videos  '
    + (Math.round(t.m / 6) / 10).toFixed(1).padStart(5) + ' h   ' + String(w.lectures.length).padStart(2) + ' lectures   ' + w.label);
});
console.log('  ' + ' '.repeat(16) + String(all.length).padStart(3) + ' videos  '
  + (Math.round(all.reduce((a, v) => a + v.min, 0) / 6) / 10).toFixed(1).padStart(5) + ' h   '
  + weeks.reduce((a, w) => a + w.lectures.length, 0) + ' lectures   TOTAL');
const byRes = {};
all.forEach(v => { byRes[v.res] = byRes[v.res] || { n:0, m:0 }; byRes[v.res].n++; byRes[v.res].m += v.min; });
console.log('\n  by resource:');
Object.keys(byRes).sort().forEach(r => console.log('    ' + r.padEnd(10) + String(byRes[r].n).padStart(4)
  + (byRes[r].m / 60).toFixed(1).padStart(8) + ' h'));
console.log('\n  ' + Object.keys(include).length + ' videos pulled in from outside the unit’s systems'
  + ' (ID, anaesthesia, psych, general pathology)');
console.log('  checks: every video mapped, every mapping resolves, no mapping points at a missing week');
