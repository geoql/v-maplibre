export type SkyMode = 'dawn' | 'day' | 'dusk' | 'night';

export interface SunPosition {
  azimuth: number;
  altitude: number;
}

export interface SkyPreset {
  sun: SunPosition;
  skyColor: string;
  atmosphereBlend: number;
  label: string;
}
