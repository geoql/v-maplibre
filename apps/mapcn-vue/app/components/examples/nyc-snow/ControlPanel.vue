<script setup lang="ts">
  import type { NYCBorough } from '~/types/nyc-snow';
  import { BOROUGH_MAP } from '~/types/nyc-snow';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '~/components/ui/select';
  import { Slider } from '~/components/ui/slider';

  const props = defineProps<{
    borough: NYCBorough;
    snowfallRate: number;
    streetCount: number;
    totalSnow24h: string;
    loading: boolean;
    error: string | null;
  }>();

  const emit = defineEmits<{
    'update:borough': [value: NYCBorough];
    'update:snowfallRate': [value: number];
  }>();

  const boroughEntries = Object.entries(BOROUGH_MAP) as [
    NYCBorough,
    (typeof BOROUGH_MAP)[NYCBorough],
  ][];

  const snowfallLabel = computed(() => {
    const rate = props.snowfallRate;
    return `${rate.toFixed(1)} in/hr`;
  });

  function getBoroughLabel(code: NYCBorough): string {
    return BOROUGH_MAP[code]?.name ?? code;
  }

  function handleSliderUpdate(value: number[]): void {
    const first = value[0];
    if (first !== undefined) {
      emit('update:snowfallRate', first);
    }
  }
</script>

<template>
  <div class="space-y-3">
    <div>
      <h3 class="text-sm font-semibold">NYC Snow Viz</h3>
      <p class="text-xs text-muted-foreground">
        3D snow accumulation on NYC streets
      </p>
    </div>

    <div>
      <label class="mb-1.5 block text-xs font-medium">Borough</label>
      <Select
        :model-value="borough"
        :disabled="loading"
        @update:model-value="emit('update:borough', $event as NYCBorough)"
      >
        <SelectTrigger class="w-full">
          <SelectValue :placeholder="getBoroughLabel(borough)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="[code, info] in boroughEntries"
            :key="code"
            :value="code"
          >
            {{ info.name }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div>
      <label class="mb-1.5 block text-xs font-medium">
        Snowfall Rate: {{ snowfallLabel }}
      </label>
      <Slider
        :model-value="[snowfallRate]"
        :min="0"
        :max="4"
        :step="0.1"
        @update:model-value="handleSliderUpdate"
      />
      <div class="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>None</span>
        <span>Light</span>
        <span>Heavy</span>
        <span>Blizzard</span>
      </div>
    </div>

    <Separator />

    <div class="grid grid-cols-2 gap-2 text-xs">
      <div>
        <span class="text-muted-foreground">Streets:</span>
        <span class="ml-1 font-mono">
          {{ loading ? '...' : streetCount.toLocaleString() }}
        </span>
      </div>
      <div>
        <span class="text-muted-foreground">24h Total:</span>
        <span class="ml-1 font-mono">{{ totalSnow24h }}"</span>
      </div>
    </div>


    <Separator />

    <div>
      <h4 class="text-xs font-medium">Height = Snow Depth</h4>
      <p class="text-[10px] text-muted-foreground">
        Taller bars = more snow accumulated since last plow
      </p>
    </div>

    <div
      v-if="error"
      class="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive"
    >
      {{ error }}
    </div>
  </div>
</template>
