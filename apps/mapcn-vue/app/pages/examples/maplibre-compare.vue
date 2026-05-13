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
  <ComponentDemo
    title="Map Compare"
    description="Swipe-style map comparison using @geoql/maplibre-gl-compare. Drag the slider to compare light and dark map styles side by side."
    :code="codeExample"
    registry="map-layers"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
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
      <MapPanel title="Orientation" panel-width="w-auto">
        <div class="flex gap-2">
          <button
            v-for="opt in ['vertical', 'horizontal'] as const"
            :key="opt"
            class="rounded-md border px-3 py-1.5 text-sm transition-colors"
            :class="[
              orientation === opt
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background hover:bg-muted',
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
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
