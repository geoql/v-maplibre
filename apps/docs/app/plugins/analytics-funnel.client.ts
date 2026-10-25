import {
  componentPage,
  installCommand,
  outboundTarget,
} from '~/utils/analytics-funnel';

/**
 * Funnel events for the Docus site. Docus owns every page and component, so
 * the events come from one plugin instead of component code:
 * - `component_viewed` after each render of a components/layers/controls page
 * - `install_command_copied` / `code_copied` when a code block's copy button
 *   is clicked (Nuxt UI ProsePre: a button next to the `<pre>`)
 * - `outbound_click` for every link to GitHub or npm
 */
// The explicit `void` return keeps this plugin out of NuxtApp's injection
// inference: without it, `useAnalytics()` reading `$ga` here makes the
// inferred `$ga` type depend on itself and collapse to `{}`.
export default defineNuxtPlugin((nuxtApp): void => {
  const router = useRouter();
  const { track } = useAnalytics();
  const currentPath = () => router.currentRoute.value.path;

  nuxtApp.hook('page:finish', () => {
    const page = componentPage(currentPath());
    if (page) track('component_viewed', page);
  });

  document.addEventListener(
    'click',
    (event) => {
      if (!(event.target instanceof Element)) return;

      const link = event.target.closest('a');
      if (link) {
        const target = outboundTarget(link.href);
        if (target) {
          track('outbound_click', {
            target,
            href: link.href,
            location: currentPath(),
          });
        }
        return;
      }

      const pre = event.target
        .closest('button')
        ?.parentElement?.querySelector(':scope > pre');
      if (!pre) return;
      const code = pre.textContent ?? '';
      const install = installCommand(code);
      if (install) {
        track('install_command_copied', { ...install, page: currentPath() });
        return;
      }
      track('code_copied', {
        language: pre.className.match(/language-(\S+)/)?.[1] ?? 'text',
        page: currentPath(),
      });
    },
    { capture: true },
  );
});
