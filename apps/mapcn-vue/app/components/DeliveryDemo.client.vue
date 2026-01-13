<script setup lang="ts">
  import { ref, shallowRef, onUnmounted, computed } from 'vue';
  import type { Map, MapOptions } from 'maplibre-gl';
  import { VMap } from '@geoql/v-maplibre';
  import { MapboxOverlay } from '@deck.gl/mapbox';
  import AnimatedArcLayer from '~/utils/animated-arc-layer';

  const colorMode = useColorMode();
  const mapRef = shallowRef<Map | null>(null);
  const overlayRef = shallowRef<MapboxOverlay | null>(null);
  const currentTime = ref(0);
  let animationFrame: number | null = null;

  interface DeliveryRoute {
    source: [number, number];
    target: [number, number];
    deliveries: number;
    startTime: number;
    endTime: number;
  }

  const TIME_WINDOW = 3;
  const ANIMATION_SPEED = 0.015;
  const MAX_TIME = 12;

  const cities = {
    nyc: [-74.006, 40.7128],
    la: [-118.2437, 34.0522],
    sf: [-122.4194, 37.7749],
    chicago: [-87.6298, 41.8781],
    miami: [-80.1918, 25.7617],
    seattle: [-122.3321, 47.6062],
    london: [-0.1276, 51.5074],
    paris: [2.3522, 48.8566],
    berlin: [13.405, 52.52],
    madrid: [-3.7038, 40.4168],
    rome: [12.4964, 41.9028],
    amsterdam: [4.9041, 52.3676],
    tokyo: [139.6917, 35.6895],
    shanghai: [121.4737, 31.2304],
    beijing: [116.4074, 39.9042],
    hongkong: [114.1694, 22.3193],
    singapore: [103.8198, 1.3521],
    seoul: [126.978, 37.5665],
    mumbai: [72.8777, 19.076],
    delhi: [77.209, 28.6139],
    dubai: [55.2708, 25.2048],
    sydney: [151.2093, -33.8688],
    melbourne: [144.9631, -37.8136],
    saopaulo: [-46.6333, -23.5505],
    rio: [-43.1729, -22.9068],
    mexico: [-99.1332, 19.4326],
    toronto: [-79.3832, 43.6532],
    moscow: [37.6173, 55.7558],
    istanbul: [28.9784, 41.0082],
    cairo: [31.2357, 30.0444],
    johannesburg: [28.0473, -26.2041],
    lagos: [3.3792, 6.5244],
    nairobi: [36.8219, -1.2921],
    bangkok: [100.5018, 13.7563],
    jakarta: [106.8456, -6.2088],
    manila: [120.9842, 14.5995],
    hanoi: [105.8342, 21.0278],
    auckland: [174.7633, -36.8485],
  } as const satisfies Record<string, [number, number]>;

  type CityName = keyof typeof cities;

  const generateRoutes = (): DeliveryRoute[] => {
    const routes: DeliveryRoute[] = [];
    let timeOffset = 0;

    const addRoute = (from: CityName, to: CityName, weight: number) => {
      routes.push({
        source: [...cities[from]] as [number, number],
        target: [...cities[to]] as [number, number],
        deliveries: weight,
        startTime: timeOffset,
        endTime: timeOffset + 2.5 + Math.random() * 2,
      });
      timeOffset = (timeOffset + 0.15) % MAX_TIME;
    };

    addRoute('nyc', 'london', 280);
    addRoute('nyc', 'paris', 220);
    addRoute('nyc', 'tokyo', 195);
    addRoute('nyc', 'shanghai', 175);
    addRoute('nyc', 'saopaulo', 160);
    addRoute('nyc', 'mexico', 240);
    addRoute('nyc', 'dubai', 145);
    addRoute('la', 'tokyo', 260);
    addRoute('la', 'sydney', 180);
    addRoute('la', 'shanghai', 200);
    addRoute('la', 'seoul', 175);
    addRoute('la', 'singapore', 155);
    addRoute('sf', 'tokyo', 230);
    addRoute('sf', 'hongkong', 195);
    addRoute('sf', 'london', 185);
    addRoute('sf', 'shanghai', 210);
    addRoute('chicago', 'london', 175);
    addRoute('chicago', 'paris', 155);
    addRoute('chicago', 'tokyo', 145);
    addRoute('miami', 'saopaulo', 165);
    addRoute('miami', 'rio', 145);
    addRoute('miami', 'london', 135);
    addRoute('seattle', 'tokyo', 185);
    addRoute('seattle', 'beijing', 155);
    addRoute('london', 'dubai', 245);
    addRoute('london', 'singapore', 215);
    addRoute('london', 'hongkong', 205);
    addRoute('london', 'mumbai', 195);
    addRoute('london', 'delhi', 175);
    addRoute('london', 'tokyo', 185);
    addRoute('london', 'johannesburg', 145);
    addRoute('london', 'sydney', 165);
    addRoute('paris', 'tokyo', 175);
    addRoute('paris', 'shanghai', 165);
    addRoute('paris', 'dubai', 195);
    addRoute('paris', 'singapore', 155);
    addRoute('paris', 'mumbai', 145);
    addRoute('berlin', 'moscow', 165);
    addRoute('berlin', 'dubai', 155);
    addRoute('berlin', 'beijing', 145);
    addRoute('amsterdam', 'tokyo', 155);
    addRoute('amsterdam', 'shanghai', 145);
    addRoute('madrid', 'saopaulo', 155);
    addRoute('madrid', 'mexico', 145);
    addRoute('rome', 'dubai', 145);
    addRoute('rome', 'cairo', 135);
    addRoute('tokyo', 'shanghai', 285);
    addRoute('tokyo', 'hongkong', 245);
    addRoute('tokyo', 'singapore', 225);
    addRoute('tokyo', 'seoul', 265);
    addRoute('tokyo', 'bangkok', 195);
    addRoute('tokyo', 'sydney', 175);
    addRoute('tokyo', 'delhi', 155);
    addRoute('shanghai', 'hongkong', 275);
    addRoute('shanghai', 'singapore', 235);
    addRoute('shanghai', 'seoul', 225);
    addRoute('shanghai', 'bangkok', 185);
    addRoute('shanghai', 'sydney', 165);
    addRoute('shanghai', 'dubai', 175);
    addRoute('beijing', 'seoul', 215);
    addRoute('beijing', 'tokyo', 195);
    addRoute('beijing', 'moscow', 165);
    addRoute('hongkong', 'singapore', 255);
    addRoute('hongkong', 'bangkok', 215);
    addRoute('hongkong', 'sydney', 185);
    addRoute('hongkong', 'dubai', 175);
    addRoute('hongkong', 'mumbai', 165);
    addRoute('singapore', 'sydney', 215);
    addRoute('singapore', 'dubai', 205);
    addRoute('singapore', 'mumbai', 185);
    addRoute('singapore', 'jakarta', 225);
    addRoute('singapore', 'bangkok', 235);
    addRoute('singapore', 'manila', 195);
    addRoute('seoul', 'tokyo', 245);
    addRoute('seoul', 'shanghai', 215);
    addRoute('seoul', 'bangkok', 165);
    addRoute('mumbai', 'dubai', 235);
    addRoute('mumbai', 'singapore', 195);
    addRoute('mumbai', 'london', 175);
    addRoute('delhi', 'dubai', 225);
    addRoute('delhi', 'singapore', 185);
    addRoute('delhi', 'bangkok', 165);
    addRoute('dubai', 'singapore', 225);
    addRoute('dubai', 'mumbai', 245);
    addRoute('dubai', 'cairo', 175);
    addRoute('dubai', 'nairobi', 155);
    addRoute('dubai', 'johannesburg', 165);
    addRoute('sydney', 'auckland', 185);
    addRoute('sydney', 'singapore', 205);
    addRoute('sydney', 'tokyo', 175);
    addRoute('melbourne', 'singapore', 175);
    addRoute('melbourne', 'auckland', 165);
    addRoute('saopaulo', 'rio', 195);
    addRoute('saopaulo', 'johannesburg', 145);
    addRoute('saopaulo', 'lagos', 135);
    addRoute('mexico', 'saopaulo', 155);
    addRoute('toronto', 'london', 185);
    addRoute('toronto', 'tokyo', 155);
    addRoute('moscow', 'beijing', 165);
    addRoute('moscow', 'dubai', 155);
    addRoute('istanbul', 'dubai', 175);
    addRoute('istanbul', 'moscow', 145);
    addRoute('cairo', 'dubai', 165);
    addRoute('cairo', 'johannesburg', 145);
    addRoute('johannesburg', 'nairobi', 155);
    addRoute('johannesburg', 'lagos', 145);
    addRoute('lagos', 'nairobi', 135);
    addRoute('bangkok', 'singapore', 225);
    addRoute('bangkok', 'hongkong', 205);
    addRoute('bangkok', 'tokyo', 175);
    addRoute('jakarta', 'singapore', 215);
    addRoute('jakarta', 'sydney', 165);
    addRoute('manila', 'tokyo', 175);
    addRoute('manila', 'hongkong', 195);
    addRoute('hanoi', 'tokyo', 155);
    addRoute('hanoi', 'shanghai', 165);

    return routes;
  };

  const deliveryRoutes = generateRoutes();

  const sourceColor = computed<[number, number, number]>(() =>
    colorMode.value === 'dark' ? [63, 81, 181] : [37, 99, 235],
  );

  const targetColor = computed<[number, number, number]>(() =>
    colorMode.value === 'dark' ? [63, 181, 173] : [5, 150, 105],
  );

  const mapOptions = computed<MapOptions>(() => ({
    container: 'delivery-globe',
    style: {
      version: 8,
      projection: { type: 'globe' },
      sources: {
        satellite: {
          type: 'raster',
          tiles: [
            'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg',
          ],
          tileSize: 256,
        },
      },
      layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }],
      sky: {
        'atmosphere-blend': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0,
          1,
          5,
          1,
          7,
          0,
        ],
      },
    } as MapOptions['style'],
    center: [0, 20] as [number, number],
    zoom: 1.5,
    maxPitch: 0,
    dragRotate: false,
  }));

  const createLayers = (time: number) => {
    const timeRange: [number, number] = [time, time + TIME_WINDOW];

    return [
      new AnimatedArcLayer({
        id: 'delivery-arcs',
        data: deliveryRoutes,
        getSourcePosition: (d: DeliveryRoute) => d.source,
        getTargetPosition: (d: DeliveryRoute) => d.target,
        getSourceColor: sourceColor.value,
        getTargetColor: targetColor.value,
        getWidth: (d: DeliveryRoute) => Math.sqrt(d.deliveries) * 0.3,
        widthMinPixels: 1,
        widthMaxPixels: 6,
        getHeight: 0.3,
        getSourceTimestamp: (d: DeliveryRoute) => d.startTime,
        getTargetTimestamp: (d: DeliveryRoute) => d.endTime,
        timeRange,
        parameters: { cullMode: 'none' },
      }),
    ];
  };

  const animate = () => {
    currentTime.value = (currentTime.value + ANIMATION_SPEED) % MAX_TIME;

    if (overlayRef.value) {
      overlayRef.value.setProps({ layers: createLayers(currentTime.value) });
    }

    animationFrame = requestAnimationFrame(animate);
  };

  const onMapLoaded = (map: Map) => {
    mapRef.value = map;

    const overlay = new MapboxOverlay({
      interleaved: true,
      layers: createLayers(0),
    });

    map.addControl(overlay);
    overlayRef.value = overlay;

    animate();
  };

  onUnmounted(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    if (overlayRef.value && mapRef.value) {
      mapRef.value.removeControl(overlayRef.value);
      overlayRef.value.finalize();
    }
    overlayRef.value = null;
    mapRef.value = null;
  });
</script>

<template>
  <VMap :options="mapOptions" class="size-full" @loaded="onMapLoaded" />
</template>
