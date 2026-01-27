import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, nextTick } from 'vue';
import VControlLayer from '../../src/controls/layer/VControlLayer.vue';
import { MapKey } from '../../src/utils/symbols';
import { DeckLayersKey } from '../../src/layers/deckgl/_shared/useDeckOverlay';
import '../setup';

interface MockMapInstance {
  getLayer: ReturnType<typeof vi.fn>;
  setLayoutProperty: ReturnType<typeof vi.fn>;
  getLayoutProperty: ReturnType<typeof vi.fn>;
  setPaintProperty: ReturnType<typeof vi.fn>;
  getPaintProperty: ReturnType<typeof vi.fn>;
  addControl: ReturnType<typeof vi.fn>;
  removeControl: ReturnType<typeof vi.fn>;
}

const createMockMap = (): MockMapInstance => ({
  getLayer: vi.fn(),
  setLayoutProperty: vi.fn(),
  getLayoutProperty: vi.fn(),
  setPaintProperty: vi.fn(),
  getPaintProperty: vi.fn(),
  addControl: vi.fn(),
  removeControl: vi.fn(),
});

const createMockDeckLayers = () => ({
  addLayer: vi.fn(),
  removeLayer: vi.fn(),
  updateLayer: vi.fn(),
  getLayers: vi.fn(() => []),
});

describe('VControlLayer', () => {
  let mockMap: MockMapInstance;

  beforeEach(() => {
    mockMap = createMockMap();
    const container = document.createElement('div');
    container.id = 'map';
    document.body.appendChild(container);
  });

  describe('Component rendering', () => {
    it('renders control with title', async () => {
      mockMap.getLayer.mockReturnValue({ type: 'fill' });

      const wrapper = mount(VControlLayer, {
        props: {
          layerId: 'test-layer',
          title: 'My Layer',
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();
      expect(wrapper.find('.v-layer-control-title').text()).toBe('My Layer');
    });

    it('renders visibility toggle button', async () => {
      mockMap.getLayer.mockReturnValue({ type: 'fill' });

      const wrapper = mount(VControlLayer, {
        props: {
          layerId: 'test-layer',
          visible: true,
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();
      const toggle = wrapper.find('.v-layer-control-toggle');
      expect(toggle.exists()).toBe(true);
    });

    it('renders opacity slider', async () => {
      mockMap.getLayer.mockReturnValue({ type: 'fill' });

      const wrapper = mount(VControlLayer, {
        props: {
          layerId: 'test-layer',
          opacity: 0.5,
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();
      const slider = wrapper.find('.v-layer-control-slider');
      expect(slider.exists()).toBe(true);
      expect(slider.attributes('value')).toBe('50');
    });
  });

  describe('MapLibre layer support', () => {
    it('detects MapLibre fill layer and sets visibility', async () => {
      mockMap.getLayer.mockReturnValue({ type: 'fill' });

      mount(VControlLayer, {
        props: {
          layerId: 'fill-layer',
          visible: true,
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();
      expect(mockMap.setLayoutProperty).toHaveBeenCalledWith(
        'fill-layer',
        'visibility',
        'visible',
      );
    });

    it('sets fill-opacity for fill layer', async () => {
      mockMap.getLayer.mockReturnValue({ type: 'fill' });

      mount(VControlLayer, {
        props: {
          layerId: 'fill-layer',
          opacity: 0.5,
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();
      expect(mockMap.setPaintProperty).toHaveBeenCalledWith(
        'fill-layer',
        'fill-opacity',
        0.5,
      );
    });

    it('sets line-opacity for line layer', async () => {
      mockMap.getLayer.mockReturnValue({ type: 'line' });

      mount(VControlLayer, {
        props: {
          layerId: 'line-layer',
          opacity: 0.7,
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();
      expect(mockMap.setPaintProperty).toHaveBeenCalledWith(
        'line-layer',
        'line-opacity',
        0.7,
      );
    });

    it('sets circle-opacity for circle layer', async () => {
      mockMap.getLayer.mockReturnValue({ type: 'circle' });

      mount(VControlLayer, {
        props: {
          layerId: 'circle-layer',
          opacity: 0.8,
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();
      expect(mockMap.setPaintProperty).toHaveBeenCalledWith(
        'circle-layer',
        'circle-opacity',
        0.8,
      );
    });

    it('sets icon-opacity for symbol layer', async () => {
      mockMap.getLayer.mockReturnValue({ type: 'symbol' });

      mount(VControlLayer, {
        props: {
          layerId: 'symbol-layer',
          opacity: 0.9,
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();
      expect(mockMap.setPaintProperty).toHaveBeenCalledWith(
        'symbol-layer',
        'icon-opacity',
        0.9,
      );
    });
  });

  describe('deck.gl layer support', () => {
    it('detects deck.gl layer when MapLibre layer not found', async () => {
      mockMap.getLayer.mockReturnValue(null);

      const mockDeckLayers = createMockDeckLayers();
      const mockDeckLayer = {
        id: 'deck-layer',
        clone: vi.fn((props) => ({ ...mockDeckLayer, ...props })),
      };
      mockDeckLayers.getLayers.mockReturnValue([mockDeckLayer]);

      mount(VControlLayer, {
        props: {
          layerId: 'deck-layer',
          visible: true,
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
            [DeckLayersKey as symbol]: mockDeckLayers,
          },
        },
      });

      await nextTick();
      expect(mockDeckLayer.clone).toHaveBeenCalledWith({ visible: true });
      expect(mockDeckLayers.updateLayer).toHaveBeenCalled();
    });

    it('updates deck.gl layer opacity', async () => {
      mockMap.getLayer.mockReturnValue(null);

      const mockDeckLayers = createMockDeckLayers();
      const mockDeckLayer = {
        id: 'deck-layer',
        clone: vi.fn((props) => ({ ...mockDeckLayer, ...props })),
      };
      mockDeckLayers.getLayers.mockReturnValue([mockDeckLayer]);

      mount(VControlLayer, {
        props: {
          layerId: 'deck-layer',
          opacity: 0.6,
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
            [DeckLayersKey as symbol]: mockDeckLayers,
          },
        },
      });

      await nextTick();
      expect(mockDeckLayer.clone).toHaveBeenCalledWith({ opacity: 0.6 });
    });
  });

  describe('layer not found handling', () => {
    it('does not warn immediately when layer not found (polls first)', async () => {
      const consoleWarn = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});
      mockMap.getLayer.mockReturnValue(null);

      const mockDeckLayers = createMockDeckLayers();
      mockDeckLayers.getLayers.mockReturnValue([]);

      mount(VControlLayer, {
        props: {
          layerId: 'nonexistent-layer',
          visible: true,
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
            [DeckLayersKey as symbol]: mockDeckLayers,
          },
        },
      });

      await nextTick();
      expect(consoleWarn).not.toHaveBeenCalled();

      consoleWarn.mockRestore();
    });
  });

  describe('v-model bindings', () => {
    it('emits update:visible when visibility changes', async () => {
      mockMap.getLayer.mockReturnValue({ type: 'fill' });

      const wrapper = mount(VControlLayer, {
        props: {
          layerId: 'test-layer',
          visible: true,
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();

      await wrapper.setProps({ visible: false });
      await nextTick();

      expect(wrapper.emitted('update:visible')).toBeTruthy();
    });

    it('emits update:opacity when opacity changes', async () => {
      mockMap.getLayer.mockReturnValue({ type: 'fill' });

      const wrapper = mount(VControlLayer, {
        props: {
          layerId: 'test-layer',
          opacity: 1,
        },
        global: {
          provide: {
            [MapKey as symbol]: ref(mockMap),
          },
        },
      });

      await nextTick();

      await wrapper.setProps({ opacity: 0.5 });
      await nextTick();

      expect(wrapper.emitted('update:opacity')).toBeTruthy();
    });
  });
});
