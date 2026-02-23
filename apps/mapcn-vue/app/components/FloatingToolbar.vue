<script setup lang="ts">
  import { SidebarTrigger, useSidebar } from '~/components/ui/sidebar';

  const { state, setOpen } = useSidebar();
  const colorMode = useColorMode();

  const isExpanded = computed(() => state.value === 'expanded');

  function toggleColorMode() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
  }
</script>

<template>
  <!-- Backdrop overlay — click outside sidebar to close -->
  <Transition name="fade">
    <div
      v-if="isExpanded"
      class="fixed inset-0 z-40 bg-black/40"
      @click="setOpen(false)"
    ></div>
  </Transition>

  <!-- Floating toolbar — hidden when sidebar is open -->
  <div
    class="pointer-events-none absolute left-3 top-3 z-30 flex items-center gap-1 transition-opacity duration-200"
    :class="isExpanded ? 'opacity-0' : 'opacity-100'"
  >
    <SidebarTrigger
      class="pointer-events-auto rounded-lg bg-background/80 backdrop-blur-sm"
    />
    <a
      href="https://github.com/geoql/v-maplibre"
      target="_blank"
      rel="noopener noreferrer"
      class="pointer-events-auto inline-flex size-7 items-center justify-center rounded-lg bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
    >
      <Icon name="simple-icons:github" class="size-4" />
      <span class="sr-only">GitHub</span>
    </a>
    <button
      class="pointer-events-auto inline-flex size-7 items-center justify-center rounded-lg bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
      @click="toggleColorMode"
    >
      <Icon
        :name="colorMode.value === 'dark' ? 'lucide:sun' : 'lucide:moon'"
        class="size-4"
      />
      <span class="sr-only">Toggle theme</span>
    </button>
  </div>
</template>
