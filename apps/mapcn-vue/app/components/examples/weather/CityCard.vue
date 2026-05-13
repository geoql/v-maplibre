<script setup lang="ts">
  import type {
    CityWeather,
    CityForecast,
    AirQualityData,
    AqiLevel,
  } from '~/types/weather';

  const props = defineProps<{
    city: CityWeather;
    forecast: CityForecast | null;
    airQuality: AirQualityData | null;
    isForecastLoading: boolean;
    getWeatherIcon: (code: number) => string;
    getWeatherDescription: (code: number) => string;
    getTemperatureColor: (temp: number) => string;
    getAqiLevel: (aqi: number) => AqiLevel;
  }>();

  const emit = defineEmits<{
    close: [];
  }>();

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function getDayName(dateStr: string): string {
    return dayNames[new Date(dateStr).getDay()] ?? '';
  }
</script>

<template>
  <div class="space-y-4 p-4">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div>
        <h3 class="text-lg font-bold">{{ city.name }}</h3>
        <p class="text-xs text-muted-foreground">{{ city.country }}</p>
      </div>
      <button
        class="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        @click="emit('close')"
      >
        <Icon name="lucide:x" class="size-4" />
      </button>
    </div>

    <!-- Current conditions -->
    <div class="rounded-lg border border-border bg-card p-4">
      <div class="flex items-center gap-3">
        <Icon
          :name="props.getWeatherIcon(city.current.weather_code)"
          class="size-10"
          :style="{
            color: props.getTemperatureColor(city.current.temperature_2m),
          }"
        />
        <div>
          <p
            class="text-3xl font-bold"
            :style="{
              color: props.getTemperatureColor(city.current.temperature_2m),
            }"
          >
            {{ Math.round(city.current.temperature_2m) }}°C
          </p>
          <p class="text-sm text-muted-foreground">
            {{ props.getWeatherDescription(city.current.weather_code) }}
          </p>
        </div>
      </div>

      <div class="mt-3 grid grid-cols-2 gap-2">
        <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon name="lucide:thermometer" class="size-3.5" />
          <span
            >Feels {{ Math.round(city.current.apparent_temperature) }}°</span
          >
        </div>
        <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon name="lucide:droplets" class="size-3.5" />
          <span>{{ city.current.relative_humidity_2m }}%</span>
        </div>
        <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon name="lucide:wind" class="size-3.5" />
          <span>{{ Math.round(city.current.wind_speed_10m) }} km/h</span>
        </div>
        <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon name="lucide:compass" class="size-3.5" />
          <span>{{ Math.round(city.current.wind_direction_10m) }}°</span>
        </div>
      </div>
    </div>

    <!-- Air Quality -->
    <div v-if="airQuality" class="rounded-lg border border-border bg-card p-4">
      <div class="mb-2 flex items-center justify-between">
        <h4 class="text-xs font-semibold text-muted-foreground">Air Quality</h4>
        <span
          class="rounded-full px-2 py-0.5 text-[10px] font-semibold"
          :style="{
            backgroundColor: props.getAqiLevel(airQuality.us_aqi).color + '20',
            color: props.getAqiLevel(airQuality.us_aqi).color,
          }"
        >
          {{ props.getAqiLevel(airQuality.us_aqi).label }}
        </span>
      </div>
      <div class="mb-3 flex items-baseline gap-2">
        <span
          class="text-2xl font-bold"
          :style="{ color: props.getAqiLevel(airQuality.us_aqi).color }"
        >
          {{ airQuality.us_aqi }}
        </span>
        <span class="text-xs text-muted-foreground">US AQI</span>
      </div>
      <!-- AQI bar -->
      <div class="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          class="h-full rounded-full transition-all duration-500"
          :style="{
            width: `${Math.min((airQuality.us_aqi / 300) * 100, 100)}%`,
            backgroundColor: props.getAqiLevel(airQuality.us_aqi).color,
          }"
        ></div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span class="size-1.5 rounded-full bg-warning"></span>
          <span>PM2.5: {{ airQuality.pm2_5.toFixed(1) }} µg/m³</span>
        </div>
        <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span class="size-1.5 rounded-full bg-warning"></span>
          <span>PM10: {{ airQuality.pm10.toFixed(1) }} µg/m³</span>
        </div>
      </div>
    </div>

    <!-- 7-day forecast -->
    <div v-if="isForecastLoading" class="flex items-center justify-center py-4">
      <Icon
        name="lucide:loader-2"
        class="size-5 animate-spin text-muted-foreground"
      />
    </div>
    <div v-else-if="forecast" class="space-y-2">
      <h4 class="text-xs font-semibold text-muted-foreground">
        7-Day Forecast
      </h4>
      <div class="space-y-1">
        <div
          v-for="(day, idx) in forecast.daily.time"
          :key="day"
          class="flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-accent/50"
        >
          <span class="w-8 font-medium">{{ getDayName(day) }}</span>
          <Icon
            :name="props.getWeatherIcon(forecast.daily.weather_code[idx] ?? 0)"
            class="size-4"
          />
          <div class="flex items-center gap-1">
            <span
              class="font-semibold"
              :style="{
                color: props.getTemperatureColor(
                  forecast.daily.temperature_2m_max[idx] ?? 0,
                ),
              }"
            >
              {{ Math.round(forecast.daily.temperature_2m_max[idx] ?? 0) }}°
            </span>
            <span class="text-muted-foreground">
              {{ Math.round(forecast.daily.temperature_2m_min[idx] ?? 0) }}°
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
