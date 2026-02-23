<script setup lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import type { ComponentPublicInstance } from 'vue';
  import { motion, AnimatePresence } from 'motion-v';
  import {
    VMap,
    VMarker,
    VLayerMaplibreRoute,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';
  import type { CategoryLegendItem } from '@geoql/v-maplibre';
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
  const panelOpen = ref(true);
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

  const legendItems: CategoryLegendItem[] = [
    { value: 'route', label: 'Driving Route', color: '#6366f1' },
    { value: 'waypoint', label: 'Waypoint / Highlight', color: '#6366f1' },
  ];

  tryOnMounted(() => {
    fetchTripPlan();
  });
</script>

<template>
  <div class="relative size-full min-w-0 overflow-hidden">
    <div
      v-if="tripLoading && !tripData"
      class="flex size-full items-center justify-center"
    >
      <div class="flex items-center gap-3 text-muted-foreground">
        <Icon name="lucide:loader-2" class="size-5 animate-spin" />
        <span>Planning your adventure...</span>
      </div>
    </div>

    <template v-else>
      <ClientOnly>
        <VMap
          :key="`tripplanner-${mapStyle}`"
          :options="tripPlannerMapOptions"
          class="size-full"
          @loaded="onMapLoaded"
        >
          <VControlNavigation position="top-right" />
          <VControlScale position="bottom-left" />
          <VControlLegend
            :layer-ids="['trip-route']"
            position="bottom-left"
            type="category"
            title="Trip Planner"
            :items="legendItems"
            :interactive="false"
          />

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
            v-for="(highlight, index) in tripData?.highlights ?? []"
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

      <!-- Toggle button - always visible -->
      <button
        class="absolute top-4 left-4 z-10 flex size-9 items-center justify-center rounded-lg bg-background/95 shadow-lg backdrop-blur-sm transition-colors hover:bg-accent"
        :class="{
          'bg-primary text-primary-foreground hover:bg-primary/90': !panelOpen,
        }"
        @click="panelOpen = !panelOpen"
      >
        <Icon
          :name="
            panelOpen ? 'lucide:panel-left-close' : 'lucide:panel-left-open'
          "
          class="size-4"
        />
      </button>

      <!-- Trip info overlay -->
      <AnimatePresence>
        <motion.div
          v-if="panelOpen && tripData"
          :initial="{ opacity: 0, x: -20, scale: 0.95 }"
          :animate="{ opacity: 1, x: 0, scale: 1 }"
          :exit="{ opacity: 0, x: -20, scale: 0.95 }"
          :transition="{ type: 'spring', stiffness: 300, damping: 25 }"
          class="absolute top-16 left-4 z-10 w-80 max-h-[calc(100%-5rem)] overflow-auto rounded-xl bg-background/95 shadow-lg backdrop-blur-sm"
        >
          <div class="p-4">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h2 class="text-sm font-semibold tracking-tight">
                  {{ tripData.title }}
                </h2>
                <p class="mt-0.5 text-xs text-muted-foreground">
                  {{ tripData.duration }} &bull; {{ tripData.budget }} budget
                </p>
              </div>
              <button
                class="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted"
                :disabled="tripLoading"
                @click="fetchTripPlan(true)"
              >
                <Icon
                  name="lucide:refresh-cw"
                  :class="['size-3', tripLoading && 'animate-spin']"
                />
                Regenerate
              </button>
            </div>

            <!-- Route Highlights -->
            <div class="mt-3 border-t border-border pt-3">
              <h3
                class="mb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase"
              >
                Route Highlights
              </h3>
              <div class="flex flex-wrap gap-1.5">
                <div
                  v-for="(highlight, index) in tripData.highlights"
                  :key="`route-highlight-${index}`"
                  class="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400"
                >
                  <Icon name="lucide:map-pin" class="size-3" />
                  {{ highlight.name }}
                </div>
              </div>
            </div>
          </div>

          <!-- Day Cards -->
          <div class="border-t border-border">
            <div
              v-for="day in tripData.days"
              :key="`day-${day.day}`"
              class="border-b border-border last:border-b-0"
            >
              <button
                class="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-muted/50"
                @click="toggleDayExpanded(day.day)"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="flex size-6 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-600 dark:text-indigo-400"
                  >
                    {{ day.day }}
                  </div>
                  <span class="text-sm font-medium"
                    >Day {{ day.day }}: {{ day.title }}</span
                  >
                </div>
                <Icon
                  name="lucide:chevron-down"
                  :class="[
                    'size-4 text-muted-foreground transition-transform duration-200',
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
                    class="flex items-center gap-2 px-3 py-2"
                  >
                    <Icon
                      name="lucide:arrow-right"
                      class="size-3 shrink-0 text-muted-foreground"
                    />
                    <span class="flex-1 text-xs">{{ activity.name }}</span>
                    <span
                      :class="[
                        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                        getActivityBadgeClasses(activity.type).bg,
                        getActivityBadgeClasses(activity.type).text,
                      ]"
                    >
                      <Icon
                        :name="getActivityBadgeClasses(activity.type).icon"
                        class="size-2.5"
                      />
                      {{ activity.type }}
                    </span>
                    <span
                      class="shrink-0 text-[10px] text-muted-foreground tabular-nums"
                    >
                      {{ activity.time }}
                    </span>
                  </div>
                </div>

                <div
                  class="flex items-center justify-between border-t border-border bg-muted/30 px-3 py-2"
                >
                  <div class="flex items-center gap-1.5 text-xs">
                    <Icon
                      name="lucide:bed"
                      class="size-3 text-muted-foreground"
                    />
                    <span class="text-muted-foreground">Stay:</span>
                    <span class="font-medium">{{ day.stay.name }}</span>
                  </div>
                  <span
                    class="text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                  >
                    {{ day.stay.price }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </template>
  </div>
</template>
