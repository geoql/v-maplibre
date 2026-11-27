import type { H3Event } from 'h3';

/** The part of the Workers Cache API this module uses. */
export interface EdgeCache {
  match(key: string): Promise<Response | undefined>;
  put(key: string, response: Response): Promise<void>;
}

export interface CachedJsonOptions<T> {
  url: string;
  method: string;
  /** Seconds the response stays cached. */
  maxAge: number;
  /** `caches.default` on Workers; undefined in dev and prerender. */
  cache: EdgeCache | undefined;
  waitUntil: (promise: Promise<unknown>) => void;
  produce: () => Promise<T>;
}

/**
 * Serves a GET response from the edge cache, or runs `produce` and caches its
 * JSON. Nothing is shared between requests in memory: each request reads the
 * cache, and on a miss runs its own `produce`.
 *
 * This replaces Nitro's `defineCachedEventHandler`, which keeps the first
 * request's in-flight promise in module scope and hands it to later requests.
 * On Workers a promise can only settle in the request that created it, so a
 * cancelled first request made every later request on that isolate fail with
 * "This promise was created by a request that has since ended".
 */
export async function cachedJsonResponse<T>(
  options: CachedJsonOptions<T>,
): Promise<Response> {
  const { url, method, maxAge, cache, waitUntil, produce } = options;
  const cacheable = cache !== undefined && method === 'GET';

  if (cacheable) {
    const hit = await cache.match(url);
    if (hit) return hit;
  }

  const response = Response.json(await produce(), {
    headers: { 'cache-control': `public, max-age=${maxAge}` },
  });
  if (cacheable) waitUntil(cache.put(url, response.clone()));
  return response;
}

/** `caches.default` when running on Workers. */
export function workersCache(): EdgeCache | undefined {
  const storage = (globalThis as { caches?: { default?: EdgeCache } }).caches;
  return storage?.default;
}

/**
 * Event-handler wrapper around {@link cachedJsonResponse}. The cache key is
 * the full request URL, so the query string is part of it.
 */
export function defineEdgeCachedHandler<T>(
  handler: (event: H3Event) => Promise<T>,
  options: { maxAge: number },
) {
  return defineEventHandler((event: H3Event) =>
    cachedJsonResponse({
      url: getRequestURL(event).href,
      method: event.method,
      maxAge: options.maxAge,
      cache: workersCache(),
      waitUntil: (promise) => event.waitUntil(promise),
      produce: () => handler(event),
    }),
  );
}
