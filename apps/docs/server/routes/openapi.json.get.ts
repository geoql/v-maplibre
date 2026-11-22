import type { H3Event } from 'h3';
import { agentDiscoveryOpenApi, getAgentSiteUrl } from '#agent-discovery';

/**
 * What an agent can call on this site: the markdown twin of every page, the
 * discovery documents and the MCP endpoint (the document Docus published).
 */
export default defineEventHandler((event: H3Event) => {
  const discovery = agentDiscoveryOpenApi(event);
  return {
    openapi: '3.1.0',
    info: {
      title: 'v-maplibre',
      description:
        'Markdown representations of every v-maplibre page, the documents agents discover the site through, and its MCP endpoint.',
      version: '0.0.0',
    },
    servers: [{ url: getAgentSiteUrl(event) }],
    tags: discovery.tags,
    paths: discovery.paths,
    components: discovery.components,
  };
});
