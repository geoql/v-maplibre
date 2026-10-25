import { describe, it, expect, vi } from 'vite-plus/test';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import type { Map } from 'maplibre-gl';
import { MapKey } from '../../src/utils/symbols';

type Listener = (event: unknown) => void;

// One GeolocateControl per test; tests fire its events by hand.
const controls: Array<{ fire: (type: string, event: unknown) => void }> = [];

vi.mock('maplibre-gl', () => ({
  GeolocateControl: class {
    private readonly listeners = new globalThis.Map<string, Listener[]>();
    constructor() {
      controls.push(this);
    }
    on(type: string, listener: Listener) {
      this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
      return this;
    }
    fire(type: string, event: unknown) {
      for (const listener of this.listeners.get(type) ?? []) listener(event);
    }
  },
}));

const { default: VControlGeolocate } =
  await import('../../src/controls/geolocate/VControlGeolocate.vue');

function mountControl() {
  // The control only calls map.addControl().
  const map: Pick<Map, 'addControl'> = { addControl: vi.fn() };
  const wrapper = mount(VControlGeolocate, {
    global: { provide: { [MapKey]: ref(map) } },
  });
  const control = controls.at(-1);
  if (!control) throw new Error('GeolocateControl was not created');
  return { wrapper, control };
}

describe('VControlGeolocate events', () => {
  it('emits the geolocate event with its position payload', () => {
    const { wrapper, control } = mountControl();
    const event = {
      type: 'geolocate',
      coords: { latitude: 18.52, longitude: 73.85, accuracy: 12 },
      timestamp: 1,
    };

    control.fire('geolocate', event);

    expect(wrapper.emitted('geolocate')).toEqual([[event]]);
  });

  it('emits the error event with the GeolocationPositionError', () => {
    const { wrapper, control } = mountControl();
    const error = {
      type: 'error',
      code: 1,
      message: 'User denied Geolocation',
    };

    control.fire('error', error);

    expect(wrapper.emitted('error')).toEqual([[error]]);
  });

  it('passes the payload through for the tracking events', () => {
    const { wrapper, control } = mountControl();
    for (const type of [
      'outofmaxbounds',
      'trackuserlocationstart',
      'trackuserlocationend',
    ]) {
      const event = { type };
      control.fire(type, event);
      expect(wrapper.emitted(type)).toEqual([[event]]);
    }
  });
});
