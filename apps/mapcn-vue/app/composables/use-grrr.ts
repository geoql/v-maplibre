import type {
  GrrrAnnualPeak,
  GrrrBasin,
  GrrrBasinsFile,
  GrrrDailyValue,
  GrrrSeries,
} from '~/types/grrr';

/** The basin selected on load: the Danube at Vienna (the dataset's own demo). */
const DEFAULT_BASIN_ID = 2120476740;
const NO_PEAKS: GrrrAnnualPeak[] = [];
const NO_VALUES: GrrrDailyValue[] = [];

/**
 * State for the GRRR streamflow example: the large-river basins (static
 * file), the selected basin, its 1981–2025 daily streamflow (server route)
 * and the year shown in the hydrograph.
 */
export function useGrrr() {
  const basins = shallowRef<GrrrBasin[]>([]);
  const selected = shallowRef<GrrrBasin | null>(null);
  const series = shallowRef<GrrrSeries | null>(null);
  const year = ref<number | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const peaks = computed(() =>
    selected.value && series.value
      ? grrrAnnualPeaks(selected.value, series.value.start, series.value.values)
      : NO_PEAKS,
  );

  const record = computed(() =>
    peaks.value.reduce<GrrrAnnualPeak | null>(
      (best, p) => (best && best.peak >= p.peak ? best : p),
      null,
    ),
  );

  const yearValues = computed(() =>
    series.value && year.value !== null
      ? grrrYearValues(series.value.start, series.value.values, year.value)
      : NO_VALUES,
  );

  let request = 0;
  async function select(basin: GrrrBasin): Promise<void> {
    const current = ++request;
    selected.value = basin;
    series.value = null;
    year.value = null;
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch<GrrrSeries>(`/api/grrr/${basin.row}`);
      if (current !== request) return;
      series.value = markRaw(data);
      year.value = record.value?.year ?? null;
    } catch {
      if (current === request) error.value = 'Could not load streamflow.';
    } finally {
      if (current === request) loading.value = false;
    }
  }

  onMounted(async () => {
    const file = await $fetch<GrrrBasinsFile>('/data/grrr/basins.json');
    basins.value = markRaw(grrrBasinsFromFile(file));
    const initial = basins.value.find((b) => b.id === DEFAULT_BASIN_ID);
    if (initial) await select(initial);
  });

  return {
    basins,
    selected,
    peaks,
    record,
    year,
    yearValues,
    loading,
    error,
    select,
  };
}
