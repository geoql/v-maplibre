import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { buildShot, CINEMATIC_DESTINATIONS, WORLD_START } from './shot.ts';

test('destinations: real 3D-tile captures with tileset paths + deep arrival', () => {
  assert.ok(
    CINEMATIC_DESTINATIONS.length >= 2,
    `expected >= 2 destinations, got ${CINEMATIC_DESTINATIONS.length}`,
  );
  const names = new Set(CINEMATIC_DESTINATIONS.map((d) => d.name));
  assert.equal(names.size, CINEMATIC_DESTINATIONS.length);
  for (const d of CINEMATIC_DESTINATIONS) {
    assert.match(
      d.tilesetPath,
      /tileset\.json$/,
      `${d.name} tilesetPath ${d.tilesetPath}`,
    );
    // Deep enough to frame street-scale 3D tiles (the captures are metres wide).
    assert.ok(d.arrivalZoom >= 19, `${d.name} arrivalZoom ${d.arrivalZoom}`);
    assert.ok(d.arrivalPitch >= 50 && d.arrivalPitch <= 70, `${d.name} pitch`);
  }
});

test('first shot: sample(0) equals start exactly', () => {
  const first = CINEMATIC_DESTINATIONS[0]!;
  const shot = buildShot(first);
  assert.deepEqual(shot.sample(0), shot.start);
  assert.deepEqual(shot.start.center, WORLD_START.center);
  assert.equal(shot.start.zoom, 1.6);
  assert.equal(shot.start.pitch, 0);
  assert.equal(shot.start.bearing, 0);
  assert.equal(shot.start.roll, 0);
});

test('first shot: arrival lands on the capture, pitched, at the arrival bearing', () => {
  const first = CINEMATIC_DESTINATIONS[0]!;
  const s = buildShot(first).sample(1);
  assert.ok(Math.abs(s.center[0] - first.coordinates[0]) < 0.02);
  assert.ok(Math.abs(s.center[1] - first.coordinates[1]) < 0.02);
  assert.ok(s.zoom >= 15.5, `zoom ${s.zoom}`);
  assert.ok(s.pitch >= 50, `pitch ${s.pitch}`);
  assert.equal(s.bearing, first.arrivalBearing);
  assert.ok(Math.abs(s.roll) < 1e-9);
});

test('zoom plunges after a short anticipation dip, then rises monotonically', () => {
  const sample = buildShot(CINEMATIC_DESTINATIONS[0]!).sample;
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

test('bearing holds north until zoom crosses 5', () => {
  const sample = buildShot(CINEMATIC_DESTINATIONS[0]!).sample;
  for (let t = 0; t <= 1.0001; t += 0.02) {
    const s = sample(t);
    if (s.zoom < 5) {
      assert.equal(
        s.bearing,
        0,
        `bearing ${s.bearing} at t=${t} zoom=${s.zoom}`,
      );
    }
  }
});

test('settle starts at sample(1) and relaxes toward rest', () => {
  const shot = buildShot(CINEMATIC_DESTINATIONS[0]!);
  const s0 = shot.settle(0);
  assert.deepEqual(s0, shot.sample(1));
  const rest = shot.rest;
  const s3 = shot.settle(3);
  assert.ok(
    Math.abs(s3.zoom - rest.zoom) < 1e-3,
    `zoom ${s3.zoom} vs ${rest.zoom}`,
  );
  assert.ok(
    Math.abs(s3.pitch - rest.pitch) < 1e-2,
    `pitch ${s3.pitch} vs ${rest.pitch}`,
  );
  assert.ok(Math.abs(s3.center[0] - rest.center[0]) < 1e-3);
  assert.ok(Math.abs(s3.center[1] - rest.center[1]) < 1e-3);
  const s8 = shot.settle(8);
  assert.ok(
    Math.abs(s8.pitch - rest.pitch) < 1e-4,
    `pitch ${s8.pitch} vs ${rest.pitch}`,
  );
});

test('rest holds landing zoom, arrival pitch, zero roll, capture center', () => {
  const first = CINEMATIC_DESTINATIONS[0]!;
  const shot = buildShot(first);
  assert.equal(shot.rest.pitch, first.arrivalPitch);
  assert.equal(shot.rest.roll, 0);
  assert.ok(Math.abs(shot.rest.center[0] - first.coordinates[0]) < 1e-9);
  assert.ok(Math.abs(shot.rest.zoom - shot.sample(1).zoom) < 1e-9);
});

test('every destination arrives above zoom 15.5 after globe adjustment', () => {
  for (const d of CINEMATIC_DESTINATIONS) {
    const s = buildShot(d).sample(1);
    assert.ok(s.zoom >= 15.5, `${d.name} zoom ${s.zoom}`);
    assert.ok(Math.abs(s.center[1] - d.coordinates[1]) < 0.02);
  }
});
