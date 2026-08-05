<script setup lang="ts">
  import type { ConvoyDetails, CargoType } from '~/types/defense-convoy';

  defineProps<{
    details: ConvoyDetails;
  }>();

  const CARGO_ICONS: Record<CargoType, string> = {
    ammo: 'lucide:package',
    fuel: 'lucide:fuel',
    medical: 'lucide:heart-pulse',
  };

  const CARGO_LABELS: Record<CargoType, string> = {
    ammo: 'Ammunition',
    fuel: 'Fuel Tankers',
    medical: 'Medical Supplies',
  };
</script>

<template>
  <div
    class="flex items-center gap-3 whitespace-nowrap rounded-lg border border-border/50 bg-background/90 px-3 py-2 text-xs backdrop-blur-sm"
  >
    <div class="flex items-center gap-1.5 font-mono font-bold">
      <span
        class="size-2 rounded-full"
        :style="{ backgroundColor: `rgb(${details.unit.color.join(',')})` }"
      ></span>
      {{ details.unit.callsign }}
    </div>
    <div class="h-3 w-px bg-border"></div>
    <div class="flex items-center gap-1 text-muted-foreground">
      <Icon :name="CARGO_ICONS[details.unit.cargoType]" class="size-3.5" />
      <span>{{ CARGO_LABELS[details.unit.cargoType] }}</span>
    </div>
    <div class="h-3 w-px bg-border"></div>
    <div class="flex items-center gap-1 text-muted-foreground">
      <Icon name="lucide:truck" class="size-3.5" />
      <span>{{ details.unit.vehicleCount }} vehicles</span>
    </div>
    <div class="h-3 w-px bg-border"></div>
    <div class="flex items-center gap-1 text-muted-foreground">
      <Icon name="lucide:clock" class="size-3.5" />
      <span>ETA {{ details.eta }}</span>
    </div>
    <div class="h-3 w-px bg-border"></div>
    <div class="flex items-center gap-1 text-muted-foreground">
      <Icon name="lucide:map-pin" class="size-3.5" />
      <span>{{ details.nextCheckpoint }}</span>
    </div>
    <div class="h-3 w-px bg-border"></div>
    <div class="flex items-center gap-1 text-muted-foreground">
      <Icon name="lucide:navigation" class="size-3.5" />
      <span>{{ details.distanceRemaining }} km</span>
    </div>
    <div class="h-3 w-px bg-border"></div>
    <span
      class="rounded-full bg-muted px-1.5 py-0.5 text-2xs uppercase text-muted-foreground"
    >
      {{ details.progress }}%
    </span>
  </div>
</template>
