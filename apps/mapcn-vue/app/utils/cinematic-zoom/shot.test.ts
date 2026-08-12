import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { buildShot, CINEMATIC_DESTINATIONS, WORLD_START } from './shot.ts';

test('destinations: six unique cities with cinematic arrival params', () => {
  assert.equal(CINEMATIC_DESTINATIONS.length, 6);
  const names = new Set(CINEMATIC_DESTINATIONS.map((d) => d.name));
  assert.equal(names.size, 6);
  for (const d of CINEMATIC_DESTINATIONS) {
    assert.ok(d.arrivalZoom >= 15.5, `${d.name} arrivalZoom ${d.arrivalZoom}`);
    assert.ok(d.arrivalPitch >= 50 && d.arrivalPitch <= 62, `${d.name} pitch`);
  }
});

test('NY shot: sample(0) equals start exactly', () => {
  const ny = CINEMATIC_DESTINATIONS[0]!;
  const shot = buildShot(ny);
  assert.deepEqual(shot.sample(0), shot.start);
  assert.deepEqual(shot.start.center, WORLD_START.center);
  assert.equal(shot.start.zoom, 1.6);
  assert.equal(shot.start.pitch, 0);
  assert.equal(shot.start.bearing, 0);
  assert.equal(shot.start.roll, 0);
});

test('NY shot: arrival lands on destination, pitched, north-up bearing restored', () => {
  const ny = CINEMATIC_DESTINATIONS[0]!;
  const s = buildShot(ny).sample(1);
  assert.ok(Math.abs(s.center[0] - ny.coordinates[0]) < 0.02);
  assert.ok(Math.abs(s.center[1] - ny.coordinates[1]) < 0.02);
  assert.ok(s.zoom >= 15.5, `zoom ${s.zoom}`);
  assert.ok(s.pitch >= 50, `pitch ${s.pitch}`);
  assert.equal(s.bearing, ny.arrivalBearing);
  assert.ok(Math.abs(s.roll) < 1e-9);
});

test('NY shot: zoom plunges after a short anticipation dip, then rises monotonically', () => {
  const ny = CINEMATIC_DESTINATIONS[0]!;
  const sample = buildShot(ny).sample;
  let prev = sample(0).zoom;
  for (let t = 0.02; t < 0.08; t += 0.02) {
    const z = sample(t).zoom;
    assert.ok(z < prev, `dip at t=${t}: ${z} >= ${prev}`);
    prev = z;
  }
  let last = prev;
  for (let t = 0.1; t <= 1.0001; t += 0.02) {
    const z = sample(t).zoom;
    assert.ok(z >= last, `non-decreasing at t=${t}: ${z} < ${last}`);
    last = z;
  }
});

test('bearing holds north until zoom crosses 4', () => {
  const ny = CINEMATIC_DESTINATIONS[0]!;
  const sample = buildShot(ny).sample;
  for (let t = 0; t <= 1.0001; t += 0.02) {
    const s = sample(t);
    if (s.zoom < 4) {
      assert.equal(
        s.bearing,
        0,
        `bearing ${s.bearing} at t=${t} zoom=${s.zoom}`,
      );
    }
  }
});

test('settle starts at sample(1) and relaxes toward rest', () => {
  const ny = CINEMATIC_DESTINATIONS[0]!;
  const shot = buildShot(ny);
  const s0 = shot.settle(0);
  assert.deepEqual(s0, shot.sample(1));
  const rest = shot.rest;
  const s3 = shot.settle(3);
  assert.ok(
    Math.abs(s3.zoom - rest.zoom) < 1e-3,
    `zoom ${s3.zoom} vs ${rest.zoom}`,
  );
  // Exponential residual at t=3 with tau 0.4 is ~5e-4 of the pitch/bearing gap:
  assert.ok(
    Math.abs(s3.pitch - rest.pitch) < 1e-2,
    `pitch ${s3.pitch} vs ${rest.pitch}`,
  );
  assert.ok(Math.abs(s3.center[0] - rest.center[0]) < 1e-3);
  assert.ok(Math.abs(s3.center[1] - rest.center[1]) < 1e-3);
  // Full convergence after 8 seconds of settle time:
  const s8 = shot.settle(8);
  assert.ok(
    Math.abs(s8.pitch - rest.pitch) < 1e-4,
    `pitch ${s8.pitch} vs ${rest.pitch}`,
  );
  // monotone toward rest
  let z = s0.zoom;
  for (let t = 0.5; t <= 3.0001; t += 0.5) {
    const zz = shot.settle(t).zoom;
    const dir = rest.zoom - s0.zoom;
    assert.ok((zz - z) * dir >= -1e-9, 'settle zoom monotone toward rest');
    z = zz;
  }
});

test('rest holds landing zoom, arrival pitch, zero roll, destination center', () => {
  const ny = CINEMATIC_DESTINATIONS[0]!;
  const shot = buildShot(ny);
  assert.equal(shot.rest.pitch, ny.arrivalPitch);
  assert.equal(shot.rest.roll, 0);
  assert.ok(Math.abs(shot.rest.center[0] - ny.coordinates[0]) < 1e-9);
  assert.ok(Math.abs(shot.rest.zoom - shot.sample(1).zoom) < 1e-9);
});

test('London (high latitude) still arrives above zoom 15.5 after globe adjustment', () => {
  const london = CINEMATIC_DESTINATIONS.find((d) => d.name === 'London')!;
  const s = buildShot(london).sample(1);
  assert.ok(s.zoom >= 15.5, `london zoom ${s.zoom}`);
  assert.ok(Math.abs(s.center[1] - 51.5072) < 0.02);
});
