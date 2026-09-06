/* Run every check in checks/ and summarise. Exits non-zero if any check fails,
   so this can gate a release without anyone reading the output. */
import { readdirSync } from 'fs';
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'checks');
const files = readdirSync(dir).filter(f => f.endsWith('.mjs')).sort();
if (!files.length) { console.log('No checks found in tools/checks/.'); process.exit(0); }

let failed = 0;
for (const f of files) {
  console.log('\n──────── ' + f + ' ────────');
  const r = spawnSync(process.execPath, [path.join(dir, f)], { stdio: 'inherit' });
  if (r.status !== 0) failed++;
}
console.log('\n════════');
console.log(failed ? (failed + ' of ' + files.length + ' check files FAILED') : ('all ' + files.length + ' check files passed'));
process.exit(failed ? 1 : 0);
