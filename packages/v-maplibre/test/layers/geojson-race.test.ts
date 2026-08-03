import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, ref, defineComponent, h } from 'vue';
import VLayerMaplibreGeojson from '../../src/layers/maplibre/geojson/VLayerMaplibreGeojson.vue';
import { MapKey } from '../../src/utils/symbols';
import '../setup';
import type {
  GeoJSONSourceSpecification,
  LayerSpecification,
} from 'maplibre-gl';

/**
 * Regression test for the production-only "GeoJSON fill never paints" bug.
 *
 * Root cause (mapbox-gl-js#6707 family): the component registered a
 * `map.on('style.load', ...)` handler AFTER the style had already fired
 * `style.load` (fast production basemap). Because `style.load` only fires
 * once, the handler never ran, `addLayer` was never called, and the fill
 * never painted — silently, with no error.
 *
 * These tests drive a controllable map mock that lets us flip
 * `isStyleLoaded()` and decide whether `style.load` has "already fired"
 * before the component mounts.
 */

type EventCallback = (...args: unknown[]) => void;

class ControllableMap {
  styleLoaded = false;
  addedLayers: string[] = [];
  addedSources: string[] = [];
  private layers = new Set<string>();
  private sources = new Set<string>();
  private listeners = new Map<string, Set<EventCallback>>();

  on(event: string, layerOrCb: string | EventCallback, cb?: EventCallback) {
    const callback = (typeof layerOrCb === 'function' ? layerOrCb : cb)!;
    const key =
      typeof layerOrCb === 'function' ? event : `${event}:${layerOrCb}`;
    if (!this.listeners.has(key)) this.listeners.set(key, new Set());
    this.listeners.get(key)!.add(callback);
    return this;
  }

  off(event: string, layerOrCb: string | EventCallback, cb?: EventCallback) {
    const callback = (typeof layerOrCb === 'function' ? layerOrCb : cb)!;
    const key =
      typeof layerOrCb === 'function' ? event : `${event}:${layerOrCb}`;
    this.listeners.get(key)?.delete(callback);
    return this;
  }

  fire(event: string) {
    this.listeners.get(event)?.forEach((cb) => cb());
  }

  isStyleLoaded() {
    return this.styleLoaded;
  }

  loaded() {
    return this.styleLoaded;
  }

  addSource(id: string, _src: unknown) {
    this.sources.add(id);
    this.addedSources.push(id);
    return this;
  }

  getSource(id: string) {
    return this.sources.has(id) ? { setData: vi.fn() } : undefined;
  }

  removeSource(id: string) {
    this.sources.delete(id);
    return this;
  }

  addLayer(layer: { id: string }, _before?: string) {
    this.layers.add(layer.id);
    this.addedLayers.push(layer.id);
    return this;
  }

  getLayer(id: string) {
    return this.layers.has(id) ? { id, type: 'fill' } : null;
  }

  removeLayer(id: string) {
    this.layers.delete(id);
    return this;
  }

  getStyle() {
    return {
      layers: [...this.layers].map((id) => ({ id, type: 'fill', source: id })),
    };
  }

  getCanvas() {
    return { style: {} } as unknown as HTMLCanvasElement;
  }

  setPaintProperty() {
    return this;
  }

  setLayoutProperty() {
    return this;
  }
}

const geojsonSource: GeoJSONSourceSpecification = {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] },
        properties: {},
      },
    ],
  },
};

const layerOptions: LayerSpecification = {
  id: 'states-fill',
  type: 'fill',
  source: 'states',
  paint: { 'fill-color': '#007cbf', 'fill-opacity': 0.8 },
} as LayerSpecification;

// Mounts the layer with a provided MapKey ref, mirroring how VMap provides it.
function mountLayer(mapRef: { value: ControllableMap | null }) {
  const Harness = defineComponent({
    setup() {
      return () =>
        h(VLayerMaplibreGeojson, {
          sourceId: 'states',
          layerId: 'states-fill',
          source: geojsonSource,
          layer: layerOptions,
        });
    },
  });
  return mount(Harness, {
    global: { provide: { [MapKey as symbol]: mapRef } },
  });
}

describe('VLayerMaplibreGeojson - style-load race (prod regression)', () => {
  beforeEach(() => {
    const container = document.createElement('div');
    container.id = 'map';
    document.body.appendChild(container);
  });

  it('adds the layer when style ALREADY loaded before mount (the prod race)', async () => {
    // Production timing: the basemap style finished loading BEFORE the child
    // layer component mounts. style.load has already fired and will never fire
    // again. isStyleLoaded() returns true synchronously.
    const map = new ControllableMap();
    map.styleLoaded = true;
    const mapRef = ref<ControllableMap | null>(map);

    mountLayer(mapRef);
    await nextTick();
    await nextTick();

    expect(map.addedSources).toContain('states');
    expect(map.addedLayers).toContain('states-fill');
  });

  it('adds the layer when style.load fires AFTER mount', async () => {
    // Slower timing: style not yet loaded at mount. The component must add the
    // layer once style.load fires.
    const map = new ControllableMap();
    map.styleLoaded = false;
    const mapRef = ref<ControllableMap | null>(map);

    mountLayer(mapRef);
    await nextTick();

    // Not added yet — style not loaded.
    expect(map.addedLayers).not.toContain('states-fill');

    // Style finishes loading and fires the event.
    map.styleLoaded = true;
    map.fire('style.load');
    await nextTick();

    expect(map.addedLayers).toContain('states-fill');
  });

  it('adds the layer when style.load already fired but settles via idle', async () => {
    // Edge timing: isStyleLoaded() is false at mount AND style.load already
    // fired (so it will never fire again). The only recovery is the `idle`
    // event once sprite/glyph/source finish.
    const map = new ControllableMap();
    map.styleLoaded = false;
    const mapRef = ref<ControllableMap | null>(map);

    mountLayer(mapRef);
    await nextTick();
    expect(map.addedLayers).not.toContain('states-fill');

    // style.load is NOT fired (already fired before mount). Instead the map
    // settles and emits idle.
    map.styleLoaded = true;
    map.fire('idle');
    await nextTick();

    expect(map.addedLayers).toContain('states-fill');
  });
});
