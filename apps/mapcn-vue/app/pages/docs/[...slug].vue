<script setup lang="ts">
import { Separator } from '~/components/ui/separator';

const route = useRoute();

// Fetch current page
const { data: page } = await useAsyncData(`docs-${route.path}`, () =>
  queryCollection('docs').path(route.path).first()
);

if (!page.value) {
  throw createError({ statusCode: 404, message: 'Page not found' });
}

// Fetch all docs for navigation
const { data: allDocs } = await useAsyncData('docs-nav', () =>
  queryCollection('docs').order('stem', 'ASC').all()
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
interface TocLink {
  id: string;
  text: string;
  depth: number;
  children?: TocLink[];
}

const toc = computed(() => {
  const tocData = page.value?.body?.toc;
  if (!tocData?.links) return [];

  // Flatten the TOC links (including children)
  const flattenLinks = (
    links: TocLink[],
    result: { id: string; text: string; level: number }[] = []
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
  const HEADER_OFFSET = 100; // Account for sticky header

  const updateActiveHeading = () => {
    const headings = document.querySelectorAll(
      '.prose h1[id], .prose h2[id], .prose h3[id], .prose h4[id]'
    );

    if (headings.length === 0) return;

    // Find the heading that's currently at the top of the viewport
    let currentHeading = '';

    for (const heading of headings) {
      const rect = heading.getBoundingClientRect();
      // If heading is above the offset line, it's the current section
      if (rect.top <= HEADER_OFFSET) {
        currentHeading = heading.id;
      } else {
        break;
      }
    }

    // If no heading is above the offset, use the first one
    if (!currentHeading && headings.length > 0) {
      currentHeading = headings[0].id;
    }

    activeHeading.value = currentHeading;
  };

  // Initial update after content renders
  nextTick(() => {
    updateActiveHeading();
  });

  // Update on scroll
  window.addEventListener('scroll', updateActiveHeading, { passive: true });

  onUnmounted(() => {
    window.removeEventListener('scroll', updateActiveHeading);
  });
});

useSeoMeta({
  title: page.value.title,
  description: page.value.description,
});
</script>

<template>
  <div class="container max-w-screen-2xl py-10">
    <div class="flex gap-10">
      <!-- Left Sidebar - Navigation -->
      <aside class="hidden w-56 shrink-0 lg:block">
        <div class="sticky top-20">
          <h4 class="mb-3 text-sm font-semibold">Documentation</h4>
          <nav class="flex flex-col gap-1">
            <NuxtLink
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
              :class="[
                item.active
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              ]"
            >
              <Icon :name="item.icon" class="h-4 w-4" />
              {{ item.title }}
            </NuxtLink>
          </nav>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="min-w-0 flex-1">
        <div class="mx-auto max-w-3xl">
          <div class="mb-8">
            <h1 class="text-3xl font-bold tracking-tight">{{ page?.title }}</h1>
            <p
              v-if="page?.description"
              class="mt-2 text-lg text-muted-foreground"
            >
              {{ page.description }}
            </p>
          </div>
          <div class="prose dark:prose-invert max-w-none">
            <ContentRenderer v-if="page" :value="page" />
          </div>

          <!-- Edit & Report Links -->
          <div class="mt-12 flex items-center justify-center gap-2 text-sm">
            <Separator class="flex-1" />
            <a
              v-if="editUrl"
              :href="editUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon name="lucide:pencil" class="h-4 w-4" />
              Edit this page
            </a>
            <span class="text-muted-foreground">or</span>
            <a
              :href="issueUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon name="lucide:circle-dot" class="h-4 w-4" />
              Report an issue
            </a>
            <Separator class="flex-1" />
          </div>

          <!-- Prev/Next Navigation -->
          <div class="mt-8 grid grid-cols-2 gap-4">
            <NuxtLink
              v-if="prevPage"
              :to="prevPage.path"
              class="group flex flex-col rounded-lg border border-border p-4 transition-colors hover:border-foreground/20 hover:bg-muted/50"
            >
              <div class="mb-3">
                <Icon
                  :name="prevPage.icon"
                  class="h-10 w-10 rounded-lg border border-border bg-muted/50 p-2 text-muted-foreground transition-colors group-hover:text-foreground"
                />
              </div>
              <span class="font-medium">{{ prevPage.title }}</span>
            </NuxtLink>
            <div v-else></div>

            <NuxtLink
              v-if="nextPage"
              :to="nextPage.path"
              class="group flex flex-col items-end rounded-lg border border-border p-4 text-right transition-colors hover:border-foreground/20 hover:bg-muted/50"
            >
              <div class="mb-3">
                <Icon
                  :name="nextPage.icon"
                  class="h-10 w-10 rounded-lg border border-border bg-muted/50 p-2 text-muted-foreground transition-colors group-hover:text-foreground"
                />
              </div>
              <span class="font-medium">{{ nextPage.title }}</span>
            </NuxtLink>
          </div>
        </div>
      </main>

      <!-- Right Sidebar - Table of Contents -->
      <aside class="hidden w-56 shrink-0 xl:block">
        <div class="sticky top-20">
          <div class="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Icon name="lucide:align-left" class="h-4 w-4" />
            On this page
          </div>
          <nav v-if="toc.length > 0" class="relative flex flex-col">
            <!-- Vertical line -->
            <div
              class="absolute left-0 top-0 h-full w-px bg-border"
              aria-hidden="true"
            />
            <a
              v-for="heading in toc"
              :key="heading.id"
              :href="`#${heading.id}`"
              class="relative py-1.5 text-sm transition-colors"
              :class="[
                heading.level === 3 ? 'pl-6' : 'pl-4',
                activeHeading === heading.id
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              ]"
            >
              <!-- Active indicator -->
              <span
                v-if="activeHeading === heading.id"
                class="absolute left-0 top-1/2 h-5 w-px -translate-y-1/2 bg-foreground"
              />
              {{ heading.text }}
            </a>
          </nav>
          <p v-else class="text-sm text-muted-foreground">No headings found</p>
        </div>
      </aside>
    </div>
  </div>
</template>
