import { Euler, Matrix4, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { MercatorCoordinate } from 'maplibre-gl';
import type { Map, CustomLayerInterface } from 'maplibre-gl';
import type { SparkRenderer } from '@sparkjsdev/spark';

/**
 * Shared three.js scene context for a MapLibre map.
 *
 * One custom layer (`type: 'custom'`, `renderingMode: '3d'`) per map drives
 * a single WebGLRenderer bound to MapLibre's canvas/GL context.
 *
 * The draw camera is a plain `PerspectiveCamera` rebuilt from the live map
 * view each frame: MapLibre's own camera position, look-at target, fov and
 * aspect, in the scene's local ENU metre frame. It is deliberately NOT
 * MapLibre's fused mercator matrix — Spark reads `projectionMatrix[0]` /
 * `[5]` as a focal length when sizing each splat's screen-space ellipse,
 * and 3D-tiles screen-space-error maths reads the same elements, so a fused
 * matrix (which folds the mercator scale into those slots) renders splats
 * as sub-pixel specks or smeared blobs while still projecting their centres
 * to the correct pixel.
 *
 * Because the camera pose follows the map (it dollies with zoom), Spark's
 * stock self-drive (`autoUpdate`) works unmodified: its view-change
 * detection sees every pan/zoom.
 *
 * Content lives in a local ENU metre frame anchored at the scene origin —
 * 1 unit = 1 metre, x east, y north, z up (see {@link mercatorGroupMatrix}).
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

  const viewInverse = new Matrix4();

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
    render() {
      // Rigid view of the map camera, expressed in the scene's local ENU
      // metre frame. Spark decomposes the view matrix it is handed
      // (dropping scale), so it must stay rigid — rotation and translation
      // only, never a fused mercator matrix.
      const { origin, metres } = sceneOriginFor(map);
      const t = map.transform;
      const c = map.getCenter();
      const target = MercatorCoordinate.fromLngLat(
        [c.lng, c.lat],
        map.getCenterElevation(),
      );
      const targetX = (target.x - origin.x) / metres;
      const targetY = -(target.y - origin.y) / metres;
      const targetZ = (target.z - origin.z) / metres;

      // Camera pose from MapLibre's own view geometry rather than
      // `transform.cameraPosition`, whose z is measured from the mercator
      // zero plane and ignores centre elevation — on terrain that puts the
      // camera underground (a 1950 m glacier gets a 373 m camera) and the
      // whole scene is culled. Orbiting the look-at target by pitch and
      // bearing is elevation-agnostic and always lands the camera exactly
      // `cameraToCenterDistance` away, matching MapLibre's own framing.
      const pitch = (t.pitch * Math.PI) / 180;
      const bearing = (t.bearing * Math.PI) / 180;
      const camDistance = t.cameraToCenterDistance / t.worldSize / metres;
      const ground = camDistance * Math.sin(pitch);
      poseCamera.position.set(
        targetX - ground * Math.sin(bearing),
        targetY - ground * Math.cos(bearing),
        targetZ + camDistance * Math.cos(pitch),
      );
      poseCamera.up.set(0, 0, 1);
      poseCamera.lookAt(targetX, targetY, targetZ);
      poseCamera.updateMatrixWorld(true);

      // A TRUE perspective projection, rebuilt from the live map view. It
      // must not be MapLibre's fused mercator matrix: Spark reads
      // `projectionMatrix[0]` / `[5]` as the camera focal length to size
      // each splat's screen-space ellipse, and 3D-tiles screen-space-error
      // maths reads the same elements. A fused matrix folds the mercator
      // scale into those slots, so splats render as sub-pixel specks or
      // smeared blobs even though their centres project to the right pixel.
      // Pose + fov + aspect are taken from MapLibre's own camera, so this
      // projection lands content exactly where the fused one did.
      const dpr = window.devicePixelRatio;
      poseCamera.fov = t.fov;
      poseCamera.aspect = canvas.width / canvas.height;
      poseCamera.near = Math.max(camDistance / 1000, 0.1);
      poseCamera.far = camDistance * 100;
      poseCamera.updateProjectionMatrix();

      viewInverse.copy(poseCamera.matrixWorldInverse);
      camera.matrixWorldInverse.copy(viewInverse);
      camera.matrixWorld.copy(poseCamera.matrixWorld);
      camera.near = poseCamera.near;
      camera.far = poseCamera.far;
      camera.projectionMatrix.copy(poseCamera.projectionMatrix);
      camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
      renderer.setPixelRatio(dpr);

      for (const hook of frameHooks) {
        hook();
      }

      renderer.resetState();
      // MapLibre's depth buffer is written with its own projection's depth
      // convention, which a standard perspective matrix does not share — so
      // every fragment we draw would fail the depth test against terrain.
      // Clearing depth (never colour) keeps correct ordering inside our own
      // scene while compositing over the basemap.
      renderer.clearDepth();
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
