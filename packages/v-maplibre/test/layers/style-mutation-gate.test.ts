import { describe, it, expect, vi } from 'vite-plus/test';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref, shallowRef } from 'vue';
import type {
  Map as MapLibreMap,
  RasterLayerSpecification,
  RasterSourceSpecification,
} from 'maplibre-gl';
import VLayerMaplibreRaster from '../../src/layers/maplibre/raster/VLayerMaplibreRaster.vue';
import { isStyleReady } from '../../src/utils/style-ready';
import { MapKey } from '../../src/utils/symbols';
import '../setup';

/**
 * Regression tests for geoql/v-maplibre#183: layer updates must be gated on
 * "style parsed" (`style._loaded`, the flag MapLibre's `_checkLoaded()`
 * uses), not on `isStyleLoaded()`, which is `false` while tiles load.
 * An update deferred while a style is loading must be applied once the
 * style is parsed.
 */
class TileLoadingMap {
  /** `style._loaded`: the style has been parsed. */
  style = { _loaded: true };
  /** `isStyleLoaded()`: false while any source is still loading tiles. */
  tilesLoaded = false;
  private handlers = new Map<string, Set<() => void>>();
  private layers = new Set<string>();
  sources = new Map<string, RasterSourceSpecification>();

  on(event: string, handler: () => void) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    return this;
  }

  off(event: string, handler: () => void) {
    this.handlers.get(event)?.delete(handler);
    return this;
  }

  fire(event: string) {
    for (const handler of [...(this.handlers.get(event) ?? [])]) handler();
  }

  isStyleLoaded() {
    return this.style._loaded && this.tilesLoaded;
  }

  private assertParsed(): void {
    if (!this.style._loaded) throw new Error('Style is not done loading.');
  }

  addSource(id: string, source: RasterSourceSpecification) {
    this.assertParsed();
    this.sources.set(id, source);
    return this;
  }

  getSource(id: string) {
    return this.sources.get(id);
  }

  removeSource(id: string) {
    this.assertParsed();
    this.sources.delete(id);
    return this;
  }

  addLayer(layer: { id: string }) {
    this.assertParsed();
    this.layers.add(layer.id);
    return this;
  }

  getLayer(id: string) {
    return this.layers.has(id) ? { id } : undefined;
  }

  removeLayer(id: string) {
    this.layers.delete(id);
    return this;
  }

  getStyle() {
    return { layers: [...this.layers].map((id) => ({ id, source: 'src' })) };
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

const URL_A = 'https://a.example.com/{z}/{x}/{y}.png';
const URL_B = 'https://b.example.com/{z}/{x}/{y}.png';

function mountRaster(map: TileLoadingMap) {
  const tiles = ref(URL_A);
  const Harness = defineComponent({
    setup() {
      return () =>
        h(VLayerMaplibreRaster, {
          sourceId: 'src',
          layerId: 'layer',
          source: {
            type: 'raster',
            tiles: [tiles.value],
            tileSize: 256,
          } as RasterSourceSpecification,
          layer: {
            id: 'layer',
            type: 'raster',
            source: 'src',
          } as RasterLayerSpecification,
        });
    },
  });
  const wrapper = mount(Harness, {
    global: { provide: { [MapKey as symbol]: shallowRef(map) } },
  });
  return { wrapper, tiles };
}

describe('isStyleReady', () => {
  it('follows style._loaded, not isStyleLoaded()', () => {
    const map = new TileLoadingMap();
    expect(map.isStyleLoaded()).toBe(false);
    expect(isStyleReady(map as unknown as MapLibreMap)).toBe(true);
    map.style._loaded = false;
    expect(isStyleReady(map as unknown as MapLibreMap)).toBe(false);
  });

  it('falls back to isStyleLoaded() without a style object', () => {
    const isStyleLoaded = vi.fn(() => true);
    expect(isStyleReady({ isStyleLoaded } as unknown as MapLibreMap)).toBe(
      true,
    );
    expect(isStyleReady(null)).toBe(false);
  });
});

describe('VLayerMaplibreRaster source update (#183)', () => {
  it('applies a tiles change while tiles are still loading', async () => {
    const map = new TileLoadingMap();
    const { wrapper, tiles } = mountRaster(map);
    await nextTick();
    expect(map.sources.get('src')?.tiles).toEqual([URL_A]);

    tiles.value = URL_B;
    await nextTick();

    expect(map.sources.get('src')?.tiles).toEqual([URL_B]);
    wrapper.unmount();
  });

  it('applies a tiles change deferred while a style loads', async () => {
    const map = new TileLoadingMap();
    const { wrapper, tiles } = mountRaster(map);
    await nextTick();

    map.style._loaded = false;
    tiles.value = URL_B;
    await nextTick();
    expect(map.sources.get('src')?.tiles).toEqual([URL_A]);

    map.style._loaded = true;
    map.fire('style.load');

    expect(map.sources.get('src')?.tiles).toEqual([URL_B]);
    wrapper.unmount();
  });
});
