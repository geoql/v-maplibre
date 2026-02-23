<script setup lang="ts">
  import type { Example } from '~/types/examples';

  defineProps<{
    example: Example;
  }>();
</script>

<template>
  <NuxtLink
    :to="example.href"
    class="group relative flex h-full flex-col rounded-xl border border-border/50 bg-muted/20 p-5 transition-colors hover:border-primary/30 hover:bg-muted/40"
  >
    <!-- Badge -->
    <div
      v-if="example.badge"
      class="absolute right-3 top-3 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-primary"
    >
      {{ example.badge }}
    </div>

    <!-- Icon -->
    <div
      class="flex size-10 items-center justify-center rounded-lg border border-border/50 bg-background transition-colors group-hover:border-primary/30 group-hover:bg-primary/10"
    >
      <Icon
        :name="example.icon"
        class="size-5 text-muted-foreground transition-colors group-hover:text-primary"
      />
    </div>

    <!-- Title -->
    <h3
      class="mt-3 text-base font-semibold transition-colors group-hover:text-primary"
    >
      {{ example.title }}
    </h3>

    <!-- Description -->
    <p class="mt-1.5 flex-1 text-sm/relaxed text-muted-foreground">
      {{ example.description }}
    </p>

    <!-- Arrow -->
    <div
      class="mt-3 flex items-center gap-1 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
    >
      <span class="text-primary">Explore</span>
      <Icon name="lucide:arrow-right" class="size-3.5 text-primary" />
    </div>
  </NuxtLink>
</template>
