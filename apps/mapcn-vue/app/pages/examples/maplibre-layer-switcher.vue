<script setup lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';
  import { onClickOutside } from '@vueuse/core';
  import type { MapStyle } from '~/types/layer-switcher';

  useSeoMeta({
    title: 'Layer Switcher - mapcn-vue Examples',
    description:
      'Dynamic basemap/style switching between satellite, terrain, streets, and more.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Layer Switcher',
    description:
      'Dynamic basemap/style switching between satellite, terrain, streets, and more.',
    category: 'MapLibre',
  });

  const config = useRuntimeConfig();
  const mapsguruApiKey = config.public.mapsguruApiKey;

  const mapId = useId();
  const mapRef = ref<MaplibreMap | null>(null);
  const dropdownRef = ref<HTMLDivElement | null>(null);

  // Style definitions with maps.guru URLs (API key from runtime config)
  const mapStyles = computed<MapStyle[]>(() => [
    {
      id: 'light',
      name: 'Light',
      url: `https://maps.guru/api/v1/styles/standard/light/style.json?key=${mapsguruApiKey}`,
      icon: 'lucide:sun',
    },
    {
      id: 'dark',
      name: 'Dark',
      url: `https://maps.guru/api/v1/styles/standard/dark/style.json?key=${mapsguruApiKey}`,
      icon: 'lucide:moon',
    },

    {
      id: 'vintage',
      name: 'Vintage',
      url: `https://maps.guru/api/v1/styles/standard/vintage/style.json?key=${mapsguruApiKey}`,
      icon: 'lucide:scroll',
    },
    {
      id: 'minimal',
      name: 'Minimal',
      url: `https://maps.guru/api/v1/styles/standard/minimal/style.json?key=${mapsguruApiKey}`,
      icon: 'lucide:minimize-2',
    },
    {
      id: 'grayscale',
      name: 'Grayscale',
      url: `https://maps.guru/api/v1/styles/standard/grayscale/style.json?key=${mapsguruApiKey}`,
      icon: 'lucide:contrast',
    },
    {
      id: 'high-contrast',
      name: 'High Contrast',
      url: `https://maps.guru/api/v1/styles/standard/high_contrast/style.json?key=${mapsguruApiKey}`,
      icon: 'lucide:eye',
    },
  ]);

  const currentStyleId = ref('light');
  const isDropdownOpen = ref(false);

  const currentStyle = computed(() => {
    const found = mapStyles.value.find((s) => s.id === currentStyleId.value);
    // Always return a valid style - default to first if not found
    return found ?? mapStyles.value[0]!;
  });

  const mapOptions = computed(() => ({
    container: `layer-switcher-map-${mapId}`,
    style: currentStyle.value.url,
    center: [-74.006, 40.7128] as [number, number],
    zoom: 12,
  }));

  function handleMapLoad(map: MaplibreMap): void {
    mapRef.value = map;
  }

  function selectStyle(style: MapStyle): void {
    currentStyleId.value = style.id;
    isDropdownOpen.value = false;
  }

  function toggleDropdown(): void {
    isDropdownOpen.value = !isDropdownOpen.value;
  }

  onClickOutside(dropdownRef, () => {
    isDropdownOpen.value = false;
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { ref, computed } from 'vue';
  import { VMap, VControlNavigation } from '@geoql/v-maplibre';

  const mapStyles = [
  { id: 'positron', name: 'Light', url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json' },
  { id: 'dark-matter', name: 'Dark', url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json' },
  { id: 'voyager', name: 'Voyager', url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json' },
  ];

  const currentStyleId = ref('positron');
  const currentStyle = computed(() => mapStyles.find(s => s.id === currentStyleId.value));

  const mapOptions = computed(() => ({
  style: currentStyle.value.url,
  center: [-74.006, 40.7128],
  zoom: 12,
  }));

  function selectStyle(style) {
  currentStyleId.value = style.id;
  }
${SCRIPT_END}

<template>
  <div class="relative">
    <VMap :key="currentStyleId" :options="mapOptions" class="h-125 w-full">
      <VControlNavigation position="top-right" />
    </VMap>

    <!-- Layer Switcher Control -->
    <div class="absolute bottom-4 left-4 z-10">
      <div class="flex flex-col gap-1 rounded-lg bg-background/95 p-1 shadow-lg border">
        <button
          v-for="style in mapStyles"
          :key="style.id"
          class="px-3 py-1.5 rounded text-sm"
          :class="currentStyleId === style.id ? 'bg-primary text-white' : 'hover:bg-muted'"
          @click="selectStyle(style)"
        >
          {{ style.name }}
        </button>
      </div>
    </div>
  </div>
</template>`;
</script>

<template>
  <div class="container max-w-screen-2xl overflow-x-hidden py-4">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-4">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="size-3.5" />
          Examples
        </NuxtLink>
        <h1 class="mt-1.5 text-xl font-semibold tracking-tight">
          Layer Switcher
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Switch between different basemap styles dynamically. Includes light,
          dark, voyager, and other free map styles.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="min-w-0">
          <div class="relative h-125 overflow-hidden">
            <ClientOnly>
              <VMap
                :key="currentStyleId"
                :options="mapOptions"
                class="size-full"
                @loaded="handleMapLoad"
              >
                <VControlNavigation position="top-right" />
                <VControlScale position="bottom-right" />
              </VMap>
              <template #fallback>
                <div class="flex h-full items-center justify-center bg-muted">
                  <Icon
                    name="lucide:loader-2"
                    class="size-8 animate-spin text-muted-foreground"
                  />
                </div>
              </template>
            </ClientOnly>

            <!-- Layer Switcher Control -->
            <div ref="dropdownRef" class="absolute bottom-4 left-4 z-10">
              <button
                class="flex items-center gap-2 rounded-lg bg-background/95 px-3 py-2 text-sm shadow-lg backdrop-blur-sm transition-colors hover:bg-muted"
                @click="toggleDropdown"
              >
                <Icon :name="currentStyle.icon" class="size-4" />
                <span>{{ currentStyle.name }}</span>
                <Icon
                  name="lucide:chevron-up"
                  class="size-4 transition-transform"
                  :class="{ 'rotate-180': !isDropdownOpen }"
                />
              </button>

              <div
                v-show="isDropdownOpen"
                class="absolute bottom-full left-0 mb-2 w-48 rounded-lg bg-background/95 p-1 shadow-lg backdrop-blur-sm"
              >
                <button
                  v-for="style in mapStyles"
                  :key="style.id"
                  class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                  :class="[
                    currentStyleId === style.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted',
                  ]"
                  @click="selectStyle(style)"
                >
                  <Icon :name="style.icon" class="size-4" />
                  <span>{{ style.name }}</span>
                  <Icon
                    v-if="currentStyleId === style.id"
                    name="lucide:check"
                    class="ml-auto size-4"
                  />
                </button>
              </div>
            </div>
          </div>

          <div class="mt-4 bg-card p-4">
            <h3 class="mb-3 font-medium">Quick Select</h3>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="style in mapStyles"
                :key="style.id"
                class="flex flex-col items-center gap-1 p-3 text-sm transition-colors"
                :class="[
                  currentStyleId === style.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : `border-border hover:bg-muted`,
                ]"
                @click="selectStyle(style)"
              >
                <Icon :name="style.icon" class="size-5" />
                <span class="text-xs">{{ style.name }}</span>
              </button>
            </div>
          </div>
        </div>
      </ComponentDemo>

      <div class="mt-4 rounded-lg border bg-muted/50 p-4">
        <h3 class="mb-2 font-medium">Available Styles</h3>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li>
            <strong class="text-foreground">Light & Dark:</strong> Clean themes
            for day/night modes
          </li>

          <li>
            <strong class="text-foreground">Vintage:</strong> Warm, paper-like
            aesthetic with muted tones
          </li>
          <li>
            <strong class="text-foreground">Minimal:</strong> Clean, modern with
            fewer labels
          </li>
          <li>
            <strong class="text-foreground">Grayscale:</strong> Monochrome map
            with shades of gray
          </li>
          <li>
            <strong class="text-foreground">High Contrast:</strong>
            Accessibility-focused with strong contrast
          </li>
        </ul>
      </div>

      <ExampleNavigation />
    </div>
  </div>
</template>
