/**
 * `@geoql/v-maplibre/3d-tiles` subpath entry.
 *
 * OGC 3D Tiles layer (mesh + `KHR_gaussian_splatting` SPZ splat tiles)
 * streamed via NASA-AMMOS/3DTilesRendererJS. Requires the three.js peers:
 *
 * `pnpm add three 3d-tiles-renderer @dvt3d/maplibre-three-plugin @sparkjsdev/spark 3d-tiles-rendererjs-3dgs-plugin`
 */
import { defineAsyncComponent, type Component } from 'vue';

export const VLayer3DTiles: Component = defineAsyncComponent(() =>
  import('./layers/three/tiles-3d').then((m) => m.Tiles3DLayer),
);
