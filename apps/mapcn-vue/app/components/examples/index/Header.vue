<script setup lang="ts">
  defineProps<{
    totalExamples: number;
  }>();
</script>

<template>
  <div class="mb-16 pt-4 text-center md:mb-20">
    <div
      class="mb-4 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-xs font-medium tracking-wider text-muted-foreground"
    >
      <Icon name="lucide:sparkles" class="size-3.5 text-primary" />
      <span class="font-mono">{{ totalExamples }} Interactive Examples</span>
    </div>

    <h1
      class="gradient-text font-display text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl"
    >
      Explore Examples
    </h1>

    <p
      class="mx-auto mt-5 max-w-2xl text-base/relaxed text-muted-foreground md:text-lg"
    >
      Discover what's possible with mapcn-vue. From basic maps to advanced
      <span class="font-medium text-foreground">WebGL visualizations</span>
      — each example is interactive and ready to use.
    </p>

    <div
      class="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground"
    >
      <div class="flex items-center gap-2">
        <div class="relative size-2">
          <div
            class="absolute inset-0 animate-ping rounded-full bg-emerald-500"
          ></div>
          <div class="absolute inset-0 rounded-full bg-emerald-500"></div>
        </div>
        <span>All interactive</span>
      </div>
      <div class="flex items-center gap-2">
        <Icon name="lucide:moon" class="size-3.5" />
        <span>Dark mode ready</span>
      </div>
      <div class="flex items-center gap-2">
        <Icon name="lucide:zap" class="size-3.5" />
        <span>WebGL accelerated</span>
      </div>
    </div>
  </div>
</template>
