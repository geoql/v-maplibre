import { describe, it, expect, vi } from 'vite-plus/test';
import { mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import type { Map, MarkerOptions, PointLike } from 'maplibre-gl';
import { MapKey } from '../../src/utils/symbols';

interface MarkerRecord {
  options: MarkerOptions;
  setDraggable: ReturnType<typeof vi.fn>;
  setOffset: ReturnType<typeof vi.fn>;
}

// Every Marker the component creates, with the options it was given.
const markers: MarkerRecord[] = [];

vi.mock('maplibre-gl', () => ({
  Marker: class {
    readonly options: MarkerOptions;
    readonly setDraggable = vi.fn(() => this);
    readonly setOffset = vi.fn(() => this);
    private readonly element = document.createElement('div');
    constructor(options: MarkerOptions = {}) {
      this.options = options;
      markers.push(this);
    }
    setLngLat() {
      return this;
    }
    addTo() {
      return this;
    }
    remove() {
      return this;
    }
    on() {
      return this;
    }
    getElement() {
      return this.element;
    }
  },
}));

const { default: VMarker } = await import('../../src/markers/VMarker.vue');

function mountMarker(props: Record<string, unknown>) {
  // VMarker only subscribes to style.load and adds the marker to the map.
  const map: Pick<Map, 'on' | 'isStyleLoaded'> = {
    on: vi.fn(),
    isStyleLoaded: () => true,
  };
  const wrapper = mount(VMarker, {
    props: { coordinates: [73.85, 18.52], ...props },
    global: { provide: { [MapKey]: ref(map) } },
  });
  const marker = markers.at(-1);
  if (!marker) throw new Error('Marker was not created');
  return { wrapper, marker };
}

describe('VMarker top-level options', () => {
  it('passes draggable, anchor, offset, color and scale to the Marker', () => {
    const offset: PointLike = [0, -12];
    const { marker } = mountMarker({
      draggable: true,
      anchor: 'bottom',
      offset,
      color: '#e11d48',
      scale: 1.5,
    });

    expect(marker.options).toMatchObject({
      draggable: true,
      anchor: 'bottom',
      offset,
      color: '#e11d48',
      scale: 1.5,
    });
  });

  it('lets a top-level prop win over the same key in options', () => {
    const { marker } = mountMarker({
      options: { color: '#000000', draggable: false },
      color: '#22c55e',
      draggable: true,
    });

    expect(marker.options).toMatchObject({ color: '#22c55e', draggable: true });
  });

  it('keeps options values when the top-level prop is not set', () => {
    const { marker } = mountMarker({
      options: { color: '#000000', anchor: 'top', draggable: true },
    });

    expect(marker.options).toMatchObject({
      color: '#000000',
      anchor: 'top',
      draggable: true,
    });
  });

  it('updates draggable and offset on the live marker', async () => {
    const { wrapper, marker } = mountMarker({ draggable: false });

    await wrapper.setProps({ draggable: true, offset: [4, 8] });
    await nextTick();

    expect(marker.setDraggable).toHaveBeenLastCalledWith(true);
    expect(marker.setOffset).toHaveBeenLastCalledWith([4, 8]);
  });
});
