# Craft loop (Psycho, 2026-10-21; proposal for QC to filter)

**Core opinion:** Craft time is **turn-based**. The world Ticks only when you act, as the puzzles do. That gives us survival without a clock: no real-time pressure, and no "come back tomorrow."

## 1. Loops: what does a kid want next?
- **5-minute loop:** *see* a want (a shiny block across a pit, a shy "?" creature, a fire that is too small). Then *gather* (carve rocks, pick up numbers), *make the exact value* (merge, carve), and *place it* (fill a pit, feed a recipe, feed the fire). The world visibly changes, and a new want appears just past it. The next want is always **in view**, never in a menu.
- **1-hour loop:** a few days and nights. You grow camp from a fire into a hut (an array floor) and then a workshop (a recipe scale). You tame one helper, push the frontier one landmark further along the axis, and add 1–2 oddities to the Museum (idea C). The want at this scale is "what's past the next hill?" and "what weird thing can I make?"
- **Hook ladder (SDT):** competence = making exact values. Autonomy = choosing which want to chase. Relatedness = the helper creature and co-op (idea D).

## 2. Tutorial → craft bridge
| Puzzle world | Verb learned | Craft ability unlocked |
|---|---|---|
| Meadow L1–5 | Tick, Merge | pick up, stack, and merge resources; feed the fire |
| Balance L6–8 | = Lock | crafting scale (recipes) and filling pits |
| Merge L9–10 | big sums | carrying bundles: a 10-block is one item |
| Carve L11–17 | − and anti-blocks | mining (carve number-rocks); the Mirror Lands gate |
| Lanes L18–26 | △ equations | taming "?" creatures |
| Fields L27–39 | × Array | building floors, bridges, and walls |
| later | ÷ Share | harvest splits and fractions (ages 8+) |
- **When the world opens:** **early**, right after Meadow, as a small fenced yard around camp. Every finished puzzle world removes one fence. Puzzle rooms then *become caves* in the overworld: optional and replayable, and each cave grants its verb. Don't make a 6-year-old finish 39 levels before the promised game starts.

## 3. Survival stakes: keep, change, or kill
- **Land is a number:** KEEP. This is the core of the game.
- **Axes are home, Mirror Lands:** KEEP. Rocks found farther out are bigger, which is content placement and does not violate attributes-not-location: a block carried home keeps its value. The Mirror Lands open only after Carve.
- **Trees Tick each day:** CHANGE. A "day" is in-game turns, **never the real-world clock**, because a real-time wait is an appointment dark pattern.
- **Harvest with ÷:** CHANGE. Harvest by carving at ages 6–7. ÷ shares arrive late as a bonus yield.
- **Crafting is an equation:** KEEP. Show the tool's silhouette next to a sum slot (dots plus a numeral) with no text.
- **Night "?" mimics:** CHANGE the tone. They are curious and shy, never chasers. An untamed one just wanders off. Taming one = making a friend.
- **÷0 storms:** CHANGE. A storm is telegraphed, a spectacle, and slow. It scatters loose blocks and destroys nothing. Shelter is fun to build.
- **− rivers dissolve things:** CHANGE to "a −2 river carves 2 off whatever floats across it": a tool, not a loss.
- **Warmth and dozing off:** KEEP. Warmth is the campfire's *value* (big fire = big number). It burns 1 per N turns. At 0 you doze and wake at camp with nothing lost. No dark-screen fear.
- **Rocket:** KEEP as the far goal. Show its silhouette at camp from minute 1.

## 4. Five fresh ideas
- **A. Helper pet:** the first tamed "?" follows you. Its body shows the value it ate, and it pushes for you (relatedness, plus a living number).
- **B. Blueprint ghosts:** a hut is a dotted 3×4 outline you fill. Area *is* the building permit.
- **C. Number Museum at camp:** display any block you made (−7, 7/2, 100). Collection is driven by experiments, never by rarity or drops (an anti-loot-box design).
- **D. Couch co-op (parent mode):** a second input controls the pet. A grown-up plays alongside without taking over.
- **E. Rule shrines (Baba-style):** a rare shrine flips one world rule for 20 turns (for example, every + becomes ×). This is the "make it break" playground the commissioner wants.

## 5. Smallest playable Craft prototype (fun in 2 minutes)
- **Map:** one side-scrolling strip about 3 screens wide. The visible x-axis runs along the ground, with camp at 0.
- **Verbs (3):** Push/Merge (+), Carve (−), Place (= fill a pit or feed the fire).
- **Need (1):** warmth. The fire starts at 3 and loses 1 every 8 moves. Feeding it a block adds that block's value, and the flames scale with the number (juice: crackle pitch rises with value).
- **Beat sheet:**
  - 0:00: the fire is dim. A 2-rock and a 3-rock sit nearby. Merge them, feed in 5, and the fire roars.
  - 0:40: a −3 pit blocks a big 9-rock. Carve 9 into 3 and 6, fill the pit with the 3, then push the 6 home.
  - 1:30: night falls, and a "?"+1=7 creature peeks in. Feeding it the 6 tames it (a stretch beat that can be cut).
- **Failure state:** feeding a wrong value is still warmth, never a penalty. Undo is always available.
- **Reuse:** the existing `step()`, pits/fillTrench, and lanes logic. The new part is a scrolling camera plus the fire's per-move counter.
- **Playtest signal:** does the kid go back to the fire *without being told*? If not, the need is too quiet.
