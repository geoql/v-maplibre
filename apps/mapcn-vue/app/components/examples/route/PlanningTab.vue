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
  import type { RouteOption, ValhallaResponse } from '~/types/route';
  import {
    useRouteUtils,
    decodePolyline,
    formatDuration,
    formatDistance,
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
  const panelOpen = ref(true);

  const rotterdam = { coordinates: [4.4777, 51.9244] as [number, number] };
  const amsterdam = { coordinates: [4.9041, 52.3676] as [number, number] };

  const planningMapOptions = computed(() => ({
    container: `planning-map-${mapId}`,
    style: mapStyle.value,
    center: [4.5, 52.1] as [number, number],
    zoom: 8,
  }));

  const routeOptions = ref<RouteOption[]>([]);
  const selectedRouteIndex = ref(0);
  const planningLoading = ref(false);

  function onMapLoaded(map: MaplibreMap) {
    fitMapToBounds(
      map,
      [rotterdam.coordinates, amsterdam.coordinates],
      { top: 60, bottom: 60, left: 60, right: 60 },
      12,
    );
  }

  async function fetchRoutePlanning() {
    planningLoading.value = true;

    try {
      const params = {
        locations: [
          {
            lat: rotterdam.coordinates[1],
            lon: rotterdam.coordinates[0],
            type: 'break',
          },
          {
            lat: amsterdam.coordinates[1],
            lon: amsterdam.coordinates[0],
            type: 'break',
          },
        ],
        costing: 'auto',
        alternates: 2,
        directions_options: { units: 'kilometers' },
      };

      const url = `/api/valhalla?json=${encodeURIComponent(JSON.stringify(params))}`;
      const data = await $fetch<ValhallaResponse>(url);

      const routes: RouteOption[] = [];

      if (data.trip?.legs?.[0]?.shape) {
        routes.push({
          coordinates: decodePolyline(data.trip.legs[0].shape),
          duration: data.trip.summary.time,
          distance: data.trip.summary.length * 1000,
        });
      }

      if (data.alternates) {
        for (const alt of data.alternates) {
          if (alt.trip?.legs?.[0]?.shape) {
            routes.push({
              coordinates: decodePolyline(alt.trip.legs[0].shape),
              duration: alt.trip.summary.time,
              distance: alt.trip.summary.length * 1000,
            });
          }
        }
      }

      routeOptions.value = routes;
    } catch (err) {
      console.error('Route planning fetch error:', err);
    } finally {
      planningLoading.value = false;
    }
  }

  function selectRoute(index: number) {
    selectedRouteIndex.value = index;
  }

  function getRouteColor(index: number): string {
    return index === selectedRouteIndex.value ? 'transparent' : '#6b7280';
  }

  function getRouteOpacity(index: number): number {
    return index === selectedRouteIndex.value ? 0 : 0.5;
  }

  const legendItems: CategoryLegendItem[] = [
    { value: 'selected', label: 'Selected Route', color: '#6366f1' },
    { value: 'alternate', label: 'Alternate Route', color: '#6b7280' },
    { value: 'start', label: 'Origin (Rotterdam)', color: '#ef4444' },
    { value: 'end', label: 'Destination (Amsterdam)', color: '#10b981' },
  ];

  tryOnMounted(() => {
    fetchRoutePlanning();
  });
</script>

<template>
  <div class="relative size-full min-w-0 overflow-hidden">
    <ClientOnly>
      <VMap
        :key="`planning-${mapStyle}`"
        :options="planningMapOptions"
        class="size-full"
        @loaded="onMapLoaded"
      >
        <VControlNavigation position="top-right" />
        <VControlScale position="bottom-left" />
        <VControlLegend
          :layer-ids="['planning-route-selected']"
          position="bottom-left"
          type="category"
          title="Route Planning"
          :items="legendItems"
          :interactive="false"
        />

        <VLayerMaplibreRoute
          v-for="(route, index) in routeOptions"
          :id="`planning-route-alt-${index}`"
          :key="`route-alt-${index}`"
          :coordinates="route.coordinates"
          :color="getRouteColor(index)"
          :width="4"
          :opacity="getRouteOpacity(index)"
          line-cap="round"
          line-join="round"
          @click="selectRoute(index)"
        />

        <VLayerMaplibreRoute
          v-if="routeOptions[selectedRouteIndex]"
          id="planning-route-selected"
          :coordinates="routeOptions[selectedRouteIndex]?.coordinates ?? []"
          color="#6366f1"
          :width="5"
          :opacity="1"
          line-cap="round"
          line-join="round"
        />

        <VMarker :coordinates="rotterdam.coordinates">
          <template #markers="{ setRef }">
            <div
              :ref="wrapMarkerRef(setRef)"
              class="flex size-6 items-center justify-center rounded-full border-2 border-white bg-red-500 shadow-lg"
            >
              <div class="size-2 rounded-full bg-white"></div>
            </div>
          </template>
        </VMarker>

        <VMarker :coordinates="amsterdam.coordinates">
          <template #markers="{ setRef }">
            <div
              :ref="wrapMarkerRef(setRef)"
              class="flex size-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-lg"
            >
              <div class="size-2 rounded-full bg-white"></div>
            </div>
          </template>
        </VMarker>
      </VMap>
    </ClientOnly>

    <!-- Toggle button -->
    <button
      class="absolute top-4 left-4 z-10 flex size-9 items-center justify-center rounded-lg bg-background/95 shadow-lg backdrop-blur-sm transition-colors hover:bg-accent"
      :class="{
        'bg-primary text-primary-foreground hover:bg-primary/90': !panelOpen,
      }"
      @click="panelOpen = !panelOpen"
    >
      <Icon
        :name="panelOpen ? 'lucide:panel-left-close' : 'lucide:panel-left-open'"
        class="size-4"
      />
    </button>

    <!-- Collapsible route options panel -->
    <AnimatePresence>
      <motion.div
        v-if="panelOpen"
        :initial="{ opacity: 0, x: -20, scale: 0.95 }"
        :animate="{ opacity: 1, x: 0, scale: 1 }"
        :exit="{ opacity: 0, x: -20, scale: 0.95 }"
        :transition="{ type: 'spring', stiffness: 300, damping: 25 }"
        class="absolute top-16 left-4 z-10 w-80 max-h-[calc(100%-5rem)] overflow-auto rounded-lg bg-background/95 shadow-lg backdrop-blur-sm"
      >
        <div class="p-3">
          <div
            v-if="planningLoading"
            class="flex items-center gap-2 py-4 text-muted-foreground"
          >
            <Icon name="lucide:loader-2" class="size-4 animate-spin" />
            <span>Calculating routes...</span>
          </div>

          <template v-else>
            <div class="space-y-2">
              <button
                v-for="(route, index) in routeOptions"
                :key="index"
                :class="[
                  'w-full rounded-lg border p-3 text-left transition-all',
                  selectedRouteIndex === index
                    ? 'border-indigo-500 bg-card shadow-sm'
                    : `
                      border-border bg-card/50
                      hover:border-border/80 hover:bg-card
                    `,
                ]"
                @click="selectRoute(index)"
              >
                <div class="flex items-center gap-2">
                  <Icon
                    name="lucide:clock"
                    class="size-3.5 text-muted-foreground"
                  />
                  <span class="text-sm font-semibold">{{
                    formatDuration(route.duration)
                  }}</span>
                  <Icon
                    name="lucide:route"
                    class="ml-1 size-3.5 text-muted-foreground"
                  />
                  <span class="text-sm text-muted-foreground">{{
                    formatDistance(route.distance)
                  }}</span>
                  <span
                    v-if="index === 0"
                    class="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    Fastest
                  </span>
                </div>
              </button>
            </div>

            <div
              v-if="routeOptions.length === 0 && !planningLoading"
              class="rounded-lg border border-border bg-card p-3 text-center text-sm text-muted-foreground"
            >
              No routes available
            </div>
          </template>

          <div class="mt-3 space-y-1.5 border-t border-border pt-3">
            <div class="flex items-center gap-2 text-sm">
              <div class="size-2.5 rounded-full bg-red-500"></div>
              <span class="text-muted-foreground">Rotterdam</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <div class="size-2.5 rounded-full bg-emerald-500"></div>
              <span class="text-muted-foreground">Amsterdam</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
</template>
