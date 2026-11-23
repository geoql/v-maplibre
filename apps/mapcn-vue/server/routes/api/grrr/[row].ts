/**
 * Daily streamflow (1981–2025) for one GRRR basin, by its row in
 * reanalysis/streamflow.zarr (the `row` column of /api/grrr/basins).
 * The dataset does not change, so the edge cache keeps answers for 30 days.
 */
export default defineEdgeCachedHandler(
  async (event) => {
    const row = Number(getRouterParam(event, 'row'));
    if (!isGrrrRow(row)) {
      throw createError({ statusCode: 400, message: 'Invalid basin row' });
    }
    return readGrrrStreamflow(row, async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw createError({
          statusCode: 502,
          message: `GRRR chunk answered ${response.status}`,
        });
      }
      return new Uint8Array(await response.arrayBuffer());
    });
  },
  { maxAge: 60 * 60 * 24 * 30 },
);
