<script setup lang="ts">
  import { VMap, VMarker, VPopup, VControlNavigation } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Markers & Popups - mapcn-vue Examples',
    description: 'Interactive markers with popup information.',
  });

  const colorMode = useColorMode();
  const mapId = useId();

  const lightStyle =
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
  const darkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark' ? darkStyle : lightStyle,
  );

  const mapOptions = computed(() => ({
    container: `markers-example-${mapId}`,
    style: mapStyle.value,
    center: [-74.006, 40.7128] as [number, number],
    zoom: 12,
  }));

  const markers = [
    {
      coordinates: [-74.006, 40.7128] as [number, number],
      title: 'New York City',
      description: 'The Big Apple',
    },
    {
      coordinates: [-73.985, 40.748] as [number, number],
      title: 'Empire State Building',
      description: 'Iconic skyscraper',
    },
    {
      coordinates: [-74.0445, 40.6892] as [number, number],
      title: 'Statue of Liberty',
      description: 'Symbol of freedom',
    },
  ];

  const selectedMarker = ref<(typeof markers)[0] | null>(null);

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VMarker, VPopup, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-74.006, 40.7128],
  zoom: 12,
};

const markers = [
  { coordinates: [-74.006, 40.7128], title: 'New York City', description: 'The Big Apple' },
  { coordinates: [-73.985, 40.748], title: 'Empire State Building', description: 'Iconic skyscraper' },
  { coordinates: [-74.0445, 40.6892], title: 'Statue of Liberty', description: 'Symbol of freedom' },
];

const selectedMarker = ref(null);
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VMarker
      v-for="marker in markers"
      :key="marker.title"
      :coordinates="marker.coordinates"
      @click="selectedMarker = marker"
    />
    <VPopup
      v-if="selectedMarker"
      :coordinates="selectedMarker.coordinates"
      :options="{}"
      @close="selectedMarker = null"
    >
      <div class="p-2">
        <h3 class="font-bold">{{ selectedMarker.title }}</h3>
        <p>{{ selectedMarker.description }}</p>
      </div>
    </VPopup>
  </VMap>
</template>`;
</script>

<template>
  <div class="container max-w-screen-2xl py-10 overflow-x-hidden">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-8">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4"></Icon>
          Back to Examples
        </NuxtLink>
        <h1 class="mt-4 text-3xl font-bold tracking-tight">Markers & Popups</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Interactive markers with popup information. Click a marker to see the
          popup.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div
          class="h-125 min-w-0 overflow-hidden rounded-lg border border-border"
        >
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
              <VControlNavigation position="top-right"></VControlNavigation>
              <VMarker
                v-for="marker in markers"
                :key="marker.title"
                :coordinates="marker.coordinates"
                @click="selectedMarker = marker"
              ></VMarker>
              <VPopup
                v-if="selectedMarker"
                :coordinates="selectedMarker.coordinates"
                :options="{}"
                @close="selectedMarker = null"
              >
                <div class="p-2">
                  <h3 class="font-bold">{{ selectedMarker.title }}</h3>
                  <p class="text-sm text-muted-foreground">
                    {{ selectedMarker.description }}
                  </p>
                </div>
              </VPopup>
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="MarkersPopups.vue"
          ></CodeBlock>
        </div>
      </div>
    </div>
  </div>
</template>
