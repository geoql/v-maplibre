import { Euler, Matrix4, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { MercatorCoordinate } from 'maplibre-gl';
import type { Map, CustomLayerInterface } from 'maplibre-gl';
import type { SparkRenderer } from '@sparkjsdev/spark';

/**
 * Shared three.js scene context for a MapLibre map.
 *
 * One custom layer (`type: 'custom'`, `renderingMode: '3d'`) per map drives
 * a single WebGLRenderer bound to MapLibre's canvas/GL context. The draw
 * camera carries a REAL view/projection decomposition of MapLibre's fused
 * mercator matrix every frame: with `V = P^-1 × mainMatrix` (P from
 * `args.projectionMatrix`) and the camera set to
 * `(matrixWorldInverse = rotY180 × V, projectionMatrix = P × rotY180)`,
 * three.js composites `(P × rotY180) × (rotY180 × V) == mainMatrix` exactly,
 * while shaders see a genuine three.js view space. Spark's vertex shader
 * hard-culls any splat with `viewCenter.z >= 0`; MapLibre's embedded view
 * convention lands content at positive z, which silently dropped every
 * splat — the 180° Y rotation negates the view z without changing the
 * product (a rotation, not a reflection: reflections corrupt Spark's
 * quaternion decompose of the renderToView matrix).
 *
 * Because the draw camera's pose follows the map (it dollies with zoom),
 * Spark's stock self-drive (`autoUpdate`) works unmodified: its view-change
 * detection sees every pan/zoom, and content updates land through its own
 * version bumps.
 *
 * Content lives in mercator space: x/y are MercatorCoordinate fractions and
 * the group scale converts meters via `meterInMercatorCoordinateUnits()`
 * (see {@link mercatorGroupMatrix}).
 */
export interface ThreeSceneEntry {
  scene: Scene;
  renderer: WebGLRenderer;
  /**
   * The draw camera — matrices are rewritten from the live map view every
   * rendered frame. Also the correct traversal camera for 3D-tiles LOD.
   */
  camera: PerspectiveCamera;
  /**
   * Standard perspective camera in the same metre world space, used for
   * screen-space-error / LOD maths that requires a plain projection.
   */
  lodCamera: PerspectiveCamera;
  /** Number of live v-maplibre layer components using this entry. */
  refCount: number;
  /** Shared Spark splat renderer (one per scene, created lazily). */
  sparkRenderer: SparkRenderer | null;
  /** Number of live splat layers using {@link sparkRenderer}. */
  splatRefCount: number;
  /** Run `hook` every rendered frame (before the scene draws). */
  addFrameHook: (hook: () => void) => () => void;
  /** Request a new map frame (wraps map.triggerRepaint). */
  requestRender: () => void;
  /** Move the shared custom layer before the given MapLibre layer id. */
  setBefore: (beforeId?: string) => void;
}

interface CustomLayerRenderArgs {
  projectionMatrix: ArrayLike<number>;
  defaultProjectionData: { mainMatrix: ArrayLike<number> };
}

const registry = new WeakMap<Map, ThreeSceneEntry>();

let layerSeq = 0;

/**
 * Scene origin: the mercator anchor whose local ENU metre frame IS the
 * shared three.js world space. Set once from the map centre on first
 * acquire, then held fixed so content coordinates stay stable while panning.
 */
const sceneOrigins = new WeakMap<
  Map,
  { origin: MercatorCoordinate; metres: number }
>();

function sceneOriginFor(map: Map) {
  let found = sceneOrigins.get(map);
  if (!found) {
    const c = map.getCenter();
    const origin = MercatorCoordinate.fromLngLat([c.lng, c.lat], 0);
    found = { origin, metres: origin.meterInMercatorCoordinateUnits() };
    sceneOrigins.set(map, found);
  }
  return found;
}

/**
 * Model matrix placing content at a geographic anchor inside the scene's
 * local ENU metre frame (x east, y north, z up, 1 unit = 1 metre).
 *
 * Metres — not mercator fractions — because Spark packs splat centres into
 * HALF-FLOAT textures. In mercator space a 30 m object spans ~3e-7 units at
 * an offset of ~0.5, far below half-float resolution there, so every splat
 * centre quantises to the same point and the scene renders empty.
 */
export function mercatorGroupMatrix(
  map: Map,
  longitude: number,
  latitude: number,
  altitude: number,
  rotation: [number, number, number],
  scale: number,
): Matrix4 {
  const { origin, metres } = sceneOriginFor(map);
  const anchor = MercatorCoordinate.fromLngLat([longitude, latitude], altitude);
  return new Matrix4()
    .makeTranslation(
      (anchor.x - origin.x) / metres,
      -(anchor.y - origin.y) / metres,
      (anchor.z - origin.z) / metres,
    )
    .multiply(
      new Matrix4().makeRotationFromEuler(
        new Euler(
          (rotation[0] * Math.PI) / 180,
          (rotation[1] * Math.PI) / 180,
          (rotation[2] * Math.PI) / 180,
        ),
      ),
    )
    .multiply(new Matrix4().makeScale(scale, scale, scale));
}

/**
 * Get (or lazily create) the shared three.js scene context for `map` and
 * increment its refcount. Call {@link releaseThreeScene} once per acquire.
 * The map must already have a parsed style (custom layers attach into it).
 */
export function acquireThreeScene(map: Map): ThreeSceneEntry {
  const existing = registry.get(map);
  if (existing) {
    existing.refCount += 1;
    return existing;
  }

  const canvas = map.getCanvas();
  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas,
    context: canvas.getContext('webgl2') ?? undefined,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.autoClear = false;

  const scene = new Scene();

  const camera = new PerspectiveCamera();
  camera.matrixAutoUpdate = false;
  camera.matrixWorldAutoUpdate = false;
  // The near/far PROPERTIES only feed Spark's depth uniforms (the matrices
  // are set directly); keep them in mercator-fraction scale.
  camera.near = 0.1;
  camera.far = 1e7;

  // Pose helper: the rigid view (rotation + translation, no scale) of the
  // map camera in mercator-fraction space.
  const poseCamera = new PerspectiveCamera();

  const frameHooks = new Set<() => void>();

  const mainMatrix = new Matrix4();
  const viewInverse = new Matrix4();
  const worldToMercator = new Matrix4();

  const layerId = `v-maplibre-three-${(layerSeq += 1)}`;

  const entry: ThreeSceneEntry = {
    scene,
    renderer,
    camera,
    lodCamera: poseCamera,
    refCount: 0,
    sparkRenderer: null,
    splatRefCount: 0,
    addFrameHook: (hook) => {
      frameHooks.add(hook);
      return () => frameHooks.delete(hook);
    },
    requestRender: () => {
      map.triggerRepaint();
    },
    setBefore: (beforeId) => {
      if (!beforeId || !map.getLayer(beforeId)) return;
      if (map.getLayer(layerId)) {
        map.moveLayer(layerId, beforeId);
      }
    },
  };

  const customLayer: CustomLayerInterface = {
    id: layerId,
    type: 'custom',
    renderingMode: '3d',
    render(_gl, args) {
      const renderArgs = args as unknown as CustomLayerRenderArgs;
      mainMatrix.fromArray(
        renderArgs.defaultProjectionData.mainMatrix as number[],
      );

      // Rigid view of the map camera in mercator-fraction space, built
      // from the live transform. Spark decomposes the view matrix it is
      // given (dropping scale), so it must be rigid — P⁻¹ × mainMatrix is
      // not, because mainMatrix deliberately scales z differently than
      // x/y. The draw projection is then mainMatrix × rigidView⁻¹, which
      // composes back to exactly mainMatrix for every object in the scene.
      const { origin, metres } = sceneOriginFor(map);
      worldToMercator
        .makeTranslation(origin.x, origin.y, origin.z)
        .multiply(new Matrix4().makeScale(metres, -metres, metres));

      const t = map.transform;
      const invWorldSize = 1 / t.worldSize;
      const cp = t.cameraPosition;
      poseCamera.position.set(
        (cp[0] * invWorldSize - origin.x) / metres,
        -(cp[1] * invWorldSize - origin.y) / metres,
        (cp[2] * invWorldSize - origin.z) / metres,
      );
      const c = map.getCenter();
      const target = MercatorCoordinate.fromLngLat(
        [c.lng, c.lat],
        map.getCenterElevation(),
      );
      poseCamera.up.set(0, 0, 1);
      poseCamera.lookAt(
        (target.x - origin.x) / metres,
        -(target.y - origin.y) / metres,
        (target.z - origin.z) / metres,
      );
      poseCamera.updateMatrixWorld(true);

      // Real perspective projection in the metre frame. The draw camera's
      // projection is MapLibre's fused mercator matrix, which is not a
      // plain perspective — 3D-tiles screen-space-error maths reads
      // projectionMatrix directly, so LOD selection needs this one.
      poseCamera.fov = t.fov;
      poseCamera.aspect = canvas.clientWidth / canvas.clientHeight;
      poseCamera.near = 0.1;
      poseCamera.far = 1e7;
      poseCamera.updateProjectionMatrix();

      viewInverse.copy(poseCamera.matrixWorldInverse);
      camera.matrixWorldInverse.copy(viewInverse);
      camera.matrixWorld.copy(poseCamera.matrixWorld);
      camera.projectionMatrix
        .copy(mainMatrix)
        .multiply(worldToMercator)
        .multiply(poseCamera.matrixWorld);
      camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();

      for (const hook of frameHooks) {
        hook();
      }

      renderer.resetState();
      renderer.render(scene, camera);

      // Spark streams and re-sorts splats across frames (async GPU readback),
      // so a single MapLibre repaint is never enough — keep the map painting
      // while any splat renderer is attached.
      if (entry.sparkRenderer) {
        map.triggerRepaint();
      }
    },
  };

  map.on('resize', () => {
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  });
  map.addLayer(customLayer);
  registry.set(map, entry);
  entry.refCount = 1;
  return entry;
}

/**
 * Release one reference to the shared scene context. The last release
 * removes the custom layer and disposes the renderer; a later acquire
 * creates a fresh context.
 */
export function releaseThreeScene(map: Map): void {
  const entry = registry.get(map);
  if (!entry) return;
  entry.refCount -= 1;
  if (entry.refCount > 0) return;
  registry.delete(map);
  for (const child of [...entry.scene.children]) {
    entry.scene.remove(child);
  }
  entry.sparkRenderer = null;
  for (const layer of map.getStyle()?.layers ?? []) {
    if (layer.id.startsWith('v-maplibre-three-') && map.getLayer(layer.id)) {
      map.removeLayer(layer.id);
    }
  }
  entry.renderer.dispose();
}

/**
 * Register a splat layer against the entry's shared SparkRenderer, creating
 * it via `create()` on first use. Returns the active renderer.
 */
export function retainSparkRenderer(
  entry: ThreeSceneEntry,
  create: () => SparkRenderer,
): SparkRenderer {
  if (!entry.sparkRenderer) {
    entry.sparkRenderer = create();
    entry.scene.add(entry.sparkRenderer);
  }
  entry.splatRefCount += 1;
  return entry.sparkRenderer;
}

/**
 * Release one splat-layer reference to the shared SparkRenderer; the last
 * release removes it from the scene and disposes its GPU resources.
 */
export function releaseSparkRenderer(entry: ThreeSceneEntry): void {
  entry.splatRefCount -= 1;
  if (entry.splatRefCount > 0) return;
  entry.splatRefCount = 0;
  if (entry.sparkRenderer) {
    entry.scene.remove(entry.sparkRenderer);
    entry.sparkRenderer.dispose();
    entry.sparkRenderer = null;
  }
}
