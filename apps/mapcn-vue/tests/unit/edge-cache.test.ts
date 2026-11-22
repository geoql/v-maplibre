import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { cachedJsonResponse } from '../../server/utils/edge-cache';

/** Minimal stand-in for the Workers `caches.default` Cache. */
function memoryCache() {
  const store = new Map<string, Response>();
  return {
    store,
    match: vi.fn(async (key: string) => store.get(key)?.clone()),
    put: vi.fn(async (key: string, res: Response) => {
      store.set(key, res);
    }),
  };
}

const URL_A = 'https://site.test/api/convoy-routes';

afterEach(() => vi.unstubAllGlobals());

describe('cachedJsonResponse', () => {
  it('runs the producer on a miss and stores the JSON with a max-age', async () => {
    const cache = memoryCache();
    const waits: Promise<unknown>[] = [];
    const res = await cachedJsonResponse({
      url: URL_A,
      method: 'GET',
      maxAge: 3600,
      cache,
      waitUntil: (p) => waits.push(p),
      produce: async () => ({ ok: 1 }),
    });
    await Promise.all(waits);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: 1 });
    expect(res.headers.get('content-type')).toContain('application/json');
    const stored = cache.store.get(URL_A);
    expect(stored?.headers.get('cache-control')).toBe('public, max-age=3600');
  });

  it('answers a hit from the cache without running the producer', async () => {
    const cache = memoryCache();
    cache.store.set(URL_A, Response.json({ cached: true }));
    const produce = vi.fn(async () => ({ fresh: true }));

    const res = await cachedJsonResponse({
      url: URL_A,
      method: 'GET',
      maxAge: 60,
      cache,
      waitUntil: () => {},
      produce,
    });

    expect(await res.json()).toEqual({ cached: true });
    expect(produce).not.toHaveBeenCalled();
  });

  it('does not cache non-GET requests', async () => {
    const cache = memoryCache();
    await cachedJsonResponse({
      url: URL_A,
      method: 'POST',
      maxAge: 60,
      cache,
      waitUntil: () => {},
      produce: async () => ({ posted: true }),
    });
    expect(cache.match).not.toHaveBeenCalled();
    expect(cache.put).not.toHaveBeenCalled();
  });

  it('works without a cache (dev, prerender)', async () => {
    const res = await cachedJsonResponse({
      url: URL_A,
      method: 'GET',
      maxAge: 60,
      cache: undefined,
      waitUntil: () => {},
      produce: async () => [1, 2],
    });
    expect(await res.json()).toEqual([1, 2]);
  });

  // The bug this replaces: Nitro's cachedEventHandler keeps the first
  // request's in-flight promise and hands it to later requests. On Workers a
  // promise can only settle in the request that created it, so when that
  // first request is cancelled every later request on the isolate 500s.
  it("never waits on another request's unfinished work", async () => {
    const cache = memoryCache();
    // Request A: its producer never settles (the request was cancelled).
    void cachedJsonResponse({
      url: URL_A,
      method: 'GET',
      maxAge: 60,
      cache,
      waitUntil: () => {},
      produce: () => new Promise(() => {}),
    });

    // Request B for the same URL must finish with its own result.
    const res = await Promise.race([
      cachedJsonResponse({
        url: URL_A,
        method: 'GET',
        maxAge: 60,
        cache,
        waitUntil: () => {},
        produce: async () => ({ from: 'b' }),
      }),
      new Promise<'blocked'>((resolve) =>
        setTimeout(() => resolve('blocked'), 200),
      ),
    ]);
    expect(res).not.toBe('blocked');
    expect(await (res as Response).json()).toEqual({ from: 'b' });
  });
});
