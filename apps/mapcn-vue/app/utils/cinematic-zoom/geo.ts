import type { LngLat } from '../types/cinematic-zoom';

export const DEG_TO_RAD = Math.PI / 180;

export function clampLat(lat: number): number {
  return Math.min(85, Math.max(-85, lat));
}

/**
 * Clean-room reimplementation of maplibre-gl's internal getZoomAdjustment:
 * on the globe the planet "grows" with latitude, so crossing latitudes
 * changes the effective zoom. The compensation term is log2(cos(toLat)/cos(fromLat)).
 */
export function getZoomAdjustment(fromLat: number, toLat: number): number {
  const a = Math.cos(clampLat(fromLat) * DEG_TO_RAD);
  const b = Math.cos(clampLat(toLat) * DEG_TO_RAD);
  return Math.log2(b / a);
}

/**
 * Great-circle slerp on the unit sphere; t ∈ [0,1]; shortest-arc longitude
 * wrap across the antimeridian. Exact at t=0 and t=1 (no float drift).
 */
export function greatCircleInterpolate(
  from: LngLat,
  to: LngLat,
  t: number,
): LngLat {
  if (t <= 0) return [from[0], from[1]];
  if (t >= 1) return [to[0], to[1]];
  const [lng1, lat1] = from;
  const [lng2, lat2] = to;
  const phi1 = lat1 * DEG_TO_RAD;
  const phi2 = lat2 * DEG_TO_RAD;
  let dlng = (lng2 - lng1) * DEG_TO_RAD;
  while (dlng > Math.PI) dlng -= 2 * Math.PI;
  while (dlng < -Math.PI) dlng += 2 * Math.PI;
  const x =
    Math.sin(phi1) * Math.sin(phi2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.cos(dlng);
  const omega = Math.acos(Math.min(1, Math.max(-1, x)));
  if (omega < 1e-9) return [lng1, lat1];
  const s0 = Math.sin(omega);
  const sa = Math.sin((1 - t) * omega) / s0;
  const sb = Math.sin(t * omega) / s0;
  const lat = Math.asin(sa * Math.sin(phi1) + sb * Math.sin(phi2)) / DEG_TO_RAD;
  const lng =
    lng1 +
    Math.atan2(
      sb * Math.cos(phi2) * Math.sin(dlng),
      sa * Math.cos(phi1) + sb * Math.cos(phi2) * Math.cos(dlng),
    ) /
      DEG_TO_RAD;
  return [lng, lat];
}

/**
 * Approximate camera altitude (m) from Web-Mercator ground resolution and
 * MapLibre's default 36.87° vertical fov. Good enough for a HUD readout.
 */
export function getApproximateAltitude(
  lat: number,
  zoom: number,
  canvasHeightPx: number,
): number {
  const mpp = (156543.03392 * Math.cos(clampLat(lat) * DEG_TO_RAD)) / 2 ** zoom;
  return (mpp * (canvasHeightPx / 2)) / Math.tan((36.87 / 2) * DEG_TO_RAD);
}
