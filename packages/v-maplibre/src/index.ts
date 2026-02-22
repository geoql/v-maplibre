import {
  VControlAttribution,
  VControlFullscreen,
  VControlGeolocate,
  VControlNavigation,
  VControlScale,
  VControlLidar,
  VControlLayer,
  VControlLayerGroup,
  VControlLegend,
} from './controls';

import {
  VLayerMaplibreCanvas,
  VLayerMaplibreGeojson,
  VLayerMaplibreCluster,
  VLayerMaplibreImage,
  VLayerMaplibreRaster,
  VLayerMaplibreVector,
  VLayerMaplibreVideo,
  VLayerMaplibrePmtile,
  VLayerMaplibreRoute,
  VLayerMaplibreIsochrone,
  VLayerMaplibreStarfield,
} from './layers';

import VMap from './map/VMap.vue';
import VMarker from './markers/VMarker.vue';
import VPopup from './popups/VPopup.vue';

export {
  VMap,
  VMarker,
  VPopup,
  VLayerMaplibreCanvas,
  VLayerMaplibreGeojson,
  VLayerMaplibreCluster,
  VLayerMaplibreImage,
  VLayerMaplibreRaster,
  VLayerMaplibreVector,
  VLayerMaplibreVideo,
  VLayerMaplibrePmtile,
  VLayerMaplibreRoute,
  VLayerMaplibreIsochrone,
  VLayerMaplibreStarfield,
  VControlAttribution,
  VControlFullscreen,
  VControlGeolocate,
  VControlNavigation,
  VControlScale,
  VControlLidar,
  VControlLayer,
  VControlLayerGroup,
  VControlLegend,
};

export type {
  LidarControlOptions,
  ColorScheme,
  ColorSchemeType,
  ColorSchemeConfig,
  CopcLoadingMode,
  ColormapName,
  ColorRangeConfig,
  PointCloudInfo,
  PointCloudBounds,
  StreamingProgress,
  StreamingLoaderOptions,
  LayerControlOptions,
  LayerType,
  ControlPosition,
  LayerConfig,
  LegendType,
  CategoryLegendItem,
  GradientLegendItem,
  SizeLegendItem,
  TableLegendItem,
  LegendControlOptions,
  FilterState,
} from './controls';

export * from './layers/deckgl';

export default VMap;
