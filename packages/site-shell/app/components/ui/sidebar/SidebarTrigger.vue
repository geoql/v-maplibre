<script setup lang="ts">
  import type { HTMLAttributes } from 'vue';

  import { cn } from '@/lib/utils';
  import { Button } from '@/components/ui/button';
  import { useSidebar } from './utils';

  const props = defineProps<{
    class?: HTMLAttributes['class'];
  }>();

  const { toggleSidebar } = useSidebar();
</script>

<template>
  <Button
    data-sidebar="trigger"
    data-slot="sidebar-trigger"
    variant="ghost"
    size="icon"
    :class="cn('size-7', props.class)"
    @click="toggleSidebar"
  >
    <Icon name="lucide:panel-left" class="size-4" />
    <span class="sr-only">Toggle Sidebar</span>
  </Button>
</template>
