# AGENTS.md - v-maplibre Documentation Guide

> **For AI Coding Assistants (Claude Code, Cursor, Copilot, etc.)**
> Conventions for the @geoql/v-maplibre documentation site (v-maplibre.geoql.in).

---

## Project Overview

**v-maplibre docs** is the API reference for @geoql/v-maplibre. It is a Nuxt 4 app on plain **@nuxt/content** that extends the shared design layer **`@geoql/site-shell`** (`packages/site-shell`), the same layer mapcn-vue.geoql.in extends. The two sites share tokens, fonts, toolbar, docs page shell, content components and motion, so moving between them shows no seam. Docus is no longer used.

### Key Capabilities

- **API documentation** for the map components, layers and controls, written in Markdown under `content/`
- **⌘K search** (`SearchPalette` from the layer, fed by `queryCollectionSearchSections`)
- **Agent surfaces**: `/llms.txt`, `/llms-full.txt`, `.md` twins of every page, `/sitemap.md`, `/.well-known/api-catalog`, the MCP server card, `/openapi.json`, and an MCP server at `/mcp` (tools `list-pages`, `get-page`)
- **OG images** for every page, rendered at build time from the layer's `SiteDoc` template

---

## Skills Integration & Priority

Load from [`.agents/skills/`](../../.agents/skills/):

| Skill                                                                                  | When to Load                                                     |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [`mapcn-vue-design`](../../.agents/skills/mapcn-vue-design/SKILL.md)                   | Any visual change: the docs use the same Tech Utility direction  |
| [`nuxt-best-practices`](../../.agents/skills/nuxt-best-practices/SKILL.md)             | Nuxt config, data loading, Nitro, server routes                  |
| [`nuxt-seo-best-practices`](../../.agents/skills/nuxt-seo-best-practices/SKILL.md)     | SEO, OG images, Cloudflare config, JSON-LD                       |
| [`nuxt-geo-best-practices`](../../.agents/skills/nuxt-geo-best-practices/SKILL.md)     | llms.txt, AI crawler access, citation-friendly content           |
| [`vue-best-practices`](../../.agents/skills/vue-best-practices/SKILL.md)               | Vue components in `app/` or in the layer                         |

**Priority rule: this AGENTS.md takes precedence over generic skills when they conflict.**

### Known Conflicts (AGENTS.md wins)

| Skill Says                              | AGENTS.md Says (Use This)                                                                                                                       |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Style components locally                | **Shared surfaces live in `packages/site-shell`.** A change to the toolbar, docs shell, prose or tokens goes in the layer, so both sites get it. |
| Add new design tokens freely            | **Use the existing semantic tokens** (`primary`, `success`, `warning`, `destructive`, `muted`…). New tokens go in the layer's `shell.css`.      |
| Fetch data in components                | **Pages query `@nuxt/content`; layer components only take props.** Layer components never call `queryCollection`.                               |
| Block AI bots in robots.txt             | **Allow** all crawlers: we want the API docs cited.                                                                                             |
| Build llms.txt / markdown routes by hand | `nuxt-llms` + `nuxt-agent-discovery` generate them from `content/`. Configure, don't rewrite.                                                  |
| VueUse `useDark` / `useColorMode`        | **Never.** Only `@nuxtjs/color-mode` (configured in the layer).                                                                                |

---

## CRITICAL RULES

### Rule #1: Documentation lives in `content/`

```
content/
├── 1.guide/          # /guide/*
├── 2.components/     # /components/*
├── 3.layers/         # /layers/*
└── 4.controls/       # /controls/*
```

The home page is `app/pages/index.vue` (Vue), not Markdown. Every other page is a Markdown file.

### Rule #2: Numeric prefixes order files and are stripped from URLs

`content/3.layers/5.raster-layers.md` → `/layers/raster-layers`. The nav groups pages by their first folder (`app/utils/docs-nav.ts` maps folder → label and fallback icon). Renaming a file changes its URL: indexed URLs are pinned by `tests/e2e/oracle.json`.

### Rule #3: Content components

The layer implements the MDC components the content uses:

```markdown
::callout{icon="i-lucide-info" color="success" to="/guide/peer-dependencies"}
Callout text (a link when `to` is set).
::

::alert{type="warning"}
Info / success / warning / danger alert.
::

::code-group
```bash [pnpm]
pnpm add @geoql/v-maplibre maplibre-gl
```

```bash [npm]
npm i @geoql/v-maplibre maplibre-gl
```
::
```

Code blocks get a copy button. A component not in this list does not render: add it to `packages/site-shell/app/components/content/` first.

### Rule #4: Component documentation structure

Each component page: a short description, then `## Props`, `## Events`, `## Slots` tables, then `## Example`.

### Rule #5: Frontmatter

```markdown
---
title: Raster Layers
description: Cloud-Optimized GeoTIFF and satellite imagery visualization
icon: i-lucide-image   # optional; the nav falls back to the folder icon
---
```

---

## Tech Stack

| Component     | Technology                                                                  |
| ------------- | --------------------------------------------------------------------------- |
| Framework     | Nuxt 4                                                                      |
| Design layer  | `@geoql/site-shell` (Tailwind v4, shadcn-vue, Geist, motion-v, color-mode)  |
| Content       | @nuxt/content v3, Cloudflare D1 (`DB`)                                      |
| Agents / SEO  | nuxt-llms, nuxt-agent-discovery, @nuxtjs/mcp-toolkit, nuxt-og-image, sitemap, robots, schema-org |
| Hosting       | Cloudflare Workers (`cloudflare_module`); every page is prerendered        |
| Analytics     | Plausible + OpenPanel + GA4 via `useAnalytics()`                            |

---

## Project Structure

```
apps/docs/
├── app/
│   ├── app.vue                  # skip link + layout
│   ├── error.vue                # styled 404 / error page
│   ├── layouts/default.vue      # SiteToolbar + ⌘K search
│   ├── pages/index.vue          # home page
│   ├── pages/[...slug].vue      # every docs page, rendered in DocsShell
│   ├── utils/docs-nav.ts        # nav grouping
│   └── plugins/                 # analytics
├── content/                     # Markdown docs
├── server/
│   ├── mcp/tools/               # list-pages, get-page
│   ├── plugins/agent-discovery.ts
│   └── routes/openapi.json.get.ts
├── tests/unit/                  # Vitest unit tests
├── tests/e2e/                   # URL + agent-surface tests (need a served build)
├── content.config.ts
└── nuxt.config.ts
```

---

## Development Commands

```bash
pnpm run dev:docs                                   # dev server (repo root)
pnpm run build:docs                                 # production build
pnpm --filter @geoql/v-maplibre-docs run test       # unit tests
# e2e against a served build:
cd apps/docs && npx wrangler dev --config .output/server/wrangler.json --port 8799
DOCS_BASE_URL=http://localhost:8799 pnpm --filter @geoql/v-maplibre-docs run test:e2e
```

Visual checks: `node scripts/visual/docs-mobile.ts`, `docs-behaviour.ts`, `docs-search.ts` (repo root).

---

## DO NOT

- Re-add Docus or Nuxt UI
- Style shared surfaces in this app: change the layer
- Use raw Tailwind colors, gradient text, `rounded-2xl`+, shadows for elevation, or fonts other than Geist / Geist Mono
- Rename content files without updating `tests/e2e/oracle.json` and adding a redirect

---

**Last Updated:** 2026-11-22
**Maintainer:** GeoQL Team
