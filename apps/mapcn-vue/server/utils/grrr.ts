import { decompress } from 'fzstd';
import type { GrrrFetchBytes, GrrrSeries } from '../types/grrr';

/**
 * Reads one basin's daily streamflow from the GRRR reanalysis
 * (Google Runoff Reanalysis & Reforecast, November 2026, CC BY 4.0).
 *
 * The store is Zarr v3. `streamflow` has shape [970005 basins, 16436 days],
 * float32, chunks of [128, 16436] encoded as little-endian bytes + zstd. One
 * basin needs one chunk (about 7.5 MB compressed), so the server reads it and
 * the browser receives only the basin's row.
 */
export const GRRR_STREAMFLOW_URL =
  'https://storage.googleapis.com/flood-forecasting/hydrologic_predictions/distributed_model_2026_11/reanalysis/streamflow.zarr';
export const GRRR_BASINS = 970_005;
export const GRRR_ROWS_PER_CHUNK = 128;
export const GRRR_DAYS = 16_436;
/** `time` is "days since 1980-12-31". */
export const GRRR_START = '1980-12-31';

/** The chunk key that holds `row` (default chunk key encoding, "/"). */
export function grrrChunkKey(row: number): string {
  return `streamflow/c/${Math.floor(row / GRRR_ROWS_PER_CHUNK)}/0`;
}

/**
 * Takes the basin's values out of a decoded chunk. NaN (the fill value)
 * becomes null, and values are rounded to 0.1 m³/s.
 */
export function grrrSliceRow(
  chunk: Uint8Array,
  row: number,
): (number | null)[] {
  const view = new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength);
  const offset = (row % GRRR_ROWS_PER_CHUNK) * GRRR_DAYS * 4;
  const values: (number | null)[] = new Array(GRRR_DAYS);
  for (let day = 0; day < GRRR_DAYS; day++) {
    const value = view.getFloat32(offset + day * 4, true);
    values[day] = Number.isNaN(value) ? null : Math.round(value * 10) / 10;
  }
  return values;
}

export function isGrrrRow(row: number): boolean {
  return Number.isInteger(row) && row >= 0 && row < GRRR_BASINS;
}

export async function readGrrrStreamflow(
  row: number,
  fetchBytes: GrrrFetchBytes,
  decode: (bytes: Uint8Array) => Uint8Array = decompress,
): Promise<GrrrSeries> {
  const compressed = await fetchBytes(
    `${GRRR_STREAMFLOW_URL}/${grrrChunkKey(row)}`,
  );
  return {
    row,
    start: GRRR_START,
    values: grrrSliceRow(decode(compressed), row),
  };
}
