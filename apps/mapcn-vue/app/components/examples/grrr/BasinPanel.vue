<script setup lang="ts">
  import type { GrrrAnnualPeak, GrrrBasin, GrrrDailyValue } from '~/types/grrr';

  defineProps<{
    basin: GrrrBasin | null;
    record: GrrrAnnualPeak | null;
    peaks: GrrrAnnualPeak[];
    yearValues: GrrrDailyValue[];
    loading: boolean;
    error: string | null;
  }>();

  const year = defineModel<number | null>('year', { required: true });
</script>

<template>
  <div v-if="!basin" class="space-y-2 px-3 py-2.5">
    <div class="h-4 w-1/2 animate-pulse rounded bg-muted" />
    <div class="h-8 w-2/3 animate-pulse rounded bg-muted" />
  </div>
  <template v-else>
    <ExamplesGrrrBasinSummary :basin="basin" :record="record" />
    <p v-if="error" class="px-3 pb-2 text-xs text-destructive">{{ error }}</p>
    <div v-if="loading" class="border-t border-border px-3 py-2.5">
      <div class="h-28 animate-pulse rounded bg-muted" />
    </div>
    <template v-else-if="peaks.length">
      <div class="border-t border-border">
        <ExamplesGrrrAnnualPeaksChart
          v-model:year="year"
          :basin="basin"
          :peaks="peaks"
        />
      </div>
      <div v-if="year !== null" class="border-t border-border">
        <ExamplesGrrrHydrographChart
          :basin="basin"
          :year="year"
          :values="yearValues"
        />
      </div>
    </template>
  </template>
</template>
