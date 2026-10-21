// P2.1 slice (Worldo): 17 critical-path levels + S11 Variable Lanes (1-wide intro, V1–V6, a rest, a V3 echo) + Sandbox.
// Each level: skill IDs (docs/curriculum.md), beat (fun-principles §2), misconception surfaced, `choice` (the thought the
// level forces, which no other level forces the same way; from L2 on the answer is never "just walk". Two routes are not required), and `teaches`: events NO winning path may skip (test/cheese.test.js).
// `evidence: false` = forced level, carries no mastery evidence. Maps are ≤ 12 rows (fits 1100×720 at 48 px cells).
// Pattern "T": the player starts between two true roads (different math) with a bait arm above; the bait ends in a
// harmless bounce (scale, deficit ghost, overhang), so the wrong idea fails visibly and nothing is lost.
// One file per world, in play order. Order here IS the play order (?level=N).
import meadow from './meadow.js';
import balance from './balance.js';
import merge from './merge.js';
import carve from './carve.js';
import lanes from './lanes.js';
import sandbox from './sandbox.js';

export const LEVELS = [...meadow, ...balance, ...merge, ...carve, ...lanes, ...sandbox];
