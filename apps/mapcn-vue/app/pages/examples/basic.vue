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
        <h1 class="mt-1.5 text-xl font-semibold tracking-tight">Basic Map</h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          A simple map with navigation and scale controls.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="h-125 min-w-0">
          <LazyMapDemo :center="[-74.006, 40.7128]" :zoom="11" show-scale />
        </div>
      </ComponentDemo>

      <ExampleNavigation />
    </div>
  </div>
</template>
