/* Build the GI, Nutrition & Multisystem Brody block (SYST 9500, Term 3, Nov 9 – Dec 11).
 *
 * Same discipline as the other block builders: the week/lecture data is transcribed
 * from the printed course calendar (M2 2026-2027 Term 3, supplied 2026-11-08), the
 * video mapping is assigned by hand, and the script then CHECKS the result against the
 * live catalog — every mapping key must hit a real video, every video in the block must
 * be mapped, and every mapping must still match something. It refuses to write if any
 * of that has drifted.
 *
 * WHAT IS UNLIKE THE OTHER UNITS.
 *
 * 1. No Bootcamp. Bootcamp leaves the repertoire after Musculoskeletal & Skin (Dylan,
 *    2026-10-22), so this block carries `noRes:["bootcamp"]`: its 229 GI videos are not
 *    in the unit, and the Bootcamp switch is not offered for it.
 *
 * 2. Gastroenterology is the only system. "Nutrition and Multisystem" is lectures, not a
 *    system: nutrition, inborn errors of metabolism, ethanol, cancer drugs, substance use,
 *    eating disorders and the GI/liver infections. Each is served by a targeted `include`
 *    answering to a named lecture, as MSK's infection and anaesthesia lectures were.
 *
 * 3. Lectures with nothing in the catalog to match stay unmapped rather than forced:
 *    toxicology 1-5 (beyond free-radical injury, the toxic alcohols and copper/iron),
 *    sexual health, laboratory medicine and drug-drug interactions.
 *
 * 4. B&B microbiology follows the Sketchy Micro videos (Dylan, 2026-11-10). For every Sketchy
 *    Micro video below, the B&B Infectious Disease video that teaches the same organism is
 *    added, in the week of the first of them (lib/micro_pairs.js): C. diff brings Other Gram
 *    Positives, the gut viruses RNA Viruses, the gut protozoa Protozoa, the worms Helminths.
 *
 * 5. Five weeks, and Thanksgiving week has no quiz. Quizzes: Extended Quiz 9 (Fri Nov 13),
 *    10 (Fri Nov 20), 11 (Fri Dec 4); Exam 5 Fri Dec 11. A week is due at the first quiz
 *    on or after its Friday, so week 3 is due Dec 4 with week 4, and week 5 at the exam.
 *
 *   node tools/generators/mk_gi.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { microPairs } from './lib/micro_pairs.js';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const APP = path.join(REPO, 'index.html');
const cat = JSON.parse(fs.readFileSync(path.join(REPO, 'catalog.json'), 'utf8'));
const K = v => v.res + '|' + v.sys + '|' + (v.cat || '') + '|' + v.name;

const SYS = ["Gastroenterology"];
// UWorld Videos too, until its GI-coded videos are mapped to these weeks (they are "GI" in
// data/uworld-videos-map.txt, held for a built unit): left in, they would all fall to week 5.
const NO_RES = ["bootcamp", "uwvid"];

/* ---- weeks, straight off the printed calendar (Term 3, SYST 9500) ----
   Exams, quizzes, make-ups, sim labs and feedback sessions are left out, as in the other
   units. CLINAPP "554" is printed that way; it sits between 53 and 56. */
const weeks = [
{n:1,start:"2026-11-09",label:"GI Tract & GI Drugs",lectures:[
 {disc:"Path · GI",title:"Oral Cavity & Salivary Glands"},
 {disc:"Path · GI",title:"Esophagus"},
 {disc:"Path · GI",title:"Stomach"},
 {disc:"Path · GI",title:"Lower GI: Obstructive and Vascular, Malabsorptive"},
 {disc:"Path · GI",title:"Lower GI: IBD & Diverticula"},
 {disc:"Path · GI",title:"Lower GI: Appendix, Neoplastic Disease"},
 {disc:"Path · GI",title:"Lower GI: Infectious"},
 {disc:"Path · GI",title:"Liver: Overview / Syndromes / Toxins / Acute & Chronic Hepatitis"},
 {disc:"Pharm · GI",title:"Gastrointestinal Drugs (1 of 3)"},
 {disc:"Pharm · GI",title:"Gastrointestinal Drugs (2 of 3)"},
 {disc:"Pharm · GI",title:"Gastrointestinal Drugs (3 of 3)"},
 {disc:"Clin App · GI",title:"Abdominal Pain"},
 {disc:"Clin App · GI",title:"Peptic Ulcer Disease"},
 {disc:"Clin App",title:"Colon Cancer and Polyps Prevention"},
 {disc:"Psych",title:"Feeding and Eating Disorders"},
 {disc:"Ethics",title:"Technology & Emerging Ethical Issues (AI in Medicine)"},
 {disc:"FOD",title:"PDRs"},
 {disc:"FOD",title:"PBL 6B/7A"},
]},
{n:2,start:"2026-11-16",label:"Liver, Biliary Tract & Toxicology",lectures:[
 {disc:"Path · GI",title:"Liver: Alcoholic and Fatty Liver Disease"},
 {disc:"Path · GI",title:"Liver: Acute and Chronic Hepatitis"},
 {disc:"Path · GI",title:"Liver: Inherited and Circulatory Diseases"},
 {disc:"Path · GI",title:"Liver: Inflammatory Diseases"},
 {disc:"Path · GI",title:"Liver: Biliary Tract Disease & Cholestasis"},
 {disc:"Path · GI",title:"Gallbladder"},
 {disc:"Path · GI",title:"GI Laboratory"},
 {disc:"Pharm · Tox",title:"Toxicology 1: Intro & Mechanisms"},
 {disc:"Pharm/Path · Tox",title:"Toxicology 2: HSS Module – Metal Toxicity"},
 {disc:"Pharm · Tox",title:"Toxicology 3: Chemical Pollutants / Translational Research"},
 {disc:"Pharm/Path · Tox",title:"Toxicology 3: Classic Chemical Pollutants 1"},
 {disc:"Pharm/Path · Tox",title:"Toxicology 4: Clinical Management"},
 {disc:"Clin App · GI",title:"CBL Cases 7"},
 {disc:"Psych",title:"Sexual Health Basics"},
 {disc:"Psych",title:"Flipped Classroom. Sexual Health Interviewing"},
 {disc:"Psych",title:"Transgender Health"},
 {disc:"Psych",title:"Sex and Disability"},
 {disc:"Psych",title:"Clinical Skills: Patient Interview (A)"},
 {disc:"Ethics",title:"Research Ethics"},
 {disc:"FOD",title:"PDRs"},
 {disc:"FOD",title:"PBL 7B/8A"},
]},
{n:3,start:"2026-11-23",label:"Liver Tumors, Pancreas & Cancer Drugs",lectures:[
 {disc:"Path · GI",title:"Liver – Neoplastic"},
 {disc:"Path · GI",title:"Pancreas – Exocrine"},
 {disc:"Pharm · Cancer",title:"Drugs Used to Treat Cancer 1"},
 {disc:"Pharm · Cancer",title:"Drugs Used to Treat Cancer 2"},
 {disc:"Pharm · Cancer",title:"Drugs Used to Treat Cancer 3"},
 {disc:"Psych",title:"Sexual Dysfunctions"},
 {disc:"Psych",title:"Flipped Classroom. Paraphilic Disorders"},
 {disc:"Psych",title:"Clinical Skills: Patient Interview (B)"},
 {disc:"Ethics",title:"From Understanding to Action"},
 {disc:"FOD",title:"PDRs"},
]},
{n:4,start:"2026-11-30",label:"Nutrition, Metabolism & Substance Use",lectures:[
 {disc:"Path · GI",title:"Nutrition & Metabolism: Malnutrition"},
 {disc:"Path · GI",title:"Nutrition & Metabolism: Ethanol, Drugs"},
 {disc:"Path · GI",title:"Nutrition & Metabolism: Malabsorption"},
 {disc:"Path · GI",title:"Nutrition & Metabolism: Vitamin, Mineral Trace Elements"},
 {disc:"Path · GI",title:"Nutrition & Metabolism: Pediatrics/Genetics Inborn Metabolic Disease"},
 {disc:"Pharm · Cancer",title:"Drugs Used to Treat Cancer 4"},
 {disc:"Pharm",title:"Substance Use and Abuse Disorder: Other Drugs 1"},
 {disc:"Pharm",title:"Substance Use and Abuse Disorder: Other Drugs 2"},
 {disc:"Pharm · Tox",title:"Toxicology 5 – Environmental Agents; Alcohols, Polyols"},
 {disc:"Pharm · Nutrit/Tox",title:"Vitamins, Herbals, Supplements (1 of 2)"},
 {disc:"Pharm · Nutrit/Tox",title:"Vitamins, Herbals, Supplements (2 of 2)"},
 {disc:"Clin App · GI",title:"Jaundice"},
 {disc:"Clin App · GI",title:"Chronic Liver Disease"},
 {disc:"Clin App · GI",title:"Pancreas Disorders"},
 {disc:"Clin App",title:"CBL Cases 8"},
 {disc:"Psych",title:"Substance-Related & Addictive Disorder Basics"},
 {disc:"Psych",title:"Motivational Interviewing"},
 {disc:"Psych",title:"Substance Use Disorders"},
 {disc:"Psych",title:"Intoxication and Withdrawal"},
 {disc:"FOD",title:"PDRs"},
 {disc:"FOD",title:"Biostats Review #3"},
 {disc:"FOD",title:"PBL 8B; Career Advising & Final Feedback"},
]},
{n:5,start:"2026-12-07",label:"Laboratory Medicine & Substance Use Treatment",lectures:[
 {disc:"Path",title:"Laboratory Medicine 1"},
 {disc:"Path",title:"Laboratory Medicine 2"},
 {disc:"Path",title:"Laboratory Medicine 3"},
 {disc:"Path",title:"Laboratory Medicine 4"},
 {disc:"Path · GI",title:"Liver Laboratory"},
 {disc:"Pharm",title:"Drug-Drug Interactions (Flipped Classroom)"},
 {disc:"Psych",title:"Interviewing and Screening for Substances"},
 {disc:"Psych",title:"Substance Epidemiology and Neurobiology"},
 {disc:"Psych",title:"Outcomes in Substance Use Disorders"},
 {disc:"Psych",title:"Treatment of Substance Use Disorders"},
 {disc:"Psych",title:"Standardized Patients"},
]},
];

/* ---- Boards & Beyond, by title within Gastroenterology ---- */
const bnb = {
  // Anatomy and embryology: no anatomy lecture, so with the tract they describe (week 1);
  // the liver/biliary/pancreas anatomy goes with the liver week. Minimal drops them.
  "Gastrointestinal Embryology":1, "Gastrointestinal Anatomy":1, "Gastrointestinal Blood Supply":1,
  "Gastrointestinal Tract":1, "Salivary Glands":1, "Hernias":1,
  "Liver, Gallbladder, and Pancreas":2,
  // Physiology, with the organ's pathology
  "Gastrointestinal Secretions":1, "Gastrointestinal Hormones":1,   // stomach, PUD
  "Bile":2, "Bilirubin":2,                                           // biliary tract, cholestasis
  "Exocrine Pancreas":3,                                             // pancreas – exocrine
  // Clinical — the tract and the GI drugs are week 1
  "Esophageal Disorders":1, "Gastric Disorders":1, "Malabsorption":1, "Intestinal Disorders":1,
  "Inflammatory Bowel Disease":1, "Colon Cancer":1, "Carcinoid Tumors":1,
  "Gastrointestinal Pharmacology":1,
  "Liver Disease":1,                       // PATH 85, liver overview / syndromes / toxins (Fri wk 1)
  "Cirrhosis":2, "Wilson Disease and Hemochromatosis":2, "Gallstones":2, "Biliary Disorders":2,
  "Liver Tumors":3, "Acute Pancreatitis":3, "Chronic Pancreatitis & Pancreatic Cancer":3,
};

/* ---- Pathoma, by chapter title ---- */
const pathoma = {
  "10.1 Oral Cavity":1, "10.2 Salivary Gland":1, "10.3 Esophagus":1, "10.4 Stomach":1,
  "10.5 Small Bowel":1, "10.6 Appendix":1, "10.7 Inflammatory Bowel Disease":1,
  "10.8 Colon & Colorectal Carcinoma":1,
  "11.2 Gallbladder and Biliary Tract":2,
  "11.3 Liver (Jaundice, Hepatitis, Cirrhosis & Tumors)":2,   // the liver lectures are weeks 1-3; most are week 2
  "11.1 Exocrine Pancrease":3,
};

/* ---- Sketchy Pharm, by title within Gastroenterology: PHARM 36-38 (week 1) ---- */
const skpharm = {
  "Antiemetic Agents":1, "H2 Receptor Blockers & PPIs":1, "Laxatives":1, "Antidiarrheal Agents":1,
};

/* ---- videos pulled in from OUTSIDE Gastroenterology ----
   Each one answers to a named lecture. */
const include = {
  // Psych 37 · Feeding and Eating Disorders (week 1)
  "bnb|Psychiatry|Pathology|Eating Disorders":1,

  // CLINAPP 52 · Peptic Ulcer Disease; PATH 80 · Stomach (week 1)
  "skmicro|Infectious Disease|Gram-Negative Bacilli: Enteric Tract|Helicobacter pylori":1,
  // PATH 84 · Lower GI: Infectious (week 1) — the gut's own organisms only
  "bnb|Infectious Disease|Bacteria|Gram Negative Rods":1,
  "skmicro|Infectious Disease|Gram-Negative Bacilli: Enteric Tract|Salmonella: Intro to Salmonella & NTS":1,
  "skmicro|Infectious Disease|Gram-Negative Bacilli: Enteric Tract|Salmonella: Typhoidal Salmonella":1,
  "skmicro|Infectious Disease|Gram-Negative Bacilli: Enteric Tract|Shigella spp.":1,
  "skmicro|Infectious Disease|Gram-Negative Bacilli: Enteric Tract|Escherichia coli (ETEC & EHEC)":1,
  "skmicro|Infectious Disease|Gram-Negative Bacilli: Enteric Tract|Yersinia enterocolitica & pestis":1,
  "skmicro|Infectious Disease|Gram-Negative Bacilli: Enteric Tract|Campylobacter jejuni":1,
  "skmicro|Infectious Disease|Gram-Negative Bacilli: Enteric Tract|Vibrio spp.":1,
  "skmicro|Infectious Disease|Gram-Positive Bacilli|Clostridioides difficile":1,
  "skmicro|Infectious Disease|RNA Viruses: Positive Sense|Norovirus & Norwalk Virus (Caliciviridae)":1,
  "skmicro|Infectious Disease|RNA Viruses: Negative Sense|Rotavirus & Colorado Tick Fever Virus (Reoviridae)":1,
  "skmicro|Infectious Disease|Protozoa of the Intestinal Tract|Giardia lamblia":1,
  "skmicro|Infectious Disease|Protozoa of the Intestinal Tract|Entamoeba histolytica":1,
  "skmicro|Infectious Disease|Protozoa of the Intestinal Tract|Cryptosporidium spp.":1,
  "skmicro|Infectious Disease|Helminths: Nematodes|Intestinal Nematodes: Enterobius, Ancylostoma, Necator, Ascaris, Strongyloides, and Trichinella":1,
  "skmicro|Infectious Disease|Helminths: Trematodes & Cestodes|Cestodes":1,

  // PATH 85/87 · acute and chronic hepatitis; PATH 89 · inflammatory liver disease (week 2)
  "bnb|Infectious Disease|Parasites and Helminths|Viral Hepatitis":2,
  "skmicro|Infectious Disease|RNA Viruses: Positive Sense|Hepatitis A Virus (Picornaviridae)":2,
  "skmicro|Infectious Disease|DNA Viruses|Hepatitis B Viral Basics & Infectious Diseases (Hepadnaviridae)":2,
  "skmicro|Infectious Disease|RNA Viruses: Positive Sense|Hepatitis C Virus (Flaviviridae)":2,
  "skpharm|Infectious Disease|Other Antivirals|Hepatitis C: Direct-Acting Antivirals (DAAs)":2,
  "skmicro|Infectious Disease|Helminths: Trematodes & Cestodes|Trematodes":2,   // liver flukes, schistosomal liver disease
  // PHARM 39 · Toxicology 1: Intro & Mechanisms (week 2) — toxic injury: acetaminophen, CCl4, iron
  "bnb|Pathology|General Topics|Free Radicals":2,
  "pathoma|Pathology|Growth Adaptations, Cellular Injury, and Death|1.4 Free Radical Injury":2,

  // PHARM 43-46 · Drugs Used to Treat Cancer 1-4. Hematology & Renal excludes all sixteen of
  // these (its own `exclude`): Brody teaches cancer drugs here, and this is where they land.
  // 1-3 (week 3) — the cytotoxic drugs
  "bnb|Hematology|Cancer Drugs|Antimetabolites":3,
  "bnb|Hematology|Cancer Drugs|Alkylating and Platinum Agents":3,
  "bnb|Hematology|Cancer Drugs|Antitumor Antibiotics and Topoisomerase Drugs":3,
  "bnb|Hematology|Cancer Drugs|Microtubule Inhibitors":3,
  "skpharm|Hematology|Antimetabolites|Methotrexate, Leucovorin, 5-Fluorouracil, Hydroxyurea":3,
  "skpharm|Hematology|Antimetabolites|Cytotoxic Nucleoside Analogs":3,
  "skpharm|Hematology|Antimetabolites|Azathioprine, 6-Mercaptopurine, Mycophenolate Mofetil":3,
  "skpharm|Hematology|DNA & Cellular Division|Alkylating Agents":3,
  "skpharm|Hematology|DNA & Cellular Division|Platins":3,
  "skpharm|Hematology|DNA & Cellular Division|Cytotoxic Antibiotics":3,
  "skpharm|Hematology|DNA & Cellular Division|Topoisomerase Inhibitors":3,
  "skpharm|Hematology|DNA & Cellular Division|Mitotic Inhibitors":3,

  // PHARM 46 · Drugs Used to Treat Cancer 4 (week 4) — targeted and other agents
  "bnb|Hematology|Cancer Drugs|Other Cancer Drugs":4,
  "skpharm|Hematology|Kinase Inhibitors & Monoclonal Antibodies|Kinase Inhibitors":4,
  "skpharm|Hematology|Kinase Inhibitors & Monoclonal Antibodies|Monoclonal Antibody Therapy":4,
  "skpharm|Hematology|Immunology|Interferons":4,
  // PATH 99 · Vitamin, Mineral Trace Elements; PATH 96 · Malnutrition; PHARM 50-51 (week 4)
  "bnb|Biochemistry|Vitamins|B Vitamins":4,
  "bnb|Biochemistry|Vitamins|B12 and Folate":4,
  "bnb|Biochemistry|Vitamins|Other Vitamins":4,
  // PATH 97 · Ethanol, Drugs; PHARM 49 · Toxicology 5 – Alcohols (week 4)
  "bnb|Biochemistry|Metabolism|Ethanol Metabolism":4,
  // PATH 100 · Pediatrics/Genetics Inborn Metabolic Disease (week 4)
  "bnb|Biochemistry|Metabolism|Inborn Errors of Metabolism":4,
  "bnb|Biochemistry|Amino Acids|Phenylalanine and Tyrosine":4,
  "bnb|Biochemistry|Amino Acids|Other Amino Acids":4,
  "bnb|Biochemistry|Amino Acids|Ammonia":4,
  "bnb|Biochemistry|Metabolism|Glycogen":4,
  "bnb|Biochemistry|Metabolism|Fructose and Galactose":4,
  "bnb|Biochemistry|Other Topics|Lysosomal Storage Diseases":4,
  // PHARM 47-48 · Substance Use: Other Drugs; Psych 45, 47, 48 (week 4)
  "bnb|Psychiatry|Substance Use Disorders|Alcohol and CNS Depressants":4,
  "bnb|Psychiatry|Substance Use Disorders|Opioids":4,
  "bnb|Psychiatry|Substance Use Disorders|Stimulants":4,
  "bnb|Psychiatry|Substance Use Disorders|Other Drugs":4,
  "skpharm|Psychiatry|Anesthetics & Analgesics|Opioids, Naloxone, Naltrexone":4,

  // Psych 52 · Treatment of Substance Use Disorders (week 5)
  "skpharm|Psychiatry|Smoking Cessation Aids|Varenicline":5,
};

const exclude = [];

/* ================= build + validate ================= */
const inBlock = cat.videos.filter(v => SYS.includes(v.sys) && !NO_RES.includes(v.res) && v.res !== 'uwlib');
const maps = { bnb, pathoma, skpharm };
const videoWeek = {};
const used = { bnb:new Set(), pathoma:new Set(), skpharm:new Set() };
const missed = [];

inBlock.forEach(v => {
  const m = maps[v.res];
  if (m && m[v.name] != null) { videoWeek[K(v)] = m[v.name]; used[v.res].add(v.name); }
  else missed.push(K(v));
});
Object.keys(include).forEach(k => {
  if (!cat.videos.some(v => K(v) === k)) { console.error('include key is not in the catalog: ' + k); process.exit(1); }
  videoWeek[k] = include[k];
});
/* B&B microbiology paired with the Sketchy Micro videos scheduled above */
const pairs = microPairs(cat.videos, videoWeek);
if (pairs.problems.length) { console.error('MICRO PAIRING:', pairs.problems); process.exit(1); }
Object.entries(pairs.add).forEach(([k, w]) => { include[k] = w; videoWeek[k] = w; });

const stale = Object.entries(maps).flatMap(([r, m]) => Object.keys(m).filter(n => !used[r].has(n)).map(n => r + ': ' + n));
if (missed.length) {
  console.error('VIDEOS WITH NO WEEK (' + missed.length + '):');
  missed.slice(0, 25).forEach(m => console.error('  ' + m));
  process.exit(1);
}
if (stale.length) { console.error('MAPPINGS THAT MATCH NOTHING:', stale); process.exit(1); }
const weekNums = new Set(weeks.map(w => w.n));
const bad = Object.entries(videoWeek).filter(([, w]) => !weekNums.has(w));
if (bad.length) { console.error('MAPPINGS POINTING AT A WEEK THAT DOES NOT EXIST:', bad); process.exit(1); }

const blk = { id:"gi-multisystem", name:"GI, Nutrition & Multisystem", systems:SYS, noRes:NO_RES, weeks,
  shelf:"2026-12-11", checkpoints:["2026-11-13","2026-11-20","2026-12-04"],
  videoWeek, exclude, include:Object.keys(include), bcWeek:{} };

/* ---- splice into index.html, and register the block ---- */
let app = fs.readFileSync(APP, 'utf8');
const anchor = '\nconst BRODY_BLOCKS=';
const i = app.indexOf(anchor);
if (i < 0) { console.error('could not find BRODY_BLOCKS in index.html'); process.exit(1); }
const payload = 'const BRODY_GI=' + JSON.stringify(blk) + ';';
const existing = app.indexOf('\nconst BRODY_GI=');
if (existing >= 0) {                       // re-run: replace the old one in place
  const end = app.indexOf(';\n', existing) + 1;
  app = app.slice(0, existing + 1) + payload + app.slice(end);
} else {
  app = app.slice(0, i + 1) + payload + '\n' + app.slice(i + 1);
}
app = app.replace(/const BRODY_BLOCKS=\[[^\]]*\];/,
  'const BRODY_BLOCKS=[BRODY_HEME_RENAL,BRODY_CARDIOPULM,BRODY_NEURO,BRODY_MSK,BRODY_GI];');
fs.writeFileSync(APP, app);

/* ---- report ---- */
const all = inBlock.concat(Object.keys(include).map(k => cat.videos.find(v => K(v) === k)));
const tally = {};
all.forEach(v => { const w = videoWeek[K(v)]; (tally[w] = tally[w] || { n:0, m:0 }); tally[w].n++; tally[w].m += v.min; });
console.log('GI, Nutrition & Multisystem — spliced into index.html and registered\n');
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
console.log('\n  ' + Object.keys(include).length + ' videos pulled in from outside Gastroenterology for named lectures');
console.log('  not carried: ' + cat.videos.filter(v => SYS.includes(v.sys) && NO_RES.includes(v.res)).length + ' Bootcamp GI videos (Bootcamp retired after MSK)');
console.log('  B&B microbiology paired with Sketchy Micro: ' + Object.entries(pairs.add).map(([k, w]) => k.split('|').pop() + ' (wk ' + w + ')').join(', ')
  + (pairs.kept.length ? '; already placed by a lecture: ' + pairs.kept.map(k => k.split('|').pop()).join(', ') : ''));
if (pairs.unpaired.length) console.log('  Sketchy Micro with no B&B home yet: ' + pairs.unpaired.join(', '));
console.log('  checks: every video mapped, every mapping resolves, no mapping points at a missing week');
