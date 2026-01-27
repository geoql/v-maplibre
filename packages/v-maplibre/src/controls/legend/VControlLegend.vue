<script setup lang="ts">
  import { ref, watch, computed, inject, onMounted } from 'vue';
  import { MapKey, injectStrict } from '../../utils';
  import { DeckLayersKey } from '../../layers/deckgl/_shared/useDeckOverlay';
  import type {
    ControlPosition,
    LegendType,
    CategoryLegendItem,
    GradientLegendItem,
    SizeLegendItem,
    LegendItem,
    FilterState,
    ExpressionValue,
    DeckLayerWithExtensions,
  } from './types';

  const props = withDefaults(
    defineProps<{
      layerIds: string[];
      type?: LegendType;
      items?: LegendItem[];
      position?: ControlPosition;
      property?: string;
      autoGenerate?: boolean;
      title?: string;
      collapsed?: boolean;
      interactive?: boolean;
    }>(),
    {
      type: 'category',
      position: 'top-right',
      autoGenerate: false,
      title: 'Legend',
      collapsed: false,
      interactive: true,
    },
  );

  const emit = defineEmits<{
    'item-click': [data: { item: LegendItem; index: number; visible: boolean }];
    'filter-change': [data: { filter: FilterState; layerIds: string[] }];
    'update:filter': [filter: FilterState];
  }>();

  const map = injectStrict(MapKey);
  const deckLayers = inject(DeckLayersKey, null);
  const isCollapsed = ref(props.collapsed);
  const categoryItemVisibility = ref<Map<string | number, boolean>>(new Map());
  const generatedItems = ref<LegendItem[]>([]);

  const positionClasses: Record<ControlPosition, string> = {
    'top-left': 'top-2.5 left-2.5',
    'top-right': 'top-2.5 right-2.5',
    'bottom-left': 'bottom-7 left-2.5',
    'bottom-right': 'bottom-7 right-2.5',
  };

  const parseMatchExpression = (
    expression: ExpressionValue[],
  ): CategoryLegendItem[] => {
    const items: CategoryLegendItem[] = [];
    const defaultColor = expression[expression.length - 1] as string;

    for (let i = 2; i < expression.length - 1; i += 2) {
      const value = expression[i];
      const color = expression[i + 1] as string;

      if (Array.isArray(value)) {
        for (const v of value) {
          items.push({
            value: v as string | number,
            label: String(v),
            color,
            visible: true,
          });
        }
      } else {
        items.push({
          value: value as string | number,
          label: String(value),
          color,
          visible: true,
        });
      }
    }

    if (items.length > 0 && defaultColor && typeof defaultColor === 'string') {
      items.push({
        value: '__default__',
        label: 'Other',
        color: defaultColor,
        visible: true,
      });
    }

    return items;
  };

  const parseStepExpression = (
    expression: ExpressionValue[],
  ): GradientLegendItem | null => {
    const colors: string[] = [];
    const stops: number[] = [];

    const defaultColor = expression[2] as string;
    colors.push(defaultColor);

    for (let i = 3; i < expression.length; i += 2) {
      const stop = expression[i] as number;
      const color = expression[i + 1] as string;
      stops.push(stop);
      colors.push(color);
    }

    if (stops.length === 0) return null;

    return {
      min: stops[0],
      max: stops[stops.length - 1],
      colors,
      stops,
    };
  };

  const parseInterpolateExpression = (
    expression: ExpressionValue[],
  ): GradientLegendItem | null => {
    const colors: string[] = [];
    const stops: number[] = [];

    const startIndex = expression[1] && Array.isArray(expression[1]) ? 3 : 3;

    for (let i = startIndex; i < expression.length; i += 2) {
      const stop = expression[i] as number;
      const color = expression[i + 1] as string;
      stops.push(stop);
      colors.push(color);
    }

    if (stops.length < 2) return null;

    return {
      min: stops[0],
      max: stops[stops.length - 1],
      colors,
      stops,
    };
  };

  const generateLegendFromPaint = (): LegendItem[] => {
    if (!props.autoGenerate || !props.property || !map.value) return [];

    const layerId = props.layerIds[0];
    if (!layerId) return [];

    const layer = map.value.getLayer(layerId);
    if (!layer) {
      console.warn(`[VControlLegend] Layer not found: ${layerId}`);
      return [];
    }

    const paintValue = map.value.getPaintProperty(layerId, props.property);
    if (!paintValue || !Array.isArray(paintValue)) {
      console.warn(
        `[VControlLegend] Paint property "${props.property}" not found or not an expression`,
      );
      return [];
    }

    const expressionType = paintValue[0];

    if (expressionType === 'match') {
      return parseMatchExpression(paintValue as ExpressionValue[]);
    }

    if (expressionType === 'step') {
      const gradient = parseStepExpression(paintValue as ExpressionValue[]);
      return gradient ? [gradient] : [];
    }

    if (
      expressionType === 'interpolate' ||
      expressionType === 'interpolate-hcl' ||
      expressionType === 'interpolate-lab'
    ) {
      const gradient = parseInterpolateExpression(
        paintValue as ExpressionValue[],
      );
      return gradient ? [gradient] : [];
    }

    console.warn(
      `[VControlLegend] Unsupported expression type: ${expressionType}`,
    );
    return [];
  };

  const effectiveItems = computed((): LegendItem[] => {
    if (props.items && props.items.length > 0) {
      return props.items;
    }
    return generatedItems.value;
  });

  const categoryItems = computed(() => {
    if (props.type !== 'category') return [];
    return effectiveItems.value.filter(
      (item): item is CategoryLegendItem =>
        'value' in item && 'color' in item && 'label' in item,
    );
  });

  const gradientItem = computed(() => {
    if (props.type !== 'gradient') return null;
    const items = effectiveItems.value;
    if (items.length === 0) return null;
    const first = items[0];
    if ('min' in first && 'max' in first && 'colors' in first) {
      return first as GradientLegendItem;
    }
    return null;
  });

  const sizeItems = computed(() => {
    if (props.type !== 'size') return [];
    return effectiveItems.value.filter(
      (item): item is SizeLegendItem => 'size' in item && 'value' in item,
    );
  });

  const filterState = computed((): FilterState => {
    const visibleValues = Array.from(categoryItemVisibility.value.entries())
      .filter(([, visible]) => visible)
      .map(([value]) => value);
    return { visibleValues };
  });

  const gradientStyle = computed(() => {
    if (!gradientItem.value) return '';
    const colorStops = gradientItem.value.colors.join(', ');
    return `linear-gradient(to right, ${colorStops})`;
  });

  const initVisibility = () => {
    if (props.type === 'category') {
      for (const item of categoryItems.value) {
        categoryItemVisibility.value.set(item.value, item.visible ?? true);
      }
    }
  };

  const applyFilterToMapLibreLayers = () => {
    if (!map.value || !props.property || props.type !== 'category') return;

    const visibleValues = filterState.value.visibleValues.filter(
      (v) => v !== '__default__',
    );
    const allValues = categoryItems.value
      .map((item) => item.value)
      .filter((v) => v !== '__default__');
    const allVisible = visibleValues.length === allValues.length;

    for (const layerId of props.layerIds) {
      const layer = map.value.getLayer(layerId);
      if (!layer) continue;

      if (allVisible) {
        map.value.setFilter(layerId, null);
      } else if (visibleValues.length === 0) {
        map.value.setFilter(layerId, ['==', ['get', '_never_match_'], true]);
      } else {
        const paintValue = map.value.getPaintProperty(layerId, props.property);
        if (!paintValue || !Array.isArray(paintValue)) continue;

        const inputExpr = paintValue[1];
        let propertyName: string | null = null;

        if (Array.isArray(inputExpr) && inputExpr[0] === 'get') {
          propertyName = inputExpr[1] as string;
        }

        if (propertyName) {
          map.value.setFilter(layerId, [
            'in',
            ['get', propertyName],
            ['literal', visibleValues],
          ]);
        }
      }
    }
  };

  const applyFilterToDeckglLayers = () => {
    if (!deckLayers || props.type !== 'category') return;

    const visibleValues = filterState.value.visibleValues.filter(
      (v) => v !== '__default__',
    );
    const allValues = categoryItems.value
      .map((item) => item.value)
      .filter((v) => v !== '__default__');
    const allVisible = visibleValues.length === allValues.length;

    const layers = deckLayers.getLayers() as DeckLayerWithExtensions[];

    for (const layerId of props.layerIds) {
      if (map.value?.getLayer(layerId)) continue;

      const deckLayer = layers.find((l) => l.id === layerId);
      if (!deckLayer) continue;

      const hasDataFilterExtension = deckLayer.props?.extensions?.some(
        (ext) => ext?.constructor?.name === 'DataFilterExtension',
      );

      if (!hasDataFilterExtension) {
        console.warn(
          `[VControlLegend] deck.gl layer "${layerId}" requires DataFilterExtension for filtering. ` +
            'Add DataFilterExtension to layer extensions and configure getFilterValue accessor.',
        );
        continue;
      }

      if (typeof deckLayer.clone !== 'function') continue;

      if (allVisible) {
        const updatedLayer = deckLayer.clone({
          filterRange: [-Infinity, Infinity],
        });
        deckLayers.updateLayer(layerId, updatedLayer);
      } else if (visibleValues.length === 0) {
        const updatedLayer = deckLayer.clone({
          filterRange: [Infinity, Infinity],
        });
        deckLayers.updateLayer(layerId, updatedLayer);
      } else {
        const valueIndices = visibleValues
          .map((v) => categoryItems.value.findIndex((item) => item.value === v))
          .filter((i) => i >= 0);

        if (valueIndices.length > 0) {
          const minIndex = Math.min(...valueIndices);
          const maxIndex = Math.max(...valueIndices);
          const updatedLayer = deckLayer.clone({
            filterRange: [minIndex - 0.5, maxIndex + 0.5],
          });
          deckLayers.updateLayer(layerId, updatedLayer);
        }
      }
    }
  };

  const toggleItem = (item: CategoryLegendItem, index: number) => {
    if (!props.interactive) return;

    const currentVisible = categoryItemVisibility.value.get(item.value) ?? true;
    const newVisible = !currentVisible;
    categoryItemVisibility.value.set(item.value, newVisible);

    applyFilterToMapLibreLayers();
    applyFilterToDeckglLayers();

    emit('item-click', { item, index, visible: newVisible });
    emit('filter-change', {
      filter: filterState.value,
      layerIds: props.layerIds,
    });
    emit('update:filter', filterState.value);
  };

  const isItemVisible = (item: CategoryLegendItem) => {
    return categoryItemVisibility.value.get(item.value) ?? true;
  };

  const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
  };

  watch(
    () => props.items,
    () => {
      initVisibility();
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
    if (props.autoGenerate) {
      generatedItems.value = generateLegendFromPaint();
    }
    initVisibility();
  });
</script>

<template>
  <div
    class="v-legend-control"
    :class="[positionClasses[position], { 'is-collapsed': isCollapsed }]"
  >
    <button
      type="button"
      class="v-legend-control-header"
      @click="toggleCollapse"
    >
      <span class="v-legend-control-title">{{ title }}</span>
      <svg
        class="v-legend-control-chevron"
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

    <div v-if="!isCollapsed" class="v-legend-control-content">
      <template v-if="type === 'category'">
        <button
          v-for="(item, index) in categoryItems"
          :key="item.value"
          type="button"
          class="v-legend-control-item"
          :class="{
            'is-interactive': interactive,
            'is-hidden': !isItemVisible(item),
          }"
          :disabled="!interactive"
          @click="toggleItem(item, index)"
        >
          <span
            class="v-legend-control-swatch"
            :style="{ backgroundColor: item.color }"
          ></span>
          <span class="v-legend-control-label">{{ item.label }}</span>
          <span v-if="item.count !== undefined" class="v-legend-control-count">
            {{ item.count }}
          </span>
        </button>
      </template>

      <template v-else-if="type === 'gradient' && gradientItem">
        <div
          class="v-legend-control-gradient"
          :style="{ background: gradientStyle }"
        ></div>
        <div class="v-legend-control-gradient-labels">
          <span>{{ gradientItem.minLabel ?? gradientItem.min }}</span>
          <span>{{ gradientItem.maxLabel ?? gradientItem.max }}</span>
        </div>
      </template>

      <template v-else-if="type === 'size'">
        <div
          v-for="item in sizeItems"
          :key="item.value"
          class="v-legend-control-size-item"
        >
          <div class="v-legend-control-size-circle-wrap">
            <div
              class="v-legend-control-size-circle"
              :style="{
                width: `${Math.min(item.size, 20)}px`,
                height: `${Math.min(item.size, 20)}px`,
              }"
            ></div>
          </div>
          <span class="v-legend-control-label">{{ item.label }}</span>
        </div>
      </template>
    </div>

    <slot></slot>
  </div>
</template>

<style>
  .v-legend-control {
    position: absolute;
    z-index: 10;
    min-width: 140px;
    max-width: 200px;
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
  }

  .v-legend-control.top-2\.5 {
    top: 10px;
  }
  .v-legend-control.right-2\.5 {
    right: 10px;
  }
  .v-legend-control.left-2\.5 {
    left: 10px;
  }
  .v-legend-control.bottom-7 {
    bottom: 28px;
  }

  .v-legend-control-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    padding: 8px 10px;
    border: none;
    border-bottom: 1px solid var(--color-border, #e5e7eb);
    background: transparent;
    cursor: pointer;
    text-align: left;
    line-height: 1;
  }

  .v-legend-control.is-collapsed .v-legend-control-header {
    border-bottom: none;
  }

  .v-legend-control-header:hover {
    background: var(--color-accent, #f3f4f6);
  }

  .v-legend-control-title {
    font-weight: 500;
    font-size: 13px;
    color: var(--color-card-foreground, #111827);
    line-height: 1;
  }

  .v-legend-control-chevron {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: var(--color-muted-foreground, #6b7280);
    transition: transform 0.15s ease;
    flex-shrink: 0;
  }

  .v-legend-control-chevron.is-collapsed {
    transform: rotate(-90deg);
  }

  .v-legend-control-content {
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .v-legend-control-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 6px 8px;
    border: none;
    border-radius: calc(var(--radius, 0.5rem) - 4px);
    background: transparent;
    text-align: left;
    transition:
      background 0.1s ease,
      opacity 0.1s ease;
  }

  .v-legend-control-item.is-interactive {
    cursor: pointer;
  }

  .v-legend-control-item.is-interactive:hover {
    background: var(--color-accent, #f3f4f6);
  }

  .v-legend-control-item.is-hidden {
    opacity: 0.4;
  }

  .v-legend-control-item.is-hidden .v-legend-control-label {
    text-decoration: line-through;
  }

  .v-legend-control-item:disabled {
    cursor: default;
  }

  .v-legend-control-swatch {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    flex-shrink: 0;
    box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.1);
  }

  .v-legend-control-label {
    flex: 1;
    font-size: 11px;
    font-weight: 500;
    color: var(--color-foreground, #374151);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .v-legend-control-count {
    font-size: 10px;
    font-weight: 500;
    color: var(--color-muted-foreground, #6b7280);
    background: var(--color-secondary, #f3f4f6);
    padding: 1px 5px;
    border-radius: 8px;
  }

  .v-legend-control-gradient {
    height: 12px;
    border-radius: 3px;
    margin: 6px 8px 4px;
  }

  .v-legend-control-gradient-labels {
    display: flex;
    justify-content: space-between;
    padding: 0 8px 6px;
    font-size: 10px;
    font-weight: 500;
    color: var(--color-muted-foreground, #6b7280);
  }

  .v-legend-control-size-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
  }

  .v-legend-control-size-circle-wrap {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .v-legend-control-size-circle {
    border-radius: 50%;
    background: var(--color-primary, #3b82f6);
    box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.1);
  }
</style>
