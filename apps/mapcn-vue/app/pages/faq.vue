<script setup lang="ts">
  const { library } = useRuntimeConfig().public;
  const libraryMajor = `${library.version.split('.')[0]}.x`;

  const FAQ_ENTRIES: Array<{ question: string; answer: string }> = [
    {
      question: 'What is mapcn-vue?',
      answer:
        'mapcn-vue is a copy-and-paste component registry for Vue 3 map UI, built on top of @geoql/v-maplibre and styled with Tailwind CSS. Instead of installing a single black-box package, you use the shadcn-vue CLI to copy individual components (Map, Markers, Popups, Controls, deck.gl layers) directly into your project, where you can edit them like any other source file. The core library is on npm as @geoql/v-maplibre.',
    },
    {
      question: 'What are the peer dependencies?',
      answer: `mapcn-vue components require four peers: Vue 3.4+ (Composition API with <script setup>), MapLibre GL JS 5.x (the rendering engine), @geoql/v-maplibre ${libraryMajor} (the Vue wrappers consumed by every component, currently v${library.version}), and Tailwind CSS v4. deck.gl-based components additionally depend on @deck.gl/core, @deck.gl/layers, and @deck.gl/mapbox.`,
    },
    {
      question: 'Does mapcn-vue support Vue 2?',
      answer:
        'No. mapcn-vue requires Vue 3.4 or newer and uses the Composition API exclusively. Vue 2 is past end-of-life and several APIs the components rely on (<script setup>, generic components, defineModel) do not exist in Vue 2. There are no plans to backport.',
    },
    {
      question:
        'What is the difference between MapLibre layers and deck.gl layers?',
      answer:
        'MapLibre layers render through the native WebGL pipeline of MapLibre GL itself and share the same z-order as basemap features, which is the right choice for vector tiles, choropleths, and styled feature layers that need to interleave with the basemap. deck.gl layers render as a WebGL2 overlay on top of the map via @deck.gl/mapbox interleaving and are dramatically faster for large point clouds (hundreds of thousands of features), heatmaps, hexbins, arcs, and 3D geometry. Use MapLibre layers for basemap interleaving or fewer than ~10K features. Use deck.gl layers for heavy point/heatmap/3D workloads.',
    },
    {
      question: 'How do I install a single component?',
      answer:
        'Use the shadcn-vue CLI and point it at the mapcn-vue registry URL: npx shadcn-vue@latest add https://mapcn-vue.geoql.in/r/map. Replace "map" with any component name (marker, popup, control-navigation, layer-heatmap). The CLI copies the component source into your components/ui/ directory, installs missing peer dependencies, and merges any required Tailwind config.',
    },
    {
      question: 'Is mapcn-vue free to use?',
      answer:
        'Yes. mapcn-vue and the underlying @geoql/v-maplibre library are released under the MIT license. You may use, modify, and redistribute them in commercial and non-commercial projects without attribution beyond preserving the MIT license header. MapLibre GL is independently MIT-licensed and deck.gl is BSD-3-Clause-licensed.',
    },
    {
      question: 'Does it work on Cloudflare Pages / Edge?',
      answer:
        'Yes. The showcase site at mapcn-vue.geoql.in is itself a Nuxt 4 application deployed to Cloudflare Pages using the cloudflare-pages Nitro preset, with every example route prerendered to static HTML. Component code is SSR-safe: MapLibre and deck.gl initialization is gated to the client via onMounted, so no window or document access leaks into the server bundle. mapcn-vue runs identically on Vercel, Netlify, Cloudflare Workers, and any Node.js host.',
    },
    {
      question: 'What is the registry URL for shadcn-vue CLI?',
      answer:
        'Every mapcn-vue component is exposed as a JSON manifest at https://mapcn-vue.geoql.in/r/[name].json. For example, the map component manifest lives at https://mapcn-vue.geoql.in/r/map.json. The shadcn-vue CLI fetches this URL, resolves dependencies, and copies the listed files into your project.',
    },
    {
      question: 'How do I contribute?',
      answer:
        'mapcn-vue is developed in the open at github.com/geoql/v-maplibre. Fork the repository, clone your fork, run pnpm install at the monorepo root, create a feature branch, add or modify components under packages/mapcn-vue/src/registry/ui/, run pnpm run lint, pnpm run test, and pnpm run build to verify your changes, then open a pull request against main. Bug reports and feature requests are welcome via GitHub Issues.',
    },
    {
      question: 'How does mapcn-vue relate to @geoql/v-maplibre?',
      answer:
        '@geoql/v-maplibre is the core library published to npm. It provides the low-level Vue 3 wrappers around MapLibre GL JS (VMap, VMarker, VPopup, controls, layer primitives) and the deck.gl integration; you install it with pnpm add @geoql/v-maplibre and import components directly. mapcn-vue is the shadcn-compatible registry layer built on top of @geoql/v-maplibre — instead of importing components from an npm package, you copy pre-styled, pre-themed component source files into your own project via the shadcn-vue CLI. Choose @geoql/v-maplibre for a versioned npm dependency; choose mapcn-vue to own and customize the component source in your repo.',
    },
  ];

  usePageGeo({
    title: 'FAQ — mapcn-vue',
    description:
      'Frequently asked questions about mapcn-vue: installation, peer dependencies, deck.gl vs MapLibre layers, the shadcn-vue registry, Cloudflare Pages support, contributing, and how it relates to @geoql/v-maplibre.',
  });

  useSchemaOrg([
    defineWebPage({ '@type': 'FAQPage' }),
    ...FAQ_ENTRIES.map((entry) =>
      defineQuestion({
        name: entry.question,
        acceptedAnswer: entry.answer,
      }),
    ),
  ]);

  defineOgImage('MapcnDoc', {
    title: 'Frequently Asked Questions',
    description:
      'Answers to the questions developers ask most often about mapcn-vue.',
  });

  const { data: page } = await useAsyncData('faq-page', () =>
    queryCollection('faq').path('/faq').first(),
  );
</script>

<template>
  <div class="relative min-h-dvh">
    <div class="fixed inset-0 -z-10">
      <div class="absolute inset-0 bg-background"></div>
      <div
        class="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[64px_64px] opacity-30"
      ></div>
    </div>

    <div class="container max-w-screen-2xl py-10">
      <main id="main-content" class="min-w-0 flex-1" tabindex="-1">
        <div class="mx-auto max-w-3xl">
          <!-- Header -->
          <div class="mb-12 border-b border-border pb-8">
            <div
              class="mb-4 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-primary uppercase"
            >
              <Icon name="lucide:help-circle" class="size-3" />
              <span>Support</span>
            </div>

            <h1
              class="text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl md:text-5xl"
            >
              {{ page?.title ?? 'Frequently Asked Questions' }}
            </h1>
            <p
              v-if="page?.description"
              class="mt-4 max-w-[60ch] text-lg/relaxed text-muted-foreground"
            >
              {{ page.description }}
            </p>
          </div>

          <!-- Rendered FAQ content -->
          <div class="prose dark:prose-invert max-w-none">
            <ContentRenderer v-if="page" :value="page" />
          </div>

          <!-- Footer / contribute -->
          <div
            class="mt-12 flex items-center justify-between gap-2 border-t border-border pt-6 font-mono text-[11px] tracking-[0.15em] text-muted-foreground uppercase"
          >
            <a
              href="https://github.com/geoql/v-maplibre/edit/main/apps/mapcn-vue/content/faq.md"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 hover:text-foreground"
            >
              <Icon name="lucide:pencil" class="size-3" />
              Edit this page
            </a>
            <a
              href="https://github.com/geoql/v-maplibre/issues/new?labels=documentation"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 hover:text-foreground"
            >
              <Icon name="lucide:circle-dot" class="size-3" />
              Report issue
            </a>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
