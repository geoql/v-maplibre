<script setup lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import type {
    FeatureCollection,
    Polygon,
    MultiPolygon,
    Point,
  } from 'geojson';
  import {
    VMap,
    VControlNavigation,
    VControlLegend,
    VLayerMaplibreGeojson,
  } from '@geoql/v-maplibre';
  import type {
    CategoryLegendItem,
    GradientLegendItem,
    SizeLegendItem,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Interactive Legend - mapcn-vue Examples',
    description:
      'Interactive legend with click-to-filter functionality for MapLibre layers.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Interactive Legend',
    description:
      'Interactive legend with click-to-filter functionality for MapLibre layers.',
    category: 'MapLibre',
  });

  const route = useRoute();
  const router = useRouter();
  const { mapStyle } = useMapStyle();
  const mapId = useId();
  const mapRef = ref<MaplibreMap | null>(null);

  type TabType = 'category' | 'gradient' | 'size';
  const TAB_TO_QUERY: Record<TabType, string> = {
    category: 'category',
    gradient: 'gradient',
    size: 'size',
  };
  const QUERY_TO_TAB: Record<string, TabType> = {
    category: 'category',
    gradient: 'gradient',
    size: 'size',
  };

  function getInitialTab(): TabType {
    const tabQuery = route.query.tab as string;
    return QUERY_TO_TAB[tabQuery] || 'category';
  }

  const activeTab = ref<TabType>(getInitialTab());

  function setActiveTab(tab: TabType): void {
    activeTab.value = tab;
    router.replace({ query: { tab: TAB_TO_QUERY[tab] } });
  }

  function isTabActive(tab: TabType): boolean {
    return activeTab.value === tab;
  }

  function getTabClasses(tab: TabType): string {
    const base = 'relative px-1 pb-3 text-sm font-medium transition-colors';
    return activeTab.value === tab
      ? `${base} text-foreground`
      : `${base} text-muted-foreground hover:text-foreground`;
  }

  const mapOptions = computed(() => ({
    container: `legend-map-${mapId}-${activeTab.value}`,
    style: mapStyle.value,
    center: [-96, 37.8] as [number, number],
    zoom: 3.5,
  }));

  // ============ CATEGORY LEGEND DATA ============
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

  const categoryLegendItems = computed((): CategoryLegendItem[] => {
    return Object.entries(regionColors).map(([region, color]) => ({
      value: region,
      label: region,
      color,
      visible: true,
    }));
  });

  // ============ GRADIENT LEGEND DATA ============
  const statesWithDensity = computed(() => {
    if (!statesGeoJson.value) return null;
    return {
      type: 'FeatureCollection' as const,
      features: statesGeoJson.value.features.map((feature) => ({
        ...feature,
        properties: {
          ...feature.properties,
          // Use existing density if available, otherwise calculate mock density
          density: feature.properties?.density || Math.random() * 500,
        },
      })),
    };
  });

  const gradientLegendItem: GradientLegendItem = {
    min: 0,
    max: 500,
    colors: ['#ffffcc', '#a1dab4', '#41b6c4', '#2c7fb8', '#253494'],
    stops: [0, 100, 200, 350, 500],
    minLabel: '0',
    maxLabel: '500+ /mi²',
  };

  // ============ SIZE LEGEND DATA ============
  const citiesGeoJson = computed(
    (): FeatureCollection<Point> => ({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-73.935242, 40.73061] },
          properties: {
            name: 'New York',
            population: 8336817,
            popClass: 'large',
          },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-118.243683, 34.052235] },
          properties: {
            name: 'Los Angeles',
            population: 3979576,
            popClass: 'large',
          },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-87.629799, 41.878113] },
          properties: {
            name: 'Chicago',
            population: 2693976,
            popClass: 'large',
          },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-95.358421, 29.749907] },
          properties: {
            name: 'Houston',
            population: 2320268,
            popClass: 'medium',
          },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-112.074036, 33.448376] },
          properties: {
            name: 'Phoenix',
            population: 1680992,
            popClass: 'medium',
          },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-75.165222, 39.952583] },
          properties: {
            name: 'Philadelphia',
            population: 1584064,
            popClass: 'medium',
          },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-98.493629, 29.424122] },
          properties: {
            name: 'San Antonio',
            population: 1547253,
            popClass: 'medium',
          },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-117.161087, 32.715736] },
          properties: {
            name: 'San Diego',
            population: 1423851,
            popClass: 'small',
          },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-96.796988, 32.776665] },
          properties: {
            name: 'Dallas',
            population: 1343573,
            popClass: 'small',
          },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-121.886329, 37.338208] },
          properties: {
            name: 'San Jose',
            population: 1021795,
            popClass: 'small',
          },
        },
      ],
    }),
  );

  const sizeLegendItems: SizeLegendItem[] = [
    { value: 'large', label: '> 2.5M', size: 20 },
    { value: 'medium', label: '1.5M - 2.5M', size: 14 },
    { value: 'small', label: '< 1.5M', size: 8 },
  ];

  // ============ FETCH DATA ============
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

  // ============ CODE EXAMPLES ============
  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const categoryCodeExample = `${SCRIPT_START}
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
    
    <!-- Category Legend with click-to-filter -->
    <VControlLegend
      :layer-ids="['regions-fill']"
      type="category"
      :items="legendItems"
      property="fill-color"
      title="US Regions"
      :interactive="true"
      @filter-change="handleFilterChange"
    />
  </VMap>
</template>`;

  const gradientCodeExample = `${SCRIPT_START}
  import { VMap, VControlLegend, VLayerMaplibreGeojson } from '@geoql/v-maplibre';
  import type { GradientLegendItem } from '@geoql/v-maplibre';

  const gradientLegend: GradientLegendItem = {
  min: 0,
  max: 500,
  colors: ['#ffffcc', '#a1dab4', '#41b6c4', '#2c7fb8', '#253494'],
  stops: [0, 100, 200, 350, 500],
  minLabel: '0',
  maxLabel: '500+ /mi²',
  };
${SCRIPT_END}

<template>
  <VMap :options="mapOptions">
    <VLayerMaplibreGeojson
      source-id="density"
      layer-id="density-fill"
      :source="{ type: 'geojson', data: statesGeoJson }"
      :layer="{
        id: 'density-fill',
        type: 'fill',
        paint: {
          'fill-color': [
            'interpolate', ['linear'], ['get', 'density'],
            0, '#ffffcc',
            100, '#a1dab4',
            200, '#41b6c4',
            350, '#2c7fb8',
            500, '#253494'
          ],
          'fill-opacity': 0.8
        }
      }"
    />
    
    <!-- Gradient Legend for continuous data -->
    <VControlLegend
      :layer-ids="['density-fill']"
      type="gradient"
      :items="[gradientLegend]"
      title="Population Density"
      :interactive="false"
    />
  </VMap>
</template>`;

  const sizeCodeExample = `${SCRIPT_START}
  import { VMap, VControlLegend, VLayerMaplibreGeojson } from '@geoql/v-maplibre';
  import type { SizeLegendItem } from '@geoql/v-maplibre';

  const sizeLegendItems: SizeLegendItem[] = [
  { value: 'large', label: '> 2.5M', size: 20 },
  { value: 'medium', label: '1.5M - 2.5M', size: 14 },
  { value: 'small', label: '< 1.5M', size: 8 },
  ];
${SCRIPT_END}

<template>
  <VMap :options="mapOptions">
    <VLayerMaplibreGeojson
      source-id="cities"
      layer-id="cities-circles"
      :source="{ type: 'geojson', data: citiesGeoJson }"
      :layer="{
        id: 'cities-circles',
        type: 'circle',
        paint: {
          'circle-radius': [
            'match', ['get', 'popClass'],
            'large', 20,
            'medium', 14,
            'small', 8,
            6
          ],
          'circle-color': '#3b82f6',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2
        }
      }"
    />
    
    <!-- Size Legend for proportional symbols -->
    <VControlLegend
      :layer-ids="['cities-circles']"
      type="size"
      :items="sizeLegendItems"
      title="City Population"
      :interactive="false"
    />
  </VMap>
</template>`;

  const currentCodeExample = computed(() => {
    switch (activeTab.value) {
      case 'gradient':
        return gradientCodeExample;
      case 'size':
        return sizeCodeExample;
      default:
        return categoryCodeExample;
    }
  });

  const _currentFilename = computed(() => {
    switch (activeTab.value) {
      case 'gradient':
        return 'GradientLegend.vue';
      case 'size':
        return 'SizeLegend.vue';
      default:
        return 'CategoryLegend.vue';
    }
  });
</script>

<template>
  <div class="container max-w-screen-2xl overflow-x-hidden py-4">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-4">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="size-3.5" />
          Examples
        </NuxtLink>
        <h1 class="mt-1.5 text-xl font-semibold tracking-tight">
          Interactive Legend
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          VControlLegend supports category, gradient, and size legend types.
          Category legends support click-to-filter functionality.
        </p>
      </div>

      <div class="mb-6 border-b border-border">
        <div class="flex gap-4">
          <button
            :class="getTabClasses('category')"
            @click="setActiveTab('category')"
          >
            Category
            <span
              v-if="isTabActive('category')"
              class="absolute right-0 bottom-0 left-0 h-0.5 bg-foreground"
            ></span>
          </button>
          <button
            :class="getTabClasses('gradient')"
            @click="setActiveTab('gradient')"
          >
            Gradient
            <span
              v-if="isTabActive('gradient')"
              class="absolute right-0 bottom-0 left-0 h-0.5 bg-foreground"
            ></span>
          </button>
          <button :class="getTabClasses('size')" @click="setActiveTab('size')">
            Size
            <span
              v-if="isTabActive('size')"
              class="absolute right-0 bottom-0 left-0 h-0.5 bg-foreground"
            ></span>
          </button>
        </div>
      </div>

      <ComponentDemo :code="currentCodeExample" full-width class="h-125">
        <div class="min-w-0">
          <div class="relative h-125 overflow-hidden">
            <ClientOnly>
              <template v-if="isLoading && !isTabActive('size')">
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

              <!-- CATEGORY LEGEND -->
              <template v-else-if="isTabActive('category') && statesGeoJson">
                <VMap
                  :key="`category-${mapStyle}`"
                  :options="mapOptions"
                  class="size-full"
                  @loaded="handleMapLoad"
                >
                  <VControlNavigation position="top-right" />

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
                    source-id="regions-legend"
                    layer-id="regions-line"
                    :source="{ type: 'geojson', data: statesGeoJson }"
                    :layer="{
                      id: 'regions-line',
                      type: 'line',
                      source: 'regions-legend',
                      paint: {
                        'line-color': '#ffffff',
                        'line-width': 1,
                      },
                    }"
                  />

                  <VControlLegend
                    :layer-ids="['regions-fill']"
                    type="category"
                    :items="categoryLegendItems"
                    property="fill-color"
                    title="US Regions"
                    :interactive="true"
                    position="bottom-left"
                    @filter-change="handleFilterChange"
                  />
                </VMap>
              </template>

              <!-- GRADIENT LEGEND -->
              <template
                v-else-if="isTabActive('gradient') && statesWithDensity"
              >
                <VMap
                  :key="`gradient-${mapStyle}`"
                  :options="mapOptions"
                  class="size-full"
                  @loaded="handleMapLoad"
                >
                  <VControlNavigation position="top-right" />

                  <VLayerMaplibreGeojson
                    source-id="density-legend"
                    layer-id="density-fill"
                    :source="{ type: 'geojson', data: statesWithDensity }"
                    :layer="{
                      id: 'density-fill',
                      type: 'fill',
                      source: 'density-legend',
                      paint: {
                        'fill-color': [
                          'interpolate',
                          ['linear'],
                          ['get', 'density'],
                          0,
                          '#ffffcc',
                          100,
                          '#a1dab4',
                          200,
                          '#41b6c4',
                          350,
                          '#2c7fb8',
                          500,
                          '#253494',
                        ],
                        'fill-opacity': 0.8,
                      },
                    }"
                  />

                  <VLayerMaplibreGeojson
                    source-id="density-legend"
                    layer-id="density-line"
                    :source="{ type: 'geojson', data: statesWithDensity }"
                    :layer="{
                      id: 'density-line',
                      type: 'line',
                      source: 'density-legend',
                      paint: {
                        'line-color': '#ffffff',
                        'line-width': 1,
                      },
                    }"
                  />

                  <VControlLegend
                    :layer-ids="['density-fill']"
                    type="gradient"
                    :items="[gradientLegendItem]"
                    title="Population Density"
                    :interactive="false"
                    position="bottom-left"
                  />
                </VMap>
              </template>

              <!-- SIZE LEGEND -->
              <template v-else-if="isTabActive('size')">
                <VMap
                  :key="`size-${mapStyle}`"
                  :options="mapOptions"
                  class="size-full"
                  @loaded="handleMapLoad"
                >
                  <VControlNavigation position="top-right" />

                  <VLayerMaplibreGeojson
                    source-id="cities-legend"
                    layer-id="cities-circles"
                    :source="{ type: 'geojson', data: citiesGeoJson }"
                    :layer="{
                      id: 'cities-circles',
                      type: 'circle',
                      source: 'cities-legend',
                      paint: {
                        'circle-radius': [
                          'match',
                          ['get', 'popClass'],
                          'large',
                          20,
                          'medium',
                          14,
                          'small',
                          8,
                          6,
                        ],
                        'circle-color': '#3b82f6',
                        'circle-stroke-color': '#ffffff',
                        'circle-stroke-width': 2,
                        'circle-opacity': 0.8,
                      },
                    }"
                  />

                  <VControlLegend
                    :layer-ids="['cities-circles']"
                    type="size"
                    :items="sizeLegendItems"
                    title="City Population"
                    :interactive="false"
                    position="bottom-left"
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

          <div class="mt-4 bg-muted/50 p-4">
            <h3 class="mb-2 font-medium">
              {{
                isTabActive('category')
                  ? 'Category Legend'
                  : isTabActive('gradient')
                    ? 'Gradient Legend'
                    : 'Size Legend'
              }}
            </h3>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <template v-if="isTabActive('category')">
                <li>
                  <strong class="text-foreground">Click to Filter:</strong>
                  Click any legend item to toggle visibility of that category.
                </li>
                <li>
                  <strong class="text-foreground">Visual Feedback:</strong>
                  Hidden items appear faded with strikethrough text.
                </li>
                <li>
                  <strong class="text-foreground">MapLibre Integration:</strong>
                  Automatically applies filters using MapLibre expressions.
                </li>
              </template>
              <template v-else-if="isTabActive('gradient')">
                <li>
                  <strong class="text-foreground">Color Ramp:</strong>
                  Displays continuous color gradients for numeric data.
                </li>
                <li>
                  <strong class="text-foreground">Min/Max Labels:</strong>
                  Custom labels for the value range endpoints.
                </li>
                <li>
                  <strong class="text-foreground">Auto-Generate:</strong>
                  Can parse interpolate/step expressions from paint properties.
                </li>
              </template>
              <template v-else>
                <li>
                  <strong class="text-foreground">Proportional Symbols:</strong>
                  Shows size-based visualization with scaled circles.
                </li>
                <li>
                  <strong class="text-foreground">Size Classes:</strong>
                  Define discrete size classes with labels.
                </li>
                <li>
                  <strong class="text-foreground">Visual Reference:</strong>
                  Circles in legend match the map symbol sizes.
                </li>
              </template>
            </ul>
          </div>
        </div>
      </ComponentDemo>

      <div class="mt-4 rounded-lg border bg-muted/50 p-4">
        <h3 class="mb-2 font-medium">Legend Item Types</h3>
        <div class="space-y-3 text-sm">
          <div>
            <code class="text-primary">CategoryLegendItem</code>
            <p class="mt-1 text-muted-foreground">
              <code>{ value, label, color, visible?, count? }</code>
            </p>
          </div>
          <div>
            <code class="text-primary">GradientLegendItem</code>
            <p class="mt-1 text-muted-foreground">
              <code>{ min, max, colors, stops, minLabel?, maxLabel? }</code>
            </p>
          </div>
          <div>
            <code class="text-primary">SizeLegendItem</code>
            <p class="mt-1 text-muted-foreground">
              <code>{ value, label, size }</code>
            </p>
          </div>
        </div>
      </div>

      <div class="mt-4 rounded-lg border bg-muted/50 p-4">
        <h3 class="mb-2 font-medium">Common Props</h3>
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
            <code class="text-primary">title</code>
            <span class="text-muted-foreground">string</span>
          </div>
          <div class="flex justify-between">
            <code class="text-primary">interactive</code>
            <span class="text-muted-foreground">boolean (category only)</span>
          </div>
          <div class="flex justify-between">
            <code class="text-primary">auto-generate</code>
            <span class="text-muted-foreground">boolean</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
