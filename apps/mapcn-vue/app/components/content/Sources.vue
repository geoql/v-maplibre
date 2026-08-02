<script setup lang="ts">
  interface Source {
    name: string;
    url: string;
    type?: 'dataset' | 'paper' | 'standard' | 'tool';
  }

  interface Props {
    sources: Source[];
  }

  defineProps<Props>();

  const typeIcons = {
    dataset: 'database',
    paper: 'file-text',
    standard: 'check-circle',
    tool: 'wrench',
  } as const;
</script>

<template>
  <div class="sources-list font-mono text-caption text-muted-foreground">
    <div
      v-for="(source, index) in sources"
      :key="source.url"
      class="source-item inline-flex items-center gap-1.5"
    >
      <Icon
        v-if="source.type && typeIcons[source.type]"
        :name="`heroicons:${typeIcons[source.type]}`"
        class="h-3 w-3 shrink-0"
      />
      <a
        :href="source.url"
        target="_blank"
        rel="noopener noreferrer"
        class="hover:text-foreground transition-colors underline decoration-dotted underline-offset-2"
        >{{ source.name }}</a
      >
      <span
        v-if="source.type"
        class="text-2xs uppercase tracking-wider opacity-60"
        >({{ source.type }})</span
      >
      <span v-if="index < sources.length - 1" class="ml-1 opacity-40">·</span>
    </div>
  </div>
</template>

<style scoped>
  .sources-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .source-item {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }
</style>
