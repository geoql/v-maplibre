<script setup lang="ts">
  import type { Orientation } from '~/types/compare';

  useSeoMeta({
    title: 'Map Compare - mapcn-vue Examples',
    description:
      'Swipe-style map comparison control with vertical and horizontal orientation.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Map Compare',
    description:
      'Swipe-style map comparison control with vertical and horizontal orientation.',
    category: 'MapLibre',
  });

  const orientation = ref<Orientation>('vertical');

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import maplibregl from 'maplibre-gl';
  import { Compare } from '@geoql/maplibre-gl-compare';
  import '@geoql/maplibre-gl-compare/style.css';

  const containerRef = ref<HTMLDivElement | null>(null);
  const beforeRef = ref<HTMLDivElement | null>(null);
  const afterRef = ref<HTMLDivElement | null>(null);

  onMounted(() => {
  const beforeMap = new maplibregl.Map({
    container: beforeRef.value!,
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [-74.006, 40.7128],
    zoom: 12,
  });

  const afterMap = new maplibregl.Map({
    container: afterRef.value!,
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [-74.006, 40.7128],
    zoom: 12,
  });

  const compare = new Compare(beforeMap, afterMap, containerRef.value!, {
    orientation: 'vertical',
    theme: 'system',
  });

  onUnmounted(() => {
    compare.remove();
    beforeMap.remove();
    afterMap.remove();
  });
  });
${SCRIPT_END}

<template>
  <div ref="containerRef" class="relative h-125 w-full">
    <div ref="beforeRef" class="absolute inset-0" />
    <div ref="afterRef" class="absolute inset-0" />
  </div>
</template>`;
</script>

<template>
  <div class="container max-w-screen-2xl overflow-x-hidden py-4">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-4">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="size-3.5" />
          Examples
        </NuxtLink>
        <h1 class="mt-1.5 text-xl font-semibold tracking-tight">Map Compare</h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Swipe-style map comparison using
          <code class="rounded bg-muted px-1.5 py-0.5 text-sm font-mono"
            >@geoql/maplibre-gl-compare</code
          >. Drag the slider to compare light and dark map styles side by side.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="min-w-0">
          <div class="h-125 overflow-hidden">
            <ClientOnly>
              <ExamplesCompareDemo :orientation="orientation" />
              <template #fallback>
                <div class="flex h-full items-center justify-center bg-muted">
                  <Icon
                    name="lucide:loader-2"
                    class="size-8 animate-spin text-muted-foreground"
                  />
                </div>
              </template>
            </ClientOnly>
          </div>

          <div class="mt-4 bg-card p-4">
            <h3 class="mb-3 text-sm font-medium">Orientation</h3>
            <div class="flex gap-2">
              <button
                v-for="opt in ['vertical', 'horizontal'] as const"
                :key="opt"
                class="rounded-md border px-3 py-1.5 text-sm transition-colors"
                :class="[
                  orientation === opt
                    ? 'border-primary bg-primary text-primary-foreground'
                    : `border-border bg-background hover:bg-muted`,
                ]"
                @click="orientation = opt"
              >
                <Icon
                  :name="
                    opt === 'vertical'
                      ? 'lucide:split-square-horizontal'
                      : 'lucide:split-square-vertical'
                  "
                  class="mr-1 inline-block size-3.5"
                />
                {{ opt.charAt(0).toUpperCase() + opt.slice(1) }}
              </button>
            </div>
          </div>
        </div>
      </ComponentDemo>

      <div class="mt-8 rounded-lg border bg-muted/30 p-6">
        <h3 class="mb-3 text-lg font-semibold">About This Example</h3>
        <p class="mb-4 text-muted-foreground">
          This example uses
          <a
            href="https://github.com/geoql/maplibre-gl-compare"
            target="_blank"
            class="text-primary hover:underline"
          >
            @geoql/maplibre-gl-compare
          </a>
          — a lightweight swipe comparison slider widget for MapLibre GL JS.
          Drag the slider to compare light and dark map styles side by side.
        </p>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span>
              <strong>Compare</strong> - Swipe slider with synced map panning
              and zooming
            </span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span> Vertical and horizontal orientation support </span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span> Automatic theme detection adapting to light/dark mode </span>
          </li>
        </ul>
      </div>

      <div class="mt-4 rounded-lg border bg-muted/50 p-4">
        <h3 class="mb-2 font-medium">Features</h3>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li>
            <strong class="text-foreground">Swipe Comparison:</strong> Drag the
            slider to reveal before/after map styles
          </li>
          <li>
            <strong class="text-foreground">Orientation:</strong> Vertical
            (left/right) or horizontal (top/bottom) split
          </li>
          <li>
            <strong class="text-foreground">Theme Support:</strong>
            Automatically adapts to light/dark mode
          </li>
          <li>
            <strong class="text-foreground">Synced Maps:</strong> Both maps stay
            perfectly synchronized when panning and zooming
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
