/**
 * AI agent discovery per nuxt-geo-best-practices rule ai-llms-txt.
 * Spec: https://llmstxt.org
 *
 * Full-content version — embeds all doc + FAQ markdown inline so LLMs
 * that prefer single-file ingestion get everything in one response.
 *
 * Content is loaded via Nitro's `assets:docs` server-storage namespace
 * (configured in nuxt.config.ts → nitro.serverAssets). Works in dev,
 * Rollup production builds, and Cloudflare Workers — `useStorage` is
 * Nitro's universal asset reader.
 */

function stripFrontmatter(md: string): string {
  if (!md.startsWith('---')) return md;
  const closing = md.indexOf('---', 3);
  if (closing === -1) return md;
  return md.slice(closing + 3).trim();
}

function section(title: string, content: string): string {
  return `## ${title}\n\n${stripFrontmatter(content)}`;
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'content-type', 'text/plain; charset=utf-8');

  const storage = useStorage('assets:docs');
  const [introMd, installMd, componentsMd, faqMd] = await Promise.all([
    storage.getItem<string>('docs/1.introduction.md'),
    storage.getItem<string>('docs/2.installation.md'),
    storage.getItem<string>('docs/3.components.md'),
    storage.getItem<string>('faq.md'),
  ]);

  return `# mapcn-vue

> Beautiful, theme-aware map components for Vue 3 powered by MapLibre GL and deck.gl. shadcn-vue compatible — copy components directly into your project, no black-box package.

${section('Introduction', introMd ?? '')}

${section('Installation', installMd ?? '')}

${section('Components', componentsMd ?? '')}

${section('FAQ', faqMd ?? '')}

---

Source: https://github.com/geoql/v-maplibre
`;
});
