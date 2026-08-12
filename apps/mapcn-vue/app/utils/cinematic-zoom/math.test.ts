import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { approach, clamp01, smoothTrack, smoothstep } from './math.ts';

test('clamp01 clamps to unit range', () => {
  assert.equal(clamp01(-0.2), 0);
  assert.equal(clamp01(0.5), 0.5);
  assert.equal(clamp01(1.7), 1);
});

test('smoothstep is a sigmoid through the edges', () => {
  assert.equal(smoothstep(0, 1, 0), 0);
  assert.equal(smoothstep(0, 1, 1), 1);
  assert.equal(smoothstep(0, 1, 0.5), 0.5);
  assert.ok(smoothstep(0, 1, 0.25) > 0.1 && smoothstep(0, 1, 0.25) < 0.3);
});

test('smoothTrack passes keys exactly', () => {
  const f = smoothTrack([
    [0, 1.6],
    [1, 16.4],
  ]);
  assert.equal(f(0), 1.6);
  assert.equal(f(1), 16.4);
  const g = smoothTrack([
    [0, 0],
    [0.5, 1],
    [1, 0],
  ]);
  assert.equal(g(0.5), 1);
});

test('smoothTrack preserves monotonicity for increasing data', () => {
  const f = smoothTrack([
    [0, 0],
    [0.2, 0.4],
    [0.5, 2.2],
    [0.8, 9],
    [1, 16.4],
  ]);
  let prev = -Infinity;
  for (let t = 0; t <= 1.0001; t += 0.01) {
    const v = f(t);
    assert.ok(v >= prev, `non-decreasing at t=${t}: ${v} < ${prev}`);
    prev = v;
  }
});

test('smoothTrack carries interior key velocity (no dead stops, no overshoot)', () => {
  const f = smoothTrack([
    [0, 0],
    [0.2, 0.4],
    [0.5, 2.2],
    [0.8, 9],
    [1, 16.4],
  ]);
  const v = f(0.5);
  assert.ok(v > f(0.2) && v < f(0.8), `f(0.5)=${v} not between neighbors`);
});

test('smoothTrack clamps to keyframe domain', () => {
  const f = smoothTrack([
    [0, 0],
    [1, 10],
  ]);
  assert.equal(f(-5), 0);
  assert.equal(f(2), 10);
});

test('approach is exponential relaxation carrying exit velocity', () => {
  assert.equal(approach(0, 0.4), 0);
  assert.ok(approach(0.2, 0.4) > 0 && approach(0.2, 0.4) < approach(0.5, 0.4));
  assert.ok(approach(1, 0.4) < 1);
  assert.ok(Math.abs(approach(3, 0.4) - (1 - Math.exp(-3 / 0.4))) < 1e-6);
});
