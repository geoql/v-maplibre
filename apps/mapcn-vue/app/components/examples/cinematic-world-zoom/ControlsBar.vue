<script setup lang="ts">
  import type {
    CinematicDestination,
    CinematicPhase,
  } from '~/types/cinematic-zoom';
  import { Button } from '~/components/ui/button';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '~/components/ui/select';

  const props = defineProps<{
    destinations: readonly CinematicDestination[];
    phase: CinematicPhase;
  }>();

  const emit = defineEmits<{
    fly: [];
    replay: [];
  }>();

  const selected = defineModel<string>({ required: true });

  function getDestinationName(name: string): string {
    return props.destinations.find((d) => d.name === name)?.name ?? name;
  }
</script>

<template>
  <div
    class="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-border bg-background/80 p-2 backdrop-blur"
  >
    <Select v-model="selected">
      <SelectTrigger class="w-36 sm:w-44">
        <SelectValue placeholder="Destination" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="city in destinations"
          :key="city.name"
          :value="city.name"
        >
          {{ getDestinationName(city.name) }}
        </SelectItem>
      </SelectContent>
    </Select>

    <Button size="lg" class="gap-2" @click="emit('fly')">
      <Icon name="lucide:plane" class="size-4" />
      Fly
    </Button>

    <Button
      size="icon"
      variant="ghost"
      aria-label="Replay flight"
      @click="emit('replay')"
    >
      <Icon name="lucide:rotate-ccw" class="size-4" />
    </Button>
  </div>
</template>
