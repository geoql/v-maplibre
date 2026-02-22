<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglPath,
    VLayerDeckglIcon,
    VLayerDeckglScatterplot,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';
  import type { CategoryLegendItem } from '@geoql/v-maplibre';
  import type { Map as MapLibreMap } from 'maplibre-gl';
  import type { PickingInfo } from '@deck.gl/core';
  import type { BusFeature, BusTrail, StopFeature } from '~/types/actransit';
  import { motion, AnimatePresence } from 'motion-v';

  useSeoMeta({
    title: 'AC Transit Live (deck.gl) - mapcn-vue Examples',
    description: 'Real-time AC Transit bus tracking with deck.gl layers.',
  });

  defineOgImage('MapcnDoc', {
    title: 'AC Transit Live (deck.gl)',
    description: 'Real-time AC Transit bus tracking with deck.gl layers.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();
  const panelOpen = ref(true);

  function togglePanel() {
    panelOpen.value = !panelOpen.value;
  }

  const mapOptions = computed(() => ({
    container: `actransit-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.2681, 37.8044] as [number, number],
    zoom: 11,
  }));

  const {
    buses,
    trails,
    stops,
    selectedTrail,
    tripAverageSpeeds,
    totalBuses,
    loading,
    error,
    routeFilter,
    selectedTripId,
    fetchData,
    selectTrip,
    selectStop,
    clearFilters,
  } = useActransitData();

  // Track current zoom level for showing/hiding stops
  const currentZoom = ref(11);
  const STOPS_MIN_ZOOM = 12;
  const showStops = computed(() => currentZoom.value >= STOPS_MIN_ZOOM);

  // Selected stop for popup
  const selectedStopData = ref<StopFeature | null>(null);

  function handleMapLoad(map: MapLibreMap) {
    // Set initial zoom
    currentZoom.value = map.getZoom();
    // Update on zoom changes
    map.on('zoom', () => {
      currentZoom.value = map.getZoom();
    });
  }

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
      // Clear stop selection when selecting a bus
      selectedStopData.value = null;
    }
  }

  function closeBusPopup() {
    selectTrip(null);
  }

  // Get average speed for selected bus
  const selectedBusAvgSpeed = computed(() => {
    if (!selectedTripId.value) return null;
    return tripAverageSpeeds.value[selectedTripId.value] ?? null;
  });

  // Convert m/s to mph
  function msToMph(ms: number): number {
    return Math.round(ms * 2.237);
  }

  // Stop layer accessors
  function getStopPosition(d: unknown): [number, number] {
    return (d as StopFeature).coordinates;
  }

  function getStopColor(): [number, number, number, number] {
    return [66, 133, 244, 255]; // Google blue
  }

  function handleStopClick(info: PickingInfo) {
    if (info.object) {
      const stop = info.object as StopFeature;
      selectedStopData.value = stop;
      selectStop(stop);
    }
  }

  function closeStopPopup() {
    selectedStopData.value = null;
    selectStop(null);
  }

  const transitLegendItems: CategoryLegendItem[] = [
    { value: 'bus', label: 'Bus', color: '#ff4444' },
    { value: 'trail', label: 'Bus Trail', color: '#6666ff' },
    { value: 'selected', label: 'Selected Trail', color: '#ff6666' },
    { value: 'stop', label: 'Bus Stop', color: '#4285f4' },
  ];

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
        <h1 class="mt-1.5 text-xl font-semibold tracking-tight">
          AC Transit Live (deck.gl)
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Real-time bus tracking for AC Transit (Oakland/East Bay) using deck.gl
          layers. Click a bus to see its trail, or zoom in to see stops.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="relative h-125 min-w-0 overflow-hidden">
          <ClientOnly>
            <VMap
              :key="mapStyle"
              :options="mapOptions"
              class="size-full"
              @loaded="handleMapLoad"
            >
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

              <VControlLegend
                :layer-ids="['buses', 'bus-trails', 'stops']"
                position="bottom-left"
                type="category"
                title="Transit Features"
                :items="transitLegendItems"
                :interactive="false"
              />

              <!-- Bus stops - visible at higher zoom levels -->
              <VLayerDeckglScatterplot
                v-if="showStops"
                id="stops"
                :data="stops"
                :get-position="getStopPosition"
                :get-fill-color="getStopColor"
                :get-radius="6"
                :radius-min-pixels="4"
                :radius-max-pixels="12"
                :pickable="true"
                :stroked="true"
                :get-line-color="() => [255, 255, 255, 255]"
                :line-width-min-pixels="1"
                @click="handleStopClick"
              />
            </VMap>

            <!-- Bus popup -->
            <AnimatePresence>
              <motion.div
                v-if="selectedBus"
                :initial="{ opacity: 0, y: 10, scale: 0.95 }"
                :animate="{ opacity: 1, y: 0, scale: 1 }"
                :exit="{ opacity: 0, y: 10, scale: 0.95 }"
                :transition="{ type: 'spring', stiffness: 400, damping: 30 }"
                class="absolute bottom-4 left-1/2 z-20 w-56 -translate-x-1/2 rounded-lg bg-background/95 p-4 shadow-lg backdrop-blur-sm"
              >
                <button
                  class="absolute top-2 right-2 flex size-6 items-center justify-center rounded-md hover:bg-muted"
                  @click="closeBusPopup"
                >
                  <Icon name="lucide:x" class="size-4" />
                </button>
                <div class="space-y-1.5">
                  <div class="font-semibold">
                    Route: {{ selectedBus.routeId }}
                  </div>
                  <div class="text-sm text-muted-foreground">
                    Trip: {{ selectedBus.tripId }}
                  </div>
                  <div class="text-sm text-muted-foreground">
                    Bearing: {{ Math.round(selectedBus.bearing) }}°
                  </div>
                  <div class="text-sm text-muted-foreground">
                    Speed: {{ msToMph(selectedBus.speed) }} mph
                  </div>
                  <div
                    v-if="selectedBusAvgSpeed !== null"
                    class="text-sm text-muted-foreground"
                  >
                    Avg Speed: {{ msToMph(selectedBusAvgSpeed) }} mph
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <!-- Stop popup -->
            <AnimatePresence>
              <motion.div
                v-if="selectedStopData && !selectedBus"
                :initial="{ opacity: 0, y: 10, scale: 0.95 }"
                :animate="{ opacity: 1, y: 0, scale: 1 }"
                :exit="{ opacity: 0, y: 10, scale: 0.95 }"
                :transition="{ type: 'spring', stiffness: 400, damping: 30 }"
                class="absolute bottom-4 left-1/2 z-20 w-72 -translate-x-1/2 rounded-lg bg-background/95 p-4 shadow-lg backdrop-blur-sm"
              >
                <button
                  class="absolute top-2 right-2 flex size-6 items-center justify-center rounded-md hover:bg-muted"
                  @click="closeStopPopup"
                >
                  <Icon name="lucide:x" class="size-4" />
                </button>
                <div class="space-y-2">
                  <div class="font-semibold">
                    Stop ID: {{ selectedStopData.stpid }}
                  </div>
                  <div class="text-sm text-muted-foreground">
                    Name: {{ selectedStopData.name }}
                  </div>
                  <div class="text-sm text-muted-foreground">
                    Routes: {{ selectedStopData.routeNames.join(', ') }}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <!-- Toggle button - always visible -->
            <button
              class="absolute top-4 left-4 z-10 flex size-9 items-center justify-center rounded-lg bg-background/95 shadow-lg backdrop-blur-sm transition-colors hover:bg-accent"
              :class="{
                'bg-primary text-primary-foreground hover:bg-primary/90':
                  !panelOpen,
              }"
              @click="togglePanel"
            >
              <Icon
                :name="
                  panelOpen
                    ? 'lucide:panel-left-close'
                    : 'lucide:panel-left-open'
                "
                class="size-4"
              />
            </button>

            <!-- Collapsible control panel with motion-v -->
            <AnimatePresence>
              <motion.div
                v-if="panelOpen"
                :initial="{ opacity: 0, x: -20, scale: 0.95 }"
                :animate="{ opacity: 1, x: 0, scale: 1 }"
                :exit="{ opacity: 0, x: -20, scale: 0.95 }"
                :transition="{ type: 'spring', stiffness: 300, damping: 25 }"
                class="absolute top-16 left-4 z-10"
              >
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
              </motion.div>
            </AnimatePresence>
          </ClientOnly>
        </div>
      </ComponentDemo>

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
              <strong>VLayerDeckglScatterplot</strong> - Bus stops shown at zoom
              14+ with click-to-view details
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

      <ExampleNavigation />
    </div>
  </div>
</template>
