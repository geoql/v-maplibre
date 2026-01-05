import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import VLayerMaplibreGeojson from '../../src/layers/maplibre/geojson/VLayerMaplibreGeojson.vue';
import VMap from '../../src/map/VMap.vue';
import '../setup';
import type { GeoJSONSourceSpecification } from 'maplibre-gl';

describe('VLayerMaplibreGeojson', () => {
  const defaultMapOptions = {
    container: 'map',
    style: 'https://demotiles.maplibre.org/style.json',
    center: [0, 0] as [number, number],
    zoom: 2,
  };

  const geojsonSource: GeoJSONSourceSpecification = {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [0, 0],
      },
      properties: {},
    },
  };

  const layerOptions = {
    id: 'test-layer',
    type: 'circle' as const,
    paint: {
      'circle-radius': 10,
      'circle-color': '#007cbf',
    },
  };

  beforeEach(() => {
    const container = document.createElement('div');
    container.id = 'map';
    document.body.appendChild(container);
  });

  it('renders correctly within VMap', () => {
    const wrapper = mount(VMap, {
      props: {
        options: defaultMapOptions,
      },
      slots: {
        default: {
          template: '<VLayerMaplibreGeojson :source="source" :layer="layer" />',
          components: { VLayerMaplibreGeojson },
          data() {
            return {
              source: geojsonSource,
              layer: layerOptions,
            };
          },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('accepts sourceId prop', () => {
    const wrapper = mount(VMap, {
      props: {
        options: defaultMapOptions,
      },
      slots: {
        default: {
          template:
            '<VLayerMaplibreGeojson source-id="custom-source" :source="source" :layer="layer" />',
          components: { VLayerMaplibreGeojson },
          data() {
            return {
              source: geojsonSource,
              layer: layerOptions,
            };
          },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('accepts layerId prop', () => {
    const wrapper = mount(VMap, {
      props: {
        options: defaultMapOptions,
      },
      slots: {
        default: {
          template:
            '<VLayerMaplibreGeojson layer-id="custom-layer" :source="source" :layer="layer" />',
          components: { VLayerMaplibreGeojson },
          data() {
            return {
              source: geojsonSource,
              layer: layerOptions,
            };
          },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('accepts before prop', () => {
    const wrapper = mount(VMap, {
      props: {
        options: defaultMapOptions,
      },
      slots: {
        default: {
          template:
            '<VLayerMaplibreGeojson before="other-layer" :source="source" :layer="layer" />',
          components: { VLayerMaplibreGeojson },
          data() {
            return {
              source: geojsonSource,
              layer: layerOptions,
            };
          },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
