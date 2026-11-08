/* Where each resource system's videos are watched, for the systems no built unit owns yet.
 *
 * A system a Brody unit owns (its `systems`) is scheduled by that unit. For every other
 * system this records which unit or section is expected to take it, and from when, so the
 * next unit's build knows what is waiting for it. It is a record, not a gate: nothing fails
 * when a system has no home.
 *
 *   unit   the Brody unit (or planned section) expected to hold it
 *   from   the date that unit starts; null = its calendar hasn't been supplied yet
 *   note   why, in a sentence
 */

/* Resources that have left the repertoire. Their videos are no longer owed a home: the units
   already built keep the ones they hold (students mid-plan still use them), but nothing new
   is mapped. GI, Nutrition & Multisystem, the first unit after, carries noRes:["bootcamp"]. */
export const RETIRED = {
  bootcamp: { since: '2026-10-22',
    note: 'leaves the repertoire after the Musculoskeletal & Skin unit (Dylan, 2026-10-22); the four units before it keep theirs' },
};

export const WAITING = {
  'Endocrinology': { unit: 'Term 4 endocrine unit', from: null,
    note: 'Term 4 calendar not supplied yet' },
  'Reproductive': { unit: 'Term 4 reproductive unit', from: null,
    note: 'Term 4 calendar not supplied yet' },
  'Biochemistry': { unit: 'M1 section (planned) — B&B comprehensive', from: null,
    note: 'B&B is M1 scope (decided 2026-10-22); GI pulls in the vitamins, ethanol and inborn errors its lectures teach' },
  'Genetics': { unit: 'M1 section (planned)', from: null,
    note: 'MBOM teaches it; comprehensive or lecture-by-lecture is open (D12)' },
  'Cell Biology': { unit: 'M1 section (planned)', from: null,
    note: 'MBOM teaches it; comprehensive or lecture-by-lecture is open (D12)' },
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
  // Brody has no Infectious Disease unit: infections are taught inside the system units, and
  // each unit pulls in the organisms its own lectures teach (MSK's infection week, GI's gut and
  // liver infections). Giving every ID video a home was set aside (Dylan, 2026-11-08).
  'Infectious Disease': { unit: 'no Brody unit; pulled in lecture by lecture', from: null,
    note: 'each unit includes the organisms its lectures name; the rest has no home' },
};
