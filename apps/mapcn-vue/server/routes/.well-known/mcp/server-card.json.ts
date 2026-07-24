import type { H3Event } from 'h3';

export default defineEventHandler((event: H3Event) => {
  setResponseHeader(event, 'content-type', 'application/json');
  setResponseHeader(event, 'cache-control', 'public, max-age=3600');
  return {
    $schema:
      'https://static.modelcontextprotocol.io/schemas/2025-11-25/server-card.schema.json',
    serverInfo: MCP_SERVER_INFO,
    protocolVersion: '2025-06-18',
    transport: {
      type: 'streamable-http',
      endpoint: 'https://mapcn-vue.geoql.in/mcp',
    },
    capabilities: { tools: {} },
    description:
      'MCP server for the mapcn-vue map component registry: browse, search, and fetch the source of theme-aware MapLibre GL, deck.gl, and LiDAR Vue components, with shadcn-vue CLI install commands.',
    documentationUrl: 'https://mapcn-vue.geoql.in/docs/components',
  };
});
