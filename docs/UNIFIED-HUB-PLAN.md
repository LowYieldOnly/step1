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
| Your own order | "Add a topic" offers only B&B and Sketchy series. It never offers an M2 unit, Bootcamp or Pathoma. |
| Every plan | An M1 plan is built only from M1 units and M1 resources, and an M2 plan only from M2 units. |
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

### 3.4 M1 scope: whole series, and law #1 for M1

**Decided: M1 units get whole series, not hand-picked sections.** When an M1 unit teaches a system, it schedules that system's entire Boards & Beyond series, with the Sketchy Pharm videos filed under the same system. The series are short and each M1 unit runs about a month, so they fit.

**The rule is the same as M2's.** Each M1 unit declares its systems and gets every video in them, plus `include` for single videos a lecture needs from elsewhere. There is no section-level scope to maintain, and **law #1(b) reads exactly as it does for M2:** every video of a unit's systems is scheduled in that unit at an explicit week, even where Brody doesn't lecture it.

**Proposed Fall assignment, with whole series and dates from the official schedule.** Pace assumes Sundays off and the default three review days before the exam:

| Unit | Series (B&B, plus Sketchy Pharm for the same systems) | Videos | Video time | Study days | Pace |
|---|---|---|---|---|---|
| 1 (Aug 3 – Sep 1) | Cell Biology · Genetics · Basic Pharmacology · Musculoskeletal, plus Sketchy's 7 autonomic videos for the ANS session | 58 | ~15 h | 22 | **~0.7 h/day** |
| 2 (Sep 3 – Oct 9) | Cardiology · Pulmonary · Biostats/Epi | 106 | ~35 h | 28 | **~1.3 h/day** |
| 3 (Oct 13 – Nov 10) | Gastroenterology · Renal · Biochemistry | 95 | ~31 h | 21 | **~1.5 h/day** |
| 4 (Nov 12 – Dec 15) | Reproductive · Endocrinology · Immunology | 97 | ~28 h | 25 | **~1.1 h/day** |

- **Series Brody splits across units are split by topic.** Biochemistry runs through all four units (flipped classrooms 1–20), Genetics through Units 1–2, Biostats through Units 2–4, and Reproductive through Units 3–4. Each video goes to the unit whose lectures teach it. The hours above put each series wholly in its main unit, so the real split evens them out a little.
- **Every video of an M1 series lands in at least one M1 unit across the year.** A video two lectures share in two units (the M2 psychiatry threads already do this) is done once and shows as done in both. The check runs per unit now, and across the whole year once the Spring units exist.
- **Spring takes the rest.** That is Neurology, Infectious Disease with all of Sketchy Micro (118 videos), Hematology, Psychiatry, Behavioral Science, general Pathology and the smaller series, placed once the Spring schedule arrives. If Spring covers them, an M1 finishes the year having watched all of Boards & Beyond (496 videos, 151 h) and all of Sketchy.
- **UWorld Library follows the same rule.** A unit's reading is the whole UWorld category for each of its systems, e.g. Unit 2: Cardiology (122) + Pulmonary (92) articles, about 8 a day if switched on. Reading stays optional, as for M2.
- **Histology will still be thin.** B&B and Sketchy have almost no histology, so UWorld's Anatomy & Histology articles are the only third-party coverage for those sessions. Law #1(a) is still met, because the coverage files say so lecture by lecture, but the content maps will show it.

**Law #1(a)** is unchanged: every M1 lecture mapped, or a stated reason why not, in a coverage file per unit. C65 already fails any unit without one, so M1 units fall under the law the moment they exist.

### 3.5 M2, a year later: watch it again

With whole series, an M1 watches nearly all of B&B before M2. Progress is one record per video, so today's rule (done is done, across units) would leave next year's M2 units almost empty. M2 is meant to be the second pass, so that would be wrong.

**Recommendation:** an M2 plan schedules everything in its unit again by default, and progress from an earlier class year doesn't count toward it. Each plan gets an option, "Count what I watched as an M1", for anyone who wants the M1 credit.

- Nothing is lost. M1 progress stays in the record, and Stats can show "watched in M1" beside the M2 tick.
- In the engine this is a per-plan start line for counting progress. "Before you arrived" already works this way inside one unit.
- It doesn't affect anyone until the Class of 2030 reaches M2 in summer 2027, but the shape of the progress data should be settled before the first M1 tick is stored.

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
| D6 | M1 scope: whole series for each system a unit teaches | **Decided** (3.4). The Fall assignment of series to units is proposed there; confirm or move any. |
| D7 | M2, a year after M1 | Recommend: M2 plans schedule everything again by default, with "Count what I watched as an M1" as an option (3.5) |
| D8 | First M1 unit | Recommend: **Unit 4 as a quiet trial** with a few M1 volunteers. It will likely land partway through the unit (Nov 12 – Dec 15). **Spring Unit 1 as the launch.** |
| D9 | Who maps M1 lectures | You, or an M1 content lead (the Governing Body slot is open), with the generators enforcing correctness |
| D10 | M1 unit names | The official ones if Brody names them; otherwise "Unit 1–4", with exams as "Exam 1–4" |
| D11 | Can a student change class? | Recommend: yes, from the ⋮ menu with a confirmation; the plan is archived, never deleted |

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
4. "Add a topic" limited to the class's resources: B&B and Sketchy series for M1.
5. **New check, C69:** an M1 never sees an M2 unit, notice, past plan, or a Bootcamp/Pathoma toggle, and the reverse; no M1 plan schedules a Bootcamp or Pathoma item; the class survives a reload and a sync merge; changing class archives the plan and loses nothing; `mergeState(x,x) === x` with an M1 plan.
6. **Exit:** the section works end to end with a test unit, and you've seen it on a phone.

### Phase 3: Fall Unit 4 (the trial)
1. **Transcribe** Unit 4 from the official schedule into `tools/generators/data/m1-2026-fall.json`: every session with its day, discipline and kind, plus the quizzes, exam and reassessments. This is a hand transcription, checked against the PDF, as the M2 Term 3 calendar was.
2. Write `mk_m1_unit.js`: it reads the transcription, cuts units at the exams (handling split weeks), and splices the unit into `units/m1-2026-fall.json`. It refuses to write if a mapping key misses the catalog, a video of the unit's systems lacks a week, or a key is a Bootcamp or Pathoma item.
3. Write the lecture coverage and the content-map PDF.
4. **New check, C70:** dates, quizzes, exam and reassessment match the transcription; the split-week and no-quiz-week boundaries hold; every session is accounted for; every video of the unit's systems is at an explicit week; no Bootcamp or Pathoma item is scheduled; it fits at a realistic pace; Minimal, even pace and your own order all build. C65 enforces the law on it with no edits.
5. **Exit:** 3–5 M1 volunteers use it for the rest of Unit 4.

### Phase 4: Spring launch
1. Transcribe the Spring schedule; build each Spring unit with the same generator, coverage, PDF and checks.
2. Announce to M1s only, through a class-tagged What's new entry.
3. **Exit:** Spring Unit 1 is mapped, passes the law and is live before its first day.

---

## 6. Risks, stated plainly

- **Mapping is the real cost.** Each Fall unit is M2-sized, and every semester brings more. Two things help: there are two video resources to map instead of four, and whole series mean placing videos by week, not choosing which ones belong. Without an M1 content lead, this is your time.
- **The M2 re-watch default (D7) must be settled before the first M1 tick is stored.** Whole series mean M1s will have watched most of B&B by M2. If done stays done, next year's M2 plans come up nearly empty.
- **Thin histology coverage** is a consequence of the resource choice, not a defect, but students will see it on the content maps.
- **The UWorld Physiology list is missing**, and physiology is most of M1. Without it, Library reading for M1 will skip physiology.
- **Competing with M2 deadlines.** M2 units are dated, and students are on them now. Every phase yields to an M2 unit that's due.

---

## 7. What doesn't change

- Every M2 plan: same unit ids, same schedule (C68 proves it), same sync shape, and same resources, including Bootcamp and Pathoma.
- The old M1 Resource Hub and its `m1schedule.json`; the M3 Resource Hub; Step 1 Dedicated; the legacy Step 1 Command Center.
