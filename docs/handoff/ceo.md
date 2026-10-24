# CEO handoff, 2026-10-23 (fresh session, not a resume)

Read `docs/ceo.md` first, then this file, `docs/vision.md`, and `tail -n 25 docs/decisions.md`. **The plan now is the spec: `docs/superpowers/specs/2026-10-23-characters-world-design.md`.** Read it before you build anything. Read nothing else until a task needs it.

## What changed today
- **The commissioner called key-spamming "fundamentally lame".** The answer is playable mathematician **heroes**, each with their own move, introduced with true trivia that keeps history's flaws in. The aim is to turn mathematics into a game: lots of characters, colour and history, nothing sterile.
- **Heroes are modules.** Each one is a single entry in `core/heroes.js` (its move), in `levels/characters.js` (name, trivia, colour) and in `render/cast.js` (sprite). `test/heroes.test.js` checks that all three exist.
  - Tally-Keeper: one step.
  - Euclid: slides until stopped. When he pushes, he **curls**: he and the block slide together until it stops, or it hits math and calculates on impact.
  - Zeno: goes half the open runway, rounded up.
  - Pythagoras: leaps 2 cells and never pushes. **His leap is a bracket.** Leaping across a sign calculates the nearest two numbers on the sign's line, reading left to right, top to bottom. Brackets chain.
  - Brahmagupta: walking into a number negates it in place, and turns + into −.
- **Several bodies and change pads.**
  - `level.bodies`: more heroes stand on the board, and Tab hands control between them. The bodies you aren't controlling are solid.
  - `*` change pads, set with `level.pads`, turn your body into that hero.
  - `level.cast`: the older one-body swap.
- **The world map** (`levels/worlds.js`; its order IS the play order):
  - **Camp** is the Tally-Keeper's tutorial: 12 old levels plus the ÷0 storm, chosen by Qualito.
  - **Solo worlds, one hero only:** Alexandria (Euclid, commutativity, 4 levels), Croton (Pythagoras, associativity, 5 levels, pure brackets), Ujjain (Brahmagupta, negatives and zero) and Elea (Zeno, fractions). See "In flight" for the last two.
  - **Pair worlds** (6): only The Market (Euclid + Brahmagupta) and The Observatory (Euclid + Pythagoras) have a level each so far. The Underground pairs the Tally-Keeper with Pythagoras, to teach parity.
  - **The Storm Keep dungeon:** an honest limit fight, designed by Matho.
  - Math beats for every world are in `docs/curriculum.md` §7.
- **The Craft hub** (Axio, `core/progress.js`):
  - Every world has a door in Craft's wall. A door bounces you with `needs` if you haven't brought the right companions, or says `soon` if the world has no levels yet.
  - Heroes move in Craft too: Euclid curls, Pythagoras leaps rivers, Brahmagupta flips pits into hills.
  - `?world=id` plays a world. C at camp picks your party, Tab swaps, and Esc or ↩ goes back to the map. Progress is saved in localStorage, with every call guarded.
- **Cut** (kept in their files and git history, not played): Take It Out, Turn to Pass, Weighing a Field, Ten in One, Every Hole Names Its Kind, Sandbox, Nothing Times, The Low Tunnel, and the old intros Something to Stop On and Leap Behind It.
- **Lean studio rules** (`docs/ceo.md`): every brief opens with "call code-review-graph `get_minimal_context` for [functions]; read no file whole". Log each agent's tokens to see whether that helps. do small jobs yourself, paste exact line ranges into briefs, continue an agent rather than respawning it. Budgeto is retired; you keep the token ledger yourself.

## In flight at wrap-up
Nothing is running, and the tree is clean and pushed. Tests: 139 pass.
- **Play order** (31 levels): Camp 1–13, Alexandria 14–17, Croton 18–22, Ujjain 23–26, Elea 27–29, then The Market (Be Someone Else) and The Observatory (A Friend Is a Wall).
- **Elea is thin.** Three finished Zeno rooms (Ever Smaller Steps, Quarter Past Half, Half of What Is Left) are parked in `held` in `levels/elea.js`. Their stored solutions replay, but p3.test's no-room check runs out of memory searching them.
- **Ujjain's last level uses a pad to Euclid,** because Brahmagupta can't push. Under the bend-constraints rule, consider giving him a verb instead.

## Next
1. **Qualito plays the whole run, from camp through the four solo worlds,** like a kid would, plus the hub doors. It gives keep/fix verdicts and routes fixes to their owners.
2. **Testo: bound p3.test's no-room search** (cap the states, or replay stored solutions instead of solving), then add Elea's 3 held rooms back to WORLDS.
3. **Re-number `docs/demo.md`** by level name: the order changed today, and the residency demo is due 2026-10-27. The commissioner records it. Good new picks: Euclid's curl, the Pythagoras bracket, Brahmagupta's flip, two bodies.
4. **Pair worlds**, using the beats in curriculum.md §7. Start with The Market (distributivity, no new attribute). After that, imaginary numbers (a `turn` attribute) and calculus (a `vel` attribute). Complex numbers reuse `vec`.
5. **The Storm Keep:** levels need 3–4 heroes, and the boss fight is Matho's two-phase limit.
6. **More heroes** (al-Khwarizmi, Noether, Fibonacci): Visio and Matho pitch, Qualito filters.

## Standing commissioner rules from today
- **Bend constraints:** "any time a problem seems difficult, the solution is probably to bend your internalized constraints."
- **Open-ended build:** "build and cook".
- **Tally-Keeper stays out:** after camp he's too good, because every other hero's move is a run of his steps. He returns only in the Underground.

## Open questions
- None blocking. The HUD wraps to two rows when 3 or more bodies are on the board (accepted for now).
