# Rebuilding BRODY MODE

This kit was made on **{{DATE}}** (UTC). It holds everything in the repository, which is
everything needed to put brodymode.com back exactly as it was that day.

| In the kit | What it is |
|---|---|
| `site/` | The live site, file for file ({{FILES}} files): the `main` branch at `{{MAIN}}`, exactly what GitHub Pages serves. |
| `brodymode.bundle` | The whole git repository: every branch, with full history, including work not yet live. |
| `MANIFEST.txt` | SHA-256 checksums for everything above. |

**Not in the kit:** students' progress and plans. Those live in Firebase (project
`step1-command-center`), not in the repository. See step 3 for how to keep a copy.

## 1. Get the repository back

```bash
git clone brodymode.bundle brodymode       # every branch comes with it
cd brodymode
git branch -a                              # main is the live site
```

To put it on GitHub again, create an empty repository, then:

```bash
git remote set-url origin https://github.com/<owner>/<repo>.git
git push origin --all
```

## 2. Put the site back online

The site is static: `index.html`, `catalog.json` and the other data files, `sw.js`, and the
icons. It needs no build step. The `site/` folder can be served as-is by any static host.

On GitHub Pages:
1. Repository **Settings → Pages → Build and deployment**: Deploy from a branch, `main`, `/ (root)`.
2. The `CNAME` file already says `brodymode.com`. Enter the same domain under **Custom domain**
   and tick **Enforce HTTPS** once the certificate is issued.
3. At the domain's DNS provider, point `brodymode.com` at GitHub Pages: A records
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`.

## 3. Sign-in and sync (Firebase)

The Firebase settings are `FB_CONFIG` in `index.html`. Who may sign in is `ACCESS_DOMAINS` and
`ACCESS_EMAILS` in `index.html`, and the same list in `firestore.rules`.

- **If the Firebase project still exists,** there is nothing to do. The restored site
  connects to it, and every student's progress is still there.
- **If it is gone:** create a new Firebase project. Turn on Authentication (Google, plus
  Anonymous), create a Firestore database, and add `brodymode.com` to Authentication's
  authorized domains. Paste the new project's web config into `FB_CONFIG`, then publish the
  rules with `firebase deploy --only firestore:rules`, or paste `firestore.rules` into
  **Firestore → Rules**. Students start fresh unless their data was exported (below).
- **To keep a copy of students' data,** use Firebase's managed export. In the Google Cloud
  console, open Firestore → Import/Export and export to a Cloud Storage bucket. This kit
  can't do that by itself, because it has no Firebase credentials.

## 4. Check that it all works

```bash
cd tools
npm ci
npx playwright install chromium
node run-checks.mjs          # every check file should pass
```

## 5. Carrying on the work

These are the files that hold everything someone (or Claude) needs to pick the work back up:

- `tools/README.md`: how the checks and generators work.
- `tools/generators/`: every unit, mapping and catalog correction is generated here from
  the data in `tools/generators/data/`. Each generator's header explains where its data
  came from and the rules it enforces. Re-running one is safe.
- `docs/`: plans and write-ups. On the working branches, `docs/UNIFIED-HUB-PLAN.md` holds the
  M1 plan.
- `tools/law-homes.js` and `tools/law.mjs` (on the working branch until they go live):
  the #1-law audit.

### The standing rules

> **The #1 law:** "Always remember that our #1 law is to make sure every brody lecture is
> mapped to third party, and that the sum total videos within a resource are watched in
> that specific system even if brody does not cover that topic."

> **The deploy rule:** "don't deploy a new plan/plan update without my approval". Nothing
> merges to `main` (which is what goes live) without Dylan's explicit approval of that
> specific deploy.

## The branches on {{DATE}}

| Branch | Last change | Latest commit |
|---|---|---|
{{BRANCHES}}

`main` is the live site. The others are work in progress. A `claude/…` branch is where
unreleased work waits until it is approved to go live.
