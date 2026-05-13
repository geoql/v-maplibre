import type { PromapApiResponse, PromapRow } from '~/types/promap';
import type {
  D1Database,
  PromapQuery,
} from '~~/apps/mapcn-vue/server/types/promap';

defineRouteMeta({
  openAPI: {
    description:
      'Viewport-bounded ProMap query. Returns up to `limit` ZIP-level rows ' +
      'inside the given bbox, sorted by size_rank ASC (biggest cities first).',
    parameters: [
      {
        name: 'bbox',
        in: 'query',
        required: false,
        schema: { type: 'string' },
        description:
          'Comma-separated `west,south,east,north`. Defaults to continental US.',
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: { type: 'integer', minimum: 1, maximum: 5000 },
        description: 'Max rows returned. Default 5000.',
      },
    ],
  },
});

const MAX_LIMIT = 5000;
const DEFAULT_LIMIT = 5000;

const CONTINENTAL_US: [number, number, number, number] = [-130, 20, -60, 55];

const COUNT_QUERY = 'SELECT COUNT(*) AS total FROM promap';

// Compound (lat, lng) B-tree index is used by SQLite's query planner; the
// LIMIT + ORDER BY size_rank ASC yields "biggest cities first" at low zoom.
const BBOX_QUERY = `
  SELECT zip, lat, lng, price, size_rank, population, city, state, metro, p3, p6, p1
  FROM promap
  WHERE lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?
  ORDER BY size_rank ASC
  LIMIT ?
`;

function validateQuery(data: unknown): PromapQuery {
  const obj = (data ?? {}) as Record<string, unknown>;

  let bbox: [number, number, number, number] = CONTINENTAL_US;
  if (typeof obj.bbox === 'string') {
    const parts = obj.bbox.split(',').map(Number);
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      bbox = parts as [number, number, number, number];
    }
  }

  const rawLimit = Number(obj.limit);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number.isFinite(rawLimit) ? rawLimit : DEFAULT_LIMIT),
  );

  return { bbox, limit };
}

async function queryD1(
  db: D1Database,
  bbox: [number, number, number, number],
  limit: number,
): Promise<PromapApiResponse> {
  const [west, south, east, north] = bbox;
  const total = (await db.prepare(COUNT_QUERY).first<number>('total')) ?? 0;
  const { results } = await db
    .prepare(BBOX_QUERY)
    .bind(south, north, west, east, limit)
    .all<PromapRow>();
  return {
    total,
    truncated: results.length === limit,
    rows: results,
  };
}

async function querySqlite(
  bbox: [number, number, number, number],
  limit: number,
): Promise<PromapApiResponse> {
  const { default: Database } = await import('better-sqlite3');
  const { resolve } = await import('node:path');
  const { readdir } = await import('node:fs/promises');

  const dbDir = resolve(
    process.cwd(),
    '.wrangler/state/v3/d1/miniflare-D1DatabaseObject',
  );
  const files = await readdir(dbDir).catch(() => [] as string[]);
  const sqliteFile = files.find((f) => f.endsWith('.sqlite'));

  if (!sqliteFile) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Local D1 database not initialised',
      message:
        'No local D1 sqlite file found. Apply the schema + seed first — see apps/mapcn-vue/server/db/README.md.',
    });
  }

  const db = new Database(resolve(dbDir, sqliteFile), { readonly: true });
  try {
    const [west, south, east, north] = bbox;
    const totalRow = db.prepare(COUNT_QUERY).get() as { total: number };
    const rows = db
      .prepare(BBOX_QUERY)
      .all(south, north, west, east, limit) as PromapRow[];
    return {
      total: totalRow.total,
      truncated: rows.length === limit,
      rows,
    };
  } finally {
    db.close();
  }
}

function isHttpError(err: unknown): err is { statusCode: number } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'statusCode' in err &&
    typeof (err as { statusCode: unknown }).statusCode === 'number'
  );
}

export default defineEventHandler(async (event): Promise<PromapApiResponse> => {
  const { bbox, limit } = await getValidatedQuery(event, validateQuery);

  const d1 = event.context.cloudflare?.env?.DB as D1Database | undefined;

  try {
    if (d1) return await queryD1(d1, bbox, limit);
    return await querySqlite(bbox, limit);
  } catch (err) {
    if (isHttpError(err)) throw err;
    const message =
      err instanceof Error ? err.message : 'Failed to query promap dataset';
    throw createError({
      statusCode: 500,
      statusMessage: 'ProMap query failed',
      message,
    });
  }
});
