/**
 * Types for MapLibre's worker entry, which `src/maplibre-worker.ts` re-exports
 * so `vp pack` bundles it into a self-contained `dist/maplibre-worker.js`.
 *
 * `maplibre-gl` ships no declaration for this deep import. Its default export
 * is the internal `Worker` class (`src/source/worker.ts`); the shape below
 * mirrors that class's constructor as declared in `maplibre-gl.d.ts`. The
 * class itself is not exported from `maplibre-gl`, so it is redeclared here.
 */
declare module 'maplibre-gl/dist/maplibre-gl-worker.mjs' {
  import type { WorkerGlobalScopeInterface } from 'maplibre-gl';

  /** Mirrors MapLibre's internal `ActorTarget` (`src/util/actor.ts`). */
  interface ActorTarget {
    addEventListener: typeof window.addEventListener;
    removeEventListener: typeof window.removeEventListener;
    postMessage: typeof window.postMessage;
    terminate?: () => void;
  }

  /** MapLibre's worker-thread entry class. It boots itself on import. */
  export default class MaplibreWorker {
    constructor(self: WorkerGlobalScopeInterface & ActorTarget);
  }
}
