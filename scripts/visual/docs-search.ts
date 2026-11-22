/**
 * ⌘K search check: open with the shortcut, type, press Enter, land on the
 * expected page. Under reduced motion the palette opens without animating.
 *
 * Usage: node scripts/visual/docs-search.ts <baseUrl> <query> <expectedPath>
 */
import { chromium } from 'playwright';

const [baseUrl, query, expected] = process.argv.slice(2);
if (!baseUrl || !query || !expected) {
  console.error('usage: docs-search.ts <baseUrl> <query> <expectedPath>');
  process.exit(2);
}

const failures: string[] = [];
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
});
await page.goto(new URL('/guide/getting-started', baseUrl).href, {
  waitUntil: 'networkidle',
});
await page.keyboard.press('ControlOrMeta+k');
const input = page.locator('[data-search-input]');
await input.waitFor();
const animating = await page.evaluate(
  () =>
    document
      .getAnimations()
      .filter((a) => Number(a.effect?.getComputedTiming().duration) > 1).length,
);
if (animating > 0)
  failures.push(`${animating} animation(s) on open under reduced motion`);
await input.fill(query);
await page.getByRole('option').first().waitFor();
await page.keyboard.press('Enter');
await page
  .waitForURL((url) => url.pathname === expected, { timeout: 10_000 })
  .catch(() => {
    failures.push(
      `landed on ${new URL(page.url()).pathname}, expected ${expected}`,
    );
  });
await browser.close();

if (failures.length > 0) {
  for (const f of failures) console.error(`FAIL ${f}`);
  process.exit(1);
}
console.log(`PASS ⌘K "${query}" -> ${expected}`);
