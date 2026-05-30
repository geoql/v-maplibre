export type VesselType = 'cargo' | 'tanker' | 'fishing' | 'naval' | 'passenger';

export interface Vessel {
  id: string;
  mmsi: string;
  name: string;
  type: VesselType;
  flag: string;
  lng: number;
  lat: number;
  heading: number;
  speedKnots: number;
  dark: boolean;
  color: [number, number, number];
  track: [number, number][];
}

export interface VesselPosition {
  lng: number;
  lat: number;
  heading: number;
  speedKnots: number;
}

export interface VesselPositionDatum {
  lng: number;
  lat: number;
  vesselId: string;
  type: VesselType;
  dark: boolean;
}

export interface VesselLabelDatum {
  position: [number, number];
  text: string;
}

export interface TripDatum {
  vesselId: string;
  path: [number, number][];
  timestamps: number[];
}

export interface WakeArcDatum {
  source: [number, number];
  target: [number, number];
  sourceColor: [number, number, number, number];
  targetColor: [number, number, number, number];
}

export interface MaritimeAisStats {
  totalTracked: number;
  darkVessels: number;
  naval: number;
  avgSpeed: number;
}
