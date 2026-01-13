<script setup lang="ts">
  import { computed } from 'vue';
  import { VControlLidar } from '@geoql/v-maplibre';
  import type { LidarControlOptions, ColorScheme } from '@geoql/v-maplibre';

  export interface MapControlLidarProps {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    options?: LidarControlOptions;
    defaultUrl?: string;
    collapsed?: boolean;
    pointSize?: number;
    colorScheme?: ColorScheme;
    pickable?: boolean;
  }

  const props = withDefaults(defineProps<MapControlLidarProps>(), {
    position: 'top-right',
    collapsed: true,
    pointSize: 2,
    colorScheme: 'elevation',
    pickable: true,
  });

  const emit = defineEmits<{
    load: [info: unknown];
    loadstart: [];
    loaderror: [error: Error];
    unload: [];
    statechange: [];
    stylechange: [];
    collapse: [];
    expand: [];
    streamingstart: [];
    streamingstop: [];
    streamingprogress: [];
    budgetreached: [];
  }>();

  const computedOptions = computed<LidarControlOptions>(() => ({
    collapsed: props.collapsed,
    pointSize: props.pointSize,
    colorScheme: props.colorScheme,
    pickable: props.pickable,
    autoZoom: true,
    ...props.options,
  }));
</script>

<template>
  <VControlLidar
    :position="props.position"
    :options="computedOptions"
    :default-url="props.defaultUrl"
    @load="emit('load', $event)"
    @loadstart="emit('loadstart')"
    @loaderror="emit('loaderror', $event)"
    @unload="emit('unload')"
    @statechange="emit('statechange')"
    @stylechange="emit('stylechange')"
    @collapse="emit('collapse')"
    @expand="emit('expand')"
    @streamingstart="emit('streamingstart')"
    @streamingstop="emit('streamingstop')"
    @streamingprogress="emit('streamingprogress')"
    @budgetreached="emit('budgetreached')"
  ></VControlLidar>
</template>
