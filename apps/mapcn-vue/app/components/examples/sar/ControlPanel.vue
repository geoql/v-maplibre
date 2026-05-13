<script setup lang="ts">
  import type { SarStats } from '~/types/defense-sar';

  defineProps<{
    isPlaying: boolean;
    speed: number;
    stats: SarStats;
  }>();

  const emit = defineEmits<{
    play: [];
    pause: [];
    reset: [];
    setSpeed: [speed: number];
  }>();

  const speedOptions = [0.5, 1, 2, 4];

  const LEGEND_ITEMS = [
    { label: 'High probability', color: 'bg-red-500' },
    { label: 'Medium probability', color: 'bg-yellow-500' },
    { label: 'Low probability', color: 'bg-green-500' },
    { label: 'Searched', color: 'bg-gray-400' },
  ];
</script>

<template>
  <div class="space-y-4 p-4">
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Search Progress</h3>
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted-foreground">Coverage</span>
          <span class="font-mono font-bold">{{ stats.coveragePercent }}%</span>
        </div>
        <div class="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            class="h-full rounded-full bg-primary transition-all"
            :style="{ width: `${stats.coveragePercent}%` }"
          ></div>
        </div>
        <div class="grid grid-cols-3 gap-2 text-center text-xs">
          <div class="rounded-md bg-muted/50 px-2 py-1.5">
            <div class="font-mono font-bold">{{ stats.totalSectors }}</div>
            <div class="text-muted-foreground">Total</div>
          </div>
          <div class="rounded-md bg-muted/50 px-2 py-1.5">
            <div class="font-mono font-bold text-success">
              {{ stats.searchedSectors }}
            </div>
            <div class="text-muted-foreground">Searched</div>
          </div>
          <div class="rounded-md bg-muted/50 px-2 py-1.5">
            <div class="font-mono font-bold text-warning">
              {{ stats.remainingSectors }}
            </div>
            <div class="text-muted-foreground">Remaining</div>
          </div>
        </div>
      </div>
    </div>

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

      <div class="space-y-1">
        <h4 class="text-xs font-medium text-muted-foreground">Speed</h4>
        <div class="flex gap-1">
          <button
            v-for="s in speedOptions"
            :key="s"
            class="flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors"
            :class="
              speed === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            "
            @click="emit('setSpeed', s)"
          >
            {{ s }}x
          </button>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Legend</h3>
      <div class="space-y-1">
        <div
          v-for="item in LEGEND_ITEMS"
          :key="item.label"
          class="flex items-center gap-2 text-xs text-muted-foreground"
        >
          <span class="size-3 shrink-0 rounded-sm" :class="item.color"></span>
          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-muted/50 p-3">
      <p class="text-xs text-muted-foreground">
        <strong>SAR Grid:</strong> Click any sector to toggle it as searched.
        Helicopters auto-mark sectors as they fly over.
      </p>
    </div>
  </div>
</template>
