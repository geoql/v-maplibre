<script setup lang="ts">
  /**
   * OGC 3D Tiles layer — streams a tileset (mesh tiles and/or
   * `KHR_gaussian_splatting` + SPZ splat tiles) through
   * NASA-AMMOS/3DTilesRendererJS inside a shared three.js scene drawing
   * into MapLibre's WebGL2 context (the same MapScene pipeline the splat
   * layer uses).
   *
   * The ECEF tileset is re-rooted to its local frame with the inverse of its
   * root transform, placed at the geographic anchor via the plugin's RTC
   * group, and `TilesRenderer.update()` is driven each frame from MapScene's
   * preRender hook with a traversal camera positioned at the map camera.
   *
   * @requires `three`, `3d-tiles-renderer`, `@dvt3d/maplibre-three-plugin`
   * @requires `@sparkjsdev/spark` + `3d-tiles-rendererjs-3dgs-plugin` (splat tiles)
   *
   * Install with:
   * `pnpm add three 3d-tiles-renderer @dvt3d/maplibre-three-plugin @sparkjsdev/spark 3d-tiles-rendererjs-3dgs-plugin`
   */
  import { ref, watch, onBeforeUnmount } from 'vue';
  import { TilesRenderer } from '3d-tiles-renderer';
  import { TilesFadePlugin } from '3d-tiles-renderer/plugins';
  import { GaussianSplatPlugin } from '3d-tiles-rendererjs-3dgs-plugin';
  import { SparkRenderer } from '@sparkjsdev/spark';
  import { Creator, SceneTransform } from '@dvt3d/maplibre-three-plugin';
  import {
    MathUtils,
    Matrix4,
    PerspectiveCamera,
    Vector3,
    type Group,
  } from 'three';
  import type { Map } from 'maplibre-gl';
  import { injectStrict, MapKey } from '../../../utils';
  import {
    acquireThreeScene,
    releaseThreeScene,
    retainSparkRenderer,
    releaseSparkRenderer,
    type ThreeSceneEntry,
  } from '../_shared/useThreeScene';

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
    /** Cross-fade tiles on LOD switches via TilesFadePlugin. */
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
     * content sits in its raw glTF Y-up frame — the default `[90, 180, 0]`
     * (same as VLayerSplat) turns that into the map's Z-up frame.
     */
    rotation?: [number, number, number];
    /** Uniform scale multiplier on top of the meters-at-latitude scaling. */
    scale?: number;
    /** `fetch` options forwarded to every tileset/tile request. */
    fetchOptions?: RequestInit;
    /** Move the shared three.js scene layer before this MapLibre layer id. */
    before?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    id: '3d-tiles',
    errorTarget: 8,
    fade: true,
    splats: true,
    anchor: undefined,
    altitude: undefined,
    rotation: () => [90, 180, 0],
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
  let rtcGroup: Group | null = null;
  let tiles: TilesRenderer | null = null;
  let traversalCamera: PerspectiveCamera | null = null;
  let anchorCoord: [number, number, number] | null = null;

  const getMapInstance = (): Map | null => {
    return map.value || null;
  };

  const triggerRepaint = (): void => {
    const mapInstance = getMapInstance();
    if (mapInstance && typeof mapInstance.triggerRepaint === 'function') {
      mapInstance.triggerRepaint();
    }
  };

  const toRadians = (
    deg: [number, number, number],
  ): [number, number, number] => [
    MathUtils.degToRad(deg[0]),
    MathUtils.degToRad(deg[1]),
    MathUtils.degToRad(deg[2]),
  ];

  const applyTransform = (): void => {
    if (!rtcGroup || !anchorCoord) return;
    rtcGroup.position.copy(SceneTransform.lngLatToVector3(anchorCoord));
    const [rx, ry, rz] = toRadians(props.rotation);
    rtcGroup.rotation.set(rx, ry, rz);
    const upm = SceneTransform.projectedUnitsPerMeter(anchorCoord[1]);
    rtcGroup.scale.setScalar(upm * props.scale);
  };

  /**
   * Re-root the ECEF tileset at its geographic anchor.
   *
   * The GaussianSplatPlugin places every tile's SplatMesh at its ECEF
   * position via `sceneMatrix = upRotationMatrix × tileTransform` (verified:
   * upRot = rotateX(-90°), translation = the ECEF anchor). That leaves the
   * content ~15 km above the anchor in MapScene's mercator frame unless the
   * group recenter counteracts BOTH factors. So we recenter the tiles group
   * with `(upRot × rootTransform)^-1 = rootTransform^-1 × upRot^-1`, which
   * makes `recenter × sceneMatrix = identity` for the root tile (and leaves
   * child tiles at their correct relative offsets), placing the content at
   * the anchor like the standalone splat.
   */
  const onLoadRootTileset = (event: { tileset: object; url: string }): void => {
    if (!tiles || !entry) return;

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
    tiles.group.updateMatrixWorld(true);

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

    rtcGroup = Creator.createRTCGroup(
      anchorCoord,
      toRadians(props.rotation),
      [1, 1, 1],
    );
    applyTransform();
    rtcGroup.add(tiles.group);
    entry.mapScene.addObject(rtcGroup);

    if (props.before) {
      entry.mapScene.layerBeforeTo(props.before);
    }
    triggerRepaint();
    emit('loadTileset', event.tileset, event.url);
  };

  // `tiles.update()` is what kicks off the root-tileset fetch and drives LOD,
  // so it must run every frame once the layer is up. The traversal camera
  // tracks the map camera so screen-space-error distances stay sane.
  const onPreRender = (): void => {
    if (!entry || !tiles || !traversalCamera) return;
    const sceneCam = entry.mapScene.camera;

    // Use the scene camera's EXACT projection matrix for the traversal, NOT a
    // standard PerspectiveCamera recomputed from fov/aspect/near/far — the
    // MapScene renders with CameraSync's custom makePerspectiveMatrix (with
    // centerOffset and MapLibre's near/far mapping), which differs from a
    // standard perspective, so a recomputed frustum doesn't match the render
    // view and culls the content. Identity view: the frustum then equals the
    // scene camera's projection × the tiles group's own world matrix — the
    // exact transform the MapScene renders with, so content that draws at the
    // anchor is in the frustum.
    traversalCamera.projectionMatrix.copy(sceneCam.projectionMatrix);
    traversalCamera.projectionMatrixInverse.copy(
      sceneCam.projectionMatrixInverse,
    );
    traversalCamera.matrixWorld.identity();
    traversalCamera.matrixWorldInverse.identity();

    tiles.setResolutionFromRenderer(traversalCamera, entry.mapScene.renderer);
    tiles.update();

    // Keep frames coming while downloads are in flight; a static map stops
    // rendering (and therefore stops ticking update()) otherwise.
    if (tiles.loadProgress < 1) {
      triggerRepaint();
    }
  };

  const addLayer = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance || entry) return;

    try {
      entry = acquireThreeScene(mapInstance);
      const { mapScene } = entry;

      // Retain a plain SparkRenderer (the same one the splat layer uses).
      // The plugin's CameraRelativeSparkRenderer re-bases splats around the
      // camera, but MapScene overwrites the camera's matrixWorld to identity
      // each render, breaking that rebasing so nothing draws. A plain
      // SparkRenderer relies on the world-group view transform instead and
      // renders the tiles' SplatMesh content like the standalone splat.
      const spark = retainSparkRenderer(
        entry,
        () => new SparkRenderer({ renderer: mapScene.renderer }),
      );
      spark.onDirty = () => triggerRepaint();

      traversalCamera = new PerspectiveCamera();

      tiles = new TilesRenderer(props.url);
      tiles.errorTarget = props.errorTarget;
      if (props.fetchOptions) tiles.fetchOptions = props.fetchOptions;
      if (props.fade) tiles.registerPlugin(new TilesFadePlugin());
      if (props.splats) {
        tiles.registerPlugin(
          new GaussianSplatPlugin({
            renderer: mapScene.renderer,
            scene: mapScene.scene,
          }),
        );
        // The plugin adds a CameraRelativeSparkRenderer to the scene, which
        // re-bases splats around camera.matrixWorld each frame. MapScene
        // renders with an identity camera (the world group carries the view
        // transform), so that rebasing pins the splats to the screen instead
        // of the map. Hide it — the shared plain SparkRenderer above (the
        // same mechanism VLayerSplat uses) renders the tile SplatMeshes
        // through the scene graph correctly.
        mapScene.scene.traverse((object) => {
          if (
            object !== spark &&
            object.constructor.name === 'CameraRelativeSparkRenderer'
          ) {
            object.visible = false;
          }
        });
      }
      tiles.setCamera(traversalCamera);
      tiles.setResolutionFromRenderer(traversalCamera, mapScene.renderer);

      tiles.addEventListener('load-root-tileset', ((event: unknown) => {
        onLoadRootTileset(event as { tileset: object; url: string });
      }) as never);
      tiles.addEventListener('load-error', ((event: unknown) => {
        const e = event as { error: Error };
        emit('error', e.error);
      }) as never);
      // Fade transitions and async splat sorts request extra composites.
      tiles.addEventListener('needs-render' as never, triggerRepaint as never);
      tiles.addEventListener('needs-update' as never, triggerRepaint as never);

      mapScene.on('preRender', onPreRender);
      triggerRepaint();
    } catch (error) {
      console.error('Error adding 3d-tiles layer:', error);
    }
  };

  // Style readiness, robust against two MapLibre quirks:
  //  1. 'style.load' may have fired BEFORE this component binds (fast or
  //     cached styles), so an event-only listener would never trigger —
  //     poll isStyleLoaded() instead (it oscillates while tiles stream, so
  //     a one-shot check is not enough either).
  //  2. isStyleLoaded() can stay false indefinitely when the style
  //     references a missing sprite image; 'idle' still fires once
  //     rendering settles, and attaching is safe from that point on.
  const setupMap = (mapInstance: Map) => {
    if (!mapInstance) return;

    const markReady = () => {
      if (map.value !== mapInstance) return;
      loaded.value = true;
    };
    const styleTimeout = () => {
      if (map.value !== mapInstance || loaded.value) return;
      if (mapInstance.isStyleLoaded()) {
        markReady();
      } else {
        setTimeout(styleTimeout, 200);
      }
    };
    styleTimeout();
    mapInstance.once('idle', markReady);
    mapInstance.on('style.load', markReady);
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

  watch(loaded, (value) => {
    if (value) {
      addLayer();
    }
  });

  watch(
    () => props.errorTarget,
    (errorTarget) => {
      if (tiles) {
        tiles.errorTarget = errorTarget;
        triggerRepaint();
      }
    },
  );

  watch(
    () => [props.rotation, props.scale, props.altitude],
    () => {
      applyTransform();
      triggerRepaint();
    },
  );

  onBeforeUnmount(() => {
    const mapInstance = getMapInstance();

    try {
      if (entry) {
        entry.mapScene.off('preRender', onPreRender as never);
      }
      if (tiles) {
        rtcGroup?.remove(tiles.group);
        tiles.dispose();
        tiles = null;
      }
      if (entry && rtcGroup) {
        entry.mapScene.removeObject(rtcGroup);
      }
      if (entry) {
        releaseSparkRenderer(entry);
      }
      if (mapInstance && entry) {
        releaseThreeScene(mapInstance);
        triggerRepaint();
      }
    } catch (error) {
      console.error('Error cleaning up 3d-tiles layer:', error);
    }
    rtcGroup = null;
    traversalCamera = null;
    anchorCoord = null;
    entry = null;
  });
</script>

<template>
  <slot></slot>
</template>
