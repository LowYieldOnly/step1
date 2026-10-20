/* C66 · The content map, on the site and as a document.
 *
 *   1. The Content Audit shows lecture coverage for a unit that has it: every lecture with
 *      its status, the gaps listed up front, and a tap that reveals what teaches it.
 *   2. A unit without coverage says so plainly instead of looking complete.
 *   3. Every published content-map PDF exists, is served, and is NOT STALE: its stamped
 *      signature must match the mapping as it stands now (lib/mapsig.js). Change the map
 *      without re-running mk_mapping_pdf.mjs and this fails.
 */
import { openApp, checker, REPO } from '../harness.mjs';
import { mapSignature } from '../generators/lib/mapsig.js';
import fs from 'fs';
import path from 'path';

const { page: p, errors, close } = await openApp();
const { chk, report } = checker('Content map — on the site and as a PDF');

// ---------- 1. the audit view ----------
await p.evaluate(()=>{AUTHED=true;renderContentAudit();});
await p.waitForFunction(()=>COV_DATA||COV_ERR, null, { timeout: 5000 });
await p.waitForTimeout(150);
const view=await p.evaluate(()=>{
  const cards=[...document.querySelectorAll('#ca_root .card')];
  const card=id=>cards.find(c=>c.querySelector('.cardhd').textContent.indexOf(brodyBlockById(id).name)>=0);
  const msk=card('msk-skin'),heme=card('heme-renal');
  const lects=[...msk.querySelectorAll('details.ca-lc')];
  const st=k=>msk.querySelectorAll('.ca-lst.s-'+k).length;
  const trauma=lects.find(d=>d.querySelector('.ca-lcs').textContent.indexOf('Skin Trauma')>=0);
  if(trauma)trauma.open=true;
  const link=msk.querySelector('a[href^="content-maps/"]');
  return {lects:lects.length,covered:st('covered'),partial:st('partial'),gap:st('gap'),none:st('none'),
    summary:(msk.querySelector('.ca-cov')||{}).textContent||'',
    gapsListed:msk.querySelectorAll('.ca-covnote .ca-covrow').length,
    traumaItems:trauma?[...trauma.querySelectorAll('.ca-lci')].map(e=>e.textContent):[],
    link:link?link.getAttribute('href'):null,
    hemeLects:heme.querySelectorAll('details.ca-lc').length,
    hemeNote:(heme.querySelector('.ca-cov')||{}).textContent||'',
    hemeLink:!!heme.querySelector('a[href^="content-maps/"]'),
    cov:unitCoverage('msk-skin')&&unitCoverage('msk-skin').summary};
});
chk('C66-1 the audit shows every Musculoskeletal & Skin lecture with a coverage status',
    view.cov&&view.lects===view.cov.total&&view.covered+view.partial+view.gap+view.none===view.cov.total,
    JSON.stringify({lects:view.lects,cov:view.cov}));
chk('C66-2 …the statuses match the published coverage exactly',
    view.cov&&view.covered===view.cov.covered&&view.partial===view.cov.partial&&view.gap===view.cov.gap&&view.none===view.cov.none,
    JSON.stringify(view));
chk('C66-3 …and the gaps and partly-covered lectures are listed up front, not buried',
    view.gapsListed===view.cov.gap+view.cov.partial&&/Brody lectures/.test(view.summary), view.gapsListed+' listed; '+view.summary.slice(0,90));
chk('C66-4 tapping a lecture shows what teaches it (Skin Trauma → the wound-healing videos and the burns articles)',
    view.traumaItems.some(t=>/2\.5 Wound Healing/.test(t))&&view.traumaItems.some(t=>/^.*Burns/.test(t)), JSON.stringify(view.traumaItems.slice(0,6)));
chk('C66-5 a unit without lecture coverage says so, rather than looking complete',
    view.hemeLects===0&&/hasn’t been written/.test(view.hemeNote), JSON.stringify({n:view.hemeLects,note:view.hemeNote.slice(0,80)}));

// ---------- 2. the published PDFs ----------
const maps=await p.evaluate(()=>CONTENT_MAPS);
chk('C66-6 the unit links its content-map PDF from the audit', view.link===maps['msk-skin']&&!view.hemeLink, view.link);
for (const [id, rel] of Object.entries(maps)) {
  const pdf=path.join(REPO, rel), side=pdf.replace(/\.pdf$/, '.json');
  const served=await p.evaluate(async u=>{const r=await fetch(u);return {ok:r.ok,type:r.headers.get('content-type'),n:(await r.arrayBuffer()).byteLength};}, rel);
  chk('C66-7 '+id+': the PDF is in the repo and served from the site', fs.existsSync(pdf)&&served.ok&&served.n>50000, JSON.stringify(served));
  const stamp=fs.existsSync(side)?JSON.parse(fs.readFileSync(side,'utf8')).signature:null;
  const now=mapSignature(REPO, id);
  chk('C66-8 '+id+': the PDF matches the mapping as it stands — not stale', stamp===now,
      'stamped '+stamp+', mapping now '+now+' — run: node tools/generators/mk_mapping_pdf.mjs '+id);
}

chk('C66-9 no uncaught page errors', errors.length===0, errors.slice(0,3).join(' | '));
await close();
process.exit(report() ? 1 : 0);
