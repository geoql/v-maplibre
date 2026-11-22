/**
 * Phone-width checks for the docs (plan Review Focus 4).
 *
 * Usage: node scripts/visual/docs-mobile.ts <baseUrl> <docsPath> <section...>
 * At 390x844: the page does not overflow horizontally, the TOC is hidden,
 * and the Menu sheet lists every named nav section. Exits 1 on failure.
 */
import { chromium } from 'playwright';

const [baseUrl, docsPath, ...sections] = process.argv.slice(2);
if (!baseUrl || !docsPath || sections.length === 0) {
  console.error('usage: docs-mobile.ts <baseUrl> <docsPath> <section...>');
  process.exit(2);
}

const failures: string[] = [];
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(new URL(docsPath, baseUrl).href, { waitUntil: 'networkidle' });

const width = await page.evaluate(() => document.documentElement.scrollWidth);
if (width > 390) failures.push(`page is ${width}px wide (> 390)`);
if (await page.getByText('On this page').isVisible())
  failures.push('TOC is visible');

await page.locator('[data-docs-menu]').click();
const sheet = page.getByRole('dialog');
await sheet.waitFor();
for (const section of sections) {
  if (!(await sheet.getByText(section, { exact: true }).isVisible())) {
    failures.push(`menu sheet has no "${section}" section`);
  }
}
await browser.close();

if (failures.length > 0) {
  for (const f of failures) console.error(`FAIL ${f}`);
  process.exit(1);
}
console.log(
  `PASS 390px: no overflow (${width}px), TOC hidden, menu lists ${sections.join(', ')}`,
);
