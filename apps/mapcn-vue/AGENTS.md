# AGENTS.md - mapcn-vue Development Guide

> **For AI Coding Assistants (Claude Code, Cursor, Copilot, etc.)**
> This file helps AI agents understand the codebase architecture, conventions, and best practices for the mapcn-vue showcase site.

---

## Project Overview

**mapcn-vue** is the showcase and documentation site for the mapcn-vue component library. It demonstrates beautiful, theme-aware map components for Vue, built on @geoql/v-maplibre and styled with Tailwind CSS. The site also serves as a shadcn-vue compatible component registry.

### Key Capabilities

- **Component Showcase**: Interactive examples of 50+ map components (MapLibre native, deck.gl, LiDAR)
- **Registry API**: Serves shadcn-vue compatible components at `/r/[name]`
- **Documentation**: Markdown-based docs via @nuxt/content
- **Theme Support**: Full dark/light mode with system preference detection
- **Live Examples**: Interactive map demos with code snippets

---

## CRITICAL RULES - NEVER VIOLATE THESE

> **STOP AND READ BEFORE WRITING ANY CODE**
>
> These rules are **NON-NEGOTIABLE**. Violating them causes frustration and wasted time.

### Rule #1: NEVER Define Types/Interfaces Inline

**NEVER define `interface` or `type` inside:**

- Vue components (`.vue` files)
- Composables (`composables/**/*.ts`)
- API layer (`utils/api/**/*.ts`)
- Server utils (`server/utils/**/*.ts`)
- Server endpoints (`server/routes/**/*.ts`)

**ALWAYS place types in the correct dedicated directory:**

| Type Category         | Location        | Import Path   | Examples                                     |
| --------------------- | --------------- | ------------- | -------------------------------------------- |
| **Frontend UI types** | `app/types/`    | `~/types/...` | Form state, component props, map layer types |
| **Server-only types** | `server/types/` | Internal      | API response types, middleware context       |

```typescript
// WRONG - Types in components
// app/pages/examples/maplibre-route.vue
interface RoutePoint {  // NO! Types don't belong in components!
  lat: number;
  lng: number;
}

// WRONG - Types in composables
// app/composables/use-map-state.ts
export interface MapState { ... }  // NO! Types don't belong in composables!

// CORRECT - Types in dedicated files
// app/types/map.ts
export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface MapState {
  center: [number, number];
  zoom: number;
}

// Then import correctly:
import type { RoutePoint, MapState } from '~/types/map';
```

### Rule #2: Use @geoql/v-maplibre Components - Not Raw MapLibre

**Always use the Vue component wrappers from @geoql/v-maplibre:**

```vue
<!-- WRONG - Raw MapLibre setup -->
<script setup>
  import maplibregl from 'maplibre-gl';
  onMounted(() => {
    const map = new maplibregl.Map({ ... });
  });
</script>

<!-- CORRECT - Use v-maplibre components -->
<script setup>
  import { VMap, VMarker, VControlNavigation } from '@geoql/v-maplibre';
</script>

<template>
  <VMap :options="mapOptions">
    <VMarker :lng-lat="[-74.5, 40]" />
    <VControlNavigation position="top-right" />
  </VMap>
</template>
```

### Rule #3: Follow Import Paths Strictly

**Use the correct import aliases for this Nuxt project:**

```typescript
// CORRECT imports
import type { RoutePoint } from '~/types/map'; // Frontend types
import { useMapState } from '~/composables/use-map'; // Composables
import { cn } from '~/lib/utils'; // Utilities

// WRONG imports - Don't use relative paths for cross-directory imports
import type { RoutePoint } from '../../../types/map'; // NO! Use ~/types
import { useMapState } from '../../composables/use-map'; // NO! Use ~/composables
```

**Import path conventions:**

| Alias | Points To    | Use For                                    |
| ----- | ------------ | ------------------------------------------ |
| `~/`  | `app/`       | Frontend code (types, composables, utils)  |
| `~~/` | Project root | Server utils (rarely needed in components) |
| `@/`  | `app/`       | Alternative to `~/` (both work)            |

### Rule #4: Use Icons via @nuxt/icon - No Inline SVGs

```vue
<!-- WRONG - Inline SVG -->
<svg xmlns="http://www.w3.org/2000/svg" class="size-4">...</svg>

<!-- CORRECT - Use @nuxt/icon -->
<Icon name="lucide:map" class="size-4" />
<Icon name="lucide:layers" class="size-4" />
<Icon name="simple-icons:github" class="size-4" />
```

**Available icon sets:**

- `lucide:*` - General purpose icons (primary)
- `simple-icons:*` - Brand icons (GitHub, etc.)
- `vscode-icons:*` - File type icons

### Rule #5: Use `size-*` for Square Elements

```vue
<!-- WRONG -->
<Icon name="lucide:check" class="w-4 h-4" />

<!-- CORRECT -->
<Icon name="lucide:check" class="size-4" />
```

### Rule #6: Follow shadcn-vue Component Patterns

UI components live in `app/components/ui/` and follow shadcn-vue conventions:

```
components/ui/
├── button/
│   ├── Button.vue
│   └── index.ts
├── card/
│   ├── Card.vue
│   ├── CardHeader.vue
│   ├── CardContent.vue
│   └── index.ts
```

**Component naming:**

- Folder provides namespace
- Files are PascalCase
- Auto-imported by Nuxt

### Rule #7: No `any` Type - Ever

```typescript
// WRONG
const data: any = response;

// CORRECT
interface MapData {
  /* ... */
}
const data: MapData = response;
// If truly unknown, use `unknown` and narrow with type guards
```

### Rule #8: Use VueUse - Don't Reinvent

```typescript
// WRONG - Manual implementation
const isDark = ref(false);
onMounted(() => {
  isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
});

// CORRECT - Use @vueuse/core
import { useColorMode } from '@vueuse/core';
const { isDark } = useColorMode();
```

### Rule #9: Prefer `computed` Over `watch`

```typescript
// WRONG
watch(
  isOpen,
  (value) => {
    state.value = value ? 'expanded' : 'collapsed';
  },
  { immediate: true },
);

// CORRECT
const state = computed(() => (isOpen.value ? 'expanded' : 'collapsed'));
```

### Rule #10: Composable File Naming Convention

**File names must be kebab-case, but exports must be camelCase.**

```typescript
// File: app/composables/use-map-state.ts (kebab-case filename)

// CORRECT - camelCase export
export function useMapState() { ... }

// WRONG - kebab-case export
export function use-map-state() { ... }  // Syntax error anyway!
```

**Pattern:**

| File Name             | Export Name        |
| --------------------- | ------------------ |
| `use-map-state.ts`    | `useMapState()`    |
| `use-route-utils.ts`  | `useRouteUtils()`  |
| `use-geo-location.ts` | `useGeoLocation()` |

**Why?**

- Kebab-case files: Consistent with Nuxt/Vue ecosystem conventions
- CamelCase exports: Required by JavaScript/TypeScript syntax for function names
- Auto-import works correctly with this pattern

### Rule #11: Component Names Must NOT Duplicate Folder Path

**Nuxt auto-imports components using their folder path as prefix. Never include the folder name in the component filename.**

```
# WRONG - Duplicates "Route" from folder path
app/components/examples/route/RoutePlanningTab.vue
→ Auto-imported as: ExamplesRouteRoutePlanningTab  # "Route" appears TWICE!

# CORRECT - No duplication
app/components/examples/route/PlanningTab.vue
→ Auto-imported as: ExamplesRoutePlanningTab  # Clean!
```

**Naming pattern:**

| Folder Path                  | File Name                | Auto-Import Name           |
| ---------------------------- | ------------------------ | -------------------------- |
| `components/examples/route/` | `PlanningTab.vue`        | `ExamplesRoutePlanningTab` |
| `components/examples/route/` | `DeliveryTab.vue`        | `ExamplesRouteDeliveryTab` |
| `components/ui/button/`      | `Button.vue`             | `UiButtonButton` ❌ WRONG  |
| `components/ui/button/`      | `index.vue` or re-export | `Button` via index.ts      |

### Rule #12: Vue Components Must Be Under 100 Lines

**Vue component files (`.vue`) should NOT exceed ~100 lines of code.**

When a component grows too large:

1. **Extract sub-components** into the same feature folder
2. **Move logic to composables** (`composables/feature/use-feature.ts`)
3. **Move constants to composables** (not in `.vue` files)

**Example - Refactoring a large page:**

```
BEFORE (Bad - 600+ lines in one file):
app/pages/examples/maplibre-route.vue    # 600 lines - TOO LARGE!

AFTER (Good - Split into components):
app/pages/examples/maplibre-route.vue         # ~100 lines (orchestration only)
app/components/examples/route/
├── PlanningTab.vue                           # ~200 lines (NOT RoutePlanningTab!)
├── DeliveryTrackingTab.vue                   # ~250 lines
├── MultiStopTab.vue                          # ~350 lines
└── TripPlannerTab.vue                        # ~350 lines
app/composables/use-route-utils.ts            # Shared utilities (kebab-case file!)
```

**What goes where:**

| What               | Location                             |
| ------------------ | ------------------------------------ |
| Template structure | Page/Component `.vue` file           |
| Business logic     | `composables/feature/use-feature.ts` |
| Constants/Options  | `composables/feature/use-feature.ts` |
| Types              | `app/types/`                         |
| Reusable UI pieces | `components/feature/*.vue`           |

### Rule #13: No Inline Arrow Functions in Vue Templates

**Never use inline arrow functions with multiple parameters in Vue templates. They break syntax highlighting and are harder to debug.**

```vue
<!-- WRONG - Inline arrow function in template -->
<VLayerDeckGlScatterplot
  :data="points"
  :get-position="(d) => d.coordinates"
  :get-fill-color="(d, { index }) => getColorByIndex(index)"
  @click="(info, event) => handleClick(info, event)"
/>

<!-- CORRECT - Named functions in script setup -->
<script setup>
  function getPosition(d: PointData) {
    return d.coordinates;
  }

  function getFillColor(d: PointData, { index }: { index: number }) {
    return getColorByIndex(index);
  }

  function handleLayerClick(info: PickingInfo, event: MouseEvent) {
    // Handle click
  }
</script>

<template>
  <VLayerDeckGlScatterplot
    :data="points"
    :get-position="getPosition"
    :get-fill-color="getFillColor"
    @click="handleLayerClick"
  />
</template>
```

**When to extract to a named function:**

- Event handlers with **multiple parameters** (e.g., `(info, event) => ...`)
- Complex logic that would be hard to read inline
- Accessor functions with object destructuring

**When inline is acceptable:**

- Simple single-parameter passthrough: `@submit="emit('submit', $event)"`
- No-parameter events: `@click="emit('close')"`
- Simple property access: `:get-radius="(d) => d.size"`

### Rule #14: NEVER Use Inline `import()` in Type Annotations

**Always use top-level `import type` statements. NEVER use inline `import('...')` syntax in type annotations.**

```typescript
// WRONG - Inline import in type annotation
export interface MapLayerProps {
  data?: import('geojson').FeatureCollection; // NO!
  options?: import('maplibre-gl').MapOptions; // NO!
}

export interface ComponentProps {
  iconComponents: Record<string, import('vue').Component>; // NO!
}

// CORRECT - Top-level import type statements
import type { FeatureCollection } from 'geojson';
import type { MapOptions } from 'maplibre-gl';
import type { Component } from 'vue';

export interface MapLayerProps {
  data?: FeatureCollection;
  options?: MapOptions;
}

export interface ComponentProps {
  iconComponents: Record<string, Component>;
}
```

**Why?**

- Inline imports make code harder to read and scan
- They bypass the import organization at the top of the file
- They make it harder to see all dependencies at a glance
- They can confuse IDE tooling and auto-import features
- Top-level imports are consistent with the rest of the codebase

### Rule #15: Map Style URLs Must Support Color Mode

**Always use color mode aware styles:**

```typescript
const colorMode = useColorMode();

const mapStyle = computed(() =>
  colorMode.value === 'dark'
    ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
);
```

---

## Tech Stack & Architecture

### Frontend (`app/`)

| Component      | Technology                                    |
| -------------- | --------------------------------------------- |
| **Framework**  | Nuxt 4 with Vue 3 Composition API             |
| **Maps**       | @geoql/v-maplibre + MapLibre GL JS            |
| **Layers**     | deck.gl (core, aggregation, geo, mesh layers) |
| **LiDAR**      | maplibre-gl-lidar                             |
| **UI**         | shadcn-nuxt + Tailwind CSS v4                 |
| **Icons**      | @nuxt/icon (Iconify)                          |
| **Content**    | @nuxt/content for documentation               |
| **Color Mode** | @nuxtjs/color-mode                            |
| **Utilities**  | @vueuse/nuxt                                  |

### Server (`server/`)

| Component        | Technology                                      |
| ---------------- | ----------------------------------------------- |
| **Server**       | Nitro (Nuxt's built-in)                         |
| **Registry API** | `/r/[name].ts` - shadcn-vue registry endpoint   |
| **API Routes**   | Valhalla routing proxy, geocoding, trip planner |

### Deployment

| Service              | Purpose                       |
| -------------------- | ----------------------------- |
| **Cloudflare Pages** | SSR hosting with edge runtime |
| **Analytics**        | Plausible Analytics           |

---

## Project Structure

```
apps/mapcn-vue/
├── app/
│   ├── assets/
│   │   └── css/
│   │       └── main.css           # Tailwind CSS v4 entry
│   ├── components/
│   │   ├── ui/                    # shadcn-vue components
│   │   │   ├── button/
│   │   │   ├── card/
│   │   │   ├── label/
│   │   │   ├── separator/
│   │   │   ├── sheet/
│   │   │   └── slider/
│   │   ├── CodeBlock.vue          # Code display component
│   │   ├── MapDemo.client.vue     # Homepage map demo
│   │   ├── DeliveryDemo.client.vue
│   │   ├── TripsDemo.client.vue
│   │   └── ActiveUsersDemo.client.vue
│   ├── layouts/
│   │   └── default.vue            # Site layout with header/footer
│   ├── lib/
│   │   └── utils.ts               # cn() utility for Tailwind
│   ├── pages/
│   │   ├── index.vue              # Homepage
│   │   ├── docs/
│   │   │   └── [...slug].vue      # Documentation pages
│   │   └── examples/
│   │       ├── index.vue          # Examples overview
│   │       ├── basic.vue          # Basic map example
│   │       ├── markers.vue        # Markers example
│   │       ├── cluster.vue        # Clustering example
│   │       ├── geojson.vue        # GeoJSON example
│   │       ├── maplibre-*.vue     # MapLibre native examples
│   │       ├── deckgl-*.vue       # deck.gl layer examples
│   │       ├── lidar.vue          # LiDAR viewer example
│   │       └── wind.vue           # Wind layer example
│   ├── plugins/
│   │   └── ssr-width.ts           # SSR width detection
│   ├── utils/
│   │   └── animated-arc-layer.ts  # Custom deck.gl layer
│   └── app.vue                    # Root component
│
├── content/
│   └── docs/                      # Markdown documentation
│       ├── 1.introduction.md
│       ├── 2.installation.md
│       └── 3.components.md
│
├── server/
│   ├── routes/
│   │   ├── api/
│   │   │   ├── geocode.ts         # Reverse geocoding proxy
│   │   │   ├── valhalla.ts        # Valhalla routing proxy
│   │   │   └── trip-planner.ts    # Trip itinerary generator
│   │   └── r/
│   │       └── [name].ts          # Registry API endpoint
│   └── tsconfig.json
│
├── public/
│   └── favicon.svg
│
├── components.json                # shadcn-vue config
├── content.config.ts              # @nuxt/content config
├── nuxt.config.ts                 # Nuxt configuration
├── tailwind.config.js             # Tailwind CSS config (if present)
├── wrangler.json                  # Cloudflare Pages config
└── package.json
```

---

## Registry API

The site serves a shadcn-vue compatible registry at `/r/[name]`:

### Available Registries

| Endpoint                    | Description                                                        |
| --------------------------- | ------------------------------------------------------------------ |
| `/r/map`                    | Core map components (VMap, VMarker, VPopup, VControlNavigation)    |
| `/r/map-layers`             | MapLibre native layers (GeoJSON, Vector, Raster, Cluster, PMTiles) |
| `/r/map-deckgl-core`        | deck.gl core layers (Scatterplot, Arc, Line, Path, Polygon)        |
| `/r/map-deckgl-aggregation` | deck.gl aggregation (Heatmap, Hexagon, Grid, Contour)              |
| `/r/map-deckgl-geo`         | deck.gl geo layers (Trips, MVT, Tile, H3, Terrain)                 |
| `/r/map-deckgl-mesh`        | deck.gl mesh layers (SimpleMesh, Scenegraph)                       |
| `/r/map-control-lidar`      | LiDAR point cloud viewer                                           |

### Usage

```bash
npx shadcn-vue@latest add https://mapcn-vue.geoql.in/r/map
```

---

## Map Component Patterns

### Basic Map Setup

```vue
<script setup lang="ts">
  import {
    VMap,
    VMarker,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  const colorMode = useColorMode();

  const mapStyle = computed(() =>
    colorMode.value === 'dark'
      ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
      : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  );

  const mapOptions = computed(() => ({
    style: mapStyle.value,
    center: [-74.5, 40] as [number, number],
    zoom: 9,
  }));
</script>

<template>
  <VMap :options="mapOptions" class="h-[500px] rounded-lg">
    <VMarker :lng-lat="[-74.5, 40]" />
    <VControlNavigation position="top-right" />
    <VControlScale position="bottom-left" />
  </VMap>
</template>
```

### deck.gl Layer Pattern

```vue
<script setup lang="ts">
  import { VMap, VLayerDeckGlScatterplot } from '@geoql/v-maplibre';

  const points = ref([
    { position: [-74.5, 40], color: [255, 0, 0] },
    { position: [-73.5, 41], color: [0, 255, 0] },
  ]);
</script>

<template>
  <VMap :options="mapOptions">
    <VLayerDeckGlScatterplot
      id="scatter"
      :data="points"
      :get-position="(d) => d.position"
      :get-fill-color="(d) => d.color"
      :radius-scale="100"
    />
  </VMap>
</template>
```

### Client-Only Components

For components that need browser APIs (WebGL, etc.), use `.client.vue` suffix:

```
components/
├── MapDemo.client.vue      # Only renders on client
└── HeavyChart.client.vue
```

Or use `<ClientOnly>`:

```vue
<template>
  <ClientOnly>
    <VMap :options="mapOptions" />
    <template #fallback>
      <div class="h-[500px] bg-muted animate-pulse rounded-lg" />
    </template>
  </ClientOnly>
</template>
```

---

## Example Page Pattern

Each example page should follow this structure:

```vue
<script setup lang="ts">
  import { VMap, /* other components */ } from '@geoql/v-maplibre';

  // 1. Color mode for theme-aware styles
  const colorMode = useColorMode();

  // 2. Computed map style based on color mode
  const mapStyle = computed(() => /* ... */);

  // 3. Map options
  const mapOptions = computed(() => ({
    style: mapStyle.value,
    center: [lng, lat] as [number, number],
    zoom: 10,
  }));

  // 4. Example-specific state
  const data = ref(/* ... */);

  // 5. Code example for display
  const codeExample = `
  <template>
    <VMap :options="mapOptions">
      <!-- ... -->
    </VMap>
  </template>
  `;
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Title and description -->
    <h1 class="text-3xl font-bold mb-4">Example Title</h1>
    <p class="text-muted-foreground mb-8">Description of this example.</p>

    <!-- Map -->
    <div class="mb-8 rounded-lg overflow-hidden border">
      <VMap :options="mapOptions" class="h-[500px]">
        <!-- Map contents -->
      </VMap>
    </div>

    <!-- Code example -->
    <LazyCodeBlock :code="codeExample" language="vue" />
  </div>
</template>
```

---

## API Routes

### Valhalla Routing Proxy

```typescript
// server/routes/api/valhalla.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  // Proxy to Valhalla routing service
  return await $fetch('https://valhalla.geoql.in/route', {
    method: 'POST',
    body,
  });
});
```

### Trip Planner

```typescript
// server/routes/api/trip-planner.ts
// Uses Overpass API to fetch POIs along a route
// Generates multi-day itinerary with activities
```

---

## Styling Conventions

### Tailwind CSS v4

This project uses Tailwind CSS v4 with the new `@tailwindcss/vite` plugin:

```typescript
// nuxt.config.ts
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### Theme Variables

Use CSS variables for theming (defined in `main.css`):

```vue
<template>
  <div class="bg-background text-foreground">
    <p class="text-muted-foreground">Muted text</p>
    <div class="border-border bg-card">Card content</div>
  </div>
</template>
```

### Common Patterns

```vue
<!-- Card with hover effect -->
<div
  class="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
>

<!-- Map container with rounded corners -->
<div class="h-[500px] rounded-lg overflow-hidden border">
  <VMap :options="mapOptions" class="h-full w-full" />
</div>

<!-- Badge -->
<span
  class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
>
  Badge
</span>
```

---

## Development Commands

```bash
# Development
bun run dev              # Start dev server (http://localhost:3000)

# Build
bun run build            # Build for production
bun run preview          # Preview production build

# Linting
bun run lint             # Run oxlint

# From monorepo root
bun run dev:mapcn        # Start this app
bun run build:mapcn      # Build this app
```

---

## Deployment

### Cloudflare Pages

Configured via `wrangler.json`:

```json
{
  "name": "mapcn-vue",
  "pages_build_output_dir": ".output/public"
}
```

### Environment Variables

| Variable        | Purpose                                         |
| --------------- | ----------------------------------------------- |
| (none required) | Site is fully static with client-side rendering |

---

## AI Assistant Pre-Flight Checklist

Before every code change:

1. **Am I defining a type/interface?**
   - [ ] Placing in `app/types/` (NOT in components or composables)?
   - [ ] Using `import type { ... } from '~/types/...'`?

2. **Am I using a map component?**
   - [ ] Using @geoql/v-maplibre components, NOT raw MapLibre?
   - [ ] Map style is color-mode aware?

3. **Am I importing correctly?**
   - [ ] Using `~/` alias for app-level imports?
   - [ ] NOT using relative paths like `../../../`?

4. **Am I using an icon?**
   - [ ] Using `<Icon name="lucide:..." />` from @nuxt/icon?
   - [ ] NOT inline SVG strings?

5. **Am I creating a component?**
   - [ ] Following shadcn-vue folder structure?
   - [ ] Component is concise (~100 lines)?
   - [ ] Using `.client.vue` suffix if browser-only?
   - [ ] No inline arrow functions with multiple parameters in template?

6. **Am I setting equal width/height?**
   - [ ] Using `size-*` not `w-* h-*`?

7. **Am I writing example code?**
   - [ ] Including code snippet for display?
   - [ ] Following the example page pattern?
   - [ ] Color mode support included?

### Preferred Patterns

1. **Place types in `app/types/`** - never inline in components/composables
2. **Use @geoql/v-maplibre components** for all map functionality
3. **Support dark/light mode** with computed map styles
4. **Use VueUse** utilities instead of manual implementations
5. **Keep components small** and extract to composables when needed
6. **Follow shadcn-vue conventions** for UI components
7. **Use `size-*`** for square elements
8. **Use `computed`** for derived state, not `watch`
9. **Use top-level `import type`** - never inline `import()` in types
10. **Use named functions** for multi-parameter event handlers

---

## Laws of UX

Design principles to follow when building components, pages, and interactions. Reference: [lawsofux.com](https://lawsofux.com/)

| #   | Law                              | Description                                                                        |
| --- | -------------------------------- | ---------------------------------------------------------------------------------- |
| 1   | **Aesthetic-Usability Effect**   | Users perceive aesthetically pleasing design as more usable                        |
| 2   | **Choice Overload**              | People get overwhelmed with too many options                                       |
| 3   | **Chunking**                     | Break information into meaningful groups                                           |
| 4   | **Cognitive Bias**               | Systematic errors in thinking influence perception and decisions                   |
| 5   | **Cognitive Load**               | Minimize mental resources needed to interact with an interface                     |
| 6   | **Doherty Threshold**            | Keep interactions under 400ms so neither user nor system waits                     |
| 7   | **Fitts's Law**                  | Time to reach a target depends on distance and size — make targets large and close |
| 8   | **Flow**                         | Design for full immersion — minimize interruptions                                 |
| 9   | **Goal-Gradient Effect**         | Motivation increases with proximity to a goal — show progress                      |
| 10  | **Hick's Law**                   | Decision time increases with number and complexity of choices                      |
| 11  | **Jakob's Law**                  | Users prefer your site to work like sites they already know                        |
| 12  | **Law of Common Region**         | Elements sharing a boundary are perceived as grouped                               |
| 13  | **Law of Proximity**             | Objects near each other are perceived as grouped                                   |
| 14  | **Law of Prägnanz**              | People interpret complex images as the simplest form possible                      |
| 15  | **Law of Similarity**            | Similar elements are perceived as a group                                          |
| 16  | **Law of Uniform Connectedness** | Visually connected elements are perceived as more related                          |
| 17  | **Mental Model**                 | Users carry expectations about how systems work                                    |
| 18  | **Miller's Law**                 | Working memory holds 7 (±2) items — chunk information accordingly                  |
| 19  | **Occam's Razor**                | Prefer the simplest solution with fewest assumptions                               |
| 20  | **Paradox of the Active User**   | Users never read manuals — they start using immediately                            |
| 21  | **Pareto Principle**             | 80% of effects come from 20% of causes — focus on high-impact work                 |
| 22  | **Parkinson's Law**              | Tasks expand to fill available time — set constraints                              |
| 23  | **Peak-End Rule**                | Experiences are judged by their peak moment and ending                             |
| 24  | **Postel's Law**                 | Be liberal in what you accept, conservative in what you send                       |
| 25  | **Selective Attention**          | Users focus on stimuli related to their goals                                      |
| 26  | **Serial Position Effect**       | First and last items in a series are remembered best                               |
| 27  | **Tesler's Law**                 | Every system has irreducible complexity — put it in the right place                |
| 28  | **Von Restorff Effect**          | The item that differs from the rest is most memorable                              |
| 29  | **Working Memory**               | Cognitive system that temporarily holds info for tasks                             |
| 30  | **Zeigarnik Effect**             | Incomplete tasks are remembered better than complete ones                          |

---

## Practical Typography

From Butterick's Practical Typography — rules for the showcase site.

### Core Rules

| Rule             | Guideline                                           |
| ---------------- | --------------------------------------------------- |
| Body text size   | 19–22px for web, 1.4–1.6 line height                |
| Line length      | 45–90 characters per line (2–3 lowercase alphabets) |
| Quotes           | Curly quotes, not straight                          |
| Sentence spacing | One space between sentences, not two                |
| Underlining      | Only for links — never for emphasis                 |

### Web Typography

| Rule           | Guideline                                                  |
| -------------- | ---------------------------------------------------------- |
| Font families  | Max 2 families (system stack or well-chosen web fonts)     |
| Minimum size   | Body text never smaller than 16px                          |
| Alignment      | Left-align body text — avoid centered body text            |
| Emphasis       | Bold or italic, not ALL CAPS                               |
| Contrast       | Sufficient contrast between text and background            |
| Headings       | Visually distinct via size/weight, not just bold           |
| Paragraphs     | Use either indents OR space between — not both             |
| Letter-spacing | Don't letterspace lowercase text                           |
| Tables         | Minimize borders; numbers right-aligned, text left-aligned |
| Color          | Use sparingly for semantics, not decoration                |
| Max line width | ~80 characters                                             |

---

**Last Updated:** 2026-02-22
**Maintainer:** GeoQL Team
