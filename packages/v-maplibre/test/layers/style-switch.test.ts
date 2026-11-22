import { describe, it, expect, vi } from 'vite-plus/test';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, shallowRef } from 'vue';
import type {
  GeoJSONSourceSpecification,
  LayerSpecification,
  RasterLayerSpecification,
  RasterSourceSpecification,
} from 'maplibre-gl';
import VLayerMaplibreGeojson from '../../src/layers/maplibre/geojson/VLayerMaplibreGeojson.vue';
import VLayerMaplibreRaster from '../../src/layers/maplibre/raster/VLayerMaplibreRaster.vue';
import { MapKey } from '../../src/utils/symbols';
import '../setup';

/**
 * Regression tests for geoql/v-maplibre#188: `map.setStyle()` drops every
 * source and layer the components added, then fires `style.load` (on both the
 * diff and the rebuild path in maplibre-gl 6). The components must re-add them,
 * in their original order, without registering their layer events twice.
 */
class StyleSwitchMap {
  style = { _loaded: true };
  private handlers = new Map<string, Set<(...args: unknown[]) => void>>();
  layerOrder: string[] = [];
  sources = new Map<string, unknown>();
  layerListeners: string[] = [];

  on(event: string, layerOrHandler: unknown, handler?: unknown) {
    if (typeof layerOrHandler === 'string') {
      this.layerListeners.push(`${event}:${layerOrHandler}`);
      return this;
    }
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(layerOrHandler as () => void);
    void handler;
    return this;
  }

  off(event: string, handler: () => void) {
    this.handlers.get(event)?.delete(handler);
    return this;
  }

  /** What MapLibre does on `setStyle(next)` for layers not in `next`. */
  setStyle(nextLayers: string[]) {
    this.layerOrder = [...nextLayers];
    this.sources.clear();
    for (const handler of [...(this.handlers.get('style.load') ?? [])]) {
      handler();
    }
  }

  isStyleLoaded() {
    return true;
  }

  addSource(id: string, source: unknown) {
    if (this.sources.has(id)) throw new Error(`Source "${id}" already exists.`);
    this.sources.set(id, source);
    return this;
  }

  getSource(id: string) {
    return this.sources.get(id);
  }

  removeSource(id: string) {
    this.sources.delete(id);
    return this;
  }

  addLayer(layer: { id: string; source?: string }, before?: string) {
    if (this.layerOrder.includes(layer.id)) {
      throw new Error(`Layer "${layer.id}" already exists.`);
    }
    if (layer.source && !this.sources.has(layer.source)) {
      throw new Error(`Source "${layer.source}" not found.`);
    }
    const at = before ? this.layerOrder.indexOf(before) : -1;
    if (at >= 0) this.layerOrder.splice(at, 0, layer.id);
    else this.layerOrder.push(layer.id);
    return this;
  }

  getLayer(id: string) {
    return this.layerOrder.includes(id) ? { id } : undefined;
  }

  removeLayer(id: string) {
    this.layerOrder = this.layerOrder.filter((l) => l !== id);
    return this;
  }

  getStyle() {
    return { layers: this.layerOrder.map((id) => ({ id })) };
  }

  getCanvas() {
    return { style: {} };
  }

  setLayoutProperty() {
    return this;
  }

  setPaintProperty() {
    return this;
  }

  moveLayer() {
    return this;
  }
}

const roads: GeoJSONSourceSpecification = {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 0],
            [1, 1],
          ],
        },
      },
    ],
  },
};

function mountGeojsonPair(map: StyleSwitchMap) {
  const layer = (id: string, type: 'line'): LayerSpecification =>
    ({ id, type, source: 'roads' }) as LayerSpecification;
  const Harness = defineComponent({
    setup() {
      return () => [
        h(VLayerMaplibreGeojson, {
          sourceId: 'roads',
          layerId: 'roads-casing',
          source: roads,
          layer: layer('roads-casing', 'line'),
        }),
        h(VLayerMaplibreGeojson, {
          sourceId: 'roads',
          layerId: 'roads-line',
          source: roads,
          layer: layer('roads-line', 'line'),
        }),
      ];
    },
  });
  return mount(Harness, {
    global: { provide: { [MapKey as symbol]: shallowRef(map) } },
  });
}

describe('layers after map.setStyle() (#188)', () => {
  it('re-adds GeoJSON layers sharing a source, in their original order', async () => {
    const map = new StyleSwitchMap();
    map.layerOrder = ['background'];
    const wrapper = mountGeojsonPair(map);
    await nextTick();
    expect(map.layerOrder).toEqual([
      'background',
      'roads-casing',
      'roads-line',
    ]);

    map.setStyle(['background-dark']);

    expect(map.layerOrder).toEqual([
      'background-dark',
      'roads-casing',
      'roads-line',
    ]);
    expect(map.sources.has('roads')).toBe(true);
    wrapper.unmount();
  });

  it('does not register layer events again after a re-add', async () => {
    const map = new StyleSwitchMap();
    const wrapper = mountGeojsonPair(map);
    await nextTick();
    const before = [...map.layerListeners];
    expect(before.length).toBeGreaterThan(0);

    map.setStyle([]);
    map.setStyle([]);

    expect(map.layerListeners).toEqual(before);
    wrapper.unmount();
  });

  it('re-adds a raster layer with its current tiles', async () => {
    const map = new StyleSwitchMap();
    const source: RasterSourceSpecification = {
      type: 'raster',
      tiles: ['https://a.example.com/{z}/{x}/{y}.png'],
      tileSize: 256,
    };
    const wrapper = mount(VLayerMaplibreRaster, {
      props: {
        sourceId: 'imagery',
        layerId: 'imagery',
        source,
        layer: {
          id: 'imagery',
          type: 'raster',
          source: 'imagery',
        } as RasterLayerSpecification,
      },
      global: { provide: { [MapKey as symbol]: shallowRef(map) } },
    });
    await nextTick();

    map.setStyle(['background']);

    expect(map.layerOrder).toEqual(['background', 'imagery']);
    expect(map.getSource('imagery')).toEqual(source);
    wrapper.unmount();
    vi.restoreAllMocks();
  });
});
