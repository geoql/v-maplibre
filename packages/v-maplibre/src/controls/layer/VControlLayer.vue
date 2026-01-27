<script setup lang="ts">
  import { ref, watch, inject, onMounted } from 'vue';
  import { MapKey, injectStrict } from '../../utils';
  import { DeckLayersKey } from '../../layers/deckgl/_shared/useDeckOverlay';
  import { useMapControl } from '../_shared';
  import type { ControlPosition, LayerType } from './types';

  const props = withDefaults(
    defineProps<{
      layerId: string;
      position?: ControlPosition;
      visible?: boolean;
      opacity?: number;
      title?: string;
      layerType?: LayerType;
    }>(),
    {
      position: 'top-right',
      visible: true,
      opacity: 1,
      title: 'Layer Control',
      layerType: undefined,
    },
  );

  const emit = defineEmits<{
    'visibility-change': [visible: boolean];
    'opacity-change': [opacity: number];
    'update:visible': [visible: boolean];
    'update:opacity': [opacity: number];
  }>();

  const map = injectStrict(MapKey);
  const deckLayers = inject(DeckLayersKey, null);
  const containerRef = ref<HTMLElement | null>(null);
  const isVisible = ref(props.visible);
  const currentOpacity = ref(props.opacity);

  useMapControl(map, containerRef, props.position);

  // Function to detect layer type (called fresh each time, not cached)
  const getLayerType = (): LayerType | null => {
    if (props.layerType) return props.layerType;
    if (!map.value) return null;
    const maplibreLayer = map.value.getLayer(props.layerId);
    if (maplibreLayer) return 'maplibre';
    if (deckLayers) {
      const layers = deckLayers.getLayers();
      const deckLayer = (layers as Array<{ id: string }>).find(
        (l) => l.id === props.layerId,
      );
      if (deckLayer) return 'deckgl';
    }
    return null;
  };

  const getOpacityProperty = (): string | null => {
    if (!map.value || getLayerType() !== 'maplibre') return null;

    const layer = map.value.getLayer(props.layerId);
    if (!layer) return null;

    switch (layer.type) {
      case 'fill':
        return 'fill-opacity';
      case 'line':
        return 'line-opacity';
      case 'circle':
        return 'circle-opacity';
      case 'symbol':
        return 'icon-opacity';
      default:
        return null;
    }
  };

  const updateVisibility = (visible: boolean) => {
    const layerType = getLayerType();

    if (layerType === 'maplibre') {
      if (!map.value) return;
      const layer = map.value.getLayer(props.layerId);
      if (!layer) {
        console.warn(`MapLibre layer not found: ${props.layerId}`);
        return;
      }
      map.value.setLayoutProperty(
        props.layerId,
        'visibility',
        visible ? 'visible' : 'none',
      );
    } else if (layerType === 'deckgl') {
      if (!deckLayers) {
        console.warn(
          `deck.gl overlay not available for layer: ${props.layerId}`,
        );
        return;
      }
      const layers = deckLayers.getLayers();
      const existingLayer = (
        layers as Array<{ id: string; clone?: (props: object) => unknown }>
      ).find((l) => l.id === props.layerId);
      if (!existingLayer) {
        console.warn(`deck.gl layer not found: ${props.layerId}`);
        return;
      }
      if (typeof existingLayer.clone === 'function') {
        const updatedLayer = existingLayer.clone({ visible });
        deckLayers.updateLayer(props.layerId, updatedLayer);
      }
    } else {
      console.warn(`Layer not found in MapLibre or deck.gl: ${props.layerId}`);
      return;
    }

    emit('visibility-change', visible);
    emit('update:visible', visible);
  };

  const updateOpacity = (opacity: number) => {
    const layerType = getLayerType();

    if (layerType === 'maplibre') {
      const opacityProp = getOpacityProperty();
      if (!map.value || !opacityProp) return;
      const layer = map.value.getLayer(props.layerId);
      if (!layer) {
        console.warn(`MapLibre layer not found: ${props.layerId}`);
        return;
      }
      map.value.setPaintProperty(props.layerId, opacityProp, opacity);
    } else if (layerType === 'deckgl') {
      if (!deckLayers) {
        console.warn(
          `deck.gl overlay not available for layer: ${props.layerId}`,
        );
        return;
      }
      const layers = deckLayers.getLayers();
      const existingLayer = (
        layers as Array<{ id: string; clone?: (props: object) => unknown }>
      ).find((l) => l.id === props.layerId);
      if (!existingLayer) {
        console.warn(`deck.gl layer not found: ${props.layerId}`);
        return;
      }
      if (typeof existingLayer.clone === 'function') {
        const updatedLayer = existingLayer.clone({ opacity });
        deckLayers.updateLayer(props.layerId, updatedLayer);
      }
    } else {
      console.warn(`Layer not found in MapLibre or deck.gl: ${props.layerId}`);
      return;
    }

    emit('opacity-change', opacity);
    emit('update:opacity', opacity);
  };

  const toggleVisibility = () => {
    isVisible.value = !isVisible.value;
  };

  const handleOpacityInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    currentOpacity.value = Number(target.value) / 100;
  };

  watch(isVisible, (newValue) => {
    updateVisibility(newValue);
  });

  watch(currentOpacity, (newValue) => {
    updateOpacity(newValue);
  });

  watch(
    () => props.visible,
    (newValue) => {
      isVisible.value = newValue;
    },
  );

  watch(
    () => props.opacity,
    (newValue) => {
      currentOpacity.value = newValue;
    },
  );

  // Wait for layer to be available, then apply initial settings
  onMounted(() => {
    let applied = false;

    const checkAndApply = () => {
      if (applied) return true;
      // Use function directly to get fresh result (not cached computed)
      const layerType = getLayerType();
      if (layerType) {
        applied = true;
        updateVisibility(isVisible.value);
        updateOpacity(currentOpacity.value);
        return true;
      }
      return false;
    };

    // Try immediately
    if (checkAndApply()) return;

    // If layer not found, retry with increasing intervals
    // Total wait: ~10 seconds (enough for data fetching)
    const delays = [100, 200, 300, 500, 500, 1000, 1000, 1000, 2000, 3000];
    let index = 0;

    const retry = () => {
      if (checkAndApply() || index >= delays.length) return;
      setTimeout(() => {
        index++;
        retry();
      }, delays[index]);
    };

    retry();
  });
</script>

<template>
  <div ref="containerRef" class="v-layer-control">
    <div class="v-layer-control-header">
      <span class="v-layer-control-title">{{ title }}</span>
      <button
        type="button"
        class="v-layer-control-toggle"
        :class="{ 'is-hidden': !isVisible }"
        :aria-pressed="isVisible"
        :title="isVisible ? 'Hide layer' : 'Show layer'"
        @click="toggleVisibility"
      >
        <svg
          v-if="isVisible"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M8 3C4.5 3 1.5 5.5 0.5 8C1.5 10.5 4.5 13 8 13C11.5 13 14.5 10.5 15.5 8C14.5 5.5 11.5 3 8 3Z"
            stroke="currentColor"
            stroke-width="1.25"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle
            cx="8"
            cy="8"
            r="2.5"
            stroke="currentColor"
            stroke-width="1.25"
          />
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M2 2L14 14M6.5 6.5C5.9 7.1 5.5 7.9 5.5 8.8C5.5 10.4 6.9 11.5 8 11.5C8.9 11.5 9.7 11.1 10.3 10.5M8 3C4.5 3 1.5 5.5 0.5 8C1 9.2 1.8 10.3 2.8 11.2M13.2 11.2C14.2 10.3 15 9.2 15.5 8C14.5 5.5 11.5 3 8 3"
            stroke="currentColor"
            stroke-width="1.25"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <div class="v-layer-control-slider-row">
      <input
        type="range"
        min="0"
        max="100"
        :value="Math.round(currentOpacity * 100)"
        class="v-layer-control-slider"
        :disabled="!isVisible"
        @input="handleOpacityInput"
      />
      <span class="v-layer-control-value"
        >{{ Math.round(currentOpacity * 100) }}%</span
      >
    </div>

    <slot></slot>
  </div>
</template>

<style>
  .v-layer-control {
    min-width: 180px;
    background: var(--color-card, #fff);
    border-radius: var(--radius, 0.5rem);
    border: 1px solid var(--color-border, #e5e7eb);
    box-shadow:
      0 1px 3px 0 rgb(0 0 0 / 0.1),
      0 1px 2px -1px rgb(0 0 0 / 0.1);
    font-family:
      ui-sans-serif,
      system-ui,
      -apple-system,
      sans-serif;
    font-size: 13px;
    overflow: hidden;
    padding: 10px 12px;
  }

  .v-layer-control-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .v-layer-control-title {
    font-weight: 500;
    font-size: 13px;
    color: var(--color-card-foreground, #111827);
    line-height: 1;
  }

  .v-layer-control-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    border-radius: calc(var(--radius, 0.5rem) - 2px);
    background: transparent;
    color: var(--color-foreground, #374151);
    cursor: pointer;
    transition:
      background 0.15s ease,
      color 0.15s ease;
    flex-shrink: 0;
  }

  .v-layer-control-toggle:hover {
    background: var(--color-accent, #f3f4f6);
  }

  .v-layer-control-toggle.is-hidden {
    color: var(--color-muted-foreground, #9ca3af);
  }

  .v-layer-control-slider-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .v-layer-control-slider {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    background: var(--color-secondary, #e5e7eb);
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }

  .v-layer-control-slider:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .v-layer-control-value {
    font-size: 11px;
    font-weight: 500;
    color: var(--color-muted-foreground, #6b7280);
    font-variant-numeric: tabular-nums;
    min-width: 32px;
    text-align: right;
  }

  .v-layer-control-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--color-primary, #3b82f6);
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
  }

  .v-layer-control-slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--color-primary, #3b82f6);
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
  }

  .v-layer-control-slider:disabled::-webkit-slider-thumb {
    cursor: not-allowed;
  }

  .v-layer-control-slider:disabled::-moz-range-thumb {
    cursor: not-allowed;
  }

  .v-layer-control-slider:focus {
    outline: none;
  }

  .v-layer-control-slider:focus::-webkit-slider-thumb {
    box-shadow: 0 0 0 3px
      color-mix(in srgb, var(--color-primary, #3b82f6) 20%, transparent);
  }
</style>
