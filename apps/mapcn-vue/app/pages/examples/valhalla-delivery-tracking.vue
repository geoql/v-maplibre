<script setup lang="ts">
  useSeoMeta({
    title: 'Delivery Tracking - mapcn-vue Examples',
    description:
      'Live delivery simulation with ETA updates using Valhalla routing API.',
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
        <h1 class="mt-4 text-3xl font-bold tracking-tight">
          Delivery Tracking
        </h1>
        <p class="text-lg text-muted-foreground">
          Live delivery simulation with ETA updates using Valhalla routing API.
        </p>
      </div>

      <ExamplesRouteDeliveryTrackingTab />
    </div>
  </div>
</template>
