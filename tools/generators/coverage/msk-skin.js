/* Lecture coverage — Musculoskeletal & Skin (SYST 9400).
 *
 * Every Brody lecture in the unit, and what in the plan teaches it. Checked by
 * tools/generators/mk_coverage.js, which refuses a lecture that is missing from this
 * list, a resource that doesn't exist, and a resource scheduled AFTER its lecture's
 * week (it would land after the quiz that tests it).
 *
 * Each entry is one of:
 *   items: [...]            the resources that teach this lecture
 *   items + partial: '…'    covered, but something examinable is not in any resource
 *   gap: '…'                examinable, and nothing in the six resources teaches it
 *   none: '…'               not something a board-prep resource covers (PBL, PDRs…)
 *
 * Resource references:
 *   bnb:Title  pathoma:Title  skmicro:Title  skpharm:Title     one video
 *   bc:System|Section                                          a whole Bootcamp section
 *   bc:System|Section|Title                                    one Bootcamp video
 *   uw:Title                                                   a UWorld library article
 * A resource may come from an earlier unit if the student has already studied it there;
 * the report says so.
 */
export const UNIT = 'msk-skin';

export const LECTURES = [
  // ======================= WEEK 1 =======================
  { w:1, title:'Dermatopathology: Benign (1 of 2)', items:[
    'pathoma:19.1 Inflammatory Dermatoses', 'pathoma:19.2 Blistering Dermatoes',
    'bnb:Skin Disorders I', 'bnb:Skin Disorders II', 'bnb:Blistering Disorders',
    'bc:Dermatology|Inflammatory Diseases of the Skin',
    'uw:Psoriasis', 'uw:Lichen planus and lichenoid drug eruption', 'uw:Bullous pemphigoid and pemphigus vulgaris',
    'uw:Dermatitis herpetiformis', 'uw:Atopic dermatitis', 'uw:Seborrheic dermatitis'] },
  { w:1, title:'Dermatopathology: Benign (2 of 2)', items:[
    'pathoma:19.4 Disorders of Pigmentation and Melanocytes', 'bnb:Pigment Disorders', 'bnb:Vascular Lesions',
    'bc:Dermatology|Additional Dermatologic Disorders',
    'uw:Seborrheic keratosis', 'uw:Vitiligo', 'uw:Melasma', 'uw:Benign cutaneous vascular lesions',
    'uw:Epidermoid (epidermal inclusion) cyst', 'uw:Keloids and hypertrophic scars'] },
  { w:1, title:'Dermatopathology: Neoplastic', items:[
    'pathoma:19.3 Epithelial Tumors', 'bnb:Skin Cancer', 'bc:Dermatology|Malignant Skin Disorders',
    'uw:Melanoma', 'uw:Nonmelanoma skin cancer: Squamous cell carcinoma and basal cell carcinoma',
    'uw:Actinic keratosis', 'uw:Cutaneous T-cell lymphoma', 'uw:Xeroderma pigmentosum'] },
  { w:1, title:'Soft Tissue: Neoplastic', items:[
    'pathoma:18.6 Soft Tissue Tumors', 'uw:Benign soft tissue tumors and tumor-like lesions', 'uw:Lipoma'] },
  { w:1, title:'General Anesthesia 1', items:[
    'bnb:Inhaled Anesthetics', 'bnb:Intravenous Anesthetics', 'bnb:Neuromuscular Blockers',
    'skpharm:IV Anesthetics', 'skpharm:Inhaled Anesthetics & Dantrolene',
    'uw:Intravenous and inhaled anesthetics', 'uw:Skeletal muscle relaxants: Neuromuscular blocking agents',
    'uw:Malignant hyperthermia'] },
  { w:1, title:'Local Anesthetics', items:[
    'bnb:Local Anesthetics', 'skpharm:Local Anesthetics', 'uw:Local anesthetic agents'] },
  { w:1, title:'Derm Lesions', items:[
    'bnb:Skin', 'bc:Dermatology|General Principles', 'uw:Basic dermatology vocabulary',
    'uw:Histology: Skin appendages (hair follicles, sebaceous glands, sweat glands)'] },
  { w:1, title:'Common Skin Disorders', items:[
    'uw:Acne vulgaris', 'uw:Rosacea', 'uw:Atopic dermatitis', 'uw:Allergic/irritant contact dermatitis',
    'uw:Angioedema and urticaria', 'uw:Alopecia', 'uw:Pityriasis rosea', 'uw:Keratosis pilaris',
    'uw:Hidradenitis suppurativa', 'uw:Diaper dermatitis', 'uw:Benign neonatal rashes',
    'uw:Recurrent aphthous stomatitis (canker sores)', 'bnb:Hypersensitivity Disorders'] },
  { w:1, title:'Skin Infections', items:[
    'bnb:Staphylococci', 'bnb:Streptococci', 'bnb:Fungal Skin Infections', 'bnb:Herpes Viruses', 'bnb:DNA Viruses',
    'skmicro:Staphylococcus aureus', 'skmicro:Staphylococcus epidermidis, saprophyticus', 'skmicro:Streptococcus pyogenes (Group A Strep)',
    'skmicro:Clostridium perfringens', 'skmicro:Pseudomonas', 'skmicro:Herpes Simplex Virus Types 1 & 2 (Herpesviridae)',
    'skmicro:Varicella Zoster Virus (Herpesviridae)', 'skmicro:HHV6 & Roseola (Herpesviridae)', 'skmicro:Human Papillomavirus (HPV) (Papillomaviridae)',
    'skmicro:Smallpox Virus, Cowpox Virus, and Molluscum Contagiosum Virus (Poxviridae)', 'skmicro:Parvovirus B19 (Parvoviridae)',
    'skmicro:Measles, Mumps, Parainfluenza Viruses (Paramyxovirus)', 'skmicro:Rubella VIrus (Matonaviridae)',
    'skmicro:Malassezia furfur, Pityriasis versicolor', 'skmicro:Dermatophytes (Epidermophyton spp., Trichophyton spp., Microsporum spp.)',
    'skmicro:Sporothrix schenckii', 'skmicro:Leishmania species', 'skmicro:Scabies, Lice, Crabs',
    'pathoma:19.5 Infectious Disorders', 'bnb:Skin Infections', 'bc:Dermatology|Infectious Diseases of the Skin',
    'uw:Cellulitis and skin abscess (skin and soft tissue infections)', 'uw:Impetigo', 'uw:Erysipelas',
    'uw:Dermatophyte (tinea) infections', 'uw:Tinea versicolor', 'uw:Cutaneous warts', 'uw:Molluscum contagiosum',
    'uw:Scabies', 'uw:Lice', 'uw:Herpes simplex virus (HSV)', 'uw:Herpes zoster (shingles)', 'uw:Staphylococcus',
    'uw:Pediatric viral exanthems', 'uw:Scarlet fever', 'uw:Sporotrichosis', 'skpharm:Acyclovir, Valacyclovir, Famciclovir'] },
  { w:1, title:'Skin Signs of Internal Disorders', items:[
    'uw:Acanthosis nigricans', 'uw:Erythema nodosum', 'uw:Pyoderma gangrenosum', 'uw:Dermatitis herpetiformis',
    'uw:Sturge-Weber syndrome', 'bnb:Neurocutaneous Disorders'] },
  { w:1, title:'Skin Trauma', items:[
    'bc:Dermatology|Additional Dermatologic Disorders|Burns', 'pathoma:2.5 Wound Healing', 'bnb:Wound Healing and Scar',
    'uw:Burns', 'uw:Chemical burns', 'uw:Sunburn', 'uw:Traumatic lacerations and wound repair',
    'uw:Wound healing: Pathophysiology', 'uw:Wounds: Clinical evaluation and management', 'uw:Wound dehiscence',
    'uw:Pressure ulcers', 'uw:Lower extremity ulcers'] },
  { w:1, title:'Derm Emergencies', items:[
    'uw:Stevens-Johnson syndrome/toxic epidermal necrolysis', 'uw:DRESS syndrome',
    'uw:Staphylococcal scalded skin syndrome', 'uw:Staphylococcal toxic shock syndrome', 'uw:Necrotizing fasciitis',
    'uw:Erythema multiforme'] },
  { w:1, title:'Flipped Classroom. Personality Disorders', items:[
    'bnb:Personality Disorders', 'bc:Psychiatry|Personality Disorders'] },
  { w:1, title:'Medical Disorders Presenting as Psychiatric Disorders', items:[
    'bc:Psychiatry|Memory, Dissociation, and Orientation|Delirium', 'bnb:Somatic and Factitious Disorders'],
    partial:'nothing addresses medical mimics of psychiatric illness as a topic; delirium is the nearest, studied in Nervous & Sensory' },
  { w:1, title:'Introduction to Psychotherapy', items:[
    'bnb:Conditioning and Transference', 'bc:Psychiatry|Psychology'] },
  { w:1, title:'SDOH V (Disability Access)',
    gap:'social determinants / disability access — no resource in the six covers it' },

  // ======================= WEEK 2 =======================
  { w:2, title:'Skeletal Muscle & Systemic Inflammatory', items:[
    'pathoma:18.4 Skeletal Muscle', 'pathoma:18.5 Neuromuscular Junction', 'bnb:Muscle Disorders',
    'bc:Musculoskeletal|Skeletal Muscle',
    'uw:Idiopathic inflammatory myopathies: Dermatomyositis and polymyositis', 'uw:Polymyalgia rheumatica',
    'uw:Rhabdomyolysis', 'uw:Drug-induced myopathy', 'uw:Mitochondrial myopathies',
    'uw:Duchenne and Becker muscular dystrophy', 'uw:Adult-onset Still disease',
    'uw:Autoinflammatory diseases (including familial Mediterranean fever)', 'uw:IgG4-related disease', 'skpharm:Skeletal Muscle Relaxants'] },
  { w:2, title:'Joints', items:[
    'pathoma:18.3 Joint', 'bnb:Arthritis', 'uw:Osteoarthritis', 'uw:Histology: Cartilage'] },
  { w:2, title:'Bone: Non-Neoplastic (1 of 2)', items:[
    'pathoma:18.1 Skeletal System', 'bnb:Bone', 'bnb:Bone Disorders', 'bc:Musculoskeletal|Non-Rheumatologic Diseases',
    'uw:Achondroplasia', 'uw:Osteogenesis imperfecta', 'uw:Formation and remodeling of bone',
    'uw:Ossification and skeletal growth'] },
  { w:2, title:'Bone: Non-Neoplastic (2 of 2)', items:[
    'bnb:Osteoporosis', 'uw:Osteoporosis', 'uw:Paget disease of bone', 'uw:Vitamin D deficiency rickets',
    'uw:Chronic kidney disease: mineral and bone disorders', 'uw:Osteomyelitis'] },
  { w:2, title:'Bone: Neoplastic', items:[
    'pathoma:18.2 Bone Tumors', 'bnb:Benign Bone Tumors', 'bnb:Malignant Bone Tumors',
    'bc:Musculoskeletal|Primary Bone Tumors', 'uw:Benign and malignant bone tumors', 'uw:Osteosarcoma',
    'uw:Ewing sarcoma', 'uw:Giant cell tumor'] },
  { w:2, title:'Management of Rheumatoid Arthritis', items:[
    'bnb:Immunosuppressive Drugs', 'bnb:Glucocorticoids and NSAIDs',
    'bc:Musculoskeletal|Pharmacology|TNF-a Inhibitors & Monoclonal Antibodies',
    'bc:Musculoskeletal|Pharmacology|Imiquimod & Leflunomide',
    'uw:Immunosuppressive therapy: Conventional immunosuppressants',
    'uw:Immunosuppressive therapy: Biologics & targeted immunosuppressants',
    'skpharm:Methotrexate, Leucovorin, 5-Fluorouracil, Hydroxyurea', 'skpharm:Azathioprine, 6-Mercaptopurine, Mycophenolate Mofetil',
    'skpharm:TNF Inhibitors', 'skpharm:Glucocorticoids', 'skpharm:Immunosuppressants'] },
  { w:2, title:'Anti-gout Drugs and Dermatologic Drugs (1 of 2)', items:[
    'bnb:Gout Drugs', 'bc:Musculoskeletal|Pharmacology|Gout Medications', 'bc:Musculoskeletal|Pharmacology|NSAIDs',
    'bc:Musculoskeletal|Pharmacology|Aspirin & Celecoxib', 'bc:Musculoskeletal|Pharmacology|Arachidonic Acid Pathways',
    'uw:Nonsteroidal anti-inflammatory drugs (NSAIDs)', 'uw:COX-1 and COX-2 inhibitors', 'uw:Eicosanoids',
    'uw:Crystal arthropathies: gout and pseudogout', 'skpharm:Gout Drugs', 'skpharm:NSAIDs'] },
  { w:2, title:'Anti-gout Drugs and Dermatologic Drugs (2 of 2)', items:[
    'bc:Musculoskeletal|Pharmacology|Imiquimod & Leflunomide',
    'bc:Infectious Disease|Antifungals|Allylamines, Echinocandins, and Polyenes',
    'bc:Musculoskeletal|Pharmacology|Bisphosphonates, Denosumab, & Teriparatide', 'bnb:Osteoporosis Drugs',
    'uw:Osteoporosis management', 'uw:Vitamin D analogues',
    'skpharm:Griseofulvin, Terbinafine, Echinocandins',
    'skpharm:Bisphosphonates, Raloxifene, Denosumab, Calcitonin', 'skpharm:Teriparatide, Vitamin D, Cinacalcet, Sevelamer'],
    partial:'dermatologic drugs as a topic (retinoids, topical steroids, calcineurin inhibitors) are in none of the six resources; only imiquimod and the antifungals (terbinafine, griseofulvin) have videos' },
  { w:2, title:'Soft Tissue', items:[
    'uw:Bursitis', 'uw:Adhesive capsulitis', 'uw:Rotator cuff syndrome', 'uw:Elbow tendinopathy',
    'uw:De Quervain tendinopathy', 'uw:Dupuytren contracture', 'uw:Ganglion cyst', 'uw:Popliteal (Baker) cyst',
    'uw:Fibromyalgia', 'uw:Clostridial myonecrosis'] },
  { w:2, title:'Connective Tissue Disease', items:[
    'bnb:Systemic Lupus Erythematosus', 'bnb:Scleroderma', 'bnb:Sjögren Syndrome', 'bnb:Vasculitis',
    'bc:Musculoskeletal|Rheumatologic Diseases', 'bc:Musculoskeletal|Vasculitides',
    'uw:Systemic lupus erythematous', 'uw:Scleroderma and CREST syndrome', 'uw:Sjögren disease',
    'uw:Raynaud phenomenon', 'uw:Mechanisms of autoimmunity',
    'uw:Laboratory testing in autoimmune rheumatic disease: Inflammatory markers, autoantibodies, and others',
    'uw:Vasculitis: An overview', 'uw:Giant cell (temporal) arteritis', 'uw:Polyarteritis nodosa',
    'uw:Kawasaki disease', 'uw:Behçet disease', 'uw:Cryoglobulinemia', 'uw:Thromboangiitis obliterans (Buerger disease)',
    'uw:ANCA-associated vasculitis: granulomatosis with polyangiitis (GPA), eosinophilic granulomatosis with polyangiitis (EGPA), and microscopic polyangiitis (MPA).',
    'uw:Relapsing polychondritis', 'uw:Ehlers-Danlos syndrome (EDS)', 'uw:Marfan syndrome',
    'uw:Extracellular matrix and connective tissue'] },
  { w:2, title:'Peripheral Neuropathy', items:[
    'uw:Peripheral nerve structure and function', 'uw:Carpal tunnel syndrome and median nerve compression',
    'uw:Guillain-Barré syndrome', 'uw:Diabetic neuropathy', 'uw:Charcot-Marie-Tooth disease', 'uw:Meralgia paresthetica'] },
  { w:2, title:'Monoarthritis', items:[
    'bnb:Gout', 'bnb:CPPD', 'uw:Crystal arthropathies: gout and pseudogout', 'uw:Septic arthritis'] },
  { w:2, title:'Polyarthritis', items:[
    'bnb:Rheumatoid Arthritis', 'bnb:Seronegative Spondyloarthritis', 'bc:Musculoskeletal|Seronegative Spondyloarthritis',
    'uw:Rheumatoid arthritis', 'uw:Ankylosing spondylitis', 'uw:Reactive arthritis', 'uw:Juvenile idiopathic arthritis'] },
  { w:2, title:'Psychiatric Emergencies', items:[
    'bc:Psychiatry|Pharmacology|Psychiatric Emergencies', 'bc:Psychiatry|Psychotic and Mood Disorders|Suicide'] },
  { w:2, title:'Family Care-Giving',
    gap:'caregiving / caregiver burden — no resource in the six covers it' },
  { w:2, title:'PDRs', none:'professional development session' },
  { w:2, title:'PBL 6A; Career & Academic Development', none:'problem-based learning and advising' },

  // ======================= WEEK 3 =======================
  { w:3, title:'Environmental Pathology', items:[
    'bc:Neurology|Side Effects and Toxins|Environmental Toxins and their Treatments',
    'uw:Carbon monoxide poisoning', 'uw:Cyanide poisoning', 'uw:Lead poisoning',
    'uw:Heavy metal toxicity: Lead, iron, mercury, and arsenic', 'uw:Arsenic poisoning', 'uw:Heat stroke',
    'uw:Cold injuries', 'uw:Electrical injuries, including lightning injuries', 'uw:Radiation exposure',
    'uw:Drowning (submersion injury)', 'uw:High altitude illness', 'uw:Decompression illness',
    'uw:Snakebites', 'uw:Spider bites', 'uw:Arthropod bites and infestations'] },
  { w:3, title:'Clinical Diagnosis of Infectious Diseases; Laboratory Practices', items:[
    'bnb:Virus Structures',
    'bnb:Bacteria', 'bnb:Shapes and Stains', 'bnb:Bacterial Culture', 'bnb:Special Growth Requirements',
    'bnb:Virulence', 'bnb:Growth and Genetics', 'bnb:Bacterial Identification',
    'uw:Basic bacteriology: Structure, virulence factors, and genetics'] },
  { w:3, title:'Immunocompromised Host', items:[
    'bnb:Protozoa', 'bnb:Antifungal Drugs', 'bnb:Antiviral Drugs', 'skmicro:Nocardia',
    'skmicro:HIV Overview (Retroviridae)', 'skmicro:HIV Life Cycle (Retroviridae)', 'skmicro:Cytomegalovirus (Herpesviridae)',
    "skmicro:HHV8 & Kaposi's sarcoma (Herpesviridae)", 'skmicro:Toxoplasmosis',
    'bnb:HIV', 'bnb:HIV CNS Infections', 'bnb:HIV Drugs', 'bnb:Opportunistic Fungal Infections',
    'skmicro:Candida albicans', 'skmicro:Aspergillus fumigatus', 'skmicro:Cryptococcus neoformans',
    'skmicro:Mucor spp. & Rhizopus spp. (Mucormycetes)', 'skmicro:Pneumocystis jirovecii',
    'uw:Acute HIV infection', 'uw:HIV lifecycle',
    'uw:HIV antiretroviral therapy (ART) and the immune reconstitution inflammatory syndrome (IRIS)',
    'uw:Pneumocystis jirovecii pneumonia', 'uw:Candida infections', 'uw:Aspergillosis',
    'uw:Cryptococcal meningoencephalitis', 'uw:Cytomegalovirus (CMV)', 'uw:Toxoplasmosis',
    'uw:Acute invasive fungal rhinosinusitis', 'uw:Neutropenic fever', 'uw:Solid organ transplant: Complications',
    'uw:Kaposi sarcoma',
    'skpharm:NRTIs', 'skpharm:NNRTIs', 'skpharm:Protease Inhibitors', 'skpharm:Maraviroc, Fusion Inhibitors, Integrase Inhibitors',
    'skpharm:Amphotericin & Flucytosine', 'skpharm:Azoles', 'skpharm:Ganciclovir, Valganciclovir, Foscarnet, Cidofovir'] },
  { w:3, title:'Zoonotic Infections', items:[
    'bnb:Spirochetes', 'skmicro:Borrelia burgdorferi', 'skmicro:Borrelia recurrentis', 'skmicro:Leptospirosis interrogans',
    'skmicro:Coxiella burnetii', 'skmicro:Rickettsia Species Overview', 'skmicro:Rickettsia prowazekii', 'skmicro:Rickettsia rickettsii',
    'skmicro:Yersinia enterocolitica, pestis', 'skmicro:Bacillus anthracis, cereus', 'skmicro:Rabies Virus (Rhabdovirus)',
    'skmicro:Ebolavirus & Marburgvirus (Filoviridae)', 'skmicro:Tissue Nematodes',
    'bnb:Zoonotic Infections', 'skmicro:Bartonella henselae', 'skmicro:Brucella', 'skmicro:Francisella tularensis',
    'skmicro:Pasturella multocida', 'skmicro:Anaplasma phagocytophilum & Ehrlichia chaffeensis',
    'uw:Bartonella henselae infections', 'uw:Brucellosis', 'uw:Ehrlichia and Anaplasma',
    'uw:Q fever (Coxiella burnetii infection)', 'uw:Leptospirosis', 'uw:Lyme disease',
    'uw:Rocky Mountain Spotted Fever', 'uw:Yersinia pestis', 'uw:Anthrax', 'uw:Rabies',
    'uw:Animal and human bites', 'uw:Cutaneous larva migrans'] },
  { w:3, title:'Granulomatous Diseases', items:[
    'bnb:Mycobacteria', 'bnb:Fungal Pneumonias', 'skmicro:Actinomyces israelii',
    'bnb:Granulomatous Inflammation', 'skmicro:Mycobacterium tuberculosis', 'skmicro:Mycobacterium leprae',
    'skmicro:Mycobacterium avium intracellulare, Mycobacterium scrofulaceum, Mycobacterium marinum', 'skmicro:Histoplasma capsulatum',
    'skmicro:Blastomyces dermatitidis', 'skmicro:Coccidioides immitis', 'skmicro:Paracoccidioides brasiliensis',
    'uw:Tuberculosis', 'uw:Nontuberculous mycobacteria (NTM)',
    'uw:Leprosy (Hansen disease): Mycobacterium leprae infection', 'uw:Histoplasmosis', 'uw:Blastomycosis',
    'uw:Coccidioidomycosis', 'uw:Paracoccidioidomycosis', 'uw:Sarcoidosis', 'uw:Chronic granulomatous disease',
    'skpharm:Tuberculosis Drugs', 'skpharm:Leprosy Drugs'] },
  { w:3, title:'Back Pain', items:[
    'bnb:Lumbar Radiculopathy', 'bnb:Common Musculoskeletal Conditions', 'bc:Musculoskeletal|Spine',
    'bc:Musculoskeletal|Anatomy — Back', 'uw:Low back pain', 'uw:Cauda equina syndrome', 'uw:Neck pain',
    'uw:Spondylosis, spondylolysis, and spondylolisthesis', 'uw:Vertebral compression fracture',
    'uw:Spinal epidural abscess', 'uw:Cervical spine clearance', 'uw:Anatomy: Vertebrae', 'uw:Anatomy: Layers of the back'] },
  { w:3, title:'Pediatric Fractures', items:[
    'bc:Musculoskeletal|Childhood Musculoskeletal Pathology', 'uw:Fracture patterns in children',
    'uw:Nonaccidental trauma in children', 'uw:Radial head subluxation', 'uw:Slipped capital femoral epiphysis',
    'uw:Legg-Calvé-Perthes disease', 'uw:Developmental dysplasia of the hip', 'uw:Evaluation of pediatric hip pain',
    'uw:Transient synovitis', 'uw:Osgood-Schlatter disease', 'uw:Upper and lower extremity fractures'] },
  { w:3, title:'CBL Cases 6', none:'case-based learning session; the cases are the school\'s own' },
  { w:3, title:'Fever of Unknown Origin', items:[
    'bnb:Malaria', 'skmicro:Plasmodium: Infection & Lifecycle',
    'uw:Tuberculosis', 'uw:Adult-onset Still disease', 'uw:Neutropenic fever', 'uw:Giant cell (temporal) arteritis'],
    partial:'no resource covers FUO itself; the differential (TB, Still disease, vasculitis, neutropenic fever) is covered piecemeal' },
  { w:3, title:'Flipped Classroom. Difficult Encounters', items:[
    'bc:Behavioral Science|Communication|Interviewing Patients', 'bc:Behavioral Science|Communication|Inclusive Interviewing',
    'bnb:Ego Defenses'] },
  { w:3, title:'Ethical and Legal Issues in Psychiatry', items:[
    'uw:Medical decision-making capacity', 'uw:Informed consent in medicine'] },
  { w:3, title:'Flipped Classroom. Diathesis-Stress Model',
    gap:'the diathesis-stress model of psychopathology — no resource in the six covers it' },
  { w:3, title:'Health Law & Policy', items:[
    'uw:Medical malpractice', 'uw:Patient confidentiality and privacy', 'uw:Informed consent in medicine'] },
  { w:3, title:'PDRs', none:'professional development session' },
];
