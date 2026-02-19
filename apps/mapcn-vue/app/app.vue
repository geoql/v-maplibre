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
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
