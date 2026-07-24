import type { H3Event } from 'h3';

const ORIGIN = 'https://mapcn-vue.geoql.in';

export default defineEventHandler((event: H3Event) => {
  setResponseHeader(
    event,
    'content-type',
    'application/linkset+json; charset=utf-8',
  );
  setResponseHeader(event, 'cache-control', 'public, max-age=3600');
  setResponseHeader(event, 'x-content-type-options', 'nosniff');
  return {
    linkset: [
      {
        anchor: `${ORIGIN}/r/registry.json`,
        'service-doc': [
          { href: `${ORIGIN}/docs/components`, type: 'text/html' },
        ],
        describedby: [{ href: `${ORIGIN}/llms.txt`, type: 'text/plain' }],
      },
      {
        anchor: `${ORIGIN}/api/promap`,
        'service-doc': [
          { href: `${ORIGIN}/examples/promap`, type: 'text/html' },
        ],
      },
      {
        anchor: `${ORIGIN}/mcp`,
        'service-doc': [
          { href: `${ORIGIN}/docs/components`, type: 'text/html' },
        ],
        describedby: [
          {
            href: `${ORIGIN}/.well-known/mcp/server-card.json`,
            type: 'application/json',
          },
        ],
      },
      {
        anchor: `${ORIGIN}/a2a`,
        'service-doc': [
          { href: `${ORIGIN}/docs/components`, type: 'text/html' },
        ],
        describedby: [
          {
            href: `${ORIGIN}/.well-known/agent-card.json`,
            type: 'application/json',
          },
        ],
      },
      {
        anchor: ORIGIN,
        'service-meta': [
          { href: `${ORIGIN}/llms.txt`, type: 'text/plain' },
          { href: `${ORIGIN}/llms-full.txt`, type: 'text/plain' },
          { href: `${ORIGIN}/sitemap.xml`, type: 'application/xml' },
        ],
      },
    ],
  };
});
