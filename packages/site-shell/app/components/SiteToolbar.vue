<script setup lang="ts">
  /**
   * The floating top-left toolbar shared by mapcn-vue and the docs: an
   * app-supplied start slot (for example the sidebar trigger), cross-site
   * links, GitHub, the theme toggle, then an app-supplied default slot.
   */
  import Tooltip from '#shell/components/ui/tooltip/Tooltip.vue';
  import TooltipContent from '#shell/components/ui/tooltip/TooltipContent.vue';
  import TooltipTrigger from '#shell/components/ui/tooltip/TooltipTrigger.vue';
  import type { SiteLink } from '#shell/types/docs';

  withDefaults(
    defineProps<{
      links?: SiteLink[];
      githubUrl?: string;
    }>(),
    {
      links: () => [],
      githubUrl: 'https://github.com/geoql/v-maplibre',
    },
  );

  const BUTTON =
    'pointer-events-auto inline-flex size-7 items-center justify-center rounded-lg bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground';
</script>

<template>
  <div class="pointer-events-none flex items-center gap-1">
    <slot name="start"></slot>
    <Tooltip v-for="link in links" :key="link.to">
      <TooltipTrigger as-child>
        <a
          v-if="link.external"
          data-toolbar-link
          :href="link.to"
          target="_blank"
          rel="noopener noreferrer"
          :class="BUTTON"
        >
          <Icon :name="link.icon" class="size-4" />
          <span class="sr-only">{{ link.label }}</span>
        </a>
        <NuxtLink v-else data-toolbar-link :to="link.to" :class="BUTTON">
          <Icon :name="link.icon" class="size-4" />
          <span class="sr-only">{{ link.label }}</span>
        </NuxtLink>
      </TooltipTrigger>
      <TooltipContent>{{ link.label }}</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <a
          :href="githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          :class="BUTTON"
        >
          <Icon name="simple-icons:github" class="size-4" />
          <span class="sr-only">GitHub</span>
        </a>
      </TooltipTrigger>
      <TooltipContent>GitHub</TooltipContent>
    </Tooltip>
    <ThemeToggle />
    <slot></slot>
  </div>
</template>
