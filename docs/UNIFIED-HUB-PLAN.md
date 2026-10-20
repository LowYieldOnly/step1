# One hub for every class: the plan

**Status:** plan only. No code has been written for this.
**Date:** October 20, 2026
**Goal:** the M2 Scheduler becomes BRODY MODE's single scheduler, serving M1s as well as M2s. A student picks their class, then their unit, then builds a plan exactly as M2s do today. The M1 Resource Hub stays live, unchanged, until the new path has carried M1s through at least one full unit.

Every number below was measured from the repository at this commit.

---

## 1. Where things stand

### The hubs

| Hub | Key | What it is | Has a plan? |
|---|---|---|---|
| M2 Scheduler | `nbme` | The paced scheduler: Brody units, the pour, quizzes and exams, reading, Minimal, your own order | Yes, `cfgs.nbme` |
| M1 Resource Hub | `m1` | A browser over 662 ScholarRx topics, a lecture checklist, progress | No |
| M3 Resource Hub | `m3` | Shelf resources | No |
| Step 1 Dedicated | `stepd` | NBME / UWorld score tracking | No |
| Step 1 Command Center (legacy) | `step1` | The original whole-Step-1 scheduler | Yes, `cfgs.step1` |

### Why M1 isn't scheduled today

The M1 hub's own source says it outright: *"The Brody mastersheet is a resource cross-reference (no video durations), so M1 is a browser + light tracking, NOT a paced scheduler."* The scheduler paces by minutes of video. M1's data names resources in free text, so it has no minutes to pace with.

What M1 has:

- **The library** (`m1data.json`, 443 KB): 11 courses, 662 ScholarRx topics ("bricks"). 645 have a ScholarRx link and 574 have AnKing tags. Each brick lists resources as text:

  | Resource | References |
  |---|---|
  | Boards & Beyond | 723 |
  | Bootcamp | 827 |
  | Osmosis | 441 |
  | Pathoma | 351 |
  | First Aid | 236 |
  | Sketchy | 219 |
  | Dirty Medicine | 54 |

- **The class calendar** (`m1schedule.json`): Fall 2026, 20 weeks (Aug 3 – Dec 18), 262 sessions. 168 lectures, 53 labs and 41 FOD sessions, each on its own day. It has weekly Friday quizzes and four exams: Sep 1, Oct 9, Nov 10, Dec 16.
- **Progress:** "studied" is `S.vdone["m1:<brick>"]`, the same map M2 uses. The four-step lecture rhythm (preview, attend, reinforce, Anki) lives in `S.settings.m1FlowDone`, keyed `date|index|step`.
- **Lecture links:** only 31 of 662 bricks name the lecture they belong to. The planner's per-lecture resources were removed. So today **no M1 lecture is mapped to third-party content.** That is law #1, part (a), not yet met for M1.

### Can M1's references be resolved to timed videos?

Matched against `catalog.json` naively (numbering stripped, names normalized), with no hand work:

| Resource | Refs that match a catalog video | Note |
|---|---|---|
| Bootcamp | 673 / 827 (81%) | Most misses are section headers and "***" notes |
| Boards & Beyond | 291 / 723 (40%) | Many refs name a section ("Renal >"), not a video |
| Pathoma | 115 / 351 (33%) | M1's chapter numbering doesn't match Pathoma's |
| Sketchy | 4 / 219 | M1 cites Sketchy **Pathology**, which isn't in the catalog |
| Osmosis, First Aid, Dirty Medicine | — | Not in the catalog; no runtimes |

**468 of 662 bricks resolve to at least one timed video already.** The rest need a declared crosswalk: aliases for renamed videos, and splits where one entry covers several videos. The UWorld question-ID import used the same method and got 3,105 of 3,127 IDs placed, refusing to write on any bad declaration.

### What the M1 calendar looks like as units

Cut at the four exams, the Fall calendar splits like this:

| Unit | Dates | Lectures | Labs | Exam |
|---|---|---|---|---|
| 1 | Aug 3 – Sep 1 | 41 | 16 | Tue Sep 1 |
| 2 | Sep 3 – Oct 9 | 49 | 13 | Fri Oct 9 |
| 3 | Oct 12 – Nov 10 | 46 | 12 | Tue Nov 10 |
| 4 | Nov 12 – Dec 16 | 32 | 12 | Wed Dec 16 |

That is the same shape as an M2 unit: about 45 lectures, a weekly quiz as the checkpoint, and an exam at the end. **The scheduler doesn't need a second engine for M1.** It needs M1 units in the format it already reads.

Two differences the engine has to absorb:

1. **Split weeks.** Exams fall on a Tuesday (weeks 5 and 15), so a calendar week can belong to two units. Sep 3–4 lectures open Unit 2 and are quizzed Sep 11, so Unit 2's first "week" runs Sep 2–11: ten days. The engine's per-week frame scans at most 10 days. That boundary has to be confirmed by a check, not assumed.
2. **Day-level lectures.** M2 weeks list their lectures without dates. M1 lectures have dates. Weekly pacing works unchanged. The dates add something M2 lacks: the lecture rhythm can sit on the right day.

---

## 2. The design

### 2.1 Class → unit → plan

```
Home
 └ Class:  [ M1 ] [ M2 ]                      remembered; one tap to switch
     └ Unit:  the class's units, current one first, each with its exam date and your progress
         └ Plan:  Brody's order / My own order → resources → skip → routine → practice → review
```

- **Two taps to the right setup.** The class is remembered. The current unit is chosen by date, as `brodyCurrentBlockId()` does for M2 now. Setup opens with the unit already picked, so the "plan" and "block" steps fall away.
- **Every M2 feature works for M1 units** because they are the same object: even pace, review buffer, Minimal/Comprehensive, opt-outs, your own order, reading, UWorld IDs, Re-fit, past units.

### 2.2 One unit format for every class

Each unit is a record in the shape of today's Brody blocks, plus three fields:

```js
{ id:"m1-2026f-u4", cls:"m1", term:"2026 Fall",
  name:"Unit 4",                       // official name: see D10
  weeks:[{n, start, label, lectures:[{disc, title, date}]}],   // date: new, optional
  checkpoints:[…quizzes], shelf:"2026-12-16",
  explicit:true,                        // membership = exactly the keys mapped below
  videoWeek:{…}, artWeek:{…} }
```

- **`cls`** filters units by class. **`term`** lets next year's calendars sit beside this year's.
- **`explicit:true`**: M1 isn't organized by organ system, so "every video of these systems" doesn't apply. A unit holds exactly what its maps list. Today's `systems` + `include` + `exclude` rule stays for M2 units. The synthetic "own order" unit already works this way through its `member` map, so the engine path exists.
- **Existing M2 ids don't change.** `heme-renal`, `msk-skin` and the rest stay valid for every saved and archived plan. New units get year-stamped ids (`m2-2027t3-msk`), so next year's MSK can't collide with this year's.

### 2.3 Units move out of `index.html` into data files

M2's four units are JavaScript constants inside `index.html` (13–33 KB each; the page is 662 KB). M1's Fall units would add roughly another 80–130 KB. **Recommendation:** before any M1 unit lands, move units to `units/<class>-<term>.json`. They would be fetched and cached by the service worker like `catalog.json`.

- The scheduler already waits for the catalog before it draws a plan, so waiting for units too adds no new loading state.
- Generators write JSON instead of splicing into the page, which is simpler. `lib/mapsig.js` reads the JSON instead of regex-parsing the page.
- It is Stage 2 of `OPEN-RESOURCE-PLAN.md` ("curriculum out of code") done for a reason that pays off now.

### 2.4 The M1 resource layer

| Resource | In the plan as | How |
|---|---|---|
| B&B, Pathoma, Bootcamp, Sketchy Micro/Pharm | **Timed videos**, paced by hours | Via the crosswalk (2.5) |
| ScholarRx bricks | **Reading**, paced by count per day, like UWorld articles | Added to the catalog as `res:"rx"`, keeping their `m1:` ids so M1-hub progress carries over |
| Osmosis, Sketchy Path, First Aid, Dirty Medicine | **References**, shown on the item and the lecture, not scheduled | No runtimes. A runtime catalog would be vendor-derived data (`OPEN-RESOURCE-PLAN.md`, Stage 0) |

`isArticle(v)` becomes "is reading" (UWorld articles **or** ScholarRx bricks). The articles-per-day pace, the reading toggle and the "N to read" counts then work for bricks without new code paths.

### 2.5 The crosswalk

The crosswalk is a generator, `tools/generators/mk_m1_crosswalk.js`, in the house style:

- Resolve every M1 reference to a catalog video by exact name first, then through declared **aliases** (renamed videos) and **splits** (one reference → several videos).
- **Refuse to write** if a declaration names a video the catalog doesn't have, or matches nothing in the M1 data.
- **Report** what stays unresolved, by resource, rather than guess. A wrong link sends a student to a video that doesn't match their lecture, which is worse than no link.
- Output: brick → catalog keys. Unit generators read it.

### 2.6 The #1 law, for M1

- **(a) Every M1 lecture mapped** to third-party content, or a stated reason why not. That means one coverage file per M1 unit (`tools/generators/coverage/m1-2026f-u4.js`), the same as MSK. C65 then enforces it for M1 units with no change to the check: a unit without a coverage file fails.
- **(b) Every video a resource files under the unit's scope is scheduled** in that unit at an explicit week. M2's scope is "the unit's systems". **M1 needs its scope defined (D6).** Bootcamp files anatomy, histology, embryology and physiology inside each organ system ("Anatomy — …", "Histology — …"). Biochemistry, Cell Biology and Genetics are their own systems. Proposed scope: those sections, the systems M1 owns outright, and whatever the crosswalk maps. This needs your call.

### 2.7 The Study tab, for a class with dated lectures

When the unit's lectures have dates, the Study tab gets a **Today's lectures** card: each lecture with the four-step rhythm (preview, attend, reinforce, Anki).

- It reads and writes the same `m1FlowDone` keys from the same `m1schedule.json`, so ticks made in the old M1 hub show up here and the reverse.
- The **reinforce** step links to the videos the pour placed for that lecture's week.
- The M1 **Browse** library becomes a **Library** tab for M1 plans: every brick, ScholarRx link, AnKing tags and search, as it works now.
- The "a supplement, not a substitute" note shows once, on first entry to an M1 plan, from the same `m1Ack` setting.

### 2.8 Sync and storage

- **No new sync shape.** The plan stays in `cfgs.nbme`, with `cls` and the unit id inside it. `persistObj` and `mergeState` don't change, so `mergeState(x,x) === x` holds by construction. A check still asserts it with an M1 plan in the profile.
- **One progress record across years.** Item ids are shared, so a Bootcamp anatomy video watched as an M1 is done when M2 MSK schedules it. That is how M2 already treats an article read in Neuro and again in MSK. See D7 for re-watching.
- **Size.** Each done item costs about 170 bytes across `vdone`, `vdoneDate` and `vdoneAt`. Two years of M1 + M2 is about 3,000 items, roughly 0.5 MiB of the 1 MiB profile ceiling. That is fine, but a check should hold a two-year profile under a set budget.

---

## 3. Decisions for you

Each comes with my recommendation. The phases below assume the recommendation.

| # | Decision | Recommendation |
|---|---|---|
| D1 | Which classes in the first version | **M1 and M2.** M3 and Step 1 Dedicated keep their own hubs. The class switch leaves room for them later. |
| D2 | Where the class is chosen | **On the home screen, remembered.** Not inside setup, so it's one tap, once. |
| D3 | How finely M1 is paced | **Weekly, exactly like M2.** Each week's content before its Friday quiz. Pacing by the day of the lecture can come later, because the dates are kept. |
| D4 | ScholarRx bricks | **Scheduled as reading** (count per day), toggled like UWorld Library. |
| D5 | Osmosis, Sketchy Path, First Aid, Dirty Medicine | **References only** until there's lawful runtime data. |
| D6 | The M1 scope for law #1(b) | **Your call.** Proposed: Bootcamp's anatomy, histology, embryology and physiology sections, plus Biochemistry, Cell Biology and Genetics, plus everything the crosswalk maps. |
| D7 | Videos watched in an earlier year | **Count as done**, as now, with a per-plan option "Re-watch what I've seen before" that schedules them again. |
| D8 | First M1 unit | **Fall Unit 4 (Nov 12 – Dec 16) as an unannounced dry run** with a few M1 volunteers. Behind the GI unit, it will likely land partway through Unit 4, which is fine for a dry run. **Spring Unit 1 as the launch.** |
| D9 | Who maps M1 lectures | **An M1 content lead** (the Governing Body slot is still open), with the generators enforcing correctness. |
| D10 | M1 unit names | The official names, if Brody gives them names. Otherwise "Unit 1–4". |

**Inputs I need from you:**
- The **Spring 2027 M1 calendar**, in the form you sent for M2.
- The **official M1 unit names**.
- A data check: `m1schedule.json` lists **"Quiz 14" twice**, on Dec 4 (week 18) and Dec 10 (week 19). One of them is probably Quiz 15.

---

## 4. The phases

Each phase ends with every existing check green, plus the new checks named. Nothing ships to students before Phase 4. The M1 Resource Hub is untouched throughout.

### Phase 0: Decide and gather (you)
- Answer D1–D10 and send the inputs above.
- **Do the GI, Nutrition & Multisystem M2 unit first.** It is due before Nov 9, current M2s depend on it, and it holds the cancer pharmacology that Heme/Renal defers. This plan waits behind it.

### Phase 1: Foundation, with no visible change
1. Move the four M2 units to `units/m2-2026t3.json` and load it with the catalog.
2. Point the generators and `mapsig.js` at the JSON.
3. Add `cls` and `term` to every unit, and `cls:"m2"` to existing plans by default when they load.
4. Add the `explicit` membership rule beside the systems rule.
5. **New check, C68:** every unit loads from data and declares a class and term; unit ids are unique; an `explicit` unit holds exactly its mapped keys; plans saved before the move still open and build the identical schedule (same items, days and pace) as before it. The comparison is byte-for-byte against a schedule captured from the pre-move build.
6. **Exit:** all 386 existing assertions pass with units loaded from JSON. The page shrinks by about 80 KB.

### Phase 2: M1 resources in the catalog
1. Add the 662 bricks to the catalog as `res:"rx"` reading items, keeping their `m1:` ids.
2. Generalize "article" to "reading".
3. Write `mk_m1_crosswalk.js` with aliases and splits.
4. **New check, C69:** every brick is in the catalog under its existing id; a brick ticked in the M1 hub shows as done in a plan, and the reverse; every crosswalk declaration hits a real video; the unresolved list is reported and doesn't grow.
5. **Exit:** the crosswalk resolves the large majority of B&B, Bootcamp and Pathoma references, and every unresolved one is listed with a reason.

### Phase 3: The first M1 unit (Fall Unit 4, as a dry run)
1. Write `mk_m1_unit.js`: it reads `m1schedule.json` and the crosswalk, cuts the unit at the exams, and writes `units/m1-2026f.json`.
2. Lecture coverage for its 32 lectures and 12 labs (law #1a); the scope rule from D6 (law #1b).
3. Confirm the split-week boundary: the engine's 10-day frame against the longest M1 "week".
4. **New check, C70:** the unit's dates, quizzes and exam match the calendar; every lecture is accounted for; every in-scope video is at an explicit week; it fits at a realistic pace; Minimal, even pace and your own order all build. C65 covers the law with no edits.
5. **Exit:** a Unit 4 plan builds, paces and renders on every tab, and you've looked at it on a phone.

### Phase 4: The class picker, home and Study (still unannounced)
1. Home: class switch, then the unit list. Setup opens with the unit picked.
2. Today's lectures card; Library tab; the M1 note on first entry.
3. **New check, C71:** an M1 and an M2 student each reach their current unit's setup in two taps; the class is remembered across reloads; lecture ticks match the M1 hub's keys exactly; every M1-plan tab renders. A two-year profile fits the size budget, and `mergeState(x,x) === x` holds with an M1 plan.
4. **Exit:** 3–5 M1 volunteers use it for Unit 4, alongside the M1 hub they already have.

### Phase 5: Spring launch
1. Build the Spring M1 units from the Spring calendar (Phase 3's generator, a new calendar file).
2. Announce it in What's new. Put a banner in the M1 hub: "Your M1 units now have a full scheduler — open it", which goes to the home screen with M1 selected.
3. **Exit:** M1 Spring Unit 1 has lecture coverage, passes the law and is live.

### Phase 6: Retire the M1 Resource Hub, later and on evidence
- Not before the end of Spring 2027, and only once its Library and lecture rhythm exist in the unified hub.
- There are no analytics today. The signal would be how many profiles still open the M1 hub (`active:"m1"`), read in aggregate from Firestore. Removing it moves its card into the footer first, as the legacy Step 1 Command Center was. Progress is never touched, because it is the same records.

---

## 5. Risks, stated plainly

- **Mapping labor is the real cost.** Fall alone is 168 lectures and 53 labs, and only 31 bricks name a lecture today. Without an M1 content lead, this is your time. The generators make the work safe, not small.
- **The crosswalk can be wrong quietly.** A plausible-but-wrong match sends a student to the wrong video. The answer is the UWorld-ID discipline: declare, refuse, report. Never fuzzy-match at runtime.
- **Two calendars in one engine.** Split weeks and dated lectures are the only structural differences found, and both are covered by checks above. If a third difference appears, it gets its own check before code.
- **Pacing M1 can read as prescriptive.** The M1 hub's note, "learn what your faculty teach first", stays, and law #1 is what keeps the plan tied to Brody's own lectures.
- **Competing with M2 deadlines.** M2 units are dated and students are on them now. Every phase yields to an M2 unit that's due.

---

## 6. What doesn't change

- The M1 Resource Hub, its data and its progress, through Phase 5.
- Every M2 plan: same unit ids, same schedule (C68 proves it), same sync shape.
- M3 Resource Hub, Step 1 Dedicated, and the legacy Step 1 Command Center.
