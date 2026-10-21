// Merge (Worldo): S3 part-part-whole and S4 Void (L9-L10).
// Imported in play order by levels/levels.js; schema notes are there.
export default [
  {
    name: 'Many Ways to Eight',
    skill: 'S3 merge, part-part-whole, multi-path door (2+6 or 4+4)',
    beat: 'practice',
    misconception: '"there is one right pair" (2+4 shows 6 vs 8)',
    choice: 'which pair to merge: 2+6 or 4+4',
    map: [
      '#############',
      '#@...+....AE#',
      '#.24###46####',
      '#.........###',
      '#############',
    ],
    doors: { A: 8 },
    teaches: ['merge'],
  },
  {
    name: 'Nothing Changes',
    skill: 'S4 Void: a + 0 = a',
    beat: 'twist',
    misconception: '"adding always makes bigger" / "zero is nothing": 5+0 stays 5 and opens the 5-door; 5+2 shows 7 vs 5 (3+2 shows 5 vs 3)',
    choice: 'which locked sum gets the one 0: 5+0 for the top 5-door or 3+0 for the bottom 3-door',
    map: [
      '##########',
      '###E######',
      '###A######',
      '#5+......#',
      '###.0.2@.#',
      '#3+......#',
      '###B######',
      '###E######',
      '##########',
    ],
    doors: { A: 5, B: 3 },
    teaches: ['merge'],
  },
];
