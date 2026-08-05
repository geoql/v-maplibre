<script setup lang="ts">
  import type { Example } from '~/types/examples';

  defineProps<{
    example: Example;
  }>();
</script>

<template>
  <NuxtLink
    :to="example.href"
    class="group relative flex h-full flex-col rounded-md border border-border bg-card p-5 transition-colors hover:bg-muted/40"
  >
    <div
      v-if="example.badge"
      class="absolute top-3 right-3 rounded-sm border border-border bg-background/70 px-2 py-0.5 font-mono text-2xs tracking-caps-xs text-muted-foreground uppercase backdrop-blur-sm"
    >
      {{ example.badge }}
    </div>

    <Icon
      :name="example.icon"
      class="size-5 text-primary transition-transform group-hover:scale-110"
    />

    <h3 class="mt-5 text-base font-medium tracking-tight text-foreground">
      {{ example.title }}
    </h3>

    <p class="mt-2 flex-1 text-sm/relaxed text-muted-foreground">
      {{ example.description }}
    </p>

    <div
      class="mt-4 inline-flex items-center gap-2 font-mono text-2xs tracking-caps-sm text-muted-foreground uppercase opacity-0 transition-opacity group-hover:opacity-100"
    >
      <span class="text-primary">Open</span>
      <Icon name="lucide:arrow-right" class="size-3 text-primary" />
    </div>
  </NuxtLink>
</template>
