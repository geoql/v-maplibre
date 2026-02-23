import type { Feature, FeatureCollection, Polygon } from 'geojson';
import type {
  CategoryLegendItem,
  GradientLegendItem,
} from '@geoql/v-maplibre';

export type NYCBorough = '1' | '2' | '3' | '4' | '5';

export type SnowPriority = 'C' | 'S' | 'H' | 'V';

export interface DSNYStreetRecord {
  physicalid: string;
  streetname: string;
  snowpriority: SnowPriority;
  borough: string;
  segmentlength: string;
  line: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}

export interface SnowStreetSegment {
  physicalid: string;
  streetname: string;
  snowPriority: SnowPriority;
  hoursSincePlowed: number;
  snowDepth: number;
  plowColor: string;
}

export type SnowStreetFeature = Feature<Polygon, SnowStreetSegment>;
export type SnowStreetCollection = FeatureCollection<
  Polygon,
  SnowStreetSegment
>;

export interface BoroughInfo {
  name: string;
  center: [number, number];
  zoom: number;
}

export const BOROUGH_MAP: Record<NYCBorough, BoroughInfo> = {
  '1': { name: 'Manhattan', center: [-73.98, 40.758], zoom: 13 },
  '2': { name: 'Bronx', center: [-73.88, 40.85], zoom: 12 },
  '3': { name: 'Brooklyn', center: [-73.95, 40.65], zoom: 12 },
  '4': { name: 'Queens', center: [-73.8, 40.73], zoom: 11 },
  '5': { name: 'Staten Island', center: [-74.15, 40.58], zoom: 12 },
};

export const PLOW_COLOR_STOPS = [
  { hours: 0, color: '#00b894' },
  { hours: 2, color: '#00cec9' },
  { hours: 4, color: '#0984e3' },
  { hours: 6, color: '#6c5ce7' },
  { hours: 8, color: '#fdcb6e' },
  { hours: 10, color: '#e17055' },
  { hours: 12, color: '#d63031' },
  { hours: 24, color: '#b71540' },
] as const;

export const SNOW_PRIORITY_META: Record<
  SnowPriority,
  { label: string; fullLabel: string; color: string }
> = {
  C: { label: 'Critical (C)', fullLabel: 'Critical', color: '#d63031' },
  S: { label: 'Sector (S)', fullLabel: 'Sector', color: '#0984e3' },
  H: { label: 'Haulster (H)', fullLabel: 'Haulster', color: '#fdcb6e' },
  V: { label: 'Non-DSNY (V)', fullLabel: 'Non-DSNY', color: '#636e72' },
};

export const PLOW_STATUS_LEGEND: GradientLegendItem = {
  min: 0,
  max: 24,
  minLabel: '0h',
  maxLabel: '24h+',
  colors: PLOW_COLOR_STOPS.map((s) => s.color),
  stops: PLOW_COLOR_STOPS.map((s) => s.hours),
};

export const SNOW_PRIORITY_LEGEND: CategoryLegendItem[] = [
  { value: 'C', label: 'Critical (C)', color: '#d63031', visible: true },
  { value: 'S', label: 'Sector (S)', color: '#0984e3', visible: true },
  { value: 'H', label: 'Haulster (H)', color: '#fdcb6e', visible: true },
  { value: 'V', label: 'Non-DSNY (V)', color: '#636e72', visible: true },
];