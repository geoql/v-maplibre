import { describe, expect, it, vi } from 'vite-plus/test';
import {
  ipRateKey,
  proxyDemoAsset,
  resolveDemoAssetPath,
  rewriteTileJson,
  terrainTileInReach,
} from '../../server/utils/demo-assets';
import type {
  DemoAssetRequest,
  DemoAssetsEdge,
} from '../../server/types/demo-assets';

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
    headers: new Headers({ 'sec-fetch-site': 'same-origin' }),
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
    ['tiles/garhwal-himalaya/10/737/420.png', 'tile'],
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
    'tiles/garhwal-himalaya/10/737/420.webp',
    'tiles/garhwal-himalaya/10/0737/420.png',
    'tiles/garhwal-himalaya/010/737/420.png',
    'tiles/garhwal-himalaya/5/23/13.png',
    'tiles/garhwal-himalaya/13/5893/3380.png',
    'tiles/garhwal-himalaya/10/735/420.png',
    'tiles/garhwal-himalaya/10/740/420.png',
    'tiles/garhwal-himalaya/10/737/418.png',
    'tiles/garhwal-himalaya/10/737/423.png',
    'tiles/garhwal-himalaya/10/716/422.png',
    'tiles/garhwal-himalaya/10/99999/99999.png',
    'tiles/garhwal-himalaya/99/9999999/9999999.png',
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
        headers: new Headers({
          'sec-fetch-site': 'same-origin',
          range: 'bytes=0-9',
          cookie: 'c=d',
        }),
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
        headers: new Headers({
          'sec-fetch-site': 'same-origin',
          range: 'bytes=999999999-',
        }),
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
      request('tiles/garhwal-himalaya/10/737/420.png'),
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

// Tiles inside TileJSON bounds [79, 30, 80, 31], zooms 6 to 12. The ranges are
// worked out by hand from the Web Mercator formulas:
//   z6 x46 y26 | z9 x368-369 y209-211 | z10 x736-739 y419-422
//   z12 x2946-2958 y1676-1689
describe('terrainTileInReach', () => {
  it.each([
    [6, 46, 26],
    [9, 368, 209],
    [9, 369, 211],
    [10, 736, 419],
    [10, 739, 422],
    [12, 2946, 1676],
    [12, 2958, 1689],
  ])('accepts %i/%i/%i', (z, x, y) => {
    expect(terrainTileInReach(z, x, y)).toBe(true);
  });

  it.each([
    [5, 23, 13],
    [13, 5893, 3380],
    [6, 45, 26],
    [6, 47, 26],
    [6, 46, 25],
    [6, 46, 27],
    [10, 735, 420],
    [10, 740, 420],
    [10, 737, 418],
    [10, 737, 423],
    [12, 2945, 1680],
    [12, 2959, 1680],
    [12, 2950, 1675],
    [12, 2950, 1690],
    [12, 4096, 1680],
    [10, 5000, 5000],
  ])('rejects %i/%i/%i', (z, x, y) => {
    expect(terrainTileInReach(z, x, y)).toBe(false);
  });
});

describe('ipRateKey', () => {
  it.each([
    ['203.0.113.7', '203.0.113.7'],
    ['2001:db8:1:2:3:4:5:6', '2001:db8:1:2'],
    ['2001:DB8:1:2::9', '2001:db8:1:2'],
    ['2001:db8::1', '2001:db8:0:0'],
    ['::1', '0:0:0:0'],
  ])('%s -> %s', (ip, key) => {
    expect(ipRateKey(ip)).toBe(key);
  });
});

function memoryCache() {
  const store = new Map<string, Response>();
  return {
    store,
    match: async (key: string) => store.get(key)?.clone(),
    put: async (key: string, response: Response) => {
      store.set(key, response);
    },
  };
}

function edgeFor(
  overrides: Partial<DemoAssetsEdge> = {},
): DemoAssetsEdge & { pending: Promise<unknown>[] } {
  const pending: Promise<unknown>[] = [];
  return {
    cache: memoryCache(),
    waitUntil: (promise) => {
      pending.push(promise);
    },
    pending,
    ...overrides,
  };
}

const TILE = 'tiles/garhwal-himalaya/10/737/420.png';
const tileResponse = () =>
  new Response('png-bytes', {
    headers: { 'content-type': 'image/png', 'cache-control': 'max-age=60' },
  });

describe('Sec-Fetch-Site', () => {
  it.each([undefined, 'cross-site', 'same-site', 'none'])(
    'refuses %s with 403 and no upstream call',
    async (value) => {
      const fetchImpl = vi.fn<typeof fetch>();
      const headers = new Headers();
      if (value !== undefined) headers.set('sec-fetch-site', value);
      const res = await proxyDemoAsset(
        request(TILE, { headers }),
        config,
        fetchImpl,
        edgeFor(),
      );
      expect(res.status).toBe(403);
      expect(fetchImpl).not.toHaveBeenCalled();
    },
  );

  it('does not serve a cached tile to a cross-site request', async () => {
    const edge = edgeFor();
    await proxyDemoAsset(
      request(TILE),
      config,
      async () => tileResponse(),
      edge,
    );
    await Promise.all(edge.pending);
    const res = await proxyDemoAsset(
      request(TILE, {
        headers: new Headers({ 'sec-fetch-site': 'cross-site' }),
      }),
      config,
      vi.fn<typeof fetch>(),
      edge,
    );
    expect(res.status).toBe(403);
  });

  it('never sets a CORS header and seals the answer to its origin', async () => {
    const res = await proxyDemoAsset(
      request(TILE, {
        headers: new Headers({
          'sec-fetch-site': 'same-origin',
          origin: 'https://evil.test',
        }),
      }),
      config,
      async () =>
        new Response('x', {
          headers: { 'access-control-allow-origin': '*' },
        }),
      edgeFor(),
    );
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
    expect(res.headers.get('cross-origin-resource-policy')).toBe('same-origin');
  });
});

describe('edge cache', () => {
  it('stores a tile under a path-only key and serves the repeat from cache', async () => {
    const edge = edgeFor();
    const fetchImpl = vi.fn<typeof fetch>(async () => tileResponse());

    const first = await proxyDemoAsset(request(TILE), config, fetchImpl, edge);
    await Promise.all(edge.pending);
    expect(first.status).toBe(200);
    expect(first.headers.get('x-demo-cache')).toBe('MISS');
    expect(first.headers.get('cache-control')).toBe('public, max-age=2592000');
    expect([
      ...(edge.cache as ReturnType<typeof memoryCache>).store.keys(),
    ]).toEqual([
      'https://site.test/demo-assets/tiles/garhwal-himalaya/10/737/420.png',
    ]);

    const second = await proxyDemoAsset(request(TILE), config, fetchImpl, edge);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(second.headers.get('x-demo-cache')).toBe('HIT');
    expect(await second.text()).toBe('png-bytes');
  });

  it('caches an empty-tile 204', async () => {
    const edge = edgeFor();
    const fetchImpl = vi.fn<typeof fetch>(
      async () => new Response(null, { status: 204 }),
    );
    await proxyDemoAsset(request(TILE), config, fetchImpl, edge);
    await Promise.all(edge.pending);
    const second = await proxyDemoAsset(request(TILE), config, fetchImpl, edge);
    expect(second.status).toBe(204);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('caches the rewritten TileJSON without the key', async () => {
    const edge = edgeFor();
    const fetchImpl = vi.fn<typeof fetch>(async () => upstreamTileJson());
    await proxyDemoAsset(
      request('tiles/garhwal-himalaya.json'),
      config,
      fetchImpl,
      edge,
    );
    await Promise.all(edge.pending);
    const second = await proxyDemoAsset(
      request('tiles/garhwal-himalaya.json'),
      config,
      fetchImpl,
      edge,
    );
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(await second.text()).not.toContain(API_KEY);
  });

  it.each([
    ['upstream error', 502],
    ['upstream 403', 403],
    ['upstream 429', 429],
  ])('does not cache an %s', async (_name, code) => {
    const edge = edgeFor();
    const fetchImpl = vi.fn<typeof fetch>(
      async () => new Response(null, { status: code }),
    );
    await proxyDemoAsset(request(TILE), config, fetchImpl, edge);
    await Promise.all(edge.pending);
    expect((edge.cache as ReturnType<typeof memoryCache>).store.size).toBe(0);
  });

  it('does not cache Range requests or assets', async () => {
    const edge = edgeFor();
    const fetchImpl = vi.fn<typeof fetch>(async () => new Response('x'));
    await proxyDemoAsset(
      request(TILE, {
        headers: new Headers({
          'sec-fetch-site': 'same-origin',
          range: 'bytes=0-1',
        }),
      }),
      config,
      fetchImpl,
      edge,
    );
    await proxyDemoAsset(
      request('assets/splat/cactus/scene.spz'),
      config,
      fetchImpl,
      edge,
    );
    await Promise.all(edge.pending);
    expect((edge.cache as ReturnType<typeof memoryCache>).store.size).toBe(0);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});

describe('per-IP limit', () => {
  it('returns 429 with no upstream call when the limit is spent', async () => {
    const limit = vi.fn(async () => ({ success: false }));
    const fetchImpl = vi.fn<typeof fetch>();
    const res = await proxyDemoAsset(
      request(TILE, { clientIp: '2001:db8:1:2:3:4:5:6' }),
      config,
      fetchImpl,
      edgeFor({ limiter: { limit } }),
    );
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBe('60');
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(limit).toHaveBeenCalledWith({ key: '2001:db8:1:2' });
  });

  it('does not count a cache hit', async () => {
    const limit = vi.fn(async () => ({ success: true }));
    const edge = edgeFor({ limiter: { limit } });
    const fetchImpl = vi.fn<typeof fetch>(async () => tileResponse());
    const visitor = request(TILE, { clientIp: '203.0.113.7' });
    await proxyDemoAsset(visitor, config, fetchImpl, edge);
    await Promise.all(edge.pending);
    await proxyDemoAsset(visitor, config, fetchImpl, edge);
    await proxyDemoAsset(visitor, config, fetchImpl, edge);
    expect(limit).toHaveBeenCalledTimes(1);
  });

  it('limits assets too', async () => {
    const res = await proxyDemoAsset(
      request('assets/splat/cactus/scene.spz', { clientIp: '203.0.113.7' }),
      config,
      vi.fn<typeof fetch>(),
      edgeFor({ limiter: { limit: async () => ({ success: false }) } }),
    );
    expect(res.status).toBe(429);
  });
});

// Attack: a script with no browser rotates through tile numbers. It sets
// Sec-Fetch-Site itself (a script can), so only bounds, cache and limit stop it.
describe('attack: random tile sweep', () => {
  // Fixed seed, so a failure is repeatable.
  let state = 20261127;
  const random = (max: number) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return (state >>> 8) % max;
  };

  it('sends 0 of 2000 out-of-reach tiles upstream', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => tileResponse());
    const edge = edgeFor();
    const statuses = new Set<number>();
    for (let index = 0; index < 2000; index++) {
      // x and y are at least 5000: past the grid for zoom 12 and below, and
      // zoom 13 to 98 is past the dataset's maxzoom. Every tile is out of reach.
      const z = random(99);
      const x = 5000 + random(9_995_000);
      const y = 5000 + random(9_995_000);
      const res = await proxyDemoAsset(
        request(`tiles/garhwal-himalaya/${z}/${x}/${y}.png`),
        config,
        fetchImpl,
        edge,
      );
      statuses.add(res.status);
    }
    expect([...statuses]).toEqual([404]);
    expect(fetchImpl).toHaveBeenCalledTimes(0);
  });

  it('reads each in-reach tile once however often it is requested', async () => {
    const tiles = [
      [6, 46, 26],
      [9, 368, 209],
      [9, 369, 211],
      [10, 736, 419],
      [10, 737, 420],
      [10, 739, 422],
      [12, 2946, 1676],
      [12, 2950, 1680],
      [12, 2958, 1689],
      [12, 2952, 1685],
    ];
    const fetchImpl = vi.fn<typeof fetch>(async () => tileResponse());
    const edge = edgeFor();
    let hits = 0;
    for (let index = 0; index < 2000; index++) {
      const [z, x, y] = tiles[random(tiles.length)]!;
      const res = await proxyDemoAsset(
        request(`tiles/garhwal-himalaya/${z}/${x}/${y}.png`),
        config,
        fetchImpl,
        edge,
      );
      await Promise.all(edge.pending);
      if (res.headers.get('x-demo-cache') === 'HIT') hits++;
    }
    expect(fetchImpl.mock.calls.length).toBeLessThanOrEqual(10);
    expect(fetchImpl.mock.calls.length + hits).toBe(2000);
  });
});
