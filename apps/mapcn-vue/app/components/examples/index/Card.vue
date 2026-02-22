<script setup lang="ts">
  import { motion } from 'motion-v';
  import type { Example } from '~/types/examples';

  defineProps<{
    example: Example;
    delay: number;
    featured?: boolean;
  }>();

  const isHovered = ref(false);
</script>

<template>
  <motion.div
    :initial="{ opacity: 0, y: 20, scale: 0.95 }"
    :animate="{ opacity: 1, y: 0, scale: 1 }"
    :transition="{ delay, type: 'spring', stiffness: 200, damping: 20 }"
    class="h-full"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <NuxtLink
      :to="example.href"
      class="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:bg-card/80 hover:shadow-xl hover:shadow-primary/5"
      :class="{ 'border-primary/20 bg-primary/5': featured }"
    >
      <!-- Animated gradient background on hover -->
      <div
        class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      >
        <div
          class="absolute -inset-px rounded-xl bg-linear-to-b from-primary/10 via-transparent to-transparent"
        ></div>
        <!-- Animated glow effect -->
        <div
          class="absolute -top-20 -right-20 size-40 rounded-full bg-primary/20 blur-3xl transition-all duration-700 group-hover:scale-150"
        ></div>
      </div>

      <!-- Scanning line effect -->
      <div
        class="pointer-events-none absolute inset-0 overflow-hidden rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        <div
          class="absolute -top-full left-0 h-full w-full bg-linear-to-b from-transparent via-primary/5 to-transparent transition-transform duration-1000 group-hover:translate-y-[200%]"
        ></div>
      </div>

      <!-- Badge -->
      <div
        v-if="example.badge"
        class="absolute top-3 right-3 z-10 rounded-full bg-linear-to-r from-primary/90 to-cyan-500/90 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white shadow-lg shadow-primary/20"
      >
        {{ example.badge }}
      </div>

      <!-- Icon with animated border -->
      <div class="relative mb-4">
        <motion.div
          :animate="{
            scale: isHovered ? 1.05 : 1,
            rotate: isHovered ? 3 : 0,
          }"
          :transition="{ type: 'spring', stiffness: 400, damping: 15 }"
          class="flex size-12 items-center justify-center rounded-xl border border-border/50 bg-muted/50 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:shadow-lg group-hover:shadow-primary/10"
        >
          <Icon
            :name="example.icon"
            class="size-5 text-muted-foreground transition-all duration-300 group-hover:scale-110 group-hover:text-primary"
          />
        </motion.div>
        <!-- Orbiting dot on hover -->
        <div
          class="absolute -right-1 -bottom-1 size-2 rounded-full bg-primary opacity-0 shadow-lg shadow-primary/50 transition-opacity duration-300 group-hover:opacity-100"
        >
          <div
            class="absolute inset-0 animate-ping rounded-full bg-primary"
          ></div>
        </div>
      </div>

      <!-- Title with underline animation -->
      <h3
        class="relative mb-2 font-semibold tracking-tight transition-colors duration-300 group-hover:text-primary"
      >
        {{ example.title }}
        <span
          class="absolute -bottom-0.5 left-0 h-px w-0 bg-linear-to-r from-primary to-cyan-500 transition-all duration-500 group-hover:w-full"
        ></span>
      </h3>

      <!-- Description -->
      <p
        class="relative flex-1 text-sm/relaxed text-muted-foreground transition-colors duration-300 group-hover:text-muted-foreground/80"
      >
        {{ example.description }}
      </p>

      <!-- Arrow indicator -->
      <div
        class="absolute right-4 bottom-4 flex items-center gap-1 opacity-0 transition-all duration-300 group-hover:opacity-100"
      >
        <span class="text-xs text-primary">Explore</span>
        <motion.div
          :animate="{ x: isHovered ? 4 : 0 }"
          :transition="{ type: 'spring', stiffness: 300, damping: 20 }"
        >
          <Icon name="lucide:arrow-right" class="size-4 text-primary" />
        </motion.div>
      </div>

      <!-- Corner accents -->
      <div
        class="absolute top-0 left-0 size-8 border-t border-l border-primary/0 transition-all duration-500 group-hover:border-primary/30"
      ></div>
      <div
        class="absolute right-0 bottom-0 size-8 border-r border-b border-primary/0 transition-all duration-500 group-hover:border-primary/30"
      ></div>
    </NuxtLink>
  </motion.div>
</template>
