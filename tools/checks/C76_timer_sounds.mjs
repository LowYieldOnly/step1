/* C76 · The focus timer's Timer Customization: choose the sound, hear it first.
 *
 *   - "Timer lengths" is now "Timer Customization", with the lengths and a sound picker:
 *     ten sounds and "No sound", each sound with a play button.
 *   - Every sound is real and distinct: rendered offline it is audible, never clips, and
 *     stops within a few seconds; no two sound the same. "Classic beep" is the two beeps
 *     the timer always had, and it stays the default — an invalid saved value falls back to it.
 *   - ▶ plays that sound and changes nothing. Choosing a sound saves it to the synced
 *     settings, keeps the panel open, and is what plays when a timer ends; "No sound" plays
 *     nothing but still vibrates. Start opens the audio, so the end sound can play on a phone.
 */
import { openApp, checker } from '../harness.mjs';

const { page: p, errors, close } = await openApp();
const { chk, report } = checker('Focus timer — Timer Customization, sounds you can hear first');

await p.evaluate(() => {
  window.__mk = (pomo) => {
    const b = brodyBlockById('msk-skin');
    AUTHED = true; todayISO = () => '2026-10-27';
    S.settings = { seenBrodyHelp: true, seenUpdate: LATEST_UPDATE };
    if (pomo) S.settings.pomo = pomo;
    PRACTICE_KEYS.forEach(k => { S[k] = { total: null, blocks: {} }; });
    Object.assign(S, { vdone: {}, vdoneDate: {}, vdoneAt: {}, vundone: {}, vskip: {}, vshaky: {}, akdone: {}, notes: {}, streak: { days: {} }, assessments: {}, uwq: {}, uwt: {}, pomo: {}, _resetAt: 0 });
    S.cfgs = { step1: null, nbme: { examType: 'nbme', brody: b.id, examLabel: b.name, examISO: b.shelf, startISO: b.weeks[0].start, restDays: [0],
      resources: { bnb: true }, systems: b.systems.slice(), brodyReviewDays: 3, brodyJoinWk: 1, brodyJoinDate: b.weeks[0].start } };
    normalizeCfg(S.cfgs.nbme, 'nbme'); activate('nbme'); S.active = 'nbme'; VIEW = 'today';
    store.set(POMO_KEY, ''); POMO_SET_OPEN = false; reflow(); render();
  };
  // record what plays, without needing speakers
  window.__played = []; window.__vib = 0;
  Object.keys(POMO_SYNTH).forEach(k => { const f = POMO_SYNTH[k]; POMO_SYNTH[k] = (ac, d, t) => { window.__played.push(k); return f(ac, d, t); }; });
  try { Object.defineProperty(navigator, 'vibrate', { configurable: true, value: () => { window.__vib++; return true; } }); } catch (e) {}
});

// ---------- the panel ----------
const ui = await p.evaluate(() => {
  __mk();
  const d = document.getElementById('pomoSet');
  return { summary: d && d.querySelector('summary').textContent, lengths: d ? d.querySelectorAll('[data-pomoset]').length : 0,
    opts: [...document.querySelectorAll('[data-pomosound]')].map(i => i.value),
    labels: [...document.querySelectorAll('.pomosndopt label span')].map(s => s.textContent),
    plays: [...document.querySelectorAll('[data-pomoplay]')].map(b => b.dataset.pomoplay + '=' + b.getAttribute('aria-label')),
    checked: (document.querySelector('[data-pomosound]:checked') || {}).value, cfg: pomoCfg().sound,
    bad: (() => { S.settings.pomo = { sound: 'kazoo' }; return pomoCfg().sound; })() };
});
chk('C76-1 the settings panel is "Timer Customization", and still holds the four lengths', ui.summary === 'Timer Customization' && ui.lengths === 4, JSON.stringify(ui.summary) + ' · ' + ui.lengths);
chk('C76-2 it offers ten sounds and "No sound"', ui.opts.length === 11 && ui.opts.includes('none') && ui.labels.length === 11, ui.labels.join(', '));
chk('C76-3 every sound but "No sound" has a play button that names it', ui.plays.length === 10 && ui.plays.every(x => { const [k, l] = x.split('='); return k !== 'none' && /^Play /.test(l); }), ui.plays.join(' | '));
chk('C76-4 the default is "Classic beep", the two beeps the timer always had — and an unknown saved sound falls back to it',
  ui.checked === 'classic' && ui.cfg === 'classic' && ui.bad === 'classic', JSON.stringify({ checked: ui.checked, cfg: ui.cfg, bad: ui.bad }));

// ---------- every sound is real ----------
const snd = await p.evaluate(async () => {
  const out = [];
  for (const s of POMO_SOUNDS) {
    if (s.k === 'none') continue;
    const ac = new OfflineAudioContext(1, 44100 * 6, 44100);
    POMO_SYNTH[s.k](ac, ac.destination, 0);
    const d = (await ac.startRendering()).getChannelData(0);
    let peak = 0, last = 0; for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); if (a > peak) peak = a; if (a > 0.005) last = i; }
    const env = []; for (let i = 0; i < 48; i++) { let m = 0; for (let j = i * 4410; j < (i + 1) * 4410; j++) m = Math.max(m, Math.abs(d[j])); env.push(Math.round(m * 40)); }
    out.push({ k: s.k, peak, secs: last / 44100, env: env.join(',') });
  }
  window.__played = [];
  return out;
});
const loudBad = snd.filter(s => !(s.peak > 0.05 && s.peak < 0.9));
chk('C76-5 each of the ten sounds is audible and never clips (peak between 0.05 and 0.9)', snd.length === 10 && loudBad.length === 0,
  snd.map(s => s.k + ' ' + s.peak.toFixed(2)).join(', '));
chk('C76-6 …and stops within 4 seconds', snd.every(s => s.secs > 0.1 && s.secs < 4), snd.map(s => s.k + ' ' + s.secs.toFixed(2) + 's').join(', '));
chk('C76-7 …and no two sound the same', new Set(snd.map(s => s.env)).size === snd.length, '');

// ---------- using it ----------
const use = await p.evaluate(() => {
  const out = {};
  __mk();
  document.getElementById('pomoSet').open = true; document.getElementById('pomoSet').dispatchEvent(new Event('toggle'));
  // ▶ plays that sound and saves nothing
  window.__played = [];
  document.querySelector('[data-pomoplay="marimba"]').click();
  out.sampled = window.__played.slice(); out.afterSample = pomoCfg().sound;
  out.ctx = !!POMO_AC;
  // choose Bell: saved, still open after a re-render, and it is what a finished timer plays
  const bell = document.querySelector('[data-pomosound="bell"]'); bell.checked = true; bell.dispatchEvent(new Event('change'));
  out.saved = S.settings.pomo && S.settings.pomo.sound; out.onClass = (document.querySelector('.pomosndopt.on [data-pomosound]') || {}).value;
  render(); out.stillOpen = !!(document.getElementById('pomoSet') || {}).open; out.checkedAfter = (document.querySelector('[data-pomosound]:checked') || {}).value;
  const len = document.querySelector('[data-pomoset="focus"]'); len.value = '30'; len.dispatchEvent(new Event('change'));
  out.openAfterLength = !!(document.getElementById('pomoSet') || {}).open; out.focusLen = pomoCfg().focus;
  window.__played = []; window.__vib = 0;
  let r = pomoGet(); r.running = true; r.len = 60; r.startedAt = Date.now() - 61000; r.endsAt = Date.now() - 1000; pomoPut(r); pomoFinish(r, false);
  out.finished = window.__played.slice(); out.vibBell = window.__vib;
  // No sound: nothing plays, it still vibrates
  const none = document.querySelector('[data-pomosound="none"]'); none.checked = true; none.dispatchEvent(new Event('change'));
  window.__played = []; window.__vib = 0;
  r = pomoGet(); r.running = true; r.len = 60; r.startedAt = Date.now() - 61000; r.endsAt = Date.now() - 1000; pomoPut(r); pomoFinish(r, false);
  out.silent = window.__played.slice(); out.vibNone = window.__vib;
  // Start opens the audio
  POMO_AC = null; __mk({ sound: 'chime' }); document.querySelector('[data-pomo="start"]').click(); out.startCtx = !!POMO_AC;
  document.querySelector('[data-pomo="pause"]').click();
  // the settings sync like any setting
  const cur = persistObj(); out.merge = JSON.stringify(mergeState(cur, cur)) === JSON.stringify(cur) && mergeState(cur, cur).settings.pomo.sound === 'chime';
  return out;
});
chk('C76-8 ▶ plays that sound and changes nothing', JSON.stringify(use.sampled) === '["marimba"]' && use.afterSample === 'classic' && use.ctx, JSON.stringify(use));
chk('C76-9 choosing a sound saves it and marks it chosen', use.saved === 'bell' && use.onClass === 'bell' && use.checkedAfter === 'bell', JSON.stringify(use));
chk('C76-10 the panel stays open through a re-render and a length change', use.stillOpen && use.openAfterLength && use.focusLen === 30, JSON.stringify(use));
chk('C76-11 a finished timer plays the chosen sound, and vibrates', JSON.stringify(use.finished) === '["bell"]' && use.vibBell === 1, JSON.stringify({ finished: use.finished, vib: use.vibBell }));
chk('C76-12 "No sound" plays nothing at the end, but still vibrates', use.silent.length === 0 && use.vibNone === 1, JSON.stringify({ silent: use.silent, vib: use.vibNone }));
chk('C76-13 Start opens the audio, so the end sound can play on a phone', use.startCtx, '');
chk('C76-14 the choice is a synced setting, and the state merges with itself unchanged', use.merge, '');

chk('C76-15 no uncaught page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
await close();
process.exit(report() ? 1 : 0);
