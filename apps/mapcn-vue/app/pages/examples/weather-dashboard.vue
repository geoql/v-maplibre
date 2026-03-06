<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v';

  useSeoMeta({
    title: 'Weather Dashboard - mapcn-vue Examples',
    description:
      'Global weather explorer with real-time data from Open-Meteo. Temperature markers, air quality index, city search, and 7-day forecasts.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Weather Dashboard',
    description:
      'Global weather explorer with real-time temperature and air quality data.',
    category: 'Examples',
  });

  const {
    citiesWeather,
    citiesAirQuality,
    selectedCity,
    selectedForecast,
    selectedCityAqi,
    searchResults,
    isLoading,
    isForecastLoading,
    error,
    lastUpdated,
    fetchAllCitiesWeather,
    searchCity,
    selectCity,
    selectSearchResult,
    clearSelection,
    getTemperatureColor,
    getWeatherIcon,
    getWeatherDescription,
    getAqiLevel,
  } = useWeatherData();

  const panelOpen = ref(true);

  onMounted(() => {
    fetchAllCitiesWeather();
  });

  function handleSearch(query: string): void {
    searchCity(query);
  }

  function handleClear(): void {
    clearSelection();
  }

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                import { VMap, VMarker, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

                // Fetch weather for 25 major cities using Open-Meteo (free, no API key)
                const lats = cities.map(c => c.lat).join(',');
                const lons = cities.map(c => c.lon).join(',');
                const url = \`https://api.open-meteo.com/v1/forecast?latitude=${'$'}{lats}&longitude=${'$'}{lons}&current=temperature_2m,weather_code&timezone=auto\`;

                const data = await fetch(url).then(r => r.json());
              ${SCRIPT_END}

              <template>
                <VMap :options="mapOptions" class="h-125 w-full">
                  <VMarker v-for="city in citiesWeather" :key="city.name" :lng-lat="[city.lon, city.lat]">
                    <div class="rounded-full bg-background/90 px-2 py-1 text-xs font-bold shadow">
                      {{ Math.round(city.current.temperature_2m) }}°
                    </div>
                  </VMarker>
                  <VControlNavigation position="top-right" />
                  <VControlScale position="bottom-left" />
                </VMap>
              </template>`;
</script>

<template>
  <ComponentDemo
    title="Weather Dashboard"
    description="Global weather explorer with real-time data from Open-Meteo. Temperature markers with AQI badges for 25 major cities, geocoding search, air quality details, and 7-day forecasts."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesWeatherMapContainer
        :cities-weather="citiesWeather"
        :cities-air-quality="citiesAirQuality"
        :selected-city="selectedCity"
        :is-loading="isLoading"
        :error="error"
        :last-updated="lastUpdated"
        :get-temperature-color="getTemperatureColor"
        :get-weather-icon="getWeatherIcon"
        :get-aqi-level="getAqiLevel"
        class="size-full"
        @select-city="selectCity"
        @refresh="fetchAllCitiesWeather"
      />

      <!-- Toggle button -->
      <button
        class="absolute top-4 left-4 z-10 flex size-9 items-center justify-center rounded-lg border border-border/50 bg-background/95 shadow-sm backdrop-blur-sm transition-colors hover:bg-accent"
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

      <!-- Controls overlay -->
      <AnimatePresence>
        <motion.div
          v-if="panelOpen"
          :initial="{ opacity: 0, x: -20, scale: 0.95 }"
          :animate="{ opacity: 1, x: 0, scale: 1 }"
          :exit="{ opacity: 0, x: -20, scale: 0.95 }"
          :transition="{ type: 'spring', stiffness: 300, damping: 25 }"
          class="absolute top-16 left-4 z-10 w-72 max-h-[calc(100%-5rem)] overflow-auto rounded-xl bg-background/95 shadow-lg backdrop-blur-sm"
        >
          <ExamplesWeatherCityCard
            v-if="selectedCity"
            :city="selectedCity"
            :forecast="selectedForecast"
            :air-quality="selectedCityAqi"
            :is-forecast-loading="isForecastLoading"
            :get-weather-icon="getWeatherIcon"
            :get-weather-description="getWeatherDescription"
            :get-temperature-color="getTemperatureColor"
            :get-aqi-level="getAqiLevel"
            @close="handleClear"
          />
          <ExamplesWeatherControlPanel
            v-else
            :search-results="searchResults"
            @search="handleSearch"
            @select-result="selectSearchResult"
            @clear="handleClear"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  </ComponentDemo>
</template>
