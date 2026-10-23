/* C71 · Sketchy Pharm, Sketchy Micro and Sketchy Immunology are three resources.
 *
 * Each has its own switch. A plan made while one "Sketchy" switch covered Micro and Pharm
 * keeps exactly what it had (resources.sketchy still stands for both until the plan sets
 * them one by one), and switching one course off takes only that course's videos out.
 */
import { openApp, checker } from '../harness.mjs';

const { page: p, errors, close } = await openApp();
const { chk, report } = checker('Sketchy Pharm, Micro and Immunology as separate resources');

const r = await p.evaluate(() => {
  const base = res => {
    AUTHED = true; todayISO = () => '2026-10-23';
    S.settings = { seenBrodyHelp: true, seenUpdate: LATEST_UPDATE };
    PRACTICE_KEYS.forEach(k => { S[k] = { total: null, blocks: {} }; });
    Object.assign(S, { vdone: {}, vdoneDate: {}, vdoneAt: {}, vundone: {}, vskip: {}, vshaky: {}, akdone: {}, notes: {}, streak: { days: {} }, assessments: {}, _resetAt: 0 });
    S.cfgs = { step1: { examType: 'step1', examLabel: 'Step 1', examISO: '2027-06-01', startISO: '2026-10-23', restDays: [0], reviewDays: 14, wkdayHrs: 6, wkendHrs: 4,
      resources: res, systems: SYS.slice() }, nbme: null };
    normalizeCfg(S.cfgs.step1, 'step1'); activate('step1'); S.active = 'step1'; reflow(); };
  const sig = () => SCHED.planItems.map(v => v.id).join('\u0001');
  const byRes = () => { const o = {}; SCHED.planItems.forEach(v => { o[v.res] = (o[v.res] || 0) + 1; }); return o; };
  base({ bnb: true, sketchy: true }); const old = sig(), oldRes = byRes();
  base({ bnb: true, skmicro: true, skpharm: true }); const split = sig();
  // the plan screen: three switches, no single "Sketchy"
  base({ bnb: true, sketchy: true }); VIEW = 'adjust'; ADJ_VIEW = 'edit'; render();
  const btns = [...document.querySelectorAll('[data-res]')].map(b => b.dataset.res + (b.classList.contains('on') ? '+' : '-'));
  // switching Sketchy Micro off takes only Micro out
  document.querySelector('[data-res="skmicro"]').click();
  const afterOff = byRes(), cfg = JSON.parse(JSON.stringify(S.cfg.resources));
  // a Brody unit offers only the courses it holds
  const b = brodyBlockById('msk-skin');
  S.cfgs = { step1: null, nbme: { examType: 'nbme', brody: b.id, examLabel: b.name, examISO: b.shelf, startISO: b.weeks[0].start, restDays: [0],
    resources: { bnb: true, sketchy: true }, systems: b.systems.slice(), brodyReviewDays: 3, brodyJoinWk: 1, brodyJoinDate: b.weeks[0].start } };
  normalizeCfg(S.cfgs.nbme, 'nbme'); activate('nbme'); S.active = 'nbme'; reflow(); VIEW = 'adjust'; ADJ_VIEW = 'edit'; render();
  const mskBtns = [...document.querySelectorAll('[data-res]')].map(x => x.dataset.res).filter(k => /^sk/.test(k));
  const mskHas = ['skpharm', 'skmicro', 'skimmuno'].filter(k => blkHasRes(b, k));
  // setup: pick only Sketchy Micro
  startOnboard('step1', true); _ob.examISO = '2027-06-01'; _ob.systems = SYS.slice(); _ob.resources = { skmicro: true };
  const review = obReviewHTML(_ob); commitOnboard();
  const fresh = byRes();
  VIEW = 'today'; ADJ_VIEW = null; render();
  return { same: old === split, oldRes, btns, afterOff, cfg, mskBtns, mskHas, review: /Sketchy Micro/.test(review) && !/Sketchy Pharm/.test(review), fresh,
    label: resLabel('skimmuno') };
});
chk('C71-1 a plan made with the one "Sketchy" switch schedules exactly what Pharm + Micro on schedule — nothing gained or lost',
  r.same && r.oldRes.skmicro > 0 && r.oldRes.skpharm > 0 && !r.oldRes.skimmuno, JSON.stringify(r.oldRes));
chk('C71-2 the plan screen has three Sketchy switches — Pharm and Micro on for that plan, Immunology off — and no single "Sketchy"',
  JSON.stringify(r.btns.filter(x => /^sk/.test(x))) === JSON.stringify(['skpharm+', 'skmicro+', 'skimmuno-']) && !r.btns.some(x => /^sketchy/.test(x)), JSON.stringify(r.btns));
chk('C71-3 switching Sketchy Micro off takes out only Micro', !r.afterOff.skmicro && r.afterOff.skpharm === r.oldRes.skpharm && r.afterOff.bnb === r.oldRes.bnb && r.cfg.skmicro === false,
  JSON.stringify({ afterOff: r.afterOff, cfg: r.cfg }));
chk('C71-4 a Brody unit offers only the Sketchy courses it holds', JSON.stringify(r.mskBtns) === JSON.stringify(r.mskHas) && r.mskHas.length >= 2, JSON.stringify(r));
chk('C71-5 setup offers each course on its own: Sketchy Micro alone gives Micro, not Pharm', r.review && r.fresh.skmicro > 0 && !r.fresh.skpharm, JSON.stringify(r.fresh));
chk('C71-6 the third course is called Sketchy Immunology', r.label === 'Sketchy Immunology', r.label);
chk('C71-7 no uncaught page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
await close();
process.exit(report() ? 1 : 0);
