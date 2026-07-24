import type { H3Event } from 'h3';

const ORIGIN = 'https://mapcn-vue.geoql.in';

const LINK_HEADER = [
  `<${ORIGIN}/llms.txt>; rel="describedby"; type="text/plain"`,
  `<${ORIGIN}/sitemap.xml>; rel="sitemap"; type="application/xml"`,
  `<${ORIGIN}/.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"`,
].join(', ');

const SKIP_PREFIXES = [
  '/api/',
  '/r/',
  '/_nuxt',
  '/__og-image__',
  '/__nuxt_content',
];

function isProseRoute(path: string): boolean {
  if (path === '/' || path === '/faq' || path === '/examples') return true;
  if (path === '/docs' || path.startsWith('/docs/')) return true;
  return false;
}

export default defineEventHandler(async (event: H3Event) => {
  if (event.method !== 'GET') return;

  const path = getRequestURL(event).pathname;
  if (SKIP_PREFIXES.some((prefix) => path.startsWith(prefix))) return;
  if (path === '/mcp' || path === '/a2a' || path.startsWith('/.well-known/'))
    return;

  appendResponseHeader(event, 'link', LINK_HEADER);

  if (!isProseRoute(path)) return;

  // Both representations (HTML and markdown) of a prose route must carry
  // Vary: Accept — the Workers cache stores variants per the response's Vary
  // header, so an HTML entry cached without it would be served to
  // Accept: text/markdown agents (and vice versa).
  setResponseHeader(event, 'vary', 'Accept');

  const accept = getHeader(event, 'accept') ?? '';
  if (!accept.includes('text/markdown')) return;

  // Re-fetch our own HTML in-process. A RELATIVE path keeps the $fetch inside
  // the worker; an absolute self-URL returns empty on the deployed worker's
  // same-zone loopback.
  const html = await event
    .$fetch<string>(path, {
      headers: { accept: 'text/html' },
      responseType: 'text',
    })
    .catch(() => null);
  if (!html) return;

  const markdown = htmlToMarkdown(html);
  if (!markdown) return;

  setResponseHeader(event, 'content-type', 'text/markdown; charset=utf-8');
  return markdown;
});
