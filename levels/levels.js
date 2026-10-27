// Difficulty (1-5, mental energy not move count):
// 1 = one idea, seen almost at once (L1, intro rooms).
// 2 = one idea plus a small trap or order choice.
// 3 = two ideas must combine, or a wrong first habit must be dropped.
// 4 = a non-obvious plan of several steps (Share by Less and Less: 2÷½=4).
// 5 = finale: an earlier habit misleads, and only one of many orderings works (The Last Share).
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
import alexandria from './alexandria.js';
import croton from './croton.js';
import ujjain from './ujjain.js';
import elea from './elea.js';
import market from './market.js';
import keep from './keep.js';

// Old levels are the Tally-Keeper's (camp tutorial); solo worlds are one hero each (commissioner 2026-10-23).
import { WORLDS } from './worlds.js';
const ALL = [...meadow, ...balance, ...merge, ...carve, ...lanes, ...fields, ...sandbox, ...cast, ...alexandria, ...croton, ...ujjain, ...elea, ...market, ...keep];
// Qualito's cut (2026-10-23): kept in their files and git history, out of play.
const CUT = new Set(['Take It Out', 'Turn to Pass', 'Weighing a Field', 'Ten in One', 'Every Hole Names Its Kind', 'Sandbox', 'Nothing Times', 'The Low Tunnel', 'Something to Stop On', 'Leap Behind It', 'A Debt Counts Twice', 'Halfway There'] /* old intros reworked in alexandria/croton; Low Tunnel: Euclid's curl hits ×-no-room */);
const placed = WORLDS.flatMap(w => w.levels);
// Play order: world by world (worlds.js), then any level not yet placed in a world (new work in progress).
export const LEVELS = [...placed.map(n => ALL.find(l => l.name === n)), ...ALL.filter(l => !placed.includes(l.name) && !CUT.has(l.name))];
