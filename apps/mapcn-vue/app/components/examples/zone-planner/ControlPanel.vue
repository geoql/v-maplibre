<script setup lang="ts">
  import type {
    DangerZone,
    DrawMode,
    ZoneType,
  } from '~/types/defense-zone-planner';

  defineProps<{
    zones: DangerZone[];
    drawMode: DrawMode;
    activeZoneType: ZoneType;
  }>();

  const emit = defineEmits<{
    setMode: [mode: DrawMode];
    setZoneType: [type: ZoneType];
    removeZone: [id: string];
    clearAll: [];
  }>();

  const ZONE_TYPE_OPTIONS: {
    value: ZoneType;
    label: string;
    dotClass: string;
  }[] = [
    { value: 'minefield', label: 'Minefield', dotClass: 'bg-red-500' },
    { value: 'restricted', label: 'Restricted', dotClass: 'bg-orange-500' },
    { value: 'hazard', label: 'Hazard', dotClass: 'bg-yellow-500' },
  ];

  const DRAW_MODES: { value: DrawMode; icon: string; label: string }[] = [
    { value: 'polygon', icon: 'lucide:pentagon', label: 'Draw polygon' },
    { value: 'rectangle', icon: 'lucide:square', label: 'Draw rectangle' },
    { value: 'select', icon: 'lucide:mouse-pointer-2', label: 'Select & edit' },
    { value: 'static', icon: 'lucide:eye', label: 'View only' },
  ];

  function dotClassForType(type: ZoneType): string {
    const opt = ZONE_TYPE_OPTIONS.find((o) => o.value === type);
    return opt?.dotClass ?? 'bg-gray-400';
  }
</script>

<template>
  <div class="flex flex-col gap-3 p-4">
    <div class="text-sm font-semibold">Draw Mode</div>
    <div class="flex items-center gap-1">
      <button
        v-for="mode in DRAW_MODES"
        :key="mode.value"
        class="flex size-8 items-center justify-center rounded-md transition-colors"
        :class="
          drawMode === mode.value
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-accent'
        "
        :title="mode.label"
        @click="emit('setMode', mode.value)"
      >
        <Icon :name="mode.icon" class="size-4" />
      </button>
    </div>

    <div class="text-sm font-semibold">Zone Type</div>
    <div class="flex flex-wrap items-center gap-1.5">
      <button
        v-for="opt in ZONE_TYPE_OPTIONS"
        :key="opt.value"
        class="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors"
        :class="
          activeZoneType === opt.value
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-accent'
        "
        @click="emit('setZoneType', opt.value)"
      >
        <span class="size-2 rounded-full" :class="opt.dotClass"></span>
        {{ opt.label }}
      </button>
    </div>

    <Separator />

    <div class="flex items-center justify-between">
      <div class="text-sm font-semibold">Zones ({{ zones.length }})</div>
      <button
        v-if="zones.length > 0"
        class="text-xs text-destructive hover:underline"
        @click="emit('clearAll')"
      >
        Clear all
      </button>
    </div>

    <div v-if="zones.length === 0" class="text-xs text-muted-foreground">
      Draw polygons on the map to add danger zones.
    </div>

    <div class="flex max-h-52 flex-col gap-1.5 overflow-y-auto">
      <div
        v-for="zone in zones"
        :key="zone.id"
        class="flex items-center gap-2 rounded-md border border-border/50 px-2 py-1.5"
      >
        <span
          class="size-2.5 shrink-0 rounded-full"
          :class="dotClassForType(zone.type)"
        ></span>
        <div class="min-w-0 flex-1">
          <div class="truncate text-xs font-medium">{{ zone.label }}</div>
          <div class="text-2xs text-muted-foreground">
            {{ zone.areaKm2.toFixed(1) }} km²
          </div>
        </div>
        <button
          class="flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          @click="emit('removeZone', zone.id)"
        >
          <Icon name="lucide:trash-2" class="size-3" />
        </button>
      </div>
    </div>

    <Separator />

    <div class="text-2xs leading-relaxed text-muted-foreground">
      Draw danger zones (minefields, restricted areas, hazards) on the map. Use
      polygon or rectangle mode to place zones, then switch to select mode to
      edit.
    </div>
  </div>
</template>
