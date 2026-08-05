/**
 * `@geoql/v-maplibre/splat` subpath entry.
 *
 * Georeferenced Gaussian-splat layer (`.ply` / `.spz` / `.splat` /
 * `.ksplat` / `.sog`) rendered via Spark. Requires the three.js peers:
 *
 * `pnpm add three @sparkjsdev/spark @dvt3d/maplibre-three-plugin`
 */
import { defineAsyncComponent, type Component } from 'vue';

export const VLayerSplat: Component = defineAsyncComponent(() =>
  import('./layers/three/splat').then((m) => m.SplatLayer),
);
