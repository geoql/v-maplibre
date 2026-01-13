<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { VMap, VLayerDeckglScatterplot } from '@geoql/v-maplibre';
  import type { PickingInfo } from '@deck.gl/core';

  const colorMode = useColorMode();

  const lightStyle =
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
  const darkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark' ? darkStyle : lightStyle,
  );

  const mapOptions = computed(() => ({
    container: 'active-users-map',
    style: mapStyle.value,
    center: [0, 20] as [number, number],
    zoom: 1.2,
  }));

  interface UserData {
    coordinates: [number, number];
    weight: number;
    city: string;
  }

  const usersData: UserData[] = [
    { coordinates: [-74.006, 40.7128], weight: 847, city: 'New York' },
    { coordinates: [-0.1276, 51.5074], weight: 623, city: 'London' },
    { coordinates: [139.6917, 35.6895], weight: 512, city: 'Tokyo' },
    { coordinates: [2.3522, 48.8566], weight: 234, city: 'Paris' },
    { coordinates: [-122.4194, 37.7749], weight: 198, city: 'San Francisco' },
    { coordinates: [77.209, 28.6139], weight: 187, city: 'New Delhi' },
    { coordinates: [121.4737, 31.2304], weight: 156, city: 'Shanghai' },
    { coordinates: [151.2093, -33.8688], weight: 89, city: 'Sydney' },
    { coordinates: [-43.1729, -22.9068], weight: 67, city: 'Rio de Janeiro' },
    { coordinates: [18.4241, -33.9249], weight: 45, city: 'Cape Town' },
    { coordinates: [103.8198, 1.3521], weight: 78, city: 'Singapore' },
    { coordinates: [-99.1332, 19.4326], weight: 56, city: 'Mexico City' },
    { coordinates: [116.4074, 39.9042], weight: 320, city: 'Beijing' },
    { coordinates: [37.6173, 55.7558], weight: 145, city: 'Moscow' },
    { coordinates: [126.978, 37.5665], weight: 210, city: 'Seoul' },
    { coordinates: [-46.6333, -23.5505], weight: 178, city: 'Sao Paulo' },
    { coordinates: [72.8777, 19.076], weight: 290, city: 'Mumbai' },
    { coordinates: [28.9784, 41.0082], weight: 165, city: 'Istanbul' },
    { coordinates: [100.5018, 13.7563], weight: 142, city: 'Bangkok' },
    { coordinates: [-3.7038, 40.4168], weight: 118, city: 'Madrid' },
  ];

  // Animation state for pulsing effect
  const pulseScale = ref(1);
  let animationFrame: number | null = null;
  let startTime: number | null = null;

  const animate = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;

    // Create smooth pulse: oscillate between 1 and 1.8 over 2 seconds
    const cycle = (elapsed % 2000) / 2000;
    const pulse = Math.sin(cycle * Math.PI * 2) * 0.4 + 1.4;
    pulseScale.value = pulse;

    animationFrame = requestAnimationFrame(animate);
  };

  onMounted(() => {
    animationFrame = requestAnimationFrame(animate);
  });

  onBeforeUnmount(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });

  // Hover state for tooltip
  const hoveredCity = ref<UserData | null>(null);
  const tooltipPosition = ref({ x: 0, y: 0 });

  const handleHover = (info: PickingInfo) => {
    if (info.object) {
      hoveredCity.value = info.object as UserData;
      tooltipPosition.value = { x: info.x ?? 0, y: info.y ?? 0 };
    } else {
      hoveredCity.value = null;
    }
  };

  // Accessors
  const getPosition = (d: unknown) => (d as UserData).coordinates;

  // Scale radius based on weight (user count): 8px min, 25px max
  const getRadius = (d: unknown) => {
    const weight = (d as UserData).weight;
    const minRadius = 8;
    const maxRadius = 25;
    const minWeight = 45;
    const maxWeight = 847;
    const normalized = (weight - minWeight) / (maxWeight - minWeight);
    return minRadius + normalized * (maxRadius - minRadius);
  };

  // Emerald green color with slight variation based on weight
  const getFillColor = (d: unknown): [number, number, number, number] => {
    const weight = (d as UserData).weight;
    const intensity = Math.min(255, 150 + (weight / 847) * 105);
    return [16, intensity, 129, 200];
  };

  // Pulse ring color - lighter emerald
  const getPulseColor = (): [number, number, number, number] => {
    return [16, 185, 129, 100];
  };
</script>

<template>
  <div class="relative h-full w-full">
    <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
      <!-- Outer pulsing ring layer -->
      <VLayerDeckglScatterplot
        id="active-users-pulse"
        :data="usersData"
        :get-position="getPosition"
        :get-radius="getRadius"
        :get-fill-color="getPulseColor"
        :radius-scale="pulseScale"
        radius-units="pixels"
        :radius-min-pixels="8"
        :radius-max-pixels="50"
        :opacity="0.4"
        :pickable="false"
        :stroked="false"
        :filled="true"
        :antialiasing="true"
      />
      <!-- Inner solid circle layer -->
      <VLayerDeckglScatterplot
        id="active-users-solid"
        :data="usersData"
        :get-position="getPosition"
        :get-radius="getRadius"
        :get-fill-color="getFillColor"
        :radius-scale="1"
        radius-units="pixels"
        :radius-min-pixels="8"
        :radius-max-pixels="25"
        :opacity="0.9"
        :pickable="true"
        :stroked="true"
        :get-line-color="[16, 185, 129, 255]"
        :line-width-min-pixels="2"
        :filled="true"
        :antialiasing="true"
        @hover="handleHover"
      />
    </VMap>

    <!-- Hover tooltip -->
    <Transition name="tooltip">
      <div
        v-if="hoveredCity"
        class="pointer-events-none absolute z-50 rounded-lg bg-white px-4 py-3 shadow-lg dark:bg-zinc-900"
        :style="{
          left: `${tooltipPosition.x + 12}px`,
          top: `${tooltipPosition.y - 60}px`,
        }"
      >
        <div class="text-center">
          <div class="font-semibold text-zinc-900 dark:text-white">
            {{ hoveredCity.city }}
          </div>
          <div class="text-xl font-bold text-emerald-500">
            {{ hoveredCity.weight.toLocaleString() }}
          </div>
          <div class="text-xs text-zinc-500 dark:text-zinc-400">
            active users
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
  #active-users-map {
    width: 100%;
    height: 100%;
  }

  .tooltip-enter-active,
  .tooltip-leave-active {
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;
  }

  .tooltip-enter-from,
  .tooltip-leave-to {
    opacity: 0;
    transform: translateY(4px);
  }
</style>
