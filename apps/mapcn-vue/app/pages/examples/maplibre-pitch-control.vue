<script setup lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import { VMap, VControlNavigation } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Pitch & Bearing Control - mapcn-vue Examples',
    description:
      'Interactive sliders for adjusting map pitch (tilt) and bearing (rotation).',
  });

  const colorMode = useColorMode();
  const mapId = useId();
  const mapRef = ref<MaplibreMap | null>(null);

  const lightStyle =
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
  const darkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark' ? darkStyle : lightStyle,
  );

  const mapOptions = computed(() => ({
    container: `pitch-control-map-${mapId}`,
    style: mapStyle.value,
    center: [-74.006, 40.7128] as [number, number],
    zoom: 15,
    pitch: pitch.value,
    bearing: bearing.value,
    maxPitch: 85,
  }));

  const pitch = ref(45);
  const bearing = ref(0);
  const zoom = ref(15);

  function handleMapLoad(map: MaplibreMap): void {
    mapRef.value = map;

    // Add sky layer to fill the horizon area when tilted
    // Sky layer type is valid in MapLibre GL but not in TS types yet
    if (!map.getLayer('sky')) {
      map.addLayer({
        id: 'sky',
        type: 'sky' as unknown as 'background',
        paint: {
          'sky-type': 'gradient',
          'sky-gradient': [
            'interpolate',
            ['linear'],
            ['sky-radial-progress'],
            0.0,
            colorMode.value === 'dark' ? '#1a1a2e' : '#87ceeb',
            0.5,
            colorMode.value === 'dark' ? '#16213e' : '#b4d7e8',
            1.0,
            colorMode.value === 'dark' ? '#0f0f1a' : '#e0f0ff',
          ],
          'sky-gradient-center': [0, 0],
          'sky-gradient-radius': 90,
        } as Record<string, unknown>,
      });
    }

    // Sync map state with our controls on map events
    map.on('pitchend', () => {
      pitch.value = Math.round(map.getPitch());
    });
    map.on('rotate', () => {
      bearing.value = Math.round(map.getBearing());
    });
    map.on('zoomend', () => {
      zoom.value = Math.round(map.getZoom() * 10) / 10;
    });
  }

  function updatePitch(value: number): void {
    pitch.value = value;
    if (mapRef.value) {
      mapRef.value.easeTo({ pitch: value, duration: 300 });
    }
  }

  function updateBearing(value: number): void {
    bearing.value = value;
    if (mapRef.value) {
      mapRef.value.easeTo({ bearing: value, duration: 300 });
    }
  }

  function updateZoom(value: number): void {
    zoom.value = value;
    if (mapRef.value) {
      mapRef.value.easeTo({ zoom: value, duration: 300 });
    }
  }

  function resetView(): void {
    pitch.value = 0;
    bearing.value = 0;
    zoom.value = 15;
    if (mapRef.value) {
      mapRef.value.easeTo({
        pitch: 0,
        bearing: 0,
        zoom: 15,
        duration: 500,
      });
    }
  }

  function set3DView(): void {
    pitch.value = 60;
    bearing.value = -30;
    zoom.value = 16;
    if (mapRef.value) {
      mapRef.value.easeTo({
        pitch: 60,
        bearing: -30,
        zoom: 16,
        duration: 500,
      });
    }
  }

  function setBirdsEye(): void {
    pitch.value = 85;
    bearing.value = 45;
    zoom.value = 17;
    if (mapRef.value) {
      mapRef.value.easeTo({
        pitch: 85,
        bearing: 45,
        zoom: 17,
        duration: 500,
      });
    }
  }

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { ref } from 'vue';
import type { Map } from 'maplibre-gl';
import { VMap, VControlNavigation } from '@geoql/v-maplibre';

const mapRef = ref<Map | null>(null);
const pitch = ref(45);
const bearing = ref(0);

function handleMapLoad(map: Map) {
  mapRef.value = map;

  // Sync controls with map gestures
  map.on('pitchend', () => pitch.value = Math.round(map.getPitch()));
  map.on('rotate', () => bearing.value = Math.round(map.getBearing()));
}

function updatePitch(value: number) {
  pitch.value = value;
  mapRef.value?.easeTo({ pitch: value, duration: 300 });
}

function updateBearing(value: number) {
  bearing.value = value;
  mapRef.value?.easeTo({ bearing: value, duration: 300 });
}

function resetView() {
  pitch.value = 0;
  bearing.value = 0;
  mapRef.value?.easeTo({ pitch: 0, bearing: 0, duration: 500 });
}
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full" @loaded="handleMapLoad">
    <VControlNavigation position="top-right" />
  </VMap>

  <div class="controls mt-4">
    <label>Pitch: {{ pitch }}°</label>
    <input type="range" :value="pitch" min="0" max="85" @input="updatePitch" />

    <label>Bearing: {{ bearing }}°</label>
    <input type="range" :value="bearing" min="-180" max="180" @input="updateBearing" />

    <button @click="resetView">Reset</button>
  </div>
</template>`;
</script>

<template>
  <div class="container max-w-screen-2xl overflow-x-hidden py-10">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-8">
        <NuxtLink
          to="/examples"
          class="text-muted-foreground hover:text-foreground inline-flex items-center text-sm"
        >
          <Icon name="lucide:arrow-left" class="mr-2 size-4" />
          Back to Examples
        </NuxtLink>
        <h1 class="mt-4 text-3xl font-bold tracking-tight">
          Pitch & Bearing Control
        </h1>
        <p class="text-muted-foreground mt-2 text-lg">
          Adjust map pitch (tilt angle) and bearing (rotation) with interactive
          sliders. Create stunning 3D perspectives of your maps.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div class="min-w-0">
          <div class="relative h-125 overflow-hidden rounded-lg border">
            <ClientOnly>
              <VMap
                :key="mapStyle"
                :options="mapOptions"
                class="size-full"
                @loaded="handleMapLoad"
              >
                <VControlNavigation position="top-right" />
              </VMap>
              <template #fallback>
                <div class="bg-muted flex h-full items-center justify-center">
                  <Icon
                    name="lucide:loader-2"
                    class="text-muted-foreground size-8 animate-spin"
                  />
                </div>
              </template>
            </ClientOnly>
          </div>

          <!-- Controls Panel -->
          <div class="bg-card mt-4 rounded-lg border p-4">
            <!-- Preset buttons -->
            <div class="mb-4 flex gap-2">
              <button
                class="border-border hover:bg-muted flex-1 rounded-md border px-3 py-2 text-sm transition-colors"
                @click="resetView"
              >
                <Icon name="lucide:compass" class="mr-1 inline-block size-4" />
                Top View
              </button>
              <button
                class="border-border hover:bg-muted flex-1 rounded-md border px-3 py-2 text-sm transition-colors"
                @click="set3DView"
              >
                <Icon name="lucide:box" class="mr-1 inline-block size-4" />
                3D View
              </button>
              <button
                class="border-border hover:bg-muted flex-1 rounded-md border px-3 py-2 text-sm transition-colors"
                @click="setBirdsEye"
              >
                <Icon name="lucide:eye" class="mr-1 inline-block size-4" />
                Bird's Eye
              </button>
            </div>

            <!-- Pitch slider -->
            <div class="mb-4">
              <div class="mb-2 flex items-center justify-between">
                <label class="text-sm font-medium">Pitch (Tilt)</label>
                <span class="text-muted-foreground text-sm">{{ pitch }}°</span>
              </div>
              <input
                :value="pitch"
                type="range"
                min="0"
                max="85"
                step="1"
                class="w-full"
                @input="
                  updatePitch(Number(($event.target as HTMLInputElement).value))
                "
              />
              <div
                class="text-muted-foreground mt-1 flex justify-between text-xs"
              >
                <span>0° (Flat)</span>
                <span>85° (Max)</span>
              </div>
            </div>

            <!-- Bearing slider -->
            <div class="mb-4">
              <div class="mb-2 flex items-center justify-between">
                <label class="text-sm font-medium">Bearing (Rotation)</label>
                <span class="text-muted-foreground text-sm"
                  >{{ bearing }}°</span
                >
              </div>
              <input
                :value="bearing"
                type="range"
                min="-180"
                max="180"
                step="1"
                class="w-full"
                @input="
                  updateBearing(
                    Number(($event.target as HTMLInputElement).value),
                  )
                "
              />
              <div
                class="text-muted-foreground mt-1 flex justify-between text-xs"
              >
                <span>-180° (South)</span>
                <span>0° (North)</span>
                <span>180° (South)</span>
              </div>
            </div>

            <!-- Zoom slider -->
            <div>
              <div class="mb-2 flex items-center justify-between">
                <label class="text-sm font-medium">Zoom</label>
                <span class="text-muted-foreground text-sm">{{ zoom }}</span>
              </div>
              <input
                :value="zoom"
                type="range"
                min="10"
                max="20"
                step="0.1"
                class="w-full"
                @input="
                  updateZoom(Number(($event.target as HTMLInputElement).value))
                "
              />
              <div
                class="text-muted-foreground mt-1 flex justify-between text-xs"
              >
                <span>10 (Far)</span>
                <span>20 (Close)</span>
              </div>
            </div>
          </div>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="PitchControl.vue"
          />

          <div class="bg-muted/50 mt-4 rounded-lg border p-4">
            <h3 class="mb-2 font-medium">Understanding Pitch & Bearing</h3>
            <ul class="text-muted-foreground space-y-2 text-sm">
              <li>
                <strong class="text-foreground">Pitch (0-85°):</strong> The
                angle of the camera looking down at the map. 0° is straight
                down, 85° is nearly horizontal.
              </li>
              <li>
                <strong class="text-foreground"
                  >Bearing (-180° to 180°):</strong
                >
                The rotation of the map around the center. 0° points north, 90°
                points east.
              </li>
              <li>
                <strong class="text-foreground">Gestures:</strong> The map also
                responds to touch/mouse gestures - right-click + drag to rotate,
                ctrl + drag to pitch.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
