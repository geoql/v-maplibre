<script setup lang="ts">
  useSeoMeta({
    title: 'Delivery Tracking - mapcn-vue Examples',
    description:
      'Live delivery simulation with ETA updates using Valhalla routing API.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Delivery Tracking',
    description:
      'Live delivery simulation with ETA updates using Valhalla routing API.',
    category: 'Valhalla',
  });
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
          Delivery Tracking
        </h1>
        <p class="text-lg text-muted-foreground">
          Live delivery simulation with ETA updates using Valhalla routing API.
        </p>
      </div>

      <ExamplesRouteDeliveryTrackingTab />

      <ExampleNavigation />
    </div>
  </div>
</template>
