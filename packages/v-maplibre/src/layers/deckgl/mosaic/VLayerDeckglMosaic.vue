<script setup lang="ts">
  /**
   * Client-side COG mosaic for STAC items — GPU-rendered, no tile server required.
   *
   * @requires `@deck.gl/core`
   * @requires `@deck.gl/mapbox`
   * @requires `@deck.gl/layers`
   * @requires `@developmentseed/deck.gl-geotiff`
   * @requires `@developmentseed/deck.gl-raster`
   * @requires `@developmentseed/geotiff`
   * @requires `@developmentseed/proj`
   *
   * Install with:
   * `pnpm add @deck.gl/core @deck.gl/mapbox @deck.gl/layers @developmentseed/deck.gl-geotiff @developmentseed/deck.gl-raster @developmentseed/geotiff @developmentseed/proj`
   */
  /**
   * VLayerDeckglMosaic - Client-side COG mosaic layer for STAC items
   *
   * Uses @developmentseed/deck.gl-geotiff v0.3.0 MosaicLayer for efficient
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
  import type { GeoTIFF, Overview } from '@developmentseed/geotiff';
  import type { Texture } from '@luma.gl/core';
  import type { RasterModule } from '@developmentseed/deck.gl-raster';
  import type { ShaderModule } from '@luma.gl/shadertools';
  import type {
    COGLayerProps,
    GetTileDataOptions,
    MosaicLayerProps,
    MosaicSource as BaseMosaicSource,
  } from '@developmentseed/deck.gl-geotiff';
  import type { EpsgResolver } from '@developmentseed/proj';
  import { injectStrict, MapKey, requirePeer } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  const MOSAIC_PEER_INSTALL =
    'pnpm add @deck.gl/core @deck.gl/layers @deck.gl/mapbox @developmentseed/deck.gl-geotiff @developmentseed/deck.gl-raster @developmentseed/geotiff @developmentseed/proj';

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
     * NDVI range filter: pixels outside [min, max] are discarded.
     * Only applies when renderMode is 'ndvi'. Range: [-1, 1].
     */
    ndviRange?: [number, number];
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
    ndviRange: () => [-1, 1] as [number, number],
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
    sourceLoad: [source: MosaicSource];
    error: [error: Error, source?: MosaicSource];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer } = useDeckOverlay(map);
  let activeLayerId = '';

  interface TextureData {
    texture: Texture;
    width: number;
    height: number;
  }

  interface LoadedModules {
    MosaicLayer: typeof import('@developmentseed/deck.gl-geotiff').MosaicLayer;
    COGLayer: typeof import('@developmentseed/deck.gl-geotiff').COGLayer;
    CreateTexture: RasterModule['module'];
    fromUrl: typeof GeoTIFF.fromUrl;
    resolveEpsg: EpsgResolver;
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

  // --- NDVI Pipeline: 3 separate modules matching upstream pattern ---
  // Uniforms update per-draw via MeshTextureLayer.draw() → setProps() without
  // re-rendering tiles. Baked constants don't work because renderTile only runs
  // when tiles are FIRST FETCHED — cached tiles keep old shader modules.

  // Step 1: Compute NDVI from raw RGBA bands, store in color.r
  const NDVICompute = {
    name: 'ndvi-compute',
    inject: {
      'fs:DECKGL_FILTER_COLOR': `
        float nir_c = color[3];
        float red_c = color[0];
        float sum_c = nir_c + red_c;
        float ndvi_c = sum_c > 0.001 ? (nir_c - red_c) / sum_c : 0.0;
        color = vec4(ndvi_c, ndvi_c, ndvi_c, 1.0);
      `,
    },
  };

  // Step 2: Filter by NDVI range — uniforms update per-draw without tile re-render
  const ndviFilterUniformBlock = `\
uniform ndviFilterUniforms {
  float ndviMin;
  float ndviMax;
} ndviFilter;
`;

  const NDVIFilter = {
    name: 'ndviFilter',
    fs: ndviFilterUniformBlock,
    inject: {
      'fs:DECKGL_FILTER_COLOR': `
        if (color.r < ndviFilter.ndviMin || color.r > ndviFilter.ndviMax) {
          discard;
        }
      `,
    },
    uniformTypes: {
      ndviMin: 'f32',
      ndviMax: 'f32',
    },
    getUniforms: (uniformProps: Record<string, unknown>) => ({
      ndviMin: (uniformProps.ndviMin as number) ?? -1.0,
      ndviMax: (uniformProps.ndviMax as number) ?? 1.0,
    }),
  } as const satisfies ShaderModule<{ ndviMin: number; ndviMax: number }>;

  // Step 3: Apply cfastie-inspired colormap gradient from color.r (NDVI value)
  const NDVIColormap = {
    name: 'ndvi-colormap',
    inject: {
      'fs:DECKGL_FILTER_COLOR': `
        float t = clamp((color.r + 1.0) / 2.0, 0.0, 1.0);
        
        vec3 result;
        if (t < 0.4) {
          float localT = t / 0.4;
          result = mix(vec3(0.0, 0.0, 0.5), vec3(0.5, 0.8, 0.9), localT);
        } else if (t < 0.5) {
          float localT = (t - 0.4) / 0.1;
          result = mix(vec3(0.5, 0.8, 0.9), vec3(0.9, 0.9, 0.4), localT);
        } else if (t < 0.6) {
          float localT = (t - 0.5) / 0.1;
          result = mix(vec3(0.9, 0.9, 0.4), vec3(0.6, 0.8, 0.2), localT);
        } else if (t < 0.75) {
          float localT = (t - 0.6) / 0.15;
          result = mix(vec3(0.6, 0.8, 0.2), vec3(0.1, 0.6, 0.1), localT);
        } else {
          float localT = (t - 0.75) / 0.25;
          result = mix(vec3(0.1, 0.6, 0.1), vec3(0.0, 0.3, 0.0), localT);
        }
        
        color.rgb = result;
      `,
    },
  };

  function getRenderModules(
    mode: MosaicRenderMode,
    texture: Texture,
    mods: {
      CreateTexture: RasterModule['module'];
    },
    ndviRange: [number, number],
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

    // NDVI pipeline: compute → filter → colormap → alpha
    // NDVIFilter uses uniformTypes + getUniforms so uniform values update
    // per-draw via MeshTextureLayer.draw() WITHOUT re-rendering tiles.
    return [
      ...base,
      { module: NDVICompute },
      {
        module: NDVIFilter,
        props: { ndviMin: ndviRange[0], ndviMax: ndviRange[1] },
      },
      { module: NDVIColormap },
      { module: SetAlpha1 },
    ];
  }

  function createLayer() {
    const mods = modules.value;
    if (!mods || !props.sources.length) return null;

    const { MosaicLayer, COGLayer, CreateTexture, fromUrl, resolveEpsg } = mods;

    const rawSources = toRaw(props.sources);
    const renderMode = toRaw(props.renderMode);
    const ndviRange = toRaw(props.ndviRange) as [number, number];
    const customRenderModules = props.customRenderModules;

    // Fixed ID matching upstream pattern — deck.gl diffs old vs new layer
    // via setProps, detecting changed renderSource/renderTile callbacks.
    const newId = `${toRaw(props.id)}-mosaic`;
    const layer = new MosaicLayer<MosaicSource, GeoTIFF>({
      id: newId,
      sources: rawSources,
      maxCacheSize: toRaw(props.maxCacheSize),

      getSource: async (source) => {
        try {
          const tiff = await fromUrl(source.assets.image.href);
          emit('sourceLoad', source);
          return tiff;
        } catch (error) {
          emit('error', error as Error, source);
          throw error;
        }
      },

      renderSource: (source, { data, signal }) => {
        if (!data) return null;

        return new COGLayer<TextureData>({
          id: `cog-${source.assets.image.href}-${renderMode}`,
          geotiff: data,
          epsgResolver: resolveEpsg,
          getTileData: async (
            image: GeoTIFF | Overview,
            options: GetTileDataOptions,
          ) => {
            const { device, x, y } = options;
            const tile = await image.fetchTile(x, y, {
              signal,
              boundless: false,
            });
            const { array } = tile;
            if (array.layout === 'band-separate') {
              throw new Error('Band-separate COGs are not supported');
            }
            const texture = device.createTexture({
              data: array.data,
              format: 'rgba8unorm',
              width: array.width,
              height: array.height,
            });
            return {
              texture,
              width: array.width,
              height: array.height,
            };
          },
          renderTile: (tileData: TextureData) => ({
            image: tileData.texture,
            renderPipeline: getRenderModules(
              renderMode,
              tileData.texture,
              { CreateTexture },
              ndviRange,
              customRenderModules,
            ),
          }),
          signal,
        } as COGLayerProps<TextureData>);
      },
    } as MosaicLayerProps<MosaicSource, GeoTIFF>);

    return layer;
  }

  async function initializeLayer() {
    try {
      const [geotiffModule, rasterModule, devGeotiff, projModule] =
        await Promise.all([
          requirePeer(
            '@developmentseed/deck.gl-geotiff',
            () => import('@developmentseed/deck.gl-geotiff'),
            MOSAIC_PEER_INSTALL,
          ),
          requirePeer(
            '@developmentseed/deck.gl-raster',
            () => import('@developmentseed/deck.gl-raster/gpu-modules'),
            MOSAIC_PEER_INSTALL,
          ),
          requirePeer(
            '@developmentseed/geotiff',
            () => import('@developmentseed/geotiff'),
            MOSAIC_PEER_INSTALL,
          ),
          requirePeer(
            '@developmentseed/proj',
            () => import('@developmentseed/proj'),
            MOSAIC_PEER_INSTALL,
          ),
        ]);

      modules.value = markRaw({
        MosaicLayer: geotiffModule.MosaicLayer,
        COGLayer: geotiffModule.COGLayer,
        CreateTexture: rasterModule.CreateTexture,
        fromUrl: devGeotiff.GeoTIFF.fromUrl,
        resolveEpsg: projModule.epsgResolver,
      });

      const layer = createLayer();
      if (layer) {
        activeLayerId = (layer as { id: string }).id;
        addLayer(layer);
      }
    } catch (error) {
      console.error('[deck.gl-mosaic] Error loading MosaicLayer:', error);
      console.error(
        'Make sure @developmentseed/deck.gl-geotiff, @developmentseed/deck.gl-raster, and @developmentseed/geotiff are installed',
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
    () => [
      props.sources,
      props.renderMode,
      props.ndviRange,
      props.opacity,
      props.visible,
    ],
    () => {
      if (modules.value) {
        const layer = createLayer();
        if (layer) {
          activeLayerId = (layer as { id: string }).id;
          addLayer(layer);
        }
      }
    },
    { deep: true },
  );

  onBeforeUnmount(() => {
    if (activeLayerId) {
      removeLayer(activeLayerId);
    }
  });
</script>

<template>
  <slot></slot>
</template>
