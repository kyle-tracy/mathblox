# Zeraphi — Vision

*Zeraphi is the game; MathBlox is the studio.*

**The math is the physics.** You explore a world of MathBlox. Each block carries math **attributes** (its value, its kind, and later its unit size, sign, fraction, and direction). Blocks combine physically, exactly the way the math says they should. Nothing in the game is a quiz.

**Where it goes (commissioner, 2026-10-21):** the puzzles are the tutorial. The game gradually becomes an **open-world survival-craft**: you live, explore, and build in a world made of math blocks. The engine is as precise as a calculator. When a combination breaks a level, that is play, not a bug.

## Zeraphi: start from zero, grow by φ
The name is the method. Fibonacci called zero *zephirum*; φ is the golden ratio his sequence grows toward.
- **Zero, the origin.** Everything starts at (0,0): the player at camp, a feature as its smallest true version, a session at the handoff. Zero is also the identity: a change adds +0 to everything it did not mean to touch, so tests and replays stay green. Zero dark patterns, zero waste.
- **φ, the spiral.** Each Fibonacci term is built from the two before it. So is the game: a new level, world or hero combines two things the player already owns, and a new system reuses what the code already has. Growth spirals outward from the origin (camp → Sumhenge → districts → wilds → space), never a jump to the edge.
- **Golden balance, a smoke alarm.** About 3 parts making to 2 parts playing, cutting and polishing (≈ φ). If a stretch of work tips far from that, stop and look. It is not a quota.

## Pillars
1. **Intrinsic integration.** The math is the core mechanic, never a gate in front of the fun.
2. **Calculator-honest.** Every legal combination gives the true answer, including negatives and exact fractions. Bounces happen only for what is truly impossible (no room). ÷0 is a storm.
3. **Order only where the math has order.** + and × do not care which way you push. − and ÷ read in order, because their math does.
4. **Attributes, not location.** A block's position never changes what it is. The visible **axes** are a frame of reference: you measure with them, and they become coordinates and vectors.
5. **Open-ended play.** Later levels and the open world reward experiments. Bad ideas are allowed to fail funny, as in Baba Is You and Minecraft.
6. **Safe failure.** No timers in puzzles, undo is always available, and no dark patterns. Survival stakes are gentle (see Craft).

## Audience and arc
The prototype targets ages 6–9. The architecture scales to linear algebra in space: arrays → matrices, the number line → coordinate plane → vectors as thrust, matrices as transformations of the world.

## Core verbs
| Math | Verb | In world |
|---|---|---|
| +1 | Tick | grows a block by one; also how **time** passes in Craft (trees and crops Tick each day) |
| + | Merge | `[a][+][b]` fuse into a+b, in either direction |
| − | Carve | carves b out of a; 3−5 gives a **−2 anti-block** |
| 0 | Void | the identity; also flat ground |
| × | Array | an a×b platform: floors, bridges, walls |
| ÷ | Share | an exact split (7÷2 = 7/2); ÷0 is a void storm |
| = | Lock | a door, a recipe, or a creature, satisfied only by an exact value |

## Craft: the open world (seed, not spec; let QC kill the bad parts)
- **The land is a number.** Every ground cell has a height. Hills are positive, pits are negative, and 0 is flat. A −4 pit filled with a +4 block becomes flat ground. Building means making the terrain sums work.
- **The axes are home.** Your camp is the origin. Distance makes numbers bigger, so the number line *is* the map. The negative half of the world is the Mirror Lands, where anti-blocks live.
- **Mining and harvest:** carve number-rocks into smaller blocks. Trees Tick upward each day, and you harvest them with ÷ (shares).
- **Crafting is an equation.** A recipe is a balance scale: put in blocks whose total matches, and get a tool out.
- **Creatures are variables.** At night "?" mimics wander, each wearing an equation like △+3=8 (the lane mechanic). Give one the right value and it is tamed; it becomes a helper that carries or pushes for you.
- **Weather:** ÷0 storms roll across the map, and − rivers dissolve whatever floats in them.
- **Gentle survival:** keep warmth (light) through the night. If it runs out you doze off and wake at camp, and your carried blocks wait where you fell. Nothing is ever lost forever.
- **The far goal:** build a rocket. Thrust is a vector, and that leads to space.

## Team
CEO (me) · Matho (math) · Psycho (fun) · Axio (core) · Worldo (levels and world) · Arto (art, audio, feel) · Testo (tests) · Qualito (QC curation) · Archo (repo). The CEO keeps the token ledger and picks who works on which model (`docs/ceo.md`, "Who does the work"). Charters are in `.claude/agents/`.
