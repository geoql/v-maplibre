<script setup lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import type { ComponentPublicInstance } from 'vue';
  import {
    VMap,
    VMarker,
    VLayerMaplibreRoute,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';
  import type { CategoryLegendItem } from '@geoql/v-maplibre';
  import { motion, AnimatePresence } from 'motion-v';
  import type {
    RouteStop,
    RouteLegInfo,
    ValhallaResponse,
  } from '~/types/route';
  import {
    useRouteUtils,
    decodePolyline,
    formatDuration,
    formatDistanceKm,
    formatArrivalTime,
    getCumulativeDuration,
    reverseGeocode,
    fitMapToBounds,
  } from '~/composables/use-route-utils';

  type MarkerRefSetter = (el: Element | null) => void;

  function wrapMarkerRef(
    setRef: MarkerRefSetter,
  ): (el: Element | ComponentPublicInstance | null) => void {
    return (el) => {
      if (el instanceof Element) {
        setRef(el);
      }
    };
  }

  const { mapStyle } = useRouteUtils();
  const panelOpen = ref(true);

  function togglePanel() {
    panelOpen.value = !panelOpen.value;
  }
  const mapId = useId();

  const multiStopMapOptions = computed(() => ({
    container: `multistop-map-${mapId}`,
    style: mapStyle.value,
    center: [-122.42, 37.77] as [number, number],
    zoom: 12,
  }));

  const stops = ref<RouteStop[]>([
    {
      name: 'Ferry Building',
      coordinates: [-122.3936, 37.7956],
      icon: 'lucide:building',
      type: 'start',
    },
    {
      name: 'Chinatown',
      coordinates: [-122.4058, 37.7941],
      icon: 'lucide:utensils',
      type: 'waypoint',
    },
    {
      name: 'Union Square',
      coordinates: [-122.4075, 37.7879],
      icon: 'lucide:shopping-bag',
      type: 'waypoint',
    },
    {
      name: 'Golden Gate Park',
      coordinates: [-122.4862, 37.7694],
      icon: 'lucide:trees',
      type: 'waypoint',
    },
    {
      name: "Fisherman's Wharf",
      coordinates: [-122.4169, 37.808],
      icon: 'lucide:anchor',
      type: 'end',
    },
  ]);

  const multiStopRouteCoordinates = ref<[number, number][]>([]);
  const multiStopLegs = ref<RouteLegInfo[]>([]);
  const multiStopTotalDuration = ref(0);
  const multiStopTotalDistance = ref(0);
  const multiStopLoading = ref(false);
  const optimizedOrder = ref<number[]>([]);

  function onMapLoaded(map: MaplibreMap) {
    const coords = stops.value.map((s) => s.coordinates);
    fitMapToBounds(
      map,
      coords,
      { top: 60, bottom: 60, left: 60, right: 60 },
      14,
    );
  }

  async function fetchMultiStopRoute() {
    multiStopLoading.value = true;

    try {
      const locations = stops.value.map((stop) => ({
        lat: stop.coordinates[1],
        lon: stop.coordinates[0],
      }));

      const params = {
        locations,
        costing: 'auto',
        directions_options: { units: 'kilometers' },
      };

      const url = `/api/valhalla?endpoint=optimized_route&json=${encodeURIComponent(JSON.stringify(params))}`;
      const data = await $fetch<ValhallaResponse>(url);

      const allCoordinates: [number, number][] = [];
      const legs: RouteLegInfo[] = [];

      if (data.trip?.legs) {
        for (const leg of data.trip.legs) {
          const legCoords = decodePolyline(leg.shape);
          allCoordinates.push(...legCoords);
          legs.push({
            distance: leg.summary.length,
            duration: leg.summary.time,
            summary: leg.summary.name || 'Via local roads',
          });
        }
      }

      multiStopRouteCoordinates.value = allCoordinates;
      multiStopLegs.value = legs;
      multiStopTotalDuration.value = data.trip?.summary?.time || 0;
      multiStopTotalDistance.value = data.trip?.summary?.length || 0;

      if (data.trip?.locations) {
        optimizedOrder.value = data.trip.locations.map(
          (loc) => loc.original_index,
        );
      }
    } catch (err) {
      console.error('Multi-stop route fetch error:', err);
    } finally {
      multiStopLoading.value = false;
    }
  }

  async function handleStopDrag(index: number, newCoords: [number, number]) {
    const stop = stops.value[index];
    if (!stop) return;

    stop.coordinates = newCoords;
    stop.name = 'Loading...';

    const [name] = await Promise.all([
      reverseGeocode(newCoords),
      fetchMultiStopRoute(),
    ]);

    stop.name = name;
  }

  function getStopIconClass(stop: RouteStop): string {
    if (stop.type === 'start') return 'text-emerald-500';
    if (stop.type === 'end') return 'text-red-500';
    return 'text-blue-500';
  }

  function getStopBorderClass(stop: RouteStop): string {
    if (stop.type === 'start') return 'border-emerald-500 bg-emerald-500/10';
    if (stop.type === 'end') return 'border-red-500 bg-red-500/10';
    return 'border-blue-500 bg-blue-500/10';
  }

  function getMarkerBgClass(stop: RouteStop): string {
    if (stop.type === 'start') return 'bg-emerald-500';
    if (stop.type === 'end') return 'bg-red-500';
    return 'bg-blue-500';
  }

  function getLegDuration(index: number): number {
    return multiStopLegs.value[index]?.duration ?? 0;
  }

  function getLegDistance(index: number): number {
    return multiStopLegs.value[index]?.distance ?? 0;
  }

  function getArrivalTime(index: number): string {
    return formatArrivalTime(getCumulativeDuration(index, multiStopLegs.value));
  }

  const legendItems: CategoryLegendItem[] = [
    { value: 'route', label: 'Optimized Route', color: '#6366f1' },
    { value: 'start', label: 'Start', color: '#10b981' },
    { value: 'waypoint', label: 'Waypoint', color: '#3b82f6' },
    { value: 'end', label: 'End', color: '#ef4444' },
  ];

  tryOnMounted(() => {
    fetchMultiStopRoute();
  });
</script>

<template>
  <div class="relative size-full min-w-0 overflow-hidden">
    <ClientOnly>
      <VMap
        :key="`multistop-${mapStyle}`"
        :options="multiStopMapOptions"
        class="size-full"
        @loaded="onMapLoaded"
      >
        <VControlNavigation position="top-right" />
        <VControlScale position="bottom-left" />
        <VControlLegend
          :layer-ids="['multistop-route']"
          position="bottom-left"
          type="category"
          title="Multi-Stop Route"
          :items="legendItems"
          :interactive="false"
        />

        <VLayerMaplibreRoute
          v-if="multiStopRouteCoordinates.length > 0"
          id="multistop-route"
          :coordinates="multiStopRouteCoordinates"
          color="#6366f1"
          :width="5"
          :opacity="0.9"
          line-cap="round"
          line-join="round"
        />

        <VMarker
          v-for="(stop, index) in stops"
          :key="`stop-${index}`"
          :coordinates="stop.coordinates"
          :options="{ draggable: true }"
          @update:coordinates="
            (coords: [number, number]) => handleStopDrag(index, coords)
          "
        >
          <template #markers="{ setRef }">
            <div
              :ref="wrapMarkerRef(setRef)"
              class="relative cursor-grab active:cursor-grabbing"
            >
              <div
                class="absolute -top-1 -right-1 z-10 flex size-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm"
              >
                {{ index + 1 }}
              </div>
              <div
                :class="[
                  `
                    flex size-10 items-center justify-center rounded-full
                    border-2 border-white shadow-lg transition-transform
                    hover:scale-110
                  `,
                  getMarkerBgClass(stop),
                ]"
              >
                <Icon :name="stop.icon" class="size-5 text-white" />
              </div>
            </div>
          </template>
        </VMarker>
      </VMap>
    </ClientOnly>

    <!-- Toggle button - always visible -->
    <button
      class="absolute top-4 left-4 z-10 flex size-9 items-center justify-center rounded-lg bg-background/95 shadow-lg backdrop-blur-sm transition-colors hover:bg-accent"
      :class="{
        'bg-primary text-primary-foreground hover:bg-primary/90': !panelOpen,
      }"
      @click="togglePanel"
    >
      <Icon
        :name="panelOpen ? 'lucide:panel-left-close' : 'lucide:panel-left-open'"
        class="size-4"
      />
    </button>

    <!-- Trip Summary overlay - collapsible -->
    <AnimatePresence>
      <motion.div
        v-if="panelOpen"
        :initial="{ opacity: 0, x: -20, scale: 0.95 }"
        :animate="{ opacity: 1, x: 0, scale: 1 }"
        :exit="{ opacity: 0, x: -20, scale: 0.95 }"
        :transition="{ type: 'spring', stiffness: 300, damping: 25 }"
        class="absolute top-16 left-4 z-10 w-72 max-h-[calc(100%-5rem)] overflow-auto rounded-xl bg-background/95 shadow-lg backdrop-blur-sm"
      >
        <div class="p-4">
          <div class="mb-3 flex items-center justify-between">
            <span
              class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
              >Trip Summary</span
            >
            <span
              v-if="optimizedOrder.length > 0"
              class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
            >
              Optimized
            </span>
          </div>

          <div
            v-if="multiStopLoading"
            class="flex items-center gap-2 py-4 text-muted-foreground"
          >
            <Icon name="lucide:loader-2" class="size-4 animate-spin" />
            <span>Optimizing route...</span>
          </div>

          <template v-else-if="multiStopTotalDuration > 0">
            <div class="mb-1 flex items-baseline gap-2">
              <span class="text-2xl font-bold">{{
                formatDuration(multiStopTotalDuration)
              }}</span>
              <span class="text-muted-foreground">total</span>
            </div>
            <div class="flex items-center gap-4 text-sm text-muted-foreground">
              <span class="flex items-center gap-1">
                <Icon name="lucide:route" class="size-3.5" />
                {{ formatDistanceKm(multiStopTotalDistance) }}
              </span>
              <span class="flex items-center gap-1">
                <Icon name="lucide:map-pin" class="size-3.5" />
                {{ stops.length }} stops
              </span>
            </div>
          </template>
        </div>

        <!-- Journey stops -->
        <div class="border-t border-border">
          <div class="border-b border-border bg-muted/30 px-4 py-2">
            <span
              class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
              >Journey</span
            >
          </div>

          <div class="divide-y divide-border">
            <div v-for="(stop, index) in stops" :key="index" class="relative">
              <div
                v-if="index < stops.length - 1"
                class="absolute top-10 bottom-0 left-6 w-0.5 bg-linear-to-b from-border to-border/50"
              ></div>

              <div class="flex gap-3 p-3">
                <div
                  :class="[
                    `
                      relative z-10 flex size-7 shrink-0 items-center
                      justify-center rounded-full border-2
                    `,
                    getStopBorderClass(stop),
                  ]"
                >
                  <Icon
                    :name="stop.icon"
                    :class="['size-3.5', getStopIconClass(stop)]"
                  />
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-2">
                    <span class="truncate text-sm font-medium">{{
                      stop.name
                    }}</span>
                    <span
                      v-if="index === 0"
                      class="shrink-0 text-xs text-muted-foreground"
                    >
                      Now
                    </span>
                    <span
                      v-else-if="multiStopLegs.length >= index"
                      class="shrink-0 text-xs font-medium text-foreground"
                    >
                      {{ getArrivalTime(index) }}
                    </span>
                  </div>

                  <div
                    v-if="index < multiStopLegs.length"
                    class="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground"
                  >
                    <span>{{ formatDuration(getLegDuration(index)) }}</span>
                    <span class="text-border">&bull;</span>
                    <span>{{ formatDistanceKm(getLegDistance(index)) }}</span>
                  </div>

                  <div
                    v-if="stop.type === 'start'"
                    class="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400"
                  >
                    Starting point
                  </div>
                  <div
                    v-else-if="stop.type === 'end'"
                    class="mt-0.5 text-xs text-red-600 dark:text-red-400"
                  >
                    Final destination
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="flex items-center gap-2 border-t border-border px-4 py-2 text-xs text-muted-foreground"
        >
          <Icon name="lucide:move" class="size-3.5" />
          <span>Drag markers to adjust stops</span>
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
</template>
