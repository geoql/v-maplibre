import type {
  RegistryIndex,
  RegistryIndexItem,
  RegistryItem,
} from '~~/apps/mapcn-vue/server/types/mcp';
import registryIndex from '../../../../packages/mapcn-vue/public/r/registry.json';
import mapItem from '../../../../packages/mapcn-vue/public/r/map.json';
import mapLayersItem from '../../../../packages/mapcn-vue/public/r/map-layers.json';
import mapDeckglCoreItem from '../../../../packages/mapcn-vue/public/r/map-deckgl-core.json';
import mapDeckglAggregationItem from '../../../../packages/mapcn-vue/public/r/map-deckgl-aggregation.json';
import mapDeckglGeoItem from '../../../../packages/mapcn-vue/public/r/map-deckgl-geo.json';
import mapDeckglMeshItem from '../../../../packages/mapcn-vue/public/r/map-deckgl-mesh.json';
import mapDeckglRasterItem from '../../../../packages/mapcn-vue/public/r/map-deckgl-raster.json';
import mapDeckglWindItem from '../../../../packages/mapcn-vue/public/r/map-deckgl-wind.json';
import mapControlLidarItem from '../../../../packages/mapcn-vue/public/r/map-control-lidar.json';

// The registry is tiny (~84 KB total across 9 items) so bundling every item
// into the worker keeps get_component correct on both `wrangler dev` and the
// deployed Worker, where node:fs against the sibling package dir is unavailable.
const REGISTRY_ITEMS: RegistryItem[] = [
  mapItem,
  mapLayersItem,
  mapDeckglCoreItem,
  mapDeckglAggregationItem,
  mapDeckglGeoItem,
  mapDeckglMeshItem,
  mapDeckglRasterItem,
  mapDeckglWindItem,
  mapControlLidarItem,
] as RegistryItem[];

const ITEMS_BY_NAME = new Map<string, RegistryItem>(
  REGISTRY_ITEMS.map((item) => [item.name, item]),
);

export function getRegistryIndex(): RegistryIndex {
  return registryIndex as RegistryIndex;
}

export function getRegistryIndexItems(): RegistryIndexItem[] {
  return getRegistryIndex().items;
}

export function getRegistryItem(name: string): RegistryItem | null {
  const slug = name.replace(/\.json$/, '');
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return null;
  }
  return ITEMS_BY_NAME.get(slug) ?? null;
}
