<script setup lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import type { ComponentPublicInstance } from 'vue';
  import {
    VMap,
    VMarker,
    VLayerMaplibreRoute,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';
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

  tryOnMounted(() => {
    fetchMultiStopRoute();
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { ref } from 'vue';
import { VMap, VMarker, VLayerMaplibreRoute } from '@geoql/v-maplibre';

const stops = ref([
  { name: 'Ferry Building', coordinates: [-122.3936, 37.7956] },
  { name: 'Chinatown', coordinates: [-122.4058, 37.7941] },
  { name: 'Union Square', coordinates: [-122.4075, 37.7879] },
  { name: 'Golden Gate Park', coordinates: [-122.4862, 37.7694] },
  { name: 'Fisherman\\'s Wharf', coordinates: [-122.4169, 37.808] },
]);

const routeCoordinates = ref([]);

// Fetch optimized route from Valhalla
const fetchRoute = async () => {
  const locations = stops.value.map(s => ({ lat: s.coordinates[1], lon: s.coordinates[0] }));
  const params = { locations, costing: 'auto' };
  
  // Use optimized_route endpoint for TSP optimization
  const response = await fetch(\`/api/valhalla?endpoint=optimized_route&json=\${encodeURIComponent(JSON.stringify(params))}\`);
  const data = await response.json();
  
  // Combine all leg shapes
  routeCoordinates.value = data.trip.legs.flatMap(leg => decodePolyline(leg.shape));
};

// Handle marker drag
const handleDrag = (index, coords) => {
  stops.value[index].coordinates = coords;
  fetchRoute(); // Recalculate route
};
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-[500px] w-full rounded-lg">
    <VLayerMaplibreRoute
      id="route"
      :coordinates="routeCoordinates"
      color="#6366f1"
      :width="5"
    />
    <VMarker
      v-for="(stop, i) in stops"
      :key="i"
      :coordinates="stop.coordinates"
      :options="{ draggable: true }"
      @update:coordinates="(c) => handleDrag(i, c)"
    >
      <template #markers="{ setRef }">
        <div :ref="setRef" class="marker">{{ i + 1 }}</div>
      </template>
    </VMarker>
  </VMap>
</template>`;
</script>

<template>
  <div>
    <p class="mb-6 text-muted-foreground">
      Optimized multi-stop route using Valhalla's TSP solver.
      <strong>Drag markers</strong> to adjust stops and recalculate the route.
    </p>

    <div class="grid gap-8 lg:grid-cols-3">
      <div class="space-y-4">
        <div class="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <span
              class="text-xs font-medium uppercase tracking-wider text-muted-foreground"
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
            class="flex items-center gap-2 text-muted-foreground py-4"
          >
            <Icon name="lucide:loader-2" class="size-4 animate-spin" />
            <span>Optimizing route...</span>
          </div>

          <template v-else-if="multiStopTotalDuration > 0">
            <div class="flex items-baseline gap-2 mb-1">
              <span class="text-3xl font-bold">{{
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

        <div class="rounded-xl border border-border bg-card overflow-hidden">
          <div class="px-4 py-3 border-b border-border bg-muted/30">
            <span
              class="text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >Journey</span
            >
          </div>

          <div class="divide-y divide-border">
            <div v-for="(stop, index) in stops" :key="index" class="relative">
              <div
                v-if="index < stops.length - 1"
                class="absolute left-6 top-12 bottom-0 w-0.5 bg-linear-to-b from-border to-border/50"
              />

              <div class="flex gap-3 p-4">
                <div
                  :class="[
                    'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2',
                    getStopBorderClass(stop),
                  ]"
                >
                  <Icon
                    :name="stop.icon"
                    :class="['size-4', getStopIconClass(stop)]"
                  />
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2">
                    <span class="font-medium truncate">{{ stop.name }}</span>
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
                    class="mt-1 flex items-center gap-3 text-xs text-muted-foreground"
                  >
                    <span>{{ formatDuration(getLegDuration(index)) }}</span>
                    <span class="text-border">&bull;</span>
                    <span>{{ formatDistanceKm(getLegDistance(index)) }}</span>
                  </div>

                  <div
                    v-if="stop.type === 'start'"
                    class="mt-1 text-xs text-emerald-600 dark:text-emerald-400"
                  >
                    Starting point
                  </div>
                  <div
                    v-else-if="stop.type === 'end'"
                    class="mt-1 text-xs text-red-600 dark:text-red-400"
                  >
                    Final destination
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs text-muted-foreground px-1">
          <Icon name="lucide:move" class="size-3.5" />
          <span>Drag markers on map to adjust stops</span>
        </div>
      </div>

      <div
        class="lg:col-span-2 h-150 min-w-0 overflow-hidden rounded-lg border border-border"
      >
        <ClientOnly>
          <VMap
            :key="`multistop-${mapStyle}`"
            :options="multiStopMapOptions"
            class="h-full w-full"
            @loaded="onMapLoaded"
          >
            <VControlNavigation position="top-right" />
            <VControlScale position="bottom-left" />

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
                    class="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm z-10"
                  >
                    {{ index + 1 }}
                  </div>
                  <div
                    :class="[
                      'flex size-10 items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform hover:scale-110',
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
      </div>
    </div>

    <div class="mt-8">
      <LazyCodeBlock
        :code="codeExample"
        lang="vue"
        filename="MultiStopRoute.vue"
      />
    </div>
  </div>
</template>
