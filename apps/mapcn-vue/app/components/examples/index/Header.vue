<script setup lang="ts">
  defineProps<{
    totalExamples: number;
  }>();
</script>

<template>
  <div class="mb-16 pt-4 md:mb-20">
    <div
      class="mb-6 inline-flex items-center gap-2 font-mono text-caption tracking-caps text-primary uppercase"
    >
      <Icon name="lucide:sparkles" class="size-3" />
      <span class="tabular-nums">{{ totalExamples }} interactive examples</span>
    </div>

    <h1
      class="max-w-headline-sm text-4xl font-extrabold tracking-display text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
    >
      Explore Examples
    </h1>

    <p
      class="mt-6 max-w-measure text-base/relaxed text-muted-foreground md:text-lg"
    >
      What's possible with mapcn-vue. From basic markers to advanced
      <span class="font-medium text-foreground">WebGL visualizations</span>
      — each example is interactive and ready to use.
    </p>

    <div
      class="mt-8 flex flex-wrap items-center gap-6 font-mono text-caption tracking-caps-sm text-muted-foreground uppercase"
    >
      <div class="flex items-center gap-2">
        <span class="relative flex size-1.5">
          <span
            class="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-70"
          ></span>
          <span
            class="relative inline-flex size-1.5 rounded-full bg-success"
          ></span>
        </span>
        <span>All interactive</span>
      </div>
      <div class="flex items-center gap-2">
        <Icon name="lucide:moon" class="size-3" />
        <span>Dark mode ready</span>
      </div>
      <div class="flex items-center gap-2">
        <Icon name="lucide:zap" class="size-3" />
        <span>WebGL accelerated</span>
      </div>
    </div>
  </div>
</template>
