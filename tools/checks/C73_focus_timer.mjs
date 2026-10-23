/* C73 · The focus timer replaces the daily quote.
 *
 *   - Study shows a Pomodoro focus timer where the quote was; the quotes are gone everywhere.
 *   - Time is logged as it is actually run: an interval that ends logs its length and a
 *     session; a pause logs what ran; one that ended while the app was closed is logged
 *     once, not again on every render.
 *   - Focus → short break, and a long break after every Nth focus session.
 *   - The log syncs: per device, so two devices' time on one day adds up; it merges with
 *     itself unchanged; a profile from before it existed merges cleanly.
 *   - Stats shows the week's focus time.
 */
import { openApp, checker } from '../harness.mjs';

const { page: p, errors, close } = await openApp();
const { chk, report } = checker('Focus timer in place of the daily quote');

await p.evaluate(() => {
  window.__mk = () => {
    const b = brodyBlockById('msk-skin');
    AUTHED = true; todayISO = () => '2026-10-23';
    S.settings = { seenBrodyHelp: true, seenUpdate: LATEST_UPDATE };
    PRACTICE_KEYS.forEach(k => { S[k] = { total: null, blocks: {} }; });
    Object.assign(S, { vdone: {}, vdoneDate: {}, vdoneAt: {}, vundone: {}, vskip: {}, vshaky: {}, akdone: {}, notes: {}, streak: { days: {} }, assessments: {}, uwq: {}, uwt: {}, pomo: {}, _resetAt: 0 });
    S.cfgs = { step1: null, nbme: { examType: 'nbme', brody: b.id, examLabel: b.name, examISO: b.shelf, startISO: b.weeks[0].start, restDays: [0],
      resources: { bnb: true }, systems: b.systems.slice(), brodyReviewDays: 3, brodyJoinWk: 1, brodyJoinDate: b.weeks[0].start } };
    normalizeCfg(S.cfgs.nbme, 'nbme'); activate('nbme'); S.active = 'nbme'; VIEW = 'today';
    store.set(POMO_KEY, ''); reflow(); render();
  };
});

const r = await p.evaluate(() => { const out = {}; try {
  __mk();
  out.card = !!document.getElementById('pomoCard'); out.clock = (document.getElementById('pomoClock') || {}).textContent;
  out.noQuote = !document.querySelector('.cheer') && typeof QUOTES === 'undefined' && typeof cheerHTML === 'undefined';
  // start, then pretend 10 minutes ran and pause: 600 s logged
  document.querySelector('[data-pomo="start"]').click();
  let st = pomoGet(); st.startedAt -= 600000; st.endsAt -= 600000; pomoPut(st);
  render(); document.querySelector('[data-pomo="pause"]').click();
  out.paused = pomoDay(todayISO()).f;
  // resume, let the rest of the 25 minutes run out: the whole session is logged once
  document.querySelector('[data-pomo="start"]').click();
  st = pomoGet(); const rem = st.endsAt - Date.now(); st.startedAt -= rem; st.endsAt -= rem; pomoPut(st);
  pomoTick();
  const d = pomoDay(todayISO()); out.after1 = d; out.mode1 = pomoGet().mode;
  render(); render(); out.notTwice = pomoDay(todayISO()).f === d.f && pomoDay(todayISO()).n === d.n;
  // a break that ended while the app was closed: logged once on the next open
  document.querySelector('[data-pomo="start"]').click();
  st = pomoGet(); const len = st.endsAt - st.startedAt; st.startedAt = Date.now() - len - 60000; st.endsAt = Date.now() - 60000; pomoPut(st);
  render(); render();
  out.breakLogged = pomoDay(todayISO()).b; out.mode2 = pomoGet().mode;
  // the long break comes after every Nth focus session
  S.settings.pomo = { every: 2 }; let seq = []; pomoPut({ mode: 'focus', running: false, left: pomoLen('focus'), cycle: 0 });   // a fresh cycle
  for (let i = 0; i < 4; i++) { const g = pomoGet(); g.running = true; g.len = pomoLen(g.mode); g.startedAt = Date.now() - 1000; g.endsAt = Date.now() - 1; pomoPut(g); pomoFinish(g, true); seq.push(pomoGet().mode); }
  out.seq = seq;
  // lengths are adjustable
  S.settings.pomo = { focus: 50 }; const z = { mode: 'focus', running: false, left: pomoLen('focus'), cycle: 0 }; pomoPut(z); render();
  out.clock50 = document.getElementById('pomoClock').textContent;
  // Stats: the week's focus time
  VIEW = 'stats'; render(); out.stats = /Focus time/.test(document.body.innerText); VIEW = 'today'; render();
  } catch (e) { out.err = String(e); }   // a broken timer fails the checks below, rather than crashing the run
  return out;
});
chk('C73-0 the timer runs through every step without an error', !r.err, r.err || '');
chk('C73-1 Study shows the focus timer where the quote was, and the quotes are gone', r.card && r.clock === '25:00' && r.noQuote, JSON.stringify(r));
chk('C73-2 a pause logs exactly what ran', r.paused === 600, 'logged ' + r.paused + ' s');
chk('C73-3 a focus session that runs out logs its full length and one session, then lines up a break',
  !!r.after1 && r.after1.f === 1500 && r.after1.n === 1 && r.mode1 === 'short', JSON.stringify(r.after1) + ' → ' + r.mode1);
chk('C73-4 …and re-rendering never logs it twice', r.notTwice, JSON.stringify(r));
chk('C73-5 a break that ended while the app was closed is logged once, on the next open', r.breakLogged === 300 && r.mode2 === 'focus', JSON.stringify(r));
chk('C73-6 a long break comes after every Nth focus session', JSON.stringify(r.seq) === JSON.stringify(['short', 'focus', 'long', 'focus']), JSON.stringify(r.seq));
chk('C73-7 the lengths are the student\'s to set', r.clock50 === '50:00', r.clock50);
chk('C73-8 Stats shows the week\'s focus time', r.stats, '');

const m = await p.evaluate(() => {
  __mk();
  const A = persistObj(); A.pomo = { '2026-10-23': { dA: { f: 1500, b: 300, n: 1 } } };
  const B = JSON.parse(JSON.stringify(A)); B.pomo = { '2026-10-23': { dA: { f: 900, b: 0, n: 0 }, dB: { f: 600, b: 0, n: 1 } } };
  const mAB = mergeState(A, B);
  S.pomo = mAB.pomo; const day = pomoDay('2026-10-23');
  const old = JSON.parse(JSON.stringify(A)); delete old.pomo;
  return { self: JSON.stringify(mergeState(mAB, mAB)) === JSON.stringify(mAB), day,
    keepsOld: JSON.stringify(mergeState(A, old).pomo) === JSON.stringify(A.pomo) };
});
chk('C73-9 two devices\' focus time on one day adds up, and neither overwrites the other', m.day.f === 2100 && m.day.n === 2 && m.day.b === 300, JSON.stringify(m.day));
chk('C73-10 the log merges with itself unchanged, and with a profile from before it existed', m.self && m.keepsOld, JSON.stringify(m));
chk('C73-11 no uncaught page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
await close();
process.exit(report() ? 1 : 0);
