// The ONLY module that knows what a value is, and the only one that builds or changes math attributes.
// A block is { value, shape?: [rows, cols], tens?, pebble? }; no shape means 1×1. What a value IS lives in value.js
// (exact rationals today); later domains (vectors, matrices) add cases there and rows to OPS, not rewrites.
import { add, sub, mul, div, isNat, isInt } from './value.js';
// Each row takes operand blocks and returns { ok, event, out: [blocks] } or { ok: false, reason }.

// a×b = a rows of b. Shape and value are set together, so no 3×4 can be worth 13. ×0 is a Void, never [a, 0].
export const platform = (r, c) => (r * c === 0 ? { value: 0 } : r === 1 && c === 1 ? { value: 1 } : { value: r * c, shape: [r, c] });
export const rotate = b => (b.shape ? { ...b, shape: [b.shape[1], b.shape[0]] } : b);
// Ten loose units become one ten-rod; the value never changes. Unbundling is P6.
export const bundle = b => (b.value === 10 && !b.tens ? { value: 10, tens: 1 } : null);
export const isRod = b => b.value === 10 && b.tens === 1 && !b.shape;
// Each socket reads one attribute (CEO ruling): '|' a ten-rod, 'v' the value 0, 'p' the pebble flag.
export const SOCKETS = { '|': ['rod', isRod], v: ['void', b => b.value === 0 && !b.shape], p: ['pebble', b => !!b.pebble] };

const done = (event, out) => ({ ok: true, event, out });
// An identity's result: the operand's math attributes only (never its id or place).
const same = b => ({ value: b.value, ...(b.shape && { shape: b.shape }), ...(b.pebble && { pebble: true }), ...(b.show && { show: b.show }) });
const plain = b => isNat(b.value) && !b.shape && !b.tens; // a loose natural number: × builds its array
// Every legal combination resolves (commissioner): only ÷0 refuses. Values are exact (value.js);
// an op that leaves the naturals (3 − 5, 7 ÷ 2, a platform × 3) gives one plain block with the exact value.
export const OPS = {
  // A sum is one plain block (a platform's shape is lost, its value kept); + of naturals carries tens.
  '+': (a, b) => { const tens = isNat(a.value) && isNat(b.value) ? (a.tens ?? 0) + (b.tens ?? 0) : 0; return done('merge', [{ value: add(a.value, b.value), ...(tens && { tens }) }]); },
  '-': (a, b) => done('carve', [{ value: sub(a.value, b.value) }]), // 3 − 5 is a real −2
  // ×1 and 1× are true identities: a platform keeps its shape. Two loose naturals build a rows of b.
  '×': (a, b) => (a.shape && b.value === 1 && !b.shape ? done('multiply', [same(a)]) : b.shape && a.value === 1 && !a.shape ? done('multiply', [same(b)])
    : plain(a) && plain(b) ? done('multiply', [platform(a.value, b.value)]) : done('multiply', [{ value: mul(a.value, b.value) }])),
  // ÷ is always exact; the level's `div` domain sets how it shows (never the block's place). ÷0 storms.
  // 'remainder' (default): share natural a among n, n equal blocks of q plus r whole pebbles; 0 ÷ n = n Voids.
  // 'fraction' / 'decimal', or operands outside the naturals: one block of the exact value, `show` for the renderer.
  '÷': (a, b, mode = 'remainder') => {
    if (b.value === 0) return { ok: false, reason: 'storm' };
    if (b.value === 1 && !b.shape) return done('share', [same(a)]); // ÷1 is a true identity: shape and value kept
    if (mode === 'remainder' && isNat(a.value) && plain(b)) {
      const q = Math.floor(a.value / b.value), r = a.value % b.value;
      return done('share', [...Array(b.value)].map(() => ({ value: q })).concat([...Array(r)].map(() => ({ value: 1, pebble: true }))));
    }
    const v = div(a.value, b.value);
    return done('share', [{ value: v, ...(!isInt(v) && { show: mode === 'decimal' ? 'decimal' : 'fraction' }) }]);
  },
};

// Numbers or blocks in; for plain numbers (doors, tests) `value` is the first result's value.
export function apply(op, a, b, div) {
  const w = x => (typeof x === 'object' ? x : { value: x }), f = OPS[op];
  const r = f ? f(w(a), w(b), div) : { ok: false, reason: 'unknown-op' };
  return r.ok ? { ...r, value: r.out[0].value } : r;
}

export const equal = (a, b) => a === b;
export const tick = a => add(a, 1); // successor: Peano's first axiom, the toddler's "one more"

// Door locks. A number n means "□ = n"; a string is an equation like "7 = □+3" or "△ + 2 = 7".
// □ is the block you bring. Lane shapes (△ ○ ◇ …) are variables: each is the total of its lane.
// A door with no □ is a gate: it opens itself the moment its equation is true.
// Calculator precedence: × before + −, then left to right (÷ in doors is deferred).
export function checkDoor(spec, laneSyms = []) {
  if (typeof spec === 'number') return;
  const syms = [...spec.replace(/[\d+\-×=\s]/g, '')];
  const holes = syms.filter(c => c === '□').length;
  if (spec.split('=').length !== 2 || holes > 1 || !syms.length || syms.some(c => c !== '□' && !laneSyms.includes(c)))
    throw new Error(`bad door "${spec}": need one "=", at most one "□", known lane symbols, digits, + − ×`);
}

export const isGate = spec => typeof spec === 'string' && !spec.includes('□');

// env maps symbols to values, e.g. { '□': 4, '△': 5 }. A bare number is shorthand for { '□': v }.
export function sides(spec, env) {
  if (typeof env === 'number') env = { '□': env };
  if (typeof spec === 'number') return [env['□'], spec];
  return spec.split('=').map(side => {
    const t = side.replace(/\s/g, '').match(/\d+|[+\-×]|./gu), num = x => (/\d/.test(x) ? +x : env[x]);
    // Calculator precedence, as in chains: fold × first, then + − left to right.
    const fold = (xs, ops) => { const out = [xs[0]]; for (let i = 1; i < xs.length; i += 2) {
      if (!ops.includes(xs[i])) { out.push(xs[i], xs[i + 1]); continue; }
      const r = apply(xs[i], out.pop(), xs[i + 1]); if (!r.ok) return null; out.push(r.value);
    } return out; };
    const v = fold(fold(t.map((x, i) => (i % 2 ? x : num(x))), '×') ?? [NaN], '+-');
    return v ? v[0] : NaN;
  });
}

export const accepts = (spec, env) => equal(...sides(spec, env));
