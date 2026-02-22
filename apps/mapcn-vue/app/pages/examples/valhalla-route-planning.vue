<script setup lang="ts">
  useSeoMeta({
    title: 'Route Planning - mapcn-vue Examples',
    description:
      'A to B routing with turn-by-turn directions using Valhalla routing API.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Route Planning',
    description:
      'A to B routing with turn-by-turn directions using Valhalla routing API.',
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
          Route Planning
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          A to B routing with turn-by-turn directions using Valhalla routing
          API.
        </p>
      </div>

      <ExamplesRoutePlanningTab />

      <ExampleNavigation />
    </div>
  </div>
</template>
