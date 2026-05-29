import type {
  OceanGridCell,
  CurrentSample,
  TripStreamline,
  OceanStats,
} from '~/types/maritime-ocean';

const DEG_TO_RAD = Math.PI / 180;

// Bbox: Arabian Sea / Indian Ocean
const LNG_MIN = 60;
const LNG_MAX = 78;
const LAT_MIN = 6;
const LAT_MAX = 22;
const GRID_STEP = 0.5; // degrees

// Thermal color ramp (SST 22–32°C): blue → cyan → green → yellow → red
export const THERMAL_RAMP: [number, number, number][] = [
  [0, 50, 255], // 22°C - deep blue
  [0, 200, 255], // 24°C - cyan
  [0, 230, 100], // 26°C - teal-green
  [50, 220, 0], // 28°C - green
  [255, 220, 0], // 30°C - yellow
  [255, 150, 0], // 31°C - orange
  [255, 30, 0], // 32°C - red
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Map SST value (22–32°C) to a [r,g,b] thermal color */
export function sstToColor(sst: number): [number, number, number] {
  const t = clamp((sst - 22) / 10, 0, 1);
  const n = THERMAL_RAMP.length - 1;
  const idx = t * n;
  const i = Math.floor(idx);
  const f = idx - i;
  const c0 = THERMAL_RAMP[Math.min(i, n)];
  const c1 = THERMAL_RAMP[Math.min(i + 1, n)];
  return [
    Math.round(lerp(c0[0], c1[0], f)),
    Math.round(lerp(c0[1], c1[1], f)),
    Math.round(lerp(c0[2], c1[2], f)),
  ];
}

/** Compute SST at a single lon/lat using procedural fields */
function computeSst(lng: number, lat: number): number {
  // Base: latitude gradient (colder in north due to winter mixing, warmer south)
  const latT = (lat - LAT_MIN) / (LAT_MAX - LAT_MIN); // 0=south, 1=north
  const base = lerp(30, 22, latT);

  // Eddy 1: warm blob — Somali Current / Arabian Sea warm pool
  const d1 = Math.sqrt((lng - 65) ** 2 + (lat - 14) ** 2);
  const eddy1 = 3.5 * Math.exp(-d1 / 10);

  // Eddy 2: warm blob — equatorial Indian Ocean warm pool
  const d2 = Math.sqrt((lng - 72) ** 2 + (lat - 8) ** 2);
  const eddy2 = 4.0 * Math.exp(-d2 / 12);

  // Eddy 3: cool blob — Omani coastal upwelling (summer forcing)
  const d3 = Math.sqrt((lng - 60) ** 2 + (lat - 18) ** 2);
  const eddy3 = -2.5 * Math.exp(-d3 / 8);

  // Eddy 4: warm blob — Bay of Bengal extension (weaker)
  const d4 = Math.sqrt((lng - 78) ** 2 + (lat - 12) ** 2);
  const eddy4 = 2.0 * Math.exp(-d4 / 15);

  // Sinusoidal perturbations (mesoscale eddies)
  const sin1 =
    1.2 *
    Math.sin((lng - 68) * 0.5 * DEG_TO_RAD) *
    Math.cos((lat - 14) * 0.8 * DEG_TO_RAD);
  const sin2 =
    0.8 *
    Math.sin((lng - 73) * 0.7 * DEG_TO_RAD) *
    Math.cos((lat - 10) * 0.6 * DEG_TO_RAD);

  const sst = base + eddy1 + eddy2 + eddy3 + eddy4 + sin1 + sin2;
  return clamp(sst, 22, 32);
}

/** Compute current (u,v) at a single lon/lat via streamfunction */
function computeCurrent(lng: number, lat: number): { u: number; v: number } {
  const dLambda = 0.05;
  const dPhi = 0.05;

  // Streamfunction: large-scale monsoon + gyres + mesoscale eddies
  const psi = (l: number, p: number): number => {
    const latT = (p - LAT_MIN) / (LAT_MAX - LAT_MIN);

    // Monsoonal reversal: westward in winter, eastward in summer proxy
    // (using sin of longitude to create seasonal-like variability)
    const monsoon = 15 * (latT - 0.5) * Math.sin(l * 0.3 * DEG_TO_RAD);

    // Western boundary current (Arabian Sea gyre)
    const gyre =
      20 *
      Math.sin((l - 65) * 0.4 * DEG_TO_RAD) *
      Math.cos((p - 14) * 0.6 * DEG_TO_RAD);

    // Equatorial countercurrent
    const eqcc =
      12 * Math.cos(l * 0.25 * DEG_TO_RAD) * Math.exp(-((p - 6) ** 2) / 20);

    // Mesoscale eddies
    const eddy =
      8 *
      Math.sin((l - 70) * 0.8 * DEG_TO_RAD) *
      Math.cos((p - 12) * 0.9 * DEG_TO_RAD);

    return monsoon + gyre + eqcc + eddy;
  };

  // Central differences for velocity: u = -∂ψ/∂lat, v = ∂ψ/∂lng
  const u = -(psi(lng, lat + dPhi) - psi(lng, lat - dPhi)) / (2 * dPhi);
  const v =
    (psi(lng + dLambda, lat) - psi(lng - dLambda, lat)) /
    (2 * dLambda * Math.cos(lat * DEG_TO_RAD));

  return { u, v };
}

/** Build the oceanographic grid */
function buildOceanGrid(): OceanGridCell[] {
  const cells: OceanGridCell[] = [];
  for (let lat = LAT_MIN; lat <= LAT_MAX; lat += GRID_STEP) {
    for (let lng = LNG_MIN; lng <= LNG_MAX; lng += GRID_STEP) {
      cells.push({ lng, lat, sst: computeSst(lng, lat) });
    }
  }
  return cells;
}

/** Build current samples at coarser resolution */
function buildCurrentSamples(): CurrentSample[] {
  const step = GRID_STEP * 2; // coarser for currents
  const samples: CurrentSample[] = [];
  for (let lat = LAT_MIN; lat <= LAT_MAX; lat += step) {
    for (let lng = LNG_MIN; lng <= LNG_MAX; lng += step) {
      const { u, v } = computeCurrent(lng, lat);
      const speed = Math.sqrt(u * u + v * v);
      samples.push({ lng, lat, u, v, speed });
    }
  }
  return samples;
}

/** Generate a streamline path seeded at (startLng, startLat) following (u,v) field */
function advectPath(
  startLng: number,
  startLat: number,
  steps: number,
  dt: number,
): [number, number][] {
  const path: [number, number][] = [[startLng, startLat]];
  let lng = startLng;
  let lat = startLat;
  for (let i = 0; i < steps; i++) {
    const { u, v } = computeCurrent(lng, lat);
    lng += v * dt; // v is dlon/dt (zonal)
    lat += u * dt; // u is dlat/dt (meridional)
    // Clamp to bbox
    lng = clamp(lng, LNG_MIN, LNG_MAX);
    lat = clamp(lat, LAT_MIN, LAT_MAX);
    path.push([lng, lat]);
  }
  return path;
}

/** Build animated streamline trips from current samples */
function buildStreamlineTrips(samples: CurrentSample[]): TripStreamline[] {
  const TRIP_POINTS = 40;
  const dt = 0.01;
  return samples.map((s, i) => {
    const path = advectPath(s.lng, s.lat, TRIP_POINTS, dt);
    const timestamps = path.map((_, idx) => idx);
    return { shipId: `current-${i}`, path, timestamps };
  });
}

const ARC_POINTS = 400;
const BASE_LOOP_SECONDS = 120;

export function useMaritimeOcean() {
  const oceanGrid = ref<OceanGridCell[]>(buildOceanGrid());
  const currentSamples = ref<CurrentSample[]>(buildCurrentSamples());
  const streamlineTrips = ref<TripStreamline[]>(
    buildStreamlineTrips(buildCurrentSamples()),
  );

  const showSst = ref(true);
  const showCurrents = ref(true);
  const sstOpacity = ref(0.6);
  const currentDensity = ref(0.7);
  const currentSpeed = ref(1);

  const currentTime = ref(0);
  const isPlaying = ref(false);

  let animationFrame: number | null = null;
  let lastTimestamp = 0;

  // Stats
  const stats = computed<OceanStats>(() => {
    const cells = oceanGrid.value;
    const ssts = cells.map((c) => c.sst);
    const minSst = Math.min(...ssts);
    const maxSst = Math.max(...ssts);
    const meanCurrent =
      currentSamples.value.reduce((a, c) => a + c.speed, 0) /
      currentSamples.value.length;
    return {
      minSst: Math.round(minSst * 10) / 10,
      maxSst: Math.round(maxSst * 10) / 10,
      meanCurrent: Math.round(meanCurrent * 100) / 100,
      gridCells: cells.length,
    };
  });

  const loopedTime = computed(() => currentTime.value % ARC_POINTS);

  function animate(timestamp: number): void {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (isPlaying.value) {
      const increment =
        (delta * currentSpeed.value * ARC_POINTS) / BASE_LOOP_SECONDS;
      currentTime.value += increment;
    }

    animationFrame = requestAnimationFrame(animate);
  }

  function play(): void {
    isPlaying.value = true;
    lastTimestamp = 0;
    if (!animationFrame) {
      animationFrame = requestAnimationFrame(animate);
    }
  }

  function pause(): void {
    isPlaying.value = false;
  }

  function reset(): void {
    isPlaying.value = false;
    currentTime.value = 0;
    lastTimestamp = 0;
  }

  function cleanup(): void {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  // Rebuild streamline trips when density changes
  watch(currentDensity, (density) => {
    // Subsample current samples based on density (0.3 = sparse, 1.0 = full)
    const step = Math.max(1, Math.round(1 / density));
    const subsampled = currentSamples.value.filter((_, i) => i % step === 0);
    streamlineTrips.value = buildStreamlineTrips(subsampled);
  });

  return {
    oceanGrid,
    currentSamples,
    streamlineTrips,
    showSst,
    showCurrents,
    sstOpacity,
    currentDensity,
    currentSpeed,
    stats,
    loopedTime,
    isPlaying,
    play,
    pause,
    reset,
    cleanup,
  };
}
