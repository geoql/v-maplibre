import { defineAsyncComponent, type Component } from 'vue';

export { CanvasLayer as VLayerMaplibreCanvas } from './maplibre/canvas';
export { GeojsonLayer as VLayerMaplibreGeojson } from './maplibre/geojson';
export { ImageLayer as VLayerMaplibreImage } from './maplibre/image';
export { RasterLayer as VLayerMaplibreRaster } from './maplibre/raster';
export { VectorLayer as VLayerMaplibreVector } from './maplibre/vector';
export { VideoLayer as VLayerMaplibreVideo } from './maplibre/video';
export { PmtileLayer as VLayerMaplibrePmtile } from './maplibre/pmtile';
export { ClusterLayer as VLayerMaplibreCluster } from './maplibre/custom/cluster';
export { RouteLayer as VLayerMaplibreRoute } from './maplibre/custom/route';
export { VLayerMaplibreIsochrone } from './maplibre/custom/isochrone';

export const VLayerMaplibreStarfield: Component = defineAsyncComponent(() =>
  import('./maplibre/custom/starfield').then((m) => m.StarfieldLayer),
);

export * from './deckgl';
