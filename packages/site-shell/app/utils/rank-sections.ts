/** A searchable section, as `queryCollectionSearchSections` returns it. */
export interface SearchSection {
  /** Page path, with `#heading` for a section inside a page. */
  id: string;
  title: string;
  /** Headings above this section, outermost first. */
  titles: string[];
  content: string;
}

/**
 * Ranks sections for a query. Every whitespace-separated term must appear
 * (case-insensitive) in the title, the heading path or the content. Each
 * term scores 3 in the title (4 when a title word starts with it, 5 when
 * the title starts with it), 2 in the
 * heading path, 1 in the content. On a tie a whole page (no #hash) comes
 * before a section; remaining ties keep the input order.
 *
 * @param sections - All sections.
 * @param query - The search text.
 * @param limit - Maximum results (default 8).
 */
export function rankSections(
  sections: readonly SearchSection[],
  query: string,
  limit = 8,
): SearchSection[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const scored: {
    section: SearchSection;
    score: number;
    isPage: boolean;
    order: number;
  }[] = [];
  sections.forEach((section, order) => {
    const title = section.title.toLowerCase();
    const path = section.titles.join(' ').toLowerCase();
    const content = section.content.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (title.startsWith(term)) score += 5;
      else if (title.split(/[^a-z0-9]+/).some((w) => w.startsWith(term)))
        score += 4;
      else if (title.includes(term)) score += 3;
      else if (path.includes(term)) score += 2;
      else if (content.includes(term)) score += 1;
      else return;
    }
    scored.push({ section, score, isPage: !section.id.includes('#'), order });
  });

  return scored
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(b.isPage) - Number(a.isPage) ||
        a.order - b.order,
    )
    .slice(0, limit)
    .map((entry) => entry.section);
}
