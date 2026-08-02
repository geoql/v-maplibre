<script setup lang="ts">
  import type { GoogleSignificantEvent } from '~/types/flood';

  const props = defineProps<{
    events: GoogleSignificantEvent[];
    loading: boolean;
  }>();

  const showAll = ref(false);
  const PREVIEW_COUNT = 4;

  const visibleEvents = computed(() =>
    showAll.value ? props.events : props.events.slice(0, PREVIEW_COUNT),
  );

  const hasMore = computed(() => props.events.length > PREVIEW_COUNT);

  function formatPopulation(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toString();
  }

  function formatArea(km2: number): string {
    return km2 >= 1000
      ? `${(km2 / 1000).toFixed(0)}K km²`
      : `${km2.toFixed(0)} km²`;
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
  }

  function toggleShowAll(): void {
    showAll.value = !showAll.value;
  }
</script>

<template>
  <div class="p-3">
    <p
      class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
    >
      Significant Events
    </p>

    <div v-if="loading && events.length === 0" class="space-y-1.5">
      <div
        v-for="i in 3"
        :key="i"
        class="h-12 animate-pulse rounded bg-muted"
      />
    </div>

    <div
      v-else-if="events.length === 0"
      class="py-2 text-center text-xs text-muted-foreground"
    >
      No significant events
    </div>

    <div v-else class="space-y-1.5">
      <div
        v-for="event in visibleEvents"
        :key="event.eventPolygonId"
        class="rounded-lg border border-border bg-card/50 p-2"
      >
        <div class="mb-1 flex items-start justify-between gap-2">
          <div class="flex flex-wrap gap-1">
            <span
              v-for="code in event.affectedCountryCodes.slice(0, 3)"
              :key="code"
              class="rounded bg-primary/10 px-1.5 py-0.5 text-2xs font-medium text-primary"
            >
              {{ code }}
            </span>
            <span
              v-if="event.affectedCountryCodes.length > 3"
              class="rounded bg-muted px-1.5 py-0.5 text-2xs text-muted-foreground"
            >
              +{{ event.affectedCountryCodes.length - 3 }}
            </span>
          </div>
          <span class="shrink-0 text-2xs text-muted-foreground">
            {{ formatDate(event.eventInterval.startTime) }}
          </span>
        </div>
        <div class="flex items-center gap-3 text-2xs text-muted-foreground">
          <span>
            <Icon name="lucide:users" class="mr-0.5 inline size-2.5" />
            {{ formatPopulation(event.affectedPopulation) }}
          </span>
          <span>
            <Icon name="lucide:square" class="mr-0.5 inline size-2.5" />
            {{ formatArea(event.areaKm2) }}
          </span>
        </div>
      </div>

      <button
        v-if="hasMore"
        class="w-full py-1 text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
        @click="toggleShowAll"
      >
        {{
          showAll ? 'Show less' : `Show ${events.length - PREVIEW_COUNT} more`
        }}
      </button>
    </div>
  </div>
</template>
