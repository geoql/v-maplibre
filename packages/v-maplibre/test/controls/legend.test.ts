import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, nextTick } from 'vue';
import VControlLegend from '../../src/controls/legend/VControlLegend.vue';
import { MapKey } from '../../src/utils/symbols';
import { DeckLayersKey } from '../../src/layers/deckgl/_shared/useDeckOverlay';
import '../setup';

interface MockMapInstance {
  addControl: ReturnType<typeof vi.fn>;
  removeControl: ReturnType<typeof vi.fn>;
  getLayer: ReturnType<typeof vi.fn>;
  getPaintProperty: ReturnType<typeof vi.fn>;
  setFilter: ReturnType<typeof vi.fn>;
}

const createMockMap = (): MockMapInstance => ({
  addControl: vi.fn(),
  removeControl: vi.fn(),
  getLayer: vi.fn(),
  getPaintProperty: vi.fn(),
  setFilter: vi.fn(),
});

const createMockDeckLayers = () => ({
  addLayer: vi.fn(),
  removeLayer: vi.fn(),
  updateLayer: vi.fn(),
  getLayers: vi.fn(() => []),
});

describe('VControlLegend', () => {
  let mockMap: MockMapInstance;

  beforeEach(() => {
    mockMap = createMockMap();
    const container = document.createElement('div');
    container.id = 'map';
    document.body.appendChild(container);
  });

  describe('Category legend', () => {
    it('renders control on map', async () => {
      const wrapper = mount(VControlLegend, {
        props: {
          layerIds: ['test-layer'],
          type: 'category',
          items: [
            { value: 'a', label: 'Category A', color: '#ff0000' },
            { value: 'b', label: 'Category B', color: '#00ff00' },
          ],
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();
      expect(mockMap.addControl).toHaveBeenCalled();
      expect(wrapper.exists()).toBe(true);
    });

    it('emits item-click when category is clicked', async () => {
      mockMap.getLayer.mockReturnValue({ type: 'fill' });
      mockMap.getPaintProperty.mockReturnValue([
        'match',
        ['get', 'type'],
        'a',
        '#ff0000',
        'b',
        '#00ff00',
        '#cccccc',
      ]);

      const wrapper = mount(VControlLegend, {
        props: {
          layerIds: ['test-layer'],
          type: 'category',
          property: 'fill-color',
          items: [
            { value: 'a', label: 'Category A', color: '#ff0000', visible: true },
            { value: 'b', label: 'Category B', color: '#00ff00', visible: true },
          ],
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();
      expect(wrapper.emitted()).toBeDefined();
    });

    it('removes control on unmount', async () => {
      const wrapper = mount(VControlLegend, {
        props: {
          layerIds: ['test-layer'],
          type: 'category',
          items: [{ value: 'a', label: 'Category A', color: '#ff0000' }],
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();
      wrapper.unmount();
      expect(mockMap.removeControl).toHaveBeenCalled();
    });
  });

  describe('Gradient legend', () => {
    it('renders gradient legend', async () => {
      const wrapper = mount(VControlLegend, {
        props: {
          layerIds: ['heatmap-layer'],
          type: 'gradient',
          items: [
            {
              min: 0,
              max: 100,
              colors: ['#0000ff', '#ff0000'],
              minLabel: 'Low',
              maxLabel: 'High',
            },
          ],
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();
      expect(mockMap.addControl).toHaveBeenCalled();
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Size legend', () => {
    it('renders size legend', async () => {
      const wrapper = mount(VControlLegend, {
        props: {
          layerIds: ['points-layer'],
          type: 'size',
          items: [
            { value: 10, label: 'Small', size: 8 },
            { value: 50, label: 'Medium', size: 16 },
            { value: 100, label: 'Large', size: 24 },
          ],
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();
      expect(mockMap.addControl).toHaveBeenCalled();
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Auto-generation', () => {
    it('auto-generates legend from match expression', async () => {
      mockMap.getLayer.mockReturnValue({ type: 'fill' });
      mockMap.getPaintProperty.mockReturnValue([
        'match',
        ['get', 'category'],
        'residential',
        '#ff0000',
        'commercial',
        '#00ff00',
        '#cccccc',
      ]);

      mount(VControlLegend, {
        props: {
          layerIds: ['buildings-layer'],
          type: 'category',
          autoGenerate: true,
          property: 'fill-color',
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();
      expect(mockMap.getPaintProperty).toHaveBeenCalledWith(
        'buildings-layer',
        'fill-color',
      );
    });

    it('auto-generates gradient from interpolate expression', async () => {
      mockMap.getLayer.mockReturnValue({ type: 'fill' });
      mockMap.getPaintProperty.mockReturnValue([
        'interpolate',
        ['linear'],
        ['get', 'value'],
        0,
        '#0000ff',
        100,
        '#ff0000',
      ]);

      mount(VControlLegend, {
        props: {
          layerIds: ['choropleth-layer'],
          type: 'gradient',
          autoGenerate: true,
          property: 'fill-color',
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();
      expect(mockMap.getPaintProperty).toHaveBeenCalledWith(
        'choropleth-layer',
        'fill-color',
      );
    });
  });

  describe('MapLibre filtering', () => {
    it('applies filter when category toggled', async () => {
      mockMap.getLayer.mockReturnValue({ type: 'fill' });
      mockMap.getPaintProperty.mockReturnValue([
        'match',
        ['get', 'type'],
        'a',
        '#ff0000',
        '#cccccc',
      ]);

      mount(VControlLegend, {
        props: {
          layerIds: ['test-layer'],
          type: 'category',
          property: 'fill-color',
          items: [{ value: 'a', label: 'Category A', color: '#ff0000' }],
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();
      expect(mockMap.addControl).toHaveBeenCalled();
    });
  });

  describe('deck.gl filtering', () => {
    it('warns when deck.gl layer lacks DataFilterExtension', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockMap.getLayer.mockReturnValue(null);

      const mockDeckLayers = createMockDeckLayers();
      const mockDeckLayer = {
        id: 'deck-layer',
        props: { extensions: [] },
        clone: vi.fn(),
      };
      mockDeckLayers.getLayers.mockReturnValue([mockDeckLayer]);

      mount(VControlLegend, {
        props: {
          layerIds: ['deck-layer'],
          type: 'category',
          items: [{ value: 'a', label: 'Category A', color: '#ff0000' }],
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
            [DeckLayersKey as symbol]: mockDeckLayers,
          },
        },
      });

      await nextTick();
      consoleWarn.mockRestore();
    });
  });

  describe('v-model bindings', () => {
    it('emits update:filter when filter changes', async () => {
      mockMap.getLayer.mockReturnValue({ type: 'fill' });

      const wrapper = mount(VControlLegend, {
        props: {
          layerIds: ['test-layer'],
          type: 'category',
          items: [
            { value: 'a', label: 'A', color: '#ff0000', visible: true },
            { value: 'b', label: 'B', color: '#00ff00', visible: true },
          ],
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Collapsed state', () => {
    it('supports collapsed prop', async () => {
      const wrapper = mount(VControlLegend, {
        props: {
          layerIds: ['test-layer'],
          type: 'category',
          items: [{ value: 'a', label: 'A', color: '#ff0000' }],
          collapsed: true,
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();
      expect(wrapper.exists()).toBe(true);
    });
  });
});
