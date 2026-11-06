import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from 'vite-plus/test';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref, type Component } from 'vue';
import type {
  RasterLayerSpecification,
  RasterSourceSpecification,
  VectorSourceSpecification,
} from 'maplibre-gl';
import VLayerMaplibreRaster from '../../src/layers/maplibre/raster/VLayerMaplibreRaster.vue';
import VLayerMaplibreVector from '../../src/layers/maplibre/vector/VLayerMaplibreVector.vue';
import VLayerMaplibrePmtile from '../../src/layers/maplibre/pmtile/VLayerMaplibrePmtile.vue';
import { MapKey, PMTileProtocolKey } from '../../src/utils/symbols';
import '../setup';

/**
 * Regression tests for geoql/v-maplibre#180: layer wrappers must remove
 * their layer on unmount, and remove their source only when no remaining
 * layer still uses it.
 *
 * The map mock follows MapLibre's contract for the calls involved:
 * `removeSource` throws while a layer still uses the source, and every
 * style call throws after `remove()`.
 */
class StyleMap {
  private layers = new Map<string, string | undefined>();
  private sources = new Set<string>();
  private removed = false;

  private assertAlive(): void {
    if (this.removed) {
      throw new TypeError(
        "Cannot read properties of undefined (reading 'getLayer')",
      );
    }
  }

  on() {
    return this;
  }

  off() {
    return this;
  }

  isStyleLoaded() {
    return !this.removed;
  }

  addSource(id: string) {
    this.assertAlive();
    this.sources.add(id);
    return this;
  }

  getSource(id: string) {
    this.assertAlive();
    return this.sources.has(id) ? { id } : undefined;
  }

  removeSource(id: string) {
    this.assertAlive();
    for (const source of this.layers.values()) {
      if (source === id) {
        throw new Error(
          `Source "${id}" cannot be removed while a layer uses it.`,
        );
      }
    }
    this.sources.delete(id);
    return this;
  }

  addLayer(layer: { id: string; source?: string }) {
    this.assertAlive();
    this.layers.set(layer.id, layer.source);
    return this;
  }

  getLayer(id: string) {
    this.assertAlive();
    return this.layers.has(id) ? { id } : undefined;
  }

  removeLayer(id: string) {
    this.assertAlive();
    this.layers.delete(id);
    return this;
  }

  getStyle() {
    this.assertAlive();
    return {
      layers: [...this.layers].map(([id, source]) => ({
        id,
        type: 'raster',
        source,
      })),
    };
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

  remove() {
    this.removed = true;
  }
}

const rasterSource: RasterSourceSpecification = {
  type: 'raster',
  tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
  tileSize: 256,
};

const vectorSource: VectorSourceSpecification = {
  type: 'vector',
  tiles: ['https://example.com/{z}/{x}/{y}.pbf'],
};

interface Case {
  name: string;
  component: Component;
  props: (layerId: string) => Record<string, unknown>;
}

const cases: Case[] = [
  {
    name: 'VLayerMaplibreRaster',
    component: VLayerMaplibreRaster,
    props: (layerId) => ({
      sourceId: 'shared-src',
      layerId,
      source: rasterSource,
      layer: {
        id: layerId,
        type: 'raster',
        source: 'shared-src',
      } as RasterLayerSpecification,
    }),
  },
  {
    name: 'VLayerMaplibreVector',
    component: VLayerMaplibreVector,
    props: (layerId) => ({
      sourceId: 'shared-src',
      layerId,
      source: vectorSource,
      layer: {
        id: layerId,
        type: 'line',
        source: 'shared-src',
        'source-layer': 'roads',
      },
    }),
  },
  {
    name: 'VLayerMaplibrePmtile',
    component: VLayerMaplibrePmtile,
    props: (layerId) => ({
      sourceId: 'shared-src',
      layerId,
      url: 'https://example.com/tiles.pmtiles',
    }),
  },
];

function mountLayers(
  map: StyleMap,
  component: Component,
  propsList: Record<string, unknown>[],
) {
  const visible = ref(propsList.map(() => true));
  const Harness = defineComponent({
    setup() {
      return () =>
        propsList.map((props, index) =>
          visible.value[index] ? h(component, { key: index, ...props }) : null,
        );
    },
  });
  const wrapper = mount(Harness, {
    global: {
      provide: {
        [MapKey as symbol]: ref(map),
        [PMTileProtocolKey as symbol]: { add: vi.fn() },
      },
    },
  });
  const hide = async (index: number) => {
    visible.value = visible.value.map((v, i) => (i === index ? false : v));
    await nextTick();
  };
  return { wrapper, hide };
}

describe('maplibre layer wrappers clean up on unmount (#180)', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  describe.each(cases)('$name', ({ component, props }) => {
    it('removes its layer and source on unmount', async () => {
      const map = new StyleMap();
      const { wrapper } = mountLayers(map, component, [props('layer-a')]);
      await nextTick();
      expect(map.getLayer('layer-a')).toBeDefined();
      expect(map.getSource('shared-src')).toBeDefined();

      wrapper.unmount();

      expect(map.getLayer('layer-a')).toBeUndefined();
      expect(map.getSource('shared-src')).toBeUndefined();
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('keeps a shared source while another layer still uses it', async () => {
      const map = new StyleMap();
      const { wrapper, hide } = mountLayers(map, component, [
        props('layer-a'),
        props('layer-b'),
      ]);
      await nextTick();
      expect(map.getLayer('layer-a')).toBeDefined();
      expect(map.getLayer('layer-b')).toBeDefined();

      await hide(0);

      expect(map.getLayer('layer-a')).toBeUndefined();
      expect(map.getLayer('layer-b')).toBeDefined();
      expect(map.getSource('shared-src')).toBeDefined();
      expect(consoleError).not.toHaveBeenCalled();

      wrapper.unmount();

      expect(map.getLayer('layer-b')).toBeUndefined();
      expect(map.getSource('shared-src')).toBeUndefined();
    });

    it('does not throw when the map was removed first', async () => {
      const map = new StyleMap();
      const { wrapper } = mountLayers(map, component, [props('layer-a')]);
      await nextTick();

      map.remove();

      expect(() => wrapper.unmount()).not.toThrow();
    });
  });

  it('applies new source props after a remount', async () => {
    const map = new StyleMap();
    const addSource = vi.spyOn(map, 'addSource');
    const first = mountLayers(map, VLayerMaplibreRaster, [
      cases[0]!.props('layer-a'),
    ]);
    await nextTick();
    first.wrapper.unmount();

    const nextSource = {
      ...rasterSource,
      tiles: ['https://example.com/{z}/{x}/{y}.png'],
    };
    mountLayers(map, VLayerMaplibreRaster, [
      { ...cases[0]!.props('layer-a'), source: nextSource },
    ]);
    await nextTick();

    expect(addSource).toHaveBeenCalledTimes(2);
    expect(addSource).toHaveBeenLastCalledWith('shared-src', nextSource);
  });
});
