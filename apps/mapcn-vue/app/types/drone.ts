export interface DronePosition {
  lng: number;
  lat: number;
  bearing: number;
}

export interface DroneFlightPath {
  coordinates: [number, number][];
  totalDistance: number;
}

export interface DroneAnimationState {
  isPlaying: boolean;
  progress: number;
  currentIndex: number;
  speed: number;
  elapsedTime: number;
}

export interface DroneFlightStats {
  totalDistance: number;
  currentSpeed: number;
  altitude: number;
  progress: number;
  elapsedTime: number;
}

export interface DroneTrip {
  path: [number, number][];
  timestamps: number[];
}
