<script setup lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import type { PickingInfo } from '@deck.gl/core';
  import {
    VMap,
    VControlNavigation,
    VControlLegend,
    VLayerMaplibreGeojson,
    VLayerDeckglGeojson,
  } from '@geoql/v-maplibre';
  import type { TableLegendItem } from '@geoql/v-maplibre';
  import type {
    Feature,
    FeatureCollection,
    MultiPolygon,
    Polygon,
  } from 'geojson';
  import type { ChoroplethTabType, ColorThreshold } from '~/types/choropleth';
  import { TAB_TO_QUERY, QUERY_TO_TAB } from '~/types/choropleth';

  useSeoMeta({
    title: 'Choropleth Map - mapcn-vue Examples',
    description:
      'Color-coded region map showing data values by geographic area. Compare MapLibre GL and deck.gl implementations.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Choropleth Map',
    description:
      'Color-coded region map showing data values by geographic area. Compare MapLibre GL and deck.gl implementations.',
    category: 'Examples',
  });

  const route = useRoute();
  const router = useRouter();
  const { mapStyle, colorMode } = useMapStyle();
  const mapId = useId();
  const mapRef = ref<MaplibreMap | null>(null);

  function getInitialTab(): ChoroplethTabType {
    const tabQuery = route.query.tab as string;
    return QUERY_TO_TAB[tabQuery] || 'maplibre';
  }

  const activeTab = ref<ChoroplethTabType>(getInitialTab());

  function setActiveTab(tab: ChoroplethTabType): void {
    activeTab.value = tab;
    router.replace({ query: { tab: TAB_TO_QUERY[tab] } });
  }

  function isTabActive(tab: ChoroplethTabType): boolean {
    return activeTab.value === tab;
  }

  const mapOptions = computed(() => ({
    container: `choropleth-map-${mapId}-${activeTab.value}`,
    style: mapStyle.value,
    center: [-96, 37.8] as [number, number],
    zoom: 3.5,
  }));

  interface StateFeatureProperties {
    name: string;
    rate: number;
    fillColor?: string;
  }

  type StateFeature = Feature<Polygon | MultiPolygon, StateFeatureProperties>;

  const statesGeoJson = ref<FeatureCollection<
    Polygon | MultiPolygon,
    StateFeatureProperties
  > | null>(null);
  const isLoading = ref(true);
  const error = ref<string | null>(null);

  const unemploymentByState: Record<string, number> = {
    Alabama: 2.8,
    Alaska: 5.3,
    Arizona: 3.7,
    Arkansas: 3.5,
    California: 5.3,
    Colorado: 3.4,
    Connecticut: 4.2,
    Delaware: 4.4,
    Florida: 3.3,
    Georgia: 3.4,
    Hawaii: 3.0,
    Idaho: 3.1,
    Illinois: 4.8,
    Indiana: 3.4,
    Iowa: 2.9,
    Kansas: 2.9,
    Kentucky: 4.3,
    Louisiana: 4.0,
    Maine: 3.0,
    Maryland: 2.9,
    Massachusetts: 3.5,
    Michigan: 4.1,
    Minnesota: 3.0,
    Mississippi: 4.0,
    Missouri: 3.5,
    Montana: 2.8,
    Nebraska: 2.6,
    Nevada: 5.5,
    'New Hampshire': 2.6,
    'New Jersey': 4.8,
    'New Mexico': 4.1,
    'New York': 4.5,
    'North Carolina': 3.6,
    'North Dakota': 2.1,
    Ohio: 4.0,
    Oklahoma: 3.3,
    Oregon: 4.2,
    Pennsylvania: 4.0,
    'Rhode Island': 3.9,
    'South Carolina': 3.3,
    'South Dakota': 2.0,
    Tennessee: 3.5,
    Texas: 4.1,
    Utah: 2.9,
    Vermont: 2.3,
    Virginia: 3.0,
    Washington: 4.8,
    'West Virginia': 4.0,
    Wisconsin: 2.9,
    Wyoming: 3.5,
    'District of Columbia': 5.0,
    'Puerto Rico': 6.0,
  };

  const colorScale: ColorThreshold[] = [
    { threshold: 0, color: '#f7fbff' },
    { threshold: 2, color: '#deebf7' },
    { threshold: 3, color: '#c6dbef' },
    { threshold: 4, color: '#9ecae1' },
    { threshold: 5, color: '#6baed6' },
    { threshold: 6, color: '#4292c6' },
    { threshold: 7, color: '#2171b5' },
    { threshold: 8, color: '#084594' },
  ];

  function getColorForRate(rate: number): string {
    for (let i = colorScale.length - 1; i >= 0; i--) {
      if (rate >= colorScale[i].threshold) {
        return colorScale[i].color;
      }
    }
    return colorScale[0].color;
  }

  function hexToRgba(hex: string, alpha = 200): [number, number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return [
        Number.parseInt(result[1], 16),
        Number.parseInt(result[2], 16),
        Number.parseInt(result[3], 16),
        alpha,
      ];
    }
    return [247, 251, 255, alpha];
  }

  async function fetchStatesData(): Promise<void> {
    try {
      isLoading.value = true;
      const response = await fetch(
        'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json',
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const data = (await response.json()) as FeatureCollection<
        Polygon | MultiPolygon
      >;

      statesGeoJson.value = {
        type: 'FeatureCollection',
        features: data.features.map((feature) => {
          const stateName = feature.properties?.name as string;
          const rate = unemploymentByState[stateName] ?? 0;
          return {
            ...feature,
            properties: {
              name: stateName,
              rate,
              fillColor: getColorForRate(rate),
            },
          };
        }) as StateFeature[],
      };
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load data';
    } finally {
      isLoading.value = false;
    }
  }

  onMounted(() => {
    fetchStatesData();
  });

  const hoveredState = ref<StateFeatureProperties | null>(null);

  function handleMapLoad(map: MaplibreMap): void {
    mapRef.value = map;
  }

  function handleDeckHover(info: PickingInfo): void {
    if (info.object) {
      hoveredState.value = info.object.properties as StateFeatureProperties;
    } else {
      hoveredState.value = null;
    }
  }

  function getDeckFillColor(
    feature: GeoJSON.Feature,
  ): [number, number, number, number] {
    const props = feature.properties as StateFeatureProperties;
    const color = getColorForRate(props.rate);
    const isHovered = hoveredState.value?.name === props.name;
    return hexToRgba(color, isHovered ? 255 : 200);
  }

  // Table legend items — state names with unemployment rates
  const tableLegendItems = computed<TableLegendItem[]>(() =>
    Object.entries(unemploymentByState).map(([state, rate]) => ({
      label: state,
      value: rate,
      formattedValue: `${rate.toFixed(1)}%`,
      color: getColorForRate(rate),
    })),
  );

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const maplibreCodeExample = `${SCRIPT_START}
                import { VMap, VControlLegend, VLayerMaplibreGeojson } from '@geoql/v-maplibre';

                const statesGeoJson = ref(null);

                // Unemployment rates by state (2024 data)
                const unemploymentByState = {
                'California': 5.3,
                'Texas': 4.1,
                'New York': 4.5,
                // ... more states
                };

                // Blues color scale for choropleth
                const colorScale = [
                { threshold: 0, color: '#f7fbff' },
                { threshold: 2, color: '#deebf7' },
                { threshold: 4, color: '#9ecae1' },
                { threshold: 6, color: '#4292c6' },
                { threshold: 8, color: '#084594' },
                ];

                const legendItems = colorScale.map(item => ({
                value: item.threshold,
                label: item.threshold + '%+',
                color: item.color,
                }));

                function getColorForRate(rate) {
                for (let i = colorScale.length - 1; i >= 0; i--) {
                  if (rate >= colorScale[i].threshold) return colorScale[i].color;
                }
                return colorScale[0].color;
                }

                // Fetch real US states GeoJSON and merge with data
                async function fetchStatesData() {
                const response = await fetch(
                  'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json'
                );
                const data = await response.json();

                statesGeoJson.value = {
                  type: 'FeatureCollection',
                  features: data.features.map(feature => ({
                    ...feature,
                    properties: {
                      ...feature.properties,
                      rate: unemploymentByState[feature.properties.name] ?? 0,
                      fillColor: getColorForRate(unemploymentByState[feature.properties.name] ?? 0)
                    }
                  }))
                };
                }
              ${SCRIPT_END}

              <template>
                <VMap :options="mapOptions">
                  <VLayerMaplibreGeojson
                    source-id="states"
                    layer-id="states-fill"
                    :source="{ type: 'geojson', data: statesGeoJson }"
                    :layer="{
                      id: 'states-fill',
                      type: 'fill',
                      source: 'states',
                      paint: { 'fill-color': ['get', 'fillColor'], 'fill-opacity': 0.8 }
                    }"
                  />
                  <VControlLegend
                    :layer-ids="['states-fill']"
                    type="category"
                    :items="legendItems"
                    title="Unemployment Rate (%)"
                    position="bottom-left"
                  />
                </VMap>
              </template>`;

  const deckglCodeExample = `${SCRIPT_START}
                import { VMap, VControlLegend, VLayerDeckglGeojson } from '@geoql/v-maplibre';

                const statesGeoJson = ref(null);
                const hoveredState = ref(null);

                const colorScale = [
                { threshold: 0, color: '#f7fbff' },
                { threshold: 2, color: '#deebf7' },
                { threshold: 4, color: '#9ecae1' },
                { threshold: 6, color: '#4292c6' },
                { threshold: 8, color: '#084594' },
                ];

                const legendItems = colorScale.map(item => ({
                value: item.threshold,
                label: item.threshold + '%+',
                color: item.color,
                }));

                function hexToRgba(hex, alpha = 200) {
                const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
                return result ? [
                  parseInt(result[1], 16),
                  parseInt(result[2], 16),
                  parseInt(result[3], 16),
                  alpha,
                ] : [247, 251, 255, alpha];
                }

                function getFillColor(feature) {
                const rate = feature.properties.rate;
                const color = getColorForRate(rate);
                const isHovered = hoveredState.value?.name === feature.properties.name;
                return hexToRgba(color, isHovered ? 255 : 200);
                }

                function handleHover(info) {
                hoveredState.value = info.object?.properties ?? null;
                }
              ${SCRIPT_END}

              <template>
                <VMap :options="mapOptions">
                  <VLayerDeckglGeojson
                    id="states-choropleth"
                    :data="statesGeoJson"
                    :get-fill-color="getFillColor"
                    :get-line-color="[100, 100, 100, 255]"
                    :line-width-min-pixels="1"
                    :filled="true"
                    :stroked="true"
                    :pickable="true"
                    :auto-highlight="true"
                    :highlight-color="[255, 200, 0, 128]"
                    @hover="handleHover"
                  />
                  <VControlLegend
                    :layer-ids="['states-choropleth']"
                    type="category"
                    :items="legendItems"
                    title="Unemployment Rate (%)"
                    position="bottom-left"
                  />
                </VMap>
              </template>`;
</script>

<template>
  <ComponentDemo
    title="Choropleth Map"
    description="US unemployment rates by state. Compare MapLibre GL native and deck.gl implementations using real GeoJSON data."
    :code="isTabActive('maplibre') ? maplibreCodeExample : deckglCodeExample"
    full-width
    registry="map-layers"
    class="h-full"
  >
    <div class="relative size-full min-w-0">
      <!-- Tab switcher pill -->
      <div
        class="absolute left-3 top-3 z-10 flex gap-1 rounded-lg border border-border/50 bg-background/80 p-1 backdrop-blur-sm"
      >
        <button
          v-for="tab in ['maplibre', 'deckgl'] as const"
          :key="tab"
          class="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          :class="
            isTabActive(tab)
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          "
          @click="setActiveTab(tab)"
        >
          {{ tab === 'maplibre' ? 'MapLibre GL' : 'deck.gl' }}
        </button>
      </div>
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

        <template v-else-if="error">
          <div class="flex h-full items-center justify-center bg-muted">
            <div class="text-center">
              <Icon
                name="lucide:alert-circle"
                class="mx-auto size-8 text-destructive"
              />
              <p class="mt-2 text-sm text-destructive">
                {{ error }}
              </p>
            </div>
          </div>
        </template>

        <template v-else-if="statesGeoJson">
          <VMap
            v-if="isTabActive('maplibre')"
            :key="`maplibre-${mapStyle}`"
            :options="mapOptions"
            class="size-full"
            @loaded="handleMapLoad"
          >
            <VControlNavigation position="top-right" />

            <VLayerMaplibreGeojson
              source-id="states-choropleth"
              layer-id="states-fill"
              :source="{ type: 'geojson', data: statesGeoJson }"
              :layer="{
                id: 'states-fill',
                type: 'fill',
                source: 'states-choropleth',
                paint: {
                  'fill-color': ['get', 'fillColor'],
                  'fill-opacity': 0.8,
                },
              }"
            />

            <VLayerMaplibreGeojson
              source-id="states-choropleth-line"
              layer-id="states-line"
              :source="{ type: 'geojson', data: statesGeoJson }"
              :layer="{
                id: 'states-line',
                type: 'line',
                source: 'states-choropleth-line',
                paint: {
                  'line-color': colorMode === 'dark' ? '#6b7280' : '#374151',
                  'line-width': 0.5,
                },
              }"
            />

            <VControlLegend
              :layer-ids="['states-fill']"
              type="table"
              :items="tableLegendItems"
              title="Unemployment Rate (%)"
              position="bottom-left"
              :interactive="false"
            />
          </VMap>

          <VMap
            v-else
            :key="`deckgl-${mapStyle}`"
            :options="mapOptions"
            class="size-full"
            @loaded="handleMapLoad"
          >
            <VControlNavigation position="top-right" />

            <VLayerDeckglGeojson
              id="states-choropleth-deck"
              :data="statesGeoJson"
              :get-fill-color="getDeckFillColor"
              :get-line-color="
                colorMode === 'dark' ? [107, 114, 128, 255] : [55, 65, 81, 255]
              "
              :get-line-width="1"
              :line-width-min-pixels="0.5"
              :filled="true"
              :stroked="true"
              :pickable="true"
              :auto-highlight="true"
              :highlight-color="[255, 200, 0, 128]"
              @hover="handleDeckHover"
            />

            <VControlLegend
              :layer-ids="['states-choropleth-deck']"
              type="table"
              :items="tableLegendItems"
              title="Unemployment Rate (%)"
              position="bottom-left"
              :interactive="false"
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

      <div
        v-if="hoveredState && isTabActive('deckgl')"
        class="absolute top-4 right-4 z-10 rounded-lg border bg-background/95 px-3 py-2 shadow-lg backdrop-blur-sm"
      >
        <p class="text-sm font-medium">
          {{ hoveredState.name }}
        </p>
        <p class="text-xs text-muted-foreground">
          Unemployment: {{ hoveredState.rate.toFixed(1) }}%
        </p>
      </div>
    </div>
  </ComponentDemo>
</template>
