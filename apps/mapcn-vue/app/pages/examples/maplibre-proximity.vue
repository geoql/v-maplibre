<script setup lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import {
    VMap,
    VControlNavigation,
    VControlLegend,
    VMarker,
    VLayerMaplibreGeojson,
  } from '@geoql/v-maplibre';
  import type { CategoryLegendItem } from '@geoql/v-maplibre';
  import type { FeatureCollection, LineString } from 'geojson';
  import type {
    LocationPoint,
    Connection,
    ValhallaMatrixResponse,
  } from '~/types/proximity';

  useSeoMeta({
    title: 'Proximity Map - mapcn-vue Examples',
    description:
      'Visualize distances and connections between multiple locations.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Proximity Map',
    description:
      'Visualize distances and connections between multiple locations.',
    category: 'MapLibre',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();
  const mapRef = ref<MaplibreMap | null>(null);
  const mapLoaded = ref(false);
  const distancesLoading = ref(false);
  const distancesError = ref<string | null>(null);

  const mapOptions = computed(() => ({
    container: `proximity-map-${mapId}`,
    style: mapStyle.value,
    center: [-73.98, 40.75] as [number, number],
    zoom: 11,
  }));

  const locations: LocationPoint[] = [
    {
      id: '1',
      name: 'Main Warehouse',
      coordinates: [-73.95, 40.78],
      type: 'warehouse',
    },
    {
      id: '2',
      name: 'Store - Manhattan',
      coordinates: [-73.985, 40.758],
      type: 'store',
    },
    {
      id: '3',
      name: 'Store - Brooklyn',
      coordinates: [-73.945, 40.678],
      type: 'store',
    },
    {
      id: '4',
      name: 'Customer A',
      coordinates: [-74.015, 40.715],
      type: 'customer',
    },
    {
      id: '5',
      name: 'Customer B',
      coordinates: [-73.92, 40.73],
      type: 'customer',
    },
    {
      id: '6',
      name: 'Customer C',
      coordinates: [-73.97, 40.695],
      type: 'customer',
    },
  ];

  const showAllConnections = ref(true);
  const selectedLocation = ref<string | null>(null);
  const connections = ref<Connection[]>([]);

  async function fetchDistances(): Promise<void> {
    distancesLoading.value = true;
    distancesError.value = null;

    try {
      const matrixLocations = locations.map((loc) => ({
        lat: loc.coordinates[1],
        lon: loc.coordinates[0],
      }));

      const params = {
        sources: matrixLocations,
        targets: matrixLocations,
        costing: 'auto',
        units: 'kilometers',
      };

      const url = `/api/valhalla?endpoint=sources_to_targets&json=${encodeURIComponent(JSON.stringify(params))}`;
      const data = await $fetch<ValhallaMatrixResponse>(url);

      const conns: Connection[] = [];
      for (let i = 0; i < locations.length; i++) {
        for (let j = i + 1; j < locations.length; j++) {
          const fromLoc = locations[i];
          const toLoc = locations[j];
          const cell = data.sources_to_targets[i]?.[j];

          if (fromLoc && toLoc && cell) {
            conns.push({
              from: fromLoc,
              to: toLoc,
              distance: cell.distance,
              duration: cell.time,
            });
          }
        }
      }

      connections.value = conns.sort((a, b) => a.distance - b.distance);
    } catch (err) {
      console.error('Failed to fetch distances:', err);
      distancesError.value = 'Failed to load road distances';
    } finally {
      distancesLoading.value = false;
    }
  }

  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }

  onMounted(() => {
    fetchDistances();
  });

  const visibleConnections = computed(() => {
    if (!selectedLocation.value) {
      return showAllConnections.value ? connections.value : [];
    }
    return connections.value.filter(
      (c) =>
        c.from.id === selectedLocation.value ||
        c.to.id === selectedLocation.value,
    );
  });

  // Used in code example display only, not in actual component
  const _linesGeoJson = computed<FeatureCollection<LineString>>(() => ({
    type: 'FeatureCollection',
    features: visibleConnections.value.map((conn) => ({
      type: 'Feature',
      properties: {
        distance: conn.distance.toFixed(2),
        fromName: conn.from.name,
        toName: conn.to.name,
      },
      geometry: {
        type: 'LineString',
        coordinates: [conn.from.coordinates, conn.to.coordinates],
      },
    })),
  }));

  function getLineColor(distance: number): string {
    if (distance < 5) return '#22c55e';
    if (distance < 10) return '#eab308';
    return '#ef4444';
  }

  const linesWithColor = computed<FeatureCollection<LineString>>(() => ({
    type: 'FeatureCollection',
    features: visibleConnections.value.map((conn) => ({
      type: 'Feature',
      properties: {
        distance: conn.distance.toFixed(2),
        fromName: conn.from.name,
        toName: conn.to.name,
        lineColor: getLineColor(conn.distance),
      },
      geometry: {
        type: 'LineString',
        coordinates: [conn.from.coordinates, conn.to.coordinates],
      },
    })),
  }));

  function handleMapLoad(map: MaplibreMap): void {
    mapRef.value = map;
    mapLoaded.value = true;
  }

  watch(mapStyle, () => {
    mapLoaded.value = false;
  });

  function toggleLocation(id: string): void {
    if (selectedLocation.value === id) {
      selectedLocation.value = null;
    } else {
      selectedLocation.value = id;
    }
  }

  function getMarkerColor(type: LocationPoint['type']): string {
    switch (type) {
      case 'warehouse':
        return '#8b5cf6';
      case 'store':
        return '#3b82f6';
      case 'customer':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  }

  function getMarkerIcon(type: LocationPoint['type']): string {
    switch (type) {
      case 'warehouse':
        return 'lucide:warehouse';
      case 'store':
        return 'lucide:store';
      case 'customer':
        return 'lucide:user';
      default:
        return 'lucide:map-pin';
    }
  }

  // Legend items for distance colors
  const distanceLegendItems: CategoryLegendItem[] = [
    { value: '< 5 km', label: '< 5 km', color: '#22c55e' },
    { value: '5-10 km', label: '5-10 km', color: '#eab308' },
    { value: '> 10 km', label: '> 10 km', color: '#ef4444' },
  ];

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VMarker, VControlLegend, VLayerMaplibreGeojson } from '@geoql/v-maplibre';

const locations = [
  { id: '1', name: 'Warehouse', coordinates: [-73.95, 40.78] },
  { id: '2', name: 'Store A', coordinates: [-73.985, 40.758] },
  { id: '3', name: 'Store B', coordinates: [-73.945, 40.678] },
];

const connections = ref([]);

const distanceLegendItems = [
  { value: '< 5 km', label: '< 5 km', color: '#22c55e' },
  { value: '5-10 km', label: '5-10 km', color: '#eab308' },
  { value: '> 10 km', label: '> 10 km', color: '#ef4444' },
];

// Fetch real road distances using Valhalla matrix API
async function fetchDistances() {
  const matrixLocations = locations.map(loc => ({
    lat: loc.coordinates[1],
    lon: loc.coordinates[0],
  }));

  const params = {
    sources: matrixLocations,
    targets: matrixLocations,
    costing: 'auto',
    units: 'kilometers',
  };

  const url = \`/api/valhalla?endpoint=sources_to_targets&json=\${encodeURIComponent(JSON.stringify(params))}\`;
  const data = await $fetch(url);

  const conns = [];
  for (let i = 0; i < locations.length; i++) {
    for (let j = i + 1; j < locations.length; j++) {
      const cell = data.sources_to_targets[i][j];
      conns.push({
        from: locations[i],
        to: locations[j],
        distance: cell.distance,
        duration: cell.time,
      });
    }
  }
  connections.value = conns.sort((a, b) => a.distance - b.distance);
}

onMounted(() => fetchDistances());
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full">
    <VLayerMaplibreGeojson
      source-id="connections"
      layer-id="connection-lines"
      :source="{ type: 'geojson', data: linesGeoJson }"
      :layer="{ type: 'line', paint: { 'line-color': ['get', 'lineColor'], 'line-width': 2 } }"
    />
    <VMarker
      v-for="loc in locations"
      :key="loc.id"
      :coordinates="loc.coordinates"
      :options="{ color: getMarkerColor(loc.type) }"
    />
    <VControlLegend
      :layer-ids="['connection-lines']"
      type="category"
      :items="distanceLegendItems"
      title="Road Distance"
      position="bottom-left"
      :interactive="false"
    />
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
        <h1 class="mt-4 text-3xl font-bold tracking-tight">Proximity Map</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Visualize distances and connections between multiple locations. Useful
          for logistics planning, network analysis, and proximity calculations.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div class="min-w-0">
          <div class="relative h-125 overflow-hidden rounded-lg border">
            <ClientOnly>
              <VMap
                :key="mapStyle"
                :options="mapOptions"
                class="size-full"
                @loaded="handleMapLoad"
              >
                <VControlNavigation position="top-right" />

                <!-- Connection lines -->
                <VLayerMaplibreGeojson
                  v-if="mapLoaded && linesWithColor.features.length > 0"
                  source-id="proximity-connections"
                  layer-id="connection-lines"
                  :source="{ type: 'geojson', data: linesWithColor }"
                  :layer="{
                    id: 'connection-lines',
                    type: 'line',
                    source: 'proximity-connections',
                    paint: {
                      'line-color': ['get', 'lineColor'],
                      'line-width': 2,
                      'line-dasharray': [4, 4],
                    },
                  }"
                />

                <!-- Location markers - use default markers to avoid v-for + custom slot issues -->
                <VMarker
                  v-for="loc in locations"
                  :key="loc.id"
                  :coordinates="loc.coordinates"
                  :options="{ color: getMarkerColor(loc.type) }"
                  @click="toggleLocation(loc.id)"
                />

                <VControlLegend
                  :layer-ids="['connection-lines']"
                  type="category"
                  :items="distanceLegendItems"
                  title="Road Distance"
                  position="bottom-left"
                  :interactive="false"
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
          </div>

          <!-- Controls -->
          <div class="mt-4 rounded-lg border bg-card p-4">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="font-medium">Connections</h3>
              <label class="flex items-center gap-2 text-sm">
                <input
                  v-model="showAllConnections"
                  type="checkbox"
                  class="rounded-sm border-border"
                />
                Show all
              </label>
            </div>

            <div class="space-y-2">
              <button
                v-for="loc in locations"
                :key="loc.id"
                class="flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors"
                :class="[
                  selectedLocation === loc.id
                    ? 'border-primary bg-primary/10'
                    : `
                      border-border
                      hover:bg-muted
                    `,
                ]"
                @click="toggleLocation(loc.id)"
              >
                <div
                  class="flex size-6 items-center justify-center rounded-full"
                  :style="{ backgroundColor: getMarkerColor(loc.type) }"
                >
                  <Icon
                    :name="getMarkerIcon(loc.type)"
                    class="size-3 text-white"
                  />
                </div>
                <span>{{ loc.name }}</span>
              </button>
            </div>
          </div>

          <!-- Distance table -->
          <div class="mt-4 rounded-lg border bg-card">
            <div class="flex items-center justify-between border-b px-4 py-2">
              <h3 class="font-medium">
                Road Distances ({{ visibleConnections.length }} connections)
              </h3>
              <div
                v-if="distancesLoading"
                class="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <Icon name="lucide:loader-2" class="size-3 animate-spin" />
                Loading...
              </div>
              <div v-else-if="distancesError" class="text-xs text-destructive">
                {{ distancesError }}
              </div>
            </div>
            <div class="max-h-40 overflow-y-auto">
              <table class="w-full text-sm">
                <thead class="sticky top-0 bg-card">
                  <tr class="border-b">
                    <th class="px-4 py-2 text-left font-medium">From</th>
                    <th class="px-4 py-2 text-left font-medium">To</th>
                    <th class="px-4 py-2 text-right font-medium">Distance</th>
                    <th class="px-4 py-2 text-right font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="conn in visibleConnections"
                    :key="`${conn.from.id}-${conn.to.id}`"
                    class="border-b last:border-0"
                  >
                    <td class="px-4 py-2">
                      {{ conn.from.name }}
                    </td>
                    <td class="px-4 py-2">
                      {{ conn.to.name }}
                    </td>
                    <td class="px-4 py-2 text-right tabular-nums">
                      {{ conn.distance.toFixed(1) }} km
                    </td>
                    <td
                      class="px-4 py-2 text-right text-muted-foreground tabular-nums"
                    >
                      {{ formatDuration(conn.duration) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="ProximityMap.vue"
          />

          <div class="mt-4 rounded-lg border bg-muted/50 p-4">
            <h3 class="mb-2 font-medium">Use Cases</h3>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>
                <strong class="text-foreground">Logistics:</strong> Find the
                nearest warehouse to each customer for optimal delivery routing.
              </li>
              <li>
                <strong class="text-foreground">Network Analysis:</strong>
                Visualize connections between nodes in a distribution network.
              </li>
              <li>
                <strong class="text-foreground">Site Selection:</strong> Analyze
                distances when choosing new store or facility locations.
              </li>
              <li>
                <strong class="text-foreground">Service Areas:</strong>
                Determine which locations can serve which customers based on
                distance thresholds.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
