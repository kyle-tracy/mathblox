// The world map (docs/superpowers/specs/2026-10-23-characters-world-design.md §3). Each world is a site on the
// Craft map holding puzzle levels (by name, from levels.js). Finishing a solo world recruits its hero.
// `needs`: heroes you must bring to reach the site. Pair worlds have no levels yet. Camp = Qualito's Tally tutorial (2026-10-23). The order of WORLDS and their levels IS the play order (levels.js).
export const WORLDS = [
  { id: 'camp', name: 'Camp', hero: 'tally', kid: 'count, add and take away', concept: 'counting, + and −', needs: [],
    levels: ['First Push', 'The Answer Is Not Next', 'Nothing Changes', 'The Missing Part', 'There and Back', 'The Box Counts', 'The Shrinking Side', 'Same to Both Sides', 'Two Triangles Again', 'Crossroads', 'Same Two Numbers', 'Three of Nine', 'No Answer'] },
  { id: 'alexandria', name: 'Alexandria', hero: 'euclid', kid: 'swap the order, same answer', concept: 'commutativity', needs: [],
    levels: ['The Line Goes On', 'Fair From Either Side', 'Minus Reads Left to Right', 'Clear the Line'] },
  { id: 'croton', name: 'Croton', hero: 'pythagoras', kid: 'which two go first?', concept: 'associativity', needs: ['euclid'],
    levels: ['The Leap Is a Bracket', 'Either Plus First', 'Minus Minds the Order', 'Take Away Nothing', 'Dodge the Storm'] },
  { id: 'ujjain', name: 'Ujjain', hero: 'brahmagupta', kid: 'numbers below zero', concept: 'negatives and zero', needs: ['pythagoras'],
    levels: ['Turn One Over', 'Flip It Back', 'Full of Nothing', 'The Other Way Round'] },
  { id: 'elea', name: 'Elea', hero: 'zeno', kid: 'halves and shares', concept: 'fractions and halving', needs: ['brahmagupta'],
    levels: ['Ever Smaller Steps', 'Quarter Past Half', 'A Third of Nine', 'Half of What Is Left', 'Keep the Pebble', 'Small Shared by Big'] },
  { id: 'rotation', name: 'The Turning Court', kid: 'turning numbers', concept: 'imaginary numbers: i² = −1', needs: ['brahmagupta', 'pythagoras'], levels: [] },
  { id: 'motion', name: 'The Racetrack', kid: 'how fast things go', concept: 'speed, velocity, acceleration, limits', needs: ['euclid', 'zeno'], levels: [] },
  { id: 'distrib', name: 'The Market', kid: 'share a sum out', concept: 'distributivity', needs: ['euclid', 'brahmagupta'], levels: ['Be Someone Else', 'Owe the Whole Box', 'The Sign Carries It', 'Three for Every Piece'] },
  // Bonus rooms (Toad Houses): optional, beside the path, no reward yet (collectibles undesigned). Light no stone.
  { id: 'campfire', name: 'The Campfire', kid: 'feed the fire', concept: 'adding up', bonus: true, needs: [], levels: ['Feed the Fire'] },
  { id: 'hut', name: "The Creature's Hut", kid: 'what number does it want?', concept: 'missing numbers', bonus: true, needs: [], levels: ['Too Full to Be Tamed'] },
  { id: 'under', name: 'The Discrete Underground', kid: 'odd and even', concept: 'parity, mod, primes, graphs', needs: ['tally', 'pythagoras'], levels: [] }, // Tally's one return: parity
  { id: 'vectors', name: 'The Observatory', kid: 'how far and which way', concept: 'vectors and distance', needs: ['euclid', 'pythagoras'], levels: ['A Friend Is a Wall'] },
  { id: 'series', name: 'The Endless Stair', kid: 'steps that never end', concept: 'infinite series', needs: ['brahmagupta', 'zeno'], levels: [] },
  // The Storm Keep (spec 2026-10-27): a stepwell under the Road. Its landings open once all 4 heroes are recruited, whatever
  // party you bring (the rooms hand you each hero by change pads): upper tier in either order, lower tier, then the pool.
  // `host`: the hero who greets at a landing's door (not `hero`: a landing recruits nobody and lights no stone).
  { id: 'keep-euclid', name: "Euclid's Landing", host: 'euclid', kid: 'slide down the stairs', concept: 'limits: the ÷0 Storm', needs: ['heroes:4'], levels: ['Down the Stone Stairs'] },
  { id: 'keep-pythagoras', name: "Pythagoras's Landing", host: 'pythagoras', kid: 'which two make zero?', concept: 'limits: the ÷0 Storm', needs: ['heroes:4'], levels: ['Zero on Top'] },
  { id: 'keep-brahmagupta', name: "Brahmagupta's Landing", host: 'brahmagupta', kid: 'is 0÷0 really 0?', concept: 'limits: the ÷0 Storm', needs: ['done:keep-euclid', 'done:keep-pythagoras'], levels: ['Brahmagupta Trusts the Zero'] },
  { id: 'keep-zeno', name: "Zeno's Landing", host: 'zeno', kid: 'share by less and less', concept: 'limits: the ÷0 Storm', needs: ['done:keep-euclid', 'done:keep-pythagoras'], levels: ['Share by Less and Less'] },
  { id: 'dungeon', name: 'The Storm Keep', kid: 'calm the ÷0 Storm', concept: 'limits: the ÷0 Storm', needs: ['done:keep-brahmagupta', 'done:keep-zeno'], levels: ['Still Zero', 'The Last Share'] }, // the pool at the bottom
];
