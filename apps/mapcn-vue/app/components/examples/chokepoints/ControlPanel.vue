<script setup lang="ts">
  import type {
    Chokepoint,
    ChokepointStats,
  } from '~/types/maritime-chokepoints';

  defineProps<{
    chokepoints: Chokepoint[];
    selectedId: string;
    showSts: boolean;
    hexagonRadius: number;
    elevationScale: number;
    isPlaying: boolean;
    stats: ChokepointStats;
  }>();

  const emit = defineEmits<{
    selectChokepoint: [id: string];
    toggleSts: [];
    setHexagonRadius: [value: number];
    setElevationScale: [value: number];
    play: [];
    pause: [];
    reset: [];
  }>();
</script>

<template>
  <div class="space-y-4 p-4">
    <!-- Chokepoint selector -->
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Chokepoint</h3>
      <div class="grid grid-cols-2 gap-1.5">
        <button
          v-for="cp in chokepoints"
          :key="cp.id"
          class="rounded-md px-2.5 py-2 text-xs font-medium transition-colors"
          :class="
            selectedId === cp.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
          "
          @click="emit('selectChokepoint', cp.id)"
        >
          {{ cp.name }}
        </button>
      </div>
    </div>

    <!-- Hexagon radius -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold">Hex Radius</h3>
        <span class="font-mono text-xs tabular-nums text-muted-foreground">
          {{ hexagonRadius }}m
        </span>
      </div>
      <Slider
        :model-value="[hexagonRadius]"
        :min="500"
        :max="6000"
        :step="250"
        class="w-full"
        @update:model-value="emit('setHexagonRadius', $event[0]!)"
      />
    </div>

    <!-- Elevation scale -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold">Elevation</h3>
        <span class="font-mono text-xs tabular-nums text-muted-foreground">
          {{ elevationScale }}
        </span>
      </div>
      <Slider
        :model-value="[elevationScale]"
        :min="10"
        :max="300"
        :step="10"
        class="w-full"
        @update:model-value="emit('setElevationScale', $event[0]!)"
      />
    </div>

    <!-- STS toggle + playback -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold">STS Events</h3>
        <button
          class="rounded-md px-2 py-0.5 text-xs font-medium transition-colors"
          :class="
            showSts
              ? 'bg-warning/20 text-warning'
              : 'bg-muted text-muted-foreground'
          "
          @click="emit('toggleSts')"
        >
          {{ showSts ? 'Visible' : 'Hidden' }}
        </button>
      </div>
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
    </div>

    <!-- Legend -->
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Legend</h3>
      <div class="space-y-1.5 text-xs text-muted-foreground">
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <span>Vessel density</span>
          </div>
          <div
            class="h-2 w-full rounded-full"
            style="
              background: linear-gradient(
                to right,
                rgb(30, 100, 220),
                rgb(200, 200, 80),
                rgb(220, 80, 30),
                rgb(180, 30, 20)
              );
            "
          ></div>
          <div class="flex justify-between text-2xs">
            <span>Low</span>
            <span>High (taller bars)</span>
          </div>
        </div>
        <div class="flex items-center gap-2 pt-1">
          <span
            class="size-2.5 rounded-full border-2 border-destructive"
          ></span>
          <span>Ship-to-ship (STS) transfer — % = risk score</span>
        </div>
      </div>
    </div>

    <!-- Stats grid -->
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Statistics</h3>
      <div class="grid grid-cols-2 gap-2">
        <div
          class="rounded-lg border border-border bg-muted/50 p-2 text-center"
        >
          <div class="text-lg font-bold tabular-nums">
            {{ stats.totalVessels }}
          </div>
          <div class="text-2xs text-muted-foreground">Vessels</div>
        </div>
        <div
          class="rounded-lg border border-border bg-muted/50 p-2 text-center"
        >
          <div class="text-lg font-bold tabular-nums">
            {{ stats.densityPeak }}
          </div>
          <div class="text-2xs text-muted-foreground">Density Peak</div>
        </div>
        <div
          class="rounded-lg border p-2 text-center"
          :class="
            stats.stsEvents > 0
              ? 'border-warning/50 bg-warning/10'
              : 'border-border bg-muted/50'
          "
        >
          <div
            class="text-lg font-bold tabular-nums"
            :class="stats.stsEvents > 0 ? 'text-warning' : ''"
          >
            {{ stats.stsEvents }}
          </div>
          <div class="text-2xs text-muted-foreground">STS Events</div>
        </div>
        <div
          class="rounded-lg border border-border bg-muted/50 p-2 text-center"
        >
          <div class="text-lg font-bold tabular-nums leading-tight">
            {{ stats.activeChokepoint.split(' ')[0] }}
          </div>
          <div class="text-2xs text-muted-foreground">Zone</div>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-muted/50 p-3">
      <p class="text-xs text-muted-foreground">
        <strong>Maritime Defense:</strong> Strategic chokepoint monitoring with
        vessel-density heatmaps and ship-to-ship transfer detection for
        dark-fleet identification.
      </p>
    </div>
  </div>
</template>
