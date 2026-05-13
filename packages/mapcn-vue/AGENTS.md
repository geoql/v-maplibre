# AGENTS.md - mapcn-vue Registry Guide

> **For AI Coding Assistants (Claude Code, Cursor, Copilot, etc.)**
> This file helps AI agents understand the registry architecture, conventions, and best practices for mapcn-vue.

---

## Project Overview

**mapcn-vue** is a shadcn-vue compatible component registry for map components. Users can copy-paste these components into their projects using the shadcn-vue CLI. All components are built on @geoql/v-maplibre and styled with Tailwind CSS.

### Key Capabilities

- **Registry Serving**: Components served via shadcn-vue CLI
- **Theme Support**: Built-in dark/light mode support
- **Tailwind Styling**: All components use Tailwind CSS classes
- **Copy-Paste Ready**: Self-contained components users copy into their projects

---

## Skills Integration & Priority

This package uses **one** project-pinned skill from [`.agents/skills/`](../../.agents/skills/):

| Skill                                                                    | When to Load                                       |
| ------------------------------------------------------------------------ | -------------------------------------------------- |
| [`vue-best-practices`](../../.agents/skills/vue-best-practices/SKILL.md) | Any Vue 3 component / composable / reactivity work |

Registry components ship into the **user's** project via `npx shadcn-vue add ...` — they must work in **any** Vue 3 host (Nuxt, Vite, Vue CLI). For that reason:

- `nuxt-best-practices` / `nuxt-seo-best-practices` / `nuxt-geo-best-practices` do **not** apply — registry components must NEVER import `#imports`, `~/`, or any Nuxt-only API
- `mapcn-vue-design` does **not** apply — the user's app owns its design tokens; registry components must respect whatever `@theme` block the user provides (we only consume `bg-primary` / `text-foreground` / etc.)

**Priority rule: This AGENTS.md ALWAYS takes precedence over generic skills when they conflict.**

### Known Conflicts (AGENTS.md wins)

| Skill Says                                                                   | AGENTS.md Says (Use This)                                                                                                                                               |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Extract reusable logic into shared composables                               | **Don't.** Each component must be self-contained — see Rule #1 below. Shared composables become broken imports in the user's project.                                   |
| Use `useColorMode` from `#imports` (Nuxt auto-import)                        | Use **`useColorMode` from `@vueuse/core`** — registry components must work in plain Vue, not just Nuxt — see Rule #2 below                                              |
| Import from sibling registry components (`import Map from '../map/Map.vue'`) | **Forbidden.** When the user copies one component, they don't get the sibling. Inline what you need — see Rule #1 below                                                 |
| Use `<style scoped>` for component-local styling                             | **Tailwind only**, no `<style>` blocks (one exception: `MapPopup.vue` needs raw CSS because MapLibre renders popups outside Vue's reactivity scope — see Rule #3 below) |
| Hardcode style URLs / colors / configuration                                 | Always **expose customization via props** with sensible defaults — see Rule #4 below                                                                                    |
| Default-export component (`export default Component`)                        | **Named export only** in `index.ts` (`export { default as Map } from './Map.vue'`) — required by shadcn-vue registry builder                                            |
| Use any standard component naming                                            | Components MUST follow `Map{Feature}.vue` pattern — required by the registry builder script                                                                             |

### What Skills Add (Not in AGENTS.md)

- **`vue-best-practices`** — `ref` vs `reactive`, `shallowRef` for large data, `toRaw`/`toRefs` semantics, `v-once`/`v-memo`, proper `:key` usage, single-responsibility composables, Composition-API patterns

---

## CRITICAL RULES - NEVER VIOLATE THESE

### Rule #1: Components Must Be Self-Contained

Each component must work independently after being copied to a user's project:

```vue
<!-- CORRECT - Self-contained imports -->
<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { VMap, VMarker } from '@geoql/v-maplibre';
  import { useColorMode } from '@vueuse/core';
</script>

<!-- WRONG - Importing from other registry components -->
<script setup lang="ts">
  import Map from '../map/Map.vue'; // Won't work in user's project!
</script>
```

### Rule #2: Use @vueuse/core for Color Mode

```typescript
// CORRECT - Standard VueUse
import { useColorMode } from '@vueuse/core';
const colorMode = useColorMode();

const mapStyle = computed(() =>
  colorMode.value === 'dark'
    ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
);

// WRONG - Nuxt-specific (won't work in plain Vue)
import { useColorMode } from '#imports';
```

### Rule #3: Use Tailwind CSS - No Custom CSS

```vue
<!-- CORRECT - Tailwind classes -->
<template>
  <div class="relative h-full w-full overflow-hidden rounded-lg">
    <VMap :options="mapOptions" class="absolute inset-0"></VMap>
  </div>
</template>

<!-- WRONG - Custom CSS -->
<style scoped>
  .map-container {
    position: relative;
    height: 100%;
  }
</style>
```

**Accepted exception:** `MapPopup.vue` uses a `<style>` block because MapLibre renders popup DOM outside Vue's reactivity scope. The popup container is injected by MapLibre GL JS into its own DOM tree, so Tailwind classes applied in `<template>` cannot reach it — raw CSS targeting `.maplibregl-popup-content` is required.

### Rule #4: Props Must Support Customization

```typescript
// CORRECT - Allow style overrides
interface Props {
  center?: [number, number];
  zoom?: number;
  styles?: {
    light: string;
    dark: string;
  };
}

const props = withDefaults(defineProps<Props>(), {
  center: () => [0, 0],
  zoom: 2,
  styles: () => ({
    light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  }),
});

// WRONG - Hardcoded values
const mapStyle =
  'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
```

### Rule #5: Component File Naming

Follow the pattern: `Map{Feature}.vue`

```
registry/new-york/
├── map/
│   ├── Map.vue           # Base map
│   ├── MapMarker.vue     # Marker
│   ├── MapPopup.vue      # Popup
│   ├── MapControls.vue   # Controls wrapper
│   └── index.ts
├── map-layers/
│   ├── MapLayerGeojson.vue
│   ├── MapLayerVector.vue
│   └── index.ts
├── map-deckgl-core/
│   ├── MapLayerScatterplot.vue
│   └── index.ts
```

### Rule #6: Export Pattern in index.ts

```typescript
// CORRECT - Named exports
export { default as Map } from './Map.vue';
export { default as MapMarker } from './MapMarker.vue';
export { default as MapPopup } from './MapPopup.vue';

// WRONG - Default export only
export default { Map, MapMarker, MapPopup };
```

### Rule #7: pnpm Catalog Dependencies (CRITICAL)

All dependency versions are managed centrally via **pnpm workspace catalogs** in `pnpm-workspace.yaml`. **NEVER** use direct version strings in this package's `package.json`.

```jsonc
// CORRECT
"dependencies": {
  "vue": "catalog:",                         // uses default catalog
  "shadcn-vue": "catalog:pkg:mapcn-vue"       // uses named catalog
}

// WRONG - Direct version strings are forbidden
"dependencies": {
  "vue": "^3.5.29",
  "shadcn-vue": "^0.0.4"
}
```

**When adding a new dependency:**

1. Add the version to the `pkg:mapcn-vue` catalog in `pnpm-workspace.yaml` under `catalogs:`
2. Reference it here as `"catalog:pkg:mapcn-vue"`
3. Shared deps (vue, typescript) go in the `default` catalog, reference as `"catalog:"`

---

## Tech Stack

| Component      | Technology                         |
| -------------- | ---------------------------------- |
| **Framework**  | Vue 3 (Composition API)            |
| **Styling**    | Tailwind CSS 4                     |
| **Maps**       | @geoql/v-maplibre                  |
| **Color Mode** | @vueuse/core                       |
| **Registry**   | shadcn-vue compatible              |
| **Build**      | Custom `scripts/build-registry.ts` |

---

## Project Structure

```
packages/mapcn-vue/
├── components.json                # shadcn-vue standard config
├── scripts/
│   └── build-registry.ts         # Custom registry build script
│
├── registry/
│   └── new-york/
│       ├── map/
│       │   ├── Map.vue
│       │   ├── MapMarker.vue
│       │   ├── MapPopup.vue
│       │   ├── MapControls.vue
│       │   └── index.ts
│       ├── map-layers/
│       │   ├── MapLayerGeojson.vue
│       │   ├── MapLayerVector.vue
│       │   ├── MapLayerRaster.vue
│       │   ├── MapLayerCluster.vue
│       │   ├── MapLayerPmtiles.vue
│       │   ├── MapLayerImage.vue
│       │   ├── MapLayerVideo.vue
│       │   ├── MapLayerCanvas.vue
│       │   ├── MapLayerRoute.vue
│       │   └── index.ts
│       ├── map-deckgl-core/
│       │   ├── MapLayerScatterplot.vue
│       │   ├── MapLayerArc.vue
│       │   ├── MapLayerLine.vue
│       │   ├── MapLayerPath.vue
│       │   ├── MapLayerPolygon.vue
│       │   ├── MapLayerGeojson.vue
│       │   ├── MapLayerIcon.vue
│       │   ├── MapLayerText.vue
│       │   ├── MapLayerColumn.vue
│       │   ├── MapLayerBitmap.vue
│       │   ├── MapLayerPointCloud.vue
│       │   ├── MapLayerGridCell.vue
│       │   ├── MapLayerSolidPolygon.vue
│       │   └── index.ts
│       ├── map-deckgl-aggregation/
│       │   ├── MapLayerHeatmap.vue
│       │   ├── MapLayerHexagon.vue
│       │   ├── MapLayerGrid.vue
│       │   ├── MapLayerContour.vue
│       │   ├── MapLayerScreenGrid.vue
│       │   └── index.ts
│       ├── map-deckgl-geo/
│       │   ├── MapLayerTrips.vue
│       │   ├── MapLayerMVT.vue
│       │   ├── MapLayerTile.vue
│       │   ├── MapLayerTile3D.vue
│       │   ├── MapLayerTerrain.vue
│       │   ├── MapLayerH3Hexagon.vue
│       │   ├── MapLayerH3Cluster.vue
│       │   ├── MapLayerGreatCircle.vue
│       │   ├── MapLayerWMS.vue
│       │   ├── MapLayerS2.vue
│       │   ├── MapLayerGeohash.vue
│       │   ├── MapLayerQuadkey.vue
│       │   └── index.ts
│       ├── map-deckgl-mesh/
│       │   ├── MapLayerSimpleMesh.vue
│       │   ├── MapLayerScenegraph.vue
│       │   └── index.ts
│       ├── map-deckgl-raster/
│       │   ├── MapLayerCOG.vue
│       │   └── index.ts
│       ├── map-deckgl-wind/
│       │   ├── MapLayerWindParticle.vue
│       │   └── index.ts
│       └── map-control-lidar/
│           ├── MapControlLidar.vue
│           └── index.ts
│
├── public/
│   └── r/                         # Generated by build-registry.ts
│       ├── registry.json          # Registry index (9 items)
│       ├── map.json
│       ├── map-layers.json
│       ├── map-deckgl-core.json
│       ├── map-deckgl-aggregation.json
│       ├── map-deckgl-geo.json
│       ├── map-deckgl-mesh.json
│       ├── map-deckgl-raster.json
│       ├── map-deckgl-wind.json
│       └── map-control-lidar.json
│
├── package.json
├── tsconfig.json
├── AGENTS.md
└── README.md
```

---

## Build System

The registry JSON files in `public/r/` are generated by a custom build script, following the same pattern as nxui.

### How It Works

1. **Source of truth:** `scripts/build-registry.ts` contains hardcoded metadata (title, description, dependencies, registryDependencies) for each component group.
2. **Source files:** `registry/new-york/{slug}/` contains the actual `.vue` and `.ts` files.
3. **Build process:** The script reads all files from each component folder, embeds their full content into registry JSON, and writes to `public/r/`.
4. **Output:** Individual `{slug}.json` files + a master `registry.json` index.

### Build Command

```bash
pnpm --filter @geoql/mapcn-vue run build  # Runs scripts/build-registry.ts via tsx
```

### Registry JSON Format

**`public/r/registry.json` (Index):**

```json
{
  "$schema": "https://shadcn-vue.com/schema/registry.json",
  "name": "mapcn-vue",
  "homepage": "https://mapcn-vue.geoql.in",
  "items": [
    {
      "name": "map",
      "type": "registry:ui",
      "title": "Map",
      "description": "..."
    }
  ]
}
```

**`public/r/map.json` (Component):**

```json
{
  "$schema": "https://shadcn-vue.com/schema/registry-item.json",
  "name": "map",
  "type": "registry:ui",
  "title": "Map",
  "description": "A theme-aware MapLibre map component...",
  "dependencies": ["@geoql/v-maplibre", "maplibre-gl", "@vueuse/core"],
  "files": [
    {
      "path": "registry/new-york/map/Map.vue",
      "content": "<script setup lang=\"ts\">...",
      "type": "registry:ui",
      "target": "components/ui/map/Map.vue"
    }
  ]
}
```

### Target Path Convention

All components use a consistent target path pattern:

```
components/ui/{slug}/{FileName}.vue
```

For example:

- `map/Map.vue` → `components/ui/map/Map.vue`
- `map-layers/MapLayerGeojson.vue` → `components/ui/map-layers/MapLayerGeojson.vue`
- `map-deckgl-core/MapLayerScatterplot.vue` → `components/ui/map-deckgl-core/MapLayerScatterplot.vue`

---

## Component Patterns

### Base Map Component

```vue
<script setup lang="ts">
  import { computed } from 'vue';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';
  import { useColorMode } from '@vueuse/core';
  import type { MapOptions } from 'maplibre-gl';

  interface Props {
    center?: [number, number];
    zoom?: number;
    styles?: {
      light: string;
      dark: string;
    };
  }

  const props = withDefaults(defineProps<Props>(), {
    center: () => [0, 0],
    zoom: 2,
    styles: () => ({
      light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    }),
  });

  const colorMode = useColorMode();

  const mapOptions = computed<MapOptions>(() => ({
    style: colorMode.value === 'dark' ? props.styles.dark : props.styles.light,
    center: props.center,
    zoom: props.zoom,
  }));
</script>

<template>
  <div class="relative h-full w-full overflow-hidden">
    <VMap :options="mapOptions" class="absolute inset-0">
      <slot></slot>
    </VMap>
  </div>
</template>
```

### Layer Component Wrapper

```vue
<script setup lang="ts">
  import { VLayerDeckglScatterplot } from '@geoql/v-maplibre';
  import type { Color, PickingInfo } from '@deck.gl/core';

  interface Props {
    id: string;
    data: unknown[];
    getPosition: (d: unknown) => [number, number];
    getRadius?: (d: unknown) => number;
    getFillColor?: Color | ((d: unknown) => Color);
    radiusMinPixels?: number;
    pickable?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    radiusMinPixels: 1,
    pickable: false,
    getFillColor: () => [59, 130, 246, 200], // Tailwind blue-500
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglScatterplot
    :id="id"
    :data="data"
    :get-position="getPosition"
    :get-radius="getRadius"
    :get-fill-color="getFillColor"
    :radius-min-pixels="radiusMinPixels"
    :pickable="pickable"
    @click="emit('click', $event)"
    @hover="emit('hover', $event)"
  ></VLayerDeckglScatterplot>
</template>
```

---

## Development Commands

```bash
# Build registry (generates public/r/*.json)
pnpm --filter @geoql/mapcn-vue run build

# Linting
pnpm --filter @geoql/mapcn-vue run lint             # Run oxlint

# From monorepo root
pnpm run build            # Builds all packages including this
```

---

## Adding a New Component

### 1. Create Component Folder

```bash
mkdir -p registry/new-york/map-new-feature
```

### 2. Create Component File(s)

```bash
# Create MapNewFeature.vue in the folder
# Create index.ts with named exports
```

### 3. Add Metadata to Build Script

Edit `scripts/build-registry.ts` and add an entry to the `COMPONENTS` map:

```typescript
'map-new-feature': {
  title: 'New Feature',
  description: 'Description of the new feature component.',
  deps: ['@geoql/v-maplibre', 'maplibre-gl'],
  registryDeps: ['https://mapcn-vue.geoql.in/r/map.json'],
},
```

### 4. Rebuild Registry

```bash
pnpm --filter @geoql/mapcn-vue run build
```

This regenerates `public/r/map-new-feature.json` and updates `public/r/registry.json`.

---

## AI Assistant Pre-Flight Checklist

Before every code change:

1. **Is component self-contained?**
   - [ ] All imports from npm packages, not relative?
   - [ ] No dependencies on other registry components?

2. **Is color mode handled correctly?**
   - [ ] Using `@vueuse/core` useColorMode?
   - [ ] Light/dark styles configurable via props?

3. **Is styling Tailwind-only?**
   - [ ] No `<style>` blocks (except MapPopup exception)?
   - [ ] All styling via class attributes?

4. **Are props customizable?**
   - [ ] Default values provided?
   - [ ] Style URLs overridable?

5. **Is export correct?**
   - [ ] Named export in index.ts?
   - [ ] Follows `Map{Feature}.vue` naming?

6. **Is the build script updated?**
   - [ ] New component added to `COMPONENTS` map in `scripts/build-registry.ts`?
   - [ ] `pnpm --filter @geoql/mapcn-vue run build` regenerated `public/r/` successfully?

### Preferred Patterns

1. **Self-contained components** - No internal cross-references
2. **VueUse for utilities** - `useColorMode`, `useMediaQuery`, etc.
3. **Tailwind classes only** - No scoped CSS
4. **Sensible defaults** - Components work out of the box
5. **Prop-based customization** - Allow users to override styles
6. **Named exports** - Not default exports

---

**Last Updated:** 2026-05-12
**Maintainer:** GeoQL Team
