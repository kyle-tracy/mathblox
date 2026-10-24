// The world map (docs/superpowers/specs/2026-10-23-characters-world-design.md §3). Each world is a site on the
// Craft map holding puzzle levels (by name, from levels.js). Finishing a solo world recruits its hero.
// `needs`: heroes you must bring to reach the site. Pair worlds have no levels yet. Camp = Qualito's Tally tutorial (2026-10-23). The order of WORLDS and their levels IS the play order (levels.js).
export const WORLDS = [
  { id: 'camp', name: 'Camp', hero: 'tally', concept: 'counting, + and −', needs: [],
    levels: ['First Push', 'The Answer Is Not Next', 'Nothing Changes', 'The Missing Part', 'There and Back', 'The Box Counts', 'The Shrinking Side', 'Same to Both Sides', 'Two Triangles Again', 'Crossroads', 'Same Two Numbers', 'Three of Nine', 'No Answer'] },
  { id: 'alexandria', name: 'Alexandria', hero: 'euclid', concept: 'commutativity', needs: [],
    levels: ['Something to Stop On'] },
  { id: 'croton', name: 'Croton', hero: 'pythagoras', concept: 'associativity', needs: ['euclid'],
    levels: ['Leap Behind It'] },
  { id: 'ujjain', name: 'Ujjain', hero: 'brahmagupta', concept: 'negatives and zero', needs: ['pythagoras'],
    levels: ['A Debt Counts Twice'] },
  { id: 'elea', name: 'Elea', hero: 'zeno', concept: 'fractions and halving', needs: ['brahmagupta'],
    levels: ['Halfway There', 'Keep the Pebble', 'Small Shared by Big'] },
  { id: 'rotation', name: 'The Turning Court', concept: 'imaginary numbers: i² = −1', needs: ['brahmagupta', 'pythagoras'], levels: [] },
  { id: 'motion', name: 'The Racetrack', concept: 'speed, velocity, acceleration, limits', needs: ['euclid', 'zeno'], levels: [] },
  { id: 'distrib', name: 'The Market', concept: 'distributivity', needs: ['euclid', 'brahmagupta'], levels: ['Be Someone Else'] },
  { id: 'under', name: 'The Discrete Underground', concept: 'parity, mod, primes, graphs', needs: ['tally', 'pythagoras'], levels: [] }, // Tally's one return: parity
  { id: 'vectors', name: 'The Observatory', concept: 'vectors and distance', needs: ['euclid', 'pythagoras'], levels: ['A Friend Is a Wall'] },
  { id: 'series', name: 'The Endless Stair', concept: 'infinite series', needs: ['brahmagupta', 'zeno'], levels: [] },
  { id: 'dungeon', name: 'The Storm Keep', concept: 'limits: the ÷0 Storm', needs: ['pairs:2'], levels: [] }, // any 2 pair worlds done
];
