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
];
