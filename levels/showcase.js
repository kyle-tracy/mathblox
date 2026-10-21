// Visual-QA harness (Arto): small rooms that together contain every tile, block, door, and event.
// Play with ?showcase&level=N. Add &moves=rrdl (u/d/l/r) to auto-play inputs before a screenshot.
export const SHOWCASE = [
  {
    name: 'Palette', // moves=rurrrrrrrrrd: 9+5 -> 14 and 7+8 -> 15 (ten-rod fallback)
    skill: 'QA: blocks 0-10+, both operators',
    map: [
      '##############',
      '#0123456789..#',
      '#............#',
      '#@9+5......7.#',
      '#..........+.#',
      '#..........8.#',
      '#...........E#',
      '##############',
    ],
    doors: {},
  },
  {
    name: 'Trench and Tick', // moves=rrrr: tick 2 -> 3, fill 3 trench cells. moves=ddrr: too-long ghost
    skill: 'QA: trench, tick pad (fresh and spent), fill, too-long',
    map: [
      '#############',
      '#@2.^.ooo...#',
      '#...........#',
      '#.6.oooo....#',
      '#..^......E.#',
      '#############',
    ],
    doors: {},
  },
  {
    name: 'Doors', // moves=rrr: 4 at door 5. moves=ddrrrr: 3 at "7 = □+3". moves=dddddrrrr: 9 at the long sign door
    skill: 'QA: plain door, on-door equation, sign equation, not-equal scale',
    map: [
      '#############',
      '#@.4.A......#',
      '#...........#',
      '#..3..B.....#',
      '#...........#',
      '#...........#',
      '#..9..C....E#',
      '#############',
    ],
    doors: { A: 5, B: '7 = □+3', C: '2+□ = 3+5' },
  },
  {
    name: 'Carve and Win', // moves=r: deficit ghost. moves=ddr: carve. moves=ddrrrrrr: door opens. moves=ddrrrrrrrr: win. moves=ddddrrrr: plain door B opens
    skill: 'QA: too-much ghost, carve chips, door open, win',
    map: [
      '###########',
      '#@3-7.....#',
      '#.........#',
      '#.8-3..AE.#',
      '#.........#',
      '#.4+1.B...#',
      '###########',
    ],
    doors: { A: '□ = 5', B: 5 },
  },
  {
    // moves=r: lanes + crossing, gate B open, C shut, socket ghost (+ into A). moves=ddr: zero-fill. moves=dddddr: key at gate C.
    // moves=d: B opens. moves=drrrrdd: 3 leaves the △ lane, B closes. moves=drrrrrrrrrru: exit refuses, C pulses. moves=drrrrrrrddddr: 8 vs ◇+1 = ? (? side rises)
    name: 'Lanes and Gates',
    skill: 'QA: lanes, crossing, ? lane, gates open/shut/close, socket, zero-fill, gate, gates bounces',
    map: [
      '#############',
      '#@+A.......E#',
      '#....B......#',
      '#.0oo.......#',
      '#....3.4....#',
      '#......2....#',
      '#.5C.....8D.#',
      '#...3-1.....#',
      '#############',
    ],
    lanes: { '△': { row: 4 }, '○': { col: 7 }, '◇': { row: 7 } },
    doors: { A: 3, B: '△ = 7', C: '○ = 9', D: '□ = ◇ + 1' },
  },
  {
    // moves=rddrddrddrrrdllldr: 2×3 platform, 7÷3 shares + pebble, 0÷2 Voids, 9+1 bundled to a rod, then 5÷0 storm (lingers).
    name: 'P3 Parts',
    skill: 'QA: platform, ×÷ glyphs, shares, pebble, Voids, rod, bundle pad, pit, pivot, sockets, storm',
    map: [
      '##############',
      '#@2×3.....__.#',
      '#.........__.#',
      '#.7÷3........#',
      '#...........r#',
      '#.0÷2........#',
      '#............#',
      '#.9+1b...|vp.#',
      '#............#',
      '#.5÷0.......E#',
      '##############',
    ],
    platforms: [{ x: 7, y: 4, rows: 2, cols: 2 }],
    doors: {},
  },
];
