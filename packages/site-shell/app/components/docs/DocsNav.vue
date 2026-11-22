<script setup lang="ts">
  /**
   * Docs navigation. One accent bar marks the active page and slides to the
   * next one on navigation (motion-v layoutId; off under reduced motion).
   */
  import { motion } from 'motion-v';
  import type { DocsNavGroup } from '#shell/types/docs';
  import { INDICATOR_TRANSITION } from '#shell/utils/motion';

  defineProps<{
    groups: DocsNavGroup[];
    /** Distinguishes the desktop rail from the mobile sheet, so the two
     * indicators never animate into each other. */
    indicatorId?: string;
  }>();

  defineEmits<{ navigate: [] }>();
</script>

<template>
  <div class="flex flex-col gap-6">
    <div v-for="group in groups" :key="group.label">
      <div
        class="mb-3 font-mono text-caption tracking-caps text-muted-foreground uppercase"
      >
        {{ group.label }}
      </div>
      <nav class="flex flex-col gap-px border-l border-border">
        <NuxtLink
          v-for="item in group.items"
          :key="item.path"
          :to="item.path"
          :aria-current="item.active ? 'page' : undefined"
          class="relative flex items-center gap-2.5 py-1.5 pl-4 text-sm transition-colors"
          :class="
            item.active
              ? 'font-medium text-primary'
              : 'text-muted-foreground hover:text-foreground'
          "
          @click="$emit('navigate')"
        >
          <motion.span
            v-if="item.active"
            :layout-id="indicatorId ?? 'docs-nav-indicator'"
            class="absolute inset-y-0 -left-px w-px bg-primary"
            :transition="INDICATOR_TRANSITION"
          ></motion.span>
          <Icon :name="item.icon" class="size-3.5" />
          {{ item.title }}
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>
