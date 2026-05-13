<script setup lang="ts">
  import type {
    NodeType,
    CommNetworkStats,
    CommNodeTypeConfig,
    CommLink,
  } from '~/types/defense-comms';

  const emit = defineEmits<{
    toggleType: [type: NodeType];
  }>();

  function rgbToStyle(c: [number, number, number]): string {
    return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  }

  const props = defineProps<{
    activeNodeTypes: Set<NodeType>;
    stats: CommNetworkStats;
    nodeTypes: CommNodeTypeConfig[];
    links: CommLink[];
  }>();

  const linkHealth = computed(() => {
    if (props.links.length === 0)
      return { strong: 0, degraded: 0, weak: 0, down: 0 };
    const total = props.links.length;
    return {
      strong: Math.round(
        (props.links.filter((l) => l.status === 'strong').length / total) * 100,
      ),
      degraded: Math.round(
        (props.links.filter((l) => l.status === 'degraded').length / total) *
          100,
      ),
      weak: Math.round(
        (props.links.filter((l) => l.status === 'weak').length / total) * 100,
      ),
      down: Math.round(
        (props.links.filter((l) => l.status === 'down').length / total) * 100,
      ),
    };
  });
</script>

<template>
  <div class="space-y-4 p-4">
    <div class="rounded-lg border border-border bg-card p-3">
      <h3 class="mb-3 text-sm font-semibold">Node Types</h3>
      <div class="space-y-2">
        <button
          v-for="nt in nodeTypes"
          :key="nt.type"
          class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
          :class="{ 'opacity-40': !activeNodeTypes.has(nt.type) }"
          @click="emit('toggleType', nt.type)"
        >
          <span
            class="size-2.5 rounded-full"
            :style="{ backgroundColor: rgbToStyle(nt.color) }"
          />
          <Icon :name="nt.icon" class="size-4" />
          <span class="flex-1 text-left">{{ nt.label }}</span>
          <Icon
            :name="
              activeNodeTypes.has(nt.type) ? 'lucide:eye' : 'lucide:eye-off'
            "
            class="size-3.5 text-muted-foreground"
          />
        </button>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-card p-3">
      <h3 class="mb-2 text-sm font-semibold">Network Stats</h3>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="rounded bg-muted/50 p-2 text-center">
          <div class="text-lg font-bold text-foreground">
            {{ stats.totalNodes }}
          </div>
          <div class="text-muted-foreground">Nodes</div>
        </div>
        <div class="rounded bg-muted/50 p-2 text-center">
          <div class="text-lg font-bold text-success">
            {{ stats.activeLinks }}
          </div>
          <div class="text-muted-foreground">Active Links</div>
        </div>
        <div class="rounded bg-muted/50 p-2 text-center">
          <div class="text-lg font-bold text-primary">
            {{ stats.avgSignal }}%
          </div>
          <div class="text-muted-foreground">Avg Signal</div>
        </div>
        <div class="rounded bg-muted/50 p-2 text-center">
          <div class="text-lg font-bold text-destructive">
            {{ stats.downLinks }}
          </div>
          <div class="text-muted-foreground">Down Links</div>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-card p-3">
      <h3 class="mb-2 text-sm font-semibold">Link Health</h3>
      <div class="flex h-3 w-full overflow-hidden rounded-full">
        <div
          class="bg-success transition-all"
          :style="{ width: `${linkHealth.strong}%` }"
        />
        <div
          class="bg-warning transition-all"
          :style="{ width: `${linkHealth.degraded}%` }"
        />
        <div
          class="bg-warning transition-all"
          :style="{ width: `${linkHealth.weak}%` }"
        />
        <div
          class="bg-destructive transition-all"
          :style="{ width: `${linkHealth.down}%` }"
        />
      </div>
      <div class="mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span class="flex items-center gap-1">
          <span class="size-1.5 rounded-full bg-success" /> Strong
        </span>
        <span class="flex items-center gap-1">
          <span class="size-1.5 rounded-full bg-warning" /> Degraded
        </span>
        <span class="flex items-center gap-1">
          <span class="size-1.5 rounded-full bg-warning" /> Weak
        </span>
        <span class="flex items-center gap-1">
          <span class="size-1.5 rounded-full bg-destructive" /> Down
        </span>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-muted/50 p-3">
      <p class="text-xs text-muted-foreground">
        <strong>Demo:</strong> Tactical communications network with HQ, relay,
        and field unit nodes. Links degrade and recover dynamically, simulating
        real-world signal conditions.
      </p>
    </div>
  </div>
</template>
