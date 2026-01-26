import type { Feature, FeatureCollection, Polygon } from 'geojson';

export interface IsochroneContour {
  time?: number;
  distance?: number;
  color?: string;
}

export interface IsochroneFeatureProperties {
  fill: string;
  fillOpacity: number;
  'fill-opacity': number;
  fillColor: string;
  color: string;
  contour: number;
  opacity: number;
  metric: string;
}

export type IsochroneFeature = Feature<Polygon, IsochroneFeatureProperties>;

export type IsochroneResponse = FeatureCollection<
  Polygon,
  IsochroneFeatureProperties
>;

export type TransportMode = 'auto' | 'bicycle' | 'pedestrian';

export interface TransportModeOption {
  value: TransportMode;
  label: string;
  icon: string;
}
