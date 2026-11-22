import { describe, expect, it } from 'vite-plus/test';
import { flattenToc } from '#shell/utils/flatten-toc';

describe('flattenToc', () => {
  it('lists headings depth-first with their level', () => {
    expect(
      flattenToc([
        {
          id: 'usage',
          text: 'Usage',
          depth: 2,
          children: [{ id: 'props', text: 'Props', depth: 3 }],
        },
        { id: 'events', text: 'Events', depth: 2 },
      ]),
    ).toEqual([
      { id: 'usage', text: 'Usage', level: 2 },
      { id: 'props', text: 'Props', level: 3 },
      { id: 'events', text: 'Events', level: 2 },
    ]);
  });

  it('returns an empty list without links', () => {
    expect(flattenToc(undefined)).toEqual([]);
  });
});
