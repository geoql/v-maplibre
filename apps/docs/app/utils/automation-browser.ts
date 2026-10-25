/**
 * Automation-browser detection for analytics gating.
 *
 * Every automation harness (Playwright, Selenium, Puppeteer, CDP-driven
 * agents) sets `navigator.webdriver`. Bot sessions pollute the funnel data,
 * and each third-party beacon adds latency to the `networkidle` window that
 * headless agent checkers wait for. Real users never set it.
 *
 * Callers that feed `useHead()` must gate the `useHead` call itself: this
 * helper is always `false` during SSR.
 */
export function isAutomationBrowser(): boolean {
  if (!import.meta.client) return false;
  return navigator.webdriver === true;
}
