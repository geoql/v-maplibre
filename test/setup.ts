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
