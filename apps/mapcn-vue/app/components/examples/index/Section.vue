<script setup lang="ts">
  import type { ExampleCategory } from '~/types/examples';

  defineProps<{
    category: ExampleCategory;
  }>();
</script>

<template>
  <section>
    <!-- Section header -->
    <div class="mb-8 flex items-center gap-4">
      <div
        class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/30"
      >
        <Icon :name="category.icon" class="size-5 text-primary" />
      </div>

      <div class="flex-1">
        <h2 class="text-xl font-semibold tracking-tight">
          {{ category.title }}
        </h2>
        <p class="text-sm text-muted-foreground">
          {{ category.description }}
        </p>
      </div>

      <div
        class="hidden rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-xs text-muted-foreground md:block"
      >
        {{ category.examples.length }} examples
      </div>
    </div>

    <!-- Examples grid -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <ExamplesIndexCard
        v-for="example in category.examples"
        :key="example.href"
        :example="example"
      />
    </div>
  </section>
</template>
