<script setup lang="ts">
  import Tooltip from '#shell/components/ui/tooltip/Tooltip.vue';
  import TooltipContent from '#shell/components/ui/tooltip/TooltipContent.vue';
  import TooltipTrigger from '#shell/components/ui/tooltip/TooltipTrigger.vue';

  const colorMode = useColorMode();

  function toggleColorMode(): void {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
  }
</script>

<template>
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
</template>
