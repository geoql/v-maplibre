<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';
  import { MapKey, injectStrict } from '../../utils';
  import { lidarControlEvents as events } from './events';
  import type {
    ControlPosition,
    LidarControlOptions,
    ColorScheme,
    PointCloudInfo,
  } from './types';

  const defaultOptions: LidarControlOptions = {
    collapsed: true,
    pointSize: 2,
    colorScheme: 'elevation',
    pickable: false,
    autoZoom: true,
  };

  const props = withDefaults(
    defineProps<{
      options?: LidarControlOptions;
      position?: ControlPosition;
      defaultUrl?: string;
    }>(),
    {
      options: undefined,
      position: 'top-right',
      defaultUrl: undefined,
    },
  );

  const emit = defineEmits(events);

  const map = injectStrict(MapKey);

  interface LidarControlInstance {
    on: (event: string, handler: (data?: unknown) => void) => void;
    off: (event: string, handler: (data?: unknown) => void) => void;
    loadPointCloud: (
      source: string | File | ArrayBuffer,
    ) => Promise<PointCloudInfo>;
    unloadPointCloud: (id?: string) => void;
    flyToPointCloud: (id?: string) => void;
    setPointSize: (size: number) => void;
    setColorScheme: (scheme: ColorScheme) => void;
    setOpacity: (opacity: number) => void;
    setPickable: (pickable: boolean) => void;
    setUsePercentile: (use: boolean) => void;
    setElevationRange: (min: number, max: number) => void;
    clearElevationRange: () => void;
    setZOffset: (offset: number) => void;
    setZOffsetEnabled: (enabled: boolean) => void;
    toggle: () => void;
    expand: () => void;
    collapse: () => void;
    getState: () => unknown;
    getPointClouds: () => PointCloudInfo[];
    stopStreaming: (id?: string) => void;
    isStreaming: (id?: string) => boolean;
  }

  const control = ref<LidarControlInstance | null>(null);

  onMounted(async () => {
    await addControl();
  });

  onUnmounted(() => {
    if (control.value && map.value) {
      map.value.removeControl(control.value as unknown as maplibregl.IControl);
      control.value = null;
    }
  });

  const addControl = async (): Promise<void> => {
    const { LidarControl } = await import('maplibre-gl-lidar');

    control.value = new LidarControl(
      props.options || defaultOptions,
    ) as unknown as LidarControlInstance;

    map.value!.addControl(
      control.value as unknown as maplibregl.IControl,
      props.position,
    );

    events.forEach((event: string) => {
      control.value!.on(event, (data?: unknown) => {
        emit(event, data);
      });
    });

    if (props.defaultUrl) {
      control.value.loadPointCloud(props.defaultUrl);
    }
  };

  defineExpose({
    loadPointCloud: (source: string | File | ArrayBuffer) =>
      control.value?.loadPointCloud(source),
    unloadPointCloud: (id?: string) => control.value?.unloadPointCloud(id),
    flyToPointCloud: (id?: string) => control.value?.flyToPointCloud(id),
    setPointSize: (size: number) => control.value?.setPointSize(size),
    setColorScheme: (scheme: ColorScheme) =>
      control.value?.setColorScheme(scheme),
    setOpacity: (opacity: number) => control.value?.setOpacity(opacity),
    setPickable: (pickable: boolean) => control.value?.setPickable(pickable),
    setUsePercentile: (use: boolean) => control.value?.setUsePercentile(use),
    setElevationRange: (min: number, max: number) =>
      control.value?.setElevationRange(min, max),
    clearElevationRange: () => control.value?.clearElevationRange(),
    setZOffset: (offset: number) => control.value?.setZOffset(offset),
    setZOffsetEnabled: (enabled: boolean) =>
      control.value?.setZOffsetEnabled(enabled),
    toggle: () => control.value?.toggle(),
    expand: () => control.value?.expand(),
    collapse: () => control.value?.collapse(),
    getState: () => control.value?.getState(),
    getPointClouds: () => control.value?.getPointClouds(),
    stopStreaming: (id?: string) => control.value?.stopStreaming(id),
    isStreaming: (id?: string) => control.value?.isStreaming(id),
    getControl: () => control.value,
  });
</script>
