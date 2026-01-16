# AGENTS.md - @geoql/v-maplibre Library Guide

> **For AI Coding Assistants (Claude Code, Cursor, Copilot, etc.)**
> This file helps AI agents understand the library architecture, conventions, and best practices for @geoql/v-maplibre.

---

## Project Overview

**@geoql/v-maplibre** is a Vue 3 component library for MapLibre GL. It provides reactive, composable map components with full TypeScript support, including 50+ layer components for MapLibre native layers, deck.gl visualization, LiDAR, and more.

### Key Capabilities

- **Core Components**: VMap, VMarker, VPopup
- **MapLibre Layers**: GeoJSON, Vector, Raster, Image, Video, Canvas, Cluster, PMTiles, Route
- **deck.gl Layers**: 30+ visualization layers (Scatterplot, Arc, Hexagon, H3, Trips, etc.)
- **Specialty Layers**: COG/GeoTIFF, Wind particles, LiDAR point clouds
- **Controls**: Navigation, Scale, Geolocate, Fullscreen, Attribution, LiDAR

---

## CRITICAL RULES - NEVER VIOLATE THESE

### Rule #1: All Components Must Use Vue 3 Composition API

```typescript
// CORRECT
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { injectMap } from '../utils/injects';
</script>

// WRONG - Options API
<script lang="ts">
export default {
  data() { ... },
  methods: { ... }
}
</script>
```

### Rule #2: Use `injectMap()` to Access Parent Map

All layer and control components must access the map instance via injection:

```typescript
// CORRECT
const map = injectMap();

// WRONG - Prop drilling
const props = defineProps<{ map: Map }>();
```

### Rule #3: Components Must Handle Lifecycle Properly

```typescript
// CORRECT - Add on mount, remove on unmount
onMounted(() => {
  const mapInstance = map.value;
  if (!mapInstance) return;
  mapInstance.addLayer(layer);
});

onUnmounted(() => {
  const mapInstance = map.value;
  if (!mapInstance) return;
  if (mapInstance.getLayer(props.id)) {
    mapInstance.removeLayer(props.id);
  }
});

// WRONG - Missing cleanup
onMounted(() => {
  map.value?.addLayer(layer);
});
```

### Rule #4: Use TypeScript for All Props and Events

```typescript
// CORRECT - Fully typed
interface Props {
  id: string;
  data: GeoJSONFeatureCollection;
  fillColor?: Color;
}

const props = withDefaults(defineProps<Props>(), {
  fillColor: [0, 0, 255, 200],
});

const emit = defineEmits<{
  click: [info: PickingInfo];
  hover: [info: PickingInfo];
}>();

// WRONG - No types
const props = defineProps(['id', 'data', 'fillColor']);
```

### Rule #5: No `any` Type - Ever

```typescript
// WRONG
const layer: any = new GeoJsonLayer({ ... });

// CORRECT
const layer: GeoJsonLayer<FeatureCollection> = new GeoJsonLayer({ ... });
// Or use specific deck.gl types
import type { GeoJsonLayerProps } from '@deck.gl/layers';
```

### Rule #6: Export All Components from index.ts

Every new component must be exported from `src/index.ts`:

```typescript
// src/index.ts
export { default as VMap } from './map/VMap.vue';
export { default as VMarker } from './markers/VMarker.vue';
export { default as VLayerDeckglScatterplot } from './layers/deckgl/scatterplot/VLayerDeckglScatterplot.vue';
```

### Rule #7: deck.gl Layers Must Use `useDeckOverlay` Composable

```typescript
// CORRECT - Use shared composable
import { useDeckOverlay } from '../_shared/useDeckOverlay';

const { updateLayer, removeLayer } = useDeckOverlay(props.id);

watch(() => props.data, () => {
  updateLayer(createLayer());
});

// WRONG - Direct MapboxOverlay manipulation
import { MapboxOverlay } from '@deck.gl/mapbox';
const overlay = new MapboxOverlay({ ... }); // Don't do this per-layer
```

### Rule #8: Component File Structure

Each component type has a specific directory structure:

```
src/
├── layers/
│   ├── deckgl/
│   │   ├── _shared/
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   └── useDeckOverlay.ts    # Shared composable
│   │   ├── scatterplot/
│   │   │   ├── VLayerDeckglScatterplot.vue
│   │   │   └── index.ts
│   │   └── ...
│   └── index.ts
├── controls/
│   ├── navigation/
│   │   ├── VControlNavigation.vue
│   │   ├── index.ts
│   │   └── types.ts
│   └── ...
└── index.ts
```

---

## Tech Stack

| Component      | Technology                                       |
| -------------- | ------------------------------------------------ |
| **Framework**  | Vue 3.5+ (Composition API)                       |
| **Build**      | Vite 7                                           |
| **Testing**    | Vitest + Vue Test Utils                          |
| **Types**      | TypeScript 5.8+                                  |
| **Linting**    | oxlint                                           |
| **Formatting** | Prettier                                         |
| **Core Dep**   | MapLibre GL JS 5.x                               |
| **Optional**   | deck.gl 9.x, maplibre-gl-lidar, maplibre-gl-wind |

---

## Project Structure

```
packages/v-maplibre/
├── src/
│   ├── constants/
│   │   └── events/
│   │       ├── index.ts
│   │       ├── layer.ts
│   │       ├── map.ts
│   │       ├── marker.ts
│   │       └── popup.ts
│   ├── controls/
│   │   ├── attribution/
│   │   ├── fullscreen/
│   │   ├── geolocate/
│   │   ├── lidar/
│   │   ├── navigation/
│   │   ├── scale/
│   │   └── index.ts
│   ├── layers/
│   │   ├── deckgl/
│   │   │   ├── _shared/           # Shared composables
│   │   │   ├── cog/
│   │   │   ├── contour/
│   │   │   ├── geohash/
│   │   │   ├── geojson/
│   │   │   ├── great-circle/
│   │   │   ├── grid/
│   │   │   ├── h3-cluster/
│   │   │   ├── h3-hexagon/
│   │   │   ├── hexagon/
│   │   │   ├── path/
│   │   │   ├── point-cloud/
│   │   │   ├── polygon/
│   │   │   ├── quadkey/
│   │   │   ├── s2/
│   │   │   ├── screen-grid/
│   │   │   ├── simple-mesh/
│   │   │   ├── solid-polygon/
│   │   │   ├── terrain/
│   │   │   ├── tile/
│   │   │   ├── tile-3d/
│   │   │   ├── trips/
│   │   │   ├── wind-particle/
│   │   │   └── wms/
│   │   └── index.ts
│   ├── map/
│   │   └── VMap.vue
│   ├── markers/
│   │   └── VMarker.vue
│   ├── popups/
│   │   └── VPopup.vue
│   ├── utils/
│   │   ├── index.ts
│   │   ├── injects.ts            # provide/inject utilities
│   │   └── symbols.ts            # InjectionKey symbols
│   └── index.ts                  # Main export
│
├── test/
│   ├── controls/
│   ├── layers/
│   ├── map/
│   ├── markers/
│   ├── utils/
│   ├── index.test.ts
│   └── setup.ts
│
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
├── tsconfig.build.json
└── package.json
```

---

## Component Patterns

### Core Component (VMap)

```vue
<script setup lang="ts">
  import { ref, onMounted, onUnmounted, provide, watch } from 'vue';
  import maplibregl, { type Map, type MapOptions } from 'maplibre-gl';
  import { MAP_INJECTION_KEY } from '../utils/symbols';

  interface Props {
    options: MapOptions;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    load: [map: Map];
    click: [e: maplibregl.MapMouseEvent];
  }>();

  const mapContainer = ref<HTMLDivElement | null>(null);
  const map = ref<Map | null>(null);

  provide(MAP_INJECTION_KEY, map);

  onMounted(() => {
    if (!mapContainer.value) return;

    map.value = new maplibregl.Map({
      container: mapContainer.value,
      ...props.options,
    });

    map.value.on('load', () => emit('load', map.value!));
  });

  onUnmounted(() => {
    map.value?.remove();
  });
</script>
```

### deck.gl Layer Component

```vue
<script setup lang="ts">
  import { watch, onMounted, onUnmounted } from 'vue';
  import { ScatterplotLayer } from '@deck.gl/layers';
  import type { Color, PickingInfo } from '@deck.gl/core';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';
  import { injectMap } from '../../utils/injects';

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
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();

  const map = injectMap();
  const { updateLayer, removeLayer } = useDeckOverlay(props.id);

  function createLayer() {
    return new ScatterplotLayer({
      id: props.id,
      data: props.data,
      getPosition: props.getPosition,
      getRadius: props.getRadius,
      getFillColor: props.getFillColor,
      radiusMinPixels: props.radiusMinPixels,
      pickable: props.pickable,
      onClick: (info) => emit('click', info),
      onHover: (info) => emit('hover', info),
    });
  }

  onMounted(() => {
    updateLayer(createLayer());
  });

  watch(
    () => [props.data, props.getRadius, props.getFillColor],
    () => {
      updateLayer(createLayer());
    },
  );

  onUnmounted(() => {
    removeLayer();
  });
</script>

<template>
  <slot></slot>
</template>
```

### Control Component

```vue
<script setup lang="ts">
  import { onMounted, onUnmounted } from 'vue';
  import maplibregl from 'maplibre-gl';
  import { injectMap } from '../../utils/injects';

  interface Props {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  }

  const props = withDefaults(defineProps<Props>(), {
    position: 'top-right',
  });

  const map = injectMap();
  let control: maplibregl.NavigationControl | null = null;

  onMounted(() => {
    const mapInstance = map.value;
    if (!mapInstance) return;

    control = new maplibregl.NavigationControl();
    mapInstance.addControl(control, props.position);
  });

  onUnmounted(() => {
    const mapInstance = map.value;
    if (!mapInstance || !control) return;
    mapInstance.removeControl(control);
  });
</script>

<template>
  <slot></slot>
</template>
```

---

## Testing Patterns

### Component Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import VControlNavigation from '../controls/navigation/VControlNavigation.vue';
import { MAP_INJECTION_KEY } from '../utils/symbols';

describe('VControlNavigation', () => {
  it('adds control to map on mount', async () => {
    const mockMap = {
      addControl: vi.fn(),
      removeControl: vi.fn(),
    };

    const wrapper = mount(VControlNavigation, {
      global: {
        provide: {
          [MAP_INJECTION_KEY]: ref(mockMap),
        },
      },
      props: {
        position: 'top-right',
      },
    });

    expect(mockMap.addControl).toHaveBeenCalled();
  });
});
```

---

## Development Commands

```bash
# Development
bun run dev              # Start Vite dev server

# Build
bun run build            # Build library + types

# Testing
bun run test             # Run tests
bun run test:ui          # Test with UI
bun run test:coverage    # Coverage report

# Linting
bun run lint             # Run oxlint
bun run lint:fix         # Fix lint issues

# Formatting
bun run format           # Format with Prettier
bun run format:check     # Check formatting

# From monorepo root
bun run dev:lib          # Watch mode
```

---

## Adding a New Component

### 1. Create Component Directory

```bash
mkdir -p src/layers/deckgl/new-layer
```

### 2. Create Vue Component

```bash
# src/layers/deckgl/new-layer/VLayerDeckglNew.vue
```

### 3. Create Index Export

```typescript
// src/layers/deckgl/new-layer/index.ts
export { default as VLayerDeckglNew } from './VLayerDeckglNew.vue';
```

### 4. Add to Main Exports

```typescript
// src/index.ts
export { VLayerDeckglNew } from './layers/deckgl/new-layer';
```

### 5. Add Tests

```bash
# test/layers/deckgl-new.test.ts
```

---

## AI Assistant Pre-Flight Checklist

Before every code change:

1. **Am I using Vue 3 Composition API?**
   - [ ] `<script setup lang="ts">` syntax?
   - [ ] Proper imports from 'vue'?

2. **Am I accessing the map correctly?**
   - [ ] Using `injectMap()` utility?
   - [ ] NOT prop drilling the map instance?

3. **Am I handling lifecycle?**
   - [ ] `onMounted` to add layer/control?
   - [ ] `onUnmounted` to remove layer/control?

4. **Am I using TypeScript properly?**
   - [ ] Props interface defined?
   - [ ] Emits typed?
   - [ ] No `any` types?

5. **Am I following file structure?**
   - [ ] Component in correct directory?
   - [ ] index.ts export created?
   - [ ] Added to main src/index.ts?

6. **Am I using deck.gl pattern for deck.gl layers?**
   - [ ] Using `useDeckOverlay` composable?
   - [ ] Proper layer ID management?

### Preferred Patterns

1. **Use Composition API** with `<script setup>`
2. **Use `injectMap()`** for map access
3. **Handle cleanup** in `onUnmounted`
4. **Type everything** - props, emits, refs
5. **Use `withDefaults`** for optional props
6. **Export from index.ts** at each level
7. **Write tests** for new components

---

**Last Updated:** 2026-01-16
**Maintainer:** GeoQL Team
