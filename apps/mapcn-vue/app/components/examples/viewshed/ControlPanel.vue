<script setup lang="ts">
  import type { Observer } from '~/types/defense-viewshed';

  const props = defineProps<{
    observers: Observer[];
    observerHeight: number;
    heightOptions: number[];
    maxObservers: number;
    totalVisibleAreaKm2: number;
  }>();

  const emit = defineEmits<{
    setHeight: [heightM: number];
    removeObserver: [id: string];
    clearAll: [];
  }>();

  function heightLabel(h: number): string {
    if (h <= 2) return `${h}m Standing`;
    if (h <= 5) return `${h}m Crouching`;
    if (h <= 10) return `${h}m Vehicle`;
    if (h <= 20) return `${h}m Structure`;
    return `${h}m Tower`;
  }
</script>

<template>
  <div class="space-y-4 p-4">
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Observer Height</h3>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="h in heightOptions"
          :key="h"
          class="rounded-md px-2 py-1.5 text-xs font-medium transition-colors"
          :class="
            observerHeight === h
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          "
          @click="emit('setHeight', h)"
        >
          {{ heightLabel(h) }}
        </button>
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="text-sm font-semibold">
        Observers
        <span class="text-muted-foreground">
          ({{ observers.length }}/{{ maxObservers }})
        </span>
      </h3>
      <div class="space-y-1">
        <div
          v-for="obs in observers"
          :key="obs.id"
          class="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <span class="size-2.5 shrink-0 rounded-full bg-warning"></span>
          <span class="font-mono font-bold">{{ obs.label }}</span>
          <span class="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px]">
            {{ obs.heightM }}m
          </span>
          <button
            class="ml-1 rounded p-0.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
            @click="emit('removeObserver', obs.id)"
          >
            <Icon name="lucide:x" class="size-3" />
          </button>
        </div>
        <p
          v-if="observers.length === 0"
          class="px-2.5 py-2 text-xs text-muted-foreground"
        >
          Click map to place observers
        </p>
      </div>
    </div>

    <div class="space-y-1.5 rounded-lg border border-border bg-muted/50 p-3">
      <div class="flex items-center justify-between text-xs">
        <span class="text-muted-foreground">Visible Area</span>
        <span class="font-mono font-semibold">
          {{ props.totalVisibleAreaKm2.toFixed(1) }} km²
        </span>
      </div>
      <div class="flex items-center justify-between text-xs">
        <span class="text-muted-foreground">Observer Count</span>
        <span class="font-mono font-semibold">{{ observers.length }}</span>
      </div>
    </div>

    <div class="flex gap-2">
      <button
        v-if="observers.length > 0"
        class="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
        @click="emit('clearAll')"
      >
        <Icon name="lucide:trash-2" class="size-3.5" />
        Clear All
      </button>
    </div>

    <div class="rounded-lg border border-border bg-muted/50 p-3">
      <p class="text-xs text-muted-foreground">
        Click on the map to place observer points (max {{ maxObservers }}).
        Higher positions reveal more terrain.
      </p>
    </div>
  </div>
</template>
