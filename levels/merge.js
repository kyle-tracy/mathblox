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
      '#........####',
      '#############',
    ],
    doors: { A: 8 },
    teaches: ['merge'],
  },
  {
    name: 'Nothing Changes',
    skill: 'S4 Void: a + 0 = a',
    beat: 'twist',
    misconception: '"adding always makes bigger" / "zero is nothing": [5][+] alone bounces at the socket; 5+2 shows 7 vs 5',
    choice: 'fill the socket after + with the 0 or the 2',
    map: [
      '#########',
      '#.5+.AE##',
      '#.##.####',
      '#..0.2..#',
      '#@......#',
      '#########',
    ],
    doors: { A: 5 },
    teaches: ['merge'],
  },
];
