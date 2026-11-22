import { getAgentDocument } from '#agent-discovery';
import { z } from 'zod';

/** One docs page as markdown. Same name and output as Docus's tool. */
export default defineMcpTool({
  description: `Returns one v-maplibre documentation page: title, description and full markdown.

WHEN TO USE: when you know the page path (from list-pages or the user), for example /guide/getting-started or /layers/raster-layers.

WHEN NOT TO USE: when you do not know the path; call list-pages first.`,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: {
    path: z
      .string()
      .describe('Page path from list-pages, for example /guide/getting-started'),
  },
  inputExamples: [{ path: '/guide/getting-started' }, { path: '/components/map' }],
  cache: '1h',
  handler: async ({ path }) => {
    const document = await getAgentDocument(useEvent(), path);
    if (!document) {
      throw createError({ statusCode: 404, message: `No page at ${path}` });
    }
    if ('redirect' in document) {
      throw createError({
        statusCode: 404,
        message: `${path} is a section, try ${document.redirect}`,
      });
    }
    return {
      title: document.title,
      path,
      description: document.description,
      content: document.markdown,
      url: document.canonicalUrl,
    };
  },
});
