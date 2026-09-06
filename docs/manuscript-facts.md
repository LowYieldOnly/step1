# BRODY MODE — Factual reference for a medical education innovation report

**Purpose.** Source data for a manuscript describing this tool. Every number here was
measured from the repository at the commit noted below, with the command used given
where it matters, so any claim can be re-derived or challenged. This is not
promotional copy and does not argue that the tool works — it describes what exists.

**Snapshot.** Commit `37ad8f7` ("Make Re-fit compact the calendar around work studied
ahead", PR #142), 2026-09-05. In-app build marker `2026-09-05c`
(`index.html:4877`). Repository: `github.com/LowYieldOnly/step1`. Deployed at
`brodymode.com` via GitHub Pages (`CNAME`).

**A note on confidence.** Statements below are drawn from the repository's files and
git history. Section 5 (instrumentation) is the section a reviewer should read most
carefully: **the tool collects no usage data whatsoever**, so any claim in a
manuscript about adoption, engagement, or effect on performance cannot be supported
from this codebase and would need a separate data source. Items I could not verify
are marked **[UNVERIFIED]**.

---

## 1. Development timeline

### 1.1 A caveat about the history

The working clone was **shallow** and appeared to begin on 2026-07-16 at PR #79. Running
`git fetch --unshallow` recovered the true history. All figures below are from the
full history. Anyone re-deriving these numbers from a fresh `git clone` should check
for `.git/shallow` first; a default clone of this repository may be truncated.

### 1.2 Headline figures

| Measure | Value | Command |
|---|---|---|
| First commit | **2026-06-20** | `git log --reverse --format=%ad --date=short \| head -1` |
| Latest commit in snapshot | **2026-09-05** | `git log -1 --format=%ad --date=short` |
| Elapsed | **~11 weeks (77 days)** | — |
| Total commits | **169** | `git rev-list --count HEAD` |
| Commits that are squashed pull requests | **141** | `git log --format=%s \| grep -cE "\(#[0-9]+\)"` |
| Pull requests merged | **142** (numbered #1–#142, contiguous) | — |
| Distinct git authors | **1** — `LowYieldOnly <lewisd25@students.ecu.edu>`, plus one commit attributed to `Claude` | `git log --format=%an \| sort \| uniq -c` |

The 169 commits break into 28 early commits made through the GitHub web interface
(file uploads and deletions, 2026-06-20 to 2026-07-06) and 141 squash-merged pull
requests thereafter. **PR-per-day rate over the PR period (2026-07-07 to 2026-09-05):
approximately 2.4.**

> **Authorship caveat for the manuscript.** Git records a single human author. The
> in-app "Governing Body" page (added PR #91–#97) lists five people with headshots
> under the role "Content Leads". Their contribution is not visible in git history —
> it may be content review, curriculum verification, or advisory. **[UNVERIFIED]** —
> the division of labour must be confirmed with the team, not inferred from commits.
> Separately, commit trailers from PR #137 onward credit an AI coding assistant as
> co-author; earlier commits do not carry that trailer, so the extent of AI assistance
> across the whole project is not determinable from the history alone.

### 1.3 Phases

Boundaries are interpretive; the commit dates and PR numbers are not.

| Phase | Dates | PRs | Character |
|---|---|---|---|
| **0. Pre-history** | Jun 20 – Jul 6 | none | Files uploaded and replaced through the GitHub web UI. `index.html` first appears 2026-06-20 at ~149 KiB, so a substantial working app predates the PR workflow. What it did is not documented in commit messages. **[UNVERIFIED]** |
| **1. Restructure and identity** | Jul 7 – Jul 8 | #1–#30 | Layout overhaul, theme, hub separation (M1 / M2 / Step 1 Dedicated), ECU access gate, catalog rebuilt from a 2023 resource sheet (#29). 30 PRs in two days. |
| **2. The Brody calendar** | Jul 9 – Jul 10 | #36–#56 | The curriculum-mapped scheduler is introduced (#36) and hardened over ~20 PRs: pace recommendation, review buffer, real quiz dates as deadlines, firehose-week flagging, no-refill-on-check-off. |
| **3. M1 and Step 1 hubs** | Jul 14 – Jul 16 | #57–#69 | M1 daily-flow planner driven by the Fall 2026 class calendar; Step 1 readiness snapshot and weak-system tracker. |
| **4. Curriculum verification** | Jul 16 | #70–#75 | Sketchy Pharm withdrawn pending rebuild "from authoritative source", then rebuilt; Heme/Renal week mapping re-verified against the syllabus; `exclude` mechanism added; Bootcamp removed from M2; Cardiopulmonary paused. Renamed "Low Yield Only" → "BRODY MODE" (#77). |
| **5. Assessment and content tooling** | Jul 20 – Aug 3 | #82–#124 | Practice-question logging across four question banks, master checklist, Bootcamp re-added as first-class (#87), Content Audit view for content leads (#103), governing-body roster. |
| **6. Correctness work** | Jul 29 – Aug 2 | #113–#121 | A cluster of scheduler and sync defect fixes (see §6.2). |
| **7. Reference content** | Aug 3 – Aug 10 | #125–#136 | Rapid Reference outlines, M3 Resource Hub with interactive algorithms, per-video opt-out. |
| **8. Second block + scheduling control** | Aug 22 – Sep 5 | #137–#142 | Cardiopulmonary block built; "Study this day"; "Re-fit your schedule". |

### 1.4 When major features landed

| Feature | PR | Date |
|---|---|---|
| Brody-calendar plan type (curriculum-mapped scheduling) | #36 | 2026-07-09 |
| Review/practice buffer before the block exam | #41 | 2026-07-09 |
| Real quiz dates as deadlines; firehose-week flagging | #48 | 2026-07-10 |
| Late joiners start at the current week, no forced catch-up | #46 | 2026-07-10 |
| M1 daily-flow planner from the class calendar | #57 | 2026-07-14 |
| Step 1 readiness snapshot / weak-system tracker | #59, #61 | 2026-07-14 |
| Cloud sync durability: sync status, version history, export | #68 | 2026-07-15 |
| Site renamed to BRODY MODE | #77 | 2026-07-16 |
| Practice-question logging (UWorld, AMBOSS) | #82, #83 | 2026-07-20 |
| Master checklist over the whole catalog | #84, #85 | 2026-07-21 |
| Bootcamp as a schedulable resource | #87 | 2026-07-22 |
| Content Audit view (mapping transparency) | #103 | 2026-07-26 |
| ScholarRx as a third question source | #111 | 2026-07-28 |
| Progress measurable by time, not just video count | #128 | 2026-08-05 |
| Boards & Beyond as a fourth question source | #129 | 2026-08-06 |
| M3 Resource Hub with interactive algorithms | #130 | 2026-08-09 |
| Per-video opt-out from a plan | #135 | 2026-08-10 |
| Rapid Reference (Hematology, then Renal) | #125, #136 | 2026-08-03, 2026-08-10 |
| Cardiopulmonary block | #137 | 2026-08-22 |
| "Study this day" (opt a rest day back in) | #139 | 2026-08-28 |
| "Re-fit your schedule" | #140–#142 | 2026-09-05 |

### 1.5 Codebase growth

`index.html` size at the last commit of each active day:

| Date | Size | Date | Size |
|---|---|---|---|
| 2026-06-20 | 149 KiB | 2026-08-01 | 383 KiB |
| 2026-07-07 | 194 KiB | 2026-08-04 | 422 KiB |
| 2026-07-10 | 268 KiB | 2026-08-09 | 444 KiB |
| 2026-07-16 | 309 KiB | 2026-08-10 | 459 KiB |
| 2026-07-22 | 318 KiB | 2026-08-22 | 474 KiB |
| 2026-07-28 | 355 KiB | 2026-09-05 | **479 KiB** |

---

## 2. Stack and architecture, for a non-technical reader

### 2.1 What it is

A **web page**, not an installed application. A student visits `brodymode.com` in a
phone or laptop browser and signs in. There is no app store, no install step, and no
server that the project operates. It is a *progressive web app*: the browser can save
a shortcut to the home screen so it behaves like an app, but it remains a web page.

### 2.2 The unusual part: it is one file

The entire program — every screen, every calculation, all styling — lives in a single
file, `index.html`, currently **499 KB / 5,763 lines**. There is **no build step, no
framework, and no third-party code libraries**: no `package.json`, no React, no
compilation. The file the developer edits is byte-for-byte the file the browser runs.

For a med-ed audience the tradeoffs are worth stating plainly:

- **In favour:** anyone can read the source; deployment is "commit the file"; there is
  no dependency chain to rot or introduce security advisories; nothing can break
  between the code written and the code shipped.
- **Against:** 5,763 lines in one file with no automated tests in the repository
  (§6.4) is difficult for a second developer to enter safely, and there is no
  mechanical guard against a change in one screen breaking another.

### 2.3 Where content lives

Curriculum and resource content is kept in separate data files so it can be revised
without touching program logic:

| File | Size | Contents |
|---|---|---|
| `catalog.json` | 395 KiB | 3,185 third-party videos (§4.2) |
| `m1data.json` | 433 KiB | First-year resource library: 11 courses, 55 collections, 243 sets, 662 ScholarRx "bricks" with cross-references to other resources |
| `rapidref.json` | 189 KiB | Outlines of 63 Boards & Beyond videos: 575 topics, 2,630 bullet points |
| `extras.json` | 34 KiB | 8 clinical algorithms, 312 decision nodes |
| `m1schedule.json` | 22 KiB | Fall 2026 M1 class calendar: 20 weeks, 100 days, 262 lecture/lab entries, 19 assessment markers |

Total shipped payload (program + content): **~1.5 MB**.

**Exception worth flagging:** the M2 curriculum blocks — the core innovation — are
**not** in a data file. They are JavaScript constants inside `index.html`
(`index.html:1383–1385`). Adding a course block requires editing program source. See
§4.6 and §6.3.

### 2.4 Accounts and saved progress

- **Sign-in** uses Google Firebase Authentication (email/password or Google account).
- **Access is restricted** to `@ecu.edu` addresses and any subdomain, plus a
  two-address administrative allowlist. This is enforced twice: in the page
  (`index.html:1153–1157`) and, authoritatively, in server-side database rules
  (`firestore.rules`), so it cannot be bypassed by editing the page.
- **Progress is stored** in Google Cloud Firestore as **a single JSON document per
  user**, at `users/{uid}`, holding `{blob, updatedAt, email, anon}`. A `backups`
  subcollection holds automatic version history (PR #68, #78).
- **Offline and multi-device.** Progress is written to browser storage immediately and
  pushed to the cloud on a one-second debounce. When two devices have both made
  changes, a merge function reconciles them (§6.2).

The Firebase configuration, including the API key, is in the page source. This is
normal and expected for Firebase web apps — that key identifies the project rather
than granting access — but it does mean **all security rests on `firestore.rules`**,
which is 27 lines and denies everything not explicitly matched.

### 2.5 Hosting

GitHub Pages, serving files directly from the repository's default branch. There is no
application server, no database the project administers, and no per-user compute. The
scheduling calculations all run in the student's browser. **Operating cost is
therefore near zero**, which is relevant to any claim about sustainability or
replicability — but it also means there is no server-side vantage point from which to
observe use (§5).

---

## 3. Feature inventory

The app is divided into four "hubs" (`index.html:1249`). Views within a hub:
`today`, `stats`, `grades`, `adjust` (Plan), `ref` (Rapid Reference), `checklist`,
`plan`, `daily`, `progress`, `ready`, `step`, `edit`, `old`.

### 3.1 M2 Scheduler — the curriculum-mapped planner

The core of the tool. Two plan types:

**(a) Brody calendar** *(PR #36, 2026-07-09)* — a schedule built against the actual
course block: its weeks, its lecture topics, its quiz dates, its block exam. The
student picks a block and which commercial resources they own; the app distributes
those resources' videos across study days so that **each week's material is finished
before the quiz that tests it**. Supporting behaviour:

| Behaviour | PR |
|---|---|
| Recommended daily pace, derived from remaining work and remaining days | #37, #45 |
| Review buffer: last N study days before the block exam kept video-free | #41 |
| Real quiz dates as per-week deadlines | #48 |
| "Firehose week" flag when a week cannot be finished before its quiz at a realistic pace (>6 h/day of video) | #48, #53 |
| Late joiners start at the current week; earlier material shown but never owed | #46, #105 |
| Checking a video off never refills that day or reorders the calendar | #50, #55, #56, #116, #127 |
| Per-video opt-out at plan creation and in the plan editor | #135 |
| "Study this day" — opt a single rest day back in without changing the weekly pattern | #139 |
| "Re-fit your schedule" — on demand, compact the calendar around work done ahead and/or adjust the pace | #140–#142 |

**(b) Custom scheduler** — for students not following a mapped block. The student
supplies exam date, weekday/weekend study hours, systems, resources, and review-window
length; the app packs the backlog into available days. Supports user-defined quiz
dates with topics due by each (#124) and per-system category ordering (#123).

### 3.2 M2 Scheduler — assessment tracking

- Practice-question logging against **four** question banks: UWorld, AMBOSS, ScholarRx,
  Boards & Beyond (#83, #111, #129), recorded per system with questions attempted and
  correct.
- Weekly or daily question goals (#82, #122).
- Self-reported subject confidence; NBME/assessment score entry.
- Relative weak-system ranking. Note that two arbitrary thresholds were deliberately
  **removed**: an 80% "mastery" goal (#120) and a 65% "weak system" cutoff (#121),
  replaced by relative ranking. This is a defensible design decision to cite — the tool
  declines to assert a competence threshold it cannot justify.

### 3.3 M1 Resource Hub

A browsable first-year resource library (662 ScholarRx bricks cross-referenced to
Osmosis, Bootcamp, Boards & Beyond, Pathoma, Sketchy, Dirty Medicine and First Aid),
plus a daily-flow planner driven by the real Fall 2026 class calendar with a per-lecture
step checklist. Note: automatic resource-linking in the daily planner was **built and
then removed** (#62, #63, #64, #69) after it could not be made reliably relevant — the
checklist was kept. This is an honest negative result worth reporting.

### 3.4 M3 Resource Hub *(PR #130, 2026-08-09)*

Clinical reasoning algorithms filed shelf → unit → resource. Currently **8 algorithms,
312 decision nodes**, all under Internal Medicine → Hematology/Oncology; the other six
shelves (Surgery, Pediatrics, OB/GYN, Psychiatry, Neurology, Family Medicine) exist as
empty scaffolding. Nodes are typed: 8 stems, 50 tests, 112 findings, 69 diagnoses, 73
treatments. **304 of the 312 nodes carry a reasoning prompt** — a short statement of
what the box *is*, so the content can be reasoned toward rather than recalled. These
prompts were deliberately rewritten (#133) after the originals ("Retic index?") were
found to work only for students who already knew the answer.

### 3.5 Rapid Reference *(PR #125, renamed #126, extended #136)*

Structured outlines of Boards & Beyond content: 2 systems (Hematology, Renal), 63
videos, 575 topics, 2,630 bullet points, keyed to catalog video names.

### 3.6 Content Audit *(PR #103, opened to all users #107)*

A read-only view that, for each block week, shows the Brody lecture topics beside every
third-party video mapped to that week, flags any video that fell through to a default,
and flags mappings pointing at videos no longer in the catalog. Exports to CSV. This is
the mechanism by which the mapping is inspectable rather than opaque, and is probably
the single most citable feature for a curriculum-integration argument.

### 3.7 Cross-cutting

Anki/AnKing tag output as pasteable search strings; light/dark theme; 112-quote
encouragement library; streak tracking; one-tap export; automatic cloud version
history; demo/preview mode that mirrors the live app without saving.

---

## 4. The curriculum-mapping logic

This is the part a replicating school most needs to understand.

### 4.1 The problem it solves

Commercial Step 1 resources (Boards & Beyond, Pathoma, Sketchy, Bootcamp) are organised
by organ system. A medical school's course block is organised by its own lecture
sequence, which does not match. A student wanting to use commercial video alongside
class must decide, every week, which of ~3,000 videos correspond to this week's
lectures. The mapping here is an explicit, inspectable answer to that question for a
specific course.

### 4.2 The catalog

`catalog.json` — 3,185 videos, 590 hours, across 22 systems. Version string `2026.1`.

| Resource | Videos | Hours |
|---|---|---|
| Bootcamp | 2,425 | 381 |
| Boards & Beyond | 496 | 151 |
| Pathoma | 121 | 35 |
| Sketchy Micro | 118 | 16 |
| Sketchy Pharm | 25 | 8 |
| **Total** | **3,185** | **590** |

Each record has five fields — `res` (resource), `sys` (system), `cat` (category/section),
`name`, `min` (duration in minutes) — plus `sketch` on the 118 Sketchy Micro records
(the mnemonic sketch name).

**Provenance is mixed and should be described honestly.** The catalog was rebuilt from a
2023 resource sheet (#29), synchronised to the official 2026 Boards & Beyond checklist
(#44), had 31 zero-duration junk entries removed (#51), had Sketchy Pharm withdrawn and
rebuilt "from authoritative source" (#70, #71), and most recently had 14 Sketchy Pharm
cardiac sketches added from a title-and-duration list supplied by hand (#137, #138).
**There is no automated ingestion from any vendor.** Durations are transcribed. A
manuscript should not describe the catalog as vendor-supplied or API-synchronised.

### 4.3 The block data model

A course block is a JavaScript object. Both blocks live in `index.html:1383–1384`:

```
{
  id, name,                    // "cardiopulm", "Cardiopulmonary"
  systems: [...],              // catalog systems this block covers
  weeks: [ { n, start, label,  // week number, Monday ISO date, theme
             lectures: [ {disc, title} ] } ],   // transcribed Brody lectures
  shelf: "2026-09-18",         // block exam date
  checkpoints: ["2026-08-28","2026-09-11"],   // quiz dates = per-week deadlines
  videoWeek: { "res|sys|cat|name": weekNumber },   // per-video mapping
  bcWeek:    { "sys|category": weekNumber },       // per-section mapping
  include:   [ "res|sys|cat|name", ... ],   // pulled in from outside `systems`
  exclude:   [ "res|sys|cat|name", ... ]    // in `systems` but taught elsewhere
}
```

Resolution order (`brodyVideoWeek`, `index.html:1638`): a per-video `videoWeek` key wins;
otherwise, for Bootcamp only, a per-section `bcWeek` key; otherwise the video falls to
the **last week** — a silent default that the Content Audit exists to expose.

`include` and `exclude` handle the cases the system-level model cannot. `exclude` drops
a video that shares the block's system but is taught in a different unit (e.g. Boards &
Beyond cancer drugs sit under Hematology but are taught in a later block). `include`
pulls in a video whose system is *not* in the block but which this block's lectures
cover — in practice the Psychiatry and Behavioral Science videos threaded through both
blocks, and the Biochemistry lipid videos matching the Cardiopulmonary
anti-hyperlipidemic lecture.

### 4.4 What exists now

**Two blocks, covering 8 weeks of one course at one school.**

| | Hematology & Renal | Cardiopulmonary |
|---|---|---|
| PR / date | #36 (2026-07-09), verified #72 | #137 (2026-08-22) |
| Weeks | 4 | 4 |
| Block exam | 2026-08-21 | 2026-09-18 |
| Quiz checkpoints | 2 | 2 |
| Brody lectures transcribed | 48 | 66 |
| Videos in block | 333 (74 h) | 404 (77 h) |
| Mapped individually (`videoWeek`) | 110 keys → 33% of videos | 127 keys → 31% of videos |
| Mapped by section (`bcWeek`) | 27 keys → 67% of videos | 43 keys → 69% of videos |
| Fell through to default | **0** | **0** |
| `include` / `exclude` | 11 / 5 | 10 / 0 |

### 4.5 Manual versus automated — the honest answer

**The mapping is entirely manual.** Nothing infers it. Specifically:

- Every one of the 237 `videoWeek` keys across both blocks was assigned by a human
  reading the lecture schedule against the video list.
- The 70 `bcWeek` keys are a labour-saving device, not an inference: Bootcamp has
  hundreds of videos per unit, so its *sections* are mapped rather than its videos. This
  is why ~68% of videos are "mapped" by only ~23% of the keys. **A section-level mapping
  is coarser** — every video in a Bootcamp section inherits one week, which is right most
  of the time and wrong at section boundaries. Six per-video overrides were needed in the
  Cardiopulmonary block for exactly this reason.
- The 114 lecture titles were transcribed by hand from PDF course calendars.
- Quiz and exam dates were read off the same PDFs.

What *is* automated is **verification, not creation**: a generator script checks every
mapping key against the live catalog and refuses to emit a block containing a key that
matches no video, a video that matches no key, or a stale section. The Content Audit
view performs the same checks at runtime for any user. So the claim a manuscript can
support is: *the mapping is hand-authored but machine-verified and user-inspectable* —
not that it is automatically derived.

**Effort estimate.** Not directly recorded. The Cardiopulmonary block was built in a
single working session (PR #137) from two calendar PDFs, given an existing catalog and
an existing block to copy. The Hematology/Renal block took from #36 to #73 — five
distinct PRs across a week — including one full re-verification against the syllabus
(#72) after the initial mapping was found wanting. **[UNVERIFIED]** — hours were not
logged; do not put a figure in a manuscript without asking the author.

### 4.6 What a new school would have to supply

To replicate for one course block, a school needs:

1. **A block definition** — week start dates, block exam date, and quiz dates. From the
   printed course calendar. ~10 data points per block.
2. **Lecture titles per week**, with discipline labels. ~50–70 entries per 4-week block,
   transcribed.
3. **The mapping itself** — the irreducible work. For each commercial video in the
   relevant systems, which week teaches it. Roughly **120 per-video decisions plus
   30–45 section-level decisions** per 4-week block, based on the two existing blocks.
   This requires someone who knows both the local curriculum and the commercial
   resources — in practice, a student who has taken the course.
4. **A catalog**, if their students use resources not already present. The existing
   catalog is reusable as-is for the five resources it covers.
5. **A developer**, because blocks are source code. Adding a block means editing
   `index.html` and redeploying. There is no administrative interface, no upload, no
   form. This is the single largest barrier to replication and should be stated as such.

Not required: a server, a database, institutional IT involvement beyond an email domain,
or any vendor relationship or API access.

### 4.7 How the schedule is then generated

Once mapped, `reflowBrody` (`index.html:1806`) pours each block's videos onto open study
days in order (week → resource → catalog sequence), filling each day to the daily pace
before advancing. Rest days, one-off days off, opted-out videos and the pre-exam review
buffer are excluded. The recommended pace is the higher of two guarantees: clearing each
week's material before that week's quiz, and clearing everything before the review
buffer. A week needing more than 6 h/day of video is flagged as unachievable rather than
inflating the whole plan — a deliberate refusal to present an unrealistic schedule.

---

## 5. Instrumentation — read this section carefully

**There is none.**

A search of `index.html`, `sw.js` and `manifest.webmanifest` for `gtag`,
`google-analytics`, `googletagmanager`, `analytics`, `mixpanel`, `posthog`, `amplitude`,
`plausible`, `umami`, `segment`, `logEvent`, `trackEvent`, `sentry`, `telemetry` and
`beacon` returns **zero matches**. The only external origins the page contacts are
Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) and the Firebase SDK
(`www.gstatic.com`). There is no analytics product, no event logging, no error
reporting, and no A/B infrastructure.

### 5.1 What data therefore exists

Only what is needed to run the app for one student, stored in that student's own
Firestore document:

- `vdone`, `vdoneDate`, `vdoneAt`, `vundone` — which videos are checked off, on what
  date, at what timestamp.
- `streak.days` — the set of dates on which any progress was made.
- Practice-question logs per bank, per system (questions attempted, correct).
- Self-reported confidence, assessment scores, notes, plan configuration.
- `updatedAt` and `email` on the document itself.

### 5.2 What could be derived, and by whom

An administrator with Firebase console access could count user documents and read
`updatedAt` to establish **registered accounts** and **last-active date**. Because
`vdoneDate` and `streak.days` are stored per student, an administrator could in
principle reconstruct per-student activity. **None of this is aggregated, exported,
or queryable from the application** — `firestore.rules` restricts every client to
its own document, so even the author cannot read other users' data from within the app.

### 5.3 Consequences for the manuscript

- **User counts, adoption rate, retention, session length, feature usage, and any
  correlation with exam performance cannot be reported from this codebase.** I have no
  data on any of them and cannot estimate them.
- If the manuscript needs those figures, they must come from (a) a Firebase console
  export, (b) a survey, or (c) instrumentation added prospectively.
- The absence of tracking is defensible and arguably a feature for a student-built tool
  handling study behaviour — but it should be stated as a limitation of the evaluation,
  not glossed.

---

## 6. Known limitations and what broke

### 6.1 Scope limitations

- **Two blocks, one course, one school.** 8 mapped weeks. The M2 Scheduler's mapped mode
  is unusable at any other institution without new mapping work.
- **Access is restricted to `@ecu.edu`.** There is no public or multi-tenant mode.
- **The M3 hub is a scaffold.** 8 algorithms in one unit of one shelf; six shelves empty.
- **Rapid Reference covers 2 of 22 systems.**
- **Sketchy Pharm coverage is thin** — 25 videos total, added piecemeal from hand-supplied
  lists. Several systems have none.
- **No accessibility audit has been performed.** **[UNVERIFIED]** — I found no ARIA
  strategy, keyboard-navigation testing, or contrast audit in the repository. Do not
  claim accessibility compliance.
- **No IRB, consent flow, or privacy policy is present in the repository.**
  **[UNVERIFIED]** — one may exist outside it; check before publishing.

### 6.2 Defects found and fixed (the interesting ones)

These are worth reporting because they illustrate genuinely hard problems in this class
of tool, not merely sloppiness.

**Scheduling.**
- *Checking a video off pushed other videos to a later day* (#116, 2026-08-01). Completing
  work made the plan worse — the pace was re-derived on every check-off, and because it
  snapped to half-hours, one short video could drop the daily budget and cascade
  leftovers forward. Fixed by locking the pace to the plan.
- *Studying ahead shuffled the plan* (#127, 2026-08-04). Checking off the top video on a
  future day freed room on the day *before* it and pulled the next video backwards, so
  the calendar read out of order. Fixed with a monotonic day cursor: a completed video
  keeps its place in the sequence.
- *A day refilled itself when you studied ahead* (#50, #55). Finishing a day's videos
  pulled tomorrow's work onto today.

**Identity.**
- *One checkbox marked several distinct videos done* (#115, 2026-07-30). Different videos
  were colliding on the same identifier.
- *Bootcamp videos could not be checked at all* (#114, 2026-07-30). Bootcamp identifiers
  are built by joining system, category and name with `|`; content containing that
  character shredded the key. A class of bug that recurred and drove a general rule in
  the codebase: pass structured JSON in data attributes, never delimiter-joined strings.

**Synchronisation.** The hardest cluster.
- *Unchecking a video could undo itself* (#117, 2026-08-01). Progress maps were merged
  across devices by union, which can only ever *add*. A deletion — unchecking a video —
  could not be expressed, so it came back from whichever device still had it. Fixed with
  per-item last-writer-wins timestamps.
- *Sync adopt/push loop* (#118, 2026-08-01). The merge function normalised a field that
  the save function did not, so a merged profile never equalled its own saved form; the
  sync layer read that as "changed" forever and looped. The invariant now maintained is
  that `mergeState(x, x)` must equal `x` byte-for-byte **including key order**. This is
  asserted in every regression harness. It has been violated and re-fixed more than once.

### 6.3 Architectural weaknesses, stated plainly

- **Blocks are hardcoded in source** (`index.html:1385`). Curriculum content is program
  code. This is the main replication barrier (§4.6).
- **The whole profile is one Firestore document, and there is no size guard.** Firestore's
  hard limit is 1 MiB per document. Reconstructing a maximal profile from the real catalog
  and the real save shape gives **~1,045 KiB — 102% of the limit**. A student who checked
  off all 3,185 videos, marked all AnKing tags done and flagged everything "shaky" would
  silently fail to sync. In practice a single block is ~400 videos and a realistic profile
  is far smaller, so this is a latent ceiling rather than an observed failure — but nothing
  in the code detects or warns about it. **I could not find any guard; if one exists I
  missed it.**
- **A silent default in the mapping.** An unmapped video falls into the block's last week
  rather than erroring. Both current blocks have zero such videos, and the Content Audit
  surfaces them, but the failure mode is quiet by construction.
- **One 5,763-line file, single author, no CI.**

### 6.4 Testing

**No tests are committed to the repository.** There is no `.github` directory and no CI.

Extensive Playwright-based regression harnesses do exist — as of this snapshot,
suites numbered C47–C55 covering the whole-app smoke path, the M3 hub, the skip picker,
Rapid Reference, the Cardiopulmonary block (37 checks), the re-fit behaviour (41 checks)
and calendar compaction (23 checks). **They live in an ephemeral scratch directory
outside the repository and are lost when the working environment is reset.** This has
already happened at least once: a 6,048-case scheduler sweep and a 468-trial ordering
harness were destroyed and, at this snapshot, have not been rebuilt.

For a manuscript this cuts both ways and should be reported as it is: the project
practises disciplined regression testing, including deliberate mutation testing to
confirm a harness can actually detect the bug it guards, but **none of it is durable or
reproducible by a third party**. Anyone citing the testing practice should note that the
artefacts are not in the repository.

### 6.5 Design decisions worth reporting as findings

- **Automatic rescheduling was rejected.** Compaction of the calendar around work done
  ahead was first built to happen automatically, which reintroduced the very complaint
  (#127) that a plan should not rearrange itself while being read. It was moved behind an
  explicit user action (#142). The general principle the codebase converged on: the
  schedule changes only when the student asks it to.
- **Arbitrary competence thresholds were removed** (#120, #121) rather than defended.
- **Automatic resource-linking was removed** after it could not be made relevant (#69).
- **An unachievable plan is flagged, not sold.** Where the arithmetic demands 17 h/day,
  the tool says so rather than presenting the number as a plan.

---

## 7. Reproducing these figures

```bash
git clone https://github.com/LowYieldOnly/step1 && cd step1
git fetch --unshallow            # essential — a default clone may be truncated
git rev-list --count HEAD                                   # 169
git log --reverse --format="%ad|%s" --date=short | head -1   # 2026-06-20
git log --format=%s | grep -cE "\(#[0-9]+\)"                 # 141
git log --format=%an | sort | uniq -c                        # authorship
grep -c "" index.html                                        # 5763
grep -niE "gtag|analytics|telemetry|logEvent|sentry" index.html   # no matches
```

Catalog and block figures are produced by parsing `catalog.json` and the
`BRODY_HEME_RENAL` / `BRODY_CARDIOPULM` constants in `index.html`; the per-video versus
per-section mapping split is computed by resolving every in-block video through
`brodyVideoWeek`'s precedence rules (§4.3).

---

*Prepared 2026-09-05 against commit `37ad8f7`. Sections marked **[UNVERIFIED]** require
confirmation from the project team before publication.*
