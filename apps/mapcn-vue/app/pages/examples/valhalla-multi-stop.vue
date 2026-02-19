<script setup lang="ts">
  useSeoMeta({
    title: 'Multi-Stop Routes - mapcn-vue Examples',
    description:
      'Traveling salesman route optimization with draggable waypoints using Valhalla.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Multi-Stop Routes',
    description:
      'Traveling salesman route optimization with draggable waypoints using Valhalla.',
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
        <h1 class="mt-4 text-3xl font-bold tracking-tight">
          Multi-Stop Routes
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Traveling salesman route optimization with draggable waypoints using
          Valhalla.
        </p>
      </div>

      <ExamplesRouteMultiStopTab />
    </div>
  </div>
</template>
