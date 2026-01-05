<script setup lang="ts">
  import { FullscreenControl } from 'maplibre-gl';
  import { onMounted } from 'vue';
  import { MapKey, injectStrict } from '../../utils';
  import type { ControlPosition, FullscreenControlOptions } from './types';

  const defaultOptions: FullscreenControlOptions = {
    container: undefined,
  };

  const props = withDefaults(
    defineProps<{
      options?: FullscreenControlOptions;
      position?: ControlPosition;
    }>(),
    {
      options: undefined,
      position: 'top-left',
    },
  );

  const map = injectStrict(MapKey);

  onMounted(() => {
    addControl();
  });

  const addControl = (): void => {
    const control = new FullscreenControl(props.options || defaultOptions);
    map.value!.addControl(control, props.position);
  };
</script>
