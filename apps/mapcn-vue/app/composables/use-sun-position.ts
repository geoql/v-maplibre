import type { SkyMode } from '~/types/globe';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

/**
 * Compute the sun's geocentric position for globe rendering.
 *
 * Returns the subsolar point — the geographic coordinate where the sun
 * is directly overhead — expressed as longitude (azimuth) and latitude
 * (altitude / declination).  These values can be fed directly to
 * `sunDirectionFromAngles` in maplibre-gl-starfield because the math
 * matches MapLibre's `angularCoordinatesRadiansToVector`:
 *   X = sin(lng) * cos(lat),  Y = sin(lat),  Z = cos(lng) * cos(lat)
 */
function computeGeocentricSunPosition(date: Date): {
  /** Subsolar longitude in degrees (0-360) */
  azimuth: number;
  /** Solar declination in degrees (-23.44 to +23.44) */
  altitude: number;
} {
  const dayOfYear = getDayOfYear(date);
  const declination =
    23.44 * Math.sin(DEG2RAD * (360 / 365) * (dayOfYear - 81));

  const utcHours =
    date.getUTCHours() +
    date.getUTCMinutes() / 60 +
    date.getUTCSeconds() / 3600;

  // Subsolar longitude: where solar noon is happening right now.
  // Wraps to 0-360 so the starfield layer always receives a positive angle.
  const sunLng = ((12 - utcHours) * 15 + 360) % 360;

  return { azimuth: sunLng, altitude: declination };
}

/**
 * Compute the sun's altitude above the horizon for a specific observer.
 * Used for sky-mode classification (day/dusk/dawn/night) and star fading.
 */
function computeLocalSunAltitude(
  date: Date,
  latitude: number,
  longitude: number,
): number {
  const dayOfYear = getDayOfYear(date);
  const declination =
    23.44 * Math.sin(DEG2RAD * (360 / 365) * (dayOfYear - 81));

  const utcHours =
    date.getUTCHours() +
    date.getUTCMinutes() / 60 +
    date.getUTCSeconds() / 3600;
  const solarNoon = 12 - longitude / 15;
  const hourAngle = (utcHours - solarNoon) * 15;

  const latRad = latitude * DEG2RAD;
  const declRad = declination * DEG2RAD;
  const haRad = hourAngle * DEG2RAD;

  const sinAlt =
    Math.sin(latRad) * Math.sin(declRad) +
    Math.cos(latRad) * Math.cos(declRad) * Math.cos(haRad);

  return Math.asin(sinAlt) * RAD2DEG;
}

function altitudeToSkyMode(altitude: number): SkyMode {
  if (altitude > 0) return 'day';
  if (altitude > -6) return 'dusk';
  if (altitude > -18) return 'dawn';
  return 'night';
}

export function useSunPosition(options?: {
  latitude?: number;
  longitude?: number;
  updateInterval?: number;
}) {
  const latitude = ref(options?.latitude ?? 20);
  const longitude = ref(options?.longitude ?? 0);

  const sunAzimuth = ref(180);
  const sunAltitude = ref(0);

  const localSunAltitude = ref(45);
  const skyMode = ref<SkyMode>('day');

  function refresh() {
    const now = new Date();

    const geo = computeGeocentricSunPosition(now);
    sunAzimuth.value = Math.round(geo.azimuth * 10) / 10;
    sunAltitude.value = Math.round(geo.altitude * 10) / 10;

    const localAlt = computeLocalSunAltitude(
      now,
      latitude.value,
      longitude.value,
    );
    localSunAltitude.value = Math.round(localAlt * 10) / 10;
    skyMode.value = altitudeToSkyMode(localAlt);
  }

  if (import.meta.client) {
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        latitude.value = position.coords.latitude;
        longitude.value = position.coords.longitude;
        refresh();
      },
      () => refresh(),
    );

    const interval = options?.updateInterval ?? 60_000;
    const timer = setInterval(refresh, interval);
    onBeforeUnmount(() => clearInterval(timer));
  }

  refresh();

  return {
    /** Subsolar longitude in degrees (0-360) — pass as sun-azimuth */
    sunAzimuth: readonly(sunAzimuth),
    /** Solar declination in degrees — pass as sun-altitude */
    sunAltitude: readonly(sunAltitude),
    /** Observer's local sun altitude (degrees) — pass as fade-altitude */
    localSunAltitude: readonly(localSunAltitude),
    skyMode: readonly(skyMode),
    refresh,
  };
}
