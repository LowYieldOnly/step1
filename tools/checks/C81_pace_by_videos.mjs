/* C81 · Pace by number of videos.
 *
 * A Brody plan can pace by a flat number of videos a day instead of hours of video
 * (Dylan, 2026-11-08). Hours stays the default. What has to hold:
 *   - a plan starts on hours, and the Plan editor offers both;
 *   - switching to videos stamps the recommended count (same quiz-ready / exam-ready rule as
 *     the hours, counted in videos) and every study day then holds that many videos, the last
 *     one possibly fewer, however long they run; nothing is dropped;
 *   - the stepper moves the count by one video; videos checked off on a day still count
 *     against it, so a check-off never pulls tomorrow's video forward;
 *   - the day label, the Today line, the banner and the summary all read in videos;
 *   - re-fit moves the count, not the hours, and undo puts it back; even pace re-stamps it;
 *   - a content change re-derives the count, like the hours;
 *   - switching back to hours gives exactly the schedule hours gave before;
 *   - setup offers the same choice, and the plan it builds carries it; left alone, a new plan
 *     is on hours.
 */
import { openApp, checker } from '../harness.mjs';

const { page: p, errors, close } = await openApp();
const { chk, report } = checker('Pace by number of videos');

await p.evaluate(() => {
  window.__mk = (unit, res, today) => {
    const b = brodyBlockById(unit); const t = today || b.weeks[0].start; todayISO = () => t;
    AUTHED = true; S.settings = { seenBrodyHelp: true, seenUpdate: LATEST_UPDATE };
    PRACTICE_KEYS.forEach(k => { S[k] = { total: null, blocks: {} }; });
    Object.assign(S, { vdone: {}, vdoneDate: {}, vdoneAt: {}, vundone: {}, vskip: {}, vshaky: {}, uwq: {}, uwt: {} });
    S.cfgs = { step1: null, nbme: { examType: 'nbme', brody: b.id, examLabel: b.name, examISO: b.shelf, startISO: b.weeks[0].start, restDays: [0],
      resources: Object.assign({}, res), systems: b.systems.slice(), brodyReviewDays: 3, brodyJoinWk: 1, brodyJoinDate: b.weeks[0].start } };
    normalizeCfg(S.cfgs.nbme, 'nbme'); activate('nbme'); S.active = 'nbme'; VIEW = 'today'; CAL_SEL = null; reflow(); render();
    return S.cfg;
  };
  window.__vids = d => d.items.filter(x => !x.art);
  // what each content day holds, by id, in order
  window.__shape = () => SCHED.days.filter(d => !d.past && __vids(d).length).map(d => d.iso + ':' + __vids(d).map(x => x.id).join(','));
  window.__edit = () => { VIEW = 'adjust'; ADJ_VIEW = 'edit'; render(); };
  window.__q = sel => [...document.querySelectorAll(sel)];
});

// ---------- 1. default is hours; the Plan editor offers both ----------
const def = await p.evaluate(() => {
  const c = __mk('gi-multisystem', { bnb: true, pathoma: true, skpharm: true, skmicro: true });
  const out = { paceVids: paceVids(c), paceBy: c.paceBy, vidPerDay: c.vidPerDay, schedVids: SCHED.paceVids, shape: __shape(), n: SCHED.planVideos.length };
  __edit();
  out.tog = __q('[data-paceby]').map(b => b.dataset.paceby + (b.classList.contains('on') ? '*' : ''));
  out.val = (document.querySelector('.paceval') || {}).textContent;
  window.__hoursShape = out.shape;
  return out;
});
chk('C81-1 a Brody plan starts paced by hours',
  def.paceVids === false && def.paceBy === undefined && def.vidPerDay === undefined && !def.schedVids,
  JSON.stringify({ paceBy: def.paceBy, vidPerDay: def.vidPerDay }));
chk('C81-2 the Plan editor offers Hours of video and Number of videos, hours on',
  def.tog.join() === 'hours*,videos' && /^[\d.]+ h/.test(def.val), def.tog.join() + ' · ' + def.val);

// ---------- 2. switch to videos ----------
const sw = await p.evaluate(() => {
  document.querySelector('[data-paceby="videos"]').click();
  const c = S.cfg, N = c.vidPerDay;
  const content = SCHED.days.filter(d => !d.past && !d.review && __vids(d).length);
  const counts = content.map(d => __vids(d).length);
  const ids = new Set(); SCHED.days.forEach(d => __vids(d).forEach(x => ids.add(x.id)));
  const mins = content.map(d => __vids(d).reduce((a, x) => a + x.min, 0));
  return { paceBy: c.paceBy, N, rec: brodyRecVids(c), loadsRec: brodyRecommendedVids(brodyWeekLoads(c, brodyBlock(c))), brodyPace: c.brodyPace,
    counts, allButLast: counts.slice(0, -1).every(n => n === N), last: counts[counts.length - 1], placed: ids.size, n: SCHED.planVideos.length,
    spread: Math.max(...mins) - Math.min(...mins),
    // at the recommended count every week is done by its quiz
    late: (SCHED.weekLoad || []).filter(w => w.deadline && !w.heavy).map(w => [w.n, SCHED.days.filter(d => d.iso > w.deadline).reduce((a, d) => a + __vids(d).filter(x => x.wk <= w.n).length, 0)]).filter(x => x[1] > 0),
    weeks: (SCHED.weekLoad || []).filter(w => w.deadline).length,
    tog: __q('[data-paceby]').map(b => b.dataset.paceby + (b.classList.contains('on') ? '*' : '')).join(),
    val: (document.querySelector('.paceval') || {}).textContent, banner: (document.querySelector('.pacebanner') || {}).textContent || '',
    kv: __q('.kvl').map(e => e.textContent).join('|') };
});
chk('C81-3 Number of videos stamps the recommended count on the plan',
  sw.paceBy === 'videos' && sw.N > 0 && sw.N === sw.rec && sw.N === sw.loadsRec, 'N ' + sw.N + ', rec ' + sw.rec);
chk('C81-4 every study day holds that many videos, the last one up to it',
  sw.counts.length > 1 && sw.allButLast && sw.last >= 1 && sw.last <= sw.N, sw.counts.join(' '));
chk('C81-4b …and at that count every week is watched before its quiz',
  sw.weeks > 1 && sw.late.length === 0, sw.weeks + ' weeks, late ' + JSON.stringify(sw.late));
chk('C81-5 …and no video is dropped', sw.placed === sw.n && sw.n === def.n, sw.placed + ' of ' + sw.n);
chk('C81-6 the days are a headcount, so their lengths differ', sw.spread > 30, 'spread ' + sw.spread + ' min');
chk('C81-7 the editor shows the count, its toggle and its banner in videos',
  sw.tog === 'hours,videos*' && new RegExp('^' + sw.N + '\\s*videos').test(sw.val)
    && /videos to watch/.test(sw.banner) && /Paced by number of videos/.test(sw.banner) && !/h\/day/.test(sw.banner)
    && /videos \/ day/.test(sw.kv),
  sw.val + ' · ' + sw.banner.slice(0, 120));

// ---------- 3. the stepper ----------
const st = await p.evaluate(() => {
  const N = S.cfg.vidPerDay;
  document.querySelector('[data-fpace="inc"]').click();
  const up = S.cfg.vidPerDay, c1 = SCHED.days.filter(d => !d.past && !d.review && __vids(d).length).map(d => __vids(d).length);
  document.querySelector('[data-fpace="dec"]').click(); document.querySelector('[data-fpace="dec"]').click();
  const down = S.cfg.vidPerDay;
  document.querySelector('[data-fpace="inc"]').click();
  return { N, up, down, back: S.cfg.vidPerDay, first: c1[0], pace: S.cfg.brodyPace };
});
chk('C81-8 the stepper moves the count one video at a time, and the days follow',
  st.up === st.N + 1 && st.first === st.N + 1 && st.down === st.N - 1 && st.back === st.N, JSON.stringify(st));

// ---------- 4. check-offs count against the day ----------
const ck = await p.evaluate(() => {
  VIEW = 'today'; render();
  const today = todayISO(), N = S.cfg.vidPerDay;
  const day = () => SCHED.days.find(d => d.iso === today);
  const before = __shape(), lab0 = dayTimeLabel(day());
  const two = __vids(day()).slice(0, 2);
  two.forEach(v => markDone(v.id, today)); reflow(); render();
  const lab1 = dayTimeLabel(day()), after = __shape();
  const tomorrowSame = before.slice(1).join('|') === after.slice(1).join('|');
  const hero = (document.querySelector('.herostat') || {}).textContent || '';
  __vids(day()).forEach(v => markDone(v.id, today)); reflow(); render();
  const lab2 = dayTimeLabel(day());
  return { N, lab0, lab1, lab2, tomorrowSame, todayN: __vids(day()).length, hero };
});
chk('C81-9 a day reads in videos: N, then x of N left, then ✓',
  ck.lab0 === ck.N + ' videos' && ck.lab1 === (ck.N - 2) + ' of ' + ck.N + ' left' && ck.lab2 === '✓ ' + ck.N + ' videos',
  [ck.lab0, ck.lab1, ck.lab2].join(' → '));
chk('C81-10 checking videos off never pulls the next day forward',
  ck.tomorrowSame && ck.todayN === ck.N, 'today ' + ck.todayN + ', rest unchanged ' + ck.tomorrowSame);
chk('C81-11 the Today line reads in videos/day', /videos\/day/.test(ck.hero) && !/h\/day/.test(ck.hero), ck.hero.slice(0, 120));

// ---------- 5. re-fit moves the count; undo restores it ----------
const rf = await p.evaluate(() => {
  const c = __mk('gi-multisystem', { bnb: true, pathoma: true, skpharm: true, skmicro: true });
  setPaceBy(c, 'videos'); reflow();
  const rec = c.vidPerDay, hours = c.brodyPace;
  c.vidPerDay = rec + 10; reflow(); render();
  const d = brodyRefitDelta(c);
  let undo = null; const tu = window.toastUndo; window.toastUndo = (msg, fn) => { undo = fn; window.__msg = msg; };
  brodyRefit();
  window.toastUndo = tu;
  const after = c.vidPerDay, hoursAfter = c.brodyPace, msg = String(window.__msg || '');
  if (undo) undo();
  return { rec, d, after, hours, hoursAfter, msg, undone: c.vidPerDay };
});
chk('C81-12 re-fit sees a count set too high and brings it back down, hours untouched',
  rf.d && rf.d.easier && rf.d.rec === rf.rec && rf.after === rf.rec && rf.hoursAfter === rf.hours,
  JSON.stringify({ d: rf.d, after: rf.after, hours: [rf.hours, rf.hoursAfter] }));
chk('C81-13 …it says so in videos, and undo puts the count back',
  /videos\/day/.test(rf.msg) && !/h\/day/.test(rf.msg) && rf.undone === rf.rec + 10, rf.msg.replace(/<[^>]+>/g, ' ').slice(0, 140) + ' · undone ' + rf.undone);

const bh = await p.evaluate(() => {
  const b = brodyBlockById('gi-multisystem');
  const c = __mk('gi-multisystem', { bnb: true, pathoma: true, skpharm: true, skmicro: true });
  setPaceBy(c, 'videos'); reflow();
  const N = c.vidPerDay;
  // a study day goes by with nothing watched
  const open = SCHED.days.filter(d => __vids(d).length).map(d => d.iso);
  const t = open[1]; todayISO = () => t; reflow(); render();
  const d = brodyRefitDelta(c);
  return { N, d, hero: (document.querySelector('.herostat') || {}).textContent || '' };
});
chk('C81-13b behind, the Today line says so in videos',
  bh.d && !bh.d.easier && new RegExp('^Behind at ' + bh.N + ' videos/day').test(bh.hero) && new RegExp('~' + bh.d.rec + ' videos/day').test(bh.hero) && !/h\/day/.test(bh.hero),
  bh.hero.slice(0, 140));

// ---------- 6. even pace and content changes re-derive the count ----------
const re = await p.evaluate(() => {
  const c = __mk('gi-multisystem', { bnb: true, pathoma: true, skpharm: true, skmicro: true });
  setPaceBy(c, 'videos'); reflow();
  const quiz = c.vidPerDay;
  let tu = window.toastUndo; window.toastUndo = () => {};
  setBrodyFree(c, true); window.toastUndo = tu;
  const free = c.vidPerDay, freeRec = brodyRecVids(c);
  setBrodyFree(c, false);
  __edit();
  const n0 = brodyRecVids(c);
  document.querySelector('[data-ctype]').click();   // a content type off: the count re-derives
  const n1 = c.vidPerDay, rec1 = brodyRecVids(c);
  return { quiz, free, freeRec, n0, n1, rec1, by: c.paceBy };
});
chk('C81-14 even pace re-stamps the count at its own recommendation',
  re.free === re.freeRec && re.free <= re.quiz, 'quiz ' + re.quiz + ' → even ' + re.free);
chk('C81-15 a content change re-derives the count and stays on videos',
  re.by === 'videos' && re.n1 === re.rec1, JSON.stringify(re));

// ---------- 7. back to hours is exactly the hours schedule ----------
const bk = await p.evaluate(() => {
  const c = __mk('gi-multisystem', { bnb: true, pathoma: true, skpharm: true, skmicro: true });
  const h0 = __shape();
  __edit(); document.querySelector('[data-paceby="videos"]').click();
  const v = __shape();
  document.querySelector('[data-paceby="hours"]').click();
  return { same: __shape().join('|') === h0.join('|'), differs: v.join('|') !== h0.join('|'), by: c.paceBy, vp: c.vidPerDay,
    val: (document.querySelector('.paceval') || {}).textContent };
});
chk('C81-16 switching back to hours clears the count and gives the hours schedule again',
  bk.same && bk.differs && bk.by === undefined && bk.vp === undefined && /^[\d.]+ h/.test(bk.val), JSON.stringify(bk));

// ---------- 8. setup ----------
const ob = await p.evaluate(() => {
  const blk = brodyBlockById('gi-multisystem');
  const fresh = () => { AUTHED = true; todayISO = () => blk.weeks[0].start;
    S.settings = { seenBrodyHelp: true, seenUpdate: LATEST_UPDATE };
    PRACTICE_KEYS.forEach(k => { S[k] = { total: null, blocks: {} }; });
    Object.assign(S, { vdone: {}, vdoneDate: {}, vdoneAt: {}, vundone: {}, vskip: {}, vshaky: {}, akdone: {}, notes: {}, streak: { days: {} }, assessments: {}, _resetAt: 0 });
    S.cfgs = { step1: null, nbme: null }; S.cfg = null; S.active = null;
    startOnboard('nbme', true);
    _ob.brody = blk.id; _ob.systems = blk.systems.slice(); _ob.resources = { bnb: true, pathoma: true, skpharm: true, skmicro: true };
    _ob.step = obSteps(_ob).indexOf('routine'); renderOnboard(); };
  const out = {};
  fresh();
  out.tog = __q('[data-obpaceby]').map(b => b.dataset.obpaceby + (b.classList.contains('on') ? '*' : '')).join();
  out.unit0 = document.getElementById('ob_paceunit').textContent;
  commitOnboard();
  out.plainBy = S.cfg.paceBy; out.plainVp = S.cfg.vidPerDay;
  fresh();
  document.querySelector('[data-obpaceby="videos"]').click();
  out.rec = brodyRecVids(_ob);
  out.val = document.getElementById('ob_paceval').textContent; out.unit = document.getElementById('ob_paceunit').textContent;
  out.help = document.getElementById('ob_pacehelp').textContent;
  document.querySelector('[data-opace="inc"]').click();
  out.inc = _ob.vidPerDay; out.val2 = document.getElementById('ob_paceval').textContent;
  out.review = obReviewHTML(_ob).replace(/<[^>]+>/g, ' ');
  commitOnboard();
  out.by = S.cfg.paceBy; out.vp = S.cfg.vidPerDay; reflow();
  out.first = (SCHED.days.find(d => __vids(d).length) || { items: [] }).items.filter(x => !x.art).length;
  return out;
});
chk('C81-17 setup offers both, hours on, and a plan left alone is built on hours',
  ob.tog === 'hours*,videos' && /of video/.test(ob.unit0) && ob.plainBy === undefined && ob.plainVp === undefined,
  ob.tog + ' · ' + ob.unit0 + ' · built ' + ob.plainBy + '/' + ob.plainVp);
chk('C81-18 choosing videos in setup shows the recommended count, in videos',
  ob.val === String(ob.rec) && /videos? · per day/.test(ob.unit) && /videos\/day/.test(ob.help), ob.val + ' ' + ob.unit + ' · ' + ob.help);
chk('C81-19 the setup stepper moves it by one, and the summary reads in videos',
  ob.inc === ob.rec + 1 && ob.val2 === String(ob.rec + 1) && new RegExp((ob.rec + 1) + ' videos/day').test(ob.review),
  ob.inc + ' · ' + ob.review.replace(/\s+/g, ' ').slice(0, 160));
chk('C81-20 the plan setup builds is paced by that many videos',
  ob.by === 'videos' && ob.vp === ob.rec + 1 && ob.first === ob.rec + 1, ob.by + ' ' + ob.vp + ', first day ' + ob.first);

// ---------- 9. a plan without Brody weeks is untouched ----------
const s1 = await p.evaluate(() => {
  const c = { examType: 'step1', paceBy: 'videos', vidPerDay: 3 };
  return { v: paceVids(c) };
});
chk('C81-21 pacing by videos only applies to a Brody plan', s1.v === false, JSON.stringify(s1));

chk('C81-22 no page errors', errors.length === 0, errors.join(' | '));
await close();
report();
