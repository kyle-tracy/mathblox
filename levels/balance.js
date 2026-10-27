// Balance (Worldo): S2 equality, the = lock (L2).
// Imported in play order by levels/levels.js; schema notes are there.
export default [
  {
    name: 'The Answer Is Not Next',
    solution: 'drdldrrrrrrrr',
    skill: 'S2 lock twist: 7 = □+3',
    beat: 'twist',
    difficulty: 2,
    misconception: '"= means the answer comes next": building 7+3=10 tips the scale (7 vs 13)',
    choice: 'the 4 for 7 = □+3 (top door) or the 5 for 7 = □+2 (bottom door); pushing the free 7+3 is bait',
    map: [
      '###########',
      '#@7+3...AE#',
      '#.....4.###',
      '#.5.....###',
      '#.......BE#',
      '###########',
    ],
    doors: { A: '7 = □+3', B: '7 = □+2' },
  },
];
