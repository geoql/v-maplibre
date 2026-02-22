<script setup lang="ts">
  import {
    VMap,
    VControlNavigation,
    VControlScale,
    VLayerDeckglMosaic,
    type MosaicSource,
    type MosaicRenderMode,
  } from '@geoql/v-maplibre';
  import type { Map } from 'maplibre-gl';
  import { motion, AnimatePresence } from 'motion-v';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '~/components/ui/select';

  useSeoMeta({
    title: 'NAIP Mosaic - mapcn-vue Examples',
    description:
      'Client-side COG mosaic of NAIP imagery from Microsoft Planetary Computer with multiple render modes.',
  });

  defineOgImage('MapcnDoc', {
    title: 'NAIP Mosaic',
    description:
      'Client-side COG mosaic of NAIP imagery from Microsoft Planetary Computer with multiple render modes.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();
  const mapInstance = shallowRef<Map | null>(null);
  const panelOpen = ref(true);

  const onMapLoaded = (map: Map) => {
    mapInstance.value = map;
  };

  // Colorado area bounding box for NAIP query
  const STAC_BBOX: [number, number, number, number] = [
    -106.6059, 38.7455, -104.5917, 40.4223,
  ];

  const mapOptions = computed(() => ({
    container: `naip-mosaic-example-${mapId}`,
    style: mapStyle.value,
    center: [-104.9903, 39.7392] as [number, number],
    zoom: 10,
    maxBounds: [
      [STAC_BBOX[0] - 1, STAC_BBOX[1] - 1],
      [STAC_BBOX[2] + 1, STAC_BBOX[3] + 1],
    ] as [[number, number], [number, number]],
    minZoom: 4,
  }));

  const renderMode = ref<MosaicRenderMode>('trueColor');
  const loading = ref(true);
  const error = ref<string | null>(null);
  const stacItems = ref<MosaicSource[]>([]);

  // Fetch STAC items from Microsoft Planetary Computer
  async function fetchSTACItems() {
    try {
      loading.value = true;
      error.value = null;

      const params = {
        collections: 'naip',
        bbox: STAC_BBOX.join(','),
        filter: JSON.stringify({
          op: '=',
          args: [{ property: 'naip:state' }, 'co'],
        }),
        'filter-lang': 'cql2-json',
        datetime: '2023-01-01T00:00:00Z/2023-12-31T23:59:59Z',
        limit: '1000',
      };

      const queryString = new URLSearchParams(params).toString();
      const stacUrl = `https://planetarycomputer.microsoft.com/api/stac/v1/search?${queryString}`;

      const response = await fetch(stacUrl);
      if (!response.ok)
        throw new Error(`STAC API error: ${response.statusText}`);

      const data = await response.json();
      stacItems.value = data.features as MosaicSource[];

      if (stacItems.value.length === 0) {
        error.value = 'No STAC items found';
      }
    } catch (err) {
      console.error('Error fetching STAC items:', err);
      error.value = err instanceof Error ? err.message : 'Failed to load';
    } finally {
      loading.value = false;
    }
  }

  // Fetch STAC items on component mount
  onMounted(fetchSTACItems);

  function handleSourceLoad(source: MosaicSource) {
    console.log('Loaded COG:', source.assets.image.href);
  }

  function handleError(err: Error, source?: MosaicSource) {
    console.error('Mosaic error:', err, source);
  }

  const renderModeOptions = [
    { value: 'trueColor', label: 'True Color' },
    { value: 'falseColor', label: 'False Color Infrared' },
    { value: 'ndvi', label: 'NDVI' },
  ];

  function togglePanel() {
    panelOpen.value = !panelOpen.value;
  }

  function getRenderModeLabel(value: MosaicRenderMode) {
    return renderModeOptions.find((opt) => opt.value === value)?.label ?? value;
  }

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import {
    VMap,
    VLayerDeckglMosaic,
    type MosaicSource,
    type MosaicRenderMode,
  } from '@geoql/v-maplibre';

  const renderMode = ref<MosaicRenderMode>('trueColor');
  const stacItems = ref<MosaicSource[]>([]);

  // Fetch STAC items from Microsoft Planetary Computer
  async function fetchSTACItems() {
    const params = {
      collections: 'naip',
      bbox: '-106.6,38.7,-104.6,40.4',
      datetime: '2023-01-01/2023-12-31',
      limit: '1000',
    };

    const response = await fetch(
      'https://planetarycomputer.microsoft.com/api/stac/v1/search?' +
      new URLSearchParams(params)
    );
    const { features } = await response.json();
    stacItems.value = features;
  }

  onMounted(fetchSTACItems);
  ${SCRIPT_END}

  <template>
    <VMap :options="mapOptions">
      <VLayerDeckglMosaic
        id="naip-mosaic"
        :sources="stacItems"
        :render-mode="renderMode"
      />
    </VMap>
  </template>`;
</script>

<template>
  <div class="container max-w-screen-2xl py-10">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-4">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="size-3.5" />
          Examples
        </NuxtLink>
        <h1 class="mt-1.5 text-xl font-semibold tracking-tight">NAIP Mosaic</h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Client-side mosaic of NAIP aerial imagery from Microsoft Planetary
          Computer. All rendering happens in the browser with no server
          required.
        </p>
        <p class="mt-2 text-sm text-muted-foreground">
          Powered by
          <a
            href="https://github.com/developmentseed/deck.gl-raster"
            target="_blank"
            class="text-primary hover:underline"
            >@developmentseed/deck.gl-raster</a
          >. Data from
          <a
            href="https://planetarycomputer.microsoft.com/dataset/naip"
            target="_blank"
            class="text-primary hover:underline"
            >Microsoft Planetary Computer NAIP</a
          >.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="space-y-4">
          <div class="relative h-125 min-w-0 overflow-hidden">
            <ClientOnly>
              <VMap
                :key="mapStyle"
                :options="mapOptions"
                class="size-full"
                @loaded="onMapLoaded"
              >
                <VControlNavigation position="top-right" />
                <VControlScale position="bottom-left" />

                <VLayerDeckglMosaic
                  v-if="stacItems.length > 0"
                  id="naip-mosaic"
                  :sources="stacItems"
                  :render-mode="renderMode"
                  @source-load="handleSourceLoad"
                  @error="handleError"
                />
              </VMap>
            </ClientOnly>

            <!-- Toggle button - always visible -->
            <button
              class="absolute top-4 left-4 z-10 flex size-9 items-center justify-center rounded-lg bg-background/95 shadow-lg backdrop-blur-sm transition-colors hover:bg-accent"
              :class="{
                'bg-primary text-primary-foreground hover:bg-primary/90':
                  !panelOpen,
              }"
              @click="togglePanel"
            >
              <Icon
                :name="
                  panelOpen
                    ? 'lucide:panel-left-close'
                    : 'lucide:panel-left-open'
                "
                class="size-4"
              />
            </button>

            <!-- Collapsible panel with motion-v -->
            <AnimatePresence>
              <motion.div
                v-if="panelOpen"
                :initial="{ opacity: 0, x: -20, scale: 0.95 }"
                :animate="{ opacity: 1, x: 0, scale: 1 }"
                :exit="{ opacity: 0, x: -20, scale: 0.95 }"
                :transition="{ type: 'spring', stiffness: 300, damping: 25 }"
                class="absolute top-16 left-4 z-10 w-64 rounded-lg bg-background/95 p-4 shadow-lg backdrop-blur-sm"
              >
                <h3 class="mb-2 text-sm font-semibold">NAIP Mosaic</h3>
                <p class="mb-3 text-xs text-muted-foreground">
                  <span v-if="loading">Loading STAC items...</span>
                  <span v-else-if="error" class="text-destructive">{{
                    error
                  }}</span>
                  <template v-else>
                    Fetched {{ stacItems.length }}
                    <a
                      href="https://stacspec.org/en"
                      target="_blank"
                      class="text-primary hover:underline"
                      >STAC</a
                    >
                    Items from
                    <a
                      href="https://planetarycomputer.microsoft.com"
                      target="_blank"
                      class="text-primary hover:underline"
                      >Microsoft Planetary Computer</a
                    >.
                  </template>
                </p>
                <p class="mb-3 text-xs text-muted-foreground">
                  All imagery is rendered client-side with
                  <strong>no server involved</strong> using
                  <a
                    href="https://github.com/developmentseed/deck.gl-raster"
                    target="_blank"
                    class="font-mono text-primary hover:underline"
                    >@developmentseed/deck.gl-raster</a
                  >.
                </p>

                <div>
                  <label class="mb-1.5 block text-xs font-medium"
                    >Render Mode</label
                  >
                  <Select v-model="renderMode" :disabled="loading">
                    <SelectTrigger class="w-full">
                      <SelectValue
                        :placeholder="getRenderModeLabel(renderMode)"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="opt in renderModeOptions"
                        :key="opt.value"
                        :value="opt.value"
                      >
                        {{ opt.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </ComponentDemo>

      <div class="mt-6 rounded-lg border border-border bg-card p-4">
        <h3 class="mb-3 font-semibold">Features</h3>
        <ul
          class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-muted-foreground"
        >
          <li class="flex items-center gap-2">
            <Icon
              name="lucide:check"
              class="size-4 shrink-0 text-emerald-500"
            />
            Client-side mosaic
          </li>
          <li class="flex items-center gap-2">
            <Icon
              name="lucide:check"
              class="size-4 shrink-0 text-emerald-500"
            />
            STAC API integration
          </li>
          <li class="flex items-center gap-2">
            <Icon
              name="lucide:check"
              class="size-4 shrink-0 text-emerald-500"
            />
            4-band imagery (RGBN)
          </li>
          <li class="flex items-center gap-2">
            <Icon
              name="lucide:check"
              class="size-4 shrink-0 text-emerald-500"
            />
            GPU-accelerated
          </li>
          <li class="flex items-center gap-2">
            <Icon
              name="lucide:check"
              class="size-4 shrink-0 text-emerald-500"
            />
            No server required
          </li>
          <li class="flex items-center gap-2">
            <Icon
              name="lucide:check"
              class="size-4 shrink-0 text-emerald-500"
            />
            Multi-render modes
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
