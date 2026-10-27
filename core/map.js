// The path map (docs/superpowers/specs/2026-10-27-path-map-design.md): Sumhenge is the root, worlds are vertices,
// paths are edges. Travel only: one arrow walks one edge, Enter opens a node's world. Nothing to push, nothing to strand.
// Coordinates are layout units for render/map.js (Arto may move them; the links are the map). Pure, no DOM.
import { world, missing, recruits } from './progress.js';

export const NODES = {
  sumhenge: { x: 0, y: 0, world: 'camp', links: { r: 'alexandria', d: 'campfire', u: 'under' } },
  campfire: { x: 0, y: 1, world: 'campfire', links: { u: 'sumhenge' } },
  under: { x: 0, y: -1, world: 'under', links: { d: 'sumhenge' } },
  alexandria: { x: 2, y: 0, world: 'alexandria', links: { l: 'sumhenge', d: 'croton', r: 'vectors' } },
  vectors: { x: 4, y: 0, world: 'vectors', links: { l: 'alexandria' } },
  croton: { x: 2, y: 2, world: 'croton', links: { u: 'alexandria', l: 'hut', r: 'rotation' } },
  rotation: { x: 4, y: 2, world: 'rotation', links: { l: 'croton' } },
  hut: { x: 0, y: 2, world: 'hut', links: { r: 'croton', l: 'ujjain' } },
  ujjain: { x: -2, y: 2, world: 'ujjain', links: { r: 'hut', u: 'elea', d: 'distrib' } },
  distrib: { x: -2, y: 4, world: 'distrib', links: { u: 'ujjain' } },
  elea: { x: -2, y: -2, world: 'elea', links: { d: 'ujjain', r: 'keep', l: 'series', u: 'motion' } },
  series: { x: -4, y: -2, world: 'series', links: { r: 'elea' } },
  motion: { x: -2, y: -4, world: 'motion', links: { d: 'elea' } },
  keep: { x: 6, y: -2, links: { l: 'elea', d: 'stair1' } }, // the Storm Keep's chhatri; the stepwell goes down
  stair1: { x: 6, y: -1, links: { u: 'keep', l: 'keep-euclid-n', r: 'keep-pythagoras-n', d: 'stair2' } },
  'keep-euclid-n': { x: 5, y: -1, world: 'keep-euclid', links: { r: 'stair1' } },
  'keep-pythagoras-n': { x: 7, y: -1, world: 'keep-pythagoras', links: { l: 'stair1' } },
  stair2: { x: 6, y: 0, links: { u: 'stair1', l: 'keep-brahmagupta-n', r: 'keep-zeno-n', d: 'pool' } },
  'keep-brahmagupta-n': { x: 5, y: 0, world: 'keep-brahmagupta', links: { r: 'stair2' } },
  'keep-zeno-n': { x: 7, y: 0, world: 'keep-zeno', links: { l: 'stair2' } },
  pool: { x: 6, y: 1, world: 'dungeon', links: { u: 'stair2' } },
};

export const newMap = (done = [], at = 'sumhenge') => ({ at, done: [...done] });

// dir: 'u' | 'd' | 'l' | 'r' walks an edge; 'enter' opens the node's world. Anything else does nothing.
export function step(state, dir) {
  const node = NODES[state.at];
  if (dir === 'enter') {
    if (!node.world) return { state, events: [] };
    if (!world(node.world).levels.length) return { state, events: [{ type: 'locked', world: node.world, missing: [], soon: true }] };
    const miss = missing(node.world, recruits(state.done), state.done);
    return { state, events: [miss.length ? { type: 'locked', world: node.world, missing: miss } : { type: 'enter', world: node.world }] };
  }
  const to = node.links[dir];
  return to ? { state: { ...state, at: to }, events: [{ type: 'walk', from: state.at, to }] } : { state, events: [] };
}
