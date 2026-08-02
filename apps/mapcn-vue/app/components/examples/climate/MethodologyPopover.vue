<script setup lang="ts">
  const props = defineProps<{
    open: boolean;
  }>();

  const emit = defineEmits<{
    close: [];
  }>();

  function handleClose(): void {
    emit('close');
  }
</script>

<template>
  <div
    v-if="open"
    class="absolute bottom-10 left-1/2 z-20 -translate-x-1/2 w-95 max-w-viewport-padded rounded-lg border border-border bg-background/95 backdrop-blur-sm p-4 text-xs leading-relaxed text-foreground hidden md:block"
    role="dialog"
    aria-label="Methodology"
  >
    <button
      type="button"
      class="absolute top-2 right-2 size-6 rounded-md border border-border bg-muted/50 text-foreground cursor-pointer text-xs leading-none flex items-center justify-center hover:bg-muted"
      aria-label="Close"
      @click="handleClose"
    >
      <Icon name="lucide:x" class="size-3" />
    </button>

    <h3
      class="mt-0 mb-2 text-caption font-medium uppercase tracking-caps font-mono text-muted-foreground"
    >
      Methodology
    </h3>
    <p class="mb-2">
      <b>Climate data.</b> Köppen-Geiger 1991–2020 classifications (10 km
      resolution) from Beck et al. 2023.
    </p>
    <p class="mb-2">
      <b>Country borders.</b> Natural Earth 10 m admin boundaries.
    </p>
    <p class="mb-2">
      <b>Country matching.</b> For each Köppen class, every country is ranked by
      total area of that class. The top-ranked country (excluding the one you're
      viewing) is the "match".
    </p>
    <p class="mb-2">
      <b>Greedy de-duplication.</b> Larger zones get priority when multiple
      zones share the same match.
    </p>
    <p>
      <b>Shuffle.</b> ↺ steps through the ranking for a single region or all
      regions at once.
    </p>
  </div>
</template>
