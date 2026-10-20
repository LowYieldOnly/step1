/* Reader for data/uworld-library.txt — UWorld's own category listing of its library.
 *
 * Generators that map articles use this to check that every title they declare is a
 * real UWorld title, verbatim, and to know which categories an article sits in. Titles
 * are compared after collapsing whitespace (the source has stray double spaces).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'uworld-library.txt');
export const clean = s => s.replace(/\s+/g, ' ').trim();

/* UWorld category → catalog system. null = a cross-cutting category (anatomy, pharm,
   toxicology…) that says nothing about an article's organ system, or one the catalog
   has no system for (ENT). */
export const CATEGORY_SYS = {
  'Allergy & Immunology': 'Immunology',
  'Anatomy & Histology': null,
  'Cardiology': 'Cardiology',
  'Cell Bio, Biochem, Genetics': null,
  'Dermatology': 'Dermatology',
  'Ear, Nose & Throat (ENT)': null,
  'Embryology': null,
  'Endocrinology': 'Endocrinology',
  'Gastroenterology': 'Gastroenterology',
  'Gynecology': 'Reproductive',
  'Hematology & Oncology': 'Hematology',
  'Infectious Diseases': 'Infectious Disease',
  'Male Reproductive System': 'Reproductive',
  'Nephrology': 'Renal',
  'Neurology': 'Neurology',
  'Obstetrics': 'Reproductive',
  'Ophthalmology': 'Ophthalmology',
  'Pharmacology': null,
  'Physiology': null,
  'Preclinical/Basic sciences': null,
  'Psychiatry': 'Psychiatry',
  'Pulmonary & Critical Care': 'Pulmonary',
  'Rheumatology/Orthopedics': 'Musculoskeletal',
  'Toxicology': null,
  'Social Sciences': null,
};

export function loadLibrary() {
  const byCat = {};            // category → [clean title] (UWorld's order, duplicates removed)
  const catsOf = {};           // clean title → [category]
  let cur = null;
  fs.readFileSync(FILE, 'utf8').split('\n').forEach(line => {
    if (!line.trim() || line.startsWith('# ') || line === '#') return;
    if (line.startsWith('## ')) {
      cur = line.slice(3).trim();
      if (!(cur in CATEGORY_SYS)) throw new Error('unknown UWorld category in library file: ' + cur);
      byCat[cur] = byCat[cur] || [];
      return;
    }
    if (!cur) throw new Error('article before any category: ' + line);
    const t = clean(line);
    if (!byCat[cur].includes(t)) byCat[cur].push(t);
    (catsOf[t] = catsOf[t] || []);
    if (!catsOf[t].includes(cur)) catsOf[t].push(cur);
  });
  /* The catalog systems this title may be filed under: the organ systems of its
     categories, or any system at all if every category it sits in is cross-cutting. */
  const allowedSys = t => {
    const s = (catsOf[t] || []).map(c => CATEGORY_SYS[c]).filter(Boolean);
    return s.length ? [...new Set(s)] : null;
  };
  return { byCat, catsOf, allowedSys, has: t => !!catsOf[clean(t)] };
}
