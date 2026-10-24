// Heroes: one entry per hero, keyed by id (data in levels/characters.js, look in render/cast.js; test/heroes.test.js
// checks all three agree). A hero is (state, dir, api) -> { state, events }, built from api.move (one step or one push).
import { sub } from './value.js';
import { DIRS } from './world.js';

const plain = r => r.events.length && r.events.every(e => e.type === 'move' || e.type === 'push');
const walked = r => r.events[0]?.type === 'move';
// Repeat api.move up to n times while each repeat is the same kind of plain action as the first:
// walk keeps walking; with curl, a plain push keeps pushing (the block slides until stopped or it meets math).
function run(state, dir, api, n = Infinity, curl = false) {
  let r = api.move(state, dir);
  const kind = walked(r) ? 'walk' : curl && plain(r) ? 'push' : null;
  if (!kind) return r;
  const events = [...r.events];
  for (let i = 1; i < n && !r.state.won; i++) {
    const nx = api.move(r.state, dir);
    if (kind === 'push' && !plain(nx) && nx.events[0]?.type !== 'bounce') { r = nx; events.push(...nx.events); break; } // impact: it calculates
    if (kind === 'walk' ? !walked(nx) : !plain(nx)) break;
    r = nx; events.push(...nx.events.filter(e => e.type !== 'move' && e.type !== 'push'));
    if (nx.events.some(e => e.type === 'change')) break; // a change pad ends the run: you are someone else now
  }
  return { state: r.state, events };
}
const runway = (state, dir, api) => { let n = 0, s = state, r; while (!s.won && walked(r = api.move(s, dir))) { n++; s = r.state; } return n; };
const OPP_OP = { '+': '-', '-': '+' };

export const HEROES = {
  tally: (state, dir, api) => api.move(state, dir),
  // Euclid: a line segment can be extended as far as you like. He slides until something is in the way;
  // pushing, he and the block slide together (a curling stone) until it stops, or hits math and calculates.
  euclid: (state, dir, api) => run(state, dir, api, Infinity, true),
  // Zeno: half the distance to whatever is ahead (rounded up, so on a grid he does arrive).
  zeno: (state, dir, api) => run(state, dir, api, Math.ceil(runway(state, dir, api) / 2) || 1),
  // Pythagoras: a string halved sounds an octave up (2:1). He leaps 2 cells, over anything; he never pushes.
  pythagoras(state, dir, api) {
    if (state.won) return { state, events: [] };
    const [dx, dy] = DIRS[dir], x = state.player.x + 2 * dx, y = state.player.y + 2 * dy, t = api.tileAt(state, x, y);
    if (!'.^bE*'.includes(t) || api.objAt(state, x, y)) return api.bounce(state, 'leap', { x, y });
    if (t === 'E' && !api.gatesTrue(state)) return api.bounce(state, 'gates', { x, y }, { falseGates: api.falseGates(state) });
    const r = api.walk(structuredClone(state), x, y);
    r.events[0] = { type: 'leap' };
    return r;
  },
  // Brahmagupta: fortunes and debts. Walking into a plain number or a + / − flips it to its opposite.
  brahmagupta(state, dir, api) {
    const [dx, dy] = DIRS[dir], x = state.player.x + dx, y = state.player.y + dy, o = api.objAt(state, x, y);
    if (state.won || !o || o.shape || !(o.kind === 'num' || '+-'.includes(o.op))) return api.move(state, dir);
    const s = structuredClone(state), b = api.objAt(s, x, y);
    if (b.kind === 'num') b.value = sub(0, b.value); else b.op = OPP_OP[b.op];
    return { state: s, events: [{ type: 'negate', at: { x, y }, value: b.value ?? b.op }] };
  },
};
