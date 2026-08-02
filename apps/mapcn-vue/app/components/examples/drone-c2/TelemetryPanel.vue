<script setup lang="ts">
  import type { C2Unit, C2UnitTelemetry } from '~/types/defense-drone-c2';

  defineProps<{
    unit: C2Unit;
    telemetry: C2UnitTelemetry;
  }>();
</script>

<template>
  <div
    class="flex items-center gap-3 rounded-lg border border-border/50 bg-background/90 px-3 py-2 text-xs backdrop-blur-sm"
  >
    <div class="flex items-center gap-1.5 font-mono font-bold">
      <span
        class="size-2 rounded-full"
        :style="{ backgroundColor: `rgb(${unit.color.join(',')})` }"
      ></span>
      {{ unit.callsign }}
    </div>
    <div class="h-3 w-px bg-border"></div>
    <div
      v-if="unit.type === 'drone'"
      class="flex items-center gap-1 text-muted-foreground"
    >
      <Icon name="lucide:mountain" class="size-3.5" />
      <span>{{ telemetry.altitude }}m</span>
    </div>
    <div v-if="unit.type === 'drone'" class="h-3 w-px bg-border"></div>
    <div class="flex items-center gap-1 text-muted-foreground">
      <Icon name="lucide:gauge" class="size-3.5" />
      <span>{{ telemetry.speed }} km/h</span>
    </div>
    <div class="h-3 w-px bg-border"></div>
    <div class="flex items-center gap-1 text-muted-foreground">
      <Icon name="lucide:battery" class="size-3.5" />
      <span>{{ telemetry.battery }}%</span>
    </div>
    <div class="h-3 w-px bg-border"></div>
    <div class="flex items-center gap-1 text-muted-foreground">
      <Icon name="lucide:compass" class="size-3.5" />
      <span>{{ telemetry.heading }}&deg;</span>
    </div>
    <div class="h-3 w-px bg-border"></div>
    <span
      class="rounded-full bg-muted px-1.5 py-0.5 text-2xs uppercase text-muted-foreground"
    >
      {{ unit.status }}
    </span>
  </div>
</template>
