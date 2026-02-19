<script setup lang="ts">
  useSeoMeta({
    title: 'Trip Planner - mapcn-vue Examples',
    description:
      'Multi-day itinerary generator with POI suggestions using Valhalla routing.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Trip Planner',
    description:
      'Multi-day itinerary generator with POI suggestions using Valhalla routing.',
    category: 'Valhalla',
  });
</script>

<template>
  <div class="container max-w-screen-2xl overflow-x-hidden py-10">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-4">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="mr-2 size-4" />
          Back to Examples
        </NuxtLink>
        <h1 class="mt-4 text-3xl font-bold tracking-tight">Trip Planner</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Multi-day itinerary generator with POI suggestions using Valhalla
          routing.
        </p>
      </div>

      <ExamplesRouteTripPlannerTab />
    </div>
  </div>
</template>
