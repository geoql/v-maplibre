import type {
  Sensor,
  SensorType,
  ThreatEvent,
  ThreatLevel,
  CoverageZone,
  SensorNetworkStats,
  SensorTypeConfig,
} from '~/types/defense-sensor';

const SENSOR_TYPES: SensorTypeConfig[] = [
  {
    type: 'acoustic',
    label: 'Acoustic',
    icon: 'lucide:audio-lines',
    color: [0, 200, 220, 200],
  },
  {
    type: 'radar',
    label: 'Radar',
    icon: 'lucide:radar',
    color: [0, 255, 100, 200],
  },
  {
    type: 'lora',
    label: 'LoRa Relay',
    icon: 'lucide:radio-tower',
    color: [180, 100, 255, 200],
  },
  {
    type: 'jammer',
    label: 'Jammer',
    icon: 'lucide:zap',
    color: [255, 60, 60, 200],
  },
];

const INITIAL_SENSORS: Sensor[] = [
  {
    id: 'AS-01',
    name: 'Acoustic-01',
    type: 'acoustic',
    status: 'active',
    position: [93.3, 27.55],
    detectionRadius: 4,
    color: [0, 200, 220, 200],
  },
  {
    id: 'AS-02',
    name: 'Acoustic-02',
    type: 'acoustic',
    status: 'active',
    position: [93.4, 27.6],
    detectionRadius: 3.5,
    color: [0, 200, 220, 200],
  },
  {
    id: 'AS-03',
    name: 'Acoustic-03',
    type: 'acoustic',
    status: 'active',
    position: [93.5, 27.5],
    detectionRadius: 5,
    color: [0, 200, 220, 200],
  },
  {
    id: 'AS-04',
    name: 'Acoustic-04',
    type: 'acoustic',
    status: 'active',
    position: [93.6, 27.45],
    detectionRadius: 4,
    color: [0, 200, 220, 200],
  },
  {
    id: 'AS-05',
    name: 'Acoustic-05',
    type: 'acoustic',
    status: 'alert',
    position: [93.7, 27.55],
    detectionRadius: 3,
    color: [0, 200, 220, 200],
  },
  {
    id: 'AS-06',
    name: 'Acoustic-06',
    type: 'acoustic',
    status: 'active',
    position: [93.55, 27.65],
    detectionRadius: 4.5,
    color: [0, 200, 220, 200],
  },
  {
    id: 'RAD-01',
    name: 'Radar-01',
    type: 'radar',
    status: 'active',
    position: [93.35, 27.52],
    detectionRadius: 12,
    color: [0, 255, 100, 200],
  },
  {
    id: 'RAD-02',
    name: 'Radar-02',
    type: 'radar',
    status: 'active',
    position: [93.5, 27.58],
    detectionRadius: 15,
    color: [0, 255, 100, 200],
  },
  {
    id: 'RAD-03',
    name: 'Radar-03',
    type: 'radar',
    status: 'active',
    position: [93.65, 27.48],
    detectionRadius: 10,
    color: [0, 255, 100, 200],
  },
  {
    id: 'RAD-04',
    name: 'Radar-04',
    type: 'radar',
    status: 'maintenance',
    position: [93.45, 27.42],
    detectionRadius: 13,
    color: [0, 255, 100, 200],
  },
  {
    id: 'LORA-01',
    name: 'LoRa-01',
    type: 'lora',
    status: 'active',
    position: [93.3, 27.48],
    detectionRadius: 18,
    color: [180, 100, 255, 200],
  },
  {
    id: 'LORA-02',
    name: 'LoRa-02',
    type: 'lora',
    status: 'active',
    position: [93.5, 27.52],
    detectionRadius: 20,
    color: [180, 100, 255, 200],
  },
  {
    id: 'LORA-03',
    name: 'LoRa-03',
    type: 'lora',
    status: 'active',
    position: [93.7, 27.5],
    detectionRadius: 15,
    color: [180, 100, 255, 200],
  },
  {
    id: 'LORA-04',
    name: 'LoRa-04',
    type: 'lora',
    status: 'active',
    position: [93.55, 27.4],
    detectionRadius: 16,
    color: [180, 100, 255, 200],
  },
  {
    id: 'JAM-01',
    name: 'Jammer-01',
    type: 'jammer',
    status: 'active',
    position: [93.45, 27.55],
    detectionRadius: 8,
    color: [255, 60, 60, 200],
  },
  {
    id: 'JAM-02',
    name: 'Jammer-02',
    type: 'jammer',
    status: 'active',
    position: [93.6, 27.52],
    detectionRadius: 6,
    color: [255, 60, 60, 200],
  },
];

const COVERAGE_ZONES: CoverageZone[] = [
  {
    id: 'zone-friendly',
    type: 'friendly',
    polygon: [
      [93.2, 27.38],
      [93.8, 27.38],
      [93.8, 27.62],
      [93.2, 27.62],
      [93.2, 27.38],
    ],
    label: 'Sensor Deployment Zone',
    color: [60, 130, 246, 30],
  },
  {
    id: 'zone-monitored',
    type: 'adversary',
    polygon: [
      [93.2, 27.62],
      [93.8, 27.62],
      [93.8, 27.78],
      [93.2, 27.78],
      [93.2, 27.62],
    ],
    label: 'Monitored Border Zone',
    color: [250, 204, 21, 40],
  },
];

const THREAT_DESCRIPTIONS: string[] = [
  'Unidentified movement detected',
  'Signal anomaly intercepted',
  'Perimeter breach attempt',
  'Acoustic signature, vehicle',
  'Radar contact, low-altitude',
  'EM interference detected',
  'Personnel movement, group',
  'Drone signature detected',
];

export function useSensorNetwork() {
  const sensors = ref<Sensor[]>(structuredClone(INITIAL_SENSORS));
  const threats = ref<ThreatEvent[]>([]);
  const activeSensorTypes = ref<Set<SensorType>>(
    new Set(['acoustic', 'radar', 'lora', 'jammer']),
  );
  const radiusMultiplier = ref<number[]>([1]);
  const pulseTime = ref(0);

  let animationFrame: number | null = null;
  let threatTimer: ReturnType<typeof setInterval> | null = null;

  const filteredSensors = computed(() =>
    sensors.value.filter((s) => activeSensorTypes.value.has(s.type)),
  );

  const stats = computed<SensorNetworkStats>(() => {
    const filtered = filteredSensors.value;
    const active = filtered.filter(
      (s) => s.status === 'active' || s.status === 'alert',
    );
    return {
      totalSensors: filtered.length,
      activeSensors: active.length,
      alertCount: threats.value.length,
      coveragePercent:
        filtered.length > 0
          ? Math.round((active.length / INITIAL_SENSORS.length) * 100)
          : 0,
    };
  });

  function toggleSensorType(type: SensorType): void {
    const next = new Set(activeSensorTypes.value);
    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }
    activeSensorTypes.value = next;
  }

  function generateThreat(): void {
    const centerLng = 93.5 + (Math.random() - 0.5) * 0.5;
    const centerLat = 27.55 + (Math.random() - 0.3) * 0.3;
    const levels: ThreatLevel[] = ['low', 'medium', 'high', 'critical'];
    const level = levels[Math.floor(Math.random() * levels.length)]!;

    const nearby = filteredSensors.value
      .filter((s) => {
        const dx = s.position[0] - centerLng;
        const dy = s.position[1] - centerLat;
        const distKm = Math.sqrt(dx * dx + dy * dy) * 111;
        return distKm < s.detectionRadius * radiusMultiplier.value[0]!;
      })
      .map((s) => s.id);

    const threat: ThreatEvent = {
      id: `threat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      position: [centerLng, centerLat],
      level,
      description:
        THREAT_DESCRIPTIONS[
          Math.floor(Math.random() * THREAT_DESCRIPTIONS.length)
        ]!,
      detectedBy: nearby,
    };

    threats.value = [threat, ...threats.value].slice(0, 10);
  }

  function startAnimation(): void {
    let startTime: number | null = null;

    function tick(timestamp: number): void {
      if (!startTime) startTime = timestamp;
      pulseTime.value = (timestamp - startTime) / 1000;
      animationFrame = requestAnimationFrame(tick);
    }

    animationFrame = requestAnimationFrame(tick);
  }

  function startThreats(): void {
    threatTimer = setInterval(
      () => {
        generateThreat();
      },
      3000 + Math.random() * 2000,
    );
  }

  function cleanup(): void {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    if (threatTimer !== null) {
      clearInterval(threatTimer);
      threatTimer = null;
    }
  }

  return {
    sensors: filteredSensors,
    allSensors: sensors,
    threats,
    activeSensorTypes,
    radiusMultiplier,
    pulseTime,
    stats,
    coverageZones: COVERAGE_ZONES,
    sensorTypes: SENSOR_TYPES,
    toggleSensorType,
    startAnimation,
    startThreats,
    cleanup,
  };
}
