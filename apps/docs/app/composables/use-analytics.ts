import type {
  AnalyticsEvent,
  AnalyticsEventProps,
  GtagHandle,
  OpenPanelHandle,
  PlausibleHandle,
} from '~/types/analytics';

/**
 * One `track()` that fans each funnel event out to every tracker: GA4
 * (`$ga`), Plausible (`$plausible`) and OpenPanel (`$openpanel`). A tracker
 * that is off (missing ID, automation browser, SSR) provides `null` and is
 * skipped.
 *
 * Handles are read on every call, not once: a plugin may call
 * `useAnalytics()` before the tracker plugins have run.
 */
export function useAnalytics() {
  const nuxtApp = useNuxtApp();

  function track<E extends AnalyticsEvent>(
    event: E,
    props: AnalyticsEventProps[E],
  ): void {
    const ga: GtagHandle | null = nuxtApp.$ga ?? null;
    const plausible: PlausibleHandle | null = nuxtApp.$plausible ?? null;
    const openpanel: OpenPanelHandle | null = nuxtApp.$openpanel ?? null;
    const properties: Record<string, unknown> = { ...props };
    ga?.gtag('event', event, properties);
    plausible?.plausible(event, { props: properties });
    openpanel?.track(event, properties);
  }

  return { track };
}
