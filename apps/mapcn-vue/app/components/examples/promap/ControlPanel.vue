<script setup lang="ts">
  import type {
    ViewMode,
    ViewportStats,
    PromapSearchResult,
  } from '~/types/promap';
  import { formatPrice, formatChange } from '~/composables/use-promap-data';

  defineProps<{
    viewMode: ViewMode;
    localView: boolean;
    stats: ViewportStats;
    searchResults: PromapSearchResult[];
    totalPoints: number;
  }>();

  const emit = defineEmits<{
    setMode: [mode: ViewMode];
    toggleLocalView: [];
    search: [query: string];
    selectResult: [result: PromapSearchResult];
  }>();

  const searchInput = ref('');

  const debouncedSearch = useDebounceFn((query: string) => {
    emit('search', query);
  }, 200);

  function handleSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    searchInput.value = value;
    debouncedSearch(value);
  }

  function handleSelectResult(result: PromapSearchResult): void {
    searchInput.value = '';
    emit('search', '');
    emit('selectResult', result);
  }
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- Title -->
    <div>
      <h3 class="text-sm font-semibold">US Home Price Explorer</h3>
      <p class="mt-0.5 text-[11px] text-muted-foreground">
        {{ totalPoints.toLocaleString() }} ZIP codes · Quintile-bucketed
      </p>
    </div>

    <!-- Mode toggle -->
    <div>
      <label class="mb-1.5 block text-xs font-medium">View Mode</label>
      <div
        class="flex gap-1 rounded-lg border border-border/50 bg-muted/50 p-1"
      >
        <button
          class="flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          :class="
            viewMode === 'levels'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          "
          @click="emit('setMode', 'levels')"
        >
          <Icon name="lucide:dollar-sign" class="mr-1 inline size-3" />
          Levels
        </button>
        <button
          class="flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          :class="
            viewMode === 'changes'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          "
          @click="emit('setMode', 'changes')"
        >
          <Icon name="lucide:trending-up" class="mr-1 inline size-3" />
          Changes
        </button>
      </div>
    </div>

    <!-- LocalView toggle -->
    <div
      class="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2"
    >
      <div>
        <p class="text-xs font-medium">LocalView</p>
        <p class="text-[10px] text-muted-foreground">
          Re-bucket colors for visible area
        </p>
      </div>
      <button
        class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors"
        :class="localView ? 'bg-primary' : 'bg-muted-foreground/30'"
        role="switch"
        :aria-checked="localView"
        @click="emit('toggleLocalView')"
      >
        <span
          class="pointer-events-none inline-block size-4 rounded-full bg-white shadow-lg ring-0 transition-transform"
          :class="localView ? 'translate-x-4' : 'translate-x-0'"
        ></span>
      </button>
    </div>

    <!-- Search -->
    <div class="relative">
      <label class="mb-1.5 block text-xs font-medium">Search</label>
      <div class="relative">
        <Icon
          name="lucide:search"
          class="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
        />
        <input
          :value="searchInput"
          type="text"
          placeholder="City, state, or ZIP..."
          class="w-full rounded-md border border-border/50 bg-background py-1.5 pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary/30"
          @input="handleSearchInput"
        />
      </div>
      <!-- Search results dropdown -->
      <div
        v-if="searchResults.length > 0"
        class="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-auto rounded-md border bg-popover shadow-lg"
      >
        <button
          v-for="result in searchResults"
          :key="result.zip"
          class="flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-accent"
          @click="handleSelectResult(result)"
        >
          <div>
            <span class="font-medium"
              >{{ result.city }}, {{ result.state }}</span
            >
            <span class="ml-1.5 text-muted-foreground">{{ result.zip }}</span>
          </div>
          <span class="text-muted-foreground">
            {{ formatPrice(result.price) }}
          </span>
        </button>
      </div>
    </div>

    <!-- Viewport stats -->
    <div class="border-t border-border/50 pt-3">
      <p
        class="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
      >
        Viewport Stats
      </p>
      <div class="grid grid-cols-2 gap-2">
        <div class="rounded-md bg-muted/40 px-2.5 py-1.5">
          <p class="text-[10px] text-muted-foreground">ZIP Codes</p>
          <p class="text-sm font-semibold">
            {{ stats.count.toLocaleString() }}
          </p>
        </div>
        <div class="rounded-md bg-muted/40 px-2.5 py-1.5">
          <p class="text-[10px] text-muted-foreground">Median Price</p>
          <p class="text-sm font-semibold">
            {{ formatPrice(stats.medianPrice) }}
          </p>
        </div>
        <div class="rounded-md bg-muted/40 px-2.5 py-1.5">
          <p class="text-[10px] text-muted-foreground">Avg Change</p>
          <p class="text-sm font-semibold">
            {{ formatChange(stats.avgChange) }}
          </p>
        </div>
        <div class="rounded-md bg-muted/40 px-2.5 py-1.5">
          <p class="text-[10px] text-muted-foreground">Price Range</p>
          <p class="text-sm font-semibold">
            {{ formatPrice(stats.minPrice) }}–{{ formatPrice(stats.maxPrice) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Data attribution (required by Zillow CC BY 4.0 + SimpleMaps CC BY 4.0) -->
    <div class="border-t border-border/50 pt-3">
      <p class="text-[10px] leading-relaxed text-muted-foreground/60">
        Data:
        <a
          href="https://www.zillow.com/research/data/"
          target="_blank"
          rel="noopener"
          class="underline hover:text-muted-foreground"
          >Zillow ZHVI</a
        >
        ·
        <a
          href="https://simplemaps.com/data/us-zips"
          target="_blank"
          rel="noopener"
          class="underline hover:text-muted-foreground"
          >SimpleMaps</a
        >
      </p>
    </div>
  </div>
</template>
