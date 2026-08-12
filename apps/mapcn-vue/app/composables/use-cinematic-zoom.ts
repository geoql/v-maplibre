import { usePreferredReducedMotion } from '@vueuse/core';
import type {
  CinematicCameraState,
  CinematicDestination,
  CinematicMapHandle,
  CinematicPhase,
  CinematicShot,
} from '~/types/cinematic-zoom';
import {
  buildShot,
  getHudAltitude,
  SETTLE_S,
  SHOT_DURATION_S,
  WORLD_START,
} from '~/utils/cinematic-zoom/shot';
import type { Map as MaplibreMap } from 'maplibre-gl';

/**
 * Cinematic flight driver: one rAF loop driving map.jumpTo per frame from
 * per-channel shot curves. Interruption is our job — jumpTo calls stop()
 * internally every frame, so the loop must release control the instant the
 * user touches the map (movestart with an originalEvent, pointerdown/wheel
 * on the canvas) or presses Escape. Never writes Vue reactive state per
 * frame; the HUD is updated via a throttled callback.
 */
export function useCinematicZoom(handle: CinematicMapHandle) {
  const phase = ref<CinematicPhase>('idle');
  const currentDestination = ref<CinematicDestination | null>(null);
  // NOTE: @vueuse/core v14's usePreferredReducedMotion returns the string
  // 'reduce' | 'no-preference' (not a boolean) — compare explicitly.
  const reducedMotion = computed(
    () => usePreferredReducedMotion().value === 'reduce',
  );

  let shot: CinematicShot | null = null;
  let rafId: number | null = null;
  let startTime = 0;
  let lastHudAt = 0;
  let currentMap: MaplibreMap | null = null;

  function getMap(): MaplibreMap | null {
    return handle.map.value;
  }

  function setPhase(next: CinematicPhase): void {
    phase.value = next;
    handle.onPhaseChange?.(next);
  }

  function teardownListeners(): void {
    if (!currentMap) return;
    currentMap.off('movestart', onMoveStart);
    const canvas = currentMap.getCanvas();
    canvas.removeEventListener('pointerdown', onPointer);
    canvas.removeEventListener('wheel', onPointer);
    window.removeEventListener('keydown', onKeyDown);
    currentMap = null;
  }

  function registerListeners(): void {
    const map = getMap();
    if (!map) return;
    currentMap = map;
    map.on('movestart', onMoveStart);
    const canvas = map.getCanvas();
    canvas.addEventListener('pointerdown', onPointer, { passive: true });
    canvas.addEventListener('wheel', onPointer, { passive: true });
    window.addEventListener('keydown', onKeyDown);
  }

  function abortFromInterrupt(): void {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    teardownListeners();
    if (phase.value === 'flying') setPhase('idle');
  }

  function onMoveStart(e: { originalEvent?: unknown }): void {
    if (e.originalEvent) abortFromInterrupt();
  }

  function onPointer(): void {
    abortFromInterrupt();
  }

  function onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') abortFromInterrupt();
  }

  function apply(state: CinematicCameraState): void {
    const map = getMap();
    if (!map) return;
    map.jumpTo(state);
    const now = performance.now();
    if (handle.onHud && now - lastHudAt >= 100) {
      lastHudAt = now;
      const center = map.getCenter();
      handle.onHud({
        lng: center.lng,
        lat: center.lat,
        zoom: map.getZoom(),
        altitudeM: getHudAltitude(
          center.lat,
          map.getZoom(),
          map.getCanvas().clientHeight,
        ),
      });
    }
  }

  function tick(now: number): void {
    if (!shot) return;
    const t = (now - startTime) / (SHOT_DURATION_S * 1000);
    if (t < 1) {
      apply(shot.sample(t));
      rafId = requestAnimationFrame(tick);
    } else if (t < 1 + SETTLE_S) {
      apply(shot.settle(t - 1));
      rafId = requestAnimationFrame(tick);
    } else {
      apply(shot.rest);
      rafId = null;
      teardownListeners();
      setPhase('arrived');
    }
  }

  function fly(destination: CinematicDestination): void {
    const map = getMap();
    if (!map) return;
    currentDestination.value = destination;

    if (reducedMotion.value) {
      // Reduced motion: no flight, one jump straight to the arrival state.
      const restShot = buildShot(destination);
      map.jumpTo(restShot.rest);
      handle.onHud?.({
        lng: restShot.rest.center[0],
        lat: restShot.rest.center[1],
        zoom: restShot.rest.zoom,
        altitudeM: getHudAltitude(
          restShot.rest.center[1],
          restShot.rest.zoom,
          map.getCanvas().clientHeight,
        ),
      });
      setPhase('arrived');
      return;
    }

    abortFromInterrupt();
    if (phase.value === 'arrived') {
      map.jumpTo(WORLD_START);
      setPhase('idle');
    }
    shot = buildShot(destination);
    startTime = performance.now();
    lastHudAt = 0;
    registerListeners();
    setPhase('flying');
    rafId = requestAnimationFrame(tick);
  }

  function replay(): void {
    if (currentDestination.value) fly(currentDestination.value);
  }

  function cleanup(): void {
    abortFromInterrupt();
    shot = null;
  }

  onScopeDispose(cleanup);

  watch(
    () => handle.map.value,
    (map, prev) => {
      if (map && map !== prev) abortFromInterrupt();
    },
  );

  return { phase, currentDestination, fly, replay, cleanup };
}
