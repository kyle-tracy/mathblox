// Progress on the world map (spec §3). Pure: `done` is a list of finished world ids, a party a list of hero ids.
import { WORLDS } from '../levels/worlds.js';

export const world = id => WORLDS.find(w => w.id === id);
const isPair = w => !w.hero && w.needs.length === 2;
// Finishing a solo world recruits its hero; the Tally-Keeper is always with you.
export const recruits = done => [...new Set(['tally', ...done.map(world).filter(w => w?.hero).map(w => w.hero)])];
// What stops you entering: heroes not in your party, or 'pairs:N' while fewer than N pair worlds are done.
export function missing(id, party, done) {
  const have = party.filter(h => recruits(done).includes(h)), pairs = done.map(world).filter(w => w && isPair(w)).length;
  return world(id).needs.filter(n => (n.startsWith('pairs:') ? pairs < Number(n.slice(6)) : !have.includes(n)));
}
export const canEnter = (id, party, done) => missing(id, party, done).length === 0;
// Every party you can take out: each recruit alone, then every two of them.
export const parties = r => [...r.map(a => [a]), ...r.flatMap((a, i) => r.slice(i + 1).map(b => [a, b]))];
