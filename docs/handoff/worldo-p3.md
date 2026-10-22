# Worldo: P3 as insights (design note, 2026-10-21)

Source: `docs/curriculum.md` §6, `docs/handoff/axio-p3.md`. 13 levels instead of 19 slots. Each one breaks one belief. None is solved by walking, and none needs two routes. They are built in `levels/fields.js` as L27–L39 (Sandbox moves to L40). **Form** is how the field gets used, so the levels vary in shape as well as in thought (CEO, 2026-10-21).

| L | The assumption it breaks | Verb | Form | Sketch |
|---|---|---|---|---|
| 27 Same Two Numbers | "× is just a bigger +" | ×, + | bridge | A 4-tall, 3-wide gap and door 7. 4×3 bridges the gap. 3+4 makes the 7-block, which bounces off the gap. |
| 28 Turn to Pass | "A turned field is a different amount" | rotate | turn to pass | A 2×4 field can't drop through a 2-wide gap. The pivot turns it to 4×2, and door 8 still opens. |
| 29 The Low Tunnel | "If it doesn't fit, it's the wrong number" | × | route by shape | The 3-tall 3×4 jams a 2-tall tunnel to door 12. The 2×6 is also 12, and it slides through. |
| 30 Nothing Times | "×0 leaves it alone, like +0" | read doors | equation doors | Two doors, "4 × 0 = □" then "4 + 0 = □", and one 4 and one 0. Bringing the 4 to the first door shows 0 vs 4. |
| 31 Long Is Not Big | "Longer-looking is more" | ×, axes | clear the row | A 1×6 strip spans 6 ticks on the door-8 row and bounces off the door. Shove it aside with a 2×4. |
| 32 Weighing a Field | "A lane counts blocks or cells" | lanes + field | lane total | Gates `△ × 3 = 12` and `○ = 4`. A 2×2 counts 4, and at the crossing it counts in both lanes. |
| 33 Three of Twelve | "÷ makes one smaller thing" | ÷, trench | fill trenches | 12÷3 bursts into three 4s. Two trenches and a door need all three. |
| 34 Divide by One | "÷ always shrinks" (rest) | ÷1 | jam | A ÷ blocks the hall in front of the 10-field. ÷2 gives two 5s that the door refuses. ÷1 keeps the 10. |
| 35 Keep the Pebble | "A leftover is a decimal, or trash" | ÷ remainder | plug | 7÷2 gives 3, 3 and a pebble. Only the pebble plugs the hole down to door 3. |
| 36 Small Shared by Big | "You can't share small by big" | ÷, − | plug + door 0 | 3÷6 makes Voids and pebbles. 6÷3 and 6−3 make 3s that fit nothing, and 3−6 bounces. *Negation echo.* |
| 37 No Answer | "÷0 = 0" | ÷0, slots | rebuild the line | The slots drop in as 5÷0, which storms. One 0 plugs only one of two Void holes, so swap the slots to 0÷5 for five Voids. *Negation: no answer is not zero.* |
| 38 Ten in One | "Bundling changes the amount", "more pieces = more" | bundle, + | shape to pass | The 2×5 rides the pad into a rod that fits the 1-wide shaft. Then rod + 3 = 13. The 3×3 bait is only 9. |
| 39 Every Hole Names Its Kind | "The goal tells you the number" (master) | all | ordered shaft | The Void, pebble and rod holes sit in one shaft, then door 3. Plan the order: the 2×5 bundles inside the shaft, so the Void and the pebble have to go down first. |

**Rules held.** No level uses a rod − n (it bounces `bundled`, which would teach a false "can't"; unbundling is P6). Every route leaves spawn room (`no-room` must never be hit). Mixed +/× chains don't appear as bait, because their bounce teaches nothing true yet. A13's ÷0 bait was dropped to keep the solver under its cap, and L37 owns the storm.

## Matho slots merged or cut
- **P3-1 + P3-2 → A1.** Both teach that "× makes a flat field". The pit practice adds no new thought.
- **P3-3 → A2, P3-4 → A3.** Kept as two levels. "Turning keeps the amount" and "shape ≠ amount" are different beliefs.
- **P3-6 + P3-7 → A5.** ×1 and the strip bait both break "looks bigger / × grows".
- **P3-8 cut.** It combines ×0 and ×1, two thoughts A4 and A5 already force. Its both-sides doors would be a repeat.
- **P3-9 + P3-16 → A6.** One lane level. The new thought is that a lane reads a field's value. Solving for △ alone repeats S11.
- **P3-11 + P3-15 → A8.** The ÷1 identity becomes the rest beat. P3-15's door 10 by "2×5 or 10÷1" was a filler choice.
- **P3-17 + P3-18 → A12.** Bundling, and the bait that more pieces means more, sit in one arc.
- **P3-19 → A13**, refocused on working backward from what kind of block a socket asks for.
