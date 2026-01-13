<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { VMap, VLayerDeckglScatterplot, VPopup } from '@geoql/v-maplibre';
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

  // Major cities with good global distribution
  const usersData: UserData[] = [
    { coordinates: [-74.006, 40.7128], weight: 847, city: 'New York' },
    { coordinates: [-0.1276, 51.5074], weight: 623, city: 'London' },
    { coordinates: [139.6917, 35.6895], weight: 512, city: 'Tokyo' },
    { coordinates: [-122.4194, 37.7749], weight: 198, city: 'San Francisco' },
    { coordinates: [151.2093, -33.8688], weight: 89, city: 'Sydney' },
    { coordinates: [-46.6333, -23.5505], weight: 178, city: 'Sao Paulo' },
    { coordinates: [72.8777, 19.076], weight: 290, city: 'Mumbai' },
    { coordinates: [126.978, 37.5665], weight: 210, city: 'Seoul' },
    { coordinates: [18.4241, -33.9249], weight: 45, city: 'Cape Town' },
    { coordinates: [103.8198, 1.3521], weight: 78, city: 'Singapore' },
  ];

  // Animation state for pulsing effect
  const pulseScale = ref(1);
  let animationFrame: number | null = null;
  let startTime: number | null = null;

  const animate = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;

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

  // Hover state for popup
  const hoveredCity = ref<UserData | null>(null);

  const handleHover = (info: PickingInfo) => {
    if (info.object) {
      hoveredCity.value = info.object as UserData;
    } else {
      hoveredCity.value = null;
    }
  };

  // Accessors
  const getPosition = (d: unknown) => (d as UserData).coordinates;

  // Scale radius based on weight (user count): 4px min, 12px max
  const getRadius = (d: unknown) => {
    const weight = (d as UserData).weight;
    const minRadius = 4;
    const maxRadius = 12;
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
  <div class="h-full w-full">
    <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
      <VLayerDeckglScatterplot
        id="active-users-pulse"
        :data="usersData"
        :get-position="getPosition"
        :get-radius="getRadius"
        :get-fill-color="getPulseColor"
        :radius-scale="pulseScale"
        radius-units="pixels"
        :radius-min-pixels="4"
        :radius-max-pixels="24"
        :opacity="0.4"
        :pickable="false"
        :stroked="false"
        :filled="true"
        :antialiasing="true"
      />
      <VLayerDeckglScatterplot
        id="active-users-solid"
        :data="usersData"
        :get-position="getPosition"
        :get-radius="getRadius"
        :get-fill-color="getFillColor"
        :radius-scale="1"
        radius-units="pixels"
        :radius-min-pixels="4"
        :radius-max-pixels="12"
        :opacity="0.9"
        :pickable="true"
        :stroked="true"
        :get-line-color="[16, 185, 129, 255]"
        :line-width-min-pixels="1"
        :filled="true"
        :antialiasing="true"
        @hover="handleHover"
      />
      <VPopup
        v-if="hoveredCity"
        :coordinates="hoveredCity.coordinates"
        :options="{
          closeButton: false,
          closeOnClick: false,
          offset: 15,
          className: 'active-users-popup',
        }"
      >
        <div class="px-1 py-0.5 text-center">
          <div class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {{ hoveredCity.city }}
          </div>
          <div class="text-lg font-bold text-emerald-500">
            {{ hoveredCity.weight.toLocaleString() }}
          </div>
          <div class="text-[11px] text-zinc-500 dark:text-zinc-400">
            active users
          </div>
        </div>
      </VPopup>
    </VMap>
  </div>
</template>

<style scoped>
  #active-users-map {
    width: 100%;
    height: 100%;
  }
</style>

<style>
  .active-users-popup {
    z-index: 100 !important;
  }

  .active-users-popup .maplibregl-popup-content {
    padding: 8px 12px;
    border-radius: 8px;
    box-shadow:
      0 4px 6px -1px rgb(0 0 0 / 0.1),
      0 2px 4px -2px rgb(0 0 0 / 0.1);
    border: 1px solid #e4e4e7;
    background: #ffffff;
  }

  .active-users-popup .maplibregl-popup-tip {
    border-top-color: #ffffff;
  }

  .dark .active-users-popup .maplibregl-popup-content {
    background: #18181b;
    border-color: #3f3f46;
  }

  .dark .active-users-popup .maplibregl-popup-tip {
    border-top-color: #18181b;
  }
</style>
