// The ONLY module that knows what a value is. Today: natural numbers.
// Later domains (negatives, fractions, vectors, matrices) add rows to OPS, not rewrites.

export const OPS = {
  '+': (a, b) => ({ ok: true, value: a + b }),
  // Naturals only until negatives unlock: you can't carve more than is there.
  '-': (a, b) => (b > a ? { ok: false, reason: 'too-much', missing: b - a } : { ok: true, value: a - b }),
};

export function apply(op, a, b) {
  const f = OPS[op];
  return f ? f(a, b) : { ok: false, reason: 'unknown-op' };
}

export const equal = (a, b) => a === b;
