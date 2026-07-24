/**
 * Detects headless / automated browsers (crawlers, WebMCP scanners, Lighthouse
 * bots) so heavy WebGL map demos can render a static fallback instead of
 * mounting a live MapLibre instance. SSR-safe: defaults to `false` on the
 * server and is set once on mount from `navigator.webdriver`.
 */
export function useIsAutomated() {
  const isAutomated = ref(false);

  onMounted(() => {
    isAutomated.value = navigator.webdriver === true;
  });

  return { isAutomated };
}
