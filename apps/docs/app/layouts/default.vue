<script setup lang="ts">
  import type { SiteLink } from '#shell/types/docs';

  const links: SiteLink[] = [
    { label: 'Docs home', to: '/', icon: 'lucide:book-open' },
    {
      label: 'Examples',
      to: 'https://mapcn-vue.geoql.in/examples',
      icon: 'lucide:map',
      external: true,
    },
  ];
</script>

<template>
  <div class="relative">
    <SiteToolbar :links="links" class="absolute left-3 top-3 z-30" />
    <div id="main-content" tabindex="-1" class="outline-none">
      <slot></slot>
    </div>
  </div>
</template>
