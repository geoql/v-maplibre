/**
 * Opens every mapcn-vue example page and reports page errors and console
 * errors. Exits 1 if any page has one.
 *
 * Usage: node scripts/visual/examples-sweep.ts <baseUrl> [ignorePattern] [slug...]
 * The example list comes from apps/mapcn-vue/app/pages/examples/*.vue.
 * `ignorePattern` (a regex, '' for none) skips known third-party noise.
 * Extra arguments limit the sweep to those example slugs.
 */
import { readdirSync } from 'node:fs';
import { chromium } from 'playwright';

const [baseUrl, ignore, ...only] = process.argv.slice(2);
if (!baseUrl) {
  console.error('usage: examples-sweep.ts <baseUrl> [ignorePattern]');
  process.exit(2);
}
const ignoreRe = ignore ? new RegExp(ignore) : null;

const slugs = readdirSync(
  new URL('../../apps/mapcn-vue/app/pages/examples', import.meta.url),
)
  .filter((f) => f.endsWith('.vue') && f !== 'index.vue')
  .map((f) => f.replace(/\.vue$/, ''))
  .filter((slug) => only.length === 0 || only.includes(slug))
  .sort();

const browser = await chromium.launch({ channel: 'chrome' });
const flagged: { slug: string; errors: string[] }[] = [];
for (const slug of slugs) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  try {
    await page.goto(new URL(`/examples/${slug}`, baseUrl).href, {
      waitUntil: 'load',
      timeout: 45_000,
    });
    await page.waitForTimeout(4000);
  } catch (e) {
    errors.push(`goto: ${(e as Error).message.split('\n')[0]}`);
  }
  await page.close();
  const real = errors.filter((e) => !ignoreRe?.test(e));
  if (real.length > 0)
    flagged.push({ slug, errors: [...new Set(real)].slice(0, 3) });
}
await browser.close();

console.log(`swept ${slugs.length} examples, ${flagged.length} flagged`);
for (const f of flagged)
  console.log(`- ${f.slug}\n    ${f.errors.join('\n    ')}`);
process.exit(flagged.length > 0 ? 1 : 0);
