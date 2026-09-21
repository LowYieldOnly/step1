/* Print a Brody block's third-party resource mapping as a PDF.
 *
 * The numbers are not re-derived here. The script opens the real app, calls the
 * real auditBlock() on the real catalog, and lays out whatever comes back — so the
 * document says what the scheduler actually does, and cannot drift from it. Change
 * the map in index.html, re-run this, and the PDF follows.
 *
 * The one thing it adds on top of the audit screen is runtime: the screen lists
 * titles, a document that goes to a course director needs hours.
 *
 *   node tools/generators/mk_mapping_pdf.mjs [blockId] [outPath]
 *
 * Defaults to the neuro-sensory block, written next to the repo.
 */
import fs from 'fs';
import path from 'path';
import { openApp, REPO } from '../harness.mjs';

const BLOCK = process.argv[2] || 'neuro-sensory';
const OUT = path.resolve(process.argv[3] || path.join(REPO, 'brody-mapping-' + BLOCK + '.pdf'));

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
const hrs = m => (Math.round(m / 60 * 10) / 10).toFixed(1);
const longDate = iso => {
  const [y, mo, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, mo - 1, d)).toLocaleDateString('en-US',
    { weekday:'long', month:'long', day:'numeric', year:'numeric', timeZone:'UTC' });
};

/* ---- 1. pull the mapping out of the app ---------------------------------- */
async function extract(page, id) {
  return page.evaluate(blockId => {
    const blk = BRODY_BLOCKS.find(b => b.id === blockId);
    if (!blk) throw new Error('no block "' + blockId + '" — have: ' + BRODY_BLOCKS.map(b => b.id).join(', '));
    const a = auditBlock(blk);
    const min = {};
    catVideos().forEach(v => { min[brodyKey(v)] = v.min; });
    const mOf = v => min[v.res + '|' + v.sys + '|' + (v.cat || '') + '|' + v.name] || 0;

    const resTot = {};
    const weeks = a.weeks.map(w => {
      const byRes = {};
      w.vids.forEach(v => { (byRes[v.res] = byRes[v.res] || []).push(v); });
      const groups = RES_ORDER.filter(r => byRes[r]).map(r => {
        const byCat = {}, order = [];
        byRes[r].forEach(v => { const c = v.cat || ''; if (!byCat[c]) { byCat[c] = []; order.push(c); } byCat[c].push(v); });
        const m = byRes[r].reduce((s, v) => s + mOf(v), 0);
        resTot[r] = resTot[r] || { n:0, min:0 };
        resTot[r].n += byRes[r].length; resTot[r].min += m;
        // the app's own short code for the resource, so the badge here reads the
        // same as the badge on screen ("B&B", "Pa", "SkP", "BC")
        const badge = resBadge(r).replace(/<[^>]*>/g, '').trim();
        return { res:r, label:resLabel(r), badge, n:byRes[r].length, min:m,
          cats: order.map(c => ({ cat:c, vids: byCat[c].map(v => ({ name:v.name, min:mOf(v), exp:v.exp })) })) };
      });
      // lectures keep the order they were transcribed in, grouped by discipline
      const dOrder = [], byDisc = {};
      (w.lectures || []).forEach(l => { const d = l.disc || ''; if (!byDisc[d]) { byDisc[d] = []; dOrder.push(d); } byDisc[d].push(l.title || ''); });
      return { n:w.n, label:w.label, start:w.start, n_vids:w.vids.length,
        min: groups.reduce((s, g) => s + g.min, 0),
        discs: dOrder.map(d => ({ disc:d, titles:byDisc[d] })), groups };
    });

    return {
      id: blk.id, name: blk.name, systems: blk.systems.slice(),
      shelf: blk.shelf, checkpoints: (blk.checkpoints || []).slice(),
      include: (blk.include || []).slice(), exclude: (blk.exclude || []).slice(),
      build: (typeof BUILD !== 'undefined' ? BUILD : ''),
      catalogCount: catVideos().length,
      total: a.total, totalMin: weeks.reduce((s, w) => s + w.min, 0),
      // written resources have no runtime, so they are counted apart from the video total
      nArts: weeks.reduce((s, w) => s + w.groups.filter(g => g.res === 'uwlib').reduce((t, g) => t + g.n, 0), 0),
      resTotals: RES_ORDER.filter(r => resTot[r]).map(r => ({ res:r, label:resLabel(r), n:resTot[r].n, min:resTot[r].min })),
      unmapped: a.unmapped, orphans: a.orphans, bcOrphans: a.bcOrphans,
      weeks,
    };
  }, id);
}

/* ---- 2. lay it out ------------------------------------------------------- */
const CSS = `
@page{size:letter;margin:16mm 14mm 18mm}
*{box-sizing:border-box}
body{margin:0;font:10.5pt/1.45 "Helvetica Neue",Helvetica,Arial,sans-serif;color:#15181d;-webkit-print-color-adjust:exact;print-color-adjust:exact}
h1{font-size:20pt;line-height:1.15;margin:0 0 2mm;letter-spacing:-.2pt}
h2{font-size:13pt;margin:0 0 1mm}
.eyebrow{font-size:8pt;letter-spacing:1.4pt;text-transform:uppercase;color:#6b7280;margin:0 0 3mm}
.sub{color:#4b5563;margin:0 0 6mm;font-size:10pt}
.rule{border:0;border-top:1.5pt solid #15181d;margin:0 0 5mm}
.meta{display:grid;grid-template-columns:1fr 1fr;gap:2mm 8mm;margin:0 0 6mm}
.meta div{font-size:9.5pt}
.meta b{display:block;font-size:7.5pt;letter-spacing:.9pt;text-transform:uppercase;color:#6b7280;font-weight:600;margin-bottom:.5mm}
.note{background:#f4f6f8;border-left:3pt solid #9aa4b2;padding:3mm 4mm;font-size:9pt;color:#374151;margin:0 0 6mm;line-height:1.5}
.note p{margin:0 0 2mm}.note p:last-child{margin:0}
table{width:100%;border-collapse:collapse;font-size:9.5pt;margin:0 0 6mm}
th{text-align:left;font-size:7.5pt;letter-spacing:.8pt;text-transform:uppercase;color:#6b7280;border-bottom:1pt solid #c7ccd4;padding:0 0 1.5mm}
td{padding:1.6mm 0;border-bottom:.5pt solid #e5e7eb;vertical-align:top}
td.num,th.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
tr.tot td{border-bottom:0;border-top:1pt solid #15181d;font-weight:700}
.wk{break-inside:auto;margin:0 0 7mm}
.wkhd{break-after:avoid;border-top:1.5pt solid #15181d;padding:2mm 0 2mm;display:flex;align-items:baseline;gap:3mm}
.wkn{font-size:8pt;letter-spacing:1.2pt;text-transform:uppercase;color:#fff;background:#15181d;padding:1mm 2.2mm;border-radius:2pt;font-weight:700}
.wklab{font-size:12.5pt;font-weight:700;flex:1}
.wkct{font-size:9pt;color:#6b7280;white-space:nowrap;font-variant-numeric:tabular-nums}
.lects{background:#f4f6f8;border-radius:2pt;padding:3mm 4mm;margin:0 0 4mm;break-inside:avoid}
.lecthd{font-size:7.5pt;letter-spacing:.9pt;text-transform:uppercase;color:#6b7280;font-weight:600;margin:0 0 2mm}
.lgrp{display:grid;grid-template-columns:32mm 1fr;gap:1mm 3mm;margin:0 0 1.5mm}
.lgrp:last-child{margin:0}
.ldisc{font-size:8.5pt;font-weight:700;color:#374151}
.ltitle{font-size:9.5pt;margin:0 0 .6mm}
/* A resource group can be hundreds of videos long, so it must be allowed to run
   over a page break — pinning it whole would leave half-empty pages. What is
   pinned is smaller: a heading never strands at the foot of a page or column,
   and a category never splits down the middle. */
.grp{margin:0 0 3.5mm}
.grphd{display:flex;align-items:baseline;gap:2mm;border-bottom:.75pt solid #c7ccd4;padding:0 0 1mm;margin:0 0 1.5mm;break-after:avoid}
.cols{column-count:2;column-gap:7mm}
.badge{font-size:7.5pt;font-weight:700;color:#fff;background:#15181d;padding:.7mm 1.6mm;border-radius:2pt;letter-spacing:.3pt}
.grpnm{font-size:10pt;font-weight:700;flex:1}
.grpct{font-size:8.5pt;color:#6b7280;font-variant-numeric:tabular-nums;white-space:nowrap}
.cat{margin:0 0 2mm;break-inside:avoid}
.catnm{font-size:8.5pt;font-weight:700;color:#4b5563;margin:0 0 .6mm;break-after:avoid}
.v{display:flex;gap:2mm;font-size:9.5pt;padding:.35mm 0}
.v .t{flex:1}
.v .m{color:#6b7280;font-variant-numeric:tabular-nums;white-space:nowrap}
.def{background:#fff4d6;padding:0 1mm;border-radius:1.5pt}
.deftag{font-size:7pt;text-transform:uppercase;letter-spacing:.6pt;color:#8a6100;font-weight:700}
.flag{border:1pt solid #c7ccd4;border-radius:2pt;padding:3mm 4mm;margin:0 0 5mm;break-inside:avoid}
.flaghd{font-size:9pt;font-weight:700;margin:0 0 1.5mm}
.ok{background:#eef7ef;border-color:#a9cdb0}
.warn{background:#fff4d6;border-color:#e0c37a}
.mono{font-family:"SF Mono",Menlo,Consolas,monospace;font-size:8.5pt}
.foot{border-top:.75pt solid #c7ccd4;padding-top:2.5mm;font-size:8pt;color:#6b7280;line-height:1.5}
`;

function render(d) {
  const P = [];
  const sysList = d.systems.join(', ');
  const issues = d.unmapped.length + d.orphans.length + d.bcOrphans.length;

  P.push(`<!doctype html><meta charset="utf-8"><title>Brody mapping — ${esc(d.name)}</title><style>${CSS}</style><body>`);

  P.push(`<p class="eyebrow">BRODY MODE · Third-party resource mapping</p>`);
  P.push(`<h1>${esc(d.name)}</h1>`);
  P.push(`<p class="sub">Every third-party ${d.nArts ? 'video and article' : 'video'} the schedule assigns in this unit, and the Brody week it is assigned to.</p>`);
  P.push(`<hr class="rule">`);

  P.push(`<div class="meta">
    <div><b>Course systems</b>${esc(sysList)}</div>
    <div><b>Unit runs</b>${esc(longDate(d.weeks[0].start))} → ${esc(longDate(d.shelf))}</div>
    <div><b>Total assigned</b>${d.nArts ? `${d.total - d.nArts} videos (${hrs(d.totalMin)} h) + ${d.nArts} articles` : `${d.total} videos · ${hrs(d.totalMin)} h`}</div>
    <div><b>Quizzes / checkpoints</b>${d.checkpoints.length ? d.checkpoints.map(longDate).map(esc).join(' · ') : '—'}</div>
  </div>`);

  P.push(`<div class="note">
    <p><b>How to read this.</b> The unit is divided into Brody content weeks. Each week lists the course's own lecture topics for that week, then every third-party video mapped to it, grouped by resource. The scheduler's rule is that a week's videos are finished within that week, before that week's quiz — so this table is also the deadline structure.</p>
    <p>Runtimes are the publishers' own. Hours are video time only: they exclude question banks, Anki and review.${d.nArts ? ` The ${d.nArts} UWorld Library articles are written material with no runtime, so they carry no hours and are scheduled by a separate count per day rather than by time.` : ''}</p>
    ${issues ? `<p><b>${issues}</b> item${issues === 1 ? '' : 's'} need attention — flagged at the end of this document.</p>`
             : `<p>Every video in this unit is explicitly mapped to a week, and every mapping points at a video that exists in the catalog. Nothing fell through to a default.</p>`}
  </div>`);

  /* summary tables */
  P.push(`<h2>By week</h2><table><thead><tr><th>Week</th><th>Content</th><th>Starts</th><th class="num">${d.nArts ? 'Items' : 'Videos'}</th><th class="num">Hours</th></tr></thead><tbody>`);
  d.weeks.forEach(w => P.push(`<tr><td>${w.n}</td><td>${esc(w.label)}</td><td>${esc(longDate(w.start))}</td><td class="num">${w.n_vids}</td><td class="num">${hrs(w.min)}</td></tr>`));
  P.push(`<tr class="tot"><td colspan="3">Total</td><td class="num">${d.total}</td><td class="num">${hrs(d.totalMin)}</td></tr></tbody></table>`);

  P.push(`<h2>By resource</h2><table><thead><tr><th>Resource</th><th class="num">Items</th><th class="num">Hours</th><th class="num">Share of hours</th></tr></thead><tbody>`);
  d.resTotals.forEach(r => P.push(`<tr><td>${esc(r.label)}</td><td class="num">${r.n}</td><td class="num">${r.min > 0 ? hrs(r.min) : 'no runtime'}</td><td class="num">${r.min > 0 && d.totalMin ? Math.round(r.min / d.totalMin * 100) + '%' : '—'}</td></tr>`));
  P.push(`<tr class="tot"><td>Total</td><td class="num">${d.total}</td><td class="num">${hrs(d.totalMin)}</td><td class="num">100%</td></tr></tbody></table>`);

  /* week by week */
  d.weeks.forEach(w => {
    P.push(`<div class="wk"><div class="wkhd"><span class="wkn">Week ${w.n}</span><span class="wklab">${esc(w.label)}</span><span class="wkct">${w.n_vids} ${d.nArts ? 'items' : 'videos'} · ${hrs(w.min)} h</span></div>`);
    P.push(`<div class="lects"><div class="lecthd">Brody lecture topics · week of ${esc(longDate(w.start))}</div>`);
    if (w.discs.length) w.discs.forEach(g => P.push(
      `<div class="lgrp"><div class="ldisc">${esc(g.disc)}</div><div>${g.titles.map(t => `<div class="ltitle">${esc(t)}</div>`).join('')}</div></div>`));
    else P.push(`<div class="ltitle">Not entered.</div>`);
    P.push(`</div>`);

    w.groups.forEach(g => {
      P.push(`<div class="grp"><div class="grphd"><span class="badge">${esc(g.badge)}</span><span class="grpnm">${esc(g.label)}</span><span class="grpct">${g.n} · ${hrs(g.min)} h</span></div>`);
      P.push(`<div class="cols">`);
      g.cats.forEach(c => {
        P.push(`<div class="cat">`);
        if (c.cat) P.push(`<div class="catnm">${esc(c.cat)}</div>`);
        // written resources have no runtime — show nothing rather than "0m"
        c.vids.forEach(v => P.push(`<div class="v"><span class="t${v.exp ? '' : ' def'}">${esc(v.name)}${v.exp ? '' : ' <span class="deftag">defaulted</span>'}</span><span class="m">${v.min > 0 ? v.min + 'm' : '—'}</span></div>`));
        P.push(`</div>`);
      });
      P.push(`</div></div>`);
    });
    P.push(`</div>`);
  });

  /* flags */
  if (issues) {
    if (d.unmapped.length) P.push(`<div class="flag warn"><div class="flaghd">Not mapped to a week — the scheduler put them in the last week (${d.unmapped.length})</div>`
      + d.unmapped.map(v => `<div class="v"><span class="t">${esc(v.sys)} · ${esc(v.cat)} · ${esc(v.name)}</span></div>`).join('') + `</div>`);
    if (d.orphans.length) P.push(`<div class="flag warn"><div class="flaghd">Mapped, but the video is no longer in the catalog (${d.orphans.length})</div>`
      + d.orphans.map(k => `<div class="mono">${esc(k)}</div>`).join('') + `</div>`);
    if (d.bcOrphans.length) P.push(`<div class="flag warn"><div class="flaghd">Mapped Bootcamp sections that no longer exist (${d.bcOrphans.length})</div>`
      + d.bcOrphans.map(k => `<div class="mono">${esc(k)}</div>`).join('') + `</div>`);
  } else {
    P.push(`<div class="flag ok"><div class="flaghd">Mapping check: clean</div>All ${d.total} videos are explicitly mapped to a week, and all ${d.total} mappings point at videos that exist in the catalog.</div>`);
  }

  P.push(`<div class="foot">
    Generated ${esc(new Date().toISOString().slice(0, 10))} from BRODY MODE build ${esc(d.build)} against a catalog of ${d.catalogCount} videos.
    Block id <span class="mono">${esc(d.id)}</span>. Produced by <span class="mono">tools/generators/mk_mapping_pdf.mjs</span>, which reads the mapping out of the running app rather than restating it, so this document and the schedule students see cannot disagree.
    ${d.include.length ? `<br>Pulled in from outside the unit's systems by an explicit include: ${d.include.map(k => esc(k.split('|').slice(1).join(' · '))).join('; ')}. ` : ''}${d.exclude.length ? `Excluded by name: ${d.exclude.map(k => esc(k.split('|').slice(1).join(' · '))).join('; ')}. ` : ''}
    <br>Resource titles and runtimes belong to their publishers and are listed for scheduling reference only.
  </div>`);

  return P.join('\n');
}

/* ---- 3. print ------------------------------------------------------------ */
const app = await openApp();
try {
  if (app.errors.length) throw new Error('the app threw on load: ' + app.errors[0]);
  const data = await extract(app.page, BLOCK);
  const html = render(data);
  const tmp = path.join(path.dirname(OUT), '.mapping-' + BLOCK + '.html');
  fs.writeFileSync(tmp, html);
  const p = await app.ctx.newPage();
  await p.goto('file://' + tmp);
  await p.emulateMedia({ media: 'print' });
  await p.pdf({
    path: OUT, format: 'Letter', printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div style="font:7pt Helvetica,Arial;color:#9aa4b2;width:100%;padding:0 14mm;">'
      + '<span style="float:left">BRODY MODE · ' + esc(data.name) + ' · third-party resource mapping</span></div>',
    footerTemplate: '<div style="font:7pt Helvetica,Arial;color:#9aa4b2;width:100%;padding:0 14mm;">'
      + '<span style="float:right">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>',
    margin: { top:'18mm', bottom:'16mm', left:'14mm', right:'14mm' },
  });
  fs.unlinkSync(tmp);
  const kb = Math.round(fs.statSync(OUT).size / 1024);
  console.log('wrote ' + OUT + '  (' + kb + ' KB)');
  console.log('  ' + data.name + ': ' + (data.total - data.nArts) + ' videos (' + hrs(data.totalMin) + ' h)' + (data.nArts ? ' + ' + data.nArts + ' articles' : '') + ' across ' + data.weeks.length + ' weeks');
  data.resTotals.forEach(r => console.log('    ' + String(r.n).padStart(4) + '  ' + (r.min > 0 ? hrs(r.min).padStart(5) + ' h' : '     —') + '  ' + r.label));
  const issues = data.unmapped.length + data.orphans.length + data.bcOrphans.length;
  console.log('  ' + (issues ? '⚠ ' + issues + ' flagged item(s)' : 'mapping clean — nothing defaulted, nothing orphaned'));
} finally {
  await app.close();
}
