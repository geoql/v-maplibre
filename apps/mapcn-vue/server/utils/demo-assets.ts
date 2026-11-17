import type {
  DemoAssetRequest,
  DemoAssetRoute,
  DemoAssetsConfig,
  DemoTileJson,
} from '../types/demo-assets';

/**
 * Server-side proxy for the demo assets (Terrain-RGB tiles, Gaussian splats,
 * 3D Tiles). The upstream API needs a secret key, so the browser only ever
 * talks to `/demo-assets/**` on this Worker and the Worker adds the key.
 * Only the exact datasets the example pages use are allowed through.
 */

/** Public mount point of the proxy route (server/routes/demo-assets). */
export const DEMO_ASSETS_PREFIX = '/demo-assets';

const TERRAIN_DATASET = 'garhwal-himalaya';
const SPLAT_SCENE = 'splat/cactus';

const TILE_RE = new RegExp(
  `^tiles/${TERRAIN_DATASET}/(\\d{1,2})/(\\d{1,7})/(\\d{1,7})\\.png$`,
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

/** Map a proxy sub-path (no leading slash) to its upstream route, or null. */
export function resolveDemoAssetPath(path: string): DemoAssetRoute | null {
  if (path === `tiles/${TERRAIN_DATASET}.json`) {
    return { kind: 'tilejson', upstreamPath: `/v1/${path}` };
  }
  if (TILE_RE.test(path)) {
    return { kind: 'tile', upstreamPath: `/v1/${path}` };
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

function status(code: number): Response {
  return new Response(null, { status: code });
}

/**
 * Proxy one request to the upstream API. Returns 404 for anything outside the
 * allowlist and 503 when the secrets are missing. Upstream error bodies are
 * dropped (only the status, plus Content-Range for a 416, reaches the
 * browser) and a TileJSON that would still carry the key fails closed (502).
 */
export async function proxyDemoAsset(
  request: DemoAssetRequest,
  config: DemoAssetsConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  const { method } = request;
  if (method !== 'GET' && method !== 'HEAD') return status(405);

  const route = resolveDemoAssetPath(request.path);
  if (!route) return status(404);
  if (!config.apiBase || !config.apiKey) return status(503);

  const forwarded = pickHeaders(request.headers, FORWARDED_REQUEST_HEADERS);
  forwarded.set('authorization', `Bearer ${config.apiKey}`);

  const upstream = await fetchImpl(`${config.apiBase}${route.upstreamPath}`, {
    method,
    headers: forwarded,
  });
  const headers = pickHeaders(upstream.headers);

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
    return new Response(method === 'HEAD' ? null : body, {
      status: 200,
      headers,
    });
  }

  return new Response(method === 'HEAD' ? null : upstream.body, {
    status: upstream.status,
    headers,
  });
}
