import { asyncBufferFromUrl, parquetRead } from 'hyparquet';
import { decompress } from 'fzstd';
import type { GrrrDb, GrrrIngestStep, GrrrStatement } from '../types/grrr';
import { bloscLz4Decode } from './blosc-lz4';

/**
 * Loads the GRRR large-river basins into D1 (table `grrr_basins`).
 *
 * The scheduled task `grrr:ingest` calls `runGrrrIngest`. The work is cut into
 * small steps so that one step fits the Worker's 128 MB memory, and the next
 * step number is saved in `grrr_ingest`. A run does steps until its time
 * budget is spent; the next cron run continues. When all steps are done, a
 * run only reads one row and returns.
 *
 * Steps:
 * 1. `rp`: return_periods.parquet, 50k rows per step. Keeps the basins whose
 *    2-year return period is at least GRRR_MIN_RP2 m³/s.
 * 2. `row`: reanalysis/streamflow.zarr gauge_id, one chunk per step. Writes
 *    each kept basin's row (the key of /api/grrr/<row>).
 * 3. `outlet`: subhybas_outlet_locations_UNOFFICIAL.zarr, one gauge_id chunk
 *    per step. Writes each kept basin's outlet point.
 */
export const GRRR_DATASET = 'distributed_model_2026_11';
export const GRRR_MIN_RP2 = 1500;

const BASE = `https://storage.googleapis.com/flood-forecasting/hydrologic_predictions/${GRRR_DATASET}`;
const PARQUET_URL = `${BASE}/return_periods.parquet`;
const PARQUET_BYTES = 71_174_854;
const BASINS = 970_005;
const RP_SLICE = 50_000;
const ROW_CHUNK = 15_157;
const OUTLETS = 1_034_083;
const OUTLET_ID_CHUNK = 258_521;
const OUTLET_POINT_CHUNK = 64_631;

const RP_STEPS = Math.ceil(BASINS / RP_SLICE);
const ROW_STEPS = Math.ceil(BASINS / ROW_CHUNK);
const OUTLET_STEPS = Math.ceil(OUTLETS / OUTLET_ID_CHUNK);
export const GRRR_INGEST_STEPS = RP_STEPS + ROW_STEPS + OUTLET_STEPS;

/** What step `n` does, or null when `n` is past the last step. */
export function grrrIngestStep(n: number): GrrrIngestStep | null {
  if (n < RP_STEPS) return { kind: 'rp', index: n };
  if (n < RP_STEPS + ROW_STEPS) return { kind: 'row', index: n - RP_STEPS };
  if (n < GRRR_INGEST_STEPS) {
    return { kind: 'outlet', index: n - RP_STEPS - ROW_STEPS };
  }
  return null;
}

/** The number in "subhybas_<id>" from a fixed-length UTF-32 Zarr string. */
export function grrrIdFromUtf32(bytes: Uint8Array, offset: number): number {
  // "subhybas_" is 9 code points; the 10 digits follow (4 bytes each).
  let id = 0;
  for (let i = 9; i < 19; i++) id = id * 10 + (bytes[offset + i * 4]! - 48);
  return id;
}

/** The ids of a Zarr v2 `vlen-utf8` chunk, as numbers. */
export function grrrIdsFromVlen(bytes: Uint8Array): number[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const count = view.getUint32(0, true);
  const ids = new Array<number>(count);
  let at = 4;
  for (let i = 0; i < count; i++) {
    const length = view.getUint32(at, true);
    let id = 0;
    for (let j = at + 4 + 9; j < at + 4 + length; j++)
      id = id * 10 + (bytes[j]! - 48);
    ids[i] = id;
    at += 4 + length;
  }
  return ids;
}

async function fetchBytes(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`GRRR ${url} answered ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

async function readColumn(
  column: string,
  rowStart: number,
  rowEnd: number,
): Promise<unknown[]> {
  const file = await asyncBufferFromUrl({
    url: PARQUET_URL,
    byteLength: PARQUET_BYTES,
  });
  const values = new Array<unknown>(rowEnd - rowStart);
  await parquetRead({
    file,
    columns: [column],
    rowStart,
    rowEnd,
    // A chunk can start before rowStart (whole pages are decoded), so place
    // each value by its absolute row number.
    onChunk: (chunk) => {
      chunk.columnData.forEach((value, i) => {
        const at = chunk.rowStart + i - rowStart;
        if (at >= 0 && at < values.length) values[at] = value;
      });
    },
  });
  return values;
}

async function keptIds(db: GrrrDb): Promise<Set<number>> {
  const { results } = await db
    .prepare('SELECT id FROM grrr_basins')
    .all<{ id: number }>();
  return new Set(results.map((r) => r.id));
}

async function runBatches(
  db: GrrrDb,
  statements: GrrrStatement[],
): Promise<void> {
  for (let i = 0; i < statements.length; i += 500) {
    await db.batch(statements.slice(i, i + 500));
  }
}

async function returnPeriodStep(db: GrrrDb, index: number): Promise<void> {
  const start = index * RP_SLICE;
  const end = Math.min(start + RP_SLICE, BASINS);
  // One column at a time keeps memory low; '2.0' decides which rows stay.
  const rp2 = (await readColumn('2.0', start, end)) as number[];
  const keep = rp2.flatMap((value, i) => (value >= GRRR_MIN_RP2 ? [i] : []));
  if (keep.length === 0) return;
  const pick = async (column: string) => {
    const values = await readColumn(column, start, end);
    return keep.map((i) => values[i]);
  };
  const ids = (await pick('gauge_id')) as string[];
  const rp5 = (await pick('5.0')) as number[];
  const rp20 = (await pick('20.0')) as number[];
  const rp100 = (await pick('100.0')) as number[];
  const insert = db.prepare(
    'INSERT OR REPLACE INTO grrr_basins (id, rp2, rp5, rp20, rp100) VALUES (?, ?, ?, ?, ?)',
  );
  await runBatches(
    db,
    keep.map((i, k) =>
      insert.bind(
        Number(ids[k]!.slice(9)),
        Math.round(rp2[i]!),
        Math.round(rp5[k]!),
        Math.round(rp20[k]!),
        Math.round(rp100[k]!),
      ),
    ),
  );
}

async function rowStep(db: GrrrDb, index: number): Promise<void> {
  const kept = await keptIds(db);
  const bytes = decompress(
    await fetchBytes(`${BASE}/reanalysis/streamflow.zarr/gauge_id/c/${index}`),
  );
  const count = Math.min(ROW_CHUNK, BASINS - index * ROW_CHUNK);
  const update = db.prepare('UPDATE grrr_basins SET row = ? WHERE id = ?');
  const statements: GrrrStatement[] = [];
  for (let i = 0; i < count; i++) {
    const id = grrrIdFromUtf32(bytes, i * 76);
    if (kept.has(id)) statements.push(update.bind(index * ROW_CHUNK + i, id));
  }
  await runBatches(db, statements);
}

async function outletStep(db: GrrrDb, index: number): Promise<void> {
  const kept = await keptIds(db);
  const store = `${BASE}/subhybas_outlet_locations_UNOFFICIAL.zarr`;
  const ids = grrrIdsFromVlen(
    bloscLz4Decode(await fetchBytes(`${store}/gauge_id/${index}`)),
  );
  const matches = ids.flatMap((id, i) =>
    kept.has(id) ? [{ id, at: index * OUTLET_ID_CHUNK + i }] : [],
  );
  const chunks = new Map<number, { lat: Float64Array; lon: Float64Array }>();
  const update = db.prepare(
    'UPDATE grrr_basins SET lon = ?, lat = ? WHERE id = ?',
  );
  const statements: GrrrStatement[] = [];
  for (const { id, at } of matches) {
    const c = Math.floor(at / OUTLET_POINT_CHUNK);
    if (!chunks.has(c)) {
      const read = async (name: string) => {
        const raw = bloscLz4Decode(await fetchBytes(`${store}/${name}/${c}`));
        return new Float64Array(raw.buffer, raw.byteOffset, raw.byteLength / 8);
      };
      chunks.set(c, {
        lat: await read('latitude'),
        lon: await read('longitude'),
      });
    }
    const point = chunks.get(c)!;
    const lat = point.lat[at % OUTLET_POINT_CHUNK]!;
    const lon = point.lon[at % OUTLET_POINT_CHUNK]!;
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      statements.push(
        update.bind(
          Math.round(lon * 1000) / 1000,
          Math.round(lat * 1000) / 1000,
          id,
        ),
      );
    }
  }
  await runBatches(db, statements);
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS grrr_basins (
    id INTEGER PRIMARY KEY, row INTEGER, lon REAL, lat REAL,
    rp2 INTEGER NOT NULL, rp5 INTEGER NOT NULL, rp20 INTEGER NOT NULL, rp100 INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS grrr_ingest (
    dataset TEXT PRIMARY KEY, next_step INTEGER NOT NULL
  )`,
];

/** True when every step of the current dataset is done. */
export async function grrrIngestDone(db: GrrrDb): Promise<boolean> {
  await db.batch(SCHEMA.map((sql) => db.prepare(sql)));
  const state = await db
    .prepare('SELECT next_step FROM grrr_ingest WHERE dataset = ?')
    .bind(GRRR_DATASET)
    .first<{ next_step: number }>();
  return (state?.next_step ?? 0) >= GRRR_INGEST_STEPS;
}

/** Runs ingest steps until all are done or `budgetMs` has passed. */
export async function runGrrrIngest(
  db: GrrrDb,
  budgetMs: number,
): Promise<{ next: number; total: number }> {
  if (await grrrIngestDone(db))
    return { next: GRRR_INGEST_STEPS, total: GRRR_INGEST_STEPS };
  const state = await db
    .prepare('SELECT next_step FROM grrr_ingest WHERE dataset = ?')
    .bind(GRRR_DATASET)
    .first<{ next_step: number }>();
  let next = state?.next_step ?? 0;
  if (!state) {
    // A new dataset version starts from an empty table.
    await db.batch([
      db.prepare('DELETE FROM grrr_basins'),
      db.prepare('DELETE FROM grrr_ingest'),
      db
        .prepare('INSERT INTO grrr_ingest (dataset, next_step) VALUES (?, 0)')
        .bind(GRRR_DATASET),
    ]);
  }
  const started = Date.now();
  let step = grrrIngestStep(next);
  while (step && Date.now() - started < budgetMs) {
    if (step.kind === 'rp') await returnPeriodStep(db, step.index);
    else if (step.kind === 'row') await rowStep(db, step.index);
    else await outletStep(db, step.index);
    next += 1;
    await db
      .prepare('UPDATE grrr_ingest SET next_step = ? WHERE dataset = ?')
      .bind(next, GRRR_DATASET)
      .run();
    step = grrrIngestStep(next);
  }
  return { next, total: GRRR_INGEST_STEPS };
}
