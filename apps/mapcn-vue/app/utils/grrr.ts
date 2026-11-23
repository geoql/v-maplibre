import type {
  GrrrAnnualPeak,
  GrrrBasin,
  GrrrBasinsFile,
  GrrrDailyValue,
  GrrrReturnPeriod,
} from '~/types/grrr';

const DAY_MS = 86_400_000;

/**
 * Map colour classes by 2-year flood discharge (m³/s). Data encoding, not
 * UI chrome: the hues stay readable on the light and the dark basemap.
 */
export const GRRR_FLOW_CLASSES = [
  { min: 100_000, label: '≥ 100k m³/s', rgb: [214, 84, 200] },
  { min: 20_000, label: '20k – 100k', rgb: [124, 92, 240] },
  { min: 5_000, label: '5k – 20k', rgb: [59, 140, 235] },
  { min: 0, label: '1.5k – 5k', rgb: [94, 204, 230] },
] as const;

export function grrrFlowColor(rp2: number): [number, number, number, number] {
  const flowClass =
    GRRR_FLOW_CLASSES.find((c) => rp2 >= c.min) ?? GRRR_FLOW_CLASSES[3];
  return [...flowClass.rgb, 210];
}

/** Point radius in pixels: 1 for the smallest basins, about 4.5 for the Amazon. */
export function grrrFlowRadius(rp2: number): number {
  return 1 + Math.max(0, Math.log10(rp2) - 3.17) * 1.5;
}
const RETURN_PERIODS: GrrrReturnPeriod[] = ['rp100', 'rp20', 'rp5', 'rp2'];

/** Turns the parallel arrays of basins.json into one object per basin. */
export function grrrBasinsFromFile(file: GrrrBasinsFile): GrrrBasin[] {
  return file.id.map((id, i) => ({
    id,
    row: file.row[i]!,
    position: [file.lon[i]!, file.lat[i]!],
    rp2: file.rp2[i]!,
    rp5: file.rp5[i]!,
    rp20: file.rp20[i]!,
    rp100: file.rp100[i]!,
  }));
}

/** The largest return period that `value` reaches, or null. */
export function grrrReachedPeriod(
  basin: GrrrBasin,
  value: number,
): GrrrReturnPeriod | null {
  return RETURN_PERIODS.find((period) => value >= basin[period]) ?? null;
}

/** UTC year of the value at `index` in a daily series starting at `start`. */
function yearAt(startMs: number, index: number): number {
  return new Date(startMs + index * DAY_MS).getUTCFullYear();
}

/**
 * Highest daily value per calendar year. Years with no value are left out;
 * the first year is left out when the series starts after 1 January.
 */
export function grrrAnnualPeaks(
  basin: GrrrBasin,
  start: string,
  values: (number | null)[],
): GrrrAnnualPeak[] {
  const startMs = Date.parse(`${start}T00:00:00Z`);
  const firstFullYear =
    new Date(startMs).getUTCDate() === 1 &&
    new Date(startMs).getUTCMonth() === 0
      ? yearAt(startMs, 0)
      : yearAt(startMs, 0) + 1;
  const peaks = new Map<number, number>();
  values.forEach((value, index) => {
    if (value === null) return;
    const year = yearAt(startMs, index);
    if (year < firstFullYear) return;
    peaks.set(year, Math.max(peaks.get(year) ?? -Infinity, value));
  });
  return [...peaks].map(([year, peak]) => ({
    year,
    peak,
    reached: grrrReachedPeriod(basin, peak),
  }));
}

/** The daily values of one calendar year (missing days are left out). */
export function grrrYearValues(
  start: string,
  values: (number | null)[],
  year: number,
): GrrrDailyValue[] {
  const startMs = Date.parse(`${start}T00:00:00Z`);
  const yearMs = Date.UTC(year, 0, 1);
  const first = Math.round((yearMs - startMs) / DAY_MS);
  const days = Math.round((Date.UTC(year + 1, 0, 1) - yearMs) / DAY_MS);
  const out: GrrrDailyValue[] = [];
  for (let day = 0; day < days; day++) {
    const value = values[first + day];
    if (value !== null && value !== undefined) out.push({ day, value });
  }
  return out;
}

/** "48.185° N, 16.469° E" */
export function formatGrrrPosition([lon, lat]: [number, number]): string {
  const ns = `${Math.abs(lat).toFixed(3)}° ${lat >= 0 ? 'N' : 'S'}`;
  const ew = `${Math.abs(lon).toFixed(3)}° ${lon >= 0 ? 'E' : 'W'}`;
  return `${ns}, ${ew}`;
}
