import { MapScene } from '@dvt3d/maplibre-three-plugin';
import type { Map } from 'maplibre-gl';
import type { SparkRenderer } from '@sparkjsdev/spark';

/**
 * Shared three.js scene context for a MapLibre map.
 *
 * `MapScene` (from `@dvt3d/maplibre-three-plugin`) owns ONE
 * `THREE.WebGLRenderer` bound to MapLibre's canvas/GL context plus a scene,
 * camera and camera-sync. It self-registers a custom layer with a fixed id
 * (`map_scene_layer`) and re-adds that layer on every map render, so a map
 * must only ever get ONE MapScene for its whole lifetime — constructing a
 * second one would fight the first over the layer id and never render.
 *
 * The registry below therefore keys entries by the MapLibre `Map` instance
 * (WeakMap: entries release with the map itself) and keeps the MapScene
 * alive even when the layer refcount drops to zero. An idle MapScene with an
 * empty world renders nothing and costs ~0; per-layer GPU resources are
 * disposed by the layers themselves via {@link releaseThreeScene}.
 */
export interface ThreeSceneEntry {
  mapScene: MapScene;
  /** Number of live v-maplibre layer components using this entry. */
  refCount: number;
  /**
   * Shared Spark splat renderer (one per scene, created lazily by the first
   * `VLayerSplat`). Owned here so sibling splat layers reuse it and the last
   * one out disposes it.
   */
  sparkRenderer: SparkRenderer | null;
  /** Number of live splat layers using {@link sparkRenderer}. */
  splatRefCount: number;
}

type MapSceneMap = ConstructorParameters<typeof MapScene>[0];

const registry = new WeakMap<Map, ThreeSceneEntry>();

/**
 * Get (or lazily create) the shared three.js scene context for `map` and
 * increment its refcount. Call {@link releaseThreeScene} once per acquire.
 */
export function acquireThreeScene(map: Map): ThreeSceneEntry {
  let entry = registry.get(map);
  if (!entry) {
    entry = {
      mapScene: new MapScene(map as unknown as MapSceneMap),
      refCount: 0,
      sparkRenderer: null,
      splatRefCount: 0,
    };
    registry.set(map, entry);
  }
  entry.refCount += 1;
  return entry;
}

/**
 * Release one reference to the shared scene context. When the last layer
 * releases, the world group is emptied so the (kept-alive) MapScene renders
 * nothing. The MapScene itself is intentionally NOT destroyed — see the
 * module doc comment.
 */
export function releaseThreeScene(map: Map): void {
  const entry = registry.get(map);
  if (!entry) return;
  entry.refCount -= 1;
  if (entry.refCount > 0) return;
  entry.refCount = 0;
  const world = entry.mapScene.world;
  for (const child of [...world.children]) {
    world.remove(child);
  }
}

/**
 * Register a splat layer against the entry's shared SparkRenderer, creating
 * it via `create()` on first use. Returns the active renderer.
 */
export function retainSparkRenderer(
  entry: ThreeSceneEntry,
  create: () => SparkRenderer,
): SparkRenderer {
  if (!entry.sparkRenderer) {
    entry.sparkRenderer = create();
    entry.mapScene.scene.add(entry.sparkRenderer);
  }
  entry.splatRefCount += 1;
  return entry.sparkRenderer;
}

/**
 * Release one splat-layer reference to the shared SparkRenderer; the last
 * release removes it from the scene and disposes its GPU resources.
 */
export function releaseSparkRenderer(entry: ThreeSceneEntry): void {
  entry.splatRefCount -= 1;
  if (entry.splatRefCount > 0) return;
  entry.splatRefCount = 0;
  if (entry.sparkRenderer) {
    entry.mapScene.scene.remove(entry.sparkRenderer);
    entry.sparkRenderer.dispose();
    entry.sparkRenderer = null;
  }
}
