import type { WindDataPoint, ColorStop } from '@geoql/v-maplibre';
import { createWindDataFromOpenWeatherMap } from '@geoql/v-maplibre';

export function useWindData() {
  const isLoading = ref(true);
  const error = ref<string | null>(null);
  const windData = ref<WindDataPoint[]>([]);
  const lastUpdated = ref<Date | null>(null);
  const refreshInterval = ref<ReturnType<typeof setInterval> | null>(null);

  const colorRamp: ColorStop[] = [
    [0.0, [59, 130, 189, 255]],
    [0.1, [102, 194, 165, 255]],
    [0.2, [171, 221, 164, 255]],
    [0.3, [230, 245, 152, 255]],
    [0.4, [254, 224, 139, 255]],
    [0.5, [253, 174, 97, 255]],
    [0.6, [244, 109, 67, 255]],
    [1.0, [213, 62, 79, 255]],
  ];

  function generateGridPoints(): Array<{ lat: number; lon: number }> {
    const points: Array<{ lat: number; lon: number }> = [];
    const latStep = 20;
    const lonStep = 30;

    for (let lat = -60; lat <= 60; lat += latStep) {
      for (let lon = -180; lon < 180; lon += lonStep) {
        points.push({ lat, lon });
      }
    }
    return points;
  }

  async function fetchWindData(): Promise<void> {
    try {
      isLoading.value = true;
      error.value = null;

      const gridPoints = generateGridPoints();
      const apiKey = '385df3d81f3a89c1c99c115735540c6d';
      const baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

      const responses = await Promise.all(
        gridPoints.map(async ({ lat, lon }) => {
          const url = `${baseUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}`;
          const response = await fetch(url);
          return response.json();
        }),
      );

      const data = createWindDataFromOpenWeatherMap(responses);
      windData.value = data;
      lastUpdated.value = new Date();
      isLoading.value = false;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to fetch wind data';
      isLoading.value = false;
    }
  }

  function startAutoRefresh(): void {
    refreshInterval.value = setInterval(
      () => {
        fetchWindData();
      },
      60 * 60 * 1000,
    );
  }

  function stopAutoRefresh(): void {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value);
    }
  }

  function handleWindLoaded(): void {
    console.log('Wind layer loaded with', windData.value.length, 'data points');
  }

  function handleWindError(err: Error): void {
    error.value = err.message;
    console.error('Wind layer error:', err);
  }

  return {
    isLoading,
    error,
    windData,
    lastUpdated,
    colorRamp,
    fetchWindData,
    startAutoRefresh,
    stopAutoRefresh,
    handleWindLoaded,
    handleWindError,
  };
}
