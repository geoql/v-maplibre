<script setup lang="ts">
const route = useRoute();
const { data: page } = await useAsyncData(`docs-${route.path}`, () =>
  queryCollection('docs').path(route.path).first()
);

if (!page.value) {
  throw createError({ statusCode: 404, message: 'Page not found' });
}

useSeoMeta({
  title: page.value.title,
  description: page.value.description,
});
</script>

<template>
  <div class="container max-w-screen-2xl py-10">
    <div class="mx-auto max-w-3xl">
      <div class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight">{{ page?.title }}</h1>
        <p v-if="page?.description" class="mt-2 text-lg text-muted-foreground">
          {{ page.description }}
        </p>
      </div>
      <div class="prose dark:prose-invert">
        <ContentRenderer v-if="page" :value="page" />
      </div>
    </div>
  </div>
</template>
