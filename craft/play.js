// Craft prototype view + input (?craft). Crude on purpose: Arto polishes later.
// Never does math: every value, height and warmth comes from core/craft.js state and events.
import { cv, g, CELL, INK, WHITE, C, rr, circle, text, dotPos, equation, reduced, TS, FONT } from '../render/look.js';
import { piece, opBlock, label } from '../render/draw.js';
import { sprite } from '../render/cast.js';
import { getDone } from '../render/state.js';
import { CHARACTERS } from '../levels/characters.js';
import { recruits, parties, canEnter, world, missing } from '../core/progress.js';
import { ghostCells, wantWhole } from '../render/fx.js';
import { tone, pitch, boing, muted, setMute, muteBtn } from '../render/audio.js';
import { isNat, parts } from '../core/value.js';
import { newCraft, step, heightAt, bagSize, isNight, dayOf, movesToSwitch, choose, atSite, DAY, NIGHT, DISTRICTS } from '../core/craft.js';

const VW = 15, VH = 9, PAD = 40, HUD = 100; // view in cells; margins for the axes and the HUD
// Back from a world (?craft&from=id): the Craft you left (saved on the way in, if storage allows), standing at its door.
const from = new URLSearchParams(location.search).get('from'), moves = new URLSearchParams(location.search).get('moves'), done = getDone(); // read before the URL is replaced
let saved = null;
if (from && world(from)) try { saved = JSON.parse(localStorage.getItem('mathblox.craft')); } catch { /* no storage: a fresh Craft */ }
if (saved && String(saved.tiles?.map(r => r.length)) !== String(newCraft().tiles.map(r => r.length))) saved = null; // a save from an older map
let s = from && world(from) ? atSite({ ...(saved ?? newCraft(done)), done }, from) : newCraft(done), history = [], msg = '', msgT = 0;
cv.width = VW * CELL + PAD; cv.height = VH * CELL + PAD + HUD;
document.getElementById('name').textContent = 'MathBlox: the Road of Lands';
const say = m => { msg = m; msgT = performance.now(); };
if (from) window.history.replaceState(null, '', '?craft'); // a reload starts here, not from the save we came back from
const who = id => CHARACTERS[id]?.name ?? id, about = w => w.kid ?? w.concept; // kid words first (levels/worlds.js)
const bring = ms => ms.map(m => (m.startsWith('pairs:') ? `${m.slice(6)} finished pair worlds` : who(m))).join(' and ');
// ponytail: the greet's fact is the trivia's first sentence, cut at its first clause if long; a `greet` field in CHARACTERS (Worldo) is cleaner.
const short = t => { const s1 = t.split(/(?<=\.) /)[0]; return s1.length > 70 ? `${s1.split(/[,:] | and /)[0]}.` : s1; };
function greet(id) { // a host speaks: who they are and one fact, then what the land teaches and whether you can go in
  const w = world(id), miss = missing(id, s.cast, s.done);
  const how = !w.levels.length ? 'Still being built.' : miss.length ? `Bring ${bring(miss)}.` : s.done.includes(id) ? 'Walk in to play again!' : 'Walk in!';
  say(w.hero ? `${who(w.hero)}. ${short(CHARACTERS[w.hero].trivia)}\n${w.name}: ${about(w)}. ${how}`
    : `${w.name}: ${about(w)}.\n${w.levels.length ? how : `Bring ${bring(w.needs)}. ${how}`}`);
}
const hero = from && world(from).hero;
say(hero && hero !== 'tally' && done.includes(from) ? `${who(hero)} joins you! Press C at camp to pick who comes along.` : 'Push blocks together to do math. Feed number blocks to the fire, where the lines cross. Space picks up / puts down.');

const SAY = { 'bag-full': 'Your bag is full.', 'not-whole': 'Only whole numbers burn.',
  'zero-fill': '0 is nothing: it can\'t burn or fill.', socket: 'The fire wants a number.', empty: 'Nothing to put down.', storm: '÷ 0: a storm! Nothing happens.' };
function act(a) {
  bump = null;
  const r = step(s, a);
  if (r.state !== s && r.events[0]?.type !== 'bounce') { history.push(s); s = r.state; }
  else if (r.state !== s) s = r.state; // turned to face a wall: no time, no undo entry needed
  for (const e of r.events) {
    if (e.type === 'enter') { try { localStorage.setItem('mathblox.craft', JSON.stringify(s)); } catch { /* fine */ } location.search = `?world=${e.world}`; }
    if (e.reason === 'needs') say(`${world(e.world).name}: bring ${bring(e.missing)}.`);
    if (e.type === 'greet') { tone(pitch(4), 0.08, 'sine'); tone(pitch(7), 0.1, 'sine', 0, 0.08); greet(e.world); }
    if (e.reason === 'soon') say(`${world(e.world).name} (${about(world(e.world))}) is still being built.`);
    if (e.type === 'swap') { tone(520, 0.05, 'sine', 260); say(`You are ${who(e.mover)}.`); }
    if (e.type === 'negate') { tone(pitch(7), 0.1, 'triangle', -120); tone(pitch(0), 0.12, 'triangle', 120, 0.1); }
    if (e.type === 'leap') { tone(pitch(0), 0.12, 'sine'); tone(pitch(12), 0.2, 'sine', 0, 0.1); }
    if (e.type === 'bounce') { boing(); if (SAY[e.reason]) say(SAY[e.reason]);
      const [dx, dy] = a === 'grab' ? [0, 0] : { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[a], hit = r.state.objects.find(o => o.x === e.at.x && o.y === e.at.y);
      bump = { ...e, t0: performance.now(), wob: hit && !hit.mimic ? e.at : { x: e.at.x - dx, y: e.at.y - dy } }; }
    if (['feed', 'hop', 'tame'].includes(e.type)) fxs.push({ ...e, t0: performance.now() }); if (fxs.length > 8) fxs.shift();
    if (e.type === 'push') tone(110, 0.06, 'sine');
    if (e.type === 'merge' || e.type === 'carve' || e.type === 'multiply' || e.type === 'share') tone(pitch(isNat(e.value) ? e.value : 0), 0.18, 'triangle');
    if (e.type === 'feed') { for (let i = 0; i < e.value; i++) tone(pitch(i * 2), 0.05, 'sawtooth', -40, i * 0.03); say(`The fire eats ${e.value}. Warmth ${e.heat}!`); }
    if (e.type === 'land') { tone(pitch(Math.max(0, 6 + (isNat(e.height) ? e.height : -3))), 0.2, 'sine'); say(isNat(e.height) ? (e.height ? `Too much! A ${e.height} is left over as a hill.` : 'Flat ground! You can cross.') : `Still a pit: ${String(e.height).replace('-', '−')}.`); }
    if (e.type === 'mimic') say(`A shy "?" peeks out past the river. It wears ${e.value}.`);
    if (e.type === 'tame') { [0, 4, 7].forEach((n, i) => tone(pitch(n + 12), 0.15, 'triangle', 0, i * 0.1)); say('Tamed! It follows you and carries for you.'); }
    if (e.type === 'hop') { tone(500, 0.15, 'sine', 300); say(`Not ${e.value}... it hops away.`); }
    if (e.type === 'pick') tone(pitch(8), 0.08, 'sine', 100);
    if (e.type === 'place') tone(pitch(4), 0.08, 'sine', -100);
    if (e.type === 'dusk') say('Night falls. The fire burns faster.');
    if (e.type === 'dawn') say(e.ids.length ? 'Morning! Rocks grew back.' : 'Morning!');
    if (e.type === 'doze') { say('The fire went out. You dozed off and woke at camp. Nothing is lost.'); tone(300, 0.6, 'sine', -150); }
  }
}
const undo = () => { if (history.length) s = history.pop(); };
const restart = () => { history.push(s); s = newCraft(s.done, s.cast); };
// C at camp: cycle through every party your recruits can make (one hero, or two).
function pick() {
  const ps = parties(recruits(s.done)), i = ps.findIndex(p => p.join() === s.cast.join()), r = choose(s, ps[(i + 1) % ps.length]);
  if (r.events[0].type === 'bounce') { boing(); return say('Pick your companions at camp, by the fire.'); }
  history.push(s); s = r.state; say(`Going out: ${s.cast.map(who).join(' and ')}.`);
}

// ponytail: one lingering bump (cleared by the next input) plus short one-shot effects; a real fx table if Craft grows.
let bump = null;
const fxs = [], T = ms => ms * TS, age = f => performance.now() - f.t0;
const hearts = (x, y, q) => { for (const d of [-14, 0, 14]) { const hx = x + d, hy = y - 10 - q * 30 - Math.abs(d); g.fillStyle = `rgba(239,71,111,${1 - q})`;
  circle(hx - 3, hy, 4); circle(hx + 3, hy, 4); g.beginPath(); g.moveTo(hx - 7, hy + 1); g.lineTo(hx, hy + 9); g.lineTo(hx + 7, hy + 1); g.fill(); } };
function flame(cx, by, h, w) { // a teardrop flame: outer orange, inner yellow
  for (const [k, c] of [[1, '#ff9f1c'], [0.6, '#ffd166']]) {
    g.fillStyle = c; g.beginPath(); g.moveTo(cx, by - h * k);
    g.quadraticCurveTo(cx + w * k, by - h * k * 0.35, cx, by); g.quadraticCurveTo(cx - w * k, by - h * k * 0.35, cx, by - h * k); g.fill();
  }
}
function sun(cx, cy, night) {
  if (night) { g.fillStyle = '#f1e2c2'; circle(cx, cy, 11); g.fillStyle = '#2b2d42'; circle(cx + 6, cy - 4, 10); return; } // a crescent moon
  g.strokeStyle = '#ffd166'; g.lineWidth = 2.5; g.fillStyle = '#ffd166'; circle(cx, cy, 8);
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(cx + Math.cos(a) * 11, cy + Math.sin(a) * 11); g.lineTo(cx + Math.cos(a) * 15, cy + Math.sin(a) * 15); g.stroke(); }
}
// A pit is dug land: one ledge and one hollow unit hole per unit of depth, so a −3 is three steps down with three holes.
function pit(X0, Y0, h) {
  const [p, q] = parts(h), m = Math.abs(p) / q, n = Math.ceil(m), step = Math.min(7, 24 / n);
  for (let k = 0; k < n; k++) { const e = 2 + k * step, sh = 1 - 0.16 * Math.min(k, 5);
    g.fillStyle = `rgb(${122 * sh | 0},${92 * sh | 0},${67 * sh | 0})`; g.fillRect(X0 + e, Y0 + e, CELL - 2 * e, CELL - 2 * e);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(X0 + e, Y0 + e, CELL - 2 * e, 3); } // each ledge's shadowed lip
  g.strokeStyle = '#f1e2c2'; g.lineWidth = 2;
  for (let i = 0; i < n; i++) { const [x, y] = dotPos(i, X0 + CELL / 2, Y0 + CELL / 2 + 6, 10);
    g.beginPath(); if (i === n - 1 && m < n) { g.moveTo(x, y); g.arc(x, y, 4, -Math.PI / 2, -Math.PI / 2 + (m - i) * 2 * Math.PI); g.closePath(); } else g.arc(x, y, 4, 0, 7); g.stroke(); }
  text(label(h), X0 + CELL / 2, Y0 + 14, 13, WHITE);
}
// The shy creature: a "?" blob with peeking eyes, its equation on a sign above (every number with its dots).
function creature(cx, cy, spec) {
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(cx, cy + 24, 18, 5, 0, 0, 7); g.fill();
  g.fillStyle = '#8e7dff'; g.beginPath(); g.ellipse(cx, cy + 6, 21, 19, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
  text('?', cx, cy + 12, 22, WHITE);
  g.fillStyle = WHITE; for (const d of [-8, 8]) circle(cx + d, cy - 6, 5); g.fillStyle = INK; for (const d of [-8, 8]) circle(cx + d + 2, cy - 5, 2.5); // glancing aside: shy
  const w = equation(spec, 0, 0, 14, INK, false, {}) + 14, sy = cy - 62, sx = Math.max(PAD + w / 2 + 2, Math.min(PAD + VW * CELL - w / 2 - 2, cx)); // the sign stays on the board
  g.fillStyle = C.doorFrame; g.fillRect(cx - 2, sy + 30, 4, 20); // its sign post
  rr(sx - w / 2, sy, w, 38, 6, C.sign); g.strokeStyle = C.doorFrame; g.lineWidth = 2; g.stroke();
  equation(spec, sx, sy + 11, 14, INK, true, {});
}

function draw(now) {
  const W = s.tiles[0].length, cam = Math.max(0, Math.min(W - VW, s.player.x - 7)), camY = Math.max(0, Math.min(s.tiles.length - VH, s.player.y - 4));
  const X = x => PAD + (x - cam) * CELL, Y = y => HUD + (y - camY) * CELL;
  const wob = (x, y) => { // the bumped piece shakes (a rubbery no, never a buzzer)
    if (!bump || reduced || age(bump) > 400 || !bump.wob || bump.wob.x !== x || bump.wob.y !== y) return 0;
    return Math.sin(age(bump) / 25) * 5 * (1 - age(bump) / 400);
  };
  g.fillStyle = '#2b2d42'; g.fillRect(0, 0, cv.width, cv.height);
  for (let y = camY; y < camY + VH; y++) for (let x = cam; x < cam + VW; x++) {
    const t = s.tiles[y][x], h = heightAt(s, x, y);
    const id = LAND[`${x},${y}`], st = id && landLook(id), wall = t === '#' && !h;
    g.fillStyle = wall ? (st?.wall ?? C.wall) : (st?.floor ?? C.floor); g.fillRect(X(x), Y(y), CELL, CELL);
    if (h) pit(X(x), Y(y), h); else if (st) decal(id, st, X(x), Y(y), x, y, wall);
    g.strokeStyle = C.grid; g.lineWidth = 1; g.strokeRect(X(x) + 0.5, Y(y) + 0.5, CELL, CELL);
  }
  // Axes: camp is the origin (a frame of reference; labels count cells from camp, y up).
  g.strokeStyle = C.axis; g.lineWidth = 2; g.setLineDash([6, 4]);
  g.beginPath(); g.moveTo(PAD, Y(s.camp.y) + CELL / 2); g.lineTo(cv.width, Y(s.camp.y) + CELL / 2);
  if (s.camp.x >= cam && s.camp.x < cam + VW) { g.moveTo(X(s.camp.x) + CELL / 2, HUD); g.lineTo(X(s.camp.x) + CELL / 2, HUD + VH * CELL); }
  g.stroke(); g.setLineDash([]);
  // The fire at camp: its warmth (a number the core keeps) is the flame's height, the glow's reach and that many embers.
  const fx = X(s.camp.x) + CELL / 2, fy = Y(s.camp.y) + CELL / 2, feed = fxs.find(f => f.type === 'feed' && age(f) < T(500));
  const flare = feed && !reduced ? 8 * Math.sin(Math.PI * age(feed) / T(500)) : 0, reach = Math.min(260, 40 + s.fire * 14);
  const glow = g.createRadialGradient(fx, fy, 8, fx, fy, reach); glow.addColorStop(0, 'rgba(255,159,28,.35)'); glow.addColorStop(1, 'rgba(255,159,28,0)');
  g.fillStyle = C.floor; g.fillRect(X(s.camp.x), Y(s.camp.y), CELL, CELL);
  g.fillStyle = glow; g.fillRect(fx - reach, fy - reach, reach * 2, reach * 2);
  rr(fx - 24, fy + 18, 48, 8, 4, '#8a5a2b'); g.save(); g.translate(fx, fy + 22); g.rotate(0.3); rr(-22, -4, 44, 8, 4, '#6b4420'); g.restore();
  const fh = Math.min(54, 22 + s.fire * 4) + flare; flame(fx, fy + 20, fh, 14 + Math.min(10, s.fire));
  g.fillStyle = '#ffd166'; for (let i = 0; i < Math.min(20, s.fire); i++) circle(fx - 27 + (i % 10) * 6, fy + 30 + Math.floor(i / 10) * 0, 2); // embers, one per warmth
  text(s.fire, fx, fy + 20 - fh * 0.3, 15, INK);
  if (feed && !reduced) for (let i = 0; i < 6; i++) { const q = age(feed) / T(500); g.fillStyle = `rgba(255,209,102,${1 - q})`; circle(fx + Math.cos(i) * 18 * q, fy - 10 - q * 30 - i * 3, 2.5); } // sparks fly up
  for (const o of s.objects) if (o.x >= cam - 3 && o.x < cam + VW) {
    if (o.mimic) continue; // drawn over the night shade
    const ox = X(o.x) + wob(o.x, o.y), oy = Y(o.y);
    if (o.kind === 'op') opBlock(ox, oy, o.op, 1);
    else { if (o.land) { g.beginPath(); g.ellipse(ox + CELL / 2, oy + CELL + 4, CELL / 2 + 9, CELL * 0.7, 0, Math.PI, 0); g.closePath(); g.fillStyle = '#c9a36b'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#3b2a1a'; g.stroke(); g.strokeStyle = '#7fbf4d'; g.beginPath(); g.ellipse(ox + CELL / 2, oy + CELL + 4, CELL / 2 + 6, CELL * 0.7 - 3, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); } // only land (an overfill hill) stands on a mound; a carried + block does not
      piece(ox, oy, o); }
  }
  // Site doors, each in its world's art: lit doorway with the hero inside if you may enter, dark if not, a check once done.
  for (const [k, id] of Object.entries(s.sites)) {
    const [x, y] = k.split(',').map(Number); if (x < cam || x >= cam + VW) continue;
    siteDoor(X(x), Y(y), id, canEnter(id, s.cast, s.done) && world(id).levels.length, s.done.includes(id), now);
  }
  for (const [k, id] of Object.entries(s.hosts ?? {})) { // each land's host: its hero, or a signpost for a pair land
    const [x, y] = k.split(',').map(Number); if (x < cam || x >= cam + VW) continue;
    host(X(x), Y(y), id, now);
  }
  // Player: the hero you are now, facing the way you face (what Space picks up).
  const px = X(s.player.x) + CELL / 2, py = Y(s.player.y) + CELL / 2;
  sprite(g, px, py, CELL * 0.95, s.mover, reduced ? 0 : now, s.facing);
  // Light: night is a deep blue shade with a clear circle as wide as the fire's warmth; the last moves of day turn amber.
  const night = isNight(s.t), left = movesToSwitch(s.t);
  if (night) {
    const grad = g.createRadialGradient(fx, fy, 20, fx, fy, 60 + s.fire * 18);
    grad.addColorStop(0, 'rgba(10,14,40,0)'); grad.addColorStop(1, 'rgba(10,14,40,.62)');
    g.fillStyle = grad; g.fillRect(PAD, HUD, VW * CELL, VH * CELL);
  } else if (left <= 8) { g.fillStyle = `rgba(255,120,40,${0.03 * (9 - left)})`; g.fillRect(PAD, HUD, VW * CELL, VH * CELL); } // dusk is coming
  // Bump explanations (they stay until the next input): no-room shows where the whole result would go; not-whole shows what fits.
  if (bump?.reason === 'no-room') { g.save(); g.translate(X(0) - 44, HUD); ghostCells(bump.ghost, true); g.restore(); }
  if (bump?.reason === 'not-whole') wantWhole(X(bump.at.x), Y(bump.at.y), [], [[X(s.player.x), Y(s.player.y), CELL, CELL]]);
  // The shy creature (a "?" wearing its equation) and, once tamed, your helper.
  for (const o of s.objects) if (o.mimic && o.x >= cam && o.x < cam + VW) {
    const hop = fxs.find(f => f.type === 'hop' && age(f) < T(450)), q = hop && !reduced ? Math.min(1, age(hop) / T(450)) : 1;
    let cx = X(o.x) + CELL / 2, cy = Y(o.y) + CELL / 2;
    if (hop && q < 1) { cx = X(hop.at.x) + CELL / 2 + (cx - X(hop.at.x) - CELL / 2) * q; cy = Y(hop.at.y) + CELL / 2 + (cy - Y(hop.at.y) - CELL / 2) * q - Math.sin(Math.PI * q) * 50; }
    if (hop && age(hop) < T(450)) { const p = Math.min(1, age(hop) / T(450)); g.fillStyle = `rgba(201,204,214,${1 - p})`; // a puff where it sat
      for (const [dx, dy] of [[-12, 0], [0, -6], [12, 0]]) circle(X(hop.at.x) + CELL / 2 + dx * (1 + p), Y(hop.at.y) + CELL / 2 + 18 + dy, 9); }
    creature(cx, cy, o.value);
  }
  if (s.pet) { const cx = X(s.pet.x) + CELL / 2, cy = Y(s.pet.y) + CELL / 2; g.fillStyle = '#8e7dff'; circle(cx, cy + 8, 16); g.fillStyle = WHITE; circle(cx - 6, cy + 4, 4); circle(cx + 6, cy + 4, 4);
    g.fillStyle = INK; circle(cx - 6, cy + 5, 2); circle(cx + 6, cy + 5, 2); g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cy + 10, 5, 0.3, Math.PI - 0.3); g.stroke(); } // a happy face
  const tame = fxs.find(f => f.type === 'tame' && age(f) < T(600));
  if (tame) hearts(X(tame.at.x) + CELL / 2, Y(tame.at.y) + CELL / 2, reduced ? 0.3 : age(tame) / T(600));
  g.fillStyle = '#f4efe4'; g.fillRect(0, HUD + VH * CELL, cv.width, PAD); g.fillRect(0, HUD, PAD, VH * CELL);
  for (let x = cam; x < cam + VW; x++) text(x - s.camp.x, X(x) + CELL / 2, HUD + VH * CELL + 20, 17, C.axis, x === s.camp.x);
  for (let y = camY; y < camY + VH; y++) text(s.camp.y - y, PAD / 2, Y(y) + CELL / 2, 17, C.axis, y === s.camp.y);
  // HUD: sun or moon and a day track (amber day, blue night, a dot for now), warmth as a flame with one ember per unit, the bag.
  g.fillStyle = '#2b2d42'; g.fillRect(0, 0, cv.width, HUD);
  sun(24, 24, night); text(`Day ${dayOf(s.t)}`, 84, 22, 20, WHITE);
  const tw = 120, dayW = tw * (DAY - NIGHT) / DAY, at = tw * (s.t % DAY) / DAY;
  rr(16, 44, dayW, 10, 4, '#ffd166'); rr(16 + dayW, 44, tw - dayW, 10, 4, '#3a4a8a');
  g.fillStyle = WHITE; circle(16 + at, 49, 6); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
  text(night ? `${left} to dawn` : `${left} to dusk`, 76, 74, 16, '#c9d6ea', false);
  flame(172, 50, 34, 13); text(s.fire, 172, 40, 13, INK);
  g.fillStyle = '#ffd166'; for (let i = 0; i < Math.min(20, s.fire); i++) { const [ex, ey] = dotPos(i, 210, 18, 7); circle(ex, ey, 2.6); }
  text('bag', 262, 30, 16, '#c9d6ea', false);
  for (let i = 0; i < bagSize(s); i++) {
    const bx = 290 + i * 54, o = s.bag[i];
    g.strokeStyle = '#c9d6ea'; g.lineWidth = 2; g.strokeRect(bx, 8, 50, 50);
    if (o) { g.save(); g.translate(bx - 0.6, 7.4); g.scale(0.8, 0.8); if (o.kind === 'op') opBlock(0, 0, o.op, 1); else if (!o.shape) piece(0, 0, o); else text(label(o.value), CELL / 2, CELL / 2, 20, WHITE); g.restore(); }
  }
  if (bump?.reason === 'bag-full' && !reduced && age(bump) < 400) { g.strokeStyle = '#ffd166'; g.lineWidth = 3; g.strokeRect(288, 6, bagSize(s) * 54, 54); } // the full bag flashes once
  const lines = msg && now - msgT < 3000 + msg.length * 60 ? wrap(msg, cv.width - 320 - bagSize(s) * 54) : []; // long enough to read aloud
  const mx = (300 + bagSize(s) * 54 + cv.width) / 2; // the message fills what the bag leaves
  lines.length = Math.min(lines.length, 4);
  lines.forEach((l, i) => text(l, mx, 40 - (lines.length - 1) * 9.5 + i * 19, 17, WHITE, false));
  text(`${s.cast.map(id => (id === s.mover ? `▶ ${who(id)}` : who(id))).join('   ')}   (Tab swaps · C at camp picks)`, mx, 90, 15, '#c9d6ea', false);
  requestAnimationFrame(draw);
}

const KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', ' ': 'grab', e: 'grab' };
addEventListener('keydown', e => {
  if (e.repeat) return;
  if (KEYS[e.key]) { act(KEYS[e.key]); e.preventDefault(); }
  else if (e.key === 'Tab') { act('swap'); e.preventDefault(); }
  else if (e.key === 'c') pick();
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
// The board fills the window (buttons beside it on wide screens, below on tall ones; index.html's media query).
const fit = () => { const wide = matchMedia('(min-aspect-ratio: 5/4)').matches;
  const k = wide ? Math.min((innerWidth - 190) / cv.width, (innerHeight - 90) / cv.height) : Math.min((innerWidth - 24) / cv.width, (innerHeight - 220) / cv.height);
  cv.style.width = `${cv.width * Math.max(0.4, Math.min(1.6, k))}px`; };
fit(); addEventListener('resize', fit);
for (const c of moves ?? '') act({ u: 'up', d: 'down', l: 'left', r: 'right', g: 'grab' }[c]);
setMute(muted);
requestAnimationFrame(draw);

// ---- World doors (style guide: docs/characters.md Art cue). Drawing only; who may enter comes from core/progress.js. ----
const STYLE = { camp: ['#b5835a', '#7a4f2e'], alexandria: [INK, '#e08a4f'], croton: ['#f3ead2', '#c9b68a'], ujjain: ['#00798c', '#f2c14e'], elea: ['#cfc6dd', '#6a4c93'] };
function siteDoor(X, Y, id, open, done, now) {
  const w = world(id), cx = X + CELL / 2, [face, trim] = STYLE[id] ?? ['#8d8f9c', '#5b5e6b'], line = (lw, col) => { g.lineWidth = lw; g.strokeStyle = col; g.stroke(); };
  const arch = (x, y, ww, hh) => { g.beginPath(); g.moveTo(x, y + hh); g.lineTo(x, y + ww / 2); g.arc(x + ww / 2, y + ww / 2, ww / 2, Math.PI, 0); g.lineTo(x + ww, y + hh); g.closePath(); };
  g.save(); if (!open && !done) g.globalAlpha = 0.75;
  if (id === 'camp') { // a cave mouth in ochre rock, a hand stencil beside it
    g.fillStyle = face; g.beginPath(); g.ellipse(cx, Y + 40, 29, 26, 0, Math.PI, 0); g.lineTo(cx + 29, Y + 62); g.lineTo(cx - 29, Y + 62); g.fill(); line(2.5, INK);
    g.fillStyle = '#9c2f1f'; circle(X + 11, Y + 36, 3.5); for (const a of [-1, -0.4, 0.2, 0.8]) { g.beginPath(); g.moveTo(X + 11, Y + 34); g.lineTo(X + 11 + Math.sin(a) * 7, Y + 34 - Math.cos(a) * 7); line(2, '#9c2f1f'); }
  } else if (id === 'alexandria') { // red-figure pottery: black ground, clay outlines, a meander band
    rr(X + 4, Y + 6, CELL - 8, CELL - 6, 6, face); arch(X + 12, Y + 18, CELL - 24, 42); line(3, trim);
    g.beginPath(); for (let i = X + 7; i < X + CELL - 10; i += 7) { g.moveTo(i, Y + 14); g.lineTo(i, Y + 9); g.lineTo(i + 5, Y + 9); g.lineTo(i + 5, Y + 12); g.lineTo(i + 2.5, Y + 12); } line(1.5, trim);
  } else if (id === 'croton') { // a temple front: pediment over two columns
    g.fillStyle = face; g.beginPath(); g.moveTo(X + 3, Y + 18); g.lineTo(cx, Y + 3); g.lineTo(X + CELL - 3, Y + 18); g.closePath(); g.fill(); line(2, INK);
    for (const c of [X + 6, X + CELL - 16]) { rr(c, Y + 20, 10, 42, 2, face); g.beginPath(); g.rect(c, Y + 20, 10, 42); line(1.5, INK); for (const d of [3, 7]) { g.beginPath(); g.moveTo(c + d, Y + 23); g.lineTo(c + d, Y + 59); line(1, trim); } }
  } else if (id === 'ujjain') { // a miniature-painting arch: cusped, teal and gold, a jewel at the crown
    rr(X + 5, Y + 4, CELL - 10, CELL - 4, 4, face); g.beginPath(); g.rect(X + 5, Y + 4, CELL - 10, CELL - 4); line(3, trim);
    g.beginPath(); g.moveTo(X + 14, Y + 62); g.lineTo(X + 14, Y + 30); for (let i = 0; i < 3; i++) g.arc(X + 19 + i * 13, Y + 26 - (i === 1) * 4, 6.5, Math.PI, 0); g.lineTo(X + CELL - 14, Y + 62); line(3, trim);
    g.fillStyle = '#e63946'; circle(cx, Y + 11, 3.5);
  } else if (id === 'elea') { // a stoa: a long beam on slim columns
    rr(X + 2, Y + 8, CELL - 4, 9, 2, trim); for (const c of [X + 5, X + 18, X + CELL - 23, X + CELL - 10]) rr(c, Y + 17, 5, 45, 1, face);
  } else { // a pair world: a sealed slab carved with the two heroes it needs
    rr(X + 6, Y + 6, CELL - 12, CELL - 6, 8, face); g.beginPath(); g.moveTo(cx, Y + 8); g.lineTo(cx, Y + 60); line(2, trim);
    const two = w.needs.filter(n => CHARACTERS[n]);
    if (two.length) two.forEach((n, i) => { g.fillStyle = CHARACTERS[n].color; circle(cx + (i ? 12 : -12), Y + 30, 11); sprite(g, cx + (i ? 12 : -12), Y + 30, CELL * 0.75, n, 0, 'right', 0, true); });
    else text('÷0', cx, Y + 30, 16, WHITE);
  }
  if (STYLE[id]) { // the doorway: lit with the hero inside when you may go in
    const dw = id === 'croton' ? 22 : id === 'elea' ? 18 : 24;
    arch(cx - dw / 2, Y + (id === 'croton' ? 26 : 30), dw, id === 'croton' ? 36 : 32); g.fillStyle = open ? '#ffd166' : '#2b2d42'; g.fill();
    if (w.hero) sprite(g, cx, Y + 48, CELL * 0.75, w.hero, 0, 'right', 0, true);
  }
  g.restore();
  if (done) { g.fillStyle = '#06d6a0'; circle(X + CELL - 10, Y + 12, 9); text('✓', X + CELL - 10, Y + 13, 13, INK); }
}

// ---- Lands (style guide: one era look per district). Drawing only: the cells come from core/craft.js DISTRICTS. ----
// Floor tints the district; its ring of walls (the facade on the road side, row 5 or 13) wears the era's wall and props.
const LAND = {};
for (const [id, d] of Object.entries(DISTRICTS)) {
  const ring = id === 'camp' ? 0 : 1; // the camp is the road's west end: no walls of its own
  for (let y = d.y - ring; y < d.y + d.h + ring; y++) for (let x = d.x - ring; x < d.x + d.w + ring; x++) {
    const inside = x >= d.x && x < d.x + d.w && y >= d.y && y < d.y + d.h;
    if (inside || !(`${x},${y}` in LAND)) LAND[`${x},${y}`] = id;
  }
}
const LOOKS = { camp: { floor: '#efdcbf', wall: '#8a5a2b', line: '#d9bf98' }, alexandria: { floor: '#f2cfa8', wall: INK, line: '#e08a4f' },
  croton: { floor: '#f7f2e6', wall: '#d9ccaa', line: '#ddd3bd' }, ujjain: { floor: '#cfe6e2', wall: '#00798c', line: '#f2c14e' },
  elea: { floor: '#e7e0f1', wall: '#6a4c93', line: '#cfc6dd' }, pair: { floor: '#e6e7ec', wall: '#8d8f9c', line: '#c9ccd6' },
  sealed: { floor: '#b9bcc6', wall: '#4a4d58', line: '#9a9dab' } };
const opened = id => canEnter(id, recruits(s.done), s.done) && world(id).levels.length > 0; // by recruits, not the party: C never repaints the land
const landLook = id => (LOOKS[id] ?? (opened(id) ? LOOKS.pair : LOOKS.sealed));
// Decals are flat and faint (never dots or numerals: dots mean quantity). Props sit on every other wall cell.
function decal(id, st, X0, Y0, x, y, wall) {
  const ln = (lw, col) => { g.lineWidth = lw; g.strokeStyle = col; g.stroke(); }, cx = X0 + CELL / 2, cy = Y0 + CELL / 2;
  if (!wall) {
    g.beginPath();
    if (id === 'camp') for (const k of [16, 32, 48]) { g.moveTo(X0, Y0 + k); g.lineTo(X0 + CELL, Y0 + k); } // planks
    else if (id === 'alexandria') { g.moveTo(X0, Y0 + 5); g.lineTo(X0 + CELL, Y0 + 5); g.moveTo(X0, Y0 + CELL - 5); g.lineTo(X0 + CELL, Y0 + CELL - 5); } // fired-clay bands
    else if (id === 'croton') { g.moveTo(X0 + 8, Y0 + 50); g.bezierCurveTo(X0 + 24, Y0 + 30, X0 + 40, Y0 + 44, X0 + 58, Y0 + 14); } // a marble vein
    else if (id === 'ujjain') { g.moveTo(cx, Y0 + 3); g.lineTo(X0 + CELL - 3, cy); g.lineTo(cx, Y0 + CELL - 3); g.lineTo(X0 + 3, cy); g.closePath(); } // a painted lozenge
    else if (id === 'elea') { if ((x + y) % 2) g.rect(X0 + 4, Y0 + 4, CELL - 8, CELL - 8); } // stoa paving
    else { g.moveTo(X0, Y0 + CELL / 2); g.lineTo(X0 + CELL, Y0 + CELL / 2); g.moveTo(cx, Y0); g.lineTo(cx, Y0 + CELL); } // plain flagstones
    return ln(id === 'ujjain' ? 1.5 : 2, st.line);
  }
  if (x % 2) return;
  if (id === 'alexandria') { // a scroll on a red-figure wall
    rr(X0 + 12, Y0 + 22, 40, 20, 4, '#f1e2c2'); g.fillStyle = '#e08a4f'; circle(X0 + 12, cy, 6); circle(X0 + 52, cy, 6);
    g.beginPath(); for (const k of [28, 34]) { g.moveTo(X0 + 20, Y0 + k); g.lineTo(X0 + 44, Y0 + k); } ln(1.5, '#b5835a');
  } else if (id === 'croton') { // a lyre: two horns and its strings (a string halved sings an octave)
    g.beginPath(); g.moveTo(X0 + 20, Y0 + 50); g.quadraticCurveTo(X0 + 10, Y0 + 24, X0 + 20, Y0 + 12); g.moveTo(X0 + 44, Y0 + 50); g.quadraticCurveTo(X0 + 54, Y0 + 24, X0 + 44, Y0 + 12);
    g.moveTo(X0 + 16, Y0 + 20); g.lineTo(X0 + 48, Y0 + 20); g.moveTo(X0 + 18, Y0 + 50); g.lineTo(X0 + 46, Y0 + 50); ln(3, '#8a6a3a');
    g.beginPath(); for (const k of [26, 32, 38]) { g.moveTo(X0 + k, Y0 + 20); g.lineTo(X0 + k, Y0 + 50); } ln(1, '#5b4a2e');
  } else if (id === 'ujjain') { // a gold cusped niche
    g.beginPath(); g.moveTo(X0 + 14, Y0 + 56); g.lineTo(X0 + 14, Y0 + 28); for (let i = 0; i < 3; i++) g.arc(X0 + 19 + i * 13, Y0 + 24 - (i === 1) * 4, 6.5, Math.PI, 0); g.lineTo(X0 + 50, Y0 + 56); ln(3, '#f2c14e');
  } else if (id === 'elea') { // a stoa column
    rr(X0 + 22, Y0 + 8, 20, 6, 2, '#cfc6dd'); rr(X0 + 25, Y0 + 14, 14, 38, 1, '#cfc6dd'); rr(X0 + 20, Y0 + 52, 24, 6, 2, '#cfc6dd');
  } else if (!LOOKS[id] && !opened(id)) { // sealed: a chain across the wall
    g.beginPath(); for (let i = 0; i < 4; i++) g.ellipse(X0 + 10 + i * 15, cy, 8, 5, 0, 0, 7); ln(3, '#9a9dab');
  }
}
// A host: the land's hero standing by its door, or a signpost with the two heroes a pair land needs.
function host(X0, Y0, id, now) {
  const w = world(id), cx = X0 + CELL / 2, cy = Y0 + CELL / 2, st = landLook(id);
  g.fillStyle = st.floor; g.fillRect(X0, Y0, CELL, CELL);
  if (w.hero && id !== 'camp') { g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(cx, cy + 26, 18, 5, 0, 0, 7); g.fill(); return sprite(g, cx, cy, CELL * 0.9, w.hero, reduced ? 0 : now, 'down'); }
  g.fillStyle = C.doorFrame; g.fillRect(cx - 3, cy, 6, 30);
  rr(X0 + 3, Y0 + 6, CELL - 6, 30, 6, C.sign); g.strokeStyle = C.doorFrame; g.lineWidth = 2; g.stroke();
  const two = id === 'camp' ? ['tally'] : w.needs.filter(n => CHARACTERS[n]); // camp: a signpost with Tally's sign and a flame, so it is never mistaken for you
  if (id === 'camp') flame(cx + 14, Y0 + 32, 22, 8);
  if (two.length) two.forEach((n, i) => { const hx = cx + (i ? 14 : -14); g.fillStyle = CHARACTERS[n].color; circle(hx, Y0 + 21, 11); sprite(g, hx, Y0 + 21, CELL * 0.6, n, 0, 'right', 0, true); });
  else text('÷0', cx, Y0 + 21, 15, INK);
}
function wrap(m, width) { // the message's own line breaks, then word-wrap to the HUD's width
  g.font = `17px ${FONT}`;
  return m.split('\n').flatMap(par => par.split(' ').reduce((ls, wd) => {
    const t = ls.length ? `${ls[ls.length - 1]} ${wd}` : wd;
    if (ls.length && g.measureText(t).width <= width) ls[ls.length - 1] = t; else ls.push(wd);
    return ls;
  }, []));
}
