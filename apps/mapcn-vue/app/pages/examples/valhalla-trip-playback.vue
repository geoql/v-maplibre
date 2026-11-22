<script setup lang="ts">
  usePageGeo({
    title: 'Trip Playback - mapcn-vue Examples',
    description:
      'Animated route replay with timeline scrubbing using Valhalla routing API.',
  });

  defineOgImage('SiteDoc', {
    title: 'Trip Playback',
    description:
      'Animated route replay with timeline scrubbing using Valhalla routing API.',
    category: 'Valhalla',
  });
</script>

<template>
  <ComponentDemo
    title="Trip Playback"
    description="Animated route replay with timeline scrubbing using Valhalla routing API."
    registry="map-layers"
    full-width
    class="h-full"
  >
    <ExamplesRoutePlaybackTab />
  </ComponentDemo>
</template>
