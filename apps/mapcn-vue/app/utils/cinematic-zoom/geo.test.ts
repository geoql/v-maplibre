import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  getApproximateAltitude,
  getZoomAdjustment,
  greatCircleInterpolate,
} from './geo.ts';

test('getZoomAdjustment identity at equator', () => {
  assert.equal(getZoomAdjustment(0, 0), 0);
});

test('getZoomAdjustment matches log2(cos) formula', () => {
  const expected = Math.log2(Math.cos((40.7128 * Math.PI) / 180));
  assert.ok(Math.abs(getZoomAdjustment(0, 40.7128) - expected) < 1e-9);
});

test('getZoomAdjustment is antisymmetric', () => {
  assert.ok(
    Math.abs(getZoomAdjustment(10, 50) + getZoomAdjustment(50, 10)) < 1e-12,
  );
});

test('greatCircleInterpolate endpoints exact', () => {
  assert.deepEqual(greatCircleInterpolate([0, 0], [90, 0], 0), [0, 0]);
  assert.deepEqual(greatCircleInterpolate([0, 0], [90, 0], 1), [90, 0]);
  const mid = greatCircleInterpolate([0, 0], [90, 0], 0.5);
  assert.ok(Math.abs(mid[0] - 45) < 1e-9);
  assert.ok(Math.abs(mid[1] - 0) < 1e-9);
});

test('greatCircleInterpolate wraps longitude across the antimeridian', () => {
  const mid = greatCircleInterpolate([170, 0], [-170, 0], 0.5);
  assert.ok(Math.abs(Math.abs(mid[0]) - 180) < 1e-9);
});

test('greatCircleInterpolate arcs over the pole for NYC->Tokyo', () => {
  const mid = greatCircleInterpolate(
    [-74.006, 40.7128],
    [139.6917, 35.6895],
    0.5,
  );
  assert.ok(Number.isFinite(mid[0]) && Number.isFinite(mid[1]));
  // Great circles between northern cities bow toward the pole:
  assert.ok(mid[1] > 40.71, `lat ${mid[1]} should arc above both endpoints`);
});

test('getApproximateAltitude is plausible and monotone in zoom', () => {
  const space = getApproximateAltitude(0, 0, 800);
  assert.ok(Number.isFinite(space) && space > 1e7);
  const street = getApproximateAltitude(40.7, 16.4, 800);
  assert.ok(street > 500 && street < 5000, `street alt ${street}`);
  const lower = getApproximateAltitude(40.7, 14, 800);
  assert.ok(lower > street, 'altitude must decrease as zoom increases');
});
