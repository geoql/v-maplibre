import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, nextTick } from 'vue';
import Terrain from '../../src/layers/maplibre/terrain/VTerrain.vue';
import HillshadeLayer from '../../src/layers/maplibre/hillshade/VLayerMaplibreHillshade.vue';
import { MapKey } from '../../src/utils/symbols';
import type { Map, RasterDEMSourceSpecification } from 'maplibre-gl';

const demSource: RasterDEMSourceSpecification = {
  type: 'raster-dem',
  url: 'pmtiles://https://samples.geolith.app/terrain/garhwal-himalaya.pmtiles',
  tileSize: 512,
  encoding: 'mapbox',
};

interface MockMapOverrides {
  hasSource?: boolean;
  hasLayer?: boolean;
  styleLoaded?: boolean;
}

const createMockMap = (overrides: MockMapOverrides = {}) => {
  const { hasSource = false, hasLayer = false, styleLoaded = true } = overrides;
  const sources = new Set<string>(hasSource ? ['dem'] : []);
  const layers = new Set<string>(hasLayer ? ['existing-layer'] : []);
  return {
    listeners: new globalThis.Map<string, Set<(...args: unknown[]) => void>>(),
    on(event: string, cb: (...args: unknown[]) => void) {
      if (!this.listeners.has(event)) this.listeners.set(event, new Set());
      this.listeners.get(event)!.add(cb);
      return this;
    },
    off(event: string, cb: (...args: unknown[]) => void) {
      this.listeners.get(event)?.delete(cb);
      return this;
    },
    fire(event: string) {
      for (const cb of [...(this.listeners.get(event) ?? [])]) cb();
    },
    isStyleLoaded: vi.fn(() => styleLoaded),
    getSource: vi.fn((id: string) => (sources.has(id) ? { id } : undefined)),
    addSource: vi.fn((id: string) => {
      sources.add(id);
    }),
    removeSource: vi.fn((id: string) => {
      sources.delete(id);
    }),
    getLayer: vi.fn((id: string) => (layers.has(id) ? { id } : undefined)),
    addLayer: vi.fn((layer: { id: string }) => {
      layers.add(layer.id);
    }),
    removeLayer: vi.fn((id: string) => {
      layers.delete(id);
    }),
    setTerrain: vi.fn(),
    setPaintProperty: vi.fn(),
    setLayoutProperty: vi.fn(),
  };
};

const mountWithMap = (
  component: typeof Terrain | typeof HillshadeLayer,
  props: Record<string, unknown>,
  mockMap: ReturnType<typeof createMockMap>,
) =>
  mount(component, {
    props,
    global: {
      provide: {
        [MapKey as unknown as string]: ref(mockMap as unknown as Map),
      },
    },
  });

describe('VTerrain', () => {
  it('enables terrain when the source already exists', () => {
    const mockMap = createMockMap({ hasSource: true });
    mountWithMap(Terrain, { source: 'dem', exaggeration: 1.25 }, mockMap);

    expect(mockMap.setTerrain).toHaveBeenCalledWith({
      source: 'dem',
      exaggeration: 1.25,
    });
    expect(mockMap.addSource).not.toHaveBeenCalled();
  });

  it('adds its own raster-dem source when sourceSpec is provided', () => {
    const mockMap = createMockMap();
    mountWithMap(
      Terrain,
      { source: 'terrain-dem', sourceSpec: demSource },
      mockMap,
    );

    expect(mockMap.addSource).toHaveBeenCalledWith('terrain-dem', demSource);
    expect(mockMap.setTerrain).toHaveBeenCalledWith({
      source: 'terrain-dem',
      exaggeration: 1,
    });
  });

  it('waits for an externally managed source to appear', () => {
    const mockMap = createMockMap();
    mountWithMap(Terrain, { source: 'dem' }, mockMap);

    expect(mockMap.setTerrain).not.toHaveBeenCalled();

    mockMap.getSource.mockImplementation((id: string) =>
      id === 'dem' ? { id } : undefined,
    );
    mockMap.fire('idle');

    expect(mockMap.setTerrain).toHaveBeenCalledWith({
      source: 'dem',
      exaggeration: 1,
    });
  });

  it('updates exaggeration reactively without re-adding the source', async () => {
    const mockMap = createMockMap({ hasSource: true });
    const wrapper = mountWithMap(
      Terrain,
      { source: 'dem', exaggeration: 1 },
      mockMap,
    );
    mockMap.setTerrain.mockClear();
    mockMap.addSource.mockClear();

    await wrapper.setProps({ exaggeration: 2 });
    await nextTick();

    expect(mockMap.setTerrain).toHaveBeenCalledWith({
      source: 'dem',
      exaggeration: 2,
    });
    expect(mockMap.addSource).not.toHaveBeenCalled();
  });

  it('disables terrain on unmount and removes only a self-added source', () => {
    const selfManaged = createMockMap();
    const w1 = mountWithMap(
      Terrain,
      { source: 'terrain-dem', sourceSpec: demSource },
      selfManaged,
    );
    w1.unmount();
    expect(selfManaged.setTerrain).toHaveBeenLastCalledWith(null);
    expect(selfManaged.removeSource).toHaveBeenCalledWith('terrain-dem');

    const external = createMockMap({ hasSource: true });
    const w2 = mountWithMap(Terrain, { source: 'dem' }, external);
    w2.unmount();
    expect(external.setTerrain).toHaveBeenLastCalledWith(null);
    expect(external.removeSource).not.toHaveBeenCalled();
  });

  it('re-enables terrain after a style swap', () => {
    const mockMap = createMockMap({ hasSource: true });
    mountWithMap(Terrain, { source: 'dem' }, mockMap);
    mockMap.setTerrain.mockClear();

    mockMap.fire('style.load');

    expect(mockMap.setTerrain).toHaveBeenCalledWith({
      source: 'dem',
      exaggeration: 1,
    });
  });
});

describe('VLayerMaplibreHillshade', () => {
  it('adds a raster-dem source and hillshade layer', () => {
    const mockMap = createMockMap();
    mountWithMap(
      HillshadeLayer,
      {
        sourceId: 'hillshade-dem',
        layerId: 'hillshade',
        source: demSource,
        layer: { paint: { 'hillshade-exaggeration': 0.5 } },
      },
      mockMap,
    );

    expect(mockMap.addSource).toHaveBeenCalledWith('hillshade-dem', demSource);
    expect(mockMap.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'hillshade',
        type: 'hillshade',
        source: 'hillshade-dem',
        paint: { 'hillshade-exaggeration': 0.5 },
      }),
    );
  });

  it('updates paint properties reactively', async () => {
    const mockMap = createMockMap();
    const wrapper = mountWithMap(
      HillshadeLayer,
      {
        sourceId: 'hillshade-dem',
        layerId: 'hillshade',
        source: demSource,
        layer: { paint: { 'hillshade-exaggeration': 0.5 } },
      },
      mockMap,
    );

    await wrapper.setProps({
      layer: { paint: { 'hillshade-exaggeration': 0.9 } },
    });
    await nextTick();

    expect(mockMap.setPaintProperty).toHaveBeenCalledWith(
      'hillshade',
      'hillshade-exaggeration',
      0.9,
    );
  });

  it('removes layer and source on unmount', () => {
    const mockMap = createMockMap();
    const wrapper = mountWithMap(
      HillshadeLayer,
      { sourceId: 'hillshade-dem', layerId: 'hillshade', source: demSource },
      mockMap,
    );
    wrapper.unmount();

    expect(mockMap.removeLayer).toHaveBeenCalledWith('hillshade');
    expect(mockMap.removeSource).toHaveBeenCalledWith('hillshade-dem');
  });
});
