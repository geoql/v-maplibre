<script setup lang="ts">
  useSeoMeta({
    title: 'Examples - mapcn-vue',
    description: 'Interactive map examples built with mapcn-vue components.',
  });

  const { categories, totalExamples } = useExamplesData();
</script>

<template>
  <div class="relative min-h-dvh">
    <ExamplesIndexBackground />

    <div class="container max-w-screen-2xl py-12 md:py-20">
      <div class="mx-auto w-full max-w-6xl px-4">
        <ExamplesIndexHeader :total-examples="totalExamples" />

        <div class="space-y-20">
          <ExamplesIndexSection
            v-for="(category, categoryIndex) in categories"
            :key="category.id"
            :category="category"
            :category-index="categoryIndex"
          />
        </div>

        <ExamplesIndexFooterCta />
      </div>
    </div>
  </div>
</template>
