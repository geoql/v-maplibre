<script setup lang="ts">
  import type { GrrrAnnualPeak, GrrrBasin } from '~/types/grrr';

  const props = defineProps<{
    basin: GrrrBasin;
    peaks: GrrrAnnualPeak[];
  }>();

  const year = defineModel<number | null>('year', { required: true });

  const WIDTH = 280;
  const HEIGHT = 110;

  const yMax = computed(
    () => Math.max(props.basin.rp100, ...props.peaks.map((p) => p.peak)) * 1.05,
  );

  function y(value: number): number {
    return HEIGHT - (value / yMax.value) * HEIGHT;
  }

  const FILL: Record<string, string> = {
    rp100: 'fill-destructive',
    rp20: 'fill-destructive',
    rp5: 'fill-warning',
    rp2: 'fill-primary',
  };

  const bars = computed(() => {
    const step = WIDTH / Math.max(props.peaks.length, 1);
    return props.peaks.map((p, i) => ({
      year: p.year,
      x: i * step + step * 0.15,
      width: step * 0.7,
      y: y(p.peak),
      height: HEIGHT - y(p.peak),
      classes: [
        p.reached ? FILL[p.reached] : 'fill-muted-foreground/40',
        p.year === year.value ? 'stroke-foreground' : '',
      ],
      title: `${p.year}: ${Math.round(p.peak).toLocaleString('en-US')} m³/s`,
    }));
  });

  const lines = computed(() =>
    (['rp2', 'rp20', 'rp100'] as const).map((key) => ({
      key,
      label: key.replace('rp', '') + '-yr',
      y: y(props.basin[key]),
    })),
  );

  function selectYear(value: number): void {
    year.value = value;
  }
</script>

<template>
  <div class="px-3 py-2.5">
    <p
      class="mb-2 font-mono text-2xs font-medium uppercase tracking-caps text-muted-foreground"
    >
      Annual peaks · click a year
    </p>
    <svg
      :viewBox="`-2 0 ${WIDTH + 6} ${HEIGHT + 12}`"
      class="w-full overflow-visible"
      role="img"
      aria-label="Highest daily flow per year, with 2, 20 and 100-year flood levels"
    >
      <ExamplesGrrrLevelLine
        v-for="line in lines"
        :key="line.key"
        :y="line.y"
        :width="WIDTH"
        :label="line.label"
      />
      <rect
        v-for="bar in bars"
        :key="bar.year"
        :x="bar.x"
        :y="bar.y"
        :width="bar.width"
        :height="bar.height"
        :class="bar.classes"
        stroke-width="1"
        class="cursor-pointer transition-opacity hover:opacity-80"
        @click="selectYear(bar.year)"
      >
        <title>{{ bar.title }}</title>
      </rect>
      <text :y="HEIGHT + 10" class="fill-muted-foreground font-mono text-4xs">
        {{ peaks[0]?.year }}
      </text>
      <text
        :x="WIDTH"
        :y="HEIGHT + 10"
        text-anchor="end"
        class="fill-muted-foreground font-mono text-4xs"
      >
        {{ peaks.at(-1)?.year }}
      </text>
    </svg>
  </div>
</template>
