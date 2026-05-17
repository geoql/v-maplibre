---
title: Frequently Asked Questions
description: Common questions about mapcn-vue, the shadcn-compatible map component registry for Vue 3 powered by MapLibre GL and deck.gl.
---

# Frequently Asked Questions

Answers to the questions developers ask most often about mapcn-vue, installation, peer dependencies, the shadcn-vue registry, and how it relates to the underlying [@geoql/v-maplibre](https://www.npmjs.com/package/@geoql/v-maplibre) library.

## What is mapcn-vue?

mapcn-vue is a copy-and-paste component registry for Vue 3 map UI, built on top of [@geoql/v-maplibre](https://www.npmjs.com/package/@geoql/v-maplibre) and styled with Tailwind CSS. Instead of installing a single black-box package, you use the [shadcn-vue](https://shadcn-vue.com) CLI to copy individual components (Map, Markers, Popups, Controls, deck.gl layers) directly into your project, where you can edit them like any other source file. mapcn-vue is published as a registry at [`https://mapcn-vue.geoql.in`](https://mapcn-vue.geoql.in) and the core library is on npm as [`@geoql/v-maplibre`](https://www.npmjs.com/package/@geoql/v-maplibre).

## What are the peer dependencies?

mapcn-vue components require four peers in your host project:

- **Vue 3.4+** (Composition API, `<script setup>` syntax)
- **MapLibre GL JS 5.x** (the rendering engine)
- **@geoql/v-maplibre 0.x** (the Vue wrappers consumed by every component)
- **Tailwind CSS v4** (for styling, with the shadcn-vue token system)

deck.gl-based components additionally depend on `@deck.gl/core`, `@deck.gl/layers`, and `@deck.gl/mapbox`. The shadcn-vue CLI prints the exact `pnpm add` command for each component you copy.

## Does mapcn-vue support Vue 2?

No. mapcn-vue requires Vue 3.4 or newer and uses the Composition API exclusively. Vue 2 is past end-of-life and several APIs the components rely on (`<script setup>`, generic components, `defineModel`, the reactivity transform-free ref system) do not exist in Vue 2. There are no plans to backport.

## What is the difference between MapLibre layers and deck.gl layers?

mapcn-vue ships two layer families, and the right choice depends on data volume and visual fidelity:

- **MapLibre layers** render through the native WebGL pipeline of MapLibre GL itself. They share the same z-order as basemap features, support every MapLibre paint and layout property, and are the right choice for vector tiles, choropleths, and styled feature layers that need to interleave with the basemap.
- **deck.gl layers** render as a WebGL2 overlay on top of the map via the `@deck.gl/mapbox` interleaving API. They are dramatically faster for large point clouds (hundreds of thousands of features), heatmaps, hexbins, arcs, and 3D geometry, and they expose richer GPU-accelerated visual encodings (extrusions, GPU aggregation, picking). The tradeoff is that deck.gl layers always render above MapLibre layers in the same group and require slightly more memory.

Use MapLibre layers when you need basemap interleaving or fewer than ~10K features. Use deck.gl layers for heavy point/heatmap/3D workloads.

## How do I install a single component?

Use the shadcn-vue CLI and point it at the mapcn-vue registry URL:

```bash
npx shadcn-vue@latest add https://mapcn-vue.geoql.in/r/map
```

Replace `map` with any component name (`marker`, `popup`, `control-navigation`, `layer-heatmap`, etc.). The CLI copies the component source into your `components/ui/` directory, installs missing peer dependencies, and merges any required Tailwind config. You can browse the full component catalog on the [registry index](https://mapcn-vue.geoql.in/r).

## Is mapcn-vue free to use?

Yes. mapcn-vue and the underlying [@geoql/v-maplibre](https://www.npmjs.com/package/@geoql/v-maplibre) library are released under the **MIT license**. You may use, modify, and redistribute them in commercial and non-commercial projects without attribution beyond preserving the MIT license header. The MapLibre GL and deck.gl peers are independently MIT-licensed and BSD-3-Clause-licensed respectively.

## Does it work on Cloudflare Pages / Edge?

Yes. The showcase site at [mapcn-vue.geoql.in](https://mapcn-vue.geoql.in) is itself a Nuxt 4 application deployed to Cloudflare Pages using the `cloudflare-pages` Nitro preset, with every example route prerendered to static HTML. Component code is SSR-safe: MapLibre and deck.gl initialization is gated to the client via `onMounted`, so no `window` or `document` access leaks into the server bundle. mapcn-vue runs identically on Vercel, Netlify, Cloudflare Workers, and any Node.js host.

## What is the registry URL for shadcn-vue CLI?

Every mapcn-vue component is exposed as a JSON manifest at:

```
https://mapcn-vue.geoql.in/r/[name].json
```

For example, the map component manifest lives at [`https://mapcn-vue.geoql.in/r/map.json`](https://mapcn-vue.geoql.in/r/map.json). The shadcn-vue CLI fetches this URL, resolves dependencies, and copies the listed files into your project. You can also configure the registry once in your `components.json` so that `npx shadcn-vue@latest add map` resolves against mapcn-vue by default.

## How do I contribute?

mapcn-vue is developed in the open at [github.com/geoql/v-maplibre](https://github.com/geoql/v-maplibre). To contribute:

1. **Fork** the repository
2. **Clone** your fork and run `pnpm install` at the monorepo root
3. **Create a feature branch** (`git checkout -b feat/my-component`)
4. **Add or modify** components under `packages/mapcn-vue/src/registry/ui/`
5. **Run** `pnpm run lint`, `pnpm run test`, and `pnpm run build` to verify your changes
6. **Open a pull request** against `main` with a clear description and screenshots for visual changes

Bug reports and feature requests are welcome via [GitHub Issues](https://github.com/geoql/v-maplibre/issues). The full contributor guide lives in `AGENTS.md` at the repo root.

## How does mapcn-vue relate to @geoql/v-maplibre?

The two packages are complementary layers in the same stack:

- **[@geoql/v-maplibre](https://www.npmjs.com/package/@geoql/v-maplibre)** is the **core library** published to npm. It provides the low-level Vue 3 wrappers around MapLibre GL JS (`VMap`, `VMarker`, `VPopup`, controls, layer primitives) and the deck.gl integration. You install it with `pnpm add @geoql/v-maplibre` and import components directly.
- **mapcn-vue** is the **shadcn-compatible registry layer** built on top of `@geoql/v-maplibre`. Instead of importing components from an npm package, you copy pre-styled, pre-themed component source files into your own project via the shadcn-vue CLI. Every mapcn-vue component is a thin, Tailwind-styled, token-aware wrapper around the equivalent `@geoql/v-maplibre` primitive.

Choose `@geoql/v-maplibre` when you want a versioned dependency you can upgrade with `pnpm update`. Choose mapcn-vue when you want to own and customize the component source code in your repo.
