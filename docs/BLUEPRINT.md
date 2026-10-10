# Build your own BRODY MODE

**A step-by-step blueprint for a curriculum-mapped study scheduler at your medical school.**

Measured against `github.com/LowYieldOnly/step1` at commit `e9e72c9`, in-app build
`2026-10-10a`. Every number in this document was taken from the working repository, and
§A.6 says how to re-derive each one. Where the honest answer is "we don't know," it says
so instead of estimating.

---

## What this is

BRODY MODE is a study scheduler used by second-year students at the Brody School of
Medicine at East Carolina University. It does one thing that off-the-shelf tools cannot:
it knows **which commercial board-prep videos correspond to this week of this course**,
and it builds a day-by-day plan that finishes each week's material before the quiz that
tests it.

That knowledge is not inferred. It is a hand-authored, machine-verified, student-visible
mapping from one school's lecture schedule onto ~3,300 third-party resource items. The
scheduler around it is ordinary software. **The mapping is the asset, and it is the part
you have to build yourself** — nobody else's curriculum is yours.

This document is the path from nothing to a deployed, used tool, in order, with the
decisions called out at the point where you actually face them.

### What you will have at the end

- A web page students visit, sign into with their institutional email, and use on a phone.
- A plan that lays your school's actual course block across their actual study days.
- A view that shows them *why* each video is scheduled on the day it is, beside the
  lecture it matches.
- No server to operate, no per-user cost, no vendor relationship, no institutional IT
  project.

### What it will cost

| | Measured from this project |
|---|---|
| Money | **$0/month** at this scale. GitHub Pages hosting is free; Firebase's free tier covers a cohort. |
| People | **One builder**, **one curriculum insider per block** (often the same person), **a few content reviewers**. |
| Time to first deployed block | Not logged. See §A.5 for what *is* known, and do not quote a figure we did not record. |
| Time per additional block | One to two focused working sessions once the catalog and a prior block exist (§A.5). |
| Ongoing | One new block per course unit, plus whatever your students ask for. |

### Who has to exist for this to work

Three roles. If you cannot staff the first two, stop here.

1. **The curriculum insider.** Someone who has *taken* the course and *used* the
   commercial resources. The mapping is ~120 judgement calls per block of the form "the
   Thursday lecture on tubular transport corresponds to these four Boards & Beyond videos
   and not those two." No one who has only read the syllabus can make those calls, and no
   automated process we tried could either (§C.1).
2. **The builder.** One person comfortable editing HTML/JavaScript and using git. Not a
   team, not a vendor. This project has a single git author.
3. **Reviewers.** Two to five students or faculty who will look at the mapping and say
   it's wrong. Build them a view to look at (Step 18), because a mapping nobody checks is
   a mapping nobody should trust.

### When *not* to do this

- **Your curriculum already sequences by organ system in the same order as the commercial
  resources.** Then the mapping is near-trivial and a shared spreadsheet is enough.
- **Your course calendar changes mid-semester.** Every date in a block is a hard-coded
  fact. A curriculum that moves its quizzes will outrun hand-authored data.
- **You cannot find the curriculum insider.** This is the binding constraint, not the code.
- **You want to redistribute vendor content.** You cannot, and this blueprint will not
  help you. See Step 4.

---

# Phase 0 — Before any code

## Step 1 — Confirm the problem is real at your school

Ask ten students in the relevant year these three questions:

1. Do you use a commercial video resource alongside class? (If most say no, stop.)
2. How do you decide *which* videos to watch for this week's material?
3. How often do you fall behind and then not know where to restart?

The problem this tool solves is specifically answer 2: resources are organised by organ
system, your curriculum is organised by its own lecture sequence, and the student is left
performing the join by hand every week. If your students have already solved that with a
shared document, your real job may be to formalise *their* document — which is a much
smaller project, and a better one.

**Deliverable:** a one-paragraph written statement of the problem in your students' words.
You will reuse it in the onboarding copy and, later, in the paper.

## Step 2 — Scope to one block, one cohort, one semester

Not the curriculum. Not the year. **One course unit.**

This project shipped its first unit (Hematology & Renal, 4 weeks) before its second, and
each subsequent unit was cheaper than the last because the catalog and the scheduler
already existed. Four units exist now, covering 14 weeks of one course year:

| Unit | Weeks | Videos in unit | Hours | Lectures transcribed |
|---|---|---|---|---|
| Hematology & Renal | 4 | 333 | 74.0 | 48 |
| Cardiopulmonary | 4 | 404 | 76.6 | 66 |
| Nervous & Sensory | 3 | 547 | 82.1 | 46 |
| Musculoskeletal & Skin | 3 | 488 | 81.9 | 47 |

Pick the unit that is **next**, not the one that is hardest. You want students using it
while you still remember how it works.

## Step 3 — Decide fork or rebuild

Two honest paths.

**Fork `LowYieldOnly/step1`.** You inherit the scheduler, the sync layer, the audit view,
the checks, and four worked examples of block data to copy. You then replace the catalog
(if your students use different resources), replace the blocks, change the access domain,
and swap the branding. Everything in Phases 4–5 of this document becomes reading rather
than writing.

- **Caveat today:** the repository has **no `LICENSE` file**. Without one, default
  copyright applies and you have no grant to fork it. If you want to take this path, ask
  the authors to add a license first — and if you are the author reading your own
  blueprint, that is Step 33.

**Rebuild in your own stack.** You take the *method* — the data model in §A.1, the pour
algorithm in Step 19, the invariants in Step 25 — and implement it in whatever your
builder already knows. This is more work and a better long-term fit if you have a real
engineering team, because the single-file architecture (§A.3) is a deliberate trade you
may not want to inherit.

Most schools should fork. The rest of this document is written so that either path works:
each step says what to *decide*, then how this project decided it.

---

# Phase 1 — Ground rules you set once and cannot revisit cheaply

## Step 4 — Write down what you will never ship

The single most important legal decision, and it is easy.

**You ship metadata and your own mapping. You never ship vendor content.** Concretely,
for each third-party item this project stores exactly:

```
{ res: "bnb", sys: "Renal", cat: "Renal Physiology",
  name: "Renal Blood Flow", min: 14 }
```

A resource code, a system, a section, a title, and a duration in minutes. Nothing else.
No video, no transcript, no slide, no still frame, no summary of the content. A student
reads the title in your tool and watches the video in their own paid subscription.

Two other things this project ships that are worth examining before you copy them:

- **Outlines of video content** (`rapidref.json`: 63 videos, 575 topics, 2,630 bullets).
  These are closer to the line than titles and durations. Decide deliberately, in writing,
  whether you will create them and on what basis.
- **Third-party question-bank item identifiers** (`uworld.json`: 464 videos → 3,105
  distinct question IDs). These are numbers a student pastes into their own subscription;
  no question text is stored. Still, decide deliberately.

**Deliverable:** a written one-pager, before any data entry, naming the fields you will
store and the fields you will not. Revisiting this after you have 3,000 records is
expensive; deciding it now is free.

## Step 5 — Decide the access boundary, and enforce it on the server

This project restricts sign-in to `@ecu.edu` and any subdomain, plus a two-address
administrative allowlist. The restriction is enforced **twice**: once in the page, for a
clear error message, and once — authoritatively — in server-side database rules, because
anything enforced only in the page can be bypassed by editing the page.

The whole of this project's server-side security is 27 lines (`firestore.rules`): each
signed-in user may read and write exactly one document, the one named by their own user
ID, and only if their email matches; everything else is denied.

Three properties worth copying:

- **Default deny.** The last rule denies every path not explicitly matched above it.
- **Recursive.** `users/{uid}/{document=**}` covers the version-history subcollection too,
  so a later feature cannot accidentally land outside the rule.
- **The client cannot read other users' data at all** — not even the author's. This is a
  real constraint and it has consequences in Step 32.

Write these rules *before* you write the sign-in screen. If you write them after, you will
write them around whatever the app already does.

## Step 6 — Decide what you will not collect

This project collects **no usage data whatsoever**. There is no analytics product, no
event log, no error reporting, no A/B infrastructure. A student's document holds only what
is needed to run the app for that student: which items are checked off and when, their
streak dates, their own question logs, their own plan configuration.

This is defensible, and for a student-built tool handling study behaviour it is arguably
correct. **But decide it on purpose, because it determines what you can ever claim.**
See Step 32 — if you intend to publish anything about adoption or effect, the decision
you make here is the one that forecloses it.

---

# Phase 2 — The catalog

The catalog is the universe of things that can be scheduled. It is school-agnostic: if
your students use the same five or six commercial resources, **this project's catalog is
reusable as-is** and you can skip to Phase 3.

## Step 7 — Find out what your students actually own

Not what you think they should own. Survey the cohort. A scheduler that assumes a
subscription nobody has is a scheduler nobody uses.

This project's catalog covers six resources, 3,315 records, 22 organ systems:

| Resource | Items | Hours |
|---|---|---|
| Bootcamp | 2,425 | 380.7 |
| Boards & Beyond | 496 | 150.8 |
| Pathoma | 120 | 35.0 |
| Sketchy Micro | 118 | 15.5 |
| Sketchy Pharm | 48 | 13.1 |
| UWorld Library (articles) | 108 | — (no durations) |
| **Total** | **3,315** | **595.2** |

Note the shape of that table: **one resource is 73% of the records.** That asymmetry
drives a design decision in Step 16, so measure it for your own resource set.

## Step 8 — Fix the record shape and the identity rule

Five fields (§A.1). The field that will hurt you is **identity**: what makes two records
the same record, and what string you put in an HTML attribute to mean "this item."

What this project learned the hard way (§C.2):

- **Resources differ in how unique their titles are.** All 496 Boards & Beyond titles are
  globally distinct, so `b:<name>` is a safe identifier. Bootcamp titles are not — the
  same title recurs across systems — so Bootcamp needs `bc:<system>|<category>|<name>`.
  Measure this per resource rather than assuming.
- **Delimiter-joined keys break on content containing the delimiter.** A whole class of
  bug came from building identifiers by joining fields with `|` when a title contained
  `|`. The rule the codebase converged on: **pass structured JSON in data attributes,
  never delimiter-joined strings.** Internal map keys may still be joined, but nothing
  that round-trips through the DOM.
- **Two different items can legitimately share a title.** This catalog has two distinct
  videos named "NSAIDs," in different resources and systems. Any lookup by title alone is
  a latent bug.

## Step 9 — Transcribe, and be honest about provenance

**There is no automated ingestion from any vendor, and there will not be.** No vendor
offers an API for this. Every record in this catalog was transcribed from published
checklists and resource listings by hand, then corrected over time: rebuilt from a
resource sheet, synchronised against an official published checklist, 31 zero-duration
junk entries removed, one resource withdrawn entirely and rebuilt "from authoritative
source," chapters corrected against a published listing.

Budget for this honestly. It is tedious, it is the least interesting work in the project,
and it is wrong the first time. Two mitigations:

- **Do one resource at a time, completely**, and validate before starting the next.
- **Never describe your catalog as vendor-supplied.** Durations are transcribed numbers.
  If you publish anything about this, say so.

## Step 10 — Adopt the generator discipline now

This is the single practice that most improved this project, and it costs nothing to adopt
on day one.

**Data files are not hand-edited. They are written by a script that validates first and
refuses to emit something half-right.**

Each generator declares the data as a literal, then — before writing a single byte —
checks the declaration against the live catalog and **exits non-zero** if:

- a declared key matches no item in the catalog (a typo, or the catalog changed under you),
- an item that should be covered matches no declaration (a gap),
- two hand-kept copies of the same fact disagree.

That last check is worth the whole practice. In the pharmacology reference, the hazard
lists and the per-drug tags are two hand-maintained copies of the same information; the
check that they must agree is what caught one drug tagged a negative inotrope while
missing from the negative-inotrope list.

A second property to build in: **re-running a generator with unchanged input reproduces
the shipped file byte-for-byte.** That makes "run the generator" a safe way to confirm the
data still validates, rather than a scary rewrite. This project has nine generators
(2,043 lines) covering the reference content, the course blocks, the content tags, the
article list, and the question-ID map.

> **Learn from this project's worst loss.** The generators for the earliest content were
> written in a scratch directory outside the repository, and the environment wiped it —
> twice in one day. The *data* survived because it was committed; the scripts that built
> it did not, and some had to be rewritten from scratch. **Generators and checks are part
> of the project. Commit them.**

---

# Phase 3 — Encode one course block

This is the heart of it. Everything before was setup; everything after is software.

## Step 11 — Collect the source documents

You need the course calendar: week structure, lecture titles with dates, quiz dates, block
exam date. In practice this is one or two PDFs or Word documents from the course
coordinator.

Practical notes from doing this four times:

- `pandoc -f docx -t plain` and `-t html` give different, complementary readings of the
  same table. **Use both.** Column alignment in converted HTML is unreliable wherever
  cells are merged — a merged cell shifted one exam date by a day in one extraction, and
  the plain-text visual grid was what disambiguated it.
- **Validate the parse against something you already know.** When extracting a term
  calendar, three of the four exam dates were already shipped and verified. Checking the
  new parse reproduced those three is what proved the fourth was right. Always leave
  yourself a known-answer check.
- Get the calendar for the whole term at once, not block by block. Later blocks then cost
  you nothing extra to collect.

## Step 12 — Extract the skeleton

Roughly ten data points per block:

- `weeks[]` — for each week: a number, the Monday ISO date, a short theme label.
- `shelf` — the block exam date (ISO).
- `checkpoints[]` — the quiz dates (ISO). **These are the per-week deadlines and they are
  what makes this a curriculum-mapped scheduler rather than a countdown timer.**

This project's blocks run 3–4 weeks with 2 checkpoints each. If your course has no
intra-block assessments, you can still build everything here — the per-week deadline just
collapses to the block exam, which is exactly what this project's even-pace mode does
deliberately (Step 20).

## Step 13 — Transcribe the lectures

Per week, a list of `{ disc, title }` — discipline label and lecture title. 46–66 entries
per block here; 207 across four blocks.

These are **not** used to compute the schedule. They exist so that the audit view
(Step 18) can show a student the lecture beside the videos mapped to it, which is what
makes the mapping arguable rather than oracular. Do not skip them on the grounds that
they are inert: they are the reason anyone will believe the tool.

## Step 14 — Choose the system set, then fix its edges

Start coarse: which of the catalog's organ systems does this block cover? Two or three,
typically. That selection pulls in a first approximation of the block's video set — 327 to
654 items here.

It will be wrong at the edges in both directions, and you need both escape hatches:

- **`exclude`** — this item shares the block's system but your school teaches it in a
  different unit. (Boards & Beyond files cancer drugs under Hematology; this curriculum
  teaches them later. Five exclusions.)
- **`include`** — this item's system is *not* in the block, but this block's lectures
  cover it. (Psychiatry and Behavioral Science videos thread through several blocks;
  Biochemistry lipid videos match a Cardiopulmonary lecture on antihyperlipidemics. 69
  inclusions across four blocks — 47 in the Musculoskeletal block alone, where the
  curriculum reaches well outside its nominal systems.)

**The lesson in that 47:** the system-level model is a labour-saving approximation, not a
truth. The moment you treat it as truth, your block silently omits material your course
actually teaches. Expect to use `include` heavily, and build the audit view so you can see
what you missed.

## Step 15 — Do the mapping

The irreducible work. For every item in the block's video set: **which week teaches it?**

Two tiers, and the ratio between them is the whole labour-saving trick:

- **Per-video (`videoWeek`)** — a full item key → week number. Precise, expensive. 438
  keys across four blocks.
- **Per-section (`bcWeek`)** — `system|category` → week number, applied to the large
  resource whose sections are coherent. 175 keys across four blocks, and they resolve
  **1,334 of the 1,772 in-block items.** Roughly 75% of the items are placed by 29% of the
  keys.

Section-level mapping is **coarser and wrong at section boundaries**, which is exactly
what the per-video tier is for: it takes precedence, so you override the handful of items
the section rule misplaces. Six such overrides were needed in one block for precisely this
reason.

Resolution order, which you should implement in this order:

1. A per-item key in `videoWeek` wins.
2. Otherwise, for the section-mapped resource only, a `system|category` key in `bcWeek`.
3. Otherwise — **a silent default to the block's last week.**

That third rule is a deliberate, dangerous choice. It means a forgotten item is *late*
rather than *missing*: the student still sees it, just at the end. All four blocks here
have **zero** items reaching it. That is not luck — it is Step 16.

## Step 16 — Make the generator refuse to ship a fall-through

The generator for a block validates, before writing:

- every mapping key matches a real catalog item (no typos, no drift since the catalog
  changed),
- every in-block item resolves to a week by rule 1 or 2 — **zero** reach the default,
- no section key is stale.

If any fails, it exits and writes nothing. The measured outcome across four blocks is
0 fall-throughs, and that number is produced by this check, not by care.

**Prefer the failure direction that shows a student too much over the one that silently
loses material.** Every ambiguous call in this project's mapping went that way, and the
generators are what let you be confident the quiet direction is empty.

## Step 17 — Mark your judgement calls in the source

The mapping contains real uncertainty: an anatomy sequence that could defensibly sit in
either of two weeks, a video whose title does not clearly belong to any lecture. In the
generator source, those lines carry a marker comment (`BALANCE`) and a one-line reason.

This costs nothing and pays twice: the reviewer in Step 18 knows where to look first, and
you — six weeks later, when a student disputes a placement — know whether you thought
about it.

## Step 18 — Build the audit view before you ship the schedule

A read-only screen that, for each week of the block, shows the transcribed lecture topics
beside every third-party item mapped to that week, flags anything that fell through to the
default, flags mappings pointing at items no longer in the catalog, and exports to CSV.

Build this **before** the scheduler, for three reasons:

1. It is how you find your own mapping errors, and you will find many.
2. It is the mechanism by which the mapping is inspectable rather than opaque — the single
   most defensible feature if you ever argue for curriculum integration.
3. It performs the same checks at runtime that the generator performs at build time, so a
   catalog revision that breaks a block is visible to any user, not just to you.

Open it to everyone, not just to administrators. This project started it as a
content-lead view and opened it to all users shortly after; a mapping students cannot
inspect is one they have no reason to trust.

---

# Phase 4 — The scheduler

Everything in this phase is ordinary software, and all of it is downstream of the mapping.
If Phase 3 is right and Phase 4 is mediocre, you have a useful tool. The reverse is not
true.

## Step 19 — The pour

One algorithm. Walk the block's items in order — **week, then resource, then catalog
sequence** — and pour them onto open study days, filling each day to the student's daily
budget before advancing to the next day.

Excluded from "open": rest days, one-off days off, items the student opted out of, and the
pre-exam review buffer (the last *N* study days before the block exam, kept deliberately
free of new material).

That is the whole scheduler. Everything else in this phase is a constraint on it.

## Step 20 — Choose the deadline, and make it one switch

Each week's material is owed by a deadline. There are exactly two sensible answers, and
students want both:

- **Quiz-paced** — this week is owed by *its own quiz*. Matches the course. Produces a
  staircase: hard weeks before a quiz, easy weeks after.
- **Even-paced** — every week is owed by *the block exam*. Disregards the quiz dates and
  produces a flat spread across the whole block, for students who want to clear all the
  content without being whipped by quiz timing.

Implement this as **one line** in the per-week frame computation:

```js
const quiz = weekDeadline(block, week.start);   // the real quiz, reported either way
const dl   = freePaced ? block.shelf : quiz;    // THE one switch
```

The architectural point: resist implementing the second mode as a second scheduler. If the
deadline is the only difference, make the deadline the only difference — then every other
feature (pace selection, re-fit, review buffer, late joining, depth filters) works in both
modes for free, with no second code path to keep in sync.

Note that the real quiz date is still *reported* in even-paced mode. The student sees when
the quiz is; it just isn't what the plan is built around.

## Step 21 — Recommend a pace, and refuse to lie

Derive a recommended daily budget as the **higher** of two guarantees:

1. clearing each week's material before that week's deadline, and
2. clearing everything before the review buffer starts.

Then cap it. Where the arithmetic demands more than ~6 hours of video per day, **do not
present that number as a plan.** Flag the week as unachievable and say so.

This is a design position, not a limitation: a scheduler that answers "17 hours a day"
has failed, and dressing the failure as a plan transfers the failure to the student. The
same rule applies to the article-based mode, with its own ceiling in items per day rather
than minutes.

## Step 22 — Let students join late without punishment

A student who starts in week 3 should not be handed weeks 1 and 2 as a debt. Start their
plan at the **current** week. Show the earlier material — they can study it, and it counts
when they do — but never *owe* it to them.

This is a small amount of code and a large amount of adoption. Nobody adopts a tool whose
first screen tells them they are 180 videos behind.

## Step 23 — Make done work stay put

The hardest behavioural requirement in the whole project, and the source of the most
defects (§C.3). Stated as the student sees it:

> **Checking something off must never make my plan worse, and must never rearrange what I
> am looking at.**

Three mechanisms this project needed:

- **Lock the pace to the plan.** Re-deriving the daily budget on every check-off meant one
  short video could drop the budget and cascade leftovers forward: completing work made
  the plan worse.
- **A monotonic day cursor.** A completed item keeps its place in the pour. Without this,
  checking off the top item of a future day freed room on the day *before* it, pulled the
  next item backwards, and the calendar read out of order.
- **Intra-day grace.** Items checked off *today* still count as owed for today's
  arithmetic, so finishing your work does not cause today to refill from tomorrow. The
  re-fit action (Step 24) explicitly bypasses this, because that is the one moment the
  student has asked for a recount.

## Step 24 — Re-fit on request, never automatically

Compacting the calendar around work done ahead was first built to happen automatically.
It reintroduced the exact complaint it was meant to solve — a plan should not rearrange
itself while you are reading it — and was moved behind an explicit button.

**The principle the codebase converged on, and the one most worth copying: the schedule
changes only when the student asks it to.**

## Step 25 — Add the options students will ask for

These landed in this order, each in response to actual requests. They are all filters or
budgets on the same pour, which is why the one-switch discipline in Step 20 matters.

| Option | What it does | Shape of the implementation |
|---|---|---|
| **Even pace** | Ignore quiz dates, spread evenly (Step 20) | One boolean in the config |
| **Reading instead of video** | Schedule written articles that follow the same week mapping, for students who don't want video | A resource with no durations, budgeted in **items per day** rather than minutes; a second pour pass mirroring every rule of the first |
| **Minimal / Comprehensive depth** | Minimal drops physiology, anatomy, embryology and histology; keeps pathology and pharmacology | A tag per item, filtered at every plan-entry point |
| **Question-bank IDs** | Under each video, the question IDs covering it, copyable in one tap | A separate JSON map, video title → IDs, plus a tab for browsing |

Two warnings from building these:

- **A depth filter must be applied at *every* point that enters the plan** — this project
  has five such points. Miss one and the filter leaks.
- **Classify by item, not only by section.** The obvious implementation of the depth
  filter is a rule per section. Applied to this catalog, a section named "Autonomic
  System" contains 5 physiology videos and 15 **pharmacology** videos — so the section
  rule would have deleted exactly the material Minimal mode promises to keep. The same
  trap appeared in two other sections. The working design is: a per-item map first, then
  section rules, and untagged means "core, always kept." Measure what your rules actually
  cut before you ship them (this one cuts 1%, 10%, 29% and 42% of the four blocks — the
  variance is itself information).

---

# Phase 5 — Making it survivable

## Step 26 — Storage, sync, and the one invariant that will bite you

This project stores a student's entire profile as **one JSON document** in a hosted
database, written to browser storage immediately and pushed to the cloud on a one-second
debounce. When two devices have both made changes, a merge function reconciles them.

Two hard-won rules:

**Union merge cannot express a deletion.** Merging progress maps by union can only ever
*add*. Unchecking an item is a deletion, so it came back from whichever device still had
it: the student's un-check undid itself. The fix is **per-item last-writer-wins
timestamps**, not set union.

**`merge(x, x)` must equal `x` byte-for-byte, including key order.** If the merge function
normalises a field the save function does not, a merged profile never equals its own saved
form; the sync layer reads that as "changed" forever and loops between adopting and
pushing. This invariant has been violated and re-fixed more than once in this project, so:

> **Every new configuration field gets a self-merge assertion in the check suite, in the
> same commit that adds the field.** Not later.

A structural trick that reduces the risk: keep new per-plan settings *inside* a container
the merge function copies wholesale. Here, plan configs live in a `cfgs` map that merge
copies whole, so adding a setting requires no merge change at all — and therefore cannot
break the invariant.

## Step 27 — Know your storage ceiling

The hosted database has a **1 MiB hard limit per document**, and this project's profile is
one document with no size guard. Reconstructing a maximal profile from the real catalog
gives roughly **102% of the limit**: a student who checked off all ~3,300 items, marked
every flashcard tag done, and flagged everything uncertain would silently fail to sync.

A realistic profile is a fraction of that, so this is a latent ceiling rather than an
observed failure — but **nothing in the code detects or warns about it.** If you build
this, either shard the document or add the guard. Writing it down here is the minimum
honest treatment; it is not a fix.

## Step 28 — Write checks that run the real app in a real browser

No framework, one large file, and a change to the scheduler can quietly break an unrelated
screen. The answer that worked: **scripts that serve the repository exactly as the host
does, drive a real browser through the real app, and assert behaviour.**

Current state: **8 check files, 308 assertions, all passing.** Shared plumbing handles
serving, launching, collecting uncaught page errors, and tallying, so each check file
contains only app-specific setup and assertions.

Five habits, all of which were learned by getting them wrong:

1. **Write each assertion as a sentence about behaviour.** A failure should read "studying
   ahead no longer moves the finish date," not "expected 3 to equal 4."
2. **Put the diagnostic numbers in the failure message**, so a red line is diagnosable
   without re-running anything.
3. **Confirm the check can fail.** Break the code deliberately and watch it go red. A
   check that passes against a broken app is worse than no check, because it is believed.
   And make sure your *harness* reports a crash as a failure: counting failure lines with
   `grep -c '^✗'` returns 0 for empty output, so a check that crashed before asserting
   anything reported "0 failures" and looked green.
4. **Never write an assertion that expires.** "This item is in the top two of the
   changelog" passes today and fails next month; so does "there are exactly three blocks."
   Both were written here, the second one *twice* in two commits after explaining why the
   first was wrong. Assert the durable rule — "the newest entry is first," "every block
   rolls over to the next" — derived from the data rather than hard-coded.
5. **Collect off-site requests**, so a check can assert that a screen loads nothing
   external.

Number the files upward and never reuse a number, so a reference to a deleted check in an
old commit message stays unambiguous.

## Step 29 — Deploy

Static hosting from the repository's default branch. No application server, no database
you administer, no per-user compute; every calculation runs in the student's browser.
Operating cost is therefore near zero, which is the main reason this is replicable by a
student organisation rather than an IT department.

Working rhythm that held up over four blocks of features: branch → commit → pull request →
squash-merge → verify the deployment run went green. Verify the *job*, not the run list —
the run list's "completed" filter lags, and a deploy you believed in is worse than one you
checked.

---

# Phase 6 — Putting it in front of students

## Step 30 — Put every option in the setup flow

The most useful bug report this project received was four words long: *"Not seeing the
options when making a new plan."*

Three features had shipped — even pace, reading mode, depth modes — each reachable only by
editing an existing plan. That was flagged twice as a deliberate scope decision, and three
features deep it was simply a defect. A student making a new plan could not choose the
thing that had been built for them.

It also exposed a real bug underneath: a reading-only plan could not be *created*, because
both gates on "has the student chosen a content resource?" tested specifically for a video
resource. **An option that cannot be chosen at setup is not shipped**, and the code path
that creates a plan will have assumptions the code path that edits one does not.

## Step 31 — Tell people what changed, and keep a channel you read

A short what's-new notice on opening, plus a changelog in the app. One concrete warning:
if your changelog entries are escaped when rendered, do not put markup in them. A literal
`<b>` tag sat visible in a release notice for two days here. The check suite now fails if
any changelog entry contains markup — which is the right response to a shipped
presentation bug.

More important: **have a channel where students tell you it's broken, and read it.** The
single most valuable report in this project's history was a student saying they could not
switch into reading mode — a feature that was finished, merged, and *not deployed*. No
test suite can find that. Only a user can.

---

# Phase 7 — Turning it into a research project

## Step 32 — Decide your evaluation question before you instrument anything

Be direct about what a codebase like this can and cannot support.

**From the artefact alone you can report:** what exists, how it is built, how the mapping
was made and verified, how much mapping labour a block costs, what it costs to run, what
broke and how it was fixed, and which design decisions were reversed and why. All of that
is real, citable, and — because it is a method others can follow — arguably the more
useful contribution.

**You cannot report:** user counts, adoption rate, retention, session length, feature
usage, or any correlation with examination performance. Not "we didn't analyse it" — the
data does not exist, by the design decision made in Step 6, and the database rules in
Step 5 mean even the author cannot read another student's document from the app.

If you need those figures, they come from exactly three places, and only the third is
prospective:

1. A console export by an administrator (gives registered accounts and last-active date,
   nothing more).
2. A survey of the cohort.
3. Instrumentation added deliberately, with consent, before the period you want to
   describe.

**Choose before you build further.** Retroactive instrumentation is not a thing. And note
what is *not* in this repository today and must be settled before any publication: no
IRB determination, no consent flow, no privacy policy, no accessibility audit.

## Step 33 — Make it genuinely reusable

For this to be an open-source blueprint rather than a described one, four things are
needed in the repository, and none of them exist today:

1. **A `LICENSE` file.** Without one, nobody may legally fork it (Step 3). Choose
   deliberately: a permissive license maximises adoption; a copyleft one keeps derived
   mappings open.
2. **A root `README`** that says what this is, who it is for, and where to start — which
   is this document, plus a one-screen orientation.
3. **The mapping published as data.** The blocks are currently JavaScript constants inside
   the program file, which means curriculum content *is* program code and adding a block
   requires a developer editing source. This is the single largest barrier to replication
   and should be stated as such — and the fix is to move blocks into a data file beside
   the catalog, where a curriculum insider could maintain them without touching the
   scheduler.
4. **A citation file**, so a school that adopts the method can credit the source and you
   can find out who did.

Numbers 1 and 2 are an afternoon. Number 3 is the real work, and it is the difference
between "a tool one school built" and "a blueprint other schools can execute."

---

# Appendices

## A.1 The data shapes

A catalog item:

```js
{ res, sys, cat, name, min }     // resource, system, section, title, minutes
```

A course block:

```js
{
  id, name,                      // "msk-skin", "Musculoskeletal & Skin"
  systems: [...],                // catalog systems this block covers
  weeks: [ { n, start, label,    // week number, Monday ISO date, theme
             lectures: [ {disc, title} ] } ],
  shelf: "2026-11-09",           // block exam date
  checkpoints: ["2026-10-16", "2026-10-30"],   // quiz dates = per-week deadlines
  videoWeek: { "res|sys|cat|name": weekNumber },  // per-item mapping (precedence 1)
  bcWeek:    { "sys|category":   weekNumber },    // per-section mapping (precedence 2)
  artWeek:   { "res|sys|cat|name": weekNumber },  // per-article mapping
  include:   [ "res|sys|cat|name", ... ],   // pulled in from outside `systems`
  exclude:   [ "res|sys|cat|name", ... ]    // in `systems` but taught elsewhere
}
```

A question-ID map:

```js
{ version, source: {title, author, note},
  tree: [...],                   // browsable hierarchy for the standalone tab
  byVideo: { "<video title>": [id, id, ...] } }
```

## A.2 Measured mapping effort, per block

| | Heme & Renal | Cardiopulm | Nervous & Sensory | MSK & Skin |
|---|---|---|---|---|
| Weeks | 4 | 4 | 3 | 3 |
| Lectures transcribed | 48 | 66 | 46 | 47 |
| Items in block | 333 | 404 | 547 (+108 articles) | 488 |
| Hours of video | 74.0 | 76.6 | 82.1 | 81.9 |
| Per-item keys | 110 | 127 | 112 (+108 articles) | 89 |
| Per-section keys | 27 | 43 | 62 | 43 |
| Items placed by section rule | 223 | 277 | 435 | 399 |
| `include` / `exclude` | 11 / 5 | 10 / 0 | 1 / 0 | 47 / 0 |
| Fell through to default | **0** | **0** | **0** | **0** |
| Dropped under Minimal depth | 3 (1%) | 39 (10%) | 157 (29%) | 205 (42%) |

**Read the bottom two rows together.** Zero fall-throughs is the generator's doing, not
care. And the Minimal-mode drop rate varying from 1% to 42% across blocks means the depth
classification is thorough in two units and incomplete in the other two — a known gap,
recorded rather than hidden.

## A.3 The architecture, and whether to copy it

The entire program — every screen, every calculation, all styling — is one file,
`index.html`, currently **6,668 lines**. No build step, no framework, no third-party
libraries. The file the developer edits is byte-for-byte the file the browser runs.

**In favour:** anyone can read the source; deployment is "commit the file"; there is no
dependency chain to rot or accumulate security advisories; nothing can break between the
code written and the code shipped.

**Against:** 6,668 lines in one file is hard for a second developer to enter safely, and
there is no mechanical guard against a change in one screen breaking another — which is
precisely why Step 28's browser checks are not optional here.

If your builder is a student working alone, copy this. If you have an engineering team,
don't — but keep the property that made it work: **content in data files, logic in code,
and no step between what you wrote and what ships.**

## A.4 Minimum viable version, if you have one weekend

Drop, in this order: the question-ID map, the reading mode, the depth filters, the
reference outlines, the re-fit action, the multi-device sync. Keep:

1. The catalog for the one or two resources your students actually own.
2. One block: weeks, quiz dates, exam date, lectures, mapping.
3. The pour (Step 19) with a quiz-paced deadline and a fixed daily budget.
4. The audit view (Step 18).
5. Local browser storage only.

That is a useful tool. Everything else in this document was added because students asked
for it, in roughly the order they asked.

## A.5 What we do not know

- **Hours spent.** Not logged, for any block. The later blocks were each built in about a
  working session given an existing catalog and an existing block to copy from; the first
  took five separate pull requests across a week, including one full re-verification
  against the syllabus after the initial mapping was found wanting. **Do not quote an
  hours figure** — ask the author.
- **Whether it helps anyone pass anything.** No data exists (Step 32).
- **The division of labour.** Git records one author. The in-app roster lists five content
  leads whose contribution is not visible in commit history.

## A.6 Re-deriving the numbers in this document

```bash
git clone https://github.com/LowYieldOnly/step1 && cd step1
git fetch --unshallow          # a default clone of this repo may be truncated
grep -c "" index.html          # lines in the program file
cd tools && npm install && npm run check    # 8 files, 308 assertions
```

Catalog and block figures come from parsing `catalog.json` and the `BRODY_BLOCKS`
constants in `index.html`, resolving every in-block item through the precedence rules in
Step 15. The per-block Minimal-depth drop counts come from applying `contentTag` to every
in-block item. The question-ID figures come from `uworld.json`.

---

*Prepared 2026-10-10 against commit `e9e72c9`, build `2026-10-10a`. Companion document:
`docs/manuscript-facts.md`, which holds the project-history and feature-inventory figures
for a written report — note its snapshot is 2026-09-05 and predates the four most recent
features and five of the eight check files.*
