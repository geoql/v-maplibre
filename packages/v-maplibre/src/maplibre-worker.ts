/**
 * Worker entry — bundled into `dist/maplibre-worker.js` by `vp pack`.
 *
 * MapLibre GL v6 creates its worker internally and ships it as a two-file ESM
 * pair (`maplibre-gl-worker.mjs` + `maplibre-gl-shared.mjs`). Bundlers emit a
 * file referenced with the native `new URL('./file', import.meta.url)` pattern
 * as an asset — they copy it, they do not follow its imports — so the file the
 * library points at must already be self-contained. Bundling the pair here is
 * what makes that true.
 *
 * The re-export is load-bearing: a bare side-effect import is dropped because
 * `maplibre-gl` declares only `*.css` and `src/**` as side-effectful, while the
 * worker's own bootstrap runs on import.
 *
 * See `src/utils/maplibre-worker-url.ts` for the runtime side and
 * `geoql/v-maplibre#160` for the bug this solves. This entry is not exported
 * from the package: it exists only to produce the asset.
 */
export { default } from 'maplibre-gl/dist/maplibre-gl-worker.mjs';
