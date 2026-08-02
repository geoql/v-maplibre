<script setup lang="ts">
  import type { BorderLayerName, IntrusionZone } from '~/types/defense-border';

  defineProps<{
    visibleLayers: Set<BorderLayerName>;
    isPlaying: boolean;
    speed: number;
    intrusionZones: IntrusionZone[];
    cameraCount: number;
  }>();

  const emit = defineEmits<{
    toggleLayer: [layer: BorderLayerName];
    play: [];
    pause: [];
    setSpeed: [speed: number];
  }>();

  const speedOptions = [0.5, 1, 2, 4];

  const layerItems: { key: BorderLayerName; label: string; icon: string }[] = [
    { key: 'border', label: 'LAC Border', icon: 'lucide:map-pin' },
    { key: 'cameras', label: 'Cameras', icon: 'lucide:camera' },
    { key: 'patrols', label: 'Patrols', icon: 'lucide:truck' },
    { key: 'zones', label: 'Alert Zones', icon: 'lucide:shield-alert' },
  ];

  function getAlertBadgeClass(level: string): string {
    return level === 'high'
      ? 'bg-destructive/15 text-destructive'
      : 'bg-orange-500/15 text-orange-600';
  }
</script>

<template>
  <div class="space-y-4 p-4">
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Layers</h3>
      <div class="space-y-1">
        <button
          v-for="item in layerItems"
          :key="item.key"
          class="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs transition-colors"
          :class="
            visibleLayers.has(item.key)
              ? 'bg-primary/15 text-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          "
          @click="emit('toggleLayer', item.key)"
        >
          <Icon :name="item.icon" class="size-3.5 shrink-0" />
          <span class="font-medium">{{ item.label }}</span>
          <span
            v-if="item.key === 'cameras'"
            class="ml-auto text-2xs text-muted-foreground"
          >
            {{ cameraCount }}
          </span>
        </button>
      </div>
    </div>

    <div class="space-y-3">
      <h3 class="text-sm font-semibold">Patrol Animation</h3>
      <div class="flex items-center justify-center gap-2">
        <button
          class="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          :title="isPlaying ? 'Pause' : 'Play'"
          @click="isPlaying ? emit('pause') : emit('play')"
        >
          <Icon
            :name="isPlaying ? 'lucide:pause' : 'lucide:play'"
            class="size-4"
          />
        </button>
      </div>
      <div class="space-y-1">
        <h4 class="text-xs font-medium text-muted-foreground">Speed</h4>
        <div class="flex gap-1">
          <button
            v-for="s in speedOptions"
            :key="s"
            class="flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors"
            :class="
              speed === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            "
            @click="emit('setSpeed', s)"
          >
            {{ s }}x
          </button>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="text-sm font-semibold">Zone Alerts</h3>
      <div class="space-y-1">
        <div
          v-for="zone in intrusionZones"
          :key="zone.id"
          class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs"
        >
          <span
            class="inline-flex rounded-full px-1.5 py-0.5 text-2xs font-bold uppercase"
            :class="getAlertBadgeClass(zone.alertLevel)"
          >
            {{ zone.alertLevel }}
          </span>
          <span class="font-medium text-foreground">{{ zone.name }}</span>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-muted/50 p-3">
      <p class="text-xs text-muted-foreground">
        <strong>Border Surveillance:</strong> Ladakh LAC sector with 8
        surveillance cameras, 2 patrol routes, and 3 intrusion detection zones.
      </p>
    </div>
  </div>
</template>
