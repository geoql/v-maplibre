<script setup lang="ts">
  import type { ShipType, MaritimeStats } from '~/types/defense-maritime';

  defineProps<{
    activeShipTypes: Set<ShipType>;
    isPlaying: boolean;
    speed: number;
    stats: MaritimeStats;
  }>();

  const emit = defineEmits<{
    play: [];
    pause: [];
    reset: [];
    setSpeed: [speed: number];
    toggleShipType: [type: ShipType];
  }>();

  const speedOptions = [0.5, 1, 2, 4];

  const shipTypeConfig: {
    type: ShipType;
    label: string;
    icon: string;
    color: string;
  }[] = [
    {
      type: 'naval',
      label: 'Naval',
      icon: 'lucide:anchor',
      color: 'rgb(0, 100, 255)',
    },
    {
      type: 'merchant',
      label: 'Merchant',
      icon: 'lucide:ship',
      color: 'rgb(0, 200, 150)',
    },
    {
      type: 'fishing',
      label: 'Fishing',
      icon: 'lucide:fish',
      color: 'rgb(200, 200, 0)',
    },
    {
      type: 'suspicious',
      label: 'Suspicious',
      icon: 'lucide:alert-triangle',
      color: 'rgb(255, 50, 50)',
    },
  ];

  // Stable per-item style objects so the v-for does not allocate on re-render
  const shipTypeItems = shipTypeConfig.map((cfg) => ({
    ...cfg,
    dotStyle: { backgroundColor: cfg.color },
  }));
</script>

<template>
  <div class="space-y-4 p-4">
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Ship Types</h3>
      <div class="space-y-1">
        <button
          v-for="cfg in shipTypeItems"
          :key="cfg.type"
          class="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs transition-colors"
          :class="
            activeShipTypes.has(cfg.type)
              ? 'bg-primary/15 text-foreground'
              : 'text-muted-foreground/50 hover:bg-accent hover:text-foreground'
          "
          @click="emit('toggleShipType', cfg.type)"
        >
          <span
            class="size-2.5 shrink-0 rounded-full"
            :style="cfg.dotStyle"
          ></span>
          <Icon :name="cfg.icon" class="size-3.5 shrink-0" />
          <span class="font-medium">{{ cfg.label }}</span>
        </button>
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
      <h3 class="text-sm font-semibold">Situation</h3>
      <div class="grid grid-cols-2 gap-2">
        <div
          class="rounded-lg border border-border bg-muted/50 p-2 text-center"
        >
          <div class="text-lg font-bold tabular-nums">
            {{ stats.totalShips }}
          </div>
          <div class="text-2xs text-muted-foreground">Tracked</div>
        </div>
        <div
          class="rounded-lg border border-border bg-muted/50 p-2 text-center"
        >
          <div class="text-lg font-bold tabular-nums">{{ stats.inEez }}</div>
          <div class="text-2xs text-muted-foreground">In EEZ</div>
        </div>
        <div
          class="rounded-lg border border-border bg-muted/50 p-2 text-center"
        >
          <div class="text-lg font-bold tabular-nums">
            {{ stats.radarCoverage }}%
          </div>
          <div class="text-2xs text-muted-foreground">Radar Cov.</div>
        </div>
        <div
          class="rounded-lg border p-2 text-center"
          :class="
            stats.suspicious > 0
              ? 'border-destructive/50 bg-destructive/10'
              : 'border-border bg-muted/50'
          "
        >
          <div
            class="text-lg font-bold tabular-nums"
            :class="stats.suspicious > 0 ? 'text-destructive' : ''"
          >
            {{ stats.suspicious }}
          </div>
          <div class="text-2xs text-muted-foreground">Suspicious</div>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-muted/50 p-3">
      <p class="text-xs text-muted-foreground">
        <strong>Maritime Domain Awareness:</strong> Indian Navy western coast
        surveillance with EEZ monitoring, coastal radar coverage, and ship
        tracking.
      </p>
    </div>
  </div>
</template>
