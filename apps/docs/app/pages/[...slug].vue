<script setup lang="ts">
  import { flattenToc } from '#shell/utils/flatten-toc';
  import { buildDocsNav } from '~/utils/docs-nav';

  const route = useRoute();

  const { data: page } = await useAsyncData(`docs-${route.path}`, () =>
    queryCollection('docs').path(route.path).first(),
  );

  if (!page.value) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found' });
  }

  const { data: allDocs } = await useAsyncData('docs-nav', () =>
    queryCollection('docs')
      .select('path', 'title', 'icon', 'stem')
      .order('stem', 'ASC')
      .all(),
  );

  const nav = computed(() => buildDocsNav(allDocs.value ?? [], route.path));
  const flat = computed(() => nav.value.flatMap((group) => group.items));
  const index = computed(() =>
    flat.value.findIndex((item) => item.path === route.path),
  );
  const prev = computed(() => flat.value[index.value - 1] ?? null);
  const next = computed(() => flat.value[index.value + 1] ?? null);
  const toc = computed(() => flattenToc(page.value?.body?.toc?.links));

  const editUrl = computed(() =>
    page.value?.stem
      ? `https://github.com/geoql/v-maplibre/edit/main/apps/docs/content/${page.value.stem}.md`
      : null,
  );
  const issueUrl =
    'https://github.com/geoql/v-maplibre/issues/new?labels=documentation';

  useSeoMeta({
    title: () => `${page.value?.title} · v-maplibre`,
    description: () => page.value?.description,
    ogTitle: () => page.value?.title,
    ogDescription: () => page.value?.description,
    ogType: 'article',
  });

  defineOgImage('SiteDoc', {
    title: page.value.title,
    description: page.value.description ?? '',
    category: nav.value.find((g) => g.items.some((i) => i.active))?.label ?? 'Docs',
    brand: 'v-maplibre',
    domain: 'v-maplibre.geoql.in',
  });
</script>

<template>
  <DocsShell
    :title="page?.title ?? ''"
    :description="page?.description"
    :eyebrow="nav.find((g) => g.items.some((i) => i.active))?.label"
    :nav="nav"
    :toc="toc"
    :prev="prev"
    :next="next"
    :edit-url="editUrl"
    :issue-url="issueUrl"
  >
    <ContentRenderer v-if="page" :value="page" />
  </DocsShell>
</template>
