import type { SkyMode } from '~/types/globe';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

function computeSolarPosition(
  date: Date,
  latitude: number,
  longitude: number,
): { azimuth: number; altitude: number } {
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
  const altitude = Math.asin(sinAlt) * RAD2DEG;

  const cosAlt = Math.cos(altitude * DEG2RAD);
  const cosAz =
    cosAlt !== 0
      ? (Math.sin(declRad) - Math.sin(latRad) * sinAlt) /
        (Math.cos(latRad) * cosAlt)
      : 0;
  let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz))) * RAD2DEG;
  if (hourAngle > 0) azimuth = 360 - azimuth;

  return { azimuth, altitude };
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
  const sunAltitude = ref(45);
  const skyMode = ref<SkyMode>('day');

  function refresh() {
    const pos = computeSolarPosition(
      new Date(),
      latitude.value,
      longitude.value,
    );
    sunAzimuth.value = Math.round(pos.azimuth * 10) / 10;
    sunAltitude.value = Math.round(pos.altitude * 10) / 10;
    skyMode.value = altitudeToSkyMode(pos.altitude);
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
    sunAzimuth: readonly(sunAzimuth),
    sunAltitude: readonly(sunAltitude),
    skyMode: readonly(skyMode),
    refresh,
  };
}
