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

  const categoryItems = computed(() => {
    if (props.type !== 'category' || !props.items) return [];
    return props.items as CategoryLegendItem[];
  });

  const gradientItem = computed(() => {
    if (props.type !== 'gradient' || !props.items || props.items.length === 0)
      return null;
    return props.items[0] as GradientLegendItem;
  });

  const sizeItems = computed(() => {
    if (props.type !== 'size' || !props.items) return [];
    return props.items as SizeLegendItem[];
  });

  const filterState = computed((): FilterState => {
    const visibleValues = Array.from(categoryItemVisibility.value.entries())
      .filter(([, visible]) => visible)
      .map(([value]) => value);
    return { visibleValues };
  });

  const initVisibility = () => {
    if (props.type === 'category' && props.items) {
      for (const item of props.items as CategoryLegendItem[]) {
        categoryItemVisibility.value.set(item.value, item.visible ?? true);
      }
    }
  };

  const toggleItem = (item: CategoryLegendItem, index: number) => {
    if (!props.interactive) return;

    const currentVisible = categoryItemVisibility.value.get(item.value) ?? true;
    const newVisible = !currentVisible;
    categoryItemVisibility.value.set(item.value, newVisible);

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
