/**
 * Cloudflare D1 type declarations for Nitro v2 (Nuxt 4).
 * Inline types to avoid requiring @cloudflare/workers-types as a dependency.
 */

interface D1Result<T> {
  results: T[];
  success: boolean;
  meta: {
    duration: number;
    changes_in: number;
    changes_out: number;
    last_row_id: number;
    served_by: string;
    internal_stats: unknown;
  };
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(column?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown[]>(): Promise<T[]>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1Result<unknown>>;
}

declare module 'h3' {
  interface H3EventContext {
    cloudflare: {
      env: {
        DB: D1Database;
        /** Per-IP limit of the demo-assets proxy (wrangler `ratelimits`). */
        DEMO_ASSETS_LIMITER?: {
          limit(options: { key: string }): Promise<{ success: boolean }>;
        };
      };
    };
  }
}

declare module 'better-sqlite3' {
  interface Statement {
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
    run(...params: unknown[]): {
      changes: number;
      lastInsertRowid: number | bigint;
    };
  }

  interface Database {
    prepare(sql: string): Statement;
    close(): void;
  }

  interface DatabaseConstructor {
    new (filename: string, options?: { readonly?: boolean }): Database;
  }

  const Database: DatabaseConstructor;
  export default Database;
}

export type { D1Database, D1PreparedStatement, D1Result };
