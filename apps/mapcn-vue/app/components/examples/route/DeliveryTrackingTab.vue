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

  tryOnMounted(() => {
    fetchDeliveryRoute();
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VMarker, VLayerMaplibreRoute } from '@geoql/v-maplibre';

const store = { coordinates: [-0.14, 51.5154] };
const home = { coordinates: [-0.05, 51.5134] };

// Fetch route from Valhalla API
const params = {
  locations: [
    { lat: store.coordinates[1], lon: store.coordinates[0], type: 'break' },
    { lat: home.coordinates[1], lon: home.coordinates[0], type: 'break' },
  ],
  costing: 'auto',
};

const response = await fetch(\`/api/valhalla?json=\${encodeURIComponent(JSON.stringify(params))}\`);
const data = await response.json();
const routeCoordinates = decodePolyline(data.trip.legs[0].shape);
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-[500px] w-full rounded-lg">
    <VLayerMaplibreRoute
      id="delivery-route"
      :coordinates="routeCoordinates"
      color="#3b82f6"
      :width="4"
    />
    <VMarker :coordinates="store.coordinates">
      <div class="marker">Store</div>
    </VMarker>
    <VMarker :coordinates="home.coordinates">
      <div class="marker">Home</div>
    </VMarker>
  </VMap>
</template>`;
</script>

<template>
  <div>
    <p class="mb-6 text-muted-foreground">
      Real-time delivery route visualization using VLayerMaplibreRoute.
    </p>

    <div class="grid gap-8 lg:grid-cols-2">
      <div class="min-w-0 space-y-4">
        <div class="rounded-lg border border-border bg-card p-4">
          <div class="flex items-center gap-3 mb-4">
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
                    class="size-2 rounded-full bg-green-500 animate-pulse"
                  />
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

        <div class="space-y-3">
          <div
            class="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
          >
            <div
              class="flex size-8 items-center justify-center rounded-full bg-emerald-500/10"
            >
              <Icon name="lucide:store" class="size-4 text-emerald-500" />
            </div>
            <div class="flex-1">
              <div class="font-medium">Store</div>
              <div class="text-xs text-muted-foreground">Pickup location</div>
            </div>
            <Icon
              name="lucide:check-circle-2"
              class="size-5 text-emerald-500"
            />
          </div>

          <div class="ml-4 h-6 border-l-2 border-dashed border-border" />

          <div
            class="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
          >
            <div
              class="flex size-8 items-center justify-center rounded-full bg-blue-500/10"
            >
              <Icon name="lucide:home" class="size-4 text-blue-500" />
            </div>
            <div class="flex-1">
              <div class="font-medium">Home</div>
              <div class="text-xs text-muted-foreground">Delivery address</div>
            </div>
            <Icon name="lucide:clock" class="size-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div
        class="h-125 min-w-0 overflow-hidden rounded-lg border border-border"
      >
        <ClientOnly>
          <VMap
            :key="`delivery-${mapStyle}`"
            :options="deliveryMapOptions"
            class="h-full w-full"
            @loaded="onMapLoaded"
          >
            <VControlNavigation position="top-right" />
            <VControlScale position="bottom-left" />

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
                    class="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900/80 px-2 py-0.5 text-xs font-medium text-white"
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
                    class="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900/90 px-2 py-1 text-xs font-medium text-white shadow-lg"
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
                    class="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900/80 px-2 py-0.5 text-xs font-medium text-white"
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
      </div>
    </div>

    <div class="mt-8">
      <LazyCodeBlock
        :code="codeExample"
        lang="vue"
        filename="DeliveryTracking.vue"
      />
    </div>
  </div>
</template>
