# Docs site: drop Docus, share mapcn-vue's shell

Date: 2026-11-22 · Status: draft for approval

## Intent

`v-maplibre.geoql.in` (API docs) and `mapcn-vue.geoql.in` (showcase) are one product. Today the docs run Docus, so they look like every Docus site and nothing like mapcn-vue. Moving between the two feels like leaving the product. The owner wants the docs to look and move like mapcn-vue, so the jump between the domains has no visible seam. The owner's other docs sites (for example tileserver-rs) are the quality bar for motion and micro-interactions; their visual identity is not copied.

## Goals

- The docs use mapcn-vue's design: Tech Utility tokens, Geist / Geist Mono, sharp radii, borders over shadows, one accent.
- One source for that design: a shared Nuxt layer both apps extend, so a change lands on both.
- Docus removed. Plain `@nuxt/content` renders the existing Markdown.
- Every current docs URL keeps working (`/guide/*`, `/components/*`, `/layers/*`, `/controls/*`).
- Motion and micro-interactions at the reference sites' level, all honouring `prefers-reduced-motion`.
- Each site links to the other from the same place in the shell.

## Non-goals

- Rewriting doc content (only the MDC component syntax that Docus-only components need changes).
- Merging the two sites or moving the docs to a new domain.
- Redesigning mapcn-vue. Its pages stay; only the shell moves into the layer.

## Anti-goals (failure even if it "works")

- Two copies of tokens or shell components that can drift.
- Any URL change that 404s an indexed docs page.
- Losing llms.txt / llms-full.txt, OG images, search, or the MCP endpoint.
- Banned fonts, raw Tailwind colors, gradient text, `rounded-2xl`+, shadow elevation (mapcn-vue-design hard bans).
- A colour-mode flash (only `@nuxtjs/color-mode`, never VueUse `useDark`).

## Constraints

- pnpm catalogs; the new package is `workspace:*`, private, never published.
- Both apps deploy as Cloudflare Workers (`cloudflare_module`). The docs keep their D1 content database (`DB`) and custom domain.
- mapcn-vue's strict nonce CSP and its 110 examples must not regress.
- `apps/docs/AGENTS.md` rule "Docus owns the theme, write Markdown only" is replaced by the new rules for this design, in the same change.
- TypeScript only, Composition API, no `any`.

## Approaches considered

|                | Approach                                                                | Trade-off                                                                          |
| -------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **A (picked)** | Shared private Nuxt layer `packages/site-shell`; both apps `extends` it | Seamless by construction; mapcn-vue is refactored, so its examples are re-verified |
| B              | Copy mapcn-vue's tokens and components into apps/docs                   | Fastest, mapcn-vue untouched; two copies drift                                     |
| C              | Serve the docs from mapcn-vue's `/docs`, redirect the domain            | One site; loses the domain, mixes library docs with registry docs                  |

Owner picked A: only a shared source keeps the seam closed over time.

## Decided

- **Layer contents** (`packages/site-shell`): `main.css` tokens + base type rules, `@nuxt/fonts` Geist config, `@nuxtjs/color-mode` config, shadcn-vue primitives the shell uses, the floating toolbar (site switch Docs ↔ Examples, GitHub, theme toggle), the docs page shell (sidebar nav, table of contents, prev/next, edit link) now living in mapcn-vue's `pages/docs/[...slug].vue`, prose components, and the shared motion primitives.
- **Docs app**: plain `@nuxt/content` with one `docs` collection over the existing `content/`, a catch-all page using the layer's docs shell, and a Vue home page (replacing the `u-page-*` Markdown).
- **MDC components** the content uses get layer implementations: `callout`, `alert`, `code-group`. The Docus-only `u-page-*` / `u-button` blocks leave with the old home page.
- **Docus replacements** (builder's defaults, owner did not decide): ⌘K search rebuilt on `queryCollectionSearchSections`; llms.txt via `nuxt-llms` (as mapcn-vue); OG images via `nuxt-og-image` (as mapcn-vue); MCP endpoint kept via `@nuxtjs/mcp-toolkit`, the module Docus used, with the same page list / page read tools.
- **Motion set**: page-content fade/slide on route change; sidebar active indicator that slides between items; table-of-contents scroll-spy indicator; copy-button confirm state; ⌘K palette open/close; hover and focus states on every interactive element. Durations 120–220 ms, motion-v. All off under `prefers-reduced-motion`.
- **Distinctive moment (docs home)**: the oversized mono install command (`pnpm add @geoql/v-maplibre maplibre-gl`, 40px+) from the mapcn-vue catalog.

## Builder's calls (from the review; owner can override)

- **Security headers stay app-local.** mapcn-vue keeps its `nuxt-security` nonce CSP; the layer owns no security config. The docs keep today's headers (none) in this change; a docs CSP is a separate follow-up.
- **Cross-site links.** The shared toolbar takes per-app links. On mapcn-vue it shows "API docs" → `v-maplibre.geoql.in` and keeps its local registry `/docs` entry; on the docs it shows "Examples" → `mapcn-vue.geoql.in/examples`.
- **Callout colours** use existing semantic tokens: info → `primary`, success → `success`, warning → `warning`, danger → `destructive`, default → neutral. The token contract does not grow.
- **URL oracle** is the live `v-maplibre.geoql.in/sitemap.xml` (17 URLs, captured 2026-11-22): `/`, `/components/{map,markers}`, `/controls/{layer,legend,lidar}`, `/guide/{examples,getting-started,peer-dependencies}`, `/layers/{aggregation,core,deckgl-overview,geo,geoarrow,maplibre,raster,wind}-layers` (with `deckgl-overview` as is). Each must return 200 after the change.
- **pnpm overrides** that only Docus needed are removed after `pnpm why` shows no remaining consumer; any still needed (for example by `@nuxtjs/mcp-toolkit`) stay, with a comment naming the consumer.
- **Sitemap, robots, schema-org** keep parity on the docs (each app configures its own; modules are not in the layer). robots keeps allowing AI crawlers.

## Left to the builder

- Exact layer file layout and which shadcn primitives move vs stay app-local.
- How mapcn-vue's example-specific sidebar plugs into the shared shell (slot or prop).
- Search UI details within the token contract.

## Done when

- Both sites build; lint, format, typecheck, tests pass.
- All 16 docs pages return 200 at their current URLs; `llms.txt`, `llms-full.txt`, OG images and the MCP `tools/list` respond on the deployed site.
- Real-browser screenshots of docs home, a docs page and mapcn-vue home in light and dark at 1440×900 and 390×844, reviewed against the 5-dimension design critique (no dimension below 3).
- Navigating Docs → Examples → Docs shows the same toolbar, fonts and colours with no colour-mode flash.
- mapcn-vue's 110-example sweep flags nothing new.
