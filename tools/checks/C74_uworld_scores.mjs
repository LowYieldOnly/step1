/* C74 · A UWorld test's score, logged under the test, and one question logger on Study.
 *
 * UWorld tags each question by its own subject and system, and one test spans ten of each,
 * so a test's score is one number kept by what was studied — the day or week the test was
 * built from — and never spread across subjects. What has to hold:
 *   - each test in the panel takes a score (# right of its n); it shows as "c/n · %", and the
 *     panel totals the day's or week's tests;
 *   - the score is one practice block per test: editing replaces it (and keeps the day it was
 *     first logged), it counts toward the totals and the weekly goal, never toward Accuracy
 *     by subject; a scored test can't be put back; an out-of-range score logs nothing;
 *   - an edit wins over an older copy from another device, either way round, and the log
 *     still merges with itself unchanged;
 *   - a test the day's panel doesn't list (another day's, one video's) is offered for a score;
 *   - Stats shows the scores by day or week, and nothing until a test is scored;
 *   - Study has exactly one question logger: in the test panel when the day has one, in the
 *     weekly-goal card when there is no panel, and in the panel of a day you study ahead.
 */
import { openApp, checker } from '../harness.mjs';

const { page: p, errors, close } = await openApp();
const { chk, report } = checker('UWorld test scores, and one question logger on Study');

await p.evaluate(async () => {
  await new Promise(r => loadUWorld(r));
  window.__clip = null;
  Object.defineProperty(navigator, 'clipboard', { configurable: true,
    value: { writeText: t => (window.__clip = t, Promise.resolve()) } });
  window.__mk = (goal) => {
    const b = brodyBlockById('cardiopulm');
    AUTHED = true; window.__d0 = b.weeks[0].start; todayISO = () => window.__d0; CAL_SEL = null;
    S.settings = { seenBrodyHelp: true, seenUpdate: LATEST_UPDATE, uwSize: 10 };
    PRACTICE_KEYS.forEach(k => { S[k] = { total: null, blocks: {} }; });
    Object.assign(S, { vdone: {}, vdoneDate: {}, vdoneAt: {}, vundone: {}, vskip: {}, vshaky: {}, akdone: {}, notes: {}, streak: { days: {} }, assessments: {}, uwq: {}, uwt: {}, pomo: {}, _resetAt: 0 });
    S.cfgs = { step1: null, nbme: { examType: 'nbme', brody: b.id, examLabel: b.name, examISO: b.shelf, startISO: b.weeks[0].start, restDays: [0],
      resources: { bnb: true }, systems: b.systems.slice(), brodyReviewDays: 3, brodyJoinWk: 1, brodyJoinDate: b.weeks[0].start, weeklyQGoal: goal || 0 } };
    normalizeCfg(S.cfgs.nbme, 'nbme'); activate('nbme'); S.active = 'nbme'; VIEW = 'today'; UW_EDIT = {}; reflow(); render();
  };
  window.__wait = () => new Promise(r => setTimeout(r, 30));
  window.__score = (tid, v) => { const i = document.querySelector('[data-uwscorein="' + tid + '"]'); if (!i) return false;
    i.value = String(v); document.querySelector('[data-uwscore="' + tid + '"]').click(); return true; };
  window.__blocks = tid => Object.values(practiceLog('uworld').blocks).filter(b => b.test === tid);
});

const s = await p.evaluate(async () => { const out = {}; try {
  __mk(200); const iso = todayISO();
  document.querySelector('[data-uwkind="' + iso + '|week"]').click();
  const P = uwPoolOf(iso, 'week'); out.lab = P.lab;
  document.querySelector('[data-uwmake]').click(); await __wait();
  const [t] = uwTestsOf(P.key); out.n = t.ids.length; out.tid = t.id;
  out.open = !!document.querySelector('details.uwtmade[open] [data-uwscorein="' + t.id + '"]');
  out.backBefore = !!document.querySelector('[data-uwback="' + t.id + '"]');
  // out of range logs nothing
  __score(t.id, t.ids.length + 1); out.tooMany = __blocks(t.id).length;
  __score(t.id, -1); out.negative = __blocks(t.id).length;
  // 7 right
  __score(t.id, 7);
  const b1 = __blocks(t.id); out.b1 = b1.length === 1 ? b1[0] : b1.length;
  out.key = !!practiceLog('uworld').blocks['t_' + t.id];
  const row = [...document.querySelectorAll('.uwtrow')].find(r => r.querySelector('[data-uwagain="' + t.id + '"]'));
  out.rowTxt = row ? row.textContent : '';
  out.backAfter = !!document.querySelector('[data-uwback="' + t.id + '"]');
  out.meta = (document.querySelector('.uwtmeta') || {}).textContent || '';
  // totals and the weekly goal count it; Accuracy by subject doesn't
  const r = practiceRollupOf('uworld'); out.done = r.done; out.correct = r.correct; out.bySys = Object.keys(r.bySys);
  out.conf = subjectConfidence().length; out.goal = qGoalLogged();
  // a block logged elsewhere with a system still feeds Accuracy by subject
  addPracticeBlock('uworld', { sys: 'Cardiology', q: 12, correct: 9 });
  out.confWithOther = subjectConfidence().map(x => x.sys + ':' + x.done).join(',');
  // edit it the next day: still one block, the new number, the first day kept
  const next = isoFromDate(addDays(isoToDate(iso), 1)); todayISO = () => next; CAL_SEL = null; UWT_KIND[next] = 'week'; render();
  document.querySelector('[data-uwscoreedit="' + t.id + '"]').click();
  out.prefill = (document.querySelector('[data-uwscorein="' + t.id + '"]') || {}).value;
  __score(t.id, 8);
  const b2 = __blocks(t.id); out.b2 = b2.length === 1 ? b2[0] : b2.length; out.firstDay = iso;
  out.goal2 = practiceRollupOf('uworld').done;
  // a test built from day 2 alone, scored from day 3's panel
  UWT_KIND[next] = 'day'; render(); document.querySelector('[data-uwmake]').click(); await __wait();
  const d2 = uwTestsOf('d:' + next)[0]; const day3 = isoFromDate(addDays(isoToDate(next), 1)); todayISO = () => day3; CAL_SEL = null; render();
  const w = document.querySelector('.uwtwait'); out.waitTxt = w ? w.textContent : '';
  out.waitOk = !!(w && w.querySelector('[data-uwscorein="' + d2.id + '"]')) && !w.querySelector('[data-uwscorein="' + t.id + '"]');
  __score(d2.id, 3); render(); out.waitScored = (__blocks(d2.id)[0] || {}).correct === 3 && !document.querySelector('.uwtwait');
  todayISO = () => next; CAL_SEL = null;
} catch (e) { out.err = String(e && e.stack || e); } return out; });

chk('C74-1 a new test opens the list with a score box and Put back', s.open && s.backBefore, JSON.stringify(s));
chk('C74-2 a score above the test\'s size, or below 0, logs nothing', s.tooMany === 0 && s.negative === 0, JSON.stringify(s));
chk('C74-3 a score is one block per test, keyed to it, by the day or week it was built from',
  s.key && s.b1 && s.b1.q === s.n && s.b1.correct === 7 && s.b1.mode === 'test' && s.b1.test === s.tid && s.b1.sys === '' && /^w:/.test(s.b1.pool) && s.b1.label === s.lab,
  JSON.stringify(s.b1));
chk('C74-4 the test\'s row shows c/n · %, and the panel totals its tests',
  s.rowTxt.includes('7/' + s.n + ' · ' + Math.round(700 / s.n) + '%') && s.meta.includes('Your score on ' + s.lab + ': ' + Math.round(700 / s.n) + '% over 1 test'),
  s.rowTxt + ' | ' + s.meta);
chk('C74-5 a scored test can\'t be put back', !s.backAfter, JSON.stringify(s));
chk('C74-6 it counts in the totals and the weekly goal', s.done === s.n && s.correct === 7 && s.goal === s.n, JSON.stringify(s));
chk('C74-7 it never counts in Accuracy by subject — not even as "Unspecified"; a tagged block still does',
  s.bySys.length === 0 && s.conf === 0 && s.confWithOther === 'Cardiology:12', JSON.stringify(s));
chk('C74-8b a test the day\'s panel doesn\'t list waits under "other tests to score", until it has one',
  s.waitOk && /^1 other test to score/.test(s.waitTxt) && s.waitScored, JSON.stringify({ waitTxt: s.waitTxt, waitOk: s.waitOk, waitScored: s.waitScored }));
chk('C74-8 Edit score opens with the logged number; saving replaces the block and keeps its first day',
  s.prefill === '7' && s.b2 && s.b2.correct === 8 && s.b2.dateISO === s.firstDay && s.goal2 === s.n + 12, JSON.stringify(s));

const m = await p.evaluate(() => {
  const cur = persistObj(); const key = Object.keys(cur.uworld.blocks).find(k => k.indexOf('t_') === 0);
  const stale = JSON.parse(JSON.stringify(cur)); stale.uworld.blocks[key] = Object.assign({}, stale.uworld.blocks[key], { correct: 7, _t: stale.uworld.blocks[key]._t - 60000 });
  const ab = mergeState(cur, stale), ba = mergeState(stale, cur);
  return { self: JSON.stringify(mergeState(cur, cur)) === JSON.stringify(cur),
    ab: ab.uworld.blocks[key].correct, ba: ba.uworld.blocks[key].correct,
    order: JSON.stringify(Object.keys(ab.uworld.blocks)) === JSON.stringify(Object.keys(cur.uworld.blocks)) };
});
chk('C74-9 the newer edit wins over an older copy from another device, either way round', m.ab === 8 && m.ba === 8, JSON.stringify(m));
chk('C74-10 the log merges with itself unchanged, key order kept', m.self && m.order, JSON.stringify(m));

const st = await p.evaluate(() => {
  VIEW = 'stats'; render(); const c = document.querySelector('.uwtstats'); const out = { txt: c ? c.textContent : '' };
  __mk(); VIEW = 'stats'; render(); out.none = !document.querySelector('.uwtstats');
  return out;
});
chk('C74-11 Stats shows the scores by the day or week they were built from',
  /^UWorld tests55% correct2 tests · 20 QsAug 2530%Brody week 180%By the day or week/.test(st.txt), st.txt);
chk('C74-12 …and no card until a test is scored', st.none, JSON.stringify(st));

const L = await p.evaluate(async () => { const out = {}; try {
  const count = () => document.querySelectorAll('#wq_save').length + '/' + document.querySelectorAll('#wq_q').length;
  // a study day, goal on: the logger is in the test panel, not the goal card
  __mk(100); out.day = count(); out.inPanel = !!document.querySelector('.uwt #wq_save'); out.notGoal = !document.querySelector('.wgcard #wq_save');
  // and it logs
  const lg = document.querySelector('.uwtlog'); if (lg) lg.open = true;
  document.getElementById('wq_q').value = '20'; document.getElementById('wq_c').value = '15'; document.getElementById('wq_save').click();
  out.logged = Object.values(practiceLog('uworld').blocks).some(b => b.q === 20 && b.correct === 15 && !b.test);
  // a rest day shows the next study day, test panel and all: the logger goes with it
  const d = isoToDate(todayISO()); const sun = isoFromDate(addDays(d, (7 - d.getDay()) % 7 || 7));
  todayISO = () => sun; CAL_SEL = null; render();
  out.rest = count(); out.restPanel = !!document.querySelector('.uwt #wq_save') && !document.querySelector('.wgcard #wq_save');
  // the last review day before the shelf has no videos and no next day, so no test panel:
  // the weekly-goal card keeps the logger
  __mk(100); const last = SCHED.days[SCHED.days.length - 1]; out.lastReview = !!last.review && !last.items.length;
  todayISO = () => last.iso; CAL_SEL = null; render();
  out.noBnb = count(); out.inGoal = !!document.querySelector('.wgcard #wq_save'); out.noPanel = !document.querySelector('.uwt');
  // studying ahead: the day you picked has the test panel, and the one logger is in it
  __mk(100); CAL_SEL = isoFromDate(addDays(isoToDate(todayISO()), 1)); render();
  out.ahead = count(); out.aheadPanel = !!document.querySelector('.focusbar') && !!document.querySelector('.uwt #wq_save');
} catch (e) { out.err = String(e && e.stack || e); } return out; });
chk('C74-13 on a study day the one logger is in the test panel, not the weekly-goal card', L.day === '1/1' && L.inPanel && L.notGoal, JSON.stringify(L));
chk('C74-14 the moved logger logs a block', L.logged, JSON.stringify(L));
chk('C74-15 on a rest day the logger goes with the next day\'s test panel; with no panel (the last review day) the weekly-goal card keeps it',
  L.rest === '1/1' && L.restPanel && L.lastReview && L.noBnb === '1/1' && L.inGoal && L.noPanel, JSON.stringify(L));
chk('C74-16 studying ahead, the one logger is in that day\'s test panel', L.ahead === '1/1' && L.aheadPanel, JSON.stringify(L));

chk('C74-17 no uncaught page errors', errors.length === 0 && !s.err && !L.err, (s.err || L.err || '') + errors.slice(0, 3).join(' | '));
await close();
process.exit(report() ? 1 : 0);
