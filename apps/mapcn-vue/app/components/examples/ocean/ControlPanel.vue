<script setup lang="ts">
  import type { OceanStats } from '~/types/maritime-ocean';
  import { THERMAL_RAMP } from '~/composables/use-maritime-ocean';
  import { Slider } from '~/components/ui/slider';
  import { Label } from '~/components/ui/label';

  defineProps<{
    showSst: boolean;
    showCurrents: boolean;
    sstOpacity: number;
    currentDensity: number;
    currentSpeed: number;
    isPlaying: boolean;
    stats: OceanStats;
  }>();

  const emit = defineEmits<{
    'update:showSst': [value: boolean];
    'update:showCurrents': [value: boolean];
    'update:sstOpacity': [value: number];
    'update:currentDensity': [value: number];
    play: [];
    pause: [];
    reset: [];
    'update:currentSpeed': [value: number];
  }>();

  const speedOptions = [0.25, 0.5, 1, 2];

  // Thermal legend stops
  const thermalStops = THERMAL_RAMP.map((c, i) => ({
    color: `rgb(${c[0]},${c[1]},${c[2]})`,
    label: `${22 + i * (10 / (THERMAL_RAMP.length - 1))}°C`,
  }));
</script>

<template>
  <div class="space-y-4 p-4">
    <!-- Layer Toggles -->
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Layers</h3>
      <div class="space-y-1">
        <button
          class="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs transition-colors"
          :class="
            showSst
              ? 'bg-primary/15 text-foreground'
              : 'text-muted-foreground/50 hover:bg-accent hover:text-foreground'
          "
          @click="emit('update:showSst', !showSst)"
        >
          <span
            class="size-2.5 shrink-0 rounded-full"
            :style="{
              background:
                'linear-gradient(to right, rgb(0,50,255), rgb(255,30,0))',
            }"
          ></span>
          <Icon name="lucide:thermometer" class="size-3.5 shrink-0" />
          <span class="font-medium">Sea-Surface Temp</span>
        </button>
        <button
          class="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs transition-colors"
          :class="
            showCurrents
              ? 'bg-primary/15 text-foreground'
              : 'text-muted-foreground/50 hover:bg-accent hover:text-foreground'
          "
          @click="emit('update:showCurrents', !showCurrents)"
        >
          <span
            class="size-2.5 shrink-0 rounded-full bg-(--color-current-swatch)"
          ></span>
          <Icon name="lucide:wind" class="size-3.5 shrink-0" />
          <span class="font-medium">Surface Currents</span>
        </button>
      </div>
    </div>

    <!-- SST Opacity -->
    <div v-if="showSst" class="space-y-2">
      <div class="flex items-center justify-between">
        <Label class="text-xs font-medium">SST Opacity</Label>
        <span class="font-mono text-xs tabular-nums text-muted-foreground">
          {{ Math.round(sstOpacity * 100) }}%
        </span>
      </div>
      <Slider
        :model-value="[sstOpacity]"
        :min="0"
        :max="1"
        :step="0.05"
        class="w-full"
        @update:model-value="emit('update:sstOpacity', $event[0])"
      />
    </div>

    <!-- Current Density -->
    <div v-if="showCurrents" class="space-y-2">
      <div class="flex items-center justify-between">
        <Label class="text-xs font-medium">Current Density</Label>
        <span class="font-mono text-xs tabular-nums text-muted-foreground">
          {{ Math.round(currentDensity * 100) }}%
        </span>
      </div>
      <Slider
        :model-value="[currentDensity]"
        :min="0.1"
        :max="1"
        :step="0.05"
        class="w-full"
        @update:model-value="emit('update:currentDensity', $event[0])"
      />
    </div>

    <!-- Playback -->
    <div class="space-y-3">
      <h3 class="text-sm font-semibold">Animation</h3>
      <div class="flex items-center justify-center gap-2">
        <button
          class="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Reset"
          @click="emit('reset')"
        >
          <Icon name="lucide:rotate-ccw" class="size-4" />
        </button>
        <button
          class="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          :title="isPlaying ? 'Pause' : 'Play'"
          @click="isPlaying ? emit('pause') : emit('play')"
        >
          <Icon
            :name="isPlaying ? 'lucide:pause' : 'lucide:play'"
            class="size-4"
          />
        </button>
      </div>

      <div class="space-y-1">
        <h4 class="text-xs font-medium text-muted-foreground">Speed</h4>
        <div class="flex gap-1">
          <button
            v-for="s in speedOptions"
            :key="s"
            class="flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors"
            :class="
              currentSpeed === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            "
            @click="emit('update:currentSpeed', s)"
          >
            {{ s }}x
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Statistics</h3>
      <div class="grid grid-cols-2 gap-2">
        <div
          class="rounded-lg border border-border bg-muted/50 p-2 text-center"
        >
          <div class="text-lg font-bold tabular-nums">{{ stats.minSst }}°</div>
          <div class="text-2xs text-muted-foreground">Min SST</div>
        </div>
        <div
          class="rounded-lg border border-border bg-muted/50 p-2 text-center"
        >
          <div class="text-lg font-bold tabular-nums">{{ stats.maxSst }}°</div>
          <div class="text-2xs text-muted-foreground">Max SST</div>
        </div>
        <div
          class="rounded-lg border border-primary/40 bg-primary/5 p-2 text-center"
        >
          <div class="text-lg font-bold tabular-nums text-primary">
            {{ stats.meanCurrent }}
          </div>
          <div class="text-2xs text-muted-foreground">Mean m/s</div>
        </div>
        <div
          class="rounded-lg border border-border bg-muted/50 p-2 text-center"
        >
          <div class="text-lg font-bold tabular-nums">
            {{ stats.gridCells.toLocaleString() }}
          </div>
          <div class="text-2xs text-muted-foreground">Grid Cells</div>
        </div>
      </div>
    </div>

    <!-- Thermal Legend -->
    <div v-if="showSst" class="space-y-2">
      <h3 class="text-sm font-semibold">SST Scale</h3>
      <div class="space-y-1">
        <div
          class="h-2 w-full rounded-sm"
          :style="{
            background: `linear-gradient(to right, ${thermalStops.map((s) => s.color).join(', ')})`,
          }"
        ></div>
        <div
          class="flex justify-between font-mono text-2xs text-muted-foreground"
        >
          <span>22°C</span>
          <span>27°C</span>
          <span>32°C</span>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-muted/50 p-3">
      <p class="text-xs text-muted-foreground">
        <strong>Oceanographic Situation:</strong> Arabian Sea / Indian Ocean
        sea-surface temperature and surface current simulation with procedural
        mesoscale eddies and monsoon-driven circulation.
      </p>
    </div>
  </div>
</template>

<style scoped>
  /* Surface-currents legend swatch — exact data-viz cyan, kept as a scoped
   * CSS variable so the color stays out of the semantic token system while
   * still avoiding a raw hex in the template class list. */
  .space-y-4 {
    --color-current-swatch: #00c8ff;
  }
</style>
