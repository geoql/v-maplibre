import { defineComponent, h } from 'vue';

// Stand-in for `@geoql/v-maplibre` in tests (aliased in vite.config.ts), so the
// registry components can be mounted without a WebGL map or a built library.
// VMap records the props the registry passes down.
export const VMap = defineComponent({
  name: 'VMap',
  props: {
    options: { type: Object, required: true },
    supportPmtiles: { type: Boolean, default: false },
  },
  setup(_, { slots }) {
    return () => h('div', slots.default?.());
  },
});
