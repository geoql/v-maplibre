<script setup lang="ts">
  import type {
    SensorType,
    SensorNetworkStats,
    SensorTypeConfig,
  } from '~/types/defense-sensor';
  import { Slider } from '~/components/ui/slider';
  import { Label } from '~/components/ui/label';

  defineProps<{
    activeSensorTypes: Set<SensorType>;
    stats: SensorNetworkStats;
    sensorTypes: SensorTypeConfig[];
  }>();

  const radiusMultiplier = defineModel<number[]>('radiusMultiplier', {
    required: true,
  });

  const emit = defineEmits<{
    toggleType: [type: SensorType];
  }>();

  function rgbaToHex(c: [number, number, number, number]): string {
    return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  }
</script>

<template>
  <div class="space-y-4 p-4">
    <div class="rounded-lg border border-border bg-card p-3">
      <h3 class="mb-3 text-sm font-semibold">Sensor Types</h3>
      <div class="space-y-2">
        <button
          v-for="st in sensorTypes"
          :key="st.type"
          class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
          :class="{
            'opacity-40': !activeSensorTypes.has(st.type),
          }"
          @click="emit('toggleType', st.type)"
        >
          <span
            class="size-2.5 rounded-full"
            :style="{ backgroundColor: rgbaToHex(st.color) }"
          />
          <Icon :name="st.icon" class="size-4" />
          <span class="flex-1 text-left">{{ st.label }}</span>
          <Icon
            :name="
              activeSensorTypes.has(st.type) ? 'lucide:eye' : 'lucide:eye-off'
            "
            class="size-3.5 text-muted-foreground"
          />
        </button>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-card p-3">
      <div class="mb-2 flex items-center justify-between">
        <Label class="text-sm">Detection Range</Label>
        <span class="text-xs text-muted-foreground"
          >{{ radiusMultiplier[0]?.toFixed(1) }}x</span
        >
      </div>
      <Slider
        v-model="radiusMultiplier"
        :min="0.5"
        :max="2"
        :step="0.1"
        :disabled="stats.totalSensors === 0"
      />
    </div>

    <div class="rounded-lg border border-border bg-card p-3">
      <h3 class="mb-2 text-sm font-semibold">Network Status</h3>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="rounded bg-muted/50 p-2 text-center">
          <div class="text-lg font-bold text-foreground">
            {{ stats.totalSensors }}
          </div>
          <div class="text-muted-foreground">Total</div>
        </div>
        <div class="rounded bg-muted/50 p-2 text-center">
          <div class="text-lg font-bold text-success">
            {{ stats.activeSensors }}
          </div>
          <div class="text-muted-foreground">Active</div>
        </div>
        <div class="rounded bg-muted/50 p-2 text-center">
          <div class="text-lg font-bold text-warning">
            {{ stats.alertCount }}
          </div>
          <div class="text-muted-foreground">Threats</div>
        </div>
        <div class="rounded bg-muted/50 p-2 text-center">
          <div class="text-lg font-bold text-primary">
            {{ stats.coveragePercent }}%
          </div>
          <div class="text-muted-foreground">Coverage</div>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-muted/50 p-3">
      <p class="text-xs text-muted-foreground">
        <strong>Demo:</strong> Distributed sensor network with pulsating
        detection radii, simulated threat events, and EW coverage along
        Arunachal Pradesh border region.
      </p>
    </div>
  </div>
</template>
