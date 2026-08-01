# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section ID (in parentheses) is the filename prefix used to group rules.

---

## 1. Content Extractability (content)

**Impact:** CRITICAL
**Description:** The evidence-backed +30-40% visibility levers from the GEO arxiv paper (Aggarwal et al., KDD 2024). Generative engines synthesize answers from extracted passages. Adding statistics, citations, and quotations dramatically increases the probability that your content gets selected and surfaced in AI-generated answers. Equally important: keyword stuffing — a classic SEO tactic — was shown to FAIL on generative engines. Do not bring SEO keyword density habits into GEO.

## 2. AI Crawler & Discovery (ai)

**Impact:** CRITICAL
**Description:** If AI crawlers can't reach, render, or parse your content, no other GEO work matters. This category covers `llms.txt` and `llms-full.txt` generation via Nitro server routes, explicit allowlisting of GPTBot / ClaudeBot / PerplexityBot / Google-Extended in `robots.txt`, ensuring server-side rendered HTML reaches crawlers (not a JS shell), and AI-friendly XML sitemaps with freshness signals.

## 3. Entity Clarity (entity)

**Impact:** HIGH
**Description:** Help AI systems disambiguate WHO you are, WHAT category you belong to, and WHAT you're authoritative for. JSON-LD schemas (Organization, Person, FAQPage, HowTo) reinforce entity recognition across the web of structured data that LLMs train on and retrieve from. Cross-reference your brand consistently across `sameAs` links so AI systems can corroborate your identity from multiple sources.

## 4. Page-Level GEO (page)

**Impact:** HIGH
**Description:** Per-page GEO meta should be applied through a single composable (`usePageGeo`) the same way `usePageSeo` is used in the Nuxt SEO skill. Canonical URL, freshness signals (`dateModified`), and content-type hints (`Article`, `FAQPage`, `HowTo`) all make individual pages more GEO-friendly.

## 5. Measurement & Verification (measure)

**Impact:** CRITICAL
**Description:** Every other category tells you what to build; this one tells you whether it worked. Generative engines are stochastic — the same query can be cited on one sweep and not the next with zero content change — so a single before/after comparison measures sampling noise, not your work. This category covers repeated sampling, share-of-voice over absolute citation rate, Wilson confidence intervals with honest `within-noise` verdicts, comparable query baskets, model-continuity gating, and the minimum sweep cadence below which no directional claim is defensible. It also covers the distinction between a _mention_ (brand named in the answer) and a _citation_ (your URL used as a source), which move independently and are routinely conflated.
