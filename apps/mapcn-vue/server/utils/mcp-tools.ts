import type {
  McpToolDefinition,
  McpToolResult,
  RegistryIndexItem,
} from '~~/apps/mapcn-vue/server/types/mcp';

const SITE_URL = 'https://mapcn-vue.geoql.in';
const DOCS_URL = `${SITE_URL}/docs/components`;

export const MCP_SERVER_INFO = {
  name: 'mapcn-vue',
  title: 'mapcn-vue — Vue map component registry',
  version: '1.0.0',
} as const;

export const MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'list_components',
    description:
      'List all mapcn-vue registry components (MapLibre, deck.gl, and LiDAR map layers). Optionally filter with a search query matched against name, title, and description. Returns name, title, description, and install command for each match.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Optional case-insensitive search query (e.g. "deck", "lidar", "heatmap", "cluster").',
        },
      },
    },
  },
  {
    name: 'get_component',
    description:
      'Get full details for one mapcn-vue component by name: description, npm dependencies, registry dependencies, install command, docs URL, and complete Vue source files.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Component name in kebab-case (e.g. "map-deckgl-core").',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'get_install_command',
    description:
      'Get the shadcn-vue CLI command that installs a mapcn-vue component into a Vue/Nuxt project.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Component name in kebab-case (e.g. "map-deckgl-core").',
        },
      },
      required: ['name'],
    },
  },
];

function text(value: string): McpToolResult {
  return { content: [{ type: 'text', text: value }] };
}

function toolError(message: string): McpToolResult {
  return { content: [{ type: 'text', text: message }], isError: true };
}

function installCommand(name: string): string {
  return `npx shadcn-vue@latest add ${SITE_URL}/r/${name}.json`;
}

function formatIndexItem(item: RegistryIndexItem): string {
  return [
    `## ${item.title} (\`${item.name}\`)`,
    item.description,
    `Install: \`${installCommand(item.name)}\``,
  ].join('\n');
}

export function callMcpTool(
  name: string,
  args: Record<string, unknown>,
): McpToolResult {
  if (name === 'list_components') {
    const query =
      typeof args.query === 'string' ? args.query.trim().toLowerCase() : '';
    const items = getRegistryIndexItems().filter((item) => {
      if (!query) return true;
      return [item.name, item.title, item.description]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
    if (items.length === 0) {
      return text(`No components match "${query}".`);
    }
    return text(
      [
        `# mapcn-vue components (${items.length})`,
        ...items.map(formatIndexItem),
      ].join('\n\n'),
    );
  }

  if (name === 'get_component' || name === 'get_install_command') {
    const componentName = typeof args.name === 'string' ? args.name : '';
    if (!componentName) {
      return toolError('Missing required argument "name".');
    }
    const item = getRegistryItem(componentName);
    if (!item) {
      return toolError(
        `Component "${componentName}" not found. Use list_components to see available components.`,
      );
    }
    const install = installCommand(item.name);
    if (name === 'get_install_command') {
      return text(install);
    }
    const sections = [
      `# ${item.title ?? item.name} (\`${item.name}\`)`,
      item.description ?? '',
      `Install: \`${install}\``,
      `Docs: ${DOCS_URL}`,
    ];
    if (item.dependencies?.length) {
      sections.push(`npm dependencies: ${item.dependencies.join(', ')}`);
    }
    if (item.registryDependencies?.length) {
      sections.push(
        `Registry dependencies: ${item.registryDependencies.join(', ')}`,
      );
    }
    for (const file of item.files) {
      if (!file.content) continue;
      sections.push(
        `## ${file.target ?? file.path}\n\n\`\`\`vue\n${file.content}\n\`\`\``,
      );
    }
    return text(sections.join('\n\n'));
  }

  return toolError(`Unknown tool "${name}".`);
}
