import { vi } from 'vitest';

// Mock MapLibre GL
class MockMap {
  private _container: HTMLElement | string;
  private _style: any;
  private _center: [number, number];
  private _zoom: number;
  private _listeners: Map<string, Set<Function>> = new Map();

  constructor(options: any) {
    this._container = options.container;
    this._style = options.style;
    this._center = options.center || [0, 0];
    this._zoom = options.zoom || 0;
  }

  on(event: string, callback: Function) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event)!.add(callback);
    return this;
  }

  off(event: string, callback: Function) {
    if (this._listeners.has(event)) {
      this._listeners.get(event)!.delete(callback);
    }
    return this;
  }

  addControl(control: any, position?: string) {
    return this;
  }

  removeControl(control: any) {
    return this;
  }

  addSource(id: string, source: any) {
    return this;
  }

  removeSource(id: string) {
    return this;
  }

  addLayer(layer: any, beforeId?: string) {
    return this;
  }

  removeLayer(id: string) {
    return this;
  }

  getSource(id: string) {
    return {
      setData: vi.fn(),
    };
  }

  getLayer(id: string) {
    return {};
  }

  hasImage(id: string) {
    return false;
  }

  loadImage(url: string, callback: Function) {
    callback(null, { width: 100, height: 100 });
  }

  addImage(id: string, image: any, options?: any) {
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

  remove() {
    return this;
  }
}

class MockMarker {
  private _lngLat: any;
  private _element: HTMLElement;
  private _listeners: Map<string, Set<Function>> = new Map();

  constructor(options?: any) {
    this._element = options?.element || document.createElement('div');
  }

  setLngLat(lngLat: any) {
    this._lngLat = lngLat;
    return this;
  }

  getLngLat() {
    return this._lngLat;
  }

  addTo(map: any) {
    return this;
  }

  remove() {
    return this;
  }

  setDraggable(draggable: boolean) {
    return this;
  }

  on(event: string, callback: Function) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event)!.add(callback);
    return this;
  }

  off(event: string, callback: Function) {
    if (this._listeners.has(event)) {
      this._listeners.get(event)!.delete(callback);
    }
    return this;
  }

  getElement() {
    return this._element;
  }
}

class MockPopup {
  private _lngLat: any;
  private _options: any;
  private _listeners: Map<string, Set<Function>> = new Map();

  constructor(options?: any) {
    this._options = options || {};
  }

  setLngLat(lngLat: any) {
    this._lngLat = lngLat;
    return this;
  }

  setHTML(html: string) {
    return this;
  }

  setDOMContent(node: HTMLElement) {
    return this;
  }

  addTo(map: any) {
    return this;
  }

  remove() {
    return this;
  }

  on(event: string, callback: Function) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event)!.add(callback);
    return this;
  }

  off(event: string, callback: Function) {
    if (this._listeners.has(event)) {
      this._listeners.get(event)!.delete(callback);
    }
    return this;
  }
}

class MockNavigationControl {
  onAdd(map: any) {
    return document.createElement('div');
  }

  onRemove() {}
}

class MockScaleControl {
  onAdd(map: any) {
    return document.createElement('div');
  }

  onRemove() {}
}

class MockGeolocateControl {
  onAdd(map: any) {
    return document.createElement('div');
  }

  onRemove() {}
}

class MockFullscreenControl {
  onAdd(map: any) {
    return document.createElement('div');
  }

  onRemove() {}
}

class MockAttributionControl {
  onAdd(map: any) {
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
    constructor(url: string) {}
    getHeader = vi.fn().mockResolvedValue({});
  },
}));
