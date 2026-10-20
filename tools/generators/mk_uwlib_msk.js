/* UWorld Medical Library articles for the Musculoskeletal & Skin unit.
 *
 * PROVENANCE. Titles supplied by hand from the UWorld library's Dermatology section and
 * its musculoskeletal/rheumatology section (2026-10-20). No export, no API: this
 * declared list is the whole record. Titles are verbatim — the title IS the item's
 * identity (itemId), so editing one orphans anyone's progress on it. The one change:
 * runs of whitespace collapse to one space, since a double space in a pasted title is
 * a copy artefact, not part of the name.
 *
 * NO RUNTIMES. min:0, deliberately — articles are paced by count per day on their own
 * budget (brodyArtLoads / brodyArtPace). See mk_uwlib.js.
 *
 * SHARED ARTICLES. UWorld files some articles under more than one section. Five of these
 * titles already exist as Neurology articles in the Nervous & Sensory unit. They are
 * the same article, so they are NOT added again: this unit pulls the existing item in
 * through `include` and maps it here too. Progress is shared — an article read during
 * Neuro shows as done here. Any other title that collides with an existing article is
 * an error, so a duplicate can't slip in by accident.
 *
 * THE WEEK MAPPING is editorial, read off BRODY_MSK's lecture list:
 *   W1 — Skin, Dermatopathology & Anaesthesia: dermpath benign/neoplastic, soft-tissue
 *        neoplasms, general & local anaesthesia, derm lesions, common skin disorders,
 *        skin infections, skin signs of internal disease, skin trauma, derm emergencies.
 *   W2 — Bone, Joint & Muscle Pathology: skeletal muscle & systemic inflammatory,
 *        joints, bone (non-neoplastic, neoplastic), RA management, anti-gout & derm
 *        drugs, soft tissue, connective tissue disease, peripheral neuropathy,
 *        mono- and polyarthritis.
 *   W3 — Spine, Limbs, Environment & Infection: environmental pathology, ID (zoonotic,
 *        granulomatous, immunocompromised host, FUO), back pain, paediatric fractures.
 * Judgement calls are commented inline. Anatomy with no lecture is marked BALANCE, as
 * in mk_msk.js.
 *
 * WEEK 1 IS A FIREHOSE AND THIS DOES NOT HIDE IT. Almost all of dermatology is week 1
 * material and the week-1 quiz is four days after the unit starts. That cannot be read
 * at a realistic count per day; the app flags the week and paces the rest instead of
 * inventing a number. Moving derm articles into later weeks to flatten the load would
 * misstate what the week-1 quiz covers, so they are not moved. Even-pace mode is the
 * answer for a student who wants a flat spread.
 *
 * Writes catalog.json (idempotent — adds only what's missing) and splices artWeek into
 * BRODY_MSK in index.html. artWeek alone decides which articles are in the unit.
 *
 *   node tools/generators/mk_uwlib_msk.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CAT = path.join(REPO, 'catalog.json');
const APP = path.join(REPO, 'index.html');
const BLOCK = 'msk-skin';
import { loadLibrary, clean } from './lib/uwlibrary.js';

/* ---------------- Dermatology — [title, week] ---------------- */
const DERM = [
  // ---- foundations ----
  ['Basic dermatology vocabulary', 1],
  ['Histology: Skin appendages (hair follicles, sebaceous glands, sweat glands)', 1],

  // ---- dermatopathology: benign / inflammatory / common skin disorders (W1) ----
  ['Acanthosis nigricans', 1],          // also "skin signs of internal disorders"
  ['Acne vulgaris', 1],
  ['Alopecia', 1],
  ['Atopic dermatitis', 1],
  ['Benign cutaneous vascular lesions', 1],
  ['Benign neonatal rashes', 1],
  ['Bullous pemphigoid and pemphigus vulgaris', 1],
  ['Congenital dermal melanocytosis', 1],
  ['Congenital melanocytic nevi', 1],
  ['Dermatitis herpetiformis', 1],      // also a skin sign of coeliac disease
  ['Dermatoses of pregnancy', 1],
  ['Diaper dermatitis', 1],
  ['Epidermoid (epidermal inclusion) cyst', 1],
  ['Epidermolysis bullosa', 1],
  ['Erythema multiforme', 1],
  ['Erythema nodosum', 1],              // skin sign of internal disease (sarcoid, IBD)
  ['Hidradenitis suppurativa', 1],
  ['Ichthyosis vulgaris and other ichthyoses', 1],
  ['Infantile hemangiomas', 1],
  ['Keloids and hypertrophic scars', 1],
  ['Keratosis pilaris', 1],
  ['Lichen planus and lichenoid drug eruption', 1],
  ['Melasma', 1],
  ['Oculocutaneous albinism', 1],
  ['Pityriasis rosea', 1],
  ['Pseudofolliculitis barbae', 1],
  ['Psoriasis', 1],
  ['Pyoderma gangrenosum', 1],          // skin sign of internal disease (IBD)
  ['Recurrent aphthous stomatitis (canker sores)', 1],
  ['Rosacea', 1],
  ['Seborrheic dermatitis', 1],
  ['Seborrheic keratosis', 1],
  ['Vitiligo', 1],
  ['Xeroderma pigmentosum', 1],

  // ---- dermatopathology: neoplastic; soft tissue neoplastic (W1) ----
  ['Actinic keratosis', 1],
  ['Melanoma', 1],
  ['Nonmelanoma skin cancer: Squamous cell carcinoma and basal cell carcinoma', 1],
  ['Cutaneous T-cell lymphoma', 1],
  ['Benign soft tissue tumors and tumor-like lesions', 1],   // PATH 66 Soft Tissue: Neoplastic
  ['Lipoma', 1],
  ['Kaposi sarcoma', 3],                // HHV-8 in the immunocompromised host (W3), where
                                        // this unit already schedules B&B HIV and HHV-8

  // ---- skin infections, including the viral exanthems (W1) ----
  ['Cellulitis and skin abscess (skin and soft tissue infections)', 1],
  ['Erysipelas', 1],
  ['Impetigo', 1],
  ['Infectious folliculitis', 1],
  ['Ecthyma gangrenosum', 1],
  ['Dermatophyte (tinea) infections', 1],
  ['Onychomycosis', 1],
  ['Tinea versicolor', 1],
  ['Cutaneous warts', 1],
  ['Molluscum contagiosum', 1],
  ['Scabies', 1],
  ['Lice', 1],
  ['Bedbugs', 1],
  ['Cutaneous larva migrans', 3],       // a zoonosis (dog/cat hookworm) — W3 Zoonotic Infections
  ['Chickenpox', 1],
  ['Measles', 1],
  ['Rubella infection', 1],
  ['Roseola', 1],
  ['Erythema infectiosum (fifth disease)', 1],
  ['Hand-foot-and-mouth disease', 1],
  ['Herpangina', 1],
  ['Pediatric viral exanthems', 1],
  ['Scarlet fever', 1],

  // ---- skin trauma and wounds (W1 "Skin Trauma") ----
  ['Animal and human bites', 3],        // Pasteurella / Capnocytophaga — W3 Zoonotic
                                        // Infections, where Sketchy Pasteurella already sits
  ['Burns', 1],                         // could also be W3 Environmental Pathology; the
  ['Chemical burns', 1],                // clinical skin-trauma lecture is the closer fit
  ['Sunburn', 1],
  ['Traumatic lacerations and wound repair', 1],
  ['Wound dehiscence', 1],
  ['Wound healing: Pathophysiology', 1],
  ['Wounds: Clinical evaluation and management', 1],
  ['Lower extremity ulcers', 1],
  ['Pressure ulcers', 1],

  // ---- derm emergencies (W1) ----
  ['DRESS syndrome', 1],
  ['Stevens-Johnson syndrome/toxic epidermal necrolysis', 1],
  ['Staphylococcal scalded skin syndrome', 1],
  ['Staphylococcal toxic shock syndrome', 1],
];

/* ---------------- Musculoskeletal & rheumatology — [title, week] ---------------- */
const MSK = [
  // ---- W1: soft-tissue infection emergency; anatomy with no lecture ----
  ['Necrotizing fasciitis', 1],         // Derm Emergencies / Skin Infections
  ['Anatomy: Layers of the abdominal wall', 1],   // BALANCE — no lecture; sits with the
                                                  // thoracic-wall anatomy already in W1

  // ---- W2: skeletal muscle & systemic inflammatory ----
  ['Clostridial myonecrosis', 2],
  ['Drug-induced myopathy', 2],
  ['Idiopathic inflammatory myopathies: Dermatomyositis and polymyositis', 2],
  ['Mitochondrial myopathies', 2],
  ['Rhabdomyolysis', 2],
  ['Skeletal muscle relaxants: antispastic and spasmolytic agents', 2],  // no lecture of its
                                        // own; with muscle rather than W1 anaesthesia
  ['Adult-onset Still disease', 2],
  ['Autoinflammatory diseases (including familial Mediterranean fever)', 2],
  ['IgG4-related disease', 2],
  ['Polymyalgia rheumatica', 2],
  ['Fibromyalgia', 2],

  // ---- W2: joints, mono- and polyarthritis ----
  ['Osteoarthritis', 2],
  ['Rheumatoid arthritis', 2],
  ['Juvenile idiopathic arthritis', 2],
  ['Crystal arthropathies: gout and pseudogout', 2],
  ['Septic arthritis', 2],
  ['Ankylosing spondylitis', 2],
  ['Reactive arthritis', 2],
  ['Laboratory testing in autoimmune rheumatic disease: Inflammatory markers, autoantibodies, and others', 2],

  // ---- W2: connective tissue disease and vasculitis ----
  ['Systemic lupus erythematous', 2],   // sic — UWorld's spelling, kept as the identity
  ['Scleroderma and CREST syndrome', 2],
  ['Sjögren disease', 2],
  ['Raynaud phenomenon', 2],
  ['Relapsing polychondritis', 2],
  ['Behçet disease', 2],
  ['Ehlers-Danlos syndrome (EDS)', 2],
  ['Vasculitis: An overview', 2],
  ['ANCA-associated vasculitis: granulomatosis with polyangiitis (GPA), eosinophilic granulomatosis with polyangiitis (EGPA), and microscopic polyangiitis (MPA).', 2],
  ['Giant cell (temporal) arteritis', 2],
  ['Polyarteritis nodosa', 2],
  ['Kawasaki disease', 2],
  ['Cryoglobulinemia', 2],
  ['Thromboangiitis obliterans (Buerger disease)', 2],

  // ---- W2: bone, non-neoplastic and neoplastic ----
  ['Achondroplasia', 2],
  ['Osteogenesis imperfecta', 2],
  ['Paget disease of bone', 2],
  ['Osteomyelitis', 2],
  ['Vitamin D deficiency rickets', 2],
  ['Chronic kidney disease: mineral and bone disorders', 2],
  ['Benign and malignant bone tumors', 2],
  ['Osteosarcoma', 2],
  ['Ewing sarcoma', 2],
  ['Giant cell tumor', 2],

  // ---- W2: soft tissue (tendon, bursa, fascia, cysts) ----
  ['Adhesive capsulitis', 2],
  ['Bursitis', 2],
  ['Rotator cuff syndrome', 2],         // with the other tendinopathies under "Soft Tissue",
                                        // not W3 shoulder trauma
  ['Elbow tendinopathy', 2],
  ['De Quervain tendinopathy', 2],
  ['Dupuytren contracture', 2],
  ['Ganglion cyst', 2],
  ['Popliteal (Baker) cyst', 2],

  // ---- W2: peripheral neuropathy ----
  ['Carpal tunnel syndrome and median nerve compression', 2],

  // ---- W2: embryology, no lecture ----
  ['Embryology of limb development', 2],            // BALANCE
  ['Embryology of the musculoskeletal system', 2],  // BALANCE

  // ---- W3: spine and back pain ----
  ['Anatomy: Vertebrae', 3],
  ['Neck pain', 3],
  ['Cervical spine clearance', 3],
  ['Spondylosis, spondylolysis, and spondylolisthesis', 3],
  ['Vertebral compression fracture', 3],
  ['Spinal epidural abscess', 3],
  ['Lumbosacral plexus', 3],

  // ---- W3: regional anatomy and limb disorders (B&B's Anatomy & Orthopedics is W3) ----
  ['Anatomy: Shoulder', 3],
  ['Anatomy: Wrist', 3],
  ['Anatomy: Hip', 3],
  ['Anatomy: Knee', 3],
  ['Overuse injuries of the knee', 3],
  ['Common adult foot deformities', 3],
  ['Heel pain', 3],
  ['Plantar fasciitis', 3],
  ['Infections of the hand', 3],

  // ---- W3: trauma and fractures ----
  ['Trauma: Major extremity trauma', 3],
  ['Upper and lower extremity fractures', 3],
  ['Compartment syndrome', 3],
  ['Hip dislocations', 3],
  ['Hip fractures', 3],
  ['Pelvic fractures', 3],
  ['Knee trauma', 3],
  ['Shoulder dislocations', 3],
  ['Traumatic hand and finger injuries', 3],
  ['Traumatic nail injuries', 3],

  // ---- W3: paediatric orthopaedics ("Pediatric Fractures") ----
  ['Fracture patterns in children', 3],
  ['Nonaccidental trauma in children', 3],
  ['Radial head subluxation', 3],
  ['Developmental dysplasia of the hip', 3],
  ['Evaluation of pediatric hip pain', 3],
  ['Legg-Calvé-Perthes disease', 3],
  ['Slipped capital femoral epiphysis', 3],
  ['Transient synovitis', 3],
  ['Osgood-Schlatter disease', 3],
  ['Congenital clubfoot (congenital talipes equinovarus)', 3],
  ['Genu valgum and varum', 3],
  ['Pediatric spinal deformities: scoliosis, kyphosis, and lordosis', 3],
  ['Torticollis in children', 3],
  ['Growing pains', 3],
  ['Short stature', 3],
];

/* Already in the catalog (all Neurology, from the Nervous & Sensory unit). The same
   article, so it is mapped here rather than copied: [title, week here]. */
const SHARED = [
  // cross-listed by UWorld under Dermatology or Rheumatology/Orthopedics
  ['Sturge-Weber syndrome', 1],                     // with B&B Neurocutaneous (W1)
  ['Malignant hyperthermia', 1],                    // PHARM General Anesthesia 1
  ['Duchenne and Becker muscular dystrophy', 2],    // skeletal muscle
  ['Brachial plexus injuries', 3],                  // with B&B Brachial Plexus (W3)
  ['Low back pain', 3],                             // Clin App Back Pain
  // not cross-listed, but this unit has a lecture on them
  ['Guillain-Barré syndrome', 2],                   // Clin App Peripheral Neuropathy
  ['Diabetic neuropathy', 2],                       // Clin App Peripheral Neuropathy
  ['Cauda equina syndrome', 3],                     // Clin App Back Pain
];

/* From other UWorld categories, for a named lecture in this unit: [title, catalog
   system, week]. The system is the article's permanent home; the generator checks it
   against UWorld's categories (an article UWorld files under an organ system must live
   in that system). Pharmacology-only → Anesthesia or Basic Pharmacology; Toxicology-
   only → Pathology; Social Sciences → Behavioral Science. */
const EXTRA = [
  // ---- W1 · PHARM General Anesthesia 1, Local Anesthetics ----
  ['Intravenous and inhaled anesthetics', 'Anesthesia', 1],
  ['Local anesthetic agents', 'Anesthesia', 1],
  ['Skeletal muscle relaxants: Neuromuscular blocking agents', 'Anesthesia', 1],
  // ---- W1 · Common Skin Disorders, Derm Lesions (Allergy & Immunology) ----
  ['Allergic/irritant contact dermatitis', 'Immunology', 1],
  ['Angioedema and urticaria', 'Immunology', 1],
  ['Photosensitizing drug reactions', 'Immunology', 1],
  // ---- W1 · Skin Infections (Infectious Diseases) ----
  ['Staphylococcus', 'Infectious Disease', 1],
  ['Herpes simplex virus (HSV)', 'Infectious Disease', 1],
  ['Herpes zoster (shingles)', 'Infectious Disease', 1],
  ['Sporotrichosis', 'Infectious Disease', 1],
  // ---- W1 · tissue under the dermatopathology (no lecture of its own) ----
  ['Histology: Epithelial tissue', 'Cell Biology', 1],             // with B&B Epithelial Cells
  ['Anatomy: Fascia (superficial and deep)', 'Musculoskeletal', 1], // BALANCE
  ['Anatomy: Neck', 'Musculoskeletal', 1],                          // BALANCE, with W1 neck anatomy

  // ---- W2 · PHARM Management of RA; Anti-gout Drugs ----
  ['Nonsteroidal anti-inflammatory drugs (NSAIDs)', 'Basic Pharmacology', 2],
  ['COX-1 and COX-2 inhibitors', 'Basic Pharmacology', 2],
  ['Eicosanoids', 'Basic Pharmacology', 2],
  ['Immunosuppressive therapy: Conventional immunosuppressants', 'Immunology', 2],
  ['Immunosuppressive therapy: Biologics & targeted immunosuppressants', 'Immunology', 2],
  // ---- W2 · Bone: Non-Neoplastic ----
  ['Osteoporosis', 'Endocrinology', 2],
  ['Osteoporosis management', 'Endocrinology', 2],
  ['Vitamin D analogues', 'Endocrinology', 2],
  ['Formation and remodeling of bone', 'Endocrinology', 2],
  ['Ossification and skeletal growth', 'Musculoskeletal', 2],
  ['Histology: Cartilage', 'Musculoskeletal', 2],
  ['Histology: Muscle', 'Musculoskeletal', 2],
  // ---- W2 · Connective Tissue Disease ----
  ['Mechanisms of autoimmunity', 'Immunology', 2],
  ['Extracellular matrix and connective tissue', 'Cell Biology', 2],
  ['Marfan syndrome', 'Cardiology', 2],
  // ---- W2 · Clin App Peripheral Neuropathy ----
  ['Peripheral nerve structure and function', 'Neurology', 2],
  ['Charcot-Marie-Tooth disease', 'Neurology', 2],
  ['Meralgia paresthetica', 'Neurology', 2],

  // ---- W3 · PATH Environmental Pathology ----
  ['Carbon monoxide poisoning', 'Pathology', 3],
  ['Cyanide poisoning', 'Pathology', 3],
  ['Lead poisoning', 'Pathology', 3],
  ['Heavy metal toxicity: Lead, iron, mercury, and arsenic', 'Pathology', 3],
  ['Arsenic poisoning', 'Pathology', 3],
  ['Heat stroke', 'Pathology', 3],
  ['Cold injuries', 'Pathology', 3],
  ['Electrical injuries, including lightning injuries', 'Pathology', 3],
  ['Radiation exposure', 'Pathology', 3],
  ['Snakebites', 'Pathology', 3],
  ['Spider bites', 'Pathology', 3],
  ['Arthropod bites and infestations', 'Pathology', 3],
  ['Drowning (submersion injury)', 'Pulmonary', 3],
  ['High altitude illness', 'Pulmonary', 3],
  ['Decompression illness', 'Pulmonary', 3],
  // ---- W3 · PATH Clinical Diagnosis of ID; Laboratory Practices ----
  ['Basic bacteriology: Structure, virulence factors, and genetics', 'Infectious Disease', 3],
  // ---- W3 · PATH Zoonotic Infections ----
  ['Bartonella henselae infections', 'Infectious Disease', 3],
  ['Brucellosis', 'Infectious Disease', 3],
  ['Ehrlichia and Anaplasma', 'Infectious Disease', 3],
  ['Q fever (Coxiella burnetii infection)', 'Infectious Disease', 3],
  ['Leptospirosis', 'Infectious Disease', 3],
  ['Lyme disease', 'Infectious Disease', 3],
  ['Rocky Mountain Spotted Fever', 'Infectious Disease', 3],
  ['Yersinia pestis', 'Infectious Disease', 3],
  ['Anthrax', 'Infectious Disease', 3],
  ['Rabies', 'Infectious Disease', 3],
  // ---- W3 · PATH Granulomatous Diseases ----
  ['Tuberculosis', 'Infectious Disease', 3],
  ['Nontuberculous mycobacteria (NTM)', 'Infectious Disease', 3],
  ['Leprosy (Hansen disease): Mycobacterium leprae infection', 'Infectious Disease', 3],
  ['Histoplasmosis', 'Infectious Disease', 3],
  ['Blastomycosis', 'Infectious Disease', 3],
  ['Coccidioidomycosis', 'Infectious Disease', 3],
  ['Paracoccidioidomycosis', 'Infectious Disease', 3],
  ['Sarcoidosis', 'Pulmonary', 3],
  ['Chronic granulomatous disease', 'Immunology', 3],
  // ---- W3 · PATH Immunocompromised Host ----
  ['Acute HIV infection', 'Infectious Disease', 3],
  ['HIV lifecycle', 'Infectious Disease', 3],
  ['HIV antiretroviral therapy (ART) and the immune reconstitution inflammatory syndrome (IRIS)', 'Infectious Disease', 3],
  ['Pneumocystis jirovecii pneumonia', 'Infectious Disease', 3],
  ['Candida infections', 'Infectious Disease', 3],
  ['Aspergillosis', 'Infectious Disease', 3],
  ['Cryptococcal meningoencephalitis', 'Infectious Disease', 3],
  ['Cytomegalovirus (CMV)', 'Infectious Disease', 3],
  ['Toxoplasmosis', 'Infectious Disease', 3],
  ['Acute invasive fungal rhinosinusitis', 'Infectious Disease', 3],
  ['Neutropenic fever', 'Infectious Disease', 3],
  ['Solid organ transplant: Complications', 'Infectious Disease', 3],
  // ---- W3 · Ethics Health Law & Policy; Psych Ethical and Legal Issues ----
  ['Informed consent in medicine', 'Behavioral Science', 3],
  ['Medical decision-making capacity', 'Behavioral Science', 3],
  ['Patient confidentiality and privacy', 'Behavioral Science', 3],
  ['Medical malpractice', 'Behavioral Science', 3],
  // ---- W3 · regional anatomy, with B&B Anatomy & Orthopedics ----
  ['Anatomy: Elbow/forearm', 'Musculoskeletal', 3],
  ['Anatomy: Hand', 'Musculoskeletal', 3],
  ['Anatomy: Foot and ankle', 'Musculoskeletal', 3],
  ['Anatomy: Layers of the back', 'Musculoskeletal', 3],   // supports Back Pain
  ['Sesamoid bones', 'Musculoskeletal', 3],
];

/* ---------------- validate before touching anything ---------------- */
const lib = loadLibrary();
const cat = JSON.parse(fs.readFileSync(CAT, 'utf8'));
const K = v => v.res + '|' + v.sys + '|' + (v.cat || '') + '|' + v.name;
const problems = [];

const declared = DERM.map(([n, w]) => ({ name: clean(n), sys: 'Dermatology', w, from: 'Dermatology' }))
  .concat(MSK.map(([n, w]) => ({ name: clean(n), sys: 'Musculoskeletal', w, from: 'Rheumatology/Orthopedics' })))
  .concat(EXTRA.map(([n, s, w]) => ({ name: clean(n), sys: s, w, from: null })));
const shared = SHARED.map(([n, w]) => ({ name: clean(n), w }));

// 1. every title is a real UWorld title, in the category it was declared from
declared.concat(shared).forEach(d => { if (!lib.has(d.name)) problems.push('not a UWorld title (typo?): "' + d.name + '"'); });
declared.filter(d => d.from).forEach(d => {
  if (lib.has(d.name) && !lib.catsOf[d.name].includes(d.from)) problems.push('"' + d.name + '" is not in UWorld\'s ' + d.from + ' category');
});
// 2. no title declared twice
const names = declared.map(d => d.name).concat(shared.map(s => s.name));
const dup = names.filter((n, i) => names.indexOf(n) !== i);
if (dup.length) problems.push('declared twice: ' + [...new Set(dup)].join(', '));
// 3. weeks exist
declared.concat(shared).forEach(d => { if (![1, 2, 3].includes(d.w)) problems.push('"' + d.name + '" → week ' + d.w); });
// 4. completeness — every article in this unit's two categories is placed somewhere
['Dermatology', 'Rheumatology/Orthopedics'].forEach(c => (lib.byCat[c] || []).forEach(t => {
  if (!names.includes(t)) problems.push('UWorld ' + c + ' article not placed: "' + t + '"');
}));
// 5. an article's home system must agree with UWorld's organ categories
declared.forEach(d => {
  const ok = lib.has(d.name) ? lib.allowedSys(d.name) : null;
  if (ok && !ok.includes(d.sys)) problems.push('"' + d.name + '" filed under ' + d.sys + ', but UWorld puts it in ' + ok.join(' / '));
});
// 6. one catalog record per title: a new article must not exist under another system
const arts = cat.videos.filter(v => v.res === 'uwlib');
declared.forEach(d => {
  const hit = arts.find(v => v.name.toLowerCase() === d.name.toLowerCase() && v.sys !== d.sys);
  if (hit) problems.push('"' + d.name + '" already exists under ' + hit.sys + ' — declare it in SHARED');
});
const sharedItems = shared.map(s => {
  const v = arts.find(x => x.name === s.name);
  if (!v) problems.push('SHARED article "' + s.name + '" is not in the catalog');
  return v;
});
if (problems.length) { console.error('PROBLEMS:'); problems.forEach(p => console.error('  ' + p)); process.exit(1); }

/* ---------------- catalog ---------------- */
const have = new Set(cat.videos.map(K));
const wanted = declared.map(d => ({ res: 'uwlib', sys: d.sys, cat: '', name: d.name, min: 0 }));
const add = wanted.filter(v => !have.has(K(v)));
const declaredKeys = new Set(wanted.map(K));
const stranded = arts.filter(v => (v.sys === 'Dermatology' || v.sys === 'Musculoskeletal') && !declaredKeys.has(K(v)));
if (stranded.length) { console.error('catalog has articles no longer declared here:', stranded.map(v => v.name)); process.exit(1); }
if (add.length) {
  let last = -1;
  cat.videos.forEach((v, i) => { if (v.res === 'uwlib') last = i; });
  cat.videos.splice(last + 1, 0, ...add);
  fs.writeFileSync(CAT, JSON.stringify(cat));
  console.log('added ' + add.length + ' articles; catalog now ' + cat.videos.length + ' entries');
} else console.log('catalog already has all ' + wanted.length + ' articles — nothing to add');
if (cat.videos.some(v => v.res === 'uwlib' && v.min !== 0)) { console.error('an article has a non-zero runtime'); process.exit(1); }

/* ---------------- artWeek + includes, spliced into BRODY_MSK ---------------- */
const artWeek = {};
wanted.forEach((v, i) => { artWeek[K(v)] = declared[i].w; });
shared.forEach((s, i) => { artWeek[K(sharedItems[i])] = s.w; });

let app = fs.readFileSync(APP, 'utf8');
const m = app.match(/\nconst BRODY_MSK=(.*?);\n/);
if (!m) { console.error('could not find BRODY_MSK in index.html'); process.exit(1); }
const blk = JSON.parse(m[1]);
if (blk.id !== BLOCK) { console.error('BRODY_MSK is not ' + BLOCK); process.exit(1); }
blk.artWeek = artWeek;
// Membership of an article is its artWeek entry (brodyInBlock) — no include keys needed.
blk.include = blk.include.filter(k => !k.startsWith('uwlib|'));
app = app.slice(0, m.index) + '\nconst BRODY_MSK=' + JSON.stringify(blk) + ';\n' + app.slice(m.index + m[0].length);
fs.writeFileSync(APP, app);

/* ---------------- report ---------------- */
const byWk = {};
blk.weeks.forEach(w => byWk[w.n] = { d: 0, m: 0, x: 0, s: 0 });
declared.forEach(d => byWk[d.w][d.from === 'Dermatology' ? 'd' : d.from ? 'm' : 'x']++);
shared.forEach(s => byWk[s.w].s++);
console.log('\nartWeek spliced into ' + BLOCK + ': ' + Object.keys(artWeek).length + ' articles — '
  + DERM.length + ' Dermatology, ' + MSK.length + ' Rheumatology/Orthopedics, ' + EXTRA.length
  + ' from other categories, ' + SHARED.length + ' shared with the Neuro unit');
blk.weeks.forEach(w => { const t = byWk[w.n];
  console.log('   week ' + w.n + '  ' + String(t.d + t.m + t.x + t.s).padStart(3) + '   (derm ' + t.d + ', rheum/ortho ' + t.m
    + ', other ' + t.x + ', shared ' + t.s + ')   ' + w.label); });
console.log('\n  every UWorld Dermatology and Rheumatology/Orthopedics article is placed;');
console.log('  every title checked verbatim against tools/generators/data/uworld-library.txt');
