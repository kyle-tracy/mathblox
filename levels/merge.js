// Merge (Worldo): S4 Void (L3).
// Imported in play order by levels/levels.js; schema notes are there.
export default [
  {
    name: 'Nothing Changes',
    solution: 'dddrrulurrrrrrurddldrrr',
    skill: 'S4 Void: a + 0 = a',
    beat: 'twist',
    misconception: '"adding always makes bigger" / "zero is nothing": the 5 is stuck behind its + in the nook; 0+5 frees it as a 5 that opens the 5-door, while 2+5 frees a 7 (7 vs 5)',
    choice: 'what to add to free the 5 unchanged: the 0 or the 2',
    map: [
      '#############',
      '#.........###',
      '#.@.......###',
      '#.........+5#',
      '#...0..2..###',
      '#.........AE#',
      '#.........###',
      '#############',
    ],
    doors: { A: 5 },
    teaches: ['merge'],
  },
];
