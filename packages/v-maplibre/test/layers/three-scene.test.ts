import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Map } from 'maplibre-gl';

// jsdom has no WebGL2 context: keep three's real math/scene classes and
// stub only the renderer.
vi.mock('three', async (importOriginal) => {
  const real = await importOriginal<typeof import('three')>();
  class MockWebGLRenderer {
    setPixelRatio = vi.fn();
    setSize = vi.fn();
    resetState = vi.fn();
    render = vi.fn();
    dispose = vi.fn();
    getContext = vi.fn();
  }
  return { ...real, WebGLRenderer: MockWebGLRenderer };
});

import {
  acquireThreeScene,
  releaseThreeScene,
  retainSparkRenderer,
  releaseSparkRenderer,
  mercatorGroupMatrix,
} from '../../src/layers/three/_shared/useThreeScene';

const makeMap = (): Map => {
  const layers: { id: string }[] = [];
  return {
    getCanvas: () => document.createElement('canvas'),
    on: vi.fn(),
    off: vi.fn(),
    getLayer: vi.fn(
      (id: string) => layers.find((layer) => layer.id === id) ?? null,
    ),
    moveLayer: vi.fn(),
    addLayer: vi.fn((layer: { id: string }) => {
      layers.push(layer);
    }),
    removeLayer: vi.fn((id: string) => {
      const index = layers.findIndex((layer) => layer.id === id);
      if (index >= 0) layers.splice(index, 1);
    }),
    triggerRepaint: vi.fn(),
    getStyle: vi.fn(() => ({ layers })),
    getCenter: () => ({ lng: 7.9, lat: 45.9 }),
    getCenterElevation: () => 0,
    transform: {
      cameraPosition: [0.5, 0.35, 0.001],
      fov: 45,
    },
  } as unknown as Map;
};

describe('useThreeScene registry (issue #140)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the SAME scene context for sibling layers on one map', () => {
    const map = makeMap();
    const a = acquireThreeScene(map);
    const b = acquireThreeScene(map);
    expect(b.scene).toBe(a.scene);
    expect(b.refCount).toBe(2);
    releaseThreeScene(map);
    releaseThreeScene(map);
  });

  it('creates separate contexts for different maps', () => {
    const a = acquireThreeScene(makeMap());
    const b = acquireThreeScene(makeMap());
    expect(a.scene).not.toBe(b.scene);
    releaseThreeScene(makeMap());
  });

  it('registers exactly one custom layer per map and disposes on last release', () => {
    const map = makeMap();
    acquireThreeScene(map);
    acquireThreeScene(map);
    expect(map.addLayer).toHaveBeenCalledTimes(1);
    releaseThreeScene(map);
    expect(map.removeLayer).not.toHaveBeenCalled();
    releaseThreeScene(map);
    expect(map.removeLayer).toHaveBeenCalledTimes(1);
  });

  it('re-acquire after full release creates a fresh context', () => {
    const map = makeMap();
    const first = acquireThreeScene(map);
    releaseThreeScene(map);
    const second = acquireThreeScene(map);
    expect(second.scene).not.toBe(first.scene);
    releaseThreeScene(map);
  });

  it('shares ONE SparkRenderer across splat layers and disposes on last release', () => {
    const map = makeMap();
    const entry = acquireThreeScene(map);
    acquireThreeScene(map);

    const dispose = vi.fn();
    const fakeSpark = { dispose } as never;
    const create = vi.fn(() => fakeSpark);

    const first = retainSparkRenderer(entry, create);
    const second = retainSparkRenderer(entry, create);
    expect(first).toBe(second);
    expect(create).toHaveBeenCalledTimes(1);

    releaseSparkRenderer(entry);
    expect(dispose).not.toHaveBeenCalled();
    releaseSparkRenderer(entry);
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(entry.sparkRenderer).toBeNull();

    releaseThreeScene(map);
    releaseThreeScene(map);
  });

  it('mercatorGroupMatrix places content in the scene metre frame', () => {
    const map = makeMap();
    // Scene origin is the map centre, so an anchor 0.001 deg east/north of
    // it must land a few tens of metres away — NOT sub-micron mercator
    // fractions, which would collapse under Spark's half-float packing.
    const m = mercatorGroupMatrix(map, 7.901, 45.901, 1950, [-90, 0, 0], 2);
    const e = m.elements;
    expect(e[12]).toBeGreaterThan(1);
    expect(e[12]).toBeLessThan(1000);
    expect(Math.abs(e[13])).toBeGreaterThan(1);
    expect(Math.abs(e[13])).toBeLessThan(1000);
    expect(e[14]).toBeGreaterThan(1000);

    // Uniform scale on the basis vectors (rotation keeps lengths equal),
    // and it is the caller's scale directly — metres are 1:1 now.
    const sx = Math.hypot(e[0], e[1], e[2]);
    const sy = Math.hypot(e[4], e[5], e[6]);
    const sz = Math.hypot(e[8], e[9], e[10]);
    expect(sx).toBeCloseTo(2, 10);
    expect(sx).toBeCloseTo(sy, 12);
    expect(sy).toBeCloseTo(sz, 12);
  });
});
