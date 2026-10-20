// P2.1 slice (Worldo): 17 critical-path levels + S11 Variable Lanes V1–V6 + Sandbox.
// Each level: skill IDs (docs/curriculum.md), beat (fun-principles §2), misconception surfaced, `choice` (what the
// player decides; every level after L1 has one), and `teaches`: events NO winning path may skip (test/cheese.test.js).
// `evidence: false` = forced level, carries no mastery evidence. Maps are ≤ 12 rows (fits 1100×720 at 48 px cells).
// Pattern "two roads": the player starts between a bait road and a true road; the bait ends in a harmless bounce
// (scale, deficit ghost, overhang), so the wrong idea fails visibly and nothing is lost.
// One file per world, in play order. Order here IS the play order (?level=N).
import meadow from './meadow.js';
import balance from './balance.js';
import merge from './merge.js';
import carve from './carve.js';
import lanes from './lanes.js';
import sandbox from './sandbox.js';

export const LEVELS = [...meadow, ...balance, ...merge, ...carve, ...lanes, ...sandbox];
