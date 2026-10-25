import type { ExpressionSpecification } from 'maplibre-gl';
import type { KoppenClassesIndex } from '~/types/climate';

/**
 * Köppen-Geiger classes with official colors from Beck et al. (2023) legend.txt.
 *
 * Class ID is the integer pixel value in `koppen_geiger_*.tif` and matches
 * `koppen_class` in `country-zones.geojson`.
 *
 * Color scheme is AUTHORITATIVE — do not adapt to semantic tokens or design
 * system palettes. These are the canonical Beck et al. colors.
 */
export const KOPPEN_CLASSES: KoppenClassesIndex = {
  1: { symbol: 'Af', name: 'Tropical, rainforest', color: 'rgb(0, 0, 255)' },
  2: { symbol: 'Am', name: 'Tropical, monsoon', color: 'rgb(0, 120, 255)' },
  3: { symbol: 'Aw', name: 'Tropical, savannah', color: 'rgb(70, 170, 250)' },
  4: { symbol: 'BWh', name: 'Arid, desert, hot', color: 'rgb(255, 0, 0)' },
  5: { symbol: 'BWk', name: 'Arid, desert, cold', color: 'rgb(255, 150, 150)' },
  6: { symbol: 'BSh', name: 'Arid, steppe, hot', color: 'rgb(245, 165, 0)' },
  7: { symbol: 'BSk', name: 'Arid, steppe, cold', color: 'rgb(255, 220, 100)' },
  8: {
    symbol: 'Csa',
    name: 'Temperate, dry summer, hot summer',
    color: 'rgb(255, 255, 0)',
  },
  9: {
    symbol: 'Csb',
    name: 'Temperate, dry summer, warm summer',
    color: 'rgb(200, 200, 0)',
  },
  10: {
    symbol: 'Csc',
    name: 'Temperate, dry summer, cold summer',
    color: 'rgb(150, 150, 0)',
  },
  11: {
    symbol: 'Cwa',
    name: 'Temperate, dry winter, hot summer',
    color: 'rgb(150, 255, 150)',
  },
  12: {
    symbol: 'Cwb',
    name: 'Temperate, dry winter, warm summer',
    color: 'rgb(100, 200, 100)',
  },
  13: {
    symbol: 'Cwc',
    name: 'Temperate, dry winter, cold summer',
    color: 'rgb(50, 150, 50)',
  },
  14: {
    symbol: 'Cfa',
    name: 'Temperate, no dry season, hot summer',
    color: 'rgb(200, 255, 80)',
  },
  15: {
    symbol: 'Cfb',
    name: 'Temperate, no dry season, warm summer',
    color: 'rgb(100, 255, 80)',
  },
  16: {
    symbol: 'Cfc',
    name: 'Temperate, no dry season, cold summer',
    color: 'rgb(50, 200, 0)',
  },
  17: {
    symbol: 'Dsa',
    name: 'Cold, dry summer, hot summer',
    color: 'rgb(255, 0, 255)',
  },
  18: {
    symbol: 'Dsb',
    name: 'Cold, dry summer, warm summer',
    color: 'rgb(200, 0, 200)',
  },
  19: {
    symbol: 'Dsc',
    name: 'Cold, dry summer, cold summer',
    color: 'rgb(150, 50, 150)',
  },
  20: {
    symbol: 'Dsd',
    name: 'Cold, dry summer, very cold winter',
    color: 'rgb(150, 100, 150)',
  },
  21: {
    symbol: 'Dwa',
    name: 'Cold, dry winter, hot summer',
    color: 'rgb(170, 175, 255)',
  },
  22: {
    symbol: 'Dwb',
    name: 'Cold, dry winter, warm summer',
    color: 'rgb(90, 120, 220)',
  },
  23: {
    symbol: 'Dwc',
    name: 'Cold, dry winter, cold summer',
    color: 'rgb(75, 80, 180)',
  },
  24: {
    symbol: 'Dwd',
    name: 'Cold, dry winter, very cold winter',
    color: 'rgb(50, 0, 135)',
  },
  25: {
    symbol: 'Dfa',
    name: 'Cold, no dry season, hot summer',
    color: 'rgb(0, 255, 255)',
  },
  26: {
    symbol: 'Dfb',
    name: 'Cold, no dry season, warm summer',
    color: 'rgb(55, 200, 255)',
  },
  27: {
    symbol: 'Dfc',
    name: 'Cold, no dry season, cold summer',
    color: 'rgb(0, 125, 125)',
  },
  28: {
    symbol: 'Dfd',
    name: 'Cold, no dry season, very cold winter',
    color: 'rgb(0, 70, 95)',
  },
  29: { symbol: 'ET', name: 'Polar, tundra', color: 'rgb(178, 178, 178)' },
  30: { symbol: 'EF', name: 'Polar, frost', color: 'rgb(102, 102, 102)' },
} as const;

/**
 * Pick black or white text color for a given rgb() background.
 * Uses rec.709 relative luminance: luminance > 0.6 → dark text (#111),
 * otherwise light text (#fff).
 */
export function pickTextColor(rgbStr: string): '#111' | '#fff' {
  const match = rgbStr.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!match) return '#111';
  const r = Number(match[1]);
  const g = Number(match[2]);
  const b = Number(match[3]);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.6 ? '#111' : '#fff';
}

/**
 * Build a MapLibre `fill-color` expression that maps `koppen_class` property
 * to the canonical Köppen color. Unknown classes fall back to `#cccccc`.
 */
export function buildFillColorExpression(): ExpressionSpecification {
  const FALLBACK = '#cccccc';
  const [first, ...others] = Object.entries(KOPPEN_CLASSES);
  if (!first) return ['to-color', FALLBACK];
  return [
    'match',
    ['get', 'koppen_class'],
    Number(first[0]),
    first[1].color,
    ...others.flatMap(([id, cls]) => [Number(id), cls.color]),
    FALLBACK,
  ];
}

/**
 * Format a fraction (0–1) as a human-readable percentage string.
 * Values ≥ 0.1 get integer %, smaller values get 1 decimal place,
 * and microscopic values get "<1".
 */
export function formatPct(fraction: number): string {
  if (fraction >= 0.1) return `${(fraction * 100).toFixed(0)}`;
  if (fraction >= 0.005) return `${(fraction * 100).toFixed(1)}`;
  return '<1';
}
