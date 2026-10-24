// The world map (docs/superpowers/specs/2026-10-23-characters-world-design.md §3). Each world is a site on the
// Craft map holding puzzle levels (by name, from levels.js). Finishing a solo world recruits its hero.
// `needs`: heroes you must bring to reach the site. Pair worlds have no levels yet. First-pass grouping (CEO); Worldo owns it.
export const WORLDS = [
  { id: 'camp', name: 'Camp', hero: 'tally', concept: 'counting, + and −', needs: [],
    levels: ['First Push', 'The Answer Is Not Next', 'Nothing Changes', 'The Missing Part', 'There and Back', 'Sandbox'] },
  { id: 'alexandria', name: 'Alexandria', hero: 'euclid', concept: 'commutativity', needs: [],
    levels: ['Something to Stop On', 'Same Two Numbers', 'Turn to Pass', 'The Low Tunnel', 'Weighing a Field'] },
  { id: 'croton', name: 'Croton', hero: 'pythagoras', concept: 'associativity', needs: ['euclid'],
    levels: ['Leap Behind It', 'The Box Counts', 'Take It Out', 'Two Triangles Again', 'Same to Both Sides', 'Crossroads', 'A Friend Is a Wall'] },
  { id: 'ujjain', name: 'Ujjain', hero: 'brahmagupta', concept: 'negatives and zero', needs: ['pythagoras'],
    levels: ['A Debt Counts Twice', 'The Shrinking Side', 'Nothing Times', 'No Answer', 'Be Someone Else'] },
  { id: 'elea', name: 'Elea', hero: 'zeno', concept: 'fractions and halving', needs: ['brahmagupta'],
    levels: ['Halfway There', 'Three of Nine', 'Keep the Pebble', 'Small Shared by Big', 'Ten in One', 'Every Hole Names Its Kind'] },
  { id: 'rotation', name: 'The Turning Court', concept: 'imaginary numbers: i² = −1', needs: ['brahmagupta', 'pythagoras'], levels: [] },
  { id: 'motion', name: 'The Racetrack', concept: 'speed, velocity, acceleration, limits', needs: ['euclid', 'zeno'], levels: [] },
  { id: 'distrib', name: 'The Market', concept: 'distributivity', needs: ['euclid', 'brahmagupta'], levels: [] },
  { id: 'under', name: 'The Discrete Underground', concept: 'parity, mod, primes, graphs', needs: ['tally', 'pythagoras'], levels: [] }, // Tally's one return: parity
  { id: 'vectors', name: 'The Observatory', concept: 'vectors and distance', needs: ['euclid', 'pythagoras'], levels: [] },
  { id: 'series', name: 'The Endless Stair', concept: 'infinite series', needs: ['brahmagupta', 'zeno'], levels: [] },
  { id: 'dungeon', name: 'The Storm Keep', concept: 'limits: the ÷0 Storm', needs: ['pairs:2'], levels: [] }, // any 2 pair worlds done
];
