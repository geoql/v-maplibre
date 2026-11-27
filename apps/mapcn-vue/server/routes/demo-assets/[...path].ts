import type { H3Event } from 'h3';
import { proxyDemoAsset } from '../../utils/demo-assets';
import { workersCache } from '../../utils/edge-cache';

/**
 * /demo-assets/** — key-holding proxy for the demo datasets (allowlist and
 * header rules in server/utils/demo-assets.ts). The API base URL and key are
 * Worker secrets (NUXT_DEMO_ASSETS_API_BASE / NUXT_DEMO_ASSETS_API_KEY) and
 * never reach the browser.
 */
export default defineEventHandler((event: H3Event) => {
  const headers = new Headers();
  for (const [name, value] of Object.entries(getRequestHeaders(event))) {
    if (value !== undefined) headers.set(name, value);
  }
  return proxyDemoAsset(
    {
      method: event.method,
      path: getRouterParam(event, 'path') ?? '',
      headers,
      origin: getRequestURL(event).origin,
      clientIp: getRequestHeader(event, 'cf-connecting-ip'),
    },
    useRuntimeConfig(event).demoAssets,
    fetch,
    {
      cache: workersCache(),
      waitUntil: (promise) => event.waitUntil(promise),
      limiter: event.context.cloudflare?.env?.DEMO_ASSETS_LIMITER,
    },
  );
});
