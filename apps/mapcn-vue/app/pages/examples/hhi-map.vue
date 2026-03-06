<script setup lang="ts">
  import {
    VMap,
    VControlNavigation,
    VControlLegend,
    VPopup,
  } from '@geoql/v-maplibre';
  import type { GradientLegendItem } from '@geoql/v-maplibre';
  import type { Map, LngLatLike } from 'maplibre-gl';
  import { motion, AnimatePresence } from 'motion-v';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '~/components/ui/select';
  import { Slider } from '~/components/ui/slider';
  import type { HhiConfig } from '~/types/hhi';

  // SEO & OG Image
  useSeoMeta({
    title: 'HHI Map - mapcn-vue Examples',
    description:
      'US Vehicle Market Concentration (Herfindahl-Hirschman Index) interactive census tract map with dynamic filtering by group, level, and year.',
  });

  defineOgImage('MapcnDoc', {
    title: 'HHI Map',
    description:
      'US Vehicle Market Concentration (HHI) Map - Interactive census tract viewer.',
    category: 'Examples',
  });

  // Use mapsGuru styles via useMapStyle composable
  const { mapStyle } = useMapStyle();

  const mapId = useId();
  const mapInstance = shallowRef<Map | null>(null);
  const panelOpen = ref(true);

  // Hover popup state
  const popupVisible = ref(false);
  const popupLngLat = ref<LngLatLike>([0, 0]);
  const hoveredHhi = ref<number | null>(null);

  // Map options - center on US with initial zoom
  const mapOptions = computed(() => ({
    container: `hhi-map-${mapId}`,
    style: mapStyle.value,
    center: [-98.5, 39.8] as [number, number],
    zoom: 3.5,
  }));

  // PMTiles URL from original HHI Map example
  const pmtilesUrl =
    'https://pub-17d608be304c4976845ab692fc09de91.r2.dev/hhi_tracts.pmtiles';

  // HHI config data (from original example)
  const hhiConfig = computed<HhiConfig>(() => ({
    groupVars: [
      {
        label: 'Powertrain',
        code: 'pt',
        levels: [
          { label: 'Gasoline', code: 'cv' },
          { label: 'Flex Fuel (E85)', code: 'flex' },
          { label: 'Hybrid Electric (HEV)', code: 'hev' },
          { label: 'Plug-In Hybrid Electric (PHEV)', code: 'phev' },
          { label: 'Battery Electric (BEV)', code: 'bev' },
          { label: 'Diesel', code: 'dsl' },
          { label: 'Fuel Cell', code: 'fcev' },
        ],
      },
      {
        label: 'Vehicle Type',
        code: 'vt',
        levels: [
          { label: 'Car', code: 'car' },
          { label: 'CUV', code: 'cuv' },
          { label: 'SUV', code: 'suv' },
          { label: 'Pickup', code: 'pup' },
          { label: 'Minivan', code: 'van' },
        ],
        excludeHhi: 'vt',
      },
      {
        label: 'Price Bin',
        code: 'pb',
        levels: [
          { label: '$0-$10k', code: 'p0' },
          { label: '$10k-$20k', code: 'p10' },
          { label: '$20k-$30k', code: 'p20' },
          { label: '$30k-$40k', code: 'p30' },
          { label: '$40k-$50k', code: 'p40' },
          { label: '$50k-$60k', code: 'p50' },
          { label: '$60k-$70k', code: 'p60' },
          { label: '$70k+', code: 'p70' },
        ],
      },
    ],
    hhiVars: [
      { label: 'Make', code: 'mk' },
      { label: 'Vehicle Type', code: 'vt' },
      { label: 'Price Bin', code: 'pb' },
    ],
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
  }));

  // Legend gradient items matching the fill-color interpolation
  const legendItems: GradientLegendItem[] = [
    {
      min: 0,
      max: 1.0,
      minLabel: 'Low (0)',
      maxLabel: 'High (1.0)',
      colors: ['#2166ac', '#67a9cf', '#fddbc7', '#f46d43', '#d73027', '#a50026'],
    },
  ];

  // Selected values
  const selectedGroup = ref(hhiConfig.value.groupVars[0].code);
  const selectedLevel = ref(hhiConfig.value.groupVars[0].levels[0].code);
  const selectedHhi = ref(hhiConfig.value.hhiVars[0].code);
  // Slider expects an array
  const selectedYear = ref([
    hhiConfig.value.years[hhiConfig.value.years.length - 1],
  ]);

  // Computed current levels based on selected group
  const currentLevels = computed(() => {
    const group = hhiConfig.value.groupVars.find(
      (g) => g.code === selectedGroup.value,
    );
    return group?.levels || [];
  });

  // Computed current HHI vars (exclude self-referential)
  const currentHhiVars = computed(() => {
    const group = hhiConfig.value.groupVars.find(
      (g) => g.code === selectedGroup.value,
    );
    return hhiConfig.value.hhiVars.filter(
      (h) => !group?.excludeHhi || h.code !== group.excludeHhi,
    );
  });

  // Column name for the data
  const columnName = computed(
    () =>
      `${selectedGroup.value}_${selectedLevel.value}_${selectedHhi.value}_${selectedYear.value[0]}`,
  );

  // Shared fill-color expression (avoids duplication between addLayer and setPaintProperty)
  const buildFillColor = (col: string) => [
    'case',
    ['has', col],
    [
      'interpolate',
      ['linear'],
      ['get', col],
      0,
      '#2166ac',
      0.1,
      '#67a9cf',
      0.15,
      '#fddbc7',
      0.25,
      '#f46d43',
      0.5,
      '#d73027',
      1.0,
      '#a50026',
    ],
    '#e0e0e0',
  ];

  const onMapLoad = (map: Map) => {
    // Prevent double initialization
    if (mapInstance.value) return;
    mapInstance.value = map;

    // Add PMTiles vector source
    map.addSource('hhi-tracts', {
      type: 'vector',
      url: `pmtiles://${pmtilesUrl}`,
    });

    // Add fill layer
    map.addLayer({
      id: 'hhi-fill',
      type: 'fill',
      source: 'hhi-tracts',
      'source-layer': 'tracts',
      paint: {
        'fill-color': buildFillColor(
          columnName.value,
        ) as maplibregl.ExpressionSpecification,
        'fill-opacity': 0.7,
      },
    });

    // Hover: show popup with HHI value
    map.on('mousemove', 'hhi-fill', (e) => {
      if (!e.features || e.features.length === 0) return;
      const raw = e.features[0].properties?.[columnName.value];
      const value =
        typeof raw === 'number' ? raw : Number.parseFloat(String(raw));
      if (!Number.isNaN(value)) {
        popupLngLat.value = [e.lngLat.lng, e.lngLat.lat];
        hoveredHhi.value = value;
        popupVisible.value = true;
      }
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'hhi-fill', () => {
      popupVisible.value = false;
      hoveredHhi.value = null;
      map.getCanvas().style.cursor = '';
    });
  };

  // Update layer paint when selection changes
  watch(
    [selectedGroup, selectedLevel, selectedHhi, () => selectedYear.value[0]],
    () => {
      if (mapInstance.value && mapInstance.value.getLayer('hhi-fill')) {
        mapInstance.value.setPaintProperty(
          'hhi-fill',
          'fill-color',
          buildFillColor(columnName.value),
        );
      }
    },
  );

  // Reset level when group changes
  watch(selectedGroup, () => {
    const levels = currentLevels.value;
    if (levels.length > 0) {
      selectedLevel.value = levels[0].code;
    }
    // Reset HHI to first available
    const hhiVars = currentHhiVars.value;
    if (hhiVars.length > 0) {
      selectedHhi.value = hhiVars[0].code;
    }
  });

  function togglePanel() {
    panelOpen.value = !panelOpen.value;
  }

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                import { VMap, VControlNavigation } from '@geoql/v-maplibre';

                const mapOptions = {
                  style: 'https://maps.guru/api/v1/styles/standard/light/style.json?key=...',
                  center: [-98.5, 39.8],
                  zoom: 3.5,
                };
                ${SCRIPT_END}

                <template>
                  <VMap :options="mapOptions">
                    <VControlNavigation position="top-right" />
                  </VMap>
                </template>`;
</script>

<template>
  <ComponentDemo
    title="HHI Map"
    description="US Vehicle Market Concentration (Herfindahl-Hirschman Index) - Interactive census tract map viewer with dynamic filtering."
    :code="codeExample"
    registry="map-layers"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ClientOnly>
        <VMap
          :key="mapStyle"
          :options="mapOptions"
          :support-pmtiles="true"
          class="size-full"
          @loaded="onMapLoad"
        >
          <VControlNavigation position="top-right" />
          <VControlLegend
            :layer-ids="['hhi-fill']"
            type="gradient"
            title="Market Concentration"
            position="bottom-left"
            :items="legendItems"
            :interactive="false"
          />
          <VPopup
            v-if="popupVisible && hoveredHhi !== null"
            :coordinates="popupLngLat"
            :options="{
              closeButton: false,
              closeOnClick: false,
              offset: 12,
              className: 'hhi-hover-popup',
            }"
          >
            <span class="hhi-popup-label"
              >HHI: {{ hoveredHhi.toFixed(3) }}</span
            >
          </VPopup>
        </VMap>
        <template #fallback>
          <div class="size-full animate-pulse bg-muted"></div>
        </template>
      </ClientOnly>

      <!-- Toggle button - always visible -->
      <button
        class="absolute top-4 left-4 z-10 flex size-9 items-center justify-center rounded-lg bg-background/95 shadow-lg backdrop-blur-sm transition-colors hover:bg-accent"
        :class="{
          'bg-primary text-primary-foreground hover:bg-primary/90': !panelOpen,
        }"
        @click="togglePanel"
      >
        <Icon
          :name="
            panelOpen ? 'lucide:panel-left-close' : 'lucide:panel-left-open'
          "
          class="size-4"
        />
      </button>

      <!-- Collapsible panel with motion-v -->
      <AnimatePresence>
        <motion.div
          v-if="panelOpen"
          :initial="{ opacity: 0, x: -20, scale: 0.95 }"
          :animate="{ opacity: 1, x: 0, scale: 1 }"
          :exit="{ opacity: 0, x: -20, scale: 0.95 }"
          :transition="{ type: 'spring', stiffness: 300, damping: 25 }"
          class="absolute top-16 left-4 z-10 w-64 rounded-lg bg-background/95 p-4 shadow-lg backdrop-blur-sm"
        >
          <h3 class="mb-3 text-sm font-semibold">Market Concentration (HHI)</h3>

          <!-- Group selector -->
          <div class="mb-3">
            <label class="mb-1.5 block text-xs font-medium">Group</label>
            <Select v-model="selectedGroup">
              <SelectTrigger class="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="group in hhiConfig.groupVars"
                  :key="group.code"
                  :value="group.code"
                >
                  {{ group.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Level selector -->
          <div class="mb-3">
            <label class="mb-1.5 block text-xs font-medium">Level</label>
            <Select v-model="selectedLevel">
              <SelectTrigger class="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="level in currentLevels"
                  :key="level.code"
                  :value="level.code"
                >
                  {{ level.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- HHI dimension selector -->
          <div class="mb-3">
            <label class="mb-1.5 block text-xs font-medium"
              >HHI Dimension</label
            >
            <Select v-model="selectedHhi">
              <SelectTrigger class="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="hhi in currentHhiVars"
                  :key="hhi.code"
                  :value="hhi.code"
                >
                  {{ hhi.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Year slider -->
          <div class="mb-3">
            <label class="mb-1.5 block text-xs font-medium"
              >Year: {{ selectedYear[0] }}</label
            >
            <Slider
              v-model="selectedYear"
              :min="hhiConfig.years[0]"
              :max="hhiConfig.years[hhiConfig.years.length - 1]"
              :step="1"
            />
          </div>

          <!-- Current column display -->
          <div class="border-t pt-3 text-xs text-muted-foreground">
            Showing: {{ columnName }}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  </ComponentDemo>
</template>

<style>
  .hhi-hover-popup .maplibregl-popup-content {
    background: #1a1a1a;
    color: #ffffff;
    border-radius: 6px;
    padding: 6px 12px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 0.4);
  }

  .hhi-hover-popup.maplibregl-popup-anchor-bottom .maplibregl-popup-tip {
    border-top-color: #1a1a1a;
  }

  .hhi-hover-popup.maplibregl-popup-anchor-top .maplibregl-popup-tip {
    border-bottom-color: #1a1a1a;
  }

  .hhi-hover-popup.maplibregl-popup-anchor-left .maplibregl-popup-tip {
    border-right-color: #1a1a1a;
  }

  .hhi-hover-popup.maplibregl-popup-anchor-right .maplibregl-popup-tip {
    border-left-color: #1a1a1a;
  }

  .hhi-popup-label {
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
  }
</style>
