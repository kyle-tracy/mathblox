// BFS solver (Testo's bot): shortest move list that wins, or null.
import { step, DIRS } from '../core/world.js';

const key = s => `${s.player.x},${s.player.y}|${s.tiles.join('')}|` + // tiles change: trenches fill, pads get used
  s.objects.map(o => `${o.kind}${o.value ?? o.op}@${o.x},${o.y}`).sort().join(';');

export function solve(start, maxStates = 200000) {
  const seen = new Set([key(start)]);
  let frontier = [[start, []]];
  while (frontier.length && seen.size < maxStates) {
    const next = [];
    for (const [s, path] of frontier) for (const d of Object.keys(DIRS)) {
      const { state } = step(s, d);
      if (state.won) return [...path, d];
      const k = key(state);
      if (!seen.has(k)) { seen.add(k); next.push([state, [...path, d]]); }
    }
    frontier = next;
  }
  return null;
}
