// The ONLY place that knows what a value is. Today: exact rationals, like a calculator that never rounds.
// An integer is a plain JS number; any other rational is the reduced string "n/d" (d > 1, sign on n),
// so values stay JSON-safe, solver-key-safe and comparable with ===. Vectors and matrices add cases here.
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
export const parts = v => (typeof v === 'number' ? [v, 1] : v.split('/').map(Number));
export const make = (n, d = 1) => {
  if (d < 0) [n, d] = [-n, -d];
  const g = gcd(n, d) || 1;
  return d / g === 1 ? n / g + 0 : `${n / g}/${d / g}`; // + 0 turns -0 into 0
};
const lift = f => (a, b) => { const [p, q] = parts(a), [r, s] = parts(b); return f(p, q, r, s); };
export const add = lift((p, q, r, s) => make(p * s + r * q, q * s));
export const sub = lift((p, q, r, s) => make(p * s - r * q, q * s));
export const mul = lift((p, q, r, s) => make(p * r, q * s));
export const div = lift((p, q, r, s) => make(p * s, q * r)); // callers handle ÷0 (the storm)
export const isInt = v => typeof v === 'number';
export const isNat = v => isInt(v) && v >= 0;
// How a value reads in 'decimal' mode: 7/2 -> "3.5", 1/3 -> "0.3̅", 1/6 -> "0.16̅" (the bar marks the repeat; the value stays exact).
export function decimal(v) {
  let [n, d] = parts(v), s = n < 0 ? '-' : '', digits = '';
  n = Math.abs(n); s += Math.floor(n / d); n %= d;
  const seen = new Map();
  while (n && !seen.has(n)) { seen.set(n, digits.length); n *= 10; digits += Math.floor(n / d); n %= d; }
  if (n) { const i = seen.get(n); digits = digits.slice(0, i) + [...digits.slice(i)].map(c => c + '\u0305').join(''); }
  return digits ? `${s}.${digits}` : s;
}
