import { onMounted, watch, type Ref } from 'vue';
import type { Map } from 'maplibre-gl';

/**
 * Run a callback as soon as the MapLibre map's style is loaded.
 *
 * MapLibre's `style.load` event fires exactly once per style change. If the
 * style is already loaded by the time a child wrapper mounts (the common case
 * in production where lazy-loaded chunks arrive AFTER the basemap has
 * rendered), the `.once()` listener never fires and the layer never
 * initialises. This helper polls `isStyleLoaded()` every 100ms (capped at
 * 10s) alongside the event listener so the callback runs whether the style
 * loaded before or after the wrapper mounted, and whether the map ref
 * arrived synchronously or asynchronously.
 */
export function useMapReady(map: Ref<Map | null>, cb: () => void): void {
  let fired = false;
  const fireOnce = () => {
    if (fired) return;
    fired = true;
    cb();
  };

  const waitForStyle = (m: Map) => {
    if (m.isStyleLoaded()) {
      fireOnce();
      return;
    }
    m.once('style.load', fireOnce);
    const interval = setInterval(() => {
      if (fired) {
        clearInterval(interval);
        return;
      }
      if (m.isStyleLoaded()) {
        clearInterval(interval);
        fireOnce();
      }
    }, 100);
    setTimeout(() => clearInterval(interval), 10000);
  };

  onMounted(() => {
    if (map.value) {
      waitForStyle(map.value);
    } else {
      const stop = watch(map, (m) => {
        if (m) {
          stop();
          waitForStyle(m);
        }
      });
    }
  });
}
