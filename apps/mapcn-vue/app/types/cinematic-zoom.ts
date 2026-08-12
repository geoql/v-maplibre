import type { Map as MaplibreMap } from 'maplibre-gl';
import type { Ref } from 'vue';

export type LngLat = [number, number];

export interface CinematicDestination {
  name: string;
  coordinates: LngLat;
  /** Arrival camera parameters — adding a city = one array entry in shot.ts */
  arrivalZoom: number; // desired visual zoom at t=1 (target ≥ 15.5 after globe adjustment)
  arrivalPitch: number; // resting pitch at arrival (56-58)
  arrivalBearing: number; // cinematic final bearing (deg)
}

export type CinematicPhase = 'idle' | 'flying' | 'arrived';

export interface CinematicCameraState {
  center: LngLat;
  zoom: number;
  pitch: number;
  bearing: number;
  roll: number;
}

export interface CinematicHudState {
  lng: number;
  lat: number;
  zoom: number;
  altitudeM: number;
}

export interface CinematicShot {
  destination: CinematicDestination;
  /** main-flight sample, t ∈ [0,1] — returns the jumpTo values for frame t */
  start: CinematicCameraState;
  sample: (t: number) => CinematicCameraState;
  /** settle tail sample, tLocal ∈ [0, SETTLE_S] — exponential relaxation to rest */
  settle: (tLocal: number) => CinematicCameraState;
  /** resting camera once the flight is complete */
  rest: CinematicCameraState;
}

export interface CinematicMapHandle {
  map: Readonly<Ref<MaplibreMap | null>>;
  onHud?: (hud: CinematicHudState) => void;
  onPhaseChange?: (phase: CinematicPhase) => void;
}
