// Craft prototype view + input (?craft). Crude on purpose: Arto polishes later.
// Never does math: every value, height and warmth comes from core/craft.js state and events.
import { cv, g, CELL, INK, WHITE, C, rr, circle, text } from '../render/look.js';
import { piece, opBlock } from '../render/draw.js';
import { tone, pitch, boing, muted, setMute, muteBtn } from '../render/audio.js';
import { isNat } from '../core/value.js';
import { newCraft, step, pits, isNight, dayOf, DAY, NIGHT, BAG } from '../core/craft.js';

const VW = 15, VH = 9, PAD = 40, HUD = 70; // view in cells; margins for the axes and the HUD
let s = newCraft(), history = [], msg = '', msgT = 0;
cv.width = VW * CELL + PAD; cv.height = VH * CELL + PAD + HUD;
document.getElementById('name').textContent = 'MathBlox Craft: keep the fire warm';
const say = m => { msg = m; msgT = performance.now(); };
say('Push blocks together to do math. Feed the fire at 0. Space picks up / puts down.');

const SAY = { 'bag-full': `Your bag holds ${BAG}.`, 'not-whole': 'Only whole numbers burn and fill pits.', 'too-long': 'Too big for that pit.',
  'zero-fill': '0 fills nothing.', socket: 'The fire wants a number.', empty: 'Nothing to put down.', storm: '÷ 0: a storm! Nothing happens.' };
function act(a) {
  const r = step(s, a);
  if (r.state !== s && r.events[0]?.type !== 'bounce') { history.push(s); s = r.state; }
  else if (r.state !== s) s = r.state; // turned to face a wall: no time, no undo entry needed
  for (const e of r.events) {
    if (e.type === 'bounce') { boing(); if (SAY[e.reason]) say(SAY[e.reason]); }
    if (e.type === 'push') tone(110, 0.06, 'sine');
    if (e.type === 'merge' || e.type === 'carve' || e.type === 'multiply' || e.type === 'share') tone(pitch(isNat(e.value) ? e.value : 0), 0.18, 'triangle');
    if (e.type === 'feed') { for (let i = 0; i < e.value; i++) tone(pitch(i * 2), 0.05, 'sawtooth', -40, i * 0.03); say(`The fire eats ${e.value}. Warmth ${e.heat}!`); }
    if (e.type === 'fill') { tone(pitch(e.value), 0.2, 'sine'); say(e.left ? `Filled ${e.value}. The pit still needs ${e.left}.` : 'The pit is flat ground now!'); }
    if (e.type === 'pick') tone(pitch(8), 0.08, 'sine', 100);
    if (e.type === 'place') tone(pitch(4), 0.08, 'sine', -100);
    if (e.type === 'dusk') say('Night falls. The fire burns faster.');
    if (e.type === 'dawn') say('Morning!');
    if (e.type === 'doze') { say('The fire went out. You dozed off and woke at camp. Nothing is lost.'); tone(300, 0.6, 'sine', -150); }
  }
}
const undo = () => { if (history.length) s = history.pop(); };
const restart = () => { history.push(s); s = newCraft(); };

function draw(now) {
  const W = s.tiles[0].length, cam = Math.max(0, Math.min(W - VW, s.player.x - 7));
  const X = x => PAD + (x - cam) * CELL, Y = y => HUD + y * CELL;
  g.fillStyle = '#2b2d42'; g.fillRect(0, 0, cv.width, cv.height);
  for (let y = 0; y < VH; y++) for (let x = cam; x < cam + VW; x++) {
    const t = s.tiles[y][x];
    g.fillStyle = t === '#' ? C.wall : t === 'o' ? C.trench : C.floor; g.fillRect(X(x), Y(y), CELL, CELL);
    g.strokeStyle = C.grid; g.lineWidth = 1; g.strokeRect(X(x) + 0.5, Y(y) + 0.5, CELL, CELL);
    if (t === 'o') { g.fillStyle = C.trenchDeep; g.fillRect(X(x), Y(y), CELL, 6); }
  }
  for (const p of pits(s)) if (p.x >= cam - 3 && p.x < cam + VW) text(String(p.height).replace('-', '−'), X(p.x) + CELL / 2, Y(p.y) + CELL / 2, 18, WHITE);
  // Axes: camp is the origin (a frame of reference; labels count cells from camp, y up).
  g.strokeStyle = C.axis; g.lineWidth = 2; g.setLineDash([6, 4]);
  g.beginPath(); g.moveTo(PAD, Y(s.camp.y) + CELL / 2); g.lineTo(cv.width, Y(s.camp.y) + CELL / 2);
  if (s.camp.x >= cam && s.camp.x < cam + VW) { g.moveTo(X(s.camp.x) + CELL / 2, HUD); g.lineTo(X(s.camp.x) + CELL / 2, HUD + VH * CELL); }
  g.stroke(); g.setLineDash([]);
  // The fire at camp: flames grow with its warmth (a number the core keeps).
  const fx = X(s.camp.x) + CELL / 2, fy = Y(s.camp.y) + CELL / 2, h = Math.min(34, 16 + s.fire * 3);
  g.fillStyle = C.floor; g.fillRect(X(s.camp.x), Y(s.camp.y), CELL, CELL);
  rr(fx - 24, fy + 14, 48, 10, 4, '#8a5a2b');
  g.fillStyle = '#ff9f1c'; circle(fx, fy + 8 - h / 3, h * 0.8); g.fillStyle = '#ffd166'; circle(fx, fy + 6, h * 0.5);
  text(s.fire, fx, fy + 6, 18, INK);
  for (const o of s.objects) if (o.x >= cam - 3 && o.x < cam + VW) {
    if (o.kind === 'op') opBlock(X(o.x), Y(o.y), o.op, 1);
    else if (isNat(o.value) && o.value <= 20) piece(X(o.x), Y(o.y), o);
    else { rr(X(o.x) + 5, Y(o.y) + 5, CELL - 10, CELL - 10, 10, '#c9d6ea'); text(String(o.value).replace('-', '−'), X(o.x) + CELL / 2, Y(o.y) + CELL / 2, 18, INK); }
  }
  // Player, with a nose toward the facing direction (what Space picks up).
  const px = X(s.player.x) + CELL / 2, py = Y(s.player.y) + CELL / 2, d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[s.facing];
  g.fillStyle = C.player; circle(px, py, CELL * 0.33); circle(px + d[0] * 20, py + d[1] * 20, 7);
  g.fillStyle = WHITE; for (const k of [-1, 1]) circle(px + k * 9, py - 5, 6);
  g.fillStyle = INK; for (const k of [-1, 1]) circle(px + k * 9 + d[0] * 2, py - 4 + d[1] * 2, 3);
  // Night: everything dims except a glow around the fire.
  if (isNight(s.t)) {
    const grad = g.createRadialGradient(fx, fy, 20, fx, fy, 60 + s.fire * 18);
    grad.addColorStop(0, 'rgba(10,14,40,0)'); grad.addColorStop(1, 'rgba(10,14,40,.6)');
    g.fillStyle = grad; g.fillRect(PAD, HUD, VW * CELL, VH * CELL);
  }
  g.fillStyle = '#f4efe4'; g.fillRect(0, HUD + VH * CELL, cv.width, PAD); g.fillRect(0, HUD, PAD, VH * CELL);
  for (let x = cam; x < cam + VW; x++) text(x - s.camp.x, X(x) + CELL / 2, HUD + VH * CELL + 20, 14, C.axis, x === s.camp.x);
  for (let y = 0; y < VH; y++) text(s.camp.y - y, PAD / 2, Y(y) + CELL / 2, 14, C.axis, y === s.camp.y);
  // HUD: day, warmth, bag, message.
  const night = isNight(s.t), left = night ? DAY - s.t % DAY : DAY - NIGHT - s.t % DAY;
  text(`${night ? '☾ Night' : '☀ Day'} ${dayOf(s.t)}`, 70, 20, 18, WHITE);
  text(night ? `${left} moves to dawn` : `${left} moves to dusk`, 70, 46, 13, '#c9d6ea', false);
  text(`🔥 ${s.fire}`, 190, 30, 22, '#ffd166');
  text('bag', 270, 30, 14, '#c9d6ea', false);
  for (let i = 0; i < BAG; i++) {
    const bx = 290 + i * 54, o = s.bag[i];
    g.strokeStyle = '#c9d6ea'; g.lineWidth = 2; g.strokeRect(bx, 8, 50, 50);
    if (o) { g.save(); g.translate(bx - 0.6, 7.4); g.scale(0.8, 0.8); if (o.kind === 'op') opBlock(0, 0, o.op, 1); else if (isNat(o.value) && o.value <= 20 && !o.shape) piece(0, 0, o); else text(String(o.value).replace('-', '−'), CELL / 2, CELL / 2, 20, WHITE); g.restore(); }
  }
  if (msg && now - msgT < 5000) text(msg, (420 + cv.width) / 2, 32, 14, WHITE, false);
  requestAnimationFrame(draw);
}

const KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', ' ': 'grab', e: 'grab' };
addEventListener('keydown', e => {
  if (e.repeat) return;
  if (KEYS[e.key]) { act(KEYS[e.key]); e.preventDefault(); }
  else if (e.key === 'z' || e.key === 'Backspace') undo();
  else if (e.key === 'r') restart();
  else if (e.key === 'm') setMute(!muted);
});
document.querySelectorAll('[data-dir]').forEach(b => b.onclick = () => act(b.dataset.dir));
document.getElementById('undo').onclick = undo;
document.getElementById('restart').onclick = restart;
muteBtn.onclick = () => setMute(!muted);
const grabBtn = Object.assign(document.createElement('button'), { textContent: '✋', title: 'pick up / put down (Space)' });
grabBtn.setAttribute('aria-label', 'pick up or put down'); grabBtn.onclick = () => act('grab');
document.querySelector('.bar').prepend(grabBtn);
let touch;
cv.addEventListener('touchstart', e => { touch = e.touches[0]; }, { passive: true });
cv.addEventListener('touchend', e => {
  const t = e.changedTouches[0], dx = t.clientX - touch.clientX, dy = t.clientY - touch.clientY;
  act(Math.max(Math.abs(dx), Math.abs(dy)) > 24 ? (Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')) : 'grab');
});
const k = Math.min(1, (innerWidth - 40) / cv.width, (innerHeight - 200) / cv.height);
cv.style.width = `${cv.width * Math.max(0.5, k)}px`;
for (const c of new URLSearchParams(location.search).get('moves') ?? '') act({ u: 'up', d: 'down', l: 'left', r: 'right', g: 'grab' }[c]);
setMute(muted);
requestAnimationFrame(draw);
