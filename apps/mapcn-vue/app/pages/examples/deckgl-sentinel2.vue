<script setup lang="ts">
  import {
    VMap,
    VControlNavigation,
    VControlScale,
    VLayerDeckglMultiCOG,
  } from '@geoql/v-maplibre';
  import type { Map } from 'maplibre-gl';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '~/components/ui/select';

  useSeoMeta({
    title: 'Sentinel-2 Multi-Band - mapcn-vue Examples',
    description:
      'Sentinel-2 multi-band compositing from separate COGs at different native resolutions. True Color, False Color, and SWIR presets rendered entirely client-side.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Sentinel-2 Multi-Band',
    description:
      'Multi-band composite Sentinel-2 imagery rendered with deck.gl-raster MultiCOGLayer.',
    category: 'deck.gl',
  });

  interface Scene {
    title: string;
    baseUrl: string;
    center: [number, number];
    zoom: number;
  }

  interface Preset {
    id: string;
    title: string;
    sources: Record<string, string>;
    composite: { r: string; g?: string; b?: string };
  }

  const SCENES: Scene[] = [
    {
      title: 'Torres del Paine, Chile',
      baseUrl:
        'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/18/F/XJ/2026/4/S2C_18FXJ_20260406_0_L2A',
      center: [-73.0, -51.0],
      zoom: 9,
    },
    {
      title: 'Salar de Uyuni, Bolivia',
      baseUrl:
        'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/19/K/EU/2026/4/S2A_19KEU_20260414_0_L2A',
      center: [-67.65, -20.13],
      zoom: 9,
    },
    {
      title: 'Mount Etna, Italy',
      baseUrl:
        'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/33/S/VB/2024/7/S2B_33SVB_20240725_0_L2A',
      center: [15.0, 37.75],
      zoom: 9,
    },
    {
      title: 'Nile Delta, Egypt',
      baseUrl:
        'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/36/R/TV/2026/4/S2A_36RTV_20260412_1_L2A',
      center: [31.0, 30.5],
      zoom: 9,
    },
  ];

  const PRESETS: Preset[] = [
    {
      id: 'true-color',
      title: 'True Color (R · G · B)',
      sources: { red: 'B04', green: 'B03', blue: 'B02' },
      composite: { r: 'red', g: 'green', b: 'blue' },
    },
    {
      id: 'false-color',
      title: 'False Color (NIR · R · G)',
      sources: { nir: 'B08', red: 'B04', green: 'B03' },
      composite: { r: 'nir', g: 'red', b: 'green' },
    },
    {
      id: 'swir',
      title: 'SWIR (SWIR · NIR · R)',
      sources: { swir: 'B12', nir: 'B8A', red: 'B04' },
      composite: { r: 'swir', g: 'nir', b: 'red' },
    },
  ];

  const { mapStyle } = useMapStyle();
  const mapId = useId();
  const mapInstance = shallowRef<Map | null>(null);
  const sceneId = ref(0);
  const presetId = ref<Preset['id']>('true-color');

  const currentScene = computed(() => SCENES[sceneId.value]!);
  const currentPreset = computed(
    () => PRESETS.find((p) => p.id === presetId.value) ?? PRESETS[0]!,
  );

  const onMapLoaded = (map: Map) => {
    mapInstance.value = map;
  };

  const mapOptions = computed(() => ({
    container: `sentinel2-example-${mapId}`,
    style: mapStyle.value,
    center: currentScene.value.center,
    zoom: currentScene.value.zoom,
    minZoom: 6,
  }));

  const sources = computed<Record<string, { url: string }>>(() => {
    const base = currentScene.value.baseUrl;
    const out: Record<string, { url: string }> = {};
    for (const [bandName, bandKey] of Object.entries(
      currentPreset.value.sources,
    )) {
      out[bandName] = { url: `${base}/${bandKey}.tif` };
    }
    return out;
  });

  const composite = computed(() => currentPreset.value.composite);

  function getPresetLabel(id: string) {
    return PRESETS.find((p) => p.id === id)?.title ?? id;
  }

  function getSceneLabel(idx: number) {
    return SCENES[idx]?.title ?? '';
  }

  watch([sceneId], () => {
    if (mapInstance.value) {
      mapInstance.value.flyTo({
        center: currentScene.value.center,
        zoom: currentScene.value.zoom,
        duration: 1200,
      });
    }
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';
  const codeExample = `${SCRIPT_START}
import {
  VMap,
  VLayerDeckglMultiCOG,
} from '@geoql/v-maplibre';

const base =
  'https://sentinel-cogs.s3.us-west-2.amazonaws.com/' +
  'sentinel-s2-l2a-cogs/33/S/VB/2024/7/S2B_33SVB_20240725_0_L2A';

const sources = {
  red:   { url: \`\${base}/B04.tif\` },
  green: { url: \`\${base}/B03.tif\` },
  blue:  { url: \`\${base}/B02.tif\` },
};

const composite = { r: 'red', g: 'green', b: 'blue' };
${SCRIPT_END}

<template>
  <VMap :options="mapOptions">
    <VLayerDeckglMultiCOG
      id="sentinel2"
      :sources="sources"
      :composite="composite"
    />
  </VMap>
</template>`;
</script>

<template>
  <ComponentDemo
    title="Sentinel-2 Multi-Band"
    description="Sentinel-2 multi-band compositing from separate COGs at different native resolutions. Pixels are sampled per-band and composited on the GPU — no preprocessing, no server."
    :code="codeExample"
    registry="map-deckgl-raster"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ClientOnly>
        <VMap
          :key="mapStyle"
          :options="mapOptions"
          class="size-full"
          @loaded="onMapLoaded"
        >
          <VControlNavigation position="top-right" />
          <VControlScale position="bottom-left" />
          <VLayerDeckglMultiCOG
            id="sentinel2"
            :sources="sources"
            :composite="composite"
          />
        </VMap>
      </ClientOnly>

      <MapPanel title="Sentinel-2" panel-width="w-72">
        <p class="mb-4 text-xs text-muted-foreground">
          Each band (B02, B03, B04, B8A, B08, B12) is fetched as a separate
          Cloud-Optimized GeoTIFF and composited on the GPU.
        </p>

        <div class="mb-4">
          <label
            class="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            >Scene</label
          >
          <Select v-model="sceneId">
            <SelectTrigger class="w-full">
              <SelectValue :placeholder="getSceneLabel(sceneId)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="(scene, idx) in SCENES"
                :key="scene.baseUrl"
                :value="idx"
              >
                {{ scene.title }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label
            class="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            >Composite</label
          >
          <Select v-model="presetId">
            <SelectTrigger class="w-full">
              <SelectValue :placeholder="getPresetLabel(presetId)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="p in PRESETS" :key="p.id" :value="p.id">
                {{ p.title }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
