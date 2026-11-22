import { describe, expect, it } from 'vite-plus/test';
import { rankSections, type SearchSection } from '#shell/utils/rank-sections';

const section = (
  id: string,
  title: string,
  content = '',
  titles: string[] = [],
): SearchSection => ({
  id,
  title,
  titles,
  content,
});

const sections = [
  section(
    '/guide/getting-started',
    'Getting Started',
    'install the raster layer later',
  ),
  section('/layers/raster-layers', 'Raster Layers', 'COG and Zarr'),
  section('/layers/raster-layers#projections', 'Projections', 'EPSG codes', [
    'Raster Layers',
  ]),
  section('/components/map', 'VMap', 'the map component'),
];

describe('rankSections', () => {
  it('ranks a title match above a content-only match', () => {
    const ids = rankSections(sections, 'raster').map((s) => s.id);
    expect(ids[0]).toBe('/layers/raster-layers');
    expect(ids.indexOf('/guide/getting-started')).toBeGreaterThan(
      ids.indexOf('/layers/raster-layers#projections'),
    );
  });

  it('is case-insensitive and needs every term to match', () => {
    expect(rankSections(sections, 'RASTER cog').map((s) => s.id)).toEqual([
      '/layers/raster-layers',
    ]);
  });

  it('prefers a title that starts with the term over one with it later', () => {
    const ids = rankSections(
      [
        section(
          '/guide/peer-dependencies#raster',
          'deck.gl raster (COG / Mosaic)',
          '',
          ['Peer Dependencies'],
        ),
        section('/layers/raster-layers', 'Raster Layers'),
      ],
      'raster',
    ).map((s) => s.id);
    expect(ids).toEqual([
      '/layers/raster-layers',
      '/guide/peer-dependencies#raster',
    ]);
  });

  it('puts a whole page before a same-score section of another page', () => {
    const ids = rankSections(
      [
        section(
          '/layers/deckgl-overview#raster-layers',
          'Raster Layers (deck.gl-raster)',
          '',
          ['deck.gl Layers'],
        ),
        section('/layers/raster-layers', 'Raster Layers'),
      ],
      'raster',
    ).map((s) => s.id);
    expect(ids[0]).toBe('/layers/raster-layers');
  });

  it('returns nothing for an empty query', () => {
    expect(rankSections(sections, '   ')).toEqual([]);
  });

  it('caps the number of results', () => {
    expect(rankSections(sections, 'a', 2)).toHaveLength(2);
  });
});
