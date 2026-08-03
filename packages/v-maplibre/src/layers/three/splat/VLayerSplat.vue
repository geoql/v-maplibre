<script setup lang="ts">
  /**
   * Georeferenced Gaussian-splat layer (`.ply` / `.spz` / `.splat` /
   * `.ksplat` / `.sog`) rendered through Spark inside the shared three.js
   * custom layer that draws directly into MapLibre's WebGL2 context.
   *
   * @requires `three`, `@sparkjsdev/spark`
   *
   * Install with:
   * `pnpm add three @sparkjsdev/spark`
   */
  import { ref, watch, onBeforeUnmount } from 'vue';
  import { SparkRenderer, SplatMesh } from '@sparkjsdev/spark';
  import { Group } from 'three';
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

  interface Props {
    /** Unique identifier (unused by MapLibre; splats share one scene layer). */
    id?: string;
    /** URL of the splat file (`.ply`, `.spz`, `.splat`, `.ksplat`, `.sog`). */
    url: string;
    /** Longitude of the splat anchor point. */
    longitude: number;
    /** Latitude of the splat anchor point. */
    latitude: number;
    /** Altitude of the anchor in meters above sea level. */
    altitude?: number;
    /**
     * Rotation `[x, y, z]` in degrees (XYZ order) mapping the splat's local
     * frame into the map frame. The default `[-90, 0, 0]` stands Y-up
     * (three.js / glTF convention) content up in the mercator frame.
     */
    rotation?: [number, number, number];
    /** Uniform scale multiplier on top of the meters-at-latitude scaling. */
    scale?: number;
    /**
     * Spark level-of-detail mode: `true` (auto), `'quality'`, or `false`.
     * LOD streams multi-GB scenes but adds per-frame sorting work.
     */
    lod?: boolean | 'quality';
    /** Maximum spherical-harmonics degree to render (0-3). */
    maxSh?: number;
    /** Move the shared three.js custom layer before this MapLibre layer id. */
    before?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    id: 'splat',
    altitude: 0,
    rotation: () => [-90, 0, 0],
    scale: 1,
    lod: true,
    maxSh: 3,
  });

  const emit = defineEmits<{
    load: [mesh: SplatMesh];
    progress: [event: ProgressEvent];
    error: [error: Error];
  }>();

  const map = injectStrict(MapKey);
  const loaded = ref(false);
  let entry: ThreeSceneEntry | null = null;
  let contentGroup: Group | null = null;
  let splatMesh: SplatMesh | null = null;

  const getMapInstance = (): Map | null => {
    return map.value || null;
  };

  const applyTransform = (): void => {
    const mapInstance = getMapInstance();
    if (!contentGroup || !mapInstance) return;
    contentGroup.matrix.copy(
      mercatorGroupMatrix(
        mapInstance,
        props.longitude,
        props.latitude,
        props.altitude,
        props.rotation,
        props.scale,
      ),
    );
  };

  const createMesh = (): void => {
    if (!entry || !contentGroup) return;

    splatMesh = new SplatMesh({
      url: props.url,
      lod: props.lod,
      onLoad: (mesh: SplatMesh) => {
        emit('load', mesh);
        entry?.requestRender();
      },
      onProgress: (event: ProgressEvent) => {
        emit('progress', event);
      },
    });
    splatMesh.maxSh = props.maxSh;
    splatMesh.initialized.catch((error: unknown) => {
      emit('error', error instanceof Error ? error : new Error(String(error)));
    });
    contentGroup.add(splatMesh);
  };

  const destroyMesh = (): void => {
    if (!splatMesh) return;
    contentGroup?.remove(splatMesh);
    splatMesh.dispose();
    splatMesh = null;
  };

  const addLayer = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance || entry) return;

    try {
      entry = acquireThreeScene(mapInstance);
      const spark = retainSparkRenderer(
        entry,
        () => new SparkRenderer({ renderer: entry!.renderer }),
      );
      // Async sorts complete off-frame; each completion needs a composite.
      spark.onDirty = () => entry?.requestRender();

      contentGroup = new Group();
      contentGroup.matrixAutoUpdate = false;
      applyTransform();
      createMesh();
      entry.scene.add(contentGroup);
      entry.requestRender();
    } catch (error) {
      console.error('Error adding splat layer:', error);
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
    [
      () => props.longitude,
      () => props.latitude,
      () => props.altitude,
      () => props.rotation,
      () => props.scale,
    ],
    () => {
      applyTransform();
      entry?.requestRender();
    },
  );

  watch(
    () => props.maxSh,
    (maxSh) => {
      if (splatMesh) {
        splatMesh.maxSh = maxSh;
        entry?.requestRender();
      }
    },
  );

  watch(
    () => [props.url, props.lod],
    () => {
      destroyMesh();
      createMesh();
      entry?.requestRender();
    },
  );

  onBeforeUnmount(() => {
    const mapInstance = getMapInstance();

    try {
      destroyMesh();
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
      console.error('Error cleaning up splat layer:', error);
    }
    contentGroup = null;
    entry = null;
  });
</script>

<template>
  <slot></slot>
</template>
