# tools/

Developer files. **Nothing in here is part of the site** — no page loads it, and
deleting the whole folder would not change what a student sees at brodymode.com.

Two kinds of thing live here.

## Checks (`checks/`)

Scripts that open BRODY MODE in a real browser, click through it, and assert that
things still work. They exist because the app is one 5,000-line file with no
framework: a change to the scheduler can quietly break the Stats tab, and nothing
would notice until a student did.

Each check is a numbered file covering one feature, and each assertion is written
as a sentence about behaviour rather than about code — so a failure reads as
"studying ahead no longer moves the finish date", not "expected 3 to equal 4".

```bash
cd tools
npm install       # first time only
npm run check     # run everything
node checks/C63_uworld.mjs   # or just one
```

Exits non-zero if anything fails, so it can gate a release.

### Why the numbers skip

Checks were numbered from C1 as they were written. Everything before C56 was lost:
they used to live in a scratch directory outside the repository, which the build
environment wipes periodically. It happened twice in one day. **That is why this
folder exists** — so the checks survive.

Rebuilt or new checks should keep counting up rather than reusing a dead number,
so a reference to "C45" in an old commit message stays unambiguous even though the
file is gone.

### Writing one

`harness.mjs` handles the repetitive part — serving the repo the way GitHub Pages
does, launching a browser, collecting uncaught errors, and tallying results:

```js
import { openApp, checker } from '../harness.mjs';
const { page, errors, close } = await openApp();
const { chk, report } = checker('What this file covers');

chk('a description of the behaviour', someCondition, 'numbers explaining a failure');

await close();
process.exit(report() ? 1 : 0);
```

Two habits worth keeping:

- **Put the numbers in the failure detail.** The third argument only prints when a
  check fails, and it should carry enough to diagnose without re-running.
- **Check that the check can fail.** Break the code deliberately and confirm the
  check goes red. A check that passes against a broken app is worse than no check,
  because it is believed.

Browser: Playwright's own Chromium after `npm install`. Set `PLAYWRIGHT_CHROMIUM`
to override, which some CI images need.

## Generators (`generators/`)

Scripts that build the JSON data files from source material, rather than the files
being hand-edited. The point is that they **validate before writing** and refuse to
emit something half-right.

Each generator's header says where its data came from and what it refuses. They are
idempotent: re-running with unchanged input reproduces the shipped files byte for byte,
so it is safe to run one just to confirm the data still validates. (`mk_pharm.js`, which
built Rapid Reference's pharm section, went with that tab in October 2026; it is in the
git history.)

The generators for some older content — the M3 algorithms, the first Brody course
blocks — were lost in the same wipe described above. The data they
produced is committed and fine; only the scripts that built it are gone. If any of
that content needs regenerating, the generator has to be rewritten first.
