<script setup lang="ts">
  import type { NodeType } from '~/types/defense-comms';

  useSeoMeta({
    title: 'Tactical Comms Network - mapcn-vue Examples',
    description:
      'Tactical communications network with HQ, relay, and field unit nodes connected by signal-strength links along the Arunachal Pradesh border.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Tactical Comms Network',
    description:
      'Communication nodes with signal-strength links and live degradation simulation.',
    category: 'Examples',
  });

  const {
    nodes,
    links,
    activeNodeTypes,
    stats,
    nodeTypes,
    toggleNodeType,
    startSimulation,
    cleanup,
  } = useCommsNetwork();
  onMounted(() => {
    startSimulation();
  });

  onUnmounted(() => {
    cleanup();
  });

  function handleToggleType(type: NodeType): void {
    toggleNodeType(type);
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
  import { ScatterplotLayer, LineLayer, TextLayer } from '@deck.gl/layers';

  const mapOptions = computed(() => ({
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [93.5, 27.5] as [number, number],
    zoom: 10,
  }));

  const { updateLayer } = useDeckLayers();

  const nodes = ref([
    { id: 'TAC-HQ-1', position: [93.4, 27.5], range: 30000, color: [255, 200, 0] },
    { id: 'RELAY-1', position: [93.45, 27.55], range: 20000, color: [0, 200, 150] },
  ]);

  function syncLayers() {
    updateLayer('comms-dots', new ScatterplotLayer({
      id: 'comms-dots',
      data: nodes.value,
      getPosition: (d) => d.position,
      getRadius: 6,
      getFillColor: (d) => [...d.color, 255],
      radiusUnits: 'pixels',
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
    title="Tactical Comms Network"
    description="Tactical communications network with HQ, relay, and field unit nodes connected by signal-strength links along the Arunachal Pradesh border region."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesCommsMapContainer
        :nodes="nodes"
        :links="links"
        class="size-full"
      />

      <MapPanel title="Comms">
        <ExamplesCommsControlPanel
          :active-node-types="activeNodeTypes"
          :stats="stats"
          :node-types="nodeTypes"
          :links="links"
          @toggle-type="handleToggleType"
        />
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
