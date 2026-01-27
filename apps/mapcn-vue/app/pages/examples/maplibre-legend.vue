<script setup lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import type { FeatureCollection, Polygon, MultiPolygon } from 'geojson';
  import {
    VMap,
    VControlNavigation,
    VControlLegend,
    VLayerMaplibreGeojson,
  } from '@geoql/v-maplibre';
  import type { CategoryLegendItem } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Interactive Legend - mapcn-vue Examples',
    description:
      'Interactive legend with click-to-filter functionality for MapLibre layers.',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();
  const mapRef = ref<MaplibreMap | null>(null);

  const mapOptions = computed(() => ({
    container: `legend-map-${mapId}`,
    style: mapStyle.value,
    center: [-96, 37.8] as [number, number],
    zoom: 3.5,
  }));

  const statesGeoJson = ref<FeatureCollection<Polygon | MultiPolygon> | null>(
    null,
  );
  const isLoading = ref(true);

  const regionColors: Record<string, string> = {
    West: '#e41a1c',
    Southwest: '#377eb8',
    Midwest: '#4daf4a',
    Southeast: '#984ea3',
    Northeast: '#ff7f00',
  };

  const stateRegions: Record<string, string> = {
    Washington: 'West',
    Oregon: 'West',
    California: 'West',
    Nevada: 'West',
    Idaho: 'West',
    Montana: 'West',
    Wyoming: 'West',
    Colorado: 'West',
    Utah: 'West',
    Alaska: 'West',
    Hawaii: 'West',
    Arizona: 'Southwest',
    'New Mexico': 'Southwest',
    Texas: 'Southwest',
    Oklahoma: 'Southwest',
    'North Dakota': 'Midwest',
    'South Dakota': 'Midwest',
    Nebraska: 'Midwest',
    Kansas: 'Midwest',
    Minnesota: 'Midwest',
    Iowa: 'Midwest',
    Missouri: 'Midwest',
    Wisconsin: 'Midwest',
    Illinois: 'Midwest',
    Michigan: 'Midwest',
    Indiana: 'Midwest',
    Ohio: 'Midwest',
    Arkansas: 'Southeast',
    Louisiana: 'Southeast',
    Mississippi: 'Southeast',
    Alabama: 'Southeast',
    Tennessee: 'Southeast',
    Kentucky: 'Southeast',
    'West Virginia': 'Southeast',
    Virginia: 'Southeast',
    'North Carolina': 'Southeast',
    'South Carolina': 'Southeast',
    Georgia: 'Southeast',
    Florida: 'Southeast',
    Maine: 'Northeast',
    'New Hampshire': 'Northeast',
    Vermont: 'Northeast',
    Massachusetts: 'Northeast',
    'Rhode Island': 'Northeast',
    Connecticut: 'Northeast',
    'New York': 'Northeast',
    'New Jersey': 'Northeast',
    Pennsylvania: 'Northeast',
    Delaware: 'Northeast',
    Maryland: 'Northeast',
    'District of Columbia': 'Northeast',
  };

  const legendItems = computed((): CategoryLegendItem[] => {
    return Object.entries(regionColors).map(([region, color]) => ({
      value: region,
      label: region,
      color,
      visible: true,
    }));
  });

  async function fetchStatesData(): Promise<void> {
    try {
      isLoading.value = true;
      const response = await fetch(
        'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json',
      );
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
      const data = (await response.json()) as FeatureCollection<
        Polygon | MultiPolygon
      >;

      statesGeoJson.value = {
        type: 'FeatureCollection',
        features: data.features.map((feature) => {
          const stateName = feature.properties?.name as string;
          const region = stateRegions[stateName] || 'Other';
          return {
            ...feature,
            properties: {
              ...feature.properties,
              region,
              fillColor: regionColors[region] || '#999999',
            },
          };
        }),
      };
    } finally {
      isLoading.value = false;
    }
  }

  onMounted(() => {
    fetchStatesData();
  });

  function handleMapLoad(map: MaplibreMap): void {
    mapRef.value = map;
  }

  function handleFilterChange(data: {
    filter: { visibleValues: (string | number)[] };
    layerIds: string[];
  }): void {
    console.log('Filter changed:', data);
  }

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VControlLegend, VLayerMaplibreGeojson } from '@geoql/v-maplibre';
import type { CategoryLegendItem } from '@geoql/v-maplibre';

const legendItems: CategoryLegendItem[] = [
  { value: 'West', label: 'West', color: '#e41a1c', visible: true },
  { value: 'Southwest', label: 'Southwest', color: '#377eb8', visible: true },
  { value: 'Midwest', label: 'Midwest', color: '#4daf4a', visible: true },
  { value: 'Southeast', label: 'Southeast', color: '#984ea3', visible: true },
  { value: 'Northeast', label: 'Northeast', color: '#ff7f00', visible: true },
];
${SCRIPT_END}

<template>
  <VMap :options="mapOptions">
    <VLayerMaplibreGeojson
      source-id="regions"
      layer-id="regions-fill"
      :source="{ type: 'geojson', data: statesGeoJson }"
      :layer="{
        id: 'regions-fill',
        type: 'fill',
        source: 'regions',
        paint: {
          'fill-color': [
            'match', ['get', 'region'],
            'West', '#e41a1c',
            'Southwest', '#377eb8',
            'Midwest', '#4daf4a',
            'Southeast', '#984ea3',
            'Northeast', '#ff7f00',
            '#999999'
          ],
          'fill-opacity': 0.7
        }
      }"
    />
    
    <!-- Interactive Legend with filtering -->
    <VControlLegend
      :layer-ids="['regions-fill']"
      type="category"
      :items="legendItems"
      :property="'fill-color'"
      title="US Regions"
      :interactive="true"
      @filter-change="handleFilterChange"
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
        <h1 class="mt-4 text-3xl font-bold tracking-tight">
          Interactive Legend
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Click legend items to filter the map. VControlLegend supports
          category, gradient, and size legend types with automatic MapLibre
          filter updates.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div class="min-w-0">
          <div class="relative h-125 overflow-hidden rounded-lg border">
            <ClientOnly>
              <template v-if="isLoading">
                <div class="flex h-full items-center justify-center bg-muted">
                  <div class="text-center">
                    <Icon
                      name="lucide:loader-2"
                      class="mx-auto size-8 animate-spin text-muted-foreground"
                    />
                    <p class="mt-2 text-sm text-muted-foreground">
                      Loading US states data...
                    </p>
                  </div>
                </div>
              </template>

              <template v-else-if="statesGeoJson">
                <VMap
                  :key="`legend-${mapStyle}`"
                  :options="mapOptions"
                  class="size-full"
                  @loaded="handleMapLoad"
                >
                  <VControlNavigation position="bottom-right" />

                  <VLayerMaplibreGeojson
                    source-id="regions-legend"
                    layer-id="regions-fill"
                    :source="{ type: 'geojson', data: statesGeoJson }"
                    :layer="{
                      id: 'regions-fill',
                      type: 'fill',
                      source: 'regions-legend',
                      paint: {
                        'fill-color': [
                          'match',
                          ['get', 'region'],
                          'West',
                          '#e41a1c',
                          'Southwest',
                          '#377eb8',
                          'Midwest',
                          '#4daf4a',
                          'Southeast',
                          '#984ea3',
                          'Northeast',
                          '#ff7f00',
                          '#999999',
                        ],
                        'fill-opacity': 0.7,
                      },
                    }"
                  />

                  <VLayerMaplibreGeojson
                    source-id="regions-legend-line"
                    layer-id="regions-line"
                    :source="{ type: 'geojson', data: statesGeoJson }"
                    :layer="{
                      id: 'regions-line',
                      type: 'line',
                      source: 'regions-legend-line',
                      paint: {
                        'line-color': '#ffffff',
                        'line-width': 1,
                      },
                    }"
                  />

                  <VControlLegend
                    :layer-ids="['regions-fill']"
                    type="category"
                    :items="legendItems"
                    property="fill-color"
                    title="US Regions"
                    :interactive="true"
                    position="top-right"
                    @filter-change="handleFilterChange"
                  />
                </VMap>
              </template>

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

          <div class="mt-4 rounded-lg border bg-muted/50 p-4">
            <h3 class="mb-2 font-medium">VControlLegend Features</h3>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>
                <strong class="text-foreground">Click to Filter:</strong>
                Click any legend item to toggle visibility of that category on
                the map.
              </li>
              <li>
                <strong class="text-foreground">Category Legend:</strong>
                Displays discrete categories with color swatches and labels.
              </li>
              <li>
                <strong class="text-foreground">Gradient Legend:</strong>
                Shows continuous color ramps with min/max labels.
              </li>
              <li>
                <strong class="text-foreground">Size Legend:</strong>
                Displays proportional symbols for size-based visualizations.
              </li>
              <li>
                <strong class="text-foreground">Auto-Generate:</strong>
                Can parse MapLibre paint expressions (match, step, interpolate)
                to auto-generate legend items.
              </li>
            </ul>
          </div>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="InteractiveLegend.vue"
          />

          <div class="mt-4 rounded-lg border bg-muted/50 p-4">
            <h3 class="mb-2 font-medium">Props</h3>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <code class="text-primary">layer-ids</code>
                <span class="text-muted-foreground">string[] (required)</span>
              </div>
              <div class="flex justify-between">
                <code class="text-primary">type</code>
                <span class="text-muted-foreground"
                  >"category" | "gradient" | "size"</span
                >
              </div>
              <div class="flex justify-between">
                <code class="text-primary">items</code>
                <span class="text-muted-foreground">LegendItem[]</span>
              </div>
              <div class="flex justify-between">
                <code class="text-primary">property</code>
                <span class="text-muted-foreground"
                  >string (paint property name)</span
                >
              </div>
              <div class="flex justify-between">
                <code class="text-primary">interactive</code>
                <span class="text-muted-foreground"
                  >boolean (default: true)</span
                >
              </div>
              <div class="flex justify-between">
                <code class="text-primary">auto-generate</code>
                <span class="text-muted-foreground"
                  >boolean (parse from paint)</span
                >
              </div>
            </div>
          </div>

          <div class="mt-4 rounded-lg border bg-muted/50 p-4">
            <h3 class="mb-2 font-medium">Events</h3>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <code class="text-primary">@item-click</code>
                <span class="text-muted-foreground"
                  >{ item, index, visible }</span
                >
              </div>
              <div class="flex justify-between">
                <code class="text-primary">@filter-change</code>
                <span class="text-muted-foreground">{ filter, layerIds }</span>
              </div>
              <div class="flex justify-between">
                <code class="text-primary">@update:filter</code>
                <span class="text-muted-foreground">FilterState</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
