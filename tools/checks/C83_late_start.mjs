/* C83 · Starting a unit late schedules all of it.
 *
 * A plan made after a unit's first day used to leave everything dated before that day out, as
 * optional "earlier" videos on past dates that were never owed. A student who started GI on the
 * Friday of week 1 got a plan that left out most of that week (reported 2026-11-13). The exam
 * covers the whole unit, so the plan now does too (Dylan, 2026-11-13). What has to hold:
 *   - a plan started late holds every video an on-time plan holds; none is marked "earlier",
 *     nothing sits on a day before the start, and the first study day opens with week 1;
 *   - it is exactly the plan of someone who started on time and has watched nothing: same
 *     days, same videos, same recommended pace;
 *   - a quiz that already happened is not a deadline: its week isn't flagged, and its videos
 *     are due with the next quiz, which the recommended pace meets;
 *   - when a week can't be met because of the late start, Study and Plan say so and don't call
 *     it a firehose week or say to trim a resource; an on-time plan keeps the old words;
 *   - a plan saved under the old rule gets the earlier weeks too, keeps its stamped pace, and
 *     Study offers the re-fit;
 *   - setup shows every week and says the earlier videos come first; the plan it builds has them;
 *   - the day the plan was started is still recorded; the help sheet and What's new say all this.
 */
import { openApp, checker } from '../harness.mjs';

const { page: p, errors, close } = await openApp();
const { chk, report } = checker('Starting a unit late schedules all of it');
const J = o => JSON.stringify(o);

await p.evaluate(() => {
  window.J = o => JSON.stringify(o);
  window.__base = today => { AUTHED = true; todayISO = () => today;
    S.settings = { seenBrodyHelp: true, seenUpdate: LATEST_UPDATE };
    PRACTICE_KEYS.forEach(k => { S[k] = { total: null, blocks: {} }; });
    Object.assign(S, { vdone: {}, vdoneDate: {}, vdoneAt: {}, vundone: {}, vskip: {}, vshaky: {}, akdone: {}, notes: {}, streak: { days: {} }, assessments: {}, _resetAt: 0 }); };
  // extra: fields laid over the plan (a join week and date, a stamped pace, even pace…)
  window.__mk = (today, extra) => {
    const b = brodyBlockById('gi-multisystem'); __base(today);
    S.cfgs = { step1: null, nbme: Object.assign({ examType: 'nbme', brody: b.id, examLabel: b.name, examISO: b.shelf, startISO: b.weeks[0].start, restDays: [0], catEd: CAT_CURRENT_ED,
      resources: { bnb: true, pathoma: true, skpharm: true, skmicro: true, bootcamp: false, uwlib: false }, systems: b.systems.slice(), brodyReviewDays: 3 }, extra || {}) };
    normalizeCfg(S.cfgs.nbme, 'nbme'); activate('nbme'); S.active = 'nbme'; VIEW = 'today'; CAL_SEL = null; reflow(); render();
    return S.cfg;
  };
  window.__onTime = { brodyJoinWk: 1, brodyJoinDate: '2026-11-09' };
  window.__shape = () => SCHED.days.filter(d => d.items.length).map(d => d.iso + ':' + d.items.map(x => x.id).join(','));
  window.__hero = () => paceHero().replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  window.__dayOf = () => { const m = {}; SCHED.days.forEach(d => d.items.forEach(x => { m[x.id] = d.iso; })); return m; };
});

// ---------- 1. the reported case: GI started on the Friday of week 1 ----------
const fri = await p.evaluate(() => {
  __mk('2026-11-09', __onTime); const all = SCHED.planVideos.map(v => v.id).sort(), wk1 = SCHED.planVideos.filter(v => v.wk === 1).length;
  const c = __mk('2026-11-13');   // no join week on the plan: the app stamps it, as for a plan just built
  const ids = SCHED.planVideos.map(v => v.id).sort(), first = SCHED.days.find(d => d.items.length), dayOf = __dayOf();
  const order = SCHED.days.filter(d => d.items.length).map(d => Math.min(...d.items.map(x => x.wk)));
  const late = { n: ids.length, same: J(ids) === J(all), wk1In: SCHED.planVideos.filter(v => v.wk === 1).length, wk1,
    earlier: SCHED.days.some(d => d.earlier), before: SCHED.days.filter(d => d.iso < '2026-11-13' && d.items.length).length,
    firstDay: first && first.iso, firstWks: first && [...new Set(first.items.map(x => x.wk))], rising: order.every((w, i) => !i || w >= order[i - 1]),
    joinDate: c.brodyJoinDate, joinWk: c.brodyJoinWk, placed: Object.keys(dayOf).length,
    shape: __shape(), pace: brodyPace(c), rec: brodyRecPace(c, brodyBlock(c)),
    heavy: SCHED.weekLoad.filter(w => w.heavy).map(w => w.n), w1: SCHED.weekLoad[0],
    // weeks 1 and 2 before quiz 10 (Nov 20)
    lateBy20: SCHED.planVideos.filter(v => v.wk <= 2 && !(dayOf[v.id] < '2026-11-20')).length,
    hero: __hero(), calEarlier: document.querySelectorAll('.calcell.earlier').length };
  // someone who started on time and has watched nothing, looking on the same day
  const d = __mk('2026-11-13', __onTime); delete d.brodyPace; reflow();
  late.twinShape = J(__shape()) === J(late.shape); late.twinPace = brodyPace(d);
  return late;
});
chk('C83-1 a plan started on the Friday of week 1 holds every video an on-time plan holds, week 1 included',
  fri.same && fri.n > 90 && fri.wk1In === fri.wk1 && fri.wk1 > 30, fri.n + ' videos, week 1: ' + fri.wk1In + ' of ' + fri.wk1);
chk('C83-2 none is marked "earlier" and nothing sits on a day before the start',
  fri.earlier === false && fri.before === 0 && fri.calEarlier === 0 && fri.placed === fri.n, J({ earlier: fri.earlier, before: fri.before, placed: fri.placed }));
chk('C83-3 the first study day is the day you start, it opens with week 1, and the weeks stay in order',
  fri.firstDay === '2026-11-13' && fri.firstWks.length === 1 && fri.firstWks[0] === 1 && fri.rising, J({ firstDay: fri.firstDay, firstWks: fri.firstWks, rising: fri.rising }));
chk('C83-4 it is exactly the plan of someone who started on time and has watched nothing',
  fri.twinShape && fri.twinPace === fri.pace && fri.pace === fri.rec, 'same days ' + fri.twinShape + ', pace ' + fri.pace + ' vs ' + fri.twinPace);
chk('C83-5 a quiz that already happened is not a deadline: week 1 is not flagged',
  fri.heavy.length === 0 && fri.w1.heavy === false && /On pace/.test(fri.hero) && !/late/.test(fri.hero), J(fri.heavy) + ' · ' + fri.hero.slice(0, 90));
chk('C83-6 …and its videos are due with the next quiz: weeks 1 and 2 are all placed before Nov 20',
  fri.lateBy20 === 0 && fri.pace <= 6, fri.lateBy20 + ' after Nov 20 at ' + fri.pace + ' h/day');
chk('C83-7 the day the plan was started is still recorded', fri.joinDate === '2026-11-13' && fri.joinWk === 1, fri.joinDate + ' wk ' + fri.joinWk);

// ---------- 2. a week that can't be met because of the late start ----------
const wed = await p.evaluate(() => {
  const out = {};
  const c = __mk('2026-11-11');
  out.heavy = SCHED.weekLoad.filter(w => w.heavy).map(w => w.n); out.backlog = brodyLateBacklog(c); out.hero = __hero();
  VIEW = 'adjust'; ADJ_VIEW = 'edit'; render(); out.banner = (document.querySelector('.pbstat') || {}).textContent || '';
  setPaceBy(c, 'videos'); reflow(); render(); out.bannerV = (document.querySelector('.pbstat') || {}).textContent || ''; out.heroV = __hero();
  // week 1 all watched: nothing from before the start is left
  __mk('2026-11-11'); SCHED.planVideos.filter(v => v.wk === 1).forEach(v => markDone(v.id, '2026-11-11')); todayISO = () => '2026-11-12'; reflow();
  out.cleared = brodyLateBacklog(S.cfg);
  // the same day for someone who started on time and is behind
  const d = __mk('2026-11-11', __onTime); delete d.brodyPace; reflow(); render();
  out.onTime = { heavy: SCHED.weekLoad.filter(w => w.heavy).map(w => w.n), backlog: brodyLateBacklog(d), hero: __hero() };
  VIEW = 'adjust'; ADJ_VIEW = 'edit'; render(); out.onTime.banner = (document.querySelector('.pbstat') || {}).textContent || '';
  return out;
});
chk('C83-8 started on the Wednesday, week 1 can\'t all fit before Friday\'s quiz, and Study says it is the late start',
  J(wed.heavy) === '[1]' && wed.backlog === true && /you started this unit late, so week 1 won.t all fit before its quiz/.test(wed.hero) && !/trim a resource|more than fits/.test(wed.hero), wed.hero.slice(0, 160));
chk('C83-9 …and so does Plan, by hours and by videos, without calling it a firehose week',
  /^Late start/.test(wed.banner) && !/Firehose|trim a resource/.test(wed.banner) && /^Late start/.test(wed.bannerV) && !/Firehose/.test(wed.bannerV) && /you started this unit late/.test(wed.heroV),
  wed.banner.slice(0, 110) + ' | ' + wed.bannerV.slice(0, 40));
chk('C83-10 once the videos from before the start are watched, it stops saying so', wed.cleared === false, 'backlog ' + wed.cleared);
chk('C83-11 an on-time plan in the same spot keeps the firehose wording',
  J(wed.onTime.heavy) === '[1]' && wed.onTime.backlog === false && /week 1 is more than fits before its quiz/.test(wed.onTime.hero) && /^Firehose/.test(wed.onTime.banner),
  wed.onTime.hero.slice(0, 110) + ' | ' + wed.onTime.banner.slice(0, 30));

// ---------- 3. a plan saved under the old rule ----------
const old = await p.evaluate(() => {
  // joined in week 2 under the old rule: week 1 was left out and the pace stamped without it
  const c = __mk('2026-11-17', { brodyJoinWk: 2, brodyJoinDate: '2026-11-16', brodyPace: 1.5 });
  const first = SCHED.days.find(d => d.items.length);
  const out = { wks: [...new Set(SCHED.planVideos.map(v => v.wk))].sort(), pace: c.brodyPace, first: first && first.items[0].wk, firstDay: first && first.iso,
    earlier: SCHED.days.some(d => d.earlier), delta: brodyRefitDelta(c), hero: __hero(), joinWk: c.brodyJoinWk, joinDate: c.brodyJoinDate };
  out.wk1Load = brodyWeekLoads(c, brodyBlock(c))[0].loadMin;
  const tu = window.toastUndo; window.toastUndo = () => {}; brodyRefit(); window.toastUndo = tu;
  out.after = c.brodyPace;
  // what someone who started on time and has watched nothing would be told on the same day
  const d = __mk('2026-11-17', __onTime); delete d.brodyPace; reflow(); out.twinRec = brodyPace(d);
  return out;
});
chk('C83-12 a plan saved under the old rule gets the weeks it had left out, first',
  J(old.wks) === '[1,2,3,4,5]' && old.first === 1 && old.firstDay === '2026-11-17' && old.earlier === false, J({ wks: old.wks, first: old.first, firstDay: old.firstDay }));
chk('C83-13 …its pace does not change on its own, and Study offers the re-fit',
  old.pace === 1.5 && old.delta && old.delta.rec > 1.5 && /^Behind at 1\.5 h\/day/.test(old.hero) && old.after === old.delta.rec && old.joinWk === 2 && old.joinDate === '2026-11-16',
  'pace ' + old.pace + ' → re-fit ' + old.after + ' · ' + old.hero.slice(0, 90));
chk('C83-13b …and the pace it is offered counts the week it had left out',
  old.wk1Load > 0 && old.delta && old.delta.rec === old.twinRec, 'week 1 load ' + old.wk1Load + ' min; offered ' + (old.delta && old.delta.rec) + ', on-time twin ' + old.twinRec);

// ---------- 4. even pace ----------
const free = await p.evaluate(() => {
  __mk('2026-11-09', Object.assign({ brodyFree: true }, __onTime)); const n = SCHED.planVideos.length;
  __mk('2026-11-18', { brodyFree: true });
  return { n, late: SCHED.planVideos.length, wks: [...new Set(SCHED.planVideos.map(v => v.wk))].sort(), first: (SCHED.days.find(d => d.items.length) || { items: [{}] }).items[0].wk,
    heavy: SCHED.weekLoad.filter(w => w.heavy).length, hero: __hero() };
});
chk('C83-14 on even pace, a late start gets the whole unit too',
  free.late === free.n && free.wks[0] === 1 && free.first === 1 && free.heavy === 0 && /even pace to the exam/.test(free.hero), J(free));

// ---------- 5. setup ----------
const ob = await p.evaluate(() => {
  const blk = brodyBlockById('gi-multisystem'); __base('2026-11-17');   // week 2: week 1 has no days of its own left
  S.cfgs = { step1: null, nbme: null }; S.cfg = null; S.active = null;
  startOnboard('nbme', true);
  _ob.brody = blk.id; _ob.systems = blk.systems.slice(); _ob.resources = { bnb: true, pathoma: true, skpharm: true, skmicro: true };
  const html = obPreview(), txt = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const rows = (html.match(/class="bw-n">Wk \d/g) || []).map(x => +x.slice(-1));
  const out = { txt, rows, wk1catch: /Wk 1<\/span><span class="bw-l">[^<]* · catch-up/.test(html) };
  // an on-time setup, for the words that must not appear there
  __base('2026-11-09'); S.cfgs = { step1: null, nbme: null }; S.cfg = null; S.active = null; startOnboard('nbme', true);
  _ob.brody = blk.id; _ob.systems = blk.systems.slice(); _ob.resources = { bnb: true, pathoma: true, skpharm: true, skmicro: true };
  out.onTime = obPreview().replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  // build the late one
  __base('2026-11-13'); S.cfgs = { step1: null, nbme: null }; S.cfg = null; S.active = null; startOnboard('nbme', true);
  _ob.brody = blk.id; _ob.systems = blk.systems.slice(); _ob.resources = { bnb: true, pathoma: true, skpharm: true, skmicro: true };
  obPreview(); commitOnboard(); reflow();
  out.built = { wk1: SCHED.planVideos.filter(v => v.wk === 1).length, joinDate: S.cfg.brodyJoinDate, first: (SCHED.days.find(d => d.items.length) || {}).iso, earlier: SCHED.days.some(d => d.earlier) };
  return out;
});
chk('C83-15 setup for a late start lists every week, week 1 as catch-up, and says its videos come first',
  J(ob.rows) === '[1,2,3,4,5]' && ob.wk1catch && /This unit began Nov 9, so its earlier videos are scheduled first/.test(ob.txt) && !/starting at week|aren.t included/.test(ob.txt), ob.txt.slice(0, 260));
chk('C83-16 …an on-time setup says none of that', !/earlier videos are scheduled first|starting late/.test(ob.onTime), ob.onTime.slice(0, 160));
chk('C83-17 the plan setup builds has week 1 in it, starting the day it was built',
  ob.built.wk1 === fri.wk1 && ob.built.joinDate === '2026-11-13' && ob.built.first === '2026-11-13' && ob.built.earlier === false, J(ob.built));

// ---------- 6. the words ----------
const words = await p.evaluate(() => {
  const help = brodyHelpHTML().replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const e = CHANGELOG.find(x => /late/i.test(x.title) && /all of it/.test(x.title)) || { title: '', items: [] };
  return { help, title: e.title, items: e.items.join(' '), src: document.documentElement.innerHTML.includes('before you joined') };
});
chk('C83-18 the help sheet explains a late start the new way',
  /If you start a unit late, the plan still covers all of it/.test(words.help) && /scheduled first/.test(words.help) && !/never forced to catch up|marked earlier/.test(words.help), words.help.slice(0, 200));
chk('C83-19 What\'s new says so, including what happens to a plan already started late',
  /Starting a unit late/.test(words.title) && /scheduled first/.test(words.items) && /after Nov 9/.test(words.items) && /Re-fit your schedule/.test(words.items), words.title + ' · ' + words.items.slice(0, 120));

chk('C83-20 no page errors', errors.length === 0, errors.join(' | '));
await close();
report();
