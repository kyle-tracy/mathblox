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
export const tick = a => a + 1; // successor: Peano's first axiom, the toddler's "one more"

// Door locks. A number n means "□ = n"; a string is an equation like "7 = □+3" or "△ + 2 = 7".
// □ is the block you bring. Lane shapes (△ ○ ◇ …) are variables: each is the total of its lane.
// A door with no □ is a gate: it opens itself the moment its equation is true.
// Same-precedence ops read left to right (only + and − exist yet).
export function checkDoor(spec, laneSyms = []) {
  if (typeof spec === 'number') return;
  const syms = [...spec.replace(/[\d+\-=\s]/g, '')];
  const holes = syms.filter(c => c === '□').length;
  if (spec.split('=').length !== 2 || holes > 1 || !syms.length || syms.some(c => c !== '□' && !laneSyms.includes(c)))
    throw new Error(`bad door "${spec}": need one "=", at most one "□", known lane symbols, digits, + and −`);
}

export const isGate = spec => typeof spec === 'string' && !spec.includes('□');

// env maps symbols to values, e.g. { '□': 4, '△': 5 }. A bare number is shorthand for { '□': v }.
export function sides(spec, env) {
  if (typeof env === 'number') env = { '□': env };
  if (typeof spec === 'number') return [env['□'], spec];
  return spec.split('=').map(side => {
    const t = side.replace(/\s/g, '').match(/\d+|[+\-]|./gu), num = x => (/\d/.test(x) ? +x : env[x]);
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
