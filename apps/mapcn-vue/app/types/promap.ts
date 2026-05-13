import type { LngLatBounds } from 'maplibre-gl';

// ── Server API contract (shared by route + composable) ──────────────────────
/**
 * One row in the `promap` D1 table — exactly mirrors the DB schema.
 * Source of truth for the wire format between
 * `server/routes/api/promap.get.ts` and `app/composables/use-promap-data.ts`.
 */
export interface PromapRow {
  zip: string;
  lat: number;
  lng: number;
  price: number;
  size_rank: number;
  population: number;
  city: string;
  state: string;
  metro: string;
  /** 3-month price change percentage (integer, e.g., 3 = 3%) */
  p3: number;
  /** 6-month price change percentage (integer) */
  p6: number;
  /** 1-year price change percentage (integer) */
  p1: number;
}

/** Response envelope from `GET /api/promap?bbox=…&limit=…`. */
export interface PromapApiResponse {
  total: number;
  truncated: boolean;
  rows: PromapRow[];
}

// ── Processed data point for rendering ──────────────────────────────────────
/** A single ZIP code data point for the ProMap visualization */
export interface ZipDataPoint {
  zip: string;
  coordinates: readonly [number, number];
  population: number;
  price: number;
  /** Year-over-year price change as decimal (e.g., 0.05 = +5%) */
  priceChange: number;
  city: string;
  state: string;
  metro: string;
}

/** Computed per-point rendering data (color + radius based on current mode/viewport) */
export interface ZipRenderPoint {
  coordinates: readonly [number, number];
  radius: number;
  fillColor: [number, number, number, number];
  data: ZipDataPoint;
}

/** Map view mode — Levels shows absolute prices, Changes shows YoY change */
export type ViewMode = 'levels' | 'changes';

/** Quintile bucket for color classification */
export interface QuintileBucket {
  min: number;
  max: number;
  color: [number, number, number];
  label: string;
}

/** Viewport bounds for LocalView filtering */
export interface ViewportBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

/** Stats computed for the currently visible viewport */
export interface ViewportStats {
  count: number;
  medianPrice: number;
  avgChange: number;
  minPrice: number;
  maxPrice: number;
}

/** Search result from the ZIP dataset */
export interface PromapSearchResult {
  zip: string;
  city: string;
  state: string;
  coordinates: readonly [number, number];
  price: number;
  priceChange: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
/** Convert MapLibre LngLatBounds to the wire ViewportBounds shape. */
export function boundsToViewport(bounds: LngLatBounds): ViewportBounds {
  return {
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth(),
  };
}
