import { describe, expect, it } from 'vite-plus/test';
import {
  formatGrrrPosition,
  grrrAnnualPeaks,
  grrrBasinsFromResponse,
  grrrReachedPeriod,
  grrrYearValues,
} from '../../app/utils/grrr';
import type { GrrrBasin } from '../../app/types/grrr';

const basin: GrrrBasin = {
  id: 2120476740,
  row: 332599,
  position: [16.469, 48.185],
  rp2: 100,
  rp5: 200,
  rp20: 300,
  rp100: 400,
};

describe('grrrBasinsFromResponse', () => {
  it('reads basin i from index i of every column', () => {
    const basins = grrrBasinsFromResponse({
      count: 2,
      id: [11, 22],
      row: [5, 9],
      lon: [1.5, -2.5],
      lat: [3.5, -4.5],
      rp2: [10, 20],
      rp5: [11, 21],
      rp20: [12, 22],
      rp100: [13, 23],
    });
    expect(basins[1]).toEqual({
      id: 22,
      row: 9,
      position: [-2.5, -4.5],
      rp2: 20,
      rp5: 21,
      rp20: 22,
      rp100: 23,
    });
  });
});

describe('grrrReachedPeriod', () => {
  it('returns the largest return period reached', () => {
    expect(grrrReachedPeriod(basin, 99)).toBeNull();
    expect(grrrReachedPeriod(basin, 100)).toBe('rp2');
    expect(grrrReachedPeriod(basin, 250)).toBe('rp5');
    expect(grrrReachedPeriod(basin, 300)).toBe('rp20');
    expect(grrrReachedPeriod(basin, 1000)).toBe('rp100');
  });
});

describe('grrrAnnualPeaks', () => {
  it('drops the partial first day, takes the max per year, skips nulls', () => {
    // 1980-12-31, then all of 1981 (365 days), then 1982-01-01 and 01-02.
    const values: (number | null)[] = [
      999,
      ...new Array(365).fill(50),
      120,
      null,
    ];
    values[1 + 40] = 250; // 1981-02-10
    const peaks = grrrAnnualPeaks(basin, '1980-12-31', values);
    expect(peaks).toEqual([
      { year: 1981, peak: 250, reached: 'rp5' },
      { year: 1982, peak: 120, reached: 'rp2' },
    ]);
  });
});

describe('grrrYearValues', () => {
  it('returns the days of one year with their day-of-year index', () => {
    const values: (number | null)[] = [7, 1, 2, null, 4];
    // start 1980-12-31: index 1 is 1981-01-01.
    expect(grrrYearValues('1980-12-31', values, 1981)).toEqual([
      { day: 0, value: 1 },
      { day: 1, value: 2 },
      { day: 3, value: 4 },
    ]);
  });
});

describe('formatGrrrPosition', () => {
  it('writes hemispheres instead of signs', () => {
    expect(formatGrrrPosition([16.46875, 48.185417])).toBe(
      '48.185° N, 16.469° E',
    );
    expect(formatGrrrPosition([-58.4, -34.6])).toBe('34.600° S, 58.400° W');
  });
});
