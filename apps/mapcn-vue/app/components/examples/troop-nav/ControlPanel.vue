<script setup lang="ts">
  import type {
    TroopWaypoint,
    ElevationPoint,
    RouteStats,
  } from '~/types/defense-troop-nav';

  const props = defineProps<{
    waypoints: TroopWaypoint[];
    routeStats: RouteStats | null;
    elevationProfile: ElevationPoint[];
  }>();

  const emit = defineEmits<{
    removeWaypoint: [id: string];
    clearRoute: [];
  }>();

  const svgWidth = 220;
  const svgHeight = 80;

  const sparklinePath = computed(() => {
    const pts = props.elevationProfile;
    if (pts.length < 2) return '';

    const maxDist = pts[pts.length - 1]!.distance;
    const alts = pts.map((p) => p.altitude);
    const minAlt = Math.min(...alts);
    const maxAlt = Math.max(...alts);
    const altRange = maxAlt - minAlt || 1;

    const padding = 4;
    const w = svgWidth - padding * 2;
    const h = svgHeight - padding * 2;

    return pts
      .map((p, i) => {
        const x = padding + (maxDist > 0 ? (p.distance / maxDist) * w : 0);
        const y = padding + h - ((p.altitude - minAlt) / altRange) * h;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  });

  function formatCoord(position: [number, number]): string {
    return `${position[1].toFixed(4)}°N, ${position[0].toFixed(4)}°E`;
  }
</script>

<template>
  <div class="space-y-4 p-4">
    <div class="space-y-1">
      <h3 class="text-sm font-semibold">Waypoints</h3>
      <p class="text-[11px] text-muted-foreground">
        Click on the map to add waypoints (max 8)
      </p>
    </div>

    <div v-if="waypoints.length > 0" class="space-y-1">
      <div
        v-for="wp in waypoints"
        :key="wp.id"
        class="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent"
      >
        <span
          class="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary"
        >
          {{ wp.label.split('-')[1] }}
        </span>
        <span class="flex-1 truncate text-muted-foreground">
          {{ formatCoord(wp.position) }}
        </span>
        <button
          class="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
          @click="emit('removeWaypoint', wp.id)"
        >
          <Icon name="lucide:x" class="size-3" />
        </button>
      </div>
    </div>

    <div v-else class="rounded-md bg-muted/50 px-3 py-4 text-center">
      <Icon
        name="lucide:map-pin-plus"
        class="mx-auto mb-1 size-5 text-muted-foreground"
      />
      <p class="text-xs text-muted-foreground">No waypoints yet</p>
    </div>

    <div v-if="routeStats" class="space-y-2">
      <Separator />
      <h3 class="text-sm font-semibold">Route Stats</h3>
      <div class="grid grid-cols-2 gap-2">
        <div class="rounded-md bg-muted/50 px-2.5 py-2">
          <div class="text-[10px] text-muted-foreground">Distance</div>
          <div class="text-sm font-semibold">
            {{ routeStats.distanceKm.toFixed(1) }} km
          </div>
        </div>
        <div class="rounded-md bg-muted/50 px-2.5 py-2">
          <div class="text-[10px] text-muted-foreground">Est. Time</div>
          <div class="text-sm font-semibold">
            {{ routeStats.timeHours.toFixed(1) }} hrs
          </div>
        </div>
        <div class="rounded-md bg-muted/50 px-2.5 py-2">
          <div class="text-[10px] text-muted-foreground">Elev. Gain</div>
          <div class="text-sm font-semibold text-success">
            +{{ routeStats.elevationGain }} m
          </div>
        </div>
        <div class="rounded-md bg-muted/50 px-2.5 py-2">
          <div class="text-[10px] text-muted-foreground">Elev. Loss</div>
          <div class="text-sm font-semibold text-destructive">
            -{{ routeStats.elevationLoss }} m
          </div>
        </div>
      </div>
    </div>

    <div v-if="elevationProfile.length > 1" class="space-y-2">
      <Separator />
      <h3 class="text-sm font-semibold">Elevation Profile</h3>
      <div class="rounded-md bg-muted/30 p-2">
        <svg
          :width="svgWidth"
          :height="svgHeight"
          class="w-full"
          :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
          preserveAspectRatio="none"
        >
          <path
            :d="sparklinePath"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            class="text-success"
          />
        </svg>
      </div>
    </div>

    <button
      v-if="waypoints.length > 0"
      class="flex w-full items-center justify-center gap-1.5 rounded-md border border-border/50 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
      @click="emit('clearRoute')"
    >
      <Icon name="lucide:trash-2" class="size-3.5" />
      Clear Route
    </button>
  </div>
</template>
