<script setup lang="ts">
  /**
   * OGC 3D Tiles layer — streams a tileset (mesh tiles and/or
   * `KHR_gaussian_splatting` + SPZ splat tiles) through
   * NASA-AMMOS/3DTilesRendererJS inside the shared three.js custom layer
   * that draws into MapLibre's WebGL2 context.
   *
   * The ECEF tileset is re-rooted to its local frame with the inverse of its
   * root transform, placed at the geographic anchor via a mercator model
   * matrix, and `TilesRenderer.update()` is driven each frame from the
   * shared layer's frame hook with the view camera (built from the live
   * map transform, so LOD refinement tracks pan/zoom correctly).
   *
   * @requires `three`, `3d-tiles-renderer`
   * @requires `@sparkjsdev/spark` + `3d-tiles-rendererjs-3dgs-plugin` (splat tiles)
   *
   * Install with:
   * `pnpm add three 3d-tiles-renderer @sparkjsdev/spark 3d-tiles-rendererjs-3dgs-plugin`
   */
  import { ref, watch, onBeforeUnmount } from 'vue';
  import { TilesRenderer } from '3d-tiles-renderer';
  import { TilesFadePlugin } from '3d-tiles-renderer/plugins';
  import { GaussianSplatPlugin } from '3d-tiles-rendererjs-3dgs-plugin';
  import { MathUtils, Matrix4, Vector3, Group } from 'three';
  import type { Map } from 'maplibre-gl';
  import { injectStrict, MapKey } from '../../../utils';
  import {
    acquireThreeScene,
    releaseThreeScene,
    retainSparkRenderer,
    releaseSparkRenderer,
    mercatorGroupMatrix,
    type ThreeSceneEntry,
  } from '../_shared/useThreeScene';
  import { SparkRenderer } from '@sparkjsdev/spark';

  interface Props {
    /** Unique identifier (informational; tiles share one scene layer). */
    id?: string;
    /** URL of the root `tileset.json`. */
    url: string;
    /**
     * Screen-space error target driving LOD refinement. Lower values load
     * more detail. 3d-tiles-renderer's default is 16.
     */
    errorTarget?: number;
    /**
     * Cross-fade tiles on LOD switches via TilesFadePlugin. Only affects
     * mesh tiles — splat tiles draw through the shared SparkRenderer, which
     * ignores per-tile fade materials.
     */
    fade?: boolean;
    /**
     * Parse `KHR_gaussian_splatting` (SPZ) splat tiles via the Spark-backed
     * GaussianSplatPlugin. Mesh-only tilesets can disable this.
     */
    splats?: boolean;
    /**
     * Geographic anchor override `[lng, lat]`. When omitted the anchor is
     * derived from the tileset's root transform on load.
     */
    anchor?: [number, number];
    /** Anchor altitude override in meters (defaults to derived height). */
    altitude?: number;
    /**
     * Rotation `[x, y, z]` in degrees mapping the tileset's local frame into
     * the map frame. The recenter cancels the tileset's ECEF placement, so
     * content sits in its raw glTF Y-up frame — the default `[-90, 0, 0]`
     * (same as VLayerSplat) stands that up in the mercator frame.
     */
    rotation?: [number, number, number];
    /** Uniform scale multiplier on top of the meters-at-latitude scaling. */
    scale?: number;
    /** `fetch` options forwarded to every tileset/tile request. */
    fetchOptions?: RequestInit;
    /** Move the shared three.js custom layer before this MapLibre layer id. */
    before?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    id: '3d-tiles',
    errorTarget: 8,
    fade: true,
    splats: true,
    anchor: undefined,
    altitude: undefined,
    rotation: () => [-90, 0, 0],
    scale: 1,
    fetchOptions: undefined,
    before: undefined,
  });

  const emit = defineEmits<{
    loadTileset: [tileset: object, url: string];
    error: [error: Error];
  }>();

  const map = injectStrict(MapKey);
  const loaded = ref(false);
  let entry: ThreeSceneEntry | null = null;
  let contentGroup: Group | null = null;
  let tiles: TilesRenderer | null = null;
  let removeFrameHook: (() => void) | null = null;
  let anchorCoord: [number, number, number] | null = null;

  const getMapInstance = (): Map | null => {
    return map.value || null;
  };

  const applyTransform = (): void => {
    const mapInstance = getMapInstance();
    if (!contentGroup || !anchorCoord || !mapInstance) return;
    contentGroup.matrix.copy(
      mercatorGroupMatrix(
        mapInstance,
        anchorCoord[0],
        anchorCoord[1],
        anchorCoord[2],
        props.rotation,
        props.scale,
      ),
    );
  };

  /**
   * Re-root the ECEF tileset at its geographic anchor.
   *
   * The GaussianSplatPlugin places every tile's SplatMesh at its ECEF
   * position via `sceneMatrix = upRotationMatrix × tileTransform` (verified:
   * upRot = rotateX(-90°), translation = the ECEF anchor). That leaves the
   * content ~15 km above the anchor in the mercator frame unless the group
   * recenter counteracts BOTH factors. So we recenter the tiles group with
   * `(upRot × rootTransform)^-1 = rootTransform^-1 × upRot^-1`, which makes
   * `recenter × sceneMatrix = identity` for the root tile (and leaves child
   * tiles at their correct relative offsets), placing the content at the
   * anchor like the standalone splat.
   */
  const onLoadRootTileset = (event: { tileset: object; url: string }): void => {
    if (!tiles || !entry || !contentGroup) return;

    const rootTransform = (tiles.root as { transform?: number[] } | null)
      ?.transform ?? [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    // recenter = (rootTransform × upRot)^-1 = upRot^-1 × rootTransform^-1
    // (undoes the plugin sceneMatrix, which is rootTransform × upRot — the
    // plugin does target.premultiply(transform), NOT upRot × rootTransform;
    // matrix inverses reverse order). premultiply applies upRot^-1 on the
    // left so recenter × sceneMatrix = identity.
    const recenter = new Matrix4().fromArray(rootTransform).invert();
    const upRot = (tiles as unknown as { _upRotationMatrix?: Matrix4 })
      ._upRotationMatrix;
    if (upRot) {
      recenter.premultiply(upRot.clone().invert());
    }
    tiles.group.matrix.copy(recenter);
    tiles.group.matrixAutoUpdate = false;

    // Anchor: explicit prop, else the root transform's ECEF translation.
    if (props.anchor) {
      anchorCoord = [props.anchor[0], props.anchor[1], props.altitude ?? 0];
    } else {
      const cart = { lat: 0, lon: 0, height: 0 };
      tiles.ellipsoid.getPositionToCartographic(
        new Vector3(rootTransform[12], rootTransform[13], rootTransform[14]),
        cart,
      );
      anchorCoord = [
        MathUtils.radToDeg(cart.lon),
        MathUtils.radToDeg(cart.lat),
        props.altitude ?? cart.height,
      ];
    }

    applyTransform();
    contentGroup.add(tiles.group);
    entry.requestRender();
    emit('loadTileset', event.tileset, event.url);
  };

  const addLayer = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance || entry) return;

    try {
      entry = acquireThreeScene(mapInstance);

      // The plugin's SharedSparkRendererManager adds a
      // CameraRelativeSparkRenderer to the scene when the splat plugin
      // registers. It stays HIDDEN: the shared plain SparkRenderer below
      // draws every SplatMesh (standalone and tile-borne alike) through one
      // accumulation pass, driven by the context's view camera.
      const spark = retainSparkRenderer(
        entry,
        () => new SparkRenderer({ renderer: entry!.renderer }),
      );
      spark.onDirty = () => entry?.requestRender();

      contentGroup = new Group();
      contentGroup.matrixAutoUpdate = false;
      entry.scene.add(contentGroup);

      tiles = new TilesRenderer(props.url);
      tiles.errorTarget = props.errorTarget;
      if (props.fetchOptions) tiles.fetchOptions = props.fetchOptions;
      if (props.fade) tiles.registerPlugin(new TilesFadePlugin());
      if (props.splats) {
        tiles.registerPlugin(
          new GaussianSplatPlugin({
            renderer: entry.renderer,
            scene: entry.scene,
          }),
        );
        for (const child of entry.scene.children) {
          const sparkish = child as Partial<SparkRenderer>;
          if (child !== spark && sparkish.sortedCenter?.isVector3) {
            child.visible = false;
          }
        }
      }
      tiles.setCamera(entry.lodCamera);
      tiles.setResolutionFromRenderer(entry.lodCamera, entry.renderer);

      tiles.addEventListener('load-root-tileset', ((event: unknown) => {
        onLoadRootTileset(event as { tileset: object; url: string });
      }) as never);
      tiles.addEventListener('load-error', ((event: unknown) => {
        const e = event as { error: Error };
        emit('error', e.error);
      }) as never);
      // LOD swaps, tile loads and async splat sorts all need fresh frames.
      tiles.addEventListener(
        'needs-render' as never,
        (() => {
          entry?.requestRender();
        }) as never,
      );
      tiles.addEventListener(
        'needs-update' as never,
        (() => {
          entry?.requestRender();
        }) as never,
      );

      // LOD traversal runs every rendered frame against the context's draw
      // camera (its matrices track the live map view).
      removeFrameHook = entry.addFrameHook(() => {
        if (!tiles || !entry) return;
        tiles.setResolutionFromRenderer(entry.lodCamera, entry.renderer);
        tiles.update();
      });

      entry.requestRender();
    } catch (error) {
      console.error('Error adding 3d-tiles layer:', error);
    }
  };

  // Attach readiness. MapLibre's only precondition for addLayer() is that
  // the parsed style object exists — tile-settling signals (isStyleLoaded /
  // idle) are the WRONG gate here: a streaming source (terrain DEM at high
  // pitch toward the horizon requests tiles for a long time) can keep them
  // false indefinitely, and 'style.load' may have fired before we bind. So
  // poll getStyle() (truthy as soon as the spec is parsed, unaffected by
  // in-flight tiles) and take 'load' as the fast path.
  const setupMap = (mapInstance: Map) => {
    if (!mapInstance) return;

    const markReady = () => {
      if (map.value !== mapInstance || loaded.value) return;
      loaded.value = true;
      // Attach directly: routing this through watch(loaded) is racy — a
      // synchronous markReady during setup fires before that watch exists.
      addLayer();
    };
    const stylePoll = () => {
      if (map.value !== mapInstance || loaded.value) return;
      if (mapInstance.getStyle()) {
        markReady();
      } else {
        setTimeout(stylePoll, 100);
      }
    };
    stylePoll();
    mapInstance.once('load', markReady);
  };

  watch(
    map,
    (newMap) => {
      if (newMap) {
        setupMap(newMap);
      }
    },
    { immediate: true },
  );

  watch(
    () => props.errorTarget,
    (errorTarget) => {
      if (tiles) {
        tiles.errorTarget = errorTarget;
        entry?.requestRender();
      }
    },
  );

  watch(
    () => [props.rotation, props.scale, props.altitude, props.anchor],
    () => {
      applyTransform();
      entry?.requestRender();
    },
  );

  onBeforeUnmount(() => {
    const mapInstance = getMapInstance();

    try {
      if (removeFrameHook) {
        removeFrameHook();
        removeFrameHook = null;
      }
      if (tiles) {
        contentGroup?.remove(tiles.group);
        tiles.dispose();
        tiles = null;
      }
      if (entry && contentGroup) {
        entry.scene.remove(contentGroup);
      }
      if (entry) {
        releaseSparkRenderer(entry);
      }
      if (mapInstance && entry) {
        releaseThreeScene(mapInstance);
        mapInstance.triggerRepaint();
      }
    } catch (error) {
      console.error('Error cleaning up 3d-tiles layer:', error);
    }
    contentGroup = null;
    anchorCoord = null;
    entry = null;
  });
</script>

<template>
  <slot></slot>
</template>
