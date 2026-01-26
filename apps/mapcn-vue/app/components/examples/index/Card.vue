<script setup lang="ts">
  import { motion } from 'motion-v';
  import type { Example } from '~/types/examples';

  defineProps<{
    example: Example;
    delay: number;
  }>();
</script>

<template>
  <motion.div
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ delay }"
    :while-hover="{ y: -4 }"
    class="h-full"
  >
    <NuxtLink
      :to="example.href"
      class="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5"
    >
      <div
        class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        <div
          class="absolute -inset-px rounded-xl bg-linear-to-b from-primary/10 via-transparent to-transparent"
        ></div>
      </div>

      <div
        v-if="example.badge"
        class="absolute top-3 right-3 rounded-full bg-linear-to-r from-primary/90 to-violet-500/90 px-2 py-0.5 text-[10px] font-medium text-white"
      >
        {{ example.badge }}
      </div>

      <div
        class="relative mb-4 flex size-11 items-center justify-center rounded-lg border border-border/50 bg-muted/50 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/10"
      >
        <Icon
          :name="example.icon"
          class="size-5 text-muted-foreground transition-colors duration-300 group-hover:text-primary"
        />
      </div>

      <h3
        class="relative mb-2 font-semibold tracking-tight transition-colors duration-300 group-hover:text-primary"
      >
        {{ example.title }}
      </h3>
      <p class="relative flex-1 text-sm/relaxed text-muted-foreground">
        {{ example.description }}
      </p>

      <div
        class="absolute right-4 bottom-4 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
      >
        <Icon name="lucide:arrow-right" class="size-4 text-primary" />
      </div>
    </NuxtLink>
  </motion.div>
</template>
