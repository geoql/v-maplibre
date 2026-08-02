<script setup lang="ts">
  import type { VesselType, MaritimeAisStats } from '~/types/maritime-ais';

  defineProps<{
    activeVesselTypes: Set<VesselType>;
    highlightDarkOnly: boolean;
    isPlaying: boolean;
    speed: number;
    stats: MaritimeAisStats;
  }>();

  const emit = defineEmits<{
    play: [];
    pause: [];
    reset: [];
    setSpeed: [speed: number];
    toggleVesselType: [type: VesselType];
    toggleDarkOnly: [];
  }>();

  const speedOptions = [0.5, 1, 2, 4];

  const vesselTypeConfig: {
    type: VesselType;
    label: string;
    icon: string;
    color: string;
  }[] = [
    {
      type: 'cargo',
      label: 'Cargo',
      icon: 'lucide:container',
      color: 'rgb(0, 180, 255)',
    },
    {
      type: 'tanker',
      label: 'Tanker',
      icon: 'lucide:drill',
      color: 'rgb(255, 140, 0)',
    },
    {
      type: 'fishing',
      label: 'Fishing',
      icon: 'lucide:fish',
      color: 'rgb(50, 220, 100)',
    },
    {
      type: 'naval',
      label: 'Naval',
      icon: 'lucide:anchor',
      color: 'rgb(180, 40, 255)',
    },
    {
      type: 'passenger',
      label: 'Passenger',
      icon: 'lucide:ship',
      color: 'rgb(0, 210, 210)',
    },
  ];

  // Stable per-item style objects so the v-for does not allocate on re-render
  const vesselTypeItems = vesselTypeConfig.map((cfg) => ({
    ...cfg,
    dotStyle: { backgroundColor: cfg.color },
  }));
</script>

<template>
  <div class="space-y-4 p-4">
    <!-- Vessel type toggles -->
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Vessel Types</h3>
      <div class="space-y-1">
        <button
          v-for="cfg in vesselTypeItems"
          :key="cfg.type"
          class="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs transition-colors"
          :class="
            activeVesselTypes.has(cfg.type)
              ? 'bg-primary/15 text-foreground'
              : 'text-muted-foreground/50 hover:bg-accent hover:text-foreground'
          "
          @click="emit('toggleVesselType', cfg.type)"
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

    <!-- Dark fleet toggle -->
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Detection</h3>
      <button
        class="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs transition-colors"
        :class="
          highlightDarkOnly
            ? 'bg-destructive/15 text-destructive'
            : 'text-muted-foreground/50 hover:bg-accent hover:text-foreground'
        "
        @click="emit('toggleDarkOnly')"
      >
        <Icon
          :name="highlightDarkOnly ? 'lucide:eye' : 'lucide:eye-off'"
          class="size-3.5 shrink-0"
        />
        <span class="font-medium">Highlight dark fleet only</span>
      </button>
    </div>

    <!-- Playback controls -->
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

    <!-- Stats grid -->
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Situation</h3>
      <div class="grid grid-cols-2 gap-2">
        <div
          class="rounded-lg border border-border bg-muted/50 p-2 text-center"
        >
          <div class="text-lg font-bold tabular-nums">
            {{ stats.totalTracked }}
          </div>
          <div class="text-2xs text-muted-foreground">Tracked</div>
        </div>
        <div
          class="rounded-lg border p-2 text-center"
          :class="
            stats.darkVessels > 0
              ? 'border-destructive/50 bg-destructive/10'
              : 'border-border bg-muted/50'
          "
        >
          <div
            class="text-lg font-bold tabular-nums"
            :class="stats.darkVessels > 0 ? 'text-destructive' : ''"
          >
            {{ stats.darkVessels }}
          </div>
          <div class="text-2xs text-muted-foreground">Dark Fleet</div>
        </div>
        <div
          class="rounded-lg border border-border bg-muted/50 p-2 text-center"
        >
          <div class="text-lg font-bold tabular-nums">{{ stats.naval }}</div>
          <div class="text-2xs text-muted-foreground">Naval</div>
        </div>
        <div
          class="rounded-lg border border-border bg-muted/50 p-2 text-center"
        >
          <div class="text-lg font-bold tabular-nums">
            {{ stats.avgSpeed }}kn
          </div>
          <div class="text-2xs text-muted-foreground">Avg Speed</div>
        </div>
      </div>
    </div>

    <!-- Descriptor -->
    <div class="rounded-lg border border-border bg-muted/50 p-3">
      <p class="text-xs text-muted-foreground">
        <strong>Global AIS Tracking:</strong> {{ stats.totalTracked }} vessels
        monitored across {{ 10 }} major shipping lanes with AIS gap detection
        identifying {{ stats.darkVessels }} dark vessels.
      </p>
    </div>
  </div>
</template>
