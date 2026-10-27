// Progress on the world map (spec §3). Pure: `done` is a list of finished world ids, a party a list of hero ids.
import { WORLDS } from '../levels/worlds.js';

export const world = id => WORLDS.find(w => w.id === id);
// Finishing a solo world recruits its hero; the Tally-Keeper is always with you.
export const recruits = done => [...new Set(['tally', ...done.map(world).filter(w => w?.hero).map(w => w.hero)])];
// Sumhenge: one standing stone lights per finished hero world (Camp included).
export const stonesLit = done => done.map(world).filter(w => w?.hero).length;
// What stops you entering: heroes not in your party; 'heroes:N' while fewer than N heroes (not counting Tally) are
// recruited, whoever you brought; 'done:id' until that world is finished.
export function missing(id, party, done) {
  const have = party.filter(h => recruits(done).includes(h)), heroes = recruits(done).length - 1;
  return world(id).needs.filter(n => (n.startsWith('heroes:') ? heroes < Number(n.slice(7))
    : n.startsWith('done:') ? !done.includes(n.slice(5)) : !have.includes(n)));
}
export const canEnter = (id, party, done) => missing(id, party, done).length === 0;
// Every party you can take out: each recruit alone, then every two of them.
export const parties = r => [...r.map(a => [a]), ...r.flatMap((a, i) => r.slice(i + 1).map(b => [a, b]))];
