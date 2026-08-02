<script setup lang="ts">
  import type { ConvoyUnit, CargoType } from '~/types/defense-convoy';

  const props = defineProps<{
    convoys: ConvoyUnit[];
    isPlaying: boolean;
    speed: number;
    selectedConvoyId: string | null;
  }>();

  const emit = defineEmits<{
    play: [];
    pause: [];
    reset: [];
    setSpeed: [speed: number];
    selectConvoy: [convoyId: string];
  }>();

  const speedOptions = [0.5, 1, 2, 4];

  const CARGO_ICONS: Record<CargoType, string> = {
    ammo: 'lucide:package',
    fuel: 'lucide:fuel',
    medical: 'lucide:heart-pulse',
  };

  function getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'en-route':
        return 'bg-emerald-500/15 text-emerald-400';
      case 'arrived':
        return 'bg-blue-500/15 text-blue-400';
      case 'delayed':
        return 'bg-orange-500/15 text-orange-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  }

  // Stable per-convoy style objects so the v-for does not allocate on re-render
  const convoyRows = computed(() =>
    props.convoys.map((convoy) => ({
      ...convoy,
      dotStyle: { backgroundColor: `rgb(${convoy.color.join(',')})` },
    })),
  );
</script>

<template>
  <div class="space-y-4 p-4">
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Convoys</h3>
      <div class="space-y-1">
        <button
          v-for="convoy in convoyRows"
          :key="convoy.id"
          class="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs transition-colors"
          :class="
            selectedConvoyId === convoy.id
              ? 'bg-primary/15 text-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          "
          @click="emit('selectConvoy', convoy.id)"
        >
          <span
            class="size-2.5 shrink-0 rounded-full"
            :style="convoy.dotStyle"
          ></span>
          <Icon
            :name="CARGO_ICONS[convoy.cargoType]"
            class="size-3.5 shrink-0"
          />
          <span class="font-mono font-bold">{{ convoy.callsign }}</span>
          <span
            class="ml-auto rounded-full px-1.5 py-0.5 text-2xs uppercase"
            :class="getStatusBadgeClass(convoy.status)"
          >
            {{ convoy.status }}
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
        <strong>Convoy Tracker:</strong> 3 military supply convoys across the
        Jodhpur–Jaisalmer–Barmer corridor. Click a convoy to track.
      </p>
    </div>
  </div>
</template>
