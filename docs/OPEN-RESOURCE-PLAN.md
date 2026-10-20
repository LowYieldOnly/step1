# Opening BRODY MODE to other schools — the plan

**Purpose.** This is the plan for turning brodymode.com from one school's tool into a
resource other medical schools can adopt. It is a different document from
`BLUEPRINT.md`. That one tells a school how to *build their own* from the method. This one
tells *you* what has to change in this project, in what order, so adopting it is possible,
legal, safe, and not a burden you carry alone.

Measured against commit `8483215`, build `2026-10-10a`. Every coupling count below was
taken from the repository. Where something depends on a fact I cannot see from here
(ECU's policies, vendor contracts, whether the repo is currently public), it is marked
**[VERIFY]** and appears in Stage 0 as a task, not as an assumption.

This is not legal advice. Stage 0 says where you need a lawyer or a university office.

---

## 1. The verdict, up front

**Do it in four stages, and do not build a multi-school hosted platform first.**

| Stage | What | Why this order |
|---|---|---|
| 0 | Clear the ground: ownership, vendor content, privacy, name, license | Five things here can stop the project outright. Cheap to check, ruinous to discover after launch. |
| 1 | Make the repo safe and sensible to fork | Turns "one school's repo" into "something a stranger can run." No new features. |
| 2 | Move curriculum out of code into data "packs" | Removes the single largest barrier: today adding a unit means editing program source. |
| 3 | Pilot with one or two schools, watch them struggle, fix it | Everything before this is your guess about what adopters need. |
| 4+ | Governance, sustainability, research | Decide *after* a pilot whether to stay federated or go hosted. |

**The recommended model is federated, not hosted.** Each adopting school runs its own
copy: its own Firebase project, its own domain, its own student data. You publish the
code, the data format, and the documentation. You do **not** run other schools' students'
accounts. Reasons are in §6. Short version: hosting other institutions' student data makes
you a data processor for their students, turns every outage into your problem, and costs
you the thing that makes this project work today, which is that nobody depends on you
being awake.

**The five things that can kill this**, in order of how likely they are to matter:

1. **Vendor content in the repo.** The catalog lists 3,315 titled, timed items from paid
   commercial products. `uworld.json` holds 3,105 question-bank IDs. `rapidref.json`
   holds outlines of 63 Boards & Beyond videos (575 topics, 2,630 bullets). Publishing
   these under an open license may be fine, may breach a terms-of-service, and may attract
   a takedown. You do not know which, and neither do I. (§Stage 0, task 0.2)
2. **Who owns this.** You are an ECU medical student. Universities often claim some rights
   in work students produce using institutional resources, and the content here is built
   from ECU's course calendars and lecture titles. **[VERIFY]** (task 0.1)
3. **Student data.** The app stores study behaviour and email addresses for ECU students in
   a Firebase project that you personally control. Other schools' students raise the stakes
   and bring FERPA and their own institution's privacy rules. (task 0.3)
4. **One author.** Git shows a single human committer. If you are the only person who can
   fix a sync bug, adopters are depending on your exam schedule. (Stage 5)
5. **The name.** "Brody" is ECU's medical school. Another school cannot sensibly run
   something called BRODY MODE, and you may need ECU's permission to use the name in a
   public project at all. (task 0.4)

---

## 2. Decisions only you can make

These are not technical. Each has a default; change it only if you have a reason. The
document assumes the defaults.

| # | Decision | Default I assume | What changes if you pick otherwise |
|---|---|---|---|
| D1 | Open how far: code only, code + data, or code + data + hosted service? | Code + data, **federated** (no hosted service) | Hosted adds a whole Stage 4 and a support obligation |
| D2 | Code license | **MIT** (permissive, maximises adoption) | AGPL keeps derived mappings open but deters universities' legal offices |
| D3 | Data license (the mappings, not the code) | **CC BY 4.0** | CC BY-SA forces derived packs to stay open; CC0 asks for no credit |
| D4 | Does the vendor-derived data ship in the public repo? | **Decide in task 0.2 — do not default** | If no: the repo ships empty catalog scaffolding and schools supply their own |
| D5 | Is ECU the first adopter, an equal partner, or just origin? | Origin and first pack; not a gatekeeper | If ECU wants governance rights, Stage 5 changes |
| D6 | Who is allowed to join a school instance? | Each school sets its own email domain list | Open sign-up needs abuse controls you do not have |
| D7 | Do you collect any usage data? | **No**, unchanged | Research (Stage 6) requires an opt-in instrument; see §Stage 6 |
| D8 | Project name | **Undecided — needs you** | See task 0.4. ECU's instance can keep BRODY MODE; the *project* needs a neutral name |

---

## 3. What is actually coupled to ECU today

Measured, not guessed. This is the work list for Stages 1 and 2.

### 3.1 Hardcoded in the program file (`index.html`, 6,668 lines)

| What | Where | Count / detail |
|---|---|---|
| Allowed email domain | `ACCESS_DOMAINS=["ecu.edu"]` (line 1260) | 1 constant |
| Admin allowlist (a real personal email + a shared trial account) | `ACCESS_EMAILS` (1261) | 2 addresses |
| Content-audit allowlist, **including two student email addresses** | `AUDIT_EMAILS` (1268) | 3 addresses |
| "Access is limited to ECU…" message | `ACCESS_MSG` (1265) | 1 string |
| Sign-up copy "Create your ECU profile", "ECU only — use your ecu.edu email" | lines 4815–4816 | 2 strings |
| Firebase project: API key, project id, sender id, app id | `FB_CONFIG` (2369) | 1 object |
| Four course blocks as JavaScript constants | `BRODY_HEME_RENAL`, `BRODY_CARDIOPULM`, `BRODY_NEURO`, `BRODY_MSK` (~1546) | 4 blocks, 14 weeks, 207 lectures |
| "Governing Body" page naming five people, with headshots | line ~4916, `img/*.jpg` | 5 named individuals |
| User-facing "Brody" wording | "Brody calendar" (17), "Brody week" (16), "Brody plan" (7), "Brody quiz", "Brody teaches"… | dozens of strings; 107 raw occurrences of "Brody" in total, many of which are internal identifiers (`brodyWeekFrame` etc.) |

### 3.2 In other files

| File | School-specific? | Note |
|---|---|---|
| `firestore.rules` | **Yes** | Email regex for `ecu.edu` and a hard-coded personal email in the allowlist |
| `CNAME`, `manifest.webmanifest`, `sw.js` | Yes | Domain and app name |
| `catalog.json` (3,315 items) | **No** — resource-keyed, not school-keyed | Reusable by any school using the same vendors; legal question in task 0.2 |
| `uworld.json` (464 videos → 3,105 IDs) | **No** | Same legal question, sharper |
| `rapidref.json` (63 videos' outlines) | **No** | Highest vendor-content risk of the set |
| `extras.json` (8 algorithms) | No | Original reasoning aids; low risk |
| `m1schedule.json` | **Yes** | ECU's Fall 2026 M1 class calendar |
| `m1data.json` (662 ScholarRx bricks) | Partly | Depends on ScholarRx being the school's resource **[VERIFY licensing]** |

### 3.3 What is already generic and good

- The scheduler (`reflowBrody` and friends) does not know what school it is in. It reads a
  block object and pours items onto days.
- The catalog format is resource-keyed.
- The sync layer, version history, theme, and Anki output are school-agnostic.
- Checks (`tools/checks/`, 8 files, 308 assertions) exercise the generic behaviour.

The shape of the job: **about 80% of the program is already reusable. The coupling is
concentrated in about a dozen constants, one rules file, and four data blobs that happen
to live inside source code.** That is a good position. It is also why the order in this
plan is Stage 1 (extract the constants) before Stage 2 (extract the blocks).

---

# STAGE 0 — Clear the ground

**Goal:** know, in writing, that you are allowed to do this and what you are allowed to
publish. **Do this before any code.** Nothing in Stage 0 is expensive; skipping it is.

**Done when:** you have a one-page "what we publish and under what terms" document, signed
off by whoever needs to sign off, and a decision on D4.

### 0.1 Establish who owns the work

1. Find ECU's policy on intellectual property created by students. Search ECU's
   policy manual for "intellectual property," "copyright," and "student work." **[VERIFY]**
2. Ask the *medical school's* dean's office or research office, in writing, one question:
   *"I built a study-scheduling tool using publicly distributed course calendars. I want to
   release it as open-source software for other medical schools. Does the university claim
   any rights in it, and who must approve?"*
3. Get the answer by email, not conversation. Save it in the repo's `docs/` or keep it
   offline — your choice, but keep it.
4. If ECU claims rights, the realistic outcomes are: (a) they waive or grant a license, (b)
   they ask for co-ownership or attribution, (c) they say no. You need to know which
   *before* announcing to other schools.

**Who:** you. **Blocker if skipped:** a university office learns about it from a third
party after you have told other schools it is open. That conversation goes worse.

### 0.2 Decide what vendor-derived data may be published (D4)

This is the biggest legal question and the one most likely to reshape the plan.

**What the repo contains that comes from paid products:**

| Data | Contains | Closest to the line |
|---|---|---|
| `catalog.json` | Titles, section names, durations of videos in Bootcamp, Boards & Beyond, Pathoma, Sketchy | Factual metadata; low-to-moderate risk |
| `uworld.json` | Question-bank IDs mapped to videos (no question text) | Moderate; IDs are the vendor's identifiers |
| `rapidref.json` | Topic and bullet outlines of 63 B&B videos | **Highest** — this summarises vendor content |
| `uwlib` articles | 108 article titles from a paid library | Titles only; low-to-moderate |

**Tasks:**

1. Read the terms of service of each vendor: Boards & Beyond, Bootcamp, Pathoma, Sketchy,
   UWorld. Look for: restrictions on reproducing titles or structure, restrictions on
   derivative works, restrictions on building tools on top of the service, and
   anything about scraping or cataloguing. Record the exact clause for each.
2. For each data file above, write down a one-line verdict: **publish / publish with
   permission / do not publish.** Be conservative: a "moderate risk" file is not a
   "publish" file until someone qualified says it is.
3. **Ask the vendors.** A short, honest email to each: *"A medical student tool lists your
   video titles and durations so students can schedule them. We want to open-source it. May
   we include your title list? We store no video content."* Some will say yes. A "yes" in
   writing is worth more than any interpretation of their ToS. A "no" tells you what to
   strip.
4. Choose the fallback architecture now, because the answer may be "no" for some files:
   - **Option A — publish all.** Only if every vendor has said yes or the lawyer is
     satisfied.
   - **Option B — publish structure, not vendor data.** The repo ships the catalog
     *format*, the generators, and an *importer*; each school builds its catalog locally
     from its own subscriptions. This is slower for adopters but legally clean.
   - **Option C — publish the mappings only.** Ship `videoWeek`/`bcWeek` keys (your own
     original work: which week teaches what) without the catalog they point into. A
     school drops in their own catalog file. The keys are meaningless without the vendor
     titles, but they are *yours*.
5. **`rapidref.json` is a separate decision.** It is the only file that summarises vendor
   content. Default: **leave it out of any public release** unless B&B explicitly agrees.

**Who:** you, then a lawyer (university counsel, or a pro-bono student legal clinic) to
review your verdicts. **Blocker if skipped:** a takedown on a public repo with forks.
Forks cannot be recalled.

### 0.3 Decide the privacy position

1. Confirm what you hold: for each ECU user, an email, study activity (which items were
   completed, when), streak days, practice-question scores, confidence ratings, and plan
   settings — in a Firebase project **you personally administer**. **[VERIFY]**
2. Ask your university's privacy or IRB office whether this is an educational record under
   FERPA or covered by a data-governance policy. A student-run tool run on a personal
   Firebase account holding other students' study data is the situation these offices
   exist to review.
3. Write a **one-page privacy notice** in plain English: what is stored, where, who can
   read it (note: nobody can, from inside the app; the project administrator can via the
   Firebase console), how to delete it, what is *not* collected (no analytics, no
   tracking). Link it from the sign-in screen.
4. Decide a **deletion path**. Today there is no in-app "delete my account and data."
   Add one in Stage 1 (task 1.9). You cannot credibly publish a privacy notice that
   promises deletion you cannot deliver.
5. Decide whether *you* should be the data controller for ECU students long-term. Better
   answer: a named ECU faculty or staff sponsor, or the school itself, is.

**Who:** you, the privacy/IRB office. **Blocker if skipped:** the first complaint from a
student or the university has no good answer.

### 0.4 Decide the name (D8)

1. Ask ECU whether you may use "Brody" in a public project name. Brody School of Medicine
   is ECU's institutional name. **[VERIFY]**
2. Separate two names:
   - **The project** (the open framework, the repo, the documentation): needs a neutral
     name that any school can say without feeling it belongs to someone else's institution.
   - **Each instance:** "BRODY MODE" stays ECU's. A partner school runs, say, its own name
     on its own domain.
3. Pick the project name. Check that the domain and the GitHub organisation/repo name are
   free. Check that the name does not collide with an existing education product.
4. The internal term "Brody calendar" appears in dozens of user-visible strings. In the
   generic code it should become a per-school label ("Curriculum calendar" by default,
   configured to "Brody calendar" for ECU). That is task 1.4.

**I will not pick the name for you.** It is a branding call, and a poor one is expensive
to change once forks exist. If you want, I can generate a shortlist with collision
checks.

### 0.5 Choose the licenses (D2, D3)

1. Code: **MIT** by default. It is the licence a university's legal office is least
   likely to object to.
2. Data (mappings, packs, documentation): **CC BY 4.0**. Requires attribution, allows
   everything else.
3. **Different licences for different content in one repo is normal.** Put a `LICENSE`
   (code) at the root and `docs/LICENSE-DATA` (or a `LICENSE` inside each pack
   directory). Say clearly which files are which.
4. Third-party content that the licence does **not** cover must be named: "This repository
   does not grant any rights in the products it references (Boards & Beyond, UWorld, …)."
5. Add `CITATION.cff` so academic users can cite it correctly. It also gives you a way to
   find out who adopted it.

**Who:** you. **Blocker if skipped:** with no licence, default copyright applies and
nobody may legally use the code. Today the repo has **no LICENSE file** (verified).

### 0.6 The thing to check before anything else

**Is the repository currently public?** GitHub Pages on a free account requires a public
repo, and brodymode.com is served by Pages. **[VERIFY]** If it is public today, then
everything in §0.2 is *already* exposed, any forks that exist cannot be recalled, and
the personal email addresses in `ACCESS_EMAILS`, `AUDIT_EMAILS` and `firestore.rules` are
already visible. In that case: do task 1.1 (remove personal data from the current tree)
**immediately**, and note that the git history still contains them (see task 1.2).

---

# STAGE 1 — Make the repo safe and sensible to fork

**Goal:** a stranger can clone the repo, follow one document, and have a working instance
for a made-up school, without editing program logic and without ever seeing ECU's
data. **No new student-facing features in this stage.**

**Done when:** a person who has never seen the project, and has a Google account, can
stand up a working empty instance by following `SETUP.md`, timed, with you watching and not
helping. (That test is also Stage 3's first exercise.)

### 1.1 Remove personal data from the working tree

Replace, in `index.html` and `firestore.rules`:

- `ACCESS_EMAILS` and `AUDIT_EMAILS` — move to a config object (task 1.3) with **empty**
  defaults in the public version.
- The two student email addresses in `AUDIT_EMAILS`. These are individuals' addresses in
  source code. Remove them whatever else you decide.
- The personal email in `firestore.rules`.

Check no other file carries addresses: `grep -rn "@" --include="*.json" --include="*.html"
--include="*.rules" .` and read each hit.

### 1.2 Decide what to do about git history

Removing a file from the tree does not remove it from history. Two honest options:

- **A. Publish with full history.** Simple, preserves credit and the story. Any address
  or sensitive item ever committed stays visible forever.
- **B. Publish a clean-history copy** (a new repository with a squashed first commit), and
  keep the original private. You lose the commit-by-commit history but remove the
  exposure.

Run `git log -p -S"@students.ecu.edu"` and `git log -p -S"protonmail"` to see what history
holds. If the answer is "a lot," use B. **If the current repo is already public (§0.6),
history is already exposed and option B only protects future readers.**

### 1.3 Extract a single `SCHOOL` config object

Everything that says "ECU" or names a person or a Firebase project becomes one object near
the top of `index.html` (or its own file, `school.config.js`, loaded first):

```js
const SCHOOL = {
  name: "East Carolina University",          // shown in the About page
  instanceName: "BRODY MODE",                 // header, manifest
  calendarLabel: "Brody calendar",            // the generic "curriculum calendar" word
  accessDomains: ["ecu.edu"],                 // sign-in restriction
  adminEmails: [],                            // exceptions + admins
  auditEmails: [],
  accessMessage: "Access is limited to…",
  firebase: { apiKey, authDomain, projectId, … },
  contactEmail: "",
  privacyUrl: "",
  governors: []                               // About page roster (empty = hide section)
};
```

Rules for doing this well:

1. **Behaviour must not change.** After this task the ECU instance must be byte-for-byte
   equivalent in behaviour. Run all 8 check files; they must stay green. Add a check that
   the sign-in message and domain gate come from `SCHOOL`.
2. **Derive, don't duplicate.** `ACCESS_DOMAINS`, `ACCESS_MSG`, and the sign-up copy should
   all read from `SCHOOL` so changing one place changes the whole app.
3. **The Governing Body page renders from `SCHOOL.governors`** and disappears when the list
   is empty. This also means headshots (`img/*.jpg`) stop being in the template (see 1.6).
4. Add a self-merge assertion if any new key lands in saved state. (Config is not saved
   state; it should not.)

### 1.4 Rename the generic vocabulary

The code uses "Brody" both as an identifier prefix (`brodyWeekFrame`, `BRODY_BLOCKS`) and
as visible text. These are two different jobs.

- **User-visible text** → read from `SCHOOL.calendarLabel`. This is the part adopters
  see, and it is small (dozens of strings). Do it in Stage 1.
- **Internal identifiers** → rename later or never. Renaming ~100 identifiers in a 6,668-line
  file with no type checker is the sort of change that causes bugs. A comment at the top
  of the scheduler saying "`brody*` is historical for 'curriculum-mapped plan'" costs
  nothing and risks nothing. **Do not rename identifiers in Stage 1.**

### 1.5 Make the Firebase rules a template

1. Move `firestore.rules` to `firestore.rules.template` with placeholders for the allowed
   domain and an admin list.
2. Provide a tiny script (`tools/gen-rules.mjs`) that reads `SCHOOL` and writes the real
   rules file. This guarantees the page and the server enforce the **same** list. Today
   they are two hand-kept copies and the file's own comment says "keep in sync."
3. Add a check that fails if `firestore.rules` and `SCHOOL.accessDomains` disagree. (Same
   shape of defect the project has already learned to guard against with generators.)

### 1.6 Decide the headshots and roster

The five JPEGs in `img/` are photographs of named individuals. **Get written consent
from each person before they sit in a public repository under an open licence.** Better
default: remove them from the template, keep the About-page code, and let each school
supply their own roster.

### 1.7 Remove the lone-developer assumptions

1. **Add CI.** There is no `.github` directory. Create a GitHub Actions workflow that
   installs Playwright and runs `tools/run-checks.mjs` on every pull request. Without it,
   a contributor can break the scheduler and nobody finds out until a student does.
2. **Add a branch protection rule** requiring the checks to pass.
3. **Pin the check runner's browser** so results do not drift (`PLAYWRIGHT_CHROMIUM`
   already supports this).
4. **Document the sync invariant** (`mergeState(x,x)` equals `x`, including key order) at
   the top of the sync code and in `CONTRIBUTING.md`. It is the one thing that will break
   in a contributor's first config-field PR.

### 1.8 Write the repo's front door

Create, at the repository root:

| File | Contents |
|---|---|
| `README.md` | What this is, who it is for, a screenshot, three sentences on how it works, a link to `SETUP.md`, a link to the blueprint, the licence |
| `SETUP.md` | The "stand up an empty instance" walkthrough (task 1.10) |
| `LICENSE` | MIT (D2) |
| `LICENSE-DATA` | CC BY 4.0 (D3), plus the third-party disclaimer (0.5) |
| `CONTRIBUTING.md` | How to propose a change, the sync invariant, "run the checks," how to add a check |
| `CODE_OF_CONDUCT.md` | Standard short form |
| `SECURITY.md` | How to report a vulnerability privately; what the app stores |
| `CITATION.cff` | Citation metadata |
| `PRIVACY.md` | The notice from task 0.3 |
| `docs/BLUEPRINT.md` | Already exists; becomes the "how to build a unit" guide |
| `docs/OPEN-RESOURCE-PLAN.md` | This file; probably moves to a project-governance location |

`README.md` must open with: **what it stores, what it does not, and that it requires a
person who has taken your course.** An adopter should know the real cost in the first
screen.

### 1.9 Add the privacy features you promised

1. **Delete my account and data.** One button; removes the Firestore document and its
   `backups` subcollection, then the Auth user. Test it with a check.
2. **Export my data.** Already partly present (one-tap export). Confirm it is complete.
3. **Show the privacy notice** on the sign-in screen.

### 1.10 Write `SETUP.md` and test it on a stranger

Exact steps an adopter follows. Write them while doing them, on a clean machine and a clean
Google account, with nothing you already have configured:

1. Fork or clone the repository.
2. Create a Firebase project; enable Authentication (Email/Password, and Google if desired)
   and Firestore.
3. Copy the web-app config into `school.config.js`.
4. Set `accessDomains`.
5. Generate and deploy the rules (`node tools/gen-rules.mjs`, then
   `firebase deploy --only firestore:rules`).
6. Enable GitHub Pages, set the custom domain (or use the default URL).
7. Add the domain to Firebase Auth's authorised domains. (This step is the one people
   forget, and it produces a sign-in failure that looks like a bug in the app.)
8. Sign in, create a plan, confirm it saves and survives a reload.
9. Open the Content Audit and confirm it shows no unmapped items.

Then give the document to someone who has not seen it, **sit behind them, and say nothing.**
Every place they hesitate is a missing sentence. Fix those, repeat with a second person.
**Record the elapsed time**; that number goes in the README, honestly.

### 1.11 Add abuse and cost guardrails

The Firebase config, including the API key, is in the page source (normal for Firebase web
apps). That means anyone can call your project's APIs from anywhere, subject only to the
rules. For an instance, the controls are:

1. **Enable Firebase App Check** so only your page can call the backend.
2. **Set a budget alert** on the Google Cloud billing account, and a hard quota where the
   console allows. An open instance with a script hammering it is a billing event.
3. **Keep the rules default-deny** (they already are; keep it that way in the template).
4. Add a **document-size guard** (see task 1.12) so a runaway profile cannot fail silently.

### 1.12 Close the known size ceiling

`manuscript-facts.md` §6.3 and the blueprint Step 27 both record that a maximal profile is
~102% of Firestore's 1 MiB document limit and **nothing detects it.** Before other schools
depend on this:

1. Add a guard that measures the serialised profile before push and, above, say, 80%,
   shows the student a warning and an export button.
2. Decide the long-term answer (shard the document, or move the largest maps to a
   subcollection) — but the guard is the minimum, and it is small.

---

# STAGE 2 — Move curriculum out of code and into data packs

**Goal:** adding a course unit, or a whole school's curriculum, means adding *data files*
and never editing the program.

This is the stage that makes it "a resource other schools can adopt" rather than "a
codebase other schools can fork." Today a unit is a JavaScript constant inside a 6,668-line
file, which means every adopter needs a developer. A pack format means a **curriculum
insider** — the person the project actually needs — can maintain it.

**Done when:** all four ECU blocks load from `packs/ecu/` as JSON, the app has no
`BRODY_*` block constants, all 8 check files are still green, and a new empty unit can be
added by dropping one file into a directory.

### 2.1 Define the pack format

A **pack** is a directory:

```
packs/
  ecu/
    pack.json              # id, name, school, version, licence, maintainers
    units/
      heme-renal.json      # exactly today's BRODY_HEME_RENAL object
      cardiopulm.json
      neuro-sensory.json
      msk-skin.json
    articles/
      neuro-sensory.json   # artWeek mappings
    content-tags.json      # the depth (Minimal/Comprehensive) classification
    uworld.json            # optional question-ID map
  _template/               # a documented empty pack to copy
```

Rules:

1. **A unit file is today's block object**, unchanged. Appendix A.1 of the blueprint is
   already its schema. You are moving data, not redesigning it.
2. `pack.json` carries a `schemaVersion`. The app refuses a pack newer than it understands,
   with a clear message.
3. **Writing a `JSON Schema` file for the unit format** (task 2.2) is the contract.

### 2.2 Write a validator that runs without a browser

A command-line tool, `tools/validate-pack.mjs`, which takes a pack directory and a
catalog and reports:

- every `videoWeek`/`bcWeek`/`artWeek` key matches a real catalog item,
- every in-block item resolves by precedence 1 or 2 — **zero fall-throughs** (this is the
  check that has held at 0 across four blocks),
- every week has a start date; dates are valid ISO; the block exam is after the last week;
  checkpoints fall inside the block,
- every `include` entry is justified by a lecture (a required `reason` field),
- no stale section keys,
- the pack's total hours and per-day average at a realistic pace (blueprint W.7 criterion 6).

This is the existing generator discipline made portable. **Exit non-zero on any failure.**
A curriculum insider should be able to run one command and be told what is wrong in
plain words.

### 2.3 Load packs at runtime

1. The app loads `packs/<id>/pack.json` and its units at start, the same way it already
   fetches `catalog.json` and `uworld.json`.
2. `BRODY_BLOCKS` becomes `PACK.units`, ordered by exam date.
3. **Plan configs already reference a block by `id`** (`brodyBlock(c)`), so existing
   student plans keep working if unit ids are unchanged. Keep the ids. Add a check that
   every id referenced by a saved-state fixture resolves.
4. Offline: add the pack files to the service worker's fallback cache so a unit loads
   without a network.
5. **The rollover logic** (what comes after a finished block) must derive from the pack's
   ordering, never from a hard-coded list. The blueprint's lesson about "three blocks"
   assertions applies here too.

### 2.4 Migrate ECU's four units, and prove nothing changed

1. Write a one-off script that extracts the four `BRODY_*` constants to JSON.
2. **Before/after test:** for each unit, run the full plan generation for a fixed set of
   configs (quiz-paced and even-paced; Minimal and Comprehensive; articles on and off;
   several start dates) both from the constants and from the packs, and assert the
   resulting calendars are identical. This is the single most important test in the
   stage. Without it you cannot know the migration is safe.
3. Only then delete the constants.

### 2.5 Separate the shared catalog from school packs

Two layers, and keep them separate:

- **Catalog** (school-agnostic): the universe of resource items. Shared across all schools
  that use the same vendors. Subject to the legal verdict in task 0.2.
- **Pack** (school-specific): which week of *this* school teaches which catalog item.

A pack should name the catalog version it was validated against (`catalog.version` is
already `2026.1`). When the catalog changes, the validator tells every pack what broke.

### 2.6 Layer the optional features cleanly

- **Content depth tags** (Minimal/Comprehensive): per-pack, with a documented method.
  Blueprint Step 25 records that section rules alone would have deleted pharmacology;
  carry that warning into the pack docs. Show a pack's own Minimal drop percentages in the
  validator output so a pack author sees an under-classified unit.
- **Question-ID maps**: optional file; absence hides the Questions tab.
- **Articles (reading mode)**: optional; absence hides the toggle.
- **Rapid Reference outlines**: remain outside any public pack unless task 0.2 clears them.

### 2.7 Retire the ECU-specific hubs from the core, or make them packs

M1 (`m1schedule.json`, `m1data.json`), M3, Step 1 Dedicated, and the readiness/step views
are **separate products** bundled in one file. For an adopter whose cohort is not at ECU:

- **The M2 Scheduler is the portable core.** Ship it first.
- **M1 hub** needs a school's own class calendar and (likely) ScholarRx licensing. Make it
  a second kind of pack, or leave it out of version 1.
- **M3 hub** (8 algorithms, 6 empty shelves) is mostly scaffolding. Leave it out of the
  open release, or ship it clearly labelled as ECU-sourced reference.

**Recommendation: the first open release is the M2 Scheduler only.** Smaller surface,
smaller legal footprint, and it is the part with a documented method.

### 2.8 Document the pack authoring workflow

`docs/BLUEPRINT.md` already covers the method. Add a short `packs/README.md`:

1. Copy `_template/`.
2. Fill `pack.json`.
3. Add one unit (week skeleton → lectures → mapping).
4. Run `validate-pack`.
5. Open the Content Audit in the app for human review.
6. Submit as a pull request, or keep private.

---

# STAGE 3 — Pilot

**Goal:** find out what you got wrong, from real adopters, cheaply. Everything before this
is your hypothesis about what schools need.

**Done when:** at least one non-ECU instance is live with real students, and you have a
written list of what hurt.

### 3.1 Choose the pilot school(s)

Criteria, in order of importance:

1. **A curriculum insider exists and is willing** (a student who has taken the course and
   used the resources). If not, pick another school.
2. **A school whose email domain, calendar structure and resources are similar enough to
   ECU's** that the first pilot tests the *process* and not 12 new variables. A school
   using the same vendors is far better than one using different ones.
3. **Different enough on one axis** to teach you something: a different block length, a
   different quiz structure, a different week-start day.
4. **A school with someone senior who will answer an email** about their own privacy
   office, since task 0.3 applies to them too.

Start with one. Add a second only after the first has a working unit.

### 3.2 Write the adopter's kit

1. `SETUP.md` (task 1.10).
2. `packs/README.md` (task 2.8).
3. A **one-page decision checklist** for the school: who is the curriculum insider, who is
   the technical person, who is the faculty sponsor, which resources do students own, what
   is the privacy position.
4. A **template email** they can send their own privacy office.

### 3.3 Run the pilot as an observation, not a launch

1. Pair with them for the first unit. **Time every phase**: catalog check, calendar
   extraction, lecture transcription, mapping, validation, review.
2. Write down every question they ask. A repeated question is a documentation bug.
3. Record where the *tool* forced them to edit something it should not have (a hard-coded
   assumption you missed). Each is a Stage 1 or 2 defect.
4. When the unit is built, ship it to a handful of students first. Watch the mapping
   get argued with.

### 3.4 Capture the numbers nobody has

This is the research payoff of the pilot. Record, per unit built at the new school:

- hours spent, by phase and by person (the number this project never logged),
- number of per-item vs per-section decisions,
- number of validator failures before it passed,
- number of mapping corrections after students saw it.

The blueprint (A.5) states these were never recorded. A pilot is the first chance to
record them cleanly.

### 3.5 Decide the success criteria in advance

Write them down before the pilot starts, so you cannot adjust them afterwards:

- The pilot school stood up an instance without you editing their code.
- The validator reported zero fall-throughs on their unit.
- The elapsed time for a first unit was within the range you are willing to promise.
- Students at that school used it for more than one week (self-reported is acceptable;
  state that it is).

---

# STAGE 4 — Federated or hosted: decide after the pilot

**Goal:** decide how schools get an instance, with evidence.

### 4.1 The three models

| Model | What it is | Cost to you | Risk to you |
|---|---|---|---|
| **Federated** (recommended) | Each school runs its own copy with its own Firebase and domain | Documentation and support only | Low. A school's outage is theirs. |
| **Shared hosted** | You run one Firebase project; schools are tenants | Ongoing ops, support, billing | **High.** You hold multiple institutions' student data and every bug is your incident. |
| **Hybrid** | You offer a managed instance to schools without a technical person, at cost | Real ops work | Moderate. Needs an entity, a contract and money. |

### 4.2 Why the default is federated

1. **Data custody.** In a federated model each school is the controller of its own students'
   data and the Firebase console is theirs. In a hosted model you are the processor for
   several institutions' records, with whatever obligations their privacy offices impose.
2. **Blast radius.** One mistake in the rules of a shared project exposes everyone. In
   federated, it exposes one school.
3. **Your time.** The tool works today because nobody depends on you being awake. Hosting
   removes that property.
4. **Rules complexity.** A multi-tenant version needs per-tenant domain allowlists in rules
   and a tenant boundary in the data model. The current model (one document per uid, one
   domain list) would need real redesign, and the sync invariants would need re-proving.

### 4.3 What would make you reconsider

- Three or more schools asking for a hosted option because they have no technical person.
- A funded entity (a university department, a society, a grant) willing to be the
  operator, with a contract.
- A different data model that gives you cheap tenant isolation.

Without all three, stay federated. If you do go hosted, treat it as a new project with its
own Stage 0.

### 4.4 Cost, measured as far as it can be

Current evidence: the project's own operating cost is near zero at one school's scale
(GitHub Pages is free; Firebase's free tier covers a cohort). **No usage numbers exist** (the
app collects none), so the cost at 10 schools cannot be derived from this codebase. Do not
promise adopters a cost you have not measured. Put "we do not know; here is how to set a
budget alert" in the README.

---

# STAGE 5 — Governance and sustainability

**Goal:** the project survives you being busy.

### 5.1 Names and roles

Write down, in `GOVERNANCE.md`:

1. **Maintainers** — who can merge. Start with you and at least one more person. A project
   with a single maintainer should say so honestly.
2. **Pack maintainers** — each school's curriculum insider owns their own pack. They merge
   their own pack changes; they do not merge core changes.
3. **Content reviewers** — the people who say "this mapping is wrong." This is the
   existing "Content Leads" role made explicit.
4. **A faculty sponsor** — a named person at each participating school.

### 5.2 Versioning and releases

1. **Semantic versioning for the core**, and a separate `schemaVersion` for packs.
2. **Tagged releases**, with a changelog written for adopters, not for you. (The in-app
   changelog is for students; the repo changelog is for schools. They differ.)
3. **A compatibility promise**: a pack valid for schema `N` keeps working across core
   releases within `N`. Breaking changes bump `N`, ship a migration script, and give a
   deprecation window.
4. **Catalog versions** the same way. When a vendor adds or renames a video, packs that
   referenced the old name should fail validation clearly.

### 5.3 Who fixes the hard bugs

The sync layer is the hardest part of the codebase, and every defect in the project's
history from §6.2 of `manuscript-facts.md` came from it. Identify **one other person** who
understands it, before schools depend on it. Do it by walking them through the
`mergeState` invariant and having them fix a real or contrived bug under your review.

### 5.4 Funding

The project costs near zero to run; what it costs is *attention*. Name it honestly:

- Options: a university innovation grant, a medical education society, a small
  endowment-style donation, a sponsored maintainer stipend.
- **Do not accept money from a resource vendor without thinking hard about the conflict**
  of interest: the tool's value depends on schedulers that treat vendors' content
  neutrally.

### 5.5 Deprecation and end-of-life

Say in `GOVERNANCE.md` what happens if the project goes quiet: the code stays under its
licence, anyone can fork, and instance owners keep their data. A school adopting a student
project should be told this up front.

---

# STAGE 6 — The research layer

**Goal:** be able to say something true about whether this helps, if you want to.

This stage is optional and has a hard prerequisite. The blueprint (Step 32) says it and it
bears repeating: **the tool collects no usage data, so no adoption, engagement or
outcome claim can be made about the past.** Retroactive instrumentation does not exist.

### 6.1 Decide the question first

Write down one primary question before building anything. Examples of answerable ones:

- *Can a curriculum insider build a validated unit in N hours?* (answerable from the pilot;
  task 3.4)
- *What fraction of students at an instance use the mapped plan for more than a week?*
  (needs opt-in usage data)
- *Is use of the mapped plan associated with block-exam performance?* (needs outcome data,
  IRB, and an honest account of confounding; hard)

### 6.2 If you collect anything, do it right

1. **IRB determination** at each site before data collection.
2. **Opt-in consent** inside the app, with plain language and a no-penalty decline.
3. **Collect the minimum** and keep it separate from the study profile.
4. **Never retrofit**: instrumentation applies from the day it is turned on.
5. Keep **the default build instrumentation-free.** Make the research build a separate,
   clearly-labelled configuration.

### 6.3 Publish the method, not only the result

The most defensible contribution available today is the method itself: how the mapping was
made, how it was verified, what it cost, what broke and how it was fixed, and which design
decisions were reversed. That is a methods paper that needs no outcome data. The blueprint
and `manuscript-facts.md` are the raw material.

---

## 4. The order things depend on each other

```
0.6 (is it public?) ──► 1.1 (remove personal data)  ◄── do first if yes
0.1 ownership ──┐
0.2 vendor data ┼──► D4 ──► what the public repo contains ──► Stage 1 release
0.3 privacy ────┤
0.4 name ───────┤
0.5 licence ────┘

1.3 SCHOOL config ──► 1.4 vocabulary ──► 1.5 rules template
1.3 ───────────────► 1.10 SETUP.md (needs the config to exist)
1.7 CI ────────────► 2.4 migration (the before/after test needs CI to be trusted)

2.1 pack format ──► 2.2 validator ──► 2.3 loader ──► 2.4 migrate ECU ──► 2.5/2.6
2.4 ──► 3.1 pilot (a pilot on the old structure tests the wrong thing)

3 pilot ──► 4 federated/hosted decision ──► 5 governance
3.4 numbers ──► 6 research
```

**Critical path:** 0.1 / 0.2 → D4 → 1.3 → 2.1–2.4 → 3.

**Parallel work that costs nothing in the critical path:** 1.7 (CI), 1.8 (front-door
files), 1.9 (privacy features), 1.12 (size guard) and 5.3 (second maintainer) can start any
time after Stage 0's licence decision.

---

## 5. Risk register

| Risk | Likelihood | Impact | Mitigation | Stage |
|---|---|---|---|---|
| A vendor objects to published title lists or IDs | Unknown | High (takedown of a repo with forks) | Written permission, or ship structure not data (Option B/C) | 0.2 |
| ECU claims rights in the work | Unknown | High | Written determination before announcing | 0.1 |
| Personal emails/headshots already public | **Possible — verify** | Medium (privacy) | Remove now; consider clean-history repo | 0.6, 1.1, 1.2 |
| A student complains about data handling | Low–Medium | High | Privacy notice, deletion path, named sponsor | 0.3, 1.9 |
| Migration to packs changes a schedule silently | Medium | High (students' plans shift) | Before/after equality test across a config matrix | 2.4 |
| A sync bug corrupts an adopter's data | Low–Medium | High | Second maintainer, CI, self-merge assertions | 1.7, 5.3 |
| Profile exceeds the 1 MiB document limit silently | Low now, rising | Medium | Size guard first, redesign later | 1.12 |
| Adopter abuse or runaway billing | Low | Medium | App Check, budget alerts, default-deny rules | 1.11 |
| A pack author maps badly and students distrust the tool | Medium | Medium | Validator + Content Audit open to all + marked judgement calls | 2.2, Blueprint 17–18 |
| You become the only support channel | **High** | High (burnout; school stranded) | Federated model, documentation, second maintainer, honest README | 4, 5 |
| Vendor changes its catalog; packs rot | High over time | Medium | Catalog versioning and validator failing loudly | 5.2 |
| The project name is a problem | Medium | Medium | Task 0.4 before the first public announcement | 0.4 |
| Reading-mode or Minimal-mode classification is incomplete at a new school | High | Low–Medium | Validator shows drop %, pack docs warn | 2.6 |

---

## 6. What to do first

If you do nothing else this week, in this order:

1. **Find out whether the repository is public right now.** (Open it while signed out.)
2. **If it is, remove the student email addresses and the personal email from the tree**
   (tasks 1.1) and start thinking about history (1.2).
3. **Send the ownership question to the dean's or research office** (0.1). It has the
   longest lead time and everyone else's answer depends on it.
4. **Read the Boards & Beyond and UWorld terms of service**, and write the one-line verdict
   for each data file (0.2).
5. **Pick the licences** (0.5) and add `LICENSE` plus `README.md` (1.8). They are cheap and
   they unblock everything else that needs a licence.
6. **Choose the name or ask for help choosing** (0.4).
7. **Identify a possible pilot school** and the one person there who is a curriculum
   insider (3.1). You only need a name this week.

Items 1–3 are the ones that can change the plan. Items 5–7 are momentum.

---

## 7. Appendix — mechanical change list

For whoever does Stage 1 and 2, the file-level work, from the measurement above:

| File | Change | Task |
|---|---|---|
| `index.html:1260-1268` | Replace `ACCESS_DOMAINS`, `ACCESS_EMAILS`, `ACCESS_MSG`, `AUDIT_EMAILS` with reads from `SCHOOL` | 1.1, 1.3 |
| `index.html:2369` | Move `FB_CONFIG` into `SCHOOL.firebase` | 1.3 |
| `index.html:4815-4816` | Sign-up copy derived from `SCHOOL` | 1.3 |
| `index.html:~4916` | Governing Body rendered from `SCHOOL.governors`; hidden when empty | 1.3, 1.6 |
| `index.html` user-visible "Brody …" strings (dozens) | Read `SCHOOL.calendarLabel` | 1.4 |
| `index.html:~1546` | Four `BRODY_*` constants → `packs/ecu/units/*.json` | 2.4 |
| `index.html` (`BRODY_BLOCKS`) | → `PACK.units`, ordered by exam date | 2.3 |
| `firestore.rules` | → `firestore.rules.template` + generator | 1.5 |
| `CNAME`, `manifest.webmanifest`, `sw.js` | Name/domain from the instance | 1.3 |
| `img/*.jpg` | Remove from template unless consent obtained | 1.6 |
| `m1schedule.json`, `m1data.json`, `extras.json`, `rapidref.json` | Leave out of v1 open release, or move to a pack | 2.7, 0.2 |
| `tools/generators/mk_*.js` | Parameterise by pack directory; keep the "validate then refuse" behaviour | 2.2 |
| `.github/workflows/` (new) | CI running `tools/run-checks.mjs` | 1.7 |
| root (new) | `README`, `SETUP`, `LICENSE`, `LICENSE-DATA`, `CONTRIBUTING`, `CODE_OF_CONDUCT`, `SECURITY`, `CITATION.cff`, `PRIVACY`, `GOVERNANCE` | 1.8, 5.1 |
| `tools/checks/` | New checks: config drives the gate; rules match config; pack equivalence; account deletion; size guard | 1.3, 1.5, 2.4, 1.9, 1.12 |

### Checks to add before each change merges

Learned from this project's own history (blueprint Step 28):

- Write each as a sentence about behaviour.
- Put the numbers in the failure message.
- **Break the code deliberately and confirm the check goes red.**
- Never assert something that expires (a count of blocks, a date window).
- Every new saved-config field gets a `mergeState(x,x)` assertion in the same commit.

---

## 8. What I do not know

- Whether the repository is public. **[VERIFY]**
- ECU's rules about student IP, branding, and student-run tools holding student data.
- What each vendor's terms permit.
- Whether ScholarRx content in `m1data.json` is licensable for redistribution.
- How many hours a unit costs a new school. The pilot is the first chance to measure it.
- What other schools want. Everything here is inferred from one school's use. Stage 3
  exists to replace inference with evidence.
- Whether adoption would be wanted at all. The cheapest test is an email to two peers at
  other schools asking whether they would use it, before any of Stages 1–2 is built.

That last point is worth taking seriously. **Stage 0 and one conversation with a potential
adopter cost almost nothing, and either could change what you build.** Do them first.

---

*Prepared 2026-10-19 against commit `8483215`, build `2026-10-10a`. Companion documents:
`docs/BLUEPRINT.md` (how a school builds a unit), `docs/blueprint-portable.md` (the same,
packaged for a fresh conversation), `docs/manuscript-facts.md` (project history and
limitations).*
