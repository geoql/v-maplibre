import {
  VControlAttribution,
  VControlFullscreen,
  VControlGeolocate,
  VControlNavigation,
  VControlScale,
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
  VControlAttribution,
  VControlFullscreen,
  VControlGeolocate,
  VControlNavigation,
  VControlScale,
};

export * from './layers/deckgl';

export default VMap;
