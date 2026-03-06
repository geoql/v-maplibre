import type { LngLatBounds } from 'maplibre-gl';
import type { DBSchema } from 'idb';

// ── Raw data from JSON (compact keys to minimize file size) ─────────────────
/** Raw record from the pre-processed promap-data.json */
export interface RawZipRecord {
  /** ZIP code string (5 chars) */
  z: string;
  /** Latitude (3 decimal places) */
  lat: number;
  /** Longitude (3 decimal places) */
  lon: number;
  /** Latest ZHVI median home value in USD */
  price: number;
  /** SizeRank */
  r: number;
  /** Population (0 if unknown) */
  pop: number;
  /** City name */
  n: string;
  /** Two-letter state code */
  s: string;
  /** Metro area name (empty string if N/A) */
  m: string;
  /** 3-month price change percentage (integer, e.g., 3 = 3%) */
  p3: number;
  /** 6-month price change percentage */
  p6: number;
  /** 1-year price change percentage */
  p1: number;
}

// ── Processed data point for rendering ──────────────────────────────────────
/** A single ZIP code data point for the ProMap visualization */
export interface ZipDataPoint {
  /** ZIP code string (e.g., "10001") */
  zip: string;
  /** [longitude, latitude] */
  coordinates: [number, number];
  /** Estimated population */
  population: number;
  /** Median home value in USD */
  price: number;
  /** Year-over-year price change as decimal (e.g., 0.05 = +5%) */
  priceChange: number;
  /** City/place name */
  city: string;
  /** Two-letter state code */
  state: string;
  /** Metro area name */
  metro: string;
}

/** Computed per-point rendering data (color + radius based on current mode/viewport) */
export interface ZipRenderPoint {
  coordinates: [number, number];
  radius: number;
  fillColor: [number, number, number, number];
  /** Reference to the source data point */
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
  coordinates: [number, number];
  price: number;
  priceChange: number;
}

// ── Web Worker message types ────────────────────────────────────────────────
export interface WorkerRequestInit {
  type: 'init';
  dataUrl: string;
}

export interface WorkerResponseProgress {
  type: 'progress';
  message: string;
}

export interface WorkerResponseData {
  type: 'data';
  points: ZipDataPoint[];
  version: string;
}

export interface WorkerResponseError {
  type: 'error';
  message: string;
}

export type WorkerRequest = WorkerRequestInit;
export type WorkerResponse =
  | WorkerResponseProgress
  | WorkerResponseData
  | WorkerResponseError;

// ── IndexedDB schema ────────────────────────────────────────────────────────
export interface PromapDB extends DBSchema {
  'promap-data': {
    key: string;
    value: {
      version: string;
      points: ZipDataPoint[];
      timestamp: number;
    };
  };
}

/** Name for the promap IDB database */
export const PROMAP_DB_NAME = 'promap-cache';
/** Version for the promap IDB database */
export const PROMAP_DB_VERSION = 1;
/** Key for the cached data store */
export const PROMAP_CACHE_KEY = 'dataset';
/** Cache TTL: 30 days (data updates monthly on the 16th) */
export const PROMAP_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Convert MapLibre LngLatBounds to ViewportBounds */
export function boundsToViewport(bounds: LngLatBounds): ViewportBounds {
  return {
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth(),
  };
}
