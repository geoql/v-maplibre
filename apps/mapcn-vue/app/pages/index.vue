<script setup lang="ts">
  useSeoMeta({
    title: 'mapcn-vue - Beautiful maps for Vue',
    description:
      'Beautiful map components for Vue. Built on @geoql/v-maplibre, styled with Tailwind CSS, works with shadcn-vue.',
  });
</script>

<template>
  <div class="flex flex-col">
    <section class="relative overflow-hidden py-20 md:py-32">
      <div class="container relative z-10 max-w-screen-2xl">
        <div
          class="mx-auto flex max-w-245 flex-col items-center gap-4 text-center"
        >
          <a
            href="https://github.com/geoql/v-maplibre"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium"
          >
            <Icon name="lucide:star" class="mr-1 h-3.5 w-3.5"></Icon>
            Star on GitHub
          </a>

          <h1
            class="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]"
          >
            Beautiful maps,<br class="hidden sm:inline" />
            made simple.
          </h1>

          <p class="max-w-187.5 text-lg text-muted-foreground sm:text-xl">
            Copy-paste map components for Vue. Built on
            <a
              href="https://github.com/geoql/v-maplibre"
              class="font-medium underline underline-offset-4"
              >@geoql/v-maplibre</a
            >, styled with Tailwind CSS, works with
            <a
              href="https://shadcn-vue.com"
              class="font-medium underline underline-offset-4"
              >shadcn-vue</a
            >.
          </p>

          <div class="flex flex-wrap items-center justify-center gap-4">
            <NuxtLink
              to="/docs/introduction"
              class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Get Started
            </NuxtLink>
            <NuxtLink
              to="/docs/components"
              class="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Components
            </NuxtLink>
          </div>
        </div>
      </div>

      <div
        class="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"
      ></div>
    </section>

    <section class="container max-w-screen-2xl py-12">
      <div class="mx-auto max-w-300">
        <ClientOnly>
          <HeroMap></HeroMap>
          <template #fallback>
            <div class="map-container flex items-center justify-center">
              <div class="text-muted-foreground">Loading map...</div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </section>

    <section class="container max-w-screen-2xl py-12 md:py-24">
      <div class="mx-auto max-w-245 text-center">
        <h2
          class="text-3xl font-bold leading-tight tracking-tighter md:text-4xl"
        >
          Everything you need for maps
        </h2>
        <p class="mt-4 text-lg text-muted-foreground">
          From basic markers to deck.gl visualizations. All components you need
          to build stunning map applications.
        </p>
      </div>

      <div
        class="mx-auto mt-12 grid max-w-300 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <div class="rounded-lg border border-border bg-card p-6">
          <Icon name="lucide:map-pin" class="h-10 w-10 text-primary"></Icon>
          <h3 class="mt-4 text-lg font-semibold">Core Components</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            Map, Markers, Popups, and Navigation Controls. Everything to get
            started.
          </p>
        </div>

        <div class="rounded-lg border border-border bg-card p-6">
          <Icon name="lucide:layers" class="h-10 w-10 text-primary"></Icon>
          <h3 class="mt-4 text-lg font-semibold">MapLibre Layers</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            GeoJSON, Vector, Raster, Cluster, PMTiles, Image, Video, and Canvas
            layers.
          </p>
        </div>

        <div class="rounded-lg border border-border bg-card p-6">
          <Icon name="lucide:sparkles" class="h-10 w-10 text-primary"></Icon>
          <h3 class="mt-4 text-lg font-semibold">deck.gl Layers</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            High-performance WebGL layers: Scatterplot, Arc, Heatmap, Hexagon,
            Trips, and more.
          </p>
        </div>

        <div class="rounded-lg border border-border bg-card p-6">
          <Icon name="lucide:palette" class="h-10 w-10 text-primary"></Icon>
          <h3 class="mt-4 text-lg font-semibold">Theme Aware</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            Dark mode support out of the box with automatic basemap switching.
          </p>
        </div>

        <div class="rounded-lg border border-border bg-card p-6">
          <Icon name="lucide:copy" class="h-10 w-10 text-primary"></Icon>
          <h3 class="mt-4 text-lg font-semibold">Copy & Paste</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            Add components to your project with a single CLI command. No complex
            setup.
          </p>
        </div>

        <div class="rounded-lg border border-border bg-card p-6">
          <Icon name="lucide:code-2" class="h-10 w-10 text-primary"></Icon>
          <h3 class="mt-4 text-lg font-semibold">TypeScript First</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            Full TypeScript support with excellent IDE autocompletion and type
            safety.
          </p>
        </div>
      </div>
    </section>

    <section class="border-t border-border bg-muted/50 py-12 md:py-24">
      <div class="container max-w-screen-2xl">
        <div class="mx-auto max-w-245 text-center">
          <h2
            class="text-3xl font-bold leading-tight tracking-tighter md:text-4xl"
          >
            Get started in seconds
          </h2>
          <p class="mt-4 text-lg text-muted-foreground">
            Add map components to your project with the shadcn-vue CLI.
          </p>
        </div>

        <div class="mx-auto mt-8 max-w-150">
          <div class="rounded-lg border border-border bg-card">
            <div
              class="flex items-center gap-2 border-b border-border px-4 py-2"
            >
              <div class="h-3 w-3 rounded-full bg-red-500"></div>
              <div class="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div class="h-3 w-3 rounded-full bg-green-500"></div>
              <span class="ml-2 text-xs text-muted-foreground">Terminal</span>
            </div>
            <pre
              class="overflow-x-auto p-4 text-sm"
            ><code class="text-foreground">npx shadcn-vue@latest add https://mapcn-vue.geoql.in/r/map.json</code></pre>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
