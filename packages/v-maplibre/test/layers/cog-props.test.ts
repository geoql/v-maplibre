import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';
import { mount, flushPromises } from '@vue/test-utils';
import VMap from '../../src/map/VMap.vue';
import VLayerCog from '../../src/layers/deckgl/cog/VLayerCog.vue';
import VLayerMultiCog from '../../src/layers/deckgl/multi-cog/VLayerMultiCog.vue';
import '../setup';

const created: Array<{ kind: string; props: Record<string, unknown> }> = [];
const opened: Array<{ kind: string; input: unknown; options: unknown }> = [];

vi.mock('@developmentseed/deck.gl-geotiff', () => {
  const makeLayer = (kind: string) =>
    class {
      id: string;
      props: Record<string, unknown>;
      constructor(props: Record<string, unknown>) {
        this.id = props.id as string;
        this.props = props;
        created.push({ kind, props });
      }
    };
  const makeSource = (kind: string) =>
    class FakeSource {
      geotiff = { kind: 'geotiff' };
      geotiffs = new Map([['red', { kind: 'geotiff' }]]);
      geographicBounds = { west: 1, south: 2, east: 3, north: 4 };
      multiTilesetDescriptor = { primaryKey: 'red' };
      static async open(input: unknown, options: unknown) {
        opened.push({ kind, input, options });
        return new FakeSource();
      }
    };
  return {
    COGLayer: makeLayer('cog'),
    MultiCOGLayer: makeLayer('multi'),
    COGSource: makeSource('cog'),
    MultiCOGSource: makeSource('multi'),
  };
});

const mountInMap = async (
  template: string,
  setup: () => object = () => ({}),
) => {
  const wrapper = mount(VMap, {
    props: { options: {} },
    attachTo: document.body,
    slots: {
      default: { template, components: { VLayerCog, VLayerMultiCog }, setup },
    },
  });
  await flushPromises();
  return wrapper;
};

const lastOf = (kind: string) =>
  created.filter((c) => c.kind === kind).at(-1)!.props;

describe('COG layer props (deck.gl-geotiff 0.10)', () => {
  beforeEach(() => {
    created.length = 0;
    opened.length = 0;
  });

  // Without a limiter the layer opens the source itself, with the library's
  // shared default limiter. deck.gl copies every own key onto the props
  // instance, so no undefined-valued key may be passed.
  it('passes the URL as source and opens nothing itself when no limiter is set', async () => {
    await mountInMap('<VLayerCog id="c" geotiff="https://x/a.tif" />');

    expect(lastOf('cog').source).toBe('https://x/a.tif');
    expect('concurrencyLimiter' in lastOf('cog')).toBe(false);
    expect('maxRequests' in lastOf('cog')).toBe(false);
    expect(opened).toEqual([]);
  });

  // In 0.10 the limiter is an option of COGSource.open(), not a layer prop.
  // An explicit null (limiting off) must reach it, not be dropped as falsy.
  it('opens the COG with an explicit null limiter and passes the opened source', async () => {
    await mountInMap(
      '<VLayerCog id="c" geotiff="https://x/a.tif" :concurrency-limiter="null" />',
    );

    expect(opened).toEqual([
      {
        kind: 'cog',
        input: 'https://x/a.tif',
        options: { concurrencyLimiter: null },
      },
    ]);
    expect(lastOf('cog').source).toMatchObject({
      geographicBounds: { west: 1, south: 2, east: 3, north: 4 },
    });
    expect('concurrencyLimiter' in lastOf('cog')).toBe(false);
  });

  it('opens the scene with an explicit null limiter for MultiCOG', async () => {
    await mountInMap(
      '<VLayerMultiCog id="m" :sources="{ red: \'https://x/r.tif\' }" :concurrency-limiter="null" />',
    );

    expect(opened).toEqual([
      {
        kind: 'multi',
        input: { red: 'https://x/r.tif' },
        options: { concurrencyLimiter: null },
      },
    ]);
    expect(lastOf('multi').source).toMatchObject({
      multiTilesetDescriptor: { primaryKey: 'red' },
    });
  });

  it('reports a source the layer opened as sourceLoad and geotiffLoad', async () => {
    const onGeotiffLoad = vi.fn();
    const onSourceLoad = vi.fn();
    await mountInMap(
      '<VLayerCog id="c" geotiff="https://x/a.tif" @geotiff-load="onGeotiffLoad" @source-load="onSourceLoad" />',
      () => ({ onGeotiffLoad, onSourceLoad }),
    );

    const source = {
      geotiff: { kind: 'opened' },
      geographicBounds: { west: 5, south: 6, east: 7, north: 8 },
    };
    (lastOf('cog').onSourceLoad as (s: unknown) => void)(source);

    expect(onSourceLoad).toHaveBeenCalledWith(source);
    expect(onGeotiffLoad).toHaveBeenCalledWith(
      { kind: 'opened' },
      { geographicBounds: { west: 5, south: 6, east: 7, north: 8 } },
    );
  });
});
