import type { Map, GeoJSONSource, LngLatLike } from 'maplibre-gl';

export function useClusterData() {
  const mapRef = ref<Map | null>(null);
  const showPopup = ref(false);
  const popupCoordinates = ref<LngLatLike>([-74.006, 40.7128]);
  const popupContent = ref<{ id: number } | null>(null);

  function generatePoints(): GeoJSON.FeatureCollection {
    const features: GeoJSON.Feature[] = [];
    for (let i = 0; i < 500; i++) {
      features.push({
        type: 'Feature',
        properties: { id: i },
        geometry: {
          type: 'Point',
          coordinates: [
            -74.006 + (Math.random() - 0.5) * 0.3,
            40.7128 + (Math.random() - 0.5) * 0.2,
          ],
        },
      });
    }
    return { type: 'FeatureCollection', features };
  }

  function onMapLoaded(map: Map): void {
    mapRef.value = map;

    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters-clusters', 'clusters-unclustered-point'],
      });
      if (features.length === 0) {
        showPopup.value = false;
      }
    });
  }

  async function handleClusterClick(event: {
    features: GeoJSON.Feature[];
    coordinates: { lng: number; lat: number };
  }): Promise<void> {
    showPopup.value = false;

    if (!mapRef.value || !event.features[0]) return;

    const feature = event.features[0];
    const clusterId = feature.properties?.cluster_id;
    const source = mapRef.value.getSource('cluster-source') as GeoJSONSource;

    const geometry = feature.geometry as GeoJSON.Point;
    const clusterCenter = geometry.coordinates as [number, number];

    if (source && clusterId !== undefined) {
      try {
        const zoom = await source.getClusterExpansionZoom(clusterId);
        mapRef.value?.easeTo({
          center: clusterCenter,
          zoom: zoom ?? 14,
          duration: 500,
        });
      } catch (err) {
        console.error('Error getting cluster expansion zoom:', err);
      }
    }
  }

  async function handlePointClick(event: {
    features: GeoJSON.Feature[];
    coordinates: { lng: number; lat: number };
  }): Promise<void> {
    if (!mapRef.value || !event.features[0]) return;

    const feature = event.features[0];
    const geometry = feature.geometry as GeoJSON.Point;
    const pointCenter = geometry.coordinates as [number, number];

    showPopup.value = false;
    await nextTick();

    popupCoordinates.value = pointCenter;
    popupContent.value = { id: feature.properties?.id ?? 0 };
    showPopup.value = true;
  }

  return {
    mapRef,
    showPopup,
    popupCoordinates,
    popupContent,
    generatePoints,
    onMapLoaded,
    handleClusterClick,
    handlePointClick,
  };
}
