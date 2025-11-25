<script setup lang="ts">
  import { AttributionControl } from 'maplibre-gl';
  import { onMounted, useSlots } from 'vue';
  import { MapKey, injectStrict } from '../../utils';
  import type { AttributionControlOptions, ControlPosition } from './types';

  const defaultOptions: AttributionControlOptions = {
    compact: false,
    customAttribution: undefined,
  };

  const props = withDefaults(
    defineProps<{
      options?: AttributionControlOptions;
      position?: ControlPosition;
    }>(),
    {
      options: undefined,
      position: 'bottom-right',
    },
  );

  const slots = useSlots();

  const map = injectStrict(MapKey);

  onMounted(() => {
    addControl();
  });

  const addControl = (): void => {
    let options = defaultOptions;
    if (props.options) {
      options = {
        ...props.options,
      };
    }
    if (slots && slots.default?.()) {
      options.customAttribution = slots.default()[0]!
        .children as unknown as string;
    }
    const control = new AttributionControl(options);
    map.value!.addControl(control, props.position);
  };
</script>

<template>
  <slot></slot>
</template>
