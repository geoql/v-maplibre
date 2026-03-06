import type {
  ZipDataPoint,
  ZipRenderPoint,
  ViewMode,
  ViewportBounds,
  ViewportStats,
  QuintileBucket,
  PromapSearchResult,
  WorkerRequest,
  WorkerResponse,
} from '~/types/promap';
import { getCachedPromapData, setCachedPromapData } from '~/utils/promap-cache';

// ── Color palettes ──────────────────────────────────────────────────────────
/** Levels mode: warm palette — cheapest (blue) → most expensive (red) */
const LEVELS_COLORS: [number, number, number][] = [
  [33, 102, 172], // Q1 — cheapest — blue
  [103, 169, 207], // Q2
  [253, 219, 199], // Q3
  [244, 109, 67], // Q4
  [214, 48, 39], // Q5 — most expensive — red
];

/** Changes mode: diverging — declining (black/gray) → appreciating (blue) */
const CHANGES_COLORS: [number, number, number][] = [
  [26, 26, 26], // Q1 — biggest decline — near-black
  [115, 115, 115], // Q2 — moderate decline — gray
  [189, 189, 189], // Q3 — flat — light gray
  [107, 174, 214], // Q4 — moderate appreciation — light blue
  [33, 113, 181], // Q5 — biggest appreciation — bright blue
];

/** URL to the pre-processed promap data JSON */
const DATA_URL = '/data/promap-data.json';

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

// ── Main composable ─────────────────────────────────────────────────────────
export function usePromapData() {
  const allData = ref<ZipDataPoint[]>([]);
  const isLoading = ref(true);
  const loadingMessage = ref('Initializing...');
  const loadError = ref<string | null>(null);

  const viewMode = ref<ViewMode>('levels');
  const localView = ref(false);
  const viewportBounds = ref<ViewportBounds | null>(null);
  const hoveredZip = ref<ZipDataPoint | null>(null);
  const searchQuery = ref('');
  const dataVersion = ref(0);

  // ── Load data via Web Worker + IndexedDB cache ──────────────────────────
  async function loadData(): Promise<void> {
    if (!import.meta.client) return;

    try {
      // Try IndexedDB cache first
      loadingMessage.value = 'Checking cache...';
      const cached = await getCachedPromapData('v1');
      if (cached && cached.length > 0) {
        allData.value = cached;
        isLoading.value = false;
        loadingMessage.value = '';
        return;
      }

      // Cache miss — use Web Worker for off-main-thread fetch + parse
      loadingMessage.value = 'Loading real estate data...';

      const worker = new Worker(
        new URL('~/workers/promap.worker.ts', import.meta.url),
        { type: 'module' },
      );

      await new Promise<void>((resolve, reject) => {
        worker.onmessage = async (event: MessageEvent<WorkerResponse>) => {
          const msg = event.data;

          switch (msg.type) {
            case 'progress':
              loadingMessage.value = msg.message;
              break;
            case 'data':
              allData.value = msg.points;
              isLoading.value = false;
              loadingMessage.value = '';

              // Cache in IndexedDB for next visit
              await setCachedPromapData(msg.version, msg.points);

              worker.terminate();
              resolve();
              break;
            case 'error':
              loadError.value = msg.message;
              isLoading.value = false;
              worker.terminate();
              reject(new Error(msg.message));
              break;
          }
        };

        worker.onerror = (err) => {
          loadError.value = err.message || 'Worker error';
          isLoading.value = false;
          worker.terminate();
          reject(new Error(err.message));
        };

        const request: WorkerRequest = { type: 'init', dataUrl: DATA_URL };
        worker.postMessage(request);
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load data';
      loadError.value = message;
      isLoading.value = false;
    }
  }

  // Fire data loading on client
  if (import.meta.client) {
    loadData();
  }

  // ── Visible points (filtered by viewport when LocalView is on) ──────────
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
    // Access dataVersion to force recomputation when viewport changes
    void dataVersion.value;

    const q = quintiles.value;
    const colors = colorPalette.value;
    const mode = viewMode.value;

    return allData.value.map((p) => {
      const value = mode === 'levels' ? p.price : p.priceChange;
      const qi = getQuintileIndex(value, q);
      const color = colors[qi];

      // Radius proportional to sqrt(population) for area-accurate sizing
      // Fallback to price-based sizing for the ~6 ZIPs without population
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

  // ── Search ──────────────────────────────────────────────────────────────
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
    dataVersion.value++;
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

  return {
    allData: readonly(allData),
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
