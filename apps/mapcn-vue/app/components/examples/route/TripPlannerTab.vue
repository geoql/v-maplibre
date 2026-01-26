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
    TripData,
    TripActivityType,
    ValhallaResponse,
  } from '~/types/route';
  import {
    useRouteUtils,
    decodePolyline,
    getActivityBadge,
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

  const tripPlannerMapOptions = computed(() => ({
    container: `trip-planner-map-${mapId}`,
    style: mapStyle.value,
    center: [-120.5, 35.5] as [number, number],
    zoom: 5,
  }));

  const tripData = ref<TripData | null>(null);
  const tripRouteCoordinates = ref<[number, number][]>([]);
  const tripLoading = ref(false);
  const expandedDays = ref<Set<number>>(new Set([1]));

  function onMapLoaded(map: MaplibreMap) {
    if (!tripData.value?.routeWaypoints.length) return;
    fitMapToBounds(
      map,
      tripData.value.routeWaypoints,
      { top: 50, bottom: 50, left: 50, right: 50 },
      8,
    );
  }

  async function fetchTripPlan(regenerate = false) {
    tripLoading.value = true;
    try {
      const seed = regenerate ? Date.now() : 'default';
      const data = await $fetch<TripData>(`/api/trip-planner?seed=${seed}`);
      tripData.value = data;

      if (data.routeWaypoints.length > 1) {
        const locations = data.routeWaypoints.map(([lon, lat]) => ({
          lat,
          lon,
          type: 'break',
        }));
        const params = {
          locations,
          costing: 'auto',
          directions_options: { units: 'kilometers' },
        };
        const url = `/api/valhalla?json=${encodeURIComponent(JSON.stringify(params))}`;
        const routeData = await $fetch<ValhallaResponse>(url);

        const allCoordinates: [number, number][] = [];
        if (routeData.trip?.legs) {
          for (const leg of routeData.trip.legs) {
            allCoordinates.push(...decodePolyline(leg.shape));
          }
        }
        tripRouteCoordinates.value = allCoordinates;
      }
    } catch (err) {
      console.error('Trip planner fetch error:', err);
    } finally {
      tripLoading.value = false;
    }
  }

  function toggleDayExpanded(day: number) {
    if (expandedDays.value.has(day)) {
      expandedDays.value.delete(day);
    } else {
      expandedDays.value.add(day);
    }
  }

  function getActivityBadgeClasses(type: TripActivityType) {
    return getActivityBadge(type);
  }

  tryOnMounted(() => {
    fetchTripPlan();
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { ref, nextTick } from 'vue';
import { VMap, VMarker, VLayerMaplibreRoute } from '@geoql/v-maplibre';

interface TripData {
  title: string;
  duration: string;
  budget: string;
  highlights: { name: string; coordinates: [number, number] }[];
  days: { day: number; title: string; activities: any[]; stay: any }[];
  routeWaypoints: [number, number][];
}

const tripData = ref<TripData | null>(null);
const routeCoordinates = ref<[number, number][]>([]);
const mapRef = ref(null);

const fetchTripPlan = async () => {
  // Fetch trip data from API
  const data = await fetch('/api/trip-planner').then(r => r.json());
  tripData.value = data;

  // Fetch route from Valhalla
  const locations = data.routeWaypoints.map(([lon, lat]) => ({ lat, lon, type: 'break' }));
  const params = { locations, costing: 'auto' };
  const routeData = await fetch(\`/api/valhalla?json=\${encodeURIComponent(JSON.stringify(params))}\`).then(r => r.json());
  
  routeCoordinates.value = routeData.trip.legs.flatMap(leg => decodePolyline(leg.shape));

  // Fit map to show all waypoints
  nextTick(() => {
    const waypoints = data.routeWaypoints;
    const bounds = [
      [Math.min(...waypoints.map(w => w[0])), Math.min(...waypoints.map(w => w[1]))],
      [Math.max(...waypoints.map(w => w[0])), Math.max(...waypoints.map(w => w[1]))]
    ];
    mapRef.value?.map?.fitBounds(bounds, { padding: 50 });
  });
};
${SCRIPT_END}

<template>
  <div v-if="tripData">
    <h2>{{ tripData.title }}</h2>
    <p>{{ tripData.duration }} • {{ tripData.budget }} budget</p>

    <VMap ref="mapRef" :options="mapOptions" class="h-80 rounded-xl">
      <VLayerMaplibreRoute
        id="trip-route"
        :coordinates="routeCoordinates"
        color="#6366f1"
        :width="4"
      />
      <VMarker
        v-for="(highlight, i) in tripData.highlights"
        :key="i"
        :coordinates="highlight.coordinates"
      />
    </VMap>

    <!-- Route Highlights -->
    <div class="flex items-center">
      <template v-for="(h, i) in tripData.highlights" :key="i">
        <span>{{ h.name }}</span>
        <span v-if="i < tripData.highlights.length - 1" class="border-dashed" />
      </template>
    </div>

    <!-- Day Cards -->
    <div v-for="day in tripData.days" :key="day.day">
      <h3>Day {{ day.day }}: {{ day.title }}</h3>
      <div v-for="activity in day.activities" :key="activity.name">
        {{ activity.name }} - {{ activity.time }}
      </div>
      <p>Stay: {{ day.stay.name }} - {{ day.stay.price }}</p>
    </div>
  </div>
</template>`;
</script>

<template>
  <div>
    <div class="mb-6 flex items-start justify-between">
      <div>
        <h2 class="text-xl font-semibold tracking-tight">
          {{ tripData?.title || 'Loading trip...' }}
        </h2>
        <p v-if="tripData" class="mt-1 text-sm text-muted-foreground">
          {{ tripData.duration }} &bull; {{ tripData.budget }} budget
        </p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        :disabled="tripLoading"
        @click="fetchTripPlan(true)"
      >
        <Icon
          name="lucide:refresh-cw"
          :class="['size-4', tripLoading && 'animate-spin']"
        />
        Regenerate
      </button>
    </div>

    <div
      v-if="tripLoading && !tripData"
      class="flex items-center justify-center py-20"
    >
      <div class="flex items-center gap-3 text-muted-foreground">
        <Icon name="lucide:loader-2" class="size-5 animate-spin" />
        <span>Planning your adventure...</span>
      </div>
    </div>

    <template v-else-if="tripData">
      <div class="mb-8 h-80 overflow-hidden rounded-xl border border-border">
        <ClientOnly>
          <VMap
            :key="`tripplanner-${mapStyle}`"
            :options="tripPlannerMapOptions"
            class="size-full"
            @loaded="onMapLoaded"
          >
            <VControlNavigation position="top-right" />
            <VControlScale position="bottom-left" />

            <VLayerMaplibreRoute
              v-if="tripRouteCoordinates.length > 0"
              id="trip-route"
              :coordinates="tripRouteCoordinates"
              color="#6366f1"
              :width="4"
              :opacity="0.85"
              line-cap="round"
              line-join="round"
            />

            <VMarker
              v-for="(highlight, index) in tripData.highlights"
              :key="`highlight-${index}`"
              :coordinates="highlight.coordinates"
            >
              <template #markers="{ setRef }">
                <div
                  :ref="wrapMarkerRef(setRef)"
                  class="flex size-6 items-center justify-center rounded-full border-2 border-white bg-indigo-500 shadow-lg"
                >
                  <div class="size-2 rounded-full bg-white"></div>
                </div>
              </template>
            </VMarker>
          </VMap>
        </ClientOnly>
      </div>

      <div class="mb-8">
        <h3
          class="mb-4 text-xs font-medium tracking-wider text-muted-foreground uppercase"
        >
          Route Highlights
        </h3>
        <div class="flex items-center">
          <template
            v-for="(highlight, index) in tripData.highlights"
            :key="`route-highlight-${index}`"
          >
            <div class="flex shrink-0 items-center gap-2">
              <div
                class="flex size-8 items-center justify-center rounded-full bg-indigo-500/10"
              >
                <Icon
                  name="lucide:map-pin"
                  class="size-4 text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <span class="text-sm font-medium">{{ highlight.name }}</span>
            </div>
            <div
              v-if="index < tripData.highlights.length - 1"
              class="mx-3 flex min-w-8 flex-1 items-center justify-center"
            >
              <div
                class="h-px w-full border-t-2 border-dashed border-border"
              ></div>
            </div>
          </template>
        </div>
      </div>

      <div class="space-y-3">
        <div
          v-for="day in tripData.days"
          :key="`day-${day.day}`"
          class="overflow-hidden rounded-xl border border-border bg-card"
        >
          <button
            class="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
            @click="toggleDayExpanded(day.day)"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex size-8 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-bold text-indigo-600 dark:text-indigo-400"
              >
                {{ day.day }}
              </div>
              <span class="font-medium"
                >Day {{ day.day }}: {{ day.title }}</span
              >
            </div>
            <Icon
              name="lucide:chevron-down"
              :class="[
                'size-5 text-muted-foreground transition-transform duration-200',
                expandedDays.has(day.day) && 'rotate-180',
              ]"
            />
          </button>

          <div
            v-show="expandedDays.has(day.day)"
            class="border-t border-border"
          >
            <div class="divide-y divide-border">
              <div
                v-for="(activity, actIndex) in day.activities"
                :key="`activity-${day.day}-${actIndex}`"
                class="flex items-center gap-3 px-4 py-3"
              >
                <Icon
                  name="lucide:arrow-right"
                  class="size-4 shrink-0 text-muted-foreground"
                />

                <span class="flex-1 text-sm">{{ activity.name }}</span>

                <span
                  :class="[
                    `
                      inline-flex items-center gap-1 rounded-full px-2 py-0.5
                      text-xs font-medium
                    `,
                    getActivityBadgeClasses(activity.type).bg,
                    getActivityBadgeClasses(activity.type).text,
                  ]"
                >
                  <Icon
                    :name="getActivityBadgeClasses(activity.type).icon"
                    class="size-3"
                  />
                  {{ activity.type }}
                </span>

                <span
                  class="shrink-0 text-xs text-muted-foreground tabular-nums"
                >
                  {{ activity.time }}
                </span>
              </div>
            </div>

            <div
              class="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-3"
            >
              <div class="flex items-center gap-2 text-sm">
                <Icon name="lucide:bed" class="size-4 text-muted-foreground" />
                <span class="text-muted-foreground">Overnight Stay:</span>
                <span class="font-medium">{{ day.stay.name }}</span>
              </div>
              <span
                class="text-sm font-semibold text-indigo-600 dark:text-indigo-400"
              >
                {{ day.stay.price }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div class="mt-8">
      <LazyCodeBlock
        :code="codeExample"
        lang="vue"
        filename="TripPlanner.vue"
      />
    </div>
  </div>
</template>
