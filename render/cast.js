// The cast: one hand-drawn sprite per character (board, HUD strip, intro card), the HUD strip and the intro card.
// Characters are told apart by silhouette and prop first (bone, compass, lyre, turban, tortoise), colour second.
import { C, INK, WHITE, FONT } from './look.js';
import { state, orig, act, Q } from './state.js';
import { CHARACTERS } from '../levels/characters.js';

const DIR = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
function blob(c, pts, fill) { c.beginPath(); for (const [x, y, r] of pts) { c.moveTo(x + r, y); c.arc(x, y, r, 0, 7); } c.fillStyle = fill; c.fill(); }
function line(c, w, color, ...xy) { c.beginPath(); c.moveTo(xy[0], xy[1]); for (let i = 2; i < xy.length; i += 2) c.lineTo(xy[i], xy[i + 1]); c.lineWidth = w; c.strokeStyle = color; c.stroke(); }

// Drawn on a 64-unit cell around (cx, cy); `size` is the cell size in px. `t` (ms) wiggles props; `dir` aims the eyes.
export function sprite(c, cx, cy, size, id, t = 0, dir = 'right', twang = 0) {
  const ch = CHARACTERS[id], col = ch?.color ?? C.player;
  c.save(); c.translate(cx, cy); c.scale(size / 64, size / 64); c.lineJoin = c.lineCap = 'round';
  const skin = { tally: '#8d5a3b', euclid: '#e08a4f', pythagoras: '#eab98b', brahmagupta: '#b97a4b', zeno: '#e3b58c' }[id] ?? col;
  const robe = () => { c.beginPath(); c.roundRect(-17, 2, 34, 25, [13, 13, 6, 6]); c.fillStyle = col; c.fill(); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke(); };
  const head = () => { c.beginPath(); c.arc(0, -9, 13, 0, 7); c.fillStyle = skin; c.fill(); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke(); };
  const eyes = () => { const [dx, dy] = DIR[dir] ?? [1, 0];
    blob(c, [[-5, -10, 4], [5, -10, 4]], WHITE); blob(c, [[-5 + dx * 1.6, -9.5 + dy * 1.6, 2.2], [5 + dx * 1.6, -9.5 + dy * 1.6, 2.2]], INK); };
  const wave = Math.sin(t / 300);

  robe();
  if (id === 'zeno') { // a tortoise at his heel (Achilles never catches it) and an arrow that never lands
    blob(c, [[-29, 22, 3]], '#7a9a4a');
    c.beginPath(); c.ellipse(-21, 24, 8, 6, 0, Math.PI, 0); c.closePath(); c.fillStyle = '#5f8a3a'; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
    line(c, 1.5, '#cfe39a', -25, 22, -21, 19, -17, 22);
  }
  if (id === 'tally') { // a red-ochre hand stencil on the hide, like the cave walls
    blob(c, [[-6, 17, 4.5]], '#9c2f1f'); for (const a of [-1.1, -0.5, 0, 0.5]) line(c, 2.4, '#9c2f1f', -6, 15, -6 + Math.sin(a) * 9, 15 - Math.cos(a) * 9);
    line(c, 2.4, '#9c2f1f', -9, 17, -13, 14);
  }
  if (id === 'euclid') { // red-figure pottery: black ground, clay figure, black meander at the hem
    c.fillStyle = INK; c.fillRect(-16, 20, 32, 6);
    c.beginPath(); for (let x = -15; x < 14; x += 6) { c.moveTo(x, 25); c.lineTo(x, 21.5); c.lineTo(x + 4, 21.5); c.lineTo(x + 4, 24); c.lineTo(x + 2, 24); }
    c.lineWidth = 1.3; c.strokeStyle = '#e08a4f'; c.stroke();
  }
  if (id === 'brahmagupta' || id === 'pythagoras') line(c, 2.5, '#f2c14e', -15, 21, 15, 21); // gold border
  if (id === 'zeno') line(c, 2, '#c9b6e4', -10, 4, 6, 26); // himation drape

  head();
  if (id === 'tally') blob(c, [[-11, -18, 5], [-5, -22, 5.5], [2, -23, 5.5], [9, -20, 5], [12, -14, 4]], '#3b2416');
  if (id === 'euclid') { blob(c, [[-8, -20, 4.5], [-2, -22, 4.5], [5, -21, 4.5], [10, -17, 4]], INK); blob(c, [[-8, -1, 4], [-3, 2, 4.5], [3, 2, 4.5], [8, -1, 4]], INK); }
  if (id === 'pythagoras') { blob(c, [[-8, -1, 4.5], [-3, 2, 5], [3, 2, 5], [8, -1, 4.5]], '#f7f3ea');
    for (let i = 0; i < 7; i++) { const a = Math.PI * (1.05 + i * 0.15); c.beginPath(); c.ellipse(Math.cos(a) * 13, -9 + Math.sin(a) * 13, 4, 2, a + 1.6, 0, 7); c.fillStyle = '#4c8b3a'; c.fill(); } }
  if (id === 'brahmagupta') { // a saffron turban with a jewel; a black moustache
    c.beginPath(); c.ellipse(0, -19, 15, 9, 0, Math.PI, 0); c.lineTo(14, -15); c.lineTo(-14, -15); c.closePath(); c.fillStyle = '#f4a259'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke();
    line(c, 2.5, '#c0392b', -13, -18, 13, -22); blob(c, [[0, -21, 2.8]], '#e63946');
    line(c, 2.5, INK, -6, -3, 0, -4.5, 6, -3);
  }
  if (id === 'zeno') blob(c, [[-6, 0, 4], [0, 2.5, 4.5], [6, 0, 4], [-10, -18, 4], [10, -18, 4]], '#9a9aa6');
  eyes();

  if (id === 'tally') { // the notched bone, notches in groups (Ishango)
    c.save(); c.translate(17, 8); c.rotate(-0.6 + wave * 0.05);
    blob(c, [[-11, -2, 3.5], [-11, 2, 3.5], [11, -2, 3.5], [11, 2, 3.5]], '#efe6cf');
    c.fillStyle = '#efe6cf'; c.fillRect(-11, -3, 22, 6);
    for (const x of [-7, -5, -3, 2, 4, 6, 8]) line(c, 1.4, INK, x, -3, x, 1);
    c.restore();
  }
  if (id === 'euclid') { // a compass mid-arc
    c.save(); c.translate(19, 2); c.rotate(wave * 0.08);
    line(c, 2.5, INK, 0, -8, -6, 14); line(c, 2.5, INK, 0, -8, 6, 14); blob(c, [[0, -8, 2.5]], '#e08a4f');
    c.setLineDash([2, 3]); c.beginPath(); c.arc(-6, 14, 12, -0.1, 0.9); c.lineWidth = 1.5; c.strokeStyle = INK; c.stroke(); c.setLineDash([]);
    c.restore();
  }
  if (id === 'pythagoras') { // a lyre; its strings shiver after a leap (2:1, the octave)
    c.save(); c.translate(20, 10);
    c.beginPath(); c.moveTo(-6, 9); c.quadraticCurveTo(-10, -2, -7, -11); c.moveTo(6, 9); c.quadraticCurveTo(10, -2, 7, -11);
    c.lineWidth = 3; c.strokeStyle = '#8a5a2b'; c.stroke(); line(c, 2.5, '#8a5a2b', -8, -9, 8, -9); line(c, 2.5, '#8a5a2b', -6, 9, 6, 9);
    for (const x of [-3, 0, 3]) { c.beginPath(); c.moveTo(x, -9); c.quadraticCurveTo(x + Math.sin(t / 18 + x) * 2.5 * twang, 0, x, 9); c.lineWidth = 1; c.strokeStyle = '#fff3c4'; c.stroke(); }
    c.restore();
  }
  if (id === 'brahmagupta') { // a slate with his zero
    c.save(); c.translate(19, 12); c.rotate(0.15);
    c.beginPath(); c.roundRect(-8, -9, 16, 18, 3); c.fillStyle = '#2d3a3a'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#f2c14e'; c.stroke();
    c.font = `bold 13px ${FONT}`; c.fillStyle = WHITE; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('0', 0, 1);
    c.restore();
  }
  if (id === 'zeno') { // the arrow, forever halfway
    c.save(); c.translate(18, 8); c.rotate(-0.7 + wave * 0.05);
    line(c, 2.5, '#8a5a2b', -12, 0, 10, 0); c.beginPath(); c.moveTo(14, 0); c.lineTo(8, -4); c.lineTo(8, 4); c.closePath(); c.fillStyle = '#5b6475'; c.fill();
    line(c, 2, '#e63946', -12, 0, -15, -3); line(c, 2, '#e63946', -12, 0, -15, 3);
    c.restore();
  }
  c.restore();
}

// ---- HUD: who you are, who else is here, and how to swap. Driven by state.mover, so undo/restart stay right. ----
const castEl = document.getElementById('cast'), swapBtn = document.getElementById('swap');
swapBtn.onclick = () => act('swap');
let shown = '';
function hud() {
  const key = state.cast.join() + '|' + state.mover;
  if (key === shown) return;
  shown = key;
  const solo = state.cast.length < 2;
  castEl.hidden = swapBtn.hidden = solo;
  if (solo) return;
  castEl.replaceChildren(...state.cast.map(id => {
    const on = id === state.mover, cv = document.createElement('canvas'), n = on ? 52 : 34, k = devicePixelRatio || 1;
    cv.width = cv.height = n * k; cv.style.width = cv.style.height = `${n}px`; cv.className = on ? 'on' : '';
    cv.title = CHARACTERS[id]?.name ?? id;
    const c = cv.getContext('2d'); sprite(c, n * k / 2, n * k / 2 + 2 * k, n * k * 0.95, id);
    return cv;
  }), Object.assign(document.createElement('small'), { textContent: 'Tab / Space ⇄' }));
  castEl.setAttribute('aria-label', `playing as ${CHARACTERS[state.mover]?.name ?? state.mover}`);
}

// ---- Intro card: the first time a level brings someone you haven't met. Storage is optional. ----
const card = document.getElementById('card');
let met = new Set();
try { met = new Set(JSON.parse(localStorage.getItem('met') ?? '[]')); } catch { /* storage may be blocked */ }
let queue = [], level;
function showNext() {
  const id = queue.shift();
  if (!id) { card.hidden = true; return; }
  const ch = CHARACTERS[id];
  met.add(id); try { localStorage.setItem('met', JSON.stringify([...met])); } catch { /* fine */ }
  card.style.setProperty('--c', ch.color);
  card.querySelector('h2').textContent = ch.name;
  card.querySelector('.move').textContent = ch.move;
  card.querySelector('.trivia').textContent = ch.trivia;
  const cv = card.querySelector('canvas'), c = cv.getContext('2d');
  c.clearRect(0, 0, cv.width, cv.height); sprite(c, cv.width / 2, cv.height / 2 + 6, cv.width * 0.9, id);
  card.hidden = false;
}
const dismiss = e => { if (card.hidden) return; e.preventDefault(); e.stopImmediatePropagation(); showNext(); };
addEventListener('keydown', dismiss, true); // capture: the key that closes the card never also moves you
card.addEventListener('click', dismiss);

export function castUi() {
  hud();
  if (level === orig) return;
  level = orig;
  if (Q.has('moves') || Q.has('showcase')) return; // replays and visual QA never wait behind a card
  queue = state.cast.filter(id => !met.has(id) && CHARACTERS[id]);
  if (card.hidden) showNext();
}
