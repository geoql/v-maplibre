// ─────────────────────────────────────────────────────────────────────────────
// Server-only D1 binding types.
//
// The shared API contract types (PromapRow, PromapApiResponse) live in
// app/types/promap.ts so both the route handler and the composable import
// from a single source of truth at `~/types/promap`. This file only contains
// types that describe the D1 driver surface — server-internal, not used by
// client code.
// ─────────────────────────────────────────────────────────────────────────────

/** Subset of the Cloudflare D1 prepared-statement API used by this route. */
export interface BoundD1Client {
  bind: (...args: unknown[]) => BoundD1Client;
  all: <T>() => Promise<{ results: T[] }>;
  first: <T>(col?: string) => Promise<T | null>;
}

/** Subset of the Cloudflare D1 database API used by this route. */
export interface D1Database {
  prepare: (query: string) => BoundD1Client;
}

/** Validated query shape for `GET /api/promap`. */
export interface PromapQuery {
  bbox: [number, number, number, number];
  limit: number;
}
