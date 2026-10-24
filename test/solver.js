// BFS solver (Testo's bot): shortest move list that wins, or null if the level is exhaustively unwinnable.
// ban: event types the bot refuses to cause (e.g. ['carve']) -- proves a level can't be won while skipping its skill.
import { step, DIRS } from '../core/world.js';

export const key = s => `${s.mover}|${s.player.x},${s.player.y}|${s.tiles.join('')}|` + // tiles change: trenches fill, pads get used
  s.objects.map(o => `${o.kind}${o.value ?? o.op}${o.shape ?? ''}${o.tens ?? ''}${o.open ? '!' : ''}@${o.x},${o.y}`).sort().join(';');

// Euclid's and Zeno's moves are runs of Tally steps, so with the Tally-Keeper in the cast the bot drops them.
// ponytail: the returned path is for that pruned cast; store hand-checked solutions, not raw bot output, for such levels.
const RUNS = ['euclid', 'zeno'];
export function solve(start, maxStates = 200000, ban = []) {
  if (start.cast?.includes('tally') && start.cast.some(m => RUNS.includes(m))) {
    start = { ...start, cast: start.cast.filter(m => !RUNS.includes(m)) };
    if (RUNS.includes(start.mover)) start.mover = 'tally';
  }
  const acts = [...Object.keys(DIRS), ...(start.cast?.length > 1 ? ['swap'] : [])];
  const seen = new Set([key(start)]);
  let frontier = [[start, []]];
  while (frontier.length && seen.size < maxStates) {
    const next = [];
    for (const [s, path] of frontier) for (const d of acts) {
      const { state, events } = step(s, d);
      if (ban.length && events.some(e => ban.includes(e.type))) continue;
      if (state.won) return [...path, d];
      const k = key(state);
      if (!seen.has(k)) { seen.add(k); next.push([state, [...path, d]]); }
    }
    frontier = next;
  }
  if (frontier.length) throw new Error(`solver gave up at ${maxStates} states: unknown, not unsolvable`);
  return null;
}
