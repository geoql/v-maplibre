<script setup lang="ts">
  import { SidebarTrigger, useSidebar } from '#shell/components/ui/sidebar';
  import Tooltip from '#shell/components/ui/tooltip/Tooltip.vue';
  import TooltipContent from '#shell/components/ui/tooltip/TooltipContent.vue';
  import TooltipTrigger from '#shell/components/ui/tooltip/TooltipTrigger.vue';

  const { state, setOpen } = useSidebar();
  const colorMode = useColorMode();
  const route = useRoute();
  const { showFps, toggle: toggleFps } = useFpsMeter();

  const isExpanded = computed(() => state.value === 'expanded');

  // Example pages on mobile own the top-left area (custom toggles, legends,
  // loading overlays). The peek-bar already exposes "Back to Examples" and the
  // sidebar is reachable from there, so we hide this global toolbar on those
  // routes at <md to prevent overlap with example-specific chrome.
  const isExamplePage = computed(() => route.path.startsWith('/examples/'));

  function handleEscape(event: KeyboardEvent): void {
    if (event.key === 'Escape' && isExpanded.value) {
      setOpen(false);
    }
  }

  onMounted(() => document.addEventListener('keydown', handleEscape));
  onUnmounted(() => document.removeEventListener('keydown', handleEscape));

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
      aria-hidden="true"
      @click="setOpen(false)"
    ></div>
  </Transition>

  <!-- Floating toolbar — hidden when sidebar is open OR on mobile example pages -->
  <div
    class="pointer-events-none absolute left-3 top-3 z-30 flex items-center gap-1 transition-opacity duration-200"
    :class="[
      isExpanded ? 'opacity-0' : 'opacity-100',
      isExamplePage ? 'hidden md:flex' : '',
    ]"
  >
    <SidebarTrigger
      class="pointer-events-auto rounded-lg bg-background/80 backdrop-blur-sm"
    />
    <Tooltip>
      <TooltipTrigger as-child>
        <a
          href="https://github.com/geoql/v-maplibre"
          target="_blank"
          rel="noopener noreferrer"
          class="pointer-events-auto inline-flex size-7 items-center justify-center rounded-lg bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
        >
          <Icon name="simple-icons:github" class="size-4" />
          <span class="sr-only">GitHub</span>
        </a>
      </TooltipTrigger>
      <TooltipContent>GitHub</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <button
          class="pointer-events-auto inline-flex size-7 items-center justify-center rounded-lg bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
          @click="toggleColorMode"
        >
          <!-- Both icons render; CSS picks one from the `.dark` class. The
            server cannot know the resolved mode, so a value-based icon
            mismatched on hydration in dark mode. -->
          <!-- Wrapper spans carry the display toggle: the icon's own
            `.iconify` rule sets `display` and would override it. -->
          <span class="contents dark:hidden">
            <Icon name="lucide:moon" class="size-4" />
          </span>
          <span class="hidden dark:contents">
            <Icon name="lucide:sun" class="size-4" />
          </span>
          <span class="sr-only">Toggle theme</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <ClientOnly>
          {{ colorMode.value === 'dark' ? 'Light mode' : 'Dark mode' }}
          <template #fallback>Dark mode</template>
        </ClientOnly>
      </TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <button
          class="pointer-events-auto inline-flex size-7 items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm transition-colors"
          :class="
            showFps
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          "
          :aria-label="showFps ? 'Hide FPS meter' : 'Show FPS meter'"
          :aria-pressed="showFps"
          @click="toggleFps"
        >
          <Icon name="lucide:gauge" class="size-4" />
          <span class="sr-only">Toggle FPS meter</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>{{ showFps ? 'Hide FPS' : 'Show FPS' }}</TooltipContent>
    </Tooltip>
  </div>
</template>
