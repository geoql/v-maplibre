<script setup lang="ts">
  import { Separator } from '~/components/ui/separator';

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
    ogUrl: `https://mapcn-vue.geoql.in${route.path}`,
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
    <!-- Animated mesh gradient background -->
    <div class="fixed inset-0 -z-10">
      <div class="absolute inset-0 bg-background"></div>
      <!-- Aurora gradient blobs -->
      <div
        class="animate-aurora-1 absolute -top-[30%] -left-[40%] size-[80%] rounded-full bg-linear-to-br from-primary/20 via-cyan-500/10 to-transparent blur-3xl"
      ></div>
      <div
        class="animate-aurora-2 absolute top-[20%] -right-[30%] size-[60%] rounded-full bg-linear-to-bl from-violet-500/15 via-primary/10 to-transparent blur-3xl"
      ></div>
      <div
        class="animate-aurora-3 absolute -bottom-[20%] left-[20%] size-[50%] rounded-full bg-linear-to-tr from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl"
      ></div>
      <!-- Grid overlay -->
      <div
        class="absolute inset-0 bg-[linear-gradient(to_right,rgb(128_128_128/0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgb(128_128_128/0.03)_1px,transparent_1px)] bg-size-[60px_60px]"
      ></div>
      <!-- Noise texture overlay -->
      <div
        class="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style="
          background-image: url('data:image/svg+xml,%3Csvg viewBox=&quot;0 0 256 256&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cfilter id=&quot;noise&quot;%3E%3CfeTurbulence type=&quot;fractalNoise&quot; baseFrequency=&quot;0.65&quot; numOctaves=&quot;3&quot; stitchTiles=&quot;stitch&quot;/%3E%3C/filter%3E%3Crect width=&quot;100%25&quot; height=&quot;100%25&quot; filter=&quot;url(%23noise)&quot;/%3E%3C/svg%3E');
        "
      ></div>
    </div>

    <div class="container max-w-screen-2xl py-10">
      <div class="flex gap-10">
        <!-- Left Sidebar - Navigation -->
        <aside class="hidden w-56 shrink-0 lg:block">
          <div class="animate-fade-up sticky top-20">
            <div
              class="rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-md"
            >
              <div class="mb-4 flex items-center gap-2">
                <div
                  class="flex size-8 items-center justify-center rounded-lg bg-primary/10"
                >
                  <Icon name="lucide:book-open" class="size-4 text-primary" />
                </div>
                <h4 class="text-sm font-semibold">Documentation</h4>
              </div>
              <nav class="flex flex-col gap-1">
                <NuxtLink
                  v-for="item in navItems"
                  :key="item.path"
                  :to="item.path"
                  class="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200"
                  :class="[
                    item.active
                      ? `
                        bg-primary/10 font-medium text-primary shadow-sm
                        shadow-primary/10
                      `
                      : `
                        text-muted-foreground
                        hover:bg-muted/50 hover:text-foreground
                      `,
                  ]"
                >
                  <div
                    class="flex size-6 items-center justify-center rounded-md transition-colors duration-200"
                    :class="[
                      item.active
                        ? 'bg-primary/20'
                        : `
                          bg-muted/50
                          group-hover:bg-muted
                        `,
                    ]"
                  >
                    <Icon
                      :name="item.icon"
                      class="size-3.5"
                      :class="[item.active ? 'text-primary' : '']"
                    />
                  </div>
                  {{ item.title }}
                </NuxtLink>
              </nav>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="min-w-0 flex-1">
          <div class="mx-auto max-w-3xl">
            <!-- Header -->
            <div class="mb-10">
              <!-- Glowing accent line -->
              <div
                class="animate-fade-in mb-6 h-px w-24 bg-linear-to-r from-primary via-primary/50 to-transparent"
              ></div>

              <div
                class="animate-fade-up mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium tracking-wide text-primary backdrop-blur-sm"
              >
                <Icon name="lucide:book-open" class="size-3" />
                <span>Documentation</span>
              </div>

              <h1
                class="animate-fade-up mb-4 bg-linear-to-b from-foreground via-foreground to-foreground/50 bg-clip-text text-3xl font-bold tracking-tight text-transparent delay-100 sm:text-4xl"
              >
                {{ page?.title }}
              </h1>
              <p
                v-if="page?.description"
                class="animate-fade-up text-lg/relaxed text-muted-foreground delay-200"
              >
                {{ page.description }}
              </p>
            </div>

            <!-- Content container with glassmorphism -->
            <div
              class="animate-fade-up rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-md delay-300 sm:p-8"
            >
              <div class="prose dark:prose-invert max-w-none">
                <ContentRenderer v-if="page" :value="page" />
              </div>
            </div>

            <!-- Edit & Report Links -->
            <div
              class="animate-fade-up mt-10 flex items-center justify-center gap-2 text-sm delay-400"
            >
              <Separator class="flex-1 bg-border/50" />
              <a
                v-if="editUrl"
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
            <div class="animate-fade-up mt-8 grid grid-cols-2 gap-4 delay-500">
              <NuxtLink
                v-if="prevPage"
                :to="prevPage.path"
                class="group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5"
              >
                <!-- Hover glow -->
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
                      :name="prevPage.icon"
                      class="size-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary"
                    />
                  </div>
                  <span
                    class="font-medium transition-colors duration-300 group-hover:text-primary"
                    >{{ prevPage.title }}</span
                  >
                </div>
              </NuxtLink>
              <div v-else></div>

              <NuxtLink
                v-if="nextPage"
                :to="nextPage.path"
                class="group relative flex flex-col items-end overflow-hidden rounded-xl border border-border/50 bg-card/50 p-5 text-right backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5"
              >
                <!-- Hover glow -->
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
                    >{{ nextPage.title }}</span
                  >
                  <div
                    class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/50 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/10"
                  >
                    <Icon
                      :name="nextPage.icon"
                      class="size-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary"
                    />
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
        </main>

        <!-- Right Sidebar - Table of Contents -->
        <aside class="hidden w-56 shrink-0 xl:block">
          <div class="animate-fade-up sticky top-20 delay-200">
            <div
              class="rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-md"
            >
              <div class="mb-4 flex items-center gap-2">
                <div
                  class="flex size-8 items-center justify-center rounded-lg bg-primary/10"
                >
                  <Icon name="lucide:align-left" class="size-4 text-primary" />
                </div>
                <span class="text-sm font-semibold">On this page</span>
              </div>
              <nav v-if="toc.length > 0" class="relative flex flex-col">
                <!-- Vertical line -->
                <div
                  class="absolute top-0 left-0 h-full w-px bg-border/50"
                  aria-hidden="true"
                ></div>
                <a
                  v-for="heading in toc"
                  :key="heading.id"
                  :href="`#${heading.id}`"
                  class="relative py-1.5 text-sm transition-all duration-200"
                  :class="[
                    heading.level === 3 ? 'pl-6' : 'pl-4',
                    activeHeading === heading.id
                      ? 'font-medium text-primary'
                      : `
                        text-muted-foreground
                        hover:text-foreground
                      `,
                  ]"
                >
                  <!-- Active indicator -->
                  <span
                    v-if="activeHeading === heading.id"
                    class="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary shadow-sm shadow-primary/50"
                  ></span>
                  {{ heading.text }}
                </a>
              </nav>
              <p v-else class="text-sm text-muted-foreground">
                No headings found
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
