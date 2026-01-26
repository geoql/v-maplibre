<script setup lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import {
    VMap,
    VMarker,
    VLayerMaplibreRoute,
    VControlNavigation,
  } from '@geoql/v-maplibre';
  import type { ValhallaResponse } from '~/types/route';
  import {
    useRouteUtils,
    decodePolyline,
    fitMapToBounds,
    formatDuration,
    formatDistanceKm,
  } from '~/composables/use-route-utils';

  const { mapStyle } = useRouteUtils();
  const mapId = useId();
  const mapRef = ref<MaplibreMap | null>(null);
  const mapLoaded = ref(false);
  const routeLoading = ref(false);

  const startLocation = { coordinates: [-74.006, 40.7128] as [number, number] };
  const endLocation = { coordinates: [-73.8648, 40.7614] as [number, number] };

  const mapOptions = computed(() => ({
    container: `playback-map-${mapId}`,
    style: mapStyle.value,
    center: [-73.93, 40.74] as [number, number],
    zoom: 11,
  }));

  const routeCoordinates = ref<[number, number][]>([]);
  const routeInfo = ref<{ distance: number; duration: number } | null>(null);

  const isPlaying = ref(false);
  const progress = ref(0);
  const speed = ref(1);
  const currentPosition = ref<[number, number]>(startLocation.coordinates);
  const animationFrameId = ref<number | null>(null);
  const lastTimestamp = ref<number | null>(null);

  function getDistance(p1: [number, number], p2: [number, number]): number {
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  const segmentDistances = computed(() => {
    if (routeCoordinates.value.length < 2) return [];
    const distances: number[] = [];
    for (let i = 0; i < routeCoordinates.value.length - 1; i++) {
      const p1 = routeCoordinates.value[i];
      const p2 = routeCoordinates.value[i + 1];
      if (p1 && p2) {
        distances.push(getDistance(p1, p2));
      }
    }
    return distances;
  });

  const totalDistance = computed(() =>
    segmentDistances.value.reduce((a, b) => a + b, 0),
  );

  function getPositionAtProgress(progressPercent: number): [number, number] {
    const coords = routeCoordinates.value;
    const firstCoord = coords[0];
    const lastCoord = coords[coords.length - 1];

    if (coords.length === 0 || !firstCoord) return startLocation.coordinates;
    if (progressPercent <= 0) return firstCoord;
    if (progressPercent >= 100 && lastCoord) return lastCoord;

    const targetDistance = (progressPercent / 100) * totalDistance.value;
    let accumulatedDistance = 0;

    for (let i = 0; i < segmentDistances.value.length; i++) {
      const segmentDist = segmentDistances.value[i];
      if (segmentDist === undefined) continue;

      if (accumulatedDistance + segmentDist >= targetDistance) {
        const segmentProgress =
          (targetDistance - accumulatedDistance) / segmentDist;
        const p1 = coords[i];
        const p2 = coords[i + 1];
        if (p1 && p2) {
          return [
            p1[0] + (p2[0] - p1[0]) * segmentProgress,
            p1[1] + (p2[1] - p1[1]) * segmentProgress,
          ];
        }
      }
      accumulatedDistance += segmentDist;
    }

    return lastCoord ?? startLocation.coordinates;
  }

  function animate(timestamp: number): void {
    if (!isPlaying.value) return;

    if (lastTimestamp.value === null) {
      lastTimestamp.value = timestamp;
    }

    const deltaTime = timestamp - lastTimestamp.value;
    lastTimestamp.value = timestamp;

    const progressIncrement = (deltaTime / 15000) * 100 * speed.value;
    progress.value = Math.min(100, progress.value + progressIncrement);
    currentPosition.value = getPositionAtProgress(progress.value);

    if (progress.value >= 100) {
      isPlaying.value = false;
      return;
    }

    animationFrameId.value = requestAnimationFrame(animate);
  }

  function play(): void {
    if (routeCoordinates.value.length === 0) return;
    if (progress.value >= 100) {
      progress.value = 0;
    }
    isPlaying.value = true;
    lastTimestamp.value = null;
    animationFrameId.value = requestAnimationFrame(animate);
  }

  function pause(): void {
    isPlaying.value = false;
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value);
    }
  }

  function stop(): void {
    pause();
    progress.value = 0;
    const firstCoord = routeCoordinates.value[0];
    if (firstCoord) {
      currentPosition.value = firstCoord;
    }
  }

  function setProgress(value: number): void {
    progress.value = value;
    currentPosition.value = getPositionAtProgress(value);
  }

  async function fetchRoute() {
    routeLoading.value = true;

    try {
      const params = {
        locations: [
          {
            lat: startLocation.coordinates[1],
            lon: startLocation.coordinates[0],
            type: 'break',
          },
          {
            lat: endLocation.coordinates[1],
            lon: endLocation.coordinates[0],
            type: 'break',
          },
        ],
        costing: 'auto',
        directions_options: { units: 'kilometers' },
      };

      const url = `/api/valhalla?json=${encodeURIComponent(JSON.stringify(params))}`;
      const data = await $fetch<ValhallaResponse>(url);

      if (data.trip?.legs?.[0]?.shape) {
        routeCoordinates.value = decodePolyline(data.trip.legs[0].shape);
        routeInfo.value = {
          distance: data.trip.summary.length,
          duration: data.trip.summary.time,
        };
        const firstCoord = routeCoordinates.value[0];
        if (firstCoord) {
          currentPosition.value = firstCoord;
        }

        if (mapRef.value) {
          fitMapToBounds(
            mapRef.value as unknown as Parameters<typeof fitMapToBounds>[0],
            [startLocation.coordinates, endLocation.coordinates],
            { top: 80, bottom: 80, left: 80, right: 80 },
            14,
          );
        }
      }
    } catch (err) {
      console.error('Route fetch error:', err);
    } finally {
      routeLoading.value = false;
    }
  }

  function handleMapLoad(map: MaplibreMap): void {
    mapRef.value = map;
    mapLoaded.value = true;

    fitMapToBounds(
      map as unknown as Parameters<typeof fitMapToBounds>[0],
      [startLocation.coordinates, endLocation.coordinates],
      { top: 80, bottom: 80, left: 80, right: 80 },
      14,
    );

    fetchRoute();
  }

  watch(mapStyle, () => {
    mapLoaded.value = false;
  });

  onUnmounted(() => {
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value);
    }
  });

  const progressPath = computed((): [number, number][] => {
    if (routeCoordinates.value.length < 2) return [];

    const pos = getPositionAtProgress(progress.value);
    const coords: [number, number][] = [];

    for (let i = 0; i < routeCoordinates.value.length - 1; i++) {
      const p1 = routeCoordinates.value[i];
      if (!p1) continue;

      coords.push(p1);

      const segmentStartDist =
        segmentDistances.value.slice(0, i).reduce((a, b) => a + b, 0) /
        totalDistance.value;
      const segmentEndDist =
        segmentDistances.value.slice(0, i + 1).reduce((a, b) => a + b, 0) /
        totalDistance.value;

      if (
        progress.value / 100 >= segmentStartDist &&
        progress.value / 100 <= segmentEndDist
      ) {
        coords.push(pos);
        break;
      }
    }

    if (progress.value >= 100) {
      return routeCoordinates.value;
    }

    return coords;
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VMarker, VLayerMaplibreRoute } from '@geoql/v-maplibre';
import { decodePolyline, fitMapToBounds } from '~/composables/use-route-utils';

const start = { coordinates: [-74.006, 40.7128] }; // NYC City Hall
const end = { coordinates: [-73.8648, 40.7614] };  // Forest Hills

// Fetch route from Valhalla API
const params = {
  locations: [
    { lat: start.coordinates[1], lon: start.coordinates[0], type: 'break' },
    { lat: end.coordinates[1], lon: end.coordinates[0], type: 'break' },
  ],
  costing: 'auto',
};

const response = await fetch(\`/api/valhalla?json=\${encodeURIComponent(JSON.stringify(params))}\`);
const data = await response.json();
const routeCoordinates = decodePolyline(data.trip.legs[0].shape);

const isPlaying = ref(false);
const progress = ref(0);
const currentPosition = ref(routeCoordinates[0]);

function animate() {
  progress.value = Math.min(100, progress.value + increment);
  currentPosition.value = getPositionAtProgress(progress.value);
  if (progress.value < 100) requestAnimationFrame(animate);
}
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-[500px] w-full" @loaded="onMapLoaded">
    <VLayerMaplibreRoute id="route-full" :coordinates="routeCoordinates" color="#94a3b8" :width="4" :opacity="0.5" />
    <VLayerMaplibreRoute id="route-progress" :coordinates="progressPath" color="#3b82f6" :width="4" />
    <VMarker :coordinates="currentPosition" :options="{ color: '#3b82f6' }" />
    <VMarker :coordinates="start.coordinates" :options="{ color: '#22c55e' }" />
    <VMarker :coordinates="end.coordinates" :options="{ color: '#ef4444' }" />
  </VMap>
</template>`;
</script>

<template>
  <div>
    <p class="mb-2 text-muted-foreground">
      Perfect for delivery tracking replay or journey visualization.
    </p>

    <div class="grid gap-8 lg:grid-cols-2">
      <div class="min-w-0 space-y-4">
        <div class="relative h-125 overflow-hidden rounded-lg border">
          <ClientOnly>
            <VMap
              :key="mapStyle"
              :options="mapOptions"
              class="size-full"
              @loaded="handleMapLoad"
            >
              <VControlNavigation position="top-right" />

              <template v-if="mapLoaded && routeCoordinates.length > 0">
                <VLayerMaplibreRoute
                  id="playback-route-full"
                  :coordinates="routeCoordinates"
                  color="#94a3b8"
                  :width="6"
                  :opacity="0.5"
                />

                <VLayerMaplibreRoute
                  v-if="progressPath.length > 1"
                  id="playback-route-progress"
                  :coordinates="progressPath"
                  color="#3b82f6"
                  :width="6"
                />
              </template>

              <VMarker
                :coordinates="currentPosition"
                :options="{ color: '#3b82f6' }"
              />

              <VMarker
                :coordinates="startLocation.coordinates"
                :options="{ color: '#22c55e' }"
              />

              <VMarker
                :coordinates="endLocation.coordinates"
                :options="{ color: '#ef4444' }"
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
            v-if="routeLoading"
            class="absolute inset-0 z-10 flex items-center justify-center bg-background/50"
          >
            <div class="flex items-center gap-2 text-sm">
              <Icon name="lucide:loader-2" class="size-4 animate-spin" />
              Loading route...
            </div>
          </div>
        </div>

        <div class="rounded-lg border bg-card p-4">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex gap-2">
              <button
                class="flex size-10 items-center justify-center rounded-full border transition-colors"
                :class="[
                  isPlaying
                    ? 'border-primary bg-primary text-primary-foreground'
                    : `
                      border-border
                      hover:bg-muted
                    `,
                ]"
                :disabled="routeCoordinates.length === 0"
                @click="isPlaying ? pause() : play()"
              >
                <Icon
                  :name="isPlaying ? 'lucide:pause' : 'lucide:play'"
                  class="size-5"
                />
              </button>
              <button
                class="flex size-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted"
                :disabled="routeCoordinates.length === 0"
                @click="stop"
              >
                <Icon name="lucide:square" class="size-4" />
              </button>
            </div>

            <div class="text-right text-sm text-muted-foreground">
              <div>{{ Math.round(progress) }}% complete</div>
              <div v-if="routeInfo" class="text-xs">
                {{ formatDistanceKm(routeInfo.distance) }} •
                {{ formatDuration(routeInfo.duration) }}
              </div>
            </div>
          </div>

          <div class="mb-4">
            <Slider
              :model-value="[progress]"
              :min="0"
              :max="100"
              :step="0.1"
              :disabled="routeCoordinates.length === 0"
              @update:model-value="(val) => setProgress(val[0] ?? 0)"
            />
          </div>

          <div class="flex items-center gap-4">
            <span class="text-sm text-muted-foreground">Speed:</span>
            <div class="flex gap-1">
              <button
                v-for="s in [0.5, 1, 2, 4]"
                :key="s"
                class="rounded-md border px-2 py-1 text-sm transition-colors"
                :class="[
                  speed === s
                    ? 'border-primary bg-primary text-primary-foreground'
                    : `
                      border-border
                      hover:bg-muted
                    `,
                ]"
                @click="speed = s"
              >
                {{ s }}x
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="min-w-0">
        <CodeBlock
          :code="codeExample"
          lang="vue"
          filename="RoutePlayback.vue"
        />

        <div class="mt-4 rounded-lg border bg-muted/50 p-4">
          <h3 class="mb-2 font-medium">Features</h3>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li>
              <strong class="text-foreground">Real Routes:</strong> Uses
              Valhalla routing API for actual road-following paths
            </li>
            <li>
              <strong class="text-foreground">Play/Pause:</strong> Control the
              animation with standard playback controls
            </li>
            <li>
              <strong class="text-foreground">Seek:</strong> Drag the progress
              bar to jump to any point in the route
            </li>
            <li>
              <strong class="text-foreground">Speed:</strong> Adjust playback
              speed from 0.5x to 4x
            </li>
            <li>
              <strong class="text-foreground">Progress Path:</strong> Shows the
              traveled portion in a different color
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
