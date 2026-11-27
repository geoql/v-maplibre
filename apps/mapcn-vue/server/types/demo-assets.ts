/** What a proxied demo-asset request maps to on the upstream API. */
export interface DemoAssetRoute {
  /** `tilejson` responses are rewritten; everything else streams through. */
  kind: 'tilejson' | 'tile' | 'asset';
  /** Upstream path, starting with `/v1/`. Never carries a credential. */
  upstreamPath: string;
}

/** The subset of TileJSON 3.0 fields the proxy reads or rewrites. */
export interface DemoTileJson {
  tiles?: string[];
  [key: string]: unknown;
}

/** Server-only upstream settings (runtimeConfig.demoAssets). */
export interface DemoAssetsConfig {
  apiBase: string;
  apiKey: string;
}

/** The parts of an incoming request the proxy needs. */
export interface DemoAssetRequest {
  method: string;
  /** Sub-path below the proxy prefix, without a leading slash. */
  path: string;
  headers: Headers;
  /** Public origin of this site, used to build rewritten tile URLs. */
  origin: string;
  /** Visitor IP (`CF-Connecting-IP`); empty when the platform gives none. */
  clientIp?: string;
}

/** The part of a Workers rate-limit binding the proxy uses. */
export interface DemoRateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

/** Platform services the proxy uses when they exist (absent in dev). */
export interface DemoAssetsEdge {
  /** `caches.default`: stores tile and TileJSON answers. */
  cache?: {
    match(key: string): Promise<Response | undefined>;
    put(key: string, response: Response): Promise<void>;
  };
  /** Keeps a cache write alive after the response is sent. */
  waitUntil?: (promise: Promise<unknown>) => void;
  /** Per-IP limit, checked only before a call to the upstream API. */
  limiter?: DemoRateLimiter;
}
