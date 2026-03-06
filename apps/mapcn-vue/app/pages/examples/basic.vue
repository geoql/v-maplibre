<script setup lang="ts">
  useSeoMeta({
    title: 'Basic Map - mapcn-vue Examples',
    description: 'A simple map with navigation controls.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Basic Map',
    description: 'A simple map with navigation controls.',
    category: 'Examples',
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

                  const mapOptions = {
                  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
                  center: [-74.006, 40.7128],
                  zoom: 11,
                  };
                ${SCRIPT_END}

                <template>
                  <VMap :options="mapOptions" class="h-125 w-full">
                    <VControlNavigation position="top-right" />
                    <VControlScale position="bottom-left" />
                  </VMap>
                </template>`;
</script>

<template>
  <ComponentDemo
    title="Basic Map"
    description="A simple map with navigation and scale controls."
    :code="codeExample"
    registry="map"
    full-width
    class="h-full"
  >
    <div class="size-full min-w-0">
      <LazyMapDemo :center="[-74.006, 40.7128]" :zoom="11" show-scale />
    </div>
  </ComponentDemo>
</template>
