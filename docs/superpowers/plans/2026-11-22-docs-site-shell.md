# Docs site shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Docus in `apps/docs` with plain `@nuxt/content` on a private Nuxt layer shared with `apps/mapcn-vue`, so both sites look and move the same.

**Architecture:** A new private workspace package `packages/site-shell` is a Nuxt layer: Tech Utility tokens, fonts, color mode, Tailwind, shadcn-vue primitives, the toolbar, the docs page shell, content (MDC) components, search palette and motion. Both apps `extends` it and keep their own content collections, server routes and SEO config. Pages pass data into shell components through props; shell components never query a collection themselves.

**Tech Stack:** Nuxt 4.6, @nuxt/content 3, Tailwind v4 via `@nuxtjs/tailwindcss` 7.0.0-beta.1, shadcn-nuxt + reka-ui, motion-v, @nuxtjs/color-mode, nuxt-og-image 7, nuxt-llms, @nuxtjs/sitemap / robots, nuxt-schema-org, @nuxtjs/mcp-toolkit, Vitest via vite-plus, Playwright (local Chrome) for visual checks, Cloudflare Workers (`cloudflare_module`).

**Spec:** `docs/superpowers/specs/2026-11-22-docs-site-shell-design.md`

## Global Constraints

- Branch `feat/docs-site-shell`; nothing reaches `main` until the owner merges the PR (a push to `main` deploys both sites).
- pnpm catalogs only: new versions go in `pnpm-workspace.yaml`; `packages/site-shell` is `"private": true` and consumed as `"@geoql/site-shell": "workspace:*"`.
- Tokens: semantic Tailwind names only (`bg-background`, `text-primary`, `text-success`, `text-warning`, `text-destructive`); no raw `oklch()` in components, no raw Tailwind colors, no `rounded-2xl`+, no shadows for elevation, no gradient text, no weight 600, fonts Geist / Geist Mono only.
- Color mode: `@nuxtjs/color-mode` only (`classSuffix: ''`, `preference: 'system'`, `fallback: 'dark'`); never VueUse `useDark` / `useColorMode`.
- Motion: motion-v, 120–220 ms, every animation disabled under `prefers-reduced-motion: reduce`.
- URL oracle (must stay 200): `/`, `/components/map`, `/components/markers`, `/controls/layer`, `/controls/legend`, `/controls/lidar`, `/guide/examples`, `/guide/getting-started`, `/guide/peer-dependencies`, `/layers/aggregation-layers`, `/layers/core-layers`, `/layers/deckgl-overview`, `/layers/geo-layers`, `/layers/geoarrow-layers`, `/layers/maplibre-layers`, `/layers/raster-layers`, `/layers/wind-layers`.
- Agent surfaces Docus serves today (must stay, same content type): `/llms.txt`, `/llms-full.txt`, `/sitemap.xml`, `/sitemap.md` (text/markdown), `/<page>.md` (text/markdown), `/.well-known/api-catalog` (application/linkset+json), `/.well-known/mcp/server-card.json`, `/openapi.json`, `/robots.txt` allowing all crawlers, MCP at `/mcp` exposing tools `list-pages` and `get-page`, and the `Link` response header listing those documents.
- Security headers stay app-local: mapcn-vue keeps `nuxt-security`; the layer configures no security module.
- `apps/docs/AGENTS.md` "Docus owns the theme" rule is rewritten in Task 8.
- TypeScript only, `<script setup lang="ts">`, no `any`, no non-null assertions on ref values (vue-doctor `no-non-null-assertion-on-ref-value`).

## Review Focus

1. **Deep link to a heading** (`/layers/raster-layers#projections`): the page must land with the heading visible below the toolbar and the TOC marking it active — pinned in Task 3.
2. **Reduced motion:** with `prefers-reduced-motion: reduce` no transform/opacity animation runs (route transition, indicators, palette) — pinned in Task 3 and Task 6.
3. **First paint in dark mode with no flash** when moving docs → mapcn-vue → docs — pinned in Task 9.
4. **Phone width (390 px):** docs navigation must be reachable (sheet), the TOC hidden, code blocks scroll horizontally without page overflow — pinned in Task 5.
5. **Unknown docs URL** returns 404 with the shell's styled error page, not a blank page — pinned in Task 5.

---

### Task 1: Baselines before any change

**Files:**

- Create: `apps/docs/tests/e2e/oracle.json`
- Create: `scripts/visual/capture.mjs`, `scripts/visual/compare.mjs`

**Interfaces:**

- Produces: `oracle.json` = `{ urls: string[], agentSurfaces: { path: string, status: number, contentType: string }[], mcpTools: string[] }`; `capture.mjs <baseUrl> <outDir> <paths...>` writes `<outDir>/<slug>-<light|dark>-<1440|390>.png`; `compare.mjs <dirA> <dirB> --threshold 0.001` exits 1 if any pair differs by more than the threshold (pixelmatch ratio).

- [ ] **Step 1:** Fill `oracle.json` from the live site: the 17 URLs above, the agent surfaces with their current status and content type (`curl -s -o /dev/null -w '%{http_code} %{content_type}'`), and the MCP tool names from `tools/list` (`get-page`, `list-pages`).
- [ ] **Step 2:** Write `capture.mjs` (Playwright, `channel: 'chrome'`, sets the `nuxt-color-mode` cookie/class per mode, waits for `networkidle` + 1 s, masks `canvas` elements) and `compare.mjs` (pixelmatch, prints the ratio per file).
- [ ] **Step 3:** Build mapcn-vue on `feat/docs-site-shell` before any change and capture `/`, `/docs/introduction`, `/examples`, `/examples/basic`, `/faq` from `wrangler dev` into `.visual/baseline/` (gitignored). Expected: 20 PNGs.
- [ ] **Step 4:** Commit `oracle.json`, the two scripts, and `.visual/` in `.gitignore`.

### Task 2: The `site-shell` layer, adopted by mapcn-vue with no visual change

**Files:**

- Create: `packages/site-shell/{package.json,nuxt.config.ts,tsconfig.json}`
- Create: `packages/site-shell/app/assets/css/shell.css` (moved from mapcn-vue `main.css`: `@theme`, `.dark`, `@layer base`, reduced-motion block, `:focus-visible`, `@utility container|bg-grid|bg-grid-faint`, `.fade-*`, `.shiki*`, `.prose*`)
- Move: `apps/mapcn-vue/app/components/ui/*` → `packages/site-shell/app/components/ui/*`; `apps/mapcn-vue/app/lib/utils.ts` → `packages/site-shell/app/lib/utils.ts`
- Modify: `apps/mapcn-vue/nuxt.config.ts` (add `extends: ['@geoql/site-shell']`, drop modules/config the layer now owns: color-mode, icon, fonts, shadcn, vueuse, motion-v, tailwindcss), `apps/mapcn-vue/app/assets/css/main.css` (keeps only map/example rules and `@import` of nothing shell-owned), `apps/mapcn-vue/components.json` (ui alias → layer), `apps/mapcn-vue/doctor.config.ts` exclude path, `pnpm-workspace.yaml`

**Interfaces:**

- Produces: layer name `@geoql/site-shell`; components auto-imported from `app/components/**`; `cn()` from `#shell/lib/utils` (alias `#shell` → `packages/site-shell/app`).

- [ ] **Step 1:** Create the layer. Its `nuxt.config.ts` owns modules `@nuxtjs/color-mode`, `@nuxt/icon`, `@nuxt/fonts` (Geist 300/400/500/700/800, Geist Mono 400/500/700, `global: true`, `processCSSVariables: false`), `shadcn-nuxt` (`componentDir` = layer `app/components/ui`), `@vueuse/nuxt`, `motion-v/nuxt`, `@nuxtjs/tailwindcss`, plus `css: ['#shell/assets/css/shell.css']` and the color-mode config from Global Constraints.
- [ ] **Step 2:** Make Tailwind scan the layer's components from each consuming app. Verify: a class used only in a layer component (`tracking-caps` in the moved sidebar) appears in mapcn-vue's built CSS (`grep -l tracking-caps .output/public/_nuxt/*.css`).
- [ ] **Step 3:** Move the files listed above, point mapcn-vue at the layer, run `pnpm install`.
- [ ] **Step 4:** Gates: `pnpm --filter @geoql/mapcn-vue-app run typecheck`, its unit tests, `pnpm run build:mapcn` (expected "Prerendered 358 routes"), nuxt-doctor 100.
- [ ] **Step 5:** Capture the same 20 screenshots into `.visual/task2/` and run `compare.mjs .visual/baseline .visual/task2 --threshold 0.001`. Expected: exit 0.
- [ ] **Step 6:** Commit.

### Task 3: Shared toolbar, docs page shell and motion

**Files:**

- Create: `packages/site-shell/app/components/SiteToolbar.vue`, `ThemeToggle.vue`, `docs/DocsShell.vue`, `docs/DocsNav.vue`, `docs/DocsToc.vue`, `docs/DocsPager.vue`
- Create: `packages/site-shell/app/utils/active-heading.ts`, `packages/site-shell/app/composables/use-active-heading.ts`
- Create: `packages/site-shell/app/types/docs.ts` (moved from mapcn-vue `app/types/docs.ts`, plus `SiteLink`)
- Modify: `apps/mapcn-vue/app/pages/docs/[...slug].vue` (renders `DocsShell`), `apps/mapcn-vue/app/layouts/default.vue` (uses `SiteToolbar`; FPS toggle through its slot), delete `apps/mapcn-vue/app/components/FloatingToolbar.vue`
- Test: `packages/site-shell/tests/active-heading.test.ts`, `packages/site-shell/tests/site-toolbar.test.ts`

**Interfaces:**

- Produces:
  - `activeHeadingId(headings: { id: string; top: number }[], offset: number): string` — last heading whose `top <= offset`, else the first id, else `''`.
  - `useActiveHeading(selector: string, offset?: number): Ref<string>` (default offset 100).
  - `interface SiteLink { label: string; to: string; icon: string; external?: boolean }`.
  - `<SiteToolbar :links="SiteLink[]">` with default slot for app-specific buttons; renders sidebar trigger, links, GitHub, `ThemeToggle`.
  - `<DocsShell :nav="DocsNavItem[]" :toc="TocItem[]" :prev :next :edit-url :issue-url :title :description>` with default slot for `<ContentRenderer>`; `TocItem = { id: string; text: string; level: number }`.

- [ ] **Step 1: Write the failing tests**

```ts
// active-heading.test.ts
expect(
  activeHeadingId(
    [
      { id: 'a', top: -300 },
      { id: 'b', top: 40 },
      { id: 'c', top: 400 },
    ],
    100,
  ),
).toBe('b');
expect(
  activeHeadingId(
    [
      { id: 'a', top: 300 },
      { id: 'b', top: 600 },
    ],
    100,
  ),
).toBe('a');
expect(activeHeadingId([], 100)).toBe('');

// site-toolbar.test.ts (mount with stubs for Icon/Tooltip/SidebarTrigger)
// links prop renders one anchor per link; external: true gets target="_blank" rel="noopener noreferrer";
// default slot content is rendered after the links.
```

- [ ] **Step 2:** Run `pnpm --filter @geoql/site-shell exec vp test run` — expected FAIL (modules missing).
- [ ] **Step 3:** Implement `activeHeadingId`, `useActiveHeading` (passive scroll listener, cleaned up on unmount), `SiteToolbar`, `ThemeToggle` (both icons rendered, `.dark` CSS picks one — as the current FloatingToolbar), and the `Docs*` components extracted from mapcn-vue's docs page markup.
- [ ] **Step 4: Motion.** `DocsNav` and `DocsToc` draw one active indicator bar that slides between items (motion-v `layoutId`, 180 ms); layer `app.config`/`nuxt.config` sets `app.pageTransition = { name: 'page', mode: 'out-in' }` with a 160 ms opacity + 4 px translate in `shell.css`; both are removed by the `prefers-reduced-motion: reduce` block. Hash links scroll with `scroll-margin-top` equal to the toolbar offset.
- [ ] **Step 5:** Tests pass; mapcn-vue builds; capture `.visual/task3/` and compare with baseline — only `/docs/introduction` and the toolbar region may differ; inspect those diffs by eye and record them in the commit message.
- [ ] **Step 6 (Review Focus 1, 2):** Playwright check on mapcn-vue `/docs/installation#<first h2 id>`: the heading's `getBoundingClientRect().top` is ≥ the toolbar's bottom and the TOC entry has `aria-current="true"`; with `reducedMotion: 'reduce'`, `getAnimations()` on the indicator and the page wrapper returns 0 running animations after a navigation.
- [ ] **Step 7:** Commit.

### Task 4: Content components for Markdown

**Files:**

- Create: `packages/site-shell/app/components/content/{Callout,Alert,CodeGroup,ProsePre}.vue`
- Test: `packages/site-shell/tests/content-components.test.ts`

**Interfaces:**

- Produces (MDC names used by the docs content): `callout` props `{ icon?: string; to?: string; target?: string }` (renders a `NuxtLink` when `to` is set); `alert` prop `type: 'info' | 'success' | 'warning' | 'danger'` (default `'info'`); `code-group` (one tab per child `pre`, label from the code block's `[label]` meta, else its language); `ProsePre` adds a copy button.

- [ ] **Step 1: Write the failing tests**

```ts
// alert type maps to a semantic token class
for (const [type, cls] of [
  ['info', 'text-primary'],
  ['success', 'text-success'],
  ['warning', 'text-warning'],
  ['danger', 'text-destructive'],
])
  expect(
    mount(Alert, { props: { type }, slots: { default: 'x' } }).html(),
  ).toContain(cls);
// callout with `to` renders a link with target
expect(
  mount(Callout, {
    props: { to: 'https://e.x', target: '_blank', icon: 'i-lucide-info' },
  })
    .find('a')
    .attributes('target'),
).toBe('_blank');
// code-group: two children labelled pnpm/npm -> two tabs; clicking "npm" shows the second panel only
// ProsePre: clicking copy calls navigator.clipboard.writeText(code) and shows "Copied" for 1500 ms (fake timers), then "Copy"
```

- [ ] **Step 2:** Run — expected FAIL.
- [ ] **Step 3:** Implement with tokens only; the copy button's confirm state cross-fades icon (motion-v, 120 ms).
- [ ] **Step 4:** Run — expected PASS.
- [ ] **Step 5:** Commit.

### Task 5: Docs app on plain @nuxt/content

**Files:**

- Modify: `apps/docs/package.json` (remove `docus`, `@comark/nuxt`, `agents`, `@modelcontextprotocol/sdk`, `@modelcontextprotocol/server` unless Task 7 still needs one; add `@geoql/site-shell: workspace:*`), `apps/docs/nuxt.config.ts` (`extends: ['@geoql/site-shell']`, keep D1 content database, wrangler block, analytics, OpenPanel)
- Create: `apps/docs/content.config.ts` (collection `docs`, `type: 'page'`, `source: '**/*.md'`, `exclude: ['index.md']`, schema `{ title: string, description?: string, icon?: string }`), `apps/docs/app/app.vue`, `apps/docs/app/layouts/default.vue`, `apps/docs/app/pages/[...slug].vue`, `apps/docs/app/pages/index.vue`, `apps/docs/app/error.vue`
- Delete: `apps/docs/content/index.md` (its copy moves into `index.vue`)
- Test: `apps/docs/tests/e2e/urls.test.ts`

**Interfaces:**

- Consumes: `DocsShell`, `SiteToolbar`, `SiteLink` (Task 3); content components (Task 4).
- Produces: nav grouped by top-level folder (`Guide`, `Components`, `Layers`, `Controls`) in file-prefix order.

- [ ] **Step 1: Write the failing test** — `urls.test.ts` reads `oracle.json`, requests each URL from `process.env.DOCS_BASE_URL` (default `http://localhost:8799`) and expects 200 + `text/html`; requests `/not-a-page` and expects 404 with the shell error page's `data-shell-error` attribute in the body.
- [ ] **Step 2:** Run against `wrangler dev` of the current Docus build to confirm the harness: URLs 200, the 404 assertion FAILS (no `data-shell-error`).
- [ ] **Step 3:** Replace Docus as listed. `index.vue`: Tech Utility hero, `min-h-dvh`, asymmetric 8/4 grid; the distinctive moment is the install command `pnpm add @geoql/v-maplibre maplibre-gl` set in Geist Mono at ≥ 40 px with a copy button; primary CTA "Get started" → `/guide/getting-started` and secondary "Examples" → `https://mapcn-vue.geoql.in/examples`; both CTAs above the fold at 1440×900 and 390×844. Toolbar links on the docs: `{ label: 'Examples', to: 'https://mapcn-vue.geoql.in/examples', icon: 'lucide:map', external: true }`.
- [ ] **Step 4:** Build (`pnpm run build:docs`), serve with `wrangler dev --config .output/server/wrangler.json --port 8799`, run `urls.test.ts` — expected PASS.
- [ ] **Step 5 (Review Focus 4):** Playwright at 390×844 on `/layers/raster-layers`: the nav sheet opens from the toolbar and lists every section; `document.documentElement.scrollWidth <= 390`; the TOC aside is not visible.
- [ ] **Step 6:** Commit.

### Task 6: ⌘K search

**Files:**

- Create: `packages/site-shell/app/utils/rank-sections.ts`, `packages/site-shell/app/components/SearchPalette.vue`
- Modify: `apps/docs/app/layouts/default.vue` (loads `queryCollectionSearchSections('docs')` lazily on first open and passes it in), `packages/site-shell/app/components/SiteToolbar.vue` (search button with `⌘K` hint in mono)
- Test: `packages/site-shell/tests/rank-sections.test.ts`

**Interfaces:**

- Produces: `interface SearchSection { id: string; title: string; titles: string[]; content: string }`; `rankSections(sections: SearchSection[], query: string, limit?: number): SearchSection[]` (default limit 8); `<SearchPalette :sections :open @update:open @select="(id: string) => void">`.

- [ ] **Step 1: Write the failing test** — title match ranks above a content-only match; matching is case-insensitive and on every whitespace-separated term; empty query returns `[]`; `limit` caps the result.
- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3:** Implement `rankSections` (score: title term hit 3, heading-path hit 2, content hit 1; ties keep input order) and the palette (reka-ui Dialog, ↑/↓/Enter/Esc, `⌘K`/`Ctrl+K` opens; open/close 150 ms scale+opacity, off under reduced motion).
- [ ] **Step 4:** Run — PASS. Playwright: `⌘K`, type `raster`, Enter → URL is `/layers/raster-layers` (with the section hash when the hit is a section).
- [ ] **Step 5:** Commit.

### Task 7: SEO and agent surfaces parity

**Files:**

- Modify: `apps/docs/nuxt.config.ts` (modules `@nuxt/content`, `nuxt-og-image`, `@nuxtjs/sitemap`, `@nuxtjs/robots`, `nuxt-schema-org`, `nuxt-llms`, `@nuxtjs/mcp-toolkit`; robots allow all; llms domain `v-maplibre.geoql.in`)
- Move: mapcn-vue `app/components/OgImage/*` → layer; mapcn-vue `server/utils/html-to-markdown.ts` and the Link-header part of `server/middleware/agent-ready.ts` → layer `server/` (mapcn-vue keeps its app-specific parts)
- Create: `apps/docs/server/mcp/tools/{list-pages,get-page}.ts`, `apps/docs/server/routes/.well-known/api-catalog.ts`, `apps/docs/server/routes/.well-known/mcp/server-card.json.ts`, `apps/docs/server/routes/openapi.json.ts`, `apps/docs/server/routes/sitemap.md.ts`, `apps/docs/server/middleware/markdown.ts` (`/<page>.md` and `Accept: text/markdown`)
- Test: `apps/docs/tests/e2e/agent-surfaces.test.ts`

**Interfaces:**

- Consumes: `oracle.json` `agentSurfaces` and `mcpTools`.
- Produces: MCP tools named exactly `list-pages` (returns `{ title, path, description, url }[]`) and `get-page` (input `{ path: string }`, returns title, description and the page Markdown).

- [ ] **Step 1: Write the failing test** — for each `agentSurfaces` entry: same status and content-type prefix as recorded; `Link` header on `/` contains `rel="api-catalog"`, `rel="service-desc"`, `rel="describedby"`; MCP `tools/list` returns exactly the `mcpTools` names; `get-page` for `/guide/getting-started` returns text containing `pnpm add @geoql/v-maplibre`; every page has an `og:image` meta whose URL returns 200 `image/png`.
- [ ] **Step 2:** Run against the Task 5 build — FAIL.
- [ ] **Step 3:** Implement the routes and modules listed.
- [ ] **Step 4:** Rebuild, serve, run — PASS.
- [ ] **Step 5:** Commit.

### Task 8: Rules, links and cleanup

**Files:**

- Modify: `apps/docs/AGENTS.md` (replace the Docus rules and the Known Conflicts table with the layer rules), root `AGENTS.md` (package table gains `packages/site-shell`; skill matrix loads `mapcn-vue-design` for `apps/docs`), `.agents/skills/mapcn-vue-design/SKILL.md` (scope: mapcn-vue, docs and site-shell; file inventory points at the layer), mapcn-vue toolbar links (`{ label: 'API docs', to: 'https://v-maplibre.geoql.in', icon: 'lucide:book-open', external: true }` next to its registry docs link), `pnpm-workspace.yaml` (drop catalog/override entries whose only consumer was Docus — confirm each with `pnpm why <pkg> -r` returning nothing before removal; keep and comment any still needed), CI workflows that reference Docus or the removed packages.

- [ ] **Step 1:** Make the edits.
- [ ] **Step 2:** `pnpm install`, then `pnpm dedupe` and check one `vue` and one `@vue/*` generation (project memory constraint).
- [ ] **Step 3:** Commit.

### Task 9: Whole-branch verification and PR

- [ ] **Step 1:** Gates from the repo root: `pnpm run lint`, `pnpm run format:check`, `pnpm run typecheck`, library tests, layer tests, `pnpm run build:mapcn` (358 routes), `pnpm run build:docs`, vue-doctor + nuxt-doctor at 100 for every audited package.
- [ ] **Step 2:** Serve both builds with `wrangler dev`; run `urls.test.ts` and `agent-surfaces.test.ts`.
- [ ] **Step 3:** Screenshots: docs `/`, `/guide/getting-started`, `/layers/raster-layers`, mapcn-vue `/` and `/docs/introduction` in light and dark at 1440×900 and 390×844; score each surface on the 5-dimension critique (`~/.claude/skills/design-discipline/references/critique.md`); any dimension below 3 goes back to the owning task.
- [ ] **Step 4 (Review Focus 3):** In dark mode, navigate docs `/` → toolbar "Examples" → mapcn-vue → "API docs" → docs; on each `load`, assert `document.documentElement.classList.contains('dark')` before first paint (check in an `addInitScript` `DOMContentLoaded` hook) and that the computed `--color-background` matches on both sites.
- [ ] **Step 5:** mapcn-vue 110-example sweep (the existing `raster.mjs`-style harness): no page flagged that the baseline sweep did not flag.
- [ ] **Step 6:** Push `feat/docs-site-shell`, open the PR (lowercase title, `feat: share one site shell between the docs and mapcn-vue`), body with the screenshots, the critique scores, the oracle results and the gate outputs. Do not merge.
