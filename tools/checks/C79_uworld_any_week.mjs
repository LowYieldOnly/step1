/* C79 · UWorld tests: any Brody week, from any day.
 *
 * The test panel on Study offered "This day" and the day's own Brody week only. It now lists
 * every week of the unit that has UWorld questions (Dylan, 2026-11-02), so on a week-3 day you
 * can build a test from week 1 to review it. What has to hold:
 *   - a Brody plan's panel shows This day and Week 1, 2, 3; the day's own week is still the
 *     "week" choice;
 *   - a week's pool is what the unit teaches that week, not what the calendar put on its
 *     dates: a week-1 video you're behind on is in Week 1's pool after it rolls into week 3,
 *     and not in Week 3's;
 *   - a test from another week is kept under that week (its label, its key, its own list of
 *     tests), never repeats a question already in a test, and Start over puts it back;
 *   - "Only videos I've checked off" narrows another week too;
 *   - a review day, with no videos of its own, opens on its week and offers no "This day";
 *   - a plan without Brody weeks (Step 1) shows no week choices.
 */
import { openApp, checker } from '../harness.mjs';

const { page: p, errors, close } = await openApp();
const { chk, report } = checker('UWorld tests — any Brody week, from any day');

const r = await p.evaluate(async () => {
  await new Promise(res => loadUWorld(res));
  window.__clip = null;
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: t => (window.__clip = t, Promise.resolve()) } });
  const wait = () => new Promise(res => setTimeout(res, 30));
  const clip = () => (window.__clip || '').split(',').map(x => parseInt(x, 10)).filter(x => x > 0);
  const base = () => { AUTHED = true; S.settings = { seenBrodyHelp: true, seenUpdate: LATEST_UPDATE };
    PRACTICE_KEYS.forEach(k => { S[k] = { total: null, blocks: {} }; });
    Object.assign(S, { vdone: {}, vdoneDate: {}, vdoneAt: {}, vundone: {}, vskip: {}, vshaky: {}, uwq: {}, uwt: {} }); UWT_KIND = {}; };
  const b = brodyBlockById('msk-skin'); let today = '2026-11-02'; todayISO = () => today; base();
  S.cfgs = { step1: null, nbme: { examType: 'nbme', brody: b.id, examLabel: b.name, examISO: b.shelf, startISO: b.weeks[0].start, restDays: [0],
    resources: { bnb: true }, systems: b.systems.slice(), brodyReviewDays: 3, brodyJoinWk: 1, brodyJoinDate: b.weeks[0].start } };
  normalizeCfg(S.cfgs.nbme, 'nbme'); activate('nbme'); S.active = 'nbme'; VIEW = 'today'; CAL_SEL = null; reflow();
  // weeks 1 and 2 mostly watched; three week-1 B&B videos left behind, so they roll into week 3
  const bnb = wk => SCHED.planVideos.filter(v => v.wk === wk && v.res === 'bnb' && (uwIdsFor(v.name) || []).length);
  const behind = bnb(1).slice(-3);
  SCHED.planVideos.filter(v => v.wk < 3 && !behind.includes(v)).forEach(v => markDone(v.id, '2026-10-24'));
  reflow(); render();
  const iso = today, out = {}; try {
  const chips = () => [...document.querySelectorAll('.uwtseg [data-uwkind]')].map(c => c.textContent + '=' + c.dataset.uwkind.split('|')[1] + (c.classList.contains('on') ? '*' : ''));
  out.chips = chips();
  const ids = vs => { const s = new Set(); vs.forEach(v => uwIdsFor(v.name).forEach(id => s.add(id))); return s; };
  const w1 = ids(bnb(1)), w3 = ids(bnb(3));
  const behindOnly = [...ids(behind)].filter(id => !w3.has(id));
  out.behindOn = behind.map(v => (SCHED.days.find(d => d.items.some(it => it.id === v.id)) || {}).iso);
  const P1 = uwPoolOf(iso, 'w1'), P3 = uwPoolOf(iso, 'week');
  out.p1 = { n: P1.all.length, want: w1.size, same: P1.all.length === w1.size && P1.all.every(id => w1.has(id)), key: P1.key, lab: P1.lab };
  out.behindInW1 = behindOnly.length > 0 && behindOnly.every(id => P1.all.includes(id));
  out.behindNotInW3 = behindOnly.every(id => !P3.all.includes(id));
  // pick Week 1 and copy a test
  document.querySelector('[data-uwkind="' + iso + '|w1"]').click();
  out.w1On = !!document.querySelector('[data-uwkind="' + iso + '|w1"].on');
  document.querySelector('[data-uwsize="20"]').click();
  document.querySelector('[data-uwmake]').click(); await wait();
  const t1 = clip(); out.t1 = { n: t1.length, inW1: t1.every(id => w1.has(id)), used: t1.every(uwUsed) };
  const rec = Object.values(S.uwt).find(t => t.ids.join() === t1.join()) || {};
  out.rec = { pool: rec.pool, label: rec.label };
  out.listed = /1 test made from Brody week 1/.test(document.querySelector('.uwt').textContent);
  // Week 2 is its own pool with its own list; back on Week 1 the test is there
  document.querySelector('[data-uwkind="' + iso + '|w2"]').click();
  out.w2 = { key: uwPoolOf(iso, 'w2').key, noList: !/made from Brody week 1/.test(document.querySelector('.uwt').textContent) };
  // a second Week 1 test repeats nothing
  document.querySelector('[data-uwkind="' + iso + '|w1"]').click();
  document.querySelector('[data-uwmake]').click(); await wait();
  const t2 = clip(); out.overlap = t2.filter(id => t1.includes(id)).length; out.t2 = t2.length;
  // only what I've checked off: the behind videos drop out of Week 1
  document.querySelector('[data-uwwatched]').click();
  const Pw = uwPoolOf(iso, 'w1'); out.watched = Pw.watched && behindOnly.every(id => !Pw.all.includes(id)) && Pw.all.length < P1.all.length;
  document.querySelector('[data-uwwatched]').click();
  // Start over on Week 1 puts its questions back and closes its tests
  document.querySelector('details.uwtmade').open = true; document.querySelector('[data-uwreset]').click();
  out.reset = uwPoolOf(iso, 'w1').all.every(id => !uwUsed(id)) && uwTestsOf(P1.key).length === 0;
  // a review day: no videos of its own, so no "This day", and it opens on its week
  const rev = SCHED.days.find(d => d.review);
  CAL_SEL = rev.iso; render();
  const revChips = [...document.querySelectorAll('.uwtseg [data-uwkind]')].filter(c => c.dataset.uwkind.startsWith(rev.iso + '|'));
  out.review = { iso: rev.iso, chips: revChips.map(c => c.textContent + (c.classList.contains('on') ? '*' : '')), panel: !!document.querySelector('.uwt') };
  CAL_SEL = null;
  // today a review day: the test panel is in the Review day card, with one question logger on the page
  SCHED.planVideos.forEach(v => { if (!isDone(v.id)) markDone(v.id, '2026-11-02'); });   // all watched: the days left are review
  today = '2026-11-05'; reflow(); render();
  const card = [...document.querySelectorAll('.card')].find(c => /Review day/.test((c.querySelector('.cardhd') || {}).textContent || ''));
  out.reviewToday = { isReview: !!(SCHED.dayMap[today] && SCHED.dayMap[today].review), card: !!card, panel: !!(card && card.querySelector('.uwt')), on: card ? [...card.querySelectorAll('.uwtseg .tog.on')].map(c => c.textContent) : [],
    loggers: document.querySelectorAll('.wqlog').length };
  today = '2026-11-02';
  // Step 1: no Brody weeks, no week choices
  base(); S.cfgs = { step1: { examType: 'step1', examLabel: 'Step 1', examISO: '2027-06-01', startISO: '2026-10-23', restDays: [0], reviewDays: 14, wkdayHrs: 6, wkendHrs: 4,
    resources: { bnb: true }, systems: SYS_ORDER_DEFAULT.slice() }, nbme: null };
  normalizeCfg(S.cfgs.step1, 'step1'); activate('step1'); S.active = 'step1'; VIEW = 'today'; reflow(); render();
  out.step1 = { panel: !!document.querySelector('.uwt'), chips: document.querySelectorAll('.uwtseg [data-uwkind]').length };
  } catch (e) { out.err = String(e && e.stack || e); }
  return out;
});
const J = o => JSON.stringify(o);
chk('C79-1 a Brody day offers This day and every week of the unit; its own week is still "week"',
  J(r.chips) === J(['This day=day*', 'Week 1=w1', 'Week 2=w2', 'Week 3=week']), J(r.chips));
chk('C79-2 a week\'s pool is the videos the unit teaches that week', r.p1 && r.p1.same && r.p1.key === 'w:msk-skin::1' && r.p1.lab === 'Brody week 1', J(r.p1));
chk('C79-3 a week-1 video you\'re behind on stays in Week 1\'s pool after rolling into week 3, and isn\'t in Week 3\'s',
  r.behindInW1 && r.behindNotInW3 && (r.behindOn || []).every(d => d >= '2026-11-02'), J({ w1: r.behindInW1, notW3: r.behindNotInW3, on: r.behindOn }));
chk('C79-4 picking Week 1 copies a test from Week 1, marked used', r.w1On && r.t1 && r.t1.n === 20 && r.t1.inW1 && r.t1.used, J({ on: r.w1On, t1: r.t1 }));
chk('C79-5 the test is kept under Week 1: its key, its label, its list', r.rec && r.rec.pool === 'w:msk-skin::1' && r.rec.label === 'Brody week 1' && r.listed, J({ rec: r.rec, listed: r.listed }));
chk('C79-6 Week 2 is a pool of its own, without Week 1\'s tests', r.w2 && r.w2.key === 'w:msk-skin::2' && r.w2.noList, J(r.w2));
chk('C79-7 a second Week 1 test repeats nothing', r.t2 > 0 && r.overlap === 0, J({ t2: r.t2, overlap: r.overlap }));
chk('C79-8 "Only videos I\'ve checked off" narrows another week too', r.watched, '');
chk('C79-9 Start over on Week 1 puts its questions back', r.reset, '');
chk('C79-10 a review day opens on its week and offers no "This day"',
  r.review && r.review.panel && r.review.chips.length === 3 && !r.review.chips.some(c => /This day/.test(c)) && r.review.chips.includes('Week 3*'), J(r.review));
chk('C79-10b when today is a review day, its card has the test panel on its week, and one question logger',
  r.reviewToday && r.reviewToday.isReview && r.reviewToday.card && r.reviewToday.panel && J(r.reviewToday.on) === J(['Week 3']) && r.reviewToday.loggers === 1, J(r.reviewToday));
chk('C79-11 a plan without Brody weeks shows no week choices', r.step1 && r.step1.chips === 0, J(r.step1));

chk('C79-12 no uncaught page errors', errors.length === 0 && !r.err, (r.err || '') + errors.slice(0, 3).join(' | '));
await close();
process.exit(report() ? 1 : 0);
