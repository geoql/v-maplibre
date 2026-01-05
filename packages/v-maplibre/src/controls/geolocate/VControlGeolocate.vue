<script setup lang="ts">
  import { GeolocateControl } from 'maplibre-gl';
  import { onMounted } from 'vue';
  import { MapKey, injectStrict } from '../../utils';
  import { geolocateControlEvents as events } from './events';
  import type { ControlPosition, GeolocateControlOptions } from './types';

  const defaultOptions: GeolocateControlOptions = {
    fitBoundsOptions: {
      linear: false,
      offset: [0, 0],
      maxZoom: 22,
    },
    positionOptions: {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 6000,
    },
    trackUserLocation: true,
    showAccuracyCircle: true,
    showUserLocation: true,
  };

  const props = withDefaults(
    defineProps<{
      options?: GeolocateControlOptions;
      position?: ControlPosition;
    }>(),
    {
      options: undefined,
      position: 'top-left',
    },
  );

  const emit = defineEmits(events);

  const map = injectStrict(MapKey);

  onMounted(() => {
    addControl();
  });

  const addControl = (): void => {
    const control = new GeolocateControl(props.options || defaultOptions);
    map.value!.addControl(control, props.position);
    events.forEach((event: string) => {
      control.on(event, () => {
        emit(event);
      });
    });
  };
</script>
