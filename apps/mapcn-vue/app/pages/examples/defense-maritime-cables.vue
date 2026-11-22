<script setup lang="ts">
  usePageGeo({
    title: 'Submarine Cables & EEZ Infrastructure - mapcn-vue Examples',
    description:
      'Global submarine cable network mapped against Exclusive Economic Zones with real-time risk scoring at chokepoints.',
  });

  defineOgImage('SiteDoc', {
    title: 'Submarine Cables & EEZ',
    description:
      'Undersea cable infrastructure with EEZ overlay and risk-colored segments at strategic chokepoints.',
    category: 'Examples',
  });

  const {
    cables,
    filteredSegments,
    landingPoints,
    eezZones,
    selectedCableId,
    showEez,
    stats,
    selectCable,
  } = useMaritimeCables();

  function handleSelectCable(id: string | null): void {
    selectCable(id);
  }

  function handleToggleEez(): void {
    showEez.value = !showEez.value;
  }

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
    <VMap :options="{ style: mapStyle, center: [40, 25], zoom: 2.2 }">
      <VControlNavigation position="top-right" />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="Submarine Cables & EEZ Infrastructure"
    description="Undersea cable network mapped against Exclusive Economic Zones. Cable segments are risk-colored at strategic chokepoints (Red Sea, Hormuz, Malacca, Taiwan Strait). Select a cable to isolate its route."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesCablesMapContainer
        :filtered-segments="filteredSegments"
        :landing-points="landingPoints"
        :eez-zones="eezZones"
        :show-eez="showEez"
        class="size-full"
      />

      <MapPanel title="Cables">
        <ExamplesCablesControlPanel
          :cables="cables"
          :selected-cable-id="selectedCableId"
          :show-eez="showEez"
          :stats="stats"
          @select-cable="handleSelectCable"
          @toggle-eez="handleToggleEez"
        />
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
