<script setup lang="ts">
  import { Slider } from '~/components/ui/slider';
  import { Label } from '~/components/ui/label';

  const numParticles = defineModel<number[]>('numParticles', {
    required: true,
  });
  const maxAge = defineModel<number[]>('maxAge', { required: true });
  const speedFactor = defineModel<number[]>('speedFactor', { required: true });
  const lineWidth = defineModel<number[]>('lineWidth', { required: true });

  defineProps<{
    dataPointCount: number;
  }>();
</script>

<template>
  <div class="space-y-6">
    <div class="rounded-lg border border-border bg-card p-4">
      <h3 class="mb-4 font-semibold">Particle Controls</h3>
      <div class="space-y-6">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label>Particles</Label>
            <span class="text-sm text-muted-foreground">{{
              numParticles[0]?.toLocaleString()
            }}</span>
          </div>
          <Slider
            v-model="numParticles"
            :min="1000"
            :max="32768"
            :step="1000"
          />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label>Trail Length</Label>
            <span class="text-sm text-muted-foreground">{{ maxAge[0] }}</span>
          </div>
          <Slider v-model="maxAge" :min="5" :max="100" :step="5" />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label>Speed</Label>
            <span class="text-sm text-muted-foreground">{{
              speedFactor[0]
            }}</span>
          </div>
          <Slider v-model="speedFactor" :min="10" :max="200" :step="10" />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label>Line Width</Label>
            <span class="text-sm text-muted-foreground">{{
              lineWidth[0]
            }}</span>
          </div>
          <Slider v-model="lineWidth" :min="0.5" :max="5" :step="0.5" />
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-muted/50 p-4">
      <p class="text-sm text-muted-foreground">
        <strong>Live Data:</strong> Fetching real-time wind from
        <a
          href="https://openweathermap.org/api"
          target="_blank"
          class="text-primary hover:underline"
          >OpenWeatherMap</a
        >. Auto-refreshes every hour.
      </p>
    </div>

    <div class="rounded-lg border border-border bg-muted/50 p-4">
      <p class="text-sm text-muted-foreground">
        <strong>Data Points:</strong>
        {{ dataPointCount }} locations sampled globally
      </p>
    </div>
  </div>
</template>
