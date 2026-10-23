/* Sketchy Micro and Sketchy Immuno — from Sketchy's own course lists.
 *
 * PROVENANCE. data/sketchy-micro.json is Sketchy's four Microbiology courses: Bacteria from
 * the course-page screenshots, Viruses, Fungi and Parasites from Sketchy_Micro_Immuno_List.docx
 * (both supplied 2026-10-23). data/sketchy-immuno.json is the Immunology course from the same
 * document. Titles, sections and runtimes are Sketchy's, in Sketchy's order.
 *
 * SKETCHY MICRO had been transcribed by hand and had drifted: misspelled and outdated titles
 * ("Bordatella", "Haemophilis", "Crytococcus", "Hentavirus"…), wrong runtimes, missing
 * videos, and rows that were a second copy of another video. Only the sections a list
 * supplies are rewritten — today, all of them. A catalog row in a supplied section that the
 * list does not account for is refused, never dropped.
 *
 * SKETCHY IMMUNO is a new resource (res 'skimmuno', system Immunology), placed right after
 * Sketchy Micro. It has its own toggle in the app, off for every plan made before it existed.
 *
 * Unit tests on Sketchy's lists are not videos and are not catalogued.
 *
 * PROGRESS. Every retitled video leaves an alias in catalog.json and every removed copy a
 * duplicate entry (lib/aliases.js), so the app moves a student's ticks onto the new title.
 *
 * Idempotent: a second run changes nothing.
 *
 *   node tools/generators/mk_skmicro.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { itemId, recordAliases, aliasProblems } from './lib/aliases.js';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CAT = path.join(REPO, 'catalog.json');
const DATA = f => JSON.parse(fs.readFileSync(path.join(REPO, 'tools/generators/data', f), 'utf8'));
const MICRO = DATA('sketchy-micro.json'), IMMUNO = DATA('sketchy-immuno.json');

const SOURCES = [
  { res: 'skmicro', label: 'Sketchy Micro', sys: 'Infectious Disease',
    list: MICRO.courses.flatMap(c => c.videos.map(v => ({ ...v, course: c.course }))),
    /* Sketchy's title ← the catalog's old title, for the same video. */
    TITLE_FROM: {
      // ---- Bacteria ----
      'Staphylococcus epidermidis & saprophyticus': 'Staphylococcus epidermidis, saprophyticus',
      'Streptococcus pneumoniae & viridans': 'Streptococcus pneumoniae, viridans',
      'Enterococcus faecium & faecalis': 'Enterococus faecium & faecalis',
      'Streptococcus gallolyticus (Group D Strep)': 'Streptococcus gallolyticus (Group D strep)',
      'Bacillus anthracis & cereus': 'Bacillus anthracis, cereus',
      'Clostridioides difficile': 'Clostridium difficile',
      'Nocardia asteroides': 'Nocardia',
      'Neisseria gonorrhoeae': 'Neisseria gonorrheae',
      'Klebsiella pneumoniae, Enterobacter spp., Serratia marcescens': 'Klebsiella, Enterobacter, Serratia',
      'Salmonella: Intro to Salmonella & NTS': 'Salmonella',          // Sketchy has since split it in two
      'Shigella spp.': 'Shigella',
      'Escherichia coli (ETEC & EHEC)': 'Escherichia coli',
      'Yersinia enterocolitica & pestis': 'Yersinia enterocolitica, pestis',
      'Vibrio spp.': 'Vibrio cholerae, parahaemolyticus, vulnificus',
      'Bordetella pertussis': 'Bordatella pertussis',
      'Haemophilus influenzae': 'Haemophilis influenzae',
      'Brucella spp.': 'Brucella',
      'Pasteurella multocida': 'Pasturella multocida',
      'Mycobacterium avium intracellulare, Mycobacterium scrofulaceum, Mycobacterium marinum': 'Mycobacterium avium intracellulare, scrofulaceum, marinum',
      'Leptospira interrogans': 'Leptospirosis interrogans',
      'Chlamydia trachomatis, Chlamydophila pneumoniae, Chlamydophila psittaci': 'Chlamydia',
      'Mycoplasma pneumoniae': 'Mycoplasma pneumonia',
      'Rickettsia Overview': 'Rickettsia Species Overview',
      // ---- Viruses ----
      'Picornaviridae Overview': 'Picornavirus Family Overview',
      'Hepatitis A Virus (Picornaviridae)': 'Hepatits A (Picornaviridae)',
      'Flaviviridae Overview': 'Flavivirus Overview',
      'Hepatitis C Virus (Flaviviridae)': 'Hepatitis C (Flaviviridae)',
      'Rubella Virus (Matonaviridae)': 'Rubella VIrus (Matonaviridae)',
      'Influenzavirus (Orthomyxoviridae)': 'Influenzavirus (Orthomyxovirus)',
      'Measles, Mumps, Parainfluenza Viruses (Paramyxoviridae)': 'Measles, Mumps, Parainfluenza Viruses (Paramyxovirus)',
      'Rabies Virus (Rhabdoviridae)': 'Rabies Virus (Rhabdovirus)',
      'Hantavirus, California Encephalitis, Rift Valley Fever Viruses (Bunyaviridae)': 'Hentavirus, California Encephalitis, Rift Valley Fever Viruses (Bunyaviridae)',
      'Lymphocytic Choriomeningitis Virus (Arenaviridae)': 'Lymphocytic Choriomengingitis Virus (Arenaviridae)',
      'Varicella-Zoster Virus (Herpesviridae)': 'Varicella Zoster Virus (Herpesviridae)',
      'HHV-6 & Roseola (Herpesviridae)': 'HHV6 & Roseola (Herpesviridae)',
      "HHV-8 & Kaposi's Sarcoma (Herpesviridae)": "HHV8 & Kaposi's sarcoma (Herpesviridae)",
      'Human Papillomavirus (Papillomaviridae)': 'Human Papillomavirus (HPV) (Papillomaviridae)',
      // the catalog's 19-minute "Life Cycle" row is the current 19-minute video; the 6-minute
      // old version is a separate lesson Sketchy still lists
      'Hepatitis B Viral Basics & Infectious Diseases (Hepadnaviridae)': 'Hepatitis B Viral Life Cycle (Hepadnaviridae)',
      // ---- Fungi ----
      'Blastomyces dermatitidis': 'Blastomycosis dermatitidis',
      'Coccidioides immitis': 'Coccidiomycosis immitis',
      'Paracoccidioides brasiliensis': 'Paracoccidioidomycosis brasiliensis',
      'Malassezia furfur': 'Malassezia furfur, Pityriasis versicolor',
      'Epidermophyton spp., Trichophyton spp., Microsporum spp. (Dermatophytes)': 'Dermatophytes (Epidermophyton spp., Trichophyton spp., Microsporum spp.)',
      'Cryptococcus neoformans': 'Crytococcus neoformans',
      'Mucor spp. & Rhizopus spp. (Mucormycetes)': 'Mucormycosis (Mucor spp. & Rhizopus spp.)',
      // ---- Parasites ----
      'Giardia lamblia': 'Giardia',
      'Cryptosporidium spp.': 'Cryptosporidium',
      'Toxoplasma gondii': 'Toxoplasmosis',
      'Babesia spp.': 'Babesia',
      'Plasmodium: Treatment & PPX': 'Plasmodium: Treatment & Prophylaxis',
      'Leishmania braziliensis & donovani': 'Leishmania species',
      'Trichomonas vaginalis': 'Trichomoniasis vaginalis',
      'Intestinal Nematodes: Enterobius, Ancylostoma, Necator, Ascaris, Strongyloides, and Trichinella': 'Intestinal Nematodes',
      'Tissue Nematodes: Dracunculus medinensis, Wuchereria bancrofti, Onchocerca volvulus, Toxocara canis, and Loa loa': 'Tissue Nematodes',
    },
    /* On Sketchy's list, not in the catalog. Declared so an addition is never silent. */
    NEW: {
      'Salmonella: Typhoidal Salmonella': 'the second half of Sketchy\'s Salmonella, now its own video',
      'Bacteroides fragilis': 'missing from the hand transcription',
      'Hepatitis B Viral Life Cycle (Hepadnaviridae) [Old Version]': 'still a lesson on Sketchy\'s list, beside the current Hepatitis B video',
    },
    /* Catalog rows that are a copy of a video on the list — removed, ticks carried over. */
    DUPLICATES: {
      'Pseudomonas': { copyOf: 'Pseudomonas aeruginosa', note: 'a second, 10-minute copy filed with the enteric bacteria; Sketchy lists Pseudomonas aeruginosa once, with the respiratory tract' },
    },
    /* Section headers a source shows whose lessons have not been supplied yet. None now. */
    HEADERS: {},
  },
  { res: 'skimmuno', label: 'Sketchy Immuno', sys: 'Immunology', after: 'skmicro', newResource: true,
    list: IMMUNO.videos.map(v => ({ ...v, course: IMMUNO.course })),
    TITLE_FROM: {}, NEW: {}, DUPLICATES: {}, HEADERS: {} },
];

const cat = JSON.parse(fs.readFileSync(CAT, 'utf8'));
const before = JSON.stringify(cat);
const problems = [];
const reports = [];

SOURCES.forEach(S => {
  const { res, sys, list, TITLE_FROM, NEW, DUPLICATES, HEADERS } = S;
  const p = m => problems.push(S.label + ': ' + m);
  /* ---------------- validate ---------------- */
  const names = list.map(r => r.name);
  if (names.length !== new Set(names).size) p('the list repeats a title');
  const seen = [];
  list.forEach(r => { if (seen[seen.length - 1] !== r.section) { if (seen.includes(r.section)) p('section "' + r.section + '" is split on the list'); seen.push(r.section); } });
  Object.keys(TITLE_FROM).forEach(t => { if (!names.includes(t)) p('TITLE_FROM names "' + t + '", which is not on the list'); });
  Object.keys(NEW).forEach(t => { if (!names.includes(t)) p('NEW names "' + t + '", which is not on the list'); });
  Object.values(DUPLICATES).forEach(d => { if (!names.includes(d.copyOf)) p('a duplicate is a copy of "' + d.copyOf + '", which is not on the list'); });

  const mine = cat.videos.filter(v => v.res === res);
  const byName = n => mine.find(v => v.name === n);
  const rowOf = {};               // list title → its catalog row (null: to be added)
  list.forEach(r => {
    const now = byName(r.name), old = TITLE_FROM[r.name] && byName(TITLE_FROM[r.name]);
    if (now && old) p('"' + r.name + '" is in the catalog under both its old and new titles');
    rowOf[r.name] = now || old || null;
    if (!rowOf[r.name] && !NEW[r.name] && !S.newResource) p('"' + r.name + '" is on Sketchy\'s list but not in the catalog — declare it in NEW, or map its old title in TITLE_FROM');
    if (rowOf[r.name] && rowOf[r.name].sys !== sys) p('"' + r.name + '" is filed under ' + rowOf[r.name].sys);
  });
  const listed = new Set(Object.values(rowOf).filter(Boolean));
  const dupRows = mine.filter(v => DUPLICATES[v.name]);
  const supplied = new Set([...listed].map(v => v.cat).concat(list.map(r => r.section)));
  mine.forEach(v => {
    if (supplied.has(v.cat) && !listed.has(v) && !DUPLICATES[v.name])
      p('the catalog has "' + v.name + '" in ' + v.cat + ', which Sketchy\'s list does not have — map it in TITLE_FROM or DUPLICATES');
  });
  if (problems.length) return;

  /* ---------------- rewrite the supplied run, in Sketchy's order ---------------- */
  const log = { retitled: [], runtime: [], section: new Set(), added: [], removed: [], headers: [] };
  const fresh = list.map(r => {
    const v = rowOf[r.name];
    if (!v) { log.added.push(r.name + ' (' + r.min + 'm)' + (NEW[r.name] ? ' — ' + NEW[r.name] : '')); return { res, sys, cat: r.section, name: r.name, min: r.min }; }
    if (v.name !== r.name) log.retitled.push('"' + v.name + '" → "' + r.name + '"');
    if (v.min !== r.min) log.runtime.push(r.name + ': ' + v.min + ' → ' + r.min + 'm');
    if (v.cat !== r.section) log.section.add('"' + v.cat + '" → "' + r.section + '"');
    v.name = r.name; v.cat = r.section; v.min = r.min;
    return v;
  });
  const out = [];
  let placed = false;
  cat.videos.forEach(v => {
    if (listed.has(v) || dupRows.includes(v)) {
      if (dupRows.includes(v)) log.removed.push('"' + v.name + '" (' + v.cat + ', ' + v.min + 'm) — ' + DUPLICATES[v.name].note);
      if (!placed) { out.push(...fresh); placed = true; }
      return;
    }
    if (v.res === res && HEADERS[v.cat]) { log.headers.push(v.name); v.cat = HEADERS[v.cat]; }
    out.push(v);
  });
  if (!placed) {                  // a resource new to the catalog: after the one it sits beside
    let at = -1;
    out.forEach((v, i) => { if (v.res === S.after) at = i; });
    if (at < 0) { p('cannot place it: no ' + S.after + ' rows in the catalog'); return; }
    out.splice(at + 1, 0, ...fresh);
  }
  cat.videos = out;

  /* ---------------- aliases: old ids → current ids ---------------- */
  const id = name => itemId({ res, sys, name });
  const nAlias = recordAliases(cat, 'aliases', Object.entries(TITLE_FROM).map(([to, from]) => [id(from), id(to)]))
    + recordAliases(cat, 'duplicates', Object.entries(DUPLICATES).map(([from, d]) => [id(from), id(d.copyOf)]));
  reports.push({ S, log, nAlias, rows: cat.videos.filter(v => v.res === res && supplied.has(v.cat)) });
});

const keys = cat.videos.map(v => v.res + '|' + v.sys + '|' + (v.cat || '') + '|' + v.name);
if (keys.length !== new Set(keys).size) problems.push('the rewrite left duplicate catalog keys');
if (!problems.length) problems.push(...aliasProblems(cat));
if (problems.length) { console.error('PROBLEMS:'); problems.forEach(p => console.error('  ' + p)); process.exit(1); }

/* ---------------- write + report ---------------- */
const h = a => { const m = a.reduce((s, v) => s + v.min, 0); return Math.floor(m / 60) + 'h ' + (m % 60) + 'm'; };
const after = JSON.stringify(cat);
if (after !== before) fs.writeFileSync(CAT, after);
reports.forEach(({ S, log, nAlias, rows }) => {
  const changed = Object.values(log).some(x => (x.size || x.length));
  console.log(S.label + ': ' + rows.length + ' videos (' + h(rows) + ') match Sketchy\'s list' + (changed ? '' : ' — nothing to change'));
  const show = (title, a) => { if (a.length) { console.log('  ' + title + ' (' + a.length + ')'); a.forEach(x => console.log('    · ' + x)); } };
  show('retitled', log.retitled);
  show('runtime corrected', log.runtime);
  show('section renamed', [...log.section]);
  if (S.newResource && log.added.length) console.log('  added (' + log.added.length + '): the whole course, a new resource');
  else show('added', log.added);
  show('removed', log.removed);
  if (log.headers.length) console.log('  header only: ' + Object.values(S.HEADERS).join(', ') + ' (' + log.headers.length + ' videos keep their titles and runtimes until the section is supplied)');
  if (nAlias) console.log('  ' + nAlias + ' alias' + (nAlias === 1 ? '' : 'es') + ' recorded — a student\'s ticks follow the new titles');
});
MICRO.courses.forEach(c => { if (c.notYetSupplied) console.log('  not supplied yet (' + c.course + '): ' + c.notYetSupplied.join('; ')); });
MICRO.courses.forEach(c => { if (c.lessons && c.lessons !== c.videos.length) console.log('  ' + c.course + ': ' + c.videos.length + ' videos of Sketchy\'s ' + c.lessons + ' lessons — ' + c.note); });
if (after !== before) console.log('catalog now ' + cat.videos.length + ' videos');
