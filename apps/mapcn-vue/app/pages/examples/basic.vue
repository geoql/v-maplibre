<script setup lang="ts">
  useSeoMeta({
    title: 'Basic Map - mapcn-vue Examples',
    description: 'A simple map with navigation controls.',
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
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VControlScale position="bottom-left" />
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
        <h1 class="mt-4 text-3xl font-bold tracking-tight">Basic Map</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          A simple map with navigation and scale controls.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div class="h-125 min-w-0">
          <LazyMapDemo :center="[-74.006, 40.7128]" :zoom="11" show-scale />
        </div>

        <div class="min-w-0">
          <CodeBlock :code="codeExample" lang="vue" filename="BasicMap.vue" />
        </div>
      </div>
    </div>
  </div>
</template>
