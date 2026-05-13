<script setup lang="ts">
  import { FLOOD_REGIONS } from '~/composables/use-google-flood';
  import type { FloodMarker } from '~/types/flood';

  useSeoMeta({
    title: 'Real-Time Flood Monitoring - mapcn-vue Examples',
    description:
      'Live flood severity, inundation maps, and gauge forecasts powered by Google Flood Forecasting API across 20+ countries.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Real-Time Flood Monitoring',
    description:
      'Live flood severity and gauge forecasts from Google Flood Forecasting API.',
    category: 'Examples',
  });

  const {
    regionCode,
    loading,
    error,
    floodMarkers,
    significantEvents,
    polygons,
    selectedGauge,
    lastFetch,
    getSeverityColor,
    getSeverityRadius,
    selectGauge,
    clearSelection,
    refresh,
  } = useGoogleFlood();
  const currentRegion = computed(
    () =>
      FLOOD_REGIONS.find((r) => r.code === regionCode.value) ??
      FLOOD_REGIONS[0]!,
  );

  const mapCenter = computed<[number, number]>(
    () => currentRegion.value.center,
  );
  const mapZoom = computed(() => currentRegion.value.zoom);

  onMounted(() => refresh());

  function handleRegionChange(code: string): void {
    regionCode.value = code;
    clearSelection();
    refresh();
  }

  function handleSelectGauge(marker: FloodMarker): void {
    selectGauge(marker);
  }

  function handleClosePopup(): void {
    clearSelection();
  }

  function handleRefresh(): void {
    refresh();
  }
  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VLayerDeckglScatterplot, VControlNavigation } from '@geoql/v-maplibre';

  const { data } = await useFetch('/api/flood-forecasting', {
    method: 'POST',
    query: { endpoint: 'floodStatus:searchLatestFloodStatusByArea' },
    body: { regionCode: 'IN', pageSize: 200, includeNonQualityVerified: true },
  });

  const markers = computed(() =>
    data.value?.floodStatuses?.map(s => ({
      gaugeId: s.gaugeId,
      coordinates: [s.gauge.location.longitude, s.gauge.location.latitude],
      severity: s.severity,
    })) ?? [],
  );
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full">
    <VControlNavigation position="top-right" />
    <VLayerDeckglScatterplot
      id="flood-gauges"
      :data="markers"
      :get-position="(d) => d.coordinates"
      :get-fill-color="getSeverityColor"
      :get-radius="getSeverityRadius"
      :radius-min-pixels="5"
      :radius-max-pixels="30"
      :pickable="true"
    />
  </VMap>
</template>`;
</script>

<template>
  <ComponentDemo
    title="Real-Time Flood Monitoring"
    description="Live flood severity, inundation maps, and gauge forecasts from the Google Flood Forecasting API. Select a region, click a gauge marker to see details and forecasts."
    :code="codeExample"
    registry="map-layers"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesGoogleFloodMap
        :markers="floodMarkers"
        :polygons="polygons"
        :selected-gauge="selectedGauge"
        :center="mapCenter"
        :zoom="mapZoom"
        :get-severity-color="getSeverityColor"
        :get-severity-radius="getSeverityRadius"
        class="size-full"
        @select-gauge="handleSelectGauge"
        @close-popup="handleClosePopup"
      />

      <div
        v-if="loading && floodMarkers.length === 0"
        class="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-lg border border-border/50 bg-background/90 px-4 py-2 shadow-sm backdrop-blur-sm"
      >
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon
            name="lucide:loader-2"
            class="size-4 animate-spin text-primary"
          />
          Loading flood data…
        </div>
      </div>

      <MapPanel title="Flood Forecast" panel-width="w-72">
        <ExamplesGoogleFloodRegionSelector
          :model-value="regionCode"
          @update:model-value="handleRegionChange"
        />

        <div class="border-t border-border">
          <ExamplesGoogleFloodStatusPanel
            :markers="floodMarkers"
            :loading="loading"
            :error="error"
            :last-fetch="lastFetch"
            @refresh="handleRefresh"
          />
        </div>

        <div class="border-t border-border">
          <ExamplesGoogleFloodGaugeForecastChart
            :forecast="selectedGauge?.forecast"
            :loading="selectedGauge?.forecastLoading ?? false"
            :selected="!!selectedGauge"
          />
        </div>

        <div class="border-t border-border">
          <ExamplesGoogleFloodEventsPanel
            :events="significantEvents"
            :loading="loading"
          />
        </div>
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
