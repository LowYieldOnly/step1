# One hub for every class: the plan

**Status:** plan only. No code has been written for this.
**Date:** October 20, 2026
**Goal:** the M2 Scheduler gets an **M1 section**. M1s get their own units, built from Brody's M1 schedule and mapped lecture by lecture exactly as the M2 units are, with the same features and the same core ideas. M1s stay inside the M1 schedule and never meet M2 content. The existing M1 Resource Hub is left as it is and isn't built on.

Every number below was measured from the repository at this commit.

---

## 1. The direction, in four sentences

1. **Same engine, new units.** M1 units use the M2 unit format, and everything an M2 plan does works on them: the pour, quiz weeks or even pace, review buffer, reading, Minimal/Comprehensive, opt-outs, your own order, UWorld IDs, Re-fit, past units.
2. **Mapped from scratch, the M2 way.** Each M1 lecture is mapped by hand to the video catalog, through a generator that refuses to write on any error. Each unit gets a lecture-coverage file and a content-map PDF. Law #1 applies in full.
3. **A wall between the classes.** An M1 sees only M1 units, M1 content, M1 notices and M1 past units. Nothing an M1 plan schedules comes from outside M1's scope.
4. **The old M1 hub stays put.** Its data (ScholarRx topics, free-text references) isn't reused. It keeps working for anyone who uses it.

---

## 2. What the M1 schedule looks like

Brody's M1 calendar for Fall 2026 is already in the repository (`m1schedule.json`; the official schedule you'll get replaces it as the source). It has 20 weeks, Aug 3 – Dec 18, and 262 sessions: 168 lectures, 53 labs and 41 FOD sessions, each on its own day. There are weekly Friday quizzes and four exams.

| Unit | Dates | Lectures | Labs | Exam |
|---|---|---|---|---|
| 1 | Aug 3 – Sep 1 | 41 | 16 | Tue Sep 1 |
| 2 | Sep 3 – Oct 9 | 49 | 13 | Fri Oct 9 |
| 3 | Oct 12 – Nov 10 | 46 | 12 | Tue Nov 10 |
| 4 | Nov 12 – Dec 16 | 32 | 12 | Wed Dec 16 |

That is the shape of an M2 unit: about 45 lectures, a quiz each week as the checkpoint, and an exam at the end. **No second engine is needed.** Two things differ, and each gets a check before any code relies on it:

1. **Split weeks.** When an exam falls on a Tuesday (weeks 5 and 15), one calendar week belongs to two units. Unit 2 opens with Sep 3–4 lectures that are quizzed Sep 11, so its first "week" runs Sep 2–11: ten days. The engine's per-week frame scans at most 10 days. That boundary must be confirmed, not assumed.
2. **Dated lectures.** M2 weeks list lectures without days; M1's have them. Weekly pacing works unchanged. The dates are kept, so a day-level view can come later if wanted.

Only **Fall Unit 4** is still ahead this semester (exam Dec 16). Units 1–3 are past. The real launch is **Spring 2027**, from the Spring calendar.

---

## 3. The design

### 3.1 The M1 section

```
M2 Scheduler (one hub)
 ├ M1 section ── M1 units only ── setup ── the plan
 └ M2 section ── M2 units only ── setup ── the plan
```

- **The class is chosen once**, the first time a student enters, with two big buttons: M1 / M2. After that it shows as a label ("M1 · Unit 4"), not as a chip beside the units. Changing class is deliberate: ⋮ menu → Change class, with a confirmation. Their current plan is archived under Past schedules, as starting a new unit does now.
- **Setup is the same flow**, with the class already set: pick your unit (only that class's units, the current one pre-selected) → Brody's order or your own → resources → skip → routine → practice → review.
- **Plans stay in the existing slot** (`cfgs.nbme`), with a `cls` field inside. That means no new sync shape: `persistObj` and `mergeState` don't change, and `mergeState(x,x) === x` holds by construction. A check still asserts it with an M1 plan in the profile.

### 3.2 The wall: how an M1 stays in M1

Each of these is enforced by a check, not by convention:

| Where | Rule |
|---|---|
| Unit picker | An M1 sees only M1 units, and an M2 only M2 units. |
| Your own order | **Add a system** (or for M1, "add a topic") offers only M1-scope content (3.4). An M1 plan can never pull in M2 pathology. |
| Every plan | Nothing an M1 plan schedules is outside M1 scope, and the same holds for M2. |
| What's new | Each entry is tagged by class. An M1 never gets "MSK rheumatology" notices; an M2 never gets M1 ones. General entries go to both. |
| Content Audit and content maps | Show the student's own class's units. |
| Past schedules | Listed by class. |
| Home and countdown | Name the M1 unit and exam ("12 days to Unit 4 exam"). |

### 3.3 Units move out of `index.html` into data files

The four M2 units are JavaScript constants inside `index.html` (13–33 KB each; the page is 662 KB). A year of M1 units would add roughly as much again, every year. **Recommendation:** before the first M1 unit, move all units to data files, one per class and term:

```
units/m2-2026-t3.json     the four current M2 units
units/m1-2026-fall.json   Fall Unit 4
units/m1-2027-spring.json the Spring units
```

- They are fetched and cached by the service worker like `catalog.json`. The scheduler already waits for the catalog before it draws a plan, so waiting for units adds no new loading state.
- Generators write JSON instead of splicing into the page, and `lib/mapsig.js` reads the JSON instead of regex-parsing the page. Both get simpler.
- Each unit gains `cls` and `term`. Existing M2 ids (`heme-renal`, `msk-skin` and the rest) don't change, so every saved and archived plan still opens. New units get year-stamped ids (`m1-2026f-u4`, `m2-2027t3-msk`), so next year's units can't collide with this year's.

### 3.4 M1 scope, and law #1 for M1

For M2, a unit's scope is its organ systems: every video a resource files under them belongs to the unit. M1 isn't organized by organ system, so it needs its own definition: **which sections of each resource are M1 material.** Two things depend on it:

- **Law #1(b):** every video in M1 scope is scheduled in the M1 unit that teaches it, at an explicit week, even where Brody doesn't lecture it.
- **The wall (3.2):** M1 scope is what "add a topic" may offer, and nothing outside it may be scheduled.

What the catalog offers (hours of video):

| Likely M1 | Bootcamp | Boards & Beyond |
|---|---|---|
| Biochemistry | 138 videos, 21.4 h | 28 videos, 9.1 h |
| Cell Biology | 35 videos, 5.4 h | 14 videos, 3.3 h |
| Genetics | 35 videos, 7.2 h | 12 videos, 2.4 h |
| Immunology | 84 videos, 15.0 h | 19 videos, 6.1 h |
| Anatomy, Histology, Embryology | Filed *inside* each organ system ("Anatomy — …", "Histology — …"): 388 anatomy, 319 histology, 26 embryology videos | Inside each system's opening section ("Embryology, Anatomy and Physiology"): 48 anatomy, 34 embryology videos |
| Physiology | 57 videos in physiology-named sections across systems ("Acid-Base Physiology", "Cardiac Parameters…") | 38 videos, inside each system |
| Microbiology | Infectious Disease, 312 videos, 55.6 h; plus Sketchy Micro, 118 videos | 36 videos, 11.6 h |

This needs your call, unit by unit, from the M1 courses: Physiology, Gross Anatomy, Histology, MBOM, Pharmacology, Neuroscience, Host-Microbe Interactions, Pathology, Behavioral Health. The generator then enforces it.

**Law #1(a)** is unchanged: every M1 lecture mapped to third-party content, or a stated reason why not, in a coverage file per unit. C65 already fails any unit that has no coverage file, so M1 units are covered by the law the moment they exist.

### 3.5 One overlap to decide: content both classes study

Some content belongs to both classes. Bootcamp's MSK anatomy, for instance, is M1 Gross Anatomy and is also scheduled in the M2 MSK unit. Progress is one record per video, so an M1 who watches it will find it already done when M2 MSK schedules it a year later. M2 already treats an article read in Neuro and again in MSK the same way.

**Recommendation:** count it as done, with a per-plan option, "Re-watch what I've seen before", that schedules it again (D4).

### 3.6 Profile size

Each done item costs about 170 bytes across `vdone`, `vdoneDate` and `vdoneAt`. Two years of M1 + M2 is about 3,000 items, roughly 0.5 MiB of the 1 MiB profile ceiling. That is fine, but a check should hold a two-year profile under a set budget.

---

## 4. Decisions

| # | Decision | Status |
|---|---|---|
| D1 | M1 lives as its own section of the M2 Scheduler, same features, mapped the M2 way | **Decided** |
| D2 | The old M1 hub isn't built on; it stays as it is | **Decided** |
| D3 | M1s stay within the M1 schedule; nothing from M2 reaches them | **Decided**, enforced as in 3.2 |
| D4 | Videos watched in an earlier year | Recommend: count as done, with a "Re-watch" option |
| D5 | M1 scope: which resource sections are M1 material | **Needed from you**, per course (3.4) |
| D6 | First M1 unit | Recommend: **Fall Unit 4 as a quiet trial** with a few M1 volunteers; it will likely land partway through the unit. **Spring Unit 1 as the launch.** |
| D7 | Who maps M1 lectures | You, or an M1 content lead (the Governing Body slot is open), with the generators enforcing correctness |
| D8 | M1 unit names | The official ones if Brody names them; otherwise "Unit 1–4" |
| D9 | Can a student change class? | Recommend: yes, but only from the ⋮ menu with a confirmation. Their plan is archived, never deleted. |

**Inputs needed:**
- **The M1 schedule.** Spring 2027 in full, and Fall Unit 4 if the official version differs from what's in the repository. Lecture titles by day, quizzes and exams, as you sent for M2.
- **The official M1 unit names.**
- A data check on the current Fall file: it lists **"Quiz 14" twice**, Dec 4 and Dec 10. One is probably Quiz 15.

---

## 5. The phases

Each phase ends with every existing check green (386 assertions today), plus the new checks named. Nothing reaches students before Phase 4.

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
2. Units filtered by class; What's new, past schedules and the Content Audit filtered by class.
3. "Add a topic" in your own order limited to the class's scope (D5).
4. **New check, C69:** an M1 never sees an M2 unit, notice or past plan, and the reverse; the class survives a reload and a sync merge; changing class archives the plan and loses nothing; `mergeState(x,x) === x` holds with an M1 plan. Until D5 is settled, the scope rule is tested against a stand-in list.
5. **Exit:** the section works end to end with a test unit, and you've seen it on a phone.

### Phase 3: Fall Unit 4 (the trial)
1. Write `mk_m1_unit.js`: it reads the M1 calendar, cuts units at the exams (handling split weeks), and splices the unit into `units/m1-2026-fall.json`. It refuses to write if any mapping key misses the catalog, any in-scope video lacks a week, or any key falls outside M1 scope.
2. Write the lecture coverage (32 lectures, 12 labs) and the content-map PDF.
3. **New check, C70:** dates, quizzes and exam match the calendar; the split-week boundary holds; every lecture is accounted for; every in-scope video is at an explicit week; nothing outside M1 scope is scheduled; it fits at a realistic pace; Minimal, even pace and your own order all build. C65 enforces the law on it with no edits.
4. **Exit:** 3–5 M1 volunteers use it for the rest of Unit 4.

### Phase 4: Spring launch
1. Build each Spring unit from the Spring schedule, with the same generator, coverage, PDF and checks per unit.
2. Announce to M1s only, through a class-tagged What's new entry.
3. **Exit:** Spring Unit 1 is mapped, passes the law and is live before its first day.

---

## 6. Risks, stated plainly

- **Mapping is the real cost.** Fall alone is 168 lectures and 53 labs, which is four M2-sized units, and every semester brings more. Without an M1 content lead, this is your time. The generators make the work safe, not small.
- **The scope decision (D5) is load-bearing.** It decides both what law #1 demands of each M1 unit and what the wall lets through. Getting it wrong means either missing M1 content or M1s being handed M2 material. It should be settled before the first M1 unit is mapped.
- **Two calendars in one engine.** Split weeks and dated lectures are the only structural differences found, and both get checks. If a third appears, it gets its own check before code.
- **Competing with M2 deadlines.** M2 units are dated, and students are on them now. Every phase yields to an M2 unit that's due.

---

## 7. What doesn't change

- Every M2 plan: same unit ids, same schedule (C68 proves it), same sync shape.
- The old M1 Resource Hub, M3 Resource Hub, Step 1 Dedicated and the legacy Step 1 Command Center.
