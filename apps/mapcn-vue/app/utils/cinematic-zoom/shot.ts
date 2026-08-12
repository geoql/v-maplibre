import { approach, smoothstep, smoothTrack } from './math.ts';
import {
  getApproximateAltitude,
  getZoomAdjustment,
  greatCircleInterpolate,
} from './geo.ts';
import type {
  CinematicCameraState,
  CinematicDestination,
  CinematicShot,
  LngLat,
} from '../types/cinematic-zoom';

export const WORLD_START = {
  center: [-20, 20] as LngLat,
  zoom: 1.6,
  pitch: 0,
  bearing: 0,
  roll: 0,
};

export const SHOT_DURATION_S = 9;
export const SETTLE_S = 1.2;

/**
 * One array entry per destination. Add a city by appending an entry —
 * arrival zoom/pitch/bearing are per-destination camera parameters.
 */
export const CINEMATIC_DESTINATIONS: readonly CinematicDestination[] = [
  {
    name: 'New York',
    coordinates: [-74.006, 40.7128],
    arrivalZoom: 16.4,
    arrivalPitch: 56,
    arrivalBearing: 20,
  },
  {
    name: 'Tokyo',
    coordinates: [139.6917, 35.6895],
    arrivalZoom: 16.4,
    arrivalPitch: 56,
    arrivalBearing: -35,
  },
  {
    name: 'London',
    coordinates: [-0.1276, 51.5072],
    arrivalZoom: 16.2,
    arrivalPitch: 56,
    arrivalBearing: 40,
  },
  {
    name: 'Paris',
    coordinates: [2.3522, 48.8566],
    arrivalZoom: 16.4,
    arrivalPitch: 57,
    arrivalBearing: -25,
  },
  {
    name: 'Mumbai',
    coordinates: [72.8777, 19.076],
    arrivalZoom: 16.4,
    arrivalPitch: 56,
    arrivalBearing: -15,
  },
  {
    name: 'San Francisco',
    coordinates: [-122.4194, 37.7749],
    arrivalZoom: 16.0,
    arrivalPitch: 58,
    arrivalBearing: 15,
  },
];

export function getHudAltitude(
  lat: number,
  zoom: number,
  canvasHeightPx: number,
): number {
  return getApproximateAltitude(lat, zoom, canvasHeightPx);
}

export function easeInOutQuad(x: number): number {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

function lerpLngLat(a: LngLat, b: LngLat, t: number): LngLat {
  let d = b[0] - a[0];
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return [a[0] + d * t, a[1] + (b[1] - a[1]) * t];
}

/**
 * Builds the per-destination shot: piecewise zoom (micro anticipation dip,
 * then a monotone plunge — MapLibre zoom is log2 scale, so a linear-ish
 * zoom ramp is a geometric distance fall), great-circle pan coupled to zoom
 * progress, north-up bearing hold until zoom 4 then a smooth sweep, a late
 * pitch flare, a subtle roll bank inside the mercator phase, and an
 * exponential settle tail that carries exit velocity into the landing.
 */
export function buildShot(destination: CinematicDestination): CinematicShot {
  const start = WORLD_START;
  const Z_END = destination.arrivalZoom;

  // Piecewise zoom: anticipation dip [0, 0.08] then monotone plunge [0.08, 1].
  const dipEnd = 0.08;
  const zoomRise = smoothTrack([
    [dipEnd, 1.35],
    [0.5, 6],
    [0.78, 11.5],
    [0.93, 15.2],
    [1, Z_END],
  ]);
  const zoomCurve = (t: number): number =>
    t < dipEnd ? 1.6 + (1.35 - 1.6) * easeInOutQuad(t / dipEnd) : zoomRise(t);

  const pitchCurve = smoothTrack([
    [0, 0],
    [0.35, 0],
    [0.7, 18],
    [0.93, 62],
    [1, 62],
  ]);

  const rollStart = 0.8;
  const rollPeak = 3;
  const rollCurve = (t: number): number => {
    if (t <= rollStart || t >= 1) return 0;
    const p = (t - rollStart) / (1 - rollStart);
    return rollPeak * Math.sin(Math.PI * p);
  };

  // North-up hold keyed to zoom (distance), release over the remaining dive.
  const bearingCurve = (zoom: number): number =>
    destination.arrivalBearing * smoothstep(4, 15.2, zoom);

  // Center pan must not outrun the dive: couple it to zoom progress so the
  // last mile of travel happens at low altitude.
  const panT = (zoom: number): number => smoothstep(1.6, Z_END, zoom);

  const sample = (t: number): CinematicCameraState => {
    const tt = Math.min(1, Math.max(0, t));
    const z = zoomCurve(tt);
    const center = greatCircleInterpolate(
      start.center,
      destination.coordinates,
      panT(z),
    );
    const zoom = z + getZoomAdjustment(start.center[1], center[1]);
    return {
      center,
      zoom,
      pitch: pitchCurve(tt),
      bearing: bearingCurve(z),
      roll: rollCurve(tt),
    };
  };

  const at1 = sample(1);
  const rest: CinematicCameraState = {
    center: destination.coordinates,
    zoom: at1.zoom,
    pitch: destination.arrivalPitch,
    bearing: destination.arrivalBearing,
    roll: 0,
  };

  const settle = (tLocal: number): CinematicCameraState => {
    const a = approach(tLocal, 0.35);
    const aP = approach(tLocal, 0.4);
    return {
      center: lerpLngLat(at1.center, rest.center, a),
      zoom: at1.zoom + (rest.zoom - at1.zoom) * a,
      pitch: at1.pitch + (rest.pitch - at1.pitch) * aP,
      bearing: at1.bearing + (rest.bearing - at1.bearing) * aP,
      roll: at1.roll + (rest.roll - at1.roll) * a,
    };
  };

  return { destination, start, sample, settle, rest };
}
