import { describe, expect, it } from 'vite-plus/test';
import { activeHeadingId } from '#shell/utils/active-heading';

describe('activeHeadingId', () => {
  it('picks the last heading that has scrolled past the offset', () => {
    expect(
      activeHeadingId(
        [
          { id: 'a', top: -300 },
          { id: 'b', top: 40 },
          { id: 'c', top: 400 },
        ],
        100,
      ),
    ).toBe('b');
  });

  it('falls back to the first heading before any has scrolled past', () => {
    expect(
      activeHeadingId(
        [
          { id: 'a', top: 300 },
          { id: 'b', top: 600 },
        ],
        100,
      ),
    ).toBe('a');
  });

  it('returns an empty id when the page has no headings', () => {
    expect(activeHeadingId([], 100)).toBe('');
  });
});
