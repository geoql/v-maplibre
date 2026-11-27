import type {
  DemoAssetRequest,
  DemoAssetRoute,
  DemoAssetsConfig,
  DemoAssetsEdge,
  DemoTileJson,
} from '../types/demo-assets';

/**
 * Server-side proxy for the demo assets (Terrain-RGB tiles, Gaussian splats,
 * 3D Tiles). The upstream API needs a secret key, so the browser only ever
 * talks to `/demo-assets/**` on this Worker and the Worker adds the key.
 * Only the exact datasets the example pages use are allowed through, only
 * for requests the site's own pages make (`Sec-Fetch-Site: same-origin`), and
 * a tile outside the dataset's zoom range and bounds never reaches upstream.
 * Tile and TileJSON answers are kept in the edge cache, so an upstream tile
 * is read at most once for each cache life.
 */

/** Public mount point of the proxy route (server/routes/demo-assets). */
export const DEMO_ASSETS_PREFIX = '/demo-assets';

const UPSTREAM_PREFIX = '/v1/';
/** Tile answers are static data: the edge and the browser keep them 30 days. */
const TILE_CACHE_CONTROL = 'public, max-age=2592000';

const TERRAIN_DATASET = 'garhwal-himalaya';
const SPLAT_SCENE = 'splat/cactus';

// From the upstream TileJSON of the dataset: minzoom 6, maxzoom 12,
// bounds [west, south, east, north].
const TERRAIN_ZOOMS = { min: 6, max: 12 } as const;
const TERRAIN_BOUNDS = [79, 30, 80, 31] as const;

// Canonical numbers only (no leading zero), so one tile has one path and
// one cache key.
const TILE_RE = new RegExp(
  `^tiles/${TERRAIN_DATASET}/(0|[1-9]\\d?)/(0|[1-9]\\d{0,3})/(0|[1-9]\\d{0,3})\\.png$`,
);
// Segments are plain names (no leading dot, no `..`, no `%`, no `\`), so a
// path can never climb out of the scene directory upstream.
const SEGMENT = '[A-Za-z0-9_-]+(?:\\.[A-Za-z0-9_-]+)*';
const ASSET_RE = new RegExp(
  `^assets/${SPLAT_SCENE}/((?:${SEGMENT}/)*${SEGMENT}\\.(?:json|glb|spz|bin))$`,
);

/** Response headers copied from upstream to the browser. */
export const PASSTHROUGH_HEADERS = [
  'content-type',
  'content-length',
  'content-range',
  'accept-ranges',
  'etag',
  'cache-control',
  'last-modified',
] as const;

/** Request headers copied from the browser to upstream. */
export const FORWARDED_REQUEST_HEADERS = [
  'range',
  'if-none-match',
  'if-range',
] as const;

/** True when the XYZ tile is inside the terrain dataset's zooms and bounds. */
export function terrainTileInReach(z: number, x: number, y: number): boolean {
  if (z < TERRAIN_ZOOMS.min || z > TERRAIN_ZOOMS.max) return false;
  const n = 2 ** z;
  if (x >= n || y >= n) return false;
  const latitude = (row: number) =>
    (Math.atan(Math.sinh(Math.PI * (1 - (2 * row) / n))) * 180) / Math.PI;
  const west = (x / n) * 360 - 180;
  const east = ((x + 1) / n) * 360 - 180;
  const [boundsWest, boundsSouth, boundsEast, boundsNorth] = TERRAIN_BOUNDS;
  return (
    west <= boundsEast &&
    east >= boundsWest &&
    latitude(y + 1) <= boundsNorth &&
    latitude(y) >= boundsSouth
  );
}

/**
 * Rate-limit key for a visitor: the address, or the /64 for IPv6 (one
 * subscriber holds a whole /64, so the full address is no limit at all).
 */
export function ipRateKey(ip: string): string {
  if (!ip.includes(':')) return ip;
  const [head = '', tail = ''] = ip.toLowerCase().split('::');
  const front = head === '' ? [] : head.split(':');
  const back = tail === '' ? [] : tail.split(':');
  const groups = ip.includes('::')
    ? [
        ...front,
        ...Array(Math.max(0, 8 - front.length - back.length)).fill('0'),
        ...back,
      ]
    : front;
  return groups.slice(0, 4).join(':');
}

/** Map a proxy sub-path (no leading slash) to its upstream route, or null. */
export function resolveDemoAssetPath(path: string): DemoAssetRoute | null {
  if (path === `tiles/${TERRAIN_DATASET}.json`) {
    return { kind: 'tilejson', upstreamPath: `/v1/${path}` };
  }
  const tile = TILE_RE.exec(path);
  if (tile) {
    const [z, x, y] = [Number(tile[1]), Number(tile[2]), Number(tile[3])];
    return terrainTileInReach(z, x, y)
      ? { kind: 'tile', upstreamPath: `/v1/${path}` }
      : null;
  }
  if (ASSET_RE.test(path)) {
    return { kind: 'asset', upstreamPath: `/v1/${path}` };
  }
  return null;
}

/** Copy the allowlisted headers from an upstream response. */
export function pickHeaders(
  source: Headers,
  names: readonly string[] = PASSTHROUGH_HEADERS,
): Headers {
  const out = new Headers();
  for (const name of names) {
    const value = source.get(name);
    if (value !== null) out.set(name, value);
  }
  return out;
}

/**
 * Point every tile URL at this proxy. The upstream TileJSON embeds the
 * secret key in its tile URLs, so the template is rebuilt from scratch
 * instead of being edited in place.
 */
export function rewriteTileJson(
  tileJson: DemoTileJson,
  origin: string,
): DemoTileJson {
  return {
    ...tileJson,
    tiles: [
      `${origin}${DEMO_ASSETS_PREFIX}/tiles/${TERRAIN_DATASET}/{z}/{x}/{y}.png`,
    ],
  };
}

/** True when `text` contains the secret (or its URL-encoded form). */
export function leaksSecret(text: string, secret: string): boolean {
  if (!secret) return false;
  return text.includes(secret) || text.includes(encodeURIComponent(secret));
}

/** Same-origin only: no CORS header is ever sent, and CORP refuses no-cors embeds. */
function sealed(headers: Headers, cacheState?: 'HIT' | 'MISS'): Headers {
  headers.set('cross-origin-resource-policy', 'same-origin');
  if (cacheState) headers.set('x-demo-cache', cacheState);
  return headers;
}

function status(code: number): Response {
  return new Response(null, { status: code });
}

/**
 * Proxy one request to the upstream API. Returns 403 unless the browser marks
 * the request `Sec-Fetch-Site: same-origin`, 404 for anything outside the
 * allowlist (this includes tiles outside the dataset's zooms and bounds) and
 * 503 when the secrets are missing. Tile and TileJSON answers come from the
 * edge cache when they can. Only a cache miss reaches the per-IP limit (429)
 * and then upstream. Upstream error bodies are dropped (only the status, plus
 * Content-Range for a 416, reaches the browser) and a TileJSON that would
 * still carry the key fails closed (502).
 */
export async function proxyDemoAsset(
  request: DemoAssetRequest,
  config: DemoAssetsConfig,
  fetchImpl: typeof fetch = fetch,
  edge: DemoAssetsEdge = {},
): Promise<Response> {
  const { method } = request;
  if (method !== 'GET' && method !== 'HEAD') return status(405);
  if (request.headers.get('sec-fetch-site') !== 'same-origin') {
    return status(403);
  }

  const route = resolveDemoAssetPath(request.path);
  if (!route) return status(404);
  if (!config.apiBase || !config.apiKey) return status(503);

  const { cache, waitUntil, limiter } = edge;
  const cacheable =
    cache !== undefined &&
    method === 'GET' &&
    route.kind !== 'asset' &&
    !request.headers.has('range');
  const key = `${request.origin}${DEMO_ASSETS_PREFIX}/${route.upstreamPath.slice(UPSTREAM_PREFIX.length)}`;

  if (cacheable) {
    const hit = await cache.match(key);
    if (hit) {
      return new Response(hit.body, {
        status: hit.status,
        headers: sealed(new Headers(hit.headers), 'HIT'),
      });
    }
  }

  if (limiter && request.clientIp) {
    const { success } = await limiter.limit({
      key: ipRateKey(request.clientIp),
    });
    if (!success) {
      return new Response(null, {
        status: 429,
        headers: { 'retry-after': '60' },
      });
    }
  }

  const forwarded = pickHeaders(request.headers, FORWARDED_REQUEST_HEADERS);
  forwarded.set('authorization', `Bearer ${config.apiKey}`);

  const upstream = await fetchImpl(`${config.apiBase}${route.upstreamPath}`, {
    method,
    headers: forwarded,
  });
  const headers = pickHeaders(upstream.headers);
  const state = cacheable ? 'MISS' : undefined;

  async function respond(response: Response): Promise<Response> {
    if (!cacheable || cache === undefined) return response;
    if (response.status !== 200 && response.status !== 204) return response;
    const write = cache.put(key, response.clone());
    if (waitUntil) waitUntil(write);
    else await write;
    return response;
  }

  if (!upstream.ok && upstream.status !== 304) {
    return new Response(null, { status: upstream.status, headers });
  }

  if (route.kind === 'tilejson' && upstream.status === 200) {
    const tileJson = (await upstream.json()) as DemoTileJson;
    const body = JSON.stringify(rewriteTileJson(tileJson, request.origin));
    if (leaksSecret(body, config.apiKey)) return status(502);
    // The body changed, so the upstream length and validator no longer apply.
    headers.delete('content-length');
    headers.delete('etag');
    headers.set('content-type', 'application/json');
    return respond(
      new Response(method === 'HEAD' ? null : body, {
        status: 200,
        headers: sealed(headers, state),
      }),
    );
  }

  if (route.kind === 'tile') headers.set('cache-control', TILE_CACHE_CONTROL);
  return respond(
    new Response(method === 'HEAD' ? null : upstream.body, {
      status: upstream.status,
      headers: sealed(headers, state),
    }),
  );
}
