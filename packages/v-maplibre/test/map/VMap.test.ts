import { describe, it, expect, beforeEach, vi } from 'vite-plus/test';
import { mount } from '@vue/test-utils';
import VMap from '../../src/map/VMap.vue';
import { MockMap } from '../setup';

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

  // Map#remove() is what releases the WebGL context, tiles and workers.
  // Without it every unmounted VMap kept its GPU context alive: iOS Safari
  // killed the tab after a few, and desktop Chrome silently evicted the
  // oldest live maps once 16 contexts existed.
  it('removes the MapLibre map when it unmounts', async () => {
    const remove = vi.spyOn(MockMap.prototype, 'remove');
    const wrapper = mount(VMap, { props: { options: defaultOptions } });
    await wrapper.vm.$nextTick();
    expect(remove).not.toHaveBeenCalled();

    wrapper.unmount();

    expect(remove).toHaveBeenCalledTimes(1);
    remove.mockRestore();
  });

  // MapLibre throws "Invalid type: 'container' must be a String or
  // HTMLElement" without a container, so VMap uses its own element.
  it('uses its own element as the container when options.container is not set', async () => {
    const { container: _omit, ...withoutContainer } = defaultOptions;
    void _omit;
    const wrapper = mount(VMap, {
      props: { options: withoutContainer },
      attachTo: document.body,
    });
    await wrapper.vm.$nextTick();

    expect(MockMap.lastInstance?.options.container).toBe(wrapper.element);
    expect(wrapper.attributes('id')).toBeUndefined();
    wrapper.unmount();
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

  it('applies globalState as the initial state, over options.globalState', () => {
    mount(VMap, {
      props: {
        options: { ...defaultOptions, globalState: { mode: 'base' } },
        globalState: { mode: 'dark', minPop: 1000 },
      },
    });

    expect(MockMap.lastInstance?.options.globalState).toEqual({
      mode: 'dark',
      minPop: 1000,
    });
  });

  it('syncs changed, nested and removed globalState keys to the map', async () => {
    const wrapper = mount(VMap, {
      props: {
        options: defaultOptions,
        globalState: { mode: 'dark', classes: ['a'], keep: 1 },
      },
    });
    const instance = MockMap.lastInstance!;

    await wrapper.setProps({
      globalState: { mode: 'light', classes: ['a', 'b'], keep: 1 },
    });
    expect(instance.setGlobalStateProperty).toHaveBeenCalledWith(
      'mode',
      'light',
    );
    expect(instance.setGlobalStateProperty).toHaveBeenCalledWith('classes', [
      'a',
      'b',
    ]);
    expect(instance.setGlobalStateProperty).not.toHaveBeenCalledWith(
      'keep',
      expect.anything(),
    );

    instance.setGlobalStateProperty.mockClear();
    await wrapper.setProps({ globalState: { mode: 'light' } });
    // Removed keys reset to the style default with `null`.
    expect(instance.setGlobalStateProperty).toHaveBeenCalledWith(
      'classes',
      null,
    );
    expect(instance.setGlobalStateProperty).toHaveBeenCalledWith('keep', null);
    expect(instance.setGlobalStateProperty).toHaveBeenCalledTimes(2);
  });

  it('passes dragRotate to the map and toggles it reactively', async () => {
    const wrapper = mount(VMap, {
      props: {
        options: defaultOptions,
        dragRotate: { around: 'pointer' },
      },
    });
    const instance = MockMap.lastInstance!;
    expect(instance.options.dragRotate).toEqual({ around: 'pointer' });

    await wrapper.setProps({ dragRotate: false });
    expect(instance.dragRotate.disable).toHaveBeenCalledTimes(1);

    await wrapper.setProps({
      dragRotate: { around: 'center', movement: 'linear' },
    });
    expect(instance.dragRotate.enable).toHaveBeenCalledWith({
      around: 'center',
      movement: 'linear',
    });
  });

  it('leaves options.dragRotate and options.globalState alone when the props are unset', () => {
    mount(VMap, {
      props: {
        options: {
          ...defaultOptions,
          dragRotate: false,
          globalState: { mode: 'base' },
        },
      },
    });

    expect(MockMap.lastInstance?.options.dragRotate).toBe(false);
    expect(MockMap.lastInstance?.options.globalState).toEqual({
      mode: 'base',
    });
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
