<script setup lang="ts">
  usePageGeo({
    title: 'Multi-Stop Routes - mapcn-vue Examples',
    description:
      'Traveling salesman route optimization with draggable waypoints using Valhalla.',
  });

  defineOgImage('SiteDoc', {
    title: 'Multi-Stop Routes',
    description:
      'Traveling salesman route optimization with draggable waypoints using Valhalla.',
    category: 'Valhalla',
  });
</script>

<template>
  <ComponentDemo
    title="Multi-Stop Routes"
    description="Traveling salesman route optimization with draggable waypoints using Valhalla."
    registry="map-layers"
    full-width
    class="h-full"
  >
    <ExamplesRouteMultiStopTab />
  </ComponentDemo>
</template>
