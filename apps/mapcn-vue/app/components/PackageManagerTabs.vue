<script setup lang="ts">
  import { useClipboard } from '@vueuse/core';
  import type { PackageManager } from '~/types/examples';

  const props = defineProps<{
    registry: string;
  }>();

  const managers: PackageManager[] = [
    { id: 'npm', label: 'npm', prefix: 'npx' },
    { id: 'pnpm', label: 'pnpm', prefix: 'pnpm dlx' },
    { id: 'yarn', label: 'yarn', prefix: 'npx' },
    { id: 'bun', label: 'bun', prefix: 'bunx --bun' },
  ];

  const selected = ref('npm');

  const installCommand = computed(() => {
    const mgr = managers.find((m) => m.id === selected.value);
    const prefix = mgr?.prefix ?? 'npx';
    return `${prefix} shadcn-vue@latest add https://mapcn-vue.geoql.in/r/${props.registry}`;
  });

  const { copy, copied } = useClipboard({ source: installCommand });

  const TAB_BASE =
    'rounded-md px-2 py-0.5 text-xs font-medium transition-colors';
  const TAB_SELECTED = 'bg-muted text-foreground';
  const TAB_IDLE = 'text-muted-foreground hover:text-foreground';

  function getTabClass(id: string): string {
    return `${TAB_BASE} ${selected.value === id ? TAB_SELECTED : TAB_IDLE}`;
  }
</script>

<template>
  <div class="rounded-xl border border-border/50 bg-card">
    <div
      class="flex items-center justify-between border-b border-border/50 px-4 py-2"
    >
      <span class="text-xs font-medium text-muted-foreground"
        >Installation</span
      >
      <div class="flex gap-1">
        <button
          v-for="mgr in managers"
          :key="mgr.id"
          :class="getTabClass(mgr.id)"
          @click="selected = mgr.id"
        >
          <span class="font-mono text-2xs text-muted-foreground/60">&gt;_</span>
          {{ mgr.label }}
        </button>
      </div>
    </div>
    <div class="flex items-center gap-2 px-4 py-3">
      <code class="flex-1 truncate font-mono text-xs text-foreground/80">
        <span class="text-muted-foreground/60">$</span> {{ installCommand }}
      </code>
      <button
        class="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
        :class="copied ? 'text-foreground' : ''"
        :aria-label="copied ? 'Copied' : 'Copy command'"
        @click="copy(installCommand)"
      >
        <Icon
          :name="copied ? 'lucide:check' : 'lucide:copy'"
          class="size-3.5"
        />
      </button>
    </div>
  </div>
</template>
