import {
  VControlAttribution,
  VControlFullscreen,
  VControlGeolocate,
  VControlNavigation,
  VControlScale,
  VControlLayer,
  VControlLayerGroup,
  VControlLegend,
} from './controls';

import {
  VLayerMaplibreCanvas,
  VLayerMaplibreGeojson,
  VLayerMaplibreCluster,
  VLayerMaplibreHillshade,
  VLayerMaplibreImage,
  VLayerMaplibreRaster,
  VLayerMaplibreVector,
  VLayerMaplibreVideo,
  VLayerMaplibrePmtile,
  VLayerMaplibreRoute,
  VLayerMaplibreIsochrone,
  VTerrain,
} from './layers';

import VMap from './map/VMap.vue';
import VMarker from './markers/VMarker.vue';
import VPopup from './popups/VPopup.vue';

export { requirePeer } from './utils';

export {
  VMap,
  VMarker,
  VPopup,
  VLayerMaplibreCanvas,
  VLayerMaplibreGeojson,
  VLayerMaplibreCluster,
  VLayerMaplibreHillshade,
  VLayerMaplibreImage,
  VLayerMaplibreRaster,
  VLayerMaplibreVector,
  VLayerMaplibreVideo,
  VLayerMaplibrePmtile,
  VLayerMaplibreRoute,
  VLayerMaplibreIsochrone,
  VTerrain,
  VControlAttribution,
  VControlFullscreen,
  VControlGeolocate,
  VControlNavigation,
  VControlScale,
  VControlLayer,
  VControlLayerGroup,
  VControlLegend,
};

export type {
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

export default VMap;
