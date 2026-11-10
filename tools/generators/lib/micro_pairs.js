/* Sketchy Micro ↔ Boards & Beyond microbiology.
 *
 * When a unit schedules a Sketchy Micro video, the Boards & Beyond Infectious Disease video
 * that teaches the same organism is scheduled with it (Dylan, 2026-11-10). B&B teaches
 * micro in broad videos ("Gram Negative Rods", "Protozoa"), so one B&B video answers to
 * several Sketchy ones; it goes in the week of the EARLIEST of them, so it lands with the
 * first organism it covers. A B&B video a unit already places for a lecture of its own
 * keeps that week.
 *
 * The pairing is by organism, and it is a unit decision, not a switch decision: like every
 * other video in a unit, the B&B video is scheduled when B&B is on, whether or not Sketchy
 * Micro is.
 *
 * Every Sketchy Micro title has an entry here, so a title the catalog gains later fails the
 * build until someone decides where B&B teaches it. `null` means no B&B Infectious Disease
 * video is a clear home for it (yet); a unit that schedules one of those says so when its
 * generator runs.
 *
 * Where B&B puts an organism comes from B&B's own section names, and, where the course's
 * M1 schedule (m1data.json) cites a B&B section for an organism, from that: Pseudomonas,
 * Bordetella and Legionella under Gram Negative Rods; Neisseria meningitidis and
 * Haemophilus under Other Gram Negatives; Bacillus, Nocardia and Actinomyces under Other
 * Gram Positives; Enterococcus and Strep bovis under Streptococci; leprosy under
 * Mycobacteria; the dimorphic fungi under Fungal Pneumonias; the cutaneous mycoses under
 * Fungal Skin Infections; Plasmodium under Malaria; parvovirus under DNA Viruses; influenza,
 * RSV and measles under RNA Viruses.
 */

const B = 'bnb|Infectious Disease|';
const STAPH = B + 'Bacteria|Staphylococci';
const STREP = B + 'Bacteria|Streptococci';
const OGP = B + 'Bacteria|Other Gram Positives';
const GNR = B + 'Bacteria|Gram Negative Rods';
const OGN = B + 'Bacteria|Other Gram Negatives';
const SPIRO = B + 'Bacteria|Spirochetes';
const ZOO = B + 'Bacteria|Zoonotic Infections';
const MYCO = B + 'Bacteria|Mycobacteria';
const FPNA = B + 'Fungi|Fungal Pneumonias';
const FSKIN = B + 'Fungi|Fungal Skin Infections';
const OPPF = B + 'Fungi|Opportunistic Fungal Infections';
const MAL = B + 'Parasites and Helminths|Malaria';
const PROTO = B + 'Parasites and Helminths|Protozoa';
const HELM = B + 'Parasites and Helminths|Helminths';
const DNAV = B + 'Parasites and Helminths|DNA Viruses';
const HERP = B + 'Parasites and Helminths|Herpes Viruses';
const RNAV = B + 'Parasites and Helminths|RNA Viruses';
const HEP = B + 'Parasites and Helminths|Viral Hepatitis';
const HIV = B + 'Parasites and Helminths|HIV';

/* Sketchy Micro section → B&B video, with per-title exceptions. */
const BY_SECTION = {
  'Gram-Positive Cocci': STREP,
  'Gram-Positive Bacilli': OGP,
  'Gram-Positive Branching Filamentous Rods': OGP,
  'Gram-Negative Cocci': OGN,
  'Gram-Negative Bacilli: Enteric Tract': GNR,
  'Gram-Negative Bacilli: Respiratory Tract': GNR,
  'Gram-Negative Bacilli: Zoonotics': ZOO,
  'Mycobacteria': MYCO,
  'Spirochetes': SPIRO,
  'Gram-Indeterminate Bacteria': ZOO,   // Rickettsia and Coxiella: tick-, louse- and livestock-borne, with the zoonoses
  'RNA Viruses: Positive Sense': RNAV,
  'RNA Viruses: Negative Sense': RNAV,
  'DNA Viruses': DNAV,
  'Systemic Mycoses': FPNA,
  'Cutaneous Mycoses': FSKIN,
  'Opportunistic Fungal Infections': OPPF,
  'Protozoa of the Intestinal Tract': PROTO,
  'Protozoa of the CNS': PROTO,
  'Protozoa of the Blood': PROTO,
  'Protozoa: Other Tissue': PROTO,
  'Helminths: Nematodes': HELM,
  'Helminths: Trematodes & Cestodes': HELM,
  'Ectoparasites': null,   // scabies and lice: no B&B Infectious Disease video
};
const BY_TITLE = {
  'Staphylococcus aureus': STAPH,
  'Staphylococcus epidermidis & saprophyticus': STAPH,
  'Haemophilus influenzae': OGN,
  // not yet paired: no B&B Infectious Disease video is a clear home
  'Bacteroides fragilis': null,
  'Burkholderia pseudomallei & cepacia complex': null,
  'Chlamydia trachomatis, Chlamydophila pneumoniae, Chlamydophila psittaci': null,
  'Gardnerella vaginalis': null,
  'Mycoplasma pneumoniae': null,
  // hepatitis viruses have their own B&B video, as does HIV
  'Hepatitis A Virus (Picornaviridae)': HEP,
  'Hepatitis C Virus (Flaviviridae)': HEP,
  'Hepatitis B Viral Basics & Infectious Diseases (Hepadnaviridae)': HEP,
  'Hepatitis B Viral Life Cycle (Hepadnaviridae) [Old Version]': HEP,
  'HIV Overview (Retroviridae)': HIV,
  'HIV Life Cycle (Retroviridae)': HIV,
  // the herpesviruses are B&B's own video
  'Herpes Simplex Virus Types 1 & 2 (Herpesviridae)': HERP,
  'Cytomegalovirus (Herpesviridae)': HERP,
  'Epstein-Barr Virus (Herpesviridae)': HERP,
  'Varicella-Zoster Virus (Herpesviridae)': HERP,
  'HHV-6 & Roseola (Herpesviridae)': HERP,
  'HHV-8 & Kaposi\'s Sarcoma (Herpesviridae)': HERP,
  // Plasmodium is B&B's Malaria video
  'Plasmodium: Infection & Lifecycle': MAL,
  'Plasmodium: Treatment & PPX': MAL,
};

/* The B&B key a Sketchy Micro video pairs with: a key, null (none yet), or undefined (the
   title is new and has no decision). */
export function microPair(v) {
  if (v.res !== 'skmicro') return undefined;
  if (Object.prototype.hasOwnProperty.call(BY_TITLE, v.name)) return BY_TITLE[v.name];
  if (Object.prototype.hasOwnProperty.call(BY_SECTION, v.cat || '')) return BY_SECTION[v.cat || ''];
  return undefined;
}

/* Given the catalog and a unit's key→week map, the B&B videos to add and where.
   Returns { add: {bnbKey: week}, kept: [bnbKeys the unit already places],
             unpaired: [Sketchy titles the unit schedules with no B&B home],
             problems: [anything that must stop the build] }. */
export function microPairs(videos, videoWeek) {
  const K = v => v.res + '|' + v.sys + '|' + (v.cat || '') + '|' + v.name;
  const keys = new Set(videos.map(K));
  const problems = [];
  videos.filter(v => v.res === 'skmicro').forEach(v => {
    const t = microPair(v);
    if (t === undefined) problems.push('Sketchy Micro title with no pairing decision: ' + v.name + ' (' + v.cat + ')');
    else if (t !== null && !keys.has(t)) problems.push('pairing points at a B&B video the catalog does not have: ' + t);
  });
  const titles = new Set(videos.filter(v => v.res === 'skmicro').map(v => v.name));
  Object.keys(BY_TITLE).forEach(n => { if (!titles.has(n)) problems.push('pairing names a Sketchy Micro title the catalog does not have: ' + n); });
  const add = {}, kept = new Set(), unpaired = [];
  videos.filter(v => v.res === 'skmicro' && videoWeek[K(v)] != null).forEach(v => {
    const t = microPair(v), w = videoWeek[K(v)];
    if (t === null) { unpaired.push(v.name); return; }
    if (t === undefined) return;
    if (videoWeek[t] != null) { kept.add(t); return; }
    add[t] = add[t] == null ? w : Math.min(add[t], w);
  });
  return { add, kept: [...kept], unpaired, problems };
}
