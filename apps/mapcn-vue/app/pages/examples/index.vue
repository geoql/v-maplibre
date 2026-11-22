<script setup lang="ts">
  usePageGeo({
    title: 'Examples - mapcn-vue',
    description: 'Interactive map examples built with mapcn-vue components.',
  });
  useSeoMeta({
    title: 'Examples - mapcn-vue',
    description: 'Interactive map examples built with mapcn-vue components.',
    ogTitle: 'Examples - mapcn-vue',
    ogDescription: 'Interactive map examples built with mapcn-vue components.',
    ogType: 'website',
    ogSiteName: 'mapcn-vue',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Examples - mapcn-vue',
    twitterDescription:
      'Interactive map examples built with mapcn-vue components.',
  });

  defineOgImage('SiteDoc', {
    title: 'Examples',
    description: 'Interactive map examples built with mapcn-vue components.',
    category: 'Examples',
  });

  const {
    featured,
    chips,
    query,
    active,
    visible,
    showFeatured,
    matchCount,
    totalExamples,
    reset,
  } = useExamplesGallery();
</script>

<template>
  <div class="relative min-h-dvh">
    <ExamplesIndexBackground />

    <div class="container max-w-screen-2xl py-12 md:py-20">
      <div class="mx-auto w-full max-w-6xl px-4">
        <ExamplesIndexHeader :total-examples="totalExamples" />

        <ExamplesIndexFeatured v-if="showFeatured" :examples="featured" />

        <ExamplesIndexFilters
          v-model:query="query"
          v-model:active="active"
          :chips="chips"
          :match-count="matchCount"
        />

        <div class="space-y-20">
          <ExamplesIndexSection
            v-for="category in visible"
            :key="category.id"
            :category="category"
          />
        </div>

        <div
          v-if="visible.length === 0"
          class="flex flex-col items-start gap-3 rounded-md border border-dashed border-border p-8"
        >
          <p class="text-sm text-muted-foreground">
            No examples match
            <span class="font-mono text-foreground">“{{ query }}”</span>.
          </p>
          <Button variant="outline" size="sm" @click="reset">
            Clear filters
          </Button>
        </div>

        <ExamplesIndexFooterCta />
      </div>
    </div>
  </div>
</template>
