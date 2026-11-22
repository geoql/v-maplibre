<script setup lang="ts">
  import type { SiteLink } from '#shell/types/docs';
  import type { SearchSection } from '#shell/utils/rank-sections';

  const links: SiteLink[] = [
    { label: 'Docs home', to: '/', icon: 'lucide:book-open' },
    {
      label: 'Examples',
      to: 'https://mapcn-vue.geoql.in/examples',
      icon: 'lucide:map',
      external: true,
    },
  ];

  const searchOpen = ref(false);
  const sections = ref<SearchSection[]>([]);

  // Sections load on first open, so pages do not ship the search index.
  watch(searchOpen, async (open) => {
    if (open && sections.value.length === 0) {
      sections.value = await queryCollectionSearchSections('docs');
    }
  });
</script>

<template>
  <div class="relative">
    <SiteToolbar :links="links" class="absolute left-3 top-3 z-30">
      <button
        type="button"
        data-search-open
        class="pointer-events-auto inline-flex h-7 items-center gap-2 rounded-lg border border-border bg-background/80 px-2 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
        @click="searchOpen = true"
      >
        <Icon name="lucide:search" class="size-3.5" />
        <span class="hidden text-xs sm:inline">Search</span>
        <kbd class="hidden font-mono text-2xs sm:inline">⌘K</kbd>
      </button>
    </SiteToolbar>
    <SearchPalette
      v-model:open="searchOpen"
      :sections="sections"
      @select="(id) => navigateTo(id)"
    />
    <div id="main-content" tabindex="-1" class="outline-none">
      <slot></slot>
    </div>
  </div>
</template>
