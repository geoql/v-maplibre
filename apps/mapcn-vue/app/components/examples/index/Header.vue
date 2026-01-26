<script setup lang="ts">
  import { motion } from 'motion-v';

  const props = defineProps<{
    totalExamples: number;
  }>();

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  // Animated counter for total examples
  const displayCount = ref(0);

  onMounted(() => {
    const duration = 1500;
    const steps = 30;
    const increment = props.totalExamples / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= props.totalExamples) {
        displayCount.value = props.totalExamples;
        clearInterval(timer);
      } else {
        displayCount.value = Math.floor(current);
      }
    }, duration / steps);
  });
</script>

<template>
  <div class="relative mb-20 text-center">
    <!-- Top decorative elements -->
    <div class="absolute -top-10 left-1/2 -translate-x-1/2">
      <motion.div
        :initial="{ scale: 0, opacity: 0 }"
        :animate="{ scale: 1, opacity: 1 }"
        :transition="{ delay: 0.1, type: 'spring', stiffness: 200 }"
        class="relative"
      >
        <!-- Glowing orb -->
        <div
          class="size-20 rounded-full bg-linear-to-br from-primary/30 via-violet-500/20 to-cyan-500/30 blur-2xl"
        ></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div
            class="size-2 animate-pulse rounded-full bg-primary shadow-lg shadow-primary/50"
          ></div>
        </div>
      </motion.div>
    </div>

    <!-- Animated line -->
    <motion.div
      :initial="{ scaleX: 0 }"
      :animate="{ scaleX: 1 }"
      :transition="{ delay: 0.2, duration: 0.8 }"
      class="mx-auto mb-8 h-px w-40 origin-center bg-linear-to-r from-transparent via-primary to-transparent"
    />

    <!-- Badge with glow -->
    <motion.div
      v-bind="fadeUp"
      :transition="{ delay: 0.1, type: 'spring', stiffness: 200 }"
      class="relative mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-medium tracking-wider text-primary backdrop-blur-sm"
    >
      <!-- Animated sparkle -->
      <motion.div
        :animate="{ rotate: 360 }"
        :transition="{ duration: 4, repeat: Infinity, ease: 'linear' }"
      >
        <Icon name="lucide:sparkles" class="size-3.5" />
      </motion.div>
      <span class="font-mono">{{ displayCount }} Interactive Examples</span>
      <!-- Glow effect -->
      <div
        class="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-xl"
      ></div>
    </motion.div>

    <!-- Main title with gradient -->
    <motion.h1
      v-bind="fadeUp"
      :transition="{ delay: 0.2 }"
      class="relative mb-6"
    >
      <span
        class="bg-linear-to-b from-foreground via-foreground to-foreground/40 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl"
      >
        Explore Examples
      </span>
      <!-- Underline glow -->
      <motion.div
        :initial="{ scaleX: 0, opacity: 0 }"
        :animate="{ scaleX: 1, opacity: 1 }"
        :transition="{ delay: 0.5, duration: 0.6 }"
        class="absolute -bottom-2 left-1/2 h-1 w-48 -translate-x-1/2 origin-center rounded-full bg-linear-to-r from-primary/0 via-primary/50 to-primary/0 blur-sm"
      />
    </motion.h1>

    <!-- Description -->
    <motion.p
      v-bind="fadeUp"
      :transition="{ delay: 0.3 }"
      class="mx-auto max-w-2xl text-lg/relaxed text-muted-foreground md:text-xl"
    >
      Discover what's possible with mapcn-vue. From basic maps to advanced
      <span class="relative inline-block font-medium text-foreground">
        WebGL visualizations
        <span
          class="absolute -bottom-0.5 left-0 h-px w-full bg-linear-to-r from-primary to-violet-500"
        ></span>
      </span>
      — each example is interactive and ready to use.
    </motion.p>

    <!-- Feature badges -->
    <motion.div
      v-bind="fadeUp"
      :transition="{ delay: 0.4 }"
      class="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm"
    >
      <motion.div
        :initial="{ opacity: 0, x: -20 }"
        :animate="{ opacity: 1, x: 0 }"
        :transition="{ delay: 0.5 }"
        class="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-emerald-500"
      >
        <div class="relative size-2">
          <div
            class="absolute inset-0 animate-ping rounded-full bg-emerald-500"
          ></div>
          <div class="absolute inset-0 rounded-full bg-emerald-500"></div>
        </div>
        <span>All interactive</span>
      </motion.div>

      <motion.div
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.6 }"
        class="flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-3 py-1.5 text-violet-500"
      >
        <Icon name="lucide:moon" class="size-4" />
        <span>Dark mode ready</span>
      </motion.div>

      <motion.div
        :initial="{ opacity: 0, x: 20 }"
        :animate="{ opacity: 1, x: 0 }"
        :transition="{ delay: 0.7 }"
        class="flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-amber-500"
      >
        <Icon name="lucide:zap" class="size-4" />
        <span>WebGL accelerated</span>
      </motion.div>
    </motion.div>

    <!-- Scroll indicator -->
    <motion.div
      :initial="{ opacity: 0, y: -10 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 1 }"
      class="mt-12"
    >
      <motion.div
        :animate="{ y: [0, 8, 0] }"
        :transition="{ duration: 2, repeat: Infinity, ease: 'easeInOut' }"
        class="mx-auto flex size-10 items-center justify-center rounded-full border border-border/50 bg-muted/30 backdrop-blur-sm"
      >
        <Icon name="lucide:chevron-down" class="size-5 text-muted-foreground" />
      </motion.div>
    </motion.div>
  </div>
</template>
