# Research questions for a Claude agent

These are the open questions behind `docs/OPEN-RESOURCE-PLAN.md`: things the plan marks
**[VERIFY]**, plus things nobody on this project has looked up. Each can be answered, at
least in part, from public sources.

**How to use this file.** Give a Claude agent with web search this whole file. Ask it to work
one section at a time and return one answer per question in the format below. Sections A and B
come first because their answers can change the plan. The rest can run in parallel.

---

## Brief for the agent

You are researching on behalf of a medical student who wants to release a study-scheduling tool
as open source for other medical schools. The tool lists third-party board-prep videos and
question-bank IDs (titles and durations only, no content) and maps them to one school's course
calendar. It stores student study data in Firebase. It is hosted on GitHub Pages. The school is
East Carolina University's Brody School of Medicine (ECU).

**Rules**

1. **You are not giving legal advice.** Report what the primary sources say, quote the exact
   clause or sentence, and say what a lawyer would need to confirm. Never write "this is legal"
   or "this is fine."
2. **Primary sources first.** Prefer the vendor's own terms page, the university's own policy
   manual, the statute or regulation, and the official platform documentation. Use blogs,
   forums and law-firm summaries only to find the primary source, and label them as secondary.
3. **Quote and link.** For every factual claim give the URL, the page or section, the exact
   wording where it matters, and the date you read it. Terms pages change, so the date is part
   of the answer.
4. **Do not access paid or login-gated content.** Do not sign up for services, scrape paywalled
   material, or try to read vendor video content. Public terms pages, public marketing pages and
   public documentation are fine.
5. **Say "not found" plainly.** If a policy is not published, or two sources conflict, say that.
   Do not fill the gap with a guess.
6. **Mark confidence** on every answer: **High** (primary source, unambiguous), **Medium**
   (primary source, open to interpretation), **Low** (secondary only, or inferred).
7. **Flag the date-sensitive answers.** If an answer will go stale (pricing, quotas, terms),
   say so.
8. **Return, for each question:** the answer in 1 to 4 sentences, the evidence, the confidence,
   and what remains unknown.

**Output format per question**

```
Q<id>. <question, short>
Answer:       <1–4 sentences>
Evidence:     <URL — section — date read — quote if it matters>
Confidence:   High | Medium | Low
Still unknown / needs a human (lawyer, ECU office, vendor): <…>
```

---

## A. Vendor terms and what may be published (highest priority)

Context: the repo holds 3,315 catalog items (title, section, duration) from Boards & Beyond,
Bootcamp, Pathoma, Sketchy Micro, Sketchy Pharm and a UWorld article library; 3,105 UWorld
question-set IDs mapped to B&B videos; and outlines (topics and bullets) of 63 B&B videos.
Task 0.2 of the plan depends on these answers.

**A1.** For each vendor, find the current Terms of Service / Terms of Use / EULA and any
separate acceptable-use or intellectual-property policy: Boards & Beyond, Bootcamp, Pathoma,
Sketchy, UWorld. Give the URL and the "last updated" date for each.

**A2.** For each vendor's terms, quote every clause that restricts any of the following. If none
exists, say so.
 - reproducing or listing titles, table of contents, or video names
 - creating derivative works, summaries, outlines or study guides of the content
 - building a third-party tool, app or integration on top of the service
 - sharing question-bank identifiers, question numbers or "test IDs" with others
 - automated access, scraping or data mining
 - use of the vendor's name or logo

**A3.** Do any of the five vendors publish their full video or chapter list publicly (a
syllabus, curriculum page, checklist, PDF or sitemap) that anyone can read without logging in?
Which, and where? If a vendor itself publishes the title list, that changes the risk of
republishing titles. Record the exact pages.

**A4.** Boards & Beyond specifically: it is the source of the outlines in `rapidref.json`.
What do its terms say about summaries, notes or outlines made from its videos, and about
sharing them? Does B&B publish official downloadable outlines, and under what terms?

**A5.** UWorld specifically: what do its terms say about question IDs, test IDs and question
numbers? Do any public sources (UWorld's own help pages, other open tools) publish or
reference UWorld question IDs openly? Has UWorld ever objected to such a list?

**A6.** Do any of the five vendors have a published **developer, API, affiliate or partner
program**, or a contact route for educational or non-profit tools? Give the page and the
named contact route (not a guess at an email address).

**A7.** Find real precedents: open-source projects, public spreadsheets, GitHub repos, or Anki
decks that publish title lists or structures of Boards & Beyond, Pathoma, Sketchy, Bootcamp or
UWorld. How long have they existed? Any known takedowns (DMCA notices, cease-and-desist)?
Search GitHub's public DMCA notices repository (`github/dmca`) for each vendor's name. Report
only what is publicly documented.

**A8.** US copyright background, with primary sources (statute, Supreme Court or circuit case,
Copyright Office circular): are titles, short phrases and factual metadata (names, durations)
protected? What does the law say about copyrightability of factual compilations
(for example *Feist Publications v. Rural Telephone*)? State the general rule and its
limits. Do not conclude on this project's facts.

**A9.** Contract versus copyright: if a student agreed to a vendor's terms to use the service,
can those terms restrict what they publish even where copyright would not? Cite the legal
principle and a reliable summary, and say what a lawyer should check.

---

## B. University ownership, policy and branding (highest priority)

Context: the author is an ECU medical student. Task 0.1 and 0.4 of the plan.

**B1.** Find ECU's published policy on intellectual property, copyright and inventions. Give the
URL, the policy number and the effective date. Quote the sections on (a) who owns works created
by students, (b) works created using university resources, and (c) disclosure obligations.

**B2.** Does the ECU policy distinguish students from employees (including student employees,
graduate assistants and research assistants)? Quote it.

**B3.** Does ECU or the UNC System publish a policy on open-source software releases by
students or faculty? Is there an approval or review step (technology transfer, a research
office, a general counsel)? Name the office and its public contact page.

**B4.** What does ECU publish about use of the university and school names, logos and
"Brody" in outside projects? Find the trademark or brand-use policy and quote the terms that
apply to a student-run project whose name contains "Brody." Is "Brody" a registered mark? Check
the USPTO trademark database and report what you find, with serial numbers.

**B5.** Does the Brody School of Medicine publish its course calendar, lecture schedule or
syllabus publicly, or only inside a login? Are there stated terms for how that material may be
reused or shared? (The tool encodes lecture titles and quiz dates.)

**B6.** Does ECU have an established process for a student project to be recognised,
sponsored or hosted (an innovation office, student-run-project registry, medical education
research office)? Describe the public steps and the named office.

**B7.** Does the Brody School of Medicine or ECU already offer, endorse or restrict a student
study-planning tool? Search for official statements, student handbook sections, and ECU
Academic Affairs or Student Affairs pages.

**B8.** Is there an LCME or AAMC statement relevant to student-created tools that use
curriculum content (for example, on sharing course materials outside the institution)? Report
only what is published.

---

## C. Student data, privacy and security

Context: the app stores emails and study activity in a Firebase project administered by one
student. Task 0.3, 1.9, 1.11.

**C1.** Does FERPA's definition of "education records" cover data a student-run tool holds
about other students' study behaviour, when that tool is not operated by the institution? Cite
the regulation (34 CFR Part 99) and the Department of Education's guidance. State what is
unclear.

**C2.** What does FERPA say about "school officials," "directory information," and a
third-party service acting for a school? Under what conditions would an app like this fall
under a school's FERPA obligations? Cite the guidance.

**C3.** Is a project like this likely to require IRB review, exemption or "not human subjects
research" determination if it collects no usage data but later publishes a descriptive
methods paper? What if it collects opt-in usage data? Cite the Common Rule (45 CFR 46) and the
relevant exempt categories, and find ECU's IRB page describing how to request a determination.

**C4.** What privacy laws apply to a US university tool used by students who may reside
in other states or countries? Cover at least: state student-privacy laws (North Carolina and any
others that commonly apply), COPPA (likely not, confirm), CCPA/CPRA thresholds, and GDPR if a
non-US school adopts it. State thresholds and why each does or does not apply.

**C5.** What are Google's terms for Firebase, specifically: who is the "controller" and
"processor" for end-user data, the Data Processing and Security Terms, and any restrictions on
collecting student or education data? Link the Firebase Terms and the Google Cloud DPA.

**C6.** Firebase security: what does Google's documentation say about (a) exposing the web API
key in client code, (b) Firebase App Check and how to enable it for a static site, and (c)
limits on abuse (quotas, rate limits, budget alerts and whether budget alerts can enforce a hard
stop)? Give links and the exact documented behaviour.

**C7.** Firestore limits and pricing: confirm the current 1 MiB document size limit, the free
tier (reads, writes, storage, per-day), and what happens when the free tier is exceeded. Give
the pricing page and read date. Estimate, with the arithmetic shown, the free-tier headroom for
a cohort of 150 students each pushing one document 100 times a day.

**C8.** What is the standard practice for letting a user delete their data from a Firebase
Authentication plus Firestore app (including a subcollection)? Cite Google's documentation for
deleting a user, the Delete User Data extension, and why client-side deletion of subcollections
is hard. Recommend nothing; describe the documented options.

**C9.** Are there documented security issues with Firestore security rules that match email
domains using `request.auth.token.email` (for example, unverified emails)? Does Firebase's
`email_verified` need to be checked? Cite the documentation and any known advisories.

---

## D. Accessibility and legal duties for a university tool

**D1.** What accessibility standard applies to a tool a US medical school asks students to use
(Section 504, ADA Title II including the 2024 DOJ rule, WCAG version and level, Section 508)?
Give the rule, the compliance date, and who it binds (institution versus a student project).

**D2.** If a school adopts this tool officially, does the school become responsible for its
accessibility? Cite guidance from the Department of Education Office for Civil Rights or DOJ.

**D3.** What are the practical WCAG 2.1/2.2 AA checks a single-file HTML app should pass first?
Cite the WCAG success criteria and recommend the free automated tools that are well regarded
(and their documented limits).

---

## E. Hosting, platform and licensing mechanics

**E1.** GitHub Pages: what are the current terms and limits (bandwidth, size, usage policy)?
Does GitHub prohibit or restrict anything relevant (commercial use, heavy traffic)? Does Pages
on a free account require a public repository today? Give the docs link and read date.

**E2.** What happens, step by step and according to GitHub's documentation, when a public
repository is made private, when history is rewritten, or when a repository has forks?
Specifically: are existing forks kept, and can sensitive data in history be removed? Cite
GitHub's guide on removing sensitive data and the forks documentation.

**E3.** What does GitHub's DMCA takedown process do to forks of a repository that is the
subject of a notice? Cite GitHub's DMCA policy.

**E4.** Compare MIT, Apache-2.0 and AGPL-3.0 for software that a university would adopt and
modify. What do university open-source offices recommend? Cite two or three university
open-source policy pages (for example, from tech-transfer offices) and report what they
say.

**E5.** Data licensing: how do Creative Commons licences (CC BY 4.0, CC BY-SA 4.0, CC0) treat
**facts and factual compilations**, where copyright may not apply but database rights may in
some jurisdictions? Cite Creative Commons' own FAQ and the EU database directive summary.
Recommend nothing; report the documented position.

**E6.** Is there a commonly used licence or convention for datasets that include references to
third-party products, with an explicit non-endorsement and "no rights granted in referenced
products" notice? Show two real repositories that do this and quote their wording.

**E7.** What is the recommended set of community-health files for an open-source project
(README, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, CITATION.cff, GOVERNANCE)? Cite
GitHub's community-standards documentation and one well-run small open-source project as an
example.

**E8.** Name availability: search for existing projects, products, domains and trademarks
that would collide with these candidate names (the author will supply them). Search the USPTO
database (education software, classes 9, 41, 42), GitHub, and the main domain registries.
Report collisions with links. Do not recommend a name.

---

## F. Prior art and existing tools

**F1.** What study-scheduling tools exist for medical students preparing for USMLE Step 1 and
for in-curriculum exams? Cover at least: Anki-based schedulers, Dr. Gray's/MedSchoolAnalytics,
Boards & Beyond's own study planner, UWorld's own study planner, AMBOSS study plans, Osmosis,
Lecturio, Sketchy, Bootcamp's planner, and any open-source projects. For each: what it maps
(curriculum or general), whether it is free, and whether it ties to a specific school's
calendar.

**F2.** Do any tools or published projects map a **school's own curriculum** to third-party
board-prep resources? Search PubMed, Google Scholar, MedEdPORTAL and GitHub. List them with a
one-line description.

**F3.** Do any medical schools publish official "resource maps" or crosswalks between their
curriculum and commercial resources (for example, a spreadsheet of "which B&B videos match this
block")? Find examples. How are they licensed, maintained and shared?

**F4.** What open-source educational projects have successfully been adopted across multiple
institutions in medicine or higher education (examples: Moodle, OpenStax, Open edX, Anki,
MedEdPORTAL, the AAMC's MedEdPORTAL, ReactionMD)? For two or three of them, how did they
organise governance and funding in their first three years?

**F5.** Is there published evidence on whether study-planning or spaced-scheduling tools
improve medical-student exam performance or wellbeing? Summarise the best two or three studies
(design, sample, result, limits). State plainly if the evidence is weak.

---

## G. Medical-education context

**G1.** Step 1 became pass/fail (reporting began January 2022). What does published evidence say
about how this changed how students use commercial resources and question banks? Cite studies
or surveys from 2022 to 2026.

**G2.** What published data exists on the use of commercial resources (Boards & Beyond, UWorld,
Bootcamp, Sketchy, Pathoma, Anki) by US medical students, including share of students using
each? Cite the AAMC Graduation Questionnaire and any peer-reviewed surveys.

**G3.** How do US medical schools typically structure the pre-clinical year (block versus
system-based versus integrated)? Is a "4 week block with quizzes and a block exam" structure
common enough that a tool built around it generalises? Cite AAMC Curriculum Inventory data if
available.

**G4.** Are there published concerns about students using commercial resources in place of
school curriculum (equity, cost, institutional endorsement)? Cite sources.

**G5.** Does any medical school or national body officially endorse particular third-party
resources for their students, or provide licences? (This affects whether a school will want a
tool that maps to resources it already pays for.) Find examples of institutional licences for
B&B, UWorld, Bootcamp, Sketchy.

---

## H. Publishing and the research layer

**H1.** Which journals and venues publish medical-education innovation reports or tool
descriptions? Give submission requirements for at least: MedEdPORTAL, Academic Medicine
(Innovation Reports), Medical Teacher, BMC Medical Education, Journal of Medical Internet
Research (JMIR Medical Education), and Perspectives on Medical Education. For each: article
type that fits, word limit, whether open access, any fee.

**H2.** What reporting guidelines apply to a description of an educational tool without an
outcome study (for example, SQUIRE-EDU, GREET, or a software-description checklist)? Cite them.

**H3.** What do those venues require for authorship (ICMJE criteria), AI-assistance
disclosure, and conflict-of-interest statements, given this project used an AI coding
assistant? Quote the current policies.

**H4.** Software citation: what is the standard way to make software citable (CITATION.cff,
Zenodo DOI via GitHub release)? Describe the exact steps from the official documentation.

**H5.** For a methods paper describing how a curriculum mapping was built and verified, what
would reviewers expect to see (inter-rater agreement of mappings, validation against an
external reference, time-and-effort data)? Look for examples of published curriculum-mapping
methods and report their evaluation approaches.

---

## I. Funding and sustainability

**I1.** What grants, awards and innovation funds are available to fund a student-initiated
open-source medical-education tool? Check at least: AAMC awards, AMA Accelerating Change in
Medical Education, Josiah Macy Jr. Foundation, Gold Foundation, university innovation funds,
and GitHub Sponsors/Open Source programs. For each: eligibility (can a student apply?),
amount, deadline cycle, link.

**I2.** Are there fiscal-sponsor organisations that host small open-source projects (Open
Source Collective, Software Freedom Conservancy, NumFOCUS, others)? What are their eligibility
requirements, fees and expectations?

**I3.** What have comparable small open-source education tools reported as their annual
running costs and maintenance load? Find two or three public examples.

**I4.** Do any vendors sponsor open educational tools, and what conflict-of-interest guidance
exists on accepting vendor sponsorship for a tool that schedules vendors' content?

---

## J. Adoption and demand

**J1.** What do medical-school IT, curriculum and educational-technology offices typically
require before they adopt a student-built tool (security review, accessibility review, data
agreement, SSO)? Find two or three published procurement or vendor-assessment checklists from
universities (for example, a "HECVAT" and a university's own third-party risk process) and list
their requirements.

**J2.** What is the HECVAT, and what would a small open-source tool need to answer? Link the
current version and summarise the section headings.

**J3.** Do medical schools commonly use Microsoft or Google single sign-on, and what would it
take for an adopting school to restrict sign-in to institutional accounts reliably (as opposed
to an email-domain check)? Cite Firebase / Google Identity Platform documentation on SAML/OIDC
providers and tenant restrictions, including cost.

**J4.** Are there student-run or faculty-run medical-education communities where this tool
would plausibly be shared and evaluated (AAMC groups, AMSA, SNMA chapters, society
newsletters)? List them with a public contact page. Do not contact anyone.

---

## Priority and order

| Priority | Sections | Why first |
|---|---|---|
| 1 | **A, B** | Their answers can change which files the public repo contains and whether the project may be released at all |
| 2 | **C, E1–E3** | Safety of student data and the mechanics of making the repo public |
| 3 | **E4–E8, D** | Licence, naming and accessibility decisions |
| 4 | **F, G** | Positioning and prior art, needed for any paper |
| 5 | **H, I, J** | Publication, funding and adoption planning |

**The five questions whose answers are most likely to change the plan:** A2, A5, B1, B4, E1.

## What the agent cannot answer, and a human must

These need a person, not a search:

- Ownership of the work (ECU's general counsel or research office).
- Whether any vendor will give permission (an email from the author).
- Whether a lawyer agrees with any reading of terms or copyright.
- Whether the Brody School wants to be associated with an open release.
- Whether a second school actually wants this. Ask two peers before any Stage 1 work.

---

*Prepared 2026-10-19 to accompany `docs/OPEN-RESOURCE-PLAN.md`. Every question traces to a
**[VERIFY]** or unknown named in that plan or in `docs/BLUEPRINT.md` §A.5.*
