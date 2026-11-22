/**
 * Review Focus 3: moving between the docs and mapcn-vue in dark mode shows no
 * colour-mode flash and the same background on both sites.
 *
 * Usage: node scripts/visual/cross-site-dark.ts <docsUrl> <mapcnUrl>
 * With the OS in dark mode (first visit, no stored preference), every page
 * load must have <html class="dark"> at DOMContentLoaded (before first paint
 * of the body) and the same computed background colour.
 */
import { chromium } from 'playwright';

const [docsUrl, mapcnUrl] = process.argv.slice(2);
if (!docsUrl || !mapcnUrl) {
  console.error('usage: cross-site-dark.ts <docsUrl> <mapcnUrl>');
  process.exit(2);
}

const route = [
  new URL('/', docsUrl).href,
  new URL('/', mapcnUrl).href,
  new URL('/guide/getting-started', docsUrl).href,
  new URL('/docs/introduction', mapcnUrl).href,
];

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({
  colorScheme: 'dark',
  viewport: { width: 1440, height: 900 },
});
await context.addInitScript(() => {
  document.addEventListener('DOMContentLoaded', () => {
    (window as unknown as { __darkAtDcl: boolean }).__darkAtDcl =
      document.documentElement.classList.contains('dark');
  });
});

const failures: string[] = [];
const backgrounds = new Set<string>();
const page = await context.newPage();
for (const url of route) {
  // 'load', not 'networkidle': the mapcn-vue home streams map tiles.
  await page.goto(url, { waitUntil: 'load' });
  const result = await page.evaluate(() => ({
    darkAtDcl: (window as unknown as { __darkAtDcl?: boolean }).__darkAtDcl,
    background: getComputedStyle(document.body).backgroundColor,
  }));
  if (!result.darkAtDcl) failures.push(`${url}: not dark at DOMContentLoaded`);
  backgrounds.add(result.background);
  console.log(`${url} dark@DCL=${result.darkAtDcl} bg=${result.background}`);
}
await browser.close();

if (backgrounds.size !== 1)
  failures.push(`backgrounds differ: ${[...backgrounds].join(' | ')}`);
if (failures.length > 0) {
  for (const f of failures) console.error(`FAIL ${f}`);
  process.exit(1);
}
console.log('PASS dark at first paint on every load, one background');
