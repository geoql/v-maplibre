<script setup lang="ts">
  useSeoMeta({
    title: 'mapcn-vue - Beautiful maps for Vue',
    description:
      'Beautiful map components for Vue. Built on @geoql/v-maplibre, styled with Tailwind CSS, works with shadcn-vue.',
    ogTitle: 'mapcn-vue - Beautiful maps for Vue',
    ogDescription:
      'Beautiful map components for Vue. Built on @geoql/v-maplibre, styled with Tailwind CSS, works with shadcn-vue.',
    ogType: 'website',
    ogSiteName: 'mapcn-vue',
    twitterCard: 'summary_large_image',
    twitterTitle: 'mapcn-vue - Beautiful maps for Vue',
    twitterDescription:
      'Beautiful map components for Vue. Built on @geoql/v-maplibre, styled with Tailwind CSS, works with shadcn-vue.',
  });

  const { library } = useRuntimeConfig().public;

  const releasedAtTitle = computed(() =>
    new Intl.DateTimeFormat('en-US', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(library.releasedAt)),
  );

  defineOgImage('MapcnDoc', {
    title: 'Beautiful maps, made simple.',
    description:
      'Map components for Vue. Built on MapLibre, styled with Tailwind CSS.',
  });

  const { copy, copied } = useClipboard({
    source: 'npx shadcn-vue@latest add https://mapcn-vue.geoql.in/r/map',
  });
</script>

<template>
  <div class="hide-scrollbar min-h-dvh overflow-y-auto">
    <!-- Hero — asymmetric 8/4 grid, viewport-filling, CTA above fold -->
    <section
      class="relative grid min-h-dvh grid-cols-1 border-b border-border/60 lg:grid-cols-[8fr_4fr]"
    >
      <div
        class="flex flex-col justify-between px-6 pt-16 pb-12 md:px-12 md:pt-24 lg:px-16 lg:pb-16"
      >
        <div>
          <div
            class="mb-8 inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] text-primary uppercase"
          >
            <span class="relative flex size-1.5">
              <span
                class="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60"
              ></span>
              <span
                class="relative inline-flex size-1.5 rounded-full bg-primary"
              ></span>
            </span>
            <span>
              v{{ library.version }} — released
              <NuxtTime
                :datetime="library.releasedAt"
                relative
                numeric="auto"
                relative-style="long"
                :title="releasedAtTitle"
              />
            </span>
          </div>

          <h1
            class="text-5xl leading-[0.92] font-extrabold tracking-[-0.045em] text-foreground sm:text-6xl md:text-7xl lg:text-[clamp(64px,8vw,120px)]"
          >
            Maps for Vue.<br />
            <span class="text-muted-foreground">Without the boilerplate.</span>
          </h1>

          <p
            class="mt-8 max-w-[52ch] text-base leading-[1.55] text-muted-foreground md:text-lg"
          >
            Production map components built on
            <a
              href="https://maplibre.org"
              class="font-medium text-foreground underline-offset-4 hover:underline"
              >MapLibre&nbsp;GL</a
            >
            and
            <a
              href="https://deck.gl"
              class="font-medium text-foreground underline-offset-4 hover:underline"
              >deck.gl</a
            >. Tokenized with Tailwind v4. Shipped via shadcn-vue. Typed
            end-to-end. One command. Zero config.
          </p>

          <div class="mt-10 flex flex-wrap items-center gap-3">
            <NuxtLink
              to="/docs/introduction"
              class="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-[filter] hover:brightness-110"
            >
              Read the docs
              <Icon name="lucide:arrow-right" class="size-4" />
            </NuxtLink>
            <NuxtLink
              to="/examples"
              class="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-transparent px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Browse examples
            </NuxtLink>
          </div>

          <button
            class="mt-8 inline-flex max-w-full items-center gap-3 rounded-md border border-border bg-card px-4 py-3 font-mono text-xs transition-colors hover:bg-muted sm:text-[13px]"
            @click="copy()"
          >
            <span class="text-primary">$</span>
            <code class="truncate text-foreground"
              >npx shadcn-vue@latest add https://mapcn-vue.geoql.in/r/map</code
            >
            <span
              class="ml-auto inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase"
            >
              <Icon
                :name="copied ? 'lucide:check' : 'lucide:copy'"
                class="size-3.5"
                :class="copied ? 'text-success' : ''"
              />
              {{ copied ? 'copied' : 'copy' }}
            </span>
          </button>
        </div>

        <!-- Hero metric row — tabular numerals, mono labels -->
        <dl class="mt-16 grid grid-cols-3 gap-8 border-t border-border/60 pt-8">
          <div class="flex flex-col gap-1">
            <dt
              class="font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase"
            >
              Live examples
            </dt>
            <dd
              class="font-mono text-2xl font-medium tabular-nums tracking-tight text-foreground md:text-3xl"
            >
              42
            </dd>
          </div>
          <div class="flex flex-col gap-1">
            <dt
              class="font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase"
            >
              Components
            </dt>
            <dd
              class="font-mono text-2xl font-medium tabular-nums tracking-tight text-foreground md:text-3xl"
            >
              16
            </dd>
          </div>
          <div class="flex flex-col gap-1">
            <dt
              class="font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase"
            >
              Runtime deps
            </dt>
            <dd
              class="font-mono text-2xl font-medium tabular-nums tracking-tight text-foreground md:text-3xl"
            >
              0
            </dd>
          </div>
        </dl>
      </div>

      <!-- Right panel — live MapLibre instance (distinctive moment: real map, not mockup) -->
      <aside
        class="relative flex flex-col gap-4 border-t border-border/60 bg-card px-6 py-8 lg:border-t-0 lg:border-l lg:p-6"
      >
        <div class="font-mono text-xs tabular-nums text-muted-foreground">
          <div>
            VIEW
            <span class="font-medium text-foreground"
              >37.7749° N, 122.4194° W</span
            >
          </div>
          <div class="mt-1">
            ZOOM <span class="font-medium text-foreground">11.4</span> · BEARING
            <span class="font-medium text-foreground">0°</span> · PITCH
            <span class="font-medium text-foreground">0°</span>
          </div>
        </div>

        <div
          class="relative flex-1 min-h-[320px] overflow-hidden rounded-md border border-border bg-muted"
        >
          <ClientOnly>
            <LazyMapDemo
              :center="[-122.4194, 37.7749]"
              :zoom="11.4"
              :show-scale="true"
            />
            <template #fallback>
              <div
                class="flex size-full items-center justify-center text-muted-foreground"
              >
                <Icon name="lucide:loader-2" class="size-6 animate-spin" />
              </div>
            </template>
          </ClientOnly>
          <div
            class="pointer-events-none absolute top-3 left-3 inline-flex items-center gap-2 rounded-sm border border-border bg-background/85 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase backdrop-blur-sm"
          >
            <span class="relative flex size-1.5">
              <span
                class="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60"
              ></span>
              <span
                class="relative inline-flex size-1.5 rounded-full bg-primary"
              ></span>
            </span>
            live ·
            <span class="font-medium text-primary">VMap component</span>
          </div>
        </div>

        <div
          class="flex justify-between font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase"
        >
          <span>@geoql/v-maplibre</span>
          <span class="text-foreground">{{ '<VMap />' }}</span>
        </div>
      </aside>
    </section>

    <!-- Demo cards (kept as a secondary section, with mono labels, NOT a duplicate hero) -->
    <section class="border-b border-border/60 px-6 py-16 md:px-12 lg:px-16">
      <div class="mx-auto max-w-6xl">
        <div class="mb-8 flex items-baseline justify-between">
          <h2
            class="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl"
          >
            Live demos
          </h2>
          <span
            class="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase"
          >
            / 02 — Production patterns
          </span>
        </div>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div
            class="relative aspect-video overflow-hidden rounded-md border border-border bg-muted md:col-span-2"
          >
            <ClientOnly>
              <LazyActiveUsersDemo />
              <template #fallback>
                <div
                  class="flex size-full items-center justify-center text-muted-foreground"
                >
                  <Icon name="lucide:loader-2" class="size-6 animate-spin" />
                </div>
              </template>
            </ClientOnly>
            <div
              class="absolute top-3 left-3 z-10 rounded-sm border border-border bg-background/85 p-3 backdrop-blur-sm"
            >
              <div
                class="mb-1 font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase"
              >
                Active Users — VLayerDeckglScatterplot
              </div>
              <div
                class="font-mono text-2xl font-medium tabular-nums tracking-tight text-foreground"
              >
                2,847
              </div>
              <div class="mt-1 flex items-center gap-1">
                <Icon name="lucide:trending-up" class="size-3 text-success" />
                <span class="font-mono text-xs tabular-nums text-success"
                  >+12.5%</span
                >
              </div>
            </div>
          </div>

          <div
            class="relative aspect-4/3 overflow-hidden rounded-md border border-border bg-muted"
          >
            <div
              class="absolute top-3 left-3 z-10 rounded-sm border border-border bg-background/85 px-2 py-1 font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase backdrop-blur-sm"
            >
              Global Delivery — VLayerDeckglArc
            </div>
            <ClientOnly>
              <LazyDeliveryDemo />
              <template #fallback>
                <div
                  class="flex size-full items-center justify-center text-muted-foreground"
                >
                  <Icon name="lucide:loader-2" class="size-6 animate-spin" />
                </div>
              </template>
            </ClientOnly>
          </div>

          <div
            class="relative aspect-4/3 overflow-hidden rounded-md border border-border bg-muted"
          >
            <div
              class="absolute top-3 left-3 z-10 rounded-sm border border-border bg-background/85 px-2 py-1 font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase backdrop-blur-sm"
            >
              Trips — VLayerDeckglTrips
            </div>
            <ClientOnly>
              <LazyTripsDemo />
              <template #fallback>
                <div
                  class="flex size-full items-center justify-center text-muted-foreground"
                >
                  <Icon name="lucide:loader-2" class="size-6 animate-spin" />
                </div>
              </template>
            </ClientOnly>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section
      class="border-b border-border/60 px-6 py-16 md:px-12 md:py-20 lg:px-16"
    >
      <div class="mx-auto max-w-6xl">
        <div class="mb-12 flex items-baseline justify-between">
          <h2
            class="max-w-[20ch] text-2xl font-extrabold tracking-tight text-foreground md:text-3xl"
          >
            Everything you need for maps
          </h2>
          <span
            class="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase"
          >
            / 03 — Components
          </span>
        </div>

        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <HomeFeatureCard
            icon="lucide:map-pin"
            title="Core Components"
            description="Map, Markers, Popups, and Navigation Controls. Everything to get started."
          />
          <HomeFeatureCard
            icon="lucide:layers"
            title="MapLibre Layers"
            description="GeoJSON, Vector, Raster, Cluster, PMTiles, Image, Video, and Canvas layers."
          />
          <HomeFeatureCard
            icon="lucide:sparkles"
            title="deck.gl Layers"
            description="High-performance WebGL layers: Scatterplot, Arc, Heatmap, Hexagon, Trips, and more."
          />
          <HomeFeatureCard
            icon="lucide:palette"
            title="Theme Aware"
            description="Dark mode support out of the box with automatic basemap switching."
          />
          <HomeFeatureCard
            icon="lucide:copy"
            title="Copy & Paste"
            description="Add components to your project with a single CLI command. No complex setup."
          />
          <HomeFeatureCard
            icon="lucide:code-2"
            title="TypeScript First"
            description="Full TypeScript support with excellent IDE autocompletion and type safety."
          />
        </div>
      </div>
    </section>

    <!-- Get Started -->
    <section class="px-6 py-16 md:px-12 md:py-20 lg:px-16">
      <div class="mx-auto max-w-6xl">
        <div class="mb-12 flex items-baseline justify-between">
          <h2
            class="max-w-[18ch] text-2xl font-extrabold tracking-tight text-foreground md:text-3xl"
          >
            Get started in seconds
          </h2>
          <span
            class="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase"
          >
            / 04 — Install
          </span>
        </div>
        <div class="grid grid-cols-1 items-end gap-8 md:grid-cols-[5fr_7fr]">
          <p class="text-base text-muted-foreground md:text-lg">
            Add map components to your project with the shadcn-vue CLI. They
            land in your repo, typed end-to-end. Yours to own.
          </p>
          <div
            class="overflow-hidden rounded-md border border-border bg-card text-left"
          >
            <div
              class="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5"
            >
              <div
                class="size-2.5 rounded-full bg-destructive/70"
                aria-hidden="true"
              ></div>
              <div
                class="size-2.5 rounded-full bg-warning/70"
                aria-hidden="true"
              ></div>
              <div
                class="size-2.5 rounded-full bg-success/70"
                aria-hidden="true"
              ></div>
              <span
                class="ml-2 font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase"
                >Terminal</span
              >
            </div>
            <div class="overflow-x-auto p-5">
              <code class="font-mono text-sm whitespace-nowrap text-foreground">
                <span class="text-primary">$</span> npx shadcn-vue@latest add
                https://mapcn-vue.geoql.in/r/map
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
