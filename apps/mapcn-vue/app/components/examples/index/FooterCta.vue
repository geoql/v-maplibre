<script setup lang="ts">
  import { motion } from 'motion-v';
</script>

<template>
  <div class="mt-24 text-center">
    <motion.div
      :initial="{ opacity: 0, y: 40, scale: 0.95 }"
      :while-in-view="{ opacity: 1, y: 0, scale: 1 }"
      :viewport="{ once: true, margin: '-100px' }"
      :transition="{ type: 'spring', stiffness: 100, damping: 20 }"
      class="relative mx-auto inline-flex flex-col items-center gap-6 overflow-hidden rounded-2xl border border-border/50 bg-card/30 px-8 py-10 backdrop-blur-md sm:px-12"
    >
      <!-- Animated background gradient -->
      <div
        class="pointer-events-none absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-transparent to-cyan-500/5"
      ></div>

      <!-- Animated corner accents -->
      <div
        class="absolute top-0 left-0 size-20 border-t-2 border-l-2 border-primary/20 transition-all duration-500 hover:border-primary/40"
      ></div>
      <div
        class="absolute right-0 bottom-0 size-20 border-r-2 border-b-2 border-cyan-500/20 transition-all duration-500 hover:border-cyan-500/40"
      ></div>

      <!-- Glowing orbs -->
      <div
        class="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-primary/10 blur-3xl"
      ></div>
      <div
        class="pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full bg-cyan-500/10 blur-3xl"
      ></div>

      <!-- Icon with animated ring -->
      <motion.div
        :initial="{ scale: 0, rotate: -180 }"
        :while-in-view="{ scale: 1, rotate: 0 }"
        :viewport="{ once: true }"
        :transition="{ delay: 0.2, type: 'spring', stiffness: 200 }"
        class="relative"
      >
        <div
          class="flex size-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10"
        >
          <Icon name="lucide:code-2" class="size-8 text-primary" />
        </div>
        <!-- Orbiting ring -->
        <div
          class="absolute inset-0 animate-spin rounded-full border border-dashed border-primary/20"
          style="animation-duration: 10s"
        ></div>
      </motion.div>

      <!-- Text content -->
      <motion.div
        :initial="{ opacity: 0, y: 10 }"
        :while-in-view="{ opacity: 1, y: 0 }"
        :viewport="{ once: true }"
        :transition="{ delay: 0.3 }"
        class="max-w-md space-y-3"
      >
        <h3
          class="bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-2xl font-semibold tracking-tight text-transparent"
        >
          Ready to build?
        </h3>
        <p class="text-sm text-muted-foreground">
          Add any component to your project with a single CLI command. Start
          building beautiful maps in minutes.
        </p>
      </motion.div>

      <!-- CTA Buttons -->
      <motion.div
        :initial="{ opacity: 0, y: 10 }"
        :while-in-view="{ opacity: 1, y: 0 }"
        :viewport="{ once: true }"
        :transition="{ delay: 0.4 }"
        class="flex flex-wrap items-center justify-center gap-3"
      >
        <NuxtLink
          to="/docs/introduction"
          class="group relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
        >
          <!-- Shine effect -->
          <div
            class="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full"
          ></div>
          <span class="relative">Get Started</span>
          <Icon
            name="lucide:arrow-right"
            class="relative size-4 transition-transform group-hover:translate-x-1"
          />
        </NuxtLink>

        <a
          href="https://github.com/geoql/v-maplibre"
          target="_blank"
          rel="noopener noreferrer"
          class="group inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border/50 bg-background/50 px-6 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-all hover:border-border hover:bg-background hover:text-foreground"
        >
          <Icon
            name="lucide:github"
            class="size-4 transition-transform group-hover:scale-110"
          />
          <span>View Source</span>
        </a>
      </motion.div>

      <!-- CLI command preview -->
      <motion.div
        :initial="{ opacity: 0 }"
        :while-in-view="{ opacity: 1 }"
        :viewport="{ once: true }"
        :transition="{ delay: 0.5 }"
        class="mt-2 rounded-lg border border-border/30 bg-muted/30 px-4 py-2 font-mono text-xs text-muted-foreground"
      >
        <span class="text-primary">npx</span> shadcn-vue add
        <span class="text-emerald-500">https://mapcn-vue.geoql.in/r/map</span>
      </motion.div>
    </motion.div>
  </div>
</template>
