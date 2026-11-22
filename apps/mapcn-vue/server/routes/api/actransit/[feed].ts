/**
 * Same-origin proxy for the AC Transit feeds on actransit.val.run.
 *
 * The browser used to call val.run directly. When val.run answers with an
 * error, that response has no CORS header, so the browser reported a CORS
 * failure and the example showed no buses. Proxying keeps the upstream error
 * on the server (a plain 502 to the client) and the edge cache absorbs the
 * 30-second refresh of every open tab.
 */
const FEEDS = new Set([
  'bus_locations',
  'bus_locations_history',
  'route_stop_predictions',
]);

export default defineEdgeCachedHandler(
  async (event) => {
    const feed = getRouterParam(event, 'feed') ?? '';
    if (!FEEDS.has(feed)) {
      throw createError({ statusCode: 404, message: `Unknown feed "${feed}"` });
    }
    const upstream = await fetch(`https://actransit.val.run/${feed}`, {
      headers: { Accept: 'application/json' },
    });
    if (!upstream.ok) {
      throw createError({
        statusCode: 502,
        message: `AC Transit feed ${feed} answered ${upstream.status}`,
      });
    }
    return (await upstream.json()) as unknown;
  },
  // Buses report about every 30 s; the page refreshes every 30 s.
  { maxAge: 20 },
);
