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
src/registry/ui/
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

---

## Tech Stack

| Component      | Technology              |
| -------------- | ----------------------- |
| **Framework**  | Vue 3 (Composition API) |
| **Styling**    | Tailwind CSS 4          |
| **Maps**       | @geoql/v-maplibre       |
| **Color Mode** | @vueuse/core            |
| **Registry**   | shadcn-vue compatible   |

---

## Project Structure

```
packages/mapcn-vue/
├── src/
│   └── registry/
│       └── ui/
│           ├── map/
│           │   ├── Map.vue
│           │   ├── MapMarker.vue
│           │   ├── MapPopup.vue
│           │   ├── MapControls.vue
│           │   └── index.ts
│           ├── map-layers/
│           │   ├── MapLayerGeojson.vue
│           │   ├── MapLayerVector.vue
│           │   ├── MapLayerRaster.vue
│           │   ├── MapLayerCluster.vue
│           │   ├── MapLayerPmtiles.vue
│           │   ├── MapLayerImage.vue
│           │   ├── MapLayerVideo.vue
│           │   ├── MapLayerCanvas.vue
│           │   ├── MapLayerRoute.vue
│           │   └── index.ts
│           ├── map-deckgl-core/
│           │   ├── MapLayerScatterplot.vue
│           │   ├── MapLayerArc.vue
│           │   ├── MapLayerLine.vue
│           │   ├── MapLayerPath.vue
│           │   ├── MapLayerPolygon.vue
│           │   ├── MapLayerGeojson.vue
│           │   ├── MapLayerIcon.vue
│           │   ├── MapLayerText.vue
│           │   ├── MapLayerColumn.vue
│           │   ├── MapLayerBitmap.vue
│           │   ├── MapLayerPointCloud.vue
│           │   ├── MapLayerGridCell.vue
│           │   ├── MapLayerSolidPolygon.vue
│           │   └── index.ts
│           ├── map-deckgl-aggregation/
│           │   ├── MapLayerHeatmap.vue
│           │   ├── MapLayerHexagon.vue
│           │   ├── MapLayerGrid.vue
│           │   ├── MapLayerContour.vue
│           │   ├── MapLayerScreenGrid.vue
│           │   └── index.ts
│           ├── map-deckgl-geo/
│           │   ├── MapLayerTrips.vue
│           │   ├── MapLayerMVT.vue
│           │   ├── MapLayerTile.vue
│           │   ├── MapLayerTile3D.vue
│           │   ├── MapLayerTerrain.vue
│           │   ├── MapLayerH3Hexagon.vue
│           │   ├── MapLayerH3Cluster.vue
│           │   ├── MapLayerGreatCircle.vue
│           │   ├── MapLayerWMS.vue
│           │   ├── MapLayerS2.vue
│           │   ├── MapLayerGeohash.vue
│           │   ├── MapLayerQuadkey.vue
│           │   └── index.ts
│           ├── map-deckgl-mesh/
│           │   ├── MapLayerSimpleMesh.vue
│           │   ├── MapLayerScenegraph.vue
│           │   └── index.ts
│           ├── map-deckgl-raster/
│           │   ├── MapLayerCOG.vue
│           │   └── index.ts
│           ├── map-deckgl-wind/
│           │   ├── MapLayerWindParticle.vue
│           │   └── index.ts
│           └── map-control-lidar/
│               ├── MapControlLidar.vue
│               └── index.ts
│
├── public/
│   └── r/
│       ├── registry.json          # Registry index
│       ├── map.json               # map component registry
│       ├── map-layers.json        # map-layers registry
│       └── ...
│
├── registry.json                  # shadcn-vue registry config
└── package.json
```

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

## Registry JSON Format

The `public/r/` directory contains pre-built registry JSON files served by the showcase app.

### registry.json (Index)

```json
{
  "$schema": "https://shadcn-vue.com/schema/registry.json",
  "name": "mapcn-vue",
  "baseUrl": "https://mapcn-vue.geoql.in/r",
  "items": [
    {
      "name": "map",
      "type": "registry:ui",
      "title": "Map",
      "description": "Theme-aware MapLibre map with controls"
    }
  ]
}
```

### Component Registry (map.json)

```json
{
  "$schema": "https://shadcn-vue.com/schema/registry-item.json",
  "name": "map",
  "type": "registry:ui",
  "title": "Map",
  "description": "Theme-aware MapLibre map component",
  "dependencies": ["@geoql/v-maplibre", "maplibre-gl", "@vueuse/core"],
  "files": [
    {
      "path": "map/Map.vue",
      "type": "registry:ui",
      "target": "components/ui/map/Map.vue",
      "content": "..."
    }
  ]
}
```

---

## Development Commands

```bash
# Build registry
bun run build            # Build with shadcn-vue

# Linting
bun run lint             # Run oxlint

# From monorepo root
bun run build            # Builds all packages including this
```

---

## Adding a New Component

### 1. Create Component

```bash
mkdir -p src/registry/ui/map-new
# Create MapNewFeature.vue
```

### 2. Create index.ts

```typescript
// src/registry/ui/map-new/index.ts
export { default as MapNewFeature } from './MapNewFeature.vue';
```

### 3. Add to Registry

Update `public/r/map-new.json` with component metadata and files.

### 4. Update Registry Index

Add entry to `public/r/registry.json`.

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
   - [ ] No `<style>` blocks?
   - [ ] All styling via class attributes?

4. **Are props customizable?**
   - [ ] Default values provided?
   - [ ] Style URLs overridable?

5. **Is export correct?**
   - [ ] Named export in index.ts?
   - [ ] Follows `Map{Feature}.vue` naming?

### Preferred Patterns

1. **Self-contained components** - No internal cross-references
2. **VueUse for utilities** - `useColorMode`, `useMediaQuery`, etc.
3. **Tailwind classes only** - No scoped CSS
4. **Sensible defaults** - Components work out of the box
5. **Prop-based customization** - Allow users to override styles
6. **Named exports** - Not default exports

---

**Last Updated:** 2026-01-16
**Maintainer:** GeoQL Team
