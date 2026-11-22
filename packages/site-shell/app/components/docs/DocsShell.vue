<script setup lang="ts">
  /**
   * The docs page frame shared by mapcn-vue and v-maplibre docs: nav rail,
   * article header, content slot, edit/report links, pager and table of
   * contents. On narrow screens the nav moves into a sheet. Pages pass
   * data in; this component never queries a content collection.
   */
  import { MotionConfig } from 'motion-v';
  import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
  } from '#shell/components/ui/sheet';
  import type { DocsNavGroup, DocsNavItem, TocItem } from '#shell/types/docs';

  withDefaults(
    defineProps<{
      title: string;
      description?: string;
      eyebrow?: string;
      nav: DocsNavGroup[];
      toc: TocItem[];
      prev?: DocsNavItem | null;
      next?: DocsNavItem | null;
      editUrl?: string | null;
      issueUrl?: string;
    }>(),
    { eyebrow: 'Documentation' },
  );

  const route = useRoute();
  const navOpen = ref(false);
</script>

<template>
  <MotionConfig reduced-motion="user">
    <div class="relative min-h-dvh">
      <div class="fixed inset-0 -z-10">
        <div class="absolute inset-0 bg-background"></div>
        <div class="absolute inset-0 bg-grid opacity-30"></div>
      </div>

      <div class="container max-w-screen-2xl py-10">
        <div class="flex gap-10">
          <aside class="hidden w-56 shrink-0 lg:block">
            <div class="sticky top-20">
              <DocsNav :groups="nav" />
            </div>
          </aside>

          <main class="min-w-0 flex-1">
            <div class="mx-auto max-w-3xl">
              <Sheet v-model:open="navOpen">
                <SheetTrigger as-child>
                  <button
                    data-docs-menu
                    class="mt-4 mb-6 inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 font-mono text-caption tracking-caps text-muted-foreground uppercase transition-colors hover:text-foreground lg:hidden"
                  >
                    <Icon name="lucide:menu" class="size-3.5" />
                    Menu
                  </button>
                </SheetTrigger>
                <SheetContent side="left" class="w-72 overflow-y-auto p-6">
                  <SheetTitle class="sr-only">Documentation</SheetTitle>
                  <DocsNav
                    :groups="nav"
                    indicator-id="docs-nav-indicator-sheet"
                    @navigate="navOpen = false"
                  />
                </SheetContent>
              </Sheet>

              <Transition name="docs-page" mode="out-in">
                <article :key="route.path">
                  <header class="mb-12 border-b border-border pb-8">
                    <div
                      class="mb-4 inline-flex items-center gap-2 font-mono text-caption tracking-caps text-primary uppercase"
                    >
                      <Icon name="lucide:book-open" class="size-3" />
                      <span>{{ eyebrow }}</span>
                    </div>
                    <h1
                      class="text-3xl font-extrabold tracking-snug text-foreground sm:text-4xl md:text-5xl"
                    >
                      {{ title }}
                    </h1>
                    <p
                      v-if="description"
                      class="mt-4 max-w-measure-lg text-lg/relaxed text-muted-foreground"
                    >
                      {{ description }}
                    </p>
                  </header>

                  <div class="prose dark:prose-invert max-w-none">
                    <slot></slot>
                  </div>
                </article>
              </Transition>

              <div
                class="mt-12 flex items-center justify-between gap-2 border-t border-border pt-6 font-mono text-caption tracking-caps-sm text-muted-foreground uppercase"
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
                  v-if="issueUrl"
                  :href="issueUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 hover:text-foreground"
                >
                  <Icon name="lucide:circle-dot" class="size-3" />
                  Report issue
                </a>
              </div>

              <DocsPager :prev="prev" :next="next" />
            </div>
          </main>

          <aside class="hidden w-56 shrink-0 xl:block">
            <div class="sticky top-20">
              <DocsToc :items="toc" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  </MotionConfig>
</template>
