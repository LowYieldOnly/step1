/* C80 · The GI, Nutrition & Multisystem Brody block (SYST 9500, Term 3, Nov 9 – Dec 11).
 *
 * The fifth block, and the first without Bootcamp: Bootcamp leaves the repertoire after
 * Musculoskeletal & Skin (Dylan, 2026-10-22), so the block carries noRes:["bootcamp"] —
 * none of Bootcamp's 229 GI videos is scheduled, and its switch isn't offered for the unit.
 *
 * Gastroenterology is the one system; "Nutrition and Multisystem" is lectures, served by
 * targeted includes: the sixteen cancer drugs Hematology & Renal excluded so they could land
 * here, the vitamins, ethanol and inborn errors, substance use, eating disorders, and the gut
 * and liver infections for "Lower GI: Infectious" and the hepatitis lectures.
 *
 * Five weeks, Thanksgiving week without a quiz: a week is due at the first quiz on or after
 * its Friday, so week 3 is due with week 4 on Dec 4, and week 5 at Exam 5 on Dec 11.
 */
import { openApp, checker } from '../harness.mjs';

const { page: p, errors, mobilePage, close } = await openApp();
const { chk, report } = checker('Brody block — GI, Nutrition & Multisystem');

await p.evaluate(() => { window.__mk = (opts) => {
  opts = opts || {};
  const blk = brodyBlockById('gi-multisystem');
  AUTHED = true; todayISO = () => (opts.today || blk.weeks[0].start);
  S.settings = { seenBrodyHelp: true, seenUpdate: LATEST_UPDATE };
  PRACTICE_KEYS.forEach(k => { S[k] = { total: null, blocks: {} }; });
  Object.assign(S, { vdone: {}, vdoneDate: {}, vdoneAt: {}, vundone: {}, vskip: {}, vshaky: {}, akdone: {},
    notes: {}, streak: { days: {} }, assessments: {}, _resetAt: 0 });
  S.cfgs.nbme = { examType: 'nbme', brody: blk.id, examLabel: blk.name, examISO: blk.shelf,
    startISO: blk.weeks[0].start, restDays: [0],
    resources: { bnb: true, pathoma: true, skpharm: true, skmicro: true, bootcamp: true, uwlib: false },
    systems: blk.systems.slice(), brodyReviewDays: 3,
    brodyJoinWk: opts.join || 1, brodyJoinDate: blk.weeks[(opts.join || 1) - 1].start };
  if (opts.off) S.cfgs.nbme.contentOff = opts.off;
  if (opts.ed !== null) S.cfgs.nbme.catEd = opts.ed || CAT_CURRENT_ED;   // a new plan is on the current catalog; null = a plan from before editions
  normalizeCfg(S.cfgs.nbme, 'nbme'); activate('nbme'); S.active = 'nbme'; VIEW = 'today';
  delete S.cfg.brodyPace; reflow();
};
window.__hero = () => paceHero().replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); });
const J = o => JSON.stringify(o);

// ---------- 1. registered and dated ----------
const reg = await p.evaluate(() => {
  const b = brodyBlockById('gi-multisystem'), ids = BRODY_BLOCKS.map(x => x.id), shelves = BRODY_BLOCKS.map(x => x.shelf);
  const dow = iso => isoToDate(iso).getDay();
  return { found: !!b, name: b && b.name, systems: b && b.systems, noRes: b && b.noRes,
    starts: b && b.weeks.map(w => w.start), ns: b && b.weeks.map(w => w.n), allMon: b && b.weeks.every(w => dow(w.start) === 1),
    shelf: b && b.shelf, shelfDow: b && dow(b.shelf), cps: b && b.checkpoints, cpDow: b && b.checkpoints.map(dow),
    last: ids[ids.length - 1], sorted: shelves.every((s, i) => i === 0 || shelves[i - 1] < s), dupes: ids.length !== new Set(ids).size, ids,
    lect: b && b.weeks.map(w => w.lectures.length), titled: b && b.weeks.every(w => w.lectures.every(l => l.title && l.disc)) };
});
chk('C80-1 the block is registered, named, and last in shelf order',
  reg.found && reg.name === 'GI, Nutrition & Multisystem' && reg.last === 'gi-multisystem' && reg.sorted && !reg.dupes, J(reg.ids));
chk('C80-2 one system, Gastroenterology, and no Bootcamp', J(reg.systems) === '["Gastroenterology"]' && J(reg.noRes) === '["bootcamp"]', J([reg.systems, reg.noRes]));
chk('C80-3 five weeks, each starting on a Monday, numbered 1-5',
  J(reg.starts) === '["2026-11-09","2026-11-16","2026-11-23","2026-11-30","2026-12-07"]' && reg.allMon && J(reg.ns) === '[1,2,3,4,5]', J(reg.starts));
chk('C80-4 the exam is Friday 2026-12-11 (Exam 5)', reg.shelf === '2026-12-11' && reg.shelfDow === 5, reg.shelf);
chk('C80-5 three Friday checkpoints, Extended Quizzes 9-11; Thanksgiving week has none',
  J(reg.cps) === '["2026-11-13","2026-11-20","2026-12-04"]' && reg.cpDow.every(d => d === 5), J(reg.cps));
chk('C80-6 82 lectures transcribed, each titled and disciplined', reg.lect.reduce((a, n) => a + n, 0) === 82 && reg.titled, J(reg.lect));

// ---------- 2. the content map ----------
const audit = await p.evaluate(() => {
  const a = auditBlock(brodyBlockById('gi-multisystem'));
  return { unmapped: a.unmapped.map(v => v.res + '|' + v.name), orphans: a.orphans, bcOrphans: a.bcOrphans, perWeek: a.weeks.map(w => w.vids.length) };
});
chk('C80-7 nothing falls through to the last week — every video is explicitly mapped', audit.unmapped.length === 0, audit.unmapped.slice(0, 4).join(' ; '));
chk('C80-8 no mapping points at a video that left the catalog', audit.orphans.length === 0 && audit.bcOrphans.length === 0, J([audit.orphans, audit.bcOrphans]).slice(0, 200));
chk('C80-9 weeks 1-4 carry the content; week 5 is laboratory medicine, nearly none (' + audit.perWeek.join(' / ') + ')',
  audit.perWeek.slice(0, 4).every(n => n >= 10) && audit.perWeek[4] <= 3, J(audit.perWeek));
const other = await p.evaluate(() => BRODY_BLOCKS.filter(b => b.id !== 'gi-multisystem').map(b => {
  const a = auditBlock(b); return { id: b.id, bad: a.unmapped.length + a.orphans.length + a.bcOrphans.length }; }));
chk('C80-10 adding a fifth block left the first four audit-clean', other.length === 4 && other.every(o => o.bad === 0), J(other));

// ---------- 3. no Bootcamp ----------
const bc = await p.evaluate(() => {
  window.__mk({});
  const inPlan = SCHED.planItems.filter(v => v.res === 'bootcamp').length;
  const catGI = catVideos().filter(v => v.res === 'bootcamp' && v.sys === 'Gastroenterology').length;
  VIEW = 'adjust'; ADJ_VIEW = 'edit'; render();
  const editorOffers = !!document.querySelector('[data-res="bootcamp"]');
  const others = BRODY_BLOCKS.filter(b => b.id !== 'gi-multisystem').map(b => blkHasRes(b, 'bootcamp'));
  ADJ_VIEW = null; VIEW = 'today'; render();
  return { inPlan, catGI, editorOffers, othersKeep: others.every(Boolean), resAttr: !!document.querySelector('[data-res]') || true };
});
chk('C80-11 with Bootcamp switched on, none of its ' + bc.catGI + ' GI videos is scheduled', bc.inPlan === 0 && bc.catGI > 200, J(bc));
chk('C80-12 the Plan editor does not offer Bootcamp for this unit; the earlier units still carry it', !bc.editorOffers && bc.othersKeep, J(bc));

// ---------- 4. the lectures from outside Gastroenterology ----------
const inc = await p.evaluate(() => {
  window.__mk({});
  const wk = {}; SCHED.planItems.forEach(v => { wk[brodyKey(catVideos().find(x => itemId(x) === v.id) || {})] = v.wk; });
  const keyWk = k => { const v = catVideos().find(x => brodyKey(x) === k); return v ? (SCHED.planItems.find(i => i.id === itemId(v)) || {}).wk : undefined; };
  const hr = brodyBlockById('heme-renal').exclude;
  const id = catVideos().filter(v => v.sys === 'Infectious Disease'), idIn = id.filter(v => SCHED.planItems.some(i => i.id === itemId(v)));
  const want = ['Helicobacter pylori', 'Clostridioides difficile', 'Giardia lamblia', 'Salmonella: Typhoidal Salmonella', 'Viral Hepatitis',
    'Hepatitis B Viral Basics & Infectious Diseases (Hepadnaviridae)', 'Hepatitis C Virus (Flaviviridae)'];
  const unwanted = ['Streptococcus pyogenes (Group A Strep)', 'Mycobacterium tuberculosis', 'Plasmodium spp.', 'Influenza Virus (Orthomyxoviridae)', 'Zoonotic Infections', 'HIV'];
  return {
    cancer: hr.map(k => keyWk(k)), hrN: hr.length,
    nutrition: ['bnb|Biochemistry|Vitamins|B Vitamins', 'bnb|Biochemistry|Vitamins|B12 and Folate', 'bnb|Biochemistry|Metabolism|Ethanol Metabolism',
      'bnb|Biochemistry|Metabolism|Inborn Errors of Metabolism', 'bnb|Biochemistry|Other Topics|Lysosomal Storage Diseases'].map(keyWk),
    substance: ['bnb|Psychiatry|Substance Use Disorders|Opioids', 'bnb|Psychiatry|Substance Use Disorders|Alcohol and CNS Depressants'].map(keyWk),
    eating: keyWk('bnb|Psychiatry|Pathology|Eating Disorders'),
    idN: idIn.length, idAll: id.length, got: want.filter(n => idIn.some(v => v.name === n)).length, wantN: want.length,
    leaked: unwanted.filter(n => idIn.some(v => v.name === n)),
    idWeeks: [...new Set(idIn.map(v => (SCHED.planItems.find(i => i.id === itemId(v)) || {}).wk))].sort(),
    psych: SCHED.planItems.filter(v => v.sys === 'Psychiatry').length, psychAll: catVideos().filter(v => v.sys === 'Psychiatry').length };
});
chk('C80-13 the ' + inc.hrN + ' cancer drugs Hematology & Renal left for this unit are all here, weeks 3-4',
  inc.hrN === 16 && inc.cancer.every(w => w === 3 || w === 4), J(inc.cancer));
chk('C80-14 vitamins, ethanol and the inborn errors are week 4, with the nutrition lectures', inc.nutrition.every(w => w === 4), J(inc.nutrition));
chk('C80-15 substance use is week 4; eating disorders week 1', inc.substance.every(w => w === 4) && inc.eating === 1, J([inc.substance, inc.eating]));
chk('C80-16 only the gut and liver infections are scheduled, not the microbiology course',
  inc.idN >= 15 && inc.idN < inc.idAll * 0.1 && inc.got === inc.wantN && inc.leaked.length === 0,
  inc.idN + ' of ' + inc.idAll + ' ID videos; expected present ' + inc.got + '/' + inc.wantN + '; leaked ' + J(inc.leaked));
chk('C80-17 …in weeks 1-2, with the infectious and hepatitis lectures', J(inc.idWeeks) === '[1,2]', J(inc.idWeeks));
chk('C80-18 psychiatry is a thin targeted thread', inc.psych > 0 && inc.psych < 10 && inc.psychAll > 100, inc.psych + ' of ' + inc.psychAll);

// ---------- 5. it schedules ----------
const sch = await p.evaluate(() => {
  window.__mk({});
  const dayOf = {}; SCHED.days.forEach(d => d.items.forEach(i => dayOf[i.id] = d.iso));
  const b = brodyBlockById('gi-multisystem');
  return { n: SCHED.stats.totalItems, h: Math.round(SCHED.stats.totalMin / 6) / 10,
    expect: catVideos().filter(v => !isArticle(v) && brodyInBlock(b, v)).length,
    placed: SCHED.planItems.filter(i => dayOf[i.id]).length,
    pace: SCHED.brodyPace, feasible: SCHED.stats.feasible, heavy: SCHED.weekLoad.filter(w => w.heavy).map(w => w.n),
    onOrAfterShelf: SCHED.planItems.filter(i => dayOf[i.id] && dayOf[i.id] >= b.shelf).length,
    inBuffer: SCHED.planItems.filter(i => dayOf[i.id] && dayOf[i.id] >= SCHED.reviewCutoff).length,
    sundays: SCHED.days.filter(d => isoToDate(d.iso).getDay() === 0 && d.items.length).length,
    deadlines: brodyWeekLoads(S.cfg, b).map(w => w.quiz), hero: __hero() };
});
chk('C80-19 all ' + sch.n + ' videos (' + sch.h + ' h) get a day', sch.placed === sch.n && sch.n === sch.expect && sch.n > 90, sch.placed + ' placed of ' + sch.n + '; the unit has ' + sch.expect);
const eds = await p.evaluate(() => {
  window.__mk({}); const cur = SCHED.planItems.length;
  window.__mk({ ed: null });
  const items = SCHED.planItems, firstEd = catEdition(S.cfg), names = items.map(v => v.name);
  // the first edition's own titles for the gut and liver organisms (Sketchy Micro was retitled and
  // partly split on Oct 23 — one "Salmonella" then, two now)
  const old = ['Clostridium difficile', 'Salmonella', 'Shigella', 'Giardia', 'Intestinal Nematodes', 'Hepatits A (Picornaviridae)', 'Hepatitis C (Flaviviridae)'];
  const a = auditBlock(brodyBlockById('gi-multisystem'));
  const r = { cur, first: items.length, firstEd, oldGot: old.filter(n => names.includes(n)).length, oldN: old.length,
    unmapped: a.unmapped.length, idWeeks: [...new Set(items.filter(v => v.sys === 'Infectious Disease').map(v => v.wk))].sort() };
  window.__mk({}); return r;
});
chk('C80-19b a plan still on the first catalog edition (made before Oct 23, moved here by editing) gets the unit in that edition\'s titles, every video mapped',
  eds.firstEd === '2026.1' && eds.oldGot === eds.oldN && eds.unmapped === 0 && J(eds.idWeeks) === '[1,2]' && eds.first >= eds.cur - 2, J(eds));
chk('C80-20 nothing on or after the exam, in the review buffer, or on a rest day', sch.onOrAfterShelf === 0 && sch.inBuffer === 0 && sch.sundays === 0, J(sch));
chk('C80-21 week deadlines: quiz 9, quiz 10, then quiz 11 for weeks 3 and 4, then Exam 5',
  J(sch.deadlines) === '["2026-11-13","2026-11-20","2026-12-04","2026-12-04","2026-12-11"]', J(sch.deadlines));
chk('C80-22 feasible at the default pace, and Today says so', sch.feasible === true && sch.heavy.length === 0 && sch.pace <= 6 && /On pace/.test(sch.hero), 'pace ' + sch.pace + ' · ' + sch.hero);

// ---------- 6. content depth ----------
const depth = await p.evaluate(() => {
  window.__mk({}); const full = SCHED.planItems.map(v => v.id);
  window.__mk({ off: { anat: true, hist: true, embryo: true, physio: true } }); const min = SCHED.planItems.map(v => v.id);
  const has = (ids, k) => { const v = catVideos().find(x => brodyKey(x) === k); return !!v && ids.includes(itemId(v)); };
  const dropped = ['bnb|Gastroenterology|Anatomy|Gastrointestinal Embryology', 'bnb|Gastroenterology|Anatomy|Gastrointestinal Blood Supply',
    'bnb|Gastroenterology|GI Physiology|Gastrointestinal Hormones'].filter(k => !has(min, k)).length;
  const kept = ['bnb|Gastroenterology|Clinical Gastroenterology|Cirrhosis', 'bnb|Gastroenterology|GI Physiology|Bilirubin',
    'bnb|Gastroenterology|Anatomy|Hernias', 'pathoma|Gastroenterology|Gastrointestinal Pathology|10.4 Stomach',
    'bnb|Hematology|Cancer Drugs|Antimetabolites'].filter(k => has(min, k)).length;
  return { full: full.length, min: min.length, subset: min.every(i => full.includes(i)), dropped, kept };
});
chk('C80-23 Minimal drops the GI anatomy, embryology and physiology, and keeps the pathology, Bilirubin, Hernias and the drugs',
  depth.min < depth.full && depth.subset && depth.dropped === 3 && depth.kept === 5, J(depth));

// ---------- 7. it is the unit to start tomorrow ----------
const roll = await p.evaluate(() => {
  const real = todayISO, out = {};
  ['2026-11-08', '2026-11-09', '2026-11-10', '2026-12-11', '2026-12-12'].forEach(d => { todayISO = () => d; out[d] = brodyCurrentBlockId(); });
  todayISO = real; return out;
});
chk('C80-24 the current unit is MSK through its Nov 9 exam, then GI to Dec 11',
  roll['2026-11-08'] === 'msk-skin' && roll['2026-11-09'] === 'msk-skin' && roll['2026-11-10'] === 'gi-multisystem' && roll['2026-12-11'] === 'gi-multisystem', J(roll));
const late = await p.evaluate(() => {
  const b = brodyBlockById('gi-multisystem'); window.__mk({ today: b.weeks[1].start, join: 2 });
  return { skipped: SCHED.skippedWeeks, wks: [...new Set(SCHED.planItems.map(v => v.wk))].sort(), earlier: SCHED.days.some(d => d.earlier) };
});
chk('C80-25 a late joiner starts at their join week, the earlier week optional', late.skipped === 1 && J(late.wks) === '[2,3,4,5]' && late.earlier, J(late));

const m = await mobilePage();
const mob = await m.evaluate(() => {
  const blk = brodyBlockById('gi-multisystem');
  AUTHED = true; todayISO = () => blk.weeks[0].start; S.settings = { seenBrodyHelp: true, seenUpdate: LATEST_UPDATE };
  PRACTICE_KEYS.forEach(k => { S[k] = { total: null, blocks: {} }; });
  S.cfgs.nbme = { examType: 'nbme', brody: blk.id, examLabel: blk.name, examISO: blk.shelf, startISO: blk.weeks[0].start, restDays: [0],
    resources: { bnb: true, pathoma: true, skpharm: true, skmicro: true }, systems: blk.systems.slice(), brodyReviewDays: 3, brodyJoinWk: 1, brodyJoinDate: blk.weeks[0].start };
  normalizeCfg(S.cfgs.nbme, 'nbme'); activate('nbme'); S.active = 'nbme'; reflow();
  const out = {};
  ['today', 'adjust'].forEach(v => { VIEW = v; if (v === 'adjust') ADJ_VIEW = 'edit'; render(); out[v] = { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }; });
  return out;
});
chk('C80-26 Today and Plan do not overflow sideways on a phone', mob.today.sw <= mob.today.cw + 1 && mob.adjust.sw <= mob.adjust.cw + 1, J(mob));

chk('C80-27 no page errors anywhere in this run', errors.length === 0, errors.join(' | '));
await close();
process.exit(report());
