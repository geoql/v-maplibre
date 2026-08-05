<script setup lang="ts">
  import type { C2Unit } from '~/types/defense-drone-c2';

  const props = defineProps<{
    units: C2Unit[];
    isPlaying: boolean;
    speed: number;
    selectedUnitId: string | null;
  }>();

  const emit = defineEmits<{
    play: [];
    pause: [];
    reset: [];
    setSpeed: [speed: number];
    selectUnit: [unitId: string];
  }>();

  const speedOptions = [0.5, 1, 2, 4];

  function getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-emerald-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'rtb':
        return 'bg-orange-500';
      case 'alert':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }

  // Stable per-unit style objects so the v-for does not allocate on re-render
  const unitRows = computed(() =>
    props.units.map((unit) => ({
      ...unit,
      dotStyle: { backgroundColor: `rgb(${unit.color.join(',')})` },
    })),
  );
</script>

<template>
  <div class="space-y-4 p-4">
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Units</h3>
      <div class="space-y-1">
        <button
          v-for="unit in unitRows"
          :key="unit.id"
          class="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs transition-colors"
          :class="
            selectedUnitId === unit.id
              ? 'bg-primary/15 text-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          "
          @click="emit('selectUnit', unit.id)"
        >
          <span
            class="size-2.5 shrink-0 rounded-full"
            :class="getStatusColor(unit.status)"
          ></span>
          <span
            class="size-2 shrink-0 rounded-sm"
            :style="unit.dotStyle"
          ></span>
          <span class="font-mono font-bold">{{ unit.callsign }}</span>
          <span
            class="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-2xs uppercase"
          >
            {{ unit.type }}
          </span>
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

    <div class="rounded-lg border border-border bg-muted/50 p-3">
      <p class="text-xs text-muted-foreground">
        <strong>Multi-Drone C2:</strong> 4 UAVs + 2 UGVs patrolling the Thar
        Desert, Rajasthan. Click a unit to track it.
      </p>
    </div>
  </div>
</template>
