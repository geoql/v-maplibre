<script setup lang="ts">
  /**
   * VLayerDeckglMosaic - Client-side COG mosaic layer for STAC items
   *
   * Uses @developmentseed/deck.gl-geotiff v0.2.0 MosaicLayer for efficient
   * client-side rendering of multiple COGs from STAC APIs.
   *
   * @see https://github.com/developmentseed/deck.gl-raster/blob/main/examples/naip-mosaic/src/App.tsx
   */
  import {
    onMounted,
    onBeforeUnmount,
    watch,
    shallowRef,
    markRaw,
    toRaw,
  } from 'vue';
  import type { Color, PickingInfo } from '@deck.gl/core';
  import type { GeoTIFF, GeoTIFFImage } from 'geotiff';
  import type { Device, Texture } from '@luma.gl/core';
  import type { RasterModule } from '@developmentseed/deck.gl-raster';
  import type {
    COGLayerProps,
    MosaicLayerProps,
    MosaicSource as BaseMosaicSource,
  } from '@developmentseed/deck.gl-geotiff';
  import type { Pool } from 'geotiff';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  // GetTileDataOptions is not exported from @developmentseed/deck.gl-geotiff, define locally
  interface GetTileDataOptions {
    device: Device;
    window?: [number, number, number, number];
    signal?: AbortSignal;
    pool: Pool;
  }

  /**
   * A STAC-like item with bounding box and COG asset URL
   * Extends the base MosaicSource from deck.gl-geotiff with asset info
   */
  export interface MosaicSource extends BaseMosaicSource {
    /** Asset containing the COG URL */
    assets: {
      image: { href: string };
    };
  }

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
    MosaicLayer: typeof import('@developmentseed/deck.gl-geotiff').MosaicLayer;
    COGLayer: typeof import('@developmentseed/deck.gl-geotiff').COGLayer;
    CreateTexture: RasterModule['module'];
    fromUrl: typeof import('geotiff').fromUrl;
    proj4Defs: (
      name: string,
      def?: string,
    ) => import('proj4').ProjectionDefinition | undefined;
  }

  const modules = shallowRef<LoadedModules | null>(null);

  /**
   * Get proj4 definition string for an EPSG code.
   * Based on: https://github.com/developmentseed/deck.gl-raster/blob/main/examples/naip-mosaic/src/proj.ts
   */
  const getProj4Def = (epsgCode: number): string | null => {
    // NAD83 / UTM zones (26910-26920 for continental US)
    if (epsgCode >= 26910 && epsgCode <= 26920) {
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
    return null;
  };

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
    return [...base, { module: NDVIWithColormap }, { module: SetAlpha1 }];
  }

  /**
   * Create the mosaic layer using deck.gl-geotiff v0.2.0 MosaicLayer
   */
  function createLayer() {
    const mods = modules.value;
    if (!mods || !props.sources.length) return null;

    const { MosaicLayer, COGLayer, CreateTexture, fromUrl, proj4Defs } = mods;

    const rawSources = toRaw(props.sources);
    const renderMode = toRaw(props.renderMode);
    const customRenderModules = props.customRenderModules;

    // Create geoKeysParser that resolves EPSG codes to proj4 strings
    const geoKeysParser = async (geoKeys: Record<string, unknown>) => {
      const code =
        (geoKeys.ProjectedCSTypeGeoKey as number) ||
        (geoKeys.GeographicTypeGeoKey as number);
      if (!code) throw new Error('No projection code found in geoKeys');

      const crsString = `EPSG:${code}`;
      const crs = proj4Defs(crsString);
      if (!crs) throw new Error(`Unknown CRS: ${crsString}`);

      // Get proj4 string for the def field (required by deck.gl-geotiff's parseCrs)
      const proj4String = getProj4Def(code);
      if (!proj4String) {
        throw new Error(
          `Unknown EPSG code: ${code}. Add proj4 definition to getProj4Def().`,
        );
      }

      return {
        def: proj4String,
        parsed: crs,
        coordinatesUnits: crs.units as 'm' | 'metre' | 'degree',
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

    // Use the built-in MosaicLayer from deck.gl-geotiff v0.2.0
    const layer = new MosaicLayer<MosaicSource, GeoTIFF>({
      id: toRaw(props.id),
      sources: rawSources,
      maxCacheSize: toRaw(props.maxCacheSize),

      // Fetch GeoTIFF for each source
      getSource: async (source, { signal }) => {
        try {
          const tiff = await fromUrl(source.assets.image.href, {}, signal);
          emit('sourceLoad', source);
          return tiff;
        } catch (error) {
          emit('error', error as Error, source);
          throw error;
        }
      },

      // Render each source as a COGLayer
      renderSource: (source, { data, signal }) => {
        if (!data) return null;

        return new COGLayer<TextureData>({
          id: `cog-${source.assets.image.href}-${renderMode}`,
          geotiff: data,
          geoKeysParser,
          getTileData,
          renderTile: (tileData) =>
            getRenderModules(
              renderMode,
              tileData.texture,
              { CreateTexture },
              customRenderModules,
            ),
          signal,
        } as COGLayerProps<TextureData>);
      },
    } as MosaicLayerProps<MosaicSource, GeoTIFF>);

    return markRaw(layer);
  }

  async function initializeLayer() {
    try {
      const [geotiffModule, rasterModule, geotiffLib, proj4Module] =
        await Promise.all([
          import('@developmentseed/deck.gl-geotiff'),
          import('@developmentseed/deck.gl-raster/gpu-modules'),
          import('geotiff'),
          import('proj4'),
        ]);

      // Get proj4.defs function
      const proj4Fn = proj4Module.default;

      // Register UTM projections for NAIP (zones 10-20 cover continental US)
      // Based on: https://github.com/developmentseed/deck.gl-raster/blob/main/examples/naip-mosaic/src/proj.ts
      for (let zone = 10; zone <= 20; zone++) {
        const epsgCode = 26900 + zone;
        const def = getProj4Def(epsgCode);
        if (def) {
          proj4Fn.defs(`EPSG:${epsgCode}`, def);
        }
      }

      modules.value = markRaw({
        MosaicLayer: geotiffModule.MosaicLayer,
        COGLayer: geotiffModule.COGLayer,
        CreateTexture: rasterModule.CreateTexture,
        fromUrl: geotiffLib.fromUrl,
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
        'Make sure @developmentseed/deck.gl-geotiff, @developmentseed/deck.gl-raster, geotiff, and proj4 are installed',
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
