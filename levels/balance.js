// Balance (Worldo): S2 equality, the = lock (L6-L8).
// Imported in play order by levels/levels.js; schema notes are there.
export default [
  {
    name: 'Both Sides Weigh',
    skill: 'S2 lock, target on the left',
    beat: 'introduce',
    misconception: '"= means the answer comes next": the 8 (6+2) tips the scale 6 vs 10',
    choice: 'which road: the 4 or the 8 for 6 = □+2',
    map: [
      '#############',
      '#EB.8.@.4.AE#',
      '#############',
    ],
    doors: { A: '6 = □+2', B: '6 = □+2' },
  },
  {
    name: 'The Answer Is Not Next',
    skill: 'S2 lock twist: 7 = □+3',
    beat: 'twist',
    misconception: '"= means the answer comes next": building 7+3=10 tips the scale (7 vs 13)',
    choice: 'push the free 7+3 (builds the wrong 10) or fetch the 4',
    map: [
      '###########',
      '#@7+3...AE#',
      '#.....4.###',
      '#.......###',
      '###########',
    ],
    doors: { A: '7 = □+3' },
  },
  {
    name: 'Tip the Scale',
    skill: 'S2 both sides + S1 echo',
    beat: 'rest',
    misconception: '"the number after = is the answer": bringing the 7 (2+5) shows 7 vs 11',
    choice: 'which road: tick the 2 (makes 3) or the 6 (makes 7, the left total)',
    map: [
      '###############',
      '#EA^2..@..6^BE#',
      '###############',
    ],
    doors: { A: '2+5 = □+4', B: '2+5 = □+4' },
    teaches: ['tick'],
  },
];
