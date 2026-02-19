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
        <h1 class="mt-4 text-3xl font-bold tracking-tight">Route Planning</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          A to B routing with turn-by-turn directions using Valhalla routing
          API.
        </p>
      </div>

      <ExamplesRoutePlanningTab />
    </div>
  </div>
</template>
