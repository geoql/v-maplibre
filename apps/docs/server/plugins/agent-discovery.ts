/**
 * The home page is a Vue page, not a content document, so the generated
 * /raw/index.md takes its title and description from here (same wording as
 * llms.txt).
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('agent-discovery:index', (_event, index) => {
    index.title ||= 'v-maplibre';
    index.description ||=
      'Vue 3 components for MapLibre GL: maps, markers, popups, controls, MapLibre and deck.gl layers.';
  });
});
