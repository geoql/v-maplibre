<script setup lang="ts">
  import type {
    ArtilleryPosition,
    WeaponType,
    WeaponConfig,
  } from '~/types/defense-artillery';
  import { Slider } from '~/components/ui/slider';

  const props = defineProps<{
    positions: ArtilleryPosition[];
    selectedPositionId: string | null;
    activeWeaponType: WeaponType;
    weaponConfigs: WeaponConfig[];
  }>();

  const emit = defineEmits<{
    selectPosition: [id: string | null];
    setWeaponType: [type: WeaponType];
    updateBearing: [bearing: number];
    removePosition: [id: string];
    clearAll: [];
  }>();

  const selectedPos = computed(
    () =>
      props.positions.find((p) => p.id === props.selectedPositionId) ?? null,
  );

  const activeConfig = computed(
    () =>
      props.weaponConfigs.find((c) => c.type === props.activeWeaponType) ??
      props.weaponConfigs[0]!,
  );

  const bearingValue = computed({
    get: () => [selectedPos.value?.bearing ?? 0],
    set: (val: number[]) => emit('updateBearing', val[0] ?? 0),
  });

  function getWeaponColor(type: WeaponType): string {
    const colors: Record<WeaponType, string> = {
      howitzer: 'bg-orange-500',
      mortar: 'bg-cyan-500',
      mlrs: 'bg-red-500',
    };
    return colors[type];
  }
</script>

<template>
  <div class="space-y-4 p-4">
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Weapon Type</h3>
      <div class="flex gap-1">
        <button
          v-for="config in weaponConfigs"
          :key="config.type"
          class="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors"
          :class="
            activeWeaponType === config.type
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          "
          @click="emit('setWeaponType', config.type)"
        >
          <Icon :name="config.icon" class="size-3.5" />
          {{ config.label }}
        </button>
      </div>
      <p class="text-2xs text-muted-foreground">
        Range: {{ (activeConfig.minRange / 1000).toFixed(1) }}–{{
          (activeConfig.maxRange / 1000).toFixed(0)
        }}
        km
      </p>
    </div>

    <div class="space-y-2">
      <h3 class="text-sm font-semibold">
        Positions
        <span class="text-muted-foreground">({{ positions.length }}/6)</span>
      </h3>
      <div class="space-y-1">
        <button
          v-for="pos in positions"
          :key="pos.id"
          class="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs transition-colors"
          :class="
            selectedPositionId === pos.id
              ? 'bg-primary/15 text-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          "
          @click="emit('selectPosition', pos.id)"
        >
          <span
            class="size-2.5 shrink-0 rounded-full"
            :class="getWeaponColor(pos.weaponType)"
          ></span>
          <span class="font-mono font-bold">{{ pos.label }}</span>
          <span
            class="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-2xs uppercase"
          >
            {{ pos.weaponType }}
          </span>
          <button
            class="ml-1 rounded p-0.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
            @click.stop="emit('removePosition', pos.id)"
          >
            <Icon name="lucide:x" class="size-3" />
          </button>
        </button>
      </div>
    </div>

    <div v-if="selectedPos" class="space-y-2">
      <h3 class="text-sm font-semibold">Bearing: {{ selectedPos.bearing }}°</h3>
      <Slider v-model="bearingValue" :min="0" :max="360" :step="1" />
    </div>

    <div class="flex gap-2">
      <button
        v-if="positions.length > 0"
        class="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
        @click="emit('clearAll')"
      >
        <Icon name="lucide:trash-2" class="size-3.5" />
        Clear All
      </button>
    </div>

    <div class="rounded-lg border border-border bg-muted/50 p-3">
      <p class="text-xs text-muted-foreground">
        Click on the map to place artillery positions (max 6). Select a position
        to adjust its bearing.
      </p>
    </div>
  </div>
</template>
