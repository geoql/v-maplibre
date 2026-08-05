<script setup lang="ts">
  import type { FloodMarker, GoogleFloodSeverity } from '~/types/flood';

  const props = defineProps<{
    markers: FloodMarker[];
    loading: boolean;
    error: string | null;
    lastFetch: Date | null;
  }>();

  const emit = defineEmits<{
    refresh: [];
  }>();

  const SEVERITY_ORDER: GoogleFloodSeverity[] = [
    'EXTREME',
    'SEVERE',
    'ABOVE_NORMAL',
    'NO_FLOODING',
    'UNKNOWN',
    'FLOOD_SEVERITY_UNSPECIFIED',
  ];

  const SEVERITY_LABELS: Record<GoogleFloodSeverity, string> = {
    EXTREME: 'Extreme',
    SEVERE: 'Severe',
    ABOVE_NORMAL: 'Above Normal',
    NO_FLOODING: 'No Flooding',
    UNKNOWN: 'Unknown',
    FLOOD_SEVERITY_UNSPECIFIED: 'Unspecified',
  };

  const counts = computed(() => {
    const map = new Map<GoogleFloodSeverity, number>();
    for (const m of props.markers) {
      map.set(m.severity, (map.get(m.severity) ?? 0) + 1);
    }
    return map;
  });

  const activeSeverities = computed(() =>
    SEVERITY_ORDER.filter((s) => (counts.value.get(s) ?? 0) > 0),
  );

  const lastFetchLabel = computed(() => {
    if (!props.lastFetch) return null;
    return props.lastFetch.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  function handleRefresh(): void {
    emit('refresh');
  }
</script>

<template>
  <div class="p-3">
    <div class="mb-2 flex items-center justify-between">
      <span
        class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        Flood Status
      </span>
      <button
        class="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        :class="{ 'animate-spin': loading }"
        @click="handleRefresh"
      >
        <Icon name="lucide:refresh-cw" class="size-3.5" />
      </button>
    </div>

    <div v-if="loading && markers.length === 0" class="space-y-2">
      <div v-for="i in 3" :key="i" class="h-7 animate-pulse rounded bg-muted" />
    </div>

    <div
      v-else-if="error"
      class="break-all rounded-md bg-destructive/10 p-3 text-xs text-destructive"
    >
      <Icon name="lucide:alert-circle" class="mr-1 inline size-3.5" />
      {{ error }}
    </div>

    <div
      v-else-if="activeSeverities.length === 0"
      class="py-2 text-center text-xs text-muted-foreground"
    >
      No active flood alerts
    </div>

    <div v-else class="space-y-1.5">
      <div
        v-for="severity in activeSeverities"
        :key="severity"
        class="flex items-center justify-between"
      >
        <ExamplesGoogleFloodSeverityBadge :severity="severity" size="sm" />
        <span class="font-mono text-xs font-medium text-foreground">
          {{ counts.get(severity) }}
        </span>
      </div>
    </div>

    <div
      v-if="lastFetchLabel"
      class="mt-3 border-t border-border pt-2 text-2xs text-muted-foreground"
    >
      Updated {{ lastFetchLabel }}
    </div>
  </div>
</template>
