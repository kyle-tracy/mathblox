// Thought-ladder smoke alarm (experiment, not a gate). Run: timeout 180 node test/ladder.js
// T0 monkey (random moves), T1 greedy on h, T2 greedy on best h within 3 moves; cap = 3x stored solution length.
// Run counts cut from 1000/300/100 to 100/40/8 to fit the 2 min budget (arg N scales them).
// Tier = lowest of T0/T1/T2 with win rate >= 5%, else T3. Detours = moves on stored solution where h goes up.
// h(state) = Manhattan(player, exit) + 3 per false gate + 2 per unopened non-gate door still on the board. Won = -100.
// ponytail: h knows nothing of merging or pushing blocks, so any level needing "walk away from the exit" reads as a detour.
import { LEVELS } from '../levels/levels.js';
import { parseLevel, step } from '../core/world.js';
import { solve } from './solver.js';

const rng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const NAME = { r: 'right', l: 'left', u: 'up', d: 'down', s: 'swap' };
const FAV = ['The Box Counts', 'The Shrinking Side', 'Same to Both Sides', 'Two Triangles Again', 'Crossroads'];

const exitOf = s => { for (let y = 0; y < s.tiles.length; y++) { const x = s.tiles[y].indexOf('E'); if (x >= 0) return [x, y]; } return [0, 0]; };
const h = (s, ex) => {
  if (s.won) return -100;
  const open = s.objects.filter(o => o.kind === 'door' && !o.gate).length;
  const gates = s.objects.filter(o => o.gate && !o.open).length;
  return Math.abs(s.player.x - ex[0]) + Math.abs(s.player.y - ex[1]) + 3 * gates + 2 * open;
};
const best = (s, ex, acts, depth) => { // min h reachable within depth moves
  let m = h(s, ex); if (s.won || !depth) return m;
  for (const a of acts) { const n = step(s, a).state; if (n !== s) m = Math.min(m, best(n, ex, acts, depth - 1)); }
  return m;
};

function run(lvl, acts, cap, rand, policy) {
  let s = parseLevel(lvl); const ex = exitOf(s);
  for (let i = 0; i < cap && !s.won; i++) {
    let a;
    if (policy === 0 || rand() < 0.1) a = acts[Math.floor(rand() * acts.length)];
    else {
      const sc = acts.map(x => { const n = step(s, x).state; return policy === 1 ? h(n, ex) : best(n, ex, acts, 2); });
      const m = Math.min(...sc), pick = acts.filter((_, j) => sc[j] === m);
      a = pick[Math.floor(rand() * pick.length)];
    }
    s = step(s, a).state;
  }
  return s.won;
}

function rate(lvl, acts, cap, n, policy, seed) {
  const r = rng(seed); let w = 0;
  for (let i = 0; i < n; i++) if (run(lvl, acts, cap, r, policy)) w++;
  return 100 * w / n;
}

const SYN = [
  { name: 'syn: door ahead', map: ['########', '#@.3.AE#'], doors: { A: 3 } },
  { name: 'syn: merge to door', map: ['###########', '#@2+1..AE.#'], doors: { A: 3 } },
];
for (const l of SYN) l.solution = solve(parseLevel(l)).map(d => d[0]).join('');

const N = process.argv[2] ? +process.argv[2] : 1; // run-count scale
const rows = [];
for (const lvl of [...LEVELS, ...SYN]) {
  const s0 = parseLevel(lvl), ex = exitOf(s0);
  const acts = ['up', 'down', 'left', 'right', ...(s0.cast.length > 1 || s0.others.length ? ['swap'] : [])];
  const cap = 3 * lvl.solution.length;
  const t = [rate(lvl, acts, cap, 100 * N, 0, 1), rate(lvl, acts, cap, 40 * N, 1, 2), rate(lvl, acts, cap, 8 * N, 2, 3)];
  const tier = [0, 1, 2].find(i => t[i] >= 5) ?? 3;
  let s = s0, det = 0;
  for (const c of lvl.solution) { const n = step(s, NAME[c]).state; if (h(n, ex) > h(s, ex)) det++; s = n; }
  const kind = FAV.includes(lvl.name) ? 'FAV' : /^(First Push|syn:)/.test(lvl.name) ? 'ANCHOR' : '';
  rows.push({ i: LEVELS.indexOf(lvl) + 1, name: lvl.name, kind, len: lvl.solution.length, t, tier, det });
  console.log(`${rows.at(-1).i}\t${lvl.name}\t${kind}\tlen${lvl.solution.length}\tT0 ${t[0].toFixed(1)}\tT1 ${t[1].toFixed(0)}\tT2 ${t[2].toFixed(0)}\ttier T${tier}\tdet ${det}`);
}
