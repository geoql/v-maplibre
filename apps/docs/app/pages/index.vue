<script setup lang="ts">
  import { ref } from 'vue';
  import libraryPkg from '../../../../packages/v-maplibre/package.json' with { type: 'json' };

  const INSTALL = 'pnpm add @geoql/v-maplibre maplibre-gl';

  // Split so the SFC parser does not read it as this block's closing tag.
  const SCRIPT_END = ['</', 'script>'].join('');

  const QUICK_START = `<script setup lang="ts">
  import { VMap, VMarker } from '@geoql/v-maplibre';
  import '@geoql/v-maplibre/dist/v-maplibre.css';
  import 'maplibre-gl/dist/maplibre-gl.css';
${SCRIPT_END}

<template>
  <VMap
    :options="{
      style: 'https://demotiles.maplibre.org/style.json',
      center: [77.59, 12.97],
      zoom: 11,
    }"
    style="height: 420px"
  >
    <VMarker :coordinates="[77.59, 12.97]" />
  </VMap>
</template>`;

  const SECTIONS = [
    {
      title: 'Map',
      to: '/components/map',
      body: 'VMap takes every MapLibre GL option and forwards every map event.',
    },
    {
      title: 'Markers & popups',
      to: '/components/markers',
      body: 'Reactive markers and popups with Vue templates inside.',
    },
    {
      title: 'Layers',
      to: '/layers/deckgl-overview',
      body: 'MapLibre and deck.gl layers, including COG, Zarr, H3, S2 and GeoArrow.',
    },
    {
      title: 'Controls',
      to: '/controls/layer',
      body: 'Navigation, scale, geolocate, layer and legend controls, and a LiDAR viewer.',
    },
    {
      title: 'Peer dependencies',
      to: '/guide/peer-dependencies',
      body: 'Install only the packages for the components you import.',
    },
    {
      title: 'Examples',
      to: 'https://mapcn-vue.geoql.in/examples',
      body: 'Over a hundred live examples on mapcn-vue, with their code.',
      external: true,
    },
  ];

  const copied = ref(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  async function copyInstall(): Promise<void> {
    await navigator.clipboard.writeText(INSTALL);
    copied.value = true;
    clearTimeout(timer);
    timer = setTimeout(() => (copied.value = false), 1500);
  }
  onBeforeUnmount(() => clearTimeout(timer));

  useSeoMeta({
    title: 'v-maplibre · Vue 3 components for MapLibre GL',
    description:
      'Vue 3 components for MapLibre GL: maps, markers, popups, controls, MapLibre and deck.gl layers. Fully typed, works with Nuxt 4.',
    ogTitle: 'v-maplibre',
    ogDescription: 'Vue 3 components for MapLibre GL.',
  });
</script>

<template>
  <div>
    <section
      class="relative grid min-h-dvh grid-cols-1 border-b border-border/60 lg:grid-cols-split-8-4"
    >
      <div
        class="flex flex-col justify-center px-6 pt-20 pb-12 md:px-12 lg:px-16"
      >
        <p
          class="mb-6 inline-flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-caption tracking-caps text-primary uppercase"
        >
          <span>@geoql/v-maplibre</span>
          <span class="text-muted-foreground">·</span>
          <span class="tabular-nums">v{{ libraryPkg.version }}</span>
          <span class="text-muted-foreground">·</span>
          <span class="text-muted-foreground">API reference</span>
        </p>

        <h1
          class="text-5xl leading-display font-extrabold tracking-display-tight text-foreground md:text-7xl"
        >
          Vue 3 components<br />
          <span class="text-muted-foreground">for MapLibre GL.</span>
        </h1>

        <p class="mt-6 max-w-xl text-lg/relaxed text-muted-foreground">
          Maps, markers, popups, controls, and MapLibre and deck.gl layers as
          typed Vue components. Works with Nuxt 4 and SSR.
        </p>

        <div
          class="group mt-10 flex max-w-3xl items-start gap-3 border-y border-border py-5"
        >
          <span
            class="font-mono text-install leading-tight text-primary select-none"
            aria-hidden="true"
            >$</span
          >
          <code
            class="min-w-0 flex-1 font-mono text-install leading-tight font-medium tracking-tight text-foreground"
            >{{ INSTALL }}</code
          >
          <button
            type="button"
            :aria-label="copied ? 'Copied' : 'Copy install command'"
            class="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
            :class="copied ? 'text-success' : ''"
            @click="copyInstall"
          >
            <Transition
              mode="out-in"
              enter-active-class="transition-opacity duration-150"
              leave-active-class="transition-opacity duration-150"
              enter-from-class="opacity-0"
              leave-to-class="opacity-0"
            >
              <Icon v-if="copied" key="done" name="lucide:check" class="size-4" />
              <Icon v-else key="copy" name="lucide:copy" class="size-4" />
            </Transition>
          </button>
        </div>

        <div class="mt-8 flex flex-wrap gap-3">
          <NuxtLink
            to="/guide/getting-started"
            class="group/cta inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Get started
            <Icon
              name="lucide:arrow-right"
              class="size-4 transition-transform duration-150 group-hover/cta:translate-x-0.5"
            />
          </NuxtLink>
          <a
            href="https://mapcn-vue.geoql.in/examples"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
          >
            Examples
            <Icon name="lucide:arrow-up-right" class="size-4" />
          </a>
        </div>
      </div>

      <aside
        class="relative flex flex-col justify-center border-t border-border/60 bg-card/40 px-6 py-12 md:px-12 lg:border-t-0 lg:border-l lg:px-8"
      >
        <div class="absolute inset-0 -z-10 bg-grid-faint"></div>
        <p
          class="mb-4 font-mono text-2xs tracking-caps-sm text-muted-foreground uppercase"
        >
          Quick start · App.vue
        </p>
        <pre
          class="overflow-x-auto rounded-md border border-border bg-background p-4 font-mono text-note leading-relaxed text-foreground"
        ><code>{{ QUICK_START }}</code></pre>
        <p
          class="mt-4 font-mono text-2xs tracking-caps-xs text-muted-foreground uppercase tabular-nums"
        >
          12.97° N · 77.59° E
        </p>
      </aside>
    </section>

    <section class="px-6 py-16 md:px-12 lg:px-16">
      <div class="mb-10 flex items-baseline justify-between gap-6">
        <h2
          class="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl"
        >
          What's in the docs
        </h2>
        <span
          class="hidden font-mono text-caption tracking-caps text-muted-foreground uppercase md:inline"
        >
          {{ SECTIONS.length }} entry points
        </span>
      </div>
      <ol class="border-t border-border">
        <li v-for="(section, i) in SECTIONS" :key="section.to">
          <component
            :is="section.external ? 'a' : resolveComponent('NuxtLink')"
            v-bind="
              section.external
                ? { href: section.to, target: '_blank', rel: 'noopener noreferrer' }
                : { to: section.to }
            "
            class="group grid grid-cols-index items-baseline gap-x-4 border-b border-border py-5 transition-colors hover:bg-muted/30 md:grid-cols-index-wide"
          >
            <span
              class="font-mono text-caption tracking-caps text-muted-foreground tabular-nums"
              >{{ String(i + 1).padStart(2, '0') }}</span
            >
            <span class="font-bold text-foreground">{{ section.title }}</span>
            <span
              class="col-start-2 mt-1 text-muted-foreground md:col-start-auto md:mt-0"
              >{{ section.body }}</span
            >
            <Icon
              :name="section.external ? 'lucide:arrow-up-right' : 'lucide:arrow-right'"
              class="hidden size-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground md:block"
            />
          </component>
        </li>
      </ol>
    </section>
  </div>
</template>
