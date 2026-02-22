<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';
  import { MapKey, injectStrict } from '../../utils';
  import { lidarControlEvents as events } from './events';
  import type {
    ControlPosition,
    LidarControlOptions,
    ColorScheme,
    ColormapName,
    ColorRangeConfig,
    PointCloudInfo,
    StreamingLoaderOptions,
    CopcLoadingMode,
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
      options?: { loadingMode?: CopcLoadingMode },
    ) => Promise<PointCloudInfo>;
    loadPointCloudStreaming: (
      source: string | File | ArrayBuffer,
      options?: StreamingLoaderOptions,
    ) => Promise<PointCloudInfo>;
    loadPointCloudEptStreaming: (
      eptUrl: string,
      options?: StreamingLoaderOptions,
    ) => Promise<PointCloudInfo>;
    unloadPointCloud: (id?: string) => void;
    flyToPointCloud: (id?: string) => void;
    setPointSize: (size: number) => void;
    setOpacity: (opacity: number) => void;
    setColorScheme: (scheme: ColorScheme) => void;
    setColormap: (colormap: ColormapName) => void;
    getColormap: () => ColormapName;
    setColorRange: (config: ColorRangeConfig) => void;
    getColorRange: () => ColorRangeConfig;
    setUsePercentile: (use: boolean) => void;
    getUsePercentile: () => boolean;
    setPickable: (pickable: boolean) => void;
    setElevationRange: (min: number, max: number) => void;
    clearElevationRange: () => void;
    setPointBudget: (budget: number) => void;
    setZOffset: (offset: number) => void;
    setZOffsetEnabled: (enabled: boolean) => void;
    getZOffset: () => number;
    setTerrain: (enabled: boolean) => void;
    getTerrain: () => boolean;
    setPickInfoFields: (fields?: string[]) => void;
    getPickInfoFields: () => string[] | undefined;
    setClassificationVisibility: (code: number, visible: boolean) => void;
    showAllClassifications: () => void;
    hideAllClassifications: () => void;
    getHiddenClassifications: () => number[];
    getAvailableClassifications: () => number[];
    toggle: () => void;
    expand: () => void;
    collapse: () => void;
    getState: () => unknown;
    getPointClouds: () => PointCloudInfo[];
    stopStreaming: (id?: string) => void;
    isStreaming: (id?: string) => boolean;
    getStreamingProgress: () => unknown;
    getMap: () => unknown;
    getPanelElement: () => HTMLElement | null;
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
    loadPointCloud: (
      source: string | File | ArrayBuffer,
      options?: { loadingMode?: CopcLoadingMode },
    ) => control.value?.loadPointCloud(source, options),
    loadPointCloudStreaming: (
      source: string | File | ArrayBuffer,
      options?: StreamingLoaderOptions,
    ) => control.value?.loadPointCloudStreaming(source, options),
    loadPointCloudEptStreaming: (
      eptUrl: string,
      options?: StreamingLoaderOptions,
    ) => control.value?.loadPointCloudEptStreaming(eptUrl, options),
    unloadPointCloud: (id?: string) => control.value?.unloadPointCloud(id),
    flyToPointCloud: (id?: string) => control.value?.flyToPointCloud(id),
    setPointSize: (size: number) => control.value?.setPointSize(size),
    setColorScheme: (scheme: ColorScheme) =>
      control.value?.setColorScheme(scheme),
    setColormap: (colormap: ColormapName) =>
      control.value?.setColormap(colormap),
    getColormap: () => control.value?.getColormap(),
    setColorRange: (config: ColorRangeConfig) =>
      control.value?.setColorRange(config),
    getColorRange: () => control.value?.getColorRange(),
    setOpacity: (opacity: number) => control.value?.setOpacity(opacity),
    setPickable: (pickable: boolean) => control.value?.setPickable(pickable),
    setUsePercentile: (use: boolean) => control.value?.setUsePercentile(use),
    getUsePercentile: () => control.value?.getUsePercentile(),
    setElevationRange: (min: number, max: number) =>
      control.value?.setElevationRange(min, max),
    clearElevationRange: () => control.value?.clearElevationRange(),
    setPointBudget: (budget: number) => control.value?.setPointBudget(budget),
    setZOffset: (offset: number) => control.value?.setZOffset(offset),
    setZOffsetEnabled: (enabled: boolean) =>
      control.value?.setZOffsetEnabled(enabled),
    getZOffset: () => control.value?.getZOffset(),
    setTerrain: (enabled: boolean) => control.value?.setTerrain(enabled),
    getTerrain: () => control.value?.getTerrain(),
    setPickInfoFields: (fields?: string[]) =>
      control.value?.setPickInfoFields(fields),
    getPickInfoFields: () => control.value?.getPickInfoFields(),
    setClassificationVisibility: (code: number, visible: boolean) =>
      control.value?.setClassificationVisibility(code, visible),
    showAllClassifications: () => control.value?.showAllClassifications(),
    hideAllClassifications: () => control.value?.hideAllClassifications(),
    getHiddenClassifications: () => control.value?.getHiddenClassifications(),
    getAvailableClassifications: () =>
      control.value?.getAvailableClassifications(),
    toggle: () => control.value?.toggle(),
    expand: () => control.value?.expand(),
    collapse: () => control.value?.collapse(),
    getState: () => control.value?.getState(),
    getPointClouds: () => control.value?.getPointClouds(),
    stopStreaming: (id?: string) => control.value?.stopStreaming(id),
    isStreaming: (id?: string) => control.value?.isStreaming(id),
    getStreamingProgress: () => control.value?.getStreamingProgress(),
    getMap: () => control.value?.getMap(),
    getPanelElement: () => control.value?.getPanelElement(),
    getControl: () => control.value,
  });
</script>
