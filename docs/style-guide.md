# MathBlox — Style Guide
Owner: Arto. Code: `game.js`. Visual QA: `?showcase&level=N` (`levels/showcase.js`), add `&moves=rrdl` to replay inputs.
Rule zero: **visuals carry the math, and the renderer computes none of it.** Every value drawn comes from the state or an event.

## 1. One quantity, three codes (curriculum §5 hook 3)
Every number block shows, on a 55 px face inside a 64 px cell:
1. **Numeral**, top, bold 19 px Verdana / DejaVu Sans (1 has a base and 7 has none; 6 and 9 are open and distinct).
2. **Dot face**, ten-frame 5-structure (6 = row of 5 + 1). Never scattered.
3. **Unit rod**, bottom: n segments of a fixed width, so rod **length is proportional to value** (Cuisenaire). This is what lays into trenches.
4. **Color**, per value (below). It is the fourth cue and never the only one.

Above 10: neutral fill `#efe9dc`, ones as dots, and each ten as an orange (`#ff9f1c`) ten-rod notched into 10 units. 0 (Void): dashed outline, an empty dashed rod, no dots.

## 2. Palette
Values (Cuisenaire-inspired). Min pairwise ΔE (CIE76) under Machado-2009 simulation: protan 17.9, deutan 12.7, tritan 12.0. Every ink reaches ≥ 5.4:1.

| n | fill | ink | n | fill | ink |
|---|---|---|---|---|---|
| 0 | `#e9e5dc` | dark | 6 | `#24785a` dark green | white |
| 1 | `#fbfaf5` white | dark | 7 | `#3d4152` black/slate | white |
| 2 | `#f4826a` red | dark | 8 | `#8a5a2b` brown | white |
| 3 | `#9be08a` light green | dark | 9 | `#4f9be8` blue | dark |
| 4 | `#e7a6dc` purple-pink | dark | 10 | `#ff9f1c` orange | dark |
| 5 | `#f7e35a` yellow | dark | >10 | `#efe9dc` + orange rods | dark |

Dark ink `#1d1f2e`, white `#ffffff`. Every block has a 2 px ink outline, so 1-white reads on the cream floor.
World: floor `#f4efe4`, wall `#5b6475`, axes `#3a3f4b`, exit `#06d6a0`, player `#ef476f`, operator `#dfe3ea`, door `#5b3aa8` (white text 8.0:1),
trench `#7a5c43` / lip `#5a4231`, tick pad `#1f7a6d` (white 5.2:1), sign `#f1e2c2` (ink 12.7:1).

## 3. Glyphs
- **Number block**: rounded square. **Operator**: round token with a thick `+` cross or a symmetric `−` bar. The bar has no arrow tip, so it can't read as a direction. Shape tells numbers from operators without color.
- **Trench `o`**: a sunken channel. Runs join across cells, and each cell has one dashed unit hole you can count. When filled, each cell holds one unit cube in the filler's value color with one dot.
- **Tick pad `^`**: teal disc with "+1" and one dot. Once used it stays as a grey dashed ring with "+1", so you can see it is spent (undo restores it).
- **Door, plain**: numeral + n empty white dot slots. **Door, equation**: tokens drawn left to right, `□` is a hollow box (the block you bring) and `-` shows as `−`.
  It is drawn on the door at 13 px if it fits in 56 px. Otherwise it goes on a sign above the door (below if the door is on the top row), and the door shows a big `□`.
- **Balance scale** (not-equal bump): a plate above the door with left and right pans for `sides[0]` and `sides[1]`. Each pan holds dots, ten-rods past 10, and its numeral.
  The heavier side sinks. A side that can't be built yet (NaN) shows `?` and the beam stays level.

## 4. Motion (all ≤ 600 ms, never blocks input; ×0.5 under reduced motion)
| Event | Visual | ms |
|---|---|---|
| move/push | slide | 110 |
| merge | a's dots fly in an arc into the result, one at a time; operator bursts into sparkles; result squashes | 60 + ≤40/dot (≤300 total) + 180 ≤ 540 |
| carve | subtrahend's dots chip off and fall as pebbles; result squashes | ≤40/chip + 240 |
| tick | "+1" floats up, ring pulse, block squash | 500 |
| fill | unit cubes drop into trench cells one by one | ≤50/cell + 150 |
| open | dots drop into slots (plain) or onto the equation, then the door slides up | ≤40/dot + 120, +200 slide |
| bounce | rubbery wobble on the bumped block or door | 400 |
| win | 3–4 note jingle + confetti puff | 1500 (level end, per fun-principles §3) |

Dot stagger is `min(40, budget/n)`, so big numbers stay countable without passing 600 ms.
**Explanations linger**: the deficit ghost (hollow dots for `missing`), the extra ghost (rod in the trench, `extra` units in dashed outline sticking out) and the balance scale animate in ≤ 300 ms. They then stay until the next input, because a 6-year-old needs time to read "why".

## 5. Sound
Pitch rises with value (`220·2^(n/12)`). Merge: clicks stepping up, then a tone at the result. Carve: ticks stepping down, then a tone at the result. Open: rising plinks, then a consonant fifth (the sides balance). Bounce and wrong door: a rubber "boing", never a buzzer. Undo: reverse whoosh.
Mute: the ♪ button or the `M` key. Its state persists (try/catch localStorage), and a diagonal slash plus `aria-pressed` mark muted.

## 6. Accessibility rules
- Never color alone: value = numeral + dots + rod length; operator = glyph + round silhouette; spent pad = dashed ring.
- Text ≥ 4.5:1 everywhere the player must read (the spent pad is intentionally dim, and its dashed shape carries the meaning).
- `prefers-reduced-motion`: no slide, wobble, squash or confetti; dots still fly and fall at half duration.
- No flashing above 3 Hz. Sound is never required: every cue has a visual twin.
- Touch targets ≥ 56 px; one step per key press.
