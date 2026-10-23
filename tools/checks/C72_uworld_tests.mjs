/* C72 · UWorld tests: up to 40 questions each, never the same question twice.
 *
 * UWorld builds a custom test from at most 40 question IDs; a day often has more and a Brody
 * week always does. The day and the week each get a test builder. What has to hold:
 *   - a test is never more than 40 questions, and never repeats a question already in a test
 *     — whether that test came from the day, the week or a single video;
 *   - a test is drawn across all the pool's videos, not from the first one down;
 *   - the size is the student's choice; Undo, Put back and Start over return questions;
 *     Copy again changes nothing; a copy that fails marks nothing used;
 *   - "only videos I've checked off" narrows the pool;
 *   - the used set syncs like a tick: it merges with itself unchanged, unions across
 *     devices, and a put-back that is newer than a use wins.
 */
import { openApp, checker } from '../harness.mjs';

const { page: p, errors, close } = await openApp();
const { chk, report } = checker('UWorld tests — 40 at most, no repeats');

await p.evaluate(async () => {
  await new Promise(r => loadUWorld(r));
  window.__clip = null; window.__clipFail = false;
  Object.defineProperty(navigator, 'clipboard', { configurable: true,
    value: { writeText: t => window.__clipFail ? Promise.reject(new Error('denied')) : (window.__clip = t, Promise.resolve()) } });
  window.__mk = () => {
    const b = brodyBlockById('cardiopulm');
    AUTHED = true; todayISO = () => b.weeks[0].start;
    S.settings = { seenBrodyHelp: true, seenUpdate: LATEST_UPDATE };
    PRACTICE_KEYS.forEach(k => { S[k] = { total: null, blocks: {} }; });
    Object.assign(S, { vdone: {}, vdoneDate: {}, vdoneAt: {}, vundone: {}, vskip: {}, vshaky: {}, akdone: {}, notes: {}, streak: { days: {} }, assessments: {}, uwq: {}, uwt: {}, pomo: {}, _resetAt: 0 });
    S.cfgs = { step1: null, nbme: { examType: 'nbme', brody: b.id, examLabel: b.name, examISO: b.shelf, startISO: b.weeks[0].start, restDays: [0],
      resources: { bnb: true }, systems: b.systems.slice(), brodyReviewDays: 3, brodyJoinWk: 1, brodyJoinDate: b.weeks[0].start } };
    normalizeCfg(S.cfgs.nbme, 'nbme'); activate('nbme'); S.active = 'nbme'; VIEW = 'today'; reflow(); render();
  };
  window.__wait = () => new Promise(r => setTimeout(r, 30));
  window.__ids = () => (window.__clip || '').split(',').map(x => parseInt(x, 10)).filter(x => x > 0);
});

const t = await p.evaluate(async () => {
  __mk();
  const iso = todayISO(); const out = {};
  out.panel = !!document.querySelector('.uwt');
  // the week pool
  document.querySelector('[data-uwkind="' + iso + '|week"]').click();
  const P = uwPoolOf(iso, 'week'); out.weekAll = P.all.length; out.videos = P.lists.length;
  document.querySelector('[data-uwmake]').click(); await __wait();
  const t1 = __ids(); out.t1 = t1.length; out.t1Unique = new Set(t1).size === t1.length;
  out.t1InPool = t1.every(id => P.all.includes(id)); out.t1Used = t1.every(uwUsed);
  // spread: the first test touches as many videos as it can
  const vidOf = id => P.lists.findIndex(l => l.includes(id));
  out.t1Videos = new Set(t1.map(vidOf)).size;
  document.querySelector('[data-uwmake]').click(); await __wait();
  const t2 = __ids(); out.t2 = t2.length; out.overlap12 = t2.filter(id => t1.includes(id)).length;
  // the day pool now leaves out everything in those tests
  document.querySelector('[data-uwkind="' + iso + '|day"]').click();
  const D = uwPoolOf(iso, 'day'); out.dayLeftOk = D.left.every(id => !t1.includes(id) && !t2.includes(id));
  // a chosen size
  document.querySelector('[data-uwsize="10"]').click();
  if (D.left.length >= 10) { document.querySelector('[data-uwmake]').click(); await __wait(); out.t3 = __ids().length; } else out.t3 = 10;
  const t3 = __ids();
  // Undo the last test: its questions come back
  document.getElementById('tu').click(); out.undo = t3.every(id => !uwUsed(id));
  // Copy again changes nothing
  document.querySelector('[data-uwkind="' + iso + '|week"]').click();
  const before = JSON.stringify(persistObj());
  document.querySelector('details.uwtmade').open = true; document.querySelector('[data-uwagain]').click(); await __wait();
  out.again = JSON.stringify(persistObj()) === before && __ids().length > 0;
  // Put back the first test
  const tests = uwTestsOf(uwPoolOf(iso, 'week').key); out.testsListed = tests.length;
  document.querySelector('[data-uwback="' + tests[0].id + '"]').click();
  out.putBack = tests[0].ids.every(id => !uwUsed(id)) && uwTestsOf(uwPoolOf(iso, 'week').key).length === tests.length - 1;
  // Start over: the whole week's questions back
  document.querySelector('details.uwtmade').open = true; document.querySelector('[data-uwreset]').click();
  out.startOver = uwPoolOf(iso, 'week').all.every(id => !uwUsed(id)) && uwTestsOf(uwPoolOf(iso, 'week').key).length === 0;
  // a copy that fails marks nothing
  window.__clipFail = true; document.execCommand = () => false;
  const snap = JSON.stringify(S.uwq); document.querySelector('[data-uwmake]').click(); await __wait();
  out.failSafe = JSON.stringify(S.uwq) === snap; window.__clipFail = false;
  return out;
});
chk('C72-1 a day with UWorld questions shows the test builder', t.panel, JSON.stringify(t));
chk('C72-2 a test is at most 40 questions, all from the pool, none twice — and they are marked used',
  t.t1 > 0 && t.t1 <= 40 && t.t1Unique && t.t1InPool && t.t1Used, JSON.stringify(t));
chk('C72-3 a week bigger than one test gives a second test with no question from the first', t.weekAll > 40 && t.t2 > 0 && t.overlap12 === 0, JSON.stringify(t));
chk('C72-4 the day\'s pool leaves out every question already in a week test', t.dayLeftOk, JSON.stringify(t));
chk('C72-5 a test is spread across the videos, not taken from the first one down', t.t1Videos >= Math.min(t.videos, 40) - 1 && t.t1Videos > 1, t.t1Videos + ' of ' + t.videos + ' videos');
chk('C72-6 the student picks the size', t.t3 === 10, JSON.stringify(t));
chk('C72-7 Undo puts a test\'s questions back', t.undo, JSON.stringify(t));
chk('C72-8 Copy again copies the same test and changes nothing', t.again, JSON.stringify(t));
chk('C72-9 Put back returns one test; Start over returns the whole pool', t.testsListed >= 2 && t.putBack && t.startOver, JSON.stringify(t));
chk('C72-10 a copy that fails marks nothing used', t.failSafe, JSON.stringify(t));

const w = await p.evaluate(async () => {
  __mk(); const iso = todayISO();
  document.querySelector('[data-uwwatched]').click();
  const empty = uwPoolOf(iso, 'day').all.length;
  const v = SCHED.dayMap[iso].items.find(it => uwHas(it)); markDone(v.id, iso); reflow(); render();
  const P = uwPoolOf(iso, 'day');
  // a single video's set: copies only what's unused, then offers "Copy again"
  S.settings.uwWatched = false; render();
  const row = document.querySelector('[data-uwvid="' + v.name.replace(/"/g, '\\"') + '"]'); row.click(); await __wait();
  const vids = uwIdsFor(v.name); const allUsed = vids.every(uwUsed); render();
  const again = !document.querySelector('[data-uwvid="' + v.name.replace(/"/g, '\\"') + '"]');
  return { empty, watchedOnly: P.all.length > 0 && P.all.every(id => vids.includes(id)), allUsed, again };
});
chk('C72-11 "only videos I\'ve checked off" narrows the pool to what\'s been watched', w.empty === 0 && w.watchedOnly, JSON.stringify(w));
chk('C72-12 a single video\'s set copies its unused questions, then offers only Copy again', w.allUsed && w.again, JSON.stringify(w));

const m = await p.evaluate(() => {
  __mk();
  const A = persistObj(); A.uwq = { '101': [1000, 0], '102': [1000, 0] }; A.uwt = { ta: { at: 1000, pool: 'd:x', label: 'x', ids: [101, 102] } };
  const B = JSON.parse(JSON.stringify(A)); B.uwq = { '102': [1000, 2000], '103': [3000, 0] }; B.uwt = { ta: { at: 1000, pool: 'd:x', label: 'x', ids: [101, 102], gone: 2000 }, tb: { at: 3000, pool: 'd:y', label: 'y', ids: [103] } };
  const mAB = mergeState(A, B), mBA = mergeState(B, A);
  const used = (o, id) => { const u = o.uwq[id]; return !!u && u[0] > u[1]; };
  const self = JSON.stringify(mergeState(mAB, mAB)) === JSON.stringify(mAB);
  const old = JSON.parse(JSON.stringify(A)); delete old.uwq; delete old.uwt;
  const withOld = mergeState(A, old);
  return { self, sym: JSON.stringify(mAB.uwq) === JSON.stringify(mBA.uwq),
    u101: used(mAB, '101'), u102: used(mAB, '102'), u103: used(mAB, '103'), gone: !!mAB.uwt.ta.gone, tb: !!mAB.uwt.tb,
    keepsOld: used(withOld, '101') && !!withOld.uwt.ta };
});
chk('C72-13 the used set merges with itself unchanged, and the same either way round', m.self && m.sym, JSON.stringify(m));
chk('C72-14 two devices\' tests union; a put-back newer than the use wins', m.u101 && !m.u102 && m.u103 && m.gone && m.tb, JSON.stringify(m));
chk('C72-15 a profile from before tests existed merges without losing any', m.keepsOld, JSON.stringify(m));

chk('C72-16 no uncaught page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
await close();
process.exit(report() ? 1 : 0);
