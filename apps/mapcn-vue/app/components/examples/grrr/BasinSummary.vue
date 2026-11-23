<script setup lang="ts">
  import type {
    GrrrAnnualPeak,
    GrrrBasin,
    GrrrReturnPeriod,
  } from '~/types/grrr';

  const props = defineProps<{
    basin: GrrrBasin;
    record: GrrrAnnualPeak | null;
  }>();

  const PERIOD_LABELS: Record<GrrrReturnPeriod, string> = {
    rp2: '2-yr',
    rp5: '5-yr',
    rp20: '20-yr',
    rp100: '100-yr',
  };

  const periods = computed(() =>
    (Object.keys(PERIOD_LABELS) as GrrrReturnPeriod[]).map((key) => ({
      key,
      label: PERIOD_LABELS[key],
      value: props.basin[key].toLocaleString('en-US'),
    })),
  );

  const recordLabel = computed(() =>
    props.record?.reached
      ? `${props.record.year} · above the ${PERIOD_LABELS[props.record.reached]} flood`
      : props.record
        ? `${props.record.year}`
        : '',
  );
</script>

<template>
  <div class="space-y-3 px-3 py-2.5">
    <div>
      <p class="font-mono text-2xs text-muted-foreground">
        subhybas_{{ basin.id }}
      </p>
      <p class="font-mono text-2xs tabular-nums text-muted-foreground/70">
        {{ formatGrrrPosition(basin.position) }}
      </p>
    </div>

    <div>
      <p
        class="font-mono text-2xs font-medium uppercase tracking-caps text-muted-foreground"
      >
        Record daily flow 1981–2025
      </p>
      <p
        v-if="record"
        class="text-3xl font-extrabold tabular-nums tracking-tight text-foreground"
      >
        {{ Math.round(record.peak).toLocaleString('en-US') }}
        <span class="text-sm font-medium text-muted-foreground">m³/s</span>
      </p>
      <div v-else class="mt-1 h-8 w-32 animate-pulse rounded bg-muted" />
      <p class="text-xs text-muted-foreground">{{ recordLabel }}</p>
    </div>

    <dl class="grid grid-cols-4 gap-1 border-t border-border pt-2">
      <div v-for="period in periods" :key="period.key">
        <dt class="text-2xs text-muted-foreground">{{ period.label }}</dt>
        <dd class="font-mono text-xs tabular-nums text-foreground">
          {{ period.value }}
        </dd>
      </div>
    </dl>
  </div>
</template>
