export { default as VLayerDeckglWindParticle } from './VLayerDeckglWindParticle.vue';

/**
 * Wind particle layer re-exports from `maplibre-gl-wind`.
 *
 * @requires `maplibre-gl-wind`
 *
 * Install with:
 * `pnpm add maplibre-gl-wind`
 */
export {
  WindParticleLayer,
  generateWindTexture,
  createWindDataFromOpenWeatherMap,
  windUniforms,
} from 'maplibre-gl-wind';

export type {
  WindParticleLayerProps,
  WindUniformProps,
  ColorStop,
  WindDataPoint,
  WindTextureResult,
  GenerateWindTextureOptions,
} from 'maplibre-gl-wind';
