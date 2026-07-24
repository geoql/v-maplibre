# Nuxt SEO Best Practices - Complete Reference

> This file is auto-generated. Do not edit directly.
> Edit individual rule files in the `rules/` directory and run `pnpm build`.

# Nuxt SEO Best Practices

Comprehensive SEO optimization guide for Nuxt 4 applications deployed to Cloudflare Pages/Workers. Contains 11 rules across 4 categories, prioritized by impact to guide automated refactoring and code generation.

> **Nuxt 4.5 note:** head management now runs on `unhead` v3 — `useHead` typing is stricter (type errors after upgrading are usually genuine tightening, not regressions) and promise input is no longer supported. All `useHead`/`useSeoMeta` examples in this skill use plain synchronous values and are v3-compatible.

## When to Apply

Reference these guidelines when:

- Generating dynamic OG images on Cloudflare Workers
- Setting up page-level SEO meta tags and composables
- Adding JSON-LD structured data
- Configuring Nitro for Cloudflare Pages deployment
- Handling SSR-incompatible client-only libraries
- Setting up social sharing meta (Open Graph, Twitter Cards)
- Working with Satori for image generation (NEVER use React)

## Rule Categories by Priority

| Priority | Category                  | Impact   | Prefix    |
| -------- | ------------------------- | -------- | --------- |
| 1        | OG Image Generation       | CRITICAL | `og-`     |
| 2        | Page SEO & Meta           | HIGH     | `meta-`   |
| 3        | Structured Data           | MEDIUM   | `schema-` |
| 4        | Cloudflare & Nitro Config | HIGH     | `cf-`     |

## Quick Reference

### 1. OG Image Generation (CRITICAL)

- `og-cf-workers` - Generate dynamic OG images on Cloudflare Workers with @cf-wasm/og
- `og-no-react` - Use plain JS objects for Satori elements, NEVER React
- `og-cache-headers` - Cache OG images with immutable headers for CDN
- `og-corp-cross-origin` - Serve OG images with CORP cross-origin or every social card silently breaks

### 2. Page SEO & Meta (HIGH)

- `meta-use-page-seo` - Reusable composable for consistent page-level SEO
- `meta-social-tags` - Proper Open Graph and Twitter Card meta tags
- `meta-canonical-url` - Canonical URLs and og:url for every page

### 3. Structured Data (MEDIUM)

- `schema-json-ld` - JSON-LD structured data in app.vue for Google Rich Results

### 4. Cloudflare & Nitro Config (HIGH)

- `cf-compatibility-date` - Pin compatibilityDate, never use 'latest'
- `cf-nitro-config` - Nitro config for CF Pages (nodeCompat, process.stdout, WASM)
- `cf-ssr-externals` - SSR external config for client-only libraries
- `cf-wasm-import` - WASM module configuration for Cloudflare Workers

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/og-cf-workers.md
rules/meta-use-page-seo.md
rules/_sections.md
```

Each rule file contains:

- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and Nuxt/Cloudflare-specific notes

## Full Compiled Document

For the complete guide with all rules expanded: `AGENTS.md`

---

# Detailed Rules

### Pin compatibilityDate, Never Use 'latest'

**Impact:** HIGH - Prevents unpredictable Nitro behavior changes between builds

## Pin compatibilityDate, Never Use 'latest'

Nuxt's `compatibilityDate` pins the date Nitro uses to decide which deployment-preset features and default behaviors to enable, and it is forwarded to the `compatibility_date` in the generated Wrangler config. It is distinct from — but feeds — Cloudflare's Workers-runtime compatibility date. Leaving it unset (or on `'latest'`) means Nitro applies its newest default behavior, which can shift when you upgrade Nitro. Pin a date for reproducible builds.

**Incorrect (unset / using 'latest'):**

```typescript
// ❌ WRONG — Nitro applies its newest defaults, which can shift on upgrade
// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: 'latest',
  // Behavior can change the next time you bump Nitro — not reproducible
});
```

**Correct (pinned date):**

```typescript
// ✅ CORRECT — Pinned to a specific date
// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-07-18',
  // Consistent behavior across all builds
  // Update intentionally when you want new Nitro features
});
```

**When to update:**

- When upgrading Nuxt or Nitro versions
- When you need a specific Nitro feature that requires a newer date
- Always test after updating — some changes are breaking

**How to find the right date:**

- Use today's date (or your last-tested date)
- If you rely on `nodejs_compat`, `compatibility_date` must be `>= 2024-09-23`
- Check [Nitro changelog](https://github.com/unjs/nitro/releases) for what changed
- Pin to the latest date that works with your deployment target

**Real-world impact:** A `compatibilityDate` change can affect:

- WASM module loading behavior
- Node.js API compatibility layer
- Response header defaults

---

### Configure Nitro for Cloudflare Pages Deployment

**Impact:** HIGH - Ensures WASM support, Node.js compatibility, and proper builds on CF Pages

## Configure Nitro for Cloudflare Pages Deployment

Cloudflare Pages/Workers have specific requirements for WASM modules, Node.js APIs, and global objects. Without proper Nitro configuration, builds fail or runtime errors occur.

**Incorrect (minimal config):**

```typescript
// ❌ WRONG — Missing critical CF Workers config
export default defineNuxtConfig({
  nitro: {
    preset: 'cloudflare_pages',
  },
});
```

**Correct (full CF Pages config):**

```typescript
// ✅ CORRECT — Full Cloudflare configuration (single nitro block)
export default defineNuxtConfig({
  compatibilityDate: '2025-07-18',

  nitro: {
    // 'cloudflare_module' is the recommended preset for Workers deployments.
    // Use 'cloudflare_pages' (underscore) if you deploy via Cloudflare Pages.
    preset: 'cloudflare_module',

    // WASM module support for @cf-wasm/og and similar packages
    wasm: {
      esmImport: true,
      lazy: true,
    },
  },

  vite: {
    ssr: {
      // Externalize client-only libraries from server bundle
      external: ['posthog-js'],
    },
  },
});
```

**Enabling Node.js compatibility (Buffer, crypto, `process`, etc.):**

There is no `cloudflare: { nodeCompat: true }` Nuxt key. Node.js compatibility comes from the `nodejs_compat` **compatibility flag** in your Wrangler config, which requires `compatibility_date >= 2024-09-23`:

```jsonc
// wrangler.jsonc
{
  "compatibility_date": "2024-09-23",
  "compatibility_flags": ["nodejs_compat"],
}
```

You can also let Nitro generate/merge this via the `nitro.cloudflare.wrangler` passthrough:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      wrangler: {
        compatibility_date: '2024-09-23',
        compatibility_flags: ['nodejs_compat'],
      },
    },
  },
});
```

**`process.stdout` workaround (only without `nodejs_compat`):**

If you have NOT enabled `nodejs_compat`, some libraries reference `process.stdout`, which doesn't exist on Workers. Stub it via Vite `define`:

```typescript
vite: {
  define: {
    // Only needed when nodejs_compat is NOT enabled.
    // With the flag (compatibility_date >= 2024-09-23), `process` is natively supported.
    'process.stdout': 'undefined',
  },
},
```

**Configuration breakdown:**

| Setting                                  | Why                                                                         |
| ---------------------------------------- | --------------------------------------------------------------------------- |
| `compatibilityDate: '2025-07-18'`        | Pinned date — never use `'latest'`                                          |
| `nitro.preset: 'cloudflare_module'`      | Recommended preset for Workers (`cloudflare_pages` for Pages)               |
| `compatibility_flags: ['nodejs_compat']` | Enables `Buffer`, `crypto`, `process`, and other Node.js APIs on Workers    |
| `process.stdout: 'undefined'`            | Only without `nodejs_compat` — stubs the missing `process.stdout` reference |
| `vite.ssr.external`                      | Keeps client-only libraries out of the server bundle                        |
| `wasm.esmImport: true`                   | Allows `import wasm from './file.wasm'` syntax                              |
| `wasm.lazy: true`                        | Lazy-loads WASM modules (required for CF Workers dynamic instantiation)     |

**Common errors these settings fix:**

```
# Without nodejs_compat flag:
ReferenceError: Buffer is not defined

# Without process.stdout stub (and no nodejs_compat):
TypeError: Cannot read properties of undefined (reading 'write')

# Without wasm config:
CompileError: WebAssembly.instantiate() is not allowed

# Without ssr.external for posthog-js:
Error: symbol 'a' already declared (esbuild on Linux CI)
```

**Note:** Declare `nitro` only ONCE — a duplicate `nitro:` key silently overrides the first (dropping your `preset`). Keep `preset`, `wasm`, and `cloudflare` inside the single `nitro` block.

Reference: [Nuxt Cloudflare Deployment](https://nuxt.com/deploy/cloudflare) | [Nitro Cloudflare Provider](https://nitro.build/deploy/providers/cloudflare)

---

### Externalize Client-Only Libraries from SSR Bundle

**Impact:** HIGH - Prevents server bundle contamination and esbuild errors on CI

## Externalize Client-Only Libraries from SSR Bundle

Client-only libraries (analytics, tracking, browser APIs) should never be bundled into the Nitro server entry. When they leak into the server bundle, they cause esbuild errors on CI (especially Linux) due to duplicate symbol declarations from minified code.

**Incorrect (client-only library leaks into server bundle):**

```typescript
// ❌ WRONG — @posthog/nuxt registers its vue-plugin for both client AND server
// This leaks ~4500 lines of minified posthog-js into the Nitro server bundle
// On Linux CI, recent esbuild versions error with "symbol 'a' already declared"

export default defineNuxtConfig({
  modules: ['@posthog/nuxt'],
  // No vite.ssr.external — posthog-js is bundled into server entry
});
```

**Correct (externalize with vite.ssr.external):**

```typescript
// ✅ CORRECT — Externalize client-only libraries from server bundle
export default defineNuxtConfig({
  modules: ['@posthog/nuxt'],

  vite: {
    ssr: {
      // Keep posthog-js out of the Nitro server bundle
      // The module bug registers the vue-plugin without { mode: 'client' }
      external: ['posthog-js'],
    },
  },
});
```

**How to identify leaking libraries:**

1. **Build error on CI but not locally:** Different esbuild binaries (macOS vs Linux) have different strictness levels for duplicate declarations
2. **Check server entry size:** `wc -l .output/server/chunks/nitro/...` — if it's thousands of lines larger than expected, something leaked
3. **Search the server bundle:** `grep 'posthog' .output/server/` — if a client-only library appears, it leaked

**Common client-only libraries to externalize:**

```typescript
vite: {
  ssr: {
    external: [
      'posthog-js',       // PostHog analytics
      'hotjar',           // Hotjar tracking
      'intercom-client',  // Intercom chat widget
      // Add any library that uses window, document, or browser APIs
    ],
  },
},
```

**Root cause:** Some Nuxt modules register their Vue plugins for both client and server instead of using `{ mode: 'client' }`. This is a module bug, but the `vite.ssr.external` workaround is safe and reliable.

**Real error example:**

```
✘ [ERROR] The symbol "a" has already been declared
   .output/server/chunks/nitro/nitro.mjs:12345:6
```

This error appears on Linux CI (esbuild is stricter there) when minified client-only code with single-letter variables is merged into the Rollup server output.

---

### Configure WASM Module Imports for Cloudflare Workers

**Impact:** MEDIUM - Enables WASM-dependent packages like @cf-wasm/og to work on CF Workers

## Configure WASM Module Imports for Cloudflare Workers

WASM modules on Cloudflare Workers require specific Nitro configuration. Without it, `WebAssembly.instantiate()` calls fail because CF Workers restrict dynamic WASM compilation for security reasons. The `@cf-wasm/og` package (used for OG image generation) needs ESM WASM imports with lazy loading.

**Incorrect (no WASM config):**

```typescript
// ❌ WRONG — WASM modules fail with "WebAssembly.instantiate() is not allowed"
export default defineNuxtConfig({
  nitro: {
    preset: 'cloudflare_module',
    // Missing wasm config
  },
});
```

**Correct (WASM ESM imports with lazy loading):**

```typescript
// ✅ CORRECT — Enable WASM for CF Workers
export default defineNuxtConfig({
  nitro: {
    // 'cloudflare_module' is recommended for Workers; 'cloudflare_pages' for Pages
    preset: 'cloudflare_module',
    wasm: {
      // Allow import wasm from './module.wasm' syntax
      esmImport: true,
      // Lazy-load WASM modules (required for CF Workers)
      lazy: true,
    },
  },
});
```

**Why this config matters:**

Cloudflare Workers disallow compiling WASM from arbitrary bytes at runtime (`WebAssembly.instantiate()` / `WebAssembly.compile()` on raw buffers). Setting `esmImport: true` makes each `.wasm` a first-class ES module that is compiled at deploy time (not from runtime bytes), and `lazy: true` defers instantiation until first use rather than at import. Together they satisfy the Workers restriction while keeping cold starts fast.

**Packages that require this config:**

- `@cf-wasm/og` — OG image generation (Satori + Resvg WASM)
- `@cf-wasm/photon` — Image manipulation
- Any package that ships `.wasm` files

**Combined with dynamic import:**

```typescript
// The WASM config enables this pattern in server routes:
const { ImageResponse } = await import('@cf-wasm/og/workerd');
// The 'workerd' subpath uses CF Workers-compatible WASM loading
```

**Testing note:** WASM-dependent routes won't work in local `nuxt dev` (Node.js runtime). Test on Cloudflare Workers preview (`wrangler pages dev`) or production deployment.

Reference: [Nitro WASM Config](https://nitro.build/config#wasm) | [Cloudflare Workers WASM](https://developers.cloudflare.com/workers/runtime-apis/webassembly/)

---

### Set Canonical URLs and og:url on Every Page

**Impact:** HIGH - Prevents duplicate content penalties and ensures correct social sharing URLs

## Set Canonical URLs and og:url on Every Page

Every public page must have a `<link rel="canonical">` tag and an `og:url` meta tag pointing to the authoritative URL. Without these, search engines may index duplicate URLs (with/without trailing slashes, query params, etc.) and social platforms may display wrong URLs.

**Incorrect (missing canonical):**

```vue
<script setup lang="ts">
  // ❌ WRONG — No canonical URL, no og:url
  useSeoMeta({
    title: 'About Us',
    description: 'Learn about our team.',
    ogTitle: 'About Us',
    // Missing: ogUrl, canonical link
  });
</script>
```

**Correct (canonical + og:url):**

```vue
<script setup lang="ts">
  // ✅ CORRECT — Both canonical link and og:url
  const config = useRuntimeConfig();
  const baseUrl = config.public.baseUrl || 'https://example.com';
  const canonicalUrl = `${baseUrl}/about`;

  useHead({
    link: [{ rel: 'canonical', href: canonicalUrl }],
  });

  useSeoMeta({
    title: 'About Us',
    description: 'Learn about our team.',
    ogUrl: canonicalUrl,
    ogTitle: 'About Us',
    ogDescription: 'Learn about our team.',
    // ... rest of meta
  });
</script>
```

**Best practice — use the `usePageSeo` composable:**

```vue
<script setup lang="ts">
  // ✅ BEST — usePageSeo handles canonical and og:url automatically
  usePageSeo({
    title: 'About Us',
    description: 'Learn about our team.',
    path: '/about',
  });
</script>
```

**Runtime config setup:**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'https://example.com',
    },
  },
});
```

**Key rules:**

- Canonical URL must be **absolute** (full URL with protocol and domain)
- Canonical URL should **not** include query parameters unless they change the page content
- Canonical URL should be **consistent** — pick either with or without trailing slash, never both
- `og:url` should match the canonical URL exactly
- The canonical must be present in the **server-rendered HTML** — Nuxt SSR via `useHead`/`usePageSeo` does this by default. Never inject it client-only: Google's guidance is that JavaScript shouldn't change the canonical, and a client-only tag may never be seen by the crawler.

Reference: [Google Canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

---

### Set Complete Open Graph and Twitter Card Meta Tags

**Impact:** HIGH - Ensures rich social media previews on all platforms

## Set Complete Open Graph and Twitter Card Meta Tags

Social media platforms (Twitter, Facebook, LinkedIn, Discord, Slack) use Open Graph and Twitter Card meta tags to render link previews. Incomplete tags result in plain text links with no image or description.

**Incorrect (incomplete meta tags):**

```vue
<script setup lang="ts">
  // ❌ WRONG — Missing OG image dimensions, Twitter card, og:type
  useSeoMeta({
    title: 'My Page',
    ogTitle: 'My Page',
    ogImage: '/og/my-page.png',
    // Missing: ogType, ogUrl, ogDescription, ogImageWidth, ogImageHeight
    // Missing: twitterCard, twitterTitle, twitterDescription, twitterImage
  });
</script>
```

**Correct (complete social meta):**

```vue
<script setup lang="ts">
  // ✅ CORRECT — Full OG + Twitter Card meta
  useSeoMeta({
    title: 'My Page',
    description: 'Page description for search engines.',
    // Open Graph (Facebook, LinkedIn, Discord, Slack)
    ogType: 'website',
    ogUrl: 'https://example.com/my-page',
    ogTitle: 'My Page',
    ogDescription: 'Page description for social sharing.',
    ogImage: 'https://example.com/og/my-page.png',
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: 'My Page preview',
    ogSiteName: 'My App',
    // Twitter Card
    twitterCard: 'summary_large_image',
    twitterTitle: 'My Page',
    twitterDescription: 'Page description for Twitter.',
    twitterImage: 'https://example.com/og/my-page.png',
    twitterImageAlt: 'My Page preview',
  });
</script>
```

**Required meta tags checklist:**

| Tag                  | Purpose                             | Required    |
| -------------------- | ----------------------------------- | ----------- |
| `ogType`             | Content type (`website`, `article`) | Yes         |
| `ogUrl`              | Canonical URL                       | Yes         |
| `ogTitle`            | Title for social cards              | Yes         |
| `ogDescription`      | Description for social cards        | Yes         |
| `ogImage`            | **Full URL** to OG image            | Yes         |
| `ogImageWidth`       | Image width (1200)                  | Recommended |
| `ogImageHeight`      | Image height (630)                  | Recommended |
| `ogImageAlt`         | Image alt text                      | Recommended |
| `ogSiteName`         | Site name                           | Recommended |
| `twitterCard`        | Card type (`summary_large_image`)   | Yes         |
| `twitterTitle`       | Title for Twitter                   | Yes         |
| `twitterDescription` | Description for Twitter             | Yes         |
| `twitterImage`       | **Full URL** to image               | Yes         |

**Important notes:**

- OG image URL must be **absolute** (full URL with protocol and domain), not relative
- Use `summary_large_image` for Twitter cards — it shows the full-width image
- `ogImageWidth` and `ogImageHeight` help platforms render the correct aspect ratio without fetching the image first
- **1200×630 is the de-facto social-platform convention, not an OGP spec requirement.** The Open Graph protocol lists `og:image:width` / `og:image:height` as optional structured properties (ogp.me) — supplying them is recommended for reliable previews, but they are not mandatory.
- Use the `usePageSeo` composable (see `meta-use-page-seo` rule) to avoid duplicating this across pages

**`og:type` must match the content type — blog posts are `article`, not `website`:**

```vue
<script setup lang="ts">
  // ❌ WRONG — blog post typed as website (a shared usePageSeo default
  // silently applies 'website' to every page, including /blog/**)
  useSeoMeta({ ogType: 'website' });

  // ✅ CORRECT — article type + article metadata for blog content
  useSeoMeta({
    ogType: 'article',
    articlePublishedTime: post.publishedAt, // ISO 8601
    articleModifiedTime: post.updatedAt,
    articleAuthor: ['https://example.com/about'],
  });
</script>
```

`og:type: article` unlocks the `article:*` property namespace (published/modified time, author, section, tag) that platforms and search engines use for freshness and byline display. A site-wide SEO composable that hardcodes `website` will silently mistype every blog post — accept a `type` option and pass `'article'` from blog pages.

**Length limits — social cards truncate long titles and descriptions:**

| Field           | Safe limit | What happens beyond it                                            |
| --------------- | ---------- | ----------------------------------------------------------------- |
| `ogTitle`       | ~60 chars  | Facebook/LinkedIn/Slack ellipsize mid-sentence                    |
| `ogDescription` | ~155 chars | Clipped on most platforms; ~65 chars visible on some mobile cards |

Keep the social title/description SHORTER than the SEO `<title>`/`<meta description>` when needed — they are separate fields precisely so you can tune them per surface. A 79-char title and 208-char description will parse as "Found" in every debugger while still rendering truncated on the actual cards.

**Head meta that should be set globally in `nuxt.config.ts`:**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0f0e17' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },
});
```

Reference: [Open Graph Protocol](https://ogp.me/) | [X Cards](https://developer.x.com/en/docs/x-for-websites/cards/overview/abouts-cards) (`summary_large_image` is the standard large-preview card type)

---

### Create a Reusable usePageSeo Composable for Consistent Page SEO

**Impact:** HIGH - Ensures every page has consistent SEO meta without duplication

## Create a Reusable usePageSeo Composable for Consistent Page SEO

Instead of calling `useSeoMeta` and `useHead` separately on every page, create a single `usePageSeo` composable that sets canonical URL, Open Graph, Twitter Card, and OG image URL consistently.

**Incorrect (duplicating SEO logic on every page):**

```vue
<script setup lang="ts">
  // ❌ WRONG — Duplicated across every page, inconsistent, error-prone
  const config = useRuntimeConfig();
  const baseUrl = config.public.baseUrl;

  useSeoMeta({
    title: 'About Us',
    description: 'Learn about our team.',
    ogType: 'website',
    ogUrl: `${baseUrl}/about`,
    ogTitle: 'About Us',
    ogDescription: 'Learn about our team.',
    ogImage: `${baseUrl}/og/about.png?title=About%20Us`,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    twitterCard: 'summary_large_image',
    twitterTitle: 'About Us',
    twitterDescription: 'Learn about our team.',
    twitterImage: `${baseUrl}/og/about.png?title=About%20Us`,
  });

  useHead({
    link: [{ rel: 'canonical', href: `${baseUrl}/about` }],
  });
</script>
```

**Correct (usePageSeo composable):**

```typescript
// ✅ CORRECT — app/composables/seo/use-page-seo.ts

export function usePageSeo(options: {
  title: string;
  description: string;
  path: string;
  ogDescription?: string;
  ogImageAlt?: string;
  robots?: string;
}) {
  const config = useRuntimeConfig();
  const baseUrl = config.public.baseUrl || 'https://example.com';

  const canonicalUrl = `${baseUrl}${options.path}`;
  const ogDesc = options.ogDescription ?? options.description;
  const ogImageAlt = options.ogImageAlt ?? options.title;

  // Dynamic OG image URL — served by server/routes/og/[...path].png.ts
  const ogImageUrl = `${baseUrl}/og${options.path}.png?title=${encodeURIComponent(options.title)}&description=${encodeURIComponent(ogDesc)}`;

  // Canonical link
  useHead({
    link: [{ rel: 'canonical', href: canonicalUrl }],
  });

  // Full SEO meta
  useSeoMeta({
    title: options.title,
    description: options.description,
    ...(options.robots ? { robots: options.robots } : {}),
    // Open Graph
    ogType: 'website',
    ogUrl: canonicalUrl,
    ogTitle: options.title,
    ogDescription: ogDesc,
    ogImage: ogImageUrl,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: ogImageAlt,
    ogSiteName: 'My App',
    // Twitter Card
    twitterCard: 'summary_large_image',
    twitterTitle: options.title,
    twitterDescription: ogDesc,
    twitterImage: ogImageUrl,
    twitterImageAlt: ogImageAlt,
  });
}
```

**Usage on pages:**

```vue
<script setup lang="ts">
  // ✅ Clean, consistent, one line per page
  usePageSeo({
    title: 'About Us',
    description: 'Learn about our team and mission.',
    path: '/about',
  });
</script>
```

**Composable file organization:**

```
app/composables/seo/
  use-page-seo.ts     # The composable
  index.ts             # Barrel export: export { usePageSeo } from './use-page-seo'
```

**Key features:**

- `ogDescription` defaults to `description` if not provided
- `ogImageAlt` defaults to `title` if not provided
- `robots` is optional — only set when needed (e.g., `'noindex'` for private pages)
- OG image URL is auto-generated from the path, pointing to the OG server route
- Canonical URL prevents duplicate content issues

**Perf: tree-shake purely static meta from the client bundle.**

When the SEO meta for a page is entirely static (no reactive values), wrap the call in `if (import.meta.server) { ... }`. Nuxt renders it into the SSR HTML, and the block is tree-shaken from the client bundle — crawlers and social platforms still see the tags, but the client ships less JS:

```typescript
if (import.meta.server) {
  useSeoMeta({
    title: 'About Us',
    description: 'Learn about our team.',
    // ...static tags only
  });
}
```

Do NOT do this for reactive meta (titles that depend on `ref`/route/fetched data) — reactive meta must run universally so it updates on client navigation.

**Reactive titles need getters.** The plain-string signature above makes values static: they are captured once and won't update on client-side navigation. To support reactive values, accept getters (`() => string`) and pass them straight through to `useSeoMeta`, which unwraps getter syntax:

```typescript
useSeoMeta({
  // Getter — re-evaluates on updates
  title: () => `${pageTitle.value} · My App`,
});
```

If you pass a bare reactive value without getter syntax, `useSeoMeta` receives the snapshot, not the reactive source, and the tag won't update.

Reference: [Nuxt useSeoMeta](https://nuxt.com/docs/api/composables/use-seo-meta)

---

### Cache OG Images with Immutable Headers

**Impact:** HIGH - Reduces server load and ensures fast social media card rendering

## Cache OG Images with Immutable Headers

OG images are fetched by social media crawlers (Twitter, Facebook, LinkedIn, Discord) every time a link is shared. Without caching, each share triggers a new image generation — expensive on Cloudflare Workers. Set immutable cache headers for CDN-level caching.

**Incorrect (no cache headers):**

```typescript
// ❌ WRONG — No cache headers, every request generates a new image
export default defineEventHandler(async (event) => {
  const { ImageResponse } = await import('@cf-wasm/og/workerd');
  const response = await ImageResponse.async(element, {
    width: 1200,
    height: 630,
  });
  const buffer = await response.arrayBuffer();

  setResponseHeaders(event, {
    'Content-Type': 'image/png',
    // Missing Cache-Control — image regenerated on every request
  });

  return Buffer.from(buffer);
});
```

**Correct (immutable caching):**

```typescript
// ✅ CORRECT — CDN caches for 1 year, immutable
export default defineEventHandler(async (event) => {
  const { ImageResponse } = await import('@cf-wasm/og/workerd');
  const response = await ImageResponse.async(element, {
    width: 1200,
    height: 630,
  });
  const buffer = await response.arrayBuffer();

  setResponseHeaders(event, {
    'Content-Type': 'image/png',
    'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
  });

  return Buffer.from(buffer);
});
```

**Cache header breakdown:**

- `public` — Cacheable by CDN and browsers
- `max-age=31536000` — Browser cache: 1 year (365 × 24 × 60 × 60)
- `s-maxage=31536000` — CDN/shared cache: 1 year
- `immutable` — Content will never change at this URL — no revalidation needed

**When to invalidate:** If OG image content changes (e.g., title update), change the URL by appending a version query parameter:

```typescript
const ogImageUrl = `${baseUrl}/og${path}.png?v=2&title=${encodeURIComponent(title)}`;
```

**Important:** OG image URLs include query params (title, description), so each unique combination gets its own cached entry. This is the correct behavior — different content = different cache key.

**Cloudflare caveat — a `Cache-Control` header alone does NOT edge-cache a Worker/Pages Function response.** Dynamically generated responses from Workers/Pages Functions bypass Cloudflare's default CDN cache. To actually cache them at the edge you must either explicitly store the response in the Cache API (`caches.default.put()` / `.match()`) or add a Cache Rule that caches the route. For Cloudflare-specific control without affecting browsers, use `CDN-Cache-Control` — it overrides `Cache-Control` for Cloudflare's CDN cache only, leaving the browser-facing `Cache-Control` (and `max-age`) untouched:

```typescript
setResponseHeaders(event, {
  'Content-Type': 'image/png',
  // Browser cache directive
  'Cache-Control': 'public, max-age=31536000, immutable',
  // Cloudflare edge cache directive (overrides the above for CF's CDN only)
  'CDN-Cache-Control': 'public, max-age=31536000, immutable',
});
```

---

### Generate Dynamic OG Images on Cloudflare Workers with @cf-wasm/og

**Impact:** CRITICAL - Enables dynamic OG image generation that actually works on Cloudflare Workers

## Generate Dynamic OG Images on Cloudflare Workers with @cf-wasm/og

The standard `nuxt-og-image` module uses Satori WASM via `WebAssembly.instantiate()`, which is blocked on Cloudflare Workers (see [nuxt-og-image issue #434](https://github.com/nuxt-modules/og-image/issues/434)). Use `@cf-wasm/og/workerd` with a dynamic import instead.

**Incorrect (nuxt-og-image on Cloudflare Workers):**

```typescript
// ❌ WRONG — nuxt-og-image's Satori WASM fails on CF Workers
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-og-image'],
  ogImage: {
    // This will fail with "WebAssembly.instantiate() is not allowed" on CF Workers
  },
});
```

**Correct (custom server route with @cf-wasm/og):**

```typescript
// ✅ CORRECT — server/routes/og/[...path].png.ts

// Satori element helper — plain JS objects, no React
function el(
  type: string,
  style: Record<string, unknown>,
  ...children: unknown[]
) {
  const flat = children.flat().filter((c) => c != null && c !== false);
  const props: Record<string, unknown> = { style };
  if (flat.length === 1 && typeof flat[0] === 'string') {
    props.children = flat[0];
  } else if (flat.length > 0) {
    props.children = flat;
  }
  return { type, props };
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const title = (query.title as string) || 'My App';
  const description = (query.description as string) || 'App description';

  const element = el(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      background:
        'linear-gradient(145deg, #0f0e17 0%, #161229 50%, #1a0f2e 100%)',
      fontFamily: 'sans-serif',
      padding: '60px 64px',
    },
    el('div', { fontSize: '64px', fontWeight: 800, color: '#fafafa' }, title),
    el(
      'div',
      { fontSize: '24px', color: '#a1a1aa', marginTop: '20px' },
      description,
    ),
  );

  try {
    // Dynamic import — @cf-wasm/og/workerd only works on CF Workers, not Node.js dev
    const { ImageResponse } = await import('@cf-wasm/og/workerd');
    const { cache } = await import('@cf-wasm/og/workerd');

    // REQUIRED on Workers/Pages: give @cf-wasm/og the execution context so it
    // can cache the fetched WASM/font assets across invocations. Nitro exposes
    // the CF execution context on the h3 event.
    const ctx = event.context.cloudflare?.context;
    if (ctx) {
      cache.setExecutionContext(ctx);
    }

    const response = await ImageResponse.async(element, {
      width: 1200,
      height: 630,
    });

    const buffer = await response.arrayBuffer();

    setResponseHeaders(event, {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
    });

    return Buffer.from(buffer);
  } catch (err) {
    throw createError({
      statusCode: 500,
      message: `OG generation failed: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
});
```

**Key points:**

- Use `await import('@cf-wasm/og/workerd')` — dynamic import is required for the Workerd runtime
- Use `ImageResponse.async()` (not `new ImageResponse()`) for the async WASM initialization
- Call `cache.setExecutionContext(ctx)` (from `@cf-wasm/og/workerd`) before `ImageResponse.async()` — the package README mandates this on Workers/Pages so it can persist fetched WASM/font assets. Obtain the context from `event.context.cloudflare?.context` in the Nitro/h3 handler.
- Standard dimensions: `1200x630` pixels for OG images
- The `el()` helper creates plain JS objects that Satori understands — see `og-no-react` rule
- This route won't work in local `nuxt dev` (Node.js) — test on CF Workers preview or production
- Add proper error handling with `createError` for debugging failed generations

**Fonts:** Satori needs font data to render any text. `@cf-wasm/og` bundles Noto Sans as the default font, so the examples above work out of the box. To use custom fonts, pass them via the `GoogleFont` or `CustomFont` helpers from `@cf-wasm/og` in the `fonts` option — don't assume arbitrary `fontFamily` values will resolve without providing the font.

**Workers limits:** Image generation is CPU- and memory-intensive. Stay within the Workers CPU-time limit, the 128 MB memory ceiling, and the 3 MB compressed script-size limit (free plan). Avoid loading multiple large font files into a single Worker — each font inflates both memory use and bundle size.

Reference: [@cf-wasm/og](https://github.com/fineshopdesign/cf-wasm)

---

### Serve OG Images with CORP cross-origin

**Impact:** CRITICAL - Prevents every social share card from silently failing when a security-headers layer is added

## Serve OG Images with CORP cross-origin

`Cross-Origin-Resource-Policy: same-origin` on an OG image response makes every social platform's card crawler (Slack, Discord, Twitter/X, LinkedIn, Facebook) unable to load the image — the share card renders without it. The failure is invisible in normal browsing (same-origin pages load the image fine) and typically ships inside a site-wide security-headers hardening pass. The debugger symptom is `og:image Failed to load image (may be corrupt or blocked by CORS)` while the image itself is a perfectly valid 200 PNG.

**Incorrect (global security middleware stamps every route):**

```typescript
// ❌ WRONG — server/middleware/security-headers.ts
// CORP same-origin lands on /og/** too; social crawlers get blocked
export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Content-Security-Policy': CSP_DEFAULT,
    'X-Frame-Options': 'SAMEORIGIN',
    // ...rest of the A+ header set
  });
});
```

**Correct (public cross-origin assets get their own branch):**

```typescript
// ✅ CORRECT — server/utils/security-headers.ts
// OG images + any image third parties embed (static map images, badges)
// must be fetchable cross-origin. Everything else keeps same-origin.
export function isCrossOriginAsset(path: string): boolean {
  return path.startsWith('/og/');
}

export function buildSecurityHeaders(path: string): Record<string, string> {
  if (isCrossOriginAsset(path)) {
    return {
      ...SECURITY_HEADERS,
      'Cross-Origin-Resource-Policy': 'cross-origin',
      // No CSP / X-Frame-Options — framing directives are meaningless on
      // a raw image and only invite the middleware bug below.
    };
  }
  return {
    ...SECURITY_HEADERS,
    'Cross-Origin-Resource-Policy': 'same-origin',
    'X-Frame-Options': 'SAMEORIGIN',
    'Content-Security-Policy': CSP_DEFAULT,
  };
}
```

**Companion trap — CSP nonce substitution must be guarded.** If the middleware substitutes a per-request nonce into the CSP, the asset branch above returns headers WITHOUT a CSP — a non-null assertion turns that into a 500 on every OG image:

```typescript
// ❌ WRONG — 500s every /og request once the asset branch omits CSP
headers['Content-Security-Policy'] = headers[
  'Content-Security-Policy'
]!.replaceAll('{{nonce}}', nonce);

// ✅ CORRECT — substitute only when a CSP is present
const csp = headers['Content-Security-Policy'];
if (csp) {
  headers['Content-Security-Policy'] = csp.replaceAll('{{nonce}}', nonce);
}
```

**Verification (do all three — meta parsing alone misses this bug):**

1. `curl -sSI https://your.app/og/page.png | grep -i cross-origin-resource-policy` → must print `cross-origin`.
2. Run the page through a social-share debugger that actually FETCHES the image (e.g. nuxtseo.com/tools/social-share-debugger) — a meta-tag parser reports `og:image Found` even while the image is CORP-blocked.
3. Regression-check an HTML route still returns your strict CORP (`same-origin`) so the security posture is unchanged.

Pin all three in a unit test on the header builder — the "re-tighten CORP everywhere" cleanup is exactly the regression a future hardening sweep will attempt.

Reference: [MDN Cross-Origin-Resource-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Resource-Policy)

---

### Build Satori Element Trees Without the React Runtime

**Impact:** CRITICAL - Avoids pulling the React runtime into a Vue project for OG generation

## Build Satori Element Trees Without the React Runtime

Satori renders OG images from **React-elements-like objects** — plain objects shaped `{ type, props: { style, children } }`. That element data model IS Satori's API and is unavoidable; the objects are React-element-_shaped_ by design. The thing to avoid in a Vue project is the React **runtime/package** dependency, not React's element shape.

Concretely: `@cf-wasm/og` ships an `html-to-react` utility whose `t()` parser pulls in React. Don't use it in a Vue codebase — it adds React as a real dependency. Instead, construct the same `{ type, props }` objects yourself with a tiny `el()` helper (no React import).

> If you prefer JSX ergonomics without React, Satori also ships an experimental `satori/jsx` JSX runtime — an officially-sanctioned alternative that needs no React package.

**Incorrect (importing React utilities):**

```typescript
// ❌ WRONG — html-to-react's t() pulls the React runtime into a Vue project
import { t } from '@cf-wasm/og/html-to-react';

export default defineEventHandler(async (event) => {
  // t() imports React — avoid this dependency in a Vue codebase
  const element = t('<div style="display:flex">Hello</div>');
  // ...
});
```

**Correct (plain JS objects via el() helper):**

```typescript
// ✅ CORRECT — Plain JS objects, zero React dependency

// Satori element helper — creates { type, props } objects (React-element-shaped, no React)
// Satori defaults `display` to flex; just don't override multi-child divs to a
// non-flex value. It also chokes on children:[]
function el(
  type: string,
  style: Record<string, unknown>,
  ...children: unknown[]
) {
  const flat = children.flat().filter((c) => c != null && c !== false);
  const props: Record<string, unknown> = { style };
  if (flat.length === 1 && typeof flat[0] === 'string') {
    props.children = flat[0];
  } else if (flat.length > 0) {
    props.children = flat;
  }
  return { type, props };
}

// Usage — composable like JSX but pure JS
const element = el(
  'div',
  { display: 'flex', flexDirection: 'column', width: '100%', height: '100%' },
  el('div', { fontSize: '64px', fontWeight: 800, color: '#fafafa' }, 'Title'),
  el('div', { fontSize: '24px', color: '#a1a1aa' }, 'Description'),
);
// Output: { type: 'div', props: { style: {...}, children: [...] } }
```

**el() helper details:**

1. **`children.flat()`** — Allows passing arrays and nested elements
2. **`.filter(c => c != null && c !== false)`** — Enables conditional rendering like `...(condition ? [el(...)] : [])`
3. **Single string child** — `props.children = 'text'` (not wrapped in array)
4. **Multiple children** — `props.children = [child1, child2, ...]`
5. **No children** — `props` has no `children` key (Satori chokes on `children: []`)

**Conditional rendering pattern:**

```typescript
el(
  'div',
  { display: 'flex', flexDirection: 'column' },
  // Always shown
  el('div', { fontSize: '64px' }, title),
  // Conditionally shown
  ...(description
    ? [el('div', { fontSize: '24px', color: '#a1a1aa' }, description)]
    : []),
);
```

**RULE: In a Vue project, don't add the React runtime for OG generation.** The `{ type, props }` element objects Satori consumes are React-element-shaped — that's Satori's API, not a React dependency. Build them with `el()` (or `satori/jsx`), and avoid `html-to-react`'s `t()`, which imports React.

---

### Add JSON-LD Structured Data for Google Rich Results

**Impact:** MEDIUM - Enables Google Rich Results and improves search visibility

## Add JSON-LD Structured Data for Google Rich Results

JSON-LD structured data helps search engines understand your site's content. Add a `WebApplication` or `WebSite` schema to `app.vue` for site-wide structured data.

**Incorrect (no structured data):**

```vue
<!-- ❌ WRONG — app.vue with no structured data -->
<script setup lang="ts">
  // No JSON-LD — search engines have less context about the site
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

**Correct (JSON-LD in app.vue):**

```vue
<!-- ✅ CORRECT — app.vue with WebApplication structured data -->
<script setup lang="ts">
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'My App',
          url: 'https://example.com',
          description: 'Description of what the app does.',
          applicationCategory: 'DesignApplication',
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          author: {
            '@type': 'Organization',
            name: 'My Company',
            url: 'https://example.com',
          },
        }),
      },
    ],
  });
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

**For a documentation or content site, use `WebSite` schema:**

```typescript
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'My Docs',
        url: 'https://docs.example.com',
        description: 'Documentation for My App.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate:
              'https://docs.example.com/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      }),
    },
  ],
});
```

**Common schema types:**

| Type                 | Use Case                                  |
| -------------------- | ----------------------------------------- |
| `WebApplication`     | SaaS apps, tools, platforms               |
| `WebSite`            | Documentation sites, blogs, content sites |
| `Organization`       | Company/team pages                        |
| `SoftwareSourceCode` | Open source project landing pages         |
| `BreadcrumbList`     | Navigation breadcrumbs (per-page)         |

**`applicationCategory` is an example.** `'DesignApplication'` above is just one schema.org value — pick the category that actually matches your app (e.g. `'BusinessApplication'`, `'DeveloperApplication'`, `'GameApplication'`, `'ProductivityApplication'`).

**XSS caveat — only `innerHTML` trusted/static JSON.** `JSON.stringify` does NOT escape `<` or `>`, so any user-derived value containing `</script>` can break out of the script tag and inject markup. Only use the `innerHTML` pattern with static/trusted data. For any user-supplied value, escape `<`/`>` (e.g. replace `<` → `\u003c`, `>` → `\u003e`) before serializing, or route the payload through `useHeadSafe` so unhead sanitizes it.

**Validation:** Use [Google's Rich Results Test](https://search.google.com/test/rich-results) to verify structured data.

Reference: [Schema.org](https://schema.org/) | [Google Structured Data](https://developers.google.com/search/docs/appearance/structured-data)
