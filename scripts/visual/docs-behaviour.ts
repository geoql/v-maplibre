/**
 * Behaviour checks for the shared docs shell (plan Review Focus 1 and 2).
 *
 * Usage: node scripts/visual/docs-behaviour.ts <baseUrl> <docsPath> <otherDocsPath>
 * 1. Deep link: <docsPath>#<first h2 id> lands below the toolbar and the TOC
 *    marks that heading with aria-current="true".
 * 2. Reduced motion: after navigating to <otherDocsPath>, nothing animates.
 * Exits 1 on any failure.
 */
import { chromium } from 'playwright';

const [baseUrl, docsPath, otherPath] = process.argv.slice(2);
if (!baseUrl || !docsPath || !otherPath) {
  console.error(
    'usage: docs-behaviour.ts <baseUrl> <docsPath> <otherDocsPath>',
  );
  process.exit(2);
}

const failures: string[] = [];
const browser = await chromium.launch({ channel: 'chrome' });

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(new URL(docsPath, baseUrl).href, { waitUntil: 'networkidle' });
const id = await page.evaluate(
  () => document.querySelector('.prose h2[id]')?.id ?? '',
);
if (!id) failures.push('no h2 with an id on the page');
await page.goto(new URL(`${docsPath}#${id}`, baseUrl).href, {
  waitUntil: 'networkidle',
});
await page.waitForTimeout(800);
const top = await page.evaluate(
  (h) => document.getElementById(h)?.getBoundingClientRect().top ?? -1,
  id,
);
if (top < 40)
  failures.push(`heading #${id} top ${top}px is under the toolbar (< 40px)`);
const current = await page.evaluate(
  () =>
    document
      .querySelector('nav a[aria-current="true"]')
      ?.getAttribute('href') ?? '',
);
if (current !== `#${id}`)
  failures.push(`TOC aria-current is "${current}", expected "#${id}"`);
await page.close();

const reduced = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
});
await reduced.goto(new URL(docsPath, baseUrl).href, {
  waitUntil: 'networkidle',
});
// Sample for 600ms after the click: the route transition and the sliding
// indicators start only once the next page has loaded.
const sample = reduced.evaluate(
  () =>
    new Promise<number>((resolve) => {
      let max = 0;
      const start = performance.now();
      const tick = (): void => {
        const n = document
          .getAnimations()
          .filter(
            (a) =>
              a.playState === 'running' &&
              Number(a.effect?.getComputedTiming().duration) > 1,
          ).length;
        max = Math.max(max, n);
        if (performance.now() - start < 600) requestAnimationFrame(tick);
        else resolve(max);
      };
      requestAnimationFrame(tick);
    }),
);
await reduced.locator(`a[href="${otherPath}"]`).first().click();
const running = await sample;
if (running > 0)
  failures.push(`${running} animation(s) running under reduced motion`);
await browser.close();

if (failures.length > 0) {
  for (const f of failures) console.error(`FAIL ${f}`);
  process.exit(1);
}
console.log(
  `PASS deep link #${id} (top ${Math.round(top)}px, TOC current) and reduced motion`,
);
