// Who you can play (docs/characters.md). Read by the renderer for the intro card and the HUD; movement lives in core/world.js MOVERS.
// Trivia keeps history's imperfections on purpose. Matho fact-checks every line.
export const CHARACTERS = {
  tally: {
    name: 'The Tally-Keeper', move: 'One step at a time.', color: '#c97b4a',
    trivia: 'The Ishango bone from the Congo is about 20,000 years old and carved with groups of notches. It may be one of the first counting tools — nobody knows for sure.',
  },
  euclid: {
    name: 'Euclid', move: 'Slides until something is in the way.', color: '#d1495b',
    trivia: 'His book Elements was taught for about 2,000 years, yet we know almost nothing about his life. His very first proof assumes two circles cross — something his own rules never promised.',
  },
  pythagoras: {
    name: 'Pythagoras', move: 'Leaps 2 squares, over anything. Leap across a sign and its two neighbours join, like a bracket.', color: '#edae49',
    trivia: 'Halve a string and it sings the same note, higher: 2 to 1. Babylonian scribes knew "his" triangle rule 1,000 years before him. Old stories say his followers refused to eat beans.',
  },
  brahmagupta: {
    name: 'Brahmagupta', move: 'Flips a number to its opposite, and + to −.', color: '#00798c',
    trivia: 'In 628 he wrote some of the first rules for zero as a number, and rules for negatives, calling them "debts" and "fortunes". He also said 0 ÷ 0 = 0. That one was wrong.',
  },
  zeno: {
    name: 'Zeno', move: 'Goes half the way to whatever is ahead (rounded up: half of 5 is 3).', color: '#6a4c93',
    trivia: 'He argued nothing can ever move: to arrive you must first go halfway, then half of what is left, forever. On a grid, he gets there anyway.',
  },
};
