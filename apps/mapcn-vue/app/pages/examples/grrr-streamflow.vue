<script setup lang="ts">
  usePageGeo({
    title: 'River Flood History (GRRR) - mapcn-vue Examples',
    description:
      'Google Runoff Reanalysis: 45 years of daily river flow for 31,000 large-river basins, with 2, 20 and 100-year flood levels.',
  });

  defineOgImage('SiteDoc', {
    title: 'River Flood History',
    description:
      '45 years of daily river flow for 31,000 basins from the Google Runoff Reanalysis (GRRR).',
    category: 'Examples',
  });

  const {
    basins,
    selected,
    peaks,
    record,
    year,
    yearValues,
    loading,
    error,
    select,
  } = useGrrr();

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VControlScale } from '@geoql/v-maplibre';
  import { VLayerDeckglScatterplot } from '@geoql/v-maplibre/deck.gl';

  // 31k basins from D1 (a cron job loads them from the GRRR bucket).
  const basins = await $fetch('/api/grrr/basins');

  // The server reads one Zarr chunk from the public GRRR bucket
  // and returns that basin's daily flow, 1981–2025.
  async function onClick({ object }) {
    if (object) series.value = await $fetch(\`/api/grrr/\${object.row}\`);
  }
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full">
    <VControlScale position="bottom-left" />
    <VLayerDeckglScatterplot
      id="grrr-basins"
      :data="basins"
      :get-position="(d) => d.position"
      :get-fill-color="(d) => flowColor(d.rp2)"
      radius-units="pixels"
      :pickable="true"
      @click="onClick"
    />
  </VMap>
</template>`;
</script>

<template>
  <ComponentDemo
    title="River Flood History (GRRR)"
    description="Daily river flow from 1981 to 2025 for 31,000 large-river basins, from the November 2026 Google Runoff Reanalysis & Reforecast (CC BY 4.0). Click a basin to see its yearly peaks against the 2, 20 and 100-year flood levels."
    :code="codeExample"
    registry="map-deckgl-core"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesGrrrBasinMap
        :basins="basins"
        :selected="selected"
        class="size-full"
        @select="select"
      />

      <MapPanel title="River Flood History" panel-width="w-80">
        <ExamplesGrrrBasinPanel
          v-model:year="year"
          :basin="selected"
          :record="record"
          :peaks="peaks"
          :year-values="yearValues"
          :loading="loading"
          :error="error"
        />
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
