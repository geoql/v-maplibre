<script setup lang="ts">
  const route = useRoute();

  useHead({
    htmlAttrs: {
      lang: 'en',
    },
  });

  useSeoMeta({
    ogUrl: computed(() => `https://mapcn-vue.geoql.in${route.path}`),
  });

  function skipToMain(): void {
    const main = document.getElementById('main-content');
    if (main) {
      main.focus();
      main.scrollIntoView();
    }
  }
</script>

<template>
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg focus:outline-2 focus:outline-offset-2 focus:outline-ring"
    @click.prevent="skipToMain"
  >
    Skip to main content
  </a>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
