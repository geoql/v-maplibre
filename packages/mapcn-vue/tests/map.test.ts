import { describe, it, expect } from 'vite-plus/test';
import { mount } from '@vue/test-utils';
import Map from '../registry/new-york/map/Map.vue';
import { VMap } from './v-maplibre-stub';

describe('registry Map', () => {
  it('declares supportPmtiles as a typed prop', () => {
    // Undeclared attributes still fall through to VMap at runtime, but then
    // the prop is untyped for consumers and missing from the docs.
    expect(Object.keys(Map.props ?? {})).toContain('supportPmtiles');
  });

  it('does not enable PMTiles by default', () => {
    const wrapper = mount(Map);

    expect(wrapper.findComponent(VMap).props('supportPmtiles')).toBe(false);
  });

  it('passes supportPmtiles to the library map', () => {
    const wrapper = mount(Map, { props: { supportPmtiles: true } });

    expect(wrapper.findComponent(VMap).props('supportPmtiles')).toBe(true);
  });
});
