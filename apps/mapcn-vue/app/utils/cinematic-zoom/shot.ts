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

/** Flight (orbit → arrival) duration in seconds. */
export const SHOT_DURATION_S = 9.5;
/** Exponential settle tail after arrival, in seconds. */
export const SETTLE_S = 1.2;
/** Post-arrival orbit speed around the streamed tileset, in deg/second. */
export const ORBIT_RATE_DEG_S = 8;

/**
 * One entry per destination. Each flies from orbit down to a REAL OGC 3D
 * Tiles capture streamed from the geolith R2 bucket at its true geographic
 * location. `coordinates` MUST match the tileset's self-anchor (both are
 * derived from the tileset root transform). Add a destination by generating
 * a geolith capture and appending an entry with its tileset path + true
 * coordinates + arrival framing.
 */
export const CINEMATIC_DESTINATIONS: readonly CinematicDestination[] = [
  {
    name: 'Tokyo',
    coordinates: [139.7454, 35.6586],
    tilesetPath: '/splat/cactus/tileset.json',
    arrivalZoom: 20.7,
    arrivalPitch: 62,
    arrivalBearing: -20,
  },
  {
    name: 'Italian Alps',
    coordinates: [7.9797, 45.9756],
    tilesetPath: '/splat/bonsai/tileset.json',
    arrivalZoom: 20.9,
    arrivalPitch: 62,
    arrivalBearing: 25,
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
 * then a monotone plunge deep enough to frame the streamed 3D tiles — MapLibre
 * zoom is log2 scale, so a smooth zoom ramp is a geometric distance fall),
 * great-circle pan coupled to zoom progress (the last mile happens at low
 * altitude), north-up bearing hold until the dive commits then a smooth sweep
 * to the arrival bearing, a late pitch flare that stands the camera up to read
 * the 3D geometry, a subtle roll bank inside the descent, and an exponential
 * settle tail that carries exit velocity into the landing.
 *
 * Camera choreography inspired by
 * https://github.com/Makio64/threejs-cinematic-world-zoom (MIT).
 */
export function buildShot(destination: CinematicDestination): CinematicShot {
  const start = WORLD_START;
  const Z_END = destination.arrivalZoom;

  // Piecewise zoom: anticipation dip [0, 0.08] then a smooth deep plunge that
  // eases into the arrival zoom rather than slamming the last stop.
  const dipEnd = 0.08;
  const zoomRise = smoothTrack([
    [dipEnd, 1.35],
    [0.4, 5.5],
    [0.62, 10],
    [0.78, 14],
    [0.88, 17],
    [0.95, 19],
    [1, Z_END],
  ]);
  const zoomCurve = (t: number): number =>
    t < dipEnd ? 1.6 + (1.35 - 1.6) * easeInOutQuad(t / dipEnd) : zoomRise(t);

  // Pitch flares late: level through the globe phase, then stands up to the
  // pitched arrival so the streamed 3D tiles are read at an angle.
  const pitchCurve = smoothTrack([
    [0, 0],
    [0.3, 0],
    [0.6, 15],
    [0.85, 45],
    [0.95, destination.arrivalPitch],
    [1, destination.arrivalPitch],
  ]);

  const rollStart = 0.8;
  const rollPeak = 3;
  const rollCurve = (t: number): number => {
    if (t <= rollStart || t >= 1) return 0;
    const p = (t - rollStart) / (1 - rollStart);
    return rollPeak * Math.sin(Math.PI * p);
  };

  // North-up hold keyed to zoom (distance), released over the remaining dive.
  // `+ 0` normalises the signed zero a negative arrival bearing would produce
  // while held north (−20 * 0 = −0), so the held phase reads a clean 0.
  const bearingCurve = (zoom: number): number =>
    destination.arrivalBearing * smoothstep(5, 18, zoom) + 0;

  // Center pan must not outrun the dive: couple it to zoom progress so the
  // last mile of travel happens at low altitude, over the destination.
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
