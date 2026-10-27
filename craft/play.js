// Craft prototype view + input (?craft). Crude on purpose: Arto polishes later.
// Never does math: every value, height and warmth comes from core/craft.js state and events.
import { cv, g, CELL, INK, WHITE, C, rr, circle, text, dotPos, equation, reduced, TS, FONT, ART, TITLE } from '../render/look.js';
import { piece, opBlock, label } from '../render/draw.js';
import { sprite } from '../render/cast.js';
import { getDone } from '../render/state.js';
import { CHARACTERS } from '../levels/characters.js';
import { recruits, parties, canEnter, world, missing } from '../core/progress.js';
import { ghostCells, wantWhole } from '../render/fx.js';
import { tone, pitch, boing, muted, setMute, muteBtn } from '../render/audio.js';
import { isNat, parts } from '../core/value.js';
import { newCraft, step, heightAt, bagSize, isNight, choose, atSite, DISTRICTS, NUDGERS } from '../core/craft.js';

const PAD = 40, HUD = 100; // margins for the axes and the HUD
// View in cells: wide screens see 19×11 of the land, tall ones (phones) 13×15; a lands map in the corner shows the rest.
let VW, VH;
const size = () => { [VW, VH] = matchMedia('(min-aspect-ratio: 5/4)').matches ? [19, 11] : [13, 15]; cv.width = VW * CELL + PAD; cv.height = VH * CELL + PAD + HUD; };
size();
// Back from a world (?craft&from=id): the Craft you left (saved on the way in, if storage allows), standing at its door.
const from = new URLSearchParams(location.search).get('from'), moves = new URLSearchParams(location.search).get('moves'), done = getDone(); // read before the URL is replaced
let saved = null;
if (from && world(from)) try { saved = JSON.parse(localStorage.getItem('mathblox.craft')); } catch { /* no storage: a fresh Craft */ }
if (saved?.layout !== newCraft().layout) saved = null; // a save from an older map
let s = from && world(from) ? atSite({ ...(saved ?? newCraft(done)), done }, from) : newCraft(done), history = [], msg = '', msgT = 0;
const HUB = 'Sumhenge'; // the hub's name, here only
document.getElementById('name').textContent = `${TITLE}: ${HUB}`;
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
say(hero && hero !== 'tally' && done.includes(from) ? `${who(hero)} joins you! Press C at camp to pick who comes along.` : 'Push blocks together to do math. A shy ? wants a number. Space picks up / puts down.');

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
    if (e.type === 'nudge') { tone(85, 0.09, 'square', -40); tone(170, 0.05, 'triangle', 0, 0.02); } // a piston's thunk
    if (['feed', 'hop', 'tame', 'nudge'].includes(e.type)) fxs.push({ ...e, t0: performance.now() }); if (fxs.length > 8) fxs.shift();
    if (e.type === 'push') tone(110, 0.06, 'sine');
    if (e.type === 'merge' || e.type === 'carve' || e.type === 'multiply' || e.type === 'share') tone(pitch(isNat(e.value) ? e.value : 0), 0.18, 'triangle');
    if (e.type === 'feed') { for (let i = 0; i < e.value; i++) tone(pitch(i * 2), 0.05, 'sawtooth', -40, i * 0.03); say(`The fire eats ${e.value}. Warmth ${e.heat}!`); }
    if (e.type === 'land') { tone(pitch(Math.max(0, 6 + (isNat(e.height) ? e.height : -3))), 0.2, 'sine'); say(isNat(e.height) ? (e.height ? `Too much! A ${e.height} is left over as a hill.` : 'Flat ground! You can cross.') : `Still a pit: ${String(e.height).replace('-', '−')}.`); }
    if (e.type === 'mimic') say(`A shy "?" peeks out past the river. It wears ${e.value}.`);
    if (e.type === 'tame') { [0, 4, 7].forEach((n, i) => tone(pitch(n + 12), 0.15, 'triangle', 0, i * 0.1)); say('Tamed! It follows you and carries for you.'); }
    if (e.type === 'hop') { tone(500, 0.15, 'sine', 300); say(`Not ${e.value}... it hops away.`); }
    if (e.type === 'pick') tone(pitch(8), 0.08, 'sine', 100);
    if (e.type === 'place') tone(pitch(4), 0.08, 'sine', -100);
    if (e.type === 'dusk') say('Night falls. The stars come out.');
    if (e.type === 'dawn') say(e.ids.length ? 'Morning! Rocks grew back.' : 'Morning!');
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
  const W = s.tiles[0].length, cam = Math.max(0, Math.min(W - VW, s.player.x - (VW >> 1))), camY = Math.max(-2, Math.min(s.tiles.length - VH, s.player.y - (VH >> 1)));
  const X = x => PAD + (x - cam) * CELL, Y = y => HUD + (y - camY) * CELL;
  const wob = (x, y) => { // the bumped piece shakes (a rubbery no, never a buzzer)
    if (!bump || reduced || age(bump) > 400 || !bump.wob || bump.wob.x !== x || bump.wob.y !== y) return 0;
    return Math.sin(age(bump) / 25) * 5 * (1 - age(bump) / 400);
  };
  g.fillStyle = '#2b2d42'; g.fillRect(0, 0, cv.width, cv.height);
  const live = reduced ? 0 : now, pits = []; // every ambient motion runs on this clock: frozen in reduced motion
  if (camY < 0) sky(X, Y, cam, live);
  for (let y = Math.max(0, camY); y < camY + VH; y++) for (let x = cam; x < cam + VW; x++) {
    const t = s.tiles[y][x], h = heightAt(s, x, y);
    const id = LAND[`${x},${y}`], st = id && landLook(id), wall = t === '#' && !h;
    const fl = st?.floor ?? C.floor, wl = st?.wall ?? C.wall;
    if (wall && ART === 'a') { g.fillStyle = fl; g.fillRect(X(x), Y(y), CELL, CELL); rr(X(x) + 2, Y(y) + 2, CELL - 4, CELL - 4, 12, wl); } // walls as rounded icon tiles
    else { g.fillStyle = wall ? wl : fl; g.fillRect(X(x), Y(y), CELL, CELL); }
    if (ART === 'b') { g.fillStyle = hash(x, y) % 2 ? 'rgba(255,250,235,.10)' : 'rgba(90,60,30,.06)'; g.fillRect(X(x), Y(y), CELL, CELL); } // gouache patchiness
    if (h) { if (ART === 'c') pits.push(() => pit(X(x), Y(y), h)); else pit(X(x), Y(y), h); } else if (st) decal(id, st, X(x), Y(y), x, y, wall);
    else if (t === '.' && hash(x, y) % 5 === 0) grass(X(x), Y(y), x, live);
    g.strokeStyle = C.grid; g.lineWidth = 1; g.strokeRect(X(x) + 0.5, Y(y) + 0.5, CELL, CELL);
  }
  if (ART === 'c') { pixelate(4); pits.forEach(f => f()); } // chunky terrain; pits (their depth numerals) and pieces stay sharp to read
  landmarks(X, Y, cam, live); henge(X, Y, cam);
  const shove = fxs.find(f => f.type === 'nudge' && age(f) < T(260));
  for (const [x, y] of NUDGERS) if (x >= cam && x < cam + VW && y >= camY && y < camY + VH) piston(X(x), Y(y), shove?.at.x === x && shove?.at.y === y ? shove : null);
  ambient(X, Y, cam, camY, live);
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
    const ox = X(o.x) + wob(o.x, o.y), oy = Y(o.y) + Math.sin(live / 700 + o.id * 1.7) * 1.5; // a slow breath, never off its cell
    if (o.kind === 'op') opBlock(ox, oy, o.op, 1);
    else { if (o.land) { g.beginPath(); g.ellipse(ox + CELL / 2, oy + CELL + 4, CELL / 2 + 9, CELL * 0.7, 0, Math.PI, 0); g.closePath(); g.fillStyle = '#c9a36b'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#3b2a1a'; g.stroke(); g.strokeStyle = '#7fbf4d'; g.beginPath(); g.ellipse(ox + CELL / 2, oy + CELL + 4, CELL / 2 + 6, CELL * 0.7 - 3, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); } // only land (an overfill hill) stands on a mound; a carried + block does not
      flatShadow(() => piece(ox, oy, o)); }
  }
  smoke(fx, fy, live);
  // Site doors, each in its world's art: lit doorway with the hero inside if you may enter, dark if not, a check once done.
  for (const [k, id] of Object.entries(s.sites)) {
    const [x, y] = k.split(',').map(Number); if (x < cam || x >= cam + VW) continue;
    siteDoor(X(x), Y(y), id, canEnter(id, s.cast, s.done) && world(id).levels.length, s.done.includes(id), now);
  }
  for (const [k, id] of Object.entries(s.hosts ?? {})) { // each land's host: its hero, or a signpost for a pair land
    const [x, y] = k.split(',').map(Number); if (x < cam || x >= cam + VW) continue;
    host(X(x), Y(y), id, live, Math.abs(x - s.player.x) + Math.abs(y - s.player.y) <= 3 ? (x > s.player.x ? 'left' : x < s.player.x ? 'right' : y > s.player.y ? 'up' : 'down') : 'down');
  }
  // Player: the hero you are now, facing the way you face (what Space picks up).
  const sl = shove && !reduced ? 1 - Math.min(1, age(shove) / T(160)) : 0; // shoved: you slide off the piston onto your cell
  const px = X(s.player.x) + CELL / 2 + (shove ? (shove.at.x - shove.to.x) * CELL * sl : 0), py = Y(s.player.y) + CELL / 2 + (shove ? (shove.at.y - shove.to.y) * CELL * sl : 0);
  flatShadow(() => sprite(g, px, py, CELL * 0.95, s.mover, live, s.facing, 0, false, blinking(live, 0)));
  if (ART === 'b') paper();
  // Light: night is a deep blue shade with a clear circle as wide as the fire's warmth (only a look: the road is free to walk).
  const night = isNight(s.t);
  if (night) {
    const grad = g.createRadialGradient(fx, fy, 20, fx, fy, 60 + s.fire * 18);
    grad.addColorStop(0, 'rgba(10,14,40,0)'); grad.addColorStop(1, 'rgba(10,14,40,.62)');
    g.fillStyle = grad; g.fillRect(PAD, HUD, VW * CELL, VH * CELL);
  }
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
  for (let y = Math.max(0, camY); y < camY + VH; y++) text(s.camp.y - y, PAD / 2, Y(y) + CELL / 2, 17, C.axis, y === s.camp.y);
  lands(cam, camY, now);
  // HUD: sun or moon and a day track (amber day, blue night, a dot for now), warmth as a flame with one ember per unit, the bag.
  g.fillStyle = '#2b2d42'; g.fillRect(0, 0, cv.width, HUD);
  sun(40, 34, night); // the Road is free to walk: no day counter, no warmth meter (the fire on the map is a toy)
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
const fit = () => { size(); const wide = matchMedia('(min-aspect-ratio: 5/4)').matches;
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
function host(X0, Y0, id, now, look = 'down') {
  const w = world(id), cx = X0 + CELL / 2, cy = Y0 + CELL / 2, st = landLook(id);
  g.fillStyle = st.floor; g.fillRect(X0, Y0, CELL, CELL);
  if (w.hero && id !== 'camp') { g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(cx, cy + 26, 18, 5, 0, 0, 7); g.fill(); return flatShadow(() => sprite(g, cx, cy, CELL * 0.9, w.hero, now, look, 0, false, blinking(now, cx))); } // looks your way when you come near
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

// ---- Alive: ambient motion that never blocks play (all of it reads `live`, which reduced motion freezes at 0). ----
const hash = (x, y) => (((x * 73856093) ^ (y * 19349663)) >>> 0) % 997;
const blinking = (t, seed) => t > 0 && (t + seed * 37) % 3700 < 140;
function grass(X0, Y0, x, t) { // a tuft that sways (strokes, never dots: dots mean quantity)
  const sw = Math.sin(t / 900 + x) * 3; g.beginPath();
  for (const [dx, h] of [[-5, 12], [0, 16], [5, 11]]) { g.moveTo(X0 + 40 + dx, Y0 + 54); g.quadraticCurveTo(X0 + 40 + dx, Y0 + 54 - h / 2, X0 + 40 + dx * 1.6 + sw, Y0 + 54 - h); }
  g.lineWidth = 2; g.strokeStyle = ART === 'b' ? '#8aa86a' : '#9cc78a'; g.stroke();
}
function smoke(fx, fy, t) { // three puffs drift up from the fire
  if (!t) return;
  for (let i = 0; i < 3; i++) { const q = ((t / 2400) + i / 3) % 1; g.fillStyle = `rgba(150,150,160,${0.28 * (1 - q)})`; circle(fx + Math.sin(q * 6 + i) * 8, fy - 30 - q * 70, 6 + q * 10); }
}
function ambient(X, Y, cam, camY, t) { // pennants over each gate, cloud shadows and butterflies by day
  for (const [id, d] of Object.entries(DISTRICTS)) if (d.gate) { const [gx, gy] = d.gate, px0 = X(gx + 1) + 8, py0 = Y(gy) + 6;
    if (gx + 1 < cam || gx + 1 >= cam + VW || gy < camY || gy >= camY + VH) continue;
    g.fillStyle = INK; g.fillRect(px0 - 2, py0, 3, 40); const sw = Math.sin(t / 500 + gx) * 5;
    g.fillStyle = id === 'alexandria' ? '#e08a4f' : landLook(id).wall; g.beginPath(); g.moveTo(px0, py0); g.quadraticCurveTo(px0 + 14, py0 + 4 + sw / 2, px0 + 26, py0 + 8 + sw); g.lineTo(px0, py0 + 16); g.fill(); }
  if (isNight(s.t)) return;
  for (let i = 0; i < 4; i++) { const wx = (t / 120 + i * 790) % (s.tiles[0].length * CELL), wy = (2 + i * 4.5) * CELL; // cloud shadows drift east over the map
    g.fillStyle = 'rgba(20,30,60,.045)'; g.beginPath(); g.ellipse(X(0) + wx, Y(0) + wy, 170, 70, 0, 0, 7); g.fill(); }
  for (const [id, d] of Object.entries(DISTRICTS)) { if (d.x + d.w < cam || d.x > cam + VW) continue;
    const k = hash(d.x, d.y), bx = X(d.x + d.w / 2) + Math.sin(t / 1900 + k) * d.w * 22, by = Y(d.y + d.h / 2) + Math.cos(t / 1300 + k) * d.h * 12, f = Math.abs(Math.sin(t / 90 + k));
    g.fillStyle = ['#ef476f', '#ffd166', '#8e7dff', '#06d6a0'][k % 4]; g.strokeStyle = INK; g.lineWidth = 1;
    for (const sgn of [-1, 1]) { g.beginPath(); g.ellipse(bx + sgn * 8 * f, by, 8 * f + 1.5, 10, 0, 0, 7); g.fill(); g.stroke(); } }
}
// The lands map: the whole Road at 5px a cell, every district in its own colours, its door a dot, you blinking, the view framed.
// It moves to the top corner when you walk under it.
function lands(cam, camY, t) {
  const k = 6, mw = s.tiles[0].length * k, mh = s.tiles.length * k, low = s.player.x - cam >= VW - 6 && s.player.y - camY >= VH - 3;
  const x0 = PAD + VW * CELL - mw - 8, y0 = low ? HUD + 8 : HUD + VH * CELL - mh - 8;
  g.globalAlpha = 0.92; rr(x0 - 5, y0 - 5, mw + 10, mh + 10, 8, INK);
  s.tiles.forEach((row, y) => [...row].forEach((c, x) => { if (c === '#' && !heightAt(s, x, y)) return; const id = LAND[`${x},${y}`];
    g.fillStyle = heightAt(s, x, y) ? '#4f9be8' : id ? landLook(id).floor : '#cfc4ae'; g.fillRect(x0 + x * k, y0 + y * k, k, k); }));
  g.globalAlpha = 1;
  g.fillStyle = '#9aa0a6'; for (const [x, y] of STONES) g.fillRect(x0 + x * k + 1, y0 + y * k, k - 2, k); // Sumhenge
  for (const [id, d] of Object.entries(DISTRICTS)) { g.fillStyle = landLook(id).wall; circle(x0 + (d.door[0] + 0.5) * k, y0 + (d.door[1] + 0.5) * k, 4.5); g.strokeStyle = WHITE; g.lineWidth = 1.5; g.stroke(); }
  g.strokeStyle = WHITE; g.lineWidth = 1.5; g.strokeRect(x0 + cam * k, y0 + camY * k, VW * k, VH * k);
  if (reduced || t % 800 < 560) { g.fillStyle = C.player; circle(x0 + (s.player.x + 0.5) * k, y0 + (s.player.y + 0.5) * k, 6); g.strokeStyle = WHITE; g.stroke(); }
}
// Sky above the map (the camera rises 2 rows when you're up top): far hills on the horizon, drifting clouds.
function sky(X, Y, cam, t) {
  const night = isNight(s.t), top = Y(-2), bot = Y(0), grad = g.createLinearGradient(0, top, 0, bot);
  grad.addColorStop(0, night ? '#1b2250' : '#8ecae6'); grad.addColorStop(1, night ? '#3a4a8a' : '#d8eef5');
  g.fillStyle = grad; g.fillRect(PAD, top, VW * CELL, bot - top);
  for (let i = 0; i < 3; i++) { g.fillStyle = night ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.85)';
    const cx = PAD + (((i * 470 + t / 60 - cam * CELL * 0.3) % (VW * CELL + 200)) + VW * CELL + 200) % (VW * CELL + 200) - 100, cy = top + 30 + i * 22;
    circle(cx, cy, 18); circle(cx + 20, cy - 6, 22); circle(cx + 42, cy, 16); }
  g.fillStyle = night ? '#2b3a5a' : '#a9c98d'; g.beginPath(); g.moveTo(PAD, bot); // far hills, slower than the land (parallax)
  for (let x = 0; x <= VW * CELL; x += 16) g.lineTo(PAD + x, bot - 18 - 14 * Math.sin((x + cam * CELL * 0.5) / 90) - 8 * Math.sin((x + cam * CELL * 0.5) / 37));
  g.lineTo(PAD + VW * CELL, bot); g.fill();
}
// One tall era landmark per district, at the end away from its gate, drawn under every piece, door and host.
// Top districts' landmarks stand at the front and rise to the sky; bottom ones stand at the back and peek over the wall onto the road.
function landmarks(X, Y, cam, t) {
  const u = CELL, line = (w = 3) => { g.lineWidth = w; g.strokeStyle = INK; g.stroke(); }, box = (x, y, w, h, c) => { g.beginPath(); g.rect(x, y, w, h); g.fillStyle = c; g.fill(); line(); };
  const tri = (pts, c) => { g.beginPath(); pts.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.fillStyle = c; g.fill(); line(); };
  for (const [id, d] of Object.entries(DISTRICTS)) {
    if (id === 'camp' || d.x + d.w < cam - 1 || d.x > cam + VW + 1) continue;
    const gx = d.gate[0], far = gx - d.x > d.x + d.w - 1 - gx ? d.x + 0.9 : d.x + d.w - 0.9, top = d.y < 6;
    const cx = X(far), by = top ? Y(d.y + d.h) - 6 : Y(d.y + d.h + 1) - 10, h = top ? 4.6 * u : 5.6 * u, sealed = !opened(id);
    g.save(); if (sealed) g.globalAlpha = 0.75;
    ({
      alexandria() { // the Pharos: three tiers and a fire on top
        box(cx - 0.7 * u, by - 0.45 * h, 1.4 * u, 0.45 * h, '#f2e3c6'); box(cx - 0.5 * u, by - 0.75 * h, u, 0.3 * h, '#e8d3a8'); box(cx - 0.3 * u, by - 0.9 * h, 0.6 * u, 0.15 * h, '#e08a4f');
        for (let i = 1; i < 4; i++) box(cx - 0.12 * u, by - i * 0.13 * h, 0.24 * u, 0.07 * h, '#3b2a1a'); flame(cx, by - 0.9 * h, 0.12 * h * (1 + 0.1 * Math.sin(t / 120)), 14); },
      croton() { // a temple on its hill
        tri([[cx - 1.1 * u, by], [cx - 0.4 * u, by - 0.5 * h], [cx + 0.4 * u, by - 0.5 * h], [cx + 1.1 * u, by]], '#9bb07a');
        box(cx - 0.75 * u, by - 0.56 * h, 1.5 * u, 0.06 * h, '#f7f2e6');
        for (let i = 0; i < 4; i++) box(cx - 0.62 * u + i * 0.38 * u, by - 0.86 * h, 0.16 * u, 0.3 * h, '#f7f2e6');
        tri([[cx - 0.8 * u, by - 0.86 * h], [cx, by - h], [cx + 0.8 * u, by - 0.86 * h]], '#d9ccaa'); },
      ujjain() { // the Samrat Yantra: a giant stair-sundial, a small dome
        tri([[cx - 0.8 * u, by], [cx + 0.5 * u, by - h], [cx + 0.5 * u, by]], '#e6a15a');
        for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(cx - 0.8 * u + i * 1.3 * u / 8, by - i * h / 8); g.lineTo(cx + 0.5 * u, by - i * h / 8); line(1.5); }
        box(cx + 0.5 * u, by - 0.3 * h, 0.5 * u, 0.3 * h, '#00798c'); g.beginPath(); g.arc(cx + 0.75 * u, by - 0.3 * h, 0.25 * u, Math.PI, 0); g.fillStyle = '#f2c14e'; g.fill(); line(); },
      elea() { // stoa columns under one long beam
        for (let i = 0; i < 3; i++) box(cx - 0.75 * u + i * 0.6 * u, by - 0.9 * h, 0.3 * u, 0.9 * h, '#e7e0f1');
        box(cx - 0.95 * u, by - h, 1.9 * u, 0.1 * h, '#6a4c93'); },
      distrib() { // a market pole with bunting and a striped awning
        box(cx - 0.08 * u, by - h, 0.16 * u, h, '#8a5a2b'); box(cx - 0.8 * u, by - 0.3 * h, 1.6 * u, 0.3 * h, '#f4efe4');
        for (let i = 0; i < 4; i++) tri([[cx - 0.9 * u + i * 0.45 * u, by - 0.36 * h], [cx - 0.45 * u + i * 0.45 * u, by - 0.36 * h], [cx - 0.675 * u + i * 0.45 * u, by - 0.28 * h]], i % 2 ? '#ef476f' : '#ffd166');
        tri([[cx + 0.08 * u, by - h], [cx + 0.7 * u, by - 0.93 * h], [cx + 0.08 * u, by - 0.86 * h]], '#06d6a0'); },
      under() { // a mine headframe: an A-frame and a wheel
        tri([[cx - 0.8 * u, by], [cx, by - 0.9 * h], [cx + 0.8 * u, by]], 'rgba(0,0,0,0)'); g.beginPath(); g.arc(cx, by - 0.9 * h, 0.35 * u, 0, 7); g.fillStyle = '#c9ccd6'; g.fill(); line();
        g.save(); g.translate(cx, by - 0.9 * h); g.rotate(t / 900); for (let i = 0; i < 3; i++) { g.rotate(Math.PI / 3); g.beginPath(); g.moveTo(-0.35 * u, 0); g.lineTo(0.35 * u, 0); line(2); } g.restore(); },
      series() { // a stair that climbs out of sight
        g.beginPath(); g.moveTo(cx - u, by); for (let i = 0; i < 9; i++) { g.lineTo(cx - u + i * 0.22 * u, by - (i + 1) * h / 9); g.lineTo(cx - u + (i + 1) * 0.22 * u, by - (i + 1) * h / 9); }
        g.lineTo(cx - u + 9 * 0.22 * u, by); g.closePath(); g.fillStyle = '#cfc6dd'; g.fill(); line(); },
      vectors() { // the observatory: a dome on a tower, its telescope pointing out
        box(cx - 0.45 * u, by - 0.7 * h, 0.9 * u, 0.7 * h, '#e6e7ec'); g.beginPath(); g.arc(cx, by - 0.7 * h, 0.55 * u, Math.PI, 0); g.fillStyle = '#4f9be8'; g.fill(); line();
        g.save(); g.translate(cx, by - 0.78 * h); g.rotate(-0.6); box(0, -0.08 * u, 0.9 * u, 0.16 * u, INK); g.restore(); },
      rotation() { // a windmill whose sails turn
        tri([[cx - 0.5 * u, by], [cx - 0.25 * u, by - 0.75 * h], [cx + 0.25 * u, by - 0.75 * h], [cx + 0.5 * u, by]], '#e7a6dc');
        g.save(); g.translate(cx, by - 0.75 * h); g.rotate(t / 1500); for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); box(0.08 * u, -0.1 * u, 0.85 * u, 0.2 * u, '#f4efe4'); } g.restore(); },
      motion() { // a tall pole with a chequered flag
        box(cx - 0.06 * u, by - h, 0.12 * u, h, '#3a3f4b'); const fw = 0.8 * u, fh = 0.5 * u, wave = Math.sin(t / 300) * 4;
        for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? INK : WHITE; g.fillRect(cx + 0.06 * u + i * fw / 4, by - h + j * fh / 2 + wave * (i / 4), fw / 4, fh / 2); } },
      dungeon() { // the Storm Keep: a dark tower under its own cloud
        box(cx - 0.6 * u, by - 0.75 * h, 1.2 * u, 0.75 * h, '#4a4d58');
        for (let i = 0; i < 3; i++) box(cx - 0.6 * u + i * 0.45 * u, by - 0.82 * h, 0.3 * u, 0.07 * h, '#4a4d58');
        box(cx - 0.15 * u, by - 0.5 * h, 0.3 * u, 0.12 * h, '#ffd166');
        g.fillStyle = '#5b6475'; circle(cx - 0.4 * u, by - 0.93 * h, 0.3 * u); circle(cx + 0.1 * u, by - h, 0.38 * u); circle(cx + 0.55 * u, by - 0.93 * h, 0.28 * u);
        if (!reduced && t % 2600 < 160) { g.beginPath(); g.moveTo(cx, by - 0.9 * h); g.lineTo(cx - 0.15 * u, by - 0.84 * h); g.lineTo(cx + 0.05 * u, by - 0.84 * h); g.lineTo(cx - 0.1 * u, by - 0.76 * h); g.lineWidth = 3; g.strokeStyle = '#ffd166'; g.stroke(); } },
    })[id]?.();
    g.restore();
  }
}
// Sumhenge: standing stones ring the fire at the origin, a horseshoe open to the road (like Stonehenge's opens to the
// sunrise), with lintels across four pairs. Scenery only: every stone stands on a cell that is already solid (border
// walls, the camp's two rocks), never on a door, host or walkable cell. Each stone carries tally marks counting 1-5 round the ring.
const STONES = (() => { const t = newCraft([]), k = [];
  const want = [...[0, 1, 4, 5, 6, 7, 8, 9].map(x => [x, 5]), ...[7, 9, 11].map(y => [0, y]), ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map(x => [x, 13]), [6, 8], [7, 10]];
  for (const [x, y] of want) if (t.tiles[y]?.[x] === '#' && !heightAt(t, x, y) && !t.sites[`${x},${y}`] && !t.hosts?.[`${x},${y}`]) k.push([x, y]);
  return k; })();
const LINTELS = [[4, 5], [7, 5], [3, 13], [6, 13]]; // the left stone of each trilithon
function henge(X, Y, cam) {
  if (cam > 11) return;
  const fx = X(s.camp.x) + CELL / 2, fy = Y(s.camp.y) + CELL / 2; // the henge bank: a flat ring on the ground, never a wall
  g.setLineDash([10, 8]); g.lineWidth = 4; g.strokeStyle = 'rgba(122,92,67,.35)'; g.beginPath(); g.ellipse(fx, fy, CELL * 3.6, CELL * 3.2, 0, 0, 7); g.stroke(); g.setLineDash([]);
  const has = new Set(STONES.map(String)), w = CELL * 0.62, h = CELL * 1.2;
  STONES.forEach(([x, y], i) => {
    const cx = X(x) + CELL / 2, by = Y(y) + CELL - 4, lx = cx - w / 2, ty = by - h;
    g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(cx + 4, by, w * 0.6, 6, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(lx, by); g.lineTo(lx + 2, ty + 8); g.quadraticCurveTo(cx, ty - 4, lx + w - 2, ty + 8); g.lineTo(lx + w, by); g.closePath();
    g.fillStyle = '#a7adb4'; g.fill(); g.fillStyle = '#868c94'; g.fillRect(lx + w * 0.68, ty + 8, w * 0.32 - 1, h - 8); // the shaded side
    g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke();
    g.strokeStyle = 'rgba(29,31,46,.55)'; g.lineWidth = 2; g.beginPath(); const n = i % 5 + 1; // tally marks: four strokes, the fifth across
    for (let j = 0; j < Math.min(4, n); j++) { g.moveTo(lx + 7 + j * 5, ty + 22); g.lineTo(lx + 7 + j * 5, ty + 38); }
    if (n === 5) { g.moveTo(lx + 4, ty + 34); g.lineTo(lx + 26, ty + 26); } g.stroke();
  });
  for (const [x, y] of LINTELS) if (has.has(`${x},${y}`) && has.has(`${x + 1},${y}`)) {
    const lx = X(x) + CELL / 2 - w / 2 - 4, ty = Y(y) + CELL - 4 - h - 8;
    g.beginPath(); g.roundRect(lx, ty, CELL + w + 8, 16, 4); g.fillStyle = '#9aa0a6'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke();
  }
}
function flatShadow(f) { // style a: a hard flat drop shadow under things that stand up
  if (ART !== 'a') return f();
  g.save(); g.shadowColor = 'rgba(29,31,46,.28)'; g.shadowOffsetX = 4; g.shadowOffsetY = 5; f(); g.restore();
}
let buf;
function pixelate(n) { // style c: the board drawn small, then blown up with no smoothing
  const w = VW * CELL, h = VH * CELL; buf ??= document.createElement('canvas'); buf.width = w / n; buf.height = h / n;
  const b = buf.getContext('2d'); b.imageSmoothingEnabled = true; b.drawImage(cv, PAD, HUD, w, h, 0, 0, w / n, h / n);
  g.save(); g.imageSmoothingEnabled = false; g.drawImage(buf, 0, 0, w / n, h / n, PAD, HUD, w, h); g.restore();
}
let grain;
function paper() { // style b: warm the whole board, lay a paper grain over it, soften the edges
  const w = VW * CELL, h = VH * CELL;
  if (!grain) { grain = document.createElement('canvas'); grain.width = grain.height = 128; const c = grain.getContext('2d');
    for (let i = 0; i < 2600; i++) { const v = hash(i, i * 7) / 997; c.fillStyle = `rgba(${v > 0.5 ? '255,250,235' : '80,55,30'},${0.10 + v * 0.08})`; c.fillRect(hash(i, 3) % 128, hash(5, i) % 128, 1 + (i % 3 === 0), 1); } }
  buf ??= document.createElement('canvas'); buf.width = w; buf.height = h; const b = buf.getContext('2d');
  b.filter = 'sepia(.25) saturate(.88)'; b.drawImage(cv, PAD, HUD, w, h, 0, 0, w, h); g.drawImage(buf, PAD, HUD);
  g.save(); g.fillStyle = g.createPattern(grain, 'repeat'); g.fillRect(PAD, HUD, w, h);
  const v = g.createRadialGradient(PAD + w / 2, HUD + h / 2, h * 0.45, PAD + w / 2, HUD + h / 2, w * 0.62); v.addColorStop(0, 'rgba(80,50,20,0)'); v.addColorStop(1, 'rgba(80,50,20,.22)');
  g.fillStyle = v; g.fillRect(PAD, HUD, w, h); g.restore();
}

// A nudger is a piston set in the road (Minecraft's, top-down): a stone body, a wooden head and four chevrons for
// "onward, whichever way you came". On `nudge` the head punches out toward where you were shoved, then pulls back.
function piston(X0, Y0, f) {
  const cx = X0 + CELL / 2, cy = Y0 + CELL / 2;
  rr(X0 + 3, Y0 + 3, CELL - 6, CELL - 6, ART === 'c' ? 0 : 8, '#7d8496'); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
  g.beginPath(); for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) { const ex = cx + dx * 24, ey = cy + dy * 24; // chevrons on the rim
    g.moveTo(ex - dy * 5 - dx * 4, ey - dx * 5 - dy * 4); g.lineTo(ex, ey); g.lineTo(ex + dy * 5 - dx * 4, ey + dx * 5 - dy * 4); }
  g.lineWidth = 2.5; g.strokeStyle = '#e6e2d6'; g.stroke();
  let ox = 0, oy = 0;
  if (f) { const q = reduced ? 0.5 : Math.sin(Math.PI * Math.min(1, age(f) / T(260))); ox = (f.to.x - f.at.x) * CELL * 0.55 * q; oy = (f.to.y - f.at.y) * CELL * 0.55 * q;
    g.strokeStyle = '#4a4e5c'; g.lineWidth = 8; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + ox, cy + oy); g.stroke(); } // the rod
  rr(cx - 15 + ox, cy - 15 + oy, 30, 30, 4, '#c8935a'); g.strokeStyle = '#6b4420'; g.lineWidth = 2; g.stroke(); // the wooden head
  g.beginPath(); for (const k of [-5, 5]) { g.moveTo(cx - 13 + ox, cy + k + oy); g.lineTo(cx + 13 + ox, cy + k + oy); } g.lineWidth = 1.5; g.stroke(); // its planks
}
