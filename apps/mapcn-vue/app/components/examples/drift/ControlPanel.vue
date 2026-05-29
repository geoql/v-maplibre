<script setup lang="ts">
  import type { DriftMode, DriftStats } from '~/types/maritime-drift';

  defineProps<{
    mode: DriftMode;
    particleCount: number;
    currentSpeedKn: number;
    currentBearingDeg: number;
    windSpeedKn: number;
    windBearingDeg: number;
    durationHours: number;
    showHeatmap: boolean;
    isPlaying: boolean;
    stats: DriftStats;
  }>();

  const emit = defineEmits<{
    'update:mode': [mode: DriftMode];
    'update:particleCount': [count: number];
    'update:currentSpeedKn': [speed: number];
    'update:currentBearingDeg': [bearing: number];
    'update:windSpeedKn': [speed: number];
    'update:windBearingDeg': [bearing: number];
    'update:durationHours': [hours: number];
    'update:showHeatmap': [show: boolean];
    play: [];
    pause: [];
    reset: [];
  }>();

  const bearingLabels = [
    { label: 'N', val: 0 },
    { label: 'NE', val: 45 },
    { label: 'E', val: 90 },
    { label: 'SE', val: 135 },
    { label: 'S', val: 180 },
    { label: 'SW', val: 225 },
    { label: 'W', val: 270 },
    { label: 'NW', val: 315 },
  ];

  function formatBearing(deg: number): string {
    const found = bearingLabels.find((b) => b.val === deg);
    return found ? found.label : `${deg}°`;
  }
</script>

<template>
  <div class="space-y-4 p-4">
    <!-- Mode toggle -->
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Scenario</h3>
      <div class="flex gap-1">
        <button
          class="flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors"
          :class="
            mode === 'sar'
              ? 'bg-warning/15 text-warning border border-warning/40'
              : 'bg-muted text-muted-foreground border border-transparent hover:bg-accent'
          "
          @click="emit('update:mode', 'sar')"
        >
          SAR
        </button>
        <button
          class="flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors"
          :class="
            mode === 'spill'
              ? 'bg-muted-foreground/20 text-foreground border border-muted-foreground/40'
              : 'bg-muted text-muted-foreground border border-transparent hover:bg-accent'
          "
          @click="emit('update:mode', 'spill')"
        >
          Oil Spill
        </button>
      </div>
    </div>

    <!-- Particle count -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <Label class="text-xs" :for="'pc'">Particles</Label>
        <span class="font-mono text-xs tabular-nums text-muted-foreground">
          {{ particleCount }}
        </span>
      </div>
      <Slider
        :id="'pc'"
        :model-value="[particleCount]"
        :min="100"
        :max="1500"
        :step="50"
        :aria-label="'Particle count'"
        @update:model-value="emit('update:particleCount', $event[0])"
      />
    </div>

    <!-- Duration -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <Label class="text-xs" :for="'dur'">Duration (h)</Label>
        <span class="font-mono text-xs tabular-nums text-muted-foreground">
          {{ durationHours }}h
        </span>
      </div>
      <Slider
        :id="'dur'"
        :model-value="[durationHours]"
        :min="1"
        :max="72"
        :step="1"
        :aria-label="'Drift duration'"
        @update:model-value="emit('update:durationHours', $event[0])"
      />
    </div>

    <!-- Current speed -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <Label class="text-xs" :for="'cs'">Current (kn)</Label>
        <span class="font-mono text-xs tabular-nums text-muted-foreground">
          {{ currentSpeedKn.toFixed(1) }}
        </span>
      </div>
      <Slider
        :id="'cs'"
        :model-value="[currentSpeedKn]"
        :min="0"
        :max="5"
        :step="0.1"
        :aria-label="'Current speed'"
        @update:model-value="emit('update:currentSpeedKn', $event[0])"
      />
    </div>

    <!-- Current bearing -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <Label class="text-xs" :for="'cb'">Current dir.</Label>
        <span class="font-mono text-xs tabular-nums text-muted-foreground">
          {{ formatBearing(currentBearingDeg) }}
        </span>
      </div>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="b in bearingLabels"
          :key="b.val"
          class="rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors"
          :class="
            currentBearingDeg === b.val
              ? 'bg-primary/15 text-primary border border-primary/40'
              : 'bg-muted text-muted-foreground border border-transparent hover:bg-accent'
          "
          @click="emit('update:currentBearingDeg', b.val)"
        >
          {{ b.label }}
        </button>
      </div>
    </div>

    <!-- Wind speed -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <Label class="text-xs" :for="'ws'">Wind (kn)</Label>
        <span class="font-mono text-xs tabular-nums text-muted-foreground">
          {{ windSpeedKn.toFixed(0) }}
        </span>
      </div>
      <Slider
        :id="'ws'"
        :model-value="[windSpeedKn]"
        :min="0"
        :max="30"
        :step="1"
        :aria-label="'Wind speed'"
        @update:model-value="emit('update:windSpeedKn', $event[0])"
      />
    </div>

    <!-- Wind bearing -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <Label class="text-xs" :for="'wb'">Wind dir.</Label>
        <span class="font-mono text-xs tabular-nums text-muted-foreground">
          {{ formatBearing(windBearingDeg) }}
        </span>
      </div>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="b in bearingLabels"
          :key="b.val"
          class="rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors"
          :class="
            windBearingDeg === b.val
              ? 'bg-foreground/15 text-foreground border border-foreground/40'
              : 'bg-muted text-muted-foreground border border-transparent hover:bg-accent'
          "
          @click="emit('update:windBearingDeg', b.val)"
        >
          {{ b.label }}
        </button>
      </div>
    </div>

    <!-- Playback -->
    <div class="space-y-3">
      <h3 class="text-sm font-semibold">Playback</h3>
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

      <!-- Heatmap toggle -->
      <button
        class="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs transition-colors"
        :class="
          showHeatmap
            ? 'bg-primary/15 text-foreground'
            : 'text-muted-foreground/50 hover:bg-accent hover:text-foreground'
        "
        @click="emit('update:showHeatmap', !showHeatmap)"
      >
        <Icon name="lucide:flame" class="size-3.5 shrink-0" />
        <span class="font-medium">Density heatmap</span>
      </button>
    </div>

    <!-- Legend -->
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Legend</h3>
      <div class="space-y-1.5 text-xs text-muted-foreground">
        <div class="flex items-center gap-2">
          <span
            class="size-2.5 rounded-full bg-success ring-2 ring-foreground/70"
          ></span>
          <span>Last known position (datum)</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="h-0.5 w-4 rounded-full bg-primary"></span>
          <span>Ocean current vector</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="h-0.5 w-4 rounded-full bg-foreground"></span>
          <span>Wind drift vector</span>
        </div>
        <div class="flex items-center gap-2">
          <span
            class="size-2.5 rounded-full"
            :class="mode === 'sar' ? 'bg-warning' : 'bg-muted-foreground'"
          ></span>
          <span>{{
            mode === 'sar' ? 'Survivor particles' : 'Oil particles'
          }}</span>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Statistics</h3>
      <div class="grid grid-cols-2 gap-2">
        <div
          class="rounded-lg border border-border bg-muted/50 p-2 text-center"
        >
          <div class="text-lg font-bold tabular-nums">
            {{ stats.particleCount }}
          </div>
          <div class="text-[10px] text-muted-foreground">Particles</div>
        </div>
        <div
          class="rounded-lg border border-border bg-muted/50 p-2 text-center"
        >
          <div class="text-lg font-bold tabular-nums">
            {{ stats.searchAreaKm2.toLocaleString() }}
          </div>
          <div class="text-[10px] text-muted-foreground">Area (km²)</div>
        </div>
        <div
          class="rounded-lg border border-border bg-muted/50 p-2 text-center"
        >
          <div class="text-lg font-bold tabular-nums">
            {{ stats.driftDistanceKm }}
          </div>
          <div class="text-[10px] text-muted-foreground">Drift (km)</div>
        </div>
        <div
          class="rounded-lg border border-border bg-muted/50 p-2 text-center"
        >
          <div class="text-lg font-bold tabular-nums">
            {{ stats.elapsedHours }}h
          </div>
          <div class="text-[10px] text-muted-foreground">Elapsed</div>
        </div>
      </div>
    </div>
  </div>
</template>
