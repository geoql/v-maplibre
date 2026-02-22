import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, nextTick } from 'vue';
import VControlLegend from '../../src/controls/legend/VControlLegend.vue';
import { MapKey } from '../../src/utils/symbols';
import { DeckLayersKey } from '../../src/layers/deckgl/_shared/useDeckOverlay';
import '../setup';

interface MockMapInstance {
  getLayer: ReturnType<typeof vi.fn>;
  getPaintProperty: ReturnType<typeof vi.fn>;
  setFilter: ReturnType<typeof vi.fn>;
  addControl: ReturnType<typeof vi.fn>;
  removeControl: ReturnType<typeof vi.fn>;
}

const createMockMap = (): MockMapInstance => ({
  getLayer: vi.fn(),
  getPaintProperty: vi.fn(),
  setFilter: vi.fn(),
  addControl: vi.fn(),
  removeControl: vi.fn(),
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

  describe('Component rendering', () => {
    it('renders legend with title', async () => {
      const wrapper = mount(VControlLegend, {
        props: {
          layerIds: ['test-layer'],
          type: 'category',
          title: 'My Legend',
          items: [{ value: 'a', label: 'Category A', color: '#ff0000' }],
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();
      expect(wrapper.find('.v-legend-control-title').text()).toBe('My Legend');
    });

    it('renders category items', async () => {
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
      const items = wrapper.findAll('.v-legend-control-item');
      expect(items.length).toBe(2);
    });

    it('renders collapsed state correctly', async () => {
      const wrapper = mount(VControlLegend, {
        props: {
          layerIds: ['test-layer'],
          type: 'category',
          items: [{ value: 'a', label: 'Category A', color: '#ff0000' }],
          collapsed: true,
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();
      expect(wrapper.find('.v-legend-control-content').exists()).toBe(false);
    });
  });

  describe('Category legend', () => {
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
            {
              value: 'a',
              label: 'Category A',
              color: '#ff0000',
              visible: true,
            },
            {
              value: 'b',
              label: 'Category B',
              color: '#00ff00',
              visible: true,
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

      const firstItem = wrapper.find('.v-legend-control-item');
      await firstItem.trigger('click');
      await nextTick();

      expect(wrapper.emitted('item-click')).toBeTruthy();
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
      expect(wrapper.find('.v-legend-control-gradient').exists()).toBe(true);
      expect(wrapper.find('.v-legend-control-gradient-labels').exists()).toBe(
        true,
      );
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
      const sizeItems = wrapper.findAll('.v-legend-control-size-item');
      expect(sizeItems.length).toBe(3);
    });
  });

  describe('Table legend', () => {
    it('renders table legend items sorted by value descending', async () => {
      const wrapper = mount(VControlLegend, {
        props: {
          layerIds: ['states-layer'],
          type: 'table',
          title: 'States',
          items: [
            {
              label: 'Alabama',
              value: 2.8,
              formattedValue: '2.8%',
              color: '#deebf7',
            },
            {
              label: 'Nevada',
              value: 5.5,
              formattedValue: '5.5%',
              color: '#6baed6',
            },
            {
              label: 'California',
              value: 5.3,
              formattedValue: '5.3%',
              color: '#6baed6',
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
      const rows = wrapper.findAll('.v-legend-control-table-row');
      expect(rows.length).toBe(3);
      // Sorted descending by value: Nevada (5.5), California (5.3), Alabama (2.8)
      expect(rows[0].find('.v-legend-control-table-label').text()).toBe(
        'Nevada',
      );
      expect(rows[1].find('.v-legend-control-table-label').text()).toBe(
        'California',
      );
      expect(rows[2].find('.v-legend-control-table-label').text()).toBe(
        'Alabama',
      );
    });

    it('renders formatted values when provided', async () => {
      const wrapper = mount(VControlLegend, {
        props: {
          layerIds: ['states-layer'],
          type: 'table',
          items: [
            {
              label: 'Texas',
              value: 4.1,
              formattedValue: '4.1%',
              color: '#9ecae1',
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
      expect(wrapper.find('.v-legend-control-table-value').text()).toBe('4.1%');
    });

    it('falls back to value with unit when formattedValue is absent', async () => {
      const wrapper = mount(VControlLegend, {
        props: {
          layerIds: ['stats-layer'],
          type: 'table',
          items: [
            { label: 'Region A', value: 42, unit: ' km²', color: '#ff0000' },
          ],
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();
      expect(wrapper.find('.v-legend-control-table-value').text()).toBe(
        '42 km²',
      );
    });

    it('renders scrollable container for table items', async () => {
      const wrapper = mount(VControlLegend, {
        props: {
          layerIds: ['states-layer'],
          type: 'table',
          items: [
            { label: 'State 1', value: 1, color: '#ff0000' },
            { label: 'State 2', value: 2, color: '#00ff00' },
          ],
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();
      expect(wrapper.find('.v-legend-control-table').exists()).toBe(true);
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

      const wrapper = mount(VControlLegend, {
        props: {
          layerIds: ['test-layer'],
          type: 'category',
          property: 'fill-color',
          items: [
            {
              value: 'a',
              label: 'Category A',
              color: '#ff0000',
              visible: true,
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

      const item = wrapper.find('.v-legend-control-item');
      await item.trigger('click');
      await nextTick();

      expect(mockMap.setFilter).toHaveBeenCalled();
    });
  });

  describe('deck.gl filtering', () => {
    it('warns when deck.gl layer lacks DataFilterExtension', async () => {
      const consoleWarn = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});
      mockMap.getLayer.mockReturnValue(null);

      const mockDeckLayers = createMockDeckLayers();
      const mockDeckLayer = {
        id: 'deck-layer',
        props: { extensions: [] },
        clone: vi.fn(),
      };
      mockDeckLayers.getLayers.mockReturnValue([mockDeckLayer]);

      const wrapper = mount(VControlLegend, {
        props: {
          layerIds: ['deck-layer'],
          type: 'category',
          items: [
            {
              value: 'a',
              label: 'Category A',
              color: '#ff0000',
              visible: true,
            },
          ],
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
            [DeckLayersKey as symbol]: mockDeckLayers,
          },
        },
      });

      await nextTick();

      const item = wrapper.find('.v-legend-control-item');
      await item.trigger('click');
      await nextTick();

      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('DataFilterExtension'),
      );

      consoleWarn.mockRestore();
    });
  });

  describe('v-model bindings', () => {
    it('emits update:filter when filter changes', async () => {
      mockMap.getLayer.mockReturnValue({ type: 'fill' });
      mockMap.getPaintProperty.mockReturnValue([
        'match',
        ['get', 'type'],
        'a',
        '#ff0000',
        '#cccccc',
      ]);

      const wrapper = mount(VControlLegend, {
        props: {
          layerIds: ['test-layer'],
          type: 'category',
          property: 'fill-color',
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

      const firstItem = wrapper.find('.v-legend-control-item');
      await firstItem.trigger('click');
      await nextTick();

      expect(wrapper.emitted('update:filter')).toBeTruthy();
    });
  });

  describe('Collapsed state', () => {
    it('toggles collapse on header click', async () => {
      const wrapper = mount(VControlLegend, {
        props: {
          layerIds: ['test-layer'],
          type: 'category',
          items: [{ value: 'a', label: 'A', color: '#ff0000' }],
          collapsed: false,
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();
      expect(wrapper.find('.v-legend-control-content').exists()).toBe(true);

      await wrapper.find('.v-legend-control-header').trigger('click');
      await nextTick();

      expect(wrapper.find('.v-legend-control-content').exists()).toBe(false);
    });
  });
});
