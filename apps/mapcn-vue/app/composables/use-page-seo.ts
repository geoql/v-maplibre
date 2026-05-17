/**
 * Composable for setting per-page SEO meta tags.
 * Wraps useSeoMeta with canonical URL, Open Graph, and Twitter Card tags.
 */
export interface PageSeoOptions {
  title: string;
  description: string;
  ogType?: 'website' | 'article';
}

const BASE_URL = 'https://mapcn-vue.geoql.in';

export function usePageSeo(options: PageSeoOptions) {
  const route = useRoute();

  const ogType = options.ogType ?? 'website';
  const canonicalUrl = computed(() => `${BASE_URL}${route.path}`);

  useSeoMeta({
    title: options.title,
    description: options.description,
    ogTitle: options.title,
    ogDescription: options.description,
    ogType,
    ogUrl: canonicalUrl,
    twitterCard: 'summary_large_image',
    twitterSite: '@geoql',
    twitterTitle: options.title,
    twitterDescription: options.description,
  });

  useHead({
    link: [{ rel: 'canonical', href: canonicalUrl }],
  });
}
