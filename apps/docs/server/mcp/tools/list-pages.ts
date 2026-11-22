import { listAgentPages } from '#agent-discovery';

/** Every docs page: title, path, description and URL. Same name and output as Docus's tool. */
export default defineMcpTool({
  description: `Lists every v-maplibre documentation page with its title, path, description and URL.

WHEN TO USE: to explore or search the docs when you do not know the exact page path, for example "which layers render COG imagery?" or "what controls exist?".

WHEN NOT TO USE: when you already know the path; call get-page with it.

WORKFLOW: pick the relevant paths from this list, then call get-page for each.`,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  cache: '1h',
  handler: async () => {
    const pages = await listAgentPages(useEvent());
    return pages
      .filter((page) => page.route !== '/')
      .map((page) => ({
        title: page.title,
        path: page.route,
        description: page.description,
        url: page.url,
      }));
  },
});
