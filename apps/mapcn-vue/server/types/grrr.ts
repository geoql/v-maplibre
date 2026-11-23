/** One basin's reanalysis streamflow, as `/api/grrr/<row>` returns it. */
export interface GrrrSeries {
  row: number;
  /** ISO date of `values[0]`; each next value is one day later. */
  start: string;
  /** Daily mean discharge in m³/s; `null` where the dataset has no value. */
  values: (number | null)[];
}

/** Fetches a URL and returns the response body. */
export type GrrrFetchBytes = (url: string) => Promise<Uint8Array>;

/** One unit of the D1 ingest (see server/utils/grrr-ingest.ts). */
export interface GrrrIngestStep {
  kind: 'rp' | 'row' | 'outlet';
  /** Parquet slice, streamflow gauge_id chunk, or outlet gauge_id chunk. */
  index: number;
}

/** `/api/grrr/basins`: parallel arrays, one index per basin. */
export interface GrrrBasinsResponse {
  count: number;
  id: number[];
  row: number[];
  lon: number[];
  lat: number[];
  rp2: number[];
  rp5: number[];
  rp20: number[];
  rp100: number[];
}

/** The part of a D1 prepared statement the GRRR ingest uses. */
export interface GrrrStatement {
  bind(...values: unknown[]): GrrrStatement;
  run(): Promise<unknown>;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
}

/** The part of the D1 binding the GRRR ingest uses. */
export interface GrrrDb {
  prepare(query: string): GrrrStatement;
  batch(statements: GrrrStatement[]): Promise<unknown>;
}
