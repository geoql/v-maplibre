<script setup lang="ts">
  import type {
    RadarTier,
    AltitudeLayer,
    RadarTierConfig,
    AirDefenseStats,
  } from '~/types/defense-air-defense';
  import { Slider } from '~/components/ui/slider';

  const props = defineProps<{
    activeAltitude: AltitudeLayer | 'all';
    activeTiers: Set<RadarTier>;
    tierConfigs: RadarTierConfig[];
    stats: AirDefenseStats;
    sweepSpeed: number[];
  }>();

  const emit = defineEmits<{
    setAltitude: [altitude: AltitudeLayer | 'all'];
    toggleTier: [tier: RadarTier];
    'update:sweepSpeed': [speed: number[]];
  }>();

  const ALTITUDE_OPTIONS: { value: AltitudeLayer | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'low', label: 'Low' },
    { value: 'mid', label: 'Mid' },
    { value: 'high', label: 'High' },
  ];

  function getTierColorClass(tier: RadarTier): string {
    const colors: Record<RadarTier, string> = {
      shorad: 'bg-cyan-500',
      mrsam: 'bg-emerald-500',
      lrsam: 'bg-orange-500',
    };
    return colors[tier];
  }

  const speedValue = computed({
    get: () => props.sweepSpeed,
    set: (val: number[]) => emit('update:sweepSpeed', val),
  });
</script>

<template>
  <div class="space-y-4 p-4">
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Altitude Layer</h3>
      <div class="flex gap-1">
        <button
          v-for="opt in ALTITUDE_OPTIONS"
          :key="opt.value"
          class="flex flex-1 items-center justify-center rounded-md px-2 py-1.5 text-xs font-medium transition-colors"
          :class="
            activeAltitude === opt.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          "
          @click="emit('setAltitude', opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Radar Tiers</h3>
      <div class="space-y-1">
        <button
          v-for="config in tierConfigs"
          :key="config.tier"
          class="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs transition-colors"
          :class="
            activeTiers.has(config.tier)
              ? 'bg-primary/15 text-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          "
          @click="emit('toggleTier', config.tier)"
        >
          <span
            class="size-2.5 shrink-0 rounded-full"
            :class="getTierColorClass(config.tier)"
          ></span>
          <Icon :name="config.icon" class="size-3.5" />
          <span class="font-mono font-bold">{{ config.label }}</span>
          <span class="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-2xs">
            {{ config.range }} km
          </span>
        </button>
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="text-sm font-semibold">
        Sweep Speed: {{ sweepSpeed[0] ?? 1 }}x
      </h3>
      <Slider v-model="speedValue" :min="0.5" :max="4" :step="0.5" />
    </div>

    <div class="space-y-1.5 rounded-lg border border-border bg-muted/50 p-3">
      <h3
        class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        Stats
      </h3>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span class="text-muted-foreground">Sites</span>
          <p class="font-mono font-bold">{{ stats.totalSites }}</p>
        </div>
        <div>
          <span class="text-muted-foreground">Active Tiers</span>
          <p class="font-mono font-bold">{{ stats.activeTiers }}</p>
        </div>
        <div>
          <span class="text-muted-foreground">Coverage</span>
          <p class="font-mono font-bold">
            {{ stats.coverageAreaKm2.toLocaleString() }} km²
          </p>
        </div>
        <div>
          <span class="text-muted-foreground">Gaps</span>
          <p class="font-mono font-bold">{{ stats.gapCount }}</p>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-muted/50 p-3">
      <p class="text-xs text-muted-foreground">
        Layered air defense radar coverage around Jaisalmer. Toggle altitude
        layers and radar tiers to visualize coverage gaps.
      </p>
    </div>
  </div>
</template>
