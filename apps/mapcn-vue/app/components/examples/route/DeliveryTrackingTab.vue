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
  import type { DeliveryRouteInfo, ValhallaResponse } from '~/types/route';
  import {
    useRouteUtils,
    decodePolyline,
    formatDuration,
    formatDistanceKm,
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

  const store = { coordinates: [-0.14, 51.5154] as [number, number] };
  const home = { coordinates: [-0.05, 51.5134] as [number, number] };

  const deliveryMapOptions = computed(() => ({
    container: `delivery-map-${mapId}`,
    style: mapStyle.value,
    center: [-0.105, 51.515] as [number, number],
    zoom: 12.5,
  }));

  const deliveryRouteCoordinates = ref<[number, number][]>([]);
  const deliveryRouteInfo = ref<DeliveryRouteInfo | null>(null);
  const deliveryLoading = ref(false);
  const panelOpen = ref(true);

  const truckPosition = computed(() => {
    if (deliveryRouteCoordinates.value.length < 2) return null;
    const midIndex = Math.floor(deliveryRouteCoordinates.value.length / 2);
    return deliveryRouteCoordinates.value[midIndex];
  });

  function onMapLoaded(map: MaplibreMap) {
    fitMapToBounds(
      map,
      [store.coordinates, home.coordinates],
      { top: 80, bottom: 60, left: 60, right: 60 },
      14,
    );
  }

  async function fetchDeliveryRoute() {
    deliveryLoading.value = true;

    try {
      const params = {
        locations: [
          {
            lat: store.coordinates[1],
            lon: store.coordinates[0],
            type: 'break',
          },
          { lat: home.coordinates[1], lon: home.coordinates[0], type: 'break' },
        ],
        costing: 'auto',
        directions_options: { units: 'kilometers' },
      };

      const url = `/api/valhalla?json=${encodeURIComponent(JSON.stringify(params))}`;
      const data = await $fetch<ValhallaResponse>(url);
      const firstLeg = data.trip.legs[0];
      if (firstLeg) {
        deliveryRouteCoordinates.value = decodePolyline(firstLeg.shape);
        deliveryRouteInfo.value = {
          distance: data.trip.summary.length,
          duration: data.trip.summary.time,
        };
      }
    } catch (err) {
      console.error('Route fetch error:', err);
    } finally {
      deliveryLoading.value = false;
    }
  }

  const legendItems: CategoryLegendItem[] = [
    { value: 'route', label: 'Delivery Route', color: '#3b82f6' },
    { value: 'store', label: 'Store (Pickup)', color: '#10b981' },
    { value: 'truck', label: 'Delivery Truck', color: '#3b82f6' },
    { value: 'home', label: 'Home (Dropoff)', color: '#3b82f6' },
  ];

  tryOnMounted(() => {
    fetchDeliveryRoute();
  });
</script>

<template>
  <div class="relative size-full min-w-0 overflow-hidden">
    <ClientOnly>
      <VMap
        :key="`delivery-${mapStyle}`"
        :options="deliveryMapOptions"
        class="size-full"
        @loaded="onMapLoaded"
      >
        <VControlNavigation position="top-right" />
        <VControlScale position="bottom-left" />
        <VControlLegend
          :layer-ids="['delivery-route']"
          position="bottom-left"
          type="category"
          title="Delivery Tracking"
          :items="legendItems"
          :interactive="false"
        />

        <VLayerMaplibreRoute
          v-if="deliveryRouteCoordinates.length > 0"
          id="delivery-route"
          :coordinates="deliveryRouteCoordinates"
          color="#3b82f6"
          :width="4"
          :opacity="0.9"
          line-cap="round"
          line-join="round"
        />

        <VMarker :coordinates="store.coordinates">
          <template #markers="{ setRef }">
            <div :ref="wrapMarkerRef(setRef)" class="relative">
              <div
                class="absolute -top-7 left-1/2 -translate-x-1/2 rounded-sm bg-zinc-900/80 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-white"
              >
                Store
              </div>
              <div
                class="flex size-8 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-lg"
              >
                <Icon name="maki:shop" class="size-4 text-white" />
              </div>
            </div>
          </template>
        </VMarker>

        <VMarker v-if="truckPosition" :coordinates="truckPosition">
          <template #markers="{ setRef }">
            <div :ref="wrapMarkerRef(setRef)" class="relative">
              <div
                v-if="deliveryRouteInfo"
                class="absolute -top-9 left-1/2 -translate-x-1/2 rounded-sm bg-zinc-900/90 px-2 py-1 text-xs font-medium whitespace-nowrap text-white shadow-lg"
              >
                <span class="text-emerald-400">{{
                  formatDuration(deliveryRouteInfo.duration)
                }}</span>
                away
              </div>
              <div
                class="flex size-10 items-center justify-center rounded-full border-2 border-white bg-blue-500 shadow-lg"
              >
                <Icon name="lucide:truck" class="size-5 text-white" />
              </div>
            </div>
          </template>
        </VMarker>

        <VMarker :coordinates="home.coordinates">
          <template #markers="{ setRef }">
            <div :ref="wrapMarkerRef(setRef)" class="relative">
              <div
                class="absolute -top-7 left-1/2 -translate-x-1/2 rounded-sm bg-zinc-900/80 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-white"
              >
                Home
              </div>
              <div
                class="flex size-8 items-center justify-center rounded-full border-2 border-white bg-blue-500 shadow-lg"
              >
                <Icon name="maki:home" class="size-4 text-white" />
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
      @click="panelOpen = !panelOpen"
    >
      <Icon
        :name="panelOpen ? 'lucide:panel-left-close' : 'lucide:panel-left-open'"
        class="size-4"
      />
    </button>

    <!-- Delivery info overlay -->
    <AnimatePresence>
      <motion.div
        v-if="panelOpen"
        :initial="{ opacity: 0, x: -20, scale: 0.95 }"
        :animate="{ opacity: 1, x: 0, scale: 1 }"
        :exit="{ opacity: 0, x: -20, scale: 0.95 }"
        :transition="{ type: 'spring', stiffness: 300, damping: 25 }"
        class="absolute top-16 left-4 z-10 w-64 rounded-xl bg-background/95 shadow-lg backdrop-blur-sm"
      >
        <div class="p-4">
          <div class="mb-4 flex items-center gap-3">
            <div
              class="flex size-10 items-center justify-center rounded-full bg-blue-500/10"
            >
              <Icon name="lucide:truck" class="size-5 text-blue-500" />
            </div>
            <div>
              <div class="font-semibold">Order #12847</div>
              <div class="text-sm text-muted-foreground">
                <span class="inline-flex items-center gap-1">
                  <span
                    class="size-2 animate-pulse rounded-full bg-green-500"
                  ></span>
                  On the way
                </span>
              </div>
            </div>
          </div>

          <div
            v-if="deliveryRouteInfo"
            class="flex items-center justify-between border-t border-border pt-4"
          >
            <div>
              <div class="text-2xl font-bold">
                {{ formatDuration(deliveryRouteInfo.duration) }}
              </div>
              <div class="text-sm text-muted-foreground">Estimated arrival</div>
            </div>
            <div class="text-right">
              <div class="text-lg font-semibold">
                {{ formatDistanceKm(deliveryRouteInfo.distance) }}
              </div>
              <div class="text-sm text-muted-foreground">Distance</div>
            </div>
          </div>

          <div
            v-if="deliveryLoading"
            class="flex items-center gap-2 text-muted-foreground"
          >
            <Icon name="lucide:loader-2" class="size-4 animate-spin" />
            <span>Calculating route...</span>
          </div>
        </div>

        <div class="space-y-2 border-t border-border p-4">
          <div
            class="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5"
          >
            <div
              class="flex size-7 items-center justify-center rounded-full bg-emerald-500/10"
            >
              <Icon name="lucide:store" class="size-3.5 text-emerald-500" />
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium">Store</div>
              <div class="text-xs text-muted-foreground">Pickup location</div>
            </div>
            <Icon
              name="lucide:check-circle-2"
              class="size-4 text-emerald-500"
            />
          </div>

          <div class="ml-4 h-4 border-l-2 border-dashed border-border"></div>

          <div
            class="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5"
          >
            <div
              class="flex size-7 items-center justify-center rounded-full bg-blue-500/10"
            >
              <Icon name="lucide:home" class="size-3.5 text-blue-500" />
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium">Home</div>
              <div class="text-xs text-muted-foreground">Delivery address</div>
            </div>
            <Icon name="lucide:clock" class="size-4 text-muted-foreground" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
</template>
