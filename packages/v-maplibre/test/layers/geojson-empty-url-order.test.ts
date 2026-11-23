import { describe, it, expect, vi } from 'vite-plus/test';
import { mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import VLayerMaplibreGeojson from '../../src/layers/maplibre/geojson/VLayerMaplibreGeojson.vue';
import { MapKey } from '../../src/utils';

/**
 * #191 an empty FeatureCollection is valid data,
 * #192 a `before` target that appears later still gets the layer moved under it,
 * #195 a URL string is valid GeoJSON source data.
 */

type Handler = (...args: unknown[]) => void;

function fakeMap() {
  const handlers = new Map<string, Set<Handler>>();
  const layers = new Set<string>(['basemap']);
  return {
    style: { _loaded: true },
    addSource: vi.fn(),
    addLayer: vi.fn((layer: { id: string }) => layers.add(layer.id)),
    moveLayer: vi.fn(),
    removeLayer: vi.fn((id: string) => layers.delete(id)),
    removeSource: vi.fn(),
    setLayoutProperty: vi.fn(),
    getSource: vi.fn(() => undefined),
    getLayer: vi.fn((id: string) => (layers.has(id) ? { id } : undefined)),
    getStyle: () => ({ layers: [] }),
    getCanvas: () => ({ style: {} }),
    on: vi.fn((event: string, handler: Handler) => {
      if (!handlers.has(event)) handlers.set(event, new Set());
      handlers.get(event)!.add(handler);
    }),
    off: vi.fn((event: string, handler: Handler) => {
      handlers.get(event)?.delete(handler);
    }),
    emit(event: string) {
      for (const handler of [...(handlers.get(event) ?? [])]) handler();
    },
    addLayerId(id: string) {
      layers.add(id);
    },
  };
}

const layer = {
  id: 'ignored',
  type: 'circle' as const,
  paint: { 'circle-radius': 4 },
};

function mountWith(
  map: ReturnType<typeof fakeMap>,
  source: object,
  before?: string,
) {
  return mount(VLayerMaplibreGeojson, {
    props: {
      source: source as never,
      layer: layer as never,
      sourceId: 'src',
      layerId: 'layer',
      ...(before ? { before } : {}),
    },
    global: { provide: { [MapKey as symbol]: ref(map as never) } },
  });
}

const empty = {
  type: 'FeatureCollection' as const,
  features: [] as GeoJSON.Feature[],
};

describe('VLayerMaplibreGeojson empty data (#191)', () => {
  it('adds the source and layer for an empty FeatureCollection', async () => {
    const map = fakeMap();
    mountWith(map, { type: 'geojson', data: empty });
    await nextTick();
    await nextTick();

    expect(map.addSource).toHaveBeenCalledWith('src', {
      type: 'geojson',
      data: empty,
    });
    expect(map.addLayer).toHaveBeenCalled();
  });

  it('writes an empty collection to an existing source', async () => {
    const map = fakeMap();
    const setData = vi.fn();
    map.getSource = vi.fn(() => ({ setData }));
    const wrapper = mountWith(map, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [1, 2] },
        properties: {},
      },
    });
    await nextTick();
    await wrapper.setProps({ source: { type: 'geojson', data: empty } });
    await nextTick();

    expect(setData).toHaveBeenLastCalledWith(empty);
  });
});

describe('VLayerMaplibreGeojson URL data (#195)', () => {
  it('passes a URL string to addSource', async () => {
    const map = fakeMap();
    mountWith(map, { type: 'geojson', data: '/data/outline.geojson' });
    await nextTick();
    await nextTick();

    expect(map.addSource).toHaveBeenCalledWith('src', {
      type: 'geojson',
      data: '/data/outline.geojson',
    });
  });
});

describe('VLayerMaplibreGeojson before-order (#192)', () => {
  it('moves the layer under a before target that appears later', async () => {
    const map = fakeMap();
    mountWith(map, { type: 'geojson', data: empty }, 'outline');
    await nextTick();
    await nextTick();

    // The target does not exist yet: the layer is appended, not thrown away.
    expect(map.addLayer).toHaveBeenCalled();
    expect(map.addLayer.mock.calls[0]?.[1]).toBeUndefined();

    map.addLayerId('outline');
    map.emit('idle');
    await nextTick();

    expect(map.moveLayer).toHaveBeenCalledWith('layer', 'outline');
  });
});
