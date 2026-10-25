<script setup lang="ts">
  import type { ComponentPublicInstance, DeepReadonly } from 'vue';
  import type {
    ExpressionSpecification,
    MapOptions,
    Map as MaplibreMap,
  } from 'maplibre-gl';
  import type {
    HoverState,
    RegionLabel,
    SelectedCountry,
    ZoneFeatureCollection,
  } from '~/types/climate';
  import {
    VControlNavigation,
    VControlScale,
    VLayerMaplibreGeojson,
    VMap,
    VMarker,
    VPopup,
  } from '@geoql/v-maplibre';

  const props = defineProps<{
    mapOptions: MapOptions;
    zones: ZoneFeatureCollection | null;
    fillColorExpression: ExpressionSpecification;
    fillOpacityExpression: ExpressionSpecification | number;
    selectedIso: string | null;
    countryOutlineSource: GeoJSON.FeatureCollection | null;
    regionLabels: RegionLabel[];
    selectedCountry: DeepReadonly<SelectedCountry> | null;
    hoverState: HoverState | null;
    hoverPopupHtml: string | null;
    hoverPopupLngLat: { lng: number; lat: number } | null;
    isMobile: boolean;
  }>();

  type MarkerRefSetter = (el: Element | null) => void;

  function wrapMarkerRef(
    setRef: MarkerRefSetter,
  ): (el: Element | ComponentPublicInstance | null) => void {
    return (el) => {
      if (el instanceof Element) {
        setRef(el);
      }
    };
  }

  const emit = defineEmits<{
    mapLoad: [map: MaplibreMap];
    mapUnload: [];
    mapClick: [
      iso: string,
      klass: number,
      lngLat: { lng: number; lat: number },
    ];
    mapMouseMove: [
      iso: string,
      klass: number,
      lngLat: { lng: number; lat: number },
    ];
    mapMouseLeave: [];
    labelClick: [klass: number];
    labelShuffle: [klass: number];
  }>();

  // Stable source/layer specs — memoized so the library's deep source watcher
  // (which runs JSON.stringify on the 11MB FeatureCollection) does NOT fire on
  // every parent re-render. These only change when their real deps change.
  const fillSourceSpec = computed(() =>
    props.zones ? { type: 'geojson' as const, data: props.zones } : null,
  );
  const outlineSourceSpec = computed(() =>
    props.zones ? { type: 'geojson' as const, data: props.zones } : null,
  );

  const fillLayerSpec = computed(() => ({
    id: 'zones-fill',
    type: 'fill' as const,
    source: 'climate-zones',
    paint: {
      'fill-color': props.fillColorExpression,
      'fill-opacity': props.fillOpacityExpression,
    },
  }));

  const outlineLayerSpec = computed(() => ({
    id: 'zones-outline',
    type: 'line' as const,
    source: 'climate-zones-outline',
    paint: {
      'line-color': '#222',
      'line-width': 0.25,
      'line-opacity': props.selectedIso ? 0 : 0.35,
    },
  }));

  const popupOptions = {
    closeButton: false,
    closeOnClick: false,
    offset: 12,
    className: 'climate-region-popup',
  };

  const mapRef = shallowRef<MaplibreMap | null>(null);
  const basemapSymbolLayerIds: string[] = [];

  function handleMapLoad(map: MaplibreMap): void {
    mapRef.value = map;
    emit('mapLoad', map);

    // Collect basemap symbol layer IDs
    basemapSymbolLayerIds.length = 0;
    basemapSymbolLayerIds.push(
      ...map
        .getStyle()
        .layers.filter((l) => l.type === 'symbol')
        .map((l) => l.id),
    );

    // Wire click on zones-fill
    map.on('click', 'zones-fill', (e) => {
      const feat = e.features?.[0];
      if (!feat) return;
      emit(
        'mapClick',
        feat.properties.iso3 as string,
        feat.properties.koppen_class as number,
        e.lngLat,
      );
    });

    // Set cursor once on enter (not per mousemove — avoids per-pixel style writes)
    map.on('mouseenter', 'zones-fill', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    // Wire mousemove on zones-fill
    map.on('mousemove', 'zones-fill', (e) => {
      const feat = e.features?.[0];
      if (!feat) {
        emit('mapMouseLeave');
        return;
      }
      emit(
        'mapMouseMove',
        feat.properties.iso3 as string,
        feat.properties.koppen_class as number,
        e.lngLat,
      );
    });

    // Wire mouseleave
    map.on('mouseleave', 'zones-fill', () => {
      map.getCanvas().style.cursor = '';
      emit('mapMouseLeave');
    });

    // Run collision pass after moveend
    map.on('moveend', () => {
      requestAnimationFrame(() => {
        runCollisionPass();
      });
    });
  }

  function handleMarkerClick(klass: number, event: Event): void {
    // Don't fire if shuffle button was clicked
    if ((event.target as HTMLElement)?.closest('.region-label__refresh'))
      return;
    emit('labelClick', klass);
  }

  function handleMarkerShuffle(klass: number, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    emit('labelShuffle', klass);
  }

  function runCollisionPass(): void {
    const PAD = 4;
    const markers = [...document.querySelectorAll('.region-label-marker')];
    if (!markers.length) return;

    const sorted = [...markers].sort((a, b) => {
      const pa = Number((a as HTMLElement).dataset.prio);
      const pb = Number((b as HTMLElement).dataset.prio);
      if (pa !== pb) return pb - pa;
      return (
        Number((b as HTMLElement).dataset.area) -
        Number((a as HTMLElement).dataset.area)
      );
    });

    for (const m of sorted) (m as HTMLElement).style.visibility = 'visible';
    const placed: DOMRect[] = [];
    for (const m of sorted) {
      const el = m as HTMLElement;
      const r = el.getBoundingClientRect();
      if (el.dataset.prio === '1') {
        placed.push(r);
        continue;
      }
      const overlaps = placed.some(
        (p) =>
          !(
            r.right + PAD < p.left ||
            r.left > p.right + PAD ||
            r.bottom + PAD < p.top ||
            r.top > p.bottom + PAD
          ),
      );
      if (overlaps) {
        el.style.visibility = 'hidden';
      } else {
        placed.push(r);
      }
    }
  }

  onBeforeUnmount(() => {
    emit('mapUnload');
  });

  watch(
    () => props.selectedIso,
    (iso) => {
      const map = mapRef.value;
      if (!map || !basemapSymbolLayerIds.length) return;
      const visibility = iso ? 'none' : 'visible';
      for (const id of basemapSymbolLayerIds) {
        if (map.getLayer(id)) {
          map.setLayoutProperty(id, 'visibility', visibility);
        }
      }
    },
  );
</script>

<template>
  <VMap
    :key="`${mapOptions.container}-${mapOptions.style}`"
    :options="mapOptions"
    class="size-full"
    @loaded="handleMapLoad"
  >
    <VControlNavigation position="bottom-right" />
    <VControlScale position="bottom-left" />

    <!-- Zones fill layer -->
    <VLayerMaplibreGeojson
      v-if="fillSourceSpec"
      source-id="climate-zones"
      layer-id="zones-fill"
      :source="fillSourceSpec"
      :layer="fillLayerSpec"
    />

    <!-- Zones outline -->
    <VLayerMaplibreGeojson
      v-if="outlineSourceSpec"
      source-id="climate-zones-outline"
      layer-id="zones-outline"
      :source="outlineSourceSpec"
      :layer="outlineLayerSpec"
    />

    <!-- Country highlight outline -->
    <VLayerMaplibreGeojson
      v-if="countryOutlineSource"
      source-id="climate-country-outline"
      layer-id="country-highlight-outline"
      :source="{ type: 'geojson', data: countryOutlineSource }"
      :layer="{
        id: 'country-highlight-outline',
        type: 'line',
        source: 'climate-country-outline',
        paint: {
          'line-color': '#000',
          'line-width': 1.5,
        },
      }"
    />

    <!-- Region label markers -->
    <VMarker
      v-for="label in regionLabels"
      :key="`${label.klass}-${label.anchor[0]}-${label.anchor[1]}`"
      :coordinates="label.anchor"
    >
      <template #markers="{ setRef }">
        <div
          :ref="wrapMarkerRef(setRef)"
          class="region-label-marker inline-flex items-center gap-1.5 px-2 py-0.5 pl-1 bg-background/90 border border-border rounded-md text-xs font-medium whitespace-nowrap cursor-pointer select-none backdrop-blur-sm"
          :data-prio="label.prio ? '1' : '0'"
          :data-area="'1'"
          @click="handleMarkerClick(label.klass, $event)"
        >
          <button
            type="button"
            class="region-label__refresh flex items-center justify-center size-6 rounded bg-muted/40 text-foreground text-lg leading-none cursor-pointer p-0 border-none hover:bg-muted"
            :aria-label="`Show a new match for this region`"
            @click="handleMarkerShuffle(label.klass, $event)"
          >
            ↺
          </button>
          <span class="pointer-events-none text-foreground">
            {{ label.exemplarName }}
          </span>
        </div>
      </template>
    </VMarker>

    <!-- Hover popup -->
    <VPopup
      v-if="hoverPopupHtml && hoverPopupLngLat"
      :coordinates="[hoverPopupLngLat.lng, hoverPopupLngLat.lat]"
      :options="popupOptions"
    >
      <div v-html="hoverPopupHtml" />
    </VPopup>
  </VMap>
</template>
