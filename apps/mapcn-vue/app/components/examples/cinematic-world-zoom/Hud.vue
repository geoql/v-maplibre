<script setup lang="ts">
  import type {
    CinematicDestination,
    CinematicHudState,
    CinematicPhase,
  } from '~/types/cinematic-zoom';

  const props = defineProps<{
    phase: CinematicPhase;
    destination: CinematicDestination | null;
  }>();

  const lngRef = ref<HTMLSpanElement | null>(null);
  const latRef = ref<HTMLSpanElement | null>(null);
  const zoomRef = ref<HTMLSpanElement | null>(null);
  const altRef = ref<HTMLSpanElement | null>(null);
  const destNameRef = ref<HTMLSpanElement | null>(null);
  const destCoordsRef = ref<HTMLSpanElement | null>(null);

  function formatAltitude(m: number): string {
    return m >= 10_000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
  }

  function update(hud: CinematicHudState): void {
    if (lngRef.value) lngRef.value.textContent = hud.lng.toFixed(4);
    if (latRef.value) latRef.value.textContent = hud.lat.toFixed(4);
    if (zoomRef.value) zoomRef.value.textContent = hud.zoom.toFixed(2);
    if (altRef.value) altRef.value.textContent = formatAltitude(hud.altitudeM);
  }

  watch(
    () => props.phase,
    (phase) => {
      if (phase === 'arrived' && props.destination) {
        if (destNameRef.value)
          destNameRef.value.textContent = props.destination.name;
        if (destCoordsRef.value) {
          destCoordsRef.value.textContent = `${props.destination.coordinates[0].toFixed(4)}, ${props.destination.coordinates[1].toFixed(4)}`;
        }
      }
    },
  );

  defineExpose({ update });
</script>

<template>
  <div
    v-show="phase !== 'idle'"
    class="absolute left-4 top-4 z-20 rounded-lg border border-border bg-background/80 px-3 py-1.5 font-mono text-xs tabular-nums text-muted-foreground backdrop-blur"
  >
    <template v-if="phase === 'arrived' && destination">
      <div
        class="flex items-center gap-2 font-sans text-sm font-medium text-foreground"
      >
        <Icon name="lucide:map-pin" class="size-3.5" />
        <span ref="destNameRef">{{ destination.name }}</span>
      </div>
      <div class="mt-0.5">
        LON
        <span ref="destCoordsRef">{{
          destination.coordinates[0].toFixed(4)
        }}</span>
        LAT <span>{{ destination.coordinates[1].toFixed(4) }}</span>
      </div>
    </template>
    <template v-else>
      <div>
        LON <span ref="lngRef">&mdash;</span> LAT
        <span ref="latRef">&mdash;</span>
      </div>
      <div>ZOOM <span ref="zoomRef">&mdash;</span></div>
      <div>ALT <span ref="altRef">&mdash;</span></div>
    </template>
  </div>
</template>
