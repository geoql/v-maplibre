import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import * as deckglExports from '../../src/layers/deckgl';
import VMap from '../../src/map/VMap.vue';
import '../setup';

describe('Deck.gl Layer Exports', () => {
  it('exports useDeckOverlay composable', () => {
    expect(deckglExports.useDeckOverlay).toBeDefined();
    expect(typeof deckglExports.useDeckOverlay).toBe('function');
  });

  it('exports useDeckLayers composable', () => {
    expect(deckglExports.useDeckLayers).toBeDefined();
    expect(typeof deckglExports.useDeckLayers).toBe('function');
  });

  it('exports DeckOverlayKey symbol', () => {
    expect(deckglExports.DeckOverlayKey).toBeDefined();
    expect(typeof deckglExports.DeckOverlayKey).toBe('symbol');
  });

  it('exports DeckLayersKey symbol', () => {
    expect(deckglExports.DeckLayersKey).toBeDefined();
    expect(typeof deckglExports.DeckLayersKey).toBe('symbol');
  });

  it('exports all 34 layer components', () => {
    const layerComponents = Object.keys(deckglExports).filter((key) =>
      key.startsWith('VLayerDeckgl'),
    );
    expect(layerComponents.length).toBe(34);
  });
});

describe('Deck.gl Layer Components', () => {
  const defaultMapOptions = {
    container: 'map',
    style: 'https://demotiles.maplibre.org/style.json',
    center: [0, 0] as [number, number],
    zoom: 2,
  };

  beforeEach(() => {
    const container = document.createElement('div');
    container.id = 'map';
    document.body.appendChild(container);
  });

  describe('VLayerDeckglScatterplot', () => {
    it('renders within VMap', () => {
      const wrapper = mount(VMap, {
        props: { options: defaultMapOptions },
        slots: {
          default: {
            template: `<VLayerDeckglScatterplot 
              id="test-scatter" 
              :data="data" 
              :get-position="d => d.coordinates" 
            />`,
            components: {
              VLayerDeckglScatterplot: deckglExports.VLayerDeckglScatterplot,
            },
            data: () => ({
              data: [{ coordinates: [0, 0] }],
            }),
          },
        },
      });
      expect(wrapper.exists()).toBe(true);
    });

    it('accepts all standard props', () => {
      const wrapper = mount(VMap, {
        props: { options: defaultMapOptions },
        slots: {
          default: {
            template: `<VLayerDeckglScatterplot 
              id="scatter-props" 
              :data="data" 
              :get-position="d => d.coordinates"
              :get-radius="100"
              :get-fill-color="[255, 0, 0]"
              :opacity="0.8"
              :pickable="true"
              :visible="true"
            />`,
            components: {
              VLayerDeckglScatterplot: deckglExports.VLayerDeckglScatterplot,
            },
            data: () => ({
              data: [{ coordinates: [0, 0] }],
            }),
          },
        },
      });
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('VLayerDeckglArc', () => {
    it('renders within VMap', () => {
      const wrapper = mount(VMap, {
        props: { options: defaultMapOptions },
        slots: {
          default: {
            template: `<VLayerDeckglArc 
              id="test-arc" 
              :data="data" 
              :get-source-position="d => d.from"
              :get-target-position="d => d.to"
            />`,
            components: { VLayerDeckglArc: deckglExports.VLayerDeckglArc },
            data: () => ({
              data: [{ from: [0, 0], to: [1, 1] }],
            }),
          },
        },
      });
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('VLayerDeckglGeojson', () => {
    it('renders within VMap', () => {
      const wrapper = mount(VMap, {
        props: { options: defaultMapOptions },
        slots: {
          default: {
            template: `<VLayerDeckglGeojson 
              id="test-geojson" 
              :data="geojson"
            />`,
            components: {
              VLayerDeckglGeojson: deckglExports.VLayerDeckglGeojson,
            },
            data: () => ({
              geojson: {
                type: 'FeatureCollection',
                features: [],
              },
            }),
          },
        },
      });
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('VLayerDeckglPath', () => {
    it('renders within VMap', () => {
      const wrapper = mount(VMap, {
        props: { options: defaultMapOptions },
        slots: {
          default: {
            template: `<VLayerDeckglPath 
              id="test-path" 
              :data="data"
              :get-path="d => d.path"
            />`,
            components: { VLayerDeckglPath: deckglExports.VLayerDeckglPath },
            data: () => ({
              data: [
                {
                  path: [
                    [0, 0],
                    [1, 1],
                  ],
                },
              ],
            }),
          },
        },
      });
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('VLayerDeckglHeatmap', () => {
    it('renders within VMap', () => {
      const wrapper = mount(VMap, {
        props: { options: defaultMapOptions },
        slots: {
          default: {
            template: `<VLayerDeckglHeatmap 
              id="test-heatmap" 
              :data="data"
              :get-position="d => d.coordinates"
            />`,
            components: {
              VLayerDeckglHeatmap: deckglExports.VLayerDeckglHeatmap,
            },
            data: () => ({
              data: [{ coordinates: [0, 0], weight: 1 }],
            }),
          },
        },
      });
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('VLayerDeckglHexagon', () => {
    it('renders within VMap', () => {
      const wrapper = mount(VMap, {
        props: { options: defaultMapOptions },
        slots: {
          default: {
            template: `<VLayerDeckglHexagon 
              id="test-hexagon" 
              :data="data"
              :get-position="d => d.coordinates"
            />`,
            components: {
              VLayerDeckglHexagon: deckglExports.VLayerDeckglHexagon,
            },
            data: () => ({
              data: [{ coordinates: [0, 0] }],
            }),
          },
        },
      });
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('VLayerDeckglTrips', () => {
    it('renders within VMap', () => {
      const wrapper = mount(VMap, {
        props: { options: defaultMapOptions },
        slots: {
          default: {
            template: `<VLayerDeckglTrips 
              id="test-trips" 
              :data="data"
              :get-path="d => d.path"
              :get-timestamps="d => d.timestamps"
              :current-time="0"
            />`,
            components: { VLayerDeckglTrips: deckglExports.VLayerDeckglTrips },
            data: () => ({
              data: [
                {
                  path: [
                    [0, 0],
                    [1, 1],
                  ],
                  timestamps: [0, 1],
                },
              ],
            }),
          },
        },
      });
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('VLayerDeckglIcon', () => {
    it('renders within VMap', () => {
      const wrapper = mount(VMap, {
        props: { options: defaultMapOptions },
        slots: {
          default: {
            template: `<VLayerDeckglIcon 
              id="test-icon" 
              :data="data"
              :get-position="d => d.coordinates"
              :get-icon="d => d.icon"
              :icon-atlas="'https://example.com/atlas.png'"
              :icon-mapping="iconMapping"
            />`,
            components: { VLayerDeckglIcon: deckglExports.VLayerDeckglIcon },
            data: () => ({
              data: [{ coordinates: [0, 0], icon: 'marker' }],
              iconMapping: { marker: { x: 0, y: 0, width: 32, height: 32 } },
            }),
          },
        },
      });
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('VLayerDeckglText', () => {
    it('renders within VMap', () => {
      const wrapper = mount(VMap, {
        props: { options: defaultMapOptions },
        slots: {
          default: {
            template: `<VLayerDeckglText 
              id="test-text" 
              :data="data"
              :get-position="d => d.coordinates"
              :get-text="d => d.label"
            />`,
            components: { VLayerDeckglText: deckglExports.VLayerDeckglText },
            data: () => ({
              data: [{ coordinates: [0, 0], label: 'Test' }],
            }),
          },
        },
      });
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('VLayerDeckglPolygon', () => {
    it('renders within VMap', () => {
      const wrapper = mount(VMap, {
        props: { options: defaultMapOptions },
        slots: {
          default: {
            template: `<VLayerDeckglPolygon 
              id="test-polygon" 
              :data="data"
              :get-polygon="d => d.contour"
            />`,
            components: {
              VLayerDeckglPolygon: deckglExports.VLayerDeckglPolygon,
            },
            data: () => ({
              data: [
                {
                  contour: [
                    [0, 0],
                    [1, 0],
                    [1, 1],
                    [0, 1],
                  ],
                },
              ],
            }),
          },
        },
      });
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('VLayerDeckglColumn', () => {
    it('renders within VMap', () => {
      const wrapper = mount(VMap, {
        props: { options: defaultMapOptions },
        slots: {
          default: {
            template: `<VLayerDeckglColumn 
              id="test-column" 
              :data="data"
              :get-position="d => d.coordinates"
              :get-elevation="d => d.value"
            />`,
            components: {
              VLayerDeckglColumn: deckglExports.VLayerDeckglColumn,
            },
            data: () => ({
              data: [{ coordinates: [0, 0], value: 100 }],
            }),
          },
        },
      });
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('VLayerDeckglMVT', () => {
    it('renders within VMap', () => {
      const wrapper = mount(VMap, {
        props: { options: defaultMapOptions },
        slots: {
          default: {
            template: `<VLayerDeckglMVT 
              id="test-mvt" 
              data="https://example.com/{z}/{x}/{y}.pbf"
            />`,
            components: { VLayerDeckglMVT: deckglExports.VLayerDeckglMVT },
          },
        },
      });
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('VLayerDeckgl (Generic)', () => {
    it('renders within VMap with custom layer', () => {
      const wrapper = mount(VMap, {
        props: { options: defaultMapOptions },
        slots: {
          default: {
            template: `<VLayerDeckgl 
              id="test-generic" 
              :layer="layer"
            />`,
            components: { VLayerDeckgl: deckglExports.VLayerDeckgl },
            data: () => ({
              layer: { id: 'custom', props: {} },
            }),
          },
        },
      });
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('VLayerDeckglCOG', () => {
    it('renders within VMap', () => {
      const wrapper = mount(VMap, {
        props: { options: defaultMapOptions },
        slots: {
          default: {
            template: `<VLayerDeckglCOG 
              id="test-cog" 
              geotiff="https://example.com/test.tif"
            />`,
            components: { VLayerDeckglCOG: deckglExports.VLayerDeckglCOG },
          },
        },
      });
      expect(wrapper.exists()).toBe(true);
    });

    it('accepts optional props', () => {
      const wrapper = mount(VMap, {
        props: { options: defaultMapOptions },
        slots: {
          default: {
            template: `<VLayerDeckglCOG 
              id="test-cog-props" 
              geotiff="https://example.com/test.tif"
              :opacity="0.8"
              :visible="true"
              :pickable="false"
              :tile-size="512"
              :debug="false"
            />`,
            components: { VLayerDeckglCOG: deckglExports.VLayerDeckglCOG },
          },
        },
      });
      expect(wrapper.exists()).toBe(true);
    });
  });
});
