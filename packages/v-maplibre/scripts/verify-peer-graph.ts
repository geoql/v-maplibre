/**
 * Chunk-graph guard for issues #114 and #187.
 *
 * The core entry (`dist/index.js`) must be installable with only vue,
 * maplibre-gl and pmtiles. This walks every chunk reachable from it through
 * static and dynamic imports and fails when an optional peer is reachable.
 * Server bundlers such as Nitro follow the same graph and refuse an import
 * they cannot resolve, so a hit here is a failed `nuxt build` for core-only
 * consumers.
 *
 * Usage: `node scripts/verify-peer-graph.ts [distDir]` (default `dist`).
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const OPTIONAL_PEERS = [
  '@deck.gl/core',
  '@deck.gl/layers',
  '@deck.gl/mapbox',
  '@deck.gl/aggregation-layers',
  '@deck.gl/geo-layers',
  '@deck.gl/mesh-layers',
  '@luma.gl/core',
  '@luma.gl/engine',
  '@luma.gl/shadertools',
  '@developmentseed/deck.gl-geotiff',
  '@developmentseed/deck.gl-raster',
  '@developmentseed/deck.gl-zarr',
  '@developmentseed/geotiff',
  '@developmentseed/proj',
  '@geoql/maplibre-gl-starfield',
  '@sparkjsdev/spark',
  '3d-tiles-renderer',
  '3d-tiles-rendererjs-3dgs-plugin',
  'apache-arrow',
  'gaussian-splat-lite',
  'maplibre-gl-lidar',
  'maplibre-gl-wind',
  'three',
  'zarrita',
];

const isOptionalPeer = (spec: string): boolean =>
  OPTIONAL_PEERS.some((peer) => spec === peer || spec.startsWith(`${peer}/`));

// Static `from '…'` and dynamic `import('…')`. The minifier writes specifiers
// with backticks (import(`@deck.gl/mapbox`)), so all three quote kinds count.
const SPEC_RE = /(?:from\s*|import\s*\(\s*)(["'`])([^"'`]+)\1/g;

const dist = resolve(process.argv[2] ?? 'dist');
const root = join(dist, 'index.js');

if (!existsSync(root)) {
  console.error(
    `[verify-peer-graph] missing ${root}: build the library first.`,
  );
  process.exit(2);
}

const visited = new Set<string>();
const queue = [root];
const violations: { file: string; spec: string }[] = [];

while (queue.length > 0) {
  const file = queue.shift()!;
  if (visited.has(file)) continue;
  visited.add(file);

  const code = readFileSync(file, 'utf8');
  for (const match of code.matchAll(SPEC_RE)) {
    const spec = match[2]!;
    if (isOptionalPeer(spec)) {
      violations.push({ file: relative(dist, file), spec });
    } else if (spec.startsWith('.')) {
      const target = resolve(dirname(file), spec);
      const candidate = target.endsWith('.js') ? target : `${target}.js`;
      if (existsSync(candidate)) queue.push(candidate);
    }
  }
}

if (violations.length > 0) {
  console.error(
    '[verify-peer-graph] FAIL: optional peers reachable from dist/index.js (core entry):',
  );
  for (const v of violations) console.error(`  ${v.file} -> ${v.spec}`);
  console.error(
    `\nScanned ${visited.size} chunk(s). The core entry may only reference vue / maplibre-gl / pmtiles.`,
  );
  process.exit(1);
}

console.log(
  `[verify-peer-graph] PASS: no optional peers reachable from dist/index.js (scanned ${visited.size} chunk(s)).`,
);
