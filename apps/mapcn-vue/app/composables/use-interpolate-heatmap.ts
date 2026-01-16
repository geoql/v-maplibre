import type { Map, CustomLayerInterface } from 'maplibre-gl';
import { MaplibreInterpolateHeatmapLayer } from 'maplibre-gl-interpolate-heatmap';
import type { WeatherPoint } from '~/types/interpolate-heatmap';

export function useInterpolateHeatmap() {
  const isLoading = ref(true);
  const error = ref<string | null>(null);

  function generatePoints(): WeatherPoint[] {
    const startingLatitude = -80;
    const startingLongitude = -180;
    const endingLatitude = 80;
    const endingLongitude = 180;
    const n = 10;
    const points: WeatherPoint[] = [];

    for (let i = 0; i < n; i += 1) {
      for (let j = 0; j < n; j += 1) {
        points.push({
          lat: startingLatitude + (i * (endingLatitude - startingLatitude)) / n,
          lon:
            startingLongitude + (j * (endingLongitude - startingLongitude)) / n,
          val: 0,
        });
      }
    }
    return points;
  }

  async function onMapLoaded(map: Map): Promise<void> {
    try {
      const points = generatePoints();

      const baseUrl =
        'https://api.openweathermap.org/data/2.5/weather?units=metric';
      const apiKey = '385df3d81f3a89c1c99c115735540c6d';

      const urls = points.map(
        ({ lat, lon }) => `${baseUrl}&lat=${lat}&lon=${lon}&appid=${apiKey}`,
      );

      const weathers = await Promise.all(
        urls.map(async (url) => {
          const response = await fetch(url);
          return response.json();
        }),
      );

      points.forEach((point, index) => {
        const weather = weathers.at(index);
        point.val = weather?.main?.temp ?? 0;
      });

      const layer = new MaplibreInterpolateHeatmapLayer({
        id: 'interpolate-temperature',
        data: points,
      });

      map.addLayer(layer as unknown as CustomLayerInterface);
      isLoading.value = false;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load data';
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    error,
    onMapLoaded,
  };
}
