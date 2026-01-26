<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglPath,
    VLayerDeckglIcon,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';
  import type { PickingInfo } from '@deck.gl/core';
  import type { BusFeature, BusTrail } from '~/types/actransit';

  useSeoMeta({
    title: 'AC Transit Live (deck.gl) - mapcn-vue Examples',
    description: 'Real-time AC Transit bus tracking with deck.gl layers.',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `actransit-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.2681, 37.8044] as [number, number],
    zoom: 11,
  }));

  const {
    buses,
    trails,
    selectedTrail,
    tripAverageSpeeds,
    totalBuses,
    loading,
    error,
    routeFilter,
    selectedTripId,
    fetchData,
    selectTrip,
    clearFilters,
  } = useActransitData();

  const selectedBus = computed(() => {
    if (!selectedTripId.value) return null;
    return buses.value.find((b) => b.tripId === selectedTripId.value) ?? null;
  });

  const busIconAtlas = ref<string | null>(null);
  const BUS_ICON_MAPPING = {
    bus: { x: 0, y: 0, width: 32, height: 64, mask: false },
  };

  function createBusIconAtlas(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 32;
    canvas.height = 64;

    ctx.fillStyle = '#ff4444';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.roundRect(4, 4, 24, 56, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#87CEEB';
    ctx.beginPath();
    ctx.roundRect(6, 6, 20, 10, 2);
    ctx.fill();
    ctx.stroke();

    return canvas.toDataURL();
  }

  onMounted(() => {
    busIconAtlas.value = createBusIconAtlas();
  });

  function getBusPosition(d: unknown): [number, number] {
    return (d as BusFeature).coordinates;
  }

  function getBusSize(d: unknown): number {
    const bus = d as BusFeature;
    const isSelected = bus.tripId === selectedTripId.value;
    return isSelected ? 25 : 18;
  }

  function getBusAngle(d: unknown): number {
    return (d as BusFeature).bearing;
  }

  function getTrailPath(d: unknown): [number, number][] {
    return (d as BusTrail).path;
  }

  function getTrailColor(d: unknown): [number, number, number, number] {
    const trail = d as BusTrail;
    const isSelected = trail.tripId === selectedTripId.value;
    if (isSelected) return [255, 102, 102, 120];
    return [102, 102, 255, 60];
  }

  function getTrailWidth(d: unknown): number {
    const trail = d as BusTrail;
    const isSelected = trail.tripId === selectedTripId.value;
    return isSelected ? 4 : 2;
  }

  function handleBusClick(info: PickingInfo) {
    if (info.object) {
      const bus = info.object as BusFeature;
      selectTrip(bus.tripId);
    }
  }

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglPath, VLayerDeckglIcon } from '@geoql/v-maplibre';

// Fetch real-time AC Transit data
const { buses, trails } = useActransitData();

// Accessor functions for deck.gl layers
const getBusPosition = (d) => d.coordinates;
const getBusAngle = (d) => d.bearing; // Rotate icon based on heading
const getTrailPath = (d) => d.path;
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-full w-full">
    <!-- Bus history trails -->
    <VLayerDeckglPath
      id="bus-trails"
      :data="trails"
      :get-path="getTrailPath"
      :get-color="getTrailColor"
    />
    <!-- Bus icons with bearing rotation -->
    <VLayerDeckglIcon
      id="buses"
      :data="buses"
      :get-position="getBusPosition"
      :get-angle="getBusAngle"
      :icon-atlas="busIconAtlas"
      :billboard="false"
      :pickable="true"
      @click="handleBusClick"
    />
  </VMap>
</template>`;
</script>

<template>
  <div class="container max-w-screen-2xl overflow-x-hidden py-10">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-8">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="mr-2 size-4" />
          Back to Examples
        </NuxtLink>
        <h1 class="mt-4 text-3xl font-bold tracking-tight">
          AC Transit Live (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Real-time bus tracking for AC Transit (Oakland/East Bay) using deck.gl
          layers. Click a bus to see its trail.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div
          class="relative h-125 min-w-0 overflow-hidden rounded-lg border border-border"
        >
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="size-full">
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />

              <VLayerDeckglPath
                v-if="selectedTrail"
                id="selected-trail"
                :data="[selectedTrail]"
                :get-path="getTrailPath"
                :get-color="
                  () => [255, 102, 102, 140] as [number, number, number, number]
                "
                :get-width="3"
                :width-min-pixels="2"
                :cap-rounded="true"
                :joint-rounded="true"
              />

              <VLayerDeckglPath
                id="bus-trails"
                :data="trails"
                :get-path="getTrailPath"
                :get-color="getTrailColor"
                :get-width="getTrailWidth"
                :width-min-pixels="1"
                :cap-rounded="true"
                :joint-rounded="true"
                :opacity="0.6"
              />

              <VLayerDeckglIcon
                v-if="busIconAtlas"
                id="buses"
                :data="buses"
                :get-position="getBusPosition"
                :get-size="getBusSize"
                :get-angle="getBusAngle"
                :icon-atlas="busIconAtlas"
                :icon-mapping="BUS_ICON_MAPPING"
                :get-icon="() => 'bus'"
                size-units="meters"
                :size-min-pixels="12"
                :size-max-pixels="64"
                :billboard="false"
                :pickable="true"
                @click="handleBusClick"
              />
            </VMap>

            <ExamplesActransitControlPanel
              :bus-count="buses.length"
              :total-buses="totalBuses"
              :loading="loading"
              :error="error"
              :route-filter="routeFilter"
              :selected-bus="selectedBus"
              :trip-average-speeds="tripAverageSpeeds"
              @update:route-filter="routeFilter = $event"
              @refresh="fetchData"
              @clear-filters="clearFilters"
            />
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="ACTransitLive.vue"
          />
        </div>
      </div>

      <div class="mt-8 rounded-lg border bg-muted/30 p-6">
        <h3 class="mb-3 text-lg font-semibold">About This Example</h3>
        <p class="mb-4 text-muted-foreground">
          This example demonstrates real-time transit visualization using
          deck.gl layers. The original
          <a
            href="https://github.com/kuanb/actransit"
            target="_blank"
            class="text-primary hover:underline"
          >
            actransit project
          </a>
          by kuanb uses native MapLibre GL layers, while this implementation
          uses deck.gl for high-performance rendering.
        </p>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span>
              <strong>VLayerDeckglIcon</strong> - Directional bus icons rotated
              by bearing to show travel direction
            </span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span>
              <strong>VLayerDeckglPath</strong> - Historical bus trails showing
              recent movement
            </span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span>
              Auto-refresh every 30 seconds with route filtering support
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
