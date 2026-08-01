---
title: Add Definition Blocks — "What is X" and "How to X" Content Shapes
impact: HIGH
impactDescription: Lowest-scoring factor in production AEO audits (12/100 average, 95% of pages failing) despite being trivially cheap to fix
tags: definitions, howto, content, extractability, question-shaped, audit
---

## Add Definition Blocks — "What is X" and "How to X" Content Shapes

A large share of AI queries are **definitional** or **procedural**: _"what is a vector database"_, _"how do I deploy Nuxt to Cloudflare"_, _"what does hydration mean"_. Generative engines answer these by lifting a compact, self-contained definition or an ordered step list.

In production AEO audits this is consistently the **worst-scoring factor** — one 41-page Nuxt site scored **12/100 with 39 of 41 pages failing outright**, despite already having valid schema, `llms.txt`, and 90% Google index coverage. It is also among the cheapest to fix, which makes it the highest-leverage gap on most sites.

This rule is about **content shape**, not markup. `entity-faq-howto-schema` covers the JSON-LD; a HowTo schema wrapped around prose that never states a definition still fails.

**Incorrect (concept used but never defined):**

```vue
<!-- ❌ WRONG — assumes the reader already knows what the thing IS.
     An engine answering "what is edge rendering" finds nothing liftable. -->
<template>
  <article>
    <h1>Edge Rendering in Nuxt 4</h1>
    <p>
      We moved our rendering to the edge last quarter and saw great results. The
      team found it much easier to work with than our previous setup, and our
      users are happier with the performance.
    </p>
  </article>
</template>
```

**Correct (explicit definition + ordered procedure):**

```vue
<!-- ✅ CORRECT — definition-first, then a numbered procedure. Both survive
     RAG chunk extraction and map onto question-shaped prompts. -->
<template>
  <article>
    <h1>Edge Rendering in Nuxt 4</h1>

    <section>
      <h2>What is edge rendering?</h2>
      <p>
        <strong>Edge rendering</strong> is server-side rendering executed in a
        CDN point of presence near the user, rather than in a single origin
        region. In Nuxt 4 this means the Nitro server bundle runs as a
        Cloudflare Worker or Vercel Edge Function, typically returning HTML in
        <strong>~50ms</strong> versus <strong>~250ms</strong> from a
        single-region Node origin.
      </p>
    </section>

    <section>
      <h2>How to deploy Nuxt 4 to the edge</h2>
      <ol>
        <li>
          <strong>Set the Nitro preset.</strong> In <code>nuxt.config.ts</code>,
          set <code>nitro.preset</code> to <code>cloudflare-pages</code> and pin
          a <code>compatibilityDate</code>.
        </li>
        <li>
          <strong>Build the bundle.</strong> Run <code>nuxi build</code>. Static
          assets land in <code>.output/public</code>; Worker code in
          <code>.output/server</code>.
        </li>
        <li>
          <strong>Deploy.</strong> Run
          <code>wrangler pages deploy .output/public</code>. First deploy takes
          ~30s, subsequent ones ~10s.
        </li>
      </ol>
    </section>
  </article>
</template>
```

### The definition-block formula

A liftable definition is one sentence, and it follows a rigid shape:

> **`<Term>`** is a **`<category>`** that **`<distinguishing property>`**.

| Weak                                      | Liftable                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| "Hydration is important for performance." | "**Hydration** is the process where Vue attaches event listeners to server-rendered HTML." |
| "D1 is great for edge apps."              | "**Cloudflare D1** is a SQLite-based database that runs at the edge with sub-10ms reads."  |
| "Our API is fast."                        | "**The Maps API** is a REST geocoding service returning results in **<40ms** at p95."      |

Put it in the **first sentence** after the heading. Engines heavily weight lead position within a chunk.

### Use `<dl>` for glossaries — it is machine-parseable

For pages defining several terms, the description-list element gives the chunker explicit term↔definition boundaries that `<p>` soup does not:

```vue
<template>
  <dl>
    <dt>Hydration</dt>
    <dd>
      The process where Vue attaches event listeners and reactive state to
      server-rendered HTML, making a static page interactive.
    </dd>

    <dt>Islands</dt>
    <dd>
      A rendering pattern where only selected components hydrate on the client
      while the rest stay static HTML, reducing JavaScript payload.
    </dd>
  </dl>
</template>
```

Pair a glossary page with `DefinedTermSet` JSON-LD:

```ts
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        name: 'Nuxt Rendering Glossary',
        hasDefinedTerm: [
          {
            '@type': 'DefinedTerm',
            name: 'Hydration',
            description:
              'The process where Vue attaches event listeners and reactive state to server-rendered HTML.',
          },
        ],
      }),
    },
  ],
});
```

### Question-shaped headings beat clever ones

Engines match the user's prompt against your heading text. Mirror the prompt literally:

| Clever heading            | Question-shaped heading              |
| ------------------------- | ------------------------------------ |
| `## The Magic of Islands` | `## What are Nuxt Islands?`          |
| `## Getting Started`      | `## How to install Nuxt 4`           |
| `## Under the Hood`       | `## How does Nuxt hydration work?`   |
| `## Pricing`              | `## How much does Nuxt Studio cost?` |

This is not keyword stuffing (see `content-no-keyword-stuffing`) — you write the question **once**, in the heading, and answer it immediately. Stuffing is repeating the phrase throughout the body.

### Procedures need ordered, self-contained steps

Each `<li>` must survive extraction on its own — name the file, the command, and the expected result. "Then deploy it" is useless once chunked away from step 2.

| Weak step             | Liftable step                                                          |
| --------------------- | ---------------------------------------------------------------------- |
| "Configure the file." | "In `nuxt.config.ts`, set `nitro.preset` to `cloudflare-pages`."       |
| "Then deploy it."     | "Run `wrangler pages deploy .output/public`. First deploy takes ~30s." |

Wrap real procedures in `HowTo` JSON-LD as well — see `entity-faq-howto-schema`.

### Audit your own pages

```bash
# 1. Do any headings ask a question? (definitional/procedural coverage)
curl -s https://example.com/docs/rendering | \
  pup 'h2 text{}' | grep -ciE '^(what|how|why|when|where|is|does|can)'
# 0 = you have no question-shaped headings on this page

# 2. Does a definition-shaped sentence exist?
curl -s https://example.com/docs/rendering | \
  pup 'article text{}' | grep -oE '\b[A-Z][A-Za-z0-9 ]{2,30} is (a|an|the) [a-z]' | head
# empty = nothing an engine can lift as a definition
```

Target: every significant concept page carries **at least one** `What is X?` section, and every tutorial carries **at least one** ordered `How to X` list.

Reference: [Schema.org `DefinedTerm`](https://schema.org/DefinedTerm) · [Schema.org `HowTo`](https://schema.org/HowTo) · [MDN `<dl>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl) · sibling rules `entity-faq-howto-schema`, `content-self-contained-chunks`
