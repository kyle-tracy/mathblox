// The path map (?map): travel between places, never play. A graph drawing: nodes are places, edges are paths, and an
// edge you have walked glows. Drawing and input only: where a press goes and who may enter come from core/map.js.
import { cv, g, INK, WHITE, rr, circle, text, reduced, setReduced, TS, FONT, TITLE } from './look.js';
import { sprite } from './cast.js';
import { getDone } from './state.js';
import { storm } from './fx.js';
import { tone, pitch, boing, muted, setMute, muteBtn } from './audio.js';
import { CHARACTERS } from '../levels/characters.js';
import { WORLDS } from '../levels/worlds.js';
import { recruits, world, missing, stonesLit } from '../core/progress.js';
import { NODES, newMap, step } from '../core/map.js';

const Q = new URLSearchParams(location.search), from = Q.get('from'), done = getDone();
if (from) history.replaceState(null, '', '?map'); // a reload starts here, not with the welcome back
let s = newMap(done, Object.keys(NODES).find(id => NODES[id].world === from) ?? 'sumhenge');
document.getElementById('name').textContent = `${TITLE}: Sumhenge`;
for (const id of ['undo', 'restart', 'next', 'swap', 'map']) document.getElementById(id).hidden = true;

// ---- Layout: layout units → pixels. Sumhenge (0, 0) is the origin. ----
const U = 64, HUD = 96, xs = Object.values(NODES).map(n => n.x), ys = Object.values(NODES).map(n => n.y);
const X = x => (x - Math.min(...xs) + 1.5) * U, Y = y => HUD + (y - Math.min(...ys) + 1) * U;
cv.width = (Math.max(...xs) - Math.min(...xs) + 3) * U; cv.height = HUD + (Math.max(...ys) - Math.min(...ys) + 2) * U;
const fit = () => { const wide = matchMedia('(min-aspect-ratio: 5/4)').matches; // index.html: buttons beside on wide screens, below on tall
  const k = wide ? Math.min((innerWidth - 190) / cv.width, (innerHeight - 90) / cv.height) : Math.min((innerWidth - 24) / cv.width, (innerHeight - 220) / cv.height);
  cv.style.width = `${cv.width * Math.max(0.3, Math.min(1.4, k))}px`; };
fit(); addEventListener('resize', fit);

// ---- Words (ported from the Road, craft/play.js) ----
let msg = '';
const say = m => { msg = m; };
const who = id => CHARACTERS[id]?.name ?? id, about = w => (w.kid ?? w.concept).replace(/[?!]$/, ''); // kid words first (levels/worlds.js)
const bring = ms => ms.map(m => (m.startsWith('heroes:') ? `all ${m.slice(7)} heroes` : who(m))).join(' and ');
// What a door is waiting for, as a sentence: heroes to bring, or rooms to finish first (needs never mix the two).
const need = ms => (ms[0]?.startsWith('done:') ? `Finish ${ms.map(m => world(m.slice(5)).name).join(' and ')} first` : `Bring ${bring(ms)}`);
// ponytail: the greet's fact is the trivia's first sentence, cut at its first clause if long; a `greet` field in CHARACTERS (Worldo) is cleaner.
const short = t => { const s1 = t.split(/(?<=\.) /)[0]; return s1.length > 70 ? `${s1.split(/[,:] | and /)[0]}.` : s1; };
const miss = id => missing(id, recruits(done), done); // every recruit travels with you: hero needs mean "recruited"
function greet(at) { // a host speaks: who they are and one fact, then what the place teaches and whether you can go in
  const id = NODES[at].world;
  if (!id) return say(at === 'keep' ? 'The Storm Keep. Its stairs go down, to the ÷0 Storm.' : 'The stairs go down.');
  const w = world(id), m = miss(id), h = w.hero ?? w.host;
  const how = !w.levels.length ? 'Beyond the demo, for now.' : m.length ? `${need(m)}.` : done.includes(id) ? 'Go in to play again!' : 'Go in!';
  say(h ? `${who(h)}. ${short(CHARACTERS[h].trivia)}\n${w.name}: ${about(w)}. ${how}`
    : `${w.name}: ${about(w)}.\n${w.levels.length ? how : `${need(w.needs)}. ${how}`}`);
}
const ENDING = 'Bhāskara called sharing by nothing "infinite". Today we say it has no answer. Every stone at Sumhenge is lit. Walk anywhere you like.';
const hero = from && world(from)?.hero;
if (from === 'dungeon' && done.includes('dungeon')) say(ENDING);
else if (hero && hero !== 'tally' && done.includes(from)) say(`${who(hero)} joins you!`);
else greet(s.at);

// ---- Walking ----
const recruited = recruits(done).filter(h => h !== 'tally'), troupe = recruited.length ? recruited : ['tally']; // the Tally-Keeper guides only until the first recruit
const edge = (a, b) => [a, b].sort().join('|');
let walked = new Set(); try { walked = new Set(JSON.parse(localStorage.getItem('mathblox.walked')) ?? []); } catch { /* no storage: nothing glows yet */ }
let walk = null, facing = 'right';
function act(dir, instant = false) {
  const r = step(s, dir);
  s = r.state;
  for (const e of r.events) {
    if (e.type === 'walk') {
      walked.add(edge(e.from, e.to)); try { localStorage.setItem('mathblox.walked', JSON.stringify([...walked])); } catch { /* fine */ }
      walk = instant ? null : { ...e, t0: performance.now() };
      if (NODES[e.to].x !== NODES[e.from].x) facing = NODES[e.to].x > NODES[e.from].x ? 'right' : 'left';
      if (!instant) tone(pitch(NODES[e.to].y < NODES[e.from].y ? 7 : 4), 0.08, 'sine'); // a little higher going up
      greet(e.to);
    }
    if (e.type === 'locked') { boing(); const w = world(e.world); say(e.soon ? `${w.name} (${about(w)}) is beyond the demo, for now.` : `${w.name}: ${need(e.missing)}.`); }
    if (e.type === 'enter') { [0, 4, 7].forEach((n, i) => tone(pitch(n + 12), 0.12, 'triangle', 0, i * 0.08)); location.search = `?world=${e.world}`; }
  }
}

// ---- Input: arrows/WASD/buttons walk, Enter/Space/E go in; on touch a swipe walks and a tap goes in ----
const KEYS = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r', w: 'u', s: 'd', a: 'l', d: 'r', Enter: 'enter', ' ': 'enter', e: 'enter' };
addEventListener('keydown', e => {
  if (e.repeat) return;
  if (KEYS[e.key]) { act(KEYS[e.key]); e.preventDefault(); }
  else if (e.key === 'm') setMute(!muted);
  else if (e.key === 'Escape') location.search = ''; // back to the title
});
document.querySelectorAll('[data-dir]').forEach(b => b.onclick = () => act(b.dataset.dir[0]));
muteBtn.onclick = () => setMute(!muted); setMute(muted);
document.getElementById('motion').onclick = () => setReduced(!reduced);
let touch;
cv.addEventListener('touchstart', e => { touch = e.touches[0]; }, { passive: true });
cv.addEventListener('touchend', e => {
  const t = e.changedTouches[0], dx = t.clientX - touch.clientX, dy = t.clientY - touch.clientY;
  act(Math.max(Math.abs(dx), Math.abs(dy)) > 24 ? (Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u')) : 'enter');
});
cv.addEventListener('click', () => { if (!touch) act('enter'); }); // a mouse click goes in too (touch already did)
for (const c of Q.get('moves') ?? '') act(c === 'e' ? 'enter' : c, true); // QA: replay walks (udlr, e enters)

// ---- Looks: one era per hero world (the Road's doors and lands) ----
const STYLE = { camp: ['#b5835a', '#7a4f2e'], alexandria: [INK, '#e08a4f'], croton: ['#f3ead2', '#c9b68a'], ujjain: ['#00798c', '#f2c14e'], elea: ['#cfc6dd', '#6a4c93'] };
const home = id => WORLDS.find(w => w.hero && w.hero === world(id)?.host)?.id; // a landing wears its hero's home era
const locked = at => { const id = NODES[at].world; return !!id && (!world(id).levels.length || miss(id).length > 0); };
const ln = (lw, col) => { g.lineWidth = lw; g.strokeStyle = col; g.stroke(); };
function seal(x, y, r = 9) { // an unbroken wax seal, like a letter not yet opened
  g.fillStyle = '#b5523b'; g.beginPath(); for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, k = i % 2 ? r : r * 1.12; g.lineTo(x + Math.cos(a) * k, y + Math.sin(a) * k); } g.fill();
  g.beginPath(); g.arc(x, y, r * 0.55, 0, 7); ln(1.5, '#7f3426');
}
function flame(cx, by, h, t) { // three tongues, each on its own flicker (still in reduced motion)
  [['#ef476f', 1, 1], ['#ff9f1c', 0.72, 1.7], ['#ffd166', 0.42, 2.9]].forEach(([c, k, f]) => {
    const hh = h * k * (1 + 0.1 * Math.sin(t / 140 * f)), w = hh * 0.45;
    g.fillStyle = c; g.beginPath(); g.moveTo(cx - w, by); g.quadraticCurveTo(cx - w, by - hh * 0.6, cx, by - hh); g.quadraticCurveTo(cx + w, by - hh * 0.6, cx + w, by); g.fill();
  });
}
function henge(cx, cy, t) { // Sumhenge: a bank, five standing stones (one per hero world) round the fire; one lights per finished world
  const lit = stonesLit(done), n = WORLDS.filter(w => w.hero).length;
  g.setLineDash([8, 6]); g.beginPath(); g.ellipse(cx, cy + 4, 40, 30, 0, 0, 7); ln(3, lit ? 'rgba(242,193,78,.7)' : 'rgba(201,182,138,.45)'); g.setLineDash([]);
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i + 0.5) * 2 * Math.PI / n, x = cx + Math.cos(a) * 36, y = cy + 4 + Math.sin(a) * 26, on = i < lit;
    g.save(); if (on) { g.shadowColor = '#ffd166'; g.shadowBlur = 14; }
    g.beginPath(); g.roundRect(x - 6, y - 20, 12, 22, [5, 5, 1, 1]); g.fillStyle = on ? '#f2c14e' : '#9aa0a6'; g.fill(); g.restore(); ln(2, INK);
  }
  g.fillStyle = '#7a5c43'; g.fillRect(cx - 12, cy + 10, 24, 5); flame(cx, cy + 10, 24, t);
}
function hut(cx, cy, id, t) { // a bonus room (a Toad House): a small round house under a striped cap
  rr(cx - 15, cy - 6, 30, 22, 4, '#f4efe4'); g.beginPath(); g.roundRect(cx - 15, cy - 6, 30, 22, 4); ln(2, INK);
  g.beginPath(); g.ellipse(cx, cy - 6, 25, 20, 0, Math.PI, 0); g.closePath(); g.fillStyle = id === 'campfire' ? '#ef476f' : '#06a77d'; g.fill(); ln(2.5, INK);
  g.beginPath(); for (const k of [-12, 0, 12]) { g.moveTo(cx + k, cy - 6); g.quadraticCurveTo(cx + k * 0.6, cy - 18, cx + k * 0.2, cy - 25); } ln(3, 'rgba(255,255,255,.65)'); // stripes, never spots: dots mean quantity
  g.beginPath(); g.arc(cx, cy + 16, 7, Math.PI, 0); g.fillStyle = '#5b3a1e'; g.fill();
  if (id === 'campfire') flame(cx + 22, cy + 16, 16, t); else text('?', cx + 22, cy + 6, 16, '#ffd166');
}
function chhatri(cx, cy, t) { // the Storm Keep: a domed pavilion on the top terrace, the ÷0 storm over it until the pool is calmed
  rr(cx - 26, cy + 8, 52, 9, 2, '#c48c52'); for (const k of [-21, -8, 4, 17]) rr(cx + k, cy - 10, 4, 18, 1, '#e6bb7e');
  rr(cx - 26, cy - 15, 52, 6, 2, '#b07a45'); g.beginPath(); g.ellipse(cx, cy - 15, 17, 16, 0, Math.PI, 0); g.fillStyle = '#e6bb7e'; g.fill(); ln(2, INK);
  if (!done.includes('dungeon')) storm({ churn: true }, t, cx - 32, cy - 40);
}
function well() { // the stepwell (Chand Baori): sandstone narrowing and darkening as it goes down, stair flights criss-crossing its walls
  const k = NODES.keep, p = NODES.pool, top = Y(k.y) + 26, bot = Y(p.y) + 30, cx = X(k.x), w0 = 2.1 * U, w1 = 0.7 * U;
  const grad = g.createLinearGradient(0, top, 0, bot); grad.addColorStop(0, '#e6bb7e'); grad.addColorStop(1, '#5e3c22');
  g.beginPath(); g.moveTo(cx - w0, top); g.lineTo(cx + w0, top); g.lineTo(cx + w1, bot); g.lineTo(cx - w1, bot); g.closePath(); g.fillStyle = grad; g.fill();
  g.beginPath(); for (let y = top + 12, i = 0; y < bot; y += 12, i++) { const w = w0 + (w1 - w0) * (y - top) / (bot - top); g.moveTo(cx - w, y); g.lineTo(cx + w, y); } ln(1, 'rgba(60,35,15,.35)');
  g.beginPath(); for (let y = top, i = 0; y + 24 <= bot; y += 24, i++) for (const sd of [-1, 1]) { const w = w0 + (w1 - w0) * (y - top) / (bot - top); g.moveTo(cx + sd * w * 0.92, y + (i % 2) * 24); g.lineTo(cx + sd * w * 0.62, y + (1 - i % 2) * 24); } ln(2, 'rgba(255,240,210,.35)');
}
function pool(cx, cy, t) {
  g.beginPath(); g.ellipse(cx, cy, 30, 16, 0, 0, 7); g.fillStyle = '#16202e'; g.fill(); ln(2, INK);
  g.beginPath(); for (const k of [-6, 2, 9]) { g.moveTo(cx - 20, cy + k + Math.sin(t / 400 + k) * 1.5); g.quadraticCurveTo(cx, cy + k - 3, cx + 20, cy + k + Math.sin(t / 500 + k) * 1.5); } ln(1.5, 'rgba(160,190,220,.4)');
  if (!done.includes('dungeon')) storm({ churn: true }, t, cx - 32, cy - 10);
}
function place(at, cx, cy, t) { // a world's node: a disc in its era colours with its host's emblem; sealed ones in wax
  const id = NODES[at].world, w = world(id), era = STYLE[id] ? id : home(id), [face, trim] = STYLE[era] ?? ['#8d8f9c', '#5b5e6b'], shut = locked(at);
  g.save(); if (shut) g.globalAlpha = 0.6;
  g.beginPath(); g.arc(cx, cy, 24, 0, 7); g.fillStyle = face; g.fill(); ln(4, trim); g.beginPath(); g.arc(cx, cy, 26, 0, 7); ln(2, INK);
  const h = w.hero ?? w.host, two = w.needs.filter(n => CHARACTERS[n]);
  if (h) sprite(g, cx, cy, U * 0.6, h, 0, 'right', 0, true);
  else two.forEach((n, i) => sprite(g, cx + (i ? 9 : -9), cy, U * 0.45, n, 0, 'right', 0, true)); // a pair world: the two heroes it needs
  g.restore();
  if (shut) seal(cx + 16, cy + 16);
  if (done.includes(id)) { g.fillStyle = '#06d6a0'; circle(cx + 18, cy - 18, 9); text('✓', cx + 18, cy - 17, 12, INK); }
}
function label(at, cx, cy) {
  const n = NODES[at], name = at === 'sumhenge' ? 'Sumhenge' : at === 'keep' ? 'The Storm Keep' : at === 'pool' ? 'The Pool' : n.world ? world(n.world).name : '';
  if (!name) return;
  g.font = `13px ${FONT}`; const w = g.measureText(name).width + 10;
  rr(cx - w / 2, cy + 33, w, 18, 9, 'rgba(29,31,46,.75)'); text(name, cx, cy + 42, 13, at === s.at ? '#ffd166' : '#f4efe4', false);
}
function wrap(m, width) { // the message's own line breaks, then word-wrap to the HUD's width
  g.font = `17px ${FONT}`;
  return m.split('\n').flatMap(par => par.split(' ').reduce((ls, wd) => {
    const t = ls.length ? `${ls[ls.length - 1]} ${wd}` : wd;
    if (ls.length && g.measureText(t).width <= width) ls[ls.length - 1] = t; else ls.push(wd);
    return ls;
  }, []));
}

function draw(now) {
  const t = reduced ? 0 : now, P = id => [X(NODES[id].x), Y(NODES[id].y)];
  g.fillStyle = '#2b2d42'; g.fillRect(0, 0, cv.width, cv.height);
  g.beginPath(); g.moveTo(0, Y(0)); g.lineTo(cv.width, Y(0)); g.moveTo(X(0), HUD); g.lineTo(X(0), cv.height); ln(1.5, 'rgba(244,239,228,.08)'); // the axes cross at zero: Sumhenge
  well();
  const seen = new Set();
  for (const [a, n] of Object.entries(NODES)) for (const b of Object.values(n.links)) { // edges: chalk until walked, then they glow
    const k = edge(a, b); if (seen.has(k)) continue; seen.add(k);
    const [x1, y1] = P(a), [x2, y2] = P(b);
    g.save(); g.lineCap = 'round'; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2);
    if (walked.has(k)) { g.shadowColor = '#ffd166'; g.shadowBlur = 12; ln(6, '#f2c14e'); } else { g.setLineDash([14, 10]); ln(4, 'rgba(244,239,228,.4)'); }
    g.restore();
    for (const [z, [xa, ya], [xb, yb]] of [[b, [x1, y1], [x2, y2]], [a, [x2, y2], [x1, y1]]]) if (locked(z)) seal(xa + (xb - xa) * 0.62, ya + (yb - ya) * 0.62, 7); // a sealed path in
  }
  for (const [at, n] of Object.entries(NODES)) {
    const [cx, cy] = P(at);
    if (at === s.at) { g.beginPath(); g.arc(cx, cy, 34, 0, 7); ln(3, 'rgba(255,209,102,.8)'); }
    if (at === 'sumhenge') henge(cx, cy, t);
    else if (at === 'keep') chhatri(cx, cy, t);
    else if (at === 'pool') pool(cx, cy, t);
    else if (!n.world) { g.fillStyle = '#c48c52'; circle(cx, cy, 9); g.beginPath(); g.arc(cx, cy, 9, 0, 7); ln(2, INK); } // a stair turn
    else if (world(n.world).bonus) hut(cx, cy, n.world, t);
    else place(at, cx, cy, t);
    if (at === 'pool' && locked(at)) seal(cx + 22, cy + 10);
    label(at, cx, cy);
  }
  // The troupe: every recruit walks the edge, one behind the other (reduced motion: half the time, no bob).
  const T = 420 * TS, lag = 110 * TS, age = walk ? now - walk.t0 : Infinity;
  troupe.forEach((h, i) => {
    const q = Math.min(1, Math.max(0, (age - (troupe.length - 1 - i) * lag) / T)), [ax, ay] = walk ? P(walk.from) : P(s.at), [bx, by] = P(s.at);
    const x = ax + (bx - ax) * q - (i - (troupe.length - 1) / 2) * 20, y = ay + (by - ay) * q - 30 - (q < 1 && !reduced ? Math.abs(Math.sin(q * Math.PI * 3)) * 5 : 0);
    sprite(g, x, y, U * 0.62, h, t, facing);
  });
  g.fillStyle = '#1d1f2e'; g.fillRect(0, 0, cv.width, HUD); // HUD: what the place says
  wrap(msg, cv.width - 40).slice(0, 4).forEach((l, i, ls) => text(l, cv.width / 2, HUD / 2 + (i - (ls.length - 1) / 2) * 21, 17, WHITE, false));
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
