<script setup lang="ts">
  import { motion } from 'motion-v';
  import type { ExampleCategory } from '~/types/examples';

  const props = defineProps<{
    category: ExampleCategory;
    categoryIndex: number;
  }>();

  function getCardDelay(categoryIndex: number, exampleIndex: number): number {
    return 0.3 + categoryIndex * 0.05 + exampleIndex * 0.03;
  }

  // Check if this is the featured section (first one)
  const isFeatured = computed(() => props.categoryIndex === 0);

  // Check if this is the Valhalla section (second one)
  const isValhalla = computed(() => props.categoryIndex === 1);

  // Section-specific accent colors
  const accentGradient = computed(() => {
    if (isFeatured.value)
      return 'from-amber-500/20 via-primary/10 to-violet-500/20';
    if (isValhalla.value)
      return 'from-emerald-500/20 via-cyan-500/10 to-primary/20';
    return 'from-primary/10 via-transparent to-transparent';
  });
</script>

<template>
  <motion.section
    :initial="{ opacity: 0, y: 30 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{
      delay: 0.2 + categoryIndex * 0.08,
      type: 'spring',
      stiffness: 100,
      damping: 20,
    }"
    class="relative"
  >
    <!-- Featured section glow -->
    <div
      v-if="isFeatured"
      class="pointer-events-none absolute -inset-8 -z-10 rounded-3xl bg-linear-to-r opacity-50 blur-3xl"
      :class="accentGradient"
    ></div>

    <!-- Section header -->
    <div class="mb-8 flex items-center gap-4">
      <!-- Icon container with pulse effect for featured -->
      <motion.div
        :initial="{ scale: 0, rotate: -180 }"
        :animate="{ scale: 1, rotate: 0 }"
        :transition="{
          delay: 0.3 + categoryIndex * 0.08,
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }"
        class="relative flex size-12 shrink-0 items-center justify-center rounded-xl border backdrop-blur-sm transition-all duration-300"
        :class="
          isFeatured
            ? 'border-amber-500/30 bg-amber-500/10'
            : isValhalla
              ? 'border-emerald-500/30 bg-emerald-500/10'
              : 'border-primary/20 bg-primary/5'
        "
      >
        <Icon
          :name="category.icon"
          class="size-6 transition-colors"
          :class="
            isFeatured
              ? 'text-amber-500'
              : isValhalla
                ? 'text-emerald-500'
                : 'text-primary'
          "
        />
      </motion.div>

      <!-- Title and description -->
      <motion.div
        :initial="{ opacity: 0, x: -20 }"
        :animate="{ opacity: 1, x: 0 }"
        :transition="{ delay: 0.35 + categoryIndex * 0.08 }"
        class="flex-1"
      >
        <h2
          class="text-2xl font-semibold tracking-tight"
          :class="isFeatured ? 'text-amber-500' : ''"
        >
          {{ category.title }}
        </h2>
        <p class="text-sm text-muted-foreground">
          {{ category.description }}
        </p>
      </motion.div>

      <!-- Decorative line -->
      <motion.div
        :initial="{ scaleX: 0 }"
        :animate="{ scaleX: 1 }"
        :transition="{ delay: 0.4 + categoryIndex * 0.08, duration: 0.6 }"
        class="ml-auto hidden h-px flex-1 origin-left bg-linear-to-r from-border to-transparent md:block"
      />

      <!-- Example count badge -->
      <motion.div
        :initial="{ opacity: 0, scale: 0.8 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{ delay: 0.5 + categoryIndex * 0.08 }"
        class="hidden rounded-full border px-3 py-1 text-xs md:block"
        :class="
          isFeatured
            ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
            : isValhalla
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
              : 'border-border/50 bg-muted/50 text-muted-foreground'
        "
      >
        {{ category.examples.length }} examples
      </motion.div>
    </div>

    <!-- Examples grid -->
    <div
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      :class="isFeatured ? 'xl:grid-cols-3' : 'xl:grid-cols-4'"
    >
      <ExamplesIndexCard
        v-for="(example, exampleIndex) in category.examples"
        :key="example.href"
        :example="example"
        :delay="getCardDelay(categoryIndex, exampleIndex)"
        :featured="isFeatured"
      />
    </div>

    <!-- Featured section bottom border -->
    <motion.div
      v-if="isFeatured"
      :initial="{ scaleX: 0 }"
      :animate="{ scaleX: 1 }"
      :transition="{ delay: 0.8, duration: 0.8 }"
      class="mt-12 h-px w-full origin-center bg-linear-to-r from-transparent via-amber-500/30 to-transparent"
    />
  </motion.section>
</template>
