// Sandbox (Worldo): free play, last in play order.
// Imported in play order by levels/levels.js; schema notes are there.
export default [
  {
    name: 'Sandbox',
    skill: 'free play (S1, S3, S4) with spare blocks; exit key by the door',
    beat: 'rest',
    misconception: 'none: no goal beyond play',
    choice: 'what to build before leaving (1+2+3+4 = 10 is possible)',
    map: [
      '#############',
      '#..9AE#######',
      '#.###########',
      '#...........#',
      '#.1+.2+.3+..#',
      '#.....@.....#',
      '#.4..+..0.^^#',
      '#...####....#',
      '#...oooo....#',
      '#############',
    ],
    doors: { A: 9 },
  },
];
