# ProMap D1 Database — Contributor Guide

The `/examples/promap` page is backed by a **Cloudflare D1** database
holding ~26 k US ZIP-level home-price + population rows. This directory is the
single source of truth for that database — schema, seed, and the one-shot
generator that converts the legacy vendored JSON into idempotent SQL.

If you are **forking the repo** or **running this app on your own Cloudflare
account**, follow the steps below to bring up a working D1 database. The
GeoQL-hosted D1 (`mapcn-vue-db`, id `bca564a0-d024-4ae9-91ee-4d92e7e81402`)
is private — you will need your own.

---

## Files in this directory

| File                | Purpose                                                                  |
| ------------------- | ------------------------------------------------------------------------ |
| `promap-schema.sql` | `CREATE TABLE` + indexes. Idempotent. Apply once per fresh database.     |
| `promap-seed.sql`   | `DELETE FROM promap` + 263 batched `INSERT`s (2.5 MB, 26 243 rows).      |
| `generate-seed.ts`  | One-shot maintainer script. Regenerates `promap-seed.sql` from upstream. |
| `README.md`         | This file.                                                               |

---

## Quick start (local dev, fresh clone)

The local development server uses **Miniflare's in-process D1 emulator**, which
is a real SQLite file under `apps/mapcn-vue/.wrangler/state/`. No CF account
required.

```bash
# 1. From the repo root, install deps if you haven't already
pnpm install

# 2. Build once — generates .output/server/wrangler.json, the single source
#    of truth for bindings (there is no hand-maintained wrangler.json; the
#    config lives in nuxt.config.ts under nitro.cloudflare.wrangler)
cd apps/mapcn-vue
pnpm run build

# 3. Seed the local D1 emulator (one-time)
pnpm exec wrangler d1 execute mapcn-vue-db --local --config .output/server/wrangler.json --file=server/db/promap-schema.sql
pnpm exec wrangler d1 execute mapcn-vue-db --local --config .output/server/wrangler.json --file=server/db/promap-seed.sql

# 4. Verify it worked
pnpm exec wrangler d1 execute mapcn-vue-db --local --config .output/server/wrangler.json --command 'SELECT COUNT(*) AS total FROM promap'
# → total: 26243

# 5. Run the dev server
pnpm run dev:host    # http://localhost:3000/examples/promap
```

The dev server route `/api/promap` falls back to reading the Miniflare SQLite
file directly via `better-sqlite3` when no `cloudflare.env.DB` binding is
present — see [`../routes/api/promap.get.ts`](../routes/api/promap.get.ts).

---

## Deploying to your own Cloudflare account

### Step 1 — Create a D1 database in your account

```bash
cd apps/mapcn-vue
pnpm exec wrangler d1 create mapcn-vue-db
```

Wrangler will print a `database_id`. Copy it.

### Step 2 — Update `nuxt.config.ts`

Replace the `database_id` in `apps/mapcn-vue/nuxt.config.ts` under
`nitro.cloudflare.wrangler.d1_databases[0]` with the value you just got.
**Do not commit this change back to the upstream repo** — it points your
fork to your D1, not GeoQL's.

```ts
d1_databases: [
  {
    binding: 'DB',
    database_name: 'mapcn-vue-db',
    database_id: '<your-uuid-here>',
  },
],
```

### Step 3 — Apply the schema + seed to your remote D1

```bash
pnpm exec wrangler d1 execute mapcn-vue-db --remote --file=server/db/promap-schema.sql
pnpm exec wrangler d1 execute mapcn-vue-db --remote --file=server/db/promap-seed.sql
```

The seed takes ~30 seconds (263 batched INSERTs, each well under D1's 100 KB
statement limit). Cloudflare's free D1 tier accommodates this dataset
comfortably:

| Constraint           | Free tier limit | This dataset                  |
| -------------------- | --------------- | ----------------------------- |
| Database size        | 500 MB          | ~5 MB                         |
| Rows                 | unlimited       | 26 243                        |
| Read queries / day   | 5 M             | ≪ 5 M (one per viewport move) |
| Storage size per row | 2 MB            | ~150 bytes                    |
| Statement size       | 100 KB          | ~10 KB per batch              |

### Step 4 — Verify remote

```bash
pnpm exec wrangler d1 execute mapcn-vue-db --remote \
  --command 'SELECT zip, city, price FROM promap ORDER BY size_rank LIMIT 3'
```

You should see Katy TX, Lakewood NJ, Katy TX as the top three (by population).

### Step 5 — Deploy

```bash
cd ../..    # back to repo root
pnpm run build:mapcn
cd apps/mapcn-vue
pnpm exec wrangler deploy --config .output/server/wrangler.json
```

---

## API surface

`GET /api/promap?bbox=west,south,east,north&limit=5000`

- `bbox` (optional) — Comma-separated floats. Defaults to continental US
  (`-130,20,-60,55`).
- `limit` (optional) — Integer, 1–5000. Defaults to 5000.

Response:

```ts
interface PromapApiResponse {
  total: number; // total rows in DB (26243)
  truncated: boolean; // true if LIMIT was hit
  rows: PromapRow[]; // viewport-bounded rows, biggest cities first
}
```

The route uses `defineRouteMeta()` to publish OpenAPI metadata, which Nuxt
exposes at `/_nitro/openapi.json` (dev only).

---

## Regenerating the seed (rare — only when upstream data refreshes)

Zillow ZHVI updates monthly on the 16th. If you want fresher data than the
committed snapshot:

1. **Download upstream data**:
   - Zillow ZHVI ZIP-level metro CSV: <https://www.zillow.com/research/data/>
     ("Home Values" → "Median sale price" → "By ZIP Code")
   - US Census ZCTA centroids: <https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2020_Gazetteer/2020_Gaz_zcta_national.zip>
   - SimpleMaps US Zips: <https://simplemaps.com/data/us-zips> (free tier).
     **Must be downloaded through a real browser** — SimpleMaps sits behind
     Cloudflare Bot Fight Mode, so `curl` / `wget` / GitHub Actions get a 403.

2. **Join the three sources into a single JSON** in the legacy `RawZipRecord`
   shape (`z, lat, lon, price, r, pop, n, s, m, p3, p6, p1`). The original
   join script lived at `apps/mapcn-vue/scripts/prepare-promap-data.ts` but
   was deleted in the D1 migration — git history (`git log -p -- 'apps/mapcn-vue/scripts/'`)
   has the full implementation.

3. **Run the generator**:

   ```bash
   # Place the regenerated JSON at:
   #   apps/mapcn-vue/public/data/promap-data.json
   # (this path is referenced by generate-seed.ts and is gitignored after
   # the D1 migration — the file is purely a build input now)
   node apps/mapcn-vue/server/db/generate-seed.ts
   ```

4. **Re-apply the seed locally and remotely** using the wrangler commands above.

5. **Commit only `promap-seed.sql`** — never commit the JSON.

---

## Why D1 instead of the vendored JSON?

The previous architecture loaded the entire 5.6 MB JSON in a Web Worker on
every page visit, parsed it, then cached it in IndexedDB. Problems:

- **First-paint cost**: 5.6 MB over the wire, ~1.5 s parse on mid-range mobile.
- **Worker + IndexedDB**: 200+ lines of glue code (`promap.worker.ts`,
  `promap-cache.ts`) to manage what is fundamentally a read-only dataset.
- **Stale-cache invalidation**: TTL-based eviction, version mismatches.

D1 fixes all three:

- Viewport-bounded queries return ≤ 5000 rows (~250 KB JSON) — typically
  10–20 % of the legacy payload.
- The B-tree compound index on `(lat, lng)` makes bbox queries sub-millisecond
  on D1's SQLite engine.
- The composable becomes ~100 lines simpler — no Worker, no IndexedDB, no
  TTL handling.

The trade-off: client now does a small fetch on every map-move (debounced 250
ms). With p50 query latency under 50 ms on CF's edge, the UX is identical and
the cold-start is dramatically better.
