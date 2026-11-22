/**
 * Screenshot pages in light and dark mode at desktop and phone sizes.
 *
 * Usage: node scripts/visual/capture.ts <baseUrl> <outDir> <path...>
 * Writes <outDir>/<slug>-<light|dark>-<1440|390>.png. Map canvases are
 * masked, because WebGL output differs between runs.
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const [baseUrl, outDir, ...paths] = process.argv.slice(2);
if (!baseUrl || !outDir || paths.length === 0) {
  console.error('usage: capture.ts <baseUrl> <outDir> <path...>');
  process.exit(2);
}

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
] as const;
const MODES = ['light', 'dark'] as const;

const slug = (path: string): string =>
  path === '/' ? 'home' : path.replace(/^\//, '').replaceAll('/', '_');

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
for (const mode of MODES) {
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport,
      colorScheme: mode,
      reducedMotion: 'reduce',
    });
    // @nuxtjs/color-mode reads this cookie before first paint.
    await context.addCookies([
      { name: 'nuxt-color-mode', value: mode, url: baseUrl },
    ]);
    const page = await context.newPage();
    for (const path of paths) {
      await page.goto(new URL(path, baseUrl).href, { waitUntil: 'load' });
      await page.waitForLoadState('networkidle').catch(() => undefined);
      await page.waitForTimeout(1000);
      const file = join(outDir, `${slug(path)}-${mode}-${viewport.width}.png`);
      await page.screenshot({ path: file, mask: [page.locator('canvas')] });
      console.log(file);
    }
    await context.close();
  }
}
await browser.close();
