import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import VControlNavigation from '../../src/controls/navigation/VControlNavigation.vue';
import VMap from '../../src/map/VMap.vue';
import '../setup';

describe('VControlNavigation', () => {
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
        default: {
          template: '<VControlNavigation />',
          components: { VControlNavigation },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('accepts position prop', () => {
    const wrapper = mount(VMap, {
      props: {
        options: defaultMapOptions,
      },
      slots: {
        default: {
          template: '<VControlNavigation position="top-left" />',
          components: { VControlNavigation },
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
          template: '<VControlNavigation :options="{ showCompass: false }" />',
          components: { VControlNavigation },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
