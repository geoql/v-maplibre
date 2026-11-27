import { getVersion, getWorkerUrl, setWorkerUrl } from 'maplibre-gl';

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
 * The worker and the main thread must be the same MapLibre build. Struct
 * arrays cross the worker boundary as raw buffers, and their layout changes
 * between releases (6.20.0 widened `PlacedSymbol.glyphStartIndex` from Uint16
 * to Uint32), so a mixed pair throws `Length of new data is N, which doesn't
 * match current length of M` from the draw loop and the map never loads. The
 * bundled worker is therefore installed only when `getVersion()` equals the
 * version it was built from. On a mismatch MapLibre keeps its default worker
 * URL and one warning names both versions.
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

  const mainVersion = getVersion();
  if (mainVersion !== __MAPLIBRE_WORKER_VERSION__) {
    console.warn(
      `[v-maplibre] The bundled MapLibre worker is maplibre-gl ${__MAPLIBRE_WORKER_VERSION__} but this page runs maplibre-gl ${mainVersion}. ` +
        'The bundled worker was not installed, because a worker and main thread from different versions break symbol layers. ' +
        "Call setWorkerUrl() with the worker from your own maplibre-gl before the first VMap mounts (for example `import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'` in Vite), " +
        `or install maplibre-gl ${__MAPLIBRE_WORKER_VERSION__}.`,
    );
    return;
  }
  setWorkerUrl(new URL('./maplibre-worker.js', import.meta.url).href);
}
