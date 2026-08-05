<script setup lang="ts">
  import type { GeocodingResult } from '~/types/weather';

  defineProps<{
    searchResults: GeocodingResult[];
  }>();

  const emit = defineEmits<{
    search: [query: string];
    selectResult: [result: GeocodingResult];
    clear: [];
  }>();

  const searchQuery = ref('');
  const isSearchFocused = ref(false);

  const debouncedSearch = useDebounceFn((query: string) => {
    emit('search', query);
  }, 300);

  function handleInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    searchQuery.value = value;
    debouncedSearch(value);
  }

  function handleSelectResult(result: GeocodingResult): void {
    searchQuery.value = result.name;
    isSearchFocused.value = false;
    emit('selectResult', result);
  }

  function handleClear(): void {
    searchQuery.value = '';
    emit('clear');
  }
</script>

<template>
  <div class="space-y-4 p-4">
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Search City</h3>
      <div class="relative">
        <div class="relative">
          <Icon
            name="lucide:search"
            class="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            :value="searchQuery"
            type="text"
            placeholder="Search for a city..."
            class="w-full rounded-md border border-border bg-background py-2 pr-8 pl-8 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            @input="handleInput"
            @focus="isSearchFocused = true"
          />
          <button
            v-if="searchQuery"
            class="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            @click="handleClear"
          >
            <Icon name="lucide:x" class="size-3.5" />
          </button>
        </div>

        <!-- Search results dropdown -->
        <div
          v-if="isSearchFocused && searchResults.length > 0"
          class="absolute z-20 mt-1 w-full rounded-md border border-border bg-background shadow-lg"
        >
          <button
            v-for="result in searchResults"
            :key="result.id"
            class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors first:rounded-t-md last:rounded-b-md hover:bg-accent"
            @click="handleSelectResult(result)"
          >
            <Icon
              name="lucide:map-pin"
              class="size-3.5 shrink-0 text-muted-foreground"
            />
            <div class="min-w-0">
              <span class="font-medium">{{ result.name }}</span>
              <span class="text-muted-foreground">
                , {{ result.admin1 ? `${result.admin1}, ` : ''
                }}{{ result.country }}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-muted/50 p-3">
      <p class="text-xs text-muted-foreground">
        <strong>Live Data:</strong> Weather from
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary hover:underline"
          >Open-Meteo</a
        >
        (free, no API key). Click any marker to see forecast and air quality.
      </p>
    </div>
  </div>
</template>
