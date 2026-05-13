import type {
  PromapApiResponse,
  PromapRow,
  ZipDataPoint,
  ZipRenderPoint,
  ViewMode,
  ViewportBounds,
  ViewportStats,
  QuintileBucket,
  PromapSearchResult,
} from '~/types/promap';

// ── Color palettes ──────────────────────────────────────────────────────────
/** Levels mode: warm palette — cheapest (blue) → most expensive (red) */
const LEVELS_COLORS: [number, number, number][] = [
  [33, 102, 172],
  [103, 169, 207],
  [253, 219, 199],
  [244, 109, 67],
  [214, 48, 39],
];

/** Changes mode: diverging — declining (black/gray) → appreciating (blue) */
const CHANGES_COLORS: [number, number, number][] = [
  [26, 26, 26],
  [115, 115, 115],
  [189, 189, 189],
  [107, 174, 214],
  [33, 113, 181],
];

// ── Quantile computation ────────────────────────────────────────────────────
function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

function computeQuintiles(values: number[]): number[] {
  if (values.length === 0) return [0, 0, 0, 0];
  const sorted = [...values].sort((a, b) => a - b);
  return [
    quantile(sorted, 0.2),
    quantile(sorted, 0.4),
    quantile(sorted, 0.6),
    quantile(sorted, 0.8),
  ];
}

function getQuintileIndex(value: number, quintiles: number[]): number {
  if (value <= quintiles[0]) return 0;
  if (value <= quintiles[1]) return 1;
  if (value <= quintiles[2]) return 2;
  if (value <= quintiles[3]) return 3;
  return 4;
}

// ── Formatting helpers ──────────────────────────────────────────────────────
export function formatPrice(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value}`;
}

export function formatChange(value: number): string {
  const pct = (value * 100).toFixed(1);
  return value >= 0 ? `+${pct}%` : `${pct}%`;
}

export function formatPopulation(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return String(value);
}

/** Convert a server-side PromapRow into the client-side ZipDataPoint shape. */
function toZipDataPoint(row: PromapRow): ZipDataPoint {
  return {
    zip: row.zip,
    coordinates: [row.lng, row.lat],
    population: row.population,
    price: row.price,
    priceChange: row.p1 / 100,
    city: row.city,
    state: row.state,
    metro: row.metro,
  };
}

const VIEWPORT_DEBOUNCE_MS = 250;
const QUERY_LIMIT = 5000;

// ── Main composable ─────────────────────────────────────────────────────────
export function usePromapData() {
  const allData = ref<ZipDataPoint[]>([]);
  const totalRecords = ref(0);
  const isLoading = ref(true);
  const loadingMessage = ref('Loading viewport…');
  const loadError = ref<string | null>(null);

  const viewMode = ref<ViewMode>('levels');
  const localView = ref(true);
  const viewportBounds = ref<ViewportBounds | null>(null);
  const hoveredZip = ref<ZipDataPoint | null>(null);
  const searchQuery = ref('');
  const dataVersion = ref(0);

  let fetchTimer: ReturnType<typeof setTimeout> | null = null;
  let inflightController: AbortController | null = null;

  /** Fetch records for the current viewport from the D1-backed server route. */
  async function fetchViewport(bounds: ViewportBounds): Promise<void> {
    if (!import.meta.client) return;

    inflightController?.abort();
    const controller = new AbortController();
    inflightController = controller;

    try {
      isLoading.value = true;
      loadingMessage.value = 'Loading viewport…';

      const bbox = `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`;
      const response = await $fetch<PromapApiResponse>('/api/promap', {
        query: { bbox, limit: QUERY_LIMIT },
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      allData.value = response.rows.map(toZipDataPoint);
      totalRecords.value = response.total;
      loadError.value = null;
      isLoading.value = false;
      loadingMessage.value = '';
      dataVersion.value++;
    } catch (err) {
      if (controller.signal.aborted) return;
      const message =
        err instanceof Error ? err.message : 'Failed to load viewport';
      loadError.value = message;
      isLoading.value = false;
    }
  }

  // ── Visible points (client-side bbox filter for tight viewport semantics) ─
  const visiblePoints = computed<ZipDataPoint[]>(() => {
    if (!localView.value || !viewportBounds.value) return allData.value;
    const b = viewportBounds.value;
    return allData.value.filter(
      (p) =>
        p.coordinates[0] >= b.west &&
        p.coordinates[0] <= b.east &&
        p.coordinates[1] >= b.south &&
        p.coordinates[1] <= b.north,
    );
  });

  // ── Quintile breakpoints (recomputed for LocalView subset) ──────────────
  const quintiles = computed(() => {
    const values = visiblePoints.value.map((p) =>
      viewMode.value === 'levels' ? p.price : p.priceChange,
    );
    return computeQuintiles(values);
  });

  // ── Color palette based on mode ─────────────────────────────────────────
  const colorPalette = computed(() =>
    viewMode.value === 'levels' ? LEVELS_COLORS : CHANGES_COLORS,
  );

  // ── Render-ready points (all data, colored by current quintiles) ────────
  const renderPoints = computed<ZipRenderPoint[]>(() => {
    void dataVersion.value;

    const q = quintiles.value;
    const colors = colorPalette.value;
    const mode = viewMode.value;

    return allData.value.map((p) => {
      const value = mode === 'levels' ? p.price : p.priceChange;
      const qi = getQuintileIndex(value, q);
      const color = colors[qi];

      // Radius proportional to sqrt(population) for area-accurate sizing.
      // Fallback to price-based sizing for the ~6 ZIPs without population.
      const radius =
        p.population > 0
          ? Math.max(Math.sqrt(p.population) * 0.8, 200)
          : Math.max(Math.sqrt(p.price / 100), 200);

      return {
        coordinates: p.coordinates,
        radius,
        fillColor: [color[0], color[1], color[2], 200] as [
          number,
          number,
          number,
          number,
        ],
        data: p,
      };
    });
  });

  // ── Viewport stats ──────────────────────────────────────────────────────
  const viewportStats = computed<ViewportStats>(() => {
    const pts = visiblePoints.value;
    if (pts.length === 0) {
      return {
        count: 0,
        medianPrice: 0,
        avgChange: 0,
        minPrice: 0,
        maxPrice: 0,
      };
    }
    const prices = pts.map((p) => p.price).sort((a, b) => a - b);
    const changes = pts.map((p) => p.priceChange);
    return {
      count: pts.length,
      medianPrice: quantile(prices, 0.5),
      avgChange: changes.reduce((a, b) => a + b, 0) / changes.length,
      minPrice: prices[0],
      maxPrice: prices[prices.length - 1],
    };
  });

  // ── Legend buckets ──────────────────────────────────────────────────────
  const legendBuckets = computed<QuintileBucket[]>(() => {
    const q = quintiles.value;
    const colors = colorPalette.value;
    const mode = viewMode.value;
    const fmt = mode === 'levels' ? formatPrice : formatChange;

    const pts = visiblePoints.value;
    if (pts.length === 0) return [];

    const values = pts
      .map((p) => (mode === 'levels' ? p.price : p.priceChange))
      .sort((a, b) => a - b);
    const minVal = values[0];
    const maxVal = values[values.length - 1];

    return [
      {
        min: minVal,
        max: q[0],
        color: colors[0],
        label: `${fmt(minVal)} – ${fmt(q[0])}`,
      },
      {
        min: q[0],
        max: q[1],
        color: colors[1],
        label: `${fmt(q[0])} – ${fmt(q[1])}`,
      },
      {
        min: q[1],
        max: q[2],
        color: colors[2],
        label: `${fmt(q[1])} – ${fmt(q[2])}`,
      },
      {
        min: q[2],
        max: q[3],
        color: colors[3],
        label: `${fmt(q[2])} – ${fmt(q[3])}`,
      },
      {
        min: q[3],
        max: maxVal,
        color: colors[4],
        label: `${fmt(q[3])} – ${fmt(maxVal)}`,
      },
    ];
  });

  // ── Search (operates on the currently-loaded viewport set) ──────────────
  const searchResults = computed<PromapSearchResult[]>(() => {
    const q = searchQuery.value.trim().toLowerCase();
    if (q.length < 2) return [];

    return allData.value
      .filter(
        (p) =>
          p.city.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q) ||
          p.zip.includes(q),
      )
      .slice(0, 8)
      .map((p) => ({
        zip: p.zip,
        city: p.city,
        state: p.state,
        coordinates: p.coordinates,
        price: p.price,
        priceChange: p.priceChange,
      }));
  });

  // ── Actions ─────────────────────────────────────────────────────────────
  function updateViewport(bounds: ViewportBounds): void {
    viewportBounds.value = bounds;

    if (fetchTimer) clearTimeout(fetchTimer);
    fetchTimer = setTimeout(() => {
      fetchViewport(bounds);
    }, VIEWPORT_DEBOUNCE_MS);
  }

  function setViewMode(mode: ViewMode): void {
    viewMode.value = mode;
  }

  function toggleLocalView(): void {
    localView.value = !localView.value;
    dataVersion.value++;
  }

  function setHoveredZip(zip: ZipDataPoint | null): void {
    hoveredZip.value = zip;
  }

  function setSearchQuery(query: string): void {
    searchQuery.value = query;
  }

  onBeforeUnmount(() => {
    if (fetchTimer) clearTimeout(fetchTimer);
    inflightController?.abort();
  });

  return {
    allData: readonly(allData),
    totalRecords: readonly(totalRecords),
    isLoading: readonly(isLoading),
    loadingMessage: readonly(loadingMessage),
    loadError: readonly(loadError),
    viewMode: readonly(viewMode),
    localView: readonly(localView),
    hoveredZip: readonly(hoveredZip),
    searchQuery: readonly(searchQuery),
    renderPoints,
    visiblePoints,
    viewportStats,
    legendBuckets,
    searchResults,
    updateViewport,
    setViewMode,
    toggleLocalView,
    setHoveredZip,
    setSearchQuery,
    formatPrice,
    formatChange,
    formatPopulation,
  };
}
