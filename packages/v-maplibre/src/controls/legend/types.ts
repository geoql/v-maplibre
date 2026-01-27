export type { ControlPosition } from 'maplibre-gl';

export type LegendType = 'category' | 'gradient' | 'size';

export type LayerType = 'maplibre' | 'deckgl';

export interface CategoryLegendItem {
  value: string | number;
  label: string;
  color: string;
  visible?: boolean;
  count?: number;
}

export interface GradientLegendItem {
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
  colors: string[];
  stops?: number[];
}

export interface SizeLegendItem {
  value: number;
  label: string;
  size: number;
}

export type LegendItem =
  | CategoryLegendItem
  | GradientLegendItem
  | SizeLegendItem;

export interface FilterState {
  visibleValues: (string | number)[];
  minRange?: number;
  maxRange?: number;
}

export interface LegendControlOptions {
  layerIds: string[];
  type: LegendType;
  items?: LegendItem[];
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  property?: string;
  autoGenerate?: boolean;
  title?: string;
  collapsed?: boolean;
  interactive?: boolean;
  className?: string;
}

export interface LegendItemClickEventData {
  item: LegendItem;
  index: number;
  visible: boolean;
}

export interface LegendFilterChangeEventData {
  filter: FilterState;
  layerIds: string[];
}
