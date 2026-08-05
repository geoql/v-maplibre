import type { H3Event } from 'h3';
import type {
  GroundsourceRow,
  GroundsourceApiResponse,
} from '../../types/groundsource';

const MAX_LIMIT = 500_000;
const DEFAULT_LIMIT = 500_000;
const LOCAL_DB_PATH = '/tmp/groundsource.db';

const DATA_QUERY =
  'SELECT id, lon, lat, area_km2, CAST(substr(start_date, 1, 4) AS INTEGER) AS start_year FROM events WHERE id > ? ORDER BY id LIMIT ?';
const COUNT_QUERY = 'SELECT COUNT(*) as total FROM events';

function buildResponse(
  rows: GroundsourceRow[],
  total: number,
  limit: number,
): GroundsourceApiResponse {
  const data: [number, number, number, number][] = rows.map((row) => [
    row.lon,
    row.lat,
    row.area_km2,
    row.start_year,
  ]);
  const lastRow = rows.at(-1);
  const nextCursor = rows.length === limit && lastRow ? lastRow.id : null;
  return { total, nextCursor, data };
}

async function queryD1(
  db: {
    prepare: (query: string) => {
      bind: (...args: unknown[]) => {
        all: <T>() => Promise<{ results: T[] }>;
        first: <T>(col?: string) => Promise<T | null>;
      };
      first: <T>(col?: string) => Promise<T | null>;
    };
  },
  cursor: number,
  limit: number,
): Promise<GroundsourceApiResponse> {
  const total = (await db.prepare(COUNT_QUERY).first<number>('total')) ?? 0;
  const { results } = await db
    .prepare(DATA_QUERY)
    .bind(cursor, limit)
    .all<GroundsourceRow>();
  return buildResponse(results, total, limit);
}

async function querySqlite(
  cursor: number,
  limit: number,
): Promise<GroundsourceApiResponse> {
  const { default: Database } = await import('better-sqlite3');
  const db = new Database(LOCAL_DB_PATH, { readonly: true });

  try {
    const countRow = db.prepare(COUNT_QUERY).get() as { total: number };
    const total = countRow.total;
    const rows = db.prepare(DATA_QUERY).all(cursor, limit) as GroundsourceRow[];
    return buildResponse(rows, total, limit);
  } finally {
    db.close();
  }
}

export default defineEventHandler(
  async (event: H3Event): Promise<GroundsourceApiResponse> => {
    const query = getQuery(event);
    const cursor = Math.max(0, Number(query.cursor) || 0);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Number(query.limit) || DEFAULT_LIMIT),
    );

    const d1 = event.context.cloudflare?.env?.DB;
    if (d1) {
      return queryD1(d1, cursor, limit);
    }

    return querySqlite(cursor, limit);
  },
);
