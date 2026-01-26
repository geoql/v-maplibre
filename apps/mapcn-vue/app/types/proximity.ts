export interface LocationPoint {
  id: string;
  name: string;
  coordinates: [number, number];
  type: 'warehouse' | 'store' | 'customer';
}

export interface Connection {
  from: LocationPoint;
  to: LocationPoint;
  distance: number;
  duration: number;
}

export interface ValhallaMatrixLocation {
  lat: number;
  lon: number;
}

export interface ValhallaMatrixCell {
  distance: number;
  time: number;
  from_index: number;
  to_index: number;
}

export interface ValhallaMatrixResponse {
  sources_to_targets: ValhallaMatrixCell[][];
  sources: Array<{ location: ValhallaMatrixLocation }>;
  targets: Array<{ location: ValhallaMatrixLocation }>;
  units: string;
}
