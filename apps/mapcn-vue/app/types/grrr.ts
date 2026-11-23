/** The `/api/grrr/<row>` response; defined once, next to the route. */
export type { GrrrSeries } from '~~/server/types/grrr';

/** public/data/grrr/basins.json: parallel arrays, one index per basin. */
export interface GrrrBasinsFile {
  source: string;
  minRp2: number;
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

export interface GrrrBasin {
  /** The number in "subhybas_<id>". */
  id: number;
  /** Row in reanalysis/streamflow.zarr; the key for /api/grrr/<row>. */
  row: number;
  position: [number, number];
  /** Return-period discharge in m³/s. */
  rp2: number;
  rp5: number;
  rp20: number;
  rp100: number;
}

export type GrrrReturnPeriod = 'rp2' | 'rp5' | 'rp20' | 'rp100';

export interface GrrrAnnualPeak {
  year: number;
  /** Highest daily mean discharge of the year in m³/s. */
  peak: number;
  /** The largest return period the peak reached, or null. */
  reached: GrrrReturnPeriod | null;
}

export interface GrrrDailyValue {
  /** Day of the year, 0-based. */
  day: number;
  value: number;
}
