<script setup lang="ts">
  import type { SensorType } from '~/types/defense-sensor';

  useSeoMeta({
    title: 'Sensor Network & EW Coverage - mapcn-vue Examples',
    description:
      'Distributed sensor network with electronic warfare coverage zones and simulated threat detection along the Arunachal Pradesh border.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Sensor Network & EW Coverage',
    description:
      'Distributed sensor network with electronic warfare coverage zones and simulated threat detection.',
    category: 'Examples',
  });

  const {
    sensors,
    threats,
    activeSensorTypes,
    radiusMultiplier,
    pulseTime,
    stats,
    coverageZones,
    sensorTypes,
    toggleSensorType,
    startAnimation,
    startThreats,
    cleanup,
  } = useSensorNetwork();
  onMounted(() => {
    startAnimation();
    startThreats();
  });

  onUnmounted(() => {
    cleanup();
  });

  function handleToggleType(type: SensorType): void {
    toggleSensorType(type);
  }

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import {
    VMap,
    VControlNavigation,
    VControlScale,
    useDeckLayers,
  } from '@geoql/v-maplibre';
  import { ScatterplotLayer, PolygonLayer, TextLayer } from '@deck.gl/layers';

  const mapOptions = computed(() => ({
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [93.5, 27.5] as [number, number],
    zoom: 9,
  }));

  const { updateLayer } = useDeckLayers();

  const sensors = ref([
    { id: 'RAD-01', position: [93.35, 27.52], radius: 12000, color: [0, 255, 100, 40] },
    { id: 'AS-01', position: [93.3, 27.55], radius: 4000, color: [0, 200, 220, 40] },
  ]);

  function syncLayers() {
    updateLayer('detection', new ScatterplotLayer({
      id: 'detection',
      data: sensors.value,
      getPosition: (d) => d.position,
      getRadius: (d) => d.radius,
      getFillColor: (d) => d.color,
      radiusUnits: 'meters',
      filled: true,
      stroked: true,
    }));
  }
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full">
    <VControlNavigation position="top-right" />
    <VControlScale position="bottom-left" />
  </VMap>
</template>`;
</script>

<template>
  <ComponentDemo
    title="Sensor Network & EW Coverage"
    description="Distributed sensor network with electronic warfare coverage zones and simulated threat detection along the Arunachal Pradesh border region."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesSensorNetworkMapContainer
        :sensors="sensors"
        :threats="threats"
        :coverage-zones="coverageZones"
        :radius-multiplier="radiusMultiplier[0]!"
        :pulse-time="pulseTime"
        class="size-full"
      />

      <MapPanel title="Sensor Network">
        <ExamplesSensorNetworkControlPanel
          v-model:radius-multiplier="radiusMultiplier"
          :active-sensor-types="activeSensorTypes"
          :stats="stats"
          :sensor-types="sensorTypes"
          @toggle-type="handleToggleType"
        />
      </MapPanel>

      <div class="absolute inset-x-0 bottom-10 z-10">
        <ExamplesSensorNetworkAlertPanel :threats="threats" />
      </div>
    </div>
  </ComponentDemo>
</template>
