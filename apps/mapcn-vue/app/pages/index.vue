<script setup lang="ts">
  useSeoMeta({
    title: 'mapcn-vue - Beautiful maps for Vue',
    description:
      'Beautiful map components for Vue. Built on @geoql/v-maplibre, styled with Tailwind CSS, works with shadcn-vue.',
    ogTitle: 'mapcn-vue - Beautiful maps for Vue',
    ogDescription:
      'Beautiful map components for Vue. Built on @geoql/v-maplibre, styled with Tailwind CSS, works with shadcn-vue.',
    ogType: 'website',
    ogUrl: 'https://mapcn-vue.geoql.in',
    ogSiteName: 'mapcn-vue',
    twitterCard: 'summary_large_image',
    twitterTitle: 'mapcn-vue - Beautiful maps for Vue',
    twitterDescription:
      'Beautiful map components for Vue. Built on @geoql/v-maplibre, styled with Tailwind CSS, works with shadcn-vue.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Beautiful maps, made simple.',
    description:
      'Map components for Vue. Built on MapLibre, styled with Tailwind CSS.',
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
  <div class="relative min-h-dvh">
    <!-- Animated aurora gradient background -->
    <div class="fixed inset-0 -z-10">
      <div class="absolute inset-0 bg-background"></div>
      <!-- Aurora gradient blobs -->
      <div
        class="animate-aurora-1 absolute -top-[30%] -left-[40%] size-[80%] rounded-full bg-linear-to-br from-primary/20 via-cyan-500/10 to-transparent blur-3xl"
      ></div>
      <div
        class="animate-aurora-2 absolute top-[20%] -right-[30%] size-[60%] rounded-full bg-linear-to-bl from-violet-500/15 via-primary/10 to-transparent blur-3xl"
      ></div>
      <div
        class="animate-aurora-3 absolute -bottom-[20%] left-[20%] size-[50%] rounded-full bg-linear-to-tr from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl"
      ></div>
      <!-- Grid overlay -->
      <div
        class="absolute inset-0 bg-[linear-gradient(to_right,rgb(128_128_128/0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgb(128_128_128/0.03)_1px,transparent_1px)] bg-size-[60px_60px]"
      ></div>
      <!-- Noise texture overlay -->
      <div
        class="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style="
          background-image: url('data:image/svg+xml,%3Csvg viewBox=&quot;0 0 256 256&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cfilter id=&quot;noise&quot;%3E%3CfeTurbulence type=&quot;fractalNoise&quot; baseFrequency=&quot;0.65&quot; numOctaves=&quot;3&quot; stitchTiles=&quot;stitch&quot;/%3E%3C/filter%3E%3Crect width=&quot;100%25&quot; height=&quot;100%25&quot; filter=&quot;url(%23noise)&quot;/%3E%3C/svg%3E');
        "
      ></div>
    </div>

    <!-- Hero Section - Compact -->
    <section class="relative p-6 md:py-8">
      <div class="relative z-10 mx-auto max-w-5xl">
        <div class="space-y-4">
          <!-- Glowing accent line -->
          <div
            class="animate-fade-in mx-auto h-px w-24 bg-linear-to-r from-transparent via-primary to-transparent"
          ></div>

          <div class="space-y-3 text-center">
            <h1
              class="animate-fade-up bg-linear-to-b from-foreground via-foreground to-foreground/50 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl md:text-5xl"
            >
              <span class="italic">Beautiful maps,</span>
              <br class="hidden sm:inline" />
              <span class="italic">made simple.</span>
            </h1>
            <p
              class="animate-fade-up mx-auto max-w-xl text-sm/relaxed text-muted-foreground delay-100 md:text-base"
            >
              Beautiful, ready to use, and customizable map components built on
              <a
                href="https://github.com/geoql/v-maplibre"
                class="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                >MapLibre</a
              >. Styled with Tailwind. Zero config. One command setup.
            </p>
          </div>

          <div class="animate-fade-up text-center delay-200">
            <div
              class="inline-flex max-w-full items-center gap-3 overflow-x-auto rounded-full border border-border/40 bg-card/50 px-4 py-2 font-mono text-xs backdrop-blur-md sm:text-sm"
            >
              <span class="shrink-0 text-muted-foreground/60">$</span>
              <code class="truncate text-foreground/90">{{ cliCommand }}</code>
              <button
                class="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                @click="copyCommand"
              >
                <Icon
                  :name="copied ? 'lucide:check' : 'lucide:copy'"
                  class="size-4"
                  :class="{ 'text-emerald-500': copied }"
                />
              </button>
            </div>
          </div>

          <div
            class="animate-fade-up flex flex-wrap items-center justify-center gap-3 delay-300"
          >
            <NuxtLink
              to="/docs/introduction"
              class="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
            >
              Get Started
              <Icon name="lucide:arrow-right" class="size-4" />
            </NuxtLink>
            <NuxtLink
              to="/examples"
              class="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border/50 bg-background/50 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              View Examples
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Demo Section - Minimal padding -->
    <section class="px-6 pb-6">
      <div class="mx-auto grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2">
        <!-- Main demo - prominent viral hook -->
        <div
          class="demo-card animate-scale-in relative aspect-16/10 overflow-hidden rounded-xl border border-border/50 bg-card/50 shadow-xl shadow-black/5 backdrop-blur-md delay-400 sm:col-span-2"
        >
          <ClientOnly>
            <LazyActiveUsersDemo />
            <template #fallback>
              <div class="flex size-full items-center justify-center">
                <div class="flex gap-1">
                  <span
                    class="size-1.5 animate-pulse rounded-full bg-muted-foreground/60"
                  ></span>
                  <span
                    class="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:150ms]"
                  ></span>
                  <span
                    class="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:300ms]"
                  ></span>
                </div>
              </div>
            </template>
          </ClientOnly>
          <div
            class="absolute top-3 left-3 z-10 rounded-lg border border-border/50 bg-background/90 p-3 shadow-lg backdrop-blur-md"
          >
            <div
              class="mb-1 text-[10px] tracking-wider text-muted-foreground uppercase"
            >
              Active Users
            </div>
            <div class="text-2xl/tight font-semibold">2,847</div>
            <div class="mt-1 flex items-center gap-1">
              <Icon name="lucide:trending-up" class="size-3 text-emerald-500" />
              <span class="text-xs text-emerald-500">+12.5%</span>
              <span class="text-xs text-muted-foreground">vs last hour</span>
            </div>
          </div>
          <!-- Subtle glow effect on main demo -->
          <div
            class="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/10 ring-inset"
          ></div>
        </div>

        <!-- Secondary demos - smaller -->
        <div
          class="demo-card animate-scale-in relative aspect-4/3 overflow-hidden rounded-xl border border-border/50 bg-card/50 shadow-lg backdrop-blur-md delay-500"
        >
          <div
            class="absolute top-2 left-2 z-10 rounded-sm bg-background/90 px-2 py-1 text-[10px] tracking-wider text-muted-foreground uppercase backdrop-blur-sm"
          >
            Global Delivery
          </div>
          <ClientOnly>
            <LazyDeliveryDemo />
            <template #fallback>
              <div class="flex size-full items-center justify-center">
                <div class="flex gap-1">
                  <span
                    class="size-1.5 animate-pulse rounded-full bg-muted-foreground/60"
                  ></span>
                  <span
                    class="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:150ms]"
                  ></span>
                  <span
                    class="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:300ms]"
                  ></span>
                </div>
              </div>
            </template>
          </ClientOnly>
        </div>

        <div
          class="demo-card animate-scale-in relative aspect-4/3 overflow-hidden rounded-xl border border-border/50 bg-card/50 shadow-lg backdrop-blur-md delay-600"
        >
          <div
            class="absolute top-2 left-2 z-10 rounded-sm bg-background/90 px-2 py-1 text-[10px] tracking-wider text-muted-foreground uppercase backdrop-blur-sm"
          >
            Trips
          </div>
          <ClientOnly>
            <LazyTripsDemo />
            <template #fallback>
              <div class="flex size-full items-center justify-center">
                <div class="flex gap-1">
                  <span
                    class="size-1.5 animate-pulse rounded-full bg-muted-foreground/60"
                  ></span>
                  <span
                    class="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:150ms]"
                  ></span>
                  <span
                    class="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:300ms]"
                  ></span>
                </div>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </section>

    <!-- Features Section - Compact with glassmorphism -->
    <section class="border-t border-border/40 px-6 py-12 md:py-16">
      <div class="mx-auto max-w-5xl">
        <div class="text-center">
          <div
            class="animate-fade-in mx-auto mb-4 h-px w-16 bg-linear-to-r from-transparent via-primary/50 to-transparent"
          ></div>
          <h2
            class="bg-linear-to-b from-foreground via-foreground to-foreground/60 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl"
          >
            Everything you need for maps
          </h2>
          <p class="mt-3 text-sm text-muted-foreground md:text-base">
            From basic markers to deck.gl visualizations. All components you
            need to build stunning map applications.
          </p>
        </div>

        <div class="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div
            class="example-card rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-md transition-all hover:border-primary/30 hover:bg-card/80"
          >
            <div
              class="flex size-10 items-center justify-center rounded-lg border border-border/50 bg-muted/50"
            >
              <Icon name="lucide:map-pin" class="size-5 text-primary" />
            </div>
            <h3 class="mt-3 text-base font-semibold">Core Components</h3>
            <p class="mt-1.5 text-sm/relaxed text-muted-foreground">
              Map, Markers, Popups, and Navigation Controls. Everything to get
              started.
            </p>
          </div>

          <div
            class="example-card rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-md transition-all hover:border-primary/30 hover:bg-card/80"
          >
            <div
              class="flex size-10 items-center justify-center rounded-lg border border-border/50 bg-muted/50"
            >
              <Icon name="lucide:layers" class="size-5 text-primary" />
            </div>
            <h3 class="mt-3 text-base font-semibold">MapLibre Layers</h3>
            <p class="mt-1.5 text-sm/relaxed text-muted-foreground">
              GeoJSON, Vector, Raster, Cluster, PMTiles, Image, Video, and
              Canvas layers.
            </p>
          </div>

          <div
            class="example-card rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-md transition-all hover:border-primary/30 hover:bg-card/80"
          >
            <div
              class="flex size-10 items-center justify-center rounded-lg border border-border/50 bg-muted/50"
            >
              <Icon name="lucide:sparkles" class="size-5 text-primary" />
            </div>
            <h3 class="mt-3 text-base font-semibold">deck.gl Layers</h3>
            <p class="mt-1.5 text-sm/relaxed text-muted-foreground">
              High-performance WebGL layers: Scatterplot, Arc, Heatmap, Hexagon,
              Trips, and more.
            </p>
          </div>

          <div
            class="example-card rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-md transition-all hover:border-primary/30 hover:bg-card/80"
          >
            <div
              class="flex size-10 items-center justify-center rounded-lg border border-border/50 bg-muted/50"
            >
              <Icon name="lucide:palette" class="size-5 text-primary" />
            </div>
            <h3 class="mt-3 text-base font-semibold">Theme Aware</h3>
            <p class="mt-1.5 text-sm/relaxed text-muted-foreground">
              Dark mode support out of the box with automatic basemap switching.
            </p>
          </div>

          <div
            class="example-card rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-md transition-all hover:border-primary/30 hover:bg-card/80"
          >
            <div
              class="flex size-10 items-center justify-center rounded-lg border border-border/50 bg-muted/50"
            >
              <Icon name="lucide:copy" class="size-5 text-primary" />
            </div>
            <h3 class="mt-3 text-base font-semibold">Copy & Paste</h3>
            <p class="mt-1.5 text-sm/relaxed text-muted-foreground">
              Add components to your project with a single CLI command. No
              complex setup.
            </p>
          </div>

          <div
            class="example-card rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-md transition-all hover:border-primary/30 hover:bg-card/80"
          >
            <div
              class="flex size-10 items-center justify-center rounded-lg border border-border/50 bg-muted/50"
            >
              <Icon name="lucide:code-2" class="size-5 text-primary" />
            </div>
            <h3 class="mt-3 text-base font-semibold">TypeScript First</h3>
            <p class="mt-1.5 text-sm/relaxed text-muted-foreground">
              Full TypeScript support with excellent IDE autocompletion and type
              safety.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Get Started Section - Compact -->
    <section class="px-6 py-12 md:py-16">
      <div class="mx-auto max-w-5xl">
        <div class="text-center">
          <h2
            class="bg-linear-to-b from-foreground via-foreground to-foreground/60 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl"
          >
            Get started in seconds
          </h2>
          <p class="mt-3 text-sm text-muted-foreground md:text-base">
            Add map components to your project with the shadcn-vue CLI.
          </p>
        </div>

        <div class="mx-auto mt-6 w-full max-w-2xl">
          <div
            class="overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-md"
          >
            <div
              class="flex items-center gap-2 border-b border-border/50 px-4 py-2"
            >
              <div class="size-3 rounded-full bg-red-500/80"></div>
              <div class="size-3 rounded-full bg-yellow-500/80"></div>
              <div class="size-3 rounded-full bg-green-500/80"></div>
              <span class="ml-2 text-xs text-muted-foreground">Terminal</span>
            </div>
            <div class="overflow-x-auto p-4">
              <code class="text-sm whitespace-nowrap text-foreground"
                >npx shadcn-vue@latest add
                https://mapcn-vue.geoql.in/r/map</code
              >
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
  .demo-card {
    min-height: 180px;
  }

  @media (min-width: 640px) {
    .demo-card {
      min-height: 220px;
    }
  }
</style>
