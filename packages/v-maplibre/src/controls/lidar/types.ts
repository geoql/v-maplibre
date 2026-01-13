export type { ControlPosition } from 'maplibre-gl';

export type ColorScheme = 'elevation' | 'intensity' | 'classification' | 'rgb';
export type CopcLoadingMode = 'full' | 'dynamic';

export interface PointCloudBounds {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
}

export interface PointCloudInfo {
  id: string;
  name: string;
  pointCount: number;
  bounds: PointCloudBounds;
  hasRGB: boolean;
  hasIntensity: boolean;
  hasClassification: boolean;
  source: string;
  wkt?: string;
}

export interface StreamingProgress {
  loadedNodes: number;
  loadedPoints: number;
  queueSize: number;
  isLoading: boolean;
}

export interface LidarControlOptions {
  /** Start collapsed (default: true) */
  collapsed?: boolean;
  /** Panel title (default: 'LiDAR Viewer') */
  title?: string;
  /** Panel width in pixels (default: 365) */
  panelWidth?: number;
  /** Panel max height with scrollbar (default: 500) */
  panelMaxHeight?: number;
  /** Custom CSS class */
  className?: string;

  /** Point size in pixels (default: 2) */
  pointSize?: number;
  /** Opacity 0-1 (default: 1.0) */
  opacity?: number;
  /** Color scheme (default: 'elevation') */
  colorScheme?: ColorScheme;
  /** Use 2-98% percentile for coloring (default: true) */
  usePercentile?: boolean;
  /** Max points to display (default: 1000000) */
  pointBudget?: number;

  /** Elevation filter range */
  elevationRange?: [number, number] | null;
  /** Enable Z offset adjustment (default: false) */
  zOffsetEnabled?: boolean;
  /** Z offset in meters (default: 0) */
  zOffset?: number;

  /** Enable point picking/hover tooltips (default: false) */
  pickable?: boolean;
  /** Fields to show in tooltip (default: all) */
  pickInfoFields?: string[];

  /** Auto zoom to data after loading (default: true) */
  autoZoom?: boolean;

  /** Loading mode for COPC files (default: 'dynamic') */
  copcLoadingMode?: CopcLoadingMode;
  /** Max points for streaming (default: 5000000) */
  streamingPointBudget?: number;
  /** Concurrent node requests (default: 4) */
  streamingMaxConcurrentRequests?: number;
  /** Viewport change debounce (default: 150) */
  streamingViewportDebounceMs?: number;
}

export interface LidarLoadEventData {
  pointCloud: PointCloudInfo;
}

export interface LidarErrorEventData {
  error: Error;
}

export interface LidarUnloadEventData {
  pointCloud: { id: string };
}
