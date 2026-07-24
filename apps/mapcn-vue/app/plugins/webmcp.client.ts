import type {
  RegistryIndex,
  WebMcpModelContext,
  WebMcpTool,
} from '~/types/webmcp';

const INSTALL_BASE = 'npx shadcn-vue@latest add https://mapcn-vue.geoql.in/r';

export default defineNuxtPlugin(() => {
  const nav = navigator as Navigator & { modelContext?: WebMcpModelContext };
  const modelContext = nav.modelContext;
  if (!modelContext) return;

  const searchMapComponents: WebMcpTool = {
    name: 'search_map_components',
    description:
      'Search the mapcn-vue registry of copy-paste Vue map components (MapLibre + deck.gl) by name, title, or description. Returns matching components with shadcn-vue install commands.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Case-insensitive search query, e.g. "deckgl".',
        },
      },
    },
    execute: async (input) => {
      try {
        const registry = await $fetch<RegistryIndex>('/r/registry.json');
        const query =
          typeof input.query === 'string' ? input.query.toLowerCase() : '';
        return registry.items
          .filter(
            (item) =>
              !query ||
              [item.name, item.title, item.description]
                .join(' ')
                .toLowerCase()
                .includes(query),
          )
          .map((item) => ({
            name: item.name,
            title: item.title,
            description: item.description,
            install: `${INSTALL_BASE}/${item.name}.json`,
          }));
      } catch {
        throw new Error('Component search failed.');
      }
    },
  };

  const getComponentInstallCommand: WebMcpTool = {
    name: 'get_component_install_command',
    description:
      'Get the shadcn-vue CLI install command for one mapcn-vue component by its registry name.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Component name in kebab-case, e.g. "map-deckgl-core".',
        },
      },
      required: ['name'],
    },
    execute: async (input) => {
      const name = typeof input.name === 'string' ? input.name : '';
      if (!/^[a-z0-9-]+$/.test(name)) {
        throw new Error('Invalid component name.');
      }
      return { name, install: `${INSTALL_BASE}/${name}.json` };
    },
  };

  const tools = [searchMapComponents, getComponentInstallCommand];

  if (typeof modelContext.registerTool === 'function') {
    for (const tool of tools) {
      modelContext.registerTool(tool);
    }
  } else if (typeof modelContext.provideContext === 'function') {
    modelContext.provideContext({ tools });
  }
});
