<script setup lang="ts">
  /**
   * VLayerDeckglMosaic - Client-side COG mosaic layer for STAC items
   *
   * TODO: When @developmentseed/deck.gl-geotiff releases a version > 0.1.0 with MosaicLayer:
   * 1. Remove inline MosaicTileset2D and MosaicLayer classes - use from package instead
   * 2. Remove getProj4String() helper - newer version supports EPSG strings in `def` field
   * 3. Remove unit normalization ('m' -> 'metre') - newer version handles this
   * 4. Import MosaicLayer directly: import { MosaicLayer } from '@developmentseed/deck.gl-geotiff'
   * 5. Restore Colormap module usage for NDVI with colormapData prop support (currently using inline shader)
   * 6. See working example: https://github.com/developmentseed/deck.gl-raster/blob/main/examples/naip-mosaic/src/App.tsx
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
     * Custom colormap data for NDVI (Uint8ClampedArray of RGBA values, 256 colors)
     * @reserved Currently not implemented - NDVI uses built-in cfastie colormap.
     * Will be supported when deck.gl-geotiff >0.1.0 is released with proper Colormap module support.
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

  // NDVI with built-in colormap (cfastie-inspired gradient)
  // This applies the colormap directly in the shader for reliability
  const NDVIWithColormap = {
    name: 'ndvi-with-colormap',
    inject: {
      'fs:DECKGL_FILTER_COLOR': `
        float nir = color[3];
        float red = color[0];
        float sum = nir + red;
        
        // Prevent division by zero
        float ndvi = sum > 0.001 ? (nir - red) / sum : 0.0;
        
        // Normalize from [-1, 1] to [0, 1]
        float t = clamp((ndvi + 1.0) / 2.0, 0.0, 1.0);
        
        // Cfastie-inspired colormap gradient
        // Low NDVI (water/bare): blue/cyan -> Mid (sparse): yellow -> High (vegetation): green
        vec3 result;
        if (t < 0.4) {
          // Water/bare soil: blue to cyan (NDVI < -0.2)
          float localT = t / 0.4;
          result = mix(vec3(0.0, 0.0, 0.5), vec3(0.5, 0.8, 0.9), localT);
        } else if (t < 0.5) {
          // Bare/sparse: cyan to yellow (NDVI -0.2 to 0)
          float localT = (t - 0.4) / 0.1;
          result = mix(vec3(0.5, 0.8, 0.9), vec3(0.9, 0.9, 0.4), localT);
        } else if (t < 0.6) {
          // Sparse vegetation: yellow to light green (NDVI 0 to 0.2)
          float localT = (t - 0.5) / 0.1;
          result = mix(vec3(0.9, 0.9, 0.4), vec3(0.6, 0.8, 0.2), localT);
        } else if (t < 0.75) {
          // Moderate vegetation: light green to green (NDVI 0.2 to 0.5)
          float localT = (t - 0.6) / 0.15;
          result = mix(vec3(0.6, 0.8, 0.2), vec3(0.1, 0.6, 0.1), localT);
        } else {
          // Dense vegetation: green to dark green (NDVI > 0.5)
          float localT = (t - 0.75) / 0.25;
          result = mix(vec3(0.1, 0.6, 0.1), vec3(0.0, 0.3, 0.0), localT);
        }
        
        color.rgb = result;
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
    },
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

    // NDVI - use built-in colormap shader for reliability
    // The external Colormap module from deck.gl-raster can be finicky with texture passing
    return [...base, { module: NDVIWithColormap }, { module: SetAlpha1 }];
  }

  /**
   * Create the mosaic layer
   */
  function createLayer() {
    const mods = modules.value;
    if (!mods || !props.sources.length) return null;

    const {
      COGLayer,
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
                  { CreateTexture },
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

  async function initializeLayer() {
    try {
      const [
        geotiffModule,
        rasterModule,
        geoLayersModule,
        coreModule,
        geotiffLib,
        flatbushModule,
        proj4Module,
      ] = await Promise.all([
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
        CreateTexture: rasterModule.CreateTexture,
        TileLayer: geoLayersModule.TileLayer,
        Tileset2D: geoLayersModule._Tileset2D,
        CompositeLayer: coreModule.CompositeLayer,
        fromUrl: geotiffLib.fromUrl,
        Flatbush: flatbushModule.default,
        proj4Defs: proj4Fn.defs,
      });

      // Create and add the layer using deck overlay
      const layer = createLayer();
      if (layer) {
        addLayer(layer);
      }
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

  onBeforeUnmount(() => {
    removeLayer(props.id);
  });
</script>

<template>
  <slot></slot>
</template>
