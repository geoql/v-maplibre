---
name: nuxt-geo-best-practices
description: Nuxt GEO (Generative Engine Optimization) guidelines for getting cited by ChatGPT, Perplexity, Claude, Google AI Overviews, and Gemini. Covers AI crawler access (llms.txt, GPTBot/ClaudeBot/PerplexityBot allowlisting), content extractability for RAG retrieval, entity clarity via JSON-LD, and the evidence-backed +40% visibility levers (statistics, citations, quotations) from the GEO arxiv paper. Triggers on tasks involving GEO, AEO, AI search, LLM visibility, llms.txt, AI crawlers, ChatGPT citations, Perplexity, AI Overviews, generative engines, or AI mentions.
license: MIT
metadata:
  author: vinayakkulkarni
  version: '1.0.0'
---

# Nuxt GEO Best Practices

Comprehensive Generative Engine Optimization guide for Nuxt 4 applications. Designed to maximize your brand's citation rate inside AI-generated answers from ChatGPT, Google AI Overviews / AI Mode, Perplexity, Claude, and Gemini. Contains 16 rules across 5 categories, prioritized by evidence-backed impact.

## When to Apply

Reference these guidelines when:

- Setting up `llms.txt` and `llms-full.txt` for AI agent discovery
- Allowlisting (or blocking) AI crawlers in `robots.txt` (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.)
- Structuring page content for retrieval-augmented generation (RAG) extractability
- Adding entity clarity via Organization, Person, FAQPage, or HowTo JSON-LD schemas
- Applying the GEO arxiv paper's evidence-backed levers: **statistics, citations, quotations** (+30-40% visibility lift)
- Building a `usePageGeo` composable for per-page AI-friendly meta
- Ensuring AI crawlers see SSR-rendered HTML (not a JavaScript shell)
- Generating an AI-friendly XML sitemap and `sitemap_index.xml`

## Recommended Nuxt Modules

This skill is built for **Nuxt 4** apps. Several rules below show both a "from-scratch" Nitro-route implementation and the equivalent module-based shortcut. Strongly consider installing these — they remove a lot of boilerplate and stay in sync with Nuxt's official patterns:

- **[`@nuxtjs/seo`](https://github.com/harlan-zw/nuxt-seo)** by Harlan Wilton — meta-module that bundles `@nuxtjs/sitemap`, `@nuxtjs/robots`, `nuxt-schema-org`, `nuxt-og-image`, `nuxt-link-checker`, and `nuxt-seo-utils`. Covers most GEO infrastructure (robots.txt, sitemap, JSON-LD, meta) with one install.
- **[`@nuxtjs/sitemap`](https://nuxtseo.com/docs/sitemap)** — auto-generated sitemap with per-page `lastmod`, hreflang, and exclusions.
- **[`@nuxtjs/robots`](https://nuxtseo.com/docs/robots)** — programmatic `robots.txt` with per-route control and AI bot allow/disallow rules.
- **[`nuxt-schema-org`](https://nuxtseo.com/docs/schema-org)** — type-safe JSON-LD via `defineOrganization`, `defineWebSite`, `defineFaqPage`, `defineHowTo`, `definePerson`, `defineArticle`.
- **[`nuxt-og-image`](https://nuxtseo.com/docs/og-image)** — for OG/share images (covered in the sibling `nuxt-seo-best-practices` skill — note CF Workers caveat there).

### Official Nuxt SEO Meta docs

Nuxt 4 ships first-class SEO/meta primitives. Read these before reinventing anything:

- **[Nuxt 4 SEO & Meta](https://nuxt.com/docs/4.x/getting-started/seo-meta)** — `useSeoMeta`, `useHead`, `useServerSeoMeta`, `definePageMeta`, the `<Head>` / `<Title>` / `<Meta>` components, and route-level `head` config.
- **[`useSeoMeta`](https://nuxt.com/docs/4.x/api/composables/use-seo-meta)** — typed wrapper around `useHead({ meta: [...] })` with full IntelliSense for OG/Twitter tags.
- **[`useHead`](https://nuxt.com/docs/4.x/api/composables/use-head)** — generic head manager (used here for JSON-LD `script` injection).

The `usePageGeo` composable in `page-use-page-geo.md` is a thin wrapper over these primitives; it is **not** a replacement for them.

> **Nuxt 4.5 note:** head management now runs on `unhead` v3 — stricter `useHead` typing and no promise input. The `useHead` JSON-LD injection patterns in this skill use plain synchronous values and are v3-compatible. Also, 4.5's experimental SSR streaming is bot-aware: crawlers automatically receive fully-buffered HTML, so enabling it does not hurt GEO (see `ai-ssr-for-crawlers`).

## Evidence Base

These rules synthesize:

1. **GEO: Generative Engine Optimization** (Aggarwal et al., KDD 2024, arXiv:2311.09735) — the foundational paper that benchmarked 9 optimization methods across 10K queries. Key findings adopted here:
   - Statistics, Citations, and Quotations boost visibility **by up to 40%**
   - Authoritative tone and Fluency optimization show moderate gains
   - **Keyword stuffing (classic SEO) FAILS on generative engines** — do not bring SEO keyword density habits into GEO
2. **Industry GEO playbooks** (Search Engine Land, Semrush AI Visibility Index, Backlinko) — entity clarity, multi-platform presence, sentiment, and measurement frameworks observed across 2,500+ tracked prompts on Google AI Mode and ChatGPT.
3. **Production AEO audit data (2026)** — a 41-page Nuxt site audited by an automated AEO scoring engine, plus multi-sweep visibility tracking across four answer engines. Source of the factor-weight table below, the three consistently-failing factors, and the statistical guardrails in `measure-aeo-visibility`. Key observation: the site had _complete_ GEO infrastructure (`llms.txt`, valid schema, sitemap, 90% Google index coverage) and was still cited in **0 of 10** category queries — infrastructure is necessary, not sufficient.

## Rule Categories by Priority

| Priority | Category                                 | Impact   | Prefix     |
| -------- | ---------------------------------------- | -------- | ---------- |
| 1        | Content Extractability (the +40% levers) | CRITICAL | `content-` |
| 2        | AI Crawler & Discovery                   | CRITICAL | `ai-`      |
| 3        | Entity Clarity                           | HIGH     | `entity-`  |
| 4        | Page-Level GEO                           | HIGH     | `page-`    |
| 5        | Measurement & Verification               | CRITICAL | `measure-` |

### Observed audit weights (production AEO audit tool, 2026)

Where the arxiv paper gives you _which levers move visibility_, an automated AEO audit gives you _how a scoring engine actually weights a page_. These weights come from a production audit of a 41-page Nuxt site and are useful for **prioritising remediation** when everything is failing at once:

| Factor                        | Weight | Typical score | Notes                                                 |
| ----------------------------- | -----: | ------------: | ----------------------------------------------------- |
| Structured Data (JSON-LD)     |    12% |       Partial | `entity-organization-schema`                          |
| Content Depth                 |    10% |          Pass | `content-statistics`, `content-self-contained-chunks` |
| Citations & Authority Signals |     8% |       Partial | `content-citations`                                   |
| **E-E-A-T Signals**           | **8%** | **Fail (26)** | `entity-author-schema` — worst common failure         |
| **FAQ Content**               | **8%** | **Fail (31)** | `entity-faq-howto-schema`                             |
| Schema Completeness           |     8% |          Pass | `entity-faq-howto-schema`                             |
| Content Freshness             |     7% |       Partial | `page-canonical-and-fresh`                            |
| Entity Consistency            |     7% |       Partial | title / `og:title` / schema `name` must align         |
| Content Extractability        |     6% |       Partial | `content-self-contained-chunks`                       |
| **Definition Blocks**         | **6%** | **Fail (12)** | `content-definition-blocks` — _lowest scoring_        |
| Named Entities                |     6% |          Pass | `entity-organization-schema`                          |
| Snippet Eligibility           |     6% |          Pass | —                                                     |
| AI Access Files (llms.txt)    |     5% |          Pass | `ai-llms-txt`                                         |
| Schema Validity               |     5% |          Pass | —                                                     |
| Technical SEO                 |     5% |          Pass | sibling skill `nuxt-seo-best-practices`               |
| AI Crawler Access             |     4% |       Partial | `ai-robots-allowlist`                                 |

**The three consistently-failing factors — E-E-A-T (8%), FAQ Content (8%), Definition Blocks (6%) — total 22% of the score and are among the cheapest to fix.** Sites routinely ship perfect `llms.txt`, valid schema, and 90% Google index coverage while scoring 0 on all three. Start there.

> **Classic SEO health does not imply AEO visibility.** The audited site ranked **#3.9 for its own brand name** with **90% index coverage**, and was cited in **zero of ten** category queries. Brand search and category discovery are separate problems — see `measure-aeo-visibility`.

## Quick Reference

### 1. Content Extractability (CRITICAL)

These are the evidence-backed +30-40% visibility levers from the GEO arxiv paper. If you only do three things, do these three.

- `content-statistics` — Add quantitative statistics (the single highest-lift change measured)
- `content-citations` — Add inline citations to credible sources (Sources component pattern)
- `content-quotations` — Add quotations from authoritative figures
- `content-self-contained-chunks` — Write paragraphs that retain meaning when extracted (RAG retrieval)
- `content-definition-blocks` — "What is X" / "How to X" shapes; lowest-scoring factor in real audits (12/100)
- `content-no-keyword-stuffing` — DO NOT bring SEO keyword stuffing into GEO; it actively hurts visibility

### 2. AI Crawler & Discovery (CRITICAL)

If AI crawlers can't access your content, none of the other rules matter.

- `ai-llms-txt` — Generate `llms.txt` and `llms-full.txt` via Nitro server routes
- `ai-robots-allowlist` — Explicitly allow GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.
- `ai-ssr-for-crawlers` — Ensure AI crawlers receive rendered HTML, not a JS shell
- `ai-sitemap` — Generate AI-friendly XML sitemap with `lastmod` for fresh-content signals

### 3. Entity Clarity (HIGH)

Help AI systems disambiguate WHO you are, WHAT category you belong to, and WHAT you're authoritative for.

- `entity-organization-schema` — Site-wide Organization JSON-LD with `sameAs` cross-references
- `entity-faq-howto-schema` — FAQPage and HowTo schemas for the question-shaped queries LLMs love
- `entity-author-schema` — Person schema with credentials and `sameAs` for E-E-A-T

### 4. Page-Level GEO (HIGH)

- `page-use-page-geo` — Reusable `usePageGeo` composable for per-page GEO meta
- `page-canonical-and-fresh` — Canonical URL + `dateModified` for content freshness signals

### 5. Measurement & Verification (CRITICAL)

Everything above is unfalsifiable without this. Generative engines are stochastic — the same query can be cited on one sweep and not the next with zero content change.

- `measure-aeo-visibility` — Repeated sampling, share-of-voice, Wilson intervals, the ≥5-sweeps/month floor, and mention-vs-citation

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/content-statistics.md
rules/ai-llms-txt.md
rules/_sections.md
```

Each rule file contains:

- Brief explanation of why it matters (with arxiv evidence where applicable)
- Incorrect code example with explanation
- Correct Nuxt-specific code example
- Additional context, measurement notes, and references

## Full Compiled Document

For the complete guide with all rules expanded: `AGENTS.md`
