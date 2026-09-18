import { getWorkerUrl, setWorkerUrl } from 'maplibre-gl';

let installed = false;

/**
 * Point MapLibre GL v6 at a worker URL that survives bundling.
 *
 * Why: v6 resolves its worker with a URL computed at runtime
 * (`new URL(`./${t}`, base)`) which no bundler can see, so the request falls
 * through to the app bundle's directory and 404s (geoql/v-maplibre#160).
 *
 * The URL below is the native `new URL(..., import.meta.url)` form, which Vite
 * (dev + build) and webpack 5 both resolve and emit as an asset — no
 * bundler-specific import query. `dist/maplibre-worker.js` is emitted by
 * `vp pack` from the `src/maplibre-worker.ts` entry, which bundles MapLibre's
 * worker pair into one file: asset emission copies the file without following
 * its imports, so the file must be self-contained.
 *
 * `VMap` calls this on mount, so consumers need no setup. A consumer that
 * already set its own worker URL (for example a Vite app using
 * `maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url` to get a worker built
 * from its own maplibre-gl version) keeps that URL.
 */
export function installMaplibreWorkerUrl(): void {
  if (installed) return;
  installed = true;
  if (getWorkerUrl()) return;
  setWorkerUrl(new URL('./maplibre-worker.js', import.meta.url).href);
}
