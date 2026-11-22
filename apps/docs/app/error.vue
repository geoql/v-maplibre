<script setup lang="ts">
  import type { NuxtError } from '#app';

  const props = defineProps<{ error: NuxtError }>();

  const notFound = computed(() => props.error.statusCode === 404);

  useSeoMeta({
    title: notFound.value ? 'Page not found · v-maplibre' : 'Error · v-maplibre',
    robots: 'noindex',
  });
</script>

<template>
  <NuxtLayout>
    <main
      data-shell-error
      class="flex min-h-dvh flex-col justify-center px-6 md:px-12 lg:px-24"
    >
      <p
        class="mb-6 font-mono text-caption tracking-caps text-primary uppercase"
      >
        Error · <span class="tabular-nums">{{ error.statusCode }}</span>
      </p>
      <h1
        class="max-w-3xl text-5xl leading-display font-extrabold tracking-display-tight text-foreground md:text-7xl"
      >
        {{ notFound ? 'This page is off the map.' : 'Something broke.' }}
      </h1>
      <p class="mt-6 max-w-xl text-lg/relaxed text-muted-foreground">
        {{
          notFound
            ? 'The page you asked for does not exist. The guide is a good place to start again.'
            : error.message
        }}
      </p>
      <div class="mt-10 flex flex-wrap gap-3">
        <NuxtLink
          to="/guide/getting-started"
          class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Get started
          <Icon name="lucide:arrow-right" class="size-4" />
        </NuxtLink>
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
        >
          Docs home
        </NuxtLink>
      </div>
    </main>
  </NuxtLayout>
</template>
