<script setup lang="ts">
  const emit = defineEmits<{
    openMethodology: [];
  }>();
</script>

<template>
  <div
    class="absolute bottom-1.5 left-1/2 z-10 -translate-x-1/2 font-mono text-2xs text-muted-foreground bg-background/80 border border-border px-2.5 py-1 rounded-md inline-flex items-center gap-2 whitespace-nowrap backdrop-blur-sm"
  >
    <span class="hidden sm:inline"
      >Köppen-Geiger 1991–2020 (10 km) · Beck et al. 2023 · boundaries: Natural
      Earth</span
    >
    <button
      type="button"
      class="bg-transparent border-none p-0 text-primary cursor-pointer underline text-2xs uppercase tracking-wide hover:text-primary/80"
      @click="emit('openMethodology')"
    >
      Methodology
    </button>
  </div>
</template>
