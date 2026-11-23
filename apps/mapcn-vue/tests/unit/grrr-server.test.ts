import { describe, expect, it } from 'vite-plus/test';
import {
  GRRR_DAYS,
  GRRR_ROWS_PER_CHUNK,
  grrrChunkKey,
  isGrrrRow,
  readGrrrStreamflow,
} from '../../server/utils/grrr';

/** A decoded chunk where basin r, day d holds r * 1000 + d (day 5 = NaN). */
function syntheticChunk(): Uint8Array {
  const bytes = new Uint8Array(GRRR_ROWS_PER_CHUNK * GRRR_DAYS * 4);
  const view = new DataView(bytes.buffer);
  for (let r = 0; r < GRRR_ROWS_PER_CHUNK; r++) {
    for (let d = 0; d < GRRR_DAYS; d++) {
      const value = d === 5 ? Number.NaN : r * 1000 + d + 0.04;
      view.setFloat32((r * GRRR_DAYS + d) * 4, value, true);
    }
  }
  return bytes;
}

describe('GRRR streamflow reader', () => {
  it('maps a row to its chunk key', () => {
    expect(grrrChunkKey(0)).toBe('streamflow/c/0/0');
    expect(grrrChunkKey(127)).toBe('streamflow/c/0/0');
    expect(grrrChunkKey(128)).toBe('streamflow/c/1/0');
    expect(grrrChunkKey(332599)).toBe('streamflow/c/2598/0');
  });

  it('accepts only rows inside the dataset', () => {
    expect(isGrrrRow(0)).toBe(true);
    expect(isGrrrRow(970004)).toBe(true);
    expect(isGrrrRow(970005)).toBe(false);
    expect(isGrrrRow(-1)).toBe(false);
    expect(isGrrrRow(1.5)).toBe(false);
    expect(isGrrrRow(Number.NaN)).toBe(false);
  });

  it('fetches the right chunk and returns only that basin, NaN as null', async () => {
    const urls: string[] = [];
    // Row 259 is basin 3 of chunk 2.
    const series = await readGrrrStreamflow(
      259,
      async (url) => {
        urls.push(url);
        return syntheticChunk();
      },
      (bytes) => bytes,
    );

    expect(urls).toHaveLength(1);
    expect(urls[0]).toMatch(
      /reanalysis\/streamflow\.zarr\/streamflow\/c\/2\/0$/,
    );
    expect(series.row).toBe(259);
    expect(series.start).toBe('1980-12-31');
    expect(series.values).toHaveLength(GRRR_DAYS);
    expect(series.values[0]).toBe(3000);
    expect(series.values[4]).toBe(3004);
    expect(series.values[5]).toBeNull();
    expect(series.values[GRRR_DAYS - 1]).toBe(3000 + GRRR_DAYS - 1);
  });
});
