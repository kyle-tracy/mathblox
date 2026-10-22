# Ideas (owner: Visio)

Raw proposals. Qualito, Testo, and the CEO filter them. An idea that gets built moves to decisions.md.

## Batch 1 (2026-10-22): new math made physical, plus Craft systems

### Prime Ore: only some piles can be floors (risk: low · math: primes, factors, area · age: 7–9)
Pitch: At the Array bench, a pile of n unit cubes can be laid as any rectangle floor whose area is n. A 12-pile becomes a 3×4 hut floor, a 2×6 dock, or a 1×12 bridge. A 7-pile only ever makes a 1×7 strip. Kids learn that "prime" ore is bridge ore and "composite" ore is floor ore.
Why it's honest math: a prime is exactly a number with no rectangle except 1×p. Shape is already an attribute (P3), so rearranging a pile keeps its value and changes only its shape.
How it plays: you need a 2-wide floor for the hut, so you go hunting for a pile that will tile it. When an 11 refuses, you carve it to 10 and it works. Nothing quizzes you; the bench just won't make a 2×(11/2) floor.
Risk: low. It reuses `shape` and Array. The danger is a menu-like bench, so the rearrange must be a physical push (cubes slide into the new rectangle).
Smallest test: one puzzle room with a 2×3 socket, a 7-pile, and a 6-pile, plus a "re-lay" pad that cycles a platform through its factor rectangles. Does the kid try the 7 first and laugh when it only goes long?

### Doubling Trees (risk: low · math: exponents, growth vs adding · age: 7–9)
Pitch: Most trees Tick +1 per day. A rare seed carries the attribute `×2`, so its tree goes 1, 2, 4, 8, 16. Plant one next to a +1 tree and watch the race: the +1 tree leads for three days, then gets crushed.
Why it's honest math: the Tick verb's operator lives on the tree as an attribute, and repeated ×2 is literally 2ⁿ. This is the first time the kid feels a curve.
How it plays: the choice is whether to harvest the doubling tree now, at 4, or wait a few days for 16 while the fire burns down. Patience versus need is a real survival decision, and it uses turns, not the clock.
Risk: low. Numbers explode fast, so cap the tree visually (it outgrows the screen) and let the kid carve it down. Fractions sneak in if a `÷2` tree exists, which is good as a later twist (a shrinking tree approaches 0 but never gets there).
Smallest test: tick pads already exist in core. Give one pad an `op: ×2` attribute and put it beside a +1 pad in a sandbox room. The test is whether a 7-year-old predicts the crossover after seeing it once.

### Bundle Cart: carry limit is place value (risk: med · math: place value, bases · age: 6–8)
Pitch: Your cart has 9 loose slots. When the 10th cube lands, the ten click together into a rod that takes one slot. Ten rods become a flat. Far out on Five Island, the cart's latch is set to 5, so the same pile bundles differently and the cart shows "2 rods and 3 loose" for 13.
Why it's honest math: base-ten is exactly the rule "when you reach ten, group." The base is an attribute of the cart, not of the island tile, so carrying a Five-cart home keeps its base.
How it plays: inventory pressure makes the kid bundle on purpose. Unbundling a rod to pay a 3-cost recipe is the "borrowing" move, felt as breaking a rod in the cart, not as a rule on paper.
Risk: medium. It touches inventory, which Craft hasn't designed yet, and bases other than 10 may confuse 6-year-olds. Keep Five Island optional and late.
Smallest test: ten-rod sockets are already in core. One room where the player carries cubes in a visible 9-slot tray and the 10th snaps into a rod. Is the snap satisfying enough that kids collect to 10 on purpose?

### Weight Bridges (risk: low · math: inequalities, compare · age: 6–8)
Pitch: A rope bridge over a pit is labelled with a dot-count like ≤5. Blocks of value up to 5 roll across. A 6 crashes through and drops into the pit, which partly fills it. So "too big" is both a failure and a tool.
Why it's honest math: the bridge's capacity is an attribute, and < and ≤ are the comparison. The crash adds the block to the pit's value exactly (pit −4 plus a 6 becomes a +2 mound).
How it plays: too big is a tool as well as a failure. You can carve the load small enough to cross, or smash the bridge on purpose to fill the gap. Strict < versus ≤ can show up later as a bridge that creaks at exactly 5.
Risk: low. It needs a new cell type, but the comparison is trivial and fits doors.
Smallest test: a door variant with `cap: 5` that passes values ≤ 5 and drops anything bigger into the trench below (reusing `fillTrench`). Run one room with a 7 to see whether kids try smashing on purpose.

### Wind Arrows: vectors as thrust (risk: med · math: coordinates, vector addition · age: 8–9, seeds for later)
Pitch: In the open world, wind tiles carry an arrow attribute such as (3, 1). Push a block onto one and it slides 3 right and 1 up. Two wind tiles in a row add tip-to-tail, and a "sail" block you craft holds its own vector, so you can carry wind with you.
Why it's honest math: displacement is the vector, and chaining tiles is vector addition. The axes the game already draws become the measuring frame, which is the arc toward rocket thrust.
How it plays: a far rock sits at (7, 2), and you have sails (3, 1) and (4, 1). Order doesn't matter, because vector addition commutes, which matches the + lock. A (−2, 0) sail from the Mirror Lands is the first time negatives point somewhere.
Risk: medium. The block's meaning has to stay with its value. The vector belongs to the tile or sail, and it moves the block without changing what the block is. Diagonal moves on a grid need clear animation.
Smallest test: one puzzle room with two arrow tiles, (2, 0) and (0, 1), and a goal cell at (2, 1). Do kids discover that the order doesn't change where the block lands?

### Mirror Twin (risk: high · math: negation, reflection symmetry · age: 7–9)
Pitch: At the edge of the Mirror Lands a glass line runs down the y-axis. When you cross, an anti-you appears on the other side and copies your moves mirrored: you step left, it steps right. Its half of the room already holds anti-blocks, and nobody's push changes a sign. You solve rooms by moving so that both halves work.
Why it's honest math: reflection across x = 0 sends x to −x, and the Mirror Lands are the negative half. The twin is one honest function applied to you, and when you and your twin push a 3 and a −3 together at the line, they cancel to 0.
How it plays: it's a two-body puzzle with a single input, which is a new kind of thinking (variety). In Craft, the twin is a helper who builds the anti-version of your camp, which explains why the Mirror Lands mirror home.
Risk: high. Two-avatar control may overload 7-year-olds, and it raises a location-versus-attribute question. A block's sign is its own attribute, never the side it sits on, so a positive block carried across stays positive.
Smallest test: a 9-wide room split at the center with mirrored layouts and one asymmetry. The win requires both avatars on their exits at once. It can be paper-prototyped before anyone codes it.

### Fair-Share Herd (risk: med · math: fractions via equal sharing · age: 8–9)
Pitch: Woolly creatures travel in families of 2, 3, or 4. A family follows you home only if every member gets an equal share, so 3 berries for 2 lambs means one berry gets cut and each lamb eats 3/2. Give an unequal split and they huff and stay put (no penalty, they just don't come).
Why it's honest math: equal sharing is the research-backed entry point to fractions (Empson & Levi, *Extending Children's Mathematics*). ÷ already returns exact rationals, and the pie-slice dot render exists.
How it plays: a tamed herd gives wool (warmth), which ties fractions to survival. A family of 4 needing 3 cakes is a real puzzle, and kids invent 3/4 before they have a name for it.
Risk: medium. Fractions at 8 are a stretch, and the herd must never feel like a quiz gate. Some herds should be shareable with whole numbers so fractions show up as a surprise, not a wall.
Smallest test: a lane-style lock with N mouths that accepts any equal split of a dropped block, using `÷` on the block and N. Run one room with 3 berries and 2 mouths.

### Weather Bag: chance you can see and stack (risk: med · math: probability as ratio · age: 7–9)
Pitch: Above camp hangs a see-through cloud bag of tokens, for example 3 sun, 1 rain, and 1 storm. Each dusk it draws one, and that is tomorrow's weather. Building a rain-catcher puts a rain token in the bag, and a lightning rod pulls a storm token out. Kids shape the odds with things they build.
Why it's honest math: the probability is the visible ratio of tokens, with no hidden weights, and tomorrow's chance is literally the count over the total. Changing the odds means changing the counts.
How it plays: you want rain for the crops, so you build catchers until the bag is mostly rain. The kid learns why 4-in-5 still sometimes fails, and that's fine, because weather destroys nothing (per craft-loop §3).
Risk: medium. Randomness against undo means the draw must be seeded per turn so undo-redo gives the same sky (no reroll scumming, no slot-machine feel). It must never be a gamble with stakes, and there's no near-miss juice.
Smallest test: a Craft-strip mock where the bag is drawn at night on a seeded RNG and one buildable adds a token. Watch whether kids glance at the bag before deciding what to build.

### ⭐ moonshot: Matrix Shrine: transform the world, keep the meaning (risk: high · math: matrices, linear transforms, symmetry · age: 6+ as play, 12+ as math)
Pitch: A shrine shows a tiny 2×2 picture card. Stepping on it applies that transform to the whole room: rotate a quarter turn, flip across an axis, or shear. The walls, pits, and blocks all move, the drawn axes turn with them, and every block still has its value. A puzzle that was impossible becomes walkable once the world is turned on its side.
Why it's honest math: a 2×2 matrix is precisely a map of the plane, and the cards are the real matrices (rotation, reflection, shear). The lock "meaning lives in attributes, not location" is the physics here, because the world moves and the numbers don't change.
How it plays: for a 6-year-old it's "I spun the world." For the long arc, cards compose (rotate then flip equals a different flip, which is group theory you can feel), and later the matrix entries become visible numbers you craft. That is linear algebra arriving as a verb, years before the notation.
Risk: high. Whole-grid transforms touch core, non-square rooms need padding, and shear and stretch don't land on grid cells. Start with the 8 symmetries of the square (the dihedral group D4), which map grid to grid exactly. Undo must invert the transform. Reading order is part of the math, though. A flip turns a laid-out `7 − 3` into `3 − 7`, so either make that the point (a flip negates differences, which ties into the Mirror Lands) or start with the transforms that keep reading order.
Smallest test: one square puzzle room with a single "rotate 90°" shrine and a gap that's only crossable after rotating. The transform is a pure function on the parsed level (cells and positions mapped by the matrix), so it's testable without the renderer. Does the kid gasp?

**Visio's picks:** build Prime Ore first, since it's nearly free on P3 shapes and makes primes physical. The Matrix Shrine (D4 only) comes second because it is the arc.
