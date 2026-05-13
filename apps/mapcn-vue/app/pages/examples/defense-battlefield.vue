<script setup lang="ts">
  useSeoMeta({
    title: '3D Battlefield Terrain - mapcn-vue Examples',
    description:
      'Interactive tactical map with animated troop movement replay over the Ladakh region.',
  });

  defineOgImage('MapcnDoc', {
    title: '3D Battlefield Terrain',
    description: 'Interactive 3D terrain with animated troop movement replay.',
    category: 'Examples',
  });

  const {
    units,
    missionPhases,
    activePaths,
    activeUnits,
    positions,
    currentTime,
    selectedPhase,
    isPlaying,
    speed,
    progress,
    activeUnitTypes,
    stats,
    play,
    pause,
    resetAnimation,
    setSpeed,
    seekTo,
    toggleUnitType,
    cleanup,
  } = useBattlefieldTerrain();
  onUnmounted(() => {
    cleanup();
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                  import { VMap, VControlNavigation } from '@geoql/v-maplibre';
                  import { useDeckLayers } from '@geoql/v-maplibre';
                  import { TripsLayer } from '@deck.gl/geo-layers';
                  import { ScatterplotLayer, TextLayer } from '@deck.gl/layers';

                  const mapOptions = {
                    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
                    center: [78.2, 34.2],
                    zoom: 11,
                  };
                ${SCRIPT_END}

                <template>
                  <VMap :options="mapOptions" class="h-125 w-full">
                    <VControlNavigation position="top-right" />
                  </VMap>
                </template>`;
</script>

<template>
  <ComponentDemo
    title="3D Battlefield Terrain"
    description="Interactive tactical map with animated troop movement replay over the Ladakh region. Military unit tracks rendered as animated trails with mission phase timeline."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesBattlefieldMapContainer
        :paths="activePaths"
        :current-time="currentTime"
        :positions="positions"
        class="size-full"
      />

      <div class="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
        <ExamplesBattlefieldMissionInfo :stats="stats" />
      </div>

      <MapPanel title="Battlefield">
        <ExamplesBattlefieldControlPanel
          :is-playing="isPlaying"
          :speed="speed"
          :progress="progress"
          :mission-phases="missionPhases"
          :current-phase="selectedPhase"
          :units="activeUnits"
          :active-unit-types="activeUnitTypes"
          @play="play"
          @pause="pause"
          @reset="resetAnimation"
          @set-speed="setSpeed"
          @seek="seekTo"
          @toggle-unit="toggleUnitType"
        />
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
