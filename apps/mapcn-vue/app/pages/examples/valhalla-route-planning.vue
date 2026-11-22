<script setup lang="ts">
  usePageGeo({
    title: 'Route Planning - mapcn-vue Examples',
    description:
      'A to B routing with turn-by-turn directions using Valhalla routing API.',
  });

  defineOgImage('SiteDoc', {
    title: 'Route Planning',
    description:
      'A to B routing with turn-by-turn directions using Valhalla routing API.',
    category: 'Valhalla',
  });
</script>

<template>
  <ComponentDemo
    title="Route Planning"
    description="A to B routing with turn-by-turn directions using Valhalla routing API."
    registry="map-layers"
    full-width
    class="h-full"
  >
    <ExamplesRoutePlanningTab />
  </ComponentDemo>
</template>
