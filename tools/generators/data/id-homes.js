/* Where every Infectious Disease video is watched.
 *
 * Brody has no Infectious Disease unit. It teaches infections inside the organ-system units:
 * the respiratory infections in Cardiopulm, CNS infections in Neuro, skin infections and the
 * whole ID week (diagnosis, zoonoses, granulomatous disease, the immunocompromised host,
 * fever of unknown origin) in Musculoskeletal & Skin. The #1 law still holds — "the sum
 * total videos within a resource are watched in that specific system even if brody does
 * not cover that topic" — so every ID video of every resource is placed here:
 *
 *   HOMES    at the unit and week whose lecture teaches it. A video two lectures teach is
 *            listed under both (it is watched once and shows done in both). A video no
 *            lecture names goes to the closest one: organisms by the organ they infect;
 *            microbiology basics and antimicrobial drugs to MSK week 3, Brody's ID week.
 *   WAITING  only for a NAMED Brody unit: the GI unit (from Nov 9) for the enteric
 *            organisms and hepatitis, and the Term 4 reproductive unit for the sexually
 *            transmitted ones. tools/law.mjs fails a wait once its unit's date passes.
 *
 * tools/generators/mk_id.js resolves every reference against the catalog, refuses an
 * unknown or ambiguous one, refuses any ID video that is in neither list, and splices the
 * homes into the four units. mk_msk.js and mk_neuro.js merge the same homes, so re-running
 * any of them gives the same blocks.
 *
 * References (all within the Infectious Disease system):
 *   'bnb:<title>'  'skmicro:<title>'  'skpharm:<title>'
 *           every Bootcamp video in that section
 *   one Bootcamp video
 */

export const HOMES = [
  /* ================= Hematology & Renal ================= */
  { unit:'heme-renal', week:1, lecture:'RBC: Anemia – Destruction / Production deficits; WBC: Reactive proliferation', items:[
    'bnb:Malaria',
    'skmicro:Plasmodium: Infection & Lifecycle', 'skmicro:Plasmodium: Treatment & PPX', 'skmicro:Babesia spp.',
    'skmicro:Parvovirus B19 (Parvoviridae)', 'skmicro:Epstein-Barr Virus (Herpesviridae)',
  ] },
  { unit:'heme-renal', week:4, lecture:'Urinary tract: Ureter, bladder, urethra; Cysts & neoplasms; Transplant disease', items:[
    // Sketchy's E. coli video is ETEC & EHEC — the diarrhoeal strains — so it waits for GI
    'skmicro:Proteus mirabilis', 'skmicro:Enterococcus faecium & faecalis',
    'skmicro:Staphylococcus epidermidis & saprophyticus', 'skmicro:JC Polyomavirus & BK Polyomavirus (Polyomaviridae)',
    'skmicro:Trematodes',
  ] },

  /* ================= Cardiopulmonary ================= */
  { unit:'cardiopulm', week:1, lecture:'Myocarditis; Cardiomyopathies · Valvular Heart Disease (endocarditis, rheumatic fever)', items:[
    'skmicro:Coxsackievirus A & B (Picornaviridae)', 'skmicro:Streptococcus gallolyticus (Group D Strep)', 'skmicro:Trypanosoma cruzi',
  ] },
  { unit:'cardiopulm', week:4, lecture:'Infectious: Upper Respiratory Tract · Infectious: Lower Respiratory Tract', items:[
    'bnb:Streptococci', 'bnb:Other Gram Negatives', 'bnb:RNA Viruses',
    'skmicro:Streptococcus pneumoniae & viridans', 'skmicro:Streptococcus pyogenes (Group A Strep)',
    'skmicro:Corynebacterium diphtheriae', 'skmicro:Moraxella catarrhalis', 'skmicro:Klebsiella pneumoniae, Enterobacter spp., Serratia marcescens',
    'skmicro:Bordetella pertussis', 'skmicro:Haemophilus influenzae', 'skmicro:Legionella pneumophila',
    'skmicro:Pseudomonas aeruginosa', 'skmicro:Burkholderia pseudomallei & cepacia complex', 'skmicro:Mycoplasma pneumoniae',
    'skmicro:Picornaviridae Overview', 'skmicro:Rhinovirus (Picornaviridae)', 'skmicro:Coronavirus (Coronaviridae)',
    'skmicro:Influenzavirus (Orthomyxoviridae)', 'skmicro:Measles, Mumps, Parainfluenza Viruses (Paramyxoviridae)',
    'skmicro:Respiratory Syncytial Virus & Human Metapneumovirus (Pneumoviridae)', 'skmicro:Adenovirus (Adenoviridae)',
  ] },

  /* ================= Nervous & Sensory ================= */
  { unit:'neuro-sensory', week:1, lecture:'Nerve, Neuromuscular Junction (tetanus, botulism)', items:[
    'skmicro:Clostridium tetani', 'skmicro:Clostridium botulinum',
  ] },
  { unit:'neuro-sensory', week:2, lecture:'Central Nervous System Infections', items:[
    'bnb:Other Gram Positives',
    'skmicro:Neisseria Overview', 'skmicro:Neisseria meningitidis', 'skmicro:Listeria monocytogenes',
    'skmicro:Streptococcus agalactiae (Group B Strep)', 'skmicro:Poliovirus (Picornaviridae)', 'skmicro:Flaviviridae Overview',
    'skmicro:Equine Encephalitis Viruses & Chikungunya Virus (Togaviridae)', 'skmicro:Rabies Virus (Rhabdoviridae)',
    'skmicro:Hantavirus, California Encephalitis, Rift Valley Fever Viruses (Bunyaviridae)',
    'skmicro:Lymphocytic Choriomeningitis Virus (Arenaviridae)', 'skmicro:Herpes Simplex Virus Types 1 & 2 (Herpesviridae)',
    'skmicro:JC Polyomavirus & BK Polyomavirus (Polyomaviridae)', 'skmicro:Toxoplasma gondii', 'skmicro:Trypanosoma brucei',
    'skmicro:Naegleria fowleri', 'skmicro:Cestodes',
  ] },

  /* ================= Musculoskeletal & Skin ================= */
  { unit:'msk-skin', week:1, lecture:'Clin App · Skin Infections', items:[
    'bnb:Staphylococci', 'bnb:Streptococci', 'bnb:Fungal Skin Infections', 'bnb:Herpes Viruses', 'bnb:DNA Viruses',
    'skmicro:Staphylococcus aureus', 'skmicro:Staphylococcus epidermidis & saprophyticus', 'skmicro:Streptococcus pyogenes (Group A Strep)',
    'skmicro:Clostridium perfringens', 'skmicro:Pseudomonas aeruginosa',   // also Cardiopulm wk4: burns, hot-tub folliculitis
    'skmicro:Herpes Simplex Virus Types 1 & 2 (Herpesviridae)', 'skmicro:Varicella-Zoster Virus (Herpesviridae)',
    'skmicro:HHV-6 & Roseola (Herpesviridae)', 'skmicro:Human Papillomavirus (Papillomaviridae)',
    'skmicro:Smallpox Virus, Cowpox Virus, and Molluscum Contagiosum Virus (Poxviridae)', 'skmicro:Parvovirus B19 (Parvoviridae)',
    'skmicro:Measles, Mumps, Parainfluenza Viruses (Paramyxoviridae)', 'skmicro:Rubella Virus (Matonaviridae)',
    'skmicro:Malassezia furfur', 'skmicro:Epidermophyton spp., Trichophyton spp., Microsporum spp. (Dermatophytes)',
    'skmicro:Sporothrix schenckii', 'skmicro:Leishmania braziliensis & donovani', 'skmicro:Scabies, Lice, Crabs',
    'skpharm:Acyclovir, Valacyclovir, Famciclovir',
  ] },
  { unit:'msk-skin', week:2, lecture:'PHARM · Anti-gout Drugs and Dermatologic Drugs (terbinafine, griseofulvin)', items:[
    'skpharm:Griseofulvin, Terbinafine, Echinocandins',
    // held since the unit was built — the built units keep the Bootcamp they had
    'bc:Antifungals|Allylamines, Echinocandins, and Polyenes',
  ] },
  { unit:'msk-skin', week:3, lecture:'Clinical Diagnosis of ID; Lab Practices · Zoonotic Infections · Granulomatous Diseases · Immunocompromised Host · Fever of Unknown Origin', items:[
    // clinical diagnosis & laboratory practice: the microbiology fundamentals
    'bnb:Bacteria', 'bnb:Shapes and Stains', 'bnb:Bacterial Culture', 'bnb:Special Growth Requirements', 'bnb:Virulence',
    'bnb:Growth and Genetics', 'bnb:Bacterial Identification', 'bnb:Virus Structures',
    // zoonotic infections
    'bnb:Zoonotic Infections', 'bnb:Spirochetes',
    'skmicro:Bartonella henselae', 'skmicro:Brucella spp.', 'skmicro:Francisella tularensis', 'skmicro:Pasteurella multocida',
    'skmicro:Anaplasma phagocytophilum & Ehrlichia chaffeensis', 'skmicro:Borrelia burgdorferi', 'skmicro:Borrelia recurrentis',
    'skmicro:Leptospira interrogans', 'skmicro:Coxiella burnetii', 'skmicro:Rickettsia Overview',
    'skmicro:Rickettsia prowazekii', 'skmicro:Rickettsia rickettsii', 'skmicro:Yersinia enterocolitica & pestis',
    'skmicro:Bacillus anthracis & cereus', 'skmicro:Rabies Virus (Rhabdoviridae)', 'skmicro:Ebolavirus & Marburgvirus (Filoviridae)',
    'skmicro:Tissue Nematodes: Dracunculus medinensis, Wuchereria bancrofti, Onchocerca volvulus, Toxocara canis, and Loa loa',
    // granulomatous diseases
    'bnb:Mycobacteria', 'bnb:Fungal Pneumonias',
    'skmicro:Mycobacterium tuberculosis', 'skmicro:Mycobacterium leprae', 'skmicro:Mycobacterium avium intracellulare, Mycobacterium scrofulaceum, Mycobacterium marinum',
    'skmicro:Histoplasma capsulatum', 'skmicro:Blastomyces dermatitidis', 'skmicro:Coccidioides immitis',
    'skmicro:Paracoccidioides brasiliensis', 'skmicro:Actinomyces israelii',
    'skpharm:Tuberculosis Drugs', 'skpharm:Leprosy Drugs',
    // the immunocompromised host
    'bnb:Opportunistic Fungal Infections', 'bnb:HIV', 'bnb:HIV CNS Infections', 'bnb:HIV Drugs', 'bnb:Protozoa',
    'bnb:Antifungal Drugs', 'bnb:Antiviral Drugs',
    'skmicro:Candida albicans', 'skmicro:Aspergillus fumigatus', 'skmicro:Cryptococcus neoformans',
    'skmicro:Mucor spp. & Rhizopus spp. (Mucormycetes)', 'skmicro:Pneumocystis jirovecii', 'skmicro:Nocardia asteroides',
    'skmicro:HIV Overview (Retroviridae)', 'skmicro:HIV Life Cycle (Retroviridae)', 'skmicro:Cytomegalovirus (Herpesviridae)',
    "skmicro:HHV-8 & Kaposi's Sarcoma (Herpesviridae)", 'skmicro:Toxoplasma gondii',
    'skpharm:NRTIs', 'skpharm:NNRTIs', 'skpharm:Protease Inhibitors', 'skpharm:Maraviroc, Fusion Inhibitors, Integrase Inhibitors',
    'skpharm:Amphotericin & Flucytosine', 'skpharm:Azoles', 'skpharm:Ganciclovir, Valganciclovir, Foscarnet, Cidofovir',
    // fever of unknown origin: the travel and tropical fevers
    // antimicrobial drugs: no Brody lecture on any calendar we have teaches them, so — by the
    // law's "even if brody does not cover that topic" — they are watched in the ID week.
    // Move them if the GI or Term 4 calendar turns out to teach antimicrobial pharmacology.
    'bnb:Penicillins', 'bnb:Beta Lactams', 'bnb:Sulfonamides', 'bnb:Protein Synthesis Inhibitors', 'bnb:Other Antibiotics',
    'skpharm:Penicillin', 'skpharm:Nafcillin, Oxacillin, Methicillin, Dicloxacillin', 'skpharm:Ampicillin, Amoxicillin, Piperacillin, Ticarcillin',
    'skpharm:Cephalosporins', 'skpharm:Monobactams & Carbapenems', 'skpharm:Vancomycin', 'skpharm:Daptomycin',
    'skpharm:Tetracyclines', 'skpharm:Macrolides', 'skpharm:Clindamycin', 'skpharm:Chloramphenicol', 'skpharm:Linezolid',
    'skpharm:Aminoglycosides', 'skpharm:Trimethoprim/Sulfamethoxazole', 'skpharm:Fluoroquinolones', 'skpharm:Metronidazole',
  ] },
];

/* Only for a named Brody unit. Each fails the law audit once its `from` date passes. */
export const WAITING = [
  { unit:'GI, Nutrition & Multisystem (SYST 9500)', from:'2026-11-09',
    note:'the enteric organisms, hepatitis viruses and intestinal parasites — taught with the GI tract', items:[
    'bnb:Gram Negative Rods', 'bnb:Viral Hepatitis', 'bnb:Helminths',
    'skmicro:Clostridioides difficile', 'skmicro:Salmonella: Intro to Salmonella & NTS', 'skmicro:Salmonella: Typhoidal Salmonella',
    'skmicro:Shigella spp.', 'skmicro:Escherichia coli (ETEC & EHEC)', 'skmicro:Campylobacter jejuni',
    'skmicro:Vibrio spp.', 'skmicro:Helicobacter pylori', 'skmicro:Bacteroides fragilis',
    'skmicro:Hepatitis A Virus (Picornaviridae)', 'skmicro:Norovirus & Norwalk Virus (Caliciviridae)', 'skmicro:Hepatitis C Virus (Flaviviridae)',
    'skmicro:Rotavirus & Colorado Tick Fever Virus (Reoviridae)', 'skmicro:Hepatitis B Viral Basics & Infectious Diseases (Hepadnaviridae)',
    'skmicro:Hepatitis B Viral Life Cycle (Hepadnaviridae) [Old Version]',
    'skmicro:Giardia lamblia', 'skmicro:Entamoeba histolytica', 'skmicro:Cryptosporidium spp.', 'skmicro:Intestinal Nematodes: Enterobius, Ancylostoma, Necator, Ascaris, Strongyloides, and Trichinella',
    'skpharm:Hepatitis C: Direct-Acting Antivirals (DAAs)',
  ] },
  { unit:'Term 4 reproductive unit', from:null,
    note:'the sexually transmitted organisms — taught with the reproductive tract; the Term 4 calendar has not been supplied', items:[
    'skmicro:Neisseria gonorrhoeae', 'skmicro:Treponema pallidum', 'skmicro:Chlamydia trachomatis, Chlamydophila pneumoniae, Chlamydophila psittaci', 'skmicro:Gardnerella vaginalis',
    'skmicro:Trichomonas vaginalis',
  ] },
];

/* Does a reference name this catalog video? Shared by mk_id.js and tools/law.mjs. */
export function matchRef(ref, v) {
  if (v.sys !== 'Infectious Disease') return false;
  const i = ref.indexOf(':'), kind = ref.slice(0, i), body = ref.slice(i + 1);
  if (kind === 'bc') {
    if (v.res !== 'bootcamp') return false;
    const j = body.indexOf('|');
    return j < 0 ? (v.cat || '') === body : (v.cat || '') === body.slice(0, j) && v.name === body.slice(j + 1);
  }
  return v.res === kind && v.name === body;
}
