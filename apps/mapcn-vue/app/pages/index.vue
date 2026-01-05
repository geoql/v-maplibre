<script setup lang="ts">
  useSeoMeta({
    title: 'mapcn-vue - Beautiful maps for Vue',
    description:
      'Beautiful map components for Vue. Built on @geoql/v-maplibre, styled with Tailwind CSS, works with shadcn-vue.',
  });

  const copied = ref(false);
  const cliCommand =
    'npx shadcn-vue@latest add https://mapcn-vue.geoql.in/r/map';

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(cliCommand);
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <section class="relative overflow-hidden px-6 py-20 md:py-28">
      <div class="relative z-10 mx-auto max-w-5xl">
        <div class="space-y-8">
          <div class="space-y-4 text-center">
            <h1
              class="animate-fade-up text-4xl font-semibold tracking-tight text-primary sm:text-5xl md:text-6xl"
            >
              <span class="italic">Beautiful maps,</span>
              <br class="hidden sm:inline" />
              <span class="italic">made simple.</span>
            </h1>
            <p
              class="animate-fade-up mx-auto max-w-xl text-lg leading-relaxed text-foreground/80 delay-100"
            >
              Beautiful, ready to use, and customizable map components built on
              <a
                href="https://github.com/geoql/v-maplibre"
                class="font-medium underline underline-offset-4 hover:text-foreground"
                >MapLibre</a
              >. Styled with Tailwind. Zero config. One command setup.
            </p>
          </div>

          <div class="animate-fade-up text-center delay-200">
            <div
              class="inline-flex max-w-full items-center gap-3 overflow-x-auto rounded-full border border-border/40 bg-secondary/60 px-4 py-2.5 font-mono text-sm backdrop-blur-sm"
            >
              <span class="shrink-0 text-muted-foreground/60">$</span>
              <code class="truncate text-foreground/90">{{ cliCommand }}</code>
              <button
                class="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                @click="copyCommand"
              >
                <Icon
                  :name="copied ? 'lucide:check' : 'lucide:copy'"
                  class="h-4 w-4"
                  :class="{ 'text-emerald-500': copied }"
                ></Icon>
              </button>
            </div>
          </div>

          <div
            class="animate-fade-up flex flex-wrap items-center justify-center gap-3 delay-300"
          >
            <NuxtLink
              to="/docs/introduction"
              class="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-all hover:bg-primary/90"
            >
              Get Started
              <Icon name="lucide:arrow-right" class="h-4 w-4"></Icon>
            </NuxtLink>
            <NuxtLink
              to="/examples"
              class="inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              View Examples
            </NuxtLink>
          </div>
        </div>
      </div>

      <div
        class="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"
      ></div>
    </section>

    <section class="px-6 pb-20">
      <div class="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2">
        <div
          class="demo-card animate-scale-in relative aspect-video overflow-hidden rounded-xl border border-border/50 bg-card shadow delay-400 sm:col-span-2"
        >
          <ClientOnly>
            <ActiveUsersDemo></ActiveUsersDemo>
            <template #fallback>
              <div class="flex h-full w-full items-center justify-center">
                <div class="flex gap-1">
                  <span
                    class="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/60"
                  ></span>
                  <span
                    class="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:150ms]"
                  ></span>
                  <span
                    class="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:300ms]"
                  ></span>
                </div>
              </div>
            </template>
          </ClientOnly>

          <div
            class="absolute left-3 top-3 z-10 rounded-lg border border-border/50 bg-background/95 p-3 shadow-lg backdrop-blur-md"
          >
            <div
              class="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              Active Users
            </div>
            <div class="text-2xl font-semibold leading-tight">2,847</div>
            <div class="mt-1 flex items-center gap-1">
              <Icon
                name="lucide:trending-up"
                class="h-3 w-3 text-emerald-500"
              ></Icon>
              <span class="text-xs text-emerald-500">+12.5%</span>
              <span class="text-xs text-muted-foreground">vs last hour</span>
            </div>
          </div>

          <div
            class="absolute bottom-3 left-3 z-10 rounded-lg border border-border/50 bg-background/95 px-3 py-2 shadow-lg backdrop-blur-md"
          >
            <div class="flex items-center gap-4 text-[10px]">
              <div class="flex items-center gap-1.5">
                <div class="h-3 w-3 rounded-full bg-emerald-500"></div>
                <span class="text-muted-foreground">High</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="h-2 w-2 rounded-full bg-emerald-500/70"></div>
                <span class="text-muted-foreground">Medium</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="h-1.5 w-1.5 rounded-full bg-emerald-500/50"></div>
                <span class="text-muted-foreground">Low</span>
              </div>
            </div>
          </div>
        </div>

        <div
          class="demo-card animate-scale-in relative aspect-[4/3] overflow-hidden rounded-xl border border-border/50 bg-card shadow delay-500"
        >
          <div
            class="absolute left-2 top-2 z-10 rounded bg-background/90 px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur-sm"
          >
            Global Delivery
          </div>
          <ClientOnly>
            <DeliveryDemo></DeliveryDemo>
            <template #fallback>
              <div class="flex h-full w-full items-center justify-center">
                <div class="flex gap-1">
                  <span
                    class="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/60"
                  ></span>
                  <span
                    class="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:150ms]"
                  ></span>
                  <span
                    class="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:300ms]"
                  ></span>
                </div>
              </div>
            </template>
          </ClientOnly>
        </div>

        <div
          class="demo-card animate-scale-in relative aspect-[4/3] overflow-hidden rounded-xl border border-border/50 bg-card shadow delay-600"
        >
          <div
            class="absolute left-2 top-2 z-10 rounded bg-background/90 px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur-sm"
          >
            Heatmap
          </div>
          <ClientOnly>
            <TrendingDemo></TrendingDemo>
            <template #fallback>
              <div class="flex h-full w-full items-center justify-center">
                <div class="flex gap-1">
                  <span
                    class="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/60"
                  ></span>
                  <span
                    class="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:150ms]"
                  ></span>
                  <span
                    class="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:300ms]"
                  ></span>
                </div>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </section>

    <section class="border-t border-border/40 bg-muted/30 px-6 py-16 md:py-24">
      <div class="mx-auto max-w-5xl">
        <div class="text-center">
          <h2
            class="text-3xl font-bold leading-tight tracking-tighter md:text-4xl"
          >
            Everything you need for maps
          </h2>
          <p class="mt-4 text-lg text-muted-foreground">
            From basic markers to deck.gl visualizations. All components you
            need to build stunning map applications.
          </p>
        </div>

        <div class="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div class="rounded-xl border border-border/50 bg-card p-6">
            <Icon name="lucide:map-pin" class="h-10 w-10 text-primary"></Icon>
            <h3 class="mt-4 text-lg font-semibold">Core Components</h3>
            <p class="mt-2 text-sm text-muted-foreground">
              Map, Markers, Popups, and Navigation Controls. Everything to get
              started.
            </p>
          </div>

          <div class="rounded-xl border border-border/50 bg-card p-6">
            <Icon name="lucide:layers" class="h-10 w-10 text-primary"></Icon>
            <h3 class="mt-4 text-lg font-semibold">MapLibre Layers</h3>
            <p class="mt-2 text-sm text-muted-foreground">
              GeoJSON, Vector, Raster, Cluster, PMTiles, Image, Video, and
              Canvas layers.
            </p>
          </div>

          <div class="rounded-xl border border-border/50 bg-card p-6">
            <Icon name="lucide:sparkles" class="h-10 w-10 text-primary"></Icon>
            <h3 class="mt-4 text-lg font-semibold">deck.gl Layers</h3>
            <p class="mt-2 text-sm text-muted-foreground">
              High-performance WebGL layers: Scatterplot, Arc, Heatmap, Hexagon,
              Trips, and more.
            </p>
          </div>

          <div class="rounded-xl border border-border/50 bg-card p-6">
            <Icon name="lucide:palette" class="h-10 w-10 text-primary"></Icon>
            <h3 class="mt-4 text-lg font-semibold">Theme Aware</h3>
            <p class="mt-2 text-sm text-muted-foreground">
              Dark mode support out of the box with automatic basemap switching.
            </p>
          </div>

          <div class="rounded-xl border border-border/50 bg-card p-6">
            <Icon name="lucide:copy" class="h-10 w-10 text-primary"></Icon>
            <h3 class="mt-4 text-lg font-semibold">Copy & Paste</h3>
            <p class="mt-2 text-sm text-muted-foreground">
              Add components to your project with a single CLI command. No
              complex setup.
            </p>
          </div>

          <div class="rounded-xl border border-border/50 bg-card p-6">
            <Icon name="lucide:code-2" class="h-10 w-10 text-primary"></Icon>
            <h3 class="mt-4 text-lg font-semibold">TypeScript First</h3>
            <p class="mt-2 text-sm text-muted-foreground">
              Full TypeScript support with excellent IDE autocompletion and type
              safety.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="px-6 py-16 md:py-24">
      <div class="mx-auto max-w-5xl">
        <div class="text-center">
          <h2
            class="text-3xl font-bold leading-tight tracking-tighter md:text-4xl"
          >
            Get started in seconds
          </h2>
          <p class="mt-4 text-lg text-muted-foreground">
            Add map components to your project with the shadcn-vue CLI.
          </p>
        </div>

        <div class="mx-auto mt-8 max-w-2xl">
          <div class="overflow-hidden rounded-xl border border-border bg-card">
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
            ><code class="text-foreground">npx shadcn-vue@latest add https://mapcn-vue.geoql.in/r/map</code></pre>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
  .animate-fade-up {
    animation: fade-up 0.6s ease-out forwards;
    opacity: 0;
  }

  .animate-scale-in {
    animation: scale-in 0.5s ease-out forwards;
    opacity: 0;
  }

  .delay-100 {
    animation-delay: 100ms;
  }

  .delay-200 {
    animation-delay: 200ms;
  }

  .delay-300 {
    animation-delay: 300ms;
  }

  .delay-400 {
    animation-delay: 400ms;
  }

  .delay-500 {
    animation-delay: 500ms;
  }

  .delay-600 {
    animation-delay: 600ms;
  }

  .delay-700 {
    animation-delay: 700ms;
  }

  .delay-800 {
    animation-delay: 800ms;
  }

  @keyframes fade-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .demo-card {
    min-height: 200px;
  }

  @media (min-width: 640px) {
    .demo-card {
      min-height: 240px;
    }
  }
</style>
