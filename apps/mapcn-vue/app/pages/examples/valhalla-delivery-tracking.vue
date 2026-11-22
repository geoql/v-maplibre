<script setup lang="ts">
  usePageGeo({
    title: 'Delivery Tracking - mapcn-vue Examples',
    description:
      'Live delivery simulation with ETA updates using Valhalla routing API.',
  });

  defineOgImage('SiteDoc', {
    title: 'Delivery Tracking',
    description:
      'Live delivery simulation with ETA updates using Valhalla routing API.',
    category: 'Valhalla',
  });
</script>

<template>
  <ComponentDemo
    title="Delivery Tracking"
    description="Live delivery simulation with ETA updates using Valhalla routing API."
    registry="map-layers"
    full-width
    class="h-full"
  >
    <ExamplesRouteDeliveryTrackingTab />
  </ComponentDemo>
</template>
