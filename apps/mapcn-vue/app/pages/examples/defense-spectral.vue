<script setup lang="ts">
  import type {
    SpectralBand,
    SpectralPair,
    Orientation,
  } from '~/types/defense-spectral';

  useSeoMeta({
    title: 'Multi-Spectral Compare - mapcn-vue Examples',
    description:
      'Defense multi-spectral imagery comparison with swipe slider between thermal, IR, and optical sensor views.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Multi-Spectral Compare',
    description: 'Defense multi-spectral imagery comparison with swipe slider.',
    category: 'MapLibre',
  });

  const config = useRuntimeConfig();
  const key = config.public.mapsguruApiKey;

  const BAND_STYLES: Record<SpectralBand, string> = {
    visual: `https://maps.guru/api/v1/styles/standard/light/style.json?key=${key}`,
    thermal: `https://maps.guru/api/v1/styles/standard/high_contrast/style.json?key=${key}`,
    nightvision: `https://maps.guru/api/v1/styles/standard/dark/style.json?key=${key}`,
  };

  const SPECTRAL_PAIRS: SpectralPair[] = [
    {
      id: 'vis-therm',
      label: 'Visual / Thermal',
      before: 'visual',
      after: 'thermal',
    },
    {
      id: 'vis-nv',
      label: 'Visual / Night Vision',
      before: 'visual',
      after: 'nightvision',
    },
    {
      id: 'therm-nv',
      label: 'Thermal / Night Vision',
      before: 'thermal',
      after: 'nightvision',
    },
  ];

  const orientation = ref<Orientation>('vertical');
  const selectedPair = ref<SpectralPair>(SPECTRAL_PAIRS[0]);
  const beforeStyle = computed(() => BAND_STYLES[selectedPair.value.before]);
  const afterStyle = computed(() => BAND_STYLES[selectedPair.value.after]);

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { Compare } from '@geoql/maplibre-gl-compare';
  import '@geoql/maplibre-gl-compare/style.css';
  import { VMap } from '@geoql/v-maplibre';

  const beforeStyle = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
  const afterStyle = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
${SCRIPT_END}

<template>
  <div ref="containerRef" class="relative h-125 w-full">
    <VMap :options="{ style: beforeStyle, center: [77.5, 34.0], zoom: 10 }" class="absolute inset-0" />
    <VMap :options="{ style: afterStyle, center: [77.5, 34.0], zoom: 10 }" class="absolute inset-0" />
  </div>
</template>`;
</script>

<template>
  <ComponentDemo
    title="Multi-Spectral Compare"
    description="Defense multi-spectral imagery comparison. Swipe the slider to compare different sensor views — optical, thermal, and night vision — of the same terrain area (Kashmir/Ladakh region)."
    :code="codeExample"
    registry="map-layers"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ClientOnly>
        <ExamplesSpectralDemo
          :orientation="orientation"
          :before-style="beforeStyle"
          :after-style="afterStyle"
          :before-band="selectedPair.before"
          :after-band="selectedPair.after"
        />
        <template #fallback>
          <div class="flex h-full items-center justify-center bg-muted">
            <Icon
              name="lucide:loader-2"
              class="size-8 animate-spin text-muted-foreground"
            />
          </div>
        </template>
      </ClientOnly>
      <MapPanel title="Spectral" panel-width="w-56">
        <ExamplesSpectralControlPanel
          :pairs="SPECTRAL_PAIRS"
          :selected-pair="selectedPair"
          :orientation="orientation"
          @update:selected-pair="selectedPair = $event"
          @update:orientation="orientation = $event"
        />
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
