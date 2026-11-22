import type { TocItem, TocLink } from '#shell/types/docs';

/**
 * Flattens @nuxt/content's nested table of contents, depth-first.
 *
 * @param links - `page.body.toc.links`.
 */
export function flattenToc(links: readonly TocLink[] | undefined): TocItem[] {
  return (links ?? []).flatMap((link) => [
    { id: link.id, text: link.text, level: link.depth },
    ...flattenToc(link.children),
  ]);
}
