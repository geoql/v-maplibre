<script setup lang="ts">
  /**
   * VLayerDeckglMosaic - Client-side COG mosaic layer for STAC items
   *
   * TODO: When @developmentseed/deck.gl-geotiff releases a version > 0.1.0 with MosaicLayer:
   * 1. Remove inline MosaicTileset2D and MosaicLayer classes - use from package instead
   * 2. Remove getProj4String() helper - newer version supports EPSG strings in `def` field
   * 3. Remove unit normalization ('m' -> 'metre') - newer version handles this
   * 4. Import MosaicLayer directly: import { MosaicLayer } from '@developmentseed/deck.gl-geotiff'
   * 5. See working example: https://github.com/developmentseed/deck.gl-raster/blob/main/examples/naip-mosaic/src/App.tsx
   *
   * Current hacks are needed because npm v0.1.0 doesn't include MosaicLayer from PR #184
   * https://github.com/developmentseed/deck.gl-raster/pull/184
   */
  import {
    onMounted,
    onBeforeUnmount,
    watch,
    shallowRef,
    markRaw,
    toRaw,
  } from 'vue';
  import type { Color, PickingInfo, Viewport } from '@deck.gl/core';
  import type { _TileLoadProps } from '@deck.gl/geo-layers';
  import type { GeoTIFF, GeoTIFFImage } from 'geotiff';

  // TileIndex is not exported from @deck.gl/geo-layers, define locally
  type TileIndex = { x: number; y: number; z: number };

  // Re-export TileLoadProps for internal use
  type TileLoadProps = _TileLoadProps;
  import type { Device, Texture } from '@luma.gl/core';
  import type { RasterModule } from '@developmentseed/deck.gl-raster';
  import type { COGLayerProps } from '@developmentseed/deck.gl-geotiff';
  import type { Pool } from 'geotiff';

  // GetTileDataOptions is not exported from @developmentseed/deck.gl-geotiff, define locally
  interface GetTileDataOptions {
    device: Device;
    window?: [number, number, number, number];
    signal?: AbortSignal;
    pool: Pool;
  }
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  /**
   * A STAC-like item with bounding box and COG asset URL
   */
  export interface MosaicSource {
    /** Bounding box [minX, minY, maxX, maxY] in WGS84 */
    bbox: [number, number, number, number];
    /** Asset containing the COG URL */
    assets: {
      image: { href: string };
    };
  }

  /**
   * Extended TileIndex that includes MosaicSource data
   */
  interface MosaicTileIndex extends TileIndex, MosaicSource {}

  /**
   * Render mode for the mosaic layer
   */
  export type MosaicRenderMode = 'trueColor' | 'falseColor' | 'ndvi' | 'custom';

  /**
   * Custom render module for advanced band manipulation
   */
  export interface RenderModule {
    module: { name: string; inject?: Record<string, string> };
    props?: Record<string, unknown>;
  }

  interface Props {
    id: string;
    /**
     * Array of STAC-like items with bbox and COG asset URLs
     */
    sources: MosaicSource[];
    /**
     * Render mode: trueColor (RGB), falseColor (NIR-R-G), ndvi (with colormap)
     */
    renderMode?: MosaicRenderMode;
    /**
     * Custom render modules (only used when renderMode is 'custom')
     */
    customRenderModules?: (texture: Texture) => RenderModule[];
    /**
     * Custom colormap texture data for NDVI (Uint8ClampedArray of RGBA values, 256 colors)
     * If not provided, uses cfastie colormap
     */
    colormapData?: Uint8ClampedArray;
    /**
     * Maximum number of tiles to cache
     */
    maxCacheSize?: number;
    /**
     * Layer opacity (0-1)
     */
    opacity?: number;
    /**
     * Layer visibility
     */
    visible?: boolean;
    /**
     * Enable picking on this layer
     */
    pickable?: boolean;
    /**
     * Auto highlight on hover
     */
    autoHighlight?: boolean;
    /**
     * Highlight color when autoHighlight is enabled
     */
    highlightColor?: Color;
    /**
     * Insert layer before this layer id
     */
    beforeId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    renderMode: 'trueColor',
    maxCacheSize: Infinity,
    opacity: 1,
    visible: true,
    pickable: false,
    autoHighlight: false,
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
    sourceLoad: [source: MosaicSource];
    error: [error: Error, source?: MosaicSource];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  // Texture data type returned by getTileData
  interface TextureData {
    texture: Texture;
    width: number;
    height: number;
  }

  // Loaded module references
  interface LoadedModules {
    COGLayer: typeof import('@developmentseed/deck.gl-geotiff').COGLayer;
    Colormap: RasterModule['module'];
    CreateTexture: RasterModule['module'];
    TileLayer: typeof import('@deck.gl/geo-layers').TileLayer;
    Tileset2D: typeof import('@deck.gl/geo-layers')._Tileset2D;
    CompositeLayer: typeof import('@deck.gl/core').CompositeLayer;
    fromUrl: typeof import('geotiff').fromUrl;
    Flatbush: typeof import('flatbush').default;
    proj4Defs: (
      name: string,
      def?: string,
    ) => import('proj4').ProjectionDefinition | undefined;
  }

  const modules = shallowRef<LoadedModules | null>(null);
  const colormapTexture = shallowRef<Texture | null>(null);
  const deviceRef = shallowRef<Device | null>(null);

  // Default cfastie colormap for NDVI visualization
  const CFASTIE_COLORMAP = new Uint8ClampedArray([
    255, 255, 255, 255, 250, 250, 250, 255, 246, 246, 246, 255, 242, 242, 242,
    255, 238, 238, 238, 255, 233, 233, 233, 255, 229, 229, 229, 255, 225, 225,
    225, 255, 221, 221, 221, 255, 216, 216, 216, 255, 212, 212, 212, 255, 208,
    208, 208, 255, 204, 204, 204, 255, 200, 200, 200, 255, 195, 195, 195, 255,
    191, 191, 191, 255, 187, 187, 187, 255, 183, 183, 183, 255, 178, 178, 178,
    255, 174, 174, 174, 255, 170, 170, 170, 255, 166, 166, 166, 255, 161, 161,
    161, 255, 157, 157, 157, 255, 153, 153, 153, 255, 149, 149, 149, 255, 145,
    145, 145, 255, 140, 140, 140, 255, 136, 136, 136, 255, 132, 132, 132, 255,
    128, 128, 128, 255, 123, 123, 123, 255, 119, 119, 119, 255, 115, 115, 115,
    255, 111, 111, 111, 255, 106, 106, 106, 255, 102, 102, 102, 255, 98, 98, 98,
    255, 94, 94, 94, 255, 90, 90, 90, 255, 85, 85, 85, 255, 81, 81, 81, 255, 77,
    77, 77, 255, 73, 73, 73, 255, 68, 68, 68, 255, 64, 64, 64, 255, 60, 60, 60,
    255, 56, 56, 56, 255, 52, 52, 52, 255, 56, 56, 56, 255, 60, 60, 60, 255, 64,
    64, 64, 255, 68, 68, 68, 255, 73, 73, 73, 255, 77, 77, 77, 255, 81, 81, 81,
    255, 85, 85, 85, 255, 90, 90, 90, 255, 94, 94, 94, 255, 98, 98, 98, 255,
    102, 102, 102, 255, 106, 106, 106, 255, 111, 111, 111, 255, 115, 115, 115,
    255, 119, 119, 119, 255, 123, 123, 123, 255, 128, 128, 128, 255, 132, 132,
    132, 255, 136, 136, 136, 255, 140, 140, 140, 255, 145, 145, 145, 255, 149,
    149, 149, 255, 153, 153, 153, 255, 157, 157, 157, 255, 161, 161, 161, 255,
    166, 166, 166, 255, 170, 170, 170, 255, 174, 174, 174, 255, 178, 178, 178,
    255, 183, 183, 183, 255, 187, 187, 187, 255, 191, 191, 191, 255, 195, 195,
    195, 255, 200, 200, 200, 255, 204, 204, 204, 255, 208, 208, 208, 255, 212,
    212, 212, 255, 216, 216, 216, 255, 221, 221, 221, 255, 225, 225, 225, 255,
    229, 229, 229, 255, 233, 233, 233, 255, 238, 238, 238, 255, 242, 242, 242,
    255, 246, 246, 246, 255, 250, 250, 250, 255, 255, 255, 255, 255, 250, 250,
    250, 255, 245, 245, 245, 255, 240, 240, 240, 255, 235, 235, 235, 255, 230,
    230, 230, 255, 225, 225, 225, 255, 220, 220, 220, 255, 215, 215, 215, 255,
    210, 210, 210, 255, 205, 205, 205, 255, 200, 200, 200, 255, 195, 195, 195,
    255, 190, 190, 190, 255, 185, 185, 185, 255, 180, 180, 180, 255, 175, 175,
    175, 255, 170, 170, 170, 255, 165, 165, 165, 255, 160, 160, 160, 255, 155,
    155, 155, 255, 151, 151, 151, 255, 146, 146, 146, 255, 141, 141, 141, 255,
    136, 136, 136, 255, 131, 131, 131, 255, 126, 126, 126, 255, 121, 121, 121,
    255, 116, 116, 116, 255, 111, 111, 111, 255, 106, 106, 106, 255, 101, 101,
    101, 255, 96, 96, 96, 255, 91, 91, 91, 255, 86, 86, 86, 255, 81, 81, 81,
    255, 76, 76, 76, 255, 71, 71, 71, 255, 66, 66, 66, 255, 61, 61, 61, 255, 56,
    56, 56, 255, 66, 66, 80, 255, 77, 77, 105, 255, 87, 87, 130, 255, 98, 98,
    155, 255, 108, 108, 180, 255, 119, 119, 205, 255, 129, 129, 230, 255, 140,
    140, 255, 255, 131, 147, 239, 255, 122, 154, 223, 255, 113, 161, 207, 255,
    105, 168, 191, 255, 96, 175, 175, 255, 87, 183, 159, 255, 78, 190, 143, 255,
    70, 197, 127, 255, 61, 204, 111, 255, 52, 211, 95, 255, 43, 219, 79, 255,
    35, 226, 63, 255, 26, 233, 47, 255, 17, 240, 31, 255, 8, 247, 15, 255, 1,
    255, 1, 255, 7, 255, 1, 255, 15, 255, 1, 255, 23, 255, 1, 255, 31, 255, 1,
    255, 39, 255, 1, 255, 47, 255, 1, 255, 55, 255, 1, 255, 63, 255, 1, 255, 71,
    255, 1, 255, 79, 255, 1, 255, 87, 255, 1, 255, 95, 255, 1, 255, 103, 255, 1,
    255, 111, 255, 1, 255, 119, 255, 1, 255, 127, 255, 1, 255, 135, 255, 1, 255,
    143, 255, 1, 255, 151, 255, 1, 255, 159, 255, 1, 255, 167, 255, 1, 255, 175,
    255, 1, 255, 183, 255, 1, 255, 191, 255, 1, 255, 199, 255, 1, 255, 207, 255,
    1, 255, 215, 255, 1, 255, 223, 255, 1, 255, 231, 255, 1, 255, 239, 255, 1,
    255, 247, 255, 1, 255, 255, 255, 1, 255, 255, 249, 1, 255, 255, 244, 1, 255,
    255, 239, 1, 255, 255, 233, 1, 255, 255, 228, 1, 255, 255, 223, 1, 255, 255,
    217, 1, 255, 255, 212, 1, 255, 255, 207, 1, 255, 255, 201, 1, 255, 255, 196,
    1, 255, 255, 191, 1, 255, 255, 185, 1, 255, 255, 180, 1, 255, 255, 175, 1,
    255, 255, 170, 1, 255, 255, 164, 1, 255, 255, 159, 1, 255, 255, 154, 1, 255,
    255, 148, 1, 255, 255, 143, 1, 255, 255, 138, 1, 255, 255, 132, 1, 255, 255,
    127, 1, 255, 255, 122, 1, 255, 255, 116, 1, 255, 255, 111, 1, 255, 255, 106,
    1, 255, 255, 100, 1, 255, 255, 95, 1, 255, 255, 90, 1, 255, 255, 85, 1, 255,
    255, 79, 1, 255, 255, 74, 1, 255, 255, 69, 1, 255, 255, 63, 1, 255, 255, 58,
    1, 255, 255, 53, 1, 255, 255, 47, 1, 255, 255, 42, 1, 255, 255, 37, 1, 255,
    255, 31, 1, 255, 255, 26, 1, 255, 255, 21, 1, 255, 255, 15, 1, 255, 255, 10,
    1, 255, 255, 5, 1, 255, 255, 1, 1, 255, 255, 1, 15, 255, 255, 1, 31, 255,
    255, 1, 47, 255, 255, 1, 63, 255, 255, 1, 79, 255, 255, 1, 95, 255, 255, 1,
    111, 255, 255, 1, 127, 255, 255, 1, 143, 255, 255, 1, 159, 255, 255, 1, 175,
    255, 255, 1, 191, 255, 255, 1, 207, 255, 255, 1, 223, 255, 255, 1, 239, 255,
  ]);

  // Shader modules for different render modes
  const SetAlpha1 = {
    name: 'set-alpha-1',
    inject: { 'fs:DECKGL_FILTER_COLOR': `color = vec4(color.rgb, 1.0);` },
  };

  const FalseColorInfrared = {
    name: 'false-color-infrared',
    inject: {
      'fs:DECKGL_FILTER_COLOR': `
        float nir = color[3];
        float red = color[0];
        float green = color[1];
        color.rgb = vec3(nir, red, green);
      `,
    },
  };

  const NDVI = {
    name: 'ndvi',
    inject: {
      'fs:DECKGL_FILTER_COLOR': `
        float nir = color[3];
        float red = color[0];
        float ndvi = (nir - red) / (nir + red);
        color.r = (ndvi + 1.0) / 2.0;
      `,
    },
  };

  /**
   * Create a custom Tileset2D class that uses Flatbush spatial indexing
   */
  function createMosaicTilesetClass(
    Tileset2D: LoadedModules['Tileset2D'],
    Flatbush: LoadedModules['Flatbush'],
    mosaicSources: MosaicSource[],
  ) {
    // Convert MosaicSource[] to MosaicTileIndex[] with x, y, z
    const indexedSources: MosaicTileIndex[] = mosaicSources.map(
      (source, i) => ({
        x: i,
        y: 0,
        z: 0,
        ...source,
      }),
    );

    // Build spatial index
    const spatialIndex = new Flatbush(mosaicSources.length);
    for (const source of mosaicSources) {
      const [minX, minY, maxX, maxY] = source.bbox;
      spatialIndex.add(minX, minY, maxX, maxY);
    }
    spatialIndex.finish();

    return class MosaicTileset2D extends Tileset2D {
      getTileIndices(params: {
        viewport: Viewport;
        maxZoom?: number;
        minZoom?: number;
      }): TileIndex[] {
        const { viewport, maxZoom, minZoom } = params;
        if (viewport.zoom < (minZoom ?? -Infinity)) return [];
        if (viewport.zoom > (maxZoom ?? Infinity)) return [];

        const bounds = viewport.getBounds() as [number, number, number, number];
        const indices = spatialIndex.search(...bounds);

        // Return MosaicTileIndex which extends TileIndex
        return indices.map((i) => indexedSources[i]) as TileIndex[];
      }
    };
  }

  /**
   * Get render modules based on render mode
   */
  function getRenderModules(
    mode: MosaicRenderMode,
    texture: Texture,
    mods: {
      CreateTexture: RasterModule['module'];
      Colormap: RasterModule['module'];
    },
    colormapTex: Texture | null,
    customModules?: (texture: Texture) => RenderModule[],
  ): RasterModule[] {
    if (mode === 'custom' && customModules) {
      return customModules(texture) as RasterModule[];
    }

    const base: RasterModule[] = [
      { module: mods.CreateTexture, props: { textureName: texture } },
    ];

    if (mode === 'trueColor') {
      return [...base, { module: SetAlpha1 }];
    }

    if (mode === 'falseColor') {
      return [...base, { module: FalseColorInfrared }, { module: SetAlpha1 }];
    }

    // NDVI - only use colormap if texture exists
    if (!colormapTex) {
      return [...base, { module: NDVI }, { module: SetAlpha1 }];
    }

    return [
      ...base,
      { module: NDVI },
      { module: mods.Colormap, props: { colormapTexture: colormapTex } },
      { module: SetAlpha1 },
    ];
  }

  /**
   * Create the mosaic layer
   */
  function createLayer() {
    const mods = modules.value;
    if (!mods || !props.sources.length) return null;

    const {
      COGLayer,
      Colormap,
      CreateTexture,
      TileLayer,
      Tileset2D,
      CompositeLayer,
      fromUrl,
      Flatbush,
      proj4Defs,
    } = mods;

    const rawSources = toRaw(props.sources);
    const renderMode = toRaw(props.renderMode);
    const customRenderModules = props.customRenderModules;
    const currentColormapTexture = colormapTexture.value;

    // Map EPSG codes to proj4 definition strings
    // The published version of deck.gl-geotiff (0.1.0) requires proj4 strings, not EPSG codes
    const getProj4String = (epsgCode: number): string => {
      // NAD83 / UTM zones (26910-26919 for continental US)
      if (epsgCode >= 26910 && epsgCode <= 26919) {
        const zone = epsgCode - 26900;
        return `+proj=utm +zone=${zone} +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs`;
      }
      // WGS84
      if (epsgCode === 4326) {
        return '+proj=longlat +datum=WGS84 +no_defs +type=crs';
      }
      // Web Mercator
      if (epsgCode === 3857) {
        return '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs';
      }
      throw new Error(
        `Unknown EPSG code: ${epsgCode}. Add proj4 string to getProj4String().`,
      );
    };

    // Create geoKeysParser that resolves EPSG codes
    const geoKeysParser = async (geoKeys: Record<string, unknown>) => {
      const code =
        (geoKeys.ProjectedCSTypeGeoKey as number) ||
        (geoKeys.GeographicTypeGeoKey as number);
      if (!code) throw new Error('No projection code found in geoKeys');

      const crsString = `EPSG:${code}`;
      const crs = proj4Defs(crsString);
      if (!crs) throw new Error(`Unknown CRS: ${crsString}`);

      // deck.gl-geotiff 0.1.0 requires proj4 string for def, not EPSG code
      const proj4String = getProj4String(code);

      // Normalize units: proj4 returns 'm' but deck.gl-geotiff expects 'metre'
      const rawUnits = crs.units;
      const coordinatesUnits =
        rawUnits === 'm' || rawUnits === 'meter' || rawUnits === 'meters'
          ? 'metre'
          : rawUnits === 'degree' || rawUnits === 'degrees'
            ? 'degree'
            : rawUnits;

      return {
        def: proj4String,
        parsed: crs,
        coordinatesUnits,
      };
    };

    // Create getTileData function for COGLayer
    const getTileData: COGLayerProps<TextureData>['getTileData'] = async (
      image: GeoTIFFImage,
      options: GetTileDataOptions,
    ) => {
      const rasterData = await image.readRasters({
        ...options,
        interleave: true,
      });
      const texture = options.device.createTexture({
        data: rasterData as unknown as Uint8Array,
        format: 'rgba8unorm',
        width: rasterData.width,
        height: rasterData.height,
      });
      return { texture, width: rasterData.width, height: rasterData.height };
    };

    // Create MosaicTileset class
    const MosaicTilesetClass = createMosaicTilesetClass(
      Tileset2D,
      Flatbush,
      rawSources,
    );

    // Create MosaicLayer class extending CompositeLayer
    class MosaicLayer extends CompositeLayer<{
      sources: MosaicSource[];
      maxCacheSize?: number;
      beforeId?: string;
      renderMode?: MosaicRenderMode;
    }> {
      static layerName = 'MosaicLayer';

      renderLayers() {
        const {
          sources,
          maxCacheSize,
          id,
          renderMode: layerRenderMode,
        } = this.props;
        if (!sources?.length) return null;

        // Use renderMode from layer props for proper reactivity
        const effectiveRenderMode = layerRenderMode ?? renderMode;

        return new TileLayer<{
          source: MosaicTileIndex;
          data: GeoTIFF;
          signal?: AbortSignal;
        }>({
          id: `mosaic-tile-${id}`,
          TilesetClass: MosaicTilesetClass,
          maxCacheSize,
          // Force sublayer re-render when renderMode changes
          updateTriggers: {
            renderSubLayers: [effectiveRenderMode],
          },
          getTileData: async (tileProps: TileLoadProps) => {
            // tileProps.index is our MosaicTileIndex
            const source = tileProps.index as unknown as MosaicTileIndex;
            const { signal } = tileProps;
            try {
              const tiff = await fromUrl(source.assets.image.href, {}, signal);
              emit('sourceLoad', source);
              return { source, data: tiff, signal };
            } catch (error) {
              emit('error', error as Error, source);
              // Re-throw so TileLayer handles the error appropriately
              throw error;
            }
          },
          renderSubLayers: (subProps) => {
            const data = subProps.data as {
              source: MosaicTileIndex;
              data: GeoTIFF;
              signal?: AbortSignal;
            } | null;
            if (!data?.data) return null;
            const { source, data: tiff, signal } = data;

            // Create COGLayer - signal is passed via getTileData options internally
            return new COGLayer<TextureData>({
              id: `cog-${source.assets.image.href}-${effectiveRenderMode}`,
              geotiff: tiff,
              geoKeysParser,
              getTileData,
              renderTile: (tileData) =>
                getRenderModules(
                  effectiveRenderMode,
                  tileData.texture,
                  { CreateTexture, Colormap },
                  currentColormapTexture,
                  customRenderModules,
                ),
              // Pass signal to allow aborting when tile goes out of viewport
              // Using type assertion as the vendored types may not have this property
              ...(signal ? { signal } : {}),
            } as COGLayerProps<TextureData>);
          },
        });
      }
    }

    const layer = new MosaicLayer({
      id: toRaw(props.id),
      sources: rawSources,
      maxCacheSize: toRaw(props.maxCacheSize),
      beforeId: toRaw(props.beforeId),
      renderMode: renderMode,
    });

    return markRaw(layer);
  }

  function initializeColormapTexture() {
    if (!deviceRef.value) return;
    const data = props.colormapData ?? CFASTIE_COLORMAP;
    colormapTexture.value = deviceRef.value.createTexture({
      data,
      width: 256,
      height: 1,
      format: 'rgba8unorm',
      sampler: {
        addressModeU: 'clamp-to-edge',
        addressModeV: 'clamp-to-edge',
      },
    });
  }

  async function initializeLayer() {
    try {
      const [
        { MapboxOverlay },
        geotiffModule,
        rasterModule,
        geoLayersModule,
        coreModule,
        geotiffLib,
        flatbushModule,
        proj4Module,
      ] = await Promise.all([
        import('@deck.gl/mapbox'),
        import('@developmentseed/deck.gl-geotiff'),
        import('@developmentseed/deck.gl-raster/gpu-modules'),
        import('@deck.gl/geo-layers'),
        import('@deck.gl/core'),
        import('geotiff'),
        import('flatbush'),
        import('proj4'),
      ]);

      // Get proj4.defs function
      const proj4Fn = proj4Module.default;

      // Register UTM projections for NAIP (zones 10-20 cover continental US)
      for (let zone = 10; zone <= 20; zone++) {
        proj4Fn.defs(
          `EPSG:269${zone}`,
          `+proj=utm +zone=${zone} +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs`,
        );
      }

      modules.value = markRaw({
        COGLayer: geotiffModule.COGLayer,
        Colormap: rasterModule.Colormap,
        CreateTexture: rasterModule.CreateTexture,
        TileLayer: geoLayersModule.TileLayer,
        Tileset2D: geoLayersModule._Tileset2D,
        CompositeLayer: coreModule.CompositeLayer,
        fromUrl: geotiffLib.fromUrl,
        Flatbush: flatbushModule.default,
        proj4Defs: proj4Fn.defs,
      });

      // Get device for colormap texture creation
      const tempOverlay = new MapboxOverlay({
        layers: [],
        interleaved: true,
        onDeviceInitialized: (dev: Device) => {
          deviceRef.value = dev;
          initializeColormapTexture();

          // Now create and add the actual layer
          const layer = createLayer();
          if (layer) {
            addLayer(layer);
          }
        },
      });

      // Add overlay to trigger device initialization
      map.value?.addControl(tempOverlay as unknown as maplibregl.IControl);
    } catch (error) {
      console.error('[deck.gl-mosaic] Error loading MosaicLayer:', error);
      console.error(
        'Make sure @developmentseed/deck.gl-geotiff, @developmentseed/deck.gl-raster, geotiff, flatbush, and proj4 are installed',
      );
      emit('error', error as Error);
    }
  }

  onMounted(() => {
    if (map.value?.isStyleLoaded()) {
      initializeLayer();
    } else {
      map.value?.once('style.load', initializeLayer);
    }
  });

  watch(
    () => [props.sources, props.renderMode, props.opacity, props.visible],
    () => {
      if (modules.value) {
        const layer = createLayer();
        if (layer) {
          updateLayer(props.id, layer);
        }
      }
    },
    { deep: true },
  );

  watch(
    () => props.colormapData,
    () => {
      initializeColormapTexture();
      if (modules.value) {
        const layer = createLayer();
        if (layer) {
          updateLayer(props.id, layer);
        }
      }
    },
  );

  onBeforeUnmount(() => {
    removeLayer(props.id);
  });
</script>

<template>
  <slot></slot>
</template>
