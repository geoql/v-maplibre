<script setup lang="ts">
  import type { BusFeature, TripAverageSpeeds } from '~/types/actransit';

  interface Props {
    busCount: number;
    totalBuses: number;
    loading: boolean;
    error: string | null;
    routeFilter: string;
    selectedBus: BusFeature | null;
    tripAverageSpeeds: TripAverageSpeeds;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    'update:routeFilter': [value: string];
    refresh: [];
    clearFilters: [];
  }>();

  const filterValue = computed({
    get: () => props.routeFilter,
    set: (value: string) => emit('update:routeFilter', value),
  });
</script>

<template>
  <div
    class="absolute top-4 left-4 z-10 w-72 rounded-lg bg-background/95 p-4 shadow-lg backdrop-blur-sm"
  >
    <h3 class="mb-3 flex items-center gap-2 text-lg font-semibold">
      <Icon name="lucide:bus" class="size-5" />
      AC Transit Live
    </h3>

    <div v-if="loading" class="flex items-center gap-2 text-muted-foreground">
      <Icon name="lucide:loader-2" class="size-4 animate-spin" />
      Loading...
    </div>

    <div
      v-else-if="error"
      class="rounded-md bg-destructive/10 p-2 text-sm text-destructive"
    >
      {{ error }}
    </div>

    <div v-else class="space-y-3">
      <div class="flex items-center gap-2 text-sm">
        <span
          class="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground"
        >
          {{ busCount }}
        </span>
        buses tracked
        <span
          v-if="routeFilter && busCount !== totalBuses"
          class="text-muted-foreground"
        >
          (of {{ totalBuses }})
        </span>
      </div>

      <p class="flex items-center gap-1 text-xs text-muted-foreground">
        <Icon name="lucide:refresh-cw" class="size-3" />
        Updates every 30s
      </p>

      <div class="space-y-1">
        <label class="text-xs font-medium">Route Filter</label>
        <input
          v-model="filterValue"
          type="text"
          placeholder="e.g., 33, 51, 800..."
          class="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
        />
        <p v-if="routeFilter" class="text-xs text-muted-foreground italic">
          Showing routes containing "{{ routeFilter }}"
        </p>
      </div>

      <div v-if="selectedBus" class="rounded-md border bg-muted/50 p-2">
        <p class="text-xs font-medium">Selected Bus</p>
        <p class="text-sm"><strong>Route:</strong> {{ selectedBus.routeId }}</p>
        <p class="text-sm"><strong>Trip:</strong> {{ selectedBus.tripId }}</p>
        <p class="text-sm">
          <strong>Speed:</strong> {{ Math.round(selectedBus.speed) }} mph
        </p>
        <p v-if="tripAverageSpeeds[selectedBus.tripId]" class="text-sm">
          <strong>Avg:</strong>
          {{ tripAverageSpeeds[selectedBus.tripId] }} mph
        </p>
      </div>

      <div class="flex gap-2">
        <button
          class="flex-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          :disabled="loading"
          @click="emit('refresh')"
        >
          <Icon
            name="lucide:refresh-cw"
            class="mr-1 inline-block size-3"
            :class="{ 'animate-spin': loading }"
          />
          Refresh
        </button>
        <button
          class="flex-1 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          @click="emit('clearFilters')"
        >
          <Icon name="lucide:globe" class="mr-1 inline-block size-3" />
          Show All
        </button>
      </div>
    </div>
  </div>
</template>
