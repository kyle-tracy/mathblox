// Bonus rooms (Worldo): optional Toad Houses beside the path map (core/map.js). Light, difficulty 1-3, existing verbs only.
// Imported by levels/levels.js; schema notes are there.
export default [
  // The Campfire. Parents: First Push (n fills n holes) + The Box Counts (parts make a whole).
  // The fire pit is a trench: each log fills as many holes as it is, so the fire grows by every number you feed it.
  {
    name: 'Feed the Fire',
    solution: 'uurrrrrdldrrrluullldldrrrrrrrrrllllluurdldrrrrrrrrrrr',
    skill: 'S1 echo: a pit of 8 filled in parts, 4 + 4',
    beat: 'echo',
    difficulty: 2,
    misconception: '"feed the biggest log first": the 5 leaves 3 holes and no log is 3 (the 4 bounces, one too long); 4 + 2 leaves 2 and spends the hearth\'s 2',
    choice: 'which logs add up to the pit: only 4 + 4 does (the 2 is the hearth\'s key); the gap left after each log says what it still wants',
    map: [
      '####################',
      '#........###########',
      '#.5.4.4.2###########',
      '#@.......ooooooooAE#',
      '#........###########',
      '####################',
    ],
    doors: { A: 2 }, // the hearth takes the last log: keep the 2 for it
  },
  // The Creature's Hut. Parents: The Box Counts (a lane is a total) + The Answer Is Not Next (□ + 3 balances 8).
  // The creature's box is already too full: it is tamed by taking out, not putting in.
  {
    name: 'Too Full to Be Tamed',
    solution: 'drrddrdrrrdd',
    skill: 'S11 echo: △ + 3 = 8 when the △ row already holds 4 + 3 + 2',
    beat: 'echo',
    difficulty: 2,
    misconception: '"to solve, add": the gate reads 12 vs 8 from the start; putting the 1 in makes it worse',
    choice: 'what to take out of the △ row: the 4 (3 + 2 = 5), or the 3 and the 2 and put the 1 in with the 4',
    map: [
      '############',
      '#@........#',
      '#.........#',
      '#..4.3.2..#',
      '#.........#',
      '#.1.......#',
      '#######A###',
      '#######E###',
      '############',
    ],
    lanes: { '△': { row: 3 } },
    doors: { A: '△ + 3 = 8' },
  },
];
