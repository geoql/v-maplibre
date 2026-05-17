/**
 * Composable for setting per-page SEO + Generative Engine Optimization meta.
 * Wraps usePageSeo, emits a WebPage schema with dateModified, and auto-derives
 * a BreadcrumbList from the current route path when depth >= 2.
 */
import type { PageSeoOptions } from './use-page-seo';

export interface PageGeoOptions extends PageSeoOptions {
  dateModified?: string;
}

const SEGMENT_LABELS: Record<string, string> = {
  docs: 'Documentation',
  examples: 'Examples',
  faq: 'FAQ',
};

function humanizeSegment(segment: string): string {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function usePageGeo(options: PageGeoOptions) {
  const config = useRuntimeConfig();
  const route = useRoute();

  usePageSeo(options);

  const schemas: Array<ReturnType<typeof defineWebPage>> = [
    defineWebPage({
      name: options.title,
      description: options.description,
      dateModified: options.dateModified ?? config.public.library.releasedAt,
    }),
  ];

  const segments = route.path.split('/').filter(Boolean);
  if (segments.length >= 2) {
    schemas.push(
      defineBreadcrumb({
        itemListElement: segments.map((segment, index) => ({
          name:
            index === segments.length - 1
              ? options.title
              : humanizeSegment(segment),
          item: `${config.public.siteUrl ?? 'https://mapcn-vue.geoql.in'}/${segments
            .slice(0, index + 1)
            .join('/')}`,
        })),
      }),
    );
  }

  useSchemaOrg(schemas);
}
