<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglWMS,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'WMS Layer (deck.gl) - mapcn-vue Examples',
    description: 'Web Map Service (WMS) integration with deck.gl.',
  });

  defineOgImage('MapcnDoc', {
    title: 'WMS Layer (deck.gl)',
    description: 'Web Map Service (WMS) integration with deck.gl.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `wms-example-${mapId}`,
    style: mapStyle.value,
    center: [10.0, 51.0] as [number, number],
    zoom: 5,
    pitch: 0,
    bearing: 0,
  }));

  // Using terrestris OSM WMS service
  const WMS_URL = 'https://ows.terrestris.de/osm/service';

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VLayerDeckglWMS, VControlNavigation } from '@geoql/v-maplibre';

  const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [10.0, 51.0],
  zoom: 5,
  };

  // WMS service URL
  const WMS_URL = 'https://ows.terrestris.de/osm/service';
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full">
    <VControlNavigation position="top-right" />
    <VLayerDeckglWMS
      id="wms-layer"
      :data="WMS_URL"
      service-type="wms"
      :layers="['OSM-WMS']"
      srs="EPSG:4326"
      :opacity="0.7"
    />
  </VMap>
</template>`;
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
          WMS Layer (deck.gl)
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Load and display Web Map Service (WMS) layers with automatic tiling
          and caching.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="h-125 min-w-0 overflow-hidden">
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="size-full">
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />
              <VLayerDeckglWMS
                id="wms-layer"
                :data="WMS_URL"
                service-type="wms"
                :layers="['OSM-WMS']"
                srs="EPSG:4326"
                :opacity="0.7"
              />
            </VMap>
          </ClientOnly>
        </div>
      </ComponentDemo>

      <div class="mt-6 rounded-lg border border-border bg-muted/50 p-4">
        <p class="text-sm text-muted-foreground">
          <strong>Data source:</strong> OpenStreetMap WMS from
          <a
            href="https://ows.terrestris.de/"
            target="_blank"
            class="text-primary hover:underline"
            >terrestris</a
          >. Supports WMS 1.1.1 and 1.3.0 specifications with configurable
          layers, SRS, and request parameters.
        </p>
      </div>
    </div>
  </div>
</template>
