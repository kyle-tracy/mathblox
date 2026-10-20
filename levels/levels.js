// M0 levels. Each names the skill it teaches and the misconception it surfaces (Worldo's rule).
export const LEVELS = [
  {
    name: 'Same As',
    skill: 'equality: a door opens only for exactly its number',
    misconception: '"close enough" counts',
    map: [
      '#############',
      '#.........###',
      '#@.2......AE#',
      '#....4....###',
      '#.........###',
      '#############',
    ],
    doors: { A: 4 },
  },
  {
    name: 'Put Together',
    skill: 'addition as merging; 2+3 and 3+2 both make 5',
    misconception: 'you need a 5 block to make 5',
    map: [
      '#############',
      '#.........###',
      '#@.2.+..3.AE#',
      '#.........###',
      '#############',
    ],
    doors: { A: 5 },
    teaches: ['merge'],
  },
  {
    name: 'Take Away',
    skill: 'subtraction is ordered: build 7-3 (reads left to right); 3-7 bounces',
    misconception: 'subtraction works in any order',
    map: [
      '############',
      '#........###',
      '#@.-3....AE#',
      '#.7......###',
      '#........###',
      '############',
    ],
    doors: { A: 4 },
    teaches: ['carve'],
  },
];
