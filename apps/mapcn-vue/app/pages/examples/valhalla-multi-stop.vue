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
          Multi-Stop Routes
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Traveling salesman route optimization with draggable waypoints using
          Valhalla.
        </p>
      </div>

      <ExamplesRouteMultiStopTab />

      <ExampleNavigation />
    </div>
  </div>
</template>
