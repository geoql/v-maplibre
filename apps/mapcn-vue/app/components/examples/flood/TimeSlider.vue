<script setup lang="ts">
  import { Slider } from '~/components/ui/slider';

  const props = defineProps<{
    modelValue: number[];
    min: number;
    max: number;
    loading: boolean;
    yearCounts: number[];
  }>();

  const emit = defineEmits<{
    'update:modelValue': [value: number[]];
  }>();

  const TICK_BASE_MS = 500;
  const SPEED_OPTIONS = [0.5, 1, 2, 4];
  const MIN_SPAN = 2;
  const MAX_SPAN = 5;

  const isPlaying = ref(false);
  const playbackSpeed = ref(1);
  const sliderRef = ref<HTMLElement | null>(null);
  let timerId: ReturnType<typeof setInterval> | null = null;

  const rangeLabel = computed(() => {
    const [start, end] = props.modelValue;
    if (start === end) return `${start}`;
    return `${start} – ${end}`;
  });

  const isFiltered = computed(
    () =>
      props.modelValue[0] !== props.min || props.modelValue[1] !== props.max,
  );

  const playbackProgress = computed(() => {
    const range = props.max - props.min;
    if (range === 0) return 100;
    return Math.round(((props.modelValue[1] - props.min) / range) * 100);
  });

  // Bar chart computeds
  const maxCount = computed(() => {
    if (props.yearCounts.length === 0) return 1;
    return Math.max(...props.yearCounts, 1);
  });

  const bars = computed(() => {
    const counts = props.yearCounts;
    if (counts.length === 0) return [];
    const n = counts.length;
    const peak = maxCount.value;
    const barWidth = 100 / n;
    const gap = barWidth * 0.12;
    return counts.map((count, i) => {
      const year = props.min + i;
      return {
        year,
        x: i * barWidth + gap / 2,
        width: barWidth - gap,
        y: 100 - (count / peak) * 100,
        height: (count / peak) * 100,
        selected: year >= props.modelValue[0] && year <= props.modelValue[1],
      };
    });
  });

  // Playback controls
  function clearTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function startPlayback() {
    isPlaying.value = true;
    const [start, end] = props.modelValue;
    if (end >= props.max) {
      const span = end - start;
      emit('update:modelValue', [props.min, props.min + span]);
    }
    clearTimer();
    timerId = setInterval(() => {
      const [s, e] = props.modelValue;
      if (e >= props.max) {
        stopPlayback();
        return;
      }
      emit('update:modelValue', [s + 1, e + 1]);
    }, TICK_BASE_MS / playbackSpeed.value);
  }

  function stopPlayback() {
    isPlaying.value = false;
    clearTimer();
  }

  function togglePlay() {
    if (isPlaying.value) {
      stopPlayback();
    } else {
      startPlayback();
    }
  }

  function resetPlayback() {
    stopPlayback();
    const defaultEnd = Math.min(new Date().getFullYear(), props.max);
    const defaultStart = Math.max(defaultEnd - MIN_SPAN, props.min);
    emit('update:modelValue', [defaultStart, defaultEnd]);
  }

  function setSpeed(speed: number) {
    playbackSpeed.value = speed;
    if (isPlaying.value) {
      clearTimer();
      startPlayback();
    }
  }

  function handleSliderUpdate(value: number[]) {
    if (isPlaying.value) stopPlayback();

    let [newStart, newEnd] = value;
    const span = newEnd - newStart;

    if (span > MAX_SPAN) {
      const [oldStart] = props.modelValue;
      if (newStart !== oldStart) {
        newEnd = Math.min(newStart + MAX_SPAN, props.max);
      } else {
        newStart = Math.max(newEnd - MAX_SPAN, props.min);
      }
    }

    emit('update:modelValue', [newStart, newEnd]);
  }

  // Brush drag: grab the range bar and slide the entire window
  function setupBrushDrag() {
    if (!sliderRef.value) return;
    const rangeEl = sliderRef.value.querySelector<HTMLElement>(
      '[data-slot="slider-range"]',
    );
    const trackEl = sliderRef.value.querySelector<HTMLElement>(
      '[data-slot="slider-track"]',
    );
    if (!rangeEl || !trackEl) return;

    let startX = 0;
    let startValues: [number, number] = [0, 0];

    function onPointerDown(e: PointerEvent) {
      e.stopPropagation();
      if (isPlaying.value) stopPlayback();
      startX = e.clientX;
      startValues = [props.modelValue[0], props.modelValue[1]];
      rangeEl!.setPointerCapture(e.pointerId);
      rangeEl!.addEventListener('pointermove', onPointerMove);
      rangeEl!.addEventListener('pointerup', onPointerUp);
    }

    function onPointerMove(e: PointerEvent) {
      const trackWidth = trackEl!.getBoundingClientRect().width;
      if (trackWidth === 0) return;
      const deltaX = e.clientX - startX;
      const totalRange = props.max - props.min;
      const deltaYears = Math.round((deltaX / trackWidth) * totalRange);
      if (deltaYears === 0) return;

      const span = startValues[1] - startValues[0];
      let newStart = startValues[0] + deltaYears;
      let newEnd = newStart + span;

      if (newStart < props.min) {
        newStart = props.min;
        newEnd = newStart + span;
      }
      if (newEnd > props.max) {
        newEnd = props.max;
        newStart = newEnd - span;
      }

      emit('update:modelValue', [newStart, newEnd]);
    }

    function onPointerUp(e: PointerEvent) {
      rangeEl!.releasePointerCapture(e.pointerId);
      rangeEl!.removeEventListener('pointermove', onPointerMove);
      rangeEl!.removeEventListener('pointerup', onPointerUp);
    }

    rangeEl.addEventListener('pointerdown', onPointerDown);

    return () => {
      rangeEl.removeEventListener('pointerdown', onPointerDown);
    };
  }

  let cleanupDrag: (() => void) | undefined;

  onMounted(() => {
    nextTick(() => {
      cleanupDrag = setupBrushDrag();
    });
  });

  onBeforeUnmount(() => {
    clearTimer();
    cleanupDrag?.();
  });
</script>

<template>
  <div
    class="rounded-lg border border-border bg-card/90 px-4 py-3 backdrop-blur-sm"
  >
    <!-- Header -->
    <div class="mb-2.5 flex items-center justify-between text-xs">
      <span class="font-mono text-foreground">{{ rangeLabel }}</span>
      <div class="flex items-center gap-2">
        <span v-if="loading" class="text-muted-foreground">Loading...</span>
        <template v-else-if="isPlaying">
          <span class="text-primary">Playing</span>
          <span class="font-mono text-muted-foreground"
            >{{ playbackProgress }}%</span
          >
        </template>
        <span v-else-if="isFiltered" class="text-primary">Filtered</span>
        <Icon
          name="lucide:calendar-range"
          class="size-3.5 text-muted-foreground"
        />
      </div>
    </div>

    <!-- Bar chart + Slider overlay -->
    <div ref="sliderRef" class="relative">
      <!-- SVG bar chart -->
      <svg
        v-if="yearCounts.length > 0"
        class="pointer-events-none h-10 w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <rect
          v-for="bar in bars"
          :key="bar.year"
          :x="bar.x"
          :y="bar.y"
          :width="bar.width"
          :height="bar.height"
          :class="bar.selected ? 'fill-primary/40' : 'fill-muted-foreground/20'"
        />
      </svg>
      <div v-else class="h-10"></div>

      <!-- Slider positioned over chart -->
      <div class="absolute inset-x-0 top-1/2 -translate-y-1/2">
        <Slider
          :model-value="modelValue"
          :min="min"
          :max="max"
          :step="1"
          :min-steps-between-thumbs="MIN_SPAN"
          class="flood-slider"
          @update:model-value="handleSliderUpdate"
        />
      </div>
    </div>

    <!-- Playback controls -->
    <div class="mt-2.5 flex items-center gap-2">
      <button
        title="Reset"
        class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        @click="resetPlayback"
      >
        <Icon name="lucide:rotate-ccw" class="size-3.5" />
      </button>
      <button
        :title="isPlaying ? 'Pause' : 'Play'"
        class="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/80"
        @click="togglePlay"
      >
        <Icon
          :name="isPlaying ? 'lucide:pause' : 'lucide:play'"
          class="size-3.5"
        />
      </button>
      <div class="flex gap-0.5">
        <button
          v-for="s in SPEED_OPTIONS"
          :key="s"
          class="rounded px-1.5 py-0.5 text-2xs font-medium transition-colors"
          :class="
            playbackSpeed === s
              ? 'bg-primary/20 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          "
          @click="setSpeed(s)"
        >
          {{ s }}x
        </button>
      </div>
    </div>

    <!-- Year range labels -->
    <div class="mt-1.5 flex justify-between text-2xs text-muted-foreground">
      <span>{{ min }}</span>
      <span>{{ max }}</span>
    </div>
  </div>
</template>

<style scoped>
  .flood-slider :deep([data-slot='slider-track']) {
    background: transparent !important;
    height: 6px;
    cursor: crosshair;
  }

  .flood-slider :deep([data-slot='slider-range']) {
    background: transparent !important;
    cursor: grab;
  }

  .flood-slider :deep([data-slot='slider-range']):active {
    cursor: grabbing;
  }

  .flood-slider :deep([data-slot='slider-thumb']) {
    width: 8px !important;
    height: 28px !important;
    border-radius: 4px !important;
    border: 2px solid var(--color-primary) !important;
    background: var(--color-background) !important;
    box-shadow: 0 1px 4px rgb(0 0 0 / 0.15);
    cursor: ew-resize;
  }

  .flood-slider :deep([data-slot='slider-thumb']:hover) {
    background: var(--color-primary) !important;
    box-shadow: 0 0 0 3px
      color-mix(in oklch, var(--color-primary) 25%, transparent);
  }
</style>
