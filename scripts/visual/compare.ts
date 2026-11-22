/**
 * Compare two screenshot folders made by capture.ts.
 *
 * Usage: node scripts/visual/compare.ts <dirA> <dirB> [--threshold 0.001]
 * Prints the share of differing pixels per file and exits 1 when any file
 * differs by more than the threshold, has a different size, or is missing.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const args = process.argv.slice(2);
const flag = args.indexOf('--threshold');
const threshold = flag === -1 ? 0.001 : Number(args[flag + 1]);
const [dirA, dirB] =
  flag === -1 ? args : args.filter((_, i) => i !== flag && i !== flag + 1);
if (!dirA || !dirB || Number.isNaN(threshold)) {
  console.error('usage: compare.ts <dirA> <dirB> [--threshold 0.001]');
  process.exit(2);
}

let failed = false;
for (const name of readdirSync(dirA).filter((f) => f.endsWith('.png'))) {
  let b: PNG;
  try {
    b = PNG.sync.read(readFileSync(join(dirB, name)));
  } catch {
    console.log(`MISSING ${name}`);
    failed = true;
    continue;
  }
  const a = PNG.sync.read(readFileSync(join(dirA, name)));
  if (a.width !== b.width || a.height !== b.height) {
    console.log(
      `SIZE    ${name} ${a.width}x${a.height} vs ${b.width}x${b.height}`,
    );
    failed = true;
    continue;
  }
  const diff = pixelmatch(a.data, b.data, undefined, a.width, a.height, {
    threshold: 0.1,
  });
  const ratio = diff / (a.width * a.height);
  const bad = ratio > threshold;
  failed ||= bad;
  console.log(
    `${bad ? 'DIFF   ' : 'ok     '} ${name} ${(ratio * 100).toFixed(3)}%`,
  );
}
process.exit(failed ? 1 : 0);
