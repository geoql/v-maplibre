<script setup lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import {
    VMap,
    VControlNavigation,
    VMarker,
    VLayerMaplibreIsochrone,
  } from '@geoql/v-maplibre';
  import type {
    IsochroneResponse,
    TransportMode,
    TransportModeOption,
  } from '~/types/isochrone';

  useSeoMeta({
    title: 'Isochrone Map - mapcn-vue Examples',
    description:
      'Visualize travel time or distance zones showing areas reachable from a point.',
  });

  const colorMode = useColorMode();
  const mapId = useId();
  const mapRef = ref<MaplibreMap | null>(null);
  const mapLoaded = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const lightStyle =
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
  const darkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark' ? darkStyle : lightStyle,
  );

  const mapOptions = computed(() => ({
    container: `isochrone-map-${mapId}`,
    style: mapStyle.value,
    center: [-73.985, 40.758] as [number, number],
    zoom: 12,
  }));

  const originPoint = ref<[number, number]>([-73.985, 40.758]);
  const isochroneData = ref<IsochroneResponse | null>(null);

  type MetricType = 'time' | 'distance';
  const selectedMetric = ref<MetricType>('time');

  const transportModes: TransportModeOption[] = [
    { value: 'auto', label: 'Car', icon: 'lucide:car' },
    { value: 'bicycle', label: 'Bicycle', icon: 'lucide:bike' },
    { value: 'pedestrian', label: 'Walk', icon: 'lucide:footprints' },
  ];

  const selectedMode = ref<TransportMode>('auto');

  const timeContours = [
    { time: 5, color: '#2563eb', label: '5 min' },
    { time: 10, color: '#7c3aed', label: '10 min' },
    { time: 15, color: '#db2777', label: '15 min' },
    { time: 20, color: '#ea580c', label: '20 min' },
  ];

  const distanceContours = [
    { distance: 2, color: '#2563eb', label: '2 km' },
    { distance: 5, color: '#7c3aed', label: '5 km' },
    { distance: 10, color: '#db2777', label: '10 km' },
    { distance: 15, color: '#ea580c', label: '15 km' },
  ];

  const activeContours = computed(() =>
    selectedMetric.value === 'time' ? timeContours : distanceContours,
  );

  // Helper to remove # from hex color for Valhalla API
  function toValhallaColor(hex: string): string {
    return hex.replace('#', '');
  }

  async function fetchIsochrone(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      // Valhalla expects colors without # prefix
      const contours =
        selectedMetric.value === 'time'
          ? timeContours.map((c) => ({
              time: c.time,
              color: toValhallaColor(c.color),
            }))
          : distanceContours.map((c) => ({
              distance: c.distance,
              color: toValhallaColor(c.color),
            }));

      const params = {
        locations: [
          {
            lat: originPoint.value[1],
            lon: originPoint.value[0],
          },
        ],
        costing: selectedMode.value,
        contours,
        polygons: true,
        denoise: 0.5,
        generalize: 50,
      };

      const url = `/api/valhalla?endpoint=isochrone&json=${encodeURIComponent(JSON.stringify(params))}`;
      const data = await $fetch<IsochroneResponse>(url);

      isochroneData.value = data;
    } catch (err) {
      console.error('Isochrone fetch error:', err);
      error.value = 'Failed to load isochrone data';
    } finally {
      isLoading.value = false;
    }
  }

  function handleMapLoad(map: MaplibreMap): void {
    mapRef.value = map;
    mapLoaded.value = true;
    fetchIsochrone();
  }

  function handleMarkerDragEnd(event: {
    target: { getLngLat: () => { lng: number; lat: number } };
  }): void {
    const lngLat = event.target.getLngLat();
    originPoint.value = [lngLat.lng, lngLat.lat];
    fetchIsochrone();
  }

  function handleModeChange(mode: TransportMode): void {
    selectedMode.value = mode;
    fetchIsochrone();
  }

  function handleMetricChange(metric: MetricType): void {
    selectedMetric.value = metric;
    fetchIsochrone();
  }

  watch(mapStyle, () => {
    mapLoaded.value = false;
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VMarker, VLayerMaplibreIsochrone } from '@geoql/v-maplibre';

  const originPoint = ref([-73.985, 40.758]);
  const isochroneData = ref(null);

  // Contours - Valhalla expects colors without # prefix
  const contours = [
    { time: 5, color: '2563eb' },
    { time: 10, color: '7c3aed' },
    { time: 15, color: 'db2777' },
    { time: 20, color: 'ea580c' },
  ];

  async function fetchIsochrone() {
    const params = {
      locations: [{ lat: originPoint.value[1], lon: originPoint.value[0] }],
      costing: 'auto',
      contours,
      polygons: true,
    };
    const response = await $fetch('/api/valhalla?endpoint=isochrone&json=' +
      encodeURIComponent(JSON.stringify(params)));
    isochroneData.value = response;
  }

  function handleMarkerDrag(e) {
    const { lng, lat } = e.target.getLngLat();
    originPoint.value = [lng, lat];
    fetchIsochrone();
  }
  ${SCRIPT_END}

  <template>
    <VMap :options="mapOptions" @loaded="fetchIsochrone">
      <!-- VLayerMaplibreIsochrone handles color formatting, fill & line layers -->
      <VLayerMaplibreIsochrone
        v-if="isochroneData"
        id="isochrone"
        :data="isochroneData"
        :fill-opacity="0.4"
        :line-width="2"
      />
      <VMarker :coordinates="originPoint" :options="{ draggable: true }" @dragend="handleMarkerDrag" />
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
        <h1 class="mt-4 text-3xl font-bold tracking-tight">Isochrone Map</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Visualize travel time or distance zones showing areas reachable from a
          point. Drag the marker to change the origin.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div class="min-w-0">
          <div class="relative h-125 overflow-hidden rounded-lg border">
            <ClientOnly>
              <VMap
                :key="mapStyle"
                :options="mapOptions"
                class="h-full w-full"
                @loaded="handleMapLoad"
              >
                <VControlNavigation position="top-right" />

                <!-- VLayerMaplibreIsochrone handles:
                     - Color formatting (adds # prefix if needed)
                     - Reversing feature order for proper stacking
                     - Both fill and line layers -->
                <VLayerMaplibreIsochrone
                  v-if="mapLoaded && isochroneData"
                  id="isochrone"
                  :data="isochroneData"
                  :fill-opacity="0.4"
                  :line-width="2"
                  :line-opacity="0.8"
                />

                <VMarker
                  :coordinates="originPoint"
                  :options="{ draggable: true, color: '#ef4444' }"
                  @dragend="handleMarkerDragEnd"
                />
              </VMap>
              <template #fallback>
                <div class="flex h-full items-center justify-center bg-muted">
                  <Icon
                    name="lucide:loader-2"
                    class="size-8 animate-spin text-muted-foreground"
                  />
                </div>
              </template>
            </ClientOnly>

            <div
              v-if="isLoading"
              class="absolute inset-0 z-10 flex items-center justify-center bg-background/50"
            >
              <div class="flex items-center gap-2 text-sm">
                <Icon name="lucide:loader-2" class="size-4 animate-spin" />
                Calculating travel zones...
              </div>
            </div>

            <div
              v-if="error"
              class="absolute inset-0 z-10 flex items-center justify-center bg-background/80"
            >
              <div class="text-center">
                <Icon
                  name="lucide:alert-circle"
                  class="mx-auto size-8 text-destructive"
                />
                <p class="mt-2 text-sm text-destructive">{{ error }}</p>
              </div>
            </div>

            <!-- Legend -->
            <div
              class="absolute bottom-4 left-4 z-10 rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur-sm"
            >
              <h4 class="mb-2 text-xs font-medium">
                {{ selectedMetric === 'time' ? 'Travel Time' : 'Distance' }}
              </h4>
              <div class="space-y-1">
                <div
                  v-for="contour in activeContours"
                  :key="contour.label"
                  class="flex items-center gap-2 text-xs"
                >
                  <div
                    class="size-4 rounded"
                    :style="{ backgroundColor: contour.color, opacity: 0.6 }"
                  />
                  <span class="text-muted-foreground">{{ contour.label }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Controls -->
          <div class="mt-4 rounded-lg border bg-card p-4">
            <div class="mb-4">
              <h3 class="mb-3 font-medium">Metric</h3>
              <div class="flex gap-2">
                <button
                  class="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors"
                  :class="[
                    selectedMetric === 'time'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:bg-muted',
                  ]"
                  :disabled="isLoading"
                  @click="handleMetricChange('time')"
                >
                  <Icon name="lucide:clock" class="size-4" />
                  Time
                </button>
                <button
                  class="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors"
                  :class="[
                    selectedMetric === 'distance'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:bg-muted',
                  ]"
                  :disabled="isLoading"
                  @click="handleMetricChange('distance')"
                >
                  <Icon name="lucide:ruler" class="size-4" />
                  Distance
                </button>
              </div>
            </div>

            <div>
              <h3 class="mb-3 font-medium">Transport Mode</h3>
              <div class="flex gap-2">
                <button
                  v-for="mode in transportModes"
                  :key="mode.value"
                  class="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors"
                  :class="[
                    selectedMode === mode.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:bg-muted',
                  ]"
                  :disabled="isLoading"
                  @click="handleModeChange(mode.value)"
                >
                  <Icon :name="mode.icon" class="size-4" />
                  {{ mode.label }}
                </button>
              </div>
            </div>

            <div class="mt-4 text-sm text-muted-foreground">
              <p>
                <strong class="text-foreground">Tip:</strong> Drag the red
                marker to calculate travel zones from a different location.
              </p>
            </div>
          </div>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="IsochroneMap.vue"
          />

          <div class="mt-4 rounded-lg border bg-muted/50 p-4">
            <h3 class="mb-2 font-medium">What is an Isochrone?</h3>
            <p class="text-sm text-muted-foreground">
              An isochrone shows all areas reachable from a point within a
              specific time or distance. It accounts for actual road networks,
              one-way streets, and travel mode. Unlike simple radius circles,
              isochrones follow real roads for accurate coverage estimates.
            </p>
          </div>

          <div class="mt-4 rounded-lg border bg-muted/50 p-4">
            <h3 class="mb-2 font-medium">Use Cases</h3>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>
                <strong class="text-foreground">Real Estate:</strong> Show
                commute times to office locations for home buyers.
              </li>
              <li>
                <strong class="text-foreground">Logistics:</strong> Determine
                delivery coverage areas for warehouses.
              </li>
              <li>
                <strong class="text-foreground">Urban Planning:</strong> Analyze
                accessibility of public services and transit.
              </li>
              <li>
                <strong class="text-foreground">Emergency Services:</strong>
                Visualize response time coverage for fire/ambulance stations.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
