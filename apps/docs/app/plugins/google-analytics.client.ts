import type { GtagHandle } from '~/types/analytics';
import { isAutomationBrowser } from '~/utils/automation-browser';

/** GA4 via @nuxt/scripts. Provides `$ga` (null when GA4 is off). */
export default defineNuxtPlugin(() => {
  const gtagId = useRuntimeConfig().public.gtagId;
  let ga: GtagHandle | null = null;

  // Automation browsers get no analytics — see utils/automation-browser.ts.
  if (gtagId && !isAutomationBrowser()) {
    const { proxy } = useScriptGoogleAnalytics({ id: gtagId });
    ga = {
      gtag: (command, eventName, eventParams) => {
        proxy.gtag(command, eventName, eventParams);
      },
    };
  }

  return { provide: { ga } };
});
