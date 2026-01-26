// Tab navigation
export type ChoroplethTabType = 'maplibre' | 'deckgl';

export const TAB_TO_QUERY: Record<ChoroplethTabType, string> = {
  maplibre: 'maplibre',
  deckgl: 'deck.gl',
};

export const QUERY_TO_TAB: Record<string, ChoroplethTabType> = {
  maplibre: 'maplibre',
  'deck.gl': 'deckgl',
};

// State data for choropleth
export interface StateProperties {
  name: string;
  value: number;
  abbr: string;
  fillColor?: string;
}

// Color scale threshold
export interface ColorThreshold {
  threshold: number;
  color: string;
}
