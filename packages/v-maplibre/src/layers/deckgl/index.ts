import { defineAsyncComponent, type Component } from 'vue';

export const VLayerDeckgl: Component = defineAsyncComponent(() =>
  import('./generic').then((m) => m.VLayerDeckgl),
);

export const VLayerDeckglScatterplot: Component = defineAsyncComponent(() =>
  import('./scatterplot').then((m) => m.VLayerDeckglScatterplot),
);
export const VLayerDeckglArc: Component = defineAsyncComponent(() =>
  import('./arc').then((m) => m.VLayerDeckglArc),
);
export const VLayerDeckglGeojson: Component = defineAsyncComponent(() =>
  import('./geojson').then((m) => m.VLayerDeckglGeojson),
);
export const VLayerDeckglPath: Component = defineAsyncComponent(() =>
  import('./path').then((m) => m.VLayerDeckglPath),
);
export const VLayerDeckglLine: Component = defineAsyncComponent(() =>
  import('./line').then((m) => m.VLayerDeckglLine),
);
export const VLayerDeckglPolygon: Component = defineAsyncComponent(() =>
  import('./polygon').then((m) => m.VLayerDeckglPolygon),
);
export const VLayerDeckglSolidPolygon: Component = defineAsyncComponent(() =>
  import('./solid-polygon').then((m) => m.VLayerDeckglSolidPolygon),
);
export const VLayerDeckglIcon: Component = defineAsyncComponent(() =>
  import('./icon').then((m) => m.VLayerDeckglIcon),
);
export const VLayerDeckglText: Component = defineAsyncComponent(() =>
  import('./text').then((m) => m.VLayerDeckglText),
);
export const VLayerDeckglColumn: Component = defineAsyncComponent(() =>
  import('./column').then((m) => m.VLayerDeckglColumn),
);
export const VLayerDeckglBitmap: Component = defineAsyncComponent(() =>
  import('./bitmap').then((m) => m.VLayerDeckglBitmap),
);
export const VLayerDeckglGridCell: Component = defineAsyncComponent(() =>
  import('./grid-cell').then((m) => m.VLayerDeckglGridCell),
);
export const VLayerDeckglPointCloud: Component = defineAsyncComponent(() =>
  import('./point-cloud').then((m) => m.VLayerDeckglPointCloud),
);

export const VLayerDeckglHeatmap: Component = defineAsyncComponent(() =>
  import('./heatmap').then((m) => m.VLayerDeckglHeatmap),
);
export const VLayerDeckglHexagon: Component = defineAsyncComponent(() =>
  import('./hexagon').then((m) => m.VLayerDeckglHexagon),
);
export const VLayerDeckglGrid: Component = defineAsyncComponent(() =>
  import('./grid').then((m) => m.VLayerDeckglGrid),
);
export const VLayerDeckglContour: Component = defineAsyncComponent(() =>
  import('./contour').then((m) => m.VLayerDeckglContour),
);
export const VLayerDeckglScreenGrid: Component = defineAsyncComponent(() =>
  import('./screen-grid').then((m) => m.VLayerDeckglScreenGrid),
);

export const VLayerDeckglTrips: Component = defineAsyncComponent(() =>
  import('./trips').then((m) => m.VLayerDeckglTrips),
);
export const VLayerDeckglH3Hexagon: Component = defineAsyncComponent(() =>
  import('./h3-hexagon').then((m) => m.VLayerDeckglH3Hexagon),
);
export const VLayerDeckglH3Cluster: Component = defineAsyncComponent(() =>
  import('./h3-cluster').then((m) => m.VLayerDeckglH3Cluster),
);
export const VLayerDeckglMVT: Component = defineAsyncComponent(() =>
  import('./mvt').then((m) => m.VLayerDeckglMVT),
);
export const VLayerDeckglTile: Component = defineAsyncComponent(() =>
  import('./tile').then((m) => m.VLayerDeckglTile),
);
export const VLayerDeckglTile3D: Component = defineAsyncComponent(() =>
  import('./tile-3d').then((m) => m.VLayerDeckglTile3D),
);
export const VLayerDeckglTerrain: Component = defineAsyncComponent(() =>
  import('./terrain').then((m) => m.VLayerDeckglTerrain),
);
export const VLayerDeckglGreatCircle: Component = defineAsyncComponent(() =>
  import('./great-circle').then((m) => m.VLayerDeckglGreatCircle),
);
export const VLayerDeckglS2: Component = defineAsyncComponent(() =>
  import('./s2').then((m) => m.VLayerDeckglS2),
);
export const VLayerDeckglGeohash: Component = defineAsyncComponent(() =>
  import('./geohash').then((m) => m.VLayerDeckglGeohash),
);
export const VLayerDeckglQuadkey: Component = defineAsyncComponent(() =>
  import('./quadkey').then((m) => m.VLayerDeckglQuadkey),
);
export const VLayerDeckglWMS: Component = defineAsyncComponent(() =>
  import('./wms').then((m) => m.VLayerDeckglWMS),
);

export const VLayerDeckglSimpleMesh: Component = defineAsyncComponent(() =>
  import('./simple-mesh').then((m) => m.VLayerDeckglSimpleMesh),
);
export const VLayerDeckglScenegraph: Component = defineAsyncComponent(() =>
  import('./scenegraph').then((m) => m.VLayerDeckglScenegraph),
);

export const VLayerDeckglCOG: Component = defineAsyncComponent(() =>
  import('./cog').then((m) => m.VLayerDeckglCOG),
);
export const VLayerDeckglMosaic: Component = defineAsyncComponent(() =>
  import('./mosaic').then((m) => m.VLayerDeckglMosaic),
);
export type { MosaicSource, MosaicRenderMode, RenderModule } from './mosaic';
export const VLayerDeckglMultiCOG: Component = defineAsyncComponent(() =>
  import('./multi-cog').then((m) => m.VLayerDeckglMultiCOG),
);
export type { MultiCOGComposite } from './multi-cog';
export const VLayerDeckglZarr: Component = defineAsyncComponent(() =>
  import('./zarr').then((m) => m.VLayerDeckglZarr),
);

export const VLayerDeckglGeoArrowScatterplot: Component = defineAsyncComponent(
  () =>
    import('./geoarrow-scatterplot').then(
      (m) => m.VLayerDeckglGeoArrowScatterplot,
    ),
);
export const VLayerDeckglGeoArrowPath: Component = defineAsyncComponent(() =>
  import('./geoarrow-path').then((m) => m.VLayerDeckglGeoArrowPath),
);
export const VLayerDeckglGeoArrowPolygon: Component = defineAsyncComponent(() =>
  import('./geoarrow-polygon').then((m) => m.VLayerDeckglGeoArrowPolygon),
);
export const VLayerDeckglGeoArrowSolidPolygon: Component = defineAsyncComponent(
  () =>
    import('./geoarrow-solid-polygon').then(
      (m) => m.VLayerDeckglGeoArrowSolidPolygon,
    ),
);
export const VLayerDeckglGeoArrowText: Component = defineAsyncComponent(() =>
  import('./geoarrow-text').then((m) => m.VLayerDeckglGeoArrowText),
);
export const VLayerDeckglGeoArrowTrips: Component = defineAsyncComponent(() =>
  import('./geoarrow-trips').then((m) => m.VLayerDeckglGeoArrowTrips),
);

export const VLayerDeckglWindParticle: Component = defineAsyncComponent(() =>
  import('./wind-particle').then((m) => m.VLayerDeckglWindParticle),
);
export {
  createWindDataFromOpenWeatherMap,
  type WindDataPoint,
  type WindTextureResult,
  type GenerateWindTextureOptions,
  type ColorStop,
} from './wind-particle';

export {
  useDeckOverlay,
  useDeckLayers,
  DeckOverlayKey,
  DeckLayersKey,
} from './_shared';
export * from './_shared/types';
