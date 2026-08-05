<script setup lang="ts">
  import type {
    SpectralBand,
    SpectralPair,
    Orientation,
  } from '~/types/defense-spectral';

  const props = defineProps<{
    pairs: SpectralPair[];
    selectedPair: SpectralPair;
    orientation: Orientation;
  }>();

  const emit = defineEmits<{
    'update:selectedPair': [pair: SpectralPair];
    'update:orientation': [orientation: Orientation];
  }>();

  const BAND_LABELS: Record<SpectralBand, string> = {
    visual: 'Optical/Visual',
    thermal: 'Thermal/IR',
    nightvision: 'Night Vision',
  };

  const BAND_ICONS: Record<SpectralBand, string> = {
    visual: 'lucide:sun',
    thermal: 'lucide:flame',
    nightvision: 'lucide:moon',
  };

  const TOGGLE_ACTIVE = 'border-primary bg-primary text-primary-foreground';
  const TOGGLE_IDLE = 'border-border bg-background hover:bg-muted';

  const ORIENTATIONS = ['vertical', 'horizontal'] as const;

  function getPairClass(pair: SpectralPair): string {
    return props.selectedPair.id === pair.id ? TOGGLE_ACTIVE : TOGGLE_IDLE;
  }

  function getOrientationClass(opt: Orientation): string {
    return props.orientation === opt ? TOGGLE_ACTIVE : TOGGLE_IDLE;
  }
</script>

<template>
  <div class="space-y-5">
    <!-- Band pair selector -->
    <div>
      <h4
        class="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        Spectral Pair
      </h4>
      <div class="flex flex-col gap-1.5">
        <button
          v-for="pair in pairs"
          :key="pair.id"
          class="rounded-md border px-3 py-2 text-left text-sm transition-colors"
          :class="getPairClass(pair)"
          @click="emit('update:selectedPair', pair)"
        >
          {{ pair.label }}
        </button>
      </div>
    </div>

    <!-- Orientation toggle -->
    <div>
      <h4
        class="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        Orientation
      </h4>
      <div class="flex gap-2">
        <button
          v-for="opt in ORIENTATIONS"
          :key="opt"
          class="rounded-md border px-3 py-1.5 text-sm transition-colors"
          :class="getOrientationClass(opt)"
          @click="emit('update:orientation', opt)"
        >
          <Icon
            :name="
              opt === 'vertical'
                ? 'lucide:split-square-horizontal'
                : 'lucide:split-square-vertical'
            "
            class="mr-1 inline-block size-3.5"
          />
          {{ opt.charAt(0).toUpperCase() + opt.slice(1) }}
        </button>
      </div>
    </div>

    <!-- Active bands legend -->
    <div class="rounded-lg border border-border/50 bg-muted/30 p-3">
      <div class="mb-2 flex items-center gap-2 text-xs font-medium">
        <Icon name="lucide:info" class="size-3.5 text-muted-foreground" />
        Active Bands
      </div>
      <div class="space-y-1.5 text-xs text-muted-foreground">
        <div class="flex items-center gap-2">
          <Icon :name="BAND_ICONS[selectedPair.before]" class="size-3.5" />
          <span>Before: {{ BAND_LABELS[selectedPair.before] }}</span>
        </div>
        <div class="flex items-center gap-2">
          <Icon :name="BAND_ICONS[selectedPair.after]" class="size-3.5" />
          <span>After: {{ BAND_LABELS[selectedPair.after] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
