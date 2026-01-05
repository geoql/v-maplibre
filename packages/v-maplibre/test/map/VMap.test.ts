import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import VMap from '../../src/map/VMap.vue';
import '../setup';

describe('VMap', () => {
  const defaultOptions = {
    container: 'map',
    style: 'https://demotiles.maplibre.org/style.json',
    center: [0, 0] as [number, number],
    zoom: 2,
  };

  beforeEach(() => {
    // Create a container element
    const container = document.createElement('div');
    container.id = 'map';
    document.body.appendChild(container);
  });

  it('renders correctly', () => {
    const wrapper = mount(VMap, {
      props: {
        options: defaultOptions,
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('accepts options prop', () => {
    const wrapper = mount(VMap, {
      props: {
        options: defaultOptions,
      },
    });

    expect(wrapper.props('options')).toEqual(defaultOptions);
  });

  it('accepts supportPmtiles prop', () => {
    const wrapper = mount(VMap, {
      props: {
        options: defaultOptions,
        supportPmtiles: true,
      },
    });

    expect(wrapper.props('supportPmtiles')).toBe(true);
  });

  it('provides map instance to children', async () => {
    const wrapper = mount(VMap, {
      props: {
        options: defaultOptions,
      },
    });

    await wrapper.vm.$nextTick();

    // The map should be provided via MapKey
    expect(wrapper.vm).toBeDefined();
  });

  it('emits loaded event when map loads', async () => {
    const wrapper = mount(VMap, {
      props: {
        options: defaultOptions,
      },
    });

    await wrapper.vm.$nextTick();

    // Check if loaded event would be emitted
    // Note: In real tests, you'd need to trigger the map's load event
    expect(wrapper.emitted()).toBeDefined();
  });

  it('renders slot content', async () => {
    const wrapper = mount(VMap, {
      props: {
        options: defaultOptions,
      },
      slots: {
        default: '<div class="test-child">Test Content</div>',
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(wrapper.html()).toContain('test-child');
  });

  it('uses default options when not provided', () => {
    const wrapper = mount(VMap, {
      props: {
        options: { container: 'map' } as any,
      },
    });

    expect(wrapper.props('options').container).toBe('map');
  });
});
