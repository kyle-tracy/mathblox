// Entry: wires input (keyboard, buttons, swipe) to the game. Rules live in core/, drawing in render/.
import { cv, reduced, setReduced } from './render/look.js';
import { lvlIdx, won, load, act, undo, restart, fit, leave, Q } from './render/state.js';
import { muted, setMute, muteBtn } from './render/audio.js';
import { draw } from './render/draw.js';

if (Q.has('craft')) import('./craft/play.js'); // the open-world prototype owns its own input and loop
else {
  // ---- input: keyboard, buttons, swipe ----
  const KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
  addEventListener('keydown', e => {
    if (e.repeat) return; // one step per press: forgiving input
    if (KEYS[e.key]) { act(KEYS[e.key]); e.preventDefault(); }
    else if (e.key === 'Tab' || e.key === 'c' || e.key === ' ') { act('swap'); e.preventDefault(); } // next character
    else if (e.key === 'z' || e.key === 'Backspace') undo();
    else if (e.key === 'r') restart();
    else if (e.key === 'm') setMute(!muted);
    else if (e.key === 'Enter' && won) load(lvlIdx + 1);
    else if (e.key === 'Escape') leave();
  });
  document.querySelectorAll('[data-dir]').forEach(b => b.onclick = () => act(b.dataset.dir));
  document.getElementById('undo').onclick = undo;
  document.getElementById('restart').onclick = restart;
  document.getElementById('next').onclick = () => load(lvlIdx + 1);
  document.getElementById('map').onclick = leave;
  muteBtn.onclick = () => setMute(!muted);
  document.getElementById('motion').onclick = () => setReduced(!reduced);
  addEventListener('resize', fit);
  setMute(muted);
  let touch;
  cv.addEventListener('touchstart', e => { touch = e.touches[0]; }, { passive: true });
  cv.addEventListener('touchend', e => {
    const t = e.changedTouches[0], dx = t.clientX - touch.clientX, dy = t.clientY - touch.clientY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 24) act(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  });

  load(Number(Q.get('level') ?? 1) - 1);
  for (const c of Q.get('moves') ?? '') act({ u: 'up', d: 'down', l: 'left', r: 'right', s: 'swap' }[c]); // QA: replay inputs
  requestAnimationFrame(draw);
}
