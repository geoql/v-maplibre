<script setup lang="ts"></script>

<template>
  <div class="mt-6 space-y-4">
    <div class="rounded-lg border border-border bg-muted/50 p-4">
      <p class="text-sm text-muted-foreground">
        <strong>Live Data:</strong> This example fetches real-time temperature
        data from
        <a
          href="https://openweathermap.org/api"
          target="_blank"
          class="text-primary hover:underline"
          >OpenWeatherMap API</a
        >
        for a 10x10 grid of points across the globe (100 API calls). The IDW
        algorithm then interpolates temperatures between these points.
      </p>
    </div>
    <div class="rounded-lg border border-border bg-muted/50 p-4">
      <p class="text-sm text-muted-foreground">
        <strong>Density vs Interpolated:</strong> MapLibre's built-in heatmap
        shows point <em>density</em> (how many points are nearby). This
        interpolated heatmap calculates the <em>weighted average</em> of values
        using Inverse Distance Weighting (IDW) — perfect for temperature maps,
        pollution levels, or any continuous value visualization.
      </p>
    </div>
    <div class="rounded-lg border border-border bg-muted/50 p-4">
      <p class="text-sm text-muted-foreground">
        <strong>Library:</strong>
        <a
          href="https://github.com/geoql/maplibre-gl-interpolate-heatmap"
          target="_blank"
          class="text-primary hover:underline"
          >maplibre-gl-interpolate-heatmap</a
        >
        — A GeoQL library for rendering IDW interpolated heatmaps with WebGL
        shaders. Blue = cold, Green = mild, Red = hot.
      </p>
    </div>
  </div>
</template>
