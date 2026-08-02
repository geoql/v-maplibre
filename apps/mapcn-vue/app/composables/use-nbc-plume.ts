import type {
  HazardSource,
  HazardType,
  PlumeZone,
  DangerLevel,
  NbcStats,
} from '~/types/defense-nbc';

const EARTH_RADIUS = 6371000;

const ZONE_CONFIGS: {
  level: DangerLevel;
  maxRange: number;
  coneWidth: number;
  color: [number, number, number, number];
  label: string;
}[] = [
  {
    level: 'lethal',
    maxRange: 2000,
    coneWidth: 30,
    color: [220, 38, 38, 140],
    label: 'LETHAL (0–2 km)',
  },
  {
    level: 'danger',
    maxRange: 5000,
    coneWidth: 45,
    color: [249, 115, 22, 100],
    label: 'DANGER (0–5 km)',
  },
  {
    level: 'caution',
    maxRange: 10000,
    coneWidth: 60,
    color: [234, 179, 8, 70],
    label: 'CAUTION (0–10 km)',
  },
];

const SIMULATION_DURATION = 60;

function destinationPoint(
  origin: [number, number],
  distanceMeters: number,
  bearingDeg: number,
): [number, number] {
  const lat1 = (origin[1] * Math.PI) / 180;
  const lon1 = (origin[0] * Math.PI) / 180;
  const brng = (bearingDeg * Math.PI) / 180;
  const d = distanceMeters / EARTH_RADIUS;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
      Math.cos(lat1) * Math.sin(d) * Math.cos(brng),
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2),
    );

  return [(lon2 * 180) / Math.PI, (lat2 * 180) / Math.PI];
}

function generatePlumeZone(
  source: [number, number],
  windBearing: number,
  maxRange: number,
  coneWidth: number,
  expansion: number,
): [number, number][] {
  const range = maxRange * expansion;
  if (range < 10) return [source, source, source];

  const halfCone = coneWidth / 2;
  const points: [number, number][] = [source];

  for (let i = 0; i <= 24; i++) {
    const angle = windBearing - halfCone + (halfCone * 2 * i) / 24;
    points.push(destinationPoint(source, range, angle));
  }

  points.push(source);
  return points;
}

function computeAreaKm2(zones: PlumeZone[], expansion: number): number {
  let totalArea = 0;
  for (const zone of ZONE_CONFIGS) {
    const range = (zone.maxRange * expansion) / 1000;
    const coneRad = (zone.coneWidth * Math.PI) / 180;
    totalArea = Math.max(totalArea, 0.5 * range * range * coneRad);
  }
  return Math.round(totalArea * 100) / 100;
}

export function useNbcPlume() {
  const source = ref<HazardSource | null>(null);
  const windDirection = ref(225);
  const windSpeed = ref(8);
  const elapsedTime = ref(0);
  const isSimulating = ref(false);
  const hazardType = ref<HazardType>('chemical');

  let animationTimer: ReturnType<typeof setInterval> | null = null;

  const expansion = computed(() =>
    Math.min(elapsedTime.value / SIMULATION_DURATION, 1),
  );

  const plumeZones = computed<PlumeZone[]>(() => {
    const origin = source.value;
    if (!origin || expansion.value <= 0) return [];

    return ZONE_CONFIGS.map((zone) => ({
      level: zone.level,
      polygon: generatePlumeZone(
        origin.position,
        windDirection.value,
        zone.maxRange,
        zone.coneWidth,
        expansion.value,
      ),
      color: zone.color,
      label: zone.label,
    })).reverse();
  });

  const stats = computed<NbcStats>(() => ({
    affectedAreaKm2: source.value
      ? computeAreaKm2(plumeZones.value, expansion.value)
      : 0,
    windDirection: windDirection.value,
    windSpeed: windSpeed.value,
    elapsedSeconds: Math.round(elapsedTime.value),
    activeZones: plumeZones.value.length,
  }));

  function placeSource(lngLat: [number, number]): void {
    stopSimulation();
    source.value = {
      position: lngLat,
      type: hazardType.value,
      placedAt: Date.now(),
    };
    elapsedTime.value = 0;
    startSimulation();
  }

  function startSimulation(): void {
    if (isSimulating.value || !source.value) return;
    isSimulating.value = true;

    animationTimer = setInterval(() => {
      if (elapsedTime.value >= SIMULATION_DURATION) {
        stopSimulation();
        return;
      }
      elapsedTime.value += 0.5;
    }, 50);
  }

  function stopSimulation(): void {
    isSimulating.value = false;
    if (animationTimer) {
      clearInterval(animationTimer);
      animationTimer = null;
    }
  }

  function setWind(direction: number, speed: number): void {
    windDirection.value = direction;
    windSpeed.value = speed;
  }

  function reset(): void {
    stopSimulation();
    source.value = null;
    elapsedTime.value = 0;
  }

  function cleanup(): void {
    stopSimulation();
    source.value = null;
    elapsedTime.value = 0;
  }

  return {
    source,
    plumeZones,
    windDirection,
    windSpeed,
    elapsedTime,
    isSimulating,
    hazardType,
    expansion,
    stats,
    zoneConfigs: ZONE_CONFIGS,
    placeSource,
    startSimulation,
    stopSimulation,
    setWind,
    reset,
    cleanup,
  };
}
