import type { SkyMode, SkyPreset } from '~/types/globe';

const SKY_PRESETS: Record<SkyMode, SkyPreset> = {
  dawn: {
    sun: { azimuth: 90, altitude: -6 },
    skyColor: '#1a0a2e',
    atmosphereBlend: 0.85,
    label: 'Dawn',
  },
  day: {
    sun: { azimuth: 180, altitude: 45 },
    skyColor: '#87CEEB',
    atmosphereBlend: 1,
    label: 'Day',
  },
  dusk: {
    sun: { azimuth: 270, altitude: -3 },
    skyColor: '#2d1b4e',
    atmosphereBlend: 0.85,
    label: 'Dusk',
  },
  night: {
    sun: { azimuth: 0, altitude: -30 },
    skyColor: '#000011',
    atmosphereBlend: 0.8,
    label: 'Night',
  },
};

export function useGlobeAtmosphere(initialMode: SkyMode = 'day') {
  const currentMode = ref<SkyMode>(initialMode);

  const currentPreset = computed(() => SKY_PRESETS[currentMode.value]);
  const sunAzimuth = computed(() => currentPreset.value.sun.azimuth);
  const sunAltitude = computed(() => currentPreset.value.sun.altitude);

  function setMode(mode: SkyMode) {
    currentMode.value = mode;
  }

  const modes: SkyMode[] = ['dawn', 'day', 'dusk', 'night'];

  return {
    currentMode: readonly(currentMode),
    currentPreset,
    sunAzimuth,
    sunAltitude,
    setMode,
    modes,
  };
}
