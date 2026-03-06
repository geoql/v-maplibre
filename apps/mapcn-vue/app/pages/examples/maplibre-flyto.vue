<script setup lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import { VMap, VControlNavigation, VMarker } from '@geoql/v-maplibre';
  import { motion, AnimatePresence } from 'motion-v';

  useSeoMeta({
    title: 'FlyTo Animation - mapcn-vue Examples',
    description:
      'Smooth camera animations with flyTo, easeTo, and jumpTo methods.',
  });

  defineOgImage('MapcnDoc', {
    title: 'FlyTo Animation',
    description:
      'Smooth camera animations with flyTo, easeTo, and jumpTo methods.',
    category: 'MapLibre',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();
  const mapRef = ref<MaplibreMap | null>(null);
  const panelOpen = ref(true);

  const mapOptions = computed(() => ({
    container: `flyto-map-${mapId}`,
    style: mapStyle.value,
    center: [-74.006, 40.7128] as [number, number],
    zoom: 10,
  }));

  interface CityLocation {
    name: string;
    coordinates: [number, number];
    zoom: number;
    pitch?: number;
    bearing?: number;
  }

  const cities: CityLocation[] = [
    { name: 'New York', coordinates: [-74.006, 40.7128], zoom: 12 },
    {
      name: 'Paris',
      coordinates: [2.3522, 48.8566],
      zoom: 13,
      pitch: 45,
      bearing: 30,
    },
    { name: 'Tokyo', coordinates: [139.6917, 35.6895], zoom: 11 },
    {
      name: 'Sydney',
      coordinates: [151.2093, -33.8688],
      zoom: 12,
      pitch: 60,
      bearing: -45,
    },
    { name: 'Rio de Janeiro', coordinates: [-43.1729, -22.9068], zoom: 11 },
    {
      name: 'Dubai',
      coordinates: [55.2708, 25.2048],
      zoom: 13,
      pitch: 50,
      bearing: 120,
    },
  ];

  const currentCity = ref<CityLocation>(cities[0]);
  const animationType = ref<'flyTo' | 'easeTo' | 'jumpTo'>('flyTo');
  const duration = ref(2000);

  function handleMapLoad(map: MaplibreMap): void {
    mapRef.value = map;
  }

  function flyToCity(city: CityLocation): void {
    if (!mapRef.value) return;
    currentCity.value = city;

    const options = {
      center: city.coordinates,
      zoom: city.zoom,
      pitch: city.pitch ?? 0,
      bearing: city.bearing ?? 0,
      duration: duration.value,
    };

    switch (animationType.value) {
      case 'flyTo':
        mapRef.value.flyTo(options);
        break;
      case 'easeTo':
        mapRef.value.easeTo(options);
        break;
      case 'jumpTo':
        mapRef.value.jumpTo({
          center: city.coordinates,
          zoom: city.zoom,
          pitch: city.pitch ?? 0,
          bearing: city.bearing ?? 0,
        });
        break;
    }
  }

  function resetView(): void {
    if (!mapRef.value) return;
    mapRef.value.flyTo({
      center: [-74.006, 40.7128],
      zoom: 2,
      pitch: 0,
      bearing: 0,
      duration: 1500,
    });
  }

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                    import { ref } from 'vue';
                    import type { Map } from 'maplibre-gl';
                    import { VMap, VControlNavigation, VMarker } from '@geoql/v-maplibre';

                    const mapRef = ref<Map | null>(null);
                    const cities = [
                    { name: 'New York', coordinates: [-74.006, 40.7128], zoom: 12 },
                    { name: 'Paris', coordinates: [2.3522, 48.8566], zoom: 13, pitch: 45, bearing: 30 },
                    { name: 'Tokyo', coordinates: [139.6917, 35.6895], zoom: 11 },
                    ];

                    function handleMapLoad(map: Map) {
                    mapRef.value = map;
                    }

                    function flyToCity(city) {
                    if (!mapRef.value) return;
                    mapRef.value.flyTo({
                      center: city.coordinates,
                      zoom: city.zoom,
                      pitch: city.pitch ?? 0,
                      bearing: city.bearing ?? 0,
                      duration: 2000,
                    });
                    }
                  ${SCRIPT_END}

                  <template>
                    <VMap :options="mapOptions" class="h-125 w-full" @loaded="handleMapLoad">
                      <VControlNavigation position="top-right" />
                      <VMarker
                        v-for="city in cities"
                        :key="city.name"
                        :coordinates="city.coordinates"
                      />
                    </VMap>
                    <div class="flex gap-2 mt-4">
                      <button
                        v-for="city in cities"
                        :key="city.name"
                        class="btn"
                        @click="flyToCity(city)"
                      >
                        {{ city.name }}
                      </button>
                    </div>
                  </template>`;
</script>

<template>
  <ComponentDemo
    title="FlyTo Animation"
    description="Smooth camera animations using flyTo, easeTo, and jumpTo methods. Click on cities to animate the camera with 3D perspective."
    :code="codeExample"
    registry="map-layers"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0">
      <ClientOnly>
        <VMap
          :key="mapStyle"
          :options="mapOptions"
          class="size-full"
          @loaded="handleMapLoad"
        >
          <VControlNavigation position="top-right" />
          <VMarker
            v-for="city in cities"
            :key="city.name"
            :coordinates="city.coordinates"
          />
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

      <!-- NAIP toggle button -->
      <button
        class="absolute top-4 left-4 z-10 flex size-9 items-center justify-center rounded-lg border bg-background/95 shadow-sm backdrop-blur-sm transition-colors hover:bg-muted"
        :class="{
          'bg-primary text-primary-foreground hover:bg-primary/90': !panelOpen,
        }"
        @click="panelOpen = !panelOpen"
      >
        <Icon
          :name="
            panelOpen ? 'lucide:panel-left-close' : 'lucide:panel-left-open'
          "
          class="size-4"
        />
      </button>

      <!-- NAIP collapsible panel -->
      <AnimatePresence>
        <motion.div
          v-if="panelOpen"
          :initial="{ opacity: 0, x: -20, scale: 0.95 }"
          :animate="{ opacity: 1, x: 0, scale: 1 }"
          :exit="{ opacity: 0, x: -20, scale: 0.95 }"
          :transition="{ type: 'spring', stiffness: 300, damping: 25 }"
          class="absolute top-16 left-4 z-10 w-80 rounded-xl border bg-background/95 shadow-lg backdrop-blur-sm"
        >
          <div class="p-4">
            <div class="mb-4">
              <h3 class="mb-2 text-sm font-medium">Animation Type</h3>
              <div class="flex gap-2">
                <button
                  v-for="type in ['flyTo', 'easeTo', 'jumpTo']"
                  :key="type"
                  class="rounded-md border px-3 py-1.5 text-sm transition-colors"
                  :class="[
                    animationType === type
                      ? 'border-primary bg-primary text-primary-foreground'
                      : `border-border bg-background hover:bg-muted`,
                  ]"
                  @click="animationType = type as 'flyTo' | 'easeTo' | 'jumpTo'"
                >
                  {{ type }}
                </button>
              </div>
            </div>

            <div class="mb-4">
              <h3 class="mb-2 text-sm font-medium">
                Duration: {{ duration }}ms
              </h3>
              <input
                v-model.number="duration"
                type="range"
                min="500"
                max="5000"
                step="100"
                class="w-full"
              />
            </div>

            <div class="mb-4">
              <h3 class="mb-2 text-sm font-medium">Cities</h3>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="city in cities"
                  :key="city.name"
                  class="rounded-md border px-3 py-1.5 text-sm transition-colors"
                  :class="[
                    currentCity.name === city.name
                      ? 'border-primary bg-primary/10 text-primary'
                      : `border-border bg-background hover:bg-muted`,
                  ]"
                  @click="flyToCity(city)"
                >
                  <Icon
                    name="lucide:map-pin"
                    class="mr-1 inline-block size-3"
                  />
                  {{ city.name }}
                </button>
              </div>
            </div>

            <button
              class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted"
              @click="resetView"
            >
              <Icon name="lucide:globe" class="mr-1 inline-block size-4" />
              Reset to World View
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  </ComponentDemo>
</template>
