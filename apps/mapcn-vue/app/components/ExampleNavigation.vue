<script setup lang="ts">
  import { Separator } from '~/components/ui/separator';

  const route = useRoute();
  const { categories } = useExamplesData();

  // Flatten all examples in order
  const allExamples = computed(() => categories.flatMap((cat) => cat.examples));

  const currentIndex = computed(() =>
    allExamples.value.findIndex((ex) => ex.href === route.path),
  );

  const prevExample = computed(() =>
    currentIndex.value > 0 ? allExamples.value[currentIndex.value - 1] : null,
  );

  const nextExample = computed(() =>
    currentIndex.value < allExamples.value.length - 1
      ? allExamples.value[currentIndex.value + 1]
      : null,
  );

  const editUrl = computed(() => {
    const filename = route.path.split('/').pop();
    return `https://github.com/geoql/v-maplibre/edit/main/apps/mapcn-vue/app/pages/examples/${filename}.vue`;
  });

  const issueUrl =
    'https://github.com/geoql/v-maplibre/issues/new?labels=examples';
</script>

<template>
  <div class="mt-10">
    <!-- Edit & Report Links -->
    <div class="flex items-center justify-center gap-2 text-sm">
      <Separator class="flex-1 bg-border/50" />
      <a
        :href="editUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/50 px-3 py-1.5 text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
      >
        <Icon name="lucide:pencil" class="size-3.5" />
        Edit
      </a>
      <a
        :href="issueUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/50 px-3 py-1.5 text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
      >
        <Icon name="lucide:circle-dot" class="size-3.5" />
        Report
      </a>
      <Separator class="flex-1 bg-border/50" />
    </div>

    <!-- Prev/Next Navigation -->
    <div class="mt-8 grid grid-cols-2 gap-4">
      <NuxtLink
        v-if="prevExample"
        :to="prevExample.href"
        class="group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5"
      >
        <div
          class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <div
            class="absolute -inset-px rounded-xl bg-linear-to-b from-primary/10 via-transparent to-transparent"
          ></div>
        </div>
        <div class="relative mb-3 flex items-center gap-2">
          <Icon
            name="lucide:arrow-left"
            class="size-4 text-muted-foreground transition-all duration-300 group-hover:-translate-x-1 group-hover:text-primary"
          />
          <span class="text-xs text-muted-foreground">Previous</span>
        </div>
        <div class="relative flex items-center gap-3">
          <div
            class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/50 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/10"
          >
            <Icon
              :name="prevExample.icon"
              class="size-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary"
            />
          </div>
          <span
            class="font-medium transition-colors duration-300 group-hover:text-primary"
            >{{ prevExample.title }}</span
          >
        </div>
      </NuxtLink>
      <div v-else></div>

      <NuxtLink
        v-if="nextExample"
        :to="nextExample.href"
        class="group relative flex flex-col items-end overflow-hidden rounded-xl border border-border/50 bg-card/50 p-5 text-right backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5"
      >
        <div
          class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <div
            class="absolute -inset-px rounded-xl bg-linear-to-b from-primary/10 via-transparent to-transparent"
          ></div>
        </div>
        <div class="relative mb-3 flex items-center gap-2">
          <span class="text-xs text-muted-foreground">Next</span>
          <Icon
            name="lucide:arrow-right"
            class="size-4 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary"
          />
        </div>
        <div class="relative flex items-center gap-3">
          <span
            class="font-medium transition-colors duration-300 group-hover:text-primary"
            >{{ nextExample.title }}</span
          >
          <div
            class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/50 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/10"
          >
            <Icon
              :name="nextExample.icon"
              class="size-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary"
            />
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
