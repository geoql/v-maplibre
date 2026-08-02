<script setup lang="ts">
  /**
   * OGC 3D Tiles layer — streams a tileset (mesh tiles and/or
   * `KHR_gaussian_splatting` + SPZ splat tiles) through
   * NASA-AMMOS/3DTilesRendererJS inside a shared three.js scene drawing
   * into MapLibre's WebGL2 context.
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
  import { Creator, SceneTransform } from '@dvt3d/maplibre-three-plugin';
  import { MathUtils, Sphere, type Group } from 'three';
  import type { Map } from 'maplibre-gl';
  import { injectStrict, MapKey } from '../../../utils';
  import {
    acquireThreeScene,
    releaseThreeScene,
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
     * derived from the tileset's bounding sphere on load.
     */
    anchor?: [number, number];
    /** Anchor altitude override in meters (defaults to derived height). */
    altitude?: number;
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
  let anchored = false;

  const getMapInstance = (): Map | null => {
    return map.value || null;
  };

  const triggerRepaint = (): void => {
    const mapInstance = getMapInstance();
    if (mapInstance && typeof mapInstance.triggerRepaint === 'function') {
      mapInstance.triggerRepaint();
    }
  };

  /**
   * Re-root the ECEF tileset at a local Y-up frame anchored at
   * lat/lon/height (same math as 3d-tiles-renderer's ReorientationPlugin)
   * and place/scale the RTC group at that geographic anchor.
   */
  const applyAnchor = (
    latRad: number,
    lonRad: number,
    height: number,
  ): void => {
    if (!tiles || !rtcGroup) return;
    const group = tiles.group;
    // Frame arg omitted — getObjectFrame defaults to OBJECT_FRAME (+Y up,
    // +Z forward), which is also not re-exported from the package root.
    tiles.ellipsoid.getObjectFrame(
      latRad,
      lonRad,
      height,
      0,
      0,
      0,
      group.matrix,
    );
    group.matrix
      .invert()
      .decompose(group.position, group.quaternion, group.scale);
    group.updateMatrixWorld(true);

    const lng = MathUtils.radToDeg(lonRad);
    const lat = MathUtils.radToDeg(latRad);
    const altitude = props.altitude ?? height;
    rtcGroup.position.copy(
      SceneTransform.lngLatToVector3([lng, lat, altitude]),
    );
    // Re-rooted tileset space is Y-up / X-west / Z-north; the RTC parent
    // frame (before the world transform) is x-west / y-south / z-up.
    // Rx(+90°) maps Y-up onto z-up and Z-north onto -y (= north).
    rtcGroup.rotation.set(Math.PI / 2, 0, 0);
    const upm = SceneTransform.projectedUnitsPerMeter(lat);
    rtcGroup.scale.setScalar(upm);
    anchored = true;
    triggerRepaint();
  };

  const onLoadRootTileset = (event: { tileset: object; url: string }): void => {
    if (!tiles) return;
    if (props.anchor) {
      applyAnchor(
        MathUtils.degToRad(props.anchor[1]),
        MathUtils.degToRad(props.anchor[0]),
        props.altitude ?? 0,
      );
    } else {
      const sphere = new Sphere();
      if (tiles.getBoundingSphere(sphere)) {
        const cart = { lat: 0, lon: 0, height: 0 };
        tiles.ellipsoid.getPositionToCartographic(sphere.center, cart);
        applyAnchor(cart.lat, cart.lon, cart.height);
      }
    }
    emit('loadTileset', event.tileset, event.url);
  };

  const onPreRender = (): void => {
    if (!entry || !tiles || !anchored) return;
    tiles.setResolutionFromRenderer(
      entry.mapScene.camera,
      entry.mapScene.renderer,
    );
    tiles.update();
    // Keep frames coming while downloads are in flight; a static map stops
    // rendering (and therefore stops ticking update()) otherwise.
    if (tiles.loadProgress < 1) {
      triggerRepaint();
    }
  };

  const addLayer = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance || !mapInstance.isStyleLoaded() || entry) return;

    try {
      entry = acquireThreeScene(mapInstance);
      const { mapScene } = entry;

      rtcGroup = Creator.createRTCGroup(
        [0, 0, 0],
        [Math.PI / 2, 0, 0],
        [1, 1, 1],
      );
      rtcGroup.visible = false;

      tiles = new TilesRenderer(props.url);
      tiles.errorTarget = props.errorTarget;
      if (props.fetchOptions) {
        tiles.fetchOptions = props.fetchOptions;
      }
      if (props.fade) {
        tiles.registerPlugin(new TilesFadePlugin());
      }
      if (props.splats) {
        tiles.registerPlugin(
          new GaussianSplatPlugin({
            renderer: mapScene.renderer,
            scene: mapScene.scene,
          }),
        );
      }
      tiles.setCamera(mapScene.camera);
      tiles.setResolutionFromRenderer(mapScene.camera, mapScene.renderer);

      tiles.addEventListener('load-root-tileset', ((event: unknown) => {
        const e = event as { tileset: object; url: string };
        if (rtcGroup) rtcGroup.visible = true;
        onLoadRootTileset(e);
      }) as never);
      tiles.addEventListener('load-error', ((event: unknown) => {
        const e = event as { error: Error };
        emit('error', e.error);
      }) as never);
      // Fade transitions and async splat sorts request extra composites.
      tiles.addEventListener('needs-render' as never, triggerRepaint as never);
      tiles.addEventListener('needs-update' as never, triggerRepaint as never);

      rtcGroup.add(tiles.group);
      mapScene.addObject(rtcGroup);
      mapScene.on('preRender', onPreRender);

      if (props.before) {
        mapScene.layerBeforeTo(props.before);
      }
      triggerRepaint();
    } catch (error) {
      console.error('Error adding 3d-tiles layer:', error);
    }
  };

  const setupMap = (mapInstance: Map) => {
    if (!mapInstance) return;

    mapInstance.on('style.load', () => {
      const styleTimeout = () => {
        if (!mapInstance.isStyleLoaded()) {
          loaded.value = false;
          setTimeout(styleTimeout, 200);
        } else {
          loaded.value = true;
        }
      };
      styleTimeout();
    });
  };

  watch(
    map,
    (newMap) => {
      if (newMap) {
        setupMap(newMap);
        if (newMap.isStyleLoaded()) {
          loaded.value = true;
        }
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
    () => [props.anchor, props.altitude],
    () => {
      if (tiles && props.anchor) {
        applyAnchor(
          MathUtils.degToRad(props.anchor[1]),
          MathUtils.degToRad(props.anchor[0]),
          props.altitude ?? 0,
        );
      }
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
      if (mapInstance && entry) {
        releaseThreeScene(mapInstance);
        triggerRepaint();
      }
    } catch (error) {
      console.error('Error cleaning up 3d-tiles layer:', error);
    }
    rtcGroup = null;
    entry = null;
  });
</script>

<template>
  <slot></slot>
</template>
