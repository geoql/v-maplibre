import { onMounted, onUnmounted, type Ref, type ShallowRef } from 'vue';
import type { Map, IControl, ControlPosition } from 'maplibre-gl';

/**
 * Register a Vue component as a MapLibre IControl for proper control stacking.
 *
 * @param map - Ref to the MapLibre map instance
 * @param containerRef - Ref to the component's root HTMLElement
 * @param position - Control position ('top-left' | 'top-right' | 'bottom-left' | 'bottom-right')
 */
export function useMapControl(
  map: ShallowRef<Map | null> | Ref<Map | null>,
  containerRef: Ref<HTMLElement | null>,
  position: ControlPosition,
): void {
  let control: IControl | null = null;

  onMounted(() => {
    if (!map.value || !containerRef.value) return;

    control = {
      onAdd: (): HTMLElement => {
        containerRef.value?.classList.add('maplibregl-ctrl');
        return containerRef.value!;
      },
      onRemove: (): void => {},
    };

    map.value.addControl(control, position);
  });

  onUnmounted(() => {
    if (map.value && control) {
      try {
        map.value.removeControl(control);
      } catch {
        // Control may already be removed if map was destroyed
      }
    }
  });
}
