<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import {
    VMap,
    VLayerDeckglTrips,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Trips Animation (deck.gl) - mapcn-vue Examples',
    description: 'Animated path visualization.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Trips Animation (deck.gl)',
    description: 'Animated path visualization.',
    category: 'deck.gl',
  });

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: `trips-example-${mapId}`,
    style: mapStyle.value,
    center: [-74.0, 40.72] as [number, number],
    zoom: 12,
    pitch: 45,
    bearing: 0,
  }));

  interface Trip {
    path: [number, number][];
    timestamps: number[];
    vendor: number;
  }

  const DATA_URL =
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/trips/trips-v7.json';

  const tripsData = ref<Trip[]>([]);
  const currentTime = ref(0);
  const loopLength = 1800;
  const animationSpeed = 30;
  let animationFrame: number;
  let lastTime = 0;

  const animate = (timestamp: number) => {
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;
    lastTime = timestamp;

    currentTime.value =
      (currentTime.value + (delta / 1000) * animationSpeed) % loopLength;
    animationFrame = requestAnimationFrame(animate);
  };

  onMounted(async () => {
    try {
      const response = await fetch(DATA_URL);
      const data: Trip[] = await response.json();
      const step = Math.floor(data.length / 100);
      tripsData.value = data.filter((_, i) => i % step === 0).slice(0, 100);
    } catch (error) {
      console.error('Failed to fetch trips data:', error);
    }

    animationFrame = requestAnimationFrame(animate);
  });

  onUnmounted(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });

  interface TripData {
    path: [number, number][];
    timestamps: number[];
    vendor: number;
  }

  const getPath = (d: unknown) => (d as TripData).path;
  const getTimestamps = (d: unknown) => (d as TripData).timestamps;
  const getColor = (d: unknown): [number, number, number] =>
    (d as TripData).vendor === 0 ? [253, 128, 93] : [23, 184, 190];

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VLayerDeckglTrips, VControlNavigation } from '@geoql/v-maplibre';

  const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
  center: [-74.0, 40.72],
  zoom: 12,
  pitch: 45,
  };

  // Fetch trip data with path coordinates and timestamps
  const tripsData = await fetch(DATA_URL).then(r => r.json());

  // Animation loop updates currentTime
  const currentTime = ref(0);
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full">
    <VControlNavigation position="top-right" />
    <VLayerDeckglTrips
      id="trips"
      :data="tripsData"
      :get-path="(d) => d.path"
      :get-timestamps="(d) => d.timestamps"
      :get-color="(d) => d.vendor === 0 ? [253, 128, 93] : [23, 184, 190]"
      :current-time="currentTime"
      :trail-length="180"
      :width-min-pixels="3"
      :cap-rounded="true"
      :joint-rounded="true"
    />
  </VMap>
</template>`;
</script>

<template>
  <div class="container max-w-screen-2xl overflow-x-hidden py-4">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-4">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="size-3.5" />
          Examples
        </NuxtLink>
        <h1 class="mt-1.5 text-xl font-semibold tracking-tight">
          Trips Animation (deck.gl)
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Animated NYC taxi trips using real data. Orange and teal paths
          represent different vendors.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="h-125 min-w-0 overflow-hidden">
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="size-full">
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />
              <VLayerDeckglTrips
                id="trips"
                :data="tripsData"
                :get-path="getPath"
                :get-timestamps="getTimestamps"
                :get-color="getColor"
                :current-time="currentTime"
                :trail-length="180"
                :width-min-pixels="3"
                :cap-rounded="true"
                :joint-rounded="true"
                :opacity="0.8"
              />
            </VMap>
          </ClientOnly>
        </div>
      </ComponentDemo>

      <ExampleNavigation />
    </div>
  </div>
</template>
