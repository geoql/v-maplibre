import { isAutomationBrowser } from '~/utils/automation-browser';

/**
 * Keeps OpenPanel silent in automation browsers.
 *
 * `@openpanel/nuxt` builds its client from `runtimeConfig.public.openpanel` in
 * its own plugin, and that client tracks screen views and outgoing links by
 * itself. This `pre` plugin runs first and sets the SDK's `disabled` option,
 * so the client queues every event and never sends one.
 */
export default defineNuxtPlugin({
  name: 'openpanel-guard',
  enforce: 'pre',
  setup() {
    if (!isAutomationBrowser()) return;
    useRuntimeConfig().public.openpanel.disabled = true;
  },
});
