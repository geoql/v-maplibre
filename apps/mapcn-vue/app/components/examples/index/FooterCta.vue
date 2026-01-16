<script setup lang="ts">
  import { motion } from 'motion-v';
</script>

<template>
  <div class="mt-24 text-center">
    <motion.div
      :initial="{ opacity: 0, y: 20 }"
      :while-in-view="{ opacity: 1, y: 0 }"
      :viewport="{ once: true }"
      class="mx-auto inline-flex flex-col items-center gap-6 rounded-2xl border border-border/50 bg-card/30 px-8 py-10 backdrop-blur-md sm:px-12"
    >
      <div
        class="flex size-14 items-center justify-center rounded-full border border-primary/20 bg-primary/10"
      >
        <Icon name="lucide:code-2" class="size-7 text-primary" />
      </div>
      <div class="max-w-md space-y-2">
        <h3 class="text-xl font-semibold tracking-tight">Ready to build?</h3>
        <p class="text-sm text-muted-foreground">
          Add any component to your project with a single CLI command.
        </p>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-3">
        <NuxtLink
          to="/docs/introduction"
          class="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
        >
          Get Started
          <Icon name="lucide:arrow-right" class="size-4" />
        </NuxtLink>
        <a
          href="https://github.com/geoql/v-maplibre"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border/50 bg-background/50 px-5 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-all hover:border-border hover:bg-background hover:text-foreground"
        >
          <Icon name="lucide:github" class="size-4" />
          View Source
        </a>
      </div>
    </motion.div>
  </div>
</template>
