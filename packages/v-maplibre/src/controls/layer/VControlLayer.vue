<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch, computed, inject } from 'vue';
  import type { Map as MapLibreMap } from 'maplibre-gl';
  import { MapKey, injectStrict } from '../../utils';
  import { DeckLayersKey } from '../../layers/deckgl/_shared/useDeckOverlay';
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
  const container = ref<HTMLElement | null>(null);
  const isVisible = ref(props.visible);
  const currentOpacity = ref(props.opacity);

  const detectedLayerType = computed((): LayerType | null => {
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
  });

  const opacityProperty = computed(() => {
    if (!map.value || detectedLayerType.value !== 'maplibre') return null;

    const layer = map.value.getLayer(props.layerId);
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
      default:
        console.warn(`Unsupported layer type: ${layerType}`);
        return null;
    }
  });

  class LayerControl implements maplibregl.IControl {
    private _container?: HTMLElement;

    onAdd(_mapInstance: MapLibreMap): HTMLElement {
      this._container = document.createElement('div');
      this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
      this._container.style.cssText = `
      background: white;
      padding: 10px;
      border-radius: 4px;
      box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
      min-width: 200px;
    `;

      const title = document.createElement('div');
      title.textContent = props.title;
      title.style.cssText = `
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 12px;
      color: #333;
    `;
      this._container.appendChild(title);

      const toggleContainer = document.createElement('div');
      toggleContainer.style.cssText = `
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    `;

      const toggleButton = document.createElement('button');
      toggleButton.type = 'button';
      toggleButton.textContent = isVisible.value ? '👁️ Visible' : '👁️‍🗨️ Hidden';
      toggleButton.style.cssText = `
      flex: 1;
      padding: 6px 12px;
      border: 1px solid #ddd;
      border-radius: 3px;
      background: ${isVisible.value ? '#4CAF50' : '#f44336'};
      color: white;
      cursor: pointer;
      font-size: 11px;
      transition: background 0.2s;
    `;
      toggleButton.onclick = () => {
        isVisible.value = !isVisible.value;
        toggleButton.textContent = isVisible.value ? '👁️ Visible' : '👁️‍🗨️ Hidden';
        toggleButton.style.background = isVisible.value ? '#4CAF50' : '#f44336';
      };
      toggleContainer.appendChild(toggleButton);
      this._container.appendChild(toggleContainer);

      const opacityContainer = document.createElement('div');
      opacityContainer.style.cssText = 'margin-top: 8px;';

      const opacityLabel = document.createElement('label');
      opacityLabel.textContent = `Opacity: ${Math.round(currentOpacity.value * 100)}%`;
      opacityLabel.style.cssText = `
      display: block;
      font-size: 11px;
      color: #666;
      margin-bottom: 4px;
    `;
      opacityContainer.appendChild(opacityLabel);

      const opacitySlider = document.createElement('input');
      opacitySlider.type = 'range';
      opacitySlider.min = '0';
      opacitySlider.max = '100';
      opacitySlider.value = String(Math.round(currentOpacity.value * 100));
      opacitySlider.style.cssText = `
      width: 100%;
      cursor: pointer;
    `;
      opacitySlider.oninput = () => {
        const value = Number(opacitySlider.value) / 100;
        currentOpacity.value = value;
        opacityLabel.textContent = `Opacity: ${opacitySlider.value}%`;
      };
      opacityContainer.appendChild(opacitySlider);
      this._container.appendChild(opacityContainer);

      container.value = this._container;
      return this._container;
    }

    onRemove(): void {
      this._container?.parentNode?.removeChild(this._container);
      container.value = null;
    }
  }

  let control: LayerControl | null = null;

  const updateVisibility = (visible: boolean) => {
    const layerType = detectedLayerType.value;

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
    const layerType = detectedLayerType.value;

    if (layerType === 'maplibre') {
      if (!map.value || !opacityProperty.value) return;
      const layer = map.value.getLayer(props.layerId);
      if (!layer) {
        console.warn(`MapLibre layer not found: ${props.layerId}`);
        return;
      }
      map.value.setPaintProperty(props.layerId, opacityProperty.value, opacity);
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

  onMounted(() => {
    if (!map.value) return;

    control = new LayerControl();
    map.value.addControl(control, props.position);

    updateVisibility(isVisible.value);
    updateOpacity(currentOpacity.value);
  });

  onUnmounted(() => {
    if (control && map.value) {
      map.value.removeControl(control as unknown as maplibregl.IControl);
      control = null;
    }
  });
</script>

<template>
  <slot></slot>
</template>
