// The ONLY module that knows what a value is, and the only one that builds or changes math attributes.
// A block is { value, shape?: [rows, cols], tens?, pebble? }; no shape means 1×1. Today: natural numbers.
// Later domains (negatives, fractions, vectors, matrices) add rows to OPS, not rewrites.
// Each row takes operand blocks and returns { ok, event, out: [blocks] } or { ok: false, reason }.

// a×b = a rows of b. Shape and value are set together, so no 3×4 can be worth 13. ×0 is a Void, never [a, 0].
export const platform = (r, c) => (r * c === 0 ? { value: 0 } : r === 1 && c === 1 ? { value: 1 } : { value: r * c, shape: [r, c] });
export const rotate = b => (b.shape ? { ...b, shape: [b.shape[1], b.shape[0]] } : b);
// Ten loose units become one ten-rod; the value never changes. Unbundling is P6.
export const bundle = b => (b.value === 10 && !b.tens ? { value: 10, tens: 1 } : null);
export const isRod = b => b.value === 10 && b.tens === 1 && !b.shape;

const done = (event, out) => ({ ok: true, event, out });
// −, × and ÷ on a ten-rod would unbundle it, and unbundling is P6, so they bounce.
const rodIn = (a, b) => a.tens || b.tens;
export const OPS = {
  // A sum is one plain block (a platform's shape is lost, its value kept); + carries tens.
  '+': (a, b) => { const tens = (a.tens ?? 0) + (b.tens ?? 0); return done('merge', [{ value: a.value + b.value, ...(tens && { tens }) }]); },
  // Naturals only until negatives unlock: you can't carve more than is there.
  '-': (a, b) => (rodIn(a, b) ? { ok: false, reason: 'bundled' } : b.value > a.value ? { ok: false, reason: 'too-much', missing: b.value - a.value } : done('carve', [{ value: a.value - b.value }])),
  // A platform times a number would be a solid (3D): not before P5.
  '×': (a, b) => (rodIn(a, b) ? { ok: false, reason: 'bundled' } : a.shape || b.shape ? { ok: false, reason: 'shape' } : done('multiply', [platform(a.value, b.value)])),
  // Share a among b: b equal blocks of q plus r whole pebbles. 3÷6 = six Voids + 3 pebbles; ÷0 never resolves.
  '÷': (a, b) => {
    if (rodIn(a, b)) return { ok: false, reason: 'bundled' };
    if (b.shape) return { ok: false, reason: 'shape' };
    if (b.value === 0) return { ok: false, reason: 'storm' };
    const q = Math.floor(a.value / b.value), r = a.value % b.value;
    return done('share', [...Array(b.value)].map(() => ({ value: q })).concat([...Array(r)].map(() => ({ value: 1, pebble: true }))));
  },
};

// Numbers or blocks in; for plain numbers (doors, tests) `value` is the first result's value.
export function apply(op, a, b) {
  const w = x => (typeof x === 'number' ? { value: x } : x), f = OPS[op];
  const r = f ? f(w(a), w(b)) : { ok: false, reason: 'unknown-op' };
  return r.ok ? { ...r, value: r.out[0].value } : r;
}

export const equal = (a, b) => a === b;
export const tick = a => a + 1; // successor: Peano's first axiom, the toddler's "one more"

// Door locks. A number n means "□ = n"; a string is an equation like "7 = □+3" or "△ + 2 = 7".
// □ is the block you bring. Lane shapes (△ ○ ◇ …) are variables: each is the total of its lane.
// A door with no □ is a gate: it opens itself the moment its equation is true.
// Same-precedence ops read left to right; + − and × never share a side (÷ in doors is deferred).
export function checkDoor(spec, laneSyms = []) {
  if (typeof spec === 'number') return;
  const syms = [...spec.replace(/[\d+\-×=\s]/g, '')];
  const holes = syms.filter(c => c === '□').length;
  if (spec.split('=').length !== 2 || holes > 1 || !syms.length || syms.some(c => c !== '□' && !laneSyms.includes(c)))
    throw new Error(`bad door "${spec}": need one "=", at most one "□", known lane symbols, digits, + − ×`);
  if (spec.split('=').some(side => /[+\-]/.test(side) && side.includes('×')))
    throw new Error(`bad door "${spec}": mixed + − and × on one side (precedence is P4)`);
  // Until negatives unlock, − may only be the last op on a side: 3 − 5 + 4 is 2, but its
  // left-to-right middle step (3 − 5) can't be built in the naturals.
  if (spec.split('=').some(side => /-.*[+\-]/.test(side)))
    throw new Error(`bad door "${spec}": − must be the last operation on its side (no negatives yet)`);
}

export const isGate = spec => typeof spec === 'string' && !spec.includes('□');

// env maps symbols to values, e.g. { '□': 4, '△': 5 }. A bare number is shorthand for { '□': v }.
export function sides(spec, env) {
  if (typeof env === 'number') env = { '□': env };
  if (typeof spec === 'number') return [env['□'], spec];
  return spec.split('=').map(side => {
    const t = side.replace(/\s/g, '').match(/\d+|[+\-×]|./gu), num = x => (/\d/.test(x) ? +x : env[x]);
    let acc = num(t[0]);
    for (let i = 1; i < t.length; i += 2) {
      const r = apply(t[i], acc, num(t[i + 1]));
      if (!r.ok) return NaN; // that side can't be built in this world yet
      acc = r.value;
    }
    return acc;
  });
}

export const accepts = (spec, env) => equal(...sides(spec, env));
