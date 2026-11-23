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
