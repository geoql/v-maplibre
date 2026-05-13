# AGENTS.md - v-maplibre Monorepo Guide

> **For AI Coding Assistants (Claude Code, Cursor, Copilot, OpenCode, etc.)**
> This is the canonical agent guide for the v-maplibre monorepo. `CLAUDE.md` is a symlink to this file so Claude Code finds it under its expected name — there is only one source of truth.
>
> Humans should start at [`README.md`](./README.md). Agents should read this first, then navigate to the appropriate sub-project guide.

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

## Skills (Project-Pinned AI Guidance)

This monorepo ships five project-pinned skills under [`.agents/skills/`](./.agents/skills/). They override or augment any agent-host default skills (Claude Code, Cursor, OpenCode, etc.) for work inside this repo. Load the relevant skill **before** writing code. Loading an irrelevant skill costs nothing; missing the relevant one produces measurably worse output.

### Priority Rule (NON-NEGOTIABLE)

**Per-package `AGENTS.md` ALWAYS takes precedence over generic skills when they conflict.**

Skills are GENERIC (they apply to many Vue/Nuxt projects). Per-package `AGENTS.md` files are PROJECT-SPECIFIC (they encode this codebase's actual conventions). Each `AGENTS.md` documents its **Known Conflicts** with the loaded skills as an explicit table — read that section first, before applying generic skill advice.

| Package               | Conflicts Table                                                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/v-maplibre` | [Known Conflicts](./packages/v-maplibre/AGENTS.md#known-conflicts-agentsmd-wins) — `injectMap` / `useDeckOverlay` / manual lifecycle / no `reactive()`                         |
| `packages/mapcn-vue`  | [Known Conflicts](./packages/mapcn-vue/AGENTS.md#known-conflicts-agentsmd-wins) — copy-paste self-containment overrides "DRY" guidance                                         |
| `apps/mapcn-vue`      | [Known Conflicts](./apps/mapcn-vue/AGENTS.md#known-conflicts-agentsmd-wins) — Tech Utility direction pinned, semantic tokens only, no banned fonts, shadcn-vue inputs required |
| `apps/docs`           | [Known Conflicts](./apps/docs/AGENTS.md#known-conflicts-agentsmd-wins) — Docus owns theme, no custom Vue, AI crawlers allowed                                                  |

| Skill                     | Path                                                                                                   | When to Load                                                                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mapcn-vue-design`        | [`.agents/skills/mapcn-vue-design/SKILL.md`](./.agents/skills/mapcn-vue-design/SKILL.md)               | Any visual work in `apps/mapcn-vue` — pins the Tech Utility direction (Linear / Vercel / Stripe DNA), token contract, font stack (Geist + Geist Mono), weight rules, and ban-list. |
| `nuxt-best-practices`     | [`.agents/skills/nuxt-best-practices/SKILL.md`](./.agents/skills/nuxt-best-practices/SKILL.md)         | Any Nuxt 3/4 work in `apps/mapcn-vue` or `apps/docs` — data fetching (useFetch/useAsyncData), server routes, auto-imports, rendering modes, type organization.                     |
| `nuxt-seo-best-practices` | [`.agents/skills/nuxt-seo-best-practices/SKILL.md`](./.agents/skills/nuxt-seo-best-practices/SKILL.md) | SEO / OG image generation / meta tags / JSON-LD / Nitro Cloudflare config in `apps/mapcn-vue` or `apps/docs`.                                                                      |
| `nuxt-geo-best-practices` | [`.agents/skills/nuxt-geo-best-practices/SKILL.md`](./.agents/skills/nuxt-geo-best-practices/SKILL.md) | Generative-Engine Optimization (llms.txt, GPTBot/ClaudeBot/PerplexityBot allowlisting, AI citation patterns) for public-facing Nuxt apps.                                          |
| `vue-best-practices`      | [`.agents/skills/vue-best-practices/SKILL.md`](./.agents/skills/vue-best-practices/SKILL.md)           | Any Vue 3 component / composable / reactivity / Composition-API work in any package or app.                                                                                        |

### Per-Package Skill Matrix

| Package / App         | Skills to Load (in order)                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/v-maplibre` | `vue-best-practices`                                                                                                                                   |
| `packages/mapcn-vue`  | `vue-best-practices`                                                                                                                                   |
| `apps/mapcn-vue`      | `mapcn-vue-design` (FIRST, for any visual work) → `nuxt-best-practices` → `nuxt-seo-best-practices` → `nuxt-geo-best-practices` → `vue-best-practices` |
| `apps/docs`           | `nuxt-best-practices` → `nuxt-seo-best-practices` → `nuxt-geo-best-practices`                                                                          |

### Skills Catalog (detailed)

Each skill has a `SKILL.md` (entry-point) and a generated `AGENTS.md` (full rule reference, auto-built from `rules/`).

#### `mapcn-vue-design`

Project-pinned design discipline for `apps/mapcn-vue`. Pins the **Tech Utility** direction (Linear / Vercel / Stripe DNA). Contains the full token contract (OKLch palette, weight rules 800/500/400), font stack (Geist + Geist Mono), spacing scale, distinctive-moment catalog, and the explicit ban-list (no Inter, no gradient text, no raw Tailwind colors, no rounded-2xl, no centered-everything hero).

**Load when:** any CSS, component, layout, marketing surface, email, or design asset work inside `apps/mapcn-vue/`. Required **before** writing any styling or template change.

#### `nuxt-best-practices`

40+ rules across 8 categories for Nuxt 3/4 performance + architecture. Covers data fetching (`useFetch` / `useAsyncData` with unique keys), server routes, auto-import organization, rendering modes (SSR/SSG/SPA), state management, type-safety conventions, modules/plugins, and deployment performance.

**Load when:** any Nuxt-specific work in `apps/mapcn-vue` or `apps/docs` — pages, composables, server routes, `nuxt.config.ts` changes, data-loading patterns.

#### `nuxt-seo-best-practices`

11 rules for SEO on Cloudflare Pages / Workers deployments. Covers dynamic OG image generation with `@cf-wasm/og` + Satori (plain JS objects, **never** React), per-page SEO composables, JSON-LD structured data, SSR externals, and Nitro Cloudflare config.

**Load when:** any meta-tag / OG image / sitemap / robots.txt / `nuxt.config.ts` SEO section work in `apps/mapcn-vue` or `apps/docs`.

#### `nuxt-geo-best-practices`

14 rules for Generative-Engine Optimization — getting cited by ChatGPT, Perplexity, Claude, Google AI Overviews, and Gemini. Covers `llms.txt` / `llms-full.txt`, AI-crawler allowlisting in `robots.txt` (GPTBot, ClaudeBot, PerplexityBot, Google-Extended), RAG-friendly content structure, entity-clarity JSON-LD, and the evidence-backed +30–40% visibility levers (statistics, citations, quotations) from the GEO arxiv paper.

**Load when:** working on public-facing surfaces in `apps/mapcn-vue` or `apps/docs` where AI-search citation matters — homepage, marketing pages, documentation, content authoring.

#### `vue-best-practices`

40+ rules across 8 categories for Vue.js. Covers reactivity fundamentals (`ref` vs `reactive`, `shallowRef`, avoiding destructure), component performance, computed vs watcher rules, template optimization, Composition API patterns, state management, async/data fetching, and advanced patterns.

**Load when:** any `.vue` component, composable, or reactivity work in **any** package or app.

### Decision Tree

```
You receive a task. Before writing code:

1. Which directory does it touch?
   ├── packages/v-maplibre        → load `vue-best-practices`
   ├── packages/mapcn-vue         → load `vue-best-practices`
   ├── apps/mapcn-vue
   │   ├── any visual work?       → load `mapcn-vue-design` FIRST (mandatory)
   │   ├── then Nuxt-specific?    → load `nuxt-best-practices`
   │   ├── SEO / OG / meta?       → load `nuxt-seo-best-practices`
   │   ├── llms.txt / AI search?  → load `nuxt-geo-best-practices`
   │   └── Vue component / hook?  → load `vue-best-practices`
   └── apps/docs
       ├── content / Docus only?  → no skill required (markdown only)
       ├── Nuxt config?           → load `nuxt-best-practices`
       ├── SEO / OG / meta?       → load `nuxt-seo-best-practices`
       └── llms.txt / AI search?  → load `nuxt-geo-best-practices`

2. Read the package's AGENTS.md for conventions, file structure, "no-no" list.

3. Then write code.
```

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
├── .agents/
│   └── skills/              # Project-pinned AI skills (see Skills section)
├── package.json             # pnpm workspaces root
├── pnpm-workspace.yaml      # Workspace packages + catalogs
├── pnpm-lock.yaml
├── AGENTS.md                # This file (canonical)
└── CLAUDE.md                # Symlink → AGENTS.md
```

---

## Global Conventions

### Package Manager: pnpm v11

This monorepo uses **pnpm v11** with workspaces. **Bun is no longer supported** — pnpm was chosen for reliable CI/CD and Cloudflare Workers/Pages compatibility. All four projects (including `apps/docs`) share a single lockfile and install in one command.

```bash
# Install all dependencies
pnpm install
```

### Workspace Commands

```bash
# Development
pnpm run dev:lib       # Watch mode for @geoql/v-maplibre
pnpm run dev:mapcn     # Start showcase site
pnpm run dev:docs      # Start docs site

# From apps/mapcn-vue specifically, to expose on LAN
pnpm --filter @geoql/mapcn-vue-app exec nuxt dev --host

# Build
pnpm run build         # Build all packages
pnpm run build:mapcn   # Build showcase site
pnpm run build:docs    # Build docs site

# Test
pnpm run test          # Run tests
pnpm run test:coverage # With coverage

# Lint & Format
pnpm run lint          # oxlint
pnpm run format        # oxfmt

# Update dependencies
pnpm run update:deps   # runs `pnpm dlx taze -I -r`
```

### Cross-Package Dependencies

```
packages/mapcn-vue ──depends on──> packages/v-maplibre
apps/mapcn-vue ─────depends on──> packages/v-maplibre (workspace:*)
apps/docs ──────────workspace member (own deps, no cross-package link)
```

---

## Hard Constraints (Apply Everywhere)

These override per-package rules. Violating any of these = wasted work.

| #   | Constraint                                                                                                                                                                 | Why                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1   | **TypeScript only.** No `.js` files except configs.                                                                                                                        | Type safety, autocompletion                                                                                               |
| 2   | **No `any` type.** Use `unknown` + narrowing, or proper types.                                                                                                             | Prevents silent failures                                                                                                  |
| 3   | **Vue 3 Composition API only.** No Options API.                                                                                                                            | Tree-shaking, type inference                                                                                              |
| 4   | **pnpm v11 only.** No Bun, no npm, no yarn. `packageManager: pnpm@11.1.0` is pinned.                                                                                       | Cloudflare CI/CD reliability                                                                                              |
| 5   | **pnpm catalog references in sub-packages.** Never hardcode versions in sub-package `package.json`. Add to the right catalog in `pnpm-workspace.yaml`.                     | Centralized version management                                                                                            |
| 6   | **`workspace:*`** only for internal package refs.                                                                                                                          | Avoid pnpm version mismatch                                                                                               |
| 7   | **NEVER** introduce Inter, Space Grotesk, Plus Jakarta Sans, gradient text, or raw Tailwind color utilities (`bg-blue-500`, `text-emerald-500`, etc.) in `apps/mapcn-vue`. | The pinned Tech Utility design discipline forbids them                                                                    |
| 8   | **NEVER use** `pnpm run dev -- --host`. Use `pnpm --filter @geoql/mapcn-vue-app exec nuxt dev --host` or the `dev:host` script.                                            | pnpm v11 passes `--host` as Nuxt's ROOTDIR positional, creating a `--host/` subdirectory and serving a blank welcome page |
| 9   | **Verify visual changes with Playwriter screenshots + bounding-box inspection.** `snapshot()` alone does not catch spatial layout regressions.                             | Spatial bugs (overlap, off-screen) only surface in real render                                                            |
| 10  | **Every example page** in `apps/mapcn-vue` must include `<VControlScale position="bottom-left" />` (or render it via a child wrapper component).                           | Consistent map UX                                                                                                         |

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

### Rule #5: pnpm Catalog Dependencies (CRITICAL)

This monorepo uses **pnpm workspace catalogs** for centralized dependency version management. All versions are defined in `pnpm-workspace.yaml` under the `catalogs:` key.

**Available catalogs:** `default`, `pkg:v-maplibre`, `pkg:mapcn-vue`, `app:mapcn-vue`, `app:docs`

```jsonc
// CORRECT - Always use catalog reference in sub-package package.json
"dependencies": {
  "vue": "catalog:",                  // uses default catalog
  "three": "catalog:pkg:v-maplibre"    // uses named catalog
}

// WRONG - Never use direct version strings in sub-packages
"dependencies": {
  "vue": "^3.5.29"
}
```

**When adding a new dependency:**

1. Add the version to the appropriate catalog in `pnpm-workspace.yaml` under `catalogs`
2. Reference it in the sub-package as `"catalog:"` (default) or `"catalog:catalog-name"`
3. Use `workspace:*` only for internal monorepo package references
4. Run `pnpm install` to refresh `pnpm-lock.yaml`

`apps/docs` uses its own catalog (`app:docs`) for Docus-specific packages so its heavier dep tree stays isolated from the library catalog while still sharing the root lockfile.

---

## Release Workflow

Releases are done from `packages/v-maplibre`:

```bash
cd packages/v-maplibre
pnpm run release  # Runs lint, format, test, build, then publishes
```

---

## Getting Started

1. **Clone and install:**

   ```bash
   git clone https://github.com/geoql/v-maplibre.git
   cd v-maplibre
   pnpm install   # all four workspace projects in one shot
   ```

2. **Start development:**

   ```bash
   pnpm run dev:lib    # If working on library
   pnpm run dev:mapcn  # If working on showcase
   ```

3. **Read the appropriate guide** based on what you're working on (see Quick Navigation above).

---

**Last Updated:** 2026-05-12
**Maintainer:** GeoQL Team
