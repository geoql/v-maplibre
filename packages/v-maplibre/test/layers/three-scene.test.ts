import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Map } from 'maplibre-gl';

// Mock the maplibre-three-plugin so tests don't need a real WebGL2 context.
const addObject = vi.fn();
const removeObject = vi.fn();
const sceneAdd = vi.fn();
const sceneRemove = vi.fn();
const worldChildren: unknown[] = [];

vi.mock('@dvt3d/maplibre-three-plugin', () => {
  class MockMapScene {
    scene = { add: sceneAdd, remove: sceneRemove };
    world = {
      children: worldChildren,
      remove: (c: unknown) => {
        const i = worldChildren.indexOf(c);
        if (i >= 0) worldChildren.splice(i, 1);
      },
    };
    renderer = {};
    camera = {};
    addObject = addObject;
    removeObject = removeObject;
    on = vi.fn();
    off = vi.fn();
    layerBeforeTo = vi.fn();
  }
  return {
    MapScene: MockMapScene,
    Creator: {
      createRTCGroup: vi.fn(() => ({ add: vi.fn(), remove: vi.fn() })),
      createMercatorRTCGroup: vi.fn(() => ({ add: vi.fn(), remove: vi.fn() })),
    },
    SceneTransform: {
      lngLatToVector3: vi.fn(() => ({ x: 0, y: 0, z: 0 })),
      projectedUnitsPerMeter: vi.fn(() => 1),
    },
  };
});

import {
  acquireThreeScene,
  releaseThreeScene,
  retainSparkRenderer,
  releaseSparkRenderer,
} from '../../src/layers/three/_shared/useThreeScene';

const makeMap = (): Map =>
  ({
    getCanvas: () => document.createElement('canvas'),
    on: vi.fn(),
    off: vi.fn(),
    getLayer: vi.fn(),
    addLayer: vi.fn(),
    getCenter: () => ({ lng: 0, lat: 0 }),
  }) as unknown as Map;

describe('useThreeScene registry (issue #140)', () => {
  beforeEach(() => {
    worldChildren.length = 0;
    vi.clearAllMocks();
  });

  it('returns the SAME MapScene for sibling layers on one map', () => {
    const map = makeMap();
    const a = acquireThreeScene(map);
    const b = acquireThreeScene(map);
    expect(b.mapScene).toBe(a.mapScene);
    expect(b.refCount).toBe(2);
    releaseThreeScene(map);
    releaseThreeScene(map);
  });

  it('creates separate MapScenes for different maps', () => {
    const a = acquireThreeScene(makeMap());
    const b = acquireThreeScene(makeMap());
    expect(a.mapScene).not.toBe(b.mapScene);
  });

  it('keeps the MapScene alive after the last release (single scene per map lifetime)', () => {
    const map = makeMap();
    const first = acquireThreeScene(map);
    releaseThreeScene(map);
    const second = acquireThreeScene(map);
    expect(second.mapScene).toBe(first.mapScene);
  });

  it('empties the world group when the last layer releases', () => {
    const map = makeMap();
    const entry = acquireThreeScene(map);
    worldChildren.push({ id: 'obj' });
    releaseThreeScene(map);
    expect(entry.mapScene.world.children).toHaveLength(0);
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
    expect(sceneAdd).toHaveBeenCalledWith(fakeSpark);

    releaseSparkRenderer(entry);
    expect(dispose).not.toHaveBeenCalled();
    releaseSparkRenderer(entry);
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(entry.sparkRenderer).toBeNull();

    releaseThreeScene(map);
    releaseThreeScene(map);
  });
});
