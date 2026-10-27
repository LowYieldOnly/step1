/* C77 · Study: a calendar that rolls with the weeks, and no practice chip.
 *
 *   - The calendar on Study starts on the Sunday of the current week and shows four weeks
 *     (28 days), today among them; its header names the range, and a month's name sits on
 *     the first day shown and on each 1st.
 *   - It rolls: a week later, the first day shown is the next Sunday and the finished week
 *     is gone. › and ‹ page four weeks; Today comes back to this week and selects today.
 *     Tapping a day still opens it.
 *   - The practice-question chip under today's videos is gone.
 */
import { openApp, checker } from '../harness.mjs';

const { page: p, errors, close } = await openApp();
const { chk, report } = checker('Study — a calendar that rolls with the weeks');

const r = await p.evaluate(() => {
  let today = '2026-10-27';
  const b = brodyBlockById('msk-skin'); AUTHED = true; todayISO = () => today;
  S.settings = { seenBrodyHelp: true, seenUpdate: LATEST_UPDATE };
  PRACTICE_KEYS.forEach(k => { S[k] = { total: null, blocks: {} }; });
  addPracticeBlock('uworld', { sys: '', q: 40, correct: 26 });
  S.cfgs = { step1: null, nbme: { examType: 'nbme', brody: b.id, examLabel: b.name, examISO: b.shelf, startISO: b.weeks[0].start, restDays: [0],
    resources: { bnb: true }, systems: b.systems.slice(), brodyReviewDays: 3, brodyJoinWk: 1, brodyJoinDate: b.weeks[0].start } };
  normalizeCfg(S.cfgs.nbme, 'nbme'); activate('nbme'); S.active = 'nbme'; VIEW = 'today'; CAL_SEL = null; CAL_WKOFF = 0; reflow(); render();
  const cells = () => [...document.querySelectorAll('.studycal .calgrid [data-cal]')].map(c => c.dataset.cal);
  const head = () => document.querySelector('.studycal .calmon').textContent;
  const out = {}; try {
  out.chip = !!document.querySelector('[data-gouworld]') || /Qs correct/.test(document.getElementById('app').textContent);
  const c0 = cells(); out.n = c0.length; out.first = c0[0]; out.last = c0[c0.length - 1]; out.hasToday = c0.includes(today);
  out.firstDow = isoToDate(c0[0]).getDay(); out.head = head();
  const lab = iso => (document.querySelector('.studycal [data-cal="' + iso + '"] .cd') || {}).textContent;
  out.labFirst = lab(c0[0]); out.labNov1 = lab('2026-11-01'); out.labPlain = lab('2026-10-28');
  out.todayCell = !!document.querySelector('.studycal [data-cal="' + today + '"].today');
  // a week later
  today = '2026-11-03'; CAL_SEL = null; render();
  const c1 = cells(); out.rolledFirst = c1[0]; out.rolledGone = !c1.includes('2026-10-27'); out.rolledN = c1.length;
  // page ahead, back, and Today
  document.getElementById('calNext').click(); out.next = cells()[0];
  document.getElementById('calPrev').click(); document.getElementById('calPrev').click(); out.prev = cells()[0];
  document.getElementById('calToday').click(); out.back = cells()[0]; out.sel = CAL_SEL;
  // tapping a day opens it
  const day = document.querySelector('.studycal [data-cal="2026-11-05"]'); if (day) day.click();
  out.opened = !!day && CAL_SEL === '2026-11-05' && /Thu, Nov 5/.test(document.getElementById('app').textContent);
  } catch (e) { out.err = String(e && e.stack || e); }
  return out;
});
chk('C77-1 the practice-question chip is gone from Study', !r.chip, JSON.stringify(r));
chk('C77-2 the calendar shows four weeks, Sunday to Saturday, starting this week, with today in it',
  r.n === 28 && r.firstDow === 0 && r.first === '2026-10-25' && r.last === '2026-11-21' && r.hasToday && r.todayCell, JSON.stringify(r));
chk('C77-3 the header names the range, and the month sits on the first day shown and on each 1st',
  r.head === 'Oct 25 – Nov 21' && r.labFirst === 'Oct 25' && r.labNov1 === 'Nov 1' && r.labPlain === '28', JSON.stringify({ head: r.head, first: r.labFirst, nov1: r.labNov1, plain: r.labPlain }));
chk('C77-4 a week later it has rolled: it starts the next Sunday and the finished week is gone',
  r.rolledFirst === '2026-11-01' && r.rolledGone && r.rolledN === 28, JSON.stringify({ first: r.rolledFirst, gone: r.rolledGone }));
chk('C77-5 › and ‹ page four weeks; Today comes back to this week and selects today',
  r.next === '2026-11-29' && r.prev === '2026-10-04' && r.back === '2026-11-01' && r.sel === '2026-11-03', JSON.stringify({ next: r.next, prev: r.prev, back: r.back, sel: r.sel }));
chk('C77-6 tapping a day still opens it', r.opened, '');

chk('C77-7 no uncaught page errors', errors.length === 0 && !r.err, (r.err || '') + errors.slice(0, 3).join(' | '));
await close();
process.exit(report() ? 1 : 0);
