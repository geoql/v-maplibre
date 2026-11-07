import type { Map as MapLibreMap } from 'maplibre-gl';

/**
 * Whether the style can take mutations (`addSource`, `addLayer`,
 * `setLayoutProperty`, …) right now.
 *
 * This is NOT `map.isStyleLoaded()`. That returns `style.loaded()`, which is
 * `false` while any source is still loading tiles or images — most of the time
 * the user pans or zooms. Gating mutations on it drops updates. MapLibre's own
 * guard, `style._checkLoaded()`, throws "Style is not done loading." only
 * while `style._loaded` is `false`, i.e. until the style has been parsed.
 * This helper checks the same flag.
 *
 * Falls back to `isStyleLoaded()` when the map exposes no `style` object.
 *
 * @param mapInstance - The MapLibre map, or nothing.
 * @returns `true` when the style has been parsed.
 */
export function isStyleReady(
  mapInstance: MapLibreMap | null | undefined,
): boolean {
  if (!mapInstance) return false;
  const style = (mapInstance as { style?: { _loaded?: unknown } }).style;
  if (style && typeof style._loaded === 'boolean') return style._loaded;
  return Boolean(mapInstance.isStyleLoaded());
}

/**
 * Wait until the MapLibre style is ready for style mutations.
 *
 * MapLibre guards every style mutation (`setProjection`, `addSource`,
 * `addLayer`, `setTerrain`, …) behind `style._checkLoaded()`, which throws
 * `Error: Style is not done loading.` while the style has not been parsed
 * yet. Layer components mount as soon as their host renders them — long
 * before the style request resolves — so anything that mutates the style has
 * to WAIT for the style instead of assuming it is ready.
 *
 * Two signals are used because neither alone is sufficient:
 *
 *  - the `style.load` event fires the moment the style has been parsed, which
 *    is exactly when `_checkLoaded()` stops throwing, and
 *  - `isStyleReady()` polling covers the case where `style.load` already
 *    fired before the listener was bound (the map may have been loading since
 *    before the component mounted).
 *
 * @param mapInstance - The MapLibre map to wait on.
 * @param timeoutMs - How long to wait before giving up.
 * @returns `true` when the style became ready, `false` when the timeout hit.
 */
export function waitForStyleReady(
  mapInstance: MapLibreMap,
  timeoutMs = 10000,
): Promise<boolean> {
  if (isStyleReady(mapInstance)) return Promise.resolve(true);

  return new Promise<boolean>((resolve) => {
    let settled = false;
    let interval: ReturnType<typeof setInterval> | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let onStyleLoad: () => void = () => {};

    const finish = (ready: boolean): void => {
      if (settled) return;
      settled = true;
      mapInstance.off('style.load', onStyleLoad);
      if (interval !== undefined) clearInterval(interval);
      if (timeout !== undefined) clearTimeout(timeout);
      resolve(ready);
    };

    // `style.load` fires once the style has been parsed — the exact moment
    // MapLibre stops throwing "Style is not done loading.".
    onStyleLoad = () => finish(true);
    mapInstance.on('style.load', onStyleLoad);

    // Covers the window where `style.load` already fired before this listener
    // was bound.
    interval = setInterval(() => {
      if (isStyleReady(mapInstance)) finish(true);
    }, 100);

    timeout = setTimeout(() => finish(false), timeoutMs);
  });
}
