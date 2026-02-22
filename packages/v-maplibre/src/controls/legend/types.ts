export type { ControlPosition } from 'maplibre-gl';

export type LegendType = 'category' | 'gradient' | 'size' | 'table';

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

export interface TableLegendItem {
  /** Display name — left column (e.g. "Puerto Rico") */
  label: string;
  /** Raw numeric value for sorting */
  value: number;
  /** Pre-formatted display string (e.g. "6.0%"). Falls back to `${value}${unit}` */
  formattedValue?: string;
  /** Unit appended to value when formattedValue is absent (e.g. "%") */
  unit?: string;
  /** CSS color string for the swatch */
  color: string;
  /** Optional description shown as tooltip */
  description?: string;
}

export type LegendItem =
  | CategoryLegendItem
  | GradientLegendItem
  | SizeLegendItem
  | TableLegendItem;

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

export type ExpressionValue = string | number | boolean | ExpressionValue[];

export interface DeckLayerWithExtensions {
  id: string;
  props?: {
    extensions?: Array<{ constructor?: { name?: string } }>;
    filterRange?: [number, number];
  };
  clone?: (props: object) => unknown;
}
