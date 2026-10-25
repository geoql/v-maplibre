import type { ExpressionSpecification, Map as MaplibreMap } from 'maplibre-gl';
import * as turf from '@turf/turf';
import type {
  ClassContext,
  ClassState,
  CountriesByIso,
  CountryBreakdown,
  DetailView,
  Exemplar,
  ExemplarsByClass,
  HoverState,
  KoppenClassId,
  LabelCluster,
  PartCandidate,
  RegionLabel,
  SelectedCountry,
  TreemapCell,
  ZoneFeature,
  ZoneFeatureCollection,
} from '~/types/climate';
import {
  buildFillColorExpression,
  KOPPEN_CLASSES,
  pickTextColor,
} from './use-koppen-classes';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum number of on-map labels per climate class. */
const MAX_LABELS_PER_CLASS = 3;

/** Screen-space radius (px) for clustering nearby label anchors. */
function clusterRadiusPx(vw: number): number {
  return Math.max(150, vw / 5);
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

interface ClimateData {
  zones: ZoneFeatureCollection;
  exemplars: ExemplarsByClass;
  byIso: CountriesByIso;
  byIsoBreakdown: Map<string, CountryBreakdown>;
}

async function fetchClimateData(): Promise<ClimateData> {
  const [zonesRes, exemplarsRes] = await Promise.all([
    $fetch<ZoneFeatureCollection>('/data/climate/country-zones.geojson'),
    $fetch<ExemplarsByClass>('/data/climate/class-exemplars.json'),
  ]);

  // parse exemplars as number-keyed object
  const exemplars: ExemplarsByClass = {};
  for (const [k, list] of Object.entries(
    exemplarsRes as Record<string, Exemplar[]>,
  )) {
    exemplars[Number(k)] = list;
  }

  // index by iso3
  const byIso: CountriesByIso = new Map();
  for (const f of zonesRes.features as ZoneFeature[]) {
    const iso = f.properties.iso3;
    if (!byIso.has(iso)) {
      byIso.set(iso, { name: f.properties.name, features: [] });
    }
    byIso.get(iso)!.features.push(f);
  }

  // per-country breakdown (total area + top-3 climates)
  const byIsoBreakdown = new Map<string, CountryBreakdown>();
  for (const [iso, { name, features }] of byIso) {
    const byClass = new Map<KoppenClassId, number>();
    let total = 0;
    for (const f of features) {
      const k = f.properties.koppen_class;
      const a = f.properties.area_km2;
      byClass.set(k, (byClass.get(k) ?? 0) + a);
      total += a;
    }
    const top = [...byClass.entries()]
      .map(([klass, area]) => ({ klass, fraction: area / total }))
      .sort((a, b) => b.fraction - a.fraction)
      .slice(0, 3);
    byIsoBreakdown.set(iso, { name, total, top });
  }

  return { zones: zonesRes, exemplars, byIso, byIsoBreakdown };
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function emptyFC(): GeoJSON.FeatureCollection {
  return { type: 'FeatureCollection', features: [] };
}

function buildPartCandidates(features: ZoneFeature[]): PartCandidate[] {
  const candidates: PartCandidate[] = [];
  for (const f of features) {
    const k = f.properties.koppen_class;
    const featureTotal = f.properties.area_km2;
    const flat = turf.flatten(f);
    const parts: { sub: GeoJSON.Feature; partArea: number }[] = [];
    for (const sub of flat.features) {
      const partArea = turf.area(sub) / 1e6; // m² → km²
      parts.push({ sub, partArea });
    }
    for (const { sub, partArea } of parts) {
      const p = turf.pointOnFeature(sub);
      candidates.push({
        klass: k,
        anchor: p.geometry.coordinates as [number, number],
        partArea,
        featureTotal,
        featureParts: parts.length,
      });
    }
  }
  return candidates;
}

function clusterPartsScreen(
  candidates: PartCandidate[],
  map: MaplibreMap,
): LabelCluster[] {
  const vw = map.getContainer().clientWidth;
  const radiusPx = clusterRadiusPx(vw);
  const byClass = new Map<KoppenClassId, PartCandidate[]>();
  for (const c of candidates) {
    if (!byClass.has(c.klass)) byClass.set(c.klass, []);
    byClass.get(c.klass)!.push(c);
  }

  const clusters: LabelCluster[] = [];
  for (const [klass, parts] of byClass) {
    const sorted = [...parts].sort((a, b) => b.partArea - a.partArea);
    const classClusters: LabelCluster[] = [];
    for (const part of sorted) {
      const pt = map.project(part.anchor);
      let merged: LabelCluster | null = null;
      for (const cl of classClusters) {
        const clPt = map.project(cl.anchor);
        const dx = pt.x - clPt.x;
        const dy = pt.y - clPt.y;
        if (Math.hypot(dx, dy) < radiusPx) {
          merged = cl;
          break;
        }
      }
      if (merged) {
        merged.totalArea += part.partArea;
        merged.partCount += 1;
      } else {
        classClusters.push({
          klass,
          anchor: part.anchor,
          totalArea: part.partArea,
          partCount: 1,
        });
      }
    }
    clusters.push(
      ...spreadCap(classClusters, MAX_LABELS_PER_CLASS, (item) => {
        const pt = map.project(item.anchor);
        return { x: pt.x, y: pt.y };
      }),
    );
  }
  return clusters;
}

function spreadCap<T extends { totalArea: number }>(
  cs: T[],
  k: number,
  getPosition?: (item: T) => { x: number; y: number } | null,
): T[] {
  if (cs.length <= k) return cs;
  const sorted = [...cs].sort((a, b) => b.totalArea - a.totalArea);
  const first = sorted[0];
  if (!first) return [];
  const picked: T[] = [first];
  const remaining = sorted.slice(1);
  while (picked.length < k && remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = -Infinity;
    for (let i = 0; i < remaining.length; i++) {
      let minDist = Infinity;
      const ri = remaining[i];
      if (!ri) continue;
      for (const p of picked) {
        const riPos = getPosition?.(ri);
        const pPos = getPosition?.(p);
        if (!riPos || !pPos) continue;
        const d = Math.hypot(riPos.x - pPos.x, riPos.y - pPos.y);
        if (d < minDist) minDist = d;
      }
      if (minDist > bestDist) {
        bestDist = minDist;
        bestIdx = i;
      }
    }
    const item = remaining[bestIdx];
    if (item) {
      picked.push(item);
      remaining.splice(bestIdx, 1);
    }
  }
  return picked;
}

/**
 * Greedy deduplication: classes ranked by area desc each pick the first
 * exemplar at-or-after their shuffle index that hasn't been claimed by
 * a larger sibling.
 */
function pickExemplarsByArea(
  classes: Map<KoppenClassId, ClassState>,
  areaByClass: Map<KoppenClassId, number>,
): Map<KoppenClassId, Exemplar> {
  const ordered = [...areaByClass.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);

  const used = new Set<string>();
  const pickByClass = new Map<KoppenClassId, Exemplar>();

  for (const k of ordered) {
    const entry = classes.get(k);
    if (!entry || entry.exemplars.length === 0) continue;
    let pick: Exemplar | null = null;
    for (let off = 0; off < entry.exemplars.length; off++) {
      const j = (entry.index + off) % entry.exemplars.length;
      const ex = entry.exemplars[j];
      if (ex && !used.has(ex.iso3)) {
        pick = ex;
        break;
      }
    }
    if (!pick) {
      const firstEx = entry.exemplars[entry.index];
      if (firstEx) pick = firstEx;
    }
    if (pick) {
      used.add(pick.iso3);
      pickByClass.set(k, pick);
    }
  }
  return pickByClass;
}

// ---------------------------------------------------------------------------
// Treemap (squarified, sorted-rows variant)
// ---------------------------------------------------------------------------

interface SquarifyItem {
  klass: KoppenClassId;
  fraction: number;
  area: number;
}

interface SquarifyRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function squarify(
  items: { klass: KoppenClassId; fraction: number }[],
  x0: number,
  y0: number,
  w: number,
  h: number,
): TreemapCell[] {
  if (!items.length || w <= 0 || h <= 0) return [];
  const totalValue =
    items.reduce((s, it) => s + Math.max(0, it.fraction), 0) || 1;
  const scaled: SquarifyItem[] = items.map((it) => ({
    ...it,
    area: (Math.max(0, it.fraction) / totalValue) * (w * h),
  }));

  function shortSide(r: SquarifyRect): number {
    return Math.min(r.w, r.h);
  }
  function worst(row: SquarifyItem[], side: number): number {
    let sum = 0,
      max = 0,
      min = Infinity;
    for (const it of row) {
      sum += it.area;
      if (it.area > max) max = it.area;
      if (it.area < min) min = it.area;
    }
    if (sum === 0) return Infinity;
    const s2 = side * side;
    const sum2 = sum * sum;
    return Math.max((s2 * max) / sum2, sum2 / (s2 * min));
  }

  const result: TreemapCell[] = [];
  let rect: SquarifyRect = { x: x0, y: y0, w, h };

  while (scaled.length) {
    const first = scaled.shift();
    if (!first) break;
    const row: SquarifyItem[] = [first];
    const side = shortSide(rect);
    while (
      scaled.length &&
      worst([...row, scaled[0]!], side) <= worst(row, side)
    ) {
      const next = scaled.shift();
      if (next) row.push(next);
    }
    const rowSum = row.reduce((s, it) => s + it.area, 0);
    if (rowSum <= 0) continue;
    if (rect.w <= rect.h) {
      let xx = rect.x;
      const rowH = rowSum / rect.w;
      for (const it of row) {
        const cellW = (it.area / rowSum) * rect.w;
        result.push({
          klass: it.klass,
          fraction: it.fraction,
          x: xx,
          y: rect.y,
          w: cellW,
          h: rowH,
          tiny: false,
        });
        xx += cellW;
      }
      rect.y += rowH;
      rect.h -= rowH;
    } else {
      let yy = rect.y;
      const rowW = rowSum / rect.h;
      for (const it of row) {
        const cellH = (it.area / rowSum) * rect.h;
        result.push({
          klass: it.klass,
          fraction: it.fraction,
          x: rect.x,
          y: yy,
          w: rowW,
          h: cellH,
          tiny: false,
        });
        yy += cellH;
      }
      rect.x += rowW;
      rect.w -= rowW;
    }
  }

  // Re-classify tiny cells
  const MIN_AREA = 36 * 28;
  const big: TreemapCell[] = [];
  const small: TreemapCell[] = [];
  for (const cell of result) {
    if (cell.w * cell.h < MIN_AREA) small.push(cell);
    else big.push(cell);
  }
  // Re-squarify big cells in upper region
  let bigLayout = big;
  if (small.length) {
    const stripH = 28;
    bigLayout = squarify(
      big.map((n) => ({ klass: n.klass, fraction: n.fraction })),
      x0,
      y0,
      w,
      Math.max(120, h - stripH),
    );
    // Lay out small cells in a flex strip at the bottom
    const stripY = Math.max(120, h - stripH);
    const each = w / small.length;
    small.forEach((n, i) => {
      n.x = x0 + i * each;
      n.y = stripY;
      n.w = each - 2;
      n.h = stripH - 2;
      n.tiny = true;
    });
  }
  return [...bigLayout, ...small];
}

// ---------------------------------------------------------------------------
// Zoom tier for label visibility
// ---------------------------------------------------------------------------

function getZoomThresholds(tier: number): { countryFrac: number } {
  if (tier === 0) return { countryFrac: 0.005 };
  if (tier === 1) return { countryFrac: 0.002 };
  return { countryFrac: 0.0005 };
}

function getZoomTier(zoom: number): number {
  if (zoom < 4) return 0;
  if (zoom < 5.5) return 1;
  return 2;
}

// ---------------------------------------------------------------------------
// Label computation
// ---------------------------------------------------------------------------

function computeRegionLabels(
  selected: SelectedCountry,
  map: MaplibreMap,
): RegionLabel[] {
  if (!selected.partCandidates) return [];
  const total = selected.features.reduce(
    (s, f) => s + f.properties.area_km2,
    0,
  );
  const zoom = map.getZoom();
  const tier = getZoomTier(zoom);
  const { countryFrac } = getZoomThresholds(tier);
  const minLabelArea = total * countryFrac;

  // Compute area per class
  const areaByClass = new Map<KoppenClassId, number>();
  for (const f of selected.features) {
    const k = f.properties.koppen_class;
    areaByClass.set(k, (areaByClass.get(k) ?? 0) + f.properties.area_km2);
  }
  const orderedClasses = [...areaByClass.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);

  // Greedy dedupe
  const pickByClass = pickExemplarsByArea(selected.classes, areaByClass);

  // Build context
  selected.context = new Map();
  for (const k of orderedClasses) {
    const entry = selected.classes.get(k);
    const pick = pickByClass.get(k);
    if (!pick) continue;
    const runnersUp = (entry?.exemplars ?? [])
      .filter((e) => e.iso3 !== pick.iso3)
      .slice(0, 3);
    selected.context.set(k, {
      exemplar: pick,
      fraction: areaByClass.get(k)! / total,
      runnersUp,
    });
  }

  const prioClasses = new Set(orderedClasses.slice(0, 3));
  const clusters = clusterPartsScreen(selected.partCandidates, map);
  const labels: RegionLabel[] = [];

  for (const cluster of clusters) {
    const ctx = selected.context.get(cluster.klass);
    if (!ctx) continue;
    if (cluster.totalArea < minLabelArea) continue;
    labels.push({
      klass: cluster.klass,
      anchor: cluster.anchor,
      exemplarName: ctx.exemplar.name,
      prio: prioClasses.has(cluster.klass),
    });
  }

  return labels;
}

// ---------------------------------------------------------------------------
// Treemap computation
// ---------------------------------------------------------------------------

function computeTreemap(
  features: ZoneFeature[],
  containerW: number,
  containerH: number,
): TreemapCell[] {
  const total = features.reduce((s, f) => s + f.properties.area_km2, 0);
  const byClass = new Map<KoppenClassId, number>();
  for (const f of features) {
    const k = f.properties.koppen_class;
    byClass.set(k, (byClass.get(k) ?? 0) + f.properties.area_km2);
  }
  const entries = [...byClass.entries()]
    .map(([klass, area]) => ({ klass, fraction: area / total }))
    .sort((a, b) => b.fraction - a.fraction);

  const W = Math.max(200, containerW);
  const H = Math.max(160, containerH);
  return squarify(entries, 0, 0, W, H);
}

// ---------------------------------------------------------------------------
// Country outline helper
// ---------------------------------------------------------------------------

function buildCountryOutline(
  iso: string,
  byIso: CountriesByIso,
  cache: Map<string, GeoJSON.Feature | null>,
): GeoJSON.Feature | null {
  if (cache.has(iso)) return cache.get(iso)!;
  const entry = byIso.get(iso);
  if (!entry) return null;
  let outline: GeoJSON.Feature | null;
  if (entry.features.length === 1) {
    outline = entry.features[0] ?? null;
  } else {
    try {
      outline = turf.union(
        turf.featureCollection(entry.features),
      ) as GeoJSON.Feature | null;
    } catch {
      outline = null;
    }
  }
  cache.set(iso, outline);
  return outline;
}

// ---------------------------------------------------------------------------
// Escape HTML helper
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ---------------------------------------------------------------------------
// Region info HTML (for popups)
// ---------------------------------------------------------------------------

function regionInfoHtml(
  klass: KoppenClassId,
  exemplar: Exemplar,
  fraction: number,
  selectedName: string,
  runnersUp: Exemplar[],
): string {
  const cls = KOPPEN_CLASSES[klass];
  if (!cls) return '';
  const pct =
    fraction >= 0.1 ? (fraction * 100).toFixed(0) : (fraction * 100).toFixed(1);
  const also = runnersUp.length
    ? `<div class="region-tip__also">Also: ${runnersUp
        .slice(0, 2)
        .map((e) => escapeHtml(e.name))
        .join(', ')}</div>`
    : '';
  return `
    <div class="region-tip">
      <div class="region-tip__match">Climate of <b>${escapeHtml(exemplar.name)}</b></div>
      <div class="region-tip__koppen">
        <span class="swatch" style="background:${cls.color}"></span>
        <span class="symbol">${cls.symbol}</span>
        <span class="name">${escapeHtml(cls.name)}</span>
      </div>
      <div class="region-tip__share">${pct}% of ${escapeHtml(selectedName)}</div>
      ${also}
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Methodology HTML
// ---------------------------------------------------------------------------

const METHODOLOGY_HTML = `
  <h3>Methodology</h3>
  <p><b>Climate data.</b> Köppen-Geiger 1991–2020 classifications (10 km resolution) from Beck et al. 2023. Each pixel is assigned one of 30 Köppen classes (e.g., Cfa = humid subtropical, BWh = hot desert).</p>
  <p><b>Country borders.</b> Natural Earth 10 m admin boundaries.</p>
  <p><b>Polygonization.</b> The raster was vectorized class-by-class and intersected with country borders, yielding 936 (country, Köppen class) features. Polygons smaller than 200 km² were dropped; the rest were simplified at 0.02° tolerance to keep the file under 10 MB.</p>
  <p><b>Country matching.</b> For each Köppen class, every country in the world is ranked by total area of that class. The top-ranked country (excluding the country you're viewing) is the "match" — so a region labeled "Climate of China" means China is the country with the most land area in that climate worldwide.</p>
  <p><b>Greedy de-duplication.</b> When several regions in the same country would all map to the same match, the largest zone keeps the top match and smaller zones step down to their next-best non-duplicate. This is why shuffling one region's match can cascade into others.</p>
  <p><b>Shuffle.</b> The ↺ buttons step through the ranking — region-level shuffles the next-best match for that zone; "Shuffle all" advances every region one step.</p>
  <p><b>What this doesn't model.</b></p>
  <ul>
    <li>Magnitude or intensity within a class (a tiny BWh sliver in Iceland still matches whichever country has the most BWh land).</li>
    <li>Geographic plausibility — purely area-driven.</li>
    <li>Climate trends or future scenarios (this is the 1991–2020 baseline only).</li>
  </ul>
`;

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

export function useClimateEquivalents() {
  // --- Reactive state ---
  const isLoading = ref(true);
  const error = ref<string | null>(null);

  // Large data in shallowRef (no deep reactivity needed for 11.5 MB GeoJSON)
  const zones = shallowRef<ZoneFeatureCollection | null>(null);
  const exemplars = shallowRef<ExemplarsByClass | null>(null);
  const byIso = shallowRef<CountriesByIso | null>(null);
  const byIsoBreakdown = shallowRef<Map<string, CountryBreakdown> | null>(null);

  // Official India boundary (overrides Natural Earth outline for IND)
  const indiaBoundary = shallowRef<GeoJSON.FeatureCollection | null>(null);

  // Map instance (shallow — never mutate, just reassign)
  const mapInstance = shallowRef<MaplibreMap | null>(null);

  // Selection state
  const selectedCountry = ref<SelectedCountry | null>(null);
  const hasEverSelected = ref(false);

  // Hover
  const hoverState = ref<HoverState | null>(null);
  const hoverPopupHtml = ref<string | null>(null);
  const hoverPopupLngLat = ref<{ lng: number; lat: number } | null>(null);

  // Detail view (treemap → detail)
  const detailView = ref<DetailView | null>(null);

  // Bottom sheet (mobile)
  const sheetOpen = ref(false);
  const sheetHtml = ref('');

  // Methodology
  const methodologyOpen = ref(false);

  // Derived: country list for dropdown
  const countryOptions = computed(() => {
    const data = byIso.value;
    if (!data) return [];
    return [...data.entries()]
      .map(([iso, { name }]) => ({ iso, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  // Derived: current fill color expression
  const fillColorExpression = computed<ExpressionSpecification>(() => {
    if (!selectedCountry.value) return buildFillColorExpression();
    const iso = selectedCountry.value.iso;
    const expr: ExpressionSpecification = [
      'case',
      ['==', ['get', 'iso3'], iso],
      buildFillColorExpression(),
      '#f1ede5',
    ];
    return expr;
  });

  const layerOpacity = ref(0.8);

  const fillOpacityExpression = computed<ExpressionSpecification | number>(
    () => {
      if (!selectedCountry.value) return layerOpacity.value;
      const iso = selectedCountry.value.iso;
      return ['case', ['==', ['get', 'iso3'], iso], layerOpacity.value, 1.0];
    },
  );

  // Derived: region labels
  const regionLabels = ref<RegionLabel[]>([]);

  // Derived: treemap cells (computed from selection + container size)
  const treemapContainerW = ref(300);
  const treemapContainerH = ref(240);
  const treemapCells = ref<TreemapCell[]>([]);

  // Country outline cache
  const countryOutlineCache = new Map<string, GeoJSON.Feature | null>();

  // --- Data loading ---
  async function loadData(): Promise<void> {
    try {
      isLoading.value = true;
      const data = await fetchClimateData();
      zones.value = data.zones;
      exemplars.value = data.exemplars;
      byIso.value = data.byIso;
      byIsoBreakdown.value = data.byIsoBreakdown;
      $fetch<GeoJSON.FeatureCollection>('/data/climate/india-boundary.geojson')
        .then((fc) => {
          indiaBoundary.value = fc;
        })
        .catch(() => {
          indiaBoundary.value = null;
        });
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load data';
    } finally {
      isLoading.value = false;
    }
  }

  // --- Map attachment ---
  function attachMap(map: MaplibreMap): void {
    mapInstance.value = map;
  }

  function detachMap(): void {
    mapInstance.value = null;
  }

  // --- Country selection ---
  function selectCountry(iso: string): void {
    const data = byIso.value;
    const ex = exemplars.value;
    if (!data || !ex) return;
    const country = data.get(iso);
    if (!country) return;

    hasEverSelected.value = true;

    // Build per-class shuffle state
    const classes = new Map<KoppenClassId, ClassState>();
    for (const f of country.features) {
      const k = f.properties.koppen_class;
      if (classes.has(k)) continue;
      const list = (ex[k] ?? []).filter((e) => e.iso3 !== iso);
      classes.set(k, { exemplars: list, index: 0 });
    }

    const sel: SelectedCountry = {
      iso,
      name: country.name,
      features: country.features,
      classes,
      context: new Map(),
      partCandidates: null,
    };
    sel.partCandidates = buildPartCandidates(country.features);

    selectedCountry.value = sel;
    detailView.value = null;

    // Compute labels
    const map = mapInstance.value;
    if (map) {
      regionLabels.value = computeRegionLabels(sel, map);
    }

    // Compute treemap
    updateTreemap();

    // Pre-build country outline cache entry
    buildCountryOutline(iso, data, countryOutlineCache);

    // Fit camera to country
    if (map && country.features.length > 0) {
      map.fitBounds(
        turf.bbox(turf.featureCollection(country.features)) as [
          number,
          number,
          number,
          number,
        ],
        {
          padding: 80,
          maxZoom: 6,
          duration: 800,
        },
      );
    }
  }

  function clearSelection(): void {
    selectedCountry.value = null;
    detailView.value = null;
    regionLabels.value = [];
    hoverState.value = null;
    hoverPopupHtml.value = null;
    hoverPopupLngLat.value = null;
    sheetOpen.value = false;
  }

  function randomCountry(): void {
    const data = byIso.value;
    if (!data) return;
    const candidates = [...data.keys()].filter(
      (iso) => iso !== selectedCountry.value?.iso,
    );
    if (!candidates.length) return;
    const iso = candidates[Math.floor(Math.random() * candidates.length)]!;
    selectCountry(iso);
  }

  // --- Shuffle ---
  function shuffleOne(klass: KoppenClassId): void {
    if (!selectedCountry.value) return;
    const entry = selectedCountry.value.classes.get(klass);
    if (!entry || entry.exemplars.length <= 1) return;
    entry.index = (entry.index + 1) % entry.exemplars.length;
    refreshLabels();
  }

  function shuffleAll(): void {
    if (!selectedCountry.value) return;
    for (const entry of selectedCountry.value.classes.values()) {
      if (entry.exemplars.length <= 1) continue;
      entry.index = (entry.index + 1) % entry.exemplars.length;
    }
    refreshLabels();
  }

  function refreshLabels(): void {
    const sel = selectedCountry.value;
    const map = mapInstance.value;
    if (!sel || !map) return;
    regionLabels.value = computeRegionLabels(sel, map);
  }

  // --- Treemap ---
  function updateTreemap(): void {
    const sel = selectedCountry.value;
    if (!sel) {
      treemapCells.value = [];
      return;
    }
    treemapCells.value = computeTreemap(
      sel.features,
      treemapContainerW.value,
      treemapContainerH.value,
    );
  }

  // --- Detail view ---
  function openDetail(klass: KoppenClassId): void {
    detailView.value = { klass };
  }

  function closeDetail(): void {
    detailView.value = null;
  }

  // --- Hover ---
  function setHoverState(state: HoverState | null): void {
    hoverState.value = state;
    if (!state) {
      hoverPopupHtml.value = null;
      hoverPopupLngLat.value = null;
      return;
    }

    const sel = selectedCountry.value;
    if (!sel) return;

    if (sel.iso !== state.iso) {
      hoverPopupHtml.value = null;
      hoverPopupLngLat.value = null;
      return;
    }
    const ctx = sel.context.get(state.klass);
    if (ctx) {
      hoverPopupHtml.value = regionInfoHtml(
        state.klass,
        ctx.exemplar,
        ctx.fraction,
        sel.name,
        ctx.runnersUp,
      );
    }
    hoverPopupLngLat.value = state.lngLat;
  }

  // --- Bottom sheet ---
  function openSheet(html: string): void {
    sheetHtml.value = html;
    sheetOpen.value = true;
  }

  function closeSheet(): void {
    sheetOpen.value = false;
    sheetHtml.value = '';
  }

  // --- Methodology ---
  function openMethodology(): void {
    methodologyOpen.value = true;
  }

  function closeMethodology(): void {
    methodologyOpen.value = false;
  }

  // --- Public API ---
  function getCountryOutline(iso: string): GeoJSON.FeatureCollection {
    if (iso === 'IND' && indiaBoundary.value) {
      return indiaBoundary.value;
    }
    const data = byIso.value;
    if (!data) return emptyFC();
    const outline = buildCountryOutline(iso, data, countryOutlineCache);
    if (!outline) return emptyFC();
    return { type: 'FeatureCollection', features: [outline] };
  }

  // --- Computed for detail context ---
  function getDetailContext(): ClassContext | null {
    const sel = selectedCountry.value;
    const dv = detailView.value;
    if (!sel || !dv) return null;
    return sel.context.get(dv.klass) ?? null;
  }

  // --- Publish ---
  return {
    // State
    isLoading: readonly(isLoading),
    error: readonly(error),
    // Shallow: the 11.5 MB collection is handed to MapLibre as-is; a deep
    // readonly proxy over it buys nothing and hides its GeoJSON type.
    zones: shallowReadonly(zones),
    selectedCountry: readonly(selectedCountry),
    hasEverSelected: readonly(hasEverSelected),
    countryOptions,
    fillColorExpression,
    fillOpacityExpression,
    layerOpacity,
    regionLabels,
    treemapCells,
    treemapContainerW,
    treemapContainerH,
    hoverState: readonly(hoverState),
    hoverPopupHtml: readonly(hoverPopupHtml),
    hoverPopupLngLat: readonly(hoverPopupLngLat),
    detailView,
    sheetOpen: readonly(sheetOpen),
    sheetHtml: readonly(sheetHtml),
    methodologyOpen: readonly(methodologyOpen),

    // Actions
    loadData,
    attachMap,
    detachMap,
    selectCountry,
    clearSelection,
    randomCountry,
    shuffleOne,
    shuffleAll,
    refreshLabels,
    updateTreemap,
    openDetail,
    closeDetail,
    setHoverState,
    openSheet,
    closeSheet,
    openMethodology,
    closeMethodology,
    getCountryOutline,
    getDetailContext,

    // Re-exports
    buildFillColorExpression,
    KOPPEN_CLASSES,
    pickTextColor,
    METHODOLOGY_HTML,
  };
}
