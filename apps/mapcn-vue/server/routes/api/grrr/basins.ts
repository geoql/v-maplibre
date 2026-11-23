import type { GrrrBasinsResponse } from '../../../types/grrr';

/**
 * The GRRR large-river basins from D1, as parallel arrays (smaller than one
 * object per basin). The `grrr:ingest` scheduled task fills the table; until
 * it is done this route answers 503, which the edge cache does not store.
 */
export default defineEdgeCachedHandler(
  async (event): Promise<GrrrBasinsResponse> => {
    const db = event.context.cloudflare?.env?.DB;
    if (!db || !(await grrrIngestDone(db))) {
      throw createError({
        statusCode: 503,
        message: 'GRRR basins are loading',
      });
    }
    const { results } = await db
      .prepare(
        `SELECT id, row, lon, lat, rp2, rp5, rp20, rp100 FROM grrr_basins
         WHERE row IS NOT NULL AND lon IS NOT NULL ORDER BY rp2`,
      )
      .all<{
        id: number;
        row: number;
        lon: number;
        lat: number;
        rp2: number;
        rp5: number;
        rp20: number;
        rp100: number;
      }>();
    return {
      count: results.length,
      id: results.map((r) => r.id),
      row: results.map((r) => r.row),
      lon: results.map((r) => r.lon),
      lat: results.map((r) => r.lat),
      rp2: results.map((r) => r.rp2),
      rp5: results.map((r) => r.rp5),
      rp20: results.map((r) => r.rp20),
      rp100: results.map((r) => r.rp100),
    };
  },
  { maxAge: 60 * 60 * 24 },
);
