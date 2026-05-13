<script setup lang="ts">
  useSeoMeta({
    title: 'Artillery Range Planner - mapcn-vue Examples',
    description:
      'Interactive artillery range planning demo with range fan polygons, weapon types, and bearing control on a MapLibre map.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Artillery Range Planner',
    description:
      'Place gun positions and visualize range fans with min/max range arcs.',
    category: 'Examples',
  });

  const {
    positions,
    selectedPositionId,
    activeWeaponType,
    rangeFans,
    weaponConfigs,
    addPosition,
    removePosition,
    clearAll,
    selectPosition,
    setWeaponType,
    updateBearing,
    cleanup,
  } = useArtilleryPlanner();
  function handleMapClick(lngLat: [number, number]): void {
    addPosition(lngLat);
  }

  function handleSelectPosition(id: string | null): void {
    selectPosition(selectedPositionId.value === id ? null : id);
  }

  onUnmounted(() => {
    cleanup();
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VControlNavigation } from '@geoql/v-maplibre';

  const colorMode = useColorMode();
  const mapStyle = computed(() =>
    colorMode.value === 'dark'
      ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
      : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  );
  ${SCRIPT_END}

  <template>
    <VMap :options="{ style: mapStyle, center: [71.9, 26.9], zoom: 10 }">
      <VControlNavigation position="top-right" />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="Artillery Range Planner"
    description="Click to place artillery positions and visualize range fan polygons with min/max range arcs. Supports howitzers, mortars, and MLRS with adjustable bearing."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesArtilleryMapContainer
        :positions="positions"
        :range-fans="rangeFans"
        :selected-position-id="selectedPositionId"
        class="size-full"
        @map-click="handleMapClick"
      />

      <MapPanel title="Artillery">
        <ExamplesArtilleryControlPanel
          :positions="positions"
          :selected-position-id="selectedPositionId"
          :active-weapon-type="activeWeaponType"
          :weapon-configs="weaponConfigs"
          @select-position="handleSelectPosition"
          @set-weapon-type="setWeaponType"
          @update-bearing="updateBearing"
          @remove-position="removePosition"
          @clear-all="clearAll"
        />
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
