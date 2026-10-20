/* The signature of a unit's content map: a hash of everything a content-map PDF says.
 *
 * mk_mapping_pdf.mjs stamps it beside the PDF it publishes (content-maps/<id>.json); the
 * C66 check recomputes it and fails if they differ — i.e. if the mapping, the lecture
 * coverage, or any catalog entry the map lists has changed since the PDF was printed.
 * One function, used by both, so the two can't disagree about what "changed" means.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export function mapSignature(repo, unitId) {
  const app = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const names = app.match(/const BRODY_BLOCKS=\[([^\]]*)\];/)[1].split(',').map(s => s.trim());
  const blk = names.map(n => JSON.parse(app.match(new RegExp('\\nconst ' + n + '=(.*?);\\n'))[1])).find(b => b.id === unitId);
  if (!blk) throw new Error('no unit ' + unitId);
  const covFile = path.join(repo, 'coverage.json');
  const cov = fs.existsSync(covFile) ? (JSON.parse(fs.readFileSync(covFile, 'utf8')).units || {})[unitId] || null : null;
  const K = v => v.res + '|' + v.sys + '|' + (v.cat || '') + '|' + v.name;
  const named = new Set([...(blk.include || []), ...Object.keys(blk.videoWeek || {}), ...Object.keys(blk.artWeek || {})]);
  const items = JSON.parse(fs.readFileSync(path.join(repo, 'catalog.json'), 'utf8')).videos
    .filter(v => blk.systems.includes(v.sys) || named.has(K(v)))
    .map(v => K(v) + '|' + v.min);
  return crypto.createHash('sha256').update(JSON.stringify([blk, cov, items])).digest('hex').slice(0, 16);
}
