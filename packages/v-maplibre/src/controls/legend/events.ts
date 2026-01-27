export const LEGEND_EVENTS = [
  'item-click',
  'filter-change',
  'update:filter',
] as const;

export type LegendEventName = (typeof LEGEND_EVENTS)[number];
