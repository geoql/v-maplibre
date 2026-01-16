# AGENTS.md - v-maplibre Documentation Guide

> **For AI Coding Assistants (Claude Code, Cursor, Copilot, etc.)**
> This file helps AI agents understand the codebase architecture, conventions, and best practices for the @geoql/v-maplibre documentation site.

---

## Project Overview

**v-maplibre docs** is the API documentation site for the @geoql/v-maplibre library. Built with Docus (a Nuxt-based documentation theme), it provides comprehensive guides and API reference for Vue 3 MapLibre components.

### Key Capabilities
- **API Documentation**: Component reference for 50+ map components
- **Getting Started Guides**: Installation and basic usage
- **Layer Documentation**: MapLibre native, deck.gl, and specialty layers
- **Search**: Built-in documentation search via Docus
- **LLM Support**: `/llms.txt` endpoint for AI agent context

---

## CRITICAL RULES

### Rule #1: Documentation Lives in `content/` Directory

All documentation is Markdown files in the `content/` directory:

```
content/
├── index.md                    # Homepage
├── 1.guide/                    # Getting started
│   ├── 1.getting-started.md
│   └── 2.examples.md
├── 2.components/               # Component docs
│   ├── 1.map.md
│   └── 2.markers.md
├── 3.layers/                   # Layer docs
│   ├── 1.deckgl-overview.md
│   ├── 2.core-layers.md
│   └── ...
└── 4.controls/                 # Control docs
    └── 1.lidar.md
```

### Rule #2: Use Numeric Prefixes for Ordering

Files and folders are sorted by numeric prefix:

```markdown
<!-- 1.guide/1.getting-started.md appears before 1.guide/2.examples.md -->
```

### Rule #3: Follow Docus Markdown Conventions

Docus extends standard Markdown with special components:

```markdown
# Page Title

::alert{type="info"}
This is an info alert.
::

::code-group
```vue [Basic Usage]
<VMap :options="mapOptions" />
```

```vue [With Marker]
<VMap :options="mapOptions">
  <VMarker :lng-lat="[0, 0]" />
</VMap>
```
::

::callout{type="warning"}
Important warning message.
::
```

### Rule #4: Component Documentation Structure

Each component doc should follow this pattern:

```markdown
# ComponentName

Brief description of what the component does.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `MapOptions` | - | Map configuration options |
| `center` | `[number, number]` | - | Initial center coordinates |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `load` | `Map` | Emitted when map is loaded |
| `click` | `MapMouseEvent` | Emitted on map click |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Map content (markers, layers, etc.) |

## Example

::code-group
```vue [Template]
<VMap :options="mapOptions" @load="onMapLoad">
  <VMarker :lng-lat="[-74.5, 40]" />
</VMap>
```

```typescript [Script]
const mapOptions = {
  style: 'https://demotiles.maplibre.org/style.json',
  center: [-74.5, 40],
  zoom: 9,
};

function onMapLoad(map: Map) {
  console.log('Map loaded:', map);
}
```
::
```

### Rule #5: No Custom Vue Components

This is a documentation site. Do NOT create custom Vue components. All content should be in Markdown using Docus components.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Framework** | Nuxt 4 |
| **Theme** | Docus (documentation theme) |
| **Content** | @nuxt/content v3 |
| **Database** | Cloudflare D1 (for content) |
| **Hosting** | Cloudflare Pages |
| **Analytics** | Plausible Analytics |

---

## Project Structure

```
apps/docs/
├── content/
│   ├── index.md                 # Homepage
│   ├── 1.guide/                 # Getting started guides
│   │   ├── 1.getting-started.md
│   │   └── 2.examples.md
│   ├── 2.components/            # Component documentation
│   │   ├── 1.map.md
│   │   └── 2.markers.md
│   ├── 3.layers/                # Layer documentation
│   │   ├── 1.deckgl-overview.md
│   │   ├── 2.core-layers.md
│   │   ├── 3.aggregation-layers.md
│   │   ├── 4.geo-layers.md
│   │   ├── 5.raster-layers.md
│   │   └── 6.wind-layers.md
│   └── 4.controls/              # Control documentation
│       └── 1.lidar.md
│
├── public/
│   └── favicon.ico
│
├── .npmrc
├── eslint.config.js
├── nuxt.config.ts               # Docus + Nuxt configuration
├── package.json
├── tsconfig.json
└── wrangler.json                # Cloudflare Pages config
```

---

## Configuration

### nuxt.config.ts

```typescript
export default defineNuxtConfig({
  extends: ['docus'],

  modules: [
    ['@nuxtjs/plausible', { /* analytics config */ }],
  ],

  site: {
    name: 'v-maplibre',
    description: 'Vue 3 components for MapLibre GL',
    url: 'https://v-maplibre.geoql.in',
  },

  content: {
    database: {
      type: 'd1',
      bindingName: 'DB',
    },
  },

  llms: {
    domain: 'v-maplibre.geoql.in',
  },

  nitro: {
    preset: 'cloudflare-pages',
  },
});
```

---

## Writing Documentation

### Frontmatter

Each page can have YAML frontmatter:

```markdown
---
title: Getting Started
description: Learn how to install and use @geoql/v-maplibre
navigation:
  icon: i-lucide-rocket
---

# Getting Started
...
```

### Code Blocks

Use triple backticks with language identifier:

````markdown
```vue
<script setup>
import { VMap } from '@geoql/v-maplibre';
</script>
```

```typescript
const options: MapOptions = {
  style: '...',
};
```

```bash
bun add @geoql/v-maplibre maplibre-gl
```
````

### Docus Components

**Alert:**
```markdown
::alert{type="info"}
Information message.
::

::alert{type="warning"}
Warning message.
::

::alert{type="danger"}
Error/danger message.
::
```

**Code Group (tabs):**
```markdown
::code-group
```bash [npm]
npm install @geoql/v-maplibre
```

```bash [bun]
bun add @geoql/v-maplibre
```

```bash [pnpm]
pnpm add @geoql/v-maplibre
```
::
```

**Callout:**
```markdown
::callout{type="tip"}
Pro tip content here.
::
```

**Card:**
```markdown
::card{title="Card Title" icon="i-lucide-map"}
Card content goes here.
::
```

---

## Development Commands

```bash
# Development (from this directory)
bun run dev              # Start dev server

# From monorepo root
bun run setup:docs       # Install deps (required first time)
bun run dev:docs         # Start docs dev server

# Build
bun run build            # Build for production

# Linting
bun run lint             # Run oxlint + eslint
bun run lint:fix         # Fix lint issues
```

---

## Deployment

### Cloudflare Pages

Configured in `wrangler.json`:

```json
{
  "name": "v-maplibre-docs",
  "pages_build_output_dir": ".output/public"
}
```

### D1 Database

Content is stored in Cloudflare D1 for fast edge retrieval:

```typescript
content: {
  database: {
    type: 'd1',
    bindingName: 'DB',
  },
}
```

---

## AI Assistant Guidelines

### Adding New Documentation

1. Create Markdown file in appropriate `content/` subdirectory
2. Use numeric prefix for ordering (e.g., `3.new-topic.md`)
3. Add frontmatter with title and description
4. Follow component documentation structure for API docs
5. Use Docus components for enhanced formatting

### Updating Existing Docs

1. Edit the Markdown file directly
2. Maintain consistent structure with other docs
3. Update navigation order (numeric prefix) if needed

### DO NOT

- Create Vue components (use Markdown + Docus components)
- Add custom CSS (Docus handles theming)
- Modify `nuxt.config.ts` unless necessary
- Create files outside `content/` for documentation

---

**Last Updated:** 2026-01-16
**Maintainer:** GeoQL Team
