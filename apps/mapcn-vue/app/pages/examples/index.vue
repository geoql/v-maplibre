<script setup lang="ts">
  useSeoMeta({
    title: 'Examples - mapcn-vue',
    description: 'Interactive map examples built with mapcn-vue components.',
  });

  const examples = [
    {
      title: 'Basic Map',
      description: 'A simple map with navigation controls.',
      href: '/examples/basic',
      icon: 'lucide:map',
    },
    {
      title: 'Markers & Popups',
      description: 'Interactive markers with popup information.',
      href: '/examples/markers',
      icon: 'lucide:map-pin',
    },
    {
      title: 'GeoJSON Layer',
      description: 'Render GeoJSON data on the map.',
      href: '/examples/geojson',
      icon: 'lucide:shapes',
    },
    {
      title: 'Clustered Points',
      description: 'Cluster large datasets of points.',
      href: '/examples/cluster',
      icon: 'lucide:circle-dot',
    },
    {
      title: 'Scatterplot (deck.gl)',
      description: 'High-performance scatterplot visualization.',
      href: '/examples/deckgl-scatterplot',
      icon: 'lucide:scatter-chart',
    },
    {
      title: 'Arc Layer (deck.gl)',
      description: 'Origin-destination arc visualization.',
      href: '/examples/deckgl-arc',
      icon: 'lucide:spline',
    },
    {
      title: 'Heatmap (deck.gl)',
      description: 'Density heatmap visualization.',
      href: '/examples/deckgl-heatmap',
      icon: 'lucide:flame',
    },
    {
      title: 'Trips Animation (deck.gl)',
      description: 'Animated path visualization.',
      href: '/examples/deckgl-trips',
      icon: 'lucide:route',
    },
  ];
</script>

<template>
  <div class="container max-w-screen-2xl py-10">
    <div class="mx-auto max-w-300">
      <div class="mb-10">
        <h1 class="text-3xl font-bold tracking-tight">Examples</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Interactive examples showing mapcn-vue components in action.
        </p>
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="example in examples"
          :key="example.href"
          :to="example.href"
          class="group rounded-lg border border-border bg-card p-6 transition-colors hover:bg-accent"
        >
          <Icon :name="example.icon" class="h-8 w-8 text-primary"></Icon>
          <h3 class="mt-4 font-semibold group-hover:text-accent-foreground">
            {{ example.title }}
          </h3>
          <p class="mt-2 text-sm text-muted-foreground">
            {{ example.description }}
          </p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
