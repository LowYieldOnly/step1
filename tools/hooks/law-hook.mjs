/* Claude Code hooks that keep the #1 law in front of every session (.claude/settings.json).
 *
 *   session  SessionStart: states the law verbatim, the deploy rule, and runs the audit, so
 *            every session — and every session after a compaction — starts knowing both.
 *   post     PostToolUse: if index.html, the catalog, coverage, the declarations or a
 *            generator changed since the last audit, re-runs it and feeds the result back.
 *            Silent when nothing relevant changed, so it costs nothing on ordinary edits.
 *
 * State (a signature of the watched files and the last result) lives in .git/, never
 * committed. The audit itself is tools/law.mjs; this file only decides when to run it.
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const STATE = path.join(REPO, '.git', 'law-hook-state.json');
const mode = process.argv[2];

const LAW = 'THE #1 LAW (Dylan, verbatim): "Always remember that our #1 law is to make sure every brody lecture is mapped to third party, and that the sum total videos within a resource are watched in that specific system even if brody does not cover that topic."';
// Dylan, 2026-10-22: "don't deploy a new plan/plan update without my approval".
const DEPLOY = 'THE DEPLOY RULE (Dylan): never deploy a new plan or a plan update — no PR merge to main, no Pages deploy — without Dylan\'s explicit approval of that specific deploy. Committing and pushing to the working branch is fine; going live is his call, every time.';

function signature() {
  const files = ['index.html', 'catalog.json', 'coverage.json', 'tools/law-homes.js', 'tools/law.mjs'];
  const walk = d => fs.readdirSync(path.join(REPO, d), { withFileTypes: true }).forEach(e => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else files.push(p);
  });
  walk('tools/generators');
  return files.map(f => { try { const s = fs.statSync(path.join(REPO, f)); return f + ':' + s.size + ':' + s.mtimeMs; } catch { return f + ':-'; } }).join('|');
}
const audit = () => {
  const r = spawnSync(process.execPath, [path.join(REPO, 'tools/law.mjs'), '--brief'], { encoding: 'utf8', cwd: REPO });
  return { ok: r.status === 0, out: (r.stdout + r.stderr).trim() };
};
const readState = () => { try { return JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch { return {}; } };
const writeState = s => { try { fs.writeFileSync(STATE, JSON.stringify(s)); } catch { /* .git missing: run every time */ } };

if (mode === 'session') {
  const a = audit();
  writeState({ sig: signature(), ok: a.ok, out: a.out });
  console.log(LAW + '\n\nIt is non-negotiable: when a lecture or a resource system has no home, fix it — do not ask whether to. Run `node tools/law.mjs` for the full audit.\n\n'
    + DEPLOY + '\n\n' + a.out);
  process.exit(0);
}

if (mode === 'post') {
  const st = readState(), sig = signature();
  if (st.sig === sig) process.exit(0);                       // nothing the law depends on changed
  const a = audit();
  writeState({ sig, ok: a.ok, out: a.out });
  const changed = a.out !== st.out;
  if (!a.ok || (changed && st.ok === false)) {               // failures, or a failing audit now passing
    console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse',
      additionalContext: 'Law audit re-ran after a change to unit data, the catalog or a generator:\n' + a.out } }));
  }
  process.exit(0);
}

console.error('usage: law-hook.mjs session|post');
process.exit(2);
