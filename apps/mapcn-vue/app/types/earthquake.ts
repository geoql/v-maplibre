export interface EarthquakeProperties {
  mag: number;
  place: string;
  time: number;
  url: string;
  title: string;
}

export interface EarthquakeFeature {
  id: string;
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number, number];
  };
  properties: EarthquakeProperties;
}

export interface EarthquakeGeoJSON {
  type: 'FeatureCollection';
  metadata: { title: string; count: number };
  features: EarthquakeFeature[];
}

export interface EarthquakeData {
  coordinates: [number, number];
  magnitude: number;
  depth: number;
  place: string;
  time: number;
  title: string;
}
