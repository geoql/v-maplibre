---
name: mapcn-vue-design
description: Project-level design skill for apps/mapcn-vue. Pins Tech Utility direction. Use BEFORE any visual work in this app.
---

# mapcn-vue · Design System

Pinned direction: **Tech Utility** (Linear / Vercel / Stripe reference set).

This skill overrides `design-discipline`'s `references/directions.md` defaults for everything inside `apps/mapcn-vue/`, `apps/docs/` and `packages/site-shell/`. The two sites share one design layer (`packages/site-shell`): tokens, fonts, toolbar, docs shell, content components and motion live there, so a change lands on mapcn-vue.geoql.in and v-maplibre.geoql.in together. The library (`packages/v-maplibre`) is out of scope.

---

## Why Tech Utility (and not the others)

mapcn-vue is the showcase site for `@geoql/v-maplibre` — a Vue 3 map component library installed via `npx shadcn-vue add ...`. The audience is developers shipping production maps for defense, logistics, geospatial, and operations products. The visual league we want to share is **Linear, Vercel, Stripe Docs, Cloudflare dashboards** — restrained, content-first, mono-flavored, density without clutter. Editorial / warm-soft / brutalist directions all fail at trust-signaling to this audience.

---

## Token Contract — Tailwind v4 `@theme`

All tokens MUST be referenced via Tailwind's semantic names (`bg-background`, `text-foreground`, `bg-primary`, `border-border`). NEVER hardcode `oklch(...)` in components. NEVER use raw Tailwind color utilities (`bg-blue-500`, `text-emerald-500`, etc).

### Dark mode (default, fallback)

```css
@theme {
  --color-background: oklch(0.16 0.015 254);
  --color-foreground: oklch(0.96 0.006 254);
  --color-card: oklch(0.2 0.015 254);
  --color-card-foreground: oklch(0.96 0.006 254);
  --color-popover: oklch(0.2 0.015 254);
  --color-popover-foreground: oklch(0.96 0.006 254);
  --color-primary: oklch(0.7 0.16 254);
  --color-primary-foreground: oklch(0.16 0.015 254);
  --color-secondary: oklch(0.24 0.018 254);
  --color-secondary-foreground: oklch(0.96 0.006 254);
  --color-muted: oklch(0.24 0.018 254);
  --color-muted-foreground: oklch(0.68 0.012 254);
  --color-accent: oklch(0.24 0.018 254);
  --color-accent-foreground: oklch(0.96 0.006 254);
  --color-border: oklch(0.3 0.012 254);
  --color-input: oklch(0.3 0.012 254);
  --color-ring: oklch(0.7 0.16 254);
  --color-destructive: oklch(0.62 0.22 27);
  --color-success: oklch(0.72 0.16 165);
  --color-warning: oklch(0.78 0.16 75);
  --radius: 0.5rem; /* 8px max — sharp */
}
```

### Light mode (mirror)

```css
@theme {
  --color-background: oklch(0.99 0.003 254);
  --color-foreground: oklch(0.18 0.012 254);
  --color-card: oklch(0.97 0.005 254);
  --color-popover: oklch(0.97 0.005 254);
  --color-primary: oklch(0.55 0.18 254);
  --color-secondary: oklch(0.94 0.006 254);
  --color-muted: oklch(0.94 0.006 254);
  --color-muted-foreground: oklch(0.42 0.012 254);
  --color-accent: oklch(0.94 0.006 254);
  --color-border: oklch(0.88 0.008 254);
  --color-input: oklch(0.88 0.008 254);
}
```

---

## Type Stack

ONE family. No serif. Mono for code/IDs/keyboard hints only.

```css
--font-sans: 'Geist', ui-sans-serif, system-ui, sans-serif;
--font-mono: 'Geist Mono', 'JetBrains Mono', ui-monospace, monospace;
--font-display: var(--font-sans);
```

Loaded via `@nuxt/fonts` module (already in nuxt.config.ts). No manual `<link>` to Google Fonts needed.

### Weight rules

- **Display headlines (≥48px)**: `font-weight: 800`, `letter-spacing: -0.045em`, `line-height: 0.92`
- **Section headings (24–48px)**: `font-weight: 700`, `letter-spacing: -0.03em`, `line-height: 1.05`
- **Body**: `font-weight: 400`
- **Caption / label**: `font-weight: 500`, `letter-spacing: 0.18em`, `text-transform: uppercase`, `font-size: 11px`, family = mono
- **Data numbers**: `font-variant-numeric: tabular-nums`
- **NEVER use 600** — feels indecisive

---

## Hard Bans (in addition to global rules)

1. **NO `.gradient-text` class.** It is removed from `main.css`. Don't reintroduce.
2. **NO `bg-clip-text` headlines** with `bg-gradient-to-*`. Solid color + weight contrast only.
3. **NO `font-display`, `font-serif`** classes in Vue templates — there's only one family.
4. **NO raw Tailwind color utilities**: `bg-blue-*`, `text-emerald-*`, `bg-red-*`, `bg-green-*`, `bg-yellow-*`, etc. Use semantic tokens (`bg-primary`, `text-destructive`, `text-success`, `text-warning`).
5. **NO `rounded-2xl` or larger** anywhere. Tech Utility caps at `rounded-lg` (8px). Sharp > soft.
6. **NO drop shadows for elevation**. Borders only. (Glass-blur backdrops on overlay chrome like the FloatingToolbar are OK.)
7. **NO 3-col equal grids on hero**. Use 8/4 or 7/5 asymmetric splits.
8. **NO centered-everything compositions**. Asymmetric or break-the-grid.

---

## Tech Utility — Must-Include Checklist (per surface)

A compliant surface MUST satisfy at least **4 of these 6**:

- [ ] Asymmetric grid (8/4 or 7/5 split)
- [ ] Tabular numerals (`font-variant-numeric: tabular-nums` or class `tabular-nums`) on any data
- [ ] Mono font for code/IDs/keyboard hints
- [ ] ONE hero metric or focal element (not 4 equal KPIs)
- [ ] Sharp radii (≤ 8px) and borders (not shadows) for elevation
- [ ] ONE single accent color used decisively

---

## Distinctive Moment Catalog (Hard Rule #9)

Every surface needs ONE memorable, non-default visual decision. For mapcn-vue specifically, pick from:

1. **Live coordinate panel** — `37.7749° N, 122.4194° W` set in mono at 12px, sitting in a right-side hero panel with a terrain/grid SVG. (Used on homepage hero.)
2. **Oversized monospace install command** — the `npx shadcn-vue add ...` line set at 40px+ as the typographic event of the surface.
3. **Asymmetric demo grid** — one wide demo (2x width) anchoring a row of 3, with mono-labeled stat overlays.
4. **Hero metric** — a single huge tabular-num metric (e.g., "2,847" at 96px) with a sparkline, replacing the conventional 3-card KPI row.
5. **Map-coordinate flourish** — a real coordinate pair (per page or per example) shown in mono as a tiny meta-row anchored to the section header.

If a surface lacks ONE of these (or an equivalent), it's anonymous output. Rebuild.

---

## Rule #10 — Hero Composition

Homepage hero MUST:

- Use `min-height: 100dvh` on the hero `<section>`
- Place primary CTA above the fold at both 1440×900 desktop AND 390×844 mobile
- Use asymmetric 8/4 grid on desktop, stacked vertical on mobile
- The distinctive moment from Rule #9 sits in the 4-column right panel on desktop, BELOW the hero text on mobile

---

## When to Refuse

If a future request asks for any of:

- "Add a gradient to the headline"
- "Use Inter / Plus Jakarta / Space Grotesk"
- "Make these cards purple/blue/emerald" with raw Tailwind colors
- "Center the hero and make it three columns"

…respond per `design-discipline` Hard Rule #8 — refuse + offer a compliant alternative. Direct the user to override this skill via `apps/mapcn-vue/CLAUDE.md` if they really want to bypass.

---

## File Inventory (where the design lives)

Shared layer, `packages/site-shell/` (both sites):

| File                                        | Owns                                                                 |
| ------------------------------------------- | -------------------------------------------------------------------- |
| `app/assets/css/shell.css`                  | All tokens, weight rules, base typography, prose, shiki, docs motion |
| `nuxt.config.ts`                            | `@nuxt/fonts` (Geist), color mode, shadcn, Tailwind, icons, motion   |
| `app/components/ui/**`                      | shadcn-vue primitives                                                |
| `app/components/SiteToolbar.vue`            | Floating top-left toolbar (links, GitHub, theme toggle, app slots)   |
| `app/components/docs/*`                     | Docs shell: nav rail, TOC, pager, mobile menu sheet                  |
| `app/components/content/*`                  | Markdown components: callout, alert, code-group, code block, table   |
| `app/components/SearchPalette.vue`          | ⌘K search                                                            |
| `app/components/OgImage/SiteDoc.satori.vue` | OG card for both sites (`brand` / `domain` props)                    |

mapcn-vue, `apps/mapcn-vue/`:

| File                                          | Owns                                                      |
| --------------------------------------------- | --------------------------------------------------------- |
| `app/assets/css/main.css`                     | Map containers, popups, LiDAR control (imports shell.css) |
| `app/pages/index.vue`                         | Homepage hero — the canonical surface                     |
| `app/components/AppSidebar.vue`               | Examples sidebar                                          |
| `app/components/FloatingToolbar.vue`          | Wraps SiteToolbar: sidebar trigger, FPS toggle            |
| `app/components/HomeFeatureCard.vue`          | Feature card primitive                                    |
| `app/components/ComponentDemo.vue`            | Per-example demo header                                   |
| `app/components/examples/index/Header.vue`    | Examples gallery header                                   |
| `app/components/examples/index/FooterCta.vue` | Examples gallery footer CTA                               |

Docs, `apps/docs/`: `app/pages/index.vue` (home: oversized install command is its distinctive moment), `app/layouts/default.vue`, `app/error.vue`.

---

## Reference

Original design exploration: `.design-explorations/a-tech-utility.html` (in the repo root, served on `localhost:8888` during the design session). That HTML mockup is the visual ground truth — any implementation that diverges from its posture should be questioned.
