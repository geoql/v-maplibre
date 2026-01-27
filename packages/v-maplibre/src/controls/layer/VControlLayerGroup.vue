<script setup lang="ts">
  import { ref, watch, inject, onMounted } from 'vue';
  import { MapKey, injectStrict } from '../../utils';
  import { DeckLayersKey } from '../../layers/deckgl/_shared/useDeckOverlay';
  import { useMapControl } from '../_shared';
  import type { ControlPosition, LayerType } from './types';

  export interface LayerConfig {
    id: string;
    title: string;
    visible?: boolean;
    opacity?: number;
    type?: LayerType;
  }

  const props = withDefaults(
    defineProps<{
      layers: LayerConfig[];
      position?: ControlPosition;
      title?: string;
      collapsible?: boolean;
      collapsed?: boolean;
    }>(),
    {
      position: 'top-right',
      title: 'Layers',
      collapsible: true,
      collapsed: false,
    },
  );

  const emit = defineEmits<{
    'visibility-change': [data: { layerId: string; visible: boolean }];
    'opacity-change': [data: { layerId: string; opacity: number }];
    'update:layers': [layers: LayerConfig[]];
  }>();

  const map = injectStrict(MapKey);
  const deckLayers = inject(DeckLayersKey, null);
  const containerRef = ref<HTMLElement | null>(null);
  const isCollapsed = ref(props.collapsed);

  const layerStates = ref<Map<string, { visible: boolean; opacity: number }>>(
    new Map(),
  );

  useMapControl(map, containerRef, props.position);

  const initLayerStates = () => {
    for (const layer of props.layers) {
      layerStates.value.set(layer.id, {
        visible: layer.visible ?? true,
        opacity: layer.opacity ?? 1,
      });
    }
  };

  const getLayerType = (
    layerId: string,
    configType?: LayerType,
  ): LayerType | null => {
    if (configType) return configType;
    if (!map.value) return null;

    const maplibreLayer = map.value.getLayer(layerId);
    if (maplibreLayer) return 'maplibre';

    if (deckLayers) {
      const layers = deckLayers.getLayers();
      const deckLayer = (layers as Array<{ id: string }>).find(
        (l) => l.id === layerId,
      );
      if (deckLayer) return 'deckgl';
    }
    return null;
  };

  const getOpacityProperty = (layerId: string): string | null => {
    if (!map.value) return null;
    const layer = map.value.getLayer(layerId);
    if (!layer) return null;

    const layerType = layer.type;
    switch (layerType) {
      case 'fill':
        return 'fill-opacity';
      case 'line':
        return 'line-opacity';
      case 'circle':
        return 'circle-opacity';
      case 'symbol':
        return 'icon-opacity';
      case 'raster':
        return 'raster-opacity';
      default:
        return null;
    }
  };

  const updateVisibility = (
    layerId: string,
    visible: boolean,
    configType?: LayerType,
  ) => {
    const layerType = getLayerType(layerId, configType);

    if (layerType === 'maplibre') {
      if (!map.value) return;
      const layer = map.value.getLayer(layerId);
      if (!layer) {
        console.warn(
          `[VControlLayerGroup] MapLibre layer not found: ${layerId}`,
        );
        return;
      }
      map.value.setLayoutProperty(
        layerId,
        'visibility',
        visible ? 'visible' : 'none',
      );
    } else if (layerType === 'deckgl') {
      if (!deckLayers) {
        console.warn(
          `[VControlLayerGroup] deck.gl overlay not available for layer: ${layerId}`,
        );
        return;
      }
      const layers = deckLayers.getLayers();
      const existingLayer = (
        layers as Array<{ id: string; clone?: (props: object) => unknown }>
      ).find((l) => l.id === layerId);
      if (!existingLayer) {
        console.warn(
          `[VControlLayerGroup] deck.gl layer not found: ${layerId}`,
        );
        return;
      }
      if (typeof existingLayer.clone === 'function') {
        const updatedLayer = existingLayer.clone({ visible });
        deckLayers.updateLayer(layerId, updatedLayer);
      }
    } else {
      console.warn(`[VControlLayerGroup] Layer not found: ${layerId}`);
      return;
    }

    emit('visibility-change', { layerId, visible });
  };

  const updateOpacity = (
    layerId: string,
    opacity: number,
    configType?: LayerType,
  ) => {
    const layerType = getLayerType(layerId, configType);

    if (layerType === 'maplibre') {
      const opacityProp = getOpacityProperty(layerId);
      if (!map.value || !opacityProp) return;
      const layer = map.value.getLayer(layerId);
      if (!layer) {
        console.warn(
          `[VControlLayerGroup] MapLibre layer not found: ${layerId}`,
        );
        return;
      }
      map.value.setPaintProperty(layerId, opacityProp, opacity);
    } else if (layerType === 'deckgl') {
      if (!deckLayers) {
        console.warn(
          `[VControlLayerGroup] deck.gl overlay not available for layer: ${layerId}`,
        );
        return;
      }
      const layers = deckLayers.getLayers();
      const existingLayer = (
        layers as Array<{ id: string; clone?: (props: object) => unknown }>
      ).find((l) => l.id === layerId);
      if (!existingLayer) {
        console.warn(
          `[VControlLayerGroup] deck.gl layer not found: ${layerId}`,
        );
        return;
      }
      if (typeof existingLayer.clone === 'function') {
        const updatedLayer = existingLayer.clone({ opacity });
        deckLayers.updateLayer(layerId, updatedLayer);
      }
    } else {
      console.warn(`[VControlLayerGroup] Layer not found: ${layerId}`);
      return;
    }

    emit('opacity-change', { layerId, opacity });
  };

  const toggleVisibility = (layer: LayerConfig) => {
    const state = layerStates.value.get(layer.id);
    if (!state) return;

    const newVisible = !state.visible;
    state.visible = newVisible;
    updateVisibility(layer.id, newVisible, layer.type);
  };

  const handleOpacityInput = (layer: LayerConfig, event: Event) => {
    const target = event.target as HTMLInputElement;
    const opacity = Number(target.value) / 100;

    const state = layerStates.value.get(layer.id);
    if (!state) return;

    state.opacity = opacity;
    updateOpacity(layer.id, opacity, layer.type);
  };

  const getState = (layerId: string) => {
    return layerStates.value.get(layerId) ?? { visible: true, opacity: 1 };
  };

  const toggleCollapse = () => {
    if (props.collapsible) {
      isCollapsed.value = !isCollapsed.value;
    }
  };

  watch(
    () => props.layers,
    () => {
      initLayerStates();
    },
    { deep: true },
  );

  watch(
    () => props.collapsed,
    (newValue) => {
      isCollapsed.value = newValue;
    },
  );

  onMounted(() => {
    initLayerStates();
    // Apply initial states
    for (const layer of props.layers) {
      const state = getState(layer.id);
      updateVisibility(layer.id, state.visible, layer.type);
      updateOpacity(layer.id, state.opacity, layer.type);
    }
  });
</script>

<template>
  <div
    ref="containerRef"
    class="v-layer-group"
    :class="{ 'is-collapsed': isCollapsed }"
  >
    <button
      v-if="collapsible"
      type="button"
      class="v-layer-group-header"
      @click="toggleCollapse"
    >
      <span class="v-layer-group-title">{{ title }}</span>
      <svg
        class="v-layer-group-chevron"
        :class="{ 'is-collapsed': isCollapsed }"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
      >
        <path
          d="M3 5L7 9L11 5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <div v-else class="v-layer-group-header is-static">
      <span class="v-layer-group-title">{{ title }}</span>
    </div>

    <div v-if="!isCollapsed" class="v-layer-group-content">
      <div v-for="layer in layers" :key="layer.id" class="v-layer-group-item">
        <div class="v-layer-group-item-header">
          <span class="v-layer-group-item-title">{{ layer.title }}</span>
          <button
            type="button"
            class="v-layer-group-toggle"
            :class="{ 'is-hidden': !getState(layer.id).visible }"
            :aria-pressed="getState(layer.id).visible"
            :title="getState(layer.id).visible ? 'Hide layer' : 'Show layer'"
            @click="toggleVisibility(layer)"
          >
            <svg
              v-if="getState(layer.id).visible"
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
        <div class="v-layer-group-slider-row">
          <input
            type="range"
            min="0"
            max="100"
            :value="Math.round(getState(layer.id).opacity * 100)"
            class="v-layer-group-slider"
            :disabled="!getState(layer.id).visible"
            @input="handleOpacityInput(layer, $event)"
          />
          <span class="v-layer-group-value"
            >{{ Math.round(getState(layer.id).opacity * 100) }}%</span
          >
        </div>
      </div>
    </div>

    <slot></slot>
  </div>
</template>

<style>
  .v-layer-group {
    min-width: 140px;
    max-width: 200px;
    margin: 10px;
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
    font-size: 12px;
    overflow: hidden;
    /* Required: MapLibre control containers have pointer-events:none */
    pointer-events: auto;
  }

  .v-layer-group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
    min-height: 36px;
    padding: 8px 10px;
    border: none;
    border-bottom: 1px solid var(--color-border, #e5e7eb);
    background: transparent;
    cursor: pointer;
    text-align: left;
    line-height: 1;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  .v-layer-group-header.is-static {
    cursor: default;
  }

  .v-layer-group-header:not(.is-static):hover {
    background: var(--color-accent, #f3f4f6);
  }

  .v-layer-group.is-collapsed .v-layer-group-header {
    border-bottom: none;
  }

  .v-layer-group-title {
    font-weight: 500;
    font-size: 11px;
    color: var(--color-card-foreground, #111827);
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .v-layer-group-chevron {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    color: var(--color-muted-foreground, #6b7280);
    transition: transform 0.15s ease;
    flex-shrink: 0;
  }

  .v-layer-group-chevron.is-collapsed {
    transform: rotate(-90deg);
  }

  .v-layer-group-content {
    display: flex;
    flex-direction: column;
  }

  .v-layer-group-item {
    padding: 6px 10px 8px;
    border-bottom: 1px solid var(--color-border, #e5e7eb);
  }

  .v-layer-group-item:last-child {
    border-bottom: none;
  }

  .v-layer-group-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;
  }

  .v-layer-group-item-title {
    font-weight: 500;
    font-size: 11px;
    color: var(--color-foreground, #374151);
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .v-layer-group-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
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

  .v-layer-group-toggle svg {
    width: 14px;
    height: 14px;
  }

  .v-layer-group-toggle:hover {
    background: var(--color-accent, #f3f4f6);
  }

  .v-layer-group-toggle.is-hidden {
    color: var(--color-muted-foreground, #9ca3af);
  }

  .v-layer-group-slider-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .v-layer-group-slider {
    flex: 1;
    height: 3px;
    border-radius: 2px;
    background: var(--color-secondary, #e5e7eb);
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }

  .v-layer-group-slider:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .v-layer-group-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--color-primary, #3b82f6);
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
  }

  .v-layer-group-slider::-moz-range-thumb {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--color-primary, #3b82f6);
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
  }

  .v-layer-group-slider:disabled::-webkit-slider-thumb {
    cursor: not-allowed;
  }

  .v-layer-group-slider:disabled::-moz-range-thumb {
    cursor: not-allowed;
  }

  .v-layer-group-slider:focus {
    outline: none;
  }

  .v-layer-group-slider:focus::-webkit-slider-thumb {
    box-shadow: 0 0 0 3px
      color-mix(in srgb, var(--color-primary, #3b82f6) 20%, transparent);
  }

  .v-layer-group-value {
    font-size: 10px;
    font-weight: 500;
    color: var(--color-muted-foreground, #6b7280);
    font-variant-numeric: tabular-nums;
    min-width: 28px;
    text-align: right;
  }
</style>
