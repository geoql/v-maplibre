import type { Map as MapLibreMap } from 'maplibre-gl';

/**
 * Remove a layer, then its source when no remaining layer uses that source.
 *
 * Several layers can share one source (common with vector tiles and
 * PMTiles), so the source is removed only together with its last layer.
 * MapLibre throws for any style call after `map.remove()`; callers run this
 * from `onBeforeUnmount`, so the error is caught and logged instead of
 * breaking the unmount.
 *
 * @param mapInstance - The map the layer was added to.
 * @param layerId - The layer to remove.
 * @param sourceId - The source to remove when it is no longer used.
 */
export function removeLayerAndSource(
  mapInstance: MapLibreMap,
  layerId: string,
  sourceId: string,
): void {
  try {
    if (mapInstance.getLayer(layerId)) {
      mapInstance.removeLayer(layerId);
    }
    const sourceInUse = mapInstance
      .getStyle()
      .layers.some((layer) => 'source' in layer && layer.source === sourceId);
    if (!sourceInUse && mapInstance.getSource(sourceId)) {
      mapInstance.removeSource(sourceId);
    }
  } catch (error) {
    console.error(`[${layerId}] Error removing layer:`, error);
  }
}
