<script setup lang="ts">
  import type { GrrrBasin, GrrrDailyValue } from '~/types/grrr';

  const props = defineProps<{
    basin: GrrrBasin;
    year: number;
    values: GrrrDailyValue[];
  }>();

  const WIDTH = 280;
  const HEIGHT = 90;
  const MONTH_LABELS = [
    'J',
    'F',
    'M',
    'A',
    'M',
    'J',
    'J',
    'A',
    'S',
    'O',
    'N',
    'D',
  ];
  const MONTHS = MONTH_LABELS.map((label, i) => ({
    key: i,
    label,
    x: (i / 12) * WIDTH + 2,
  }));

  const yMax = computed(
    () =>
      Math.max(props.basin.rp20, ...props.values.map((v) => v.value)) * 1.05,
  );

  function y(value: number): number {
    return HEIGHT - (value / yMax.value) * HEIGHT;
  }

  function x(day: number): number {
    return (day / 365) * WIDTH;
  }

  const linePoints = computed(() =>
    props.values
      .map((v) => `${x(v.day).toFixed(1)},${y(v.value).toFixed(1)}`)
      .join(' '),
  );

  const areaPoints = computed(() => {
    const first = props.values[0];
    const last = props.values.at(-1);
    if (!first || !last) return '';
    return `${x(first.day)},${HEIGHT} ${linePoints.value} ${x(last.day)},${HEIGHT}`;
  });

  const levels = computed(() => [
    { key: 'rp2', label: '2-yr', y: y(props.basin.rp2) },
    { key: 'rp20', label: '20-yr', y: y(props.basin.rp20) },
  ]);
</script>

<template>
  <div class="px-3 py-2.5">
    <p
      class="mb-2 font-mono text-2xs font-medium uppercase tracking-caps text-muted-foreground"
    >
      Daily flow · {{ year }}
    </p>
    <svg
      :viewBox="`-2 0 ${WIDTH + 6} ${HEIGHT + 12}`"
      class="w-full overflow-visible"
      role="img"
      :aria-label="`Daily flow in ${year}, with 2 and 20-year flood levels`"
    >
      <polygon :points="areaPoints" class="fill-primary/15" />
      <polyline
        :points="linePoints"
        fill="none"
        class="stroke-primary"
        stroke-width="1.25"
        stroke-linejoin="round"
      />
      <ExamplesGrrrLevelLine
        v-for="level in levels"
        :key="level.key"
        :y="level.y"
        :width="WIDTH"
        :label="level.label"
      />
      <text
        v-for="month in MONTHS"
        :key="month.key"
        :x="month.x"
        :y="HEIGHT + 10"
        class="fill-muted-foreground font-mono text-4xs"
      >
        {{ month.label }}
      </text>
    </svg>
  </div>
</template>
