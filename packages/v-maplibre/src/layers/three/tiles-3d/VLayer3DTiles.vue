<script setup lang="ts">
  /**
   * OGC 3D Tiles layer — streams a tileset (mesh tiles and/or
   * `KHR_gaussian_splatting` + SPZ splat tiles) through
   * NASA-AMMOS/3DTilesRendererJS, drawn into MapLibre's WebGL2 context via a
   * dedicated custom layer.
   *
   * Uses the two-camera architecture from MapLibre's official
   * `add-3d-tiles-using-threejs` example: a rendering camera carries the
   * combined MapLibre MVP, while a separate traversal camera (pure projection
   * + extracted view matrix) drives `TilesRenderer.update()`. Reusing one
   * camera for both corrupts the frustum because MapLibre's projection matrix
   * already bakes in the view transform.
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
  import {
    Matrix4,
    PerspectiveCamera,
    Scene,
    Sphere,
    Vector3,
    WebGLRenderer,
  } from 'three';
  import {
    MercatorCoordinate,
    type CustomLayerInterface,
    type CustomRenderMethodInput,
    type Map,
  } from 'maplibre-gl';
  import { injectStrict, MapKey } from '../../../utils';

  interface Props {
    /** Unique identifier used for the MapLibre custom layer. */
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
    /** Insert the custom layer before this MapLibre layer id. */
    before?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    id: 'v-3d-tiles',
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

  let renderer: WebGLRenderer | null = null;
  let scene: Scene | null = null;
  let camera: PerspectiveCamera | null = null;
  let tilesCamera: PerspectiveCamera | null = null;
  let tiles: TilesRenderer | null = null;
  let localTransform: Matrix4 | null = null;
  let addedMap: Map | null = null;

  const getMapInstance = (): Map | null => map.value || null;

  const triggerRepaint = (): void => {
    const mapInstance = getMapInstance();
    if (mapInstance && typeof mapInstance.triggerRepaint === 'function') {
      mapInstance.triggerRepaint();
    }
  };

  /**
   * Build the ECEF→mercator model transform for the tileset anchor and
   * re-center the tileset group on that anchor. Called once the root tileset
   * is available (or immediately when an explicit `anchor` prop is set).
   */
  const buildLocalTransform = (
    lng: number,
    lat: number,
    height: number,
  ): void => {
    const coord = MercatorCoordinate.fromLngLat([lng, lat], height);
    const scale = coord.meterInMercatorCoordinateUnits();
    localTransform = new Matrix4()
      .makeTranslation(coord.x, coord.y, coord.z)
      .scale(new Vector3(scale, -scale, scale))
      .multiply(new Matrix4().makeRotationX(Math.PI / 2));
  };

  const onLoadRootTileset = (event: { tileset: object; url: string }): void => {
    if (!tiles) return;
    if (props.anchor) {
      buildLocalTransform(
        props.anchor[0],
        props.anchor[1],
        props.altitude ?? 0,
      );
    } else {
      const sphere = new Sphere();
      if (tiles.getBoundingSphere(sphere)) {
        const cart = { lat: 0, lon: 0, height: 0 };
        tiles.ellipsoid.getPositionToCartographic(sphere.center, cart);
        // Re-root the ECEF tileset into a local ENU frame (Y-up, X-west,
        // Z-north) anchored at its surface point — the same math as
        // 3d-tiles-renderer's ReorientationPlugin. Content then sits near the
        // group origin in meters and localTransform places it on the map.
        tiles.ellipsoid.getObjectFrame(
          cart.lat,
          cart.lon,
          cart.height,
          0,
          0,
          0,
          tiles.group.matrix,
        );
        tiles.group.matrix
          .invert()
          .decompose(
            tiles.group.position,
            tiles.group.quaternion,
            tiles.group.scale,
          );
        tiles.group.updateMatrixWorld(true);
        buildLocalTransform(
          (cart.lon * 180) / Math.PI,
          (cart.lat * 180) / Math.PI,
          props.altitude ?? cart.height,
        );
      }
    }
    triggerRepaint();
    emit('loadTileset', event.tileset, event.url);
  };

  const customLayer: CustomLayerInterface = {
    id: props.id,
    type: 'custom',
    renderingMode: '3d',

    onAdd(
      mapInstance: Map,
      gl: WebGLRenderingContext | WebGL2RenderingContext,
    ) {
      try {
        renderer = new WebGLRenderer({
          canvas: mapInstance.getCanvas(),
          context: gl as WebGL2RenderingContext,
          antialias: false,
        });
        renderer.autoClear = false;

        scene = new Scene();
        camera = new PerspectiveCamera();
        tilesCamera = new PerspectiveCamera();

        tiles = new TilesRenderer(props.url);
        tiles.errorTarget = props.errorTarget;
        if (props.fetchOptions) tiles.fetchOptions = props.fetchOptions;
        if (props.fade) tiles.registerPlugin(new TilesFadePlugin());
        if (props.splats) {
          tiles.registerPlugin(new GaussianSplatPlugin({ renderer, scene }));
        }
        tiles.setCamera(tilesCamera);
        tiles.setResolutionFromRenderer(tilesCamera, renderer);
        scene.add(tiles.group);

        tiles.addEventListener('load-root-tileset', ((event: unknown) => {
          onLoadRootTileset(event as { tileset: object; url: string });
        }) as never);
        tiles.addEventListener('load-error', ((event: unknown) => {
          const e = event as { error: Error };
          emit('error', e.error);
        }) as never);
        // Fade transitions and async splat sorts need extra composites.
        tiles.addEventListener(
          'needs-render' as never,
          triggerRepaint as never,
        );
        tiles.addEventListener(
          'needs-update' as never,
          triggerRepaint as never,
        );
      } catch (error) {
        console.error('Error initializing 3d-tiles layer:', error);
      }
    },

    render(_gl: WebGLRenderingContext, args: CustomRenderMethodInput) {
      if (!renderer || !scene || !camera || !tilesCamera || !tiles) return;

      // Use the full world→clip MVP (modelViewProjectionMatrix), NOT
      // defaultProjectionData.mainMatrix — the latter only projects tile-local
      // 0..EXTENT coordinates to screen and would leave our mercator content
      // off-frustum. The official add-3d-tiles example uses this same
      // world→clip matrix for the render camera.
      const m = new Matrix4().fromArray(
        args.modelViewProjectionMatrix as unknown as number[],
      );
      if (localTransform) {
        camera.projectionMatrix.copy(m).multiply(localTransform);
      } else {
        camera.projectionMatrix.copy(m);
      }

      // Extract the pure view matrix V = P^-1 * MVP for the traversal camera.
      const p = new Matrix4().fromArray(
        args.projectionMatrix as unknown as number[],
      );
      const v = new Matrix4()
        .copy(p)
        .invert()
        .multiply(camera.projectionMatrix);
      tilesCamera.projectionMatrix.copy(p);
      tilesCamera.matrixWorldInverse.copy(v);
      tilesCamera.matrixWorld.copy(v).invert();

      renderer.resetState();
      renderer.render(scene, camera);
      tiles.update();
    },
  };

  const addLayer = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance || addedMap === mapInstance) return;
    try {
      mapInstance.addLayer(customLayer, props.before);
      addedMap = mapInstance;
      triggerRepaint();
    } catch (error) {
      console.error('Error adding 3d-tiles layer:', error);
    }
  };

  // Style readiness, robust against two MapLibre quirks:
  //  1. 'style.load' may have fired BEFORE this component binds (fast or
  //     cached styles), so an event-only listener would never trigger.
  //  2. isStyleLoaded() can stay false FOREVER when the style references a
  //     missing sprite image (MapLibre keeps waiting for it) — the 'idle'
  //     event still fires once rendering settles, and addLayer() is safe
  //     from that point on.
  const setupMap = (mapInstance: Map) => {
    if (!mapInstance) return;

    const markReady = () => {
      if (map.value !== mapInstance) return;
      loaded.value = true;
    };
    if (mapInstance.isStyleLoaded()) {
      markReady();
    } else {
      mapInstance.once('idle', markReady);
    }
    mapInstance.on('style.load', markReady);
  };

  watch(
    map,
    (newMap, oldMap) => {
      // The map instance is recreated when the style object identity changes
      // (e.g. VMap :key="mapStyle" swap). Reset so addLayer() re-registers the
      // custom layer (and rebuilds the renderer on the new GL context).
      if (newMap !== oldMap) {
        addedMap = null;
        loaded.value = false;
      }
      if (newMap) setupMap(newMap);
    },
    { immediate: true },
  );

  watch(loaded, (value) => {
    if (value) addLayer();
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

  onBeforeUnmount(() => {
    const mapInstance = getMapInstance();
    try {
      if (tiles) {
        scene?.remove(tiles.group);
        tiles.dispose();
        tiles = null;
      }
      renderer?.dispose();
      renderer = null;
      if (
        mapInstance &&
        addedMap === mapInstance &&
        mapInstance.getLayer(props.id)
      ) {
        mapInstance.removeLayer(props.id);
      }
      addedMap = null;
      scene = null;
      camera = null;
      tilesCamera = null;
      triggerRepaint();
    } catch (error) {
      console.error('Error cleaning up 3d-tiles layer:', error);
    }
  });
</script>

<template>
  <slot></slot>
</template>
