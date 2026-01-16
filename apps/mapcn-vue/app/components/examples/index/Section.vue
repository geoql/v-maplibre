<script setup lang="ts">
  import { motion } from 'motion-v';
  import type { ExampleCategory } from '~/types/examples';

  defineProps<{
    category: ExampleCategory;
    categoryIndex: number;
  }>();

  function getCardDelay(categoryIndex: number, exampleIndex: number): number {
    return 0.5 + categoryIndex * 0.1 + exampleIndex * 0.05;
  }
</script>

<template>
  <motion.section
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ delay: 0.4 + categoryIndex * 0.1 }"
  >
    <div class="mb-8 flex items-center gap-4">
      <div
        class="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-sm"
      >
        <Icon :name="category.icon" class="size-6 text-primary" />
      </div>
      <div>
        <h2 class="text-2xl font-semibold tracking-tight">
          {{ category.title }}
        </h2>
        <p class="text-sm text-muted-foreground">
          {{ category.description }}
        </p>
      </div>
      <div
        class="ml-auto hidden h-px flex-1 bg-linear-to-r from-border to-transparent md:block"
      ></div>
      <div
        class="hidden rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs text-muted-foreground md:block"
      >
        {{ category.examples.length }} examples
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <ExamplesIndexCard
        v-for="(example, exampleIndex) in category.examples"
        :key="example.href"
        :example="example"
        :delay="getCardDelay(categoryIndex, exampleIndex)"
      />
    </div>
  </motion.section>
</template>
