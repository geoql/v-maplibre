import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import VMarker from '../../src/markers/VMarker.vue';
import VMap from '../../src/map/VMap.vue';
import '../setup';

describe('VMarker', () => {
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

  it('renders correctly within VMap', () => {
    const wrapper = mount(VMap, {
      props: {
        options: defaultMapOptions,
      },
      slots: {
        default: `<VMarker :lng-lat="[0, 0]" />`,
      },
      global: {
        components: {
          VMarker,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('accepts lngLat as object', () => {
    const wrapper = mount(VMap, {
      props: {
        options: defaultMapOptions,
      },
      slots: {
        default: {
          template: '<VMarker :lng-lat="{ lng: 10, lat: 20 }" />',
          components: { VMarker },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('accepts lngLat as array', () => {
    const wrapper = mount(VMap, {
      props: {
        options: defaultMapOptions,
      },
      slots: {
        default: {
          template: '<VMarker :lng-lat="[10, 20]" />',
          components: { VMarker },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('accepts draggable prop', () => {
    const wrapper = mount(VMap, {
      props: {
        options: defaultMapOptions,
      },
      slots: {
        default: {
          template: '<VMarker :lng-lat="[0, 0]" draggable />',
          components: { VMarker },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('accepts options prop', () => {
    const wrapper = mount(VMap, {
      props: {
        options: defaultMapOptions,
      },
      slots: {
        default: {
          template:
            '<VMarker :lng-lat="[0, 0]" :options="{ color: \'#FF0000\' }" />',
          components: { VMarker },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('accepts custom slot content', () => {
    // This test verifies that VMarker can accept slot content
    // The actual rendering is handled by MapLibre GL
    const wrapper = mount(VMap, {
      props: {
        options: defaultMapOptions,
      },
      slots: {
        default: {
          template: `
            <VMarker :lng-lat="[0, 0]">
              <div class="custom-marker">Custom</div>
            </VMarker>
          `,
          components: { VMarker },
        },
      },
    });

    // Verify the component renders without errors
    expect(wrapper.exists()).toBe(true);
  });
});
