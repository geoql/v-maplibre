/**
 * The agent-facing documents Docus served keep working: same status and
 * content type, the discovery Link header on /, the MCP tools, and an OG
 * image on every page. Runs against a served build (DOCS_BASE_URL).
 */
import { describe, expect, it } from 'vite-plus/test';
import oracle from './oracle.json' with { type: 'json' };

const base = process.env.DOCS_BASE_URL ?? 'http://localhost:8799';
const url = (path: string): string => new URL(path, base).href;

async function mcp(method: string, params: object = {}): Promise<unknown> {
  const res = await fetch(url('/mcp'), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const text = await res.text();
  const json = text.startsWith('{')
    ? text
    : (text.split('\n').find((line) => line.startsWith('data:')) ?? '').slice(5);
  return (JSON.parse(json) as { result: unknown }).result;
}

describe('agent surfaces', () => {
  it.each(oracle.agentSurfaces)('$path answers $status $contentType', async (surface) => {
    const res = await fetch(url(surface.path));
    expect(res.status).toBe(surface.status);
    expect(res.headers.get('content-type') ?? '').toContain(surface.contentType);
  });

  it('advertises the discovery documents in the Link header on /', async () => {
    const link = (await fetch(url('/'))).headers.get('link') ?? '';
    for (const rel of ['api-catalog', 'service-desc', 'describedby']) {
      expect(link).toContain(`rel="${rel}"`);
    }
  });

  it('exposes exactly the MCP tools Docus had', async () => {
    const result = (await mcp('tools/list')) as { tools: { name: string }[] };
    expect(result.tools.map((t) => t.name).sort()).toEqual([...oracle.mcpTools].sort());
  });

  it('get-page returns the page markdown', async () => {
    const result = (await mcp('tools/call', {
      name: 'get-page',
      arguments: { path: '/guide/getting-started' },
    })) as { content: { text: string }[] };
    expect(result.content.map((c) => c.text).join('')).toContain(
      'pnpm add @geoql/v-maplibre',
    );
  });

  it.each(oracle.urls)('%s has an og:image that renders', async (path) => {
    const html = await (await fetch(url(path))).text();
    const og = /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/.exec(html)?.[1];
    expect(og, 'og:image meta').toBeTruthy();
    const image = await fetch(new URL(new URL(og ?? '').pathname, base));
    expect(image.status).toBe(200);
    expect(image.headers.get('content-type')).toContain('image/png');
  });
});
