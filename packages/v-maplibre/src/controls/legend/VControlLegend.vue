<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
  import type { Map as MapLibreMap } from 'maplibre-gl';
  import { MapKey, injectStrict } from '../../utils';
  import type {
    ControlPosition,
    LegendType,
    CategoryLegendItem,
    GradientLegendItem,
    SizeLegendItem,
    LegendItem,
    FilterState,
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
  const container = ref<HTMLElement | null>(null);
  const isCollapsed = ref(props.collapsed);

  const categoryItemVisibility = ref<Map<string | number, boolean>>(new Map());
  const generatedItems = ref<LegendItem[]>([]);

  type ExpressionValue = string | number | boolean | ExpressionValue[];

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

  const toggleItem = (item: CategoryLegendItem, index: number) => {
    if (!props.interactive) return;

    const currentVisible = categoryItemVisibility.value.get(item.value) ?? true;
    const newVisible = !currentVisible;
    categoryItemVisibility.value.set(item.value, newVisible);

    applyFilterToMapLibreLayers();

    emit('item-click', { item, index, visible: newVisible });
    emit('filter-change', {
      filter: filterState.value,
      layerIds: props.layerIds,
    });
    emit('update:filter', filterState.value);
  };

  class LegendControl implements maplibregl.IControl {
    private _container?: HTMLElement;

    onAdd(_mapInstance: MapLibreMap): HTMLElement {
      this._container = document.createElement('div');
      this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
      this._container.style.cssText = `
        background: white;
        padding: 10px;
        border-radius: 4px;
        box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
        min-width: 150px;
        max-width: 250px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      this.render();
      container.value = this._container;
      return this._container;
    }

    onRemove(): void {
      this._container?.parentNode?.removeChild(this._container);
      container.value = null;
    }

    render(): void {
      if (!this._container) return;

      this._container.innerHTML = '';

      const header = document.createElement('div');
      header.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        cursor: pointer;
      `;

      const titleEl = document.createElement('span');
      titleEl.textContent = props.title;
      titleEl.style.cssText = `
        font-weight: 600;
        font-size: 12px;
        color: #333;
      `;
      header.appendChild(titleEl);

      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.textContent = isCollapsed.value ? '▶' : '▼';
      toggleBtn.style.cssText = `
        background: none;
        border: none;
        cursor: pointer;
        font-size: 10px;
        color: #666;
        padding: 2px 4px;
      `;
      toggleBtn.onclick = () => {
        isCollapsed.value = !isCollapsed.value;
        this.render();
      };
      header.appendChild(toggleBtn);

      this._container.appendChild(header);

      if (isCollapsed.value) return;

      const content = document.createElement('div');
      content.style.cssText = 'margin-top: 4px;';

      if (props.type === 'category') {
        this.renderCategoryLegend(content);
      } else if (props.type === 'gradient') {
        this.renderGradientLegend(content);
      } else if (props.type === 'size') {
        this.renderSizeLegend(content);
      }

      this._container.appendChild(content);
    }

    renderCategoryLegend(container: HTMLElement): void {
      for (let i = 0; i < categoryItems.value.length; i++) {
        const item = categoryItems.value[i];
        const isVisible = categoryItemVisibility.value.get(item.value) ?? true;

        const row = document.createElement('div');
        row.style.cssText = `
          display: flex;
          align-items: center;
          padding: 4px 0;
          cursor: ${props.interactive ? 'pointer' : 'default'};
          opacity: ${isVisible ? '1' : '0.5'};
          transition: opacity 0.2s;
        `;

        if (props.interactive) {
          row.onclick = () => toggleItem(item, i);
        }

        const swatch = document.createElement('div');
        swatch.style.cssText = `
          width: 16px;
          height: 16px;
          background-color: ${item.color};
          border-radius: 2px;
          margin-right: 8px;
          flex-shrink: 0;
          border: 1px solid rgba(0,0,0,0.1);
        `;
        row.appendChild(swatch);

        const label = document.createElement('span');
        label.textContent = item.label;
        label.style.cssText = `
          font-size: 11px;
          color: #333;
          text-decoration: ${isVisible ? 'none' : 'line-through'};
          flex: 1;
        `;
        row.appendChild(label);

        if (item.count !== undefined) {
          const count = document.createElement('span');
          count.textContent = `(${item.count})`;
          count.style.cssText = `
            font-size: 10px;
            color: #999;
            margin-left: 4px;
          `;
          row.appendChild(count);
        }

        container.appendChild(row);
      }
    }

    renderGradientLegend(container: HTMLElement): void {
      const item = gradientItem.value;
      if (!item) return;

      const gradient = document.createElement('div');
      const colorStops = item.colors.join(', ');
      gradient.style.cssText = `
        height: 16px;
        border-radius: 2px;
        background: linear-gradient(to right, ${colorStops});
        margin-bottom: 4px;
      `;
      container.appendChild(gradient);

      const labels = document.createElement('div');
      labels.style.cssText = `
        display: flex;
        justify-content: space-between;
        font-size: 10px;
        color: #666;
      `;

      const minLabel = document.createElement('span');
      minLabel.textContent = item.minLabel ?? String(item.min);
      labels.appendChild(minLabel);

      const maxLabel = document.createElement('span');
      maxLabel.textContent = item.maxLabel ?? String(item.max);
      labels.appendChild(maxLabel);

      container.appendChild(labels);
    }

    renderSizeLegend(container: HTMLElement): void {
      for (const item of sizeItems.value) {
        const row = document.createElement('div');
        row.style.cssText = `
          display: flex;
          align-items: center;
          padding: 4px 0;
        `;

        const circleContainer = document.createElement('div');
        circleContainer.style.cssText = `
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
        `;

        const circle = document.createElement('div');
        const size = Math.min(item.size, 24);
        circle.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background-color: #007cbf;
          border: 1px solid rgba(0,0,0,0.1);
        `;
        circleContainer.appendChild(circle);
        row.appendChild(circleContainer);

        const label = document.createElement('span');
        label.textContent = item.label;
        label.style.cssText = `
          font-size: 11px;
          color: #333;
        `;
        row.appendChild(label);

        container.appendChild(row);
      }
    }
  }

  let control: LegendControl | null = null;

  watch(
    categoryItemVisibility,
    () => {
      control?.render();
    },
    { deep: true },
  );

  watch(
    () => props.items,
    () => {
      initVisibility();
      control?.render();
    },
    { deep: true },
  );

  watch(
    () => props.collapsed,
    (newValue) => {
      isCollapsed.value = newValue;
      control?.render();
    },
  );

  onMounted(() => {
    if (!map.value) return;

    if (props.autoGenerate) {
      generatedItems.value = generateLegendFromPaint();
    }

    initVisibility();
    control = new LegendControl();
    map.value.addControl(control, props.position);
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
