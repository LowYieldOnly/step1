/* C78 · Resource Library: a random UWorld test from every B&B video you've checked off.
 *
 *   - The pool is the UWorld questions of every Boards & Beyond video checked off anywhere in
 *     the catalog, in the plan or not; a video not checked off adds nothing. With none checked
 *     off, the card says how to start and offers no test.
 *   - A test is drawn at random (not the pool's first questions), at the size chosen, never
 *     more than UWorld's 40, with no question twice and none already in a test — whether that
 *     test was random or made on Study. Copying marks its questions used.
 *   - System chips narrow the draw (all systems by default); a system run dry says so.
 *   - Checking a video off on the page updates the card. While searching, the card steps aside.
 *   - The card lists its tests and logs their scores; an unscored one waits on Study.
 */
import { openApp, checker } from '../harness.mjs';

const { page: p, errors, close } = await openApp();
const { chk, report } = checker('Resource Library — a random UWorld test');

const r = await p.evaluate(async () => {
  await new Promise(res => loadUWorld(res));
  window.__clip = null;
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: t => (window.__clip = t, Promise.resolve()) } });
  const wait = () => new Promise(res => setTimeout(res, 30));
  const clip = () => (window.__clip || '').split(',').map(x => parseInt(x, 10)).filter(x => x > 0);
  const b = brodyBlockById('cardiopulm'); AUTHED = true; todayISO = () => b.weeks[0].start;
  S.settings = { seenBrodyHelp: true, seenUpdate: LATEST_UPDATE };
  PRACTICE_KEYS.forEach(k => { S[k] = { total: null, blocks: {} }; });
  Object.assign(S, { vdone: {}, vdoneDate: {}, vdoneAt: {}, vundone: {}, vskip: {}, vshaky: {}, uwq: {}, uwt: {} });
  S.cfgs = { step1: null, nbme: { examType: 'nbme', brody: b.id, examLabel: b.name, examISO: b.shelf, startISO: b.weeks[0].start, restDays: [0],
    resources: { bnb: true }, systems: b.systems.slice(), brodyReviewDays: 3, brodyJoinWk: 1, brodyJoinDate: b.weeks[0].start } };
  normalizeCfg(S.cfgs.nbme, 'nbme'); activate('nbme'); S.active = 'nbme'; RND_SYS = null; VIEW = 'checklist'; reflow(); render();
  const out = {}; try {
  const card = () => document.getElementById('rndCard');
  // nothing checked off
  out.emptyCard = !!card(); out.emptyNoMake = !document.querySelector('[data-rndmake]');
  out.emptyMsg = /Check off a video/.test(card() ? card().textContent : '');
  // check off videos in the plan and outside it
  const bnb = catVideos().filter(v => v.res === 'bnb' && (uwIdsFor(v.name) || []).length);
  const inPlan = v => !!SCHED.byId[itemId(v)];
  const pick = (sys, n, plan) => bnb.filter(v => v.sys === sys && inPlan(v) === plan).slice(0, n);
  const done = [].concat(pick('Cardiology', 8, true), pick('Pulmonary', 6, true), pick('Neurology', 5, false), pick('Biochemistry', 4, false));
  out.outsideN = done.filter(v => !inPlan(v)).length;
  done.forEach(v => markDone(itemId(v))); render();
  const idsOf = vs => { const s = new Set(); vs.forEach(v => uwIdsFor(v.name).forEach(id => s.add(id))); return s; };
  const doneIds = idsOf(done), outIds = idsOf(done.filter(v => !inPlan(v)));
  const notDoneIds = [...idsOf(bnb.filter(v => !done.includes(v)))].filter(id => !doneIds.has(id));
  let P = rndPool(); const pool = new Set(P.all);
  out.poolIsDone = P.all.length === doneIds.size && [...doneIds].every(id => pool.has(id));
  out.outside = [...outIds].every(id => pool.has(id));
  out.notDone = notDoneIds.filter(id => pool.has(id)).length;
  out.chips = [...document.querySelectorAll('[data-rndsys]')].map(c => c.dataset.rndsys);
  // random, not the first questions in order
  const draws = Array.from({ length: 5 }, () => rndDraw(P.left, 40).join());
  out.drawsDiffer = new Set(draws).size > 1;
  out.drawNotFirst = draws.every(d => d !== P.left.slice(0, 40).join());
  const pos = new Set(); for (let i = 0; i < 20; i++) rndDraw(P.left, 40).forEach(id => pos.add(P.left.indexOf(id)));
  out.reachesLate = [...pos].some(i => i >= P.left.length - 40);
  // a 40-question test
  document.querySelector('[data-uwsize="40"]').click();
  document.querySelector('[data-rndmake]').click(); await wait();
  const t1 = clip(); out.t1 = t1.length; out.t1Unique = new Set(t1).size === t1.length;
  out.t1InPool = t1.every(id => pool.has(id)); out.t1Used = t1.every(uwUsed);
  out.t1NotFirst = t1.join() !== P.left.slice(0, 40).join();
  const rt = Object.values(S.uwt).filter(t => (t.pool || '').startsWith('r:'));
  out.recorded = rt.length === 1 && rt[0].pool === 'r:all' && rt[0].label === 'Random · All systems' && rt[0].ids.join() === t1.join();
  // a 10-question test after it shares nothing with it
  document.querySelector('[data-uwsize="10"]').click();
  document.querySelector('[data-rndmake]').click(); await wait();
  const t2 = clip(); out.t2 = t2.length; out.overlap = t2.filter(id => t1.includes(id)).length;
  // a test made on Study from one video: its questions are out of the draw
  const vid = done.find(v => uwIdsFor(v.name).some(id => !uwUsed(id)));
  const vidIds = uwIdsFor(vid.name).filter(id => !uwUsed(id));
  uwMakeTest('v:' + vid.name, vidIds, vid.name); await wait();
  P = rndPool(); out.studyOut = vidIds.every(id => !P.left.includes(id));
  // narrow to Cardiology
  document.querySelector('[data-rndsys="Cardiology"]').click();
  P = rndPool(); const cardio = idsOf(done.filter(v => v.sys === 'Cardiology'));
  out.on = P.on && P.on.join(); out.chipOn = !!document.querySelector('[data-rndsys="Cardiology"].on') && !document.querySelector('[data-rndsys=""].on');
  out.narrowPool = P.all.length === cardio.size;
  document.querySelector('[data-rndmake]').click(); await wait();
  const t3 = clip(); out.t3Cardio = t3.length > 0 && t3.every(id => cardio.has(id));
  out.t3Label = (Object.values(S.uwt).find(t => t.ids.join() === t3.join()) || {}).label;
  // a second chip adds to it; tapping one again takes it out; All goes back to everything
  document.querySelector('[data-rndsys="Neurology"]').click(); out.two = (rndPool().on || []).join();
  document.querySelector('[data-rndsys="Neurology"]').click(); out.backOne = (rndPool().on || []).join();
  // Cardiology run dry
  for (let i = 0; i < 50 && document.querySelector('[data-rndmake]'); i++) { document.querySelector('[data-uwsize="40"]').click(); document.querySelector('[data-rndmake]').click(); await wait(); }
  out.dry = !document.querySelector('[data-rndmake]') && /Every question from these systems is in a test/.test(card().textContent);
  document.querySelector('[data-rndsys=""]').click(); out.allAgain = rndPool().on === null && !!document.querySelector('[data-rndmake]');
  // checking a video off on the page updates the card, without a full render
  const renal = bnb.find(v => v.sys === 'Renal' && !isDone(itemId(v)));
  const n0 = rndPool().all.length, el0 = card();
  const btn = document.createElement('button'); btn.dataset.clid = itemId(renal); clToggle(btn);
  out.renalChip = !!document.querySelector('[data-rndsys="Renal"]') && rndPool().all.length > n0;
  out.renalMeta = card().textContent.includes(rndPool().all.length + ' questions'); out.redrawn = card() !== el0;
  // the card lists its random tests and logs a score
  const rnd = Object.keys(S.uwt).filter(k => S.uwt[k].pool.startsWith('r:') && !S.uwt[k].gone);
  const rows = [...card().querySelectorAll('.uwtrow')];
  out.rows = rows.length === rnd.length; out.rowName = rows.some(x => /^Cardiology · /.test(x.textContent));
  const tid = rnd[0], n = S.uwt[tid].ids.length;
  card().querySelector('details.uwtmade').open = true;
  card().querySelector('[data-uwscorein="' + tid + '"]').value = String(n - 3);
  card().querySelector('[data-uwscore="' + tid + '"]').click();
  out.scored = (uwScoreOf(tid) || {}).correct === n - 3 && /Your score on random tests/.test(card().textContent);
  // an unscored random test waits on Study
  VIEW = 'today'; render();
  const wait7 = document.querySelector('.uwtwait');
  out.study = !!wait7 && /From Random · /.test(wait7.textContent);
  // while searching, the card steps aside
  VIEW = 'checklist'; CL_Q = 'heart'; render(); out.searchHidden = !card(); CL_Q = ''; render(); out.searchBack = !!card();
  } catch (e) { out.err = String(e && e.stack || e); }
  return out;
});
const J = o => JSON.stringify(o);
chk('C78-1 with nothing checked off, the card says how to start and offers no test', r.emptyCard && r.emptyNoMake && r.emptyMsg, J(r));
chk('C78-2 the pool is every checked-off B&B video’s questions, outside the plan too', r.poolIsDone && r.outside && r.outsideN === 9, J({ pool: r.poolIsDone, outside: r.outside, n: r.outsideN }));
chk('C78-3 a video not checked off adds nothing', r.notDone === 0, J({ notDone: r.notDone }));
chk('C78-4 a chip for each system checked off, after All systems', J(r.chips) === J(['', 'Biochemistry', 'Cardiology', 'Neurology', 'Pulmonary']), J(r.chips));
chk('C78-5 the draw is random: it varies, isn’t the first questions, and reaches the last ones',
  r.drawsDiffer && r.drawNotFirst && r.reachesLate && r.t1NotFirst, J({ differ: r.drawsDiffer, first: r.drawNotFirst, late: r.reachesLate, t1: r.t1NotFirst }));
chk('C78-6 a test is 40 at most, no question twice, all from the pool, and marked used',
  r.t1 === 40 && r.t1Unique && r.t1InPool && r.t1Used, J({ n: r.t1, uniq: r.t1Unique, pool: r.t1InPool, used: r.t1Used }));
chk('C78-7 it is recorded as a random test of all systems', r.recorded, '');
chk('C78-8 the size is the student’s choice, and a second test shares nothing with the first', r.t2 === 10 && r.overlap === 0, J({ n: r.t2, overlap: r.overlap }));
chk('C78-9 a question in a test made on Study is out of the draw', r.studyOut, '');
chk('C78-10 a system chip narrows the draw to that system, and the label says so',
  r.on === 'Cardiology' && r.chipOn && r.narrowPool && r.t3Cardio && r.t3Label === 'Random · Cardiology', J({ on: r.on, chip: r.chipOn, pool: r.narrowPool, t3: r.t3Cardio, label: r.t3Label }));
chk('C78-11 chips add and come off; All systems goes back to everything', r.two === 'Cardiology,Neurology' && r.backOne === 'Cardiology' && r.allAgain, J({ two: r.two, back: r.backOne, all: r.allAgain }));
chk('C78-12 a system run dry says so and offers no test', r.dry, '');
chk('C78-13 checking a video off on the page updates the card', r.renalChip && r.renalMeta && r.redrawn, J({ chip: r.renalChip, meta: r.renalMeta, redrawn: r.redrawn }));
chk('C78-14 the card lists its random tests, named by their systems', r.rows && r.rowName, J({ rows: r.rows, name: r.rowName }));
chk('C78-15 a score logged in the card counts, and the card shows it', r.scored, '');
chk('C78-16 an unscored random test waits on Study under “other tests to score”', r.study, '');
chk('C78-17 while searching, the card steps aside', r.searchHidden && r.searchBack, J({ hidden: r.searchHidden, back: r.searchBack }));

chk('C78-18 no uncaught page errors', errors.length === 0 && !r.err, (r.err || '') + errors.slice(0, 3).join(' | '));
await close();
process.exit(report() ? 1 : 0);
