export type { ControlPosition } from 'maplibre-gl';

export type LayerType = 'maplibre' | 'deckgl';

export interface LayerControlOptions {
  /** Layer ID to control */
  layerId: string;
  /** Layer type - auto-detected if not provided */
  layerType?: LayerType;
  /** Initial visibility state */
  visible?: boolean;
  /** Initial opacity (0-1) */
  opacity?: number;
  /** Control title text (default: 'Layer Control') */
  title?: string;
  /** Custom CSS class */
  className?: string;
}
