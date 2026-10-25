import type {
  PlausibleFn,
  PlausibleHandle,
  PlausibleInitOptions,
} from '~/types/analytics';
import { isAutomationBrowser } from '~/utils/automation-browser';

/**
 * Plausible (self-hosted, Oct-2025 `pa-*.js` tracker). Provides `$plausible`
 * (null when Plausible is off).
 *
 * The `pa-*.js` script only boots if `window.plausible.o` is already set when
 * it loads (its tail runs `plausible.o && init(plausible.o)`). So this is
 * Plausible's official snippet: define the queue stub and call `init()` to set
 * `.o` BEFORE the async script arrives. `@nuxtjs/plausible` and the
 * `@nuxt/scripts` Plausible helper never set `.o`, so the script never boots.
 */
export default defineNuxtPlugin(() => {
  const { plausibleScriptId, plausibleApiHost } = useRuntimeConfig().public;
  let handle: PlausibleHandle | null = null;

  if (plausibleScriptId && plausibleApiHost && !isAutomationBrowser()) {
    const queue: unknown[] = [];
    const loader: PlausibleFn = Object.assign(
      (...args: unknown[]) => {
        queue.push(args);
      },
      {
        q: queue,
        init: (options: PlausibleInitOptions) => {
          loader.o = options;
        },
      },
    );
    window.plausible = loader;
    loader.init({
      autoCapturePageviews: true,
      captureOnLocalhost: import.meta.dev,
    });

    useHead({
      script: [
        { src: `${plausibleApiHost}/js/${plausibleScriptId}.js`, async: true },
      ],
    });

    handle = {
      plausible: (...args: unknown[]) => {
        window.plausible(...args);
      },
    };
  }

  return { provide: { plausible: handle } };
});
