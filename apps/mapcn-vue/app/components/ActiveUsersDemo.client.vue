<script setup lang="ts">
  import { VMap, VPopup, VControlScale } from '@geoql/v-maplibre';
  import { VLayerDeckglScatterplot } from '@geoql/v-maplibre/deck.gl';
  import type { PickingInfo } from '@deck.gl/core';

  const { mapStyle } = useMapStyle();
  const { isAutomated } = useIsAutomated();

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

  // Tech Utility primary accent: oklch(0.70 0.16 254) ≈ rgb(64, 168, 247)
  // Weight ↑ → alpha ↑ for subtle data emphasis without color drift
  const getFillColor = (d: unknown): [number, number, number, number] => {
    const weight = (d as UserData).weight;
    const alpha = Math.min(220, 140 + (weight / 847) * 80);
    return [64, 168, 247, alpha];
  };

  const getPulseColor = (): [number, number, number, number] => {
    return [64, 168, 247, 90];
  };
</script>

<template>
  <div
    v-if="isAutomated"
    class="flex size-full items-center justify-center bg-muted font-mono text-xs text-muted-foreground"
  >
    Active users demo
  </div>
  <div v-else class="size-full">
    <VMap :key="mapStyle" :options="mapOptions" class="size-full">
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
        :get-line-color="[64, 168, 247, 255]"
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
        <div class="text-center">
          <div
            class="text-2xs font-medium tracking-wider text-muted-foreground uppercase"
          >
            {{ hoveredCity.city }}
          </div>
          <div
            class="font-mono text-2xl/tight font-medium tabular-nums text-primary"
          >
            {{ hoveredCity.weight.toLocaleString() }}
          </div>
          <div class="text-2xs tracking-wider text-muted-foreground">
            active users
          </div>
        </div>
      </VPopup>
      <VControlScale position="bottom-left" />
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
  .maplibregl-popup.active-users-popup {
    z-index: 100 !important;
  }

  .maplibregl-popup.active-users-popup .maplibregl-popup-content {
    padding: 0.625rem 0.875rem !important;
    background: var(--color-background) !important;
    border: none !important;
    border-radius: var(--radius) !important;
    box-shadow:
      0 10px 15px -3px rgb(0 0 0 / 0.1),
      0 4px 6px -4px rgb(0 0 0 / 0.1) !important;
    overflow: visible !important;
  }

  .active-users-popup.maplibregl-popup-anchor-top-left
    .maplibregl-popup-content {
    border-top-left-radius: 0 !important;
  }

  .active-users-popup.maplibregl-popup-anchor-top-right
    .maplibregl-popup-content {
    border-top-right-radius: 0 !important;
  }

  .active-users-popup.maplibregl-popup-anchor-bottom-left
    .maplibregl-popup-content {
    border-bottom-left-radius: 0 !important;
  }

  .active-users-popup.maplibregl-popup-anchor-bottom-right
    .maplibregl-popup-content {
    border-bottom-right-radius: 0 !important;
  }

  .active-users-popup.maplibregl-popup-anchor-bottom .maplibregl-popup-tip,
  .active-users-popup.maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip,
  .active-users-popup.maplibregl-popup-anchor-bottom-right
    .maplibregl-popup-tip {
    border-top-color: var(--color-background) !important;
  }

  .active-users-popup.maplibregl-popup-anchor-top .maplibregl-popup-tip,
  .active-users-popup.maplibregl-popup-anchor-top-left .maplibregl-popup-tip,
  .active-users-popup.maplibregl-popup-anchor-top-right .maplibregl-popup-tip {
    border-bottom-color: var(--color-background) !important;
  }

  .active-users-popup.maplibregl-popup-anchor-left .maplibregl-popup-tip {
    border-right-color: var(--color-background) !important;
  }

  .active-users-popup.maplibregl-popup-anchor-right .maplibregl-popup-tip {
    border-left-color: var(--color-background) !important;
  }
</style>
