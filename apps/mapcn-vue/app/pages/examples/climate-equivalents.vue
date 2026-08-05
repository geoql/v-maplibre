<script setup lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import type { HoverState } from '~/types/climate';
  import { useMapStyle } from '~/composables/use-map-style';

  usePageGeo({
    title: 'Climate Equivalents - mapcn-vue Examples',
    description:
      'Click a country to see it split into Köppen-Geiger climate zones, each labeled with another country that shares that same climate.',
    dateModified: '2026-06-06',
  });

  defineOgImage('MapcnDoc', {
    title: 'Climate Equivalents',
    description:
      'Click a country to see its climate zones matched to other countries worldwide.',
    category: 'Examples',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();
  const isMobile = useMediaQuery('(pointer: coarse)');
  const isSmallScreen = useMediaQuery('(max-width: 719px)');

  const mapOptions = computed(() => ({
    container: `climate-equivalents-${mapId}`,
    style: mapStyle.value,
    center: [10, 25] as [number, number],
    zoom: 1.4,
  }));

  const {
    isLoading,
    error,
    zones,
    selectedCountry,
    hasEverSelected,
    countryOptions,
    fillColorExpression,
    fillOpacityExpression,
    layerOpacity,
    regionLabels,
    treemapCells,
    treemapContainerW,
    treemapContainerH,
    hoverState,
    hoverPopupHtml,
    hoverPopupLngLat,
    detailView,
    sheetOpen,
    sheetHtml,
    methodologyOpen,
    loadData,
    attachMap,
    detachMap,
    selectCountry,
    clearSelection,
    randomCountry,
    shuffleOne,
    shuffleAll,
    updateTreemap,
    openDetail,
    closeDetail,
    setHoverState,
    closeSheet: closeSheetComposable,
    openSheet,
    openMethodology,
    closeMethodology,
    getCountryOutline,
    getDetailContext,
    METHODOLOGY_HTML,
  } = useClimateEquivalents();

  const HOVER_DELAY_MS = 200;
  let hoverTimer: ReturnType<typeof setTimeout> | null = null;

  function handleMapMouseMove(
    iso: string,
    klass: number,
    lngLat: { lng: number; lat: number },
  ): void {
    if (isMobile.value) return;
    if (!hasEverSelected.value) return;

    if (hoverTimer) clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
      hoverTimer = null;
      setHoverState({ iso, klass, lngLat });
    }, HOVER_DELAY_MS);
  }

  function handleMapMouseLeave(): void {
    if (isMobile.value) return;
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }
    setHoverState(null);
  }

  function handleMapClick(
    iso: string,
    klass: number,
    lngLat: { lng: number; lat: number },
  ): void {
    const sel = selectedCountry.value;
    if (sel && iso === sel.iso) {
      setHoverState({ iso, klass, lngLat });
      openDetail(klass);
      return;
    }
    selectCountry(iso);
  }

  function handleLabelClick(klass: number): void {
    openDetail(klass);
  }

  function handleLabelShuffle(klass: number): void {
    shuffleOne(klass);
  }

  function handleMapLoad(map: MaplibreMap): void {
    attachMap(map);
  }

  function handleMapUnload(): void {
    detachMap();
  }

  const countryOutlineSource = computed(() => {
    if (!selectedCountry.value) return null;
    return getCountryOutline(selectedCountry.value.iso);
  });

  const detailContext = computed(() => getDetailContext());

  const opacityModel = computed<number[]>({
    get: () => [Math.round(layerOpacity.value * 100)],
    set: (v) => {
      layerOpacity.value = (v[0] ?? 80) / 100;
    },
  });

  const opacityPct = computed(() => Math.round(layerOpacity.value * 100));

  function handleMethodologyClick(): void {
    if (isSmallScreen.value) {
      openSheet(METHODOLOGY_HTML);
    } else {
      if (methodologyOpen.value) {
        closeMethodology();
      } else {
        openMethodology();
      }
    }
  }

  onMounted(() => {
    // Fit treemap to the w-80 (320px) panel minus its p-4 padding.
    treemapContainerW.value = 272;
    treemapContainerH.value = 200;
    loadData();
    updateTreemap();
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import {
  VMap,
  VControlNavigation,
  VControlScale,
  VLayerMaplibreGeojson,
  VMarker,
} from '@geoql/v-maplibre';

const { mapStyle } = useMapStyle();

const mapOptions = computed(() => ({
  style: mapStyle.value,
  center: [10, 25],
  zoom: 1.4,
}));

const zones = await $fetch('/data/climate/country-zones.geojson');

function buildFillColorExpression() {
  const expr = ['match', ['get', 'koppen_class']];
  // ... map all 30 Köppen classes to their colors
  expr.push('#cccccc');
  return expr;
}
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="size-full">
    <VControlNavigation position="top-right" />
    <VControlScale position="bottom-left" />

    <VLayerMaplibreGeojson
      source-id="zones"
      layer-id="zones-fill"
      :source="{ type: 'geojson', data: zones }"
      :layer="{
        id: 'zones-fill',
        type: 'fill',
        source: 'zones',
        paint: {
          'fill-color': buildFillColorExpression(),
          'fill-opacity': 0.78,
        },
      }"
    />

    <VMarker
      v-for="label in regionLabels"
      :key="label.klass"
      :coordinates="label.anchor"
    >
      <div class="text-xs font-semibold">
        Climate of {{ label.exemplarName }}
      </div>
    </VMarker>
  </VMap>
</template>`;
</script>

<template>
  <ComponentDemo
    title="Climate Equivalents"
    description="Click a country to see it split into Köppen-Geiger climate zones, each labeled with the country that has the most area in that climate worldwide."
    :code="codeExample"
    registry="map-layers"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <div
        v-if="isLoading"
        class="flex h-full items-center justify-center bg-muted"
      >
        <div class="text-center">
          <Icon
            name="lucide:loader-2"
            class="mx-auto size-8 animate-spin text-muted-foreground"
          />
          <p class="mt-2 text-sm text-muted-foreground">
            Loading climate data…
          </p>
        </div>
      </div>

      <div
        v-else-if="error"
        class="flex h-full items-center justify-center bg-muted"
      >
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

      <template v-else>
        <ClientOnly>
          <div class="relative size-full">
            <ExamplesClimateMapContainer
              :map-options="mapOptions"
              :zones="zones"
              :fill-color-expression="fillColorExpression"
              :fill-opacity-expression="fillOpacityExpression"
              :selected-iso="selectedCountry?.iso ?? null"
              :country-outline-source="countryOutlineSource"
              :region-labels="regionLabels"
              :selected-country="selectedCountry"
              :hover-state="hoverState"
              :hover-popup-html="hoverPopupHtml"
              :hover-popup-lng-lat="hoverPopupLngLat"
              :is-mobile="isMobile"
              @map-load="handleMapLoad"
              @map-unload="handleMapUnload"
              @map-click="handleMapClick"
              @map-mouse-move="handleMapMouseMove"
              @map-mouse-leave="handleMapMouseLeave"
              @label-click="handleLabelClick"
              @label-shuffle="handleLabelShuffle"
            />

            <MapPanel title="Climate Equivalents" panel-width="w-80">
              <div class="flex flex-col gap-4">
                <ExamplesClimateTopBar
                  :country-options="countryOptions"
                  :selected-iso="selectedCountry?.iso ?? null"
                  :has-selection="!!selectedCountry"
                  @select-country="selectCountry"
                  @random-country="randomCountry"
                  @shuffle-all="shuffleAll"
                  @clear-selection="clearSelection"
                />

                <div>
                  <div
                    class="mb-1.5 flex items-center justify-between font-mono text-2xs uppercase tracking-caps text-muted-foreground"
                  >
                    <span>Layer opacity</span>
                    <span class="tabular-nums text-foreground"
                      >{{ opacityPct }}%</span
                    >
                  </div>
                  <Slider
                    v-model="opacityModel"
                    :min="10"
                    :max="100"
                    :step="1"
                    aria-label="Climate layer opacity"
                  />
                </div>

                <template v-if="selectedCountry">
                  <div class="border-t border-border" />
                  <div
                    class="font-mono text-caption uppercase tracking-caps text-muted-foreground"
                  >
                    Breakdown ·
                    <span class="text-foreground">{{
                      selectedCountry.name
                    }}</span>
                  </div>
                  <ExamplesClimateWidget
                    :country-name="selectedCountry.name"
                    :treemap-cells="treemapCells"
                    :detail-view="detailView"
                    :detail-context="detailContext"
                    :container-w="treemapContainerW"
                    :container-h="treemapContainerH"
                    @open-detail="openDetail"
                    @close-detail="closeDetail"
                    @shuffle-one="shuffleOne"
                  />
                </template>
                <p v-else class="text-xs leading-relaxed text-muted-foreground">
                  Pick a country to split it into Köppen-Geiger climate zones,
                  each labeled with the country that shares that climate.
                </p>
              </div>
            </MapPanel>

            <ExamplesClimateFooterCredit
              @open-methodology="handleMethodologyClick"
            />

            <ExamplesClimateMethodologyPopover
              v-if="!isSmallScreen"
              :open="methodologyOpen"
              @close="closeMethodology"
            />

            <ExamplesClimateBottomSheet
              :open="sheetOpen"
              :country-name="selectedCountry?.name ?? ''"
              :detail-klass="detailView?.klass ?? null"
              :detail-context="detailContext"
              :html="sheetHtml"
              @close="closeSheetComposable"
              @shuffle-one="shuffleOne"
            />
          </div>

          <template #fallback>
            <div class="flex h-full items-center justify-center bg-muted">
              <Icon
                name="lucide:loader-2"
                class="size-8 animate-spin text-muted-foreground"
              />
            </div>
          </template>
        </ClientOnly>
      </template>
    </div>
  </ComponentDemo>
</template>
