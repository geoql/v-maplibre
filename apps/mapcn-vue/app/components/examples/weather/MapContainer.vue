<script setup lang="ts">
  import type { ComponentPublicInstance } from 'vue';
  import type { CityWeather, AirQualityData, AqiLevel } from '~/types/weather';
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import {
    VControlLegend,
    VControlNavigation,
    VControlScale,
    VMap,
    VMarker,
  } from '@geoql/v-maplibre';
  import type {
    GradientLegendItem,
    CategoryLegendItem,
  } from '@geoql/v-maplibre';

  const props = defineProps<{
    citiesWeather: CityWeather[];
    citiesAirQuality: Map<string, AirQualityData>;
    selectedCity: CityWeather | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    getTemperatureColor: (temp: number) => string;
    getWeatherIcon: (code: number) => string;
    getAqiLevel: (aqi: number) => AqiLevel;
  }>();

  const emit = defineEmits<{
    selectCity: [city: CityWeather];
    refresh: [];
  }>();

  const mapId = useId();
  const { mapStyle } = useMapStyle();
  const mapRef = ref<MaplibreMap | null>(null);

  const mapOptions = computed(() => ({
    container: `weather-dashboard-${mapId}`,
    style: mapStyle.value,
    center: [20, 20] as [number, number],
    zoom: 1.5,
    minZoom: 1,
    projection: 'globe' as const,
  }));

  function handleMapLoad(map: MaplibreMap): void {
    mapRef.value = map;
  }

  function handleMarkerClick(city: CityWeather): void {
    emit('selectCity', city);
    mapRef.value?.flyTo({
      center: [city.lon, city.lat],
      zoom: 5,
      duration: 1500,
    });
  }

  type MarkerRefSetter = (el: Element | null) => void;

  function wrapMarkerRef(
    setRef: MarkerRefSetter,
  ): (el: Element | ComponentPublicInstance | null) => void {
    return (el) => {
      if (el instanceof Element) {
        setRef(el);
      }
    };
  }

  function getCityAqi(cityName: string): AirQualityData | undefined {
    return props.citiesAirQuality.get(cityName);
  }

  const temperatureLegend: GradientLegendItem = {
    min: -20,
    max: 35,
    colors: [
      '#1e40af',
      '#3b82f6',
      '#06b6d4',
      '#22c55e',
      '#eab308',
      '#f97316',
      '#ef4444',
    ],
    stops: [-20, -10, 0, 10, 20, 28, 35],
    minLabel: '-20°',
    maxLabel: '35°+',
  };

  const aqiLegendItems: CategoryLegendItem[] = [
    { value: 'good', label: 'Good (0-50)', color: '#22c55e' },
    { value: 'moderate', label: 'Moderate (51-100)', color: '#eab308' },
    { value: 'sensitive', label: 'Sensitive (101-150)', color: '#f97316' },
    { value: 'unhealthy', label: 'Unhealthy (151-200)', color: '#ef4444' },
    {
      value: 'very-unhealthy',
      label: 'Very Unhealthy (201-300)',
      color: '#a855f7',
    },
    { value: 'hazardous', label: 'Hazardous (301+)', color: '#881337' },
  ];
</script>

<template>
  <div class="relative size-full min-w-0 overflow-hidden">
    <ClientOnly>
      <div
        v-if="isLoading && citiesWeather.length === 0"
        class="absolute inset-0 z-10 flex items-center justify-center bg-muted"
      >
        <div class="flex items-center gap-2 text-muted-foreground">
          <Icon name="lucide:loader-2" class="size-5 animate-spin" />
          <span>Fetching weather data...</span>
        </div>
      </div>

      <div
        v-if="error"
        class="absolute inset-0 z-10 flex items-center justify-center bg-muted"
      >
        <div class="text-center text-destructive">
          <Icon name="lucide:alert-circle" class="mx-auto mb-2 size-8" />
          <p>{{ error }}</p>
        </div>
      </div>

      <div
        v-if="lastUpdated"
        class="absolute bottom-2 right-2 z-10 rounded-sm bg-background/80 px-2 py-1 text-xs text-muted-foreground backdrop-blur-sm"
      >
        <div class="flex items-center gap-2">
          <span>Updated: {{ lastUpdated.toLocaleTimeString() }}</span>
          <button
            class="hover:text-foreground"
            title="Refresh"
            @click="emit('refresh')"
          >
            <Icon
              name="lucide:refresh-cw"
              class="size-3"
              :class="{ 'animate-spin': isLoading }"
            />
          </button>
        </div>
      </div>

      <VMap
        :key="mapStyle"
        :options="mapOptions"
        class="size-full"
        @loaded="handleMapLoad"
      >
        <VMarker
          v-for="city in citiesWeather"
          :key="city.name"
          :coordinates="[city.lon, city.lat]"
        >
          <template #markers="{ setRef }">
            <div :ref="wrapMarkerRef(setRef)">
              <button
                class="flex cursor-pointer flex-col items-center gap-0.5 rounded-lg border border-border/50 bg-background/90 px-2 py-1 shadow-sm backdrop-blur-sm transition-transform hover:scale-110"
                :class="{
                  'ring-2 ring-primary': selectedCity?.name === city.name,
                }"
                @click="handleMarkerClick(city)"
              >
                <div class="flex items-center gap-1">
                  <Icon
                    :name="props.getWeatherIcon(city.current.weather_code)"
                    class="size-3.5"
                  />
                  <span
                    class="text-xs font-semibold"
                    :style="{
                      color: props.getTemperatureColor(
                        city.current.temperature_2m,
                      ),
                    }"
                  >
                    {{ Math.round(city.current.temperature_2m) }}°
                  </span>
                </div>
                <span
                  v-if="getCityAqi(city.name)"
                  class="rounded-sm px-1 text-[10px] font-medium leading-tight"
                  :style="{
                    backgroundColor:
                      props.getAqiLevel(getCityAqi(city.name)!.us_aqi).color +
                      '20',
                    color: props.getAqiLevel(getCityAqi(city.name)!.us_aqi)
                      .color,
                  }"
                >
                  AQI {{ getCityAqi(city.name)!.us_aqi }}
                </span>
              </button>
            </div>
          </template>
        </VMarker>
        <VControlNavigation position="top-right" />
        <VControlScale position="bottom-left" />
        <VControlLegend
          :layer-ids="[]"
          type="gradient"
          :items="[temperatureLegend]"
          title="Temperature"
          position="bottom-left"
          :interactive="false"
        />
        <VControlLegend
          :layer-ids="[]"
          type="category"
          :items="aqiLegendItems"
          title="AQI (US EPA)"
          position="bottom-left"
          :interactive="false"
        />
      </VMap>
      <template #fallback>
        <div class="size-full bg-muted animate-pulse"></div>
      </template>
    </ClientOnly>
  </div>
</template>
