# Search mapcn-vue components

Find the right Vue map component in the mapcn-vue registry (MapLibre GL,
deck.gl, and LiDAR).

## Registry index

```bash
curl https://mapcn-vue.geoql.in/r/registry.json
```

Returns `{ items: [{ name, title, description }] }` for all registry
components. Filter client-side by matching your query against `name`, `title`,
and `description`.

## Categories

Components group into MapLibre-native layers, deck.gl core / aggregation / geo /
mesh / raster / wind layers, and a LiDAR control. Browse them at
https://mapcn-vue.geoql.in/docs/components or fetch the full catalog as
markdown from https://mapcn-vue.geoql.in/llms.txt.

## MCP server

Prefer structured access? mapcn-vue runs a remote MCP server (streamable HTTP)
at `https://mapcn-vue.geoql.in/mcp` with `list_components`, `get_component`, and
`get_install_command` tools. Discovery card:
`https://mapcn-vue.geoql.in/.well-known/mcp/server-card.json`.

## A2A agent

There is also an A2A agent at `https://mapcn-vue.geoql.in/a2a` — send a
plain-text description of the map layer you need and it returns matching
components with install commands. Agent card:
`https://mapcn-vue.geoql.in/.well-known/agent-card.json`.

## Fetch a component's source

```bash
curl https://mapcn-vue.geoql.in/r/<name>.json
```

`files[].content` holds the complete Vue SFC source; `dependencies` lists npm
packages the component needs.
