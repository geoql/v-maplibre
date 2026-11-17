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
}
