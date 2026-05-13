<script setup lang="ts">
  import type { NbcStats, HazardType, DangerLevel } from '~/types/defense-nbc';
  import { Slider } from '~/components/ui/slider';

  const props = defineProps<{
    windDirection: number;
    windSpeed: number;
    stats: NbcStats;
    isSimulating: boolean;
    hasSource: boolean;
    hazardType: HazardType;
    expansion: number;
  }>();

  const emit = defineEmits<{
    'update:windDirection': [value: number];
    'update:windSpeed': [value: number];
    'update:hazardType': [value: HazardType];
    reset: [];
  }>();

  const windDirValue = computed({
    get: () => [props.windDirection],
    set: (val: number[]) => emit('update:windDirection', val[0] ?? 225),
  });

  const windSpeedValue = computed({
    get: () => [props.windSpeed],
    set: (val: number[]) => emit('update:windSpeed', val[0] ?? 8),
  });

  const windCardinal = computed(() => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round(props.windDirection / 45) % 8;
    return dirs[idx];
  });

  const elapsedDisplay = computed(() => {
    const s = props.stats.elapsedSeconds;
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  });

  const progressPercent = computed(() => Math.round(props.expansion * 100));

  const ZONE_LEGEND: {
    level: DangerLevel;
    label: string;
    colorClass: string;
  }[] = [
    { level: 'lethal', label: 'Lethal (0–2 km)', colorClass: 'bg-red-600' },
    { level: 'danger', label: 'Danger (0–5 km)', colorClass: 'bg-orange-500' },
    {
      level: 'caution',
      label: 'Caution (0–10 km)',
      colorClass: 'bg-yellow-500',
    },
  ];

  const HAZARD_TYPES: { type: HazardType; label: string; icon: string }[] = [
    { type: 'nuclear', label: 'Nuclear', icon: 'lucide:atom' },
    { type: 'biological', label: 'Bio', icon: 'lucide:bug' },
    { type: 'chemical', label: 'Chemical', icon: 'lucide:flask-conical' },
  ];
</script>

<template>
  <div class="space-y-4 p-4">
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Hazard Type</h3>
      <div class="flex gap-1">
        <button
          v-for="h in HAZARD_TYPES"
          :key="h.type"
          class="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors"
          :class="
            hazardType === h.type
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          "
          @click="emit('update:hazardType', h.type)"
        >
          <Icon :name="h.icon" class="size-3.5" />
          {{ h.label }}
        </button>
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="text-sm font-semibold">
        Wind Direction: {{ windDirection }}° {{ windCardinal }}
      </h3>
      <Slider v-model="windDirValue" :min="0" :max="360" :step="1" />
      <div class="flex items-center justify-center">
        <div
          class="relative flex size-12 items-center justify-center rounded-full border border-border bg-muted/50"
        >
          <div class="absolute text-[8px] text-muted-foreground -top-0.5">
            N
          </div>
          <div class="absolute text-[8px] text-muted-foreground -bottom-0.5">
            S
          </div>
          <div class="absolute text-[8px] text-muted-foreground -left-0.5">
            W
          </div>
          <div class="absolute text-[8px] text-muted-foreground -right-0.5">
            E
          </div>
          <div
            class="size-5 text-destructive transition-transform"
            :style="{ transform: `rotate(${windDirection}deg)` }"
          >
            <Icon name="lucide:arrow-up" class="size-5" />
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Wind Speed: {{ windSpeed }} m/s</h3>
      <Slider v-model="windSpeedValue" :min="1" :max="20" :step="1" />
    </div>

    <div v-if="hasSource" class="space-y-2">
      <h3 class="text-sm font-semibold">Simulation</h3>
      <div class="space-y-1.5 rounded-lg border border-border bg-muted/50 p-3">
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted-foreground">Elapsed</span>
          <span class="font-mono font-bold">{{ elapsedDisplay }}</span>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted-foreground">Expansion</span>
          <span class="font-mono font-bold">{{ progressPercent }}%</span>
        </div>
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            class="h-full rounded-full bg-destructive transition-all"
            :style="{ width: `${progressPercent}%` }"
          ></div>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted-foreground">Affected Area</span>
          <span class="font-mono font-bold">
            {{ stats.affectedAreaKm2 }} km²
          </span>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Danger Zones</h3>
      <div class="space-y-1">
        <div
          v-for="zone in ZONE_LEGEND"
          :key="zone.level"
          class="flex items-center gap-2 text-xs text-muted-foreground"
        >
          <span
            class="size-2.5 shrink-0 rounded-full"
            :class="zone.colorClass"
          ></span>
          {{ zone.label }}
        </div>
      </div>
    </div>

    <div class="flex gap-2">
      <button
        v-if="hasSource"
        class="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
        @click="emit('reset')"
      >
        <Icon name="lucide:trash-2" class="size-3.5" />
        Clear
      </button>
    </div>

    <div class="rounded-lg border border-border bg-muted/50 p-3">
      <p class="text-xs text-muted-foreground">
        Click on the map to place a hazard source. The plume will expand
        downwind based on wind direction and speed.
      </p>
    </div>
  </div>
</template>
