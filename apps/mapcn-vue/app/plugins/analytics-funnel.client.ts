import { outboundTarget, slugAfter } from '~/utils/analytics-funnel';

/**
 * Site-wide funnel events that are not tied to one component:
 * - `example_viewed` / `docs_page_viewed` after each page render
 * - `outbound_click` for every link to GitHub or npm, wherever it sits
 */
// The explicit `void` return keeps this plugin out of NuxtApp's injection
// inference: without it, `useAnalytics()` reading `$ga` here makes the
// inferred `$ga` type depend on itself and collapse to `{}`.
export default defineNuxtPlugin((nuxtApp): void => {
  const router = useRouter();
  const { track } = useAnalytics();

  nuxtApp.hook('page:finish', () => {
    const path = router.currentRoute.value.path;
    const example = slugAfter(path, '/examples/');
    if (example) {
      track('example_viewed', { slug: example });
      return;
    }
    const doc = slugAfter(path, '/docs/');
    if (doc) track('docs_page_viewed', { slug: doc });
  });

  document.addEventListener(
    'click',
    (event) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest('a');
      if (!link) return;
      const target = outboundTarget(link.href);
      if (!target) return;
      track('outbound_click', {
        target,
        href: link.href,
        location: router.currentRoute.value.path,
      });
    },
    { capture: true },
  );
});
