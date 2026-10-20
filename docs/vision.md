# MathBlox — Vision

**The math is the physics.** You explore a world of MathBlox. Each block carries math **attributes** (its value, its kind, and later its unit size, sign, fraction, and direction). Blocks combine physically, exactly the way the math says they should. Nothing in the game is a quiz. A correct idea opens a door or builds a bridge. A wrong idea produces a readable, funny, safe failure.

## Pillars
1. **Intrinsic integration.** The math is the core mechanic, never a gate in front of the fun.
2. **Honest math.** No rule teaches something that has to be unlearned later.
3. **Attributes, not location.** A block's position never changes what it is. The world has visible **axes** as a frame of reference: you measure with them, and they later become the coordinates and vectors.
4. **Human order, axiomatic bones.** The game follows how children learn (counting → + − × ÷ → interactions). Underneath, the rules are axioms: Tick (+1) is Peano's successor.
5. **Safe failure.** No timers by default, undo is always available, no dark patterns.

## Audience and arc
The prototype targets ages 6–9. The architecture scales all the way to linear algebra in space: arrays → matrices, the number line → coordinate plane → vectors as thrust, matrices as transformations of the world.

## Core verbs
| Math | Verb | In world |
|---|---|---|
| +1 | Tick | grows a block by one |
| + | Merge | `[a][+][b]` pushed together fuse into a+b |
| − | Carve | `[a][−][b]` carves b out of a; if b > a the chisel **bounces** (before negatives are unlocked) |
| 0 | Void | the identity: merging with it changes nothing |
| × | Array | an a×b platform (P3) |
| ÷ | Share | an equal split plus remainder pebbles (P3); ÷0 is a never-resolving "void storm" |
| = | Lock | a door opens only for a block exactly equal to its number |

## Team
CEO (me) · Matho (math education) · Psycho (player psychology and fun) · Axio (engineering and math kernel) · Worldo (levels and world) · Arto (art, audio, feel) · Testo (QA, solver, playtests). Charters are in `.claude/agents/`.
