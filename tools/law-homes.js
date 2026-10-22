/* Where every resource system is watched — the declarations the #1 law audit holds us to.
 *
 * THE LAW (Dylan, 2026-10-20, verbatim): "Always remember that our #1 law is to make sure
 * every brody lecture is mapped to third party, and that the sum total videos within a
 * resource are watched in that specific system even if brody does not cover that topic."
 *
 * A system a Brody unit owns (its `systems`) is accounted for by that unit. Every OTHER
 * system in the catalog must be declared here: which Brody unit will hold it, and from
 * when. tools/law.mjs fails on any video that no unit holds and no declaration covers, and
 * on any declaration whose date has passed without the unit holding it. "Waiting" is only
 * ever allowed for a NAMED unit — never for a unit nobody has seen on a calendar.
 *
 *   unit   the Brody unit (or planned section) that will hold it
 *   from   the date that unit starts; after it, every video must actually be held.
 *          null = the unit's calendar hasn't been supplied yet — listed loudly, every session.
 *   note   why, in a sentence
 */
import { WAITING as ID_WAITING, matchRef } from './generators/data/id-homes.js';

/* Resources that have left the repertoire. Their videos are no longer owed a home: the units
   already built keep the ones they hold (students mid-plan still use them), but nothing new
   is mapped and the audit doesn't ask for it. */
export const RETIRED = {
  bootcamp: { since: '2026-10-22',
    note: 'leaves the repertoire after the Musculoskeletal & Skin unit (Dylan, 2026-10-22); the four built units keep theirs' },
};

export const WAITING = {
  'Gastroenterology': { unit: 'GI, Nutrition & Multisystem (SYST 9500)', from: '2026-11-09',
    note: 'the next M2 unit; build it before it starts' },
  'Endocrinology': { unit: 'Term 4 endocrine unit', from: null,
    note: 'Term 4 calendar not supplied yet' },
  'Reproductive': { unit: 'Term 4 reproductive unit', from: null,
    note: 'Term 4 calendar not supplied yet' },
  'Biochemistry': { unit: 'M1 section (planned) — B&B comprehensive', from: null,
    note: 'B&B is M1 scope (decided 2026-10-22); Bootcamp Biochemistry has no Brody home yet — decision needed' },
  'Genetics': { unit: 'M1 section (planned)', from: null,
    note: 'MBOM teaches it; comprehensive or lecture-by-lecture is open (D12); Bootcamp has no Brody home yet' },
  'Cell Biology': { unit: 'M1 section (planned)', from: null,
    note: 'MBOM teaches it; comprehensive or lecture-by-lecture is open (D12); Bootcamp has no Brody home yet' },
  'Immunology': { unit: 'no Brody unit identified', from: null,
    note: 'M1 HMI (Spring) or M2 — decision needed; MSK holds the rheumatology' },
  'Biostats/Epi': { unit: 'no Brody unit identified', from: null,
    note: 'M1 FOD teaches biostatistics; M1 scope is lecture-by-lecture — decision needed' },
  'Behavioral Science': { unit: 'no Brody unit identified', from: null,
    note: 'Brody threads psychiatry and ethics through M2 units — decision needed' },
  'Basic Pharmacology': { unit: 'no Brody unit identified', from: null,
    note: 'M1 Foundations of Pharm — decision needed' },
  'Pathology': { unit: 'no Brody unit identified', from: null,
    note: 'general pathology (Pathoma 1–3, B&B General Topics); M1 Pathology course — decision needed' },
  // Brody has no Infectious Disease unit: infections are taught inside Cardiopulm, Neuro and
  // MSK. So ID is declared video by video in tools/generators/data/id-homes.js — each one held
  // by the unit whose lecture teaches it, or waiting there for a named unit. Anything else fails.
  'Infectious Disease': { rules: ID_WAITING.map(w => ({ match: v => w.items.some(r => matchRef(r, v)), unit: w.unit, from: w.from, note: w.note })) },
  // Videos a unit EXCLUDES from its own system, and where they go instead.
  '§excluded': { rules: [
    { match: v => (v.res === 'bnb' && v.cat === 'Cancer Drugs')
        || (v.res === 'skpharm' && ['Antimetabolites', 'DNA & Cellular Division', 'Kinase Inhibitors & Monoclonal Antibodies', 'Immunology'].includes(v.cat)),
      unit: 'GI, Nutrition & Multisystem (SYST 9500)', from: '2026-11-09',
      note: 'cancer pharmacology, excluded from Heme/Renal because Brody teaches it in SYST 9500' },
  ] },
};

/* Lecture sentinels: a lecture whose title says it teaches this system must have at least one
   video of that system scheduled in its own week. They catch a unit that shipped an
   infection lecture with no infection videos — which coverage files do too, but three units
   don't have one yet. */
export const SENTINELS = [
  { lecture: /infect|zoonot|granulomatous|immunocompromised|fever of unknown origin/i,
    system: 'Infectious Disease', why: 'an infection lecture with no infection videos' },
];
