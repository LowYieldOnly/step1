/* C82 · B&B microbiology follows the Sketchy Micro videos a unit schedules.
 *
 * When a unit schedules a Sketchy Micro video, the Boards & Beyond Infectious Disease video
 * that teaches the same organism is scheduled too (Dylan, 2026-11-10), in the week of the
 * first Sketchy Micro video it covers. The pairing lives in tools/generators/lib/micro_pairs.js
 * and the unit generators apply it. What has to hold:
 *   - every Sketchy Micro title in the catalog has a decision, every pairing names a real B&B
 *     video, and the titles with no B&B home are a short named list;
 *   - in every unit from GI on, each B&B video paired with a scheduled Sketchy Micro video is
 *     in the unit, in the week of the first of them (or the week a lecture already gave it),
 *     and no other B&B Infectious Disease video is;
 *   - on GI that is Other Gram Positives, RNA Viruses, Protozoa and Helminths added to week 1,
 *     beside Gram Negative Rods (week 1) and Viral Hepatitis (week 2), and they are on days
 *     before the week-1 quiz;
 *   - it follows the unit, not the Sketchy switch: B&B on and Sketchy Micro off still gets them;
 *     B&B off gets none of them, and the Sketchy videos stay;
 *   - a plan on the first catalog edition gets the same B&B videos;
 *   - What's new says so.
 */
import fs from 'fs';
import path from 'path';
import { openApp, checker, REPO } from '../harness.mjs';
import { microPair, microPairs } from '../generators/lib/micro_pairs.js';

const { page: p, errors, close } = await openApp();
const { chk, report } = checker('B&B microbiology paired with Sketchy Micro');
const J = o => JSON.stringify(o);

// ---------- 1. the pairing table itself ----------
const cat = JSON.parse(fs.readFileSync(path.join(REPO, 'catalog.json'), 'utf8'));
const sk = cat.videos.filter(v => v.res === 'skmicro');
const tbl = microPairs(cat.videos, {});
const pairOf = {}; sk.forEach(v => { pairOf[v.name] = microPair(v); });
const none = sk.filter(v => pairOf[v.name] === null).map(v => v.name);
chk('C82-1 every Sketchy Micro title has a pairing decision, and every pairing is a real B&B video',
  sk.length > 100 && tbl.problems.length === 0 && sk.every(v => pairOf[v.name] !== undefined), J(tbl.problems.slice(0, 5)));
chk('C82-2 only a short named list has no B&B home', none.length > 0 && none.length <= 8 && none.includes('Scabies, Lice, Crabs'), J(none));
chk('C82-3 spot checks: C. diff → Other Gram Positives, Pseudomonas → Gram Negative Rods, H. influenzae → Other Gram Negatives, Plasmodium → Malaria, hepatitis → Viral Hepatitis',
  /Other Gram Positives$/.test(pairOf['Clostridioides difficile']) && /\|Gram Negative Rods$/.test(pairOf['Pseudomonas aeruginosa'])
    && /Other Gram Negatives$/.test(pairOf['Haemophilus influenzae']) && /Malaria$/.test(pairOf['Plasmodium: Infection & Lifecycle'])
    && /Viral Hepatitis$/.test(pairOf['Hepatitis C Virus (Flaviviridae)']) && /Herpes Viruses$/.test(pairOf['Cytomegalovirus (Herpesviridae)']),
  J(['Clostridioides difficile', 'Pseudomonas aeruginosa', 'Haemophilus influenzae', 'Hepatitis C Virus (Flaviviridae)'].map(n => pairOf[n])));

// ---------- 2. the shipped units ----------
const pairByKey = {}; sk.forEach(v => { pairByKey[v.res + '|' + v.sys + '|' + (v.cat || '') + '|' + v.name] = pairOf[v.name]; });
const units = await p.evaluate((pairByKey) => {
  const from = BRODY_BLOCKS.findIndex(b => b.id === 'gi-multisystem');
  return BRODY_BLOCKS.slice(from).map(b => {
    const want = {};
    catVideos().filter(v => v.res === 'skmicro' && brodyInBlock(b, v)).forEach(v => {
      const t = pairByKey[brodyKey(v)]; if (!t) return;
      const w = brodyVideoWeek(b, v); want[t] = want[t] == null ? w : Math.min(want[t], w); });
    const bnbId = catVideos().filter(v => v.res === 'bnb' && v.sys === 'Infectious Disease' && brodyInBlock(b, v));
    const have = {}; bnbId.forEach(v => { have[brodyKey(v)] = brodyVideoWeek(b, v); });
    return { id: b.id, want, have,
      missing: Object.keys(want).filter(k => have[k] == null),
      early: Object.keys(want).filter(k => have[k] != null && have[k] > want[k]),
      stray: Object.keys(have).filter(k => want[k] == null) };
  });
}, pairByKey);
chk('C82-4 in every unit from GI on, each B&B video paired with a scheduled Sketchy Micro video is in the unit',
  units.length >= 1 && units.every(u => u.missing.length === 0), J(units.map(u => [u.id, u.missing])));
chk('C82-5 …no later than the week of the first Sketchy Micro video it covers',
  units.every(u => u.early.length === 0), J(units.map(u => [u.id, u.early])));
chk('C82-6 …and no other B&B Infectious Disease video is', units.every(u => u.stray.length === 0), J(units.map(u => [u.id, u.stray])));
const gi = units.find(u => u.id === 'gi-multisystem') || { have: {} };
const short = o => Object.fromEntries(Object.entries(o).map(([k, w]) => [k.split('|').pop(), w]).sort());
chk('C82-7 GI: Other Gram Positives, RNA Viruses, Protozoa and Helminths in week 1, beside Gram Negative Rods (1) and Viral Hepatitis (2)',
  J(short(gi.have)) === J({ 'Gram Negative Rods': 1, 'Helminths': 1, 'Other Gram Positives': 1, 'Protozoa': 1, 'RNA Viruses': 1, 'Viral Hepatitis': 2 }),
  J(short(gi.have)));

// ---------- 3. in a plan ----------
await p.evaluate(() => { window.__mk = (res, ed) => {
  const blk = brodyBlockById('gi-multisystem');
  AUTHED = true; todayISO = () => blk.weeks[0].start;
  S.settings = { seenBrodyHelp: true, seenUpdate: LATEST_UPDATE };
  PRACTICE_KEYS.forEach(k => { S[k] = { total: null, blocks: {} }; });
  Object.assign(S, { vdone: {}, vdoneDate: {}, vdoneAt: {}, vundone: {}, vskip: {}, vshaky: {}, akdone: {}, notes: {}, streak: { days: {} }, assessments: {}, _resetAt: 0 });
  S.cfgs.nbme = { examType: 'nbme', brody: blk.id, examLabel: blk.name, examISO: blk.shelf, startISO: blk.weeks[0].start, restDays: [0],
    resources: Object.assign({}, res), systems: blk.systems.slice(), brodyReviewDays: 3, brodyJoinWk: 1, brodyJoinDate: blk.weeks[0].start };
  if (ed !== null) S.cfgs.nbme.catEd = ed || CAT_CURRENT_ED;
  normalizeCfg(S.cfgs.nbme, 'nbme'); activate('nbme'); S.active = 'nbme'; VIEW = 'today'; delete S.cfg.brodyPace; reflow();
};
window.__ID = ['Other Gram Positives', 'RNA Viruses', 'Protozoa', 'Helminths'];
window.__got = () => {
  const day = {}; SCHED.days.forEach(d => d.items.forEach(x => { day[x.id] = d.iso; }));
  const items = SCHED.planVideos.filter(v => v.res === 'bnb' && v.sys === 'Infectious Disease');
  return { names: items.map(v => v.name).sort(), days: items.filter(v => __ID.includes(v.name)).map(v => day[v.id]), wk: items.filter(v => __ID.includes(v.name)).map(v => v.wk),
    sk: SCHED.planVideos.filter(v => v.res === 'skmicro').length };
}; });
const plan = await p.evaluate(() => {
  const out = {};
  __mk({ bnb: true, pathoma: true, skpharm: true, skmicro: true }); out.both = __got(); out.quiz = brodyBlockById('gi-multisystem').checkpoints[0];
  __mk({ bnb: true, pathoma: true, skpharm: true, skmicro: false }); out.noSk = __got();
  __mk({ bnb: false, pathoma: true, skpharm: true, skmicro: true }); out.noBnb = __got();
  __mk({ bnb: true, pathoma: true, skpharm: true, skmicro: true }, null); out.first = __got(); out.firstEd = catEdition(S.cfg);
  return out;
});
const __ID4 = ['Other Gram Positives', 'RNA Viruses', 'Protozoa', 'Helminths'];
const has4 = g => __ID4.every(n => g.names.includes(n));
chk('C82-8 a GI plan schedules them in week 1, on days before the week-1 quiz',
  has4(plan.both) && plan.both.wk.every(w => w === 1) && plan.both.days.length === 4 && plan.both.days.every(d => d && d <= plan.quiz),
  J({ names: plan.both.names, days: plan.both.days, quiz: plan.quiz }));
chk('C82-9 they follow the unit, not the Sketchy switch: B&B on and Sketchy Micro off still gets them',
  has4(plan.noSk) && plan.noSk.sk === 0 && J(plan.noSk.names) === J(plan.both.names), J(plan.noSk));
chk('C82-10 B&B off gets none of them, and the Sketchy Micro videos stay',
  plan.noBnb.names.length === 0 && plan.noBnb.sk === plan.both.sk && plan.both.sk > 0, J({ noBnb: plan.noBnb.names, sk: [plan.noBnb.sk, plan.both.sk] }));
chk('C82-11 a plan on the first catalog edition gets the same B&B videos',
  plan.firstEd === '2026.1' && J(plan.first.names) === J(plan.both.names), plan.firstEd + ' ' + J(plan.first.names));

// ---------- 4. What's new ----------
const wn = await p.evaluate(() => { const e = CHANGELOG.find(x => /Sketchy Micro/.test(x.title) && /Boards & Beyond/.test(x.title)) || { title: '', items: [] }; return { title: e.title, items: e.items.join(' ') }; });
chk('C82-12 What\'s new says B&B micro now comes with Sketchy Micro',
  /Boards & Beyond/.test(wn.title) && /Sketchy Micro/.test(wn.title) && /Other Gram Positives/.test(wn.items) && /Helminths/.test(wn.items), J(wn).slice(0, 160));

chk('C82-13 no page errors', errors.length === 0, errors.join(' | '));
await close();
report();
