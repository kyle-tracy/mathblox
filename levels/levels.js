// Curated slice (Worldo, 2026-10-21, Qualito cut; character intros 2026-10-23): 28 levels + Sandbox. Meadow 1, Balance 1, Merge 1, Carve 2, Lanes 6, Fields 11, Cast 6 (spliced in, see below).
// Each level: skill IDs (docs/curriculum.md), beat (fun-principles §2), misconception surfaced, `choice` (the thought the
// level forces, which no other level forces the same way; from L2 on the answer is never "just walk". Two routes are not required), and `teaches`: events NO winning path may skip (test/cheese.test.js).
// `evidence: false` = forced level, carries no mastery evidence. Maps are ≤ 12 rows (fits 1100×720 at 48 px cells).
// Pattern "T": the player starts between two true roads (different math) with a bait arm above; the bait ends in a
// harmless bounce (scale, overhang, wrong-kind hole), so the wrong idea fails visibly and nothing is lost. Since the
// calculator-honest engine, 3−5 is a real −2: anti-blocks are play, never a trap.
// P3 Fields (A1-A13, docs/handoff/worldo-p3.md, L15-L21 and L25-L28) plays after Lanes, before Sandbox.
// One file per world, in play order. Order here IS the play order (?level=N).
import meadow from './meadow.js';
import balance from './balance.js';
import merge from './merge.js';
import carve from './carve.js';
import lanes from './lanes.js';
import fields from './fields.js';
import sandbox from './sandbox.js';
import cast from './cast.js';

// After the first two levels you start as Euclid, Tally one swap away (commissioner 2026-10-23: no key-spamming). A level's own `cast` wins.
// Character intros (cast.js): Euclid after Balance (L3), Pythagoras after Carve (L7), Brahmagupta after The Shrinking Side
// (L11, negatives in a lane), Zeno after Keep the Pebble (L22, halves round up like a remainder).
const [euclid, pythagoras, brahmagupta, zeno, ...together] = cast; // together: bodies and change pads (L23-L24)
export const LEVELS = [...meadow, ...balance, euclid, ...merge, ...carve, pythagoras, ...lanes.slice(0, 3), brahmagupta,
  ...lanes.slice(3), ...fields.slice(0, 7), zeno, ...together, ...fields.slice(7), ...sandbox]
  .map((l, i) => (i < 2 || l.cast ? l : { ...l, cast: ['euclid', 'tally'], solution: l.solution && 's' + l.solution })); // start as Euclid; solutions are Tally moves
