# One hub for every class: the plan

**Status:** plan only. No code has been written for this.
**Date:** October 20, 2026
**Goal:** the M2 Scheduler gets an **M1 section**. M1s get their own units, built from Brody's official M1 schedule and mapped lecture by lecture exactly as the M2 units are, with the same features and the same core ideas.

- M1s stay inside the M1 schedule and never see an M2 unit.
- M1s use only the resources they have: **Boards & Beyond, Sketchy, UWorld and AnKing.** No Bootcamp, no Pathoma.
- The existing M1 Resource Hub is left as it is and isn't built on.

Every number below was measured from the repository, or read from the official Fall 2026 M1 schedule (21 pages, printed 7/13/2026).

---

## 1. The direction, in five sentences

1. **Same engine, new units.** M1 units use the M2 unit format, so everything an M2 plan does works on them: the pour, quiz weeks or even pace, review buffer, reading, Minimal/Comprehensive, opt-outs, your own order, UWorld IDs, Re-fit and past units.
2. **Mapped from scratch, the M2 way.** Each M1 lecture is mapped by hand, through a generator that refuses to write on any error. Each unit gets a lecture-coverage file and a content-map PDF. Law #1 applies in full.
3. **Four resources.** M1 plans offer Boards & Beyond, Sketchy, UWorld (question IDs and Library reading) and AnKing tags. Bootcamp and Pathoma are never offered to an M1 and never scheduled for one.
4. **A wall between the classes.** An M1 sees only M1 units, M1 resources, M1 notices and M1 past units.
5. **The old M1 hub stays put.** Its data isn't reused.

---

## 2. The official M1 schedule

### What it holds
- **Fall 2026 only:** orientation July 27–31, then 20 teaching weeks, Aug 3 – Dec 18.
- **Sessions by discipline:** Physiology (PHLY), Gross Anatomy lectures and labs (ANAT, including embryology and radiology), Histology (HISTO), MBOM flipped classrooms 1–20, Pharmacology, LPM, Immunology, Clinical Application cases, FOD and CBL.
- **Assessments:** a quiz most Fridays, a makeup quiz the following week, four exams, and a reassessment for each of the first three exams.

### The four units

| Unit | Teaching | Quizzes | Exam | Reassessment |
|---|---|---|---|---|
| 1 | Aug 3 – Aug 28 | 1–4 (Aug 7, 14, 21, 28) | **Tue Sep 1** | Mon Oct 12 |
| 2 | Sep 3 – Oct 7 | 5–8 (Sep 11, 18, 25, Oct 2) | **Fri Oct 9** | Tue Nov 24 |
| 3 | Oct 13 – Nov 6 | 9–12 (Oct 16, 23, 30, Nov 6) | **Tue Nov 10** | Thu Dec 17 |
| 4 | Nov 12 – Dec 11 | 13–14 (Nov 20, Dec 4) | **Tue Dec 15** | — |

### The MBOM flipped classrooms, by unit
They show how cleanly M1 content lines up with Boards & Beyond:

- **Unit 1:** 1 DNA Replication & Repair · 2 Gene Transcription · 3 Basic Genetic Inheritance · 4 Complex Genetic Inheritance · 5 Translation & Protein Synthesis
- **Unit 2:** 6 Gene Expression, Cell Cycle & Oncogenesis · 7 Clinical Genetics · 8 Genetic Risk Assessment · 9 Proteins & Enzymes · 10 Coagulation & Connective Tissue · 11 Human Nutrition
- **Unit 3:** 12 Signal Transduction & Metabolism · 13 Carbohydrate Catabolism · 14 Carbohydrate Anabolism · 15 Lipid Metabolism
- **Unit 4:** 16 Cholesterol & Ethanol Metabolism · 17 Exercise & Metabolism · 18 Nitrogen Metabolism · 19 Amino Acid Metabolism · 20 Nucleotide Metabolism

### What the engine has to handle (each gets a check first)
1. **Split weeks.** Exams on a Tuesday (Sep 1, Nov 10, Dec 15) put two units in one calendar week. Unit 2 opens Thu Sep 3, and Quiz 5 (Sep 11) covers Sep 3–4 plus the next week, so its first "week" runs Sep 2–11: ten days. The engine's per-week frame scans at most 10 days, so that boundary must be confirmed, not assumed.
2. **A week with no quiz.** Week 19 (Dec 7–11: the four Immunology lectures, flipped classrooms 19–20) has no quiz after it. Its deadline is Exam 4. The engine already falls through to the exam when no checkpoint follows a week, and C62 covers this for MSK. M1 gets the same check.
3. **Thanksgiving.** Week 17 teaches only on Monday, Nov 23. That day's content folds into the following week, which Quiz 14 covers.

### The repo's M1 calendar is not a usable source
`m1schedule.json`, which the old M1 hub reads, was compared against the official schedule:

- It **drops whole disciplines.** There are no LPM sessions, no Immunology lectures (all four in week 19 are missing), and no CBL.
- It **counts study time as teaching.** 35 "MBOM Prep" and "Histo Prep" blocks are listed as lectures.
- It has **Exam 4 on Dec 16.** The official date is **Tue Dec 15**; Dec 16 is "CAS Exam Open".
- Its "Quiz 14" on Dec 10 is **the makeup for Quiz 14.** The real Quiz 14 is Fri Dec 4. (This resolves the duplicate the earlier version of this plan flagged.)

**Decision:** M1 units are transcribed from the official schedule, the way the M2 units were from the Term 3 calendar. The old file stays as it is, for the old hub only.

---

## 3. The design

### 3.1 The M1 section

```
M2 Scheduler (one hub)
 ├ M1 section ── M1 units only ── setup ── the plan
 └ M2 section ── M2 units only ── setup ── the plan
```

- **The class is chosen once**, the first time a student enters, with two big buttons: M1 / M2. After that it's a label ("M1 · Unit 4"), not a chip beside the units. Changing class is deliberate: ⋮ menu → Change class, with a confirmation. The current plan is archived under Past schedules, never deleted.
- **Setup is the same flow**, with the class already set: pick your unit (that class's units only, the current one pre-selected) → Brody's order or your own → resources → skip → routine → practice → review.
- **Plans stay in the existing slot** (`cfgs.nbme`), with a `cls` field inside. That means no new sync shape: `persistObj` and `mergeState` don't change, and `mergeState(x,x) === x` holds by construction. A check still asserts it with an M1 plan in the profile.
- **Reassessment dates are one tap away** in your own order. A student retaking Exam 2 picks "Reassessment · Tue Nov 24" as their exam, and the plan paces to it.

### 3.2 The wall: how an M1 stays in M1

Each rule is enforced by a check, not by convention:

| Where | Rule |
|---|---|
| Resources | An M1 plan offers **B&B, Sketchy, UWorld Library and AnKing** only. The Bootcamp and Pathoma toggles don't appear in M1 setup or the M1 Plan tab, and no M1 plan ever schedules a Bootcamp or Pathoma item. |
| Unit picker | An M1 sees only M1 units, and an M2 only M2 units. |
| Your own order | "Add a topic" offers only the M1 list (3.4): other systems' anatomy and physiology, and Biochemistry. It never offers M2 pathology, Bootcamp or Pathoma. |
| Every plan | An M1 plan schedules only the M1 list plus the unit's declared lecture includes. Nothing else. |
| What's new | Each entry is tagged by class. M1s never get M2 unit notices, and the reverse; general entries go to both. |
| Content Audit and content maps | Show the student's own class. |
| Past schedules | Listed by class. |
| Home and countdown | Name the M1 unit and exam ("12 days to Exam 4"). |

### 3.3 Units move out of `index.html` into data files

The four M2 units are JavaScript constants inside `index.html` (13–33 KB each; the page is 662 KB), and a year of M1 units would add roughly as much again. **Recommendation:** before the first M1 unit, move all units to data files, one per class and term:

```
units/m2-2026-t3.json       the four current M2 units
units/m1-2026-fall.json     the Fall M1 units
units/m1-2027-spring.json   the Spring M1 units
```

- They are fetched and cached by the service worker like `catalog.json`. The scheduler already waits for the catalog, so units add no new loading state.
- Generators write JSON instead of splicing into the page, and `lib/mapsig.js` reads JSON instead of regex-parsing the page.
- Each unit gains `cls` and `term`. Existing M2 ids (`heme-renal`, `msk-skin`, …) don't change, so every saved and archived plan still opens. New units get year-stamped ids (`m1-2026f-u4`, `m2-2027t3-msk`).

### 3.4 M1 scope: anatomy and physiology, plus all of Biochemistry

**Decided.**
- For each organ system an M1 unit teaches, M1s get Boards & Beyond's **anatomy, physiology and embryology** videos for that system, not its pathology.
- **Biochemistry is the exception:** all 28 videos (9.1 h), placed across the four units by topic.
- Everything else (genetics, immunology, biostatistics, pharmacology, Sketchy) comes in **only where a specific lecture needs it**. That is the same `include` mechanism the M2 units use for one-off videos.

**The M1 list.** B&B mixes anatomy and physiology with disease inside some sections, so the list is a mix of whole sections and named videos. It is written once, as a declared list the generator enforces:

| System | M1 videos (Boards & Beyond) |
|---|---|
| Musculoskeletal | "Anatomy and Orthopedics" (8): shoulder and elbow, brachial plexus, wrist, hand, hip, knee, lumbosacral plexus, lumbar radiculopathy · Skeletal, Cardiac and Smooth Muscle, Bone (4) |
| Cardiology | "Anatomy and Physiology" (9) · Cardiac Embryology · EKG Basics |
| Pulmonary | "Embryology, Anatomy and Physiology" (14) |
| Hematology | Coagulation I and II, Platelets (for flipped classroom 10, Coagulation & Connective Tissue) |
| Gastroenterology | "Anatomy" (7) · "GI Physiology" (5) |
| Renal | "Embryology, Anatomy and Physiology" (10) · Acid Excretion · Acid-Base Principles |
| Reproductive | "Embryology" (10) · Spermatogenesis and Oogenesis · Placenta · Pregnancy |
| Endocrinology | Thyroid Anatomy & Physiology · Thyroid Hormone Synthesis & Labs · Adrenal Glands · Insulin · Glucagon & Hypoglycemia · Pituitary Anatomy & Physiology · Parathyroid Glands · Signaling Pathways · Reproductive, Male and Female Reproductive Hormones · Menstrual Cycle |
| Biochemistry | **All 28**, comprehensive |
| Spring, once the schedule arrives | Neurology's Introduction, Nervous System Structures and Autonomic Nervous System sections; the rest of Hematology's normal physiology; any other system Spring teaches |

**Placed in the Fall units by topic** (pace with Sundays off and three review days):

| Unit | What it gets | Videos | Video time | Pace |
|---|---|---|---|---|
| 1 (Aug 3 – Sep 1) | Upper-limb anatomy, muscle and bone; Biochemistry: DNA Structure | 9 | ~2.7 h | ~0.1 h/day |
| 2 (Sep 3 – Oct 9) | Cardiac and pulmonary anatomy, physiology and embryology; coagulation; Biochemistry: the three vitamin videos (flipped classroom 11, Human Nutrition) | 31 | ~10.9 h | ~0.4 h/day |
| 3 (Oct 13 – Nov 10) | GI and renal anatomy and physiology; spermatogenesis; Biochemistry: carbohydrate, TCA, electron transport, fatty acids, ketones, lipid metabolism (flipped classrooms 12–15) | 38 | ~12.3 h | ~0.6 h/day |
| 4 (Nov 12 – Dec 15) | Reproductive embryology and pregnancy; endocrine physiology; lower-limb anatomy; Biochemistry: ethanol, exercise, cholesterol and lipid drugs, amino acids, ammonia, purines and pyrimidines, inborn errors, lysosomal storage (flipped classrooms 16–20) | 39 | ~11.3 h | ~0.5 h/day |

Lecture includes add a little to each unit: genetics for the inheritance classrooms, B&B and Sketchy autonomic videos for the ANS session, basic immunology for week 19, biostatistics for FOD, and the pharmacology sessions.

What this means:
- **M1 plans are light: about 3–12 hours of video per unit.** The plan's minimum pace is 0.5 h/day, so most M1 plans will finish well before their exam. For M1, UWorld Library reading and the daily AnKing search carry more of the load than video does.
- **UWorld Library follows the same rule:** Anatomy & Histology (54), Embryology (34), Physiology (titles still missing), and the biochemistry articles in Cell Bio, Biochem, Genetics (59).
- **Law #1(b) for M1:** every video on the M1 list is scheduled in an M1 unit at an explicit week, all of Biochemistry included. That's checked per unit now, and across the whole year once the Spring units exist.
- **Histology is still thin.** B&B has almost none, so UWorld's Anatomy & Histology articles are the only third-party coverage for those sessions. The coverage files say so lecture by lecture, so law #1(a) is still met.

**One question this leaves open: Genetics and Cell Biology.** MBOM teaches them as heavily as metabolism: flipped classrooms 1–8 are DNA replication, transcription, inheritance, translation, gene expression and clinical genetics. As written, B&B Genetics (12 videos, 2.4 h) and Cell Biology (14, 3.3 h) come in lecture by lecture. Making them comprehensive like Biochemistry would add about 6 hours across Units 1–2 (D12).

**Law #1(a)** is unchanged: every M1 lecture mapped, or a stated reason why not, in a coverage file per unit. C65 already fails any unit without one, so M1 units fall under the law the moment they exist.

### 3.5 M2, a year later

M1s will have watched the anatomy, physiology and embryology sections of most systems, plus all of Biochemistry: roughly 40 hours. M2 units schedule those same videos again as part of each whole system. Progress is one record per video, so by default they show as done in M2.

**Recommendation: leave that default, with an option to watch them again.** It is foundation material, M2's Minimal mode already drops it, and counting it as done keeps M2 days lighter. An M2 who wants the second pass turns on "Re-watch what I saw as an M1" for that plan.

(When M1 units held whole series, this default would have emptied M2 plans, and the recommendation was the reverse. With anatomy and physiology only, it no longer does.)

### 3.6 Profile size

Each done item costs about 170 bytes across `vdone`, `vdoneDate` and `vdoneAt`. Two years of M1 + M2 is a few thousand items, well under half of the 1 MiB profile ceiling, but a check should hold a two-year profile under a set budget.

---

## 4. Decisions

| # | Decision | Status |
|---|---|---|
| D1 | M1 is its own section of the M2 Scheduler, same features, mapped the M2 way | **Decided** |
| D2 | The old M1 hub isn't built on; it stays as it is | **Decided** |
| D3 | M1s stay within the M1 schedule; nothing from M2 reaches them | **Decided**, enforced as in 3.2 |
| D4 | M1 resources are B&B, Sketchy, UWorld and AnKing; no Bootcamp or Pathoma | **Decided** |
| D5 | M1 units come from the official schedule, not `m1schedule.json` | **Decided** (2, above) |
| D6 | M1 scope: anatomy and physiology for each system a unit teaches, plus all of Biochemistry; everything else lecture by lecture | **Decided** (3.4). The video list is proposed there; confirm or edit. |
| D7 | M2, a year after M1 | Recommend: what an M1 watched counts as done in M2, with "Re-watch what I saw as an M1" as an option (3.5) |
| D8 | First M1 unit | Recommend: **Unit 4 as a quiet trial** with a few M1 volunteers. It will likely land partway through the unit (Nov 12 – Dec 15). **Spring Unit 1 as the launch.** |
| D9 | Who maps M1 lectures | You, or an M1 content lead (the Governing Body slot is open), with the generators enforcing correctness |
| D10 | M1 unit names | The official ones if Brody names them; otherwise "Unit 1–4", with exams as "Exam 1–4" |
| D11 | Can a student change class? | Recommend: yes, from the ⋮ menu with a confirmation; the plan is archived, never deleted |
| D12 | Genetics and Cell Biology: comprehensive like Biochemistry, or lecture by lecture? | **Your call** (3.4). As written: lecture by lecture. |

**Inputs still needed:**
- **The Spring 2027 M1 schedule**, in the same form. The one sent covers Fall only.
- **UWorld Library's Physiology titles**, and its Preclinical/Basic sciences titles. Both arrived empty in the list you sent for MSK, and Physiology is most of M1.
- The **official M1 unit names**, if they exist.

---

## 5. The phases

Each phase ends with every existing check green (386 assertions today), plus the new checks named. Nothing reaches students before Phase 3's trial.

### Phase 0: The GI, Nutrition & Multisystem M2 unit first
Current M2s need it before Nov 9, and it holds the cancer pharmacology that Heme/Renal defers. This plan waits behind it.

### Phase 1: Foundation, with no visible change
1. Move the four M2 units to `units/m2-2026-t3.json` and load them with the catalog. Point the generators and `mapsig.js` at the JSON.
2. Add `cls` and `term` to every unit, and `cls:"m2"` to existing plans when they load.
3. Tag every What's new entry with a class (existing ones: `m2`).
4. **New check, C68:** units load from data with a class and term; ids are unique; a plan saved before the move builds the **identical** schedule after it (same items, days and pace, compared against a capture from the old build).
5. **Exit:** all existing assertions pass with units loaded from JSON, and the page is about 80 KB smaller.

### Phase 2: The M1 section, built empty
1. Choose your class on first entry; the class label; ⋮ → Change class.
2. Units, What's new, past schedules and the Content Audit filtered by class.
3. M1 resource toggles: B&B, Sketchy, UWorld Library, AnKing only.
4. "Add a topic" limited to the M1 list for M1 plans.
5. **New check, C69:** an M1 never sees an M2 unit, notice, past plan, or a Bootcamp/Pathoma toggle, and the reverse; no M1 plan schedules a Bootcamp or Pathoma item; the class survives a reload and a sync merge; changing class archives the plan and loses nothing; `mergeState(x,x) === x` with an M1 plan.
6. **Exit:** the section works end to end with a test unit, and you've seen it on a phone.

### Phase 3: Fall Unit 4 (the trial)
1. **Transcribe** Unit 4 from the official schedule into `tools/generators/data/m1-2026-fall.json`: every session with its day, discipline and kind, plus the quizzes, exam and reassessments. This is a hand transcription, checked against the PDF, as the M2 Term 3 calendar was.
2. Write `mk_m1_unit.js`: it reads the transcription, cuts units at the exams (handling split weeks), and splices the unit into `units/m1-2026-fall.json`. It refuses to write if a mapping key misses the catalog, a video on the M1 list for the unit's systems lacks a week, a key is neither on the M1 list nor a declared lecture include, or a key is a Bootcamp or Pathoma item.
3. Write the lecture coverage and the content-map PDF.
4. **New check, C70:** dates, quizzes, exam and reassessment match the transcription; the split-week and no-quiz-week boundaries hold; every session is accounted for; every M1-list video of the unit's systems is at an explicit week; nothing off the list is scheduled except declared lecture includes; no Bootcamp or Pathoma item is scheduled; it fits at a realistic pace; Minimal, even pace and your own order all build. C65 enforces the law on it with no edits.
5. **Exit:** 3–5 M1 volunteers use it for the rest of Unit 4.

### Phase 4: Spring launch
1. Transcribe the Spring schedule; build each Spring unit with the same generator, coverage, PDF and checks.
2. Announce to M1s only, through a class-tagged What's new entry.
3. **Exit:** Spring Unit 1 is mapped, passes the law and is live before its first day.

---

## 6. Risks, stated plainly

- **Mapping is the real cost.** Each Fall unit is M2-sized, and every semester brings more. Two things help: there are two video resources to map instead of four, and the M1 list is short (about 120 videos for Fall). Without an M1 content lead, this is your time.
- **The M1 list is a judgment call, video by video.** Where B&B mixes physiology with disease (Endocrine, Reproductive, Renal acid-base), the line is drawn by name. It's one declared list, reviewed once, and the generator holds every unit to it.
- **Thin histology coverage** is a consequence of the resource choice, not a defect, but students will see it on the content maps.
- **The UWorld Physiology list is missing**, and physiology is most of M1. Without it, Library reading for M1 will skip physiology.
- **Competing with M2 deadlines.** M2 units are dated, and students are on them now. Every phase yields to an M2 unit that's due.

---

## 7. What doesn't change

- Every M2 plan: same unit ids, same schedule (C68 proves it), same sync shape, and same resources, including Bootcamp and Pathoma.
- The old M1 Resource Hub and its `m1schedule.json`; the M3 Resource Hub; Step 1 Dedicated; the legacy Step 1 Command Center.
