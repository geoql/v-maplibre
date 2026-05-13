<script setup lang="ts">
  /**
   * MapPanel — shared example-page control panel wrapper.
   *
   * Solves: every example page used to hand-roll the same
   * `absolute top-16 left-4 w-64` panel + motion-v transition + toggle button.
   * On mobile (<768px) that fixed-width side panel covered the map AND
   * Select popups bled out of the viewport.
   *
   * Layout:
   *   desktop (≥768px) → side panel: `absolute top-4 left-4 w-72` (always shown,
   *                       no toggle button — panel IS the affordance)
   *   mobile  (<768px) → bottom sheet: `fixed inset-x-0 bottom-0` with drag handle,
   *                       opened by toggle button at `top-32 right-3`
   *
   * Slots:
   *   default       — panel content
   *   header        — optional custom header (defaults to <title> prop)
   */
  import { motion, AnimatePresence } from 'motion-v';
  import { useMediaQuery } from '@vueuse/core';

  interface Props {
    title?: string;
    defaultOpen?: boolean;
    panelWidth?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    title: '',
    defaultOpen: true,
    panelWidth: 'w-72',
  });

  const open = defineModel<boolean>('open', { default: undefined });

  const isMobile = useMediaQuery('(max-width: 767px)');

  // Mobile users see the map first (closed); desktop users see the side panel
  // immediately (open per `defaultOpen`). Recomputed when viewport crosses
  // the 768px breakpoint so a window resize doesn't strand the wrong layout.
  // SSR renders closed (isMobile defaults false → defaultOpen=true on desktop,
  // false on mobile via the watchEffect that runs post-hydration).
  const localOpen = ref(false);
  let userOverride = false;
  watchEffect(() => {
    if (userOverride) return;
    localOpen.value = isMobile.value ? false : props.defaultOpen;
  });
  const isOpen = computed({
    get: () => (open.value === undefined ? localOpen.value : open.value),
    set: (v: boolean) => {
      userOverride = true;
      if (open.value === undefined) localOpen.value = v;
      else open.value = v;
    },
  });

  function toggle() {
    isOpen.value = !isOpen.value;
  }
</script>

<template>
  <button
    v-if="isMobile && !isOpen"
    class="absolute right-3 top-32 z-30 flex size-10 items-center justify-center rounded-md border border-primary/40 bg-primary text-primary-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-primary/90"
    :aria-expanded="isOpen"
    aria-controls="map-panel"
    @click="toggle"
  >
    <Icon name="lucide:sliders-horizontal" class="size-4" />
    <span class="sr-only">Open controls</span>
  </button>

  <AnimatePresence>
    <!-- Mobile sheet backdrop: dims map + bottom-anchored map controls (Legend,
      attribution) so the sheet sits visually above them while open. -->
    <motion.div
      v-if="isOpen && isMobile"
      key="mobile-backdrop"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0 }"
      :transition="{ duration: 0.15 }"
      class="absolute inset-0 z-20 bg-black/40"
      aria-hidden="true"
      @click="toggle"
    ></motion.div>

    <motion.div
      v-if="isOpen && isMobile"
      id="map-panel"
      key="mobile-sheet"
      :initial="{ y: '100%' }"
      :animate="{ y: 0 }"
      :exit="{ y: '100%' }"
      :transition="{ type: 'spring', stiffness: 320, damping: 32 }"
      class="absolute inset-x-0 bottom-0 z-30 max-h-[70%] min-h-[40dvh] overflow-y-auto rounded-t-md border-t border-border bg-background pb-[env(safe-area-inset-bottom)] shadow-lg"
    >
      <div
        class="mx-auto mt-2 mb-2 h-1 w-10 rounded-full bg-border"
        aria-hidden="true"
      ></div>
      <div
        class="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-4 py-2"
      >
        <slot name="header">
          <h3
            v-if="title"
            class="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            {{ title }}
          </h3>
        </slot>
        <button
          type="button"
          class="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          @click="toggle"
        >
          <Icon name="lucide:x" class="size-4" />
          <span class="sr-only">Close</span>
        </button>
      </div>
      <div class="px-4 pb-4 pt-3">
        <slot></slot>
      </div>
    </motion.div>

    <motion.div
      v-else-if="isOpen"
      id="map-panel"
      key="desktop-side"
      :initial="{ opacity: 0, x: -20, scale: 0.96 }"
      :animate="{ opacity: 1, x: 0, scale: 1 }"
      :exit="{ opacity: 0, x: -20, scale: 0.96 }"
      :transition="{ type: 'spring', stiffness: 320, damping: 26 }"
      :class="[
        'absolute top-4 left-4 z-20 max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-md border border-border bg-background p-4 shadow-lg',
        panelWidth,
      ]"
    >
      <div v-if="title || $slots.header" class="mb-3">
        <slot name="header">
          <h3
            class="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            {{ title }}
          </h3>
        </slot>
      </div>
      <slot></slot>
    </motion.div>
  </AnimatePresence>
</template>
