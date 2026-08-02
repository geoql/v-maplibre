<script setup lang="ts">
  import type {
    BattlefieldUnit,
    MilitaryUnitType,
    MissionPhaseInfo,
  } from '~/types/defense-terrain';

  const props = defineProps<{
    isPlaying: boolean;
    speed: number;
    progress: number;
    missionPhases: MissionPhaseInfo[];
    currentPhase: MissionPhaseInfo;
    units: BattlefieldUnit[];
    activeUnitTypes: Set<MilitaryUnitType>;
  }>();

  // Stable per-unit style objects so the v-for does not allocate on re-render
  const unitRows = computed(() =>
    props.units.map((unit) => ({
      ...unit,
      dotStyle: { backgroundColor: `rgb(${unit.color.join(',')})` },
    })),
  );

  const emit = defineEmits<{
    play: [];
    pause: [];
    reset: [];
    setSpeed: [speed: number];
    seek: [pct: number];
    toggleUnit: [type: MilitaryUnitType];
  }>();

  const speedOptions = [0.5, 1, 2, 4];

  const unitTypeLabels: Record<MilitaryUnitType, string> = {
    infantry: 'Infantry',
    armor: 'Armor',
    patrol: 'Patrol',
    recon: 'Recon',
  };

  const unitTypeIcons: Record<MilitaryUnitType, string> = {
    infantry: 'lucide:footprints',
    armor: 'lucide:shield',
    patrol: 'lucide:scan-eye',
    recon: 'lucide:radar',
  };

  function handleSeek(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const pct = ((event.clientX - rect.left) / rect.width) * 100;
    emit('seek', pct);
  }
</script>

<template>
  <div class="space-y-4 p-4">
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Mission Phase</h3>
      <div class="flex gap-1">
        <div
          v-for="phase in missionPhases"
          :key="phase.phase"
          :title="phase.label"
          class="flex-1 truncate rounded-md px-1.5 py-1 text-center text-2xs font-medium transition-colors"
          :class="
            currentPhase.phase === phase.phase
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          "
        >
          {{ phase.label }}
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Timeline</h3>
      <div
        class="h-2 w-full cursor-pointer overflow-hidden rounded-full bg-muted"
        @click="handleSeek"
      >
        <div
          class="h-full rounded-full bg-primary transition-all"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
      <p class="text-right text-xs text-muted-foreground">
        {{ Math.round(progress) }}%
      </p>
    </div>

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

    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Unit Filters</h3>
      <div class="space-y-1">
        <button
          v-for="unitType in [
            'infantry',
            'armor',
            'patrol',
            'recon',
          ] as MilitaryUnitType[]"
          :key="unitType"
          class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-accent"
          :class="
            activeUnitTypes.has(unitType)
              ? 'text-foreground'
              : 'text-muted-foreground opacity-50'
          "
          @click="emit('toggleUnit', unitType)"
        >
          <Icon :name="unitTypeIcons[unitType]" class="size-3.5" />
          <span class="font-medium">{{ unitTypeLabels[unitType] }}</span>
          <div
            class="ml-auto size-3 rounded-sm border"
            :class="
              activeUnitTypes.has(unitType)
                ? 'border-primary bg-primary'
                : 'border-border'
            "
          ></div>
        </button>
      </div>
    </div>

    <div class="space-y-1.5">
      <h3 class="text-sm font-semibold">Active Units</h3>
      <div
        v-for="unit in unitRows"
        :key="unit.id"
        class="flex items-center gap-2 text-xs text-muted-foreground"
      >
        <div class="size-2 rounded-full" :style="unit.dotStyle"></div>
        <span class="font-medium">{{ unit.callsign }}</span>
        <span class="ml-auto">{{ unit.strength }} pax</span>
      </div>
    </div>
  </div>
</template>
