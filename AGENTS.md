# AGENTS.md - v-maplibre Monorepo Guide

> **For AI Coding Assistants (Claude Code, Cursor, Copilot, etc.)**
> This is the root guide for the v-maplibre monorepo. Read this first, then navigate to the appropriate sub-project guide.

---

## Monorepo Overview

**v-maplibre** is a monorepo for Vue 3 MapLibre GL components, including the core library and shadcn-vue compatible registry.

| Package/App           | Description                                        | Guide                                                              |
| --------------------- | -------------------------------------------------- | ------------------------------------------------------------------ |
| `packages/v-maplibre` | Core Vue 3 component library (`@geoql/v-maplibre`) | [`packages/v-maplibre/AGENTS.md`](./packages/v-maplibre/AGENTS.md) |
| `packages/mapcn-vue`  | shadcn-vue compatible registry                     | [`packages/mapcn-vue/AGENTS.md`](./packages/mapcn-vue/AGENTS.md)   |
| `apps/mapcn-vue`      | Showcase site with examples (Nuxt 4)               | [`apps/mapcn-vue/AGENTS.md`](./apps/mapcn-vue/AGENTS.md)           |
| `apps/docs`           | API documentation (Docus)                          | [`apps/docs/AGENTS.md`](./apps/docs/AGENTS.md)                     |

---

## Quick Navigation

**What are you working on?**

| Task                                  | Read This Guide                 |
| ------------------------------------- | ------------------------------- |
| Adding/modifying Vue map components   | `packages/v-maplibre/AGENTS.md` |
| Adding shadcn-vue registry components | `packages/mapcn-vue/AGENTS.md`  |
| Adding examples or showcase features  | `apps/mapcn-vue/AGENTS.md`      |
| Writing API documentation             | `apps/docs/AGENTS.md`           |

---

## Monorepo Structure

```
v-maplibre/
├── packages/
│   ├── v-maplibre/          # Core library (@geoql/v-maplibre on npm)
│   │   ├── src/
│   │   │   ├── map/         # VMap component
│   │   │   ├── markers/     # VMarker component
│   │   │   ├── popups/      # VPopup component
│   │   │   ├── controls/    # Navigation, Scale, Geolocate, etc.
│   │   │   ├── layers/      # MapLibre + deck.gl layers
│   │   │   └── utils/       # Shared utilities
│   │   └── test/            # Vitest tests
│   │
│   └── mapcn-vue/           # shadcn-vue registry source
│       ├── src/registry/ui/ # Component source files
│       └── public/r/        # Pre-built registry JSON
│
├── apps/
│   ├── mapcn-vue/           # Nuxt 4 showcase site
│   │   ├── app/             # Frontend (pages, components)
│   │   ├── server/          # API routes (registry, valhalla)
│   │   └── content/         # Markdown docs
│   │
│   └── docs/                # Docus documentation site
│       └── content/         # API reference markdown
│
├── package.json             # Bun workspaces root
├── bun.lock
└── AGENTS.md                # This file
```

---

## Global Conventions

### Package Manager: Bun

This monorepo uses **Bun** with workspaces.

```bash
# Install all dependencies
bun install

# Install docs separately (excluded from workspace)
bun run setup:docs
```

### Workspace Commands

```bash
# Development
bun run dev:lib       # Watch mode for @geoql/v-maplibre
bun run dev:mapcn     # Start showcase site
bun run dev:docs      # Start docs site

# Build
bun run build         # Build all packages
bun run build:mapcn   # Build showcase site
bun run build:docs    # Build docs site

# Test
bun run test          # Run tests
bun run test:coverage # With coverage

# Lint & Format
bun run lint          # oxlint
bun run format        # Prettier
```

### Cross-Package Dependencies

```
packages/mapcn-vue ──depends on──> packages/v-maplibre
apps/mapcn-vue ─────depends on──> packages/v-maplibre (workspace:*)
apps/docs ──────────standalone (excluded from workspace)
```

---

## Global Rules (Apply to ALL packages/apps)

### Rule #1: TypeScript Required

All code must be TypeScript. No `.js` files except configs.

### Rule #2: No `any` Type

```typescript
// WRONG
const data: any = response;

// CORRECT
const data: SomeType = response;
```

### Rule #3: Vue 3 Composition API Only

```vue
<!-- CORRECT -->
<script setup lang="ts">
  import { ref, computed } from 'vue';
</script>

<!-- WRONG - Options API -->
<script lang="ts">
  export default {
    data() {
      return {};
    },
  };
</script>
```

### Rule #4: Use Existing Tooling

| Need       | Use                                     |
| ---------- | --------------------------------------- |
| Icons      | `@nuxt/icon` (apps) or inline SVG (lib) |
| Utilities  | `@vueuse/core`                          |
| Styling    | Tailwind CSS v4                         |
| Testing    | Vitest                                  |
| Linting    | oxlint                                  |
| Formatting | Prettier                                |

---

## Release Workflow

Releases are done from `packages/v-maplibre`:

```bash
cd packages/v-maplibre
bun run release  # Runs lint, format, test, build, then publishes
```

---

## Getting Started

1. **Clone and install:**

   ```bash
   git clone https://github.com/geoql/v-maplibre.git
   cd v-maplibre
   bun install
   bun run setup:docs
   ```

2. **Start development:**

   ```bash
   bun run dev:lib    # If working on library
   bun run dev:mapcn  # If working on showcase
   ```

3. **Read the appropriate guide** based on what you're working on (see Quick Navigation above).

---

**Last Updated:** 2026-01-16
**Maintainer:** GeoQL Team
