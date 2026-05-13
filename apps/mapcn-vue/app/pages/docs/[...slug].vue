<script setup lang="ts">
  import type { TocLink } from '~/types/docs';

  const route = useRoute();

  // Fetch current page
  const { data: page } = await useAsyncData(`docs-${route.path}`, () =>
    queryCollection('docs').path(route.path).first(),
  );

  if (!page.value) {
    throw createError({ statusCode: 404, message: 'Page not found' });
  }

  // Fetch all docs for navigation
  const { data: allDocs } = await useAsyncData('docs-nav', () =>
    queryCollection('docs').order('stem', 'ASC').all(),
  );

  const navIcons: Record<string, string> = {
    '/docs/introduction': 'lucide:home',
    '/docs/installation': 'lucide:download',
    '/docs/components': 'lucide:component',
  };

  const navItems = computed(() => {
    return (
      allDocs.value?.map((doc) => ({
        title: doc.title,
        path: doc.path,
        active: doc.path === route.path,
        icon: navIcons[doc.path] || 'lucide:file-text',
      })) ?? []
    );
  });

  const currentIndex = computed(() => {
    return navItems.value.findIndex((item) => item.path === route.path);
  });

  const prevPage = computed(() => {
    if (currentIndex.value > 0) {
      return navItems.value[currentIndex.value - 1];
    }
    return null;
  });

  const nextPage = computed(() => {
    if (currentIndex.value < navItems.value.length - 1) {
      return navItems.value[currentIndex.value + 1];
    }
    return null;
  });

  const editUrl = computed(() => {
    const stem = page.value?.stem;
    if (!stem) return null;
    const filename = stem.split('/').pop();
    return `https://github.com/geoql/v-maplibre/edit/main/apps/mapcn-vue/content/docs/${filename}.md`;
  });

  const issueUrl =
    'https://github.com/geoql/v-maplibre/issues/new?labels=documentation';

  // Use built-in TOC from Nuxt Content
  // TocLink type imported from ~/types/docs

  const toc = computed(() => {
    const tocData = page.value?.body?.toc;
    if (!tocData?.links) return [];

    // Flatten the TOC links (including children)
    const flattenLinks = (
      links: TocLink[],
      result: { id: string; text: string; level: number }[] = [],
    ) => {
      for (const link of links) {
        result.push({
          id: link.id,
          text: link.text,
          level: link.depth,
        });
        if (link.children) {
          flattenLinks(link.children, result);
        }
      }
      return result;
    };

    return flattenLinks(tocData.links);
  });

  // Scroll spy for TOC
  const activeHeading = ref<string>('');

  onMounted(() => {
    const HEADER_OFFSET = 100;

    const updateActiveHeading = () => {
      const headings = document.querySelectorAll(
        '.prose h1[id], .prose h2[id], .prose h3[id], .prose h4[id]',
      );

      if (headings.length === 0) return;

      let currentHeading = '';

      for (const heading of headings) {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= HEADER_OFFSET) {
          currentHeading = heading.id;
        } else {
          break;
        }
      }

      if (!currentHeading && headings.length > 0) {
        currentHeading = headings[0]!.id;
      }

      activeHeading.value = currentHeading;
    };

    nextTick(() => {
      updateActiveHeading();
    });

    window.addEventListener('scroll', updateActiveHeading, { passive: true });

    onUnmounted(() => {
      window.removeEventListener('scroll', updateActiveHeading);
    });
  });

  useSeoMeta({
    title: page.value.title,
    description: page.value.description,
    ogTitle: page.value.title,
    ogDescription: page.value.description,
    ogType: 'website',
    ogSiteName: 'mapcn-vue',
    twitterCard: 'summary_large_image',
    twitterTitle: page.value.title,
    twitterDescription: page.value.description,
  });

  defineOgImage('MapcnDoc', {
    title: page.value.title ?? 'mapcn-vue',
    description: page.value.description ?? '',
    category: 'Documentation',
  });
</script>

<template>
  <div class="relative min-h-dvh">
    <div class="fixed inset-0 -z-10">
      <div class="absolute inset-0 bg-background"></div>
      <div
        class="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[64px_64px] opacity-30"
      ></div>
    </div>

    <div class="container max-w-screen-2xl py-10">
      <div class="flex gap-10">
        <!-- Left Sidebar - Navigation -->
        <aside class="hidden w-56 shrink-0 lg:block">
          <div class="sticky top-20">
            <div
              class="mb-4 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase"
            >
              Documentation
            </div>
            <nav class="flex flex-col gap-px border-l border-border">
              <NuxtLink
                v-for="item in navItems"
                :key="item.path"
                :to="item.path"
                class="group -ml-px flex items-center gap-2.5 border-l py-1.5 pl-4 text-sm transition-colors"
                :class="[
                  item.active
                    ? 'border-primary font-medium text-primary'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                ]"
              >
                <Icon :name="item.icon" class="size-3.5" />
                {{ item.title }}
              </NuxtLink>
            </nav>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="min-w-0 flex-1">
          <div class="mx-auto max-w-3xl">
            <!-- Header -->
            <div class="mb-12 border-b border-border pb-8">
              <div
                class="mb-4 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-primary uppercase"
              >
                <Icon name="lucide:book-open" class="size-3" />
                <span>Documentation</span>
              </div>

              <h1
                class="text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl md:text-5xl"
              >
                {{ page?.title }}
              </h1>
              <p
                v-if="page?.description"
                class="mt-4 max-w-[60ch] text-lg/relaxed text-muted-foreground"
              >
                {{ page.description }}
              </p>
            </div>

            <div class="prose dark:prose-invert max-w-none">
              <ContentRenderer v-if="page" :value="page" />
            </div>

            <!-- Edit & Report Links -->
            <div
              class="mt-12 flex items-center justify-between gap-2 border-t border-border pt-6 font-mono text-[11px] tracking-[0.15em] text-muted-foreground uppercase"
            >
              <a
                v-if="editUrl"
                :href="editUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 hover:text-foreground"
              >
                <Icon name="lucide:pencil" class="size-3" />
                Edit this page
              </a>
              <a
                :href="issueUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 hover:text-foreground"
              >
                <Icon name="lucide:circle-dot" class="size-3" />
                Report issue
              </a>
            </div>

            <!-- Prev/Next Navigation -->
            <div class="mt-6 grid grid-cols-2 gap-3">
              <NuxtLink
                v-if="prevPage"
                :to="prevPage.path"
                class="group flex flex-col rounded-md border border-border bg-card p-5 transition-colors hover:bg-muted/40"
              >
                <span
                  class="mb-3 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase"
                >
                  <Icon
                    name="lucide:arrow-left"
                    class="size-3 transition-transform group-hover:-translate-x-0.5"
                  />
                  Previous
                </span>
                <div class="flex items-center gap-3">
                  <Icon :name="prevPage.icon" class="size-4 text-primary" />
                  <span class="font-medium text-foreground">{{
                    prevPage.title
                  }}</span>
                </div>
              </NuxtLink>
              <div v-else></div>

              <NuxtLink
                v-if="nextPage"
                :to="nextPage.path"
                class="group flex flex-col items-end rounded-md border border-border bg-card p-5 text-right transition-colors hover:bg-muted/40"
              >
                <span
                  class="mb-3 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase"
                >
                  Next
                  <Icon
                    name="lucide:arrow-right"
                    class="size-3 transition-transform group-hover:translate-x-0.5"
                  />
                </span>
                <div class="flex items-center gap-3">
                  <span class="font-medium text-foreground">{{
                    nextPage.title
                  }}</span>
                  <Icon :name="nextPage.icon" class="size-4 text-primary" />
                </div>
              </NuxtLink>
            </div>
          </div>
        </main>

        <!-- Right Sidebar - Table of Contents -->
        <aside class="hidden w-56 shrink-0 xl:block">
          <div class="sticky top-20">
            <div
              class="mb-4 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase"
            >
              On this page
            </div>
            <nav
              v-if="toc.length > 0"
              class="flex flex-col gap-px border-l border-border"
            >
              <a
                v-for="heading in toc"
                :key="heading.id"
                :href="`#${heading.id}`"
                class="-ml-px border-l py-1.5 text-sm transition-colors"
                :class="[
                  heading.level === 3 ? 'pl-8' : 'pl-4',
                  activeHeading === heading.id
                    ? 'border-primary font-medium text-primary'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                ]"
              >
                {{ heading.text }}
              </a>
            </nav>
            <p v-else class="text-sm text-muted-foreground">
              No headings found
            </p>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
