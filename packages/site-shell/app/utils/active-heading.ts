/**
 * The heading a reader is on: the last one whose top has scrolled to or past
 * `offset` (the toolbar's height), else the first one, else ''.
 *
 * @param headings - Heading ids with their viewport-relative top, in document order.
 * @param offset - Distance from the viewport top, in px.
 */
export function activeHeadingId(
  headings: readonly { id: string; top: number }[],
  offset: number,
): string {
  let active = headings[0]?.id ?? '';
  for (const heading of headings) {
    if (heading.top > offset) break;
    active = heading.id;
  }
  return active;
}
