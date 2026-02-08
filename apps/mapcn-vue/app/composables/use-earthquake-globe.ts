import type { EarthquakeData, EarthquakeGeoJSON } from '~/types/earthquake';

const USGS_FEED_URL =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson';

export function useEarthquakeGlobe() {
  const earthquakeData = ref<EarthquakeData[]>([]);
  const selectedQuake = ref<EarthquakeData | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  async function fetchEarthquakes() {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch<EarthquakeGeoJSON>(USGS_FEED_URL);
      earthquakeData.value = response.features.map((f) => ({
        coordinates: [f.geometry.coordinates[0], f.geometry.coordinates[1]] as [
          number,
          number,
        ],
        magnitude: f.properties.mag,
        depth: f.geometry.coordinates[2],
        place: f.properties.place,
        time: f.properties.time,
        title: f.properties.title,
      }));
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch data';
    } finally {
      loading.value = false;
    }
  }

  function selectQuake(quake: EarthquakeData) {
    selectedQuake.value = quake;
  }

  function clearSelection() {
    selectedQuake.value = null;
  }

  function getQuakeColor(mag: number): [number, number, number, number] {
    if (mag < 3) return [0, 200, 100, 180];
    if (mag < 5) return [255, 200, 0, 200];
    if (mag < 6) return [255, 120, 0, 220];
    return [255, 30, 30, 255];
  }

  onMounted(() => {
    fetchEarthquakes();
  });

  return {
    earthquakeData,
    selectedQuake,
    loading,
    error,
    selectQuake,
    clearSelection,
    getQuakeColor,
  };
}
