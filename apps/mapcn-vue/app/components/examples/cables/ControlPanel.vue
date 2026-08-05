<script setup lang="ts">
  import type { Cable, CableStats } from '~/types/maritime-cables';

  const props = defineProps<{
    cables: Cable[];
    selectedCableId: string | null;
    showEez: boolean;
    stats: CableStats;
  }>();

  const emit = defineEmits<{
    selectCable: [id: string | null];
    toggleEez: [];
  }>();

  function riskLabel(score: number): string {
    if (score >= 70) return 'HIGH';
    if (score >= 40) return 'MED';
    return 'LOW';
  }

  // Stable per-cable style objects so the v-for does not allocate on re-render
  const cableRows = computed(() =>
    props.cables.map((cable) => ({
      ...cable,
      dotStyle: {
        backgroundColor: `rgb(${cable.color[0]}, ${cable.color[1]}, ${cable.color[2]})`,
      },
    })),
  );
</script>

<template>
  <div class="space-y-4 p-4">
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Cables</h3>
      <div class="space-y-1">
        <button
          class="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs transition-colors"
          :class="
            selectedCableId === null
              ? 'bg-primary/15 text-foreground'
              : 'text-muted-foreground/50 hover:bg-accent hover:text-foreground'
          "
          @click="emit('selectCable', null)"
        >
          <span class="size-2.5 shrink-0 rounded-full bg-primary"></span>
          <span class="font-medium">All Cables</span>
        </button>
        <button
          v-for="cable in cableRows"
          :key="cable.id"
          class="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs transition-colors"
          :class="
            selectedCableId === cable.id
              ? 'bg-primary/15 text-foreground'
              : 'text-muted-foreground/50 hover:bg-accent hover:text-foreground'
          "
          @click="emit('selectCable', cable.id)"
        >
          <span
            class="size-2.5 shrink-0 rounded-full"
            :style="cable.dotStyle"
          ></span>
          <span class="flex-1 truncate text-left font-medium">
            {{ cable.name }}
          </span>
          <span
            class="shrink-0 rounded px-1 py-0.5 text-3xs font-bold uppercase tracking-wide"
            :class="
              riskLabel(cable.riskScore) === 'HIGH'
                ? 'bg-destructive/20 text-destructive'
                : riskLabel(cable.riskScore) === 'MED'
                  ? 'bg-warning/20 text-warning'
                  : 'bg-success/20 text-success'
            "
          >
            {{ riskLabel(cable.riskScore) }}
          </span>
        </button>
      </div>
    </div>

    <div class="space-y-3">
      <h3 class="text-sm font-semibold">Layers</h3>
      <button
        class="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs transition-colors hover:bg-accent"
        @click="emit('toggleEez')"
      >
        <span class="flex items-center gap-2">
          <Icon name="lucide:globe-2" class="size-3.5" />
          <span>EEZ Zones</span>
        </span>
        <span
          class="size-2 rounded-full transition-colors"
          :class="showEez ? 'bg-primary' : 'bg-muted-foreground/30'"
        ></span>
      </button>
    </div>

    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Cut Risk</h3>
      <div class="flex items-center gap-3 px-2.5 text-caption">
        <span class="flex items-center gap-1.5">
          <span class="size-2 rounded-full bg-destructive"></span>
          <span class="text-muted-foreground">High</span>
        </span>
        <span class="flex items-center gap-1.5">
          <span class="size-2 rounded-full bg-warning"></span>
          <span class="text-muted-foreground">Med</span>
        </span>
        <span class="flex items-center gap-1.5">
          <span class="size-2 rounded-full bg-success"></span>
          <span class="text-muted-foreground">Low</span>
        </span>
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Infrastructure</h3>
      <div class="grid grid-cols-2 gap-2">
        <div
          class="rounded-lg border border-border bg-muted/50 p-2 text-center"
        >
          <div class="text-lg font-bold tabular-nums">
            {{ stats.totalCables }}
          </div>
          <div class="text-2xs text-muted-foreground">Cables</div>
        </div>
        <div
          class="rounded-lg border border-border bg-muted/50 p-2 text-center"
        >
          <div class="text-lg font-bold tabular-nums">
            {{ stats.totalLandingPoints }}
          </div>
          <div class="text-2xs text-muted-foreground">Landing Pts</div>
        </div>
        <div
          class="rounded-lg border p-2 text-center"
          :class="
            stats.highRiskSegments > 0
              ? 'border-destructive/50 bg-destructive/10'
              : 'border-border bg-muted/50'
          "
        >
          <div
            class="text-lg font-bold tabular-nums"
            :class="stats.highRiskSegments > 0 ? 'text-destructive' : ''"
          >
            {{ stats.highRiskSegments }}
          </div>
          <div class="text-2xs text-muted-foreground">High-Risk Seg.</div>
        </div>
        <div
          class="rounded-lg border border-border bg-muted/50 p-2 text-center"
        >
          <div class="text-lg font-bold tabular-nums">
            {{ stats.totalCapacityTbps }}
          </div>
          <div class="text-2xs text-muted-foreground">Total Tbps</div>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-muted/50 p-3">
      <p class="text-xs text-muted-foreground">
        <strong>Undersea Infrastructure:</strong> Global submarine cable network
        with real-time risk scoring at chokepoints (Red Sea, Hormuz, Malacca,
        Taiwan Strait).
      </p>
    </div>
  </div>
</template>
