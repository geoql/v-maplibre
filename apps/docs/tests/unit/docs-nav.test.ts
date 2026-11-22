import { describe, expect, it } from 'vite-plus/test';
import { buildDocsNav } from '../../app/utils/docs-nav';

const docs = [
  { path: '/guide/getting-started', title: 'Getting Started' },
  { path: '/guide/peer-dependencies', title: 'Peer Dependencies' },
  { path: '/components/map', title: 'VMap', icon: 'i-lucide-map' },
  { path: '/layers/raster-layers', title: 'Raster Layers' },
];

describe('buildDocsNav', () => {
  it('groups pages by their first path segment, keeping input order', () => {
    const nav = buildDocsNav(docs, '/components/map');
    expect(nav.map((g) => g.label)).toEqual(['Guide', 'Components', 'Layers']);
    expect(nav[0]!.items.map((i) => i.path)).toEqual([
      '/guide/getting-started',
      '/guide/peer-dependencies',
    ]);
  });

  it('marks only the current page active', () => {
    const items = buildDocsNav(docs, '/components/map').flatMap((g) => g.items);
    expect(items.filter((i) => i.active).map((i) => i.path)).toEqual([
      '/components/map',
    ]);
  });

  it("uses the page's own icon, else its group's", () => {
    const nav = buildDocsNav(docs, '/');
    expect(nav[1]!.items[0]!.icon).toBe('lucide:map');
    expect(nav[0]!.items[0]!.icon).toBe('lucide:book-open');
  });
});
