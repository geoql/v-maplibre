import { setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

export default defineNuxtPlugin(() => {
  setWorkerUrl(workerUrl);
});
