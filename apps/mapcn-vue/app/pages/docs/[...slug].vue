<script setup lang="ts">
  import type { DocsNavGroup, DocsNavItem } from '#shell/types/docs';
  import { flattenToc } from '#shell/utils/flatten-toc';

  const EMPTY_NAV_ITEMS: DocsNavItem[] = [];

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

  const navItems = computed<DocsNavItem[]>(() => {
    return (
      allDocs.value?.map((doc) => ({
        title: doc.title,
        path: doc.path,
        active: doc.path === route.path,
        icon: navIcons[doc.path] || 'lucide:file-text',
      })) ?? EMPTY_NAV_ITEMS
    );
  });

  const nav = computed<DocsNavGroup[]>(() => [
    { label: 'Documentation', items: navItems.value },
  ]);

  const currentIndex = computed(() => {
    return navItems.value.findIndex((item) => item.path === route.path);
  });

  const prevPage = computed(
    () => navItems.value[currentIndex.value - 1] ?? null,
  );
  const nextPage = computed(
    () => navItems.value[currentIndex.value + 1] ?? null,
  );

  const editUrl = computed(() => {
    const stem = page.value?.stem;
    if (!stem) return null;
    const filename = stem.split('/').pop();
    return `https://github.com/geoql/v-maplibre/edit/main/apps/mapcn-vue/content/docs/${filename}.md`;
  });

  const issueUrl =
    'https://github.com/geoql/v-maplibre/issues/new?labels=documentation';

  const toc = computed(() => flattenToc(page.value?.body?.toc?.links));

  usePageGeo({
    title: page.value.title ?? 'Documentation',
    description: page.value.description ?? 'mapcn-vue documentation',
    ogType: 'article',
  });

  defineOgImage('SiteDoc', {
    title: page.value.title ?? 'mapcn-vue',
    description: page.value.description ?? '',
    category: 'Documentation',
  });
</script>

<template>
  <DocsShell
    :title="page?.title ?? ''"
    :description="page?.description"
    :nav="nav"
    :toc="toc"
    :prev="prevPage"
    :next="nextPage"
    :edit-url="editUrl"
    :issue-url="issueUrl"
  >
    <ContentRenderer v-if="page" :value="page" />
  </DocsShell>
</template>
