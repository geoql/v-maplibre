import { describe, expect, it, vi } from 'vite-plus/test';
import {
  proxyDemoAsset,
  resolveDemoAssetPath,
  rewriteTileJson,
} from '../../server/utils/demo-assets';
import type { DemoAssetRequest } from '../../server/types/demo-assets';

const API_BASE = 'https://upstream.test';
const API_KEY = 'test_sk_SECRETSECRET';
const ORIGIN = 'https://site.test';
const config = { apiBase: API_BASE, apiKey: API_KEY };

function request(
  path: string,
  init: Partial<Omit<DemoAssetRequest, 'path'>> = {},
): DemoAssetRequest {
  return {
    method: 'GET',
    headers: new Headers(),
    origin: ORIGIN,
    ...init,
    path,
  };
}

function upstreamTileJson(): Response {
  return Response.json(
    {
      tilejson: '3.0.0',
      encoding: 'mapbox',
      tileSize: 512,
      minzoom: 6,
      maxzoom: 12,
      tiles: [
        `${API_BASE}/v1/tiles/garhwal-himalaya/{z}/{x}/{y}.png?api_key=${API_KEY}`,
      ],
    },
    { headers: { 'cache-control': 'public, max-age=86400', etag: '"abc"' } },
  );
}

describe('resolveDemoAssetPath allowlist', () => {
  it.each([
    ['tiles/garhwal-himalaya.json', 'tilejson'],
    ['tiles/garhwal-himalaya/10/716/422.png', 'tile'],
    ['assets/splat/cactus/scene.spz', 'asset'],
    ['assets/splat/cactus/tileset.json', 'asset'],
    ['assets/splat/cactus/tiles/10.glb', 'asset'],
    ['assets/splat/cactus/data/chunk_0.bin', 'asset'],
  ])('allows %s', (path, kind) => {
    expect(resolveDemoAssetPath(path)).toEqual({
      kind,
      upstreamPath: `/v1/${path}`,
    });
  });

  it.each([
    '',
    'tiles/other.json',
    'tiles/garhwal-himalaya/a/1/2.png',
    'tiles/garhwal-himalaya/10/716/422.webp',
    'tiles/other/10/716/422.png',
    'assets/splat/other/scene.spz',
    'assets/splat/cactus/scene.exe',
    'assets/splat/cactus/../other/scene.spz',
    'assets/splat/cactus/%2e%2e/other/scene.spz',
    'assets/splat/cactus/.hidden.json',
    'assets/terrain/garhwal-himalaya.pmtiles',
    'v1/tiles/garhwal-himalaya.json',
  ])('rejects %j', (path) => {
    expect(resolveDemoAssetPath(path)).toBeNull();
  });
});

describe('proxyDemoAsset', () => {
  it('returns 404 without calling upstream for a path off the allowlist', async () => {
    const fetchImpl = vi.fn<typeof fetch>();
    const res = await proxyDemoAsset(
      request('assets/splat/other/x.json'),
      config,
      fetchImpl,
    );
    expect(res.status).toBe(404);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('returns 405 for non-GET methods', async () => {
    const fetchImpl = vi.fn<typeof fetch>();
    const res = await proxyDemoAsset(
      request('tiles/garhwal-himalaya.json', { method: 'POST' }),
      config,
      fetchImpl,
    );
    expect(res.status).toBe(405);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('returns 503 when the secrets are missing', async () => {
    const res = await proxyDemoAsset(
      request('tiles/garhwal-himalaya.json'),
      { apiBase: '', apiKey: '' },
      vi.fn<typeof fetch>(),
    );
    expect(res.status).toBe(503);
  });

  it('sends the key upstream as a bearer header, never in the URL', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => new Response('x'));
    await proxyDemoAsset(
      request('assets/splat/cactus/scene.spz'),
      config,
      fetchImpl,
    );
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe(`${API_BASE}/v1/assets/splat/cactus/scene.spz`);
    expect(String(url)).not.toContain(API_KEY);
    expect(new Headers(init?.headers).get('authorization')).toBe(
      `Bearer ${API_KEY}`,
    );
  });

  it('forwards Range and passes partial-content headers back', async () => {
    const fetchImpl = vi.fn<typeof fetch>(
      async () =>
        new Response('0123456789', {
          status: 206,
          headers: {
            'content-type': 'application/octet-stream',
            'content-length': '10',
            'content-range': 'bytes 0-9/31749933',
            'accept-ranges': 'bytes',
            etag: '"e1"',
            'cache-control': 'public, max-age=86400',
            'x-quota-remaining': '199994',
            'set-cookie': 'a=b',
          },
        }),
    );
    const res = await proxyDemoAsset(
      request('assets/splat/cactus/scene.spz', {
        headers: new Headers({ range: 'bytes=0-9', cookie: 'c=d' }),
      }),
      config,
      fetchImpl,
    );
    const sent = new Headers(fetchImpl.mock.calls[0]![1]?.headers);
    expect(sent.get('range')).toBe('bytes=0-9');
    expect(sent.get('cookie')).toBeNull();

    expect(res.status).toBe(206);
    expect(res.headers.get('content-type')).toBe('application/octet-stream');
    expect(res.headers.get('content-length')).toBe('10');
    expect(res.headers.get('content-range')).toBe('bytes 0-9/31749933');
    expect(res.headers.get('accept-ranges')).toBe('bytes');
    expect(res.headers.get('etag')).toBe('"e1"');
    expect(res.headers.get('cache-control')).toBe('public, max-age=86400');
    expect(res.headers.get('x-quota-remaining')).toBeNull();
    expect(res.headers.get('set-cookie')).toBeNull();
    expect(await res.text()).toBe('0123456789');
  });

  it('passes 416 through with Content-Range and no upstream body', async () => {
    const res = await proxyDemoAsset(
      request('assets/splat/cactus/scene.spz', {
        headers: new Headers({ range: 'bytes=999999999-' }),
      }),
      config,
      async () =>
        new Response(`bad range for ${API_KEY}`, {
          status: 416,
          headers: { 'content-range': 'bytes */31749933' },
        }),
    );
    expect(res.status).toBe(416);
    expect(res.headers.get('content-range')).toBe('bytes */31749933');
    expect(await res.text()).toBe('');
  });

  it('rewrites TileJSON tile URLs to the proxy and strips the key', async () => {
    const res = await proxyDemoAsset(
      request('tiles/garhwal-himalaya.json'),
      config,
      async () => upstreamTileJson(),
    );
    const text = await res.text();
    expect(res.status).toBe(200);
    expect(text).not.toContain(API_KEY);
    expect(text).not.toContain('api_key');
    expect(text).not.toContain(API_BASE);
    const body = JSON.parse(text) as { tiles: string[]; encoding: string };
    expect(body.tiles).toEqual([
      `${ORIGIN}/demo-assets/tiles/garhwal-himalaya/{z}/{x}/{y}.png`,
    ]);
    expect(body.encoding).toBe('mapbox');
    expect(res.headers.get('content-type')).toBe('application/json');
    expect(res.headers.get('cache-control')).toBe('public, max-age=86400');
    expect(res.headers.get('etag')).toBeNull();
  });

  it('fails closed when a rewritten TileJSON would still carry the key', async () => {
    const res = await proxyDemoAsset(
      request('tiles/garhwal-himalaya.json'),
      config,
      async () => Response.json({ tiles: [], attribution: `key ${API_KEY}` }),
    );
    expect(res.status).toBe(502);
    expect(await res.text()).not.toContain(API_KEY);
  });

  it('passes an empty-tile 204 through', async () => {
    const res = await proxyDemoAsset(
      request('tiles/garhwal-himalaya/10/1/1.png'),
      config,
      async () => new Response(null, { status: 204 }),
    );
    expect(res.status).toBe(204);
  });
});

describe('rewriteTileJson', () => {
  it('keeps every non-tile field', () => {
    const out = rewriteTileJson(
      { tiles: ['x'], bounds: [79, 30, 80, 31], encoding: 'mapbox' },
      ORIGIN,
    );
    expect(out.bounds).toEqual([79, 30, 80, 31]);
    expect(out.encoding).toBe('mapbox');
  });
});
