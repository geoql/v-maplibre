#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// One-shot seed generator: vendored JSON → SQL INSERTs.
//
// Reads the legacy `public/data/promap-data.json` (kept in repo only until
// this seed is committed) and emits `server/db/promap-seed.sql` — batched,
// idempotent, ready for `wrangler d1 execute --file`.
//
// Run:  node apps/mapcn-vue/server/db/generate-seed.mjs
//
// Maintainer-only. After the first run, the script can stay in tree as a
// reference for future re-seeds, OR be deleted entirely (the seed.sql is the
// source of truth from then on).
// ─────────────────────────────────────────────────────────────────────────────

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT = resolve(__dirname, '../../public/data/promap-data.json');
const OUTPUT = resolve(__dirname, 'promap-seed.sql');

// 100 rows per INSERT keeps each statement well under D1's 100 KB statement cap
// (12 cols × 100 rows × ~25 B/value ≈ 30 KB).
const BATCH_SIZE = 100;

/** Escape a string for SQLite literal — double single quotes. */
function quote(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

async function main() {
  const raw = await readFile(INPUT, 'utf-8');
  const records = JSON.parse(raw);
  if (!Array.isArray(records))
    throw new Error('Expected an array of records in promap-data.json');

  const out = [];
  out.push(
    '-- ─────────────────────────────────────────────────────────────────────────',
  );
  out.push('-- ProMap seed, auto-generated from public/data/promap-data.json');
  out.push('-- DO NOT EDIT BY HAND. Regenerate via:');
  out.push('--   node apps/mapcn-vue/server/db/generate-seed.mjs');
  out.push('--');
  out.push('-- Apply (idempotent: clears existing rows before inserting):');
  out.push(
    '--   wrangler d1 execute mapcn-vue-db --local  --file=server/db/promap-seed.sql',
  );
  out.push(
    '--   wrangler d1 execute mapcn-vue-db --remote --file=server/db/promap-seed.sql',
  );
  out.push(
    '-- ─────────────────────────────────────────────────────────────────────────',
  );
  out.push('');
  out.push('DELETE FROM promap;');
  out.push('');

  const COLS =
    'INSERT INTO promap (zip, lat, lng, price, size_rank, population, city, state, metro, p3, p6, p1) VALUES';

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const values = batch
      .map(
        (r) =>
          `(${quote(r.z)}, ${r.lat}, ${r.lon}, ${r.price}, ${r.r}, ${r.pop}, ${quote(r.n)}, ${quote(r.s)}, ${quote(r.m)}, ${r.p3}, ${r.p6}, ${r.p1})`,
      )
      .join(',\n  ');
    out.push(`${COLS}\n  ${values};`);
    out.push('');
  }

  const text = out.join('\n');
  await writeFile(OUTPUT, text, 'utf-8');

  const sizeMB = (text.length / 1024 / 1024).toFixed(2);
  console.log(`✓ Wrote ${records.length.toLocaleString()} rows → ${OUTPUT}`);
  console.log(
    `  ${Math.ceil(records.length / BATCH_SIZE).toLocaleString()} INSERT statements, ${sizeMB} MB total`,
  );
}

main().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
