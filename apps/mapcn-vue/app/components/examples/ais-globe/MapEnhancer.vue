<script setup lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl';

  const props = defineProps<{
    map: MaplibreMap | null;
  }>();

  const fps = ref(0);

  let frames = 0;
  let windowStart = 0;
  let rafId: number | null = null;

  function onRender(): void {
    frames += 1;
  }

  function tick(now: number): void {
    if (!windowStart) windowStart = now;
    const elapsed = now - windowStart;
    if (elapsed >= 500) {
      fps.value = Math.round((frames * 1000) / elapsed);
      frames = 0;
      windowStart = now;
    }
    rafId = requestAnimationFrame(tick);
  }

  watch(
    () => props.map,
    (instance) => {
      if (!instance) return;
      instance.on('render', onRender);
      rafId = requestAnimationFrame(tick);
    },
    { immediate: true },
  );

  onUnmounted(() => {
    if (rafId) cancelAnimationFrame(rafId);
    props.map?.off('render', onRender);
  });
</script>

<template>
  <div
    class="pointer-events-none absolute top-28 right-3 z-10 flex items-center gap-1.5 rounded-md border border-border/60 bg-background/80 px-2 py-1 font-mono text-[11px] tabular-nums text-muted-foreground backdrop-blur"
  >
    <span
      class="size-1.5 rounded-full"
      :class="
        fps >= 50 ? 'bg-success' : fps >= 30 ? 'bg-warning' : 'bg-destructive'
      "
    />
    <span class="text-foreground">{{ fps }}</span>
    <span>FPS</span>
  </div>
</template>
