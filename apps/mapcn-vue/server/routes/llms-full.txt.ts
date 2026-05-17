/**
 * AI agent discovery per nuxt-geo-best-practices rule ai-llms-txt.
 * Spec: https://llmstxt.org
 *
 * Full-content version — embeds all doc + FAQ markdown inline so LLMs
 * that prefer single-file ingestion get everything in one response.
 *
 * Content is loaded via Vite ?raw imports at build time so this route runs
 * cleanly on Cloudflare Workers (no node:fs at request time).
 */
import introMd from '~~/content/docs/1.introduction.md?raw';
import installMd from '~~/content/docs/2.installation.md?raw';
import componentsMd from '~~/content/docs/3.components.md?raw';
import faqMd from '~~/content/faq.md?raw';

/**
 * Strip YAML frontmatter (everything between leading `---` markers).
 * Handles files with or without a trailing `---`.
 */
function stripFrontmatter(md: string): string {
  if (!md.startsWith('---')) return md;
  const end = md.indexOf('---', 3);
  if (end === -1) return md;
  return md.slice(end + 3).trim();
}

function section(title: string, content: string): string {
  return `## ${title}\n\n${stripFrontmatter(content)}`;
}

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/plain; charset=utf-8');

  return `# mapcn-vue

> Beautiful, theme-aware map components for Vue 3 powered by MapLibre GL and deck.gl. shadcn-vue compatible — copy components directly into your project, no black-box package.

${section('Introduction', introMd)}

${section('Installation', installMd)}

${section('Components', componentsMd)}

${section('FAQ', faqMd)}

---

Source: https://github.com/geoql/v-maplibre
`;
});
