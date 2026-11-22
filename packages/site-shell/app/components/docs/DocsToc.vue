<script setup lang="ts">
  /**
   * "On this page": follows the reader with a sliding accent bar
   * (motion-v layoutId; off under reduced motion).
   */
  import { motion } from 'motion-v';
  import { useActiveHeading } from '#shell/composables/use-active-heading';
  import type { TocItem } from '#shell/types/docs';

  defineProps<{ items: TocItem[] }>();

  const active = useActiveHeading(
    '.prose h1[id], .prose h2[id], .prose h3[id], .prose h4[id]',
  );
</script>

<template>
  <div>
    <div
      class="mb-4 font-mono text-caption tracking-caps text-muted-foreground uppercase"
    >
      On this page
    </div>
    <nav
      v-if="items.length > 0"
      class="flex flex-col gap-px border-l border-border"
    >
      <a
        v-for="item in items"
        :key="item.id"
        :href="`#${item.id}`"
        :aria-current="active === item.id ? 'true' : undefined"
        class="relative py-1.5 text-sm transition-colors"
        :class="[
          item.level === 3 ? 'pl-8' : 'pl-4',
          active === item.id
            ? 'font-medium text-primary'
            : 'text-muted-foreground hover:text-foreground',
        ]"
      >
        <motion.span
          v-if="active === item.id"
          layout-id="docs-toc-indicator"
          class="absolute inset-y-0 -left-px w-px bg-primary"
          :transition="{ duration: 0.18, ease: [0.2, 0, 0, 1] }"
        ></motion.span>
        {{ item.text }}
      </a>
    </nav>
    <p v-else class="text-sm text-muted-foreground">No headings found</p>
  </div>
</template>
