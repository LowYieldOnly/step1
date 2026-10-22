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
 *   'bc:<section>'           every Bootcamp video in that section
 *   'bc:<section>|<title>'   one Bootcamp video
 */

export const HOMES = [
  /* ================= Hematology & Renal ================= */
  { unit:'heme-renal', week:1, lecture:'RBC: Anemia – Destruction / Production deficits; WBC: Reactive proliferation', items:[
    'bnb:Malaria',
    'skmicro:Plasmodium: Infection & Lifecycle', 'skmicro:Plasmodium: Treatment & Prophylaxis', 'skmicro:Babesia',
    'skmicro:Parvovirus B19 (Parvoviridae)', 'skmicro:Epstein-Barr Virus (Herpesviridae)',
    'bc:Systemic Protozoa|Plasmodium', 'bc:Systemic Protozoa|Babesia',
    'bc:Antiparasitics|Malarial Pharmacology and Chloroquine', 'bc:Antiparasitics|Chloroquine-Resistant and Exo-Erythrocytic Antimalarials',
    'bc:DNA Viruses|Parvovirus B19',
    'bc:DNA Viruses|Epstein-Barr Virus: Clinical Manifestations', 'bc:DNA Viruses|Epstein-Barr Virus: Diagnostics and Management',
    'bc:Positive-sense RNA Viruses|Human T-cell Lymphotropic Virus Type 1',
  ] },
  { unit:'heme-renal', week:4, lecture:'Urinary tract: Ureter, bladder, urethra; Cysts & neoplasms; Transplant disease', items:[
    'skmicro:Escherichia coli', 'skmicro:Proteus mirabilis', 'skmicro:Enterococus faecium & faecalis',
    'skmicro:Staphylococcus epidermidis, saprophyticus', 'skmicro:JC Polyomavirus & BK Polyomavirus (Polyomaviridae)',
    'skmicro:Trematodes',
    'bc:Lactose-Fermenting Gram-Negative Bacilli|Escherichia Coli',
    'bc:Non-Lactose-Fermenting Gram-Negative Bacilli|Proteus',
    'bc:Enterococcus and Bacillus|Enterococcus',
    'bc:Trematodes|Schistosoma', 'bc:Trematodes|Board-style Question Breakdown',
  ] },

  /* ================= Cardiopulmonary ================= */
  { unit:'cardiopulm', week:1, lecture:'Myocarditis; Cardiomyopathies · Valvular Heart Disease (endocarditis, rheumatic fever)', items:[
    'skmicro:Coxsackievirus A & B (Picornaviridae)', 'skmicro:Streptococcus gallolyticus (Group D strep)', 'skmicro:Trypanosoma cruzi',
    'bc:Cardiorespiratory Infections|Principles of Infective Endocarditis', 'bc:Cardiorespiratory Infections|Infective Endocarditis Diagnostics',
    'bc:Cardiorespiratory Infections|Typical Endocarditis Pathogens', 'bc:Cardiorespiratory Infections|Complications and Non-Infectious Endocarditis',
    'bc:Cardiorespiratory Infections|Acute Rheumatic Fever Pathophysiology', 'bc:Cardiorespiratory Infections|Acute Rheumatic Fever Diagnostics and Management',
    'bc:Streptococcus|Viridans Streptococci', 'bc:Streptococcus|Additional Streptococci',
    'bc:Positive-sense RNA Viruses|Coxsackievirus', 'bc:Systemic Protozoa|Trypanosoma Cruzi',
  ] },
  { unit:'cardiopulm', week:4, lecture:'Infectious: Upper Respiratory Tract · Infectious: Lower Respiratory Tract', items:[
    'bnb:Streptococci', 'bnb:Other Gram Negatives', 'bnb:RNA Viruses',
    'skmicro:Streptococcus pneumoniae, viridans', 'skmicro:Streptococcus pyogenes (Group A Strep)',
    'skmicro:Corynebacterium diphtheriae', 'skmicro:Moraxella catarrhalis', 'skmicro:Klebsiella, Enterobacter, Serratia',
    'skmicro:Bordatella pertussis', 'skmicro:Haemophilis influenzae', 'skmicro:Legionella pneumophila',
    'skmicro:Pseudomonas aeruginosa', 'skmicro:Burkholderia pseudomallei & cepacia complex', 'skmicro:Mycoplasma pneumonia',
    'skmicro:Picornavirus Family Overview', 'skmicro:Rhinovirus (Picornaviridae)', 'skmicro:Coronavirus (Coronaviridae)',
    'skmicro:Influenzavirus (Orthomyxovirus)', 'skmicro:Measles, Mumps, Parainfluenza Viruses (Paramyxovirus)',
    'skmicro:Respiratory Syncytial Virus & Human Metapneumovirus (Pneumoviridae)', 'skmicro:Adenovirus (Adenoviridae)',
    'bc:Cardiorespiratory Infections|Principles of Pneumonia', 'bc:Cardiorespiratory Infections|Pneumonia Diagnostics',
    'bc:Cardiorespiratory Infections|Typical Pneumonia Pathogens', 'bc:Cardiorespiratory Infections|Atypical Pneumonia Pathogens',
    'bc:Cardiorespiratory Infections|Pediatric and Additional Pneumonia Pathogens', 'bc:Cardiorespiratory Infections|Board-style Question Breakdown',
    'bc:Streptococcus|Streptococcus Pneumoniae', 'bc:Streptococcus|Streptococcus Pyogenes',
    'bc:Non-Spore-Forming Gram-Positive Bacilli|Corynebacterium Diphtheriae', 'bc:Non-Spore-Forming Gram-Positive Bacilli|Diphtheria',
    'bc:Lactose-Fermenting Gram-Negative Bacilli|Klebsiella',
    'bc:Non-Lactose-Fermenting Gram-Negative Bacilli|Pseudomonas Aeruginosa', 'bc:Non-Lactose-Fermenting Gram-Negative Bacilli|Legionella Pneumophila',
    'bc:Gram-Negative Diplococci|Moraxella Catarrhalis',
    'bc:Gram-Negative Coccobacilli|Haemophilus', 'bc:Gram-Negative Coccobacilli|Bordetella Pertussis', 'bc:Gram-Negative Coccobacilli|Board-style Question Breakdown',
    'bc:Atypical Bacteria|Chlamydia Pneumoniae and Psittaci', 'bc:Atypical Bacteria|Mycoplasma and Ureaplasma',
    'bc:Positive-sense RNA Viruses|Picornaviridae Overview', 'bc:Positive-sense RNA Viruses|Rhinovirus',
    'bc:Positive-sense RNA Viruses|Coronavirus: Pathogenesis and Clinical Manifestations', 'bc:Positive-sense RNA Viruses|Coronavirus: Diagnostics and Management',
    'bc:Negative-sense RNA Viruses|Paramyxoviridae', 'bc:Negative-sense RNA Viruses|Parainfluenza Virus',
    'bc:Negative-sense RNA Viruses|Respiratory Syncytial Virus', 'bc:Negative-sense RNA Viruses|Mumps Virus',
    'bc:Negative-sense RNA Viruses|Influenza: Pathogenesis', 'bc:Negative-sense RNA Viruses|Influenza: Diagnostics and Management',
    'bc:DNA Viruses|Adenovirus',
    'bc:Antivirals|Respiratory Antiviral Therapy', 'bc:Antibiotics|Empiric Antibiotics in Respiratory and ENT Diseases',
  ] },

  /* ================= Nervous & Sensory ================= */
  { unit:'neuro-sensory', week:1, lecture:'Nerve, Neuromuscular Junction (tetanus, botulism)', items:[
    'skmicro:Clostridium tetani', 'skmicro:Clostridium botulinum',
    'bc:Clostridium|Clostridium Tetani', 'bc:Clostridium|Clostridium Botulinum', 'bc:Clostridium|Board-style Question Breakdown',
  ] },
  { unit:'neuro-sensory', week:2, lecture:'Central Nervous System Infections', items:[
    'bnb:Other Gram Positives',
    'skmicro:Neisseria Overview', 'skmicro:Neisseria meningitidis', 'skmicro:Listeria monocytogenes',
    'skmicro:Streptococcus agalactiae (Group B Strep)', 'skmicro:Poliovirus (Picornaviridae)', 'skmicro:Flavivirus Overview',
    'skmicro:Equine Encephalitis Viruses & Chikungunya Virus (Togaviridae)', 'skmicro:Rabies Virus (Rhabdovirus)',
    'skmicro:Hentavirus, California Encephalitis, Rift Valley Fever Viruses (Bunyaviridae)',
    'skmicro:Lymphocytic Choriomengingitis Virus (Arenaviridae)', 'skmicro:Herpes Simplex Virus Types 1 & 2 (Herpesviridae)',
    'skmicro:JC Polyomavirus & BK Polyomavirus (Polyomaviridae)', 'skmicro:Toxoplasmosis', 'skmicro:Trypanosoma brucei',
    'skmicro:Naegleria fowleri', 'skmicro:Cestodes',
    'bc:Infectious Neuropathology',
    'bc:Gram-Negative Diplococci|Neisseria Meningitidis', 'bc:Gram-Negative Diplococci|Board-style Question Breakdown',
    'bc:Non-Spore-Forming Gram-Positive Bacilli|Listeria Monocytogenes', 'bc:Streptococcus|Streptococcus Agalactiae',
    'bc:Spirochetes|Neurosyphilis',
    'bc:Positive-sense RNA Viruses|Poliovirus', 'bc:Positive-sense RNA Viruses|Flaviviridae', 'bc:Positive-sense RNA Viruses|West Nile Virus',
    'bc:Positive-sense RNA Viruses|Zika Virus', 'bc:Positive-sense RNA Viruses|Equine Encephalitis Virus',
    'bc:Negative-sense RNA Viruses|Arenavirus', 'bc:Negative-sense RNA Viruses|Bunyavirus', 'bc:Negative-sense RNA Viruses|Rabies Virus',
    'bc:DNA Viruses|Polyomavirus',
    'bc:Systemic Protozoa|Toxoplasma', 'bc:Systemic Protozoa|Naegleria', 'bc:Systemic Protozoa|Trypanosoma Brucei',
    'bc:Cestodes|Taenia',
    'bc:Antibiotics|Empiric Antibiotics in Meningitis, Cystitis, and Pyelonephritis',
  ] },

  /* ================= Musculoskeletal & Skin ================= */
  { unit:'msk-skin', week:1, lecture:'Clin App · Skin Infections', items:[
    'bnb:Staphylococci', 'bnb:Streptococci', 'bnb:Fungal Skin Infections', 'bnb:Herpes Viruses', 'bnb:DNA Viruses',
    'skmicro:Staphylococcus aureus', 'skmicro:Staphylococcus epidermidis, saprophyticus', 'skmicro:Streptococcus pyogenes (Group A Strep)',
    'skmicro:Clostridium perfringens', 'skmicro:Pseudomonas',
    'skmicro:Herpes Simplex Virus Types 1 & 2 (Herpesviridae)', 'skmicro:Varicella Zoster Virus (Herpesviridae)',
    'skmicro:HHV6 & Roseola (Herpesviridae)', 'skmicro:Human Papillomavirus (HPV) (Papillomaviridae)',
    'skmicro:Smallpox Virus, Cowpox Virus, and Molluscum Contagiosum Virus (Poxviridae)', 'skmicro:Parvovirus B19 (Parvoviridae)',
    'skmicro:Measles, Mumps, Parainfluenza Viruses (Paramyxovirus)', 'skmicro:Rubella VIrus (Matonaviridae)',
    'skmicro:Malassezia furfur, Pityriasis versicolor', 'skmicro:Dermatophytes (Epidermophyton spp., Trichophyton spp., Microsporum spp.)',
    'skmicro:Sporothrix schenckii', 'skmicro:Leishmania species', 'skmicro:Scabies, Lice, Crabs',
    'skpharm:Acyclovir, Valacyclovir, Famciclovir',
    'bc:Infectious Dermatologic Disease', 'bc:Staphylococcus', 'bc:Tinea', 'bc:Ectoparasites',
    'bc:Streptococcus|Streptococcus Pyogenes', 'bc:Streptococcus|Board-style Question Breakdown',
    'bc:Clostridium|Clostridium Perfringens', 'bc:Dimorphic Mycosis|Sporothrix', 'bc:Systemic Protozoa|Leishmania',
    'bc:DNA Viruses|Parvovirus B19', 'bc:DNA Viruses|Human Papillomavirus: Pathogenesis', 'bc:DNA Viruses|Human Papillomavirus: Clinical Manifestations',
    'bc:DNA Viruses|Human Papillomavirus: Diagnostics and Management', 'bc:DNA Viruses|Herpesvirus Family Overview',
    'bc:DNA Viruses|Herpes Simplex Virus: Clinical Manifestations', 'bc:DNA Viruses|Herpes Simplex Virus: Diagnostics and Management',
    'bc:DNA Viruses|Varicella-Zoster Virus: Pathogenesis and Clinical Manifestations', 'bc:DNA Viruses|Varicella-Zoster Virus: Diagnostics and Management',
    'bc:DNA Viruses|Human Herpes Viruses 6 and 7 (Roseola)', 'bc:DNA Viruses|Poxvirus',
    'bc:Positive-sense RNA Viruses|Rubella Virus',
    'bc:Negative-sense RNA Viruses|Measles: Pathogenesis and Clinical Manifestations', 'bc:Negative-sense RNA Viruses|Measles: Diagnostics and Management',
    'bc:Antivirals|HSV and VZV Antiviral Therapy', 'bc:Antiparasitics|Ectoparasiticides',
    'bc:Antibiotics|Empiric Antibiotics in GI, Skin, Bone, and Hematogenous Infections',
  ] },
  { unit:'msk-skin', week:2, lecture:'PHARM · Anti-gout Drugs and Dermatologic Drugs (terbinafine, griseofulvin)', items:[
    'skpharm:Griseofulvin, Terbinafine, Echinocandins',
    'bc:Antifungals|Allylamines, Echinocandins, and Polyenes',
  ] },
  { unit:'msk-skin', week:3, lecture:'Clinical Diagnosis of ID; Lab Practices · Zoonotic Infections · Granulomatous Diseases · Immunocompromised Host · Fever of Unknown Origin', items:[
    // clinical diagnosis & laboratory practice: the microbiology fundamentals
    'bnb:Bacteria', 'bnb:Shapes and Stains', 'bnb:Bacterial Culture', 'bnb:Special Growth Requirements', 'bnb:Virulence',
    'bnb:Growth and Genetics', 'bnb:Bacterial Identification', 'bnb:Virus Structures',
    'bc:Fundamentals of Bacteriology', 'bc:Bacterial Genetics', 'bc:Bacterial Toxins', 'bc:Approach to Virology', 'bc:Basics of Virology',
    // zoonotic infections
    'bnb:Zoonotic Infections', 'bnb:Spirochetes',
    'skmicro:Bartonella henselae', 'skmicro:Brucella', 'skmicro:Francisella tularensis', 'skmicro:Pasturella multocida',
    'skmicro:Anaplasma phagocytophilum & Ehrlichia chaffeensis', 'skmicro:Borrelia burgdorferi', 'skmicro:Borrelia recurrentis',
    'skmicro:Leptospirosis interrogans', 'skmicro:Coxiella burnetii', 'skmicro:Rickettsia Species Overview',
    'skmicro:Rickettsia prowazekii', 'skmicro:Rickettsia rickettsii', 'skmicro:Yersinia enterocolitica, pestis',
    'skmicro:Bacillus anthracis, cereus', 'skmicro:Rabies Virus (Rhabdovirus)', 'skmicro:Ebolavirus & Marburgvirus (Filoviridae)',
    'skmicro:Tissue Nematodes',
    'bc:Enterococcus and Bacillus|Bacillus Anthracis', 'bc:Enterococcus and Bacillus|Board-style Question Breakdown',
    'bc:Non-Lactose-Fermenting Gram-Negative Bacilli|Yersinia Pestis',
    'bc:Gram-Negative Coccobacilli|Additional Pathogens',
    'bc:Spirochetes|Borrelia Burgdorferi', 'bc:Spirochetes|Borrelia Recurrentis', 'bc:Spirochetes|Leptospira', 'bc:Spirochetes|Board-style Question Breakdown',
    'bc:Atypical Bacteria|Rickettsia', 'bc:Atypical Bacteria|Ehrlichia and Anaplasma', 'bc:Atypical Bacteria|Coxiella Burnetii',
    'bc:Atypical Bacteria|Board-style Question Breakdown',
    'bc:Negative-sense RNA Viruses|Rabies Virus', 'bc:Negative-sense RNA Viruses|Ebolavirus',
    'bc:Nematodes|Trichinella', 'bc:Nematodes|Toxocara', 'bc:Nematodes|Onchocerca', 'bc:Nematodes|Loa Loa', 'bc:Nematodes|Wuchereria and Brugia',
    // granulomatous diseases
    'bnb:Mycobacteria', 'bnb:Fungal Pneumonias',
    'skmicro:Mycobacterium tuberculosis', 'skmicro:Mycobacterium leprae', 'skmicro:Mycobacterium avium intracellulare, scrofulaceum, marinum',
    'skmicro:Histoplasma capsulatum', 'skmicro:Blastomycosis dermatitidis', 'skmicro:Coccidiomycosis immitis',
    'skmicro:Paracoccidioidomycosis brasiliensis', 'skmicro:Actinomyces israelii',
    'skpharm:Tuberculosis Drugs', 'skpharm:Leprosy Drugs',
    'bc:Mycobacteria',
    'bc:Dimorphic Mycosis|Fungi Overview', 'bc:Dimorphic Mycosis|Histoplasma', 'bc:Dimorphic Mycosis|Blastomyces',
    'bc:Dimorphic Mycosis|Coccidioides', 'bc:Dimorphic Mycosis|Paracoccidioides', 'bc:Dimorphic Mycosis|Board-style Question Breakdown',
    'bc:Non-Spore-Forming Gram-Positive Bacilli|Actinomyces Israelii', 'bc:Non-Spore-Forming Gram-Positive Bacilli|Nocardia',
    'bc:Non-Spore-Forming Gram-Positive Bacilli|Board-style Question Breakdown',
    'bc:Antibiotics|Isoniazid', 'bc:Antibiotics|Rifamycins', 'bc:Antibiotics|Pyrazinamide, Ethambutol, Dapsone, and Clofazimine',
    // the immunocompromised host
    'bnb:Opportunistic Fungal Infections', 'bnb:HIV', 'bnb:HIV CNS Infections', 'bnb:HIV Drugs', 'bnb:Protozoa',
    'bnb:Antifungal Drugs', 'bnb:Antiviral Drugs',
    'skmicro:Candida albicans', 'skmicro:Aspergillus fumigatus', 'skmicro:Crytococcus neoformans',
    'skmicro:Mucormycosis (Mucor spp. & Rhizopus spp.)', 'skmicro:Pneumocystis jirovecii', 'skmicro:Nocardia',
    'skmicro:HIV Overview (Retroviridae)', 'skmicro:HIV Life Cycle (Retroviridae)', 'skmicro:Cytomegalovirus (Herpesviridae)',
    "skmicro:HHV8 & Kaposi's sarcoma (Herpesviridae)", 'skmicro:Toxoplasmosis',
    'skpharm:NRTIs', 'skpharm:NNRTIs', 'skpharm:Protease Inhibitors', 'skpharm:Maraviroc, Fusion Inhibitors, Integrase Inhibitors',
    'skpharm:Amphotericin & Flucytosine', 'skpharm:Azoles', 'skpharm:Ganciclovir, Valganciclovir, Foscarnet, Cidofovir',
    'bc:Opportunistic Mycosis', 'bc:Opportunistic Infections',
    'bc:Positive-sense RNA Viruses|Human Immunodeficiency Virus: Pathogenesis', 'bc:Positive-sense RNA Viruses|Human Immunodeficiency Virus: Primary Disease',
    'bc:Positive-sense RNA Viruses|Human Immunodeficiency Virus: Secondary Disease', 'bc:Positive-sense RNA Viruses|Congenital Human Immunodeficiency Virus Infection',
    'bc:Positive-sense RNA Viruses|Human Immunodeficiency Virus: Diagnostics and Management',
    'bc:DNA Viruses|Cytomegalovirus: Pathogenesis and Clinical Manifestations', 'bc:DNA Viruses|Cytomegalovirus: Diagnostics and Management',
    'bc:DNA Viruses|Human Herpes Virus 8 (Kaposi Sarcoma)',
    'bc:Systemic Protozoa|Toxoplasma', 'bc:Systemic Protozoa|Board-style Question Breakdown',
    'bc:Antiparasitics|Pyrimethamine, Sulfadiazine, Nitroimidazoles, and Intraluminal Agents',
    'bc:Antiparasitics|Antiparasitics of Leishmaniasis and Trypanosomiasis',
    'bc:Antivirals|Additional Herpetic Antiviral Therapy', 'bc:Antivirals|HIV Antiretroviral Pharmacology',
    'bc:Antivirals|Antiretroviral Attachment and Fusion Inhibitors', 'bc:Antivirals|Antiretroviral Nucleoside Reverse Transcriptase Inhibitors',
    'bc:Antivirals|Additional Antiretroviral Therapies', 'bc:Antivirals|HIV Antiretroviral Management', 'bc:Antivirals|Board-style Question Breakdown',
    'bc:Antifungals|General Principles of Azoles', 'bc:Antifungals|Azoles', 'bc:Antifungals|Additional Antifungals',
    'bc:Antifungals|Common Fungal Disease Management', 'bc:Antifungals|Board-style Question Breakdown',
    // fever of unknown origin: the travel and tropical fevers
    'bc:Positive-sense RNA Viruses|Yellow Fever Virus', 'bc:Positive-sense RNA Viruses|Dengue Virus', 'bc:Positive-sense RNA Viruses|Chikungunya Virus',
    // antimicrobial drugs: no Brody lecture on any calendar we have teaches them, so — by the
    // law's "even if brody does not cover that topic" — they are watched in the ID week.
    // Move them if the GI or Term 4 calendar turns out to teach antimicrobial pharmacology.
    'bnb:Penicillins', 'bnb:Beta Lactams', 'bnb:Sulfonamides', 'bnb:Protein Synthesis Inhibitors', 'bnb:Other Antibiotics',
    'skpharm:Penicillin', 'skpharm:Nafcillin, Oxacillin, Methicillin, Dicloxacillin', 'skpharm:Ampicillin, Amoxicillin, Piperacillin, Ticarcillin',
    'skpharm:Cephalosporins', 'skpharm:Monobactams & Carbapenems', 'skpharm:Vancomycin', 'skpharm:Daptomycin',
    'skpharm:Tetracyclines', 'skpharm:Macrolides', 'skpharm:Clindamycin', 'skpharm:Chloramphenicol', 'skpharm:Linezolid',
    'skpharm:Aminoglycosides', 'skpharm:Trimethoprim/Sulfamethoxazole', 'skpharm:Fluoroquinolones', 'skpharm:Metronidazole',
    'bc:Antibiotics|General Principles of Antibiotics', 'bc:Antibiotics|Bacterial Coverage Overview', 'bc:Antibiotics|Classic Penicillins',
    'bc:Antibiotics|Penicillinase-Resistant Penicillins', 'bc:Antibiotics|Aminopenicillins', 'bc:Antibiotics|Antipseudomonal Penicillins',
    'bc:Antibiotics|Introduction to Cephalosporins', 'bc:Antibiotics|1st and 2nd Generation Cephalosporins',
    'bc:Antibiotics|3rd, 4th, and 5th Generation Cephalosporins', 'bc:Antibiotics|Carbapenems and Monobactams',
    'bc:Antibiotics|Glycopeptides (including Vancomycin)', 'bc:Antibiotics|Aminoglycosides', 'bc:Antibiotics|Tetracyclines and Derivatives',
    'bc:Antibiotics|Macrolides', 'bc:Antibiotics|Lincosamides', 'bc:Antibiotics|Streptogramins, Oxazolidinones, and Amphenicols',
    'bc:Antibiotics|Fluoroquinolones', 'bc:Antibiotics|Nitroimidazoles', 'bc:Antibiotics|Diaminopyrimidines and Sulfonamides',
    'bc:Antibiotics|Nitrofurans', 'bc:Antibiotics|Fosfomycin, Daptomycin, and Polymyxins', 'bc:Antibiotics|Board-style Question Breakdown',
  ] },
];

/* Only for a named Brody unit. Each fails the law audit once its `from` date passes. */
export const WAITING = [
  { unit:'GI, Nutrition & Multisystem (SYST 9500)', from:'2026-11-09',
    note:'the enteric organisms, hepatitis viruses and intestinal parasites — taught with the GI tract', items:[
    'bnb:Gram Negative Rods', 'bnb:Viral Hepatitis', 'bnb:Helminths',
    'skmicro:Clostridium difficile', 'skmicro:Salmonella', 'skmicro:Shigella', 'skmicro:Campylobacter jejuni',
    'skmicro:Vibrio cholerae, parahaemolyticus, vulnificus', 'skmicro:Helicobacter pylori',
    'skmicro:Hepatits A (Picornaviridae)', 'skmicro:Norovirus & Norwalk Virus (Caliciviridae)', 'skmicro:Hepatitis C (Flaviviridae)',
    'skmicro:Rotavirus & Colorado Tick Fever Virus (Reoviridae)', 'skmicro:Hepatitis B Viral Life Cycle (Hepadnaviridae)',
    'skmicro:Giardia', 'skmicro:Entamoeba histolytica', 'skmicro:Cryptosporidium', 'skmicro:Intestinal Nematodes',
    'skpharm:Hepatitis C: Direct-Acting Antivirals (DAAs)',
    'bc:Gram-Negative Curved Rods', 'bc:Gastrointestinal Protozoa',
    'bc:Clostridium|Clostridioides Difficile', 'bc:Enterococcus and Bacillus|Bacillus Cereus',
    'bc:Lactose-Fermenting Gram-Negative Bacilli|Variant Strains of Escherichia Coli', 'bc:Lactose-Fermenting Gram-Negative Bacilli|Additional Pathogens',
    'bc:Lactose-Fermenting Gram-Negative Bacilli|Board-style Question Breakdown',
    'bc:Non-Lactose-Fermenting Gram-Negative Bacilli|Shigella', 'bc:Non-Lactose-Fermenting Gram-Negative Bacilli|Non-typhoidal Salmonella',
    'bc:Non-Lactose-Fermenting Gram-Negative Bacilli|Salmonella Typhi', 'bc:Non-Lactose-Fermenting Gram-Negative Bacilli|Yersinia Enterocolitica',
    'bc:Non-Lactose-Fermenting Gram-Negative Bacilli|Board-style Question Breakdown',
    'bc:Positive-sense RNA Viruses|Hepatitis A Virus', 'bc:Positive-sense RNA Viruses|Hepatitis E Virus', 'bc:Positive-sense RNA Viruses|Norovirus',
    'bc:Positive-sense RNA Viruses|Hepatitis C Virus: Pathogenesis and Clinical Manifestations',
    'bc:Positive-sense RNA Viruses|Hepatitis C Virus: Diagnostics and Management',
    'bc:Negative-sense RNA Viruses|Hepatitis D Virus', 'bc:Double-stranded RNA Viruses',
    'bc:DNA Viruses|Hepatitis B Virus: Pathogenesis and Clinical Manifestations', 'bc:DNA Viruses|Hepatitis B Virus: Diagnostics and Management',
    'bc:Nematodes|Enterobius', 'bc:Nematodes|Ascaris', 'bc:Nematodes|Strongyloides', 'bc:Nematodes|Hookworm', 'bc:Nematodes|Trichuris',
    'bc:Nematodes|Board-style Question Breakdown',
    'bc:Cestodes|Diphyllobothriid', 'bc:Cestodes|Echinococcus', 'bc:Cestodes|Board-style Question Breakdown', 'bc:Trematodes|Clonorchis',
    'bc:Antiparasitics|Anthelmintics', 'bc:Antiparasitics|Anthelmintics Algorithm', 'bc:Antiparasitics|Board-style Question Breakdown',
    'bc:Antivirals|Hepatitis B Antiviral Therapy', 'bc:Antivirals|Hepatitis C Antiviral Therapy',
  ] },
  { unit:'Term 4 reproductive unit', from:null,
    note:'the sexually transmitted organisms — taught with the reproductive tract; the Term 4 calendar has not been supplied', items:[
    'skmicro:Neisseria gonorrheae', 'skmicro:Treponema pallidum', 'skmicro:Chlamydia', 'skmicro:Gardnerella vaginalis',
    'skmicro:Trichomoniasis vaginalis',
    'bc:Gram-Negative Diplococci|Neisseria Gonorrhoeae',
    'bc:Spirochetes|Treponema Pallidum', 'bc:Spirochetes|Congenital Syphilis', 'bc:Spirochetes|Treponemal Diagnostics and Management',
    'bc:Atypical Bacteria|Chlamydia Trachomatis Pathogenesis', 'bc:Atypical Bacteria|Chlamydia Trachomatis Serotypes and Disease Variants',
    'bc:Atypical Bacteria|Gardnerella Vaginalis', 'bc:Systemic Protozoa|Trichomonas',
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
