# MathBlox — Style Guide
Owner: Arto. Code: `render/` (look, draw, fx, state, audio) and `game.js` (input). Visual QA: `?showcase&level=N` (`levels/showcase.js`), add `&moves=rrdl` to replay inputs.
Rule zero: **visuals carry the math, and the renderer computes none of it.** Every value drawn comes from the state or an event.

## 1. One quantity, three codes (curriculum §5 hook 3)
Every number block shows, on a 55 px face inside a 64 px cell:
1. **Numeral**, top, bold 19 px Verdana / DejaVu Sans (1 has a base and 7 has none; 6 and 9 are open and distinct).
2. **Dot face**, ten-frame 5-structure (6 = row of 5 + 1). Never scattered.
3. **Unit rod**, bottom: n segments of a fixed width, so rod **length is proportional to value** (Cuisenaire). This is what lays into trenches.
4. **Color**, per value (below). It is the fourth cue and never the only one.

11–20: neutral fill `#efe9dc`, drawn **unit-for-unit**: two ten-frames of dots (the first full) and the rod wraps onto a second row of the same unit segments. No ten-rods or bundles before P3: every unit stays countable, and merge dots and carve chips leave from the visible face dots. 0 (Void): dashed outline, an empty dashed rod, no dots.

## 2. Palette
Values (Cuisenaire-inspired). Min pairwise ΔE (CIE76) under Machado-2009 simulation: protan 17.9, deutan 12.7, tritan 12.0. Every ink reaches ≥ 5.4:1.

| n | fill | ink | n | fill | ink |
|---|---|---|---|---|---|
| 0 | `#e9e5dc` | dark | 6 | `#24785a` dark green | white |
| 1 | `#fbfaf5` white | dark | 7 | `#3d4152` black/slate | white |
| 2 | `#f4826a` red | dark | 8 | `#8a5a2b` brown | white |
| 3 | `#9be08a` light green | dark | 9 | `#4f9be8` blue | dark |
| 4 | `#e7a6dc` purple-pink | dark | 10 | `#ff9f1c` orange | dark |
| 5 | `#f7e35a` yellow | dark | 11–20 | `#efe9dc` two ten-frames | dark |

Dark ink `#1d1f2e`, white `#ffffff`. Every block has a 2 px ink outline, so 1-white reads on the cream floor.
World: floor `#f4efe4`, wall `#5b6475`, axes `#3a3f4b`, exit `#06d6a0`, player `#ef476f`, operator `#dfe3ea`, door `#5b3aa8` (white text 8.0:1),
trench `#7a5c43` / lip `#5a4231`, tick pad `#1f7a6d` (white 5.2:1), sign `#f1e2c2` (ink 12.7:1).
Lanes (declaration order): `#3fb8c9`, `#c77dff`, `#e0a43a`, a hue family outside the value palette, never the only cue (hatching + shape glyph).

## 3. Glyphs
- **Number block**: rounded square. **Operator**: round token with a thick `+` cross or a symmetric `−` bar. The bar has no arrow tip, so it can't read as a direction. Shape tells numbers from operators without color.
- **Trench `o`**: a sunken channel. Runs join across cells, and each cell has one dashed unit hole you can count. When filled, each cell holds one unit cube in the filler's value color with one dot.
- **Tick pad `^`**: teal disc with "+1" and one dot. Once used it stays as a grey dashed ring with "+1", so you can see it is spent (undo restores it).
- **Door, plain**: numeral + n empty white dot slots. **Door, equation**: tokens drawn left to right, `□` is a hollow box (the block you bring) and `-` shows as `−`.
  It always hangs on a sign (the door face shows a big `□`), and **every number on the sign carries its own dots** underneath, each lane shape its live total (or `?`). The goal reads at a glance before any bump, and no sum is computed by the renderer.
  Sign placement (`signBox` in fx.js): all signs are laid out together once per state (no frame jitter), in door-id order, each avoiding the ones before it. Candidates: above/below (centered or flush), beside the door (sideways post), one row further out; then fonts 14 and 12. Cost = cells covered by sign + post: E and other signs 1000, blocks/doors 20, player, trenches and pads 10, lane cells 1. A sign never covers E or another sign while any spot avoids them.
- **Gate** (an equation with no `□`): a portcullis. Shut = purple face with white bars. Open = the bars lift into a strip at the top, the frame turns dashed and the floor shows through (it is passable). Lift/drop takes 200 ms.
  **Held** (open only because something stands in it while its equation is false): the bars come down a quarter onto the occupant with spiked tips, the frame is solid, and yellow zigzag strain marks sit at both jambs (they tremble, static under reduced motion). Never confusable with a true gate's dashed, clear frame.
- **Lane**: a tinted stripe with hatching, `—` for rows and `|` for columns, so a crossing cell is cross-hatched and reads as part of both. A tag on the wall cell at the axis edge (rows: x = 0, beside the y-axis; columns: the bottom row, beside the x-axis) reads `△=5` with that many dots, or `△=?` when the lane holds an operator.
- **Balance scale** (not-equal bump): a plate next to the door with left and right pans for `sides[0]` and `sides[1]`. Each pan holds one dot per unit (5 to a row, teens too) and its numeral.
  The heavier side sinks. A side that can't be built yet (NaN: it would go below 0) shows `?` and **rises**, lighter than anything. A level beam only ever means equal; if both sides are `?` the beam is dashed.
- **Why-bubbles** (scale, deficit ghost, socket, zero-fill) try above, below, right, left and take the spot that stays on the canvas and covers the fewest other pieces and other doors' signs. The bumped block and the player weigh 50× (covered only if every spot would). The renderer can't know which piece is needed next, so it protects all of them equally.

## 4. Motion (all ≤ 600 ms, never blocks input; ×0.5 under reduced motion)
| Event | Visual | ms |
|---|---|---|
| move/push | slide | 110 |
| merge | a's dots fly in an arc into the result, one at a time; operator bursts into sparkles; result squashes | 60 + ≤40/dot (≤300 total) + 180 ≤ 540 |
| carve | subtrahend's dots chip off and fall as pebbles; result squashes | ≤40/chip + 240 |
| tick | "+1" floats up, ring pulse, block squash | 500 |
| fill | unit cubes drop into trench cells one by one | ≤50/cell + 150 |
| open | dots drop into slots (plain) or onto the equation, then the door slides up | ≤40/dot + 120, +200 slide |
| bounce | rubbery wobble on the bumped block or door (half amplitude for zero-fill) | 400 |
| bounce `socket` (operator into a door) | hollow dashed block-shaped □ ghost: the door wants a number block | lingers |
| bounce `zero-fill` | "0 fills 0 holes" plate + empty dashed rod on the trench | lingers |
| bounce `gate` (key at a gate) | the gate's live balance scale (gates listen to their lanes, not keys) | lingers |
| block pushed into E (engine: `wall` at an E tile) | boing + block wobble + the star squashes and stretches (skipped under reduced motion) | 400 |
| bounce `gates` (exit refused) | every false gate pulses a yellow frame at 2 Hz (static under reduced motion) | lingers |
| gate open / close | bars lift / drop; open = consonant fifth, close = soft two-note step down | 200 |
| win | 3–4 note jingle + confetti puff | 1500 (level end, per fun-principles §3) |

Dot stagger is `min(40, budget/n)`, so big numbers stay countable without passing 600 ms.
**Explanations linger**: the deficit ghost (hollow dots for `missing`), the extra ghost (rod in the trench, `extra` units in dashed outline sticking out) and the balance scale animate in ≤ 300 ms. They then stay until the next input, because a 6-year-old needs time to read "why".

## 5. Sound
Pitch rises with value (`220·2^(n/12)`). Merge: clicks stepping up, then a tone at the result. Carve: ticks stepping down, then a tone at the result. Open: rising plinks, then a consonant fifth (the sides balance). Bounce and wrong door: a rubber "boing", never a buzzer. Undo: reverse whoosh.
Mute: the ♪ button or the `M` key. Its state persists (try/catch localStorage), and a diagonal slash plus `aria-pressed` mark muted.

## 6. Accessibility rules
- Never color alone: value = numeral + dots + rod length; operator = glyph + round silhouette; spent pad = dashed ring.
- Text ≥ 4.5:1 everywhere the player must read (the spent pad is intentionally dim, and its dashed shape carries the meaning).
- Reduced motion: no slide, wobble, squash, pulse or confetti; dots still fly and fall at half duration. The `∿` button next to mute toggles it (`aria-pressed`, persisted); with no saved choice it follows `prefers-reduced-motion`.
- The board scales (CSS) to fit the window with cells never below 48 px; on wide screens the buttons sit beside it. At 1100×720 that leaves room for **≤ 12 rows**.
- Restart (`⟳` / `R`) is undoable: it goes onto the history like a move.
- No flashing above 3 Hz. Sound is never required: every cue has a visual twin.
- Touch targets ≥ 56 px; one step per key press.

## P3 pieces (×, ÷, bundling)
- **Platform a×b**: one slab, `shape[0]` rows × `shape[1]` cols of unit cubes (one per cell, one dot each), the value on a single tab. No row totals and no `+`, because an array is not repeated addition. A × lays its rows down one at a time, with one note per row.
- **Ten-rod**: one orange 10-notch bar in one cell, with loose ones beside it. **Pebble**: round, not square, so its silhouette alone tells it apart from a plain 1. **Void**: the dashed 0 block.
- **Glyphs**: `×` is a turned `+`, and `÷` is a bar with a dot on each side. A share fans out from the dividend's cell, and a rotate swings about the anchor.
- **Tiles**: an area pit `_` is slate blue (a trench is brown). A pivot `r` is a post with a turn arrow. A bundle pad `b` is an orange pad showing 10 dots and a strap.
- **Sockets** are dark holes whose outline is the one attribute they read: `|` a dashed rod (shape), `v` a dashed square with 0 (value), `p` a dashed pebble (flag). A refusal shows that same hole in a bubble.
- **÷0 storm**: a puffy grey cloud with dizzy eyes floats above the 0. It never shows 0 or ∞, has no bolts and never flashes. Its whoosh goes down, never a buzzer, and it is still in reduced motion.
- **Ghosts**: no-room shows the whole result as dashed cells. A pit shows its empty cells hollow and the overhang solid. Blocked shows bump lines on the stuck cell.

## Exact values and Craft (2026-10-21)
- **Anti-block (−n)**: n's face punched out. It is a cream dent with a rim in n's colour, a shaded top lip and no drop shadow. It has hollow ring dots and a hollow rod at the very spots n's dots and rod sit, so a 2 drops into a −2's holes. The numeral uses a true `−`. It never uses a dashed outline, which stays the Void's.
- **Exact non-whole (`show`)**: a neutral face with the whole units as dots and rod segments, plus one pie-slice dot and a partial rod segment, so length stays ∝ value. `fraction` stacks the numerator over the denominator. `decimal` reads `3.5` / `0.3̅` (formatted by `core/value.js`). The default remainder mode stays shares + round pebbles.
- **not-whole** (trench or fire): the bubble shows what fits, one solid unit cube with one dot.
- **Craft land**: a −n pit is n ledges stepping down, with n hollow unit rings (the anti-block's language). A + block sits on an earth mound, so it reads as raised land (a hill is just the block left standing).
- **Fire**: warmth is the flame's height, the glow's reach and one ember dot per unit (HUD too). Feeding flares it and throws sparks.
- **Time**: a sun or crescent moon, plus a day track (amber day, blue night, white dot = now). The last 8 day moves turn the field amber, and night is a blue shade with a clear circle as wide as the warmth.
- **Creature**: a purple `?` blob that glances aside, with its equation on a post sign (dots under each number). A hop arcs it to its new spot and leaves a puff. A tame sends up hearts, and the pet smiles.
- **Craft bumps** linger until the next input: the bumped piece wobbles, no-room shows the full ghost result, and a full bag flashes its frame once.
