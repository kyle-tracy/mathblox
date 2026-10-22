// P3 core (Axio): × platforms, rotate, ÷ shares with pebbles, ÷0 storm, bundling, rod socket.
// Map glyphs: × ÷ operators, '_' pit cell, 'r' pivot post, 'b' bundle pad, '|' rod socket. level.platforms pre-places arrays.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { div, mul, decimal } from '../core/value.js';
import { OPS, platform, rotate, bundle, accepts, checkDoor } from '../core/math.js';
import { parseLevel, step, laneValues, DIRS } from '../core/world.js';
import { LEVELS } from '../levels/levels.js';
import { solve, key } from './solver.js';

const N = [...Array(11).keys()], B = v => ({ value: v });
const run = (lvl, moves) => moves.reduce((acc, d) => {
  const r = step(acc.state, d); return { state: r.state, events: [...acc.events, ...r.events] };
}, { state: parseLevel(lvl), events: [] });
const nums = s => s.objects.filter(o => o.kind === 'num');

test('× laws: a×b = b×a after a rotation; value is always rows·cols; ×1 keeps value; ×0 is a Void', () => {
  for (const a of N) for (const b of N) {
    const [p] = OPS['×'](B(a), B(b)).out, [q] = OPS['×'](B(b), B(a)).out;
    assert.deepEqual(rotate(p), q, `${a}×${b} turned is ${b}×${a}`);
    assert.equal(p.value, a * b);
    if (p.shape) assert.equal(p.shape[0] * p.shape[1], p.value, 'shape and value are one truth');
    assert.equal(rotate(p).value, p.value, 'turning never changes the amount');
    assert.equal(OPS['×'](B(a), B(1)).out[0].value, a, '×1 is identity');
    assert.equal(OPS['×'](B(1), B(a)).out[0].value, a, '1× is identity');
    assert.deepEqual(OPS['×'](B(a), B(0)).out, [B(0)], 'a×0 is one Void block');
    assert.deepEqual(OPS['×'](B(0), B(a)).out, [B(0)], '0×a is one Void block');
  }
  assert.deepEqual(platform(3, 4), { value: 12, shape: [3, 4] }, '3×4 = 3 rows of 4');
  assert.deepEqual(platform(1, 1), B(1), 'a 1×1 is a plain block (no shape key)');
  assert.deepEqual(OPS['×'](platform(2, 3), B(2)).out, [B(12)], 'a platform times a number is a plain 12 (no 3D solid before P5)');
});

test('÷ laws: remainder mode q·b + r = a; fraction/decimal give one exact block; ÷1 is identity, ÷0 storms, 0÷n gives n Voids', () => {
  for (const a of N) for (const b of N) {
    const r = OPS['÷'](B(a), B(b));
    if (b === 0) { assert.deepEqual([r.ok, r.reason], [false, 'storm'], `${a}÷0 never resolves`); continue; }
    const shares = r.out.filter(o => !o.pebble), pebbles = r.out.filter(o => o.pebble);
    assert.equal(shares.length, b, 'remainder mode (default): b equal shares');
    const q = shares[0].value;
    assert.ok(shares.every(o => o.value === q), 'every share is equal');
    assert.ok(pebbles.every(o => o.value === 1), 'a remainder is whole pebbles');
    assert.equal(q * b + pebbles.length, a, 'conserved: q·b + r = a');
    for (const mode of ['fraction', 'decimal']) {
      const [one, ...rest] = OPS['÷'](B(a), B(b), mode).out;
      assert.equal(rest.length, 0, `${mode} mode: one block`);
      assert.equal(one.value, div(a, b), 'the value is the exact rational');
      assert.equal(mul(one.value, b), a, 'and times b gives a back');
      assert.equal(one.show, a % b ? mode : undefined, 'show only when not whole');
    }
  }
  for (const a of N) assert.deepEqual(OPS['÷'](B(a), B(1)).out, [B(a)], '÷1 is identity');
  assert.deepEqual(OPS['÷'](B(0), B(3)).out, [B(0), B(0), B(0)], '0÷3 is 3 Voids');
  assert.equal(OPS['÷'](platform(3, 4), B(3)).out.length, 3, 'a platform can be shared');
  assert.deepEqual(OPS['÷'](B(6), platform(1, 2)).out, [B(3)], 'a platform divisor gives one exact block');
  assert.deepEqual(OPS['÷'](B(7), B(-2)).out, [{ value: '-7/2', show: 'fraction' }], 'outside the naturals: one exact block');
  assert.deepEqual(OPS['÷'](B(6), B(4), 'fraction').out, [{ value: '3/2', show: 'fraction' }], 'fractions are reduced');
  assert.deepEqual([decimal('7/2'), decimal('1/3'), decimal('-1/6')], ['3.5', '0.3\u0305', '-0.16\u0305']);
});

test('identities are true identities: a platform ×1, 1× and ÷1 keep value and shape (CEO ruling)', () => {
  for (const r of N.slice(1)) for (const c of N.slice(1)) {
    const p = platform(r, c);
    assert.deepEqual(OPS['×'](p, B(1)).out, [p]);
    assert.deepEqual(OPS['×'](B(1), p).out, [p]);
    assert.deepEqual(OPS['÷'](p, B(1)).out, [p]);
  }
  const r = run({ name: 't', map: ['#######', '#@....#', '#.....#', '#######'], platforms: [{ x: 2, y: 1, rows: 2, cols: 2 }] }, []);
  r.state.objects.push({ id: 9, x: 4, y: 1, kind: 'op', op: '÷' }, { id: 10, x: 5, y: 1, kind: 'num', value: 1 });
  r.state.tiles[1] = '#@......#'; r.state.tiles[2] = '#.......#'; r.state.tiles[0] = r.state.tiles[3] = '#########';
  assert.deepEqual(nums(step(r.state, 'right').state).map(o => [o.x, o.value, o.shape]), [[2, 4, [2, 2]]], 'pushed, 2×2 ÷ 1 is still the 2×2');
});

test('each socket reads one attribute: | a ten-rod, v the value 0, p the pebble flag; plain numbers fail v and p', () => {
  assert.ok(run({ name: 't', map: ['#######', '#@3-3v#', '#######'] }, ['right', 'right', 'right', 'right']).events.some(e => e.type === 'socket'), 'a Void fills a Void socket');
  assert.equal(run({ name: 't', map: ['#####', '#@3v#', '#####'] }, ['right']).events[0].reason, 'not-void');
  assert.equal(run({ name: 't', map: ['#####', '#@1p#', '#####'] }, ['right']).events[0].reason, 'not-pebble', 'a plain 1 is not a pebble');
  const peb = run({ name: 't', map: ['##########', '#@7÷2...p#', '##########'] }, Array(7).fill('right'));
  assert.ok(peb.events.some(e => e.type === 'socket' && e.value === 1), 'the remainder pebble fits the pebble socket');
  assert.equal(run({ name: 't', map: ['#####', '#@0p#', '#####'] }, ['right']).events[0].reason, 'not-pebble');
});

test('bundling keeps the value; + carries tens; pebbles are plain once merged', () => {
  assert.deepEqual(bundle(B(10)), { value: 10, tens: 1 });
  assert.deepEqual(bundle(platform(2, 5)), { value: 10, tens: 1 });
  assert.equal(bundle(B(9)), null);
  assert.equal(bundle({ value: 10, tens: 1 }), null, 'a rod is already bundled');
  assert.deepEqual(OPS['+']({ value: 10, tens: 1 }, B(3)).out, [{ value: 13, tens: 1 }], 'rod + 3');
  assert.deepEqual(OPS['-']({ value: 13, tens: 1 }, B(3)).out, [B(10)], 'a rod − 3 resolves; the result is plain');
  assert.deepEqual(OPS['×']({ value: 10, tens: 1 }, B(3)).out, [B(30)]);
  assert.deepEqual(OPS['+']({ value: 10, tens: 1 }, B(-3)).out, [B(7)], 'no tens survive leaving the naturals');
  assert.deepEqual(OPS['+']({ value: 1, pebble: true }, { value: 1, pebble: true }).out, [B(2)]);
  assert.deepEqual(OPS['+'](platform(3, 4), B(2)).out, [B(14)], 'platform + number is a 1×1 sum (CEO ruling 2)');
});

test('doors read ×; mixed precedence on one side is refused', () => {
  checkDoor('6×□ = 6');
  checkDoor('△ × 3 = 12', ['△']);
  assert.ok(accepts('6×□ = 6', 1));
  assert.ok(accepts('□ = 5×0', 0));
  assert.ok(accepts('△ × 3 = 12', { '△': 4 }));
  checkDoor('2+3×□ = 14');
  assert.ok(accepts('2+3×□ = 14', 4), 'doors use calculator precedence: 2 + 3 × 4 = 14');
  assert.ok(accepts('□ - 2×3 = 1', 7));
});

test('[a][×][b] builds an a-rows-of-b platform next to the player, in reading order both ways', () => {
  const r = run({ name: 't', map: ['#########', '#@3×4...#', '#.......#', '#.......#', '#########'] }, ['right']);
  assert.equal(r.events[0].type, 'multiply');
  assert.deepEqual(nums(r.state).map(o => [o.x, o.y, o.value, o.shape]), [[2, 1, 12, [3, 4]]]);
  assert.deepEqual(r.state.player, { x: 1, y: 1 }, 'the cell in front is not freed, so the player stays');
  const l = run({ name: 't', map: ['#########', '#...3×4@#', '#.......#', '#.......#', '#########'] }, ['left']);
  assert.deepEqual(nums(l.state).map(o => [o.x, o.y, o.shape]), [[3, 1, [3, 4]]], 'pushed left it is still 3 rows of 4');
  const p = run({ name: 't', map: ['#########', '#@3×4...#', '#.......#', '#.......#', '#########'] }, ['right', 'right']);
  assert.deepEqual([nums(p.state)[0].x, p.state.player.x], [3, 2], 'the platform pushes as one body');
});

test('no room for the result bounces no-room with the whole result ghosted', () => {
  const lvl = { name: 't', map: ['#########', '#@3×4...#', '#.......#', '#########'] };
  const r = run(lvl, ['right']);
  assert.equal(r.events[0].reason, 'no-room');
  assert.equal(r.events[0].ghost.length, 12);
  assert.deepEqual(r.state, parseLevel(lvl));
});

test('platforms push line-only: off-line leading-face cells must be free floor', () => {
  const map = ['#########', '#@......#', '#.......#', '#.....#.#', '#########'];
  const pl = [{ x: 2, y: 1, rows: 3, cols: 4 }];
  assert.equal(run({ name: 't', map, platforms: pl }, ['right']).events[0].reason, 'blocked');
  const open = ['#########', '#@......#', '#.......#', '#.......#', '#########'];
  const r = run({ name: 't', map: open, platforms: pl }, ['down', 'right']);
  assert.deepEqual([nums(r.state)[0].x, r.state.player], [3, { x: 2, y: 2 }], 'any cell of the body can be pushed');
  const pad = run({ name: 't', map: ['#########', '#@......#', '#.......#', '#.....^.#', '#########'], platforms: pl }, ['right']);
  assert.equal(pad.events[0].reason, 'blocked', 'tick pads are walls to platforms');
  const tr = run({ name: 't', map: ['#######', '#@..oo#', '#######'], platforms: [{ x: 2, y: 1, rows: 1, cols: 2 }] }, ['right']);
  assert.equal(tr.events[0].type, 'bounce', 'a platform never fills a trench');
});

test('pits read shape: an exact footprint fits, a short one shows ghost cells', () => {
  const pl = [{ x: 2, y: 1, rows: 2, cols: 2 }];
  const ok = run({ name: 't', map: ['#######', '#@..__#', '#...__#', '#######'], platforms: pl }, ['right']);
  assert.equal(ok.events.find(e => e.type === 'pit').value, 4);
  assert.equal(nums(ok.state).length, 0);
  assert.ok(!ok.state.tiles.join('').includes('_'), 'the pit is filled');
  const short = run({ name: 't', map: ['########', '#@..___#', '#...___#', '########'], platforms: pl }, ['right']);
  assert.deepEqual([short.events[0].reason, short.events[0].ghost.length, short.events[0].overhang.length], ['pit', 2, 0]);
  const wide = run({ name: 't', map: ['#######', '#@..__#', '#...###', '#######'], platforms: pl }, ['right']);
  assert.deepEqual([wide.events[0].reason, wide.events[0].ghost.length, wide.events[0].overhang.length], ['pit', 0, 2]);
});

test('a pivot post turns a platform in place: shape swaps, value stays', () => {
  const pl = [{ x: 2, y: 1, rows: 2, cols: 3 }];
  const r = run({ name: 't', map: ['#######', '#@...r#', '#.....#', '#.....#', '#######'], platforms: pl }, ['right']);
  assert.equal(r.events[0].type, 'rotate');
  assert.deepEqual([nums(r.state)[0].shape, nums(r.state)[0].value, r.state.player.x], [[3, 2], 6, 1]);
  const b = run({ name: 't', map: ['#######', '#@...r#', '#.....#', '#.#...#', '#######'], platforms: pl }, ['right']);
  assert.equal(b.events[0].reason, 'blocked');
  assert.equal(run({ name: 't', map: ['#####', '#@3r#', '#####'] }, ['right']).events[0].reason, 'wall', 'a 1×1 has nothing to turn');
});

test('[a][÷][b] shares along the push line; small÷big resolves; ÷0 storms; 0÷n gives Voids', () => {
  const v = (map, d = 'right') => { const r = run({ name: 't', map: ['#'.repeat(map.length), map, '#'.repeat(map.length)] }, [d]); return [r, nums(r.state).sort((a, b) => a.x - b.x).map(o => o.value + (o.pebble ? 'p' : ''))]; };
  assert.deepEqual(v('#@7÷2....#')[1], ['3', '3', '1p']);
  const fr = run({ name: 't', div: 'fraction', map: ['#####', '#@7÷2#', '#####'] }, ['right']).state;
  assert.deepEqual([nums(fr).map(o => [o.x, o.value, o.show]), fr.player.x], [[[2, '7/2', 'fraction']], 1], 'level.div sets how ÷ shows');
  assert.equal(v('#@7÷2....#')[0].events[0].type, 'share');
  assert.deepEqual(v('#....7÷2@#', 'left')[1], ['3', '3', '1p'], 'reads 7÷2 pushed left too');
  assert.deepEqual(nums(v('#....7÷3@#', 'left')[0].state).map(o => o.x), [4, 5, 6, 7], 'the extra cell grows away from the player');
  assert.deepEqual(v('#....7÷2@#', 'left')[0].state.player, { x: 8, y: 1 }, 'no cell freed in front: the player stays');
  assert.deepEqual(v('#....6÷2@#', 'left')[0].state.player, { x: 7, y: 1 }, 'fits the operand cells: the freed cell takes the player');
  assert.deepEqual(v('#@3÷6......#')[1], ['0', '0', '0', '0', '0', '0', '1p', '1p', '1p']);
  assert.equal(v('#@3÷6.....#')[0].events[0].reason, 'no-room');
  assert.equal(v('#@5÷0..#')[0].events[0].reason, 'storm');
  assert.equal(v('#@0÷0..#')[0].events[0].reason, 'storm');
  assert.deepEqual(v('#@0÷3..#')[1], ['0', '0', '0']);
  assert.deepEqual(v('#@6÷1..#')[1], ['6']);
  assert.deepEqual(nums(v('#@6÷1..#')[0].state).map(o => [o.id, o.x]), [[2, 2]], '6÷1 lands in the first operand cell, keeping the divisor id');
  const calc = (map, d, div) => { const w = '#'.repeat(map.length), f = '#' + '.'.repeat(map.length - 2) + '#';
    let st = parseLevel({ name: 't', div, map: [w, map, f, f, f, w] }); for (let i = 0; i < 12; i++) st = step(st, d).state; return nums(st).map(o => o.value); };
  assert.deepEqual(calc('#@2+3×4.....#', 'right'), [14], 'precedence: 2 + 3 × 4 = 14');
  assert.deepEqual(calc('#@2×3+1.....#', 'right'), [7]);
  assert.deepEqual(calc('#@8-2×3.....#', 'right'), [2]);
  assert.deepEqual(calc('#@8÷2×2.....#', 'right', 'fraction'), [8], '÷ and × left to right');
  let col = parseLevel({ name: 't', map: ['######', '#....#', '#....#', '#2...#', '#+...#', '#1...#', '#×...#', '#4...#', '#@...#', '######'] });
  for (let i = 0; i < 8; i++) col = step(col, 'up').state;
  assert.deepEqual(nums(col).map(o => o.value), [6], 'pushed up: 2 + 1 × 4 = 6, not 12');
});

test('a bundle pad turns a value-10 block or platform into a ten-rod; a rod socket takes only a rod', () => {
  const r = run({ name: 't', map: ['########', '#@6+4b|#', '########'] }, Array(4).fill('right'));
  assert.equal(r.events.at(-2).type, 'bundle');
  assert.deepEqual(nums(r.state).map(o => [o.x, o.value, o.tens]), [[5, 10, 1]]);
  const s = run({ name: 't', map: ['########', '#@6+4b|#', '########'] }, Array(5).fill('right'));
  assert.ok(s.events.some(e => e.type === 'socket'));
  assert.equal(nums(s.state).length, 0);
  assert.equal(run({ name: 't', map: ['########', '#@6+4.|#', '########'] }, Array(5).fill('right')).events.at(-1).reason, 'not-rod');
  const p = run({ name: 't', map: ['##########', '#@.......#', '#......b.#', '##########'], platforms: [{ x: 2, y: 1, rows: 2, cols: 5 }] }, ['right']);
  assert.deepEqual(nums(p.state).map(o => [o.x, o.y, o.value, o.tens, o.shape]), [[7, 2, 10, 1, undefined]], 'a 1-cell rod on the pad');
});

test('platforms in lanes count once; platform + number resolves to a 1×1 sum', () => {
  const s = parseLevel({ name: 't', map: ['#####', '#@..#', '#...#', '#####'], lanes: { '△': { row: 2 } }, platforms: [{ x: 2, y: 1, rows: 2, cols: 2 }] });
  assert.deepEqual(laneValues(s), { '△': 4 });
  const r = run({ name: 't', map: ['##########', '#@....+2.#', '#........#', '#........#', '##########'], platforms: [{ x: 2, y: 1, rows: 3, cols: 4 }] }, ['right']);
  assert.deepEqual(nums(r.state).map(o => [o.x, o.y, o.value, o.shape]), [[2, 1, 14, undefined]]);
});

test('solver key tells 3×4 from 4×3 and a rod from ten cubes', () => {
  const s = parseLevel({ name: 't', map: ['######', '#@...#', '#....#', '#....#', '#....#', '######'], platforms: [{ x: 1, y: 2, rows: 3, cols: 4 }] });
  const t = structuredClone(s); t.objects[0].shape = [4, 3];
  assert.notEqual(key(s), key(t));
  const u = structuredClone(s); u.objects[0] = { ...u.objects[0], shape: undefined, tens: 1 };
  const w = structuredClone(u); delete w.objects[0].tens;
  assert.notEqual(key(u), key(w));
});

// No-room validator: along a winning route, no push may hit no-room (it would read as "can't divide").
function noRoomOnRoute(level) {
  let s = parseLevel(level);
  for (const d of solve(s, 3e6) ?? []) { // an unsolvable level is reported by core.test.js
    for (const e of Object.keys(DIRS)) if (step(s, e).events.some(ev => ev.reason === 'no-room')) return true;
    s = step(s, d).state;
  }
  return false;
}
test('no-room validator: catches a route past a cramped ×, and no level hits it', () => {
  assert.ok(noRoomOnRoute({ name: 't', map: ['######', '#@3×4#', '#E...#', '######'] }));
  for (const l of LEVELS.filter(l => l.platforms || l.map.some(r => /[×÷]/.test(r)))) assert.equal(noRoomOnRoute(l), false, l.name);
});
