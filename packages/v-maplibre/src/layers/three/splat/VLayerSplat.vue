<script setup lang="ts">
  /**
   * Georeferenced Gaussian-splat layer (`.ply` / `.spz` / `.splat` /
   * `.ksplat` / `.sog`) rendered through Spark inside a shared three.js
   * scene that draws directly into MapLibre's WebGL2 context.
   *
   * @requires `three`, `@sparkjsdev/spark`, `@dvt3d/maplibre-three-plugin`
   *
   * Install with:
   * `pnpm add three @sparkjsdev/spark @dvt3d/maplibre-three-plugin`
   */
  import { ref, watch, onBeforeUnmount } from 'vue';
  import { SparkRenderer, SplatMesh } from '@sparkjsdev/spark';
  import { Creator, SceneTransform } from '@dvt3d/maplibre-three-plugin';
  import { MathUtils, type Group } from 'three';
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
     * frame into the map frame. The default `[90, 180, 0]` turns Y-up
     * (three.js / glTF convention) content into the map's Z-up frame.
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
    /** Move the shared three.js scene layer before this MapLibre layer id. */
    before?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    id: 'splat',
    altitude: 0,
    rotation: () => [90, 180, 0],
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
  let rtcGroup: Group | null = null;
  let splatMesh: SplatMesh | null = null;

  const getMapInstance = (): Map | null => {
    return map.value || null;
  };

  const toRadians = (
    deg: [number, number, number],
  ): [number, number, number] => [
    MathUtils.degToRad(deg[0]),
    MathUtils.degToRad(deg[1]),
    MathUtils.degToRad(deg[2]),
  ];

  const applyTransform = (): void => {
    if (!rtcGroup) return;
    const center: number[] = [props.longitude, props.latitude, props.altitude];
    rtcGroup.position.copy(SceneTransform.lngLatToVector3(center));
    const [rx, ry, rz] = toRadians(props.rotation);
    rtcGroup.rotation.set(rx, ry, rz);
    const upm = SceneTransform.projectedUnitsPerMeter(props.latitude);
    rtcGroup.scale.setScalar(upm * props.scale);
  };

  const createMesh = (): void => {
    if (!entry || !rtcGroup) return;
    const mapInstance = getMapInstance();

    splatMesh = new SplatMesh({
      url: props.url,
      lod: props.lod,
      onLoad: (mesh: SplatMesh) => {
        emit('load', mesh);
        mapInstance?.triggerRepaint();
      },
      onProgress: (event: ProgressEvent) => {
        emit('progress', event);
      },
    });
    splatMesh.maxSh = props.maxSh;
    splatMesh.initialized.catch((error: unknown) => {
      emit('error', error instanceof Error ? error : new Error(String(error)));
    });
    rtcGroup.add(splatMesh);
  };

  const destroyMesh = (): void => {
    if (!splatMesh) return;
    rtcGroup?.remove(splatMesh);
    splatMesh.dispose();
    splatMesh = null;
  };

  const addLayer = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance || !mapInstance.isStyleLoaded() || entry) return;

    try {
      entry = acquireThreeScene(mapInstance);
      const spark = retainSparkRenderer(
        entry,
        () => new SparkRenderer({ renderer: entry!.mapScene.renderer }),
      );
      // Spark sorts splats asynchronously in a worker; each completed sort
      // needs a MapLibre composite to become visible.
      spark.onDirty = () => mapInstance.triggerRepaint();

      rtcGroup = Creator.createRTCGroup(
        [props.longitude, props.latitude, props.altitude],
        toRadians(props.rotation),
        [1, 1, 1],
      );
      applyTransform();
      createMesh();
      entry.mapScene.addObject(rtcGroup);

      if (props.before) {
        entry.mapScene.layerBeforeTo(props.before);
      }
      mapInstance.triggerRepaint();
    } catch (error) {
      console.error('Error adding splat layer:', error);
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
    () => [props.longitude, props.latitude, props.altitude, props.scale],
    () => {
      applyTransform();
      getMapInstance()?.triggerRepaint();
    },
  );

  watch(
    () => props.rotation,
    () => {
      applyTransform();
      getMapInstance()?.triggerRepaint();
    },
  );

  watch(
    () => props.maxSh,
    (maxSh) => {
      if (splatMesh) {
        splatMesh.maxSh = maxSh;
        getMapInstance()?.triggerRepaint();
      }
    },
  );

  watch(
    () => [props.url, props.lod],
    () => {
      destroyMesh();
      createMesh();
      getMapInstance()?.triggerRepaint();
    },
  );

  onBeforeUnmount(() => {
    const mapInstance = getMapInstance();

    try {
      destroyMesh();
      if (entry && rtcGroup) {
        entry.mapScene.removeObject(rtcGroup);
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
    rtcGroup = null;
    entry = null;
  });
</script>

<template>
  <slot></slot>
</template>
