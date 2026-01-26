<script setup lang="ts">
  import { motion } from 'motion-v';

  defineProps<{
    totalExamples: number;
  }>();

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  };

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };
</script>

<template>
  <div class="mb-16 text-center">
    <motion.div
      v-bind="fadeIn"
      class="mx-auto mb-8 h-px w-32 bg-linear-to-r from-transparent via-primary to-transparent"
    />

    <motion.div
      v-bind="fadeUp"
      class="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium tracking-wide text-primary backdrop-blur-sm"
    >
      <Icon name="lucide:sparkles" class="size-3.5" />
      <span>{{ totalExamples }} Interactive Examples</span>
    </motion.div>

    <motion.h1
      v-bind="fadeUp"
      :transition="{ delay: 0.1 }"
      class="mb-6 bg-linear-to-b from-foreground via-foreground to-foreground/50 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl"
    >
      Explore Examples
    </motion.h1>

    <motion.p
      v-bind="fadeUp"
      :transition="{ delay: 0.2 }"
      class="mx-auto max-w-2xl text-lg/relaxed text-muted-foreground md:text-xl"
    >
      Discover what's possible with mapcn-vue. From basic maps to advanced
      <span class="text-foreground">WebGL visualizations</span> — each example
      is interactive and ready to use.
    </motion.p>

    <motion.div
      v-bind="fadeUp"
      :transition="{ delay: 0.3 }"
      class="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm"
    >
      <div class="flex items-center gap-2 text-muted-foreground">
        <div class="size-2 animate-pulse rounded-full bg-emerald-500"></div>
        <span>All examples are interactive</span>
      </div>
      <div class="flex items-center gap-2 text-muted-foreground">
        <Icon name="lucide:moon" class="size-4" />
        <span>Dark mode ready</span>
      </div>
      <div class="flex items-center gap-2 text-muted-foreground">
        <Icon name="lucide:zap" class="size-4" />
        <span>WebGL accelerated</span>
      </div>
    </motion.div>
  </div>
</template>
