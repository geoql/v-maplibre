import { vi } from 'vitest';
import type { StyleSpecification, MapOptions } from 'maplibre-gl';

type LngLatLike = [number, number] | { lng: number; lat: number };
type EventCallback = (...args: unknown[]) => void;

interface MockMapOptions extends Partial<MapOptions> {
  container: HTMLElement | string;
  style?: string | StyleSpecification;
  center?: [number, number];
  zoom?: number;
}

// Mock MapLibre GL
class MockMap {
  private _container: HTMLElement | string;
  private _style: string | StyleSpecification | undefined;
  private _center: [number, number];
  private _zoom: number;
  private _listeners: Map<string, Set<EventCallback>> = new Map();

  constructor(options: MockMapOptions) {
    this._container = options.container;
    this._style = options.style;
    this._center = options.center || [0, 0];
    this._zoom = options.zoom || 0;
  }

  on(event: string, callback: EventCallback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event)!.add(callback);
    return this;
  }

  off(event: string, callback: EventCallback) {
    if (this._listeners.has(event)) {
      this._listeners.get(event)!.delete(callback);
    }
    return this;
  }

  addControl(_control: unknown, _position?: string) {
    return this;
  }

  removeControl(_control: unknown) {
    return this;
  }

  addSource(_id: string, _source: unknown) {
    return this;
  }

  removeSource(_id: string) {
    return this;
  }

  addLayer(_layer: unknown, _beforeId?: string) {
    return this;
  }

  removeLayer(_id: string) {
    return this;
  }

  getSource(_id: string) {
    return {
      setData: vi.fn(),
    };
  }

  getLayer(_id: string) {
    return {};
  }

  hasImage(_id: string) {
    return false;
  }

  loadImage(
    url: string,
    callback: (
      error: Error | null,
      image?: HTMLImageElement | ImageBitmap,
    ) => void,
  ) {
    callback(null, { width: 100, height: 100 } as unknown as HTMLImageElement);
  }

  addImage(_id: string, _image: unknown, _options?: unknown) {
    return this;
  }

  getCenter() {
    return { lng: this._center[0], lat: this._center[1] };
  }

  getZoom() {
    return this._zoom;
  }

  setCenter(center: [number, number]) {
    this._center = center;
    return this;
  }

  setZoom(zoom: number) {
    this._zoom = zoom;
    return this;
  }

  isStyleLoaded() {
    return true;
  }

  loaded() {
    return true;
  }

  setLayoutProperty(_layerId: string, _name: string, _value: unknown) {
    return this;
  }

  remove() {
    return this;
  }
}

interface MockMarkerOptions {
  element?: HTMLElement;
  color?: string;
  draggable?: boolean;
}

class MockMarker {
  private _lngLat: LngLatLike | undefined;
  private _element: HTMLElement;
  private _listeners: Map<string, Set<EventCallback>> = new Map();

  constructor(options?: MockMarkerOptions) {
    this._element = options?.element || document.createElement('div');
  }

  setLngLat(lngLat: LngLatLike) {
    this._lngLat = lngLat;
    return this;
  }

  getLngLat() {
    return this._lngLat;
  }

  addTo(_map: MockMap) {
    return this;
  }

  remove() {
    return this;
  }

  setDraggable(_draggable: boolean) {
    return this;
  }

  on(event: string, callback: EventCallback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event)!.add(callback);
    return this;
  }

  off(event: string, callback: EventCallback) {
    if (this._listeners.has(event)) {
      this._listeners.get(event)!.delete(callback);
    }
    return this;
  }

  getElement() {
    return this._element;
  }
}

interface MockPopupOptions {
  closeButton?: boolean;
  closeOnClick?: boolean;
  maxWidth?: string;
  offset?: number | [number, number];
}

class MockPopup {
  private _lngLat: LngLatLike | undefined;
  private _options: MockPopupOptions;
  private _listeners: Map<string, Set<EventCallback>> = new Map();

  constructor(options?: MockPopupOptions) {
    this._options = options || {};
  }

  setLngLat(lngLat: LngLatLike) {
    this._lngLat = lngLat;
    return this;
  }

  setHTML(_html: string) {
    return this;
  }

  setDOMContent(_node: HTMLElement) {
    return this;
  }

  addTo(_map: MockMap) {
    return this;
  }

  remove() {
    return this;
  }

  on(event: string, callback: EventCallback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event)!.add(callback);
    return this;
  }

  off(event: string, callback: EventCallback) {
    if (this._listeners.has(event)) {
      this._listeners.get(event)!.delete(callback);
    }
    return this;
  }
}

class MockNavigationControl {
  onAdd(_map: MockMap): HTMLElement {
    return document.createElement('div');
  }

  onRemove() {}
}

class MockScaleControl {
  onAdd(_map: MockMap): HTMLElement {
    return document.createElement('div');
  }

  onRemove() {}
}

class MockGeolocateControl {
  onAdd(_map: MockMap): HTMLElement {
    return document.createElement('div');
  }

  onRemove() {}
}

class MockFullscreenControl {
  onAdd(_map: MockMap): HTMLElement {
    return document.createElement('div');
  }

  onRemove() {}
}

class MockAttributionControl {
  onAdd(_map: MockMap): HTMLElement {
    return document.createElement('div');
  }

  onRemove() {}
}

// Mock maplibre-gl module
vi.mock('maplibre-gl', () => ({
  default: {
    Map: MockMap,
    Marker: MockMarker,
    Popup: MockPopup,
    NavigationControl: MockNavigationControl,
    ScaleControl: MockScaleControl,
    GeolocateControl: MockGeolocateControl,
    FullscreenControl: MockFullscreenControl,
    AttributionControl: MockAttributionControl,
    addProtocol: vi.fn(),
  },
  Map: MockMap,
  Marker: MockMarker,
  Popup: MockPopup,
  NavigationControl: MockNavigationControl,
  ScaleControl: MockScaleControl,
  GeolocateControl: MockGeolocateControl,
  FullscreenControl: MockFullscreenControl,
  AttributionControl: MockAttributionControl,
  addProtocol: vi.fn(),
}));

// Mock pmtiles
vi.mock('pmtiles', () => ({
  Protocol: class {
    tile = vi.fn();
    add = vi.fn();
  },
  PMTiles: class {
    constructor(_url: string) {}
    getHeader = vi.fn().mockResolvedValue({});
  },
}));

// Mock deck.gl Layer base class
class MockLayer {
  id: string;
  props: Record<string, unknown>;

  constructor(props: Record<string, unknown>) {
    this.id = props.id as string;
    this.props = props;
  }
}

// Mock MapboxOverlay
class MockMapboxOverlay {
  private _layers: MockLayer[] = [];
  private _map: unknown = null;

  constructor(_props?: Record<string, unknown>) {}

  setProps(props: { layers?: MockLayer[] }) {
    if (props.layers) {
      this._layers = props.layers;
    }
  }

  onAdd(map: unknown) {
    this._map = map;
    return document.createElement('div');
  }

  onRemove() {
    this._map = null;
  }

  getCanvas() {
    return document.createElement('canvas');
  }
}

// Create layer mock factory
const createLayerMock = (name: string) => {
  return class extends MockLayer {
    static layerName = name;
  };
};

// Mock @deck.gl/core
vi.mock('@deck.gl/core', () => ({
  Layer: MockLayer,
  CompositeLayer: MockLayer,
  COORDINATE_SYSTEM: {
    LNGLAT: 1,
    METER_OFFSETS: 2,
    LNGLAT_OFFSETS: 3,
    CARTESIAN: 0,
  },
  picking: {},
}));

// Mock @deck.gl/layers
vi.mock('@deck.gl/layers', () => ({
  ScatterplotLayer: createLayerMock('ScatterplotLayer'),
  ArcLayer: createLayerMock('ArcLayer'),
  LineLayer: createLayerMock('LineLayer'),
  PathLayer: createLayerMock('PathLayer'),
  PolygonLayer: createLayerMock('PolygonLayer'),
  SolidPolygonLayer: createLayerMock('SolidPolygonLayer'),
  GeoJsonLayer: createLayerMock('GeoJsonLayer'),
  IconLayer: createLayerMock('IconLayer'),
  TextLayer: createLayerMock('TextLayer'),
  ColumnLayer: createLayerMock('ColumnLayer'),
  BitmapLayer: createLayerMock('BitmapLayer'),
  GridCellLayer: createLayerMock('GridCellLayer'),
  PointCloudLayer: createLayerMock('PointCloudLayer'),
}));

// Mock @deck.gl/aggregation-layers
vi.mock('@deck.gl/aggregation-layers', () => ({
  HeatmapLayer: createLayerMock('HeatmapLayer'),
  HexagonLayer: createLayerMock('HexagonLayer'),
  GridLayer: createLayerMock('GridLayer'),
  ContourLayer: createLayerMock('ContourLayer'),
  ScreenGridLayer: createLayerMock('ScreenGridLayer'),
}));

// Mock @deck.gl/geo-layers
vi.mock('@deck.gl/geo-layers', () => ({
  TripsLayer: createLayerMock('TripsLayer'),
  H3HexagonLayer: createLayerMock('H3HexagonLayer'),
  H3ClusterLayer: createLayerMock('H3ClusterLayer'),
  MVTLayer: createLayerMock('MVTLayer'),
  TileLayer: createLayerMock('TileLayer'),
  Tile3DLayer: createLayerMock('Tile3DLayer'),
  TerrainLayer: createLayerMock('TerrainLayer'),
  GreatCircleLayer: createLayerMock('GreatCircleLayer'),
  S2Layer: createLayerMock('S2Layer'),
  GeohashLayer: createLayerMock('GeohashLayer'),
  QuadkeyLayer: createLayerMock('QuadkeyLayer'),
  _WMSLayer: createLayerMock('WMSLayer'),
}));

// Mock @deck.gl/mesh-layers
vi.mock('@deck.gl/mesh-layers', () => ({
  SimpleMeshLayer: createLayerMock('SimpleMeshLayer'),
  ScenegraphLayer: createLayerMock('ScenegraphLayer'),
}));

// Mock @deck.gl/mapbox
vi.mock('@deck.gl/mapbox', () => ({
  MapboxOverlay: MockMapboxOverlay,
}));

// Export mocks for use in tests
export { MockMapboxOverlay, MockLayer };
