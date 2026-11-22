<script setup lang="ts">
  usePageGeo({
    title: 'Trip Planner - mapcn-vue Examples',
    description:
      'Multi-day itinerary generator with POI suggestions using Valhalla routing.',
  });

  defineOgImage('SiteDoc', {
    title: 'Trip Planner',
    description:
      'Multi-day itinerary generator with POI suggestions using Valhalla routing.',
    category: 'Valhalla',
  });
</script>

<template>
  <ComponentDemo
    title="Trip Planner"
    description="Multi-day itinerary generator with POI suggestions using Valhalla routing."
    registry="map-layers"
    full-width
    class="h-full"
  >
    <ExamplesRouteTripPlannerTab />
  </ComponentDemo>
</template>
