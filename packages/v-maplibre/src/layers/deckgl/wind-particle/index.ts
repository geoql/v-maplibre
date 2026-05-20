export { default as VLayerDeckglWindParticle } from './VLayerDeckglWindParticle.vue';

/**
 * Type-only re-exports from `maplibre-gl-wind` (erased at compile time).
 *
 * @requires `maplibre-gl-wind`
 *
 * Install with:
 * `pnpm add maplibre-gl-wind`
 *
 * NOTE: Runtime values (`WindParticleLayer`, `generateWindTexture`,
 * `createWindDataFromOpenWeatherMap`, `windUniforms`) were intentionally
 * removed from this barrel. Re-exporting them forced `maplibre-gl-wind` to
 * evaluate at consumer module-load time (via the `import { ... } from
 * 'maplibre-gl-wind'` line that lived here), which defeated the
 * "two required deps, everything else opt-in" contract from the README
 * (issue #103). Consumers needing those helpers must import them directly
 * from `maplibre-gl-wind` — which they already have installed to use
 * `VLayerDeckglWindParticle`.
 */
export type {
  WindParticleLayerProps,
  WindUniformProps,
  ColorStop,
  WindDataPoint,
  WindTextureResult,
  GenerateWindTextureOptions,
} from 'maplibre-gl-wind';
