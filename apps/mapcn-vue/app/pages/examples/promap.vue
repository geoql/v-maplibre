<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v';
  import type { ViewportBounds, PromapSearchResult } from '~/types/promap';

  useSeoMeta({
    title: 'Home Price Explorer - mapcn-vue Examples',
    description:
      'Interactive US home price bubble map at the ZIP code level with LocalView — viewport-based quintile re-bucketing that reveals local variation.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Home Price Explorer',
    description: 'US ZIP-level home price bubbles with LocalView re-bucketing.',
    category: 'Examples',
  });

  const { mapStyle } = useMapStyle();

  const {
    allData,
    isLoading,
    loadingMessage,
    loadError,
    viewMode,
    localView,
    hoveredZip,
    renderPoints,
    viewportStats,
    legendBuckets,
    searchResults,
    updateViewport,
    setViewMode,
    toggleLocalView,
    setHoveredZip,
    setSearchQuery,
  } = usePromapData();

  const panelOpen = ref(true);
  const mapContainerRef = ref<InstanceType<
    typeof ExamplesPromapMapContainer
  > | null>(null);

  function handleViewportChange(bounds: ViewportBounds): void {
    updateViewport(bounds);
  }

  function handleSelectResult(result: PromapSearchResult): void {
    mapContainerRef.value?.flyTo(result.coordinates, 10);
  }

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
    import { VMap, VLayerDeckglScatterplot, VControlNavigation } from '@geoql/v-maplibre';

    const mapOptions = {
      style: 'https://maps.guru/api/v1/styles/standard/light/style.json?key=...',
      center: [-98.5, 39.8],
      zoom: 3.8,
    };
    ${SCRIPT_END}

    <template>
      <VMap :options="mapOptions">
        <VLayerDeckglScatterplot
          id="promap-bubbles"
          :data="renderPoints"
          :get-position="getPosition"
          :get-radius="getRadius"
          :get-fill-color="getFillColor"
          :radius-min-pixels="2"
          :radius-max-pixels="40"
          :opacity="0.85"
          :pickable="true"
        />
        <VControlNavigation position="top-right" />
      </VMap>
    </template>`;
</script>

<template>
  <ComponentDemo
    title="Home Price Explorer"
    description="Interactive US home price bubble map at the ZIP code level with LocalView — viewport-based quintile re-bucketing that reveals local variation hidden at national scale."
    :code="codeExample"
    registry="map-deckgl-core"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <!-- Loading overlay -->
      <div
        v-if="isLoading"
        class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm"
      >
        <Icon
          name="lucide:loader-2"
          class="mb-3 size-8 animate-spin text-primary"
        />
        <p class="text-sm font-medium text-muted-foreground">
          {{ loadingMessage || 'Loading...' }}
        </p>
        <p class="mt-1 text-xs text-muted-foreground/60">
          26,000+ ZIP codes with real Zillow data
        </p>
      </div>

      <!-- Error overlay -->
      <div
        v-if="loadError && !isLoading"
        class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm"
      >
        <Icon name="lucide:alert-circle" class="mb-3 size-8 text-destructive" />
        <p class="text-sm font-medium text-destructive">Failed to load data</p>
        <p class="mt-1 max-w-sm text-center text-xs text-muted-foreground">
          {{ loadError }}
        </p>
      </div>

      <ExamplesPromapMapContainer
        ref="mapContainerRef"
        :render-points="renderPoints"
        :legend-buckets="legendBuckets"
        :hovered-zip="hoveredZip"
        :view-mode="viewMode"
        :local-view="localView"
        :map-style="mapStyle"
        class="size-full"
        @viewport-change="handleViewportChange"
        @hover-zip="setHoveredZip"
      />

      <!-- Toggle button -->
      <button
        class="absolute top-4 left-4 z-10 flex size-9 items-center justify-center rounded-lg border border-border/50 bg-background/95 shadow-sm backdrop-blur-sm transition-colors hover:bg-accent"
        :class="{
          'bg-primary text-primary-foreground hover:bg-primary/90': !panelOpen,
        }"
        @click="panelOpen = !panelOpen"
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
          class="absolute top-16 left-4 z-10 w-72 max-h-[calc(100%-5rem)] overflow-auto rounded-xl bg-background/95 shadow-lg backdrop-blur-sm"
        >
          <ExamplesPromapControlPanel
            :view-mode="viewMode"
            :local-view="localView"
            :stats="viewportStats"
            :search-results="searchResults"
            :total-points="allData.length"
            @set-mode="setViewMode"
            @toggle-local-view="toggleLocalView"
            @search="setSearchQuery"
            @select-result="handleSelectResult"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  </ComponentDemo>
</template>
