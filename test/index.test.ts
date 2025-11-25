import { describe, it, expect } from 'vitest';
import {
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
} from '../src/index';
import VMapComponent from '../src/map/VMap.vue';

describe('Package Exports', () => {
  it('exports VMap component', () => {
    expect(VMap).toBeDefined();
    expect(VMap).toBe(VMapComponent);
  });

  it('exports VMarker component', () => {
    expect(VMarker).toBeDefined();
  });

  it('exports VPopup component', () => {
    expect(VPopup).toBeDefined();
  });

  describe('Layer Components', () => {
    it('exports VLayerMaplibreCanvas', () => {
      expect(VLayerMaplibreCanvas).toBeDefined();
    });

    it('exports VLayerMaplibreGeojson', () => {
      expect(VLayerMaplibreGeojson).toBeDefined();
    });

    it('exports VLayerMaplibreCluster', () => {
      expect(VLayerMaplibreCluster).toBeDefined();
    });

    it('exports VLayerMaplibreImage', () => {
      expect(VLayerMaplibreImage).toBeDefined();
    });

    it('exports VLayerMaplibreRaster', () => {
      expect(VLayerMaplibreRaster).toBeDefined();
    });

    it('exports VLayerMaplibreVector', () => {
      expect(VLayerMaplibreVector).toBeDefined();
    });

    it('exports VLayerMaplibreVideo', () => {
      expect(VLayerMaplibreVideo).toBeDefined();
    });

    it('exports VLayerMaplibrePmtile', () => {
      expect(VLayerMaplibrePmtile).toBeDefined();
    });
  });

  describe('Control Components', () => {
    it('exports VControlAttribution', () => {
      expect(VControlAttribution).toBeDefined();
    });

    it('exports VControlFullscreen', () => {
      expect(VControlFullscreen).toBeDefined();
    });

    it('exports VControlGeolocate', () => {
      expect(VControlGeolocate).toBeDefined();
    });

    it('exports VControlNavigation', () => {
      expect(VControlNavigation).toBeDefined();
    });

    it('exports VControlScale', () => {
      expect(VControlScale).toBeDefined();
    });
  });

  it('has default export', async () => {
    const defaultExport = (await import('../src/index')).default;
    expect(defaultExport).toBeDefined();
    expect(defaultExport).toBe(VMapComponent);
  });
});
