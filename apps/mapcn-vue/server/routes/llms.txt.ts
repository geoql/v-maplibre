/**
 * AI agent discovery per nuxt-geo-best-practices rule ai-llms-txt.
 * Spec: https://llmstxt.org
 *
 * Short navigational index — a high-level map of the site for LLMs
 * that perform best with minimal, structured context.
 *
 * Content is embedded as a static string so this route runs cleanly on
 * Cloudflare Workers (no node:fs at request time).
 */
export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/plain; charset=utf-8');

  return `# mapcn-vue

> Beautiful, theme-aware map components for Vue 3 powered by MapLibre GL and deck.gl. shadcn-vue compatible — copy components directly into your project, no black-box package.

## Documentation

- [Introduction](https://mapcn-vue.geoql.in/docs/introduction): Project overview, why mapcn-vue exists
- [Installation](https://mapcn-vue.geoql.in/docs/installation): Per-component install via shadcn-vue CLI
- [Components](https://mapcn-vue.geoql.in/docs/components): Catalog of every component in the registry

## Examples

- [Examples Index](https://mapcn-vue.geoql.in/examples): 94 live, interactive examples covering MapLibre and deck.gl layers

## FAQ

- [Frequently Asked Questions](https://mapcn-vue.geoql.in/faq): Common questions about peer deps, Vue 2 support, deck.gl vs MapLibre layers, install workflow, licensing

## Library

- [@geoql/v-maplibre on npm](https://www.npmjs.com/package/@geoql/v-maplibre): Vue 3 wrappers (42 components, 9 categories)
- [@geoql/v-maplibre on JSR](https://jsr.io/@geoql/v-maplibre): Deno-compatible distribution
- [Source on GitHub](https://github.com/geoql/v-maplibre): Monorepo with apps + packages

## Optional

- [Sitemap](https://mapcn-vue.geoql.in/sitemap.xml): Full URL inventory for AI crawlers
`;
});
