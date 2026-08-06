// Persisted preference for the demo FPS overlay. Shared across the
// ComponentDemo toggle and the map-viewport overlay via the localStorage
// key, so the choice survives navigation. Ported from nxui's docs FPS meter.
export function useFpsMeter() {
  const showFps = useLocalStorage('mapcn-show-fps', false);

  function toggle() {
    showFps.value = !showFps.value;
  }

  return { showFps, toggle };
}
