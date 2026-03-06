<script setup lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import {
    VMap,
    VControlNavigation,
    VControlScale,
    VControlLayer,
    VControlLayerGroup,
    VLayerMaplibreGeojson,
    VLayerDeckglScatterplot,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Layer Control - mapcn-vue Examples',
    description:
      'Toggle layer visibility and opacity with VControlLayer for both MapLibre and deck.gl layers.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Layer Control',
    description:
      'Toggle layer visibility and opacity with VControlLayer for both MapLibre and deck.gl layers.',
    category: 'MapLibre',
  });

  const route = useRoute();
  const router = useRouter();
  const { mapStyle } = useMapStyle();
  const mapId = useId();
  const mapRef = ref<MaplibreMap | null>(null);

  type TabType = 'maplibre' | 'deckgl' | 'group';
  const TAB_TO_QUERY: Record<TabType, string> = {
    maplibre: 'maplibre',
    deckgl: 'deckgl',
    group: 'group',
  };
  const QUERY_TO_TAB: Record<string, TabType> = {
    maplibre: 'maplibre',
    deckgl: 'deckgl',
    group: 'group',
  };

  function getInitialTab(): TabType {
    const tabQuery = route.query.tab as string;
    return QUERY_TO_TAB[tabQuery] || 'maplibre';
  }

  const activeTab = ref<TabType>(getInitialTab());

  function setActiveTab(tab: TabType): void {
    activeTab.value = tab;
    router.replace({ query: { tab: TAB_TO_QUERY[tab] } });
  }

  function isTabActive(tab: TabType): boolean {
    return activeTab.value === tab;
  }

  const TAB_LABELS: Record<TabType, string> = {
    maplibre: 'MapLibre',
    deckgl: 'deck.gl',
    group: 'Group',
  };

  const mapOptions = computed(() => ({
    container: `layer-control-map-${mapId}-${activeTab.value}`,
    style: mapStyle.value,
    center: [-96, 37.8] as [number, number],
    zoom: 3.5,
  }));

  const statesGeoJson = ref<GeoJSON.FeatureCollection | null>(null);
  const isLoading = ref(true);

  const scatterData = [
    { coordinates: [-122.4, 37.8], size: 50000 },
    { coordinates: [-118.2, 34.0], size: 80000 },
    { coordinates: [-73.9, 40.7], size: 100000 },
    { coordinates: [-87.6, 41.8], size: 60000 },
    { coordinates: [-95.3, 29.7], size: 70000 },
    { coordinates: [-112.0, 33.4], size: 45000 },
    { coordinates: [-75.1, 39.9], size: 55000 },
    { coordinates: [-117.1, 32.7], size: 40000 },
    { coordinates: [-97.7, 30.2], size: 50000 },
    { coordinates: [-121.8, 37.3], size: 35000 },
  ];

  const layerGroupConfig = [
    {
      id: 'states-fill-group',
      title: 'US States',
      visible: true,
      opacity: 0.5,
    },
    {
      id: 'states-outline-group',
      title: 'State Borders',
      visible: true,
      opacity: 1,
    },
  ];

  function getPosition(d: { coordinates: number[] }) {
    return d.coordinates as [number, number];
  }

  function getRadius(d: { size: number }) {
    return d.size;
  }

  async function fetchStatesData(): Promise<void> {
    try {
      isLoading.value = true;
      const response = await fetch(
        'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json',
      );
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
      statesGeoJson.value = await response.json();
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

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const maplibreCodeExample = `${SCRIPT_START}
                import { VMap, VControlScale, VControlLayer, VLayerMaplibreGeojson } from '@geoql/v-maplibre';

                const statesGeoJson = ref(null);
                // ... fetch GeoJSON data
              ${SCRIPT_END}

              <template>
                <VMap :options="mapOptions">
                  <VControlScale position="bottom-left" />

                  <!-- Add the GeoJSON layer -->
                  <VLayerMaplibreGeojson
                    source-id="states"
                    layer-id="states-fill"
                    :source="{ type: 'geojson', data: statesGeoJson }"
                    :layer="{
                      id: 'states-fill',
                      type: 'fill',
                      source: 'states',
                      paint: { 'fill-color': '#627BC1', 'fill-opacity': 0.5 }
                    }"
                  />

                  <!-- Layer Control for visibility & opacity -->
                  <VControlLayer
                    layer-id="states-fill"
                    title="US States Layer"
                    position="bottom-right"
                    :visible="true"
                    :opacity="0.5"
                  />
                </VMap>
              </template>`;

  const deckglCodeExample = `${SCRIPT_START}
                import { VMap, VControlScale, VControlLayer, VLayerDeckglScatterplot } from '@geoql/v-maplibre';

                const scatterData = [
                { coordinates: [-122.4, 37.8], size: 50000 },
                { coordinates: [-118.2, 34.0], size: 80000 },
                // ... more points
                ];
              ${SCRIPT_END}

              <template>
                <VMap :options="mapOptions">
                  <VControlScale position="bottom-left" />

                  <!-- deck.gl Scatterplot layer -->
                  <VLayerDeckglScatterplot
                    id="scatter-layer"
                    :data="scatterData"
                    :get-position="(d) => d.coordinates"
                    :get-radius="(d) => d.size"
                    :get-fill-color="[255, 140, 0, 200]"
                    :radius-scale="1"
                    :radius-min-pixels="5"
                    :radius-max-pixels="100"
                  />

                  <!-- Layer Control for deck.gl layer -->
                  <VControlLayer
                    layer-id="scatter-layer"
                    title="Cities Layer"
                    position="bottom-right"
                    :visible="true"
                    :opacity="1"
                  />
                </VMap>
              </template>`;

  const groupCodeExample = `${SCRIPT_START}
                import { VMap, VControlScale, VControlLayerGroup, VLayerMaplibreGeojson } from '@geoql/v-maplibre';

                const statesGeoJson = ref(null);
                // ... fetch GeoJSON data

                const layerGroupConfig = [
                { id: 'states-fill', title: 'US States', visible: true, opacity: 0.5 },
                { id: 'states-outline', title: 'State Borders', visible: true, opacity: 1 },
                ];
              ${SCRIPT_END}

              <template>
                <VMap :options="mapOptions">
                  <VControlScale position="bottom-left" />

                  <!-- Add multiple layers -->
                  <VLayerMaplibreGeojson
                    source-id="states"
                    layer-id="states-fill"
                    :source="{ type: 'geojson', data: statesGeoJson }"
                    :layer="{
                      id: 'states-fill',
                      type: 'fill',
                      source: 'states',
                      paint: { 'fill-color': '#627BC1', 'fill-opacity': 0.5 }
                    }"
                  />
                  <VLayerMaplibreGeojson
                    source-id="states"
                    layer-id="states-outline"
                    :source="{ type: 'geojson', data: statesGeoJson }"
                    :layer="{
                      id: 'states-outline',
                      type: 'line',
                      source: 'states',
                      paint: { 'line-color': '#627BC1', 'line-width': 2 }
                    }"
                  />

                  <!-- Control multiple layers in one panel -->
                  <VControlLayerGroup
                    :layers="layerGroupConfig"
                    title="Map Layers"
                    position="bottom-right"
                    :collapsible="true"
                  />
                </VMap>
              </template>`;
</script>

<template>
  <ComponentDemo
    title="Layer Control"
    description="Toggle layer visibility and adjust opacity with VControlLayer. Works with both MapLibre native layers and deck.gl layers."
    :code="
      isTabActive('maplibre')
        ? maplibreCodeExample
        : isTabActive('deckgl')
          ? deckglCodeExample
          : groupCodeExample
    "
    full-width
    registry="map-layers"
    class="h-full"
  >
    <div class="size-full min-w-0">
      <div class="relative size-full overflow-hidden">
        <!-- Tab switcher pill -->
        <div
          class="absolute left-3 top-3 z-10 flex gap-1 rounded-lg border border-border/50 bg-background/80 p-1 backdrop-blur-sm"
        >
          <button
            v-for="tab in ['maplibre', 'deckgl', 'group'] as const"
            :key="tab"
            class="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
            :class="
              isTabActive(tab)
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="setActiveTab(tab)"
          >
            {{ TAB_LABELS[tab] }}
          </button>
        </div>
        <ClientOnly>
          <template
            v-if="
              isLoading && (isTabActive('maplibre') || isTabActive('group'))
            "
          >
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

          <template v-else-if="isTabActive('maplibre') && statesGeoJson">
            <VMap
              :key="`maplibre-${mapStyle}`"
              :options="mapOptions"
              class="size-full"
              @loaded="handleMapLoad"
            >
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />

              <VLayerMaplibreGeojson
                source-id="states-layer-control"
                layer-id="states-fill"
                :source="{ type: 'geojson', data: statesGeoJson }"
                :layer="{
                  id: 'states-fill',
                  type: 'fill',
                  source: 'states-layer-control',
                  paint: {
                    'fill-color': '#627BC1',
                    'fill-opacity': 0.5,
                  },
                }"
              />

              <VControlLayer
                layer-id="states-fill"
                title="US States Layer"
                position="bottom-right"
                :visible="true"
                :opacity="0.5"
              />
            </VMap>
          </template>

          <template v-else-if="isTabActive('deckgl')">
            <VMap
              :key="`deckgl-${mapStyle}`"
              :options="mapOptions"
              class="size-full"
              @loaded="handleMapLoad"
            >
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />

              <VLayerDeckglScatterplot
                id="scatter-layer"
                :data="scatterData"
                :get-position="getPosition"
                :get-radius="getRadius"
                :get-fill-color="[255, 140, 0, 200]"
                :radius-scale="1"
                :radius-min-pixels="5"
                :radius-max-pixels="100"
              />

              <VControlLayer
                layer-id="scatter-layer"
                title="Cities Layer"
                position="bottom-right"
                :visible="true"
                :opacity="1"
              />
            </VMap>
          </template>

          <template v-else-if="isTabActive('group') && statesGeoJson">
            <VMap
              :key="`group-${mapStyle}`"
              :options="mapOptions"
              class="size-full"
              @loaded="handleMapLoad"
            >
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />

              <VLayerMaplibreGeojson
                source-id="states-layer-group"
                layer-id="states-fill-group"
                :source="{ type: 'geojson', data: statesGeoJson }"
                :layer="{
                  id: 'states-fill-group',
                  type: 'fill',
                  source: 'states-layer-group',
                  paint: {
                    'fill-color': '#627BC1',
                    'fill-opacity': 0.5,
                  },
                }"
              />

              <VLayerMaplibreGeojson
                source-id="states-layer-group"
                layer-id="states-outline-group"
                :source="{ type: 'geojson', data: statesGeoJson }"
                :layer="{
                  id: 'states-outline-group',
                  type: 'line',
                  source: 'states-layer-group',
                  paint: {
                    'line-color': '#627BC1',
                    'line-width': 2,
                  },
                }"
              />

              <VControlLayerGroup
                :layers="layerGroupConfig"
                title="Map Layers"
                position="bottom-right"
                :collapsible="true"
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
            isTabActive('group')
              ? 'VControlLayerGroup Features'
              : 'VControlLayer Features'
          }}
        </h3>
        <ul
          v-if="!isTabActive('group')"
          class="space-y-2 text-sm text-muted-foreground"
        >
          <li>
            <strong class="text-foreground">Visibility Toggle:</strong>
            Click the button to show/hide the layer instantly.
          </li>
          <li>
            <strong class="text-foreground">Opacity Slider:</strong>
            Drag the slider to adjust layer transparency (0-100%).
          </li>
          <li>
            <strong class="text-foreground">Auto-Detection:</strong>
            Automatically detects if layer is MapLibre or deck.gl.
          </li>
          <li>
            <strong class="text-foreground">v-model Support:</strong>
            Use <code>v-model:visible</code> and
            <code>v-model:opacity</code> for two-way binding.
          </li>
        </ul>
        <ul v-else class="space-y-2 text-sm text-muted-foreground">
          <li>
            <strong class="text-foreground">Multiple Layers:</strong>
            Control multiple layers in a single collapsible panel.
          </li>
          <li>
            <strong class="text-foreground">Collapsible Panel:</strong>
            Click the header to expand/collapse the layer list.
          </li>
          <li>
            <strong class="text-foreground">Per-Layer Controls:</strong>
            Each layer has its own visibility toggle and opacity slider.
          </li>
          <li>
            <strong class="text-foreground">Mixed Layer Types:</strong>
            Supports both MapLibre and deck.gl layers in the same group.
          </li>
        </ul>
      </div>
    </div>
  </ComponentDemo>
</template>
