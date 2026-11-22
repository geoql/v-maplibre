<script setup lang="ts">
  import type { DocsNavItem } from '#shell/types/docs';

  defineProps<{
    prev?: DocsNavItem | null;
    next?: DocsNavItem | null;
  }>();

  const CARD =
    'group flex flex-col rounded-md border border-border bg-card p-5 transition-colors hover:bg-muted/40';
  const LABEL =
    'mb-3 inline-flex items-center gap-2 font-mono text-2xs tracking-caps text-muted-foreground uppercase';
</script>

<template>
  <div class="mt-6 grid grid-cols-2 gap-3">
    <NuxtLink v-if="prev" :to="prev.path" :class="CARD">
      <span :class="LABEL">
        <Icon
          name="lucide:arrow-left"
          class="size-3 transition-transform group-hover:-translate-x-0.5"
        />
        Previous
      </span>
      <div class="flex items-center gap-3">
        <Icon :name="prev.icon" class="size-4 text-primary" />
        <span class="font-medium text-foreground">{{ prev.title }}</span>
      </div>
    </NuxtLink>
    <div v-else></div>

    <NuxtLink
      v-if="next"
      :to="next.path"
      :class="[CARD, 'items-end text-right']"
    >
      <span :class="LABEL">
        Next
        <Icon
          name="lucide:arrow-right"
          class="size-3 transition-transform group-hover:translate-x-0.5"
        />
      </span>
      <div class="flex items-center gap-3">
        <span class="font-medium text-foreground">{{ next.title }}</span>
        <Icon :name="next.icon" class="size-4 text-primary" />
      </div>
    </NuxtLink>
  </div>
</template>
